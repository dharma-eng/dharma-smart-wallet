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

const DharmaAccountRecoveryManagerV2Artifact = require('../../build/contracts/DharmaAccountRecoveryManagerV2.json')
const DharmaKeyRegistryV1Artifact = require('../../build/contracts/DharmaKeyRegistryV1.json')
const DharmaKeyRegistryV2Artifact = require('../../build/contracts/DharmaKeyRegistryV2.json')
const DharmaSmartWalletFactoryV1Artifact = require('../../build/contracts/DharmaSmartWalletFactoryV1.json')
const DharmaSmartWalletFactoryV2Artifact = require('../../build/contracts/DharmaSmartWalletFactoryV2.json')

const DharmaSmartWalletImplementationV0Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV0.json')
const DharmaSmartWalletImplementationV1Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV1.json')
const DharmaSmartWalletImplementationV2Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV2.json')
const DharmaSmartWalletImplementationV5Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV5.json')

const DharmaKeyRingImplementationV1Artifact = require('../../build/contracts/DharmaKeyRingImplementationV1.json')
const DharmaKeyRingFactoryV1Artifact = require('../../build/contracts/DharmaKeyRingFactoryV1.json')
const DharmaKeyRingFactoryV2Artifact = require('../../build/contracts/DharmaKeyRingFactoryV2.json')
const DharmaKeyRingFactoryV3Artifact = require('../../build/contracts/DharmaKeyRingFactoryV3.json')

const UpgradeBeaconProxyV1Artifact = require('../../build/contracts/UpgradeBeaconProxyV1.json')
const KeyRingUpgradeBeaconProxyV1Artifact = require('../../build/contracts/KeyRingUpgradeBeaconProxyV1.json')

const DharmaUpgradeMultisigArtifact = require('../../build/contracts/DharmaUpgradeMultisig.json')
const DharmaAccountRecoveryMultisigArtifact = require('../../build/contracts/DharmaAccountRecoveryMultisig.json')
const DharmaKeyRegistryMultisigArtifact = require('../../build/contracts/DharmaKeyRegistryMultisig.json')

const DharmaEscapeHatchRegistryArtifact = require('../../build/contracts/DharmaEscapeHatchRegistry.json')

const UpgradeBeaconImplementationCheckArtifact = require('../../build/contracts/UpgradeBeaconImplementationCheck.json')
const BadBeaconArtifact = require('../../build/contracts/BadBeacon.json')
const BadBeaconTwoArtifact = require('../../build/contracts/BadBeaconTwo.json')
const TimelockEdgecaseTesterArtifact = require('../../build/contracts/TimelockEdgecaseTester.json')

const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const MockDharmaKeyRingFactoryArtifact = require('../../build/contracts/MockDharmaKeyRingFactory.json')
const IERC20Artifact = require('../../build/contracts/IERC20.json')
const ComptrollerArtifact = require('../../build/contracts/ComptrollerInterface.json')

const contractNames = Object.assign({}, constants.CONTRACT_NAMES)

