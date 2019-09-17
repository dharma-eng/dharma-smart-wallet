var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')

let DharmaUpgradeBeaconArtifact;
let DharmaUpgradeBeaconControllerArtifact;
let DharmaUpgradeBeaconEnvoyArtifact;
let DharmaKeyRegistryV1Artifact;
let DharmaAccountRecoveryManagerArtifact;
let DharmaSmartWalletFactoryV1Artifact;
let UpgradeBeaconProxyArtifact;
let AdharmaSmartWalletImplementationArtifact;
let DharmaUpgradeBeaconControllerManagerArtifact;

const DharmaUpgradeMultisigArtifact = require('../../build/contracts/DharmaUpgradeMultisig.json')
const DharmaAccountRecoveryMultisigArtifact = require('../../build/contracts/DharmaAccountRecoveryMultisig.json')

const DharmaSmartWalletImplementationV0Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV0.json')
const DharmaSmartWalletImplementationV1Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV1.json')
const DharmaSmartWalletImplementationV2Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV2.json')

const UpgradeBeaconImplementationCheckArtifact = require('../../build/contracts/UpgradeBeaconImplementationCheck.json')
const BadBeaconArtifact = require('../../build/contracts/BadBeacon.json')
const BadBeaconTwoArtifact = require('../../build/contracts/BadBeaconTwo.json')
const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const IERC20Artifact = require('../../build/contracts/IERC20.json')

const ImmutableCreate2FactoryArtifact = require('../../build/contracts/ImmutableCreate2Factory.json')
const IndestructibleRegistryArtifact = require('../../build/contracts/IndestructibleRegistry.json')
const CodeHashCacheArtifact = require('../../build/contracts/CodeHashCache.json')

// used to wait for more confirmations
function longer() {
  return new Promise(resolve => {setTimeout(() => {resolve()}, 500)})
}

