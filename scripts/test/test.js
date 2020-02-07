var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')
const { web3 } = require("./web3");
const { Tester, longer } = require("./testHelpers");
const { testAccountRecoveryManager } = require("./contracts/account-recovery/testAccountRecoveryManager");
const { testUpgradeBeaconController } = require("./contracts/upgradeability/testUpgradeBeaconController");
const { testUpgradeBeaconControllerManagerPartOne, testUpgradeBeaconControllerManagerPartTwo } = require("./contracts/upgradeability/testUpgradeBeaconControllerManager");
const { testKeyRegistryV2 } = require("./contracts/registries/testKeyRegistryV2");
const { testPerformingUpgrade } = require("./contracts/upgradeability/testPerformingUpgrade");

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
const DharmaSmartWalletImplementationV6Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV6.json')
const DharmaSmartWalletImplementationV7Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV7.json')

const DharmaKeyRingImplementationV1Artifact = require('../../build/contracts/DharmaKeyRingImplementationV1.json')
const DharmaKeyRingFactoryV1Artifact = require('../../build/contracts/DharmaKeyRingFactoryV1.json')
const DharmaKeyRingFactoryV2Artifact = require('../../build/contracts/DharmaKeyRingFactoryV2.json')
const DharmaKeyRingFactoryV3Artifact = require('../../build/contracts/DharmaKeyRingFactoryV3.json')

const UpgradeBeaconProxyV1Artifact = require('../../build/contracts/UpgradeBeaconProxyV1.json')
const KeyRingUpgradeBeaconProxyV1Artifact = require('../../build/contracts/KeyRingUpgradeBeaconProxyV1.json')

const DharmaUpgradeMultisigArtifact = require('../../build/contracts/DharmaUpgradeMultisig.json')
const DharmaAccountRecoveryMultisigArtifact = require('../../build/contracts/DharmaAccountRecoveryMultisig.json')
const DharmaAccountRecoveryOperatorMultisigArtifact = require('../../build/contracts/DharmaAccountRecoveryOperatorMultisig.json')
const DharmaKeyRegistryMultisigArtifact = require('../../build/contracts/DharmaKeyRegistryMultisig.json')

const DharmaEscapeHatchRegistryArtifact = require('../../build/contracts/DharmaEscapeHatchRegistry.json')

const UpgradeBeaconImplementationCheckArtifact = require('../../build/contracts/UpgradeBeaconImplementationCheck.json')
const BadBeaconArtifact = require('../../build/contracts/BadBeacon.json')
const BadBeaconTwoArtifact = require('../../build/contracts/BadBeaconTwo.json')
const TimelockEdgecaseTesterArtifact = require('../../build/contracts/TimelockEdgecaseTester.json')

const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json');
const MockDharmaKeyRingFactoryArtifact = require('../../build/contracts/MockDharmaKeyRingFactory.json')
const IERC20Artifact = require('../../build/contracts/IERC20.json')
const ComptrollerArtifact = require('../../build/contracts/ComptrollerInterface.json')

const contractNames = Object.assign({}, constants.CONTRACT_NAMES)


