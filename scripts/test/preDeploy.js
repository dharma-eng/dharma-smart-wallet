var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')

const DharmaSmartWalletImplementationV3Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV3.json')
const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const ImmutableCreate2FactoryArtifact = require('../../build/contracts/ImmutableCreate2Factory.json')
let DharmaKeyRegistryV2Artifact;

function swapMetadataHash(bytecode, newMetadataHashes) {
  const totalBzzrs = bytecode.split(constants.METADATA_IDENTIFIER).length - 1

  if (totalBzzrs !== newMetadataHashes.length) {
    throw("number of metadata hashes to replace must match provided number.")
  }

  let startingPoint = bytecode.length - 1;

  for (i = 0; i < totalBzzrs; i++) {
    let replacement = constants.METADATA_IDENTIFIER + newMetadataHashes.slice(i)[0]
    let lastIndex = bytecode.lastIndexOf(
      constants.METADATA_IDENTIFIER, startingPoint
    )
    bytecode = (
      bytecode.slice(0, lastIndex) + replacement + bytecode.slice(
        lastIndex + replacement.length, bytecode.length
      )
    )
    startingPoint = lastIndex - 1;
  }
  
  return bytecode
}

module.exports = {test: async function (provider, testingContext) {
  if (testingContext === 'coverage') {
    DharmaKeyRegistryV2Artifact = require('../../../build/contracts/DharmaKeyRegistryV2.json')
  } else {
    DharmaKeyRegistryV2Artifact = require('../../build/contracts/DharmaKeyRegistryV2.json')
  }

  var web3 = provider
  let passed = 0
  let failed = 0
  let gasUsage = {}
  let counts = {}

  const DharmaSmartWalletImplementationV3Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV3Artifact.abi
  )
  DharmaSmartWalletImplementationV3Deployer.options.data = (
    DharmaSmartWalletImplementationV3Artifact.bytecode
  )

  const MockCodeCheckDeployer = new web3.eth.Contract(
    MockCodeCheckArtifact.abi
  )
  MockCodeCheckDeployer.options.data = MockCodeCheckArtifact.bytecode

  const InefficientImmutableCreate2Factory = new web3.eth.Contract(
    ImmutableCreate2FactoryArtifact.abi,
    constants.INEFFICIENT_IMMUTABLE_CREATE2_FACTORY_ADDRESS
  )

  const ImmutableCreate2Factory = new web3.eth.Contract(
    ImmutableCreate2FactoryArtifact.abi,
    constants.IMMUTABLE_CREATE2_FACTORY_ADDRESS
  )

  const DharmaKeyRegistryV2 = new web3.eth.Contract(
    DharmaKeyRegistryV2Artifact.abi,
    constants.KEY_REGISTRY_V2_ADDRESS
  )

  // get available addresses and assign them to various roles
  const addresses = await web3.eth.getAccounts()
  if (addresses.length < 1) {
    console.log('cannot find enough addresses to run tests!')
    process.exit(1)
  }

  let latestBlock = await web3.eth.getBlock('latest')

  const originalAddress = addresses[0]

  let address = await setupNewDefaultAddress(
    '0xdeeddeeddeeddeeddeeddeeddeeddeeddeeddeeddeeddeeddeeddeeddeeddeed'
  )

  const gasLimit = latestBlock.gasLimit

  console.log('funding initial create2 contract deployer address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: constants.KEYLESS_CREATE2_DEPLOYER_ADDRESS,
    value: web3.utils.toWei('0.01', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
    gasPrice: 1
  })

  console.log('running pre-deployment tests...')

  // ************************** helper functions **************************** //
  async function send(
    title,
    instance,
    method,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    const receipt = await instance.methods[method](...args).send({
      from: from,
      value: value,
      gas: gas,
      gasPrice: gasPrice
    }).on('confirmation', (confirmationNumber, r) => {
      confirmations[r.transactionHash] = confirmationNumber
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      return {status: false}
    })

    if (receipt.status !== shouldSucceed) {
      return false
    } else if (!shouldSucceed) {
      return true
    }

    let assertionsPassed
    try {
      assertionCallback(receipt)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
      console.log(error);
    }

    return assertionsPassed
  }

  async function call(
    title,
    instance,
    method,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    let succeeded = true
    returnValues = await instance.methods[method](...args).call({
      from: from,
      value: value,
      gas: gas,
      gasPrice: gasPrice
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      succeeded = false
    })

    if (succeeded !== shouldSucceed) {
      return false
    } else if (!shouldSucceed) {
      return true
    }

    let assertionsPassed
    try {
      assertionCallback(returnValues)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
      console.log(error);
    }

    return assertionsPassed
  }

  async function deploy(
    title,
    instance,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    let deployData = instance.deploy({arguments: args}).encodeABI()
    let deployGas = await web3.eth.estimateGas({
        from: from,
        data: deployData
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      return gasLimit
    })

    if (deployGas > gasLimit) {
      console.error(` ✘ ${title}: deployment costs exceed block gas limit!`)
      process.exit(1)
    }

    if (typeof(gas) === 'undefined') {
      gas = deployGas
    }

    if (deployGas > gas) {
      console.error(` ✘ ${title}: deployment costs exceed supplied gas.`)
      process.exit(1)
    }

    let signed
    let deployHash
    let receipt
    const contract = await instance.deploy({arguments: args}).send({
      from: from,
      gas: gas,
      gasPrice: gasPrice
    }).on('transactionHash', hash => {
      deployHash = hash
    }).on('receipt', r => {
      receipt = r
    }).on('confirmation', (confirmationNumber, r) => {
      confirmations[r.transactionHash] = confirmationNumber
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }

      receipt = {status: false}
    })

    if (receipt.status !== shouldSucceed) {
      if (contract) {
        return [false, contract, gas]
      }
      return [false, instance, gas]
    } else if (!shouldSucceed) {
      if (contract) {
        return [true, contract, gas]
      }
      return [true, instance, gas]
    }

    assert.ok(receipt.status)

    let assertionsPassed
    try {
      assertionCallback(receipt)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
    }

    if (contract) {
      return [assertionsPassed, contract, gas]
    }
    return [assertionsPassed, instance, gas]
  }

  async function runTest(
    title,
    instance,
    method,
    callOrSend,
    args,
    shouldSucceed,
    assertionCallback,
    from,
    value,
    gas
  ) {
    if (typeof(callOrSend) === 'undefined') {
      callOrSend = 'send'
    }
    if (typeof(args) === 'undefined') {
      args = []
    }
    if (typeof(shouldSucceed) === 'undefined') {
      shouldSucceed = true
    }
    if (typeof(assertionCallback) === 'undefined') {
      assertionCallback = (value) => {}
    }
    if (typeof(from) === 'undefined') {
      from = address
    }
    if (typeof(value) === 'undefined') {
      value = 0
    }
    if (typeof(gas) === 'undefined' && callOrSend !== 'deploy') {
      gas = 6009006
      if (testingContext === 'coverage') {
        gas = gasLimit - 1
      }
    }
    let ok = false
    let contract
    let deployGas
    if (callOrSend === 'send') {
      ok = await send(
        title,
        instance,
        method,
        args,
        from,
        value,
        gas,
        1,
        shouldSucceed,
        assertionCallback
      )
    } else if (callOrSend === 'call') {
      ok = await call(
        title,
        instance,
        method,
        args,
        from,
        value,
        gas,
        1,
        shouldSucceed,
        assertionCallback
      )
    } else if (callOrSend === 'deploy') {
      const fields = await deploy(
        title,
        instance,
        args,
        from,
        value,
        gas,
        1,
        shouldSucceed,
        assertionCallback
      )
      ok = fields[0]
      contract = fields[1]
      deployGas = fields[2]
    } else {
      console.error('must use call, send, or deploy!')
      process.exit(1)
    }

    if (ok) {
      console.log(
        ` ✓ ${
          callOrSend === 'deploy' ? 'successful ' : ''
        }${title}${
          callOrSend === 'deploy' ? ` (${deployGas} gas)` : ''
        }`
      )
      passed++
    } else {
      console.log(
        ` ✘ ${
          callOrSend === 'deploy' ? 'failed ' : ''
        }${title}${
          callOrSend === 'deploy' ? ` (${deployGas} gas)` : ''
        }`
      )
      failed++
    }

    if (contract) {
      return contract
    }
  }

  async function setupNewDefaultAddress(newPrivateKey) {
    const pubKey = await web3.eth.accounts.privateKeyToAccount(newPrivateKey)
    await web3.eth.accounts.wallet.add(pubKey)

    await web3.eth.sendTransaction({
      from: originalAddress,
      to: pubKey.address,
      value: 10 ** 18,
      gas: '0x5208',
      gasPrice: '0x4A817C800'
    })

    return pubKey.address
  }

  async function raiseGasLimit(necessaryGas) {
    iterations = 9999
    if (necessaryGas > 8000000) {
      console.error('the gas needed is too high!')
      process.exit(1)
    } else if (typeof necessaryGas === 'undefined') {
      iterations = 20
      necessaryGas = 8000000
    }

    // bring up gas limit if necessary by doing additional transactions
    var block = await web3.eth.getBlock("latest")
    while (iterations > 0 && block.gasLimit < necessaryGas) {
      await web3.eth.sendTransaction({
        from: originalAddress,
        to: originalAddress,
        value: '0x01',
        gas: '0x5208',
        gasPrice: '0x4A817C800'
      })
      var block = await web3.eth.getBlock("latest")
      iterations--
    }

    console.log("raising gasLimit, currently at " + block.gasLimit)
    return block.gasLimit
  }

  async function getDeployGas(dataPayload) {
    await web3.eth.estimateGas({
      from: address,
      data: dataPayload
    }).catch(async error => {
      if (
        error.message === (
          'Returned error: gas required exceeds allowance or always failing ' +
          'transaction'
        )
      ) {
        await raiseGasLimit()
        await getDeployGas(dataPayload)
      }
    })

    deployGas = await web3.eth.estimateGas({
      from: address,
      data: dataPayload
    })

    return deployGas
  }

  function signHashedPrefixedHexString(hashedHexString, account) {
    const hashedPrefixedMessage = web3.utils.keccak256(
      // prefix => "\x19Ethereum Signed Message:\n32"
      "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
      hashedHexString.slice(2),
      {encoding: "hex"}
    )

    const sig = util.ecsign(
      util.toBuffer(hashedPrefixedMessage),
      util.toBuffer(web3.eth.accounts.wallet[account].privateKey)
    )

    return (
      util.bufferToHex(sig.r) +
      util.bufferToHex(sig.s).slice(2) +
      web3.utils.toHex(sig.v).slice(2)
    )
  }

  function signHashedPrefixedHashedHexString(hexString, account) {
    const hashedPrefixedHashedMessage = web3.utils.keccak256(
      // prefix => "\x19Ethereum Signed Message:\n32"
      "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
      web3.utils.keccak256(hexString, {encoding: "hex"}).slice(2),
      {encoding: "hex"}
    )

    const sig = util.ecsign(
      util.toBuffer(hashedPrefixedHashedMessage),
      util.toBuffer(web3.eth.accounts.wallet[account].privateKey)
    )

    return (
      util.bufferToHex(sig.r) +
      util.bufferToHex(sig.s).slice(2) +
      web3.utils.toHex(sig.v).slice(2)
    )
  }

  // *************************** deploy contracts *************************** //
  const MockCodeCheck = await runTest(
    `MockCodeCheck contract deployment`,
    MockCodeCheckDeployer,
    '',
    'deploy'
  )

  let currentKeylessCreate2Runtime;
  await runTest(
    'Current runtime code at address of initial create2 factory can be retrieved',
    MockCodeCheck,
    'code',
    'call',
    [constants.KEYLESS_CREATE2_ADDRESS],
    true,
    value => {
      currentKeylessCreate2Runtime = value
    }
  )

  // submit the initial create2 deployment transaction if needed
  if (currentKeylessCreate2Runtime !== constants.KEYLESS_CREATE2_RUNTIME_HASH) {
    console.log(' ✓ submitting initial create2 contract deployment transaction...')
    await web3.eth.sendSignedTransaction(
      constants.KEYLESS_CREATE2_DEPLOYMENT_TRANSACTION
    );
    passed++

    // deploy a mock code check contract using the initial create2 deployer
    console.log(' ✓ deploying test contract via create2 contract...')
    const DeploymentTx = await web3.eth.sendTransaction({
      from: originalAddress,
      to: constants.KEYLESS_CREATE2_ADDRESS,
      value: 0,
      gas: (testingContext !== 'coverage') ? 1500051 : gasLimit - 1,
      gasPrice: 1,
      data: MockCodeCheckArtifact.bytecode
    })
    passed++
  } else {
    console.log(' ✓ initial create2 contract already deployed, skipping...')
  }

  let currentInefficientImmutableCreate2FactoryRuntimeHash;
  await runTest(
    'Current runtime hash at address of inefficient immutable create2 factory can be retrieved',
    MockCodeCheck,
    'hash',
    'call',
    [constants.INEFFICIENT_IMMUTABLE_CREATE2_FACTORY_ADDRESS],
    true,
    value => {
      currentInefficientImmutableCreate2FactoryRuntimeHash = value
    }
  )

  // submit the inefficient immutable create2 deployment transaction if needed  
  if (currentInefficientImmutableCreate2FactoryRuntimeHash !== constants.IMMUTABLE_CREATE2_FACTORY_RUNTIME_HASH) {
    console.log(
      ' ✓ submitting inefficient immutable create2 factory deployment through' +
      ' initial create2 contract...'
    )
    await web3.eth.sendTransaction({
      from: originalAddress,
      to: constants.KEYLESS_CREATE2_ADDRESS,
      value: '0',
      gas: (testingContext !== 'coverage') ? '608261' : gasLimit - 1,
      gasPrice: 1,
      data: constants.IMMUTABLE_CREATE2_FACTORY_CREATION_CODE
    });
    passed++
  } else {
    console.log(' ✓ inefficient immutable create2 factory contract already deployed, skipping...')
  }

  let currentImmutableCreate2FactoryRuntimeHash;
  await runTest(
    'Current runtime hash at address of immutable create2 factory can be retrieved',
    MockCodeCheck,
    'hash',
    'call',
    [constants.IMMUTABLE_CREATE2_FACTORY_ADDRESS],
    true,
    value => {
      currentImmutableCreate2FactoryRuntimeHash = value
    }
  )  

  // submit the immutable create2 deployment transaction if needed  
  if (currentImmutableCreate2FactoryRuntimeHash !== constants.IMMUTABLE_CREATE2_FACTORY_RUNTIME_HASH) {
    await runTest(
      `submitting immutable create2 factory deployment through initial create2 contract...`,
      InefficientImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.IMMUTABLE_CREATE2_FACTORY_SALT,
        constants.IMMUTABLE_CREATE2_FACTORY_CREATION_CODE
      ],
      true
    )
  } else {
    console.log(' ✓ immutable create2 factory contract already deployed, skipping...')
  }

  const DharmaSmartWalletImplementationV3 = await runTest(
    `DharmaSmartWalletImplementationV3 contract deployment (prior to external dependencies)`,
    DharmaSmartWalletImplementationV3Deployer,
    '',
    'deploy'
  )

  let currentKeyRegistryV2Code;
  await runTest(
    'Checking Key Registry V2 runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.KEY_REGISTRY_V2_ADDRESS],
    true,
    value => {
      currentKeyRegistryV2Code = value;
    }
  )

  if (
    currentKeyRegistryV2Code !== swapMetadataHash(
      DharmaKeyRegistryV2Artifact.deployedBytecode,
      constants.KEY_REGISTRY_V2_METADATA
    )
  ) {
    await runTest(
      `DharmaKeyRegistryV2 Code contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.KEY_REGISTRY_V2_SALT,
        swapMetadataHash(
          DharmaKeyRegistryV2Artifact.bytecode,
          constants.KEY_REGISTRY_V2_METADATA
        )
      ],
      true,
      value => {
        assert.strictEqual(value, constants.KEY_REGISTRY_V2_ADDRESS)
      }
    )

    await runTest(
      `DharmaKeyRegistryV2 contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.KEY_REGISTRY_V2_SALT,
        swapMetadataHash(
          DharmaKeyRegistryV2Artifact.bytecode,
          constants.KEY_REGISTRY_V2_METADATA
        )
      ],
      true,
      receipt => {},
      originalAddress
    )
  }

  await runTest(
    'Deployed Key Registry code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaKeyRegistryV2.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaKeyRegistryV2Artifact.deployedBytecode,
        constants.KEY_REGISTRY_V2_METADATA
      ))
    }
  )

  const initializeWithoutSettingDaiApproval = (
    "0x608060405234801561001057600080fd5b506040516101643803806101648339818101" +
    "604052602081101561003357600080fd5b50516040805160608181019092526024808252" +
    "61014060208301399050816001600160a01b031681604051808280519060200190808383" +
    "5b6020831061008a5780518252601f19909201916020918201910161006b565b60018360" +
    "20036101000a038019825116818451168082178552505050505050905001915050600060" +
    "405180830381855af49150503d80600081146100ea576040519150601f19603f3d011682" +
    "016040523d82523d6000602084013e6100ef565b606091505b5050505050603e80610102" +
    "6000396000f3fe6080604052600080fdfea265627a7a72315820aba771301c13d7bf0c4c" +
    "0eec2fd618d84bd481649ad62c95ef2cfb4b836ca6af64736f6c634300050b0032c4d66d" +
    "e80000000000000000000000001010101010101010101010101010101010101010" +
    DharmaSmartWalletImplementationV3.options.address.slice(2).padStart(64, '0')
  )

  /*
  console.log('Getting very difficult to reach code coverage...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: null,
    value: web3.utils.toWei('0', 'ether'),
    gas: gasLimit - 1,
    gasPrice: 1,
    data: initializeWithoutSettingDaiApproval
  })
  passed++
  */

  console.log(
    `completed ${passed + failed} test${passed + failed === 1 ? '' : 's'} ` +
    `with ${failed} failure${failed === 1 ? '' : 's'}.`
  )

  if (failed > 0) {
    process.exit(1)
  }

  // exit.
  return 0
}}