module.exports = {test: async function (provider, testingContext) {
  if (testingContext === 'coverage') {
    DharmaUpgradeBeaconEnvoyArtifact = require('../../../build/contracts/DharmaUpgradeBeaconEnvoy.json')
    DharmaUpgradeBeaconControllerArtifact = require('../../../build/contracts/DharmaUpgradeBeaconController.json')
    DharmaUpgradeBeaconArtifact = require('../../../build/contracts/DharmaUpgradeBeacon.json')
    DharmaKeyRegistryV1Artifact = require('../../../build/contracts/DharmaKeyRegistryV1.json')
    DharmaSmartWalletFactoryV1Artifact = require('../../../build/contracts/DharmaSmartWalletFactoryV1.json')
    UpgradeBeaconProxyArtifact = require('../../../build/contracts/UpgradeBeaconProxy.json')
    DharmaAccountRecoveryManagerArtifact = require('../../../build/contracts/DharmaAccountRecoveryManager.json')
    AdharmaSmartWalletImplementationArtifact = require('../../../build/contracts/AdharmaSmartWalletImplementation.json')
    DharmaUpgradeBeaconControllerManagerArtifact = require('../../../build/contracts/DharmaUpgradeBeaconControllerManager.json')
  } else {
    DharmaUpgradeBeaconEnvoyArtifact = require('../../build/contracts/DharmaUpgradeBeaconEnvoy.json')
    DharmaUpgradeBeaconControllerArtifact = require('../../build/contracts/DharmaUpgradeBeaconController.json')
    DharmaUpgradeBeaconArtifact = require('../../build/contracts/DharmaUpgradeBeacon.json')
    DharmaKeyRegistryV1Artifact = require('../../build/contracts/DharmaKeyRegistryV1.json')
    DharmaSmartWalletFactoryV1Artifact = require('../../build/contracts/DharmaSmartWalletFactoryV1.json')
    UpgradeBeaconProxyArtifact = require('../../build/contracts/UpgradeBeaconProxy.json')
    DharmaAccountRecoveryManagerArtifact = require('../../build/contracts/DharmaAccountRecoveryManager.json')
    AdharmaSmartWalletImplementationArtifact = require('../../build/contracts/AdharmaSmartWalletImplementation.json')
    DharmaUpgradeBeaconControllerManagerArtifact = require('../../build/contracts/DharmaUpgradeBeaconControllerManager.json')
  }

  var web3 = provider
  let passed = 0
  let failed = 0
  let gasUsage = {}
  let counts = {}

  const DharmaUpgradeBeaconController = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerArtifact.abi,
    constants.UPGRADE_BEACON_CONTROLLER_ADDRESS
  )

  const DharmaUpgradeBeacon = new web3.eth.Contract(
    DharmaUpgradeBeaconArtifact.abi,
    constants.UPGRADE_BEACON_ADDRESS
  )

  const DharmaSmartWalletFactoryV1 = new web3.eth.Contract(
    DharmaSmartWalletFactoryV1Artifact.abi,
    constants.FACTORY_ADDRESS
  )

  const DharmaAccountRecoveryManager = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi,
    constants.ACCOUNT_RECOVERY_MANAGER_ADDRESS
  )

  const DharmaUpgradeBeaconControllerManager = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi,
    constants.ACCOUNT_RECOVERY_MANAGER_ADDRESS
  ) 

  const IndestructibleRegistryDeployer = new web3.eth.Contract(
    IndestructibleRegistryArtifact.abi
  )
  IndestructibleRegistryDeployer.options.data = (
    IndestructibleRegistryArtifact.bytecode
  )

  const CodeHashCacheDeployer = new web3.eth.Contract(
    CodeHashCacheArtifact.abi
  )
  CodeHashCacheDeployer.options.data = (
    CodeHashCacheArtifact.bytecode
  )

  const DharmaAccountRecoveryMultisigDeployer = new web3.eth.Contract(
    DharmaAccountRecoveryMultisigArtifact.abi
  )
  DharmaAccountRecoveryMultisigDeployer.options.data = (
    DharmaAccountRecoveryMultisigArtifact.bytecode
  )

  const DharmaUpgradeBeaconControllerDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerArtifact.abi
  )
  DharmaUpgradeBeaconControllerDeployer.options.data = (
    DharmaUpgradeBeaconControllerArtifact.bytecode
  )

  const DharmaUpgradeBeaconDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconArtifact.abi
  )
  DharmaUpgradeBeaconDeployer.options.data = (
    DharmaUpgradeBeaconArtifact.bytecode
  )

  const BadBeaconDeployer = new web3.eth.Contract(BadBeaconArtifact.abi)
  BadBeaconDeployer.options.data = BadBeaconArtifact.bytecode

  const BadBeaconTwoDeployer = new web3.eth.Contract(BadBeaconTwoArtifact.abi)
  BadBeaconTwoDeployer.options.data = BadBeaconTwoArtifact.bytecode

  const DharmaUpgradeBeaconControllerManagerDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerManagerArtifact.abi
  )
  DharmaUpgradeBeaconControllerManagerDeployer.options.data = (
    DharmaUpgradeBeaconControllerManagerArtifact.bytecode
  )

  const DharmaUpgradeMultisigDeployer = new web3.eth.Contract(
    DharmaUpgradeMultisigArtifact.abi
  )
  DharmaUpgradeMultisigDeployer.options.data = (
    DharmaUpgradeMultisigArtifact.bytecode
  )

  const UpgradeBeaconProxyDeployer = new web3.eth.Contract(
    UpgradeBeaconProxyArtifact.abi
  )
  UpgradeBeaconProxyDeployer.options.data = (
    UpgradeBeaconProxyArtifact.bytecode
  )

  const DharmaKeyRegistryV1Deployer = new web3.eth.Contract(
    DharmaKeyRegistryV1Artifact.abi
  )
  DharmaKeyRegistryV1Deployer.options.data = (
    DharmaKeyRegistryV1Artifact.bytecode
  )

  const DharmaSmartWalletFactoryV1Deployer = new web3.eth.Contract(
    DharmaSmartWalletFactoryV1Artifact.abi
  )
  DharmaSmartWalletFactoryV1Deployer.options.data = (
    DharmaSmartWalletFactoryV1Artifact.bytecode
  )

  const AdharmaSmartWalletImplementationDeployer = new web3.eth.Contract(
    AdharmaSmartWalletImplementationArtifact.abi
  )
  AdharmaSmartWalletImplementationDeployer.options.data = (
    AdharmaSmartWalletImplementationArtifact.bytecode
  )
  
  const DharmaAccountRecoveryManagerDeployer = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi
  )
  DharmaAccountRecoveryManagerDeployer.options.data = (
    DharmaAccountRecoveryManagerArtifact.bytecode
  )

  const DharmaSmartWalletImplementationV0Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV0Artifact.abi
  )
  DharmaSmartWalletImplementationV0Deployer.options.data = (
    DharmaSmartWalletImplementationV0Artifact.bytecode
  )

  const DharmaSmartWalletImplementationV1Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV1Artifact.abi
  )
  DharmaSmartWalletImplementationV1Deployer.options.data = (
    DharmaSmartWalletImplementationV1Artifact.bytecode
  )

  const DharmaSmartWalletImplementationV2Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV2Artifact.abi
  )
  DharmaSmartWalletImplementationV2Deployer.options.data = (
    DharmaSmartWalletImplementationV2Artifact.bytecode
  )

  const UpgradeBeaconImplementationCheckDeployer = new web3.eth.Contract(
    UpgradeBeaconImplementationCheckArtifact.abi
  )
  UpgradeBeaconImplementationCheckDeployer.options.data = (
    UpgradeBeaconImplementationCheckArtifact.bytecode
  )

  const InefficientImmutableCreate2Factory = new web3.eth.Contract(
    ImmutableCreate2FactoryArtifact.abi,
    constants.INEFFICIENT_IMMUTABLE_CREATE2_FACTORY_ADDRESS
  )

  const ImmutableCreate2Factory = new web3.eth.Contract(
    ImmutableCreate2FactoryArtifact.abi,
    constants.IMMUTABLE_CREATE2_FACTORY_ADDRESS
  )

  const MockCodeCheckDeployer = new web3.eth.Contract(
    MockCodeCheckArtifact.abi
  )
  MockCodeCheckDeployer.options.data = MockCodeCheckArtifact.bytecode

  // construct the payload passed to create2 in order to verify correct behavior
  const testCreate2payload = (
    '0xff' +
    constants.KEYLESS_CREATE2_ADDRESS.slice(2) +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    web3.utils.keccak256(
      MockCodeCheckArtifact.bytecode,
      {encoding: 'hex'}
    ).slice(2)
  )

  // determine the target address using the payload
  const targetCodeCheckAddress = web3.utils.toChecksumAddress(
    '0x' + web3.utils.keccak256(
      testCreate2payload,
      {encoding: "hex"}
    ).slice(12).substring(14)
  )

  const MockCodeCheckTwo = new web3.eth.Contract(
    MockCodeCheckArtifact.abi,
    targetCodeCheckAddress
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
    '0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed'
  )

  let addressTwo = await setupNewDefaultAddress(
    '0xf00df00df00df00df00df00df00df00df00df00df00df00df00df00df00df00d'
  )

  let initialControllerOwner = await setupNewDefaultAddress(
    '0x58e0348ce225c18ece7f2d6a069afa340365019481903b221481706d291a66bf'
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

  console.log('funding initial controller owner address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: initialControllerOwner,
    value: web3.utils.toWei('0.001', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
    gasPrice: 1
  })

  console.log('running tests...')

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

    const txCount = await web3.eth.getTransactionCount(pubKey.address)

    if (txCount > 0) {
      console.warn(
        `warning: ${pubKey.address} has already been used, which may cause ` +
        'some tests to fail or to be skipped.'
      )
    }

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
  let deployGas
  let selfAddress

  const MockCodeCheck = await runTest(
    `MockCodeCheck contract deployment`,
    MockCodeCheckDeployer,
    '',
    'deploy'
  )

  await runTest(
    'Deployed MockCodeCheck code is correct',
    MockCodeCheck,
    'code',
    'call',
    [MockCodeCheck.options.address],
    true,
    value => {
      assert.strictEqual(value, MockCodeCheckArtifact.deployedBytecode)
    }
  )

  await runTest(
    'Deployed MockCodeCheck has correct extcodehash',
    MockCodeCheck,
    'hash',
    'call',
    [MockCodeCheck.options.address],
    true,
    value => {
      assert.strictEqual(
        value,
        web3.utils.keccak256(
          MockCodeCheckArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
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

  // BEGIN ACTUAL DEPLOYMENT TESTS

  let currentUpgradeBeaconEnvoyCode;
  await runTest(
    'Checking Upgrade Beacon Envoy runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.UPGRADE_BEACON_ENVOY_ADDRESS],
    true,
    value => {
      currentUpgradeBeaconEnvoyCode = value;
    }
  )

  if (
    currentUpgradeBeaconEnvoyCode !== DharmaUpgradeBeaconEnvoyArtifact.deployedBytecode
  ) {
    await runTest(
      `UpgradeBeaconEnvoy contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_ENVOY_SALT,
        DharmaUpgradeBeaconEnvoyArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, constants.UPGRADE_BEACON_ENVOY_ADDRESS)
      }
    )

    await runTest(
      `Upgrade Beacon Envoy contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.UPGRADE_BEACON_ENVOY_SALT,
        DharmaUpgradeBeaconEnvoyArtifact.bytecode
      ]
    )
  }

  await runTest(
    'Deployed Upgrade Beacon Envoy code is correct',
    MockCodeCheck,
    'code',
    'call',
    [constants.UPGRADE_BEACON_ENVOY_ADDRESS],
    true,
    value => {
      assert.strictEqual(value, DharmaUpgradeBeaconEnvoyArtifact.deployedBytecode)
    }
  )

  let currentUpgradeBeaconControllerCode;
  await runTest(
    'Checking Upgrade Beacon Controller runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.UPGRADE_BEACON_CONTROLLER_ADDRESS],
    true,
    value => {
      currentUpgradeBeaconControllerCode = value;
    }
  )

  if (
    currentUpgradeBeaconControllerCode !== DharmaUpgradeBeaconControllerArtifact.deployedBytecode
  ) {
    await runTest(
      `DharmaUpgradeBeaconController contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_CONTROLLER_SALT,
        DharmaUpgradeBeaconControllerArtifact.bytecode + 
        '000000000000000000000000990774Aa5DFB8a2600EB78101C1eeAa8d6104623'
      ],
      true,
      value => {
        assert.strictEqual(value, constants.UPGRADE_BEACON_CONTROLLER_ADDRESS)
      }
    )

    await runTest(
      `DharmaUpgradeBeaconController contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.UPGRADE_BEACON_CONTROLLER_SALT,
        DharmaUpgradeBeaconControllerArtifact.bytecode + 
        '000000000000000000000000990774Aa5DFB8a2600EB78101C1eeAa8d6104623'
      ]
    )

    await runTest(
      `DharmaUpgradeBeaconController can transfer owner`,
      DharmaUpgradeBeaconController,
      'transferOwnership',
      'send',
      [address],
      true,
      receipt => {},
      initialControllerOwner
    )
  }

  // TODO: override mainnet owner if set to some other account

  await runTest(
    'Deployed Upgrade Beacon Controller code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaUpgradeBeaconController.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaUpgradeBeaconControllerArtifact.deployedBytecode)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconController contract deployment`,
    DharmaUpgradeBeaconControllerDeployer,
    '',
    'deploy',
    [address]
  )

  const FailedUpgradeBeaconProxy = await runTest(
    `failure when deploying UpgradeBeaconProxy contract using an undeployed beacon`,
    UpgradeBeaconProxyDeployer,
    '',
    'deploy',
    ["0x"],
    false
  )

  let currentUpgradeBeaconCode;
  await runTest(
    'Checking Upgrade Beacon runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.UPGRADE_BEACON_ADDRESS],
    true,
    value => {
      currentUpgradeBeaconCode = value;
    }
  )

  if (
    currentUpgradeBeaconCode !== DharmaUpgradeBeaconArtifact.deployedBytecode
  ) {
    await runTest(
      `DharmaUpgradeBeacon contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_SALT,
        DharmaUpgradeBeaconArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, constants.UPGRADE_BEACON_ADDRESS)
      }
    )

    await runTest(
      `DharmaUpgradeBeacon contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.UPGRADE_BEACON_SALT,
        DharmaUpgradeBeaconArtifact.bytecode
      ]
    )
  }

  await runTest(
    `DharmaUpgradeBeacon contract deployment`,
    DharmaUpgradeBeaconDeployer,
    '',
    'deploy',
    []
  )

  let currentKeyRegistryCode;
  await runTest(
    'Checking Key Registry runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.KEY_REGISTRY_ADDRESS],
    true,
    value => {
      currentKeyRegistryCode = value;
    }
  )

  if (
    currentKeyRegistryCode !== DharmaKeyRegistryV1Artifact.deployedBytecode
  ) {
    await runTest(
      `DharmaKeyRegistryV1 Code contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.KEY_REGISTRY_SALT,
        DharmaKeyRegistryV1Artifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, constants.KEY_REGISTRY_ADDRESS)
      }
    )

    await runTest(
      `DharmaKeyRegistryV1 contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.KEY_REGISTRY_SALT,
        DharmaKeyRegistryV1Artifact.bytecode
      ]
    )
  }

  const DharmaUpgradeMultisig = await runTest(
    `DharmaUpgradeMultisig contract deployment`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[address], 1]
  )

  const DharmaAccountRecoveryMultisig = await runTest(
    `DharmaAccountRecoveryMultisig contract deployment`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[address], 1]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment`,
    DharmaUpgradeBeaconControllerManagerDeployer,
    '',
    'deploy',
    []
  )
  
  await runTest(
    `DharmaUpgradeBeacon contract deployment`,
    DharmaUpgradeBeaconDeployer,
    '',
    'deploy',
    []
  )

  const BadBeacon = await runTest(
    `Mock Bad Beacon contract deployment`,
    BadBeaconDeployer,
    '',
    'deploy'
  )

  const BadBeaconTwo = await runTest(
    `Mock Bad Beacon Two contract deployment`,
    BadBeaconTwoDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV0 = await runTest(
    `DharmaSmartWalletImplementationV0 contract deployment`,
    DharmaSmartWalletImplementationV0Deployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV1 = await runTest(
    `DharmaSmartWalletImplementationV1 contract deployment`,
    DharmaSmartWalletImplementationV1Deployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV2 = await runTest(
    `DharmaSmartWalletImplementationV2 contract deployment`,
    DharmaSmartWalletImplementationV2Deployer,
    '',
    'deploy'
  )

  let currentFactoryCode;
  await runTest(
    'Checking Factory runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.FACTORY_ADDRESS],
    true,
    value => {
      currentFactoryCode = value;
    }
  )

  if (
    currentFactoryCode !== DharmaSmartWalletFactoryV1Artifact.deployedBytecode
  ) {
    await runTest(
      `DharmaSmartWalletFactoryV1 Code contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.FACTORY_SALT,
        DharmaSmartWalletFactoryV1Artifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, constants.FACTORY_ADDRESS)
      }
    )

    await runTest(
      `DharmaSmartWalletFactoryV1 contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.FACTORY_SALT,
        DharmaSmartWalletFactoryV1Artifact.bytecode
      ]
    )
  }

  await runTest(
    `DharmaSmartWalletFactoryV1 contract deployment`,
    DharmaSmartWalletFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  let currentAccountRecoveryManagerCode;
  await runTest(
    'Checking Account Recovery Manager runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.ACCOUNT_RECOVERY_MANAGER_ADDRESS],
    true,
    value => {
      currentAccountRecoveryManagerCode = value;
    }
  )

  if (
    currentAccountRecoveryManagerCode !== DharmaAccountRecoveryManagerArtifact.deployedBytecode
  ) {
    await runTest(
      `DharmaAccountRecoveryManager contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.ACCOUNT_RECOVERY_MANAGER_SALT,
        DharmaAccountRecoveryManagerArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, constants.ACCOUNT_RECOVERY_MANAGER_ADDRESS)
      }
    )

    await runTest(
      `DharmaAccountRecoveryManager contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.ACCOUNT_RECOVERY_MANAGER_SALT,
        DharmaAccountRecoveryManagerArtifact.bytecode
      ]
    )
  }

  await runTest(
    `DharmaAccountRecoveryManager contract deployment`,
    DharmaAccountRecoveryManagerDeployer,
    '',
    'deploy'
  )

  let currentAdharmaSmartWalletImplementationCode;
  await runTest(
    'Checking Account Recovery Manager runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS],
    true,
    value => {
      currentAdharmaSmartWalletImplementationCode = value;
    }
  )

  if (
    currentAdharmaSmartWalletImplementationCode !== AdharmaSmartWalletImplementationArtifact.deployedBytecode
  ) {
    await runTest(
      `AdharmaSmartWalletImplementation contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        '0x000000000000000000000000000000000000000037686e593cbd8f0d1f190000',
        AdharmaSmartWalletImplementationArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS)
      }
    )

    await runTest(
      `AdharmaSmartWalletImplementation contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x000000000000000000000000000000000000000037686e593cbd8f0d1f190000',
        AdharmaSmartWalletImplementationArtifact.bytecode
      ]
    )
  }

  await runTest(
    `AdharmaSmartWalletImplementation contract deployment`,
    AdharmaSmartWalletImplementationDeployer,
    '',
    'deploy'
  )

  let currentUpgradeBeaconControllerManagerCode;
  await runTest(
    'Checking Upgrade Beacon Controller Manager runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS],
    true,
    value => {
      currentUpgradeBeaconControllerManagerCode = value;
    }
  )

  if (
    currentUpgradeBeaconControllerManagerCode !== DharmaUpgradeBeaconControllerManagerArtifact.deployedBytecode
  ) {
    await runTest(
      `DharmaUpgradeBeaconControllerManager contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_CONTROLLER_MANAGER_SALT,
        DharmaUpgradeBeaconControllerManagerArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS)
      }
    )

    await runTest(
      `DharmaUpgradeBeaconControllerManager contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x0000000000000000000000000000000000000000ab7cfa72f49fa70a011d0000',
        DharmaUpgradeBeaconControllerManagerArtifact.bytecode
      ]
    )
  }

  const IndestructibleRegistry = await runTest(
    `IndestructibleRegistry contract deployment`,
    IndestructibleRegistryDeployer,
    '',
    'deploy'
  )

  await runTest(
    'IndestructibleRegistry can register itself as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [IndestructibleRegistry.options.address]
  )

  await runTest(
    'IndestructibleRegistry can register the upgrade beacon as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_ADDRESS]
  )  

  await runTest(
    'IndestructibleRegistry can register the upgrade beacon controller as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_CONTROLLER_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register the upgrade beacon envoy as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_ENVOY_ADDRESS]
  )  

  await runTest(
    'IndestructibleRegistry can register the upgrade beacon controller manager as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register the account recovery manager as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ACCOUNT_RECOVERY_MANAGER_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register the Dharma Key Registry as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.KEY_REGISTRY_ADDRESS]
  )

  await runTest(
    'WARNING: IndestructibleRegistry CANNOT register the smart wallet factory as indestructible (even though it is in fact NOT destructible)',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.FACTORY_ADDRESS],
    false
  )

  await runTest(
    'IndestructibleRegistry can register the Adharma implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register V0 implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [DharmaSmartWalletImplementationV0.options.address]
  )

  await runTest(
    'IndestructibleRegistry can register V1 implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [DharmaSmartWalletImplementationV1.options.address]
  )

  if (testingContext !== 'coverage') {
    await runTest(
      'IndestructibleRegistry can register V2 implementation as indestructible',
      IndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [DharmaSmartWalletImplementationV2.options.address]
    )
  }

  const CodeHashCache = await runTest(
    `CodeHashCache contract deployment`,
    CodeHashCacheDeployer,
    '',
    'deploy'
  )

  await runTest(
    'CodeHashCache can register the runtime code hash of the smart wallet factory',
    CodeHashCache,
    'registerCodeHash',
    'send',
    [constants.FACTORY_ADDRESS]
  )

  let currentDaiCode;
  await runTest(
    'Checking for required external contracts...',
    MockCodeCheck,
    'code',
    'call',
    [constants.DAI_MAINNET_ADDRESS],
    true,
    value => {
      currentDaiCode = value;
    }
  )

  if (!currentDaiCode) {
    console.log(
      `completed ${passed + failed} test${passed + failed === 1 ? '' : 's'} ` +
      `with ${failed} failure${failed === 1 ? '' : 's'}.`
    )

    console.log(
      'Note that the full test suite cannot be executed locally - instead, ' +
      'run against a fork of mainnet using `yarn forkStart` and `yarn test`.'
    )

    if (failed > 0) {
      process.exit(1)
    }

    // exit.
    return 0
  }


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
