var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')

let DharmaUpgradeBeaconArtifact;
let DharmaUpgradeBeaconControllerArtifact;
let DharmaUpgradeBeaconEnvoyArtifact;
let DharmaKeyRingUpgradeBeaconArtifact;
let DharmaKeyRegistryV1Artifact;
let DharmaKeyRegistryV2Artifact;
let DharmaAccountRecoveryManagerV2Artifact;
let DharmaSmartWalletFactoryV1Artifact;
let UpgradeBeaconProxyV1Artifact;
let AdharmaSmartWalletImplementationArtifact;
let AdharmaKeyRingImplementationArtifact;
let DharmaUpgradeBeaconControllerManagerArtifact;
let DharmaKeyRingFactoryV2Artifact;
let DharmaEscapeHatchRegistryArtifact;

const DharmaUpgradeMultisigArtifact = require('../../build/contracts/DharmaUpgradeMultisig.json')
const DharmaAccountRecoveryMultisigArtifact = require('../../build/contracts/DharmaAccountRecoveryMultisig.json')
const DharmaKeyRegistryMultisigArtifact = require('../../build/contracts/DharmaKeyRegistryMultisig.json')
const DharmaTestingMultisigArtifact = require('../../build/contracts/DharmaTestingMultisig.json')

const DharmaSmartWalletImplementationV0Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV0.json')
const DharmaSmartWalletImplementationV1Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV1.json')
const DharmaSmartWalletImplementationV2Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV2.json')
const DharmaSmartWalletImplementationV3Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV3.json')
const DharmaSmartWalletImplementationV4Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV4.json')

const DharmaKeyRingImplementationV0Artifact = require('../../build/contracts/DharmaKeyRingImplementationV0.json')
const DharmaKeyRingImplementationV1Artifact = require('../../build/contracts/DharmaKeyRingImplementationV1.json')
const DharmaKeyRingImplementationV2Artifact = require('../../build/contracts/DharmaKeyRingImplementationV2.json')

const UpgradeBeaconImplementationCheckArtifact = require('../../build/contracts/UpgradeBeaconImplementationCheck.json')
const BadBeaconArtifact = require('../../build/contracts/BadBeacon.json')
const BadBeaconTwoArtifact = require('../../build/contracts/BadBeaconTwo.json')
const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const IERC20Artifact = require('../../build/contracts/IERC20.json')

const DharmaUpgradeBeaconControllerCoverageArtifact = require('../../build/contracts/DharmaUpgradeBeaconController.json')
const DharmaUpgradeBeaconControllerManagerCoverageArtifact = require('../../build/contracts/DharmaUpgradeBeaconControllerManager.json')

