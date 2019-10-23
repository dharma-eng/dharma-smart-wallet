var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')

const AdharmaSmartWalletImplementationArtifact = require('../../build/contracts/AdharmaSmartWalletImplementation.json')
const AdharmaKeyRingImplementationArtifact = require('../../build/contracts/AdharmaKeyRingImplementation.json')

const DharmaUpgradeBeaconControllerManagerArtifact = require('../../build/contracts/DharmaUpgradeBeaconControllerManager.json')
const DharmaUpgradeBeaconControllerArtifact = require('../../build/contracts/DharmaUpgradeBeaconController.json')
const DharmaUpgradeBeaconArtifact = require('../../build/contracts/DharmaUpgradeBeacon.json')
const DharmaKeyRingUpgradeBeaconArtifact = require('../../build/contracts/DharmaKeyRingUpgradeBeacon.json')
const DharmaUpgradeBeaconEnvoyArtifact = require('../../build/contracts/DharmaUpgradeBeaconEnvoy.json')

const DharmaAccountRecoveryManagerArtifact = require('../../build/contracts/DharmaAccountRecoveryManager.json')
const DharmaKeyRegistryV1Artifact = require('../../build/contracts/DharmaKeyRegistryV1.json')
const DharmaKeyRegistryV2Artifact = require('../../build/contracts/DharmaKeyRegistryV2.json')
const DharmaSmartWalletFactoryV1Artifact = require('../../build/contracts/DharmaSmartWalletFactoryV1.json')
const DharmaSmartWalletFactoryV2Artifact = require('../../build/contracts/DharmaSmartWalletFactoryV2.json')

const DharmaSmartWalletImplementationV0Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV0.json')
const DharmaSmartWalletImplementationV1Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV1.json')
const DharmaSmartWalletImplementationV2Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV2.json')
const DharmaSmartWalletImplementationV3Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV3.json')

const DharmaKeyRingImplementationV1Artifact = require('../../build/contracts/DharmaKeyRingImplementationV1.json')
const DharmaKeyRingFactoryV1Artifact = require('../../build/contracts/DharmaKeyRingFactoryV1.json')
const DharmaKeyRingFactoryV2Artifact = require('../../build/contracts/DharmaKeyRingFactoryV2.json')
const DharmaKeyRingFactoryV3Artifact = require('../../build/contracts/DharmaKeyRingFactoryV3.json')

const UpgradeBeaconProxyV1Artifact = require('../../build/contracts/UpgradeBeaconProxyV1.json')
const KeyRingUpgradeBeaconProxyV1Artifact = require('../../build/contracts/KeyRingUpgradeBeaconProxyV1.json')

const UpgradeBeaconImplementationCheckArtifact = require('../../build/contracts/UpgradeBeaconImplementationCheck.json')
const BadBeaconArtifact = require('../../build/contracts/BadBeacon.json')
const BadBeaconTwoArtifact = require('../../build/contracts/BadBeaconTwo.json')
const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const IERC20Artifact = require('../../build/contracts/IERC20.json')
const ComptrollerArtifact = require('../../build/contracts/ComptrollerInterface.json')

const contractNames = Object.assign({}, constants.CONTRACT_NAMES)