async function test(testingContext) {
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

  const CSAI_BORROW = new web3.eth.Contract(
    [{
      "constant": false,
      "inputs": [{"name": "borrowAmount", "type": "uint256"}],
      "name": "borrow",
      "outputs": [{"name": "", "type": "uint256"}],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }],
    constants.CSAI_MAINNET_ADDRESS
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

  const DharmaSmartWalletImplementationV6Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV6Artifact.abi
  )
  DharmaSmartWalletImplementationV6Deployer.options.data = (
    DharmaSmartWalletImplementationV6Artifact.bytecode
  )

  const DharmaSmartWalletImplementationV7Deployer = new web3.eth.Contract(
    DharmaSmartWalletImplementationV7Artifact.abi
  )
  DharmaSmartWalletImplementationV7Deployer.options.data = (
    DharmaSmartWalletImplementationV7Artifact.bytecode
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

  const DharmaAccountRecoveryOperatorMultisigDeployer = new web3.eth.Contract(
    DharmaAccountRecoveryOperatorMultisigArtifact.abi
  )
  DharmaAccountRecoveryOperatorMultisigDeployer.options.data = (
    DharmaAccountRecoveryOperatorMultisigArtifact.bytecode
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

  const tester = new Tester(testingContext);
  await tester.init();

  console.log('running tests...')

  await tester.runTest(
    `DharmaUpgradeBeaconController can transfer owner`,
    DharmaUpgradeBeaconController,
    'transferOwnership',
    'send',
    [tester.address]
  )

  await tester.runTest(
    'Dharma Key Registry V1 gets the initial global key correctly',
    DharmaKeyRegistryV1,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V1 attempt to get an unset specific key throws',
    DharmaKeyRegistryV1,
    'getSpecificKey',
    'call',
    [tester.address],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V1 gets the global key when requesting unset key',
    DharmaKeyRegistryV1,
    'getKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  const message = (
    DharmaKeyRegistryV1.options.address +
    tester.address.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const newKeySignature = tester.signHashedPrefixedHashedHexString(message, tester.address)

  const badNewKeySignature = tester.signHashedPrefixedHashedHexString('0x12', tester.address)

  await tester.runTest(
    'Dharma Key Registry V1 cannot set a new global key unless called by owner',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      tester.address,
      newKeySignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'Dharma Key Registry V1 cannot set a new global key with a bad signature',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      tester.address,
      badNewKeySignature
    ],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V1 can set a new global key correctly',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      tester.address,
      newKeySignature
    ]
  )

  await tester.runTest(
    'Dharma Key Registry V1 gets the new global key correctly',
    DharmaKeyRegistryV1,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V1 cannot set a new specific key unless called by owner',
    DharmaKeyRegistryV1,
    'setSpecificKey',
    'send',
    [
      tester.address,
      DharmaKeyRegistryV1.options.address
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'Dharma Key Registry V1 can set a new specific key',
    DharmaKeyRegistryV1,
    'setSpecificKey',
    'send',
    [
      tester.address,
      DharmaKeyRegistryV1.options.address
    ]
  )

  await tester.runTest(
    'Dharma Key Registry V1 gets the new specific key correctly',
    DharmaKeyRegistryV1,
    'getSpecificKey',
    'call',
    [tester.address],
    true,
    value => {
      assert.strictEqual(value, DharmaKeyRegistryV1.options.address)
    }
  )

  await tester.runTest(
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

  await tester.runTest(
    'Dharma Key Registry V1 can set a new owner',
    DharmaKeyRegistryV1,
    'transferOwnership',
    'send',
    [
      tester.address
    ]
  )

  await tester.runTest(
    'Dharma Key Registry V1 gets the new owner',
    DharmaKeyRegistryV1,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets the new global key correctly',
    DharmaKeyRegistryV2,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  const messageV2 = (
    DharmaKeyRegistryV2.options.address +
    tester.address.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const v2KeySignature = tester.signHashedPrefixedHashedHexString(messageV2, tester.address)

  await tester.runTest(
    'Dharma Key Registry V2 cannot set a previously used global key',
    DharmaKeyRegistryV2,
    'setGlobalKey',
    'send',
    [
      tester.address,
      v2KeySignature
    ],
    false
  )

  const BadBeacon = await tester.runTest(
    `Mock Bad Beacon contract deployment`,
    BadBeaconDeployer,
    '',
    'deploy'
  )

  const BadBeaconTwo = await tester.runTest(
    `Mock Bad Beacon Two contract deployment`,
    BadBeaconTwoDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV0 = await tester.runTest(
    `DharmaSmartWalletImplementationV0 contract deployment`,
    DharmaSmartWalletImplementationV0Deployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV1 = await tester.runTest(
    `DharmaSmartWalletImplementationV1 contract deployment`,
    DharmaSmartWalletImplementationV1Deployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV2 = await tester.runTest(
    `DharmaSmartWalletImplementationV2 contract deployment`,
    DharmaSmartWalletImplementationV2Deployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV5 = await tester.runTest(
    `DharmaSmartWalletImplementationV5 contract deployment`,
    DharmaSmartWalletImplementationV5Deployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV6 = await tester.runTest(
    `DharmaSmartWalletImplementationV6 contract deployment`,
    DharmaSmartWalletImplementationV6Deployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationV7 = await tester.runTest(
    `DharmaSmartWalletImplementationV7 contract deployment`,
    DharmaSmartWalletImplementationV7Deployer,
    '',
    'deploy'
  )

  const DharmaKeyRingImplementationV1 = await tester.runTest(
    `DharmaKeyRingImplementationV1 contract deployment`,
    DharmaKeyRingImplementationV1Deployer,
    '',
    'deploy'
  )

  await tester.runTest(
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

  await tester.runTest(
    'Dharma Upgrade Beacon Controller cannot set non-contract as implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      tester.address
    ],
    false
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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

  const UpgradeBeaconImplementationCheck = await tester.runTest(
    `UpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaUpgradeBeacon.options.address,
      DharmaSmartWalletImplementationV0.options.address
    ]
  )

  await tester.runTest(
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

  await tester.runTest(
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

  const KeyRingUpgradeBeaconImplementationCheck = await tester.runTest(
    `KeyRingUpgradeBeaconImplementationCheck deployment`,
    UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      DharmaKeyRingUpgradeBeacon.options.address,
      DharmaKeyRingImplementationV1.options.address
    ]
  )

  await tester.runTest(
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

  const DharmaSmartWalletNoFactoryNoConstructor = await tester.runTest(
    `DharmaSmartWallet minimal upgradeable proxy deployment - no factory or constructor`,
    DharmaSmartWalletNoFactoryNoConstructorDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationTest = new web3.eth.Contract(
    DharmaSmartWalletImplementationV0Artifact.abi,
    DharmaSmartWalletNoFactoryNoConstructor.options.address
  )

  await tester.runTest(
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

  const MockCodeCheck = await tester.getOrdeploy("MockCodeCheck", MockCodeCheckArtifact);

  let currentSaiCode;
  await tester.runTest(
    'Checking for required external contracts...',
    MockCodeCheck,
    'code',
    'call',
    [constants.SAI_MAINNET_ADDRESS],
    true,
    value => {
      currentSaiCode = value;
    }
  )

  if (!currentSaiCode) {
    console.log(
      `completed ${tester.passed + tester.failed} test${tester.passed + tester.failed === 1 ? '' : 's'} ` +
      `with ${tester.failed} failure${tester.failed === 1 ? '' : 's'}.`
    )

    console.log(
      'Note that the full test suite cannot be executed locally - instead, ' +
      'run against a fork of mainnet using `yarn forkStart` and `yarn test`.'
    )

    if (tester.failed > 0) {
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

  const DharmaSmartWalletNoFactory = await tester.runTest(
    `DharmaSmartWallet minimal upgradeable proxy deployment - no factory but with constructor`,
    DharmaSmartWalletNoFactoryDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletImplementationTestWithConstructor = new web3.eth.Contract(
    DharmaSmartWalletImplementationV0Artifact.abi,
    DharmaSmartWalletNoFactory.options.address
  )

  await tester.runTest(
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

  await tester.runTest(
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

  const DharmaSmartWalletFactoryV1 = await tester.runTest(
    `DharmaSmartWalletFactoryV1 contract deployment`,
    DharmaSmartWalletFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  let targetWalletAddress;
  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can get a new smart wallet address ahead of time',
    DharmaSmartWalletFactoryV1,
    'getNextSmartWallet',
    'call',
    [tester.address],
    true,
    value => {
      // TODO: verify against expected value
      targetWalletAddress = value
    }
  )

  contractNames[DharmaSmartWalletFactoryV1.options.address] = 'Smart Wallet Factory'
  contractNames[targetWalletAddress] = 'Smart Wallet'

  const ethWhaleBalance = await web3.eth.getBalance(constants.ETH_WHALE_ADDRESS)
  const saiWhaleBalance = await web3.eth.getBalance(constants.SAI_WHALE_ADDRESS)
  const usdcWhaleBalance = await web3.eth.getBalance(constants.USDC_WHALE_ADDRESS)

  if (ethWhaleBalance === '0') {
    await web3.eth.sendTransaction({
      from: tester.address,
      to: constants.ETH_WHALE_ADDRESS,
      value: web3.utils.toWei('.2', 'ether'),
      gas: (testingContext !== 'coverage') ? '0x5208' : tester.gasLimit - 1,
      gasPrice: 1
    })
    console.log(' ✓ Eth Whale can receive eth if needed')
  }

  if (saiWhaleBalance === '0') {
    await web3.eth.sendTransaction({
      from: tester.address,
      to: constants.SAI_WHALE_ADDRESS,
      value: web3.utils.toWei('.1', 'ether'),
      gas: (testingContext !== 'coverage') ? '0x5208' : tester.gasLimit - 1,
      gasPrice: 1
    })
    console.log(' ✓ Sai Whale can receive eth if needed')
  }

  if (usdcWhaleBalance === '0') {
    await web3.eth.sendTransaction({
      from: tester.address,
      to: constants.USDC_WHALE_ADDRESS,
      value: web3.utils.toWei('.1', 'ether'),
      gas: (testingContext !== 'coverage') ? '0x5208' : tester.gasLimit - 1,
      gasPrice: 1
    })
    console.log(' ✓ USDC Whale can receive eth if needed')
  }

  await web3.eth.sendTransaction({
    from: constants.ETH_WHALE_ADDRESS,
    to: targetWalletAddress,
    value: web3.utils.toWei('.1', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : tester.gasLimit - 1,
    gasPrice: 1
  })
  console.log(' ✓ Eth Whale can deposit eth into the yet-to-be-deployed smart wallet')

  await tester.runTest(
    'Sai Whale can deposit sai into the yet-to-be-deployed smart wallet',
    tester.SAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.SAI_WHALE_ADDRESS
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
    constants.SAI_WHALE_ADDRESS
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the yet-to-be-deployed smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 cannot deploy a new smart wallet with no key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can deploy a new smart wallet using a Dharma Key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [tester.address],
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
        assert.strictEqual(events[0].returnValues.userSigningKey, tester.address)

        assert.strictEqual(events[1].address, 'SAI')
        assert.strictEqual(events[1].eventName, 'Approval')
        assert.strictEqual(events[1].returnValues.value, constants.FULL_APPROVAL)

        assert.strictEqual(events[2].address, 'CSAI')
        assert.strictEqual(events[2].eventName, 'AccrueInterest')

        assert.strictEqual(events[3].address, 'SAI')
        assert.strictEqual(events[3].eventName, 'Transfer')
        assert.strictEqual(events[3].returnValues.value, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[4].address, 'CSAI')
        assert.strictEqual(events[4].eventName, 'Mint')
        assert.strictEqual(events[4].returnValues.mintTokens, web3.utils.toWei('100', 'ether'))  

        assert.strictEqual(events[5].address, 'CSAI')
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

  const UserSmartWalletV6 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV6Artifact.abi,
    targetWalletAddress
  )

  const UserSmartWalletV7 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV7Artifact.abi,
    targetWalletAddress
  )

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 gets a new smart wallet address with same key',
    DharmaSmartWalletFactoryV1,
    'getNextSmartWallet',
    'call',
    [tester.address],
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
    gas: (testingContext !== 'coverage') ? '0xffff' : tester.gasLimit - 1,
    gasPrice: 1
  }).catch(error => {
    console.log(' ✓ Eth Whale can no longer deposit eth into the deployed smart wallet')
  })

  await tester.runTest(
    'Sai Whale can deposit sai into the deployed smart wallet',
    tester.SAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.SAI_WHALE_ADDRESS
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
    constants.SAI_WHALE_ADDRESS
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the deployed smart wallet',
    tester.USDC,
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

  await tester.runTest(
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
     
        assert.strictEqual(events[0].address, 'CSAI')
        assert.strictEqual(events[0].eventName, 'AccrueInterest')

        assert.strictEqual(events[1].address, 'SAI')
        assert.strictEqual(events[1].eventName, 'Transfer')
        assert.strictEqual(events[1].returnValues.value, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[2].address, 'CSAI')
        assert.strictEqual(events[2].eventName, 'Mint')
        assert.strictEqual(events[2].returnValues.mintTokens, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[3].address, 'CSAI')
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

  await tester.runTest(
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

  await tester.runTest(
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
  await tester.runTest(
    'revert test with revert reason passes',
    UserSmartWallet,
    'testRevert',
    'call',
    [],
    false // set this to true to verify that the revert reason is displayed
  )

  await tester.runTest(
    'new user smart wallet can be called and has the correct dharma key set',
    UserSmartWallet,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    'UserSmartWallet secondary can call to withdraw sai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1000000000000000000',
      tester.address,
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

  await tester.runTest(
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

  await tester.runTest(
    'UserSmartWallet secondary can call to withdraw usdc',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      1,
      tester.address,
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

  await tester.runTest(
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

  await tester.runTest(
    'UserSmartWallet secondary can call to cancel',
    UserSmartWallet,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await tester.runTest(
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

  await tester.runTest(
    'UserSmartWallet secondary can call to set userSigningKey',
    UserSmartWallet,
    'setUserSigningKey',
    'send',
    [
      tester.address,
      0,
      '0x',
      '0x'
    ]
  )

  await tester.runTest(
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
  await tester.runTest(
    'UserSmartWallet can get next custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // SAIWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'UserSmartWallet can get custom action ID 4 and it matches next action ID',
    UserSmartWallet,
    'getCustomActionID',
    'call',
    [
      4, // SAIWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      4,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  await tester.runTest(
    'UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0x',
      '0xffffffff' + usdcWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'UserSmartWallet relay can call with signature to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0x',
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
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

  const saiWithdrawalSignature = tester.signHashedPrefixedHashedHexString(
    withdrawalMessage,
    address
  )
  */

  await tester.runTest(
    'UserSmartWallet cannot withdraw too much sai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '100000000000000000000000000000000000000',
      tester.address,
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

  await tester.runTest(
    'UserSmartWallet cannot withdraw too much usdc',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      '100000000000000000000000000000000',
      tester.address,
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

  await tester.runTest(
    'UserSmartWallet cannot withdraw too little sai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1',
      tester.address,
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

  await tester.runTest(
    'UserSmartWallet can get a Sai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      10, // SaiWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let saiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'UserSmartWallet relay cannot call with bad signature to withdraw sai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0x',
      '0xffffffff' + saiWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'UserSmartWallet relay can call with signature to withdraw sai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0x',
      saiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
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

  await tester.runTest(
    'UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWallet,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await tester.runTest(
    'UserSmartWallet calls to atomic methods revert',
    UserSmartWallet,
    '_withdrawDaiAtomic',
    'send',
    [
      '1',
     tester.address
    ],
    false
  )

  let originalNonce;
  await tester.runTest(
    'UserSmartWallet nonce can be retrieved',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      originalNonce = value;
    }
  )

  await testPerformingUpgrade(
      tester,
      DharmaSmartWalletImplementationV1, // new implementation
      UserSmartWallet,
      DharmaUpgradeBeaconController,
      DharmaUpgradeBeacon.options.address,
      1
  )

  await testPerformingUpgrade(
      tester,
      DharmaSmartWalletImplementationV2, // new implementation
      UserSmartWallet,
      DharmaUpgradeBeaconController,
      DharmaUpgradeBeacon.options.address,
      2
  )

  await testPerformingUpgrade(
      tester,
      DharmaSmartWalletImplementationV5, // new implementation
      UserSmartWallet,
      DharmaUpgradeBeaconController,
      DharmaUpgradeBeacon.options.address,
      5
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet secondary can call to cancel',
    UserSmartWalletV5,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet can get next custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      4, // SAIWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'V5 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV5,
    'getCustomActionID',
    'call',
    [
      4, // SAIWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      parseInt(originalNonce) + 1,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  let genericActionID
  await tester.runTest(
    'V5 UserSmartWallet can get next generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      tester.address,
      '0x',
      0
    ],
    true,
    value => {
      genericActionID = value
    }
  )

  await tester.runTest(
    'V5 UserSmartWallet can get generic action ID and it matches next action ID',
    UserSmartWalletV5,
    'getGenericActionID',
    'call',
    [
      tester.address,
      '0x',
      parseInt(originalNonce) + 1,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, genericActionID)
    }
  )

  await tester.runTest(
    'UserSmartWallet calls to atomic methods revert',
    UserSmartWalletV5,
    '_withdrawSaiAtomic',
    'send',
    [
      '1',
     tester.address
    ],
    false
  )

  await tester.runTest(
    'Sai Whale can deposit sai into the V5 smart wallet',
    tester.SAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.SAI_WHALE_ADDRESS
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
    constants.SAI_WHALE_ADDRESS
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the V5 smart wallet',
    tester.USDC,
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

  await tester.runTest(
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
     
        assert.strictEqual(events[0].address, 'CSAI')
        assert.strictEqual(events[0].eventName, 'AccrueInterest')

        assert.strictEqual(events[1].address, 'SAI')
        assert.strictEqual(events[1].eventName, 'Transfer')
        //assert.strictEqual(events[1].returnValues.value, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[2].address, 'CSAI')
        assert.strictEqual(events[2].eventName, 'Mint')
        //assert.strictEqual(events[2].returnValues.mintTokens, web3.utils.toWei('100', 'ether'))


        assert.strictEqual(events[3].address, 'CSAI')
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

  await tester.runTest(
    'Sai Whale can deposit sai into the V5 smart wallet again',
    tester.SAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.SAI_WHALE_ADDRESS
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
    constants.SAI_WHALE_ADDRESS
  )

  await tester.runTest(
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

  let executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  let executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      tester.SAI.options.address,
      tester.SAI.methods.approve(tester.CSAI.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      tester.SAI.options.address,
      tester.SAI.methods.approve(tester.CSAI.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      tester.SAI.options.address,
      tester.SAI.methods.approve(tester.CSAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      tester.SAI.options.address,
      tester.SAI.methods.approve(tester.CSAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet secondary can set a custom user userSigningKey',
    UserSmartWalletV5,
    'setUserSigningKey',
    'send',
    [
      tester.addressTwo,
      0,
      '0x',
      '0x'
    ]
  )

  await tester.runTest(
    'V5 UserSmartWallet can get next custom action ID to set a user signing key',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.addressTwo,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let currentNonce
  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV5,
    'getCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      0, // Note that this value differs from above
      tester.addressTwo,
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  let setUserSigningKeyUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  let setUserSigningKeyDharmaSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'V5 UserSmartWallet can set a new user signing key with signatures',
    UserSmartWalletV5,
    'setUserSigningKey',
    'send',
    [
      tester.addressTwo,
      0,
      setUserSigningKeyUserSignature,
      setUserSigningKeyDharmaSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get next custom action ID to cancel',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.originalAddress,  // This value shouldn't matter either
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV5,
    'getCustomActionID',
    'call',
    [
      0, // Cancel
      0, // Note that this value differs from above
      tester.addressTwo, // This one too
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  let cancelUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet secondary cannot call to withdraw sai without primary',
    UserSmartWalletV5,
    'withdrawSai',
    'send',
    [
      '1000000000000000000',
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet secondary cannot call to withdraw usdc without primary',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      1,
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet secondary can no longer call to set userSigningKey without primary',
    UserSmartWalletV5,
    'setUserSigningKey',
    'send',
    [
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '1', // dust
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  let usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot withdraw "dust" USDC',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      '1',
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      '100000',
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      '0xffffffff' + usdcWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet cannot call with bad user signature to withdraw USDC',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0xffffffff' + usdcUserWithdrawalSignature.slice(10),
      usdcWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet relay can call with two signatures to withdraw max USDC',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
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

  const saiWithdrawalSignature = tester.signHashedPrefixedHashedHexString(
    withdrawalMessage,
    address
  )
  */

  await tester.runTest(
    'V5 UserSmartWallet can get a Sai withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      4, // SaiWithdrawal,
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  saiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  let saiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot withdraw "dust" sai',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      '1',
      tester.address,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Sai withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      4, // SaiWithdrawal,
      '1000000000000000',
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  saiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  saiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot withdraw sai to null address',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      constants.NULL_ADDRESS,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Sai withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      4, // SaiWithdrawal,
      '1000000000000000',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  saiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  saiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay can call with signature to withdraw sai',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      tester.address,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet cannot get a non-custom "custom" next action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet cannot get a non-custom "custom" action ID',
    UserSmartWalletV5,
    'getCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      tester.address,
      0,
      0
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Sai withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      4, // SaiWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  saiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  saiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw sai',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      saiUserWithdrawalSignature,
      '0xffffffff' + saiWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot call with bad user signature to withdraw sai',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0xffffffff' + saiUserWithdrawalSignature.slice(10),
      saiWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet relay can call with signature to withdraw sai',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '0', // no amount
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  let ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot to withdraw ether with no amount',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '0',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
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

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      '0xffffffff' + ethWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      '0xffffffff' + ethUserWithdrawalSignature.slice(10),
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      '0xffffffff' + ethWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      '0xffffffff' + ethUserWithdrawalSignature.slice(10),
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV5,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWalletV5,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a cancel custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel,
      '0',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let cancelSignature = tester.signHashedPrefixedHexString(customActionId, tester.addressTwo)

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet calls to atomic methods revert',
    UserSmartWalletV5,
    '_withdrawSaiAtomic',
    'send',
    [
      '1',
     tester.address
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet calls to recover from random address revert',
    UserSmartWalletV5,
    'recover',
    'send',
    [
     tester.address
    ],
    false
  )

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V5 smart wallet using a Dharma Key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [tester.addressTwo],
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
        assert.strictEqual(events[0].returnValues.userSigningKey, tester.addressTwo)
        //console.log(events)

        // TODO: test more events
      }
    }
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      tester.USDC.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet cannot call executeAction and target a non-contract',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      tester.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet cannot call executeAction and target itself',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      UserSmartWalletV5.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      tester.USDC.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V5 UserSmartWallet can get the next generic batch action ID',
    UserSmartWalletV5,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
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

  await tester.runTest(
    'V5 UserSmartWallet generic batch action ID with nonce matches next ID',
    UserSmartWalletV5,
    'getGenericAtomicBatchActionID',
    'call',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeActionWithAtomicBatchCalls',
    UserSmartWalletV5,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the deployed smart wallet',
    tester.USDC,
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

  await tester.runTest(
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
  await tester.runTest(
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
  await tester.runTest(
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

  await tester.runTest(
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
  await tester.runTest(
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

  await tester.runTest(
    'USDC Whale can deposit usdc into the yet-to-be-blacklisted smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    'un-blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'unBlacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
    'pause USDC',
    FIAT_TOKEN,
    'pause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet attempt to withdraw max USDC when paused causes ExternalError',
    UserSmartWalletV5,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
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

  await tester.runTest(
    'unpause USDC',
    FIAT_TOKEN,
    'unpause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await tester.runTest(
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

  await tester.runTest(
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
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

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
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
    tester.originalAddress
  )

  let targetWalletAddressTwo;
  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      tester.SAI.options.address,
      tester.SAI.methods.transfer(tester.address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeAction',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      tester.SAI.options.address,
      tester.SAI.methods.transfer(tester.address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Sai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // SaiWithdrawal,
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  saiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  saiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot withdraw too much sai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )


  await tester.runTest(
    'V5 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get next generic batch action ID',
    UserSmartWalletV5,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{
        to: tester.SAI.options.address,
        data: tester.SAI.methods.transfer(
          tester.address, '100000000000000000000000000000'
        ).encodeABI()
      }],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet bad executeActionWithAtomicBatchCalls emits CallFailure',
    UserSmartWalletV5,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{
        to: tester.SAI.options.address,
        data: tester.SAI.methods.transfer(
          tester.address, '100000000000000000000000000000'
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

  await tester.runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      Comptroller.options.address,
      Comptroller.methods.enterMarkets(
        [constants.CSAI_MAINNET_ADDRESS]
      ).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeAction to enter sai market',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      Comptroller.options.address,
      Comptroller.methods.enterMarkets(
        [constants.CSAI_MAINNET_ADDRESS]
      ).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'Sai Whale can deposit sai into the smart wallet',
    tester.SAI,
    'transfer',
    'send',
    [targetWalletAddress, web3.utils.toWei('100', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.SAI_WHALE_ADDRESS
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
    constants.SAI_WHALE_ADDRESS
  )

  await tester.runTest(
    'V5 UserSmartWallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV5,
    'repayAndDeposit'
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      tester.CSAI.options.address,
      tester.CSAI.methods.transfer(tester.address, web3.utils.toWei('1', 'mwei')).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeAction to transfer cSai',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      tester.CSAI.options.address,
      tester.CSAI.methods.transfer(tester.address, web3.utils.toWei('1', 'mwei')).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    true,
    receipt => {
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a generic action ID',
    UserSmartWalletV5,
    'getNextGenericActionID',
    'call',
    [
      CSAI_BORROW.options.address,
      CSAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet can call executeAction to perform a borrow',
    UserSmartWalletV5,
    'executeAction',
    'send',
    [
      CSAI_BORROW.options.address,
      CSAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    true,
    receipt => {
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V5 UserSmartWallet can get a Sai withdrawal custom action ID',
    UserSmartWalletV5,
    'getNextCustomActionID',
    'call',
    [
      4, // SaiWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  saiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  saiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V5 UserSmartWallet relay cannot withdraw max sai with an outstanding borrow',
    UserSmartWalletV5,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  // Initiate account recovery
  await tester.runTest(
    'smart wallet account recovery can be initiated',
    DharmaAccountRecoveryManagerV2,
    'initiateAccountRecovery',
    'send',
    [
      UserSmartWalletV5.options.address,
      tester.originalAddress,
      0 // extraTime in seconds
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'smart wallet account recovery cannot be performed right away',
    DharmaAccountRecoveryManagerV2,
    'recover',
    'send',
    [
      UserSmartWalletV5.options.address,
      tester.originalAddress
    ],
    false
  )

  // advance time by 3 days
  await tester.advanceTime((60 * 60 * 24 * 3) + 5)

  // recover account
  await tester.runTest(
    'smart wallet account recovery can be performed after three days',
    DharmaAccountRecoveryManagerV2,
    'recover',
    'send',
    [
      UserSmartWalletV5.options.address,
      tester.originalAddress
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'UserSmartWalletV5 can get the nonce prior to upgrade',
    UserSmartWalletV5,
    'getNonce',
    'call',
    [],
    true,
    value => {
      originalNonce = value
    }
  )


  await testPerformingUpgrade(
      tester,
      DharmaSmartWalletImplementationV6, // new implementation
      UserSmartWallet,
      DharmaUpgradeBeaconController,
      DharmaUpgradeBeacon.options.address,
      6
  )

  await tester.runTest(
    'V6 UserSmartWallet can get balances',
    UserSmartWalletV6,
    'getBalances',
    'call',
    [],
    true,
    value => {
      //console.log(value)
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet secondary can call to cancel',
    UserSmartWalletV6,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await tester.runTest(
    'V6 UserSmartWallet nonce is now set to original + 1',
    UserSmartWalletV6,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, (parseInt(originalNonce) + 1).toString())
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get next custom action ID to set a user signing key',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.addressTwo,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  setUserSigningKeyDharmaSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'V6 UserSmartWallet can set a new user signing key with signatures',
    UserSmartWalletV6,
    'setUserSigningKey',
    'send',
    [
      tester.addressTwo,
      0,
      '0x',
      setUserSigningKeyDharmaSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet has the new user signing key set',
    UserSmartWalletV6,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.addressTwo)
    }
  )

  await tester.runTest(
    'cSai can be sent to V6 UserSmartWallet',
    tester.CSAI,
    'transfer',
    'send',
    [UserSmartWalletV6.options.address, web3.utils.toWei('0.5', 'mwei')]
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can trigger cSai to cDai migration before cDai approval',
    UserSmartWalletV6,
    'migrateCSaiToCDai',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get next custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      0, // DAIWithdrawal
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV6,
    'getCustomActionID',
    'call',
    [
      0, // DAIWithdrawal
      constants.FULL_APPROVAL,
      tester.address,
      parseInt(originalNonce) + 2,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get next generic action ID',
    UserSmartWalletV6,
    'getNextGenericActionID',
    'call',
    [
      tester.address,
      '0x',
      0
    ],
    true,
    value => {
      genericActionID = value
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get generic action ID and it matches next action ID',
    UserSmartWalletV6,
    'getGenericActionID',
    'call',
    [
      tester.address,
      '0x',
      parseInt(originalNonce) + 2,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, genericActionID)
    }
  )

  await tester.runTest(
    'UserSmartWallet calls to atomic methods revert',
    UserSmartWalletV6,
    '_withdrawDaiAtomic',
    'send',
    [
      '1',
     tester.address
    ],
    false
  )

  // Give the Dai Whale some ETH so it can make transactions
  await web3.eth.sendTransaction({
    from: tester.address,
    to: constants.DAI_WHALE_ADDRESS,
    value: web3.utils.toWei('1', 'ether'),
    gas: (testingContext !== 'coverage') ? '0xffff' : tester.gasLimit - 1,
    gasPrice: 1
  })

  await tester.runTest(
    'Dai Whale can deposit Dai into the V6 smart wallet',
    tester.DAI,
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

  await tester.runTest(
    'USDC Whale can deposit usdc into the V6 smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
    'getNextGenericActionID',
    'call',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeAction',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V6 user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV6,
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

        assert.strictEqual(events[0].address, 'DAI')
        assert.strictEqual(events[0].eventName, 'Approval')
     
        assert.strictEqual(events[1].address, 'CDAI')
        assert.strictEqual(events[1].eventName, 'AccrueInterest')

        assert.strictEqual(events[2].address, 'DAI')
        assert.strictEqual(events[2].eventName, 'Transfer')
        //assert.strictEqual(events[2].returnValues.value, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[3].address, 'CDAI')
        assert.strictEqual(events[3].eventName, 'Mint')
        //assert.strictEqual(events[3].returnValues.mintTokens, web3.utils.toWei('100', 'ether'))

        assert.strictEqual(events[4].address, 'CDAI')
        assert.strictEqual(events[4].eventName, 'Transfer')

        assert.strictEqual(events[5].address, 'CUSDC')
        assert.strictEqual(events[5].eventName, 'AccrueInterest')

        assert.strictEqual(events[6].address, 'USDC')
        assert.strictEqual(events[6].eventName, 'Transfer')
        //assert.strictEqual(events[6].returnValues.value, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[7].address, 'CUSDC')
        assert.strictEqual(events[7].eventName, 'Mint')
        //assert.strictEqual(events[7].returnValues.mintTokens, web3.utils.toWei('100', 'lovelace'))

        assert.strictEqual(events[8].address, 'CUSDC')
        assert.strictEqual(events[8].eventName, 'Transfer')
      }
    }
  )

  await tester.runTest(
    'Dai Whale can deposit dai into the V6 smart wallet',
    tester.DAI,
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

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
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

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet cannot call executeAction and target Escape Hatch Registry',
    UserSmartWalletV6,
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

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
    'getNextGenericActionID',
    'call',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeAction',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V6 user smart wallet repayAndDeposit can still deposit without approval',
    UserSmartWalletV6,
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

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
    'getNextGenericActionID',
    'call',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeAction',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V6 user smart wallet repayAndDeposit can deposit with approval added back',
    UserSmartWalletV6,
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

  await tester.runTest(
    'V6 user smart wallet can trigger repayAndDeposit even with no funds',
    UserSmartWalletV6,
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

  await tester.runTest(
    'V6 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      0,
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  setUserSigningKeyUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  setUserSigningKeyDharmaSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'V6 UserSmartWallet cannot set the null address as a new user signing key',
    UserSmartWalletV6,
    'setUserSigningKey',
    'send',
    [
      constants.NULL_ADDRESS,
      0,
      setUserSigningKeyUserSignature,
      setUserSigningKeyDharmaSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get next custom action ID to set a user signing key',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.addressTwo,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV6,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV6,
    'getCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      0, // Note that this value differs from above
      tester.addressTwo,
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  setUserSigningKeyUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  setUserSigningKeyDharmaSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'V6 UserSmartWallet can set a new user signing key with signatures',
    UserSmartWalletV6,
    'setUserSigningKey',
    'send',
    [
      tester.addressTwo,
      0,
      setUserSigningKeyUserSignature,
      setUserSigningKeyDharmaSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get next custom action ID to cancel',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.originalAddress,  // This value shouldn't matter either
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV6,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV6,
    'getCustomActionID',
    'call',
    [
      0, // Cancel
      0, // Note that this value differs from above
      tester.addressTwo, // This one too
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  cancelUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet secondary can cancel using a signature',
    UserSmartWalletV6,
    'cancel',
    'send',
    [
      0,
      cancelUserSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'UserSmartWallet nonce is incremented after cancelling',
    UserSmartWalletV6,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(parseInt(value), parseInt(currentNonce) + 1)
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet secondary cannot call to withdraw dai without primary',
    UserSmartWalletV6,
    'withdrawDai',
    'send',
    [
      '1000000000000000000',
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet secondary cannot call to withdraw usdc without primary',
    UserSmartWalletV6,
    'withdrawUSDC',
    'send',
    [
      1,
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet secondary can no longer call to set userSigningKey without primary',
    UserSmartWalletV6,
    'setUserSigningKey',
    'send',
    [
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '1', // dust
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot withdraw "dust" USDC',
    UserSmartWalletV6,
    'withdrawUSDC',
    'send',
    [
      '1',
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV6,
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot withdraw USDC to null address',
    UserSmartWalletV6,
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
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWalletV6,
    'withdrawUSDC',
    'send',
    [
      '100000',
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWalletV6,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      '0xffffffff' + usdcWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet cannot call with bad user signature to withdraw USDC',
    UserSmartWalletV6,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0xffffffff' + usdcUserWithdrawalSignature.slice(10),
      usdcWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can call with two signatures to withdraw max USDC',
    UserSmartWalletV6,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
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

  const saiWithdrawalSignature = tester.signHashedPrefixedHashedHexString(
    withdrawalMessage,
    address
  )
  */

  await tester.runTest(
    'V6 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  let daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  let daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot withdraw "dust" dai',
    UserSmartWalletV6,
    'withdrawDai',
    'send',
    [
      '1',
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1000000000000000',
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot withdraw dai to null address',
    UserSmartWalletV6,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      constants.NULL_ADDRESS,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1000000000000000',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWalletV6,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet cannot get a non-custom "custom" next action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet cannot get a non-custom "custom" action ID',
    UserSmartWalletV6,
    'getCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      tester.address,
      0,
      0
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot call with bad signature to withdraw dai',
    UserSmartWalletV6,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      daiUserWithdrawalSignature,
      '0xffffffff' + daiWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot call with bad user signature to withdraw dai',
    UserSmartWalletV6,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0xffffffff' + daiUserWithdrawalSignature.slice(10),
      daiWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can call with signature to withdraw sai',
    UserSmartWalletV6,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '0', // no amount
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot to withdraw ether with no amount',
    UserSmartWalletV6,
    'withdrawEther',
    'send',
    [
      '0',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV6,
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

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot to withdraw ether with no recipient',
    UserSmartWalletV6,
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
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV6,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      '0xffffffff' + ethWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV6,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      '0xffffffff' + ethUserWithdrawalSignature.slice(10),
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV6,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV6,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      '0xffffffff' + ethWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV6,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      '0xffffffff' + ethUserWithdrawalSignature.slice(10),
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV6,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet cancel reverts with bad signature',
    UserSmartWalletV6,
    'cancel',
    'send',
    [
      0,
     '0x'
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet calls revert if insufficient action gas is supplied',
    UserSmartWalletV6,
    'cancel',
    'send',
    [
      constants.FULL_APPROVAL,
     '0x'
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWalletV6,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a cancel custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel,
      '0',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  cancelSignature = tester.signHashedPrefixedHexString(customActionId, tester.addressTwo)

  await tester.runTest(
    'V6 UserSmartWallet can cancel using a signature',
    UserSmartWalletV6,
    'cancel',
    'send',
    [
      '0',
      cancelSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet calls to atomic methods revert',
    UserSmartWalletV6,
    '_withdrawDaiAtomic',
    'send',
    [
      '1',
     tester.address
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet calls to recover from random address revert',
    UserSmartWalletV6,
    'recover',
    'send',
    [
     tester.address
    ],
    false
  )

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V6 smart wallet using a Dharma Key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [tester.addressTwo],
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
        assert.strictEqual(events[0].returnValues.userSigningKey, tester.addressTwo)
        //console.log(events)

        // TODO: test more events
      }
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
    'getNextGenericActionID',
    'call',
    [
      tester.USDC.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet cannot call executeAction and target a non-contract',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      tester.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet cannot call executeAction and target itself',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      UserSmartWalletV6.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeAction',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      tester.USDC.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V6 UserSmartWallet can get the next generic batch action ID',
    UserSmartWalletV6,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV6,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet generic batch action ID with nonce matches next ID',
    UserSmartWalletV6,
    'getGenericAtomicBatchActionID',
    'call',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeActionWithAtomicBatchCalls',
    UserSmartWalletV6,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the deployed smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'new user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV6,
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

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    'blacklist mock address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [constants.MOCK_USDC_BLACKLISTED_ADDRESS],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
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

  const BlacklistedUserSmartWalletV6 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV6Artifact.abi,
    targetBlacklistAddress
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the yet-to-be-blacklisted smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
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

  await tester.runTest(
    'blacklisted smart wallet will not approve USDC during repayAndDeposit',
    BlacklistedUserSmartWalletV6,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'un-blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'unBlacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
    'pause USDC',
    FIAT_TOKEN,
    'pause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV6,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet attempt to withdraw max USDC when paused causes ExternalError',
    UserSmartWalletV6,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'smart wallet will not approve USDC when paused during repayAndDeposit',
    BlacklistedUserSmartWalletV6,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'unpause USDC',
    FIAT_TOKEN,
    'unpause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await tester.runTest(
    'unblacklisted, unpaused smart wallet approves USDC during repayAndDeposit',
    BlacklistedUserSmartWalletV6,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a USDC withdrawal custom action ID',
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay call to withdraw USDC to itself',
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
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV6,
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

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot withdraw eth to a non-payable account',
    UserSmartWalletV6,
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
    tester.originalAddress
  )

  await tester.runTest(
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

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V6 smart wallet using a contract key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [targetWalletAddress]
  )

  const UserSmartWalletV6Two = new web3.eth.Contract(
    DharmaSmartWalletImplementationV6Artifact.abi,
    targetWalletAddressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet cancel reverts with bad contract signature',
    UserSmartWalletV6Two,
    'cancel',
    'send',
    [
      0,
     '0x'
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
    'getNextGenericActionID',
    'call',
    [
      tester.SAI.options.address,
      tester.SAI.methods.transfer(tester.address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeAction',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      tester.SAI.options.address,
      tester.SAI.methods.transfer(tester.address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1000000000000000000',
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot withdraw to the null address',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1000000000000000000',
      constants.NULL_ADDRESS,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay cannot withdraw too much dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get next generic batch action ID',
    UserSmartWalletV6,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{
        to: tester.DAI.options.address,
        data: tester.DAI.methods.transfer(
          tester.address, '100000000000000000000000000000'
        ).encodeABI()
      }],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet bad executeActionWithAtomicBatchCalls emits CallFailure',
    UserSmartWalletV6,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{
        to: tester.DAI.options.address,
        data: tester.DAI.methods.transfer(
          tester.address, '100000000000000000000000000000'
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

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
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

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeAction to enter dai market',
    UserSmartWalletV6,
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

  await tester.runTest(
    'Dai Whale can deposit dai into the smart wallet',
    tester.DAI,
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

  await tester.runTest(
    'V6 UserSmartWallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV6,
    'repayAndDeposit'
  )

  await tester.runTest(
    'V6 UserSmartWallet can get a generic action ID',
    UserSmartWalletV6,
    'getNextGenericActionID',
    'call',
    [
      CSAI_BORROW.options.address,
      CSAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V6 UserSmartWallet can call executeAction to perform a borrow',
    UserSmartWalletV6,
    'executeAction',
    'send',
    [
      CSAI_BORROW.options.address,
      CSAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    true,
    receipt => {
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V6 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV6,
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

  let escapeHatchSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  let escapeHatchUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'UserSmartWalletV6 can check the user signing key prior to upgrade',
    UserSmartWalletV6,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.addressTwo)
    }
  )

  await tester.runTest(
    'UserSmartWallet nonce can be retrieved',
    UserSmartWallet,
    'getNonce',
    'call',
    [],
    true,
    value => {
      originalNonce = value;
    }
  )

  await testPerformingUpgrade(
      tester,
      DharmaSmartWalletImplementationV7, // new implementation
      UserSmartWallet,
      DharmaUpgradeBeaconController,
      DharmaUpgradeBeacon.options.address,
      7
  )

  await tester.runTest(
    'V7 UserSmartWallet can get balances',
    UserSmartWalletV7,
    'getBalances',
    'call',
    [],
    true,
    value => {
      //console.log(value)
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet secondary can call to cancel',
    UserSmartWalletV7,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await tester.runTest(
    'V7 UserSmartWallet nonce is now set to original + 1',
    UserSmartWalletV7,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, (parseInt(originalNonce) + 1).toString())
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get next custom action ID to set a user signing key',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.addressTwo,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  setUserSigningKeyDharmaSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'V7 UserSmartWallet can set a new user signing key with signatures',
    UserSmartWalletV7,
    'setUserSigningKey',
    'send',
    [
      tester.addressTwo,
      0,
      '0x',
      setUserSigningKeyDharmaSignature
    ],
    true,
    receipt => {},
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet has the new user signing key set',
    UserSmartWalletV7,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.addressTwo)
    }
  )

  await tester.runTest(
    'cSai can be sent to V7 UserSmartWallet',
    tester.CSAI,
    'transfer',
    'send',
    [UserSmartWalletV7.options.address, web3.utils.toWei('0.5', 'mwei')]
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can trigger cSai to dDai migration before dDai approval',
    UserSmartWalletV7,
    'migrateCSaiToDDai',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get next custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      0, // DAIWithdrawal
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV7,
    'getCustomActionID',
    'call',
    [
      0, // DAIWithdrawal
      constants.FULL_APPROVAL,
      tester.address,
      parseInt(originalNonce) + 2,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get next generic action ID',
    UserSmartWalletV7,
    'getNextGenericActionID',
    'call',
    [
      tester.address,
      '0x',
      0
    ],
    true,
    value => {
      genericActionID = value
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get generic action ID and it matches next action ID',
    UserSmartWalletV7,
    'getGenericActionID',
    'call',
    [
      tester.address,
      '0x',
      parseInt(originalNonce) + 2,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, genericActionID)
    }
  )

  await tester.runTest(
    'UserSmartWallet calls to atomic methods revert',
    UserSmartWalletV7,
    '_withdrawDaiAtomic',
    'send',
    [
      '1',
     tester.address
    ],
    false
  )

  // Give the Dai Whale some ETH so it can make transactions
  await web3.eth.sendTransaction({
    from: tester.address,
    to: constants.DAI_WHALE_ADDRESS,
    value: web3.utils.toWei('1', 'ether'),
    gas: (testingContext !== 'coverage') ? '0xffff' : tester.gasLimit - 1,
    gasPrice: 1
  })

  await tester.runTest(
    'Dai Whale can deposit Dai into the V7 smart wallet',
    tester.DAI,
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

  await tester.runTest(
    'USDC Whale can deposit usdc into the V7 smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
    'getNextGenericActionID',
    'call',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeAction',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V7 user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      // TODO: validate
    }
  )

  await tester.runTest(
    'Dai Whale can deposit dai into the V7 smart wallet',
    tester.DAI,
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

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
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

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot call executeAction and target Escape Hatch Registry',
    UserSmartWalletV7,
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

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
    'getNextGenericActionID',
    'call',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeAction',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V7 user smart wallet repayAndDeposit can still deposit without approval',
    UserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {  
      // TODO: validate
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
    'getNextGenericActionID',
    'call',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeAction',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      tester.DAI.options.address,
      tester.DAI.methods.approve(tester.CDAI.options.address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V7 user smart wallet repayAndDeposit can deposit with approval added back',
    UserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      // TODO: validate
    }
  )

  await tester.runTest(
    'V7 user smart wallet can trigger repayAndDeposit even with no funds',
    UserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      // TODO: validate
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      0,
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  setUserSigningKeyUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  setUserSigningKeyDharmaSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot set the null address as a new user signing key',
    UserSmartWalletV7,
    'setUserSigningKey',
    'send',
    [
      constants.NULL_ADDRESS,
      0,
      setUserSigningKeyUserSignature,
      setUserSigningKeyDharmaSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get next custom action ID to set a user signing key',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.addressTwo,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV7,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV7,
    'getCustomActionID',
    'call',
    [
      1, // SetUserSigningKey,
      0, // Note that this value differs from above
      tester.addressTwo,
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  setUserSigningKeyUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  setUserSigningKeyDharmaSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  await tester.runTest(
    'V7 UserSmartWallet can set a new user signing key with signatures',
    UserSmartWalletV7,
    'setUserSigningKey',
    'send',
    [
      tester.addressTwo,
      0,
      setUserSigningKeyUserSignature,
      setUserSigningKeyDharmaSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get next custom action ID to cancel',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel
      constants.FULL_APPROVAL, // This value shouldn't matter
      tester.originalAddress,  // This value shouldn't matter either
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV7,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get custom action ID and it matches next action ID',
    UserSmartWalletV7,
    'getCustomActionID',
    'call',
    [
      0, // Cancel
      0, // Note that this value differs from above
      tester.addressTwo, // This one too
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  cancelUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet secondary can cancel using a signature',
    UserSmartWalletV7,
    'cancel',
    'send',
    [
      0,
      cancelUserSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'UserSmartWallet nonce is incremented after cancelling',
    UserSmartWalletV7,
    'getNonce',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(parseInt(value), parseInt(currentNonce) + 1)
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet secondary cannot call to withdraw dai without primary',
    UserSmartWalletV7,
    'withdrawDai',
    'send',
    [
      '1000000000000000000',
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet secondary cannot call to withdraw usdc without primary',
    UserSmartWalletV7,
    'withdrawUSDC',
    'send',
    [
      1,
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet secondary can no longer call to set userSigningKey without primary',
    UserSmartWalletV7,
    'setUserSigningKey',
    'send',
    [
      tester.address,
      0,
      '0x',
      '0x'
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '1', // dust
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot withdraw "dust" USDC',
    UserSmartWalletV7,
    'withdrawUSDC',
    'send',
    [
      '1',
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV7,
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot withdraw USDC to null address',
    UserSmartWalletV7,
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWalletV7,
    'withdrawUSDC',
    'send',
    [
      '100000',
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWalletV7,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      '0xffffffff' + usdcWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot call with bad user signature to withdraw USDC',
    UserSmartWalletV7,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0xffffffff' + usdcUserWithdrawalSignature.slice(10),
      usdcWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can call with two signatures to withdraw max USDC',
    UserSmartWalletV7,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
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

  const saiWithdrawalSignature = tester.signHashedPrefixedHashedHexString(
    withdrawalMessage,
    address
  )
  */

  await tester.runTest(
    'V7 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot withdraw "dust" dai',
    UserSmartWalletV7,
    'withdrawDai',
    'send',
    [
      '1',
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1000000000000000',
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot withdraw dai to null address',
    UserSmartWalletV7,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      constants.NULL_ADDRESS,
      0,
      saiUserWithdrawalSignature,
      saiWithdrawalSignature
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1000000000000000',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWalletV7,
    'withdrawDai',
    'send',
    [
      '1000000000000000',
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot get a non-custom "custom" next action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot get a non-custom "custom" action ID',
    UserSmartWalletV7,
    'getCustomActionID',
    'call',
    [
      2, // Generic,
      constants.FULL_APPROVAL,
      tester.address,
      0,
      0
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot call with bad signature to withdraw dai',
    UserSmartWalletV7,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      daiUserWithdrawalSignature,
      '0xffffffff' + daiWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot call with bad user signature to withdraw dai',
    UserSmartWalletV7,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      '0xffffffff' + daiUserWithdrawalSignature.slice(10),
      daiWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can call with signature to withdraw sai',
    UserSmartWalletV7,
    'withdrawDai',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '0', // no amount
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot to withdraw ether with no amount',
    UserSmartWalletV7,
    'withdrawEther',
    'send',
    [
      '0',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV7,
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

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot to withdraw ether with no recipient',
    UserSmartWalletV7,
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV7,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      '0xffffffff' + ethWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV7,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      '0xffffffff' + ethUserWithdrawalSignature.slice(10),
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV7,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      6, // ETHWithdrawal,
      '1',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV7,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      '0xffffffff' + ethWithdrawalSignature.slice(10)
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV7,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      '0xffffffff' + ethUserWithdrawalSignature.slice(10),
      ethWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV7,
    'withdrawEther',
    'send',
    [
      '1',
      tester.address,
      0,
      ethUserWithdrawalSignature,
      ethWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet cancel reverts with bad signature',
    UserSmartWalletV7,
    'cancel',
    'send',
    [
      0,
     '0x'
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet calls revert if insufficient action gas is supplied',
    UserSmartWalletV7,
    'cancel',
    'send',
    [
      constants.FULL_APPROVAL,
     '0x'
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWalletV7,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a cancel custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      0, // Cancel,
      '0',
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  cancelSignature = tester.signHashedPrefixedHexString(customActionId, tester.addressTwo)

  await tester.runTest(
    'V7 UserSmartWallet can cancel using a signature',
    UserSmartWalletV7,
    'cancel',
    'send',
    [
      '0',
      cancelSignature
    ],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet calls to atomic methods revert',
    UserSmartWalletV7,
    '_withdrawDaiAtomic',
    'send',
    [
      '1',
     tester.address
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet calls to recover from random address revert',
    UserSmartWalletV7,
    'recover',
    'send',
    [
     tester.address
    ],
    false
  )

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V7 smart wallet using a Dharma Key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [tester.addressTwo],
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
        assert.strictEqual(events[0].returnValues.userSigningKey, tester.addressTwo)
        //console.log(events)

        // TODO: test more events
      }
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
    'getNextGenericActionID',
    'call',
    [
      tester.USDC.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot call executeAction and target a non-contract',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      tester.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot call executeAction and target itself',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      UserSmartWalletV7.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeAction',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      tester.USDC.options.address,
      tester.USDC.methods.approve(tester.CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V7 UserSmartWallet can get the next generic batch action ID',
    UserSmartWalletV7,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  await tester.runTest(
    'UserSmartWallet can get the nonce',
    UserSmartWalletV7,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet generic batch action ID with nonce matches next ID',
    UserSmartWalletV7,
    'getGenericAtomicBatchActionID',
    'call',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      currentNonce,
      0
    ],
    true,
    value => {
      assert.strictEqual(value, customActionId)
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeActionWithAtomicBatchCalls',
    UserSmartWalletV7,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{to: tester.SAI.options.address, data: tester.SAI.methods.totalSupply().encodeABI()}],
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the deployed smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'new user smart wallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {
      // TODO: validate
    }
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    'blacklist mock address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [constants.MOCK_USDC_BLACKLISTED_ADDRESS],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
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

  const BlacklistedUserSmartWalletV7 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV7Artifact.abi,
    targetBlacklistAddress
  )

  await tester.runTest(
    'USDC Whale can deposit usdc into the yet-to-be-blacklisted smart wallet',
    tester.USDC,
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

  await tester.runTest(
    'blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
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

  await tester.runTest(
    'blacklisted smart wallet will not approve USDC during repayAndDeposit',
    BlacklistedUserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'un-blacklist counterfactual deployment address',
    FIAT_TOKEN,
    'unBlacklist',
    'send',
    [targetBlacklistAddress],
    true,
    receipt => {},
    blacklister
  )

  await tester.runTest(
    'pause USDC',
    FIAT_TOKEN,
    'pause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      constants.FULL_APPROVAL,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet attempt to withdraw max USDC when paused causes ExternalError',
    UserSmartWalletV7,
    'withdrawUSDC',
    'send',
    [
      constants.FULL_APPROVAL,
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'smart wallet will not approve USDC when paused during repayAndDeposit',
    BlacklistedUserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'unpause USDC',
    FIAT_TOKEN,
    'unpause',
    'send',
    [],
    true,
    receipt => {},
    pauser
  )

  await tester.runTest(
    'unblacklisted, unpaused smart wallet approves USDC during repayAndDeposit',
    BlacklistedUserSmartWalletV7,
    'repayAndDeposit',
    'send',
    [],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a USDC withdrawal custom action ID',
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay call to withdraw USDC to itself',
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV7,
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

  ethWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  ethUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot withdraw eth to a non-payable account',
    UserSmartWalletV7,
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
    tester.originalAddress
  )

  await tester.runTest(
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

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V7 smart wallet using a contract key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [targetWalletAddress]
  )

  const UserSmartWalletV7Two = new web3.eth.Contract(
    DharmaSmartWalletImplementationV7Artifact.abi,
    targetWalletAddressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet cancel reverts with bad contract signature',
    UserSmartWalletV7Two,
    'cancel',
    'send',
    [
      0,
     '0x'
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
    'getNextGenericActionID',
    'call',
    [
      tester.SAI.options.address,
      tester.SAI.methods.transfer(tester.address, constants.FULL_APPROVAL).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeAction',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      tester.SAI.options.address,
      tester.SAI.methods.transfer(tester.address, constants.FULL_APPROVAL).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ]
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '1000000000000000000',
      constants.NULL_ADDRESS,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot withdraw to the null address',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '1000000000000000000',
      constants.NULL_ADDRESS,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      10, // DaiWithdrawal
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  daiWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  daiUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot withdraw too much dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0,
      daiUserWithdrawalSignature,
      daiWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a USDC withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      5, // USDCWithdrawal,
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  usdcWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  usdcUserWithdrawalSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can call with two signatures to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      '100000000000000000000000000000000000000', // too much
      tester.address,
      0,
      usdcUserWithdrawalSignature,
      usdcWithdrawalSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt)
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get next generic batch action ID',
    UserSmartWalletV7,
    'getNextGenericAtomicBatchActionID',
    'call',
    [
      [{
        to: tester.DAI.options.address,
        data: tester.DAI.methods.transfer(
          tester.address, '100000000000000000000000000000'
        ).encodeABI()
      }],
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet bad executeActionWithAtomicBatchCalls emits CallFailure',
    UserSmartWalletV7,
    'executeActionWithAtomicBatchCalls',
    'send',
    [
      [{
        to: tester.DAI.options.address,
        data: tester.DAI.methods.transfer(
          tester.address, '100000000000000000000000000000'
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

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
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

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeAction to enter dai market',
    UserSmartWalletV7,
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

  await tester.runTest(
    'Dai Whale can deposit dai into the smart wallet',
    tester.DAI,
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

  await tester.runTest(
    'V7 UserSmartWallet can trigger repayAndDeposit to deposit all new funds',
    UserSmartWalletV7,
    'repayAndDeposit'
  )

  await tester.runTest(
    'V7 UserSmartWallet can get a generic action ID',
    UserSmartWalletV7,
    'getNextGenericActionID',
    'call',
    [
      CSAI_BORROW.options.address,
      CSAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  executeActionSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  executeActionUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet can call executeAction to perform a borrow',
    UserSmartWalletV7,
    'executeAction',
    'send',
    [
      CSAI_BORROW.options.address,
      CSAI_BORROW.methods.borrow(web3.utils.toWei('.01', 'ether')).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    true,
    receipt => {
      //console.log(receipt.events)
    },
    tester.originalAddress
  )




  await tester.runTest(
    'V7 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV7,
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

  escapeHatchSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  escapeHatchUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot set an escape hatch with no account',
    UserSmartWalletV7,
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      7, // SetEscapeHatch,
      0,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  escapeHatchSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  escapeHatchUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot call escape before escape hatch is set',
    UserSmartWalletV7,
    'escape',
    'send',
    [],
    false,
    receipt => {
      // TODO: verify logs
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can set an escape hatch',
    UserSmartWalletV7,
    'setEscapeHatch',
    'send',
    [
      tester.address,
      0,
      escapeHatchUserSignature,
      escapeHatchSignature
    ],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet non-escape hatch account cannot call escape',
    UserSmartWalletV7,
    'escape',
    'send',
    [],
    false,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet escape hatch account can call escape',
    UserSmartWalletV7,
    'escape',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.address
  )

  await tester.runTest(
    'V7 UserSmartWallet escape hatch account can call escape again',
    UserSmartWalletV7,
    'escape',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.address
  )

  await tester.runTest(
    'V7 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV7,
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

  escapeHatchSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  escapeHatchUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can remove an escape hatch',
    UserSmartWalletV7,
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet cannot call escape once escape hatch is removed',
    UserSmartWalletV7,
    'escape',
    'send',
    [],
    false,
    receipt => {
      // TODO: verify logs
    }
  )

  await tester.runTest(
    'V7 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV7,
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

  escapeHatchSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  escapeHatchUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can disable the escape hatch',
    UserSmartWalletV7,
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
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet can get an escape hatch action ID',
    UserSmartWalletV7,
    'getNextCustomActionID',
    'call',
    [
      7, // SetEscapeHatch,
      0,
      tester.address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  escapeHatchSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.address
  )

  escapeHatchUserSignature = tester.signHashedPrefixedHexString(
    customActionId,
    tester.addressTwo
  )

  await tester.runTest(
    'V7 UserSmartWallet relay cannot set an escape hatch once disabled',
    UserSmartWalletV7,
    'setEscapeHatch',
    'send',
    [
      tester.address,
      0,
      escapeHatchUserSignature,
      escapeHatchSignature
    ],
    false,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can trigger sai to dai migration as a no-op',
    UserSmartWalletV7,
    'migrateSaiToDai',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can trigger cSai to dDai migration as a no-op',
    UserSmartWalletV7,
    'migrateCSaiToDDai',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'cSai can be sent to V7 UserSmartWallet',
    tester.CSAI,
    'transfer',
    'send',
    [UserSmartWalletV7.options.address, web3.utils.toWei('0.5', 'mwei')]
  )

  await tester.runTest(
    'Sai Whale can deposit sai into the V7 user smart wallet',
    tester.SAI,
    'transfer',
    'send',
    [UserSmartWalletV7.options.address, web3.utils.toWei('1', 'ether')],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Transfer.returnValues.from,
          constants.SAI_WHALE_ADDRESS
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.to,
          UserSmartWalletV7.options.address
        )
        assert.strictEqual(
          receipt.events.Transfer.returnValues.value,
          web3.utils.toWei('1', 'ether')
        )
      }
    },
    constants.SAI_WHALE_ADDRESS
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can trigger sai to dai migration',
    UserSmartWalletV7,
    'migrateSaiToDai',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  await tester.runTest(
    'V7 UserSmartWallet relay can trigger cSai to dDai migration',
    UserSmartWalletV7,
    'migrateCSaiToDDai',
    'send',
    [],
    true,
    receipt => {
      // TODO: verify logs
    },
    tester.originalAddress
  )

  // Initiate account recovery
  await tester.runTest(
    'smart wallet account recovery can be initiated',
    DharmaAccountRecoveryManagerV2,
    'initiateAccountRecovery',
    'send',
    [
      UserSmartWalletV7.options.address,
      tester.originalAddress,
      0 // extraTime in seconds
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  await tester.runTest(
    'smart wallet account recovery cannot be performed right away',
    DharmaAccountRecoveryManagerV2,
    'recover',
    'send',
    [
      UserSmartWalletV7.options.address,
      tester.originalAddress
    ],
    false
  )

  // advance time by 3 days
  await tester.advanceTime((60 * 60 * 24 * 3) + 5)

  // recover account
  await tester.runTest(
    'smart wallet account recovery can be performed after three days',
    DharmaAccountRecoveryManagerV2,
    'recover',
    'send',
    [
      UserSmartWalletV7.options.address,
      tester.originalAddress
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
    }
  )

  // ZZZZZ

  // COVERAGE TESTING - deployments
  const DharmaUpgradeBeaconControllerManagerCoverage = await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment`,
    DharmaUpgradeBeaconControllerManagerDeployer,
    '',
    'deploy'
  )

  const DharmaUpgradeBeaconControllerCoverage = await tester.runTest(
    `DharmaUpgradeBeaconController contract deployment`,
    DharmaUpgradeBeaconControllerDeployer,
    '',
    'deploy'
  )

  const DharmaUpgradeBeaconCoverage = await tester.runTest(
    `DharmaUpgradeBeacon (smart wallet) contract deployment`,
    DharmaUpgradeBeaconDeployer,
    '',
    'deploy'
  )

  const DharmaKeyRingUpgradeBeaconCoverage = await tester.runTest(
    `DharmaKeyRingUpgradeBeacon contract deployment`,
    DharmaKeyRingUpgradeBeaconDeployer,
    '',
    'deploy'
  )

  const DharmaUpgradeBeaconEnvoy = await tester.runTest(
    `DharmaUpgradeBeaconEnvoy contract deployment`,
    DharmaUpgradeBeaconEnvoyDeployer,
    '',
    'deploy'
  )

  await testUpgradeBeaconController(
      tester,
      DharmaUpgradeBeaconControllerCoverage, // controller manager
      DharmaUpgradeBeaconController, // smart wallet controller contract
      DharmaKeyRingUpgradeBeaconController, // key ring controller contract
      DharmaUpgradeBeaconEnvoy, // envoy contract
      DharmaUpgradeBeaconCoverage.options.address, // owned smart wallet beacon
      DharmaKeyRingUpgradeBeaconCoverage.options.address, // owned key ring beacon
      BadBeaconTwo.options.address // "bad" beacon
  );

  const DharmaKeyRegistryV2Coverage = await tester.runTest(
    `DharmaKeyRegistryV2 contract deployment`,
    DharmaKeyRegistryV2Deployer,
    '',
    'deploy'
  )

  const AdharmaSmartWalletImplementation = await tester.runTest(
    `AdharmaSmartWalletImplementation contract deployment`,
    AdharmaSmartWalletImplementationDeployer,
    '',
    'deploy'
  )

  const AdharmaKeyRingImplementation = await tester.runTest(
    `AdharmaKeyRingImplementation contract deployment`,
    AdharmaKeyRingImplementationDeployer,
    '',
    'deploy'
  )

  const DharmaSmartWalletFactoryV1Coverage = await tester.runTest(
    `DharmaSmartWalletFactoryV1 contract deployment`,
    DharmaSmartWalletFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  const DharmaKeyRingFactoryV1 = await tester.runTest(
    `DharmaKeyRingFactoryV1 contract deployment`,
    DharmaKeyRingFactoryV1Deployer,
    '',
    'deploy',
    []
  )

  const DharmaKeyRingFactoryV2 = await tester.runTest(
    `DharmaKeyRingFactoryV2 contract deployment`,
    DharmaKeyRingFactoryV2Deployer,
    '',
    'deploy',
    []
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring with no key`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring and set a new null key`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndAdditionalKey',
    'send',
    [tester.address, constants.NULL_ADDRESS, '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring and set a duplicate key`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndAdditionalKey',
    'send',
    [tester.address, tester.address, '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 can get the address of the next key ring`,
    DharmaKeyRingFactoryV1,
    'getNextKeyRing',
    'call',
    [tester.address],
    true,
    value => {
      nextKeyRing = value;
    }
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 can create a V1 key ring`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [tester.address]
  )

  const KeyRingInstance = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi,
    nextKeyRing
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 gets new key ring after a deploy with same input`,
    DharmaKeyRingFactoryV1,
    'getNextKeyRing',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(nextKeyRing !== value)
    }
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    `KeyRingInstance cannot add a non-dual key in V1`,
    KeyRingInstance,
    'takeAdminAction',
    'send',
    [1, 1, '0x'],
    false
  ) 

  await tester.runTest(
    `KeyRingInstance cannot add key that already exists`,
    KeyRingInstance,
    'takeAdminAction',
    'send',
    [6, tester.address, '0x'],
    false
  )

  const takeAdminActionSignature = tester.signHashedPrefixedHexString(
    adminActionID,
    tester.address
  )

  await tester.runTest(
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

  await tester.runTest(
    `KeyRingInstance can add a new key with a valid signature`,
    KeyRingInstance,
    'takeAdminAction',
    'send',
    [6, 1, takeAdminActionSignature],
    true
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 cannot create a V1 key ring with no key`,
    DharmaKeyRingFactoryV2,
    'newKeyRing',
    'send',
    [constants.NULL_ADDRESS, constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 cannot create a V1 key ring and set a new null key`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndAdditionalKey',
    'send',
    [tester.address, constants.NULL_ADDRESS, constants.NULL_ADDRESS, '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 cannot create a V1 key ring and set a duplicate key`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndAdditionalKey',
    'send',
    [tester.address, constants.NULL_ADDRESS, tester.address, '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 can get the address of the next key ring`,
    DharmaKeyRingFactoryV2,
    'getNextKeyRing',
    'call',
    [tester.address],
    true,
    value => {
      nextKeyRing = value;
    }
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 can create a V1 key ring if the target address matches`,
    DharmaKeyRingFactoryV2,
    'newKeyRing',
    'send',
    [tester.address, nextKeyRing]
  )

  const KeyRingInstanceFromV2Factory = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi,
    nextKeyRing
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 won't deploy a V1 key ring if the target address has one`,
    DharmaKeyRingFactoryV2,
    'newKeyRing',
    'send',
    [tester.address, KeyRingInstanceFromV2Factory.options.address]
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 can call getFirstKeyRingAdminActionID`,
    DharmaKeyRingFactoryV2,
    'getFirstKeyRingAdminActionID',
    'call',
    [tester.address, tester.address]
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 reverts when no new key ring supplied`,
    DharmaKeyRingFactoryV2,
    'getNextKeyRing',
    'call',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 gets new key ring after a deploy with same input`,
    DharmaKeyRingFactoryV2,
    'getNextKeyRing',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(nextKeyRing !== value)
    }
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 can call newKeyRingAndDaiWithdrawal`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndDaiWithdrawal',
    'send',
    [tester.address, tester.address, tester.address, 0, tester.address, 0, '0x', '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV2 can call newKeyRingAndUSDCWithdrawal`,
    DharmaKeyRingFactoryV2,
    'newKeyRingAndUSDCWithdrawal',
    'send',
    [tester.address, tester.address, tester.address, 0, tester.address, 0, '0x', '0x'],
    false
  )

  await tester.runTest(
    `AdharmaSmartWalletImplementation cannot be initialized directly post-deployment`,
    AdharmaSmartWalletImplementation,
    'initialize',
    'send',
    [tester.address],
    false
  )

  await tester.runTest(
    `AdharmaSmartWalletImplementation cannot be used to perform calls directly`,
    AdharmaSmartWalletImplementation,
    'performCall',
    'send',
    [tester.address, 1, '0x'],
    false
  )

  await tester.runTest(
    `AdharmaKeyRingImplementation cannot be initialized directly post-deployment`,
    AdharmaKeyRingImplementation,
    'initialize',
    'send',
    [1, 1, [tester.address], [3]],
    false
  )

  await tester.runTest(
    `AdharmaKeyRingImplementation cannot be used to take action directly`,
    AdharmaKeyRingImplementation,
    'takeAction',
    'send',
    [tester.address, 1, '0x', '0x'],
    false
  )

  await tester.runTest(
    `UpgradeBeaconProxyV1 contract deployment fails with no init data`,
    UpgradeBeaconProxyV1Deployer,
    '',
    'deploy',
    ['0x'],
    false
  )

  await tester.runTest(
    `KeyRingUpgradeBeaconProxyV1 contract deployment fails with no init data`,
    KeyRingUpgradeBeaconProxyV1Deployer,
    '',
    'deploy',
    ['0x'],
    false
  )

  const UpgradeBeaconProxyV1 = await tester.runTest(
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
    }, [tester.address])]
  )

  const UpgradeBeaconProxyV1Implementation = new web3.eth.Contract(
    DharmaSmartWalletImplementationV6Artifact.abi,
    UpgradeBeaconProxyV1.options.address
  )

  await tester.runTest(
    `UpgradeBeaconProxyV1 can retrieve its user signing key`,
    UpgradeBeaconProxyV1Implementation,
    'getUserSigningKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  const KeyRingUpgradeBeaconProxyV1 = await tester.runTest(
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
    }, [1, 1, [tester.address], [3]])]
  )

  const KeyRingUpgradeBeaconProxyV1Implementation = new web3.eth.Contract(
    DharmaKeyRingImplementationV1Artifact.abi,
    KeyRingUpgradeBeaconProxyV1.options.address
  )

  await tester.runTest(
    `KeyRingUpgradeBeaconProxyV1 can retrieve its user signing key`,
    KeyRingUpgradeBeaconProxyV1Implementation,
    'getKeyType',
    'call',
    [tester.address],
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
    const DharmaSmartWalletFactoryV2 = await tester.runTest(
      `DharmaSmartWalletFactoryV2 contract deployment`,
      DharmaSmartWalletFactoryV2Deployer,
      '',
      'deploy',
      []
    )

    const DharmaKeyRingFactoryV3 = await tester.runTest(
      `DharmaKeyRingFactoryV3 contract deployment`,
      DharmaKeyRingFactoryV3Deployer,
      '',
      'deploy',
      []
    )
  }
  */

  await testKeyRegistryV2(
      tester, DharmaKeyRegistryV2Coverage, DharmaKeyRegistryV2.options.address
  )

  const DharmaAccountRecoveryManagerV2Coverage = await tester.runTest(
    `DharmaAccountRecoveryManagerV2 contract deployment`,
    DharmaAccountRecoveryManagerV2Deployer,
    '',
    'deploy'
  )

  await testAccountRecoveryManager(
      tester,
      DharmaAccountRecoveryManagerV2Coverage,
      UserSmartWalletV6.options.address
  );


  await testUpgradeBeaconControllerManagerPartOne(
      tester, DharmaUpgradeBeaconControllerManagerCoverage
  )

  const MockDharmaKeyRingFactory = await tester.runTest(
    `MockDharmaKeyRingFactory contract deployment`,
    MockDharmaKeyRingFactoryDeployer,
    '',
    'deploy',
    []
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with no keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [], []],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with null address as key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [constants.NULL_ADDRESS], [3]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with non-dual key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [tester.address], [1]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with admin threshold > 1`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [2, 1, [tester.address], [3]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy a DharmaV1 key ring with executor threshold > 1`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 2, [tester.address], [3]],
    false
  )

  await tester.runTest(
    'Dharma Upgrade Beacon Controller can upgrade to AdharmaSmartWalletImplementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      AdharmaSmartWalletImplementation.options.address
    ]
  )

  await tester.runTest(
    'Dharma Key Ring Upgrade Beacon Controller can upgrade to AdharmaKeyRingImplementation',
    DharmaKeyRingUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaKeyRingUpgradeBeacon.options.address,
      AdharmaKeyRingImplementation.options.address
    ]
  )

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 cannot deploy an Adharma smart wallet with no key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    'DharmaSmartWalletFactoryV1 can deploy an Adharma smart wallet',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [tester.address]
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 cannot create a V1 key ring with no key`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 cannot create an Adharma key ring and set a new null key`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndAdditionalKey',
    'send',
    [tester.address, constants.NULL_ADDRESS, '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 reverts when no new key ring supplied`,
    DharmaKeyRingFactoryV1,
    'getNextKeyRing',
    'call',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 can call newKeyRingAndDaiWithdrawal`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndDaiWithdrawal',
    'send',
    [tester.address, tester.address, 0, tester.address, 0, '0x', '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 can call newKeyRingAndUSDCWithdrawal`,
    DharmaKeyRingFactoryV1,
    'newKeyRingAndUSDCWithdrawal',
    'send',
    [tester.address, tester.address, 0, tester.address, 0, '0x', '0x'],
    false
  )

  await tester.runTest(
    `DharmaKeyRingFactoryV1 can create an Adharma key ring`,
    DharmaKeyRingFactoryV1,
    'newKeyRing',
    'send',
    [tester.address]
  )

  const UserSmartWalletAdharma = new web3.eth.Contract(
    AdharmaSmartWalletImplementationArtifact.abi,
    UserSmartWalletV6.options.address
  )

  await tester.runTest(
    `Adharma Smart Wallet can be used to perform calls`,
    UserSmartWalletAdharma,
    'performCall',
    'send',
    [UserSmartWalletAdharma.options.address, 0, '0x'],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    `Adharma Smart Wallet can be used to perform failing calls`,
    UserSmartWalletAdharma,
    'performCall',
    'send',
    [BadBeacon.options.address, 0, '0x'],
    false,
    receipt => {},
    tester.originalAddress
  )

  const KeyRingAdharma = new web3.eth.Contract(
    AdharmaKeyRingImplementationArtifact.abi,
    KeyRingInstance.options.address
  )

  await tester.runTest(
    `Adharma Key Ring can be used to take an action`,
    KeyRingAdharma,
    'takeAction',
    'send',
    [tester.address, 0, '0x', '0x']
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with no keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [0, 0, [], []],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with admin threshold of 0`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [0, 1, [tester.address], [3]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with executor threshold of 0`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 0, [tester.address], [3]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring where length of keys and types are not equal`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [tester.address, tester.addressTwo], [3]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with duplicate keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [tester.address, tester.address], [3, 3]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with no admin key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [tester.address], [1]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with less admin keys than threshold`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [2, 1, [tester.address], [3]],
    false
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory can deploy an Adharma key ring with multiple keys`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [2, 2, [tester.address, tester.addressTwo], [3, 3]]
  )

  await tester.runTest(
    `MockDharmaKeyRingFactory cannot deploy an Adharma key ring with no standard key`,
    MockDharmaKeyRingFactory,
    'newKeyRing',
    'send',
    [1, 1, [tester.address], [2]],
    false
  )

  await tester.runTest(
    `TimelockEdgecaseTester contract deployment edge case 1`,
    TimelockEdgecaseTesterDeployer,
    '',
    'deploy',
    [0],
    false
  )

  await tester.runTest(
    `TimelockEdgecaseTester contract deployment edge case 2`,
    TimelockEdgecaseTesterDeployer,
    '',
    'deploy',
    [1],
    false
  )

  await tester.runTest(
    `TimelockEdgecaseTester contract deployment edge case 3`,
    TimelockEdgecaseTesterDeployer,
    '',
    'deploy',
    [2],
    false
  )

  const DharmaUpgradeMultisig = await tester.runTest(
    `DharmaUpgradeMultisig contract deployment`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour, tester.ownerFive]]
  )

  const DharmaAccountRecoveryMultisig = await tester.runTest(
    `DharmaAccountRecoveryMultisig contract deployment`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour]]
  )

  const DharmaAccountRecoveryOperatorMultisig = await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig contract deployment`,
    DharmaAccountRecoveryOperatorMultisigDeployer,
    '',
    'deploy',
    [[tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour]]
  )

  const DharmaKeyRegistryMultisig = await tester.runTest(
    `DharmaKeyRegistryMultisig contract deployment`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour, tester.ownerFive]]
  )

  rawData = '0x'
  executorGasLimit = 100000000000

  const bizarreSigs = (
    '0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0' +
    '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A11b' +
    '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0' +
    '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A01a'   
  )

  await tester.runTest(
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

  await tester.runTest(
    `DharmaUpgradeMultisig can get the owners`,
    DharmaUpgradeMultisig,
    'getOwners',
    'call',
    [],
    true,
    value => {
      assert.deepEqual(
        value, [tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour, tester.ownerFive]
      )
    }
  )

  await tester.runTest(
    `DharmaUpgradeMultisig can get an owner`,
    DharmaUpgradeMultisig,
    'isOwner',
    'call',
    [tester.ownerOne],
    true,
    value => {
      assert.ok(value)
    }
  )

  await tester.runTest(
    `DharmaUpgradeMultisig returns false for a non-owner`,
    DharmaUpgradeMultisig,
    'isOwner',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await tester.runTest(
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

  await tester.runTest(
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
    tester.address.slice(2) +
    executorGasLimit.toString(16).padStart(64, '0') +
    rawData.slice(2)
  )

  hash = util.bufferToHex(util.keccak256(hashInputs))

  await tester.runTest(
    `DharmaUpgradeMultisig can get a hash`,
    DharmaUpgradeMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  await tester.runTest(
    `DharmaUpgradeMultisig can get a hash with a specific nonce`,
    DharmaUpgradeMultisig,
    'getHash',
    'call',
    [rawData, tester.address, executorGasLimit, 0],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2) + ownerThreeSig.slice(2)
  unownedSig = tester.signHashedPrefixedHexString(hash, tester.address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaUpgradeMultisig cannot call execute from non-executor`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.addressTwo, executorGasLimit, ownerSigs],
    false
  )

  await tester.runTest(
    `DharmaUpgradeMultisig cannot call execute with oddly-sized signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs + '1234'],
    false
  )

  await tester.runTest(
    `DharmaUpgradeMultisig cannot call execute with non-compliant signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, bizarreSigs],
    false
  )

  await tester.runTest(
    `DharmaUpgradeMultisig cannot call execute without enough signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs.slice(0, -130)],
    false
  )

  await tester.runTest(
    `DharmaUpgradeMultisig cannot call execute without owner signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, unownedSigs],
    false
  )

  await tester.runTest(
    `DharmaUpgradeMultisig cannot call execute with out-of-order signatures`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigsOutOfOrder],
    false
  )

  await tester.runTest(
    `DharmaUpgradeMultisig can call execute`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    `DharmaKeyRegistryMultisig can get the owners`,
    DharmaKeyRegistryMultisig,
    'getOwners',
    'call',
    [],
    true,
    value => {
      assert.deepEqual(
        value, [tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour, tester.ownerFive]
      )
    }
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig can get an owner`,
    DharmaKeyRegistryMultisig,
    'isOwner',
    'call',
    [tester.ownerOne],
    true,
    value => {
      assert.ok(value)
    }
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig returns false for a non-owner`,
    DharmaKeyRegistryMultisig,
    'isOwner',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await tester.runTest(
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

  await tester.runTest(
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
    tester.address.slice(2) +
    executorGasLimit.toString(16).padStart(64, '0') +
    rawData.slice(2)
  )

  hash = util.bufferToHex(util.keccak256(hashInputs))

  await tester.runTest(
    `DharmaKeyRegistryMultisig can get a hash`,
    DharmaKeyRegistryMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig can get a hash with a specific nonce`,
    DharmaKeyRegistryMultisig,
    'getHash',
    'call',
    [rawData, tester.address, executorGasLimit, 0],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2) + ownerThreeSig.slice(2)
  unownedSig = tester.signHashedPrefixedHexString(hash, tester.address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaKeyRegistryMultisig cannot call execute from non-executor`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.addressTwo, executorGasLimit, ownerSigs],
    false
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig cannot call execute with oddly-sized signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs + '1234'],
    false
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig cannot call execute with non-compliant signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, bizarreSigs],
    false
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig cannot call execute without enough signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs.slice(0, -130)],
    false
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig cannot call execute without owner signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, unownedSigs],
    false
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig cannot call execute with out-of-order signatures`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigsOutOfOrder],
    false
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig can call execute`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can get the owners`,
    DharmaAccountRecoveryMultisig,
    'getOwners',
    'call',
    [],
    true,
    value => {
      assert.deepEqual(
        value, [tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour]
      )
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can get an owner`,
    DharmaAccountRecoveryMultisig,
    'isOwner',
    'call',
    [tester.ownerOne],
    true,
    value => {
      assert.ok(value)
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig returns false for a non-owner`,
    DharmaAccountRecoveryMultisig,
    'isOwner',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can get the threshold`,
    DharmaAccountRecoveryMultisig,
    'getThreshold',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  await tester.runTest(
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
    tester.address.slice(2) +
    executorGasLimit.toString(16).padStart(64, '0') +
    rawData.slice(2)
  )

  hash = util.bufferToHex(util.keccak256(hashInputs))

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can get a hash`,
    DharmaAccountRecoveryMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can get a hash with a specific nonce`,
    DharmaAccountRecoveryMultisig,
    'getHash',
    'call',
    [rawData, tester.address, executorGasLimit, 0],
    true,
    value => {
      assert.strictEqual(value, hash)
    }
  )

  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)

  /*
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2)
  unownedSig = tester.signHashedPrefixedHexString(hash, address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2)
  */

  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2) + ownerThreeSig.slice(2)
  unownedSig = tester.signHashedPrefixedHexString(hash, tester.address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaAccountRecoveryMultisig cannot call execute from non-executor`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.addressTwo, executorGasLimit, ownerSigs],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig cannot call execute with oddly-sized signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs + '1234'],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig cannot call execute with non-compliant signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, bizarreSigs],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig cannot call execute without enough signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerOneSig],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig cannot call execute without owner signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, unownedSigs],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig cannot call execute with out-of-order signatures`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigsOutOfOrder],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can call execute`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
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

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig can get the owners`,
    DharmaAccountRecoveryOperatorMultisig,
    'getOwners',
    'call',
    [],
    true,
    value => {
      assert.deepEqual(
        value, [tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour]
      )
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig can get an owner`,
    DharmaAccountRecoveryOperatorMultisig,
    'isOwner',
    'call',
    [tester.ownerOne],
    true,
    value => {
      assert.ok(value)
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig returns false for a non-owner`,
    DharmaAccountRecoveryOperatorMultisig,
    'isOwner',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig can get the threshold`,
    DharmaAccountRecoveryOperatorMultisig,
    'getThreshold',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '2')
    }
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig can get the destination`,
    DharmaAccountRecoveryOperatorMultisig,
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
    DharmaAccountRecoveryOperatorMultisig.options.address +
    '0'.padStart(64, '0') +
    tester.address.slice(2) +
    executorGasLimit.toString(16).padStart(64, '0') +
    rawData.slice(2)
  )

  hash = util.bufferToHex(util.keccak256(hashInputs))

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig can get a hash`,
    DharmaAccountRecoveryOperatorMultisig,
    'getHash',
    'call',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32],
    true,
    values => {
      assert.strictEqual(values.hash, hash)
    }
  )

  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)

  /*
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2)
  unownedSig = tester.signHashedPrefixedHexString(hash, address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2)
  */

  ownerSigs = ownerOneSig + ownerTwoSig.slice(2)
  ownerSigsOutOfOrder = ownerTwoSig + ownerOneSig.slice(2)
  unownedSig = tester.signHashedPrefixedHexString(hash, tester.address)
  unownedSigs = unownedSig + ownerTwoSig.slice(2)

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig cannot call execute from non-executor`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.addressTwo, executorGasLimit, constants.NULL_BYTES_32, ownerSigs],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig cannot call execute with oddly-sized signatures`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32, ownerSigs + '1234'],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig cannot call execute with non-compliant signatures`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32, bizarreSigs],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig cannot call execute without enough signatures`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32, ownerOneSig],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig cannot call execute without owner signatures`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32, unownedSigs],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig cannot call execute with out-of-order signatures`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32, ownerSigsOutOfOrder],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig can call execute`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32, ownerSigs]
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig cannot replay a call to execute`,
    DharmaAccountRecoveryOperatorMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, constants.NULL_BYTES_32, ownerSigs],
    false
  )

  const DharmaEscapeHatchRegistry = await tester.runTest(
    `DharmaEscapeHatchRegistry contract deployment`,
    DharmaEscapeHatchRegistryDeployer,
    '',
    'deploy'
  )

  await tester.runTest(
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

  await tester.runTest(
    `DharmaEscapeHatchRegistry can set the null address as an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry can set an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [tester.addressTwo]
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry can get an escape hatch account once set`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatch',
    'call',
    [],
    true,
    value => {
      assert.ok(value.exists)
      assert.strictEqual(value.escapeHatch, tester.addressTwo)
    }
  )

  fallbackEscapeHatch = await web3.eth.call({
      to: DharmaEscapeHatchRegistry.options.address,
      from: tester.address,
      data: "0x"
  })
  
  console.log(
    ' ✓ DharmaEscapeHatchRegistry can get an escape hatch account using the fallback'
  )
  assert.strictEqual(
    web3.eth.abi.decodeParameter('address', fallbackEscapeHatch),
    tester.addressTwo
  )
  tester.passed++

  await tester.runTest(
    `DharmaEscapeHatchRegistry can get an escape hatch for a specific smart wallet`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatchForSmartWallet',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(value.exists)
      assert.strictEqual(value.escapeHatch, tester.addressTwo)
    },
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry cannot get an escape hatch the null address`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatchForSmartWallet',
    'call',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry can remove an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'removeEscapeHatch'
  )

  await tester.runTest(
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
      from: tester.address,
      data: "0x"
  })

  console.log(
    ' ✓ DharmaEscapeHatchRegistry can gets null address for removed escape hatch account using the fallback'
  )
  assert.strictEqual(
    web3.eth.abi.decodeParameter('address', fallbackEscapeHatch),
    constants.NULL_ADDRESS
  )
  tester.passed++

  await tester.runTest(
    `DharmaEscapeHatchRegistry will not fire an event when removing an unset escape hatch account`,
    DharmaEscapeHatchRegistry,
    'removeEscapeHatch'
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry confirms that escape hatch functionality is not initially disabled`,
    DharmaEscapeHatchRegistry,
    'hasDisabledEscapeHatchForSmartWallet',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(!value)
    },
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry cannot get disabled status for null address`,
    DharmaEscapeHatchRegistry,
    'hasDisabledEscapeHatchForSmartWallet',
    'call',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry can reset an escape hatch account`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [tester.ownerOne]
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry can get an escape hatch account once reset`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatch',
    'call',
    [],
    true,
    value => {
      assert.ok(value.exists)
      assert.strictEqual(value.escapeHatch, tester.ownerOne)
    }
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry setting an existing escape hatch account is a no-op`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [tester.ownerOne]
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry can disable the escape hatch mechanism`,
    DharmaEscapeHatchRegistry,
    'permanentlyDisableEscapeHatch'
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry confirms that escape hatch functionality is disabled`,
    DharmaEscapeHatchRegistry,
    'hasDisabledEscapeHatchForSmartWallet',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(value)
    },
    tester.originalAddress
  )

  await tester.runTest(
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
      from: tester.address,
      data: "0x"
  })

  console.log(
    ' ✓ DharmaEscapeHatchRegistry can gets null address for removed escape hatch account after disabling using the fallback'
  )
  assert.strictEqual(
    web3.eth.abi.decodeParameter('address', fallbackEscapeHatch),
    constants.NULL_ADDRESS
  )
  tester.passed++

  await tester.runTest(
    `DharmaEscapeHatchRegistry confirms escape hatch is removed after disabling for for a specific smart wallet`,
    DharmaEscapeHatchRegistry,
    'getEscapeHatchForSmartWallet',
    'call',
    [tester.address],
    true,
    value => {
      assert.ok(!value.exists)
      assert.strictEqual(value.escapeHatch, constants.NULL_ADDRESS)
    },
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry cannot set an escape hatch account once disabled`,
    DharmaEscapeHatchRegistry,
    'setEscapeHatch',
    'send',
    [tester.ownerTwo],
    false
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry cannot remove an escape hatch account once disabled`,
    DharmaEscapeHatchRegistry,
    'removeEscapeHatch',
    'send',
    [],
    false
  )

  await tester.runTest(
    `DharmaEscapeHatchRegistry cannot re-disable an escape hatch account once disabled`,
    DharmaEscapeHatchRegistry,
    'permanentlyDisableEscapeHatch',
    'send',
    [],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryManagerV2 owner can start ownership transfer to multisig`,
    DharmaAccountRecoveryManagerV2,
    'transferOwnership',
    'send',
    [DharmaAccountRecoveryMultisig.options.address]
  )

  rawData = DharmaAccountRecoveryManagerV2.methods.acceptOwnership().encodeABI()
  await tester.runTest(
    `DharmaAccountRecoveryMultisig can get a hash`,
    DharmaAccountRecoveryMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  // accept ownership
  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can call execute to accept ownership`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
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
  rawData = DharmaAccountRecoveryManagerV2.methods.transferOwnership(tester.address).encodeABI()
  await tester.runTest(
    `DharmaAccountRecoveryMultisig can get a hash`,
    DharmaAccountRecoveryMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaAccountRecoveryMultisig can call execute to transfer ownership back`,
    DharmaAccountRecoveryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
    `DharmaAccountRecoveryManagerV2 EOA can accept ownership transfer from multisig`,
    DharmaAccountRecoveryManagerV2,
    'acceptOwnership'
  )

  await tester.runTest(
    `DharmaAccountRecoveryManagerV2 owner is now set to EOA`,
    DharmaAccountRecoveryManagerV2,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    `DharmaKeyRegistryV2 owner can start ownership transfer to multisig`,
    DharmaKeyRegistryV2,
    'transferOwnership',
    'send',
    [DharmaKeyRegistryMultisig.options.address]
  )

  rawData = DharmaKeyRegistryV2.methods.acceptOwnership().encodeABI()
  await tester.runTest(
    `DharmaKeyRegistryMultisig can get a hash`,
    DharmaKeyRegistryMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  // accept ownership
  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaKeyRegistryMultisig can call execute to accept ownership`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
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
  rawData = DharmaKeyRegistryV2.methods.transferOwnership(tester.address).encodeABI()
  await tester.runTest(
    `DharmaKeyRegistryMultisig can get a hash`,
    DharmaKeyRegistryMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaKeyRegistryMultisig can call execute to transfer ownership back`,
    DharmaKeyRegistryMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
    `DharmaKeyRegistryV2 EOA can accept ownership transfer from multisig`,
    DharmaKeyRegistryV2,
    'acceptOwnership'
  )

  await tester.runTest(
    `DharmaKeyRegistryV2 owner is now set to EOA`,
    DharmaKeyRegistryV2,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner is initially set to an EOA`,
    DharmaUpgradeBeaconControllerManager,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can start ownership transfer to multisig`,
    DharmaUpgradeBeaconControllerManager,
    'transferOwnership',
    'send',
    [DharmaUpgradeMultisig.options.address]
  )

  rawData = DharmaUpgradeBeaconControllerManager.methods.acceptOwnership().encodeABI()
  await tester.runTest(
    `DharmaUpgradeMultisig can get a hash`,
    DharmaUpgradeMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  // accept ownership
  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaUpgradeMultisig can call execute to accept ownership`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
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
  rawData = DharmaUpgradeBeaconControllerManager.methods.transferOwnership(tester.address).encodeABI()
  await tester.runTest(
    `DharmaUpgradeMultisig can get a hash`,
    DharmaUpgradeMultisig,
    'getNextHash',
    'call',
    [rawData, tester.address, executorGasLimit],
    true,
    value => {
      hash = value
    }
  )

  ownerOneSig = tester.signHashedPrefixedHexString(hash, tester.ownerOne)
  ownerTwoSig = tester.signHashedPrefixedHexString(hash, tester.ownerTwo)
  ownerThreeSig = tester.signHashedPrefixedHexString(hash, tester.ownerThree)
  ownerSigs = ownerOneSig + ownerTwoSig.slice(2) + ownerThreeSig.slice(2)

  await tester.runTest(
    `DharmaUpgradeMultisig can call execute to transfer ownership back`,
    DharmaUpgradeMultisig,
    'execute',
    'send',
    [rawData, tester.address, executorGasLimit, ownerSigs]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager EOA can accept ownership transfer from multisig`,
    DharmaUpgradeBeaconControllerManager,
    'acceptOwnership'
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner is now set to EOA`,
    DharmaUpgradeBeaconControllerManager,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await testUpgradeBeaconControllerManagerPartTwo(
      tester,
      DharmaUpgradeBeaconControllerManagerCoverage,
      DharmaUpgradeBeaconController,
      DharmaKeyRingUpgradeBeaconController,
      DharmaUpgradeBeacon.options.address,
      AdharmaSmartWalletImplementation.options.address,
      DharmaSmartWalletImplementationV7.options.address,
      DharmaKeyRingImplementationV1.options.address
  )

  console.log(
    `completed ${tester.passed + tester.failed} test${tester.passed + tester.failed === 1 ? '' : 's'} ` +
    `with ${tester.failed} failure${tester.failed === 1 ? '' : 's'}.`
  )

  await longer();

  if (tester.failed > 0) {
    process.exit(1)
  }

  // exit.
  return 0

}
module.exports = {
  test,
};