const ImmutableCreate2FactoryArtifact = require('../../build/contracts/ImmutableCreate2Factory.json')
const IndestructibleRegistryArtifact = require('../../build/contracts/IndestructibleRegistry.json')
const CodeHashCacheArtifact = require('../../build/contracts/CodeHashCache.json')

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
  if (testingContext === 'coverage') {
    DharmaUpgradeBeaconEnvoyArtifact = require('../../../build/contracts/DharmaUpgradeBeaconEnvoy.json')
    DharmaUpgradeBeaconControllerArtifact = require('../../../build/contracts/DharmaUpgradeBeaconController.json')
    DharmaUpgradeBeaconArtifact = require('../../../build/contracts/DharmaUpgradeBeacon.json')
    DharmaKeyRingUpgradeBeaconArtifact = require('../../../build/contracts/DharmaKeyRingUpgradeBeacon.json')
    DharmaKeyRegistryV1Artifact = require('../../../build/contracts/DharmaKeyRegistryV1.json')
    DharmaKeyRegistryV2Artifact = require('../../../build/contracts/DharmaKeyRegistryV2.json')
    DharmaSmartWalletFactoryV1Artifact = require('../../../build/contracts/DharmaSmartWalletFactoryV1.json')
    DharmaKeyRingFactoryV2Artifact = require('../../../build/contracts/DharmaKeyRingFactoryV2.json')
    UpgradeBeaconProxyV1Artifact = require('../../../build/contracts/UpgradeBeaconProxyV1.json')
    DharmaAccountRecoveryManagerV2Artifact = require('../../../build/contracts/DharmaAccountRecoveryManagerV2.json')
    AdharmaSmartWalletImplementationArtifact = require('../../../build/contracts/AdharmaSmartWalletImplementation.json')
    AdharmaKeyRingImplementationArtifact = require('../../../build/contracts/AdharmaKeyRingImplementation.json')
    DharmaUpgradeBeaconControllerManagerArtifact = require('../../../build/contracts/DharmaUpgradeBeaconControllerManager.json')
    DharmaEscapeHatchRegistryArtifact = require('../../../build/contracts/DharmaEscapeHatchRegistry.json')
  } else {
    DharmaUpgradeBeaconEnvoyArtifact = require('../../build/contracts/DharmaUpgradeBeaconEnvoy.json')
    DharmaUpgradeBeaconControllerArtifact = require('../../build/contracts/DharmaUpgradeBeaconController.json')
    DharmaUpgradeBeaconArtifact = require('../../build/contracts/DharmaUpgradeBeacon.json')
    DharmaKeyRingUpgradeBeaconArtifact = require('../../build/contracts/DharmaKeyRingUpgradeBeacon.json')
    DharmaKeyRegistryV1Artifact = require('../../build/contracts/DharmaKeyRegistryV1.json')
    DharmaKeyRegistryV2Artifact = require('../../build/contracts/DharmaKeyRegistryV2.json')
    DharmaSmartWalletFactoryV1Artifact = require('../../build/contracts/DharmaSmartWalletFactoryV1.json')
    DharmaKeyRingFactoryV2Artifact = require('../../build/contracts/DharmaKeyRingFactoryV2.json')
    UpgradeBeaconProxyV1Artifact = require('../../build/contracts/UpgradeBeaconProxyV1.json')
    DharmaAccountRecoveryManagerV2Artifact = require('../../build/contracts/DharmaAccountRecoveryManagerV2.json')
    AdharmaSmartWalletImplementationArtifact = require('../../build/contracts/AdharmaSmartWalletImplementation.json')
    AdharmaKeyRingImplementationArtifact = require('../../build/contracts/AdharmaKeyRingImplementation.json')
    DharmaUpgradeBeaconControllerManagerArtifact = require('../../build/contracts/DharmaUpgradeBeaconControllerManager.json')
    DharmaEscapeHatchRegistryArtifact = require('../../build/contracts/DharmaEscapeHatchRegistry.json')
  }

  var web3 = provider
  let passed = 0
  let failed = 0
  let gasUsage = {}
  let counts = {}

  /*
  console.log(
    swapMetadataHash(
      DharmaUpgradeBeaconControllerManagerArtifact.bytecode,
      constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
    ),
    web3.utils.keccak256(swapMetadataHash(
      DharmaUpgradeBeaconControllerManagerArtifact.bytecode,
      constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
    ), {encoding: 'hex'})
  )
  process.exit(0)
  */

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

  const DharmaEscapeHatchRegistry = new web3.eth.Contract(
    DharmaEscapeHatchRegistryArtifact.abi,
    constants.ESCAPE_HATCH_REGISTRY_ADDRESS
  )

  const DharmaSmartWalletFactoryV1 = new web3.eth.Contract(
    DharmaSmartWalletFactoryV1Artifact.abi,
    constants.FACTORY_ADDRESS
  )

  const DharmaKeyRingFactoryV2 = new web3.eth.Contract(
    DharmaKeyRingFactoryV2Artifact.abi,
    constants.KEY_RING_FACTORY_V2_ADDRESS
  )

  const ActualIndestructibleRegistry = new web3.eth.Contract(
    IndestructibleRegistryArtifact.abi,
    constants.INDESTRUCTIBLE_REGISTRY_ADDRESS
  )

  const IndestructibleRegistryDeployer = new web3.eth.Contract(
    IndestructibleRegistryArtifact.abi
  )
  IndestructibleRegistryDeployer.options.data = (
    swapMetadataHash(
      IndestructibleRegistryArtifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const CodeHashCacheDeployer = new web3.eth.Contract(
    CodeHashCacheArtifact.abi
  )
  CodeHashCacheDeployer.options.data = (
    swapMetadataHash(
      CodeHashCacheArtifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
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

  const DharmaTestingMultisigDeployer = new web3.eth.Contract(
    DharmaTestingMultisigArtifact.abi
  )
  DharmaTestingMultisigDeployer.options.data = (
    DharmaTestingMultisigArtifact.bytecode
  )

  const DharmaUpgradeBeaconControllerDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerArtifact.abi
  )
  DharmaUpgradeBeaconControllerDeployer.options.data = (
    DharmaUpgradeBeaconControllerArtifact.bytecode
  )

  const DharmaUpgradeBeaconControllerCoverageDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerCoverageArtifact.abi
  )
  DharmaUpgradeBeaconControllerCoverageDeployer.options.data = (
    DharmaUpgradeBeaconControllerCoverageArtifact.bytecode
  )

  const DharmaUpgradeBeaconControllerManagerDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerManagerArtifact.abi
  )
  DharmaUpgradeBeaconControllerManagerDeployer.options.data = (
    DharmaUpgradeBeaconControllerManagerArtifact.bytecode
  )

  const DharmaUpgradeBeaconControllerManagerCoverageDeployer = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerManagerCoverageArtifact.abi
  )
  DharmaUpgradeBeaconControllerManagerCoverageDeployer.options.data = (
    DharmaUpgradeBeaconControllerManagerCoverageArtifact.bytecode
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

  const BadBeaconDeployer = new web3.eth.Contract(BadBeaconArtifact.abi)
  BadBeaconDeployer.options.data = BadBeaconArtifact.bytecode

  const BadBeaconTwoDeployer = new web3.eth.Contract(BadBeaconTwoArtifact.abi)
  BadBeaconTwoDeployer.options.data = BadBeaconTwoArtifact.bytecode

  const UpgradeBeaconProxyV1Deployer = new web3.eth.Contract(
    UpgradeBeaconProxyV1Artifact.abi
  )
  UpgradeBeaconProxyV1Deployer.options.data = (
    UpgradeBeaconProxyV1Artifact.bytecode
  )

  const DharmaKeyRegistryV1Deployer = new web3.eth.Contract(
    DharmaKeyRegistryV1Artifact.abi
  )
  DharmaKeyRegistryV1Deployer.options.data = (
    DharmaKeyRegistryV1Artifact.bytecode
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

  const DharmaKeyRingFactoryV2Deployer = new web3.eth.Contract(
    DharmaKeyRingFactoryV2Artifact.abi
  )
  DharmaKeyRingFactoryV2Deployer.options.data = (
    DharmaKeyRingFactoryV2Artifact.bytecode
  )

  const AdharmaSmartWalletImplementationDeployer = new web3.eth.Contract(
    AdharmaSmartWalletImplementationArtifact.abi
  )
  AdharmaSmartWalletImplementationDeployer.options.data = (
    swapMetadataHash(
      AdharmaSmartWalletImplementationArtifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )
 
  const AdharmaKeyRingImplementationDeployer = new web3.eth.Contract(
    AdharmaKeyRingImplementationArtifact.abi
  )
  AdharmaKeyRingImplementationDeployer.options.data = (
    swapMetadataHash(
      AdharmaKeyRingImplementationArtifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const DharmaAccountRecoveryManagerV2Deployer = new web3.eth.Contract(
    DharmaAccountRecoveryManagerV2Artifact.abi
  )
  DharmaAccountRecoveryManagerV2Deployer.options.data = (
    swapMetadataHash(
      DharmaAccountRecoveryManagerV2Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const DharmaSmartWalletImplementationV0Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV0Artifact.abi
  )
  DharmaSmartWalletImplementationV0Deployer.options.data = (
    swapMetadataHash(
      DharmaSmartWalletImplementationV0Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    ) 
  )

  const DharmaSmartWalletImplementationV1Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV1Artifact.abi
  )
  DharmaSmartWalletImplementationV1Deployer.options.data = (
    swapMetadataHash(
      DharmaSmartWalletImplementationV1Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const DharmaSmartWalletImplementationV2Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV2Artifact.abi
  )
  DharmaSmartWalletImplementationV2Deployer.options.data = (
    swapMetadataHash(
      DharmaSmartWalletImplementationV2Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const DharmaSmartWalletImplementationV3Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV3Artifact.abi
  )
  DharmaSmartWalletImplementationV3Deployer.options.data = (
    swapMetadataHash(
      DharmaSmartWalletImplementationV3Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const DharmaSmartWalletImplementationV4Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV4Artifact.abi
  )
  DharmaSmartWalletImplementationV4Deployer.options.data = (
    swapMetadataHash(
      DharmaSmartWalletImplementationV4Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const DharmaKeyRingImplementationV0Deployer = new web3.eth.Contract(
    DharmaKeyRingImplementationV0Artifact.abi
  )
  DharmaKeyRingImplementationV0Deployer.options.data = (
    swapMetadataHash(
      DharmaKeyRingImplementationV0Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  const DharmaKeyRingImplementationV1Deployer = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi
  )
  DharmaKeyRingImplementationV1Deployer.options.data = (
    swapMetadataHash(
      DharmaKeyRingImplementationV1Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )

  /*
  const DharmaKeyRingImplementationV2Deployer = new web3.eth.Contract(
    DharmaKeyRingImplementationV2Artifact.abi
  )
  DharmaKeyRingImplementationV2Deployer.options.data = (
    swapMetadataHash(
      DharmaKeyRingImplementationV2Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )
  */

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

  console.log('funding initial create2 contract deployer address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: constants.KEYLESS_CREATE2_DEPLOYER_ADDRESS,
    value: web3.utils.toWei('0.01', 'ether'),
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

  let currentIndestructibleRegistryRuntimeHash;
  await runTest(
    'Current runtime hash at address of indestructible registry can be retrieved',
    MockCodeCheck,
    'hash',
    'call',
    [constants.INDESTRUCTIBLE_REGISTRY_ADDRESS],
    true,
    value => {
      currentIndestructibleRegistryRuntimeHash = value
    }
  )

  // submit the indestructible registry deployment transaction if needed
  if (currentIndestructibleRegistryRuntimeHash !== constants.INDESTRUCTIBLE_REGISTRY_RUNTIME_HASH) {
    console.log(` ✓ submitting indestructible registry deployment through immutable create2 contract...`)
    await web3.eth.sendTransaction({
      from: originalAddress,
      to: constants.IMMUTABLE_CREATE2_FACTORY_ADDRESS,
      value: '0',
      gas: (testingContext !== 'coverage') ? '3000000' : gasLimit - 1,
      gasPrice: 1,
      data: constants.INDESTRUCTIBLE_REGISTRY_CREATION_TX
    });
    passed++    
  } else {
    console.log(' ✓ indestructible registry contract already deployed, skipping...')
  }

  // BEGIN ACTUAL DEPLOYMENT TESTS

  await runTest(
    `DharmaUpgradeBeaconController contract deployment fails before other deployments`,
    DharmaUpgradeBeaconControllerCoverageDeployer,
    '',
    'deploy',
    [],
    false
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment fails before other deployments`,
    DharmaUpgradeBeaconControllerManagerCoverageDeployer,
    '',
    'deploy',
    [],
    false
  )

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
    currentUpgradeBeaconEnvoyCode !== constants.UPGRADE_BEACON_ENVOY_RUNTIME_CODE
  ) {
    await runTest(
      `UpgradeBeaconEnvoy contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_ENVOY_SALT,
        constants.UPGRADE_BEACON_ENVOY_CREATION_CODE
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
        constants.UPGRADE_BEACON_ENVOY_CREATION_CODE
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
      assert.strictEqual(value, constants.UPGRADE_BEACON_ENVOY_RUNTIME_CODE)
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
    currentUpgradeBeaconControllerCode !== swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
      constants.UPGRADE_BEACON_CONTROLLER_METADATA
    )
  ) {
    await runTest(
      `DharmaUpgradeBeaconController contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_CONTROLLER_SALT,
        swapMetadataHash(
          DharmaUpgradeBeaconControllerArtifact.bytecode,
          constants.UPGRADE_BEACON_CONTROLLER_METADATA
        )
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
        swapMetadataHash(
          DharmaUpgradeBeaconControllerArtifact.bytecode,
          constants.UPGRADE_BEACON_CONTROLLER_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed Upgrade Beacon Controller code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaUpgradeBeaconController.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
        constants.UPGRADE_BEACON_CONTROLLER_METADATA
      ))
    }
  )

  let currentKeyRingUpgradeBeaconControllerCode;
  await runTest(
    'Checking Key Ring Upgrade Beacon Controller runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS],
    true,
    value => {
      currentKeyRingUpgradeBeaconControllerCode = value;
    }
  )

  if (
    currentKeyRingUpgradeBeaconControllerCode !== swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
      constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_METADATA
    )
  ) {
    await runTest(
      `DharmaKeyRingUpgradeBeaconController contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_SALT,
        swapMetadataHash(
          DharmaUpgradeBeaconControllerArtifact.bytecode,
          constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_METADATA
        )
      ],
      true,
      value => {
        assert.strictEqual(value, constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS)
      }
    )

    await runTest(
      `DharmaKeyRingUpgradeBeaconController contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_SALT,
        swapMetadataHash(
          DharmaUpgradeBeaconControllerArtifact.bytecode,
          constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed Key Ring Upgrade Beacon Controller code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaKeyRingUpgradeBeaconController.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
        constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_METADATA
      ))
    }
  )

  await runTest(
    `DharmaUpgradeBeaconController contract deployment`,
    DharmaUpgradeBeaconControllerDeployer,
    '',
    'deploy'
  )

  const FailedUpgradeBeaconProxy = await runTest(
    `failure when deploying UpgradeBeaconProxyV1 contract using an undeployed beacon`,
    UpgradeBeaconProxyV1Deployer,
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
    currentUpgradeBeaconCode !== swapMetadataHash(
      DharmaUpgradeBeaconArtifact.deployedBytecode,
      constants.UPGRADE_BEACON_METADATA
    )
  ) {
    await runTest(
      `DharmaUpgradeBeacon contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_SALT,
        swapMetadataHash(
          DharmaUpgradeBeaconArtifact.bytecode,
          constants.UPGRADE_BEACON_METADATA
        )
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
        swapMetadataHash(
          DharmaUpgradeBeaconArtifact.bytecode,
          constants.UPGRADE_BEACON_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed Upgrade Beacon code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaUpgradeBeacon.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaUpgradeBeaconArtifact.deployedBytecode,
        constants.UPGRADE_BEACON_METADATA
      ))
    }
  )

  await runTest(
    `DharmaUpgradeBeacon contract deployment`,
    DharmaUpgradeBeaconDeployer,
    '',
    'deploy'
  )

  let currentKeyRingUpgradeBeaconCode;
  await runTest(
    'Checking Upgrade Beacon runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.KEY_RING_UPGRADE_BEACON_ADDRESS],
    true,
    value => {
      currentKeyRingUpgradeBeaconCode = value;
    }
  )

  if (
    currentKeyRingUpgradeBeaconCode !== swapMetadataHash(
      DharmaKeyRingUpgradeBeaconArtifact.deployedBytecode,
      constants.KEY_RING_UPGRADE_BEACON_METADATA
    )
  ) {
    await runTest(
      `DharmaKeyRingUpgradeBeacon contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.KEY_RING_UPGRADE_BEACON_SALT,
        swapMetadataHash(
          DharmaKeyRingUpgradeBeaconArtifact.bytecode,
          constants.KEY_RING_UPGRADE_BEACON_METADATA
        )
      ],
      true,
      value => {
        assert.strictEqual(value, constants.KEY_RING_UPGRADE_BEACON_ADDRESS)
      }
    )

    await runTest(
      `DharmaUpgradeBeacon contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.KEY_RING_UPGRADE_BEACON_SALT,
        swapMetadataHash(
          DharmaKeyRingUpgradeBeaconArtifact.bytecode,
          constants.KEY_RING_UPGRADE_BEACON_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed Key Ring Upgrade Beacon code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaKeyRingUpgradeBeacon.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaKeyRingUpgradeBeaconArtifact.deployedBytecode,
        constants.KEY_RING_UPGRADE_BEACON_METADATA
      ))
    }
  )

  await runTest(
    `DharmaKeyRingUpgradeBeacon contract deployment`,
    DharmaKeyRingUpgradeBeaconDeployer,
    '',
    'deploy'
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
    currentKeyRegistryCode !== swapMetadataHash(
      DharmaKeyRegistryV1Artifact.deployedBytecode,
      constants.KEY_REGISTRY_METADATA
    )
  ) {
    await runTest(
      `DharmaKeyRegistryV1 Code contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.KEY_REGISTRY_SALT,
        swapMetadataHash(
          DharmaKeyRegistryV1Artifact.bytecode,
          constants.KEY_REGISTRY_METADATA
        )
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
        swapMetadataHash(
          DharmaKeyRegistryV1Artifact.bytecode,
          constants.KEY_REGISTRY_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed Key Registry code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaKeyRegistryV1.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaKeyRegistryV1Artifact.deployedBytecode,
        constants.KEY_REGISTRY_METADATA
      ))
    }
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
      ]
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

  let currentEscapeHatchRegistryCode;
  await runTest(
    'Checking Escape Hatch Registry runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.ESCAPE_HATCH_REGISTRY_ADDRESS],
    true,
    value => {
      currentEscapeHatchRegistryCode = value;
    }
  )

  if (
    currentEscapeHatchRegistryCode !== swapMetadataHash(
      DharmaEscapeHatchRegistryArtifact.deployedBytecode,
      constants.ESCAPE_HATCH_REGISTRY_METADATA
    )
  ) {
    await runTest(
      `DharmaEscapeHatchRegistry Code contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.ESCAPE_HATCH_REGISTRY_SALT,
        swapMetadataHash(
          DharmaEscapeHatchRegistryArtifact.bytecode,
          constants.ESCAPE_HATCH_REGISTRY_METADATA
        )
      ],
      true,
      value => {
        assert.strictEqual(value, constants.ESCAPE_HATCH_REGISTRY_ADDRESS)
      }
    )

    await runTest(
      `DharmaEscapeHatchRegistry contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.ESCAPE_HATCH_REGISTRY_SALT,
        swapMetadataHash(
          DharmaEscapeHatchRegistryArtifact.bytecode,
          constants.ESCAPE_HATCH_REGISTRY_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed Escape Hatch Registry code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaEscapeHatchRegistry.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaEscapeHatchRegistryArtifact.deployedBytecode,
        constants.ESCAPE_HATCH_REGISTRY_METADATA
      ))
    }
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

  const DharmaSmartWalletImplementationV4 = await runTest(
    `DharmaSmartWalletImplementationV4 contract deployment`,
    DharmaSmartWalletImplementationV4Deployer,
    '',
    'deploy'
  )

  const DharmaKeyRingImplementationV0 = await runTest(
    `DharmaKeyRingImplementationV0 contract deployment`,
    DharmaKeyRingImplementationV0Deployer,
    '',
    'deploy'
  )

  const DharmaKeyRingImplementationV1 = await runTest(
    `DharmaKeyRingImplementationV1 contract deployment`,
    DharmaKeyRingImplementationV1Deployer,
    '',
    'deploy'
  )

  /*
  const DharmaKeyRingImplementationV2 = await runTest(
    `DharmaKeyRingImplementationV2 contract deployment`,
    DharmaKeyRingImplementationV2Deployer,
    '',
    'deploy'
  )
  */

  let currentAccountRecoveryManagerCode;
  await runTest(
    'Checking Account Recovery Manager runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS],
    true,
    value => {
      currentAccountRecoveryManagerCode = value;
    }
  )

  if (
    currentAccountRecoveryManagerCode !== swapMetadataHash(
      DharmaAccountRecoveryManagerV2Artifact.deployedBytecode,
      constants.ACCOUNT_RECOVERY_MANAGER_V2_METADATA
    )
  ) {
    await runTest(
      `DharmaAccountRecoveryManagerV2 contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.ACCOUNT_RECOVERY_MANAGER_V2_SALT,
        swapMetadataHash(
          DharmaAccountRecoveryManagerV2Artifact.bytecode,
          constants.ACCOUNT_RECOVERY_MANAGER_V2_METADATA
        )
      ],
      true,
      value => {
        assert.strictEqual(value, constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS)
      }
    )

    await runTest(
      `DharmaAccountRecoveryManagerV2 contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.ACCOUNT_RECOVERY_MANAGER_V2_SALT,
        swapMetadataHash(
          DharmaAccountRecoveryManagerV2Artifact.bytecode,
          constants.ACCOUNT_RECOVERY_MANAGER_V2_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed Account Recovery Manager code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaAccountRecoveryManagerV2.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaAccountRecoveryManagerV2Artifact.deployedBytecode,
        constants.ACCOUNT_RECOVERY_MANAGER_V2_METADATA
      ))
    }
  )

  await runTest(
    `DharmaAccountRecoveryManagerV2 contract deployment`,
    DharmaAccountRecoveryManagerV2Deployer,
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
    currentFactoryCode !== swapMetadataHash(
      DharmaSmartWalletFactoryV1Artifact.deployedBytecode,
      constants.FACTORY_METADATA
    )
  ) {
    await runTest(
      `DharmaSmartWalletFactoryV1 Code contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.FACTORY_SALT,
        swapMetadataHash(
          DharmaSmartWalletFactoryV1Artifact.bytecode,
          constants.FACTORY_METADATA
        )
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
        swapMetadataHash(
          DharmaSmartWalletFactoryV1Artifact.bytecode,
          constants.FACTORY_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed FactoryV1 code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaSmartWalletFactoryV1.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaSmartWalletFactoryV1Artifact.deployedBytecode,
        constants.FACTORY_METADATA
      ))
    }
  )

  await runTest(
    `DharmaSmartWalletFactoryV1 contract deployment`,
    DharmaSmartWalletFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  let currentKeyRingFactoryCode;
  await runTest(
    'Checking Key Ring Factory runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.KEY_RING_FACTORY_V2_ADDRESS],
    true,
    value => {
      currentKeyRingFactoryCode = value;
    }
  )

  if (
    currentKeyRingFactoryCode !== swapMetadataHash(
      DharmaKeyRingFactoryV2Artifact.deployedBytecode,
      constants.KEY_RING_FACTORY_V2_METADATA
    )
  ) {
    await runTest(
      `DharmaKeyRingFactoryV2 Code contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.KEY_RING_FACTORY_V2_SALT,
        swapMetadataHash(
          DharmaKeyRingFactoryV2Artifact.bytecode,
          constants.KEY_RING_FACTORY_V2_METADATA
        )
      ],
      true,
      value => {
        assert.strictEqual(value, constants.KEY_RING_FACTORY_V2_ADDRESS)
      }
    )

    await runTest(
      `DharmaKeyRingFactoryV2 contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.KEY_RING_FACTORY_V2_SALT,
        swapMetadataHash(
          DharmaKeyRingFactoryV2Artifact.bytecode,
          constants.KEY_RING_FACTORY_V2_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed KeyRingFactoryV2 code is correct',
    MockCodeCheck,
    'code',
    'call',
    [DharmaKeyRingFactoryV2.options.address],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaKeyRingFactoryV2Artifact.deployedBytecode,
        constants.KEY_RING_FACTORY_V2_METADATA
      ))
    }
  )

  await runTest(
    `DharmaKeyRingFactoryV2 contract deployment`,
    DharmaKeyRingFactoryV2Deployer,
    '',
    'deploy',
    []
  )

  let currentAdharmaSmartWalletImplementationCode;
  await runTest(
    'Checking Adharma smart wallet implementation runtime code',
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
    currentAdharmaSmartWalletImplementationCode !== swapMetadataHash(
      AdharmaSmartWalletImplementationArtifact.deployedBytecode,
      constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_METADATA
    )
  ) {
    await runTest(
      `AdharmaSmartWalletImplementation contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_SALT,
        swapMetadataHash(
          AdharmaSmartWalletImplementationArtifact.bytecode,
          constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_METADATA
        )
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
        constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_SALT,
        swapMetadataHash(
          AdharmaSmartWalletImplementationArtifact.bytecode,
          constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed AdharmaSmartWalletImplementation code is correct',
    MockCodeCheck,
    'code',
    'call',
    [constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        AdharmaSmartWalletImplementationArtifact.deployedBytecode,
        constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_METADATA
      ))
    }
  )

  await runTest(
    `AdharmaSmartWalletImplementation contract deployment`,
    AdharmaSmartWalletImplementationDeployer,
    '',
    'deploy'
  )

  let currentAdharmaKeyRingImplementationCode;
  await runTest(
    'Checking Adharma key ring implementation runtime code',
    MockCodeCheck,
    'code',
    'call',
    [constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS],
    true,
    value => {
      currentAdharmaKeyRingImplementationCode = value;
    }
  )

  if (
    currentAdharmaKeyRingImplementationCode !== swapMetadataHash(
      AdharmaKeyRingImplementationArtifact.deployedBytecode,
      constants.ADHARMA_KEY_RING_IMPLEMENTATION_METADATA
    )
  ) {
    await runTest(
      `AdharmaKeyRingImplementation contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.ADHARMA_KEY_RING_IMPLEMENTATION_SALT,
        swapMetadataHash(
          AdharmaKeyRingImplementationArtifact.bytecode,
          constants.ADHARMA_KEY_RING_IMPLEMENTATION_METADATA
        )
      ],
      true,
      value => {
        assert.strictEqual(value, constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS)
      }
    )

    await runTest(
      `AdharmaKeyRingImplementation contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        constants.ADHARMA_KEY_RING_IMPLEMENTATION_SALT,
        swapMetadataHash(
          AdharmaKeyRingImplementationArtifact.bytecode,
          constants.ADHARMA_KEY_RING_IMPLEMENTATION_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed AdharmaSmartWalletImplementation code is correct',
    MockCodeCheck,
    'code',
    'call',
    [constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        AdharmaKeyRingImplementationArtifact.deployedBytecode,
        constants.ADHARMA_KEY_RING_IMPLEMENTATION_METADATA
      ))
    }
  )

  await runTest(
    `AdharmaKeyRingImplementation contract deployment`,
    AdharmaKeyRingImplementationDeployer,
    '',
    'deploy'
  )

  await runTest(
    `DharmaAccountRecoveryMultisig contract deployment fails if threshold is not met`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig contract deployment fails if sigs are out of order`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000005',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await runTest(
    `DharmaAccountRecoveryMultisig contract deployment fails with too many owners`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000005',
      '0x0000000000000000000000000000000000000006',
      '0x0000000000000000000000000000000000000007',
      '0x0000000000000000000000000000000000000008',
      '0x0000000000000000000000000000000000000009',
      '0x000000000000000000000000000000000000000a',
      '0x000000000000000000000000000000000000000b'
    ]],
    false
  )

  const DharmaAccountRecoveryMultisig = await runTest(
    `DharmaAccountRecoveryMultisig contract deployment`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[ownerOne, ownerTwo, ownerThree, ownerFour]]
  )

  await runTest(
    `DharmaKeyRegistryMultisig contract deployment fails if threshold is not met`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig contract deployment fails if sigs are out of order`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000005',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await runTest(
    `DharmaKeyRegistryMultisig contract deployment fails with too many owners`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000005',
      '0x0000000000000000000000000000000000000006',
      '0x0000000000000000000000000000000000000007',
      '0x0000000000000000000000000000000000000008',
      '0x0000000000000000000000000000000000000009',
      '0x000000000000000000000000000000000000000a',
      '0x000000000000000000000000000000000000000b'
    ]],
    false
  )

  const DharmaKeyRegistryMultisig = await runTest(
    `DharmaKeyRegistryMultisig contract deployment`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[ownerOne, ownerTwo, ownerThree, ownerFour, ownerFive]]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment fails before indestructible registration`,
    DharmaUpgradeBeaconControllerManagerCoverageDeployer,
    '',
    'deploy',
    [],
    false
  )

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
    'IndestructibleRegistry can register the key ring upgrade beacon as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.KEY_RING_UPGRADE_BEACON_ADDRESS]
  )  

  await runTest(
    'IndestructibleRegistry can register the key ring upgrade beacon controller as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register the upgrade beacon envoy as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_ENVOY_ADDRESS]
  )  

  await runTest(
    'IndestructibleRegistry can register the account recovery manager as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register DharmaKeyRegistryV1 as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.KEY_REGISTRY_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register DharmaKeyRegistryV2 as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.KEY_REGISTRY_V2_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register DharmaEscapeHatchRegistry as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ESCAPE_HATCH_REGISTRY_ADDRESS]
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
    'IndestructibleRegistry can register the Adharma smart wallet implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register the Adharma key ring implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS]
  )

  await runTest(
    'IndestructibleRegistry can register V0 implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [DharmaSmartWalletImplementationV0.options.address]
  )

  await runTest(
    'IndestructibleRegistry can register V0 key ring implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [DharmaKeyRingImplementationV0.options.address]
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

    await runTest(
      'IndestructibleRegistry can register V3 implementation as indestructible',
      IndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [DharmaSmartWalletImplementationV3.options.address]
    )

    await runTest(
      'IndestructibleRegistry can register V4 implementation as indestructible',
      IndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [DharmaSmartWalletImplementationV4.options.address]
    )

    await runTest(
      'IndestructibleRegistry can register V1 key ring implementation as indestructible',
      IndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [DharmaKeyRingImplementationV1.options.address]
    )
  }

  /*
  await runTest(
    'IndestructibleRegistry can register V2 key ring implementation as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [DharmaKeyRingImplementationV2.options.address]
  )
  */

  await runTest(
    '"actual" IndestructibleRegistry can register the upgrade beacon as indestructible',
    ActualIndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_ADDRESS]
  )  

  await runTest(
    '"actual" IndestructibleRegistry can register the upgrade beacon controller as indestructible',
    ActualIndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_CONTROLLER_ADDRESS]
  )

  await runTest(
    '"actual" IndestructibleRegistry can register the key ring upgrade beacon as indestructible',
    ActualIndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.KEY_RING_UPGRADE_BEACON_ADDRESS]
  )  

  await runTest(
    '"actual" IndestructibleRegistry can register the key ring upgrade beacon controller as indestructible',
    ActualIndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS]
  )

  await runTest(
    '"actual" IndestructibleRegistry can register the Adharma smart wallet implementation as indestructible',
    ActualIndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS]
  )

  await runTest(
    '"actual" IndestructibleRegistry can register the Adharma key ring implementation as indestructible',
    ActualIndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS]
  )

  const CodeHashCache = await runTest(
    `CodeHashCache contract deployment`,
    CodeHashCacheDeployer,
    '',
    'deploy'
  )

  await runTest(
    'IndestructibleRegistry can register codehashcache as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [CodeHashCache.options.address]
  )

  await runTest(
    'CodeHashCache can register the runtime code hash of the smart wallet factory',
    CodeHashCache,
    'registerCodeHash',
    'send',
    [constants.FACTORY_ADDRESS]
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
    currentUpgradeBeaconControllerManagerCode !== swapMetadataHash(
      DharmaUpgradeBeaconControllerManagerArtifact.deployedBytecode,
      constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
    )
  ) {
    await runTest(
      `DharmaUpgradeBeaconControllerManager contract address check through immutable create2 factory`,
      ImmutableCreate2Factory,
      'findCreate2Address',
      'call',
      [
        constants.UPGRADE_BEACON_CONTROLLER_MANAGER_SALT,
        swapMetadataHash(
          DharmaUpgradeBeaconControllerManagerArtifact.bytecode,
          constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
        )
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
        constants.UPGRADE_BEACON_CONTROLLER_MANAGER_SALT,
        swapMetadataHash(
          DharmaUpgradeBeaconControllerManagerArtifact.bytecode,
          constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
        )
      ]
    )
  }

  await runTest(
    'Deployed DharmaUpgradeBeaconControllerManager code is correct',
    MockCodeCheck,
    'code',
    'call',
    [constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS],
    true,
    value => {
      assert.strictEqual(value, swapMetadataHash(
        DharmaUpgradeBeaconControllerManagerArtifact.deployedBytecode,
        constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
      ))
    }
  )

  await runTest(
    'IndestructibleRegistry can register the upgrade beacon controller manager as indestructible',
    IndestructibleRegistry,
    'registerAsIndestructible',
    'send',
    [constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS]
  )

  await runTest(
    `DharmaUpgradeMultisig contract deployment fails if threshold is not met`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig contract deployment fails if sigs are out of order`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000005',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await runTest(
    `DharmaUpgradeMultisig contract deployment fails with too many owners`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000005',
      '0x0000000000000000000000000000000000000006',
      '0x0000000000000000000000000000000000000007',
      '0x0000000000000000000000000000000000000008',
      '0x0000000000000000000000000000000000000009',
      '0x000000000000000000000000000000000000000a',
      '0x000000000000000000000000000000000000000b'
    ]],
    false
  )

  const DharmaUpgradeMultisig = await runTest(
    `DharmaUpgradeMultisig contract deployment`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[ownerOne, ownerTwo, ownerThree, ownerFour, ownerFive]]
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment`,
    DharmaUpgradeBeaconControllerManagerDeployer,
    '',
    'deploy'
  )

  await runTest(
    `DharmaUpgradeBeaconControllerManager contract coverage deployment`,
    DharmaUpgradeBeaconControllerManagerCoverageDeployer,
    '',
    'deploy'
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