// used to wait for more confirmations
function longer() {
  return new Promise(resolve => {setTimeout(() => {resolve()}, 500)})
}

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

  const DharmaKeyRingUpgradeBeaconController = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerArtifact.abi,
    constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS
  )

  const DharmaKeyRingUpgradeBeacon = new web3.eth.Contract(
    DharmaKeyRingUpgradeBeaconArtifact.abi,
    constants.KEY_RING_UPGRADE_BEACON_ADDRESS
  )

  const DharmaAccountRecoveryManager = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi,
    constants.ACCOUNT_RECOVERY_MANAGER_ADDRESS
  )

  const DharmaKeyRegistryV1 = new web3.eth.Contract(
    DharmaKeyRegistryV1Artifact.abi,
    constants.KEY_REGISTRY_ADDRESS
  )

  const DharmaKeyRegistryV2 = new web3.eth.Contract(
    DharmaKeyRegistryV2Artifact.abi,
    constants.KEY_REGISTRY_V2_ADDRESS
  )

  const DharmaSmartWalletFactoryV1OnChain = new web3.eth.Contract(
    DharmaSmartWalletFactoryV1Artifact.abi,
    constants.FACTORY_ADDRESS
  )

  const Comptroller = new web3.eth.Contract(
    ComptrollerArtifact.abi,
    constants.COMPTROLLER_MAINNET_ADDRESS
  )

  const CDAI_BORROW = new web3.eth.Contract(
    [{
      "constant": false,
      "inputs": [{"name": "borrowAmount", "type": "uint256"}],
      "name": "borrow",
      "outputs": [{"name": "", "type": "uint256"}],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }],
    constants.CDAI_MAINNET_ADDRESS
  )

  const DAI = new web3.eth.Contract(
    IERC20Artifact.abi, constants.DAI_MAINNET_ADDRESS
  )

  const USDC = new web3.eth.Contract(
    IERC20Artifact.abi, constants.USDC_MAINNET_ADDRESS
  )

  const CDAI = new web3.eth.Contract(
    IERC20Artifact.abi, constants.CDAI_MAINNET_ADDRESS
  )

  const CUSDC = new web3.eth.Contract(
    IERC20Artifact.abi, constants.CUSDC_MAINNET_ADDRESS
  )

  const BadBeaconDeployer = new web3.eth.Contract(BadBeaconArtifact.abi)
  BadBeaconDeployer.options.data = BadBeaconArtifact.bytecode

  const BadBeaconTwoDeployer = new web3.eth.Contract(BadBeaconTwoArtifact.abi)
  BadBeaconTwoDeployer.options.data = BadBeaconTwoArtifact.bytecode


  const AdharmaSmartWalletImplementationDeployer = new web3.eth.Contract(
    AdharmaSmartWalletImplementationArtifact.abi
  )
  AdharmaSmartWalletImplementationDeployer.options.data = (
    AdharmaSmartWalletImplementationArtifact.bytecode
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

  const DharmaSmartWalletImplementationV3Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV3Artifact.abi
  )
  DharmaSmartWalletImplementationV3Deployer.options.data = (
    DharmaSmartWalletImplementationV3Artifact.bytecode
  )

  const AdharmaKeyRingImplementationDeployer = new web3.eth.Contract(
    AdharmaKeyRingImplementationArtifact.abi
  )
  AdharmaKeyRingImplementationDeployer.options.data = (
    AdharmaKeyRingImplementationArtifact.bytecode
  )

  const DharmaKeyRingImplementationV1Deployer = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi
  )
  DharmaKeyRingImplementationV1Deployer.options.data = (
    DharmaKeyRingImplementationV1Artifact.bytecode
  )

  const UpgradeBeaconImplementationCheckDeployer = new web3.eth.Contract(
    UpgradeBeaconImplementationCheckArtifact.abi
  )
  UpgradeBeaconImplementationCheckDeployer.options.data = (
    UpgradeBeaconImplementationCheckArtifact.bytecode
  )

  const MockCodeCheckDeployer = new web3.eth.Contract(
    MockCodeCheckArtifact.abi
  )
  MockCodeCheckDeployer.options.data = MockCodeCheckArtifact.bytecode

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

  const DharmaKeyRingUpgradeBeaconDeployer = new web3.eth.Contract(
    DharmaKeyRingUpgradeBeaconArtifact.abi
  )
  DharmaKeyRingUpgradeBeaconDeployer.options.data = (
    DharmaKeyRingUpgradeBeaconArtifact.bytecode
  )

  const DharmaUpgradeBeaconEnvoyDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconEnvoyArtifact.abi
  )
  DharmaUpgradeBeaconEnvoyDeployer.options.data = (
    DharmaUpgradeBeaconEnvoyArtifact.bytecode
  )

  const DharmaUpgradeBeaconControllerManagerDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerManagerArtifact.abi
  )
  DharmaUpgradeBeaconControllerManagerDeployer.options.data = (
    DharmaUpgradeBeaconControllerManagerArtifact.bytecode
  )

  const UpgradeBeaconProxyV1Deployer = new web3.eth.Contract(
    UpgradeBeaconProxyV1Artifact.abi
  )
  UpgradeBeaconProxyV1Deployer.options.data = (
    UpgradeBeaconProxyV1Artifact.bytecode
  )

  const KeyRingUpgradeBeaconProxyV1Deployer = new web3.eth.Contract(
    KeyRingUpgradeBeaconProxyV1Artifact.abi
  )
  KeyRingUpgradeBeaconProxyV1Deployer.options.data = (
    KeyRingUpgradeBeaconProxyV1Artifact.bytecode
  )

  const DharmaKeyRegistryV2Deployer = new web3.eth.Contract(
    DharmaKeyRegistryV2Artifact.abi
  )
  DharmaKeyRegistryV2Deployer.options.data = (
    DharmaKeyRegistryV2Artifact.bytecode
  )

  const DharmaSmartWalletFactoryV1Deployer = new web3.eth.Contract(
    DharmaSmartWalletFactoryV1Artifact.abi
  )
  DharmaSmartWalletFactoryV1Deployer.options.data = (
    DharmaSmartWalletFactoryV1Artifact.bytecode
  )

  const DharmaSmartWalletFactoryV2Deployer = new web3.eth.Contract(
    DharmaSmartWalletFactoryV2Artifact.abi
  )
  DharmaSmartWalletFactoryV2Deployer.options.data = (
    DharmaSmartWalletFactoryV2Artifact.bytecode
  )

  const DharmaKeyRingFactoryV1Deployer = new web3.eth.Contract(
    DharmaKeyRingFactoryV1Artifact.abi
  )
  DharmaKeyRingFactoryV1Deployer.options.data = (
    DharmaKeyRingFactoryV1Artifact.bytecode
  )

  const DharmaKeyRingFactoryV2Deployer = new web3.eth.Contract(
    DharmaKeyRingFactoryV2Artifact.abi
  )
  DharmaKeyRingFactoryV2Deployer.options.data = (
    DharmaKeyRingFactoryV2Artifact.bytecode
  )

  const DharmaKeyRingFactoryV3Deployer = new web3.eth.Contract(
    DharmaKeyRingFactoryV3Artifact.abi
  )
  DharmaKeyRingFactoryV3Deployer.options.data = (
    DharmaKeyRingFactoryV3Artifact.bytecode
  )

  const DharmaAccountRecoveryManagerDeployer = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi
  )
  DharmaAccountRecoveryManagerDeployer.options.data = (
    DharmaAccountRecoveryManagerArtifact.bytecode
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

    await web3.eth.sendTransaction({
      from: originalAddress,
      to: pubKey.address,
      value: 2 * 10 ** 18,
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

  async function advanceTime(time) {
    await web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [time],
        id: new Date().getTime()
      },
      (err, result) => {
        if (err) {
          console.error(err)
        } else {
          console.log(' ✓ advanced time by', time, 'seconds')
        }
      }
    )
  }

  // *************************** deploy contracts *************************** //
  let deployGas
  let selfAddress

  await runTest(
    `DharmaUpgradeBeaconController can transfer owner`,
    DharmaUpgradeBeaconController,
    'transferOwnership',
    'send',
    [address]
  )

  const MockCodeCheck = await runTest(
    `MockCodeCheck contract deployment`,
    MockCodeCheckDeployer,
    '',
    'deploy'
  )

  await runTest(
    'Dharma Key Registry V1 gets the initial global key correctly',
    DharmaKeyRegistryV1,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'Dharma Key Registry V1 attempt to get an unset specific key throws',
    DharmaKeyRegistryV1,
    'getSpecificKey',
    'call',
    [address],
    false
  )

  await runTest(
    'Dharma Key Registry V1 gets the global key when requesting unset key',
    DharmaKeyRegistryV1,
    'getKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'Dharma Key Registry V1 cannot set a new empty global key',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      constants.NULL_ADDRESS,
      '0x'
    ],
    false,
    receipt => {},
    originalAddress
  )

  const message = (
    DharmaKeyRegistryV1.options.address +
    address.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const newKeySignature = signHashedPrefixedHashedHexString(message, address)

  const badNewKeySignature = signHashedPrefixedHashedHexString('0x12', address)

  await runTest(
    'Dharma Key Registry V1 cannot set a new global key unless called by owner',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      address,
      newKeySignature
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'Dharma Key Registry V1 cannot set a new global key with a bad signature',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      address,
      badNewKeySignature
    ],
    false
  )

  await runTest(
    'Dharma Key Registry V1 can set a new global key correctly',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      address,
      newKeySignature
    ]
  )

  await runTest(
    'Dharma Key Registry V1 gets the new global key correctly',
    DharmaKeyRegistryV1,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'Dharma Key Registry V1 cannot set a new specific key unless called by owner',
    DharmaKeyRegistryV1,
    'setSpecificKey',
    'send',
    [
      address,
      DharmaKeyRegistryV1.options.address
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'Dharma Key Registry V1 can set a new specific key',
    DharmaKeyRegistryV1,
    'setSpecificKey',
    'send',
    [
      address,
      DharmaKeyRegistryV1.options.address
    ]
  )

  await runTest(
    'Dharma Key Registry V1 gets the new specific key correctly',
    DharmaKeyRegistryV1,
    'getSpecificKey',
    'call',
    [address],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRegistryV1.options.address)
    }
  )

  await runTest(
    'Dharma Key Registry V1 gets the specific key when requesting set key',
    DharmaKeyRegistryV1,
    'getKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRegistryV1.options.address)
    }
  )

  await runTest(
    'Dharma Key Registry V1 can set a new owner',
    DharmaKeyRegistryV1,
    'transferOwnership',
    'send',
    [
      address
    ]
  )

  await runTest(
    'Dharma Key Registry V1 gets the new owner',
    DharmaKeyRegistryV1,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'Dharma Key Registry V2 gets the new global key correctly',
    DharmaKeyRegistryV2,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  const messageV2 = (
    DharmaKeyRegistryV2.options.address +
    address.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const v2KeySignature = signHashedPrefixedHashedHexString(messageV2, address)

  await runTest(
    'Dharma Key Registry V2 cannot set a previously used global key',
    DharmaKeyRegistryV2,
    'setGlobalKey',
    'send',
    [
      address,
      v2KeySignature
    ],
    false
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

  const DharmaSmartWalletImplementationV3 = await runTest(
    `DharmaSmartWalletImplementationV3 contract deployment`,
    DharmaSmartWalletImplementationV3Deployer,
    '',
    'deploy'
  )

  const DharmaKeyRingImplementationV1 = await runTest(
    `DharmaKeyRingImplementationV1 contract deployment`,
    DharmaKeyRingImplementationV1Deployer,
    '',
    'deploy'
  )

  await runTest(
    'Dharma Upgrade Beacon Controller cannot set null address as implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      constants.NULL_ADDRESS
    ],
    false
  )

  await runTest(
    'Dharma Upgrade Beacon Controller cannot set non-contract as implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      address
    ],
    false
  )

  await runTest(
    'Dharma Upgrade Beacon Controller cannot support a "bad" beacon that throws',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      BadBeacon.options.address,
      DharmaSmartWalletImplementationV0.options.address
    ],
    false
  )

  await runTest(
    'Dharma Upgrade Beacon Controller cannot upgrade a non-upgradeable beacon',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      BadBeaconTwo.options.address,
      DharmaSmartWalletImplementationV0.options.address
    ],
    false
  )

  await runTest(
    'Dharma Upgrade Beacon Controller is inaccessible from a non-owner',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV0.options.address
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'Dharma Upgrade Beacon Controller can set initial upgrade beacon implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV0.options.address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.upgradeBeacon,
          DharmaUpgradeBeacon.options.address
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementation,
          constants.NULL_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          constants.EMPTY_HASH
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          DharmaSmartWalletImplementationV0.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          ...
        )
        */
      }
    }
  )

  await runTest(
    'Dharma Upgrade Beacon Controller cannot clear upgrade beacon implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      constants.NULL_ADDRESS
    ],
    false
  )

  await runTest(
    'Dharma Upgrade Beacon Controller can reset upgrade beacon implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV0.options.address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.upgradeBeacon,
          DharmaUpgradeBeacon.options.address
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementation,
          DharmaSmartWalletImplementationV0.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          constants.EMPTY_HASH
        )
        */
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          DharmaSmartWalletImplementationV0.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          ...
        )
        */
      }
    }
  )

  const UpgradeBeaconImplementationCheck = await runTest(
    `UpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV0.options.address
    ]
  )

  await runTest(
    'DharmaUpgradeBeacon has the implementation set',
    DharmaUpgradeBeaconController,
    'getImplementation',
    'call',
    [DharmaUpgradeBeacon.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaSmartWalletImplementationV0.options.address)
    }
  )

  await runTest(
    'Dharma Key Ring Upgrade Beacon Controller can set initial key ring upgrade beacon implementation',
    DharmaKeyRingUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaKeyRingUpgradeBeacon.options.address,
      DharmaKeyRingImplementationV1.options.address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.upgradeBeacon,
          DharmaKeyRingUpgradeBeacon.options.address
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementation,
          constants.NULL_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          constants.EMPTY_HASH
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          DharmaKeyRingImplementationV1.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          ...
        )
        */
      }
    }
  )

  const KeyRingUpgradeBeaconImplementationCheck = await runTest(
    `KeyRingUpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaKeyRingUpgradeBeacon.options.address,
      DharmaKeyRingImplementationV1.options.address
    ]
  )

  await runTest(
    'DharmaKeyRingUpgradeBeacon has the implementation set',
    DharmaKeyRingUpgradeBeaconController,
    'getImplementation',
    'call',
    [DharmaKeyRingUpgradeBeacon.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRingImplementationV1.options.address)
    }
  )

  const DharmaSmartWalletNoFactoryNoConstructorDeployer = new web3.eth.Contract([])
  DharmaSmartWalletNoFactoryNoConstructorDeployer.options.data = (
    '0x600b5981380380925939f359595959365960205959596e' +
    DharmaUpgradeBeacon.options.address.slice(12).toLowerCase() + 
    '5afa1551368280375af43d3d93803e602e57fd5bf3'
  )

  const DharmaSmartWalletNoFactoryNoConstructor = await runTest(
    `DharmaSmartWallet minimal upgradeable proxy deployment - no factory or constructor`,
    DharmaSmartWalletNoFactoryNoConstructorDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationTest = new web3.eth.Contract(
    DharmaSmartWalletImplementationV0Artifact.abi,
    DharmaSmartWalletNoFactoryNoConstructor.options.address
  )

  await runTest(
    'test passes',
    DharmaSmartWalletImplementationTest,
    'test',
    'call',
    [],
    true,
    value => {
      assert.ok(value)
    }
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

  const DharmaSmartWalletNoFactoryDeployer = new web3.eth.Contract([])
  DharmaSmartWalletNoFactoryDeployer.options.data = (
    '0x595959596076380359602059595973' +
    DharmaUpgradeBeacon.options.address.slice(2).toLowerCase() +
    '5afa155182607683395af46038573d903d81803efd5b60356041819339f3595959593659602059595973' +
    DharmaUpgradeBeacon.options.address.slice(2).toLowerCase() + 
    '5afa1551368280375af43d3d93803e603357fd5bf3' +
    'c4d66de80000000000000000000000009999999999999999999999999999999999999999'
  )

  const DharmaSmartWalletNoFactory = await runTest(
    `DharmaSmartWallet minimal upgradeable proxy deployment - no factory but with constructor`,
    DharmaSmartWalletNoFactoryDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationTestWithConstructor = new web3.eth.Contract(
    DharmaSmartWalletImplementationV0Artifact.abi,
    DharmaSmartWalletNoFactory.options.address
  )

  await runTest(
    'test passes',
    DharmaSmartWalletImplementationTestWithConstructor,
    'test',
    'call',
    [],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'new user smart wallet can be called and has the correct dharma key set',
    DharmaSmartWalletImplementationTestWithConstructor,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0x9999999999999999999999999999999999999999')
    }
  )

  const DharmaSmartWalletFactoryV1 = await runTest(
    `DharmaSmartWalletFactoryV1 contract deployment`,
    DharmaSmartWalletFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  let targetWalletAddress;
  await runTest(
    'DharmaSmartWalletFactoryV1 can get a new smart wallet address ahead of time',
    DharmaSmartWalletFactoryV1,
    'getNextSmartWallet',
    'call',
    [address],
    true,
    value => {
      // TODO: verify against expected value
      targetWalletAddress = value
    }
  )

  contractNames[DharmaSmartWalletFactoryV1.options.address] = 'Smart Wallet Factory'
  contractNames[targetWalletAddress] = 'Smart Wallet'

  const ethWhaleBalance = await web3.eth.getBalance(constants.ETH_WHALE_ADDRESS)
  const daiWhaleBalance = await web3.eth.getBalance(constants.DAI_WHALE_ADDRESS)
  const usdcWhaleBalance = await web3.eth.getBalance(constants.USDC_WHALE_ADDRESS)

  if (ethWhaleBalance === '0') {
    await web3.eth.sendTransaction({
      from: address,
      to: constants.ETH_WHALE_ADDRESS,
      value: web3.utils.toWei('.2', 'ether'),
      gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
      gasPrice: 1
    })
    console.log(' ✓ Eth Whale can receive eth if needed')
  }

  if (daiWhaleBalance === '0') {
    await web3.eth.sendTransaction({
      from: address,
      to: constants.DAI_WHALE_ADDRESS,
      value: web3.utils.toWei('.1', 'ether'),
      gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
      gasPrice: 1
    })
    console.log(' ✓ Dai Whale can receive eth if needed')
  }

  if (usdcWhaleBalance === '0') {
    await web3.eth.sendTransaction({
      from: address,
      to: constants.USDC_WHALE_ADDRESS,
      value: web3.utils.toWei('.1', 'ether'),
      gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
      gasPrice: 1
    })
    console.log(' ✓ USDC Whale can receive eth if needed')
  }

  await web3.eth.sendTransaction({
    from: constants.ETH_WHALE_ADDRESS,
    to: targetWalletAddress,
    value: web3.utils.toWei('.1', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
    gasPrice: 1
  })
  console.log(' ✓ Eth Whale can deposit eth into the yet-to-be-deployed smart wallet')

  await runTest(
    'Dai Whale can deposit dai into the yet-to-be-deployed smart wallet',
    DAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.DAI_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'ether')
        )
      }
    },
    constants.DAI_WHALE_ADDRESS
  )

  await runTest(
    'USDC Whale can deposit usdc into the yet-to-be-deployed smart wallet',
    USDC,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'lovelace')], // six decimals
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.USDC_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'lovelace')
        )
      }
    },
    constants.USDC_WHALE_ADDRESS
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 cannot deploy a new smart wallet with no key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 can deploy a new smart wallet using a Dharma Key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [address],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          if (typeof log === 'undefined') {
            console.log(value)
          }
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })

        assert.strictEqual(events[0].address, 'Smart Wallet')
        assert.strictEqual(events[0].eventName, 'NewUserSigningKey')
        assert.strictEqual(events[0].returnValues.userSigningKey, address)

        assert.strictEqual(events[1].address, 'DAI')
        assert.strictEqual(events[1].eventName, 'Approval')
        assert.strictEqual(events[1].returnValues.value, constants.FULL_APPROVAL)

        assert.strictEqual(events[2].address, 'CDAI')
        assert.strictEqual(events[2].eventName, 'AccrueInterest')

        assert.strictEqual(events[3].address, 'DAI')
        assert.strictEqual(events[3].eventName, 'Transfer')
        assert.strictEqual(events[3].returnValues.value, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[4].address, 'CDAI')
        assert.strictEqual(events[4].eventName, 'Mint')
        assert.strictEqual(events[4].returnValues.mintTokens, web3.utils.toWei('100', 'ether'))  

        assert.strictEqual(events[5].address, 'CDAI')
        assert.strictEqual(events[5].eventName, 'Transfer')

        assert.strictEqual(events[6].address, 'USDC')
        assert.strictEqual(events[6].eventName, 'Approval')
        assert.strictEqual(events[6].returnValues.value, constants.FULL_APPROVAL)

        assert.strictEqual(events[7].address, 'CUSDC')
        assert.strictEqual(events[7].eventName, 'AccrueInterest')

        assert.strictEqual(events[8].address, 'USDC')
        assert.strictEqual(events[8].eventName, 'Transfer')
        assert.strictEqual(events[8].returnValues.value, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[9].address, 'CUSDC')
        assert.strictEqual(events[9].eventName, 'Mint')
        assert.strictEqual(events[9].returnValues.mintTokens, web3.utils.toWei('100', 'lovelace')) 

        assert.strictEqual(events[10].address, 'CUSDC')
        assert.strictEqual(events[10].eventName, 'Transfer')     
      }
    }
  )

  const UserSmartWallet = new web3.eth.Contract(
    DharmaSmartWalletImplementationV0Artifact.abi,
    targetWalletAddress
  )

  const UserSmartWalletV3 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV3Artifact.abi,
    targetWalletAddress
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 gets a new smart wallet address with same key',
    DharmaSmartWalletFactoryV1,
    'getNextSmartWallet',
    'call',
    [address],
    true,
    value => {
      // TODO: verify against expected value
      assert.ok(targetWalletAddress !== value)
    }
  )

  await web3.eth.sendTransaction({
    from: constants.ETH_WHALE_ADDRESS,
    to: targetWalletAddress,
    value: web3.utils.toWei('100', 'ether'),
    gas: (testingContext !== 'coverage') ? '0xffff' : gasLimit - 1,
    gasPrice: 1
  }).catch(error => {
    console.log(' ✓ Eth Whale can no longer deposit eth into the deployed smart wallet')
  })

  await runTest(
    'Dai Whale can deposit dai into the deployed smart wallet',
    DAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.DAI_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'ether')
        )
      }
    },
    constants.DAI_WHALE_ADDRESS
  )

  await runTest(
    'USDC Whale can deposit usdc into the deployed smart wallet',
    USDC,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'lovelace')], // six decimals
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.USDC_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'lovelace')
        )
      }
    },
    constants.USDC_WHALE_ADDRESS
  )

  await runTest(
    'new user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWallet,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })
     
        assert.strictEqual(events[0].address, 'CDAI')
        assert.strictEqual(events[0].eventName, 'AccrueInterest')

        assert.strictEqual(events[1].address, 'DAI')
        assert.strictEqual(events[1].eventName, 'Transfer')
        assert.strictEqual(events[1].returnValues.value, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[2].address, 'CDAI')
        assert.strictEqual(events[2].eventName, 'Mint')
        assert.strictEqual(events[2].returnValues.mintTokens, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[3].address, 'CDAI')
        assert.strictEqual(events[3].eventName, 'Transfer')

        assert.strictEqual(events[4].address, 'CUSDC')
        assert.strictEqual(events[4].eventName, 'AccrueInterest')

        assert.strictEqual(events[5].address, 'USDC')
        assert.strictEqual(events[5].eventName, 'Transfer')
        assert.strictEqual(events[5].returnValues.value, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[6].address, 'CUSDC')
        assert.strictEqual(events[6].eventName, 'Mint')
        assert.strictEqual(events[6].returnValues.mintTokens, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[7].address, 'CUSDC')
        assert.strictEqual(events[7].eventName, 'Transfer')
      }
    }
  )

  await runTest(
    'new user smart wallet can trigger repayAndDeposit even with no funds',
    UserSmartWallet,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )        
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })
     
        assert.strictEqual(events.length, 0)
      }
    }
  )

  await runTest(
    'test passes',
    UserSmartWallet,
    'test',
    'call',
    [],
    true,
    value => {
      assert.ok(value)
    }
  )

  // TODO: wrap in a contract to validate revert reason
  await runTest(
    'revert test with revert reason passes',
    UserSmartWallet,
    'testRevert',
    'call',
    [],
    false // set this to true to verify that the revert reason is displayed
  )

  await runTest(
    'new user smart wallet can be called and has the correct dharma key set',
    UserSmartWallet,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'UserSmartWallet can get the version (0)',
    UserSmartWallet,
    'getVersion',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    'UserSmartWallet nonce is initially set to 0',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    'UserSmartWallet can get balances',
    UserSmartWallet,
    'getBalances',
    'call',
    [],
    true,
    value => {
      //console.log(value)
    }
  )

  await runTest(
    'UserSmartWallet secondary can call to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1000000000000000000',
      address,
      0,
      '0x',
      '0x'
    ],
    true,
    receipt => {
      // TODO: verify logs
      if (testingContext !== 'coverage') {
        //console.log(receipt.events)
      }
      //console.log(receipt.events.ExternalError.returnValues)
      //console.log(receipt.events.ExternalError)
      /*
      console.log(Object.values(receipt.events).map(value => {
        return (
          value.raw
        )
      }))
      */
    }
  )

  await runTest(
    'UserSmartWallet nonce is now set to 1',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  await runTest(
    'UserSmartWallet secondary can call to withdraw usdc',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      1,
      address,
      0,
      '0x',
      '0x'
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    }
  )

  await runTest(
    'UserSmartWallet nonce is now set to 2',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '2')
    }
  )

  await runTest(
    'UserSmartWallet secondary can call to cancel',
    UserSmartWallet,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await runTest(
    'UserSmartWallet nonce is now set to 3',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  await runTest(
    'UserSmartWallet secondary can call to set userSigningKey',
    UserSmartWallet,
    'setUserSigningKey',
    'send',
    [
      address,
      0,
      '0x',
      '0x'
    ]
  )

  await runTest(
    'UserSmartWallet nonce is now set to 4',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '4')
    }
  )

  let customActionId
  await runTest(
    'UserSmartWallet can get next custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DAIWithdrawal,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await runTest(
    'UserSmartWallet can get custom action ID 4 and it matches next action ID',
    UserSmartWallet,
    'getCustomActionID',
    'call',
    [
      4, // DAIWithdrawal,
      constants.FULL_APPROVAL,
      address,
      4,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  await runTest(
    'UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  await runTest(
    'UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      '0x',
      '0xffffffff' + usdcWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'UserSmartWallet relay can call with signature to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      '0x',
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    originalAddress
  )

  /* TODO: get this working manually
  const withdrawalMessage = (
    UserSmartWallet.options.address +  // smart wallet address
    constants.NULL_BYTES_32.slice(2) + // smart wallet version
    address.slice(2) +                 // user dharma key
    address.slice(2) +                 // dharma key registry key
    '5'.padStart(64, '0') +            // nonce
    constants.NULL_BYTES_32.slice(2) + // minimum gas
    '04' +                             // action type
    'f'.padStart(64, 'f') +            // amount
    address.slice(2)                   // recipient
  )

  const daiWithdrawalSignature = signHashedPrefixedHashedHexString(
    withdrawalMessage,
    address
  )
  */

  await runTest(
    'UserSmartWallet cannot withdraw too much dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '100000000000000000000000000000000000000',
      address,
      0,
      '0x',
      '0x'
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        //console.log(receipt.events)
      }
      // TODO: verify logs
      //console.log(receipt.events.ExternalError.returnValues)
      //console.log(receipt.events.ExternalError)
      /*
      console.log(Object.values(receipt.events).map(value => {
        return (
          value.raw
        )
      }))
      */
    }
  )

  await runTest(
    'UserSmartWallet cannot withdraw too much usdc',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      '100000000000000000000000000000000',
      address,
      0,
      '0x',
      '0x'
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        //console.log(receipt.events)
      }
      // TODO: verify logs
      //console.log(receipt.events.ExternalError.returnValues)
      //console.log(receipt.events.ExternalError)
      /*
      console.log(Object.values(receipt.events).map(value => {
        return (
          value.raw
        )
      }))
      */
    }
  )

  await runTest(
    'UserSmartWallet cannot withdraw too little dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1',
      address,
      0,
      '0x',
      '0x'
    ],
    true,
    receipt => {
      //console.log(receipt.events.ExternalError)
      // TODO: verify logs
      //console.log(receipt.events.ExternalError.returnValues)
      //console.log(receipt.events.ExternalError)
      /*
      console.log(Object.values(receipt.events).map(value => {
        return (
          value.raw
        )
      }))
      */
    }
  )

  await runTest(
    'UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let daiWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  await runTest(
    'UserSmartWallet relay cannot call with bad signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      '0x',
      '0xffffffff' + daiWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      '0x',
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'UserSmartWallet calls revert if insufficient action gas is supplied',
    UserSmartWallet,
    'cancel',
    'send',
    [
      constants.FULL_APPROVAL,
     '0x'
    ],
    false
  )

  await runTest(
    'UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWallet,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await runTest(
    'UserSmartWallet calls to atomic methods revert',
    UserSmartWallet,
    '_withdrawDaiAtomic',
    'send',
    [
      '1',
     address
    ],
    false
  )

  let originalNonce
  await runTest(
    'UserSmartWallet can get the nonce prior to upgrade',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      originalNonce = value
    }
  )

  await runTest(
    'Dharma Upgrade Beacon Controller can upgrade to V1 implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV1.options.address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.upgradeBeacon,
          DharmaUpgradeBeacon.options.address
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementation,
          DharmaSmartWalletImplementationV0.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          constants.EMPTY_HASH
        )
        */
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          DharmaSmartWalletImplementationV1.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          ...
        )
        */
      }
    }
  )

  const UpgradeBeaconImplementationCheckV1 = await runTest(
    `UpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV1.options.address
    ]
  )

  await runTest(
    'DharmaUpgradeBeacon has the implementation set',
    DharmaUpgradeBeaconController,
    'getImplementation',
    'call',
    [DharmaUpgradeBeacon.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaSmartWalletImplementationV1.options.address)
    }
  )

  await runTest(
    'Dharma Upgrade Beacon Controller can upgrade to V2 implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV2.options.address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.upgradeBeacon,
          DharmaUpgradeBeacon.options.address
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementation,
          DharmaSmartWalletImplementationV1.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          constants.EMPTY_HASH
        )
        */
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          DharmaSmartWalletImplementationV2.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          ...
        )
        */
      }
    }
  )

  const UpgradeBeaconImplementationCheckV2 = await runTest(
    `UpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV2.options.address
    ]
  )

  await runTest(
    'DharmaUpgradeBeacon has the implementation set',
    DharmaUpgradeBeaconController,
    'getImplementation',
    'call',
    [DharmaUpgradeBeacon.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaSmartWalletImplementationV2.options.address)
    }
  )

  await runTest(
    'V2 user smart wallet can be called and still has original dharma key set',
    UserSmartWallet,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'V2 UserSmartWallet can get the new version (2)',
    UserSmartWallet,
    'getVersion',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '2')
    }
  )

  await runTest(
    'Dharma Upgrade Beacon Controller can upgrade to V3 implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV3.options.address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.upgradeBeacon,
          DharmaUpgradeBeacon.options.address
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementation,
          DharmaSmartWalletImplementationV2.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          constants.EMPTY_HASH
        )
        */
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          DharmaSmartWalletImplementationV3.options.address
        )
        /* TODO
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          ...
        )
        */
      }
    }
  )

  await runTest(
    'DharmaUpgradeBeacon has the implementation set',
    DharmaUpgradeBeaconController,
    'getImplementation',
    'call',
    [DharmaUpgradeBeacon.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaSmartWalletImplementationV3.options.address)
    }
  )

  const UpgradeBeaconImplementationCheckV3 = await runTest(
    `UpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV3.options.address
    ]
  )

  await runTest(
    'V3 user smart wallet can be called and still has original dharma key set',
    UserSmartWallet,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'V3 UserSmartWallet can get the new version (3)',
    UserSmartWallet,
    'getVersion',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  await runTest(
    'V3 UserSmartWallet nonce is still set to value from before upgrade',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, originalNonce)
    }
  )

  await runTest(
    'V3 UserSmartWallet can get balances',
    UserSmartWallet,
    'getBalances',
    'call',
    [],
    true,
    value => {
      //console.log(value)
    }
  )

  await runTest(
    'V3 UserSmartWallet secondary can call to cancel',
    UserSmartWallet,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await runTest(
    'V3 UserSmartWallet nonce is now set to original + 1',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, (parseInt(originalNonce) + 1).toString())
    }
  )

  await runTest(
    'V3 UserSmartWallet can get next custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DAIWithdrawal,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await runTest(
    'V3 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWallet,
    'getCustomActionID',
    'call',
    [
      4, // DAIWithdrawal,
      constants.FULL_APPROVAL,
      address,
      parseInt(originalNonce) + 1,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  let genericActionID
  await runTest(
    'V3 UserSmartWallet can get next generic action ID',
    UserSmartWalletV3,
    'getNextGenericActionID',
    'call',
    [
      address,
      '0x',
      0
    ],
    true,
    value => {
      genericActionID = value
    }
  )

  await runTest(
    'V3 UserSmartWallet can get generic action ID and it matches next action ID',
    UserSmartWalletV3,
    'getGenericActionID',
    'call',
    [
      address,
      '0x',
      parseInt(originalNonce) + 1,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, genericActionID)
    }
  )

  await runTest(
    'Dai Whale can deposit dai into the V3 smart wallet',
    DAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.DAI_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'ether')
        )
      }
    },
    constants.DAI_WHALE_ADDRESS
  )

  await runTest(
    'USDC Whale can deposit usdc into the V3 smart wallet',
    USDC,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'lovelace')], // six decimals
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.USDC_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'lovelace')
        )
      }
    },
    constants.USDC_WHALE_ADDRESS
  )

  await runTest(
    'V3 user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWallet,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )        
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })
     
        assert.strictEqual(events[0].address, 'CDAI')
        assert.strictEqual(events[0].eventName, 'AccrueInterest')

        assert.strictEqual(events[1].address, 'DAI')
        assert.strictEqual(events[1].eventName, 'Transfer')
        //assert.strictEqual(events[1].returnValues.value, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[2].address, 'CDAI')
        assert.strictEqual(events[2].eventName, 'Mint')
        //assert.strictEqual(events[2].returnValues.mintTokens, web3.utils.toWei('100', 'ether'))


        assert.strictEqual(events[3].address, 'CDAI')
        assert.strictEqual(events[3].eventName, 'Transfer')

        assert.strictEqual(events[4].address, 'CUSDC')
        assert.strictEqual(events[4].eventName, 'AccrueInterest')

        assert.strictEqual(events[5].address, 'USDC')
        assert.strictEqual(events[5].eventName, 'Transfer')
        //assert.strictEqual(events[5].returnValues.value, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[6].address, 'CUSDC')
        assert.strictEqual(events[6].eventName, 'Mint')
        //assert.strictEqual(events[6].returnValues.mintTokens, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[7].address, 'CUSDC')
        assert.strictEqual(events[7].eventName, 'Transfer')
      }
    }
  )

  await runTest(
    'Dai Whale can deposit dai into the V3 smart wallet again',
    DAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.DAI_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'ether')
        )
      }
    },
    constants.DAI_WHALE_ADDRESS
  )

  await runTest(
    'V3 UserSmartWallet can get a generic action ID',
    UserSmartWalletV3,
    'getNextGenericActionID',
    'call',
    [
      DAI.options.address,
      DAI.methods.approve(CDAI.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  let executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet can call executeAction',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      DAI.options.address,
      DAI.methods.approve(CDAI.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await runTest(
    'V3 user smart wallet repayAndDeposit cannot deposit without approval',
    UserSmartWalletV3,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )        
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })
     
        // TODO: verify
      }
    }
  )

  await runTest(
    'V3 UserSmartWallet can get a generic action ID',
    UserSmartWalletV3,
    'getNextGenericActionID',
    'call',
    [
      DAI.options.address,
      DAI.methods.approve(CDAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet can call executeAction',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      DAI.options.address,
      DAI.methods.approve(CDAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await runTest(
    'V3 user smart wallet repayAndDeposit can deposit with approval added back',
    UserSmartWallet,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )        
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })
     
        // TODO: verify
      }
    }
  )

  await runTest(
    'V3 user smart wallet can trigger repayAndDeposit even with no funds',
    UserSmartWallet,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )        
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })
     
        assert.strictEqual(events.length, 0)
      }
    }
  )

  await runTest(
    'V3 UserSmartWallet secondary cannot set an empty user userSigningKey',
    UserSmartWallet,
    'setUserSigningKey',
    'send',
    [
      constants.NULL_ADDRESS,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet secondary can set a custom user userSigningKey',
    UserSmartWallet,
    'setUserSigningKey',
    'send',
    [
      addressTwo,
      0,
      '0x',
      '0x'
    ]
  )

  await runTest(
    'V3 UserSmartWallet secondary cannot call to withdraw dai without primary',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1000000000000000000',
      address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet secondary cannot call to withdraw usdc without primary',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      1,
      address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet secondary can no longer call to set userSigningKey without primary',
    UserSmartWallet,
    'setUserSigningKey',
    'send',
    [
      address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000',
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  let usdcUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      '100000',
      address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  usdcUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      usdcUserWithdrawalSignature,
      '0xffffffff' + usdcWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet cannot call with bad user signature to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      '0xffffffff' + usdcUserWithdrawalSignature.slice(10),
      usdcWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  /* TODO: get this working manually
  const withdrawalMessage = (
    UserSmartWallet.options.address +  // smart wallet address
    constants.NULL_BYTES_32.slice(2) + // smart wallet version
    address.slice(2) +                 // user dharma key
    address.slice(2) +                 // dharma key registry key
    '5'.padStart(64, '0') +            // nonce
    constants.NULL_BYTES_32.slice(2) + // minimum gas
    '04' +                             // action type
    'f'.padStart(64, 'f') +            // amount
    address.slice(2)                   // recipient
  )

  const daiWithdrawalSignature = signHashedPrefixedHashedHexString(
    withdrawalMessage,
    address
  )
  */

  await runTest(
    'V3 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      '1',
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  let daiUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay cannot withdraw too little dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1',
      address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      '1000000000000000',
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  daiUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  daiUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay cannot call with bad signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      daiUserWithdrawalSignature,
      '0xffffffff' + daiWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet relay cannot call with bad user signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      '0xffffffff' + daiUserWithdrawalSignature.slice(10),
      daiWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV3,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let ethWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  let ethUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV3,
    'withdrawEther',
    'send',
    [
      '1',
      address,
      0,
      ethUserWithdrawalSignature,
      '0xffffffff' + ethWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV3,
    'withdrawEther',
    'send',
    [
      '1',
      address,
      0,
      '0xffffffff' + ethUserWithdrawalSignature.slice(10),
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV3,
    'withdrawEther',
    'send',
    [
      '1',
      address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet cancel reverts with bad signature',
    UserSmartWallet,
    'cancel',
    'send',
    [
      0,
     '0x'
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet calls revert if insufficient action gas is supplied',
    UserSmartWallet,
    'cancel',
    'send',
    [
      constants.FULL_APPROVAL,
     '0x'
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWallet,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await runTest(
    'V3 UserSmartWallet can get a cancel custom action ID',
    UserSmartWalletV3,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel,
      '0',
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let cancelSignature = signHashedPrefixedHexString(customActionId, addressTwo)

  await runTest(
    'V3 UserSmartWallet can cancel using a signature',
    UserSmartWallet,
    'cancel',
    'send',
    [
      '0',
      cancelSignature
    ],
    true,
    receipt => {},
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet calls to atomic methods revert',
    UserSmartWallet,
    '_withdrawDaiAtomic',
    'send',
    [
      '1',
     address
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet calls to recover from random address revert',
    UserSmartWalletV3,
    'recover',
    'send',
    [
     address
    ],
    false
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V3 smart wallet using a Dharma Key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [addressTwo],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )        
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })

        assert.strictEqual(events[0].eventName, 'NewUserSigningKey')
        assert.strictEqual(events[0].returnValues.userSigningKey, addressTwo)
        //console.log(events)

        // TODO: test more events
      }
    }
  )

  await runTest(
    'V3 UserSmartWallet can get a generic action ID',
    UserSmartWalletV3,
    'getNextGenericActionID',
    'call',
    [
      USDC.options.address,
      USDC.methods.approve(CUSDC.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet cannot call executeAction and target a non-contract',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      address,
      USDC.methods.approve(CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet cannot call executeAction and target itself',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      UserSmartWalletV3.options.address,
      USDC.methods.approve(CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await runTest(
    'V3 UserSmartWallet can call executeAction',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      USDC.options.address,
      USDC.methods.approve(CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await runTest(
    'V3 UserSmartWallet can get the next generic batch action ID',
    UserSmartWalletV3,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{to: DAI.options.address, data: DAI.methods.totalSupply().encodeABI()}],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let currentNonce
  await runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV3,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await runTest(
    'V3 UserSmartWallet generic batch action ID with nonce matches next ID',
    UserSmartWalletV3,
    'getGenericAtomicBatchActionID',
    'call',
    [
      [{to: DAI.options.address, data: DAI.methods.totalSupply().encodeABI()}],
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet can call executeActionWithAtomicBatchCalls',
    UserSmartWalletV3,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{to: DAI.options.address, data: DAI.methods.totalSupply().encodeABI()}],
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await runTest(
    'USDC Whale can deposit usdc into the deployed smart wallet',
    USDC,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'lovelace')], // six decimals
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.USDC_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'lovelace')
        )
      }
    },
    constants.USDC_WHALE_ADDRESS
  )

  await runTest(
    'new user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV3,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      //console.log(receipt.status, receipt.gasUsed)
      if (testingContext !== 'coverage') {
        let events = []
        Object.values(receipt.events).forEach((value) => {
          const log = constants.EVENT_DETAILS[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(
            log.abi, value.raw.data, value.raw.topics
          )
          events.push({
            address: contractNames[value.address],
            eventName: log.name,
            returnValues: decoded
          })
        })
        assert.strictEqual(events[0].address, 'USDC')
        assert.strictEqual(events[0].eventName, 'Approval')
        assert.strictEqual(events[0].returnValues.value, constants.FULL_APPROVAL)

        assert.strictEqual(events[1].address, 'CUSDC')
        assert.strictEqual(events[1].eventName, 'AccrueInterest')

        assert.strictEqual(events[2].address, 'USDC')
        assert.strictEqual(events[2].eventName, 'Transfer')
        assert.strictEqual(events[2].returnValues.value, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[3].address, 'CUSDC')
        assert.strictEqual(events[3].eventName, 'Mint')
        assert.strictEqual(events[3].returnValues.mintTokens, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[4].address, 'CUSDC')
        assert.strictEqual(events[4].eventName, 'Transfer')
      }
    }
  )

  const FIAT_TOKEN = new web3.eth.Contract(
    [
      {
        "constant": true, "inputs": [], "name": "blacklister",
        "outputs": [{"name": "", "type": "address"}], "payable": false,
        "stateMutability": "view", "type": "function"
      }, {
        "constant": false, "inputs": [{"name": "_account", "type": "address"}],
        "name": "unBlacklist", "outputs": [], "payable": false,
        "stateMutability": "nonpayable", "type": "function"
      }, {
        "constant": false, "inputs": [{"name": "_account", "type": "address"}],
        "name": "blacklist", "outputs": [], "payable": false,
        "stateMutability": "nonpayable", "type": "function"
      }, {
        "constant": true, "inputs": [{"name": "_account", "type": "address"}],
        "name": "isBlacklisted", "outputs": [{"name": "", "type": "bool"}],
        "payable": false, "stateMutability": "view", "type": "function"
      }, {
        "constant": false, "inputs": [],
        "name": "pause", "outputs": [], "payable": false,
        "stateMutability": "nonpayable", "type": "function"
      }, {
        "constant": false, "inputs": [],
        "name": "unpause", "outputs": [], "payable": false,
        "stateMutability": "nonpayable", "type": "function"
      }, {
        "constant": true, "inputs": [], "name": "pauser",
        "outputs": [{"name": "", "type": "address"}], "payable": false,
        "stateMutability": "view", "type": "function"
      }
    ],
    constants.USDC_MAINNET_ADDRESS
  )

  let blacklister
  await runTest(
    'Check blacklister address',
    FIAT_TOKEN,
    'blacklister',
    'call',
    [],
    true,
    value => {
      blacklister = value
    }
  )

  let pausear
  await runTest(
    'Check pauser address',
    FIAT_TOKEN,
    'pauser',
    'call',
    [],
    true,
    value => {
      pauser = value
    }
  )

  await runTest(
    'blacklist mock address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [constants.MOCK_USDC_BLACKLISTED_ADDRESS],
    true,
    receipt => {},
    blacklister
  )

  let targetBlacklistAddress;
  await runTest(
    'DharmaSmartWalletFactoryV1 can get a new smart wallet address ahead of time',
    DharmaSmartWalletFactoryV1,
    'getNextSmartWallet',
    'call',
    [constants.MOCK_USDC_BLACKLISTED_ADDRESS],
    true,
    value => {
      targetBlacklistAddress = value
    }
  )

  const BlacklistedUserSmartWalletV3 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV3Artifact.abi,
    targetBlacklistAddress
  )

  await runTest(
    'USDC Whale can deposit usdc into the yet-to-be-blacklisted smart wallet',
    USDC,
    'transfer',
    'send',
    [targetBlacklistAddress, web3.utils.toWei('100', 'lovelace')], // six decimals
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.USDC_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetBlacklistAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'lovelace')
        )
      }
    },
    constants.USDC_WHALE_ADDRESS
  )

  await runTest(
    'blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 can deploy to a blacklisted address',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [constants.MOCK_USDC_BLACKLISTED_ADDRESS],
    true,
    receipt => {
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await runTest(
    'blacklisted smart wallet will not approve USDC during repayAndDeposit',
    BlacklistedUserSmartWalletV3,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await runTest(
    'un-blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'unBlacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await runTest(
    'pause USDC',
    FIAT_TOKEN,
    'pause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await runTest(
    'smart wallet will not approve USDC when paused during repayAndDeposit',
    BlacklistedUserSmartWalletV3,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await runTest(
    'unpause USDC',
    FIAT_TOKEN,
    'unpause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await runTest(
    'unblacklisted, unpaused smart wallet approves USDC during repayAndDeposit',
    BlacklistedUserSmartWalletV3,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await runTest(
    'V3 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      web3.utils.toWei('50', 'lovelace'),
      constants.MOCK_USDC_BLACKLISTED_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  usdcUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay call to withdraw USDC to blacklisted address',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      web3.utils.toWei('50', 'lovelace'),
      constants.MOCK_USDC_BLACKLISTED_ADDRESS,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events[0])
      //console.log(receipt.events.ExternalError)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      UserSmartWallet.options.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  usdcUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay call to withdraw USDC to itself',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      UserSmartWallet.options.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      constants.MOCK_USDC_BLACKLISTED_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  usdcUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay call to withdraw USDC to blacklisted address',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      constants.MOCK_USDC_BLACKLISTED_ADDRESS,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events[0])
      //console.log(receipt.events.ExternalError)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV3,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      targetWalletAddress,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  ethUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay cannot withdraw eth to a non-payable account',
    UserSmartWalletV3,
    'withdrawEther',
    'send',
    [
      '1',
      targetWalletAddress,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  let targetWalletAddressTwo;
  await runTest(
    'DharmaSmartWalletFactoryV1 can get a new smart wallet address ahead of time',
    DharmaSmartWalletFactoryV1,
    'getNextSmartWallet',
    'call',
    [targetWalletAddress],
    true,
    value => {
      // TODO: verify against expected value
      targetWalletAddressTwo = value
    }
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V3 smart wallet using a contract key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [targetWalletAddress]
  )

  const UserSmartWalletV3Two = new web3.eth.Contract(
    DharmaSmartWalletImplementationV3Artifact.abi,
    targetWalletAddressTwo
  )

  await runTest(
    'V3 UserSmartWallet cancel reverts with bad contract signature',
    UserSmartWalletV3Two,
    'cancel',
    'send',
    [
      0,
     '0x'
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a generic action ID',
    UserSmartWalletV3,
    'getNextGenericActionID',
    'call',
    [
      DAI.options.address,
      DAI.methods.transfer(address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet can call executeAction',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      DAI.options.address,
      DAI.methods.transfer(address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await runTest(
    'V3 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      '100000000000000000000000000000000000000', // too much
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  daiUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay cannot withdraw too much dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000000000000000000000000000000000000', // too much
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  usdcUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )


  await runTest(
    'V3 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get next generic batch action ID',
    UserSmartWalletV3,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{
        to: DAI.options.address,
        data: DAI.methods.transfer(
          address, '100000000000000000000000000000'
        ).encodeABI()
      }],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet bad executeActionWithAtomicBatchCalls emits CallFailure',
    UserSmartWalletV3,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{
        to: DAI.options.address,
        data: DAI.methods.transfer(
          address, '100000000000000000000000000000'
        ).encodeABI()
      }],
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    true,
    receipt => {
      //console.log(receipt)
    }
  )

  await runTest(
    'V3 UserSmartWallet can get a generic action ID',
    UserSmartWalletV3,
    'getNextGenericActionID',
    'call',
    [
      Comptroller.options.address,
      Comptroller.methods.enterMarkets(
        [constants.CDAI_MAINNET_ADDRESS]
      ).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet can call executeAction to enter dai market',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      Comptroller.options.address,
      Comptroller.methods.enterMarkets(
        [constants.CDAI_MAINNET_ADDRESS]
      ).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await runTest(
    'Dai Whale can deposit dai into the smart wallet',
    DAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.DAI_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          targetWalletAddress
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('100', 'ether')
        )
      }
    },
    constants.DAI_WHALE_ADDRESS
  )

  await runTest(
    'new user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWallet,
    'repayAndDeposit'
  )

  await runTest(
    'V3 UserSmartWallet can get a generic action ID',
    UserSmartWalletV3,
    'getNextGenericActionID',
    'call',
    [
      CDAI_BORROW.options.address,
      CDAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet can call executeAction to perform a borrow',
    UserSmartWalletV3,
    'executeAction',
    'send',
    [
      CDAI_BORROW.options.address,
      CDAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    true,
    receipt => {
      //console.log(receipt.events)
    },
    originalAddress
  )

  await runTest(
    'V3 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV3,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  daiUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V3 UserSmartWallet relay cannot withdraw max dai with an outstanding borrow',
    UserSmartWalletV3,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    originalAddress
  )

  // Initiate account recovery
  await runTest(
    'smart wallet account recovery can be initiated',
    DharmaAccountRecoveryManager,
    'initiateAccountRecovery',
    'send',
    [
      UserSmartWalletV3.options.address,
      originalAddress,
      0 // extraTime in seconds
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await runTest(
    'smart wallet account recovery cannot be performed right away',
    DharmaAccountRecoveryManager,
    'recover',
    'send',
    [
      UserSmartWalletV3.options.address,
      originalAddress
    ],
    false
  )

  // advance time by 7 days
  await advanceTime((60 * 60 * 24 * 7) + 5)

  // recover account
  await runTest(
    'smart wallet account recovery can be performed after seven days',
    DharmaAccountRecoveryManager,
    'recover',
    'send',
    [
      UserSmartWalletV3.options.address,
      originalAddress
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  // COVERAGE TESTING - deployments
  const DharmaUpgradeBeaconControllerManager = await runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment`,
    DharmaUpgradeBeaconControllerManagerDeployer,
    '',
    'deploy'
  )

  const DharmaUpgradeBeaconControllerCoverage = await runTest(
    `DharmaUpgradeBeaconController contract deployment`,
    DharmaUpgradeBeaconControllerDeployer,
    '',
    'deploy'
  )

  const DharmaAccountRecoveryManagerCoverage = await runTest(
    `DharmaAccountRecoveryManager contract deployment`,
    DharmaAccountRecoveryManagerDeployer,
    '',
    'deploy'
  )

  const DharmaKeyRegistryV2Coverage = await runTest(
    `DharmaKeyRegistryV2 contract deployment`,
    DharmaKeyRegistryV2Deployer,
    '',
    'deploy'
  )

  const DharmaUpgradeBeaconCoverage = await runTest(
    `DharmaUpgradeBeacon (smart wallet) contract deployment`,
    DharmaUpgradeBeaconDeployer,
    '',
    'deploy'
  )

  const DharmaKeyRingUpgradeBeaconCoverage = await runTest(
    `DharmaKeyRingUpgradeBeacon contract deployment`,
    DharmaKeyRingUpgradeBeaconDeployer,
    '',
    'deploy'
  )

  const DharmaUpgradeBeaconEnvoy = await runTest(
    `DharmaUpgradeBeaconEnvoy contract deployment`,
    DharmaUpgradeBeaconEnvoyDeployer,
    '',
    'deploy'
  )

  const AdharmaSmartWalletImplementation = await runTest(
    `AdharmaSmartWalletImplementation contract deployment`,
    AdharmaSmartWalletImplementationDeployer,
    '',
    'deploy'
  )

  const AdharmaKeyRingImplementation = await runTest(
    `AdharmaKeyRingImplementation contract deployment`,
    AdharmaKeyRingImplementationDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletFactoryV1Coverage = await runTest(
    `DharmaSmartWalletFactoryV1 contract deployment`,
    DharmaSmartWalletFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  const DharmaKeyRingFactoryV1 = await runTest(
    `DharmaKeyRingFactoryV1 contract deployment`,
    DharmaKeyRingFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  const DharmaKeyRingFactoryV2 = await runTest(
    `DharmaKeyRingFactoryV2 contract deployment`,
    DharmaKeyRingFactoryV2Deployer,
    '',
    'deploy',
    []
  )

  await runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring with no key`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring and set a new null key`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndAdditionalKey',
    'send',
    [address, constants.NULL_ADDRESS, '0x'],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring and set a duplicate key`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndAdditionalKey',
    'send',
    [address, address, '0x'],
    false
  )

  let nextKeyRing;
  await runTest(
    `DharmaKeyRingFactoryV1 can get the address of the next key ring`,
    DharmaKeyRingFactoryV1,
    'getNextKeyRing',
    'call',
    [address],
    true,
    value => {
      nextKeyRing = value;
    }
  )

  await runTest(
    `DharmaKeyRingFactoryV1 can create a V1 key ring`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [address]
  )

  const KeyRingInstance = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi,
    nextKeyRing
  )

  await runTest(
    `DharmaKeyRingFactoryV1 gets new key ring after a deploy with same input`,
    DharmaKeyRingFactoryV1,
    'getNextKeyRing',
    'call',
    [address],
    true,
    value => {
      assert.ok(nextKeyRing !== value)
    }
  )

  await runTest(
    `KeyRingInstance can get the version of the key ring`,
    KeyRingInstance,
    'getVersion',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  await runTest(
    `KeyRingInstance can get the nonce of the key ring`,
    KeyRingInstance,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    `KeyRingInstance can get the key count of the key ring`,
    KeyRingInstance,
    'getKeyCount',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value.adminKeyCount, '1')
      assert.strictEqual(value.standardKeyCount, '1')
    }
  )

  await runTest(
    `KeyRingInstance can does not verify a bad signature`,
    KeyRingInstance,
    'isValidSignature',
    'call',
    [
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint8', 'bytes'],
        [constants.NULL_BYTES_32, 1, '0x']
      ),
      '0x'
    ],
    false
  )

  let adminActionID
  await runTest(
    `KeyRingInstance can get an adminActionID using getNextAdminActionID`,
    KeyRingInstance,
    'getNextAdminActionID',
    'call',
    [1, 1],
    true,
    value => {
      adminActionID = value
    }
  )

  await runTest(
    `KeyRingInstance getAdminActionID matches getNextAdminActionID`,
    KeyRingInstance,
    'getAdminActionID',
    'call',
    [1, 1, 0],
    true,
    value => {
      assert.strictEqual(value, adminActionID)
    }
  )

  await runTest(
    `KeyRingInstance cannot add a non-dual key in V1`,
    KeyRingInstance,
    'takeAdminAction',
    'send',
    [1, 1, '0x'],
    false
  ) 

  await runTest(
    `KeyRingInstance cannot add key that already exists`,
    KeyRingInstance,
    'takeAdminAction',
    'send',
    [6, address, '0x'],
    false
  )

  const takeAdminActionSignature = signHashedPrefixedHexString(
    adminActionID,
    address
  )

  await runTest(
    `KeyRingInstance can verify a valid signature`,
    KeyRingInstance,
    'isValidSignature',
    'call',
    [
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint8', 'bytes'],
        [
          web3.utils.keccak256(
            // prefix => "\x19Ethereum Signed Message:\n32"
            "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
            adminActionID.slice(2),
            {encoding: "hex"}
          ), 1, '0x']
      ),
      takeAdminActionSignature
    ],
    true,
    value => {
      assert.strictEqual(value, '0x20c13b0b')
    }
  )

  await runTest(
    `KeyRingInstance can add a new key with a valid signature`,
    KeyRingInstance,
    'takeAdminAction',
    'send',
    [6, 1, takeAdminActionSignature],
    true
  )

  await runTest(
    `DharmaKeyRingFactoryV2 cannot create a V1 key ring with no key`,
    DharmaKeyRingFactoryV2,
    'newKeyRing',
    'send',
    [constants.NULL_ADDRESS, constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV2 cannot create a V1 key ring and set a new null key`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndAdditionalKey',
    'send',
    [address, constants.NULL_ADDRESS, constants.NULL_ADDRESS, '0x'],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV2 cannot create a V1 key ring and set a duplicate key`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndAdditionalKey',
    'send',
    [address, constants.NULL_ADDRESS, address, '0x'],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV2 can get the address of the next key ring`,
    DharmaKeyRingFactoryV2,
    'getNextKeyRing',
    'call',
    [address],
    true,
    value => {
      nextKeyRing = value;
    }
  )

  await runTest(
    `DharmaKeyRingFactoryV2 can create a V1 key ring if the target address matches`,
    DharmaKeyRingFactoryV2,
    'newKeyRing',
    'send',
    [address, nextKeyRing]
  )

  const KeyRingInstanceFromV2Factory = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi,
    nextKeyRing
  )

  await runTest(
    `DharmaKeyRingFactoryV2 won't deploy a V1 key ring if the target address has one`,
    DharmaKeyRingFactoryV2,
    'newKeyRing',
    'send',
    [address, KeyRingInstanceFromV2Factory.options.address]
  )

  await runTest(
    `DharmaKeyRingFactoryV2 gets new key ring after a deploy with same input`,
    DharmaKeyRingFactoryV2,
    'getNextKeyRing',
    'call',
    [address],
    true,
    value => {
      assert.ok(nextKeyRing !== value)
    }
  )

  await runTest(
    `AdharmaSmartWalletImplementation cannot be initialized directly post-deployment`,
    AdharmaSmartWalletImplementation,
    'initialize',
    'send',
    [address],
    false
  )

  await runTest(
    `AdharmaSmartWalletImplementation cannot be used to perform calls directly`,
    AdharmaSmartWalletImplementation,
    'performCall',
    'send',
    [address, 1, '0x'],
    false
  )

  await runTest(
    `AdharmaKeyRingImplementation cannot be initialized directly post-deployment`,
    AdharmaKeyRingImplementation,
    'initialize',
    'send',
    [1, 1, [address], [3]],
    false
  )

  await runTest(
    `AdharmaKeyRingImplementation cannot be used to take action directly`,
    AdharmaKeyRingImplementation,
    'takeAction',
    'send',
    [address, 1, '0x', '0x'],
    false
  )

  await runTest(
    `UpgradeBeaconProxyV1 contract deployment fails with no init data`,
    UpgradeBeaconProxyV1Deployer,
    '',
    'deploy',
    ['0x'],
    false
  )

  await runTest(
    `KeyRingUpgradeBeaconProxyV1 contract deployment fails with no init data`,
    KeyRingUpgradeBeaconProxyV1Deployer,
    '',
    'deploy',
    ['0x'],
    false
  )

  const UpgradeBeaconProxyV1 = await runTest(
    `UpgradeBeaconProxyV1 contract deployment (direct)`,
    UpgradeBeaconProxyV1Deployer,
    '',
    'deploy',
    [web3.eth.abi.encodeFunctionCall({
      name: 'initialize',
      type: 'function',
      inputs: [{
          type: 'address',
          name: 'userSigningKey'
      }]
    }, [address])]
  )

  const UpgradeBeaconProxyV1Implementation = new web3.eth.Contract(
    DharmaSmartWalletImplementationV3Artifact.abi,
    UpgradeBeaconProxyV1.options.address
  )

  await runTest(
    `UpgradeBeaconProxyV1 can retrieve its user signing key`,
    UpgradeBeaconProxyV1Implementation,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  const KeyRingUpgradeBeaconProxyV1 = await runTest(
    `KeyRingUpgradeBeaconProxyV1 contract deployment (direct)`,
    KeyRingUpgradeBeaconProxyV1Deployer,
    '',
    'deploy',
    [web3.eth.abi.encodeFunctionCall({
      name: 'initialize',
      type: 'function',
      inputs: [{
          type: 'uint128',
          name: 'adminThreshold'
      },{
          type: 'uint128',
          name: 'executorThreshold'
      },{
          type: 'address[]',
          name: 'keys'
      },{
          type: 'uint8[]',
          name: 'keyTypes'
      }]
    }, [1, 1, [address], [3]])]
  )

  const KeyRingUpgradeBeaconProxyV1Implementation = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi,
    KeyRingUpgradeBeaconProxyV1.options.address
  )

  await runTest(
    `KeyRingUpgradeBeaconProxyV1 can retrieve its user signing key`,
    KeyRingUpgradeBeaconProxyV1Implementation,
    'getKeyType',
    'call',
    [address],
    true,
    values => {
      assert.ok(values.standard)
      assert.ok(values.admin)
    }
  )

  // NOTE: these two either need to have the runtime requirement stripped out,
  // or to use coverage without instrumentation. Skip coverage for now, as they
  // are not yet in use.
  // (actually, they're not working yet, period... skip them for now)
  /*
  if (testingContext !== 'coverage') {
    const DharmaSmartWalletFactoryV2 = await runTest(
      `DharmaSmartWalletFactoryV2 contract deployment`,
      DharmaSmartWalletFactoryV2Deployer,
      '',
      'deploy',
      []
    )

    const DharmaKeyRingFactoryV3 = await runTest(
      `DharmaKeyRingFactoryV3 contract deployment`,
      DharmaKeyRingFactoryV3Deployer,
      '',
      'deploy',
      []
    )
  }
  */

  await runTest(
    'Dharma Key Registry V2 gets the initial global key correctly',
    DharmaKeyRegistryV2Coverage,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'Dharma Key Registry V2 attempt to get an unset specific key throws',
    DharmaKeyRegistryV2Coverage,
    'getSpecificKey',
    'call',
    [address],
    false
  )

  await runTest(
    'Dharma Key Registry V2 gets the global key when requesting unset key',
    DharmaKeyRegistryV2Coverage,
    'getKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'Dharma Key Registry V2 cannot set a new empty global key',
    DharmaKeyRegistryV2Coverage,
    'setGlobalKey',
    'send',
    [
      constants.NULL_ADDRESS,
      '0x'
    ],
    false,
    receipt => {},
    originalAddress
  )

  const messageCoverage = (
    DharmaKeyRegistryV2Coverage.options.address +
    addressTwo.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const newKeySignatureCoverage = signHashedPrefixedHashedHexString(messageCoverage, addressTwo)

  const badNewKeySignatureCoverage = signHashedPrefixedHashedHexString('0x12', addressTwo)

  await runTest(
    'Dharma Key Registry V2 cannot set a new global key unless called by owner',
    DharmaKeyRegistryV2Coverage,
    'setGlobalKey',
    'send',
    [
      addressTwo,
      newKeySignatureCoverage
    ],
    false,
    receipt => {},
    addressTwo
  )

  await runTest(
    'Dharma Key Registry V2 cannot set an empty global key',
    DharmaKeyRegistryV2Coverage,
    'setGlobalKey',
    'send',
    [
      constants.NULL_ADDRESS,
      newKeySignatureCoverage
    ],
    false
  )

  await runTest(
    'Dharma Key Registry V2 cannot set a new global key with a bad signature',
    DharmaKeyRegistryV2Coverage,
    'setGlobalKey',
    'send',
    [
      addressTwo,
      badNewKeySignatureCoverage
    ],
    false
  )

  await runTest(
    'Dharma Key Registry V2 can set a new global key correctly',
    DharmaKeyRegistryV2Coverage,
    'setGlobalKey',
    'send',
    [
      addressTwo,
      newKeySignatureCoverage
    ]
  )

  await runTest(
    'Dharma Key Registry V2 gets the new global key correctly',
    DharmaKeyRegistryV2Coverage,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, addressTwo)
    }
  )

  await runTest(
    'Dharma Key Registry V2 cannot set a new specific key unless called by owner',
    DharmaKeyRegistryV2Coverage,
    'setSpecificKey',
    'send',
    [
      address,
      DharmaKeyRegistryV2.options.address
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'Dharma Key Registry V2 gets global key for a user if no specific key set',
    DharmaKeyRegistryV2Coverage,
    'getKeyForUser',
    'call',
    [address],
    true,
    value => {
      assert.strictEqual(value, addressTwo)
    }
  )

  await runTest(
    'Dharma Key Registry V2 can set a new specific key',
    DharmaKeyRegistryV2Coverage,
    'setSpecificKey',
    'send',
    [
      address,
      DharmaKeyRegistryV2.options.address
    ]
  )

  await runTest(
    'Dharma Key Registry V2 gets specific key for user if one is set',
    DharmaKeyRegistryV2Coverage,
    'getKeyForUser',
    'call',
    [address],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRegistryV2.options.address)
    }
  )

  await runTest(
    'Dharma Key Registry V2 gets the new specific key correctly',
    DharmaKeyRegistryV2Coverage,
    'getSpecificKey',
    'call',
    [address],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRegistryV2.options.address)
    }
  )

  await runTest(
    'Dharma Key Registry V2 gets the specific key when requesting set key',
    DharmaKeyRegistryV2Coverage,
    'getKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRegistryV2.options.address)
    }
  )

  await runTest(
    'Dharma Key Registry V2 cannot reuse a specific key',
    DharmaKeyRegistryV2Coverage,
    'setSpecificKey',
    'send',
    [
      address,
      DharmaKeyRegistryV2.options.address
    ],
    false
  )

  await runTest(
    'Dharma Key Registry V2 new owner cannot accept ownership before added',
    DharmaKeyRegistryV2Coverage,
    'acceptOwnership',
    'send',
    [],
    false
  )

  await runTest(
    'Dharma Key Registry V2 cannot prepare to transfer to the null address',
    DharmaKeyRegistryV2Coverage,
    'transferOwnership',
    'send',
    [
      constants.NULL_ADDRESS
    ],
    false
  )

  await runTest(
    'Dharma Key Registry V2 can prepare to transfer to a new owner',
    DharmaKeyRegistryV2Coverage,
    'transferOwnership',
    'send',
    [
      address
    ]
  )

  await runTest(
    'Dharma Key Registry V2 can cancel an ownership transfer',
    DharmaKeyRegistryV2Coverage,
    'cancelOwnershipTransfer'
  )

  await runTest(
    'Dharma Key Registry V2 new owner cannot accept ownership after cancellation',
    DharmaKeyRegistryV2Coverage,
    'acceptOwnership',
    'send',
    [],
    false
  )

  await runTest(
    'Dharma Key Registry V2 can prepare to transfer to a new owner again',
    DharmaKeyRegistryV2Coverage,
    'transferOwnership',
    'send',
    [
      address
    ]
  )

  await runTest(
    'Dharma Key Registry V2 new owner can accept ownership',
    DharmaKeyRegistryV2Coverage,
    'acceptOwnership'
  )

  await runTest(
    'Dharma Key Registry V2 gets the new owner',
    DharmaKeyRegistryV2Coverage,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'Dharma Key Registry V2 gets the global key correctly',
    DharmaKeyRegistryV2Coverage,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, addressTwo)
    }
  )

  const messageV2Coverage = (
    DharmaKeyRegistryV2Coverage.options.address +
    address.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const v2KeySignatureCoverage = signHashedPrefixedHashedHexString(messageV2Coverage, address)

  await runTest(
    'Dharma Key Registry V2 cannot set a previously used global key',
    DharmaKeyRegistryV2Coverage,
    'setGlobalKey',
    'send',
    [
      address,
      v2KeySignatureCoverage
    ],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconController initially gets zero for lastImplementation`,
    DharmaUpgradeBeaconControllerCoverage,
    'getCodeHashAtLastUpgrade',
    'call',
    [address],
    true,
    value => {
      assert.strictEqual(value, constants.NULL_BYTES_32)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot call upgrade from non-owner account`,
    DharmaUpgradeBeaconControllerCoverage,
    'upgrade',
    'send',
    [DharmaUpgradeBeaconCoverage.options.address, DharmaUpgradeBeaconController.options.address],
    false,
    receipt => {},
    addressTwo
  )

  await runTest(
    `DharmaUpgradeBeaconController can set implementation on upgrade beacon contract`,
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [DharmaUpgradeBeaconCoverage.options.address, DharmaUpgradeBeaconController.options.address]
  )

  await runTest(
    `DharmaKeyRingUpgradeBeaconController can set implementation on key ring upgrade beacon contract`,
    DharmaKeyRingUpgradeBeaconController,
    'upgrade',
    'send',
    [DharmaKeyRingUpgradeBeaconCoverage.options.address, DharmaUpgradeBeaconController.options.address]
  )

  await runTest(
    `DharmaUpgradeBeaconEnvoy throws when given invalid beacon`,
    DharmaUpgradeBeaconEnvoy,
    'getImplementation',
    'call',
    [DharmaUpgradeBeaconEnvoy.options.address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconEnvoy throws when given non-contract beacon`,
    DharmaUpgradeBeaconEnvoy,
    'getImplementation',
    'call',
    [address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconEnvoy can get the implementation of a valid beacon`,
    DharmaUpgradeBeaconEnvoy,
    'getImplementation',
    'call',
    [DharmaKeyRingUpgradeBeaconCoverage.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaUpgradeBeaconController.options.address)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot set null implementation on an upgrade beacon contract`,
    DharmaUpgradeBeaconControllerCoverage,
    'upgrade',
    'send',
    [DharmaUpgradeBeaconCoverage.options.address, constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot set non-contract implementation`,
    DharmaUpgradeBeaconControllerCoverage,
    'upgrade',
    'send',
    [DharmaUpgradeBeaconCoverage.options.address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot set null address beacon`,
    DharmaUpgradeBeaconControllerCoverage,
    'upgrade',
    'send',
    [constants.NULL_ADDRESS, DharmaUpgradeBeaconControllerCoverage.options.address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot set non-contract address beacon`,
    DharmaUpgradeBeaconControllerCoverage,
    'upgrade',
    'send',
    [address, DharmaUpgradeBeaconControllerCoverage.options.address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot set unowned bad beacon`,
    DharmaUpgradeBeaconControllerCoverage,
    'upgrade',
    'send',
    [BadBeaconTwo.options.address, DharmaUpgradeBeaconControllerCoverage.options.address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot set unowned beacon (Note that it still logs an event!)`,
    DharmaUpgradeBeaconControllerCoverage,
    'upgrade',
    'send',
    [DharmaUpgradeBeaconCoverage.options.address, DharmaUpgradeBeaconControllerCoverage.options.address]
  )

  await runTest(
    `DharmaUpgradeBeaconController can get implementation of a beacon`,
    DharmaUpgradeBeaconControllerCoverage,
    'getImplementation',
    'call',
    [DharmaUpgradeBeaconCoverage.options.address],
    true,
    value => {
      assert.strictEqual(value, DharmaUpgradeBeaconController.options.address)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconController can get owner`,
    DharmaUpgradeBeaconControllerCoverage,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconController can call isOwner and value is ok`,
    DharmaUpgradeBeaconControllerCoverage,
    'isOwner',
    'call',
    [],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconController cannot transfer ownership to null address`,
    DharmaUpgradeBeaconControllerCoverage,
    'transferOwnership',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconController can transfer ownership`,
    DharmaUpgradeBeaconControllerCoverage,
    'transferOwnership',
    'send',
    [address]
  )

  await runTest(
    `DharmaUpgradeBeaconController can renounce ownership`,
    DharmaUpgradeBeaconControllerCoverage,
    'renounceOwnership'
  )

  
  await runTest(
    `DharmaAccountRecoveryManager cannot transfer ownership from a non-owner`,
    DharmaAccountRecoveryManagerCoverage,
    'transferOwnership',
    'send',
    [addressTwo],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot initiate recovery with null smart wallet`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateAccountRecovery',
    'send',
    [constants.NULL_ADDRESS, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot initiate recovery with null new key`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateAccountRecovery',
    'send',
    [address, constants.NULL_ADDRESS, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager can initiate recovery timelock`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateAccountRecovery',
    'send',
    [address, addressTwo, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot initiate recovery disablement with null smart wallet`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateAccountRecoveryDisablement',
    'send',
    [constants.NULL_ADDRESS, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager can initiate recovery disablement timelock`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateAccountRecoveryDisablement',
    'send',
    [address, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call recover with null new key`,
    DharmaAccountRecoveryManagerCoverage,
    'recover',
    'send',
    [constants.NULL_ADDRESS, addressTwo],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call recover with null new key`,
    DharmaAccountRecoveryManagerCoverage,
    'recover',
    'send',
    [address, constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call recover prior to timelock completion`,
    DharmaAccountRecoveryManagerCoverage,
    'recover',
    'send',
    [address, addressTwo],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call disableAccountRecovery with null smart wallet`,
    DharmaAccountRecoveryManagerCoverage,
    'disableAccountRecovery',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call disableAccountRecovery prior to timelock completion`,
    DharmaAccountRecoveryManagerCoverage,
    'disableAccountRecovery',
    'send',
    [address],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager can check if account recovery is disabled`,
    DharmaAccountRecoveryManagerCoverage,
    'accountRecoveryDisabled',
    'call',
    [address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call initiateModifyTimelockInterval with no selector`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call initiateModifyTimelockInterval to modify interval over 8 weeks`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager can call initiateModifyTimelockInterval to set a timelock`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10000, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManager can call initiateModifyTimelockInterval to set a timelock on another function`,
    DharmaAccountRecoveryManager,
    'initiateModifyTimelockInterval',
    'send',
    ['0xaaaaaaaa', 10000, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call modifyTimelockInterval with no selector`,
    DharmaAccountRecoveryManagerCoverage,
    'modifyTimelockInterval',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call modifyTimelockInterval before timelock completion`,
    DharmaAccountRecoveryManagerCoverage,
    'modifyTimelockInterval',
    'send',
    ['0xe950c085', 1000],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call initiateTimelockExpiration with no selector`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateTimelockExpiration',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call initiateTimelockExpiration to with expiration over one month`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateTimelockExpiration',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call initiateTimelockExpiration to modify expiration under one minute`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 30, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call initiateTimelockExpiration to modify expiration under one hour`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 3000, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager can call initiateTimelockExpiration to set a timelock`,
    DharmaAccountRecoveryManagerCoverage,
    'initiateTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 30000, 0],
  )

  await runTest(
    `DharmaAccountRecoveryManager can call initiateTimelockExpiration to set a timelock on another function`,
    DharmaAccountRecoveryManager,
    'initiateTimelockExpiration',
    'send',
    ['0xaaaaaaaa', 300000, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call modifyTimelockExpiration with no selector`,
    DharmaAccountRecoveryManagerCoverage,
    'modifyTimelockExpiration',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManager cannot call modifyTimelockExpiration before timelock completion`,
    DharmaAccountRecoveryManagerCoverage,
    'modifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300],
    false
  )




  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer ownership from a non-owner`,
    DharmaUpgradeBeaconControllerManager,
    'transferOwnership',
    'send',
    [addressTwo],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null controller`,
    DharmaUpgradeBeaconControllerManager,
    'initiateUpgrade',
    'send',
    [constants.NULL_ADDRESS, address, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null beacon`,
    DharmaUpgradeBeaconControllerManager,
    'initiateUpgrade',
    'send',
    [address, constants.NULL_ADDRESS, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null implementation`,
    DharmaUpgradeBeaconControllerManager,
    'initiateUpgrade',
    'send',
    [address, addressTwo, constants.NULL_ADDRESS, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with non-contract implementation`,
    DharmaUpgradeBeaconControllerManager,
    'initiateUpgrade',
    'send',
    [address, addressTwo, address, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with massive extraTime`,
    DharmaUpgradeBeaconControllerManager,
    'initiateUpgrade',
    'send',
    [address, addressTwo, DharmaUpgradeBeaconControllerManager.options.address, constants.FULL_APPROVAL],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can initiate upgrade timelock`,
    DharmaUpgradeBeaconControllerManager,
    'initiateUpgrade',
    'send',
    [address, addressTwo, DharmaUpgradeBeaconControllerManager.options.address, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot upgrade before timelock is complete`,
    DharmaUpgradeBeaconControllerManager,
    'upgrade',
    'send',
    [address, addressTwo, DharmaUpgradeBeaconControllerManager.options.address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer controller ownership before accepting ownership`,
    DharmaUpgradeBeaconControllerManager,
    'transferControllerOwnership',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot agree to accept ownership of null controller`,
    DharmaUpgradeBeaconControllerManager,
    'agreeToAcceptOwnership',
    'send',
    [constants.NULL_ADDRESS, true],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can agree to accept ownership`,
    DharmaUpgradeBeaconControllerManager,
    'agreeToAcceptOwnership',
    'send',
    [address, true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer controller ownership prior to timelock completion`,
    DharmaUpgradeBeaconControllerManager,
    'transferControllerOwnership',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot heartbeat from non-heartbeater`,
    DharmaUpgradeBeaconControllerManager,
    'heartbeat',
    'send',
    [],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can heartbeat`,
    DharmaUpgradeBeaconControllerManager,
    'heartbeat'
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot set new heartbeater to null address`,
    DharmaUpgradeBeaconControllerManager,
    'newHeartbeater',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can set new heartbeater`,
    DharmaUpgradeBeaconControllerManager,
    'newHeartbeater',
    'send',
    [address]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot arm Adharma Contingency with null controller`,
    DharmaUpgradeBeaconControllerManager,
    'armAdharmaContingency',
    'send',
    [constants.NULL_ADDRESS, address, true],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot arm Adharma Contingency with null beacon`,
    DharmaUpgradeBeaconControllerManager,
    'armAdharmaContingency',
    'send',
    [address, constants.NULL_ADDRESS, true],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot arm Adharma Contingency from non-owner when not expired`,
    DharmaUpgradeBeaconControllerManager,
    'armAdharmaContingency',
    'send',
    [address, address, true],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when not armed`,
    DharmaUpgradeBeaconControllerManager,
    'activateAdharmaContingency',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can arm Adharma Contingency`,
    DharmaUpgradeBeaconControllerManager,
    'armAdharmaContingency',
    'send',
    [address, address, true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency from non-owner when not expired`,
    DharmaUpgradeBeaconControllerManager,
    'activateAdharmaContingency',
    'send',
    [address, address],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency on non-smart-wallet / key-ring`,
    DharmaUpgradeBeaconControllerManager,
    'activateAdharmaContingency',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency on unowned smart-wallet`,
    DharmaUpgradeBeaconControllerManager,
    'activateAdharmaContingency',
    'send',
    [address, '0x000000000026750c571ce882B17016557279ADaa'],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot roll back prior to first upgrade`,
    DharmaUpgradeBeaconControllerManager,
    'rollback',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when not active`,
    DharmaUpgradeBeaconControllerManager,
    'exitAdharmaContingency',
    'send',
    [address, address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can get heartbeat status`,
    DharmaUpgradeBeaconControllerManager,
    'heartbeatStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.expired)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockInterval with no selector`,
    DharmaUpgradeBeaconControllerManager,
    'initiateModifyTimelockInterval',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockInterval to modify interval over 8 weeks`,
    DharmaUpgradeBeaconControllerManager,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to set a timelock`,
    DharmaUpgradeBeaconControllerManager,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10000, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to set a timelock on another function`,
    DharmaUpgradeBeaconControllerManager,
    'initiateModifyTimelockInterval',
    'send',
    ['0xaaaaaaaa', 10000, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockInterval with no selector`,
    DharmaUpgradeBeaconControllerManager,
    'modifyTimelockInterval',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockInterval before timelock completion`,
    DharmaUpgradeBeaconControllerManager,
    'modifyTimelockInterval',
    'send',
    ['0xe950c085', 1000],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateTimelockExpiration with no selector`,
    DharmaUpgradeBeaconControllerManager,
    'initiateTimelockExpiration',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateTimelockExpiration to with expiration over one month`,
    DharmaUpgradeBeaconControllerManager,
    'initiateTimelockExpiration',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateTimelockExpiration to modify expiration under one minute`,
    DharmaUpgradeBeaconControllerManager,
    'initiateTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 30, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateTimelockExpiration to set a timelock`,
    DharmaUpgradeBeaconControllerManager,
    'initiateTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300000, 0],
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateTimelockExpiration to set a timelock on another function`,
    DharmaUpgradeBeaconControllerManager,
    'initiateTimelockExpiration',
    'send',
    ['0xaaaaaaaa', 300000, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration with no selector`,
    DharmaUpgradeBeaconControllerManager,
    'modifyTimelockExpiration',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration before timelock completion`,
    DharmaUpgradeBeaconControllerManager,
    'modifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300],
    false
  )

  await runTest(
    'Dharma Upgrade Beacon Controller can upgrade to AdharmaSmartWalletImplementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      AdharmaSmartWalletImplementation.options.address
    ]
  )

  await runTest(
    'Dharma Key Ring Upgrade Beacon Controller can upgrade to AdharmaKeyRingImplementation',
    DharmaKeyRingUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaKeyRingUpgradeBeacon.options.address,
      AdharmaKeyRingImplementation.options.address
    ]
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 cannot deploy an Adharma smart wallet with no key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 can deploy an Adharma smart wallet',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [address]
  )

  await runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring with no key`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV1 cannot create an Adharma key ring and set a new null key`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndAdditionalKey',
    'send',
    [address, constants.NULL_ADDRESS, '0x'],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV1 can create an Adharma key ring`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [address]
  )

  const UserSmartWalletAdharma = new web3.eth.Contract(
    AdharmaSmartWalletImplementationArtifact.abi,
    UserSmartWalletV3.options.address
  )

  await runTest(
    `Adharma Smart Wallet can be used to perform calls`,
    UserSmartWalletAdharma,
    'performCall',
    'send',
    [UserSmartWalletAdharma.options.address, 0, '0x'],
    true,
    receipt => {},
    originalAddress
  )

  await runTest(
    `Adharma Smart Wallet can be used to perform failing calls`,
    UserSmartWalletAdharma,
    'performCall',
    'send',
    [BadBeacon.options.address, 0, '0x'],
    false,
    receipt => {},
    originalAddress
  )

  const KeyRingAdharma = new web3.eth.Contract(
    AdharmaKeyRingImplementationArtifact.abi,
    KeyRingInstance.options.address
  )

  await runTest(
    `Adharma Key Ring can be used to take an action`,
    KeyRingAdharma,
    'takeAction',
    'send',
    [address, 0, '0x', '0x']
  )

  console.log(
    `completed ${passed + failed} test${passed + failed === 1 ? '' : 's'} ` +
    `with ${failed} failure${failed === 1 ? '' : 's'}.`
  )

  await longer()

  if (failed > 0) {
    process.exit(1)
  }

  // exit.
  return 0

}}