// used to wait for more confirmations
function longer() {
  return new Promise(resolve => {setTimeout(() => {resolve()}, 500)})
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

  const DharmaAccountRecoveryManagerV2 = new web3.eth.Contract(
    DharmaAccountRecoveryManagerV2Artifact.abi,
    constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS
  )

  const DharmaKeyRegistryV1 = new web3.eth.Contract(
    DharmaKeyRegistryV1Artifact.abi,
    constants.KEY_REGISTRY_ADDRESS
  )

  const DharmaKeyRegistryV2 = new web3.eth.Contract(
    DharmaKeyRegistryV2Artifact.abi,
    constants.KEY_REGISTRY_V2_ADDRESS
  )

  const DharmaUpgradeBeaconControllerManager = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerManagerArtifact.abi,
    constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS
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

  const DharmaSmartWalletImplementationV5Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV5Artifact.abi
  )
  DharmaSmartWalletImplementationV5Deployer.options.data = (
    DharmaSmartWalletImplementationV5Artifact.bytecode
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

  const TimelockEdgecaseTesterDeployer = new web3.eth.Contract(
    TimelockEdgecaseTesterArtifact.abi
  )
  TimelockEdgecaseTesterDeployer.options.data = (
    TimelockEdgecaseTesterArtifact.bytecode
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

  const MockDharmaKeyRingFactoryDeployer = new web3.eth.Contract(
    MockDharmaKeyRingFactoryArtifact.abi
  )
  MockDharmaKeyRingFactoryDeployer.options.data = (
    MockDharmaKeyRingFactoryArtifact.bytecode
  )

  const DharmaAccountRecoveryManagerV2Deployer = new web3.eth.Contract(
    DharmaAccountRecoveryManagerV2Artifact.abi
  )
  DharmaAccountRecoveryManagerV2Deployer.options.data = (
    DharmaAccountRecoveryManagerV2Artifact.bytecode
  )

  const DharmaUpgradeMultisigDeployer = new web3.eth.Contract(
    DharmaUpgradeMultisigArtifact.abi
  )
  DharmaUpgradeMultisigDeployer.options.data = (
    DharmaUpgradeMultisigArtifact.bytecode
  )

  const DharmaAccountRecoveryMultisigDeployer = new web3.eth.Contract(
    DharmaAccountRecoveryMultisigArtifact.abi
  )
  DharmaAccountRecoveryMultisigDeployer.options.data = (
    DharmaAccountRecoveryMultisigArtifact.bytecode
  )

  const DharmaKeyRegistryMultisigDeployer = new web3.eth.Contract(
    DharmaKeyRegistryMultisigArtifact.abi
  )
  DharmaKeyRegistryMultisigDeployer.options.data = (
    DharmaKeyRegistryMultisigArtifact.bytecode
  )

  const DharmaEscapeHatchRegistryDeployer = new web3.eth.Contract(
    DharmaEscapeHatchRegistryArtifact.abi
  )
  DharmaEscapeHatchRegistryDeployer.options.data = (
    DharmaEscapeHatchRegistryArtifact.bytecode
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

  const ownerOne = await setupNewDefaultAddress(
    constants.MOCK_OWNER_PRIVATE_KEYS[0]
  )
  const ownerTwo = await setupNewDefaultAddress(
    constants.MOCK_OWNER_PRIVATE_KEYS[1]
  )
  const ownerThree = await setupNewDefaultAddress(
    constants.MOCK_OWNER_PRIVATE_KEYS[2]
  )
  const ownerFour = await setupNewDefaultAddress(
    constants.MOCK_OWNER_PRIVATE_KEYS[3]
  )
  const ownerFive = await setupNewDefaultAddress(
    constants.MOCK_OWNER_PRIVATE_KEYS[4]
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

  const DharmaSmartWalletImplementationV5 = await runTest(
    `DharmaSmartWalletImplementationV5 contract deployment`,
    DharmaSmartWalletImplementationV5Deployer,
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

  const UserSmartWalletV5 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV5Artifact.abi,
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
      10, // DaiWithdrawal,
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
    'Dharma Upgrade Beacon Controller can upgrade to V5 implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV5.options.address
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
          DharmaSmartWalletImplementationV5.options.address
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
      assert.strictEqual(value, DharmaSmartWalletImplementationV5.options.address)
    }
  )

  const UpgradeBeaconImplementationCheckV5 = await runTest(
    `UpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV5.options.address
    ]
  )

  await runTest(
    'V5 user smart wallet can be called and still has original dharma key set',
    UserSmartWalletV5,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'V5 UserSmartWallet can get the new version (5)',
    UserSmartWalletV5,
    'getVersion',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '5')
    }
  )

  await runTest(
    'V5 UserSmartWallet nonce is still set to value from before upgrade',
    UserSmartWalletV5,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, originalNonce)
    }
  )

  await runTest(
    'V5 UserSmartWallet can get balances',
    UserSmartWalletV5,
    'getBalances',
    'call',
    [],
    true,
    value => {
      //console.log(value)
    }
  )

  await runTest(
    'V5 UserSmartWallet secondary can call to cancel',
    UserSmartWalletV5,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await runTest(
    'V5 UserSmartWallet nonce is now set to original + 1',
    UserSmartWalletV5,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, (parseInt(originalNonce) + 1).toString())
    }
  )

  await runTest(
    'V5 UserSmartWallet can get next custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get next generic action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get generic action ID and it matches next action ID',
    UserSmartWalletV5,
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
    'Dai Whale can deposit dai into the V5 smart wallet',
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
    'USDC Whale can deposit usdc into the V5 smart wallet',
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
    'V5 user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV5,
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
    'Dai Whale can deposit dai into the V5 smart wallet again',
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
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      constants.ESCAPE_HATCH_REGISTRY_ADDRESS,
      '0x',
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
    'V5 UserSmartWallet cannot call executeAction and target Escape Hatch Registry',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      constants.ESCAPE_HATCH_REGISTRY_ADDRESS,
      '0x',
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
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

  executeActionSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  executeActionUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
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
    'V5 user smart wallet repayAndDeposit cannot deposit without approval',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
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
    'V5 user smart wallet repayAndDeposit can deposit with approval added back',
    UserSmartWalletV5,
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
    'V5 user smart wallet can trigger repayAndDeposit even with no funds',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet secondary cannot set an empty user userSigningKey',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet secondary can set a custom user userSigningKey',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get next custom action ID to set a user signing key',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      constants.FULL_APPROVAL, // This value shouldn't matter
      addressTwo,
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
    UserSmartWalletV5,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await runTest(
    'V5 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV5,
    'getCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      0, // Note that this value differs from above
      addressTwo,
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  let setUserSigningKeyUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  let setUserSigningKeyDharmaSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  await runTest(
    'V5 UserSmartWallet can set a new user signing key with signatures',
    UserSmartWalletV5,
    'setUserSigningKey',
    'send',
    [
      addressTwo,
      0,
      setUserSigningKeyUserSignature,
      setUserSigningKeyDharmaSignature
    ],
    true,
    receipt => {},
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet can get next custom action ID to cancel',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel
      constants.FULL_APPROVAL, // This value shouldn't matter
      originalAddress,  // This value shouldn't matter either
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV5,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await runTest(
    'V5 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV5,
    'getCustomActionID',
    'call',
    [
      0, // Cancel
      0, // Note that this value differs from above
      addressTwo, // This one too
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  let cancelUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet secondary can cancel using a signature',
    UserSmartWalletV5,
    'cancel',
    'send',
    [
      0,
      cancelUserSignature
    ],
    true,
    receipt => {},
    originalAddress
  )

  await runTest(
    'UserSmartWallet nonce is incremented after cancelling',
    UserSmartWalletV5,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(parseInt(value), parseInt(currentNonce) + 1)
    }
  )

  await runTest(
    'V5 UserSmartWallet secondary cannot call to withdraw dai without primary',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet secondary cannot call to withdraw usdc without primary',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet secondary can no longer call to set userSigningKey without primary',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '1', // dust
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
    'V5 UserSmartWallet relay cannot withdraw "dust" USDC',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      '1',
      address,
      0,
      usdcUserWithdrawalSignature,
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
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000',
      constants.NULL_ADDRESS, // bad recipient
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
    'V5 UserSmartWallet relay cannot withdraw USDC to null address',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      '100000',
      constants.NULL_ADDRESS,
      0,
      usdcUserWithdrawalSignature,
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
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
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

  usdcUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet cannot call with bad user signature to withdraw USDC',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay can call with two signatures to withdraw max USDC',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot withdraw "dust" dai',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      '1000000000000000',
      constants.NULL_ADDRESS,
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
    'V5 UserSmartWallet relay cannot withdraw dai to null address',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      constants.NULL_ADDRESS,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet cannot get a non-custom "custom" next action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      address,
      0
    ],
    false
  )

  await runTest(
    'V5 UserSmartWallet cannot get a non-custom "custom" action ID',
    UserSmartWalletV5,
    'getCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      address,
      0,
      0
    ],
    false
  )

  await runTest(
    'V5 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw dai',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot call with bad user signature to withdraw dai',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '0', // no amount
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
    'V5 UserSmartWallet relay cannot to withdraw ether with no amount',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '0',
      address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      constants.NULL_ADDRESS, // no recipient
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
    'V5 UserSmartWallet relay cannot to withdraw ether with no recipient',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '1',
      constants.NULL_ADDRESS,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
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

  ethWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  ethUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
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

  ethWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  ethUserWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet cancel reverts with bad signature',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet calls revert if insufficient action gas is supplied',
    UserSmartWalletV5,
    'cancel',
    'send',
    [
      constants.FULL_APPROVAL,
     '0x'
    ],
    false
  )

  await runTest(
    'V5 UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWalletV5,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await runTest(
    'V5 UserSmartWallet can get a cancel custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can cancel using a signature',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet calls to atomic methods revert',
    UserSmartWalletV5,
    '_withdrawSaiAtomic',
    'send',
    [
      '1',
     address
    ],
    false
  )

  await runTest(
    'V5 UserSmartWallet calls to recover from random address revert',
    UserSmartWalletV5,
    'recover',
    'send',
    [
     address
    ],
    false
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V5 smart wallet using a Dharma Key',
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
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet cannot call executeAction and target a non-contract',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet cannot call executeAction and target itself',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      UserSmartWalletV5.options.address,
      USDC.methods.approve(CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await runTest(
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get the next generic batch action ID',
    UserSmartWalletV5,
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

  await runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV5,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await runTest(
    'V5 UserSmartWallet generic batch action ID with nonce matches next ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can call executeActionWithAtomicBatchCalls',
    UserSmartWalletV5,
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
    UserSmartWalletV5,
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

  const BlacklistedUserSmartWalletV5 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV5Artifact.abi,
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
    BlacklistedUserSmartWalletV5,
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
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet attempt to withdraw max USDC when paused causes ExternalError',
    UserSmartWalletV5,
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

  await runTest(
    'smart wallet will not approve USDC when paused during repayAndDeposit',
    BlacklistedUserSmartWalletV5,
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
    BlacklistedUserSmartWalletV5,
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
    'V5 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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
    'V5 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
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
    'V5 UserSmartWallet relay call to withdraw USDC to itself',
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
    'V5 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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
    'V5 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot withdraw eth to a non-payable account',
    UserSmartWalletV5,
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
    'DharmaSmartWalletFactoryV1 can deploy a V5 smart wallet using a contract key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [targetWalletAddress]
  )

  const UserSmartWalletV5Two = new web3.eth.Contract(
    DharmaSmartWalletImplementationV5Artifact.abi,
    targetWalletAddressTwo
  )

  await runTest(
    'V5 UserSmartWallet cancel reverts with bad contract signature',
    UserSmartWalletV5Two,
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
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a Dai withdrawal custom action ID',
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
    'V5 UserSmartWallet relay cannot withdraw too much dai',
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
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
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
    'V5 UserSmartWallet relay can call with two signatures to withdraw USDC',
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
    'V5 UserSmartWallet can get next generic batch action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet bad executeActionWithAtomicBatchCalls emits CallFailure',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can call executeAction to enter dai market',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV5,
    'repayAndDeposit'
  )

  await runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can call executeAction to perform a borrow',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV5,
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
    'V5 UserSmartWallet relay cannot withdraw max dai with an outstanding borrow',
    UserSmartWalletV5,
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

  await runTest(
    'V5 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      7, // SetEscapeHatch,
      0,
      constants.NULL_ADDRESS, // no recipient
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let escapeHatchSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  let escapeHatchUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet relay cannot set an escape hatch with no account',
    UserSmartWalletV5,
    'setEscapeHatch',
    'send',
    [
      constants.NULL_ADDRESS,
      0,
      escapeHatchUserSignature,
      escapeHatchSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      7, // SetEscapeHatch,
      0,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  escapeHatchSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  escapeHatchUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet cannot call escape before escape hatch is set',
    UserSmartWalletV5,
    'escape',
    'send',
    [],
    false,
    receipt => {
      // TODO: verify logs
    }
  )

  await runTest(
    'V5 UserSmartWallet relay can set an escape hatch',
    UserSmartWalletV5,
    'setEscapeHatch',
    'send',
    [
      address,
      0,
      escapeHatchUserSignature,
      escapeHatchSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet non-escape hatch account cannot call escape',
    UserSmartWalletV5,
    'escape',
    'send',
    [],
    false,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet escape hatch account can call escape',
    UserSmartWalletV5,
    'escape',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    address
  )

  await runTest(
    'V5 UserSmartWallet escape hatch account can call escape again',
    UserSmartWalletV5,
    'escape',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    address
  )

  await runTest(
    'V5 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      8, // RemoveEscapeHatch,
      0,
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  escapeHatchSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  escapeHatchUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet relay can remove an escape hatch',
    UserSmartWalletV5,
    'removeEscapeHatch',
    'send',
    [
      0,
      escapeHatchUserSignature,
      escapeHatchSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet cannot call escape once escape hatch is removed',
    UserSmartWalletV5,
    'escape',
    'send',
    [],
    false,
    receipt => {
      // TODO: verify logs
    }
  )

  await runTest(
    'V5 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      9, // DisableEscapeHatch,
      0,
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  escapeHatchSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  escapeHatchUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet relay can disable the escape hatch',
    UserSmartWalletV5,
    'permanentlyDisableEscapeHatch',
    'send',
    [
      0,
      escapeHatchUserSignature,
      escapeHatchSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  await runTest(
    'V5 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      7, // SetEscapeHatch,
      0,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  escapeHatchSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  escapeHatchUserSignature = signHashedPrefixedHexString(
    customActionId,
    addressTwo
  )

  await runTest(
    'V5 UserSmartWallet relay cannot set an escape hatch once disabled',
    UserSmartWalletV5,
    'setEscapeHatch',
    'send',
    [
      address,
      0,
      escapeHatchUserSignature,
      escapeHatchSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    originalAddress
  )

  // Initiate account recovery
  await runTest(
    'smart wallet account recovery can be initiated',
    DharmaAccountRecoveryManagerV2,
    'initiateAccountRecovery',
    'send',
    [
      UserSmartWalletV5.options.address,
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
    DharmaAccountRecoveryManagerV2,
    'recover',
    'send',
    [
      UserSmartWalletV5.options.address,
      originalAddress
    ],
    false
  )

  // advance time by 3 days
  await advanceTime((60 * 60 * 24 * 3) + 5)

  // recover account
  await runTest(
    'smart wallet account recovery can be performed after three days',
    DharmaAccountRecoveryManagerV2,
    'recover',
    'send',
    [
      UserSmartWalletV5.options.address,
      originalAddress
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  // COVERAGE TESTING - deployments
  const DharmaUpgradeBeaconControllerManagerCoverage = await runTest(
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

  const DharmaAccountRecoveryManagerV2Coverage = await runTest(
    `DharmaAccountRecoveryManagerV2 contract deployment`,
    DharmaAccountRecoveryManagerV2Deployer,
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
    `DharmaKeyRingFactoryV2 can call getFirstKeyRingAdminActionID`,
    DharmaKeyRingFactoryV2,
    'getFirstKeyRingAdminActionID',
    'call',
    [address, address]
  )

  await runTest(
    `DharmaKeyRingFactoryV2 reverts when no new key ring supplied`,
    DharmaKeyRingFactoryV2,
    'getNextKeyRing',
    'call',
    [constants.NULL_ADDRESS],
    false
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
    `DharmaKeyRingFactoryV2 can call newKeyRingAndDaiWithdrawal`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndDaiWithdrawal',
    'send',
    [address, address, address, 0, address, 0, '0x', '0x'],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV2 can call newKeyRingAndUSDCWithdrawal`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndUSDCWithdrawal',
    'send',
    [address, address, address, 0, address, 0, '0x', '0x'],
    false
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
    DharmaSmartWalletImplementationV5Artifact.abi,
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
    `DharmaAccountRecoveryManagerV2 cannot transfer ownership from a non-owner`,
    DharmaAccountRecoveryManagerV2Coverage,
    'transferOwnership',
    'send',
    [addressTwo],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot initiate recovery with null smart wallet`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecovery',
    'send',
    [constants.NULL_ADDRESS, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot initiate recovery with null new key`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecovery',
    'send',
    [address, constants.NULL_ADDRESS, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can initiate recovery timelock`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecovery',
    'send',
    [constants.UPGRADE_BEACON_ADDRESS, addressTwo, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can initiate another recovery timelock`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecovery',
    'send',
    [UserSmartWalletV5.options.address, addressTwo, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can initiate a third recovery timelock`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecovery',
    'send',
    [address, addressTwo, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot initiate recovery disablement with null smart wallet`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecoveryDisablement',
    'send',
    [constants.NULL_ADDRESS, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can initiate recovery disablement timelock`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecoveryDisablement',
    'send',
    [address, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call recover with null new key`,
    DharmaAccountRecoveryManagerV2Coverage,
    'recover',
    'send',
    [constants.NULL_ADDRESS, addressTwo],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call recover with null new key`,
    DharmaAccountRecoveryManagerV2Coverage,
    'recover',
    'send',
    [address, constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call recover prior to timelock completion`,
    DharmaAccountRecoveryManagerV2Coverage,
    'recover',
    'send',
    [constants.UPGRADE_BEACON_ADDRESS, addressTwo],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call disableAccountRecovery prior to timelock completion`,
    DharmaAccountRecoveryManagerV2Coverage,
    'disableAccountRecovery',
    'send',
    [address],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can check if account recovery is disabled`,
    DharmaAccountRecoveryManagerV2Coverage,
    'accountRecoveryDisabled',
    'call',
    [address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  // advance time by 3 days
  await advanceTime((60 * 60 * 24 * 3) + 5)

  await runTest(
    `DharmaAccountRecoveryManagerV2 can call recover after timelock completion`,
    DharmaAccountRecoveryManagerV2Coverage,
    'recover',
    'send',
    [constants.UPGRADE_BEACON_ADDRESS, addressTwo]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot recover an unowned smart wallet`,
    DharmaAccountRecoveryManagerV2Coverage,
    'recover',
    'send',
    [UserSmartWalletV5.options.address, addressTwo],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot recover an EOA`,
    DharmaAccountRecoveryManagerV2Coverage,
    'recover',
    'send',
    [address, addressTwo],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call disableAccountRecovery with null smart wallet`,
    DharmaAccountRecoveryManagerV2Coverage,
    'disableAccountRecovery',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can call disableAccountRecovery after timelock completion`,
    DharmaAccountRecoveryManagerV2Coverage,
    'disableAccountRecovery',
    'send',
    [address]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can check if account recovery is disabled`,
    DharmaAccountRecoveryManagerV2Coverage,
    'accountRecoveryDisabled',
    'call',
    [address],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot recover an account that has disabled recovery`,
    DharmaAccountRecoveryManagerV2Coverage,
    'recover',
    'send',
    [address, addressTwo],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockInterval with no selector`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockInterval to modify interval over 8 weeks`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockInterval to set a timelock`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10000, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockInterval to set a timelock on another function`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xaaaaaaaa', 10000, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockInterval with no selector`,
    DharmaAccountRecoveryManagerV2Coverage,
    'modifyTimelockInterval',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockInterval before timelock completion`,
    DharmaAccountRecoveryManagerV2Coverage,
    'modifyTimelockInterval',
    'send',
    ['0xe950c085', 1000],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration with no selector`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to with expiration over one month`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to modify expiration under one minute`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 30, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to modify expiration under one hour`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 3000, 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockExpiration to set a timelock`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 30000, 0],
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockExpiration to set a timelock on another function`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xaaaaaaaa', 300000, 0]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockExpiration with no selector`,
    DharmaAccountRecoveryManagerV2Coverage,
    'modifyTimelockExpiration',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockExpiration before timelock completion`,
    DharmaAccountRecoveryManagerV2Coverage,
    'modifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 can initiate recovery disablement timelock`,
    DharmaAccountRecoveryManagerV2Coverage,
    'initiateAccountRecoveryDisablement',
    'send',
    [addressTwo, 0]
  )

  // advance time by 2 weeks
  await advanceTime((60 * 60 * 24 * 7 * 2) + 5)

  await runTest(
    `DharmaAccountRecoveryManagerV2 cannot call disableAccountRecovery after timelock expiration`,
    DharmaAccountRecoveryManagerV2Coverage,
    'disableAccountRecovery',
    'send',
    [addressTwo],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer ownership from a non-owner`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'transferOwnership',
    'send',
    [addressTwo],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null controller`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateUpgrade',
    'send',
    [constants.NULL_ADDRESS, address, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null beacon`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateUpgrade',
    'send',
    [address, constants.NULL_ADDRESS, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateUpgrade',
    'send',
    [address, addressTwo, constants.NULL_ADDRESS, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with non-contract implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateUpgrade',
    'send',
    [address, addressTwo, address, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with massive extraTime`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateUpgrade',
    'send',
    [address, addressTwo, DharmaUpgradeBeaconControllerManager.options.address, constants.FULL_APPROVAL],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can initiate upgrade timelock`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateUpgrade',
    'send',
    [address, addressTwo, DharmaUpgradeBeaconControllerManager.options.address, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can get an empty timelock`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'getTimelock',
    'call',
    ['0x01020304', '0x'],
    true,
    value => {
      assert.ok(!value.exists)
      assert.ok(!value.completed)
      assert.ok(!value.expired)
      assert.strictEqual(value.completionTime, '0')
      assert.strictEqual(value.expirationTime, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can get an empty default timelock interval`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'getDefaultTimelockInterval',
    'call',
    ['0x01020304'],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can get an empty default timelock expiration`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'getDefaultTimelockExpiration',
    'call',
    ['0x01020304'],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot upgrade before timelock is complete`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'upgrade',
    'send',
    [address, addressTwo, DharmaUpgradeBeaconControllerManager.options.address],
    false
  )

  // advance time by 7 days
  await advanceTime((60 * 60 * 24 * 7) + 5)

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot upgrade an unowned controller`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'upgrade',
    'send',
    [address, addressTwo, DharmaUpgradeBeaconControllerManager.options.address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer controller ownership before accepting ownership`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'transferControllerOwnership',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot agree to accept ownership of null controller`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'agreeToAcceptControllerOwnership',
    'send',
    [constants.NULL_ADDRESS, true],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can agree to accept ownership`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'agreeToAcceptControllerOwnership',
    'send',
    [address, true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate controller ownership transfer with null controller`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateTransferControllerOwnership',
    'send',
    [constants.NULL_ADDRESS, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate controller ownership transfer with null new owner`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateTransferControllerOwnership',
    'send',
    [address, constants.NULL_ADDRESS, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate controller ownership transfer if new owner has not accepted`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateTransferControllerOwnership',
    'send',
    [address, addressTwo, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can initiate controller ownership transfer if new owner has accepted`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateTransferControllerOwnership',
    'send',
    [address, address, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer controller ownership prior to timelock completion`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'transferControllerOwnership',
    'send',
    [address, address],
    false
  )

  // advance time by 4 weeks
  await advanceTime((60 * 60 * 24 * 7 * 4) + 5)

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer unowned controller ownership`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'transferControllerOwnership',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot heartbeat from non-heartbeater`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'heartbeat',
    'send',
    [],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can heartbeat`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'heartbeat'
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot set new heartbeater to null address`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'newHeartbeater',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can set new heartbeater`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'newHeartbeater',
    'send',
    [address]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot arm Adharma Contingency from non-owner when not expired`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when not armed`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can arm an Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can disarm Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [false]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can re-arm Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency from non-owner when not expired`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    [],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when it doesn't own controllers`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot roll back prior to first upgrade`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [address, address, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Adharma Contingency when not active`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [address, address],
    false
  )

  /*
  await runTest(
    `DharmaUpgradeBeaconControllerManager can activate Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    []
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner cannot arm Adharma Contingency while active`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Contingency when activated`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can disarm Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [false]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Contingency before 48 hours`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [
      DharmaSmartWalletImplementationV5.options.address,
      DharmaKeyRingImplementationV1.options.address
    ],
    false
  )

  // advance time by 2 days
  await advanceTime((60 * 60 * 24 * 2) + 5)

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Contingency to null address`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [constants.NULL_ADDRESS, DharmaKeyRingImplementationV1.options.address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Contingency to non-contract address`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [address, address],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can exit Contingency after 48 hours`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [
      DharmaSmartWalletImplementationV5.options.address,
      DharmaKeyRingImplementationV1.options.address
    ]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can arm Adharma Contingency again`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can activate fake Adharma Contingency again`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    []
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can roll back from fake Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [constants.UPGRADE_BEACON_CONTROLLER_ADDRESS, constants.UPGRADE_BEACON_ADDRESS, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can "roll forward" after roll back`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [constants.UPGRADE_BEACON_ADDRESS, constants.UPGRADE_BEACON_ADDRESS]
  )
  */

  await runTest(
    `DharmaUpgradeBeaconControllerManager can get heartbeat status`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'heartbeatStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.expired)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager get contingency status when armed but not activated`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'contingencyStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(value.armed)
      assert.ok(!value.activated)
      assert.strictEqual(value.activationTime, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager gets 0 for non-existent total implementations`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'getTotalPriorImplementations',
    'call',
    [address, address],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot get a prior implementation with no index`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'getPriorImplementation',
    'call',
    [address, address, 100],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot rollback to implementation with no index`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [address, address, 100],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot block rollback to implementation with no index`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'blockRollback',
    'send',
    [address, address, 100],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockInterval with no selector`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockInterval to modify interval over 8 weeks`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot create timelock with excessive duration`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', constants.FULL_APPROVAL, 0],
    false // TODO: move this outside of Controller manager
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to set a timelock`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10000, 5]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot shorten existing initiateModifyTimelockInterval timelock`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10000, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to change a duration`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10001, 5]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to set a timelock on another function`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockInterval',
    'send',
    ['0xaaaaaaaa', 10000, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockInterval with no selector`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'modifyTimelockInterval',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockInterval before timelock completion`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'modifyTimelockInterval',
    'send',
    ['0xe950c085', 1000],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockExpiration with no selector`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockExpiration to with expiration over one month`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockExpiration to modify expiration under one minute`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 30, 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockExpiration to set a timelock`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300000, 0],
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockExpiration to set a timelock on another function`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xe950c085', 30, 0]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration with no selector`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'modifyTimelockExpiration',
    'send',
    ['0x00000000', 0],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration before timelock completion`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'modifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300],
    false
  )

  // advance time by 4 weeks
  await advanceTime((60 * 60 * 24 * 7 * 4) + 5)

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call modifyTimelockInterval`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'modifyTimelockInterval',
    'send',
    ['0xaaaaaaaa', 10000]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call modifyTimelockExpiration`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'modifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300000],
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration if expiration is too short`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'modifyTimelockExpiration',
    'send',
    ['0xe950c085', 30],
    false
  )

  const MockDharmaKeyRingFactory = await runTest(
    `MockDharmaKeyRingFactory contract deployment`,
    MockDharmaKeyRingFactoryDeployer,
    '',
    'deploy',
    []
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with no keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [], []],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with null address as key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [constants.NULL_ADDRESS], [3]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with non-dual key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [address], [1]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with admin threshold > 1`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [2, 1, [address], [3]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with executor threshold > 1`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 2, [address], [3]],
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
    `DharmaKeyRingFactoryV1 reverts when no new key ring supplied`,
    DharmaKeyRingFactoryV1,
    'getNextKeyRing',
    'call',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV1 can call newKeyRingAndDaiWithdrawal`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndDaiWithdrawal',
    'send',
    [address, address, 0, address, 0, '0x', '0x'],
    false
  )

  await runTest(
    `DharmaKeyRingFactoryV1 can call newKeyRingAndUSDCWithdrawal`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndUSDCWithdrawal',
    'send',
    [address, address, 0, address, 0, '0x', '0x'],
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
    UserSmartWalletV5.options.address
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

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with no keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [0, 0, [], []],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with admin threshold of 0`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [0, 1, [address], [3]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with executor threshold of 0`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 0, [address], [3]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring where length of keys and types are not equal`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [address, addressTwo], [3]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with duplicate keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [address, address], [3, 3]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with no admin key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [address], [1]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with less admin keys than threshold`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [2, 1, [address], [3]],
    false
  )

  await runTest(
    `MockDharmaKeyRingFactory can deploy an Adharma key ring with multiple keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [2, 2, [address, addressTwo], [3, 3]]
  )

  await runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with no standard key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [address], [2]],
    false
  )

  await runTest(
    `TimelockEdgecaseTester contract deployment edge case 1`,
    TimelockEdgecaseTesterDeployer,
    '',
    'deploy',
    [0],
    false
  )

  await runTest(
    `TimelockEdgecaseTester contract deployment edge case 2`,
    TimelockEdgecaseTesterDeployer,
    '',
    'deploy',
    [1],
    false
  )

  await runTest(
    `TimelockEdgecaseTester contract deployment edge case 3`,
    TimelockEdgecaseTesterDeployer,
    '',
    'deploy',
    [2],
    false
  )

  const DharmaUpgradeMultisig = await runTest(
    `DharmaUpgradeMultisig contract deployment`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[ownerOne, ownerTwo, ownerThree, ownerFour, ownerFive]]
  )

  const DharmaAccountRecoveryMultisig = await runTest(
    `DharmaAccountRecoveryMultisig contract deployment`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[ownerOne, ownerTwo, ownerThree, ownerFour]]
  )

  const DharmaKeyRegistryMultisig = await runTest(
    `DharmaKeyRegistryMultisig contract deployment`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[ownerOne, ownerTwo, ownerThree, ownerFour, ownerFive]]
  )

  let rawData = '0x'
  let executorGasLimit = 100000000000
  let hashInputs
  let hash
  let ownerOneSig
  let ownerTwoSig
  let ownerThreeSig
  let ownerSigs
  let ownerSigsOutOfOrder
  let unownedSig
  let unownedSigs

  const bizarreSigs = (
    '0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0' +
    '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A11b' +
    '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0' +
    '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A01a'   
  )

  await runTest(
    `DharmaUpgradeMultisig can get the initial nonce`,
    DharmaUpgradeMultisig,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    `DharmaUpgradeMultisig can get the owners`,
    DharmaUpgradeMultisig,
    'getOwners',
    'call',
    [],
    true,
    value => {
      assert.deepEqual(
        value, [ownerOne, ownerTwo, ownerThree, ownerFour, ownerFive]
      )
    }
  )

  await runTest(
    `DharmaUpgradeMultisig can get an owner`,
    DharmaUpgradeMultisig,
    'isOwner',
    'call',
    [ownerOne],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    `DharmaUpgradeMultisig returns false for a non-owner`,
    DharmaUpgradeMultisig,
    'isOwner',
    'call',
    [address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    `DharmaUpgradeMultisig can get the threshold`,
    DharmaUpgradeMultisig,
    'getThreshold',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  await runTest(
    `DharmaUpgradeMultisig can get the destination`,
    DharmaUpgradeMultisig,
    'getDestination',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS)
    }
  )

  // Generate the messsage hash based on the supplied parameters.
  hashInputs = (
    DharmaUpgradeMultisig.options.address +
    '0'.padStart(64, '0') +
    address.slice(2) +
    executorGasLimit.toString(16).padStart(64, '0') +
    rawData.slice(2)
  )

  hash = util.bufferToHex(util.keccak256(hashInputs))

  await runTest(
    `DharmaUpgradeMultisig can get a hash`,
    DharmaUpgradeMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  await runTest(
    `DharmaUpgradeMultisig can get a hash with a specific nonce`,
    DharmaUpgradeMultisig,
    'getHash',
    'call',
    [rawData, address, executorGasLimit, 0],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerThreeSig = signHashedPrefixedHexString(hash, ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2) + ownerThreeSig.slice(2)
  unownedSig = signHashedPrefixedHexString(hash, address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await runTest(
    `DharmaUpgradeMultisig cannot call execute from non-executor`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, addressTwo, executorGasLimit, ownerSigs],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig cannot call execute with oddly-sized signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs + '1234'],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig cannot call execute with non-compliant signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, bizarreSigs],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig cannot call execute without enough signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs.slice(0, -130)],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig cannot call execute without owner signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, unownedSigs],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig cannot call execute with out-of-order signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigsOutOfOrder],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig can call execute`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaUpgradeMultisig nonce is incremented`,
    DharmaUpgradeMultisig,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  await runTest(
    `DharmaKeyRegistryMultisig can get the initial nonce`,
    DharmaKeyRegistryMultisig,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    `DharmaKeyRegistryMultisig can get the owners`,
    DharmaKeyRegistryMultisig,
    'getOwners',
    'call',
    [],
    true,
    value => {
      assert.deepEqual(
        value, [ownerOne, ownerTwo, ownerThree, ownerFour, ownerFive]
      )
    }
  )

  await runTest(
    `DharmaKeyRegistryMultisig can get an owner`,
    DharmaKeyRegistryMultisig,
    'isOwner',
    'call',
    [ownerOne],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    `DharmaKeyRegistryMultisig returns false for a non-owner`,
    DharmaKeyRegistryMultisig,
    'isOwner',
    'call',
    [address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    `DharmaKeyRegistryMultisig can get the threshold`,
    DharmaKeyRegistryMultisig,
    'getThreshold',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  await runTest(
    `DharmaKeyRegistryMultisig can get the destination`,
    DharmaKeyRegistryMultisig,
    'getDestination',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, constants.KEY_REGISTRY_V2_ADDRESS)
    }
  )

  // Generate the messsage hash based on the supplied parameters.
  hashInputs = (
    DharmaKeyRegistryMultisig.options.address +
    '0'.padStart(64, '0') +
    address.slice(2) +
    executorGasLimit.toString(16).padStart(64, '0') +
    rawData.slice(2)
  )

  hash = util.bufferToHex(util.keccak256(hashInputs))

  await runTest(
    `DharmaKeyRegistryMultisig can get a hash`,
    DharmaKeyRegistryMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  await runTest(
    `DharmaKeyRegistryMultisig can get a hash with a specific nonce`,
    DharmaKeyRegistryMultisig,
    'getHash',
    'call',
    [rawData, address, executorGasLimit, 0],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerThreeSig = signHashedPrefixedHexString(hash, ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2) + ownerThreeSig.slice(2)
  unownedSig = signHashedPrefixedHexString(hash, address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await runTest(
    `DharmaKeyRegistryMultisig cannot call execute from non-executor`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, addressTwo, executorGasLimit, ownerSigs],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig cannot call execute with oddly-sized signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs + '1234'],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig cannot call execute with non-compliant signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, bizarreSigs],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig cannot call execute without enough signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs.slice(0, -130)],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig cannot call execute without owner signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, unownedSigs],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig cannot call execute with out-of-order signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigsOutOfOrder],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig can call execute`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaKeyRegistryMultisig nonce is incremented`,
    DharmaKeyRegistryMultisig,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  await runTest(
    `DharmaAccountRecoveryMultisig can get the initial nonce`,
    DharmaAccountRecoveryMultisig,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await runTest(
    `DharmaAccountRecoveryMultisig can get the owners`,
    DharmaAccountRecoveryMultisig,
    'getOwners',
    'call',
    [],
    true,
    value => {
      assert.deepEqual(
        value, [ownerOne, ownerTwo, ownerThree, ownerFour]
      )
    }
  )

  await runTest(
    `DharmaAccountRecoveryMultisig can get an owner`,
    DharmaAccountRecoveryMultisig,
    'isOwner',
    'call',
    [ownerOne],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    `DharmaAccountRecoveryMultisig returns false for a non-owner`,
    DharmaAccountRecoveryMultisig,
    'isOwner',
    'call',
    [address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    `DharmaAccountRecoveryMultisig can get the threshold`,
    DharmaAccountRecoveryMultisig,
    'getThreshold',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '2')
    }
  )

  await runTest(
    `DharmaAccountRecoveryMultisig can get the destination`,
    DharmaAccountRecoveryMultisig,
    'getDestination',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS)
    }
  )

  // Generate the messsage hash based on the supplied parameters.
  hashInputs = (
    DharmaAccountRecoveryMultisig.options.address +
    '0'.padStart(64, '0') +
    address.slice(2) +
    executorGasLimit.toString(16).padStart(64, '0') +
    rawData.slice(2)
  )

  hash = util.bufferToHex(util.keccak256(hashInputs))

  await runTest(
    `DharmaAccountRecoveryMultisig can get a hash`,
    DharmaAccountRecoveryMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  await runTest(
    `DharmaAccountRecoveryMultisig can get a hash with a specific nonce`,
    DharmaAccountRecoveryMultisig,
    'getHash',
    'call',
    [rawData, address, executorGasLimit, 0],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2)
  unownedSig = signHashedPrefixedHexString(hash, address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2)

  await runTest(
    `DharmaAccountRecoveryMultisig cannot call execute from non-executor`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, addressTwo, executorGasLimit, ownerSigs],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig cannot call execute with oddly-sized signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs + '1234'],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig cannot call execute with non-compliant signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, bizarreSigs],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig cannot call execute without enough signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerOneSig],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig cannot call execute without owner signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, unownedSigs],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig cannot call execute with out-of-order signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigsOutOfOrder],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig can call execute`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaAccountRecoveryMultisig nonce is incremented`,
    DharmaAccountRecoveryMultisig,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  const DharmaEscapeHatchRegistry = await runTest(
    `DharmaEscapeHatchRegistry contract deployment`,
    DharmaEscapeHatchRegistryDeployer,
    '',
    'deploy'
  )

  await runTest(
    `DharmaEscapeHatchRegistry confirms that an escape hatch does not exist until set`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatch',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.exists)
      assert.strictEqual(value.escapeHatch, constants.NULL_ADDRESS)
    }
  )

  await runTest(
    `DharmaEscapeHatchRegistry can set the null address as an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaEscapeHatchRegistry can set an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [addressTwo]
  )

  await runTest(
    `DharmaEscapeHatchRegistry can get an escape hatch account once set`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatch',
    'call',
    [],
    true,
    value => {
      assert.ok(value.exists)
      assert.strictEqual(value.escapeHatch, addressTwo)
    }
  )

  let fallbackEscapeHatch = await web3.eth.call({
      to: DharmaEscapeHatchRegistry.options.address,
      from: address,
      data: "0x"
  })
  
  console.log(
    ' ✓ DharmaEscapeHatchRegistry can get an escape hatch account using the fallback'
  )
  assert.strictEqual(
    web3.eth.abi.decodeParameter('address', fallbackEscapeHatch),
    addressTwo
  )
  passed++

  await runTest(
    `DharmaEscapeHatchRegistry can get an escape hatch for a specific smart wallet`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatchForSmartWallet',
    'call',
    [address],
    true,
    value => {
      assert.ok(value.exists)
      assert.strictEqual(value.escapeHatch, addressTwo)
    },
    originalAddress
  )

  await runTest(
    `DharmaEscapeHatchRegistry cannot get an escape hatch the null address`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatchForSmartWallet',
    'call',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaEscapeHatchRegistry can remove an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'removeEscapeHatch'
  )

  await runTest(
    `DharmaEscapeHatchRegistry confirms that an escape hatch is successfully removed`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatch',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.exists)
      assert.strictEqual(value.escapeHatch, constants.NULL_ADDRESS)
    }
  )

  fallbackEscapeHatch = await web3.eth.call({
      to: DharmaEscapeHatchRegistry.options.address,
      from: address,
      data: "0x"
  })

  console.log(
    ' ✓ DharmaEscapeHatchRegistry can gets null address for removed escape hatch account using the fallback'
  )
  assert.strictEqual(
    web3.eth.abi.decodeParameter('address', fallbackEscapeHatch),
    constants.NULL_ADDRESS
  )
  passed++

  await runTest(
    `DharmaEscapeHatchRegistry will not fire an event when removing an unset escape hatch account`,
    DharmaEscapeHatchRegistry,
    'removeEscapeHatch'
  )

  await runTest(
    `DharmaEscapeHatchRegistry confirms that escape hatch functionality is not initially disabled`,
    DharmaEscapeHatchRegistry,
    'hasDisabledEscapeHatchForSmartWallet',
    'call',
    [address],
    true,
    value => {
      assert.ok(!value)
    },
    originalAddress
  )

  await runTest(
    `DharmaEscapeHatchRegistry cannot get disabled status for null address`,
    DharmaEscapeHatchRegistry,
    'hasDisabledEscapeHatchForSmartWallet',
    'call',
    [constants.NULL_ADDRESS],
    false
  )

  await runTest(
    `DharmaEscapeHatchRegistry can reset an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [ownerOne]
  )

  await runTest(
    `DharmaEscapeHatchRegistry can get an escape hatch account once reset`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatch',
    'call',
    [],
    true,
    value => {
      assert.ok(value.exists)
      assert.strictEqual(value.escapeHatch, ownerOne)
    }
  )

  await runTest(
    `DharmaEscapeHatchRegistry setting an existing escape hatch account is a no-op`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [ownerOne]
  )

  await runTest(
    `DharmaEscapeHatchRegistry can disable the escape hatch mechanism`,
    DharmaEscapeHatchRegistry,
    'permanentlyDisableEscapeHatch'
  )

  await runTest(
    `DharmaEscapeHatchRegistry confirms that escape hatch functionality is disabled`,
    DharmaEscapeHatchRegistry,
    'hasDisabledEscapeHatchForSmartWallet',
    'call',
    [address],
    true,
    value => {
      assert.ok(value)
    },
    originalAddress
  )

  await runTest(
    `DharmaEscapeHatchRegistry confirms that an escape hatch is successfully removed when disabling`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatch',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.exists)
      assert.strictEqual(value.escapeHatch, constants.NULL_ADDRESS)
    }
  )

  fallbackEscapeHatch = await web3.eth.call({
      to: DharmaEscapeHatchRegistry.options.address,
      from: address,
      data: "0x"
  })

  console.log(
    ' ✓ DharmaEscapeHatchRegistry can gets null address for removed escape hatch account after disabling using the fallback'
  )
  assert.strictEqual(
    web3.eth.abi.decodeParameter('address', fallbackEscapeHatch),
    constants.NULL_ADDRESS
  )
  passed++

  await runTest(
    `DharmaEscapeHatchRegistry confirms escape hatch is removed after disabling for for a specific smart wallet`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatchForSmartWallet',
    'call',
    [address],
    true,
    value => {
      assert.ok(!value.exists)
      assert.strictEqual(value.escapeHatch, constants.NULL_ADDRESS)
    },
    originalAddress
  )

  await runTest(
    `DharmaEscapeHatchRegistry cannot set an escape hatch account once disabled`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [ownerTwo],
    false
  )

  await runTest(
    `DharmaEscapeHatchRegistry cannot remove an escape hatch account once disabled`,
    DharmaEscapeHatchRegistry,
    'removeEscapeHatch',
    'send',
    [],
    false
  )

  await runTest(
    `DharmaEscapeHatchRegistry cannot re-disable an escape hatch account once disabled`,
    DharmaEscapeHatchRegistry,
    'permanentlyDisableEscapeHatch',
    'send',
    [],
    false
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 owner can start ownership transfer to multisig`,
    DharmaAccountRecoveryManagerV2,
    'transferOwnership',
    'send',
    [DharmaAccountRecoveryMultisig.options.address]
  )

  rawData = DharmaAccountRecoveryManagerV2.methods.acceptOwnership().encodeABI()
  await runTest(
    `DharmaAccountRecoveryMultisig can get a hash`,
    DharmaAccountRecoveryMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  // accept ownership
  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2)

  await runTest(
    `DharmaAccountRecoveryMultisig can call execute to accept ownership`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 owner is now set to multisig`,
    DharmaAccountRecoveryManagerV2,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, DharmaAccountRecoveryMultisig.options.address)
    }
  )

  // TODO: test account recovery using the multisig?

  // transfer ownership back
  rawData = DharmaAccountRecoveryManagerV2.methods.transferOwnership(address).encodeABI()
  await runTest(
    `DharmaAccountRecoveryMultisig can get a hash`,
    DharmaAccountRecoveryMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2)

  await runTest(
    `DharmaAccountRecoveryMultisig can call execute to transfer ownership back`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 EOA can accept ownership transfer from multisig`,
    DharmaAccountRecoveryManagerV2,
    'acceptOwnership'
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 owner is now set to EOA`,
    DharmaAccountRecoveryManagerV2,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    `DharmaKeyRegistryV2 owner can start ownership transfer to multisig`,
    DharmaKeyRegistryV2,
    'transferOwnership',
    'send',
    [DharmaKeyRegistryMultisig.options.address]
  )

  rawData = DharmaKeyRegistryV2.methods.acceptOwnership().encodeABI()
  await runTest(
    `DharmaKeyRegistryMultisig can get a hash`,
    DharmaKeyRegistryMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  // accept ownership
  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerThreeSig = signHashedPrefixedHexString(hash, ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await runTest(
    `DharmaKeyRegistryMultisig can call execute to accept ownership`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaKeyRegistryV2 owner is now set to multisig`,
    DharmaKeyRegistryV2,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRegistryMultisig.options.address)
    }
  )

  // TODO: test setting a new key using the multisig?

  // transfer ownership back
  rawData = DharmaKeyRegistryV2.methods.transferOwnership(address).encodeABI()
  await runTest(
    `DharmaKeyRegistryMultisig can get a hash`,
    DharmaKeyRegistryMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerThreeSig = signHashedPrefixedHexString(hash, ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await runTest(
    `DharmaKeyRegistryMultisig can call execute to transfer ownership back`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaKeyRegistryV2 EOA can accept ownership transfer from multisig`,
    DharmaKeyRegistryV2,
    'acceptOwnership'
  )

  await runTest(
    `DharmaKeyRegistryV2 owner is now set to EOA`,
    DharmaKeyRegistryV2,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner is initially set to an EOA`,
    DharmaUpgradeBeaconControllerManager,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can start ownership transfer to multisig`,
    DharmaUpgradeBeaconControllerManager,
    'transferOwnership',
    'send',
    [DharmaUpgradeMultisig.options.address]
  )

  rawData = DharmaUpgradeBeaconControllerManager.methods.acceptOwnership().encodeABI()
  await runTest(
    `DharmaUpgradeMultisig can get a hash`,
    DharmaUpgradeMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  // accept ownership
  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerThreeSig = signHashedPrefixedHexString(hash, ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await runTest(
    `DharmaUpgradeMultisig can call execute to accept ownership`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner is now set to multisig`,
    DharmaUpgradeBeaconControllerManager,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, DharmaUpgradeMultisig.options.address)
    }
  )

  // TODO: test an upgrade, rollback, etc with the multisig?

  // transfer ownership back
  rawData = DharmaUpgradeBeaconControllerManager.methods.transferOwnership(address).encodeABI()
  await runTest(
    `DharmaUpgradeMultisig can get a hash`,
    DharmaUpgradeMultisig,
    'getNextHash',
    'call',
    [rawData, address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  ownerOneSig = signHashedPrefixedHexString(hash, ownerOne)
  ownerTwoSig = signHashedPrefixedHexString(hash, ownerTwo)
  ownerThreeSig = signHashedPrefixedHexString(hash, ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await runTest(
    `DharmaUpgradeMultisig can call execute to transfer ownership back`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, address, executorGasLimit, ownerSigs]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager EOA can accept ownership transfer from multisig`,
    DharmaUpgradeBeaconControllerManager,
    'acceptOwnership'
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner is now set to EOA`,
    DharmaUpgradeBeaconControllerManager,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  // Transfer smart wallet controller ownership to coverage manager
  await runTest(
    `DharmaUpgradeBeaconController can transfer ownership to manager`,
    DharmaUpgradeBeaconController,
    'transferOwnership',
    'send',
    [DharmaUpgradeBeaconControllerManagerCoverage.options.address]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when it doesn't own keyring controller`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await runTest(
    `DharmaKeyRingUpgradeBeaconController can transfer ownership to manager`,
    DharmaKeyRingUpgradeBeaconController,
    'transferOwnership',
    'send',
    [DharmaUpgradeBeaconControllerManagerCoverage.options.address]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can activate Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency'
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can get contingency status when activated`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'contingencyStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.armed)
      assert.ok(value.activated)
      //assert.strictEqual(value.activationTime, '?')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can re-arm an active Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when already active`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager now gets a prior implementation count`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'getTotalPriorImplementations',
    'call',
    [
      DharmaUpgradeBeaconController.options.address,
      DharmaUpgradeBeacon.options.address
    ],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can get the initial prior implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'getPriorImplementation',
    'call',
    [
      DharmaUpgradeBeaconController.options.address,
      DharmaUpgradeBeacon.options.address,
      0
    ],
    true,
    value => {
      assert.strictEqual(
        value.priorImplementation,
        AdharmaSmartWalletImplementation.options.address
      )
      assert.ok(value.rollbackAllowed)
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call "exitAdharmaContingency" before 48 hours has elapsed`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [
      address,
      address
    ],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can rollback to initial prior implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      DharmaUpgradeBeacon.options.address,
      0
    ]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contingency status is exited after rollback`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'contingencyStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.armed)
      assert.ok(!value.activated)
      assert.strictEqual(value.activationTime, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot rollback to implementation with no index`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [address, address, 100],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager owner can re-arm an Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contingency status shows armed`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'contingencyStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(value.armed)
      assert.ok(!value.activated)
      assert.strictEqual(value.activationTime, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can rollback to initial prior implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      DharmaUpgradeBeacon.options.address,
      0
    ]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contingency status shows no longer armed`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'contingencyStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.armed)
      assert.ok(!value.activated)
      assert.strictEqual(value.activationTime, '0')
    }
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can block rollback to prior implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'blockRollback',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      DharmaUpgradeBeacon.options.address,
      0
    ]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot block a blocked rollback`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'blockRollback',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      DharmaUpgradeBeacon.options.address,
      0
    ],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot rollback to a blocked rollback`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'rollback',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      DharmaUpgradeBeacon.options.address,
      0
    ],
    false
  )

  // advance time by 90 days
  await advanceTime((60 * 60 * 24 * 90) + 5)

  await runTest(
    `DharmaUpgradeBeaconControllerManager deadman switch can arm an Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'armAdharmaContingency',
    'send',
    [true],
    true,
    receipt => {},
    originalAddress
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager deadman switch can activate an Adharma Contingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'activateAdharmaContingency',
    'send',
    [],
    true,
    receipt => {},
    originalAddress
  )

  // advance time by 2 days
  await advanceTime((60 * 60 * 24 * 2) + 5)

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call exitAdharmaContingency with null implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [
      constants.NULL_ADDRESS,
      address
    ],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager cannot call exitAdharmaContingency with non-contract implementation`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [
      address,
      address
    ],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can call exitAdharmaContingency`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'exitAdharmaContingency',
    'send',
    [
      DharmaSmartWalletImplementationV5.options.address,
      DharmaKeyRingImplementationV1.options.address
    ]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can have an EOA accept controller ownership`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'agreeToAcceptControllerOwnership',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      true
    ]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager can initiate timelock for transferring controller ownership`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'initiateTransferControllerOwnership',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      address,
      0
    ]
  )

  // advance time by 4 weeks
  await advanceTime((60 * 60 * 24 * 7 * 4) + 5)

  await runTest(
    `DharmaUpgradeBeaconControllerManager can transfer controller ownership`,
    DharmaUpgradeBeaconControllerManagerCoverage,
    'transferControllerOwnership',
    'send',
    [
      DharmaUpgradeBeaconController.options.address,
      address
    ]
  )

  await runTest(
    `DharmaUpgradeBeaconController can get new owner`,
    DharmaUpgradeBeaconController,
    'isOwner',
    'call',
    [],
    true,
    value => {
      assert.ok(value)
    }
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
