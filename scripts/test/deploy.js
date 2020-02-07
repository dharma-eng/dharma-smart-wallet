var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')
const { web3 } = require("./web3");
const { Tester, swapMetadataHash, newContractAndSwapMetadataHash } = require("./testHelpers");
const { testIndestructibleRegistry } = require("./contracts/indestructible-registry/testIndestructibleRegistry");

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

let DharmaDaiUpgradeBeaconArtifact;
let DharmaDaiArtifact;

let DharmaUSDCUpgradeBeaconArtifact;
let DharmaUSDCArtifact;

let SmartWalletRevertReasonHelperV1Artifact;

const DharmaDaiInitializerArtifact = require('../../build/contracts/DharmaDaiInitializer.json')
const DharmaDaiImplementationV1Artifact = require('../../build/contracts/MockDharmaDaiImplementationV1.json')

const DharmaUSDCInitializerArtifact = require('../../build/contracts/DharmaUSDCInitializer.json')
const DharmaUSDCImplementationV1Artifact = require('../../build/contracts/DharmaUSDCImplementationV1.json')

const DharmaUpgradeMultisigArtifact = require('../../build/contracts/DharmaUpgradeMultisig.json')
const DharmaAccountRecoveryMultisigArtifact = require('../../build/contracts/DharmaAccountRecoveryMultisig.json')
const DharmaAccountRecoveryOperatorMultisigArtifact = require('../../build/contracts/DharmaAccountRecoveryOperatorMultisig.json')
const DharmaKeyRegistryMultisigArtifact = require('../../build/contracts/DharmaKeyRegistryMultisig.json')
const DharmaTestingMultisigArtifact = require('../../build/contracts/DharmaTestingMultisig.json')

const DharmaSmartWalletImplementationV0Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV0.json')
const DharmaSmartWalletImplementationV1Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV1.json')
const DharmaSmartWalletImplementationV2Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV2.json')
//const DharmaSmartWalletImplementationV3Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV3.json')
//const DharmaSmartWalletImplementationV4Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV4.json')
const DharmaSmartWalletImplementationV5Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV5.json')
const DharmaSmartWalletImplementationV6Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV6.json')
const DharmaSmartWalletImplementationV7Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV7.json')

//const DharmaKeyRingImplementationV0Artifact = require('../../build/contracts/DharmaKeyRingImplementationV0.json')
const DharmaKeyRingImplementationV1Artifact = require('../../build/contracts/DharmaKeyRingImplementationV1.json')
//const DharmaKeyRingImplementationV2Artifact = require('../../build/contracts/DharmaKeyRingImplementationV2.json')

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

async function test(testingContext) {
  if (testingContext === 'coverage') {
    DharmaUpgradeBeaconEnvoyArtifact = require('../../../build/contracts/DharmaUpgradeBeaconEnvoy.json')
    DharmaUpgradeBeaconControllerArtifact = require('../../../build/contracts/DharmaUpgradeBeaconController.json')
    DharmaUpgradeBeaconArtifact = require('../../../build/contracts/DharmaUpgradeBeacon.json')
    DharmaKeyRingUpgradeBeaconArtifact = require('../../../build/contracts/DharmaKeyRingUpgradeBeacon.json')
    DharmaDaiUpgradeBeaconArtifact = require('../../../build/contracts/DharmaDaiUpgradeBeacon.json')
    DharmaUSDCUpgradeBeaconArtifact = require('../../../build/contracts/DharmaUSDCUpgradeBeacon.json')
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
    DharmaDaiUpgradeBeaconArtifact = require('../../../build/contracts/DharmaDaiUpgradeBeacon.json')
    DharmaDaiArtifact = require('../../../build/contracts/DharmaDai.json')
    DharmaUSDCUpgradeBeaconArtifact = require('../../../build/contracts/DharmaUSDCUpgradeBeacon.json')
    DharmaUSDCArtifact = require('../../../build/contracts/DharmaUSDC.json')
    SmartWalletRevertReasonHelperV1Artifact = require('../../../build/contracts/SmartWalletRevertReasonHelperV1.json')
  } else {
    DharmaUpgradeBeaconEnvoyArtifact = require('../../build/contracts/DharmaUpgradeBeaconEnvoy.json')
    DharmaUpgradeBeaconControllerArtifact = require('../../build/contracts/DharmaUpgradeBeaconController.json')
    DharmaUpgradeBeaconArtifact = require('../../build/contracts/DharmaUpgradeBeacon.json')
    DharmaKeyRingUpgradeBeaconArtifact = require('../../build/contracts/DharmaKeyRingUpgradeBeacon.json')
    DharmaDaiUpgradeBeaconArtifact = require('../../build/contracts/DharmaDaiUpgradeBeacon.json')
    DharmaUSDCUpgradeBeaconArtifact = require('../../build/contracts/DharmaUSDCUpgradeBeacon.json')
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
    DharmaDaiUpgradeBeaconArtifact = require('../../build/contracts/DharmaDaiUpgradeBeacon.json')
    DharmaDaiArtifact = require('../../build/contracts/DharmaDai.json')
    DharmaUSDCUpgradeBeaconArtifact = require('../../build/contracts/DharmaUSDCUpgradeBeacon.json')
    DharmaUSDCArtifact = require('../../build/contracts/DharmaUSDC.json')
    SmartWalletRevertReasonHelperV1Artifact = require('../../build/contracts/SmartWalletRevertReasonHelperV1.json')
  }

  /*
  console.log(
    swapMetadataHash(
      DharmaSmartWalletImplementationV7Artifact.bytecode,
      constants.DHARMA_SMART_WALLET_IMPLEMENTATION_V7_METADATA
    ),
    web3.utils.keccak256(swapMetadataHash(
      DharmaSmartWalletImplementationV7Artifact.bytecode,
      constants.DHARMA_SMART_WALLET_IMPLEMENTATION_V7_METADATA
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

  const DharmaDaiUpgradeBeaconController = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerArtifact.abi,
    constants.DHARMA_DAI_UPGRADE_BEACON_CONTROLLER_ADDRESS
  )

  const DharmaUSDCUpgradeBeaconController = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerArtifact.abi,
    constants.DHARMA_USDC_UPGRADE_BEACON_CONTROLLER_ADDRESS
  )

  const DharmaDaiInitializer = new web3.eth.Contract(
    DharmaDaiInitializerArtifact.abi,
    constants.DHARMA_DAI_ADDRESS
  )

  const DharmaUSDCInitializer = new web3.eth.Contract(
    DharmaUSDCInitializerArtifact.abi,
    constants.DHARMA_USDC_ADDRESS
  )

  const SmartWalletRevertReasonHelperV1 = new web3.eth.Contract(
    SmartWalletRevertReasonHelperV1Artifact.abi,
    constants.REVERT_REASON_HELPER_ADDRESS
  )

  const CodeHashCacheDeployer = newContractAndSwapMetadataHash(
      CodeHashCacheArtifact
  );

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

  const AdharmaSmartWalletImplementationDeployer = newContractAndSwapMetadataHash(
      AdharmaSmartWalletImplementationArtifact
  );

  const AdharmaKeyRingImplementationDeployer = newContractAndSwapMetadataHash(
      AdharmaKeyRingImplementationArtifact
  );


  const DharmaAccountRecoveryManagerV2Deployer = newContractAndSwapMetadataHash(
      DharmaAccountRecoveryManagerV2Artifact
  );

  const DharmaSmartWalletImplementationV0Deployer = newContractAndSwapMetadataHash(
      DharmaSmartWalletImplementationV0Artifact
  );

  const DharmaSmartWalletImplementationV1Deployer = newContractAndSwapMetadataHash(
      DharmaSmartWalletImplementationV1Artifact
  );

  const DharmaSmartWalletImplementationV2Deployer = newContractAndSwapMetadataHash(
      DharmaSmartWalletImplementationV2Artifact
  );

  /*
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
  */

  const DharmaSmartWalletImplementationV5Deployer = newContractAndSwapMetadataHash(
      DharmaSmartWalletImplementationV5Artifact
  );

  const DharmaSmartWalletImplementationV6Deployer = newContractAndSwapMetadataHash(
      DharmaSmartWalletImplementationV6Artifact
  );

  const DharmaSmartWalletImplementationV7Deployer = newContractAndSwapMetadataHash(
      DharmaSmartWalletImplementationV7Artifact
  );

  const DharmaDaiInitializerDeployer = new web3.eth.Contract(
    DharmaDaiInitializerArtifact.abi
  )
  DharmaDaiInitializerDeployer.options.data = (
    DharmaDaiInitializerArtifact.bytecode
  )

  const DharmaDaiImplementationV1Deployer = new web3.eth.Contract(
    DharmaDaiImplementationV1Artifact.abi
  )
  DharmaDaiImplementationV1Deployer.options.data = (
    DharmaDaiImplementationV1Artifact.bytecode
  )

  const DharmaUSDCInitializerDeployer = new web3.eth.Contract(
    DharmaUSDCInitializerArtifact.abi
  )
  DharmaUSDCInitializerDeployer.options.data = (
    DharmaUSDCInitializerArtifact.bytecode
  )

  const DharmaUSDCImplementationV1Deployer = new web3.eth.Contract(
    DharmaUSDCImplementationV1Artifact.abi
  )
  DharmaUSDCImplementationV1Deployer.options.data = (
    DharmaUSDCImplementationV1Artifact.bytecode
  )

  /*
  const DharmaKeyRingImplementationV0Deployer = new web3.eth.Contract(
    DharmaKeyRingImplementationV0Artifact.abi
  )
  DharmaKeyRingImplementationV0Deployer.options.data = (
    swapMetadataHash(
      DharmaKeyRingImplementationV0Artifact.bytecode,
      ['0000000000000000000000000000000000000000000000000000000000000000']
    )
  )
  */


  const DharmaKeyRingImplementationV1Deployer = newContractAndSwapMetadataHash(
      DharmaKeyRingImplementationV1Artifact
  );

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


  const tester = new Tester(testingContext);
  await tester.init();

  console.log('funding initial create2 contract deployer address...')
  await web3.eth.sendTransaction({
    from: tester.originalAddress,
    to: constants.KEYLESS_CREATE2_DEPLOYER_ADDRESS,
    value: web3.utils.toWei('0.01', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : tester.gasLimit - 1,
    gasPrice: 1
  })

  console.log('running tests...')

  const MockCodeCheck = await tester.runTest(
    `MockCodeCheck contract deployment`,
    MockCodeCheckDeployer,
    '',
    'deploy'
  )

  await tester.runTest(
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

  await tester.runTest(
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
  await tester.runTest(
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
    tester.passed++

    // deploy a mock code check contract using the initial create2 deployer
    console.log(' ✓ deploying test contract via create2 contract...')
    const DeploymentTx = await web3.eth.sendTransaction({
      from: tester.originalAddress,
      to: constants.KEYLESS_CREATE2_ADDRESS,
      value: 0,
      gas: (testingContext !== 'coverage') ? 1500051 : tester.gasLimit - 1,
      gasPrice: 1,
      data: MockCodeCheckArtifact.bytecode
    })
    tester.passed++
  } else {
    console.log(' ✓ initial create2 contract already deployed, skipping...')
  }

  let currentInefficientImmutableCreate2FactoryRuntimeHash;
  await tester.runTest(
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
      from: tester.originalAddress,
      to: constants.KEYLESS_CREATE2_ADDRESS,
      value: '0',
      gas: (testingContext !== 'coverage') ? '608261' : tester.gasLimit - 1,
      gasPrice: 1,
      data: constants.IMMUTABLE_CREATE2_FACTORY_CREATION_CODE
    });
    tester.passed++
  } else {
    console.log(' ✓ inefficient immutable create2 factory contract already deployed, skipping...')
  }

  let currentImmutableCreate2FactoryRuntimeHash;
  await tester.runTest(
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
    await tester.runTest(
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
  await tester.runTest(
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
      from: tester.originalAddress,
      to: constants.IMMUTABLE_CREATE2_FACTORY_ADDRESS,
      value: '0',
      gas: (testingContext !== 'coverage') ? '3000000' : tester.gasLimit - 1,
      gasPrice: 1,
      data: constants.INDESTRUCTIBLE_REGISTRY_CREATION_TX
    });
    tester.passed++
  } else {
    console.log(' ✓ indestructible registry contract already deployed, skipping...')
  }

  // BEGIN ACTUAL DEPLOYMENT TESTS

  await tester.runTest(
    `DharmaUpgradeBeaconController contract deployment fails before other deployments`,
    DharmaUpgradeBeaconControllerCoverageDeployer,
    '',
    'deploy',
    [],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment fails before other deployments`,
    DharmaUpgradeBeaconControllerManagerCoverageDeployer,
    '',
    'deploy',
    [],
    false
  )


  // UpgradeBeaconEnvoy
  await tester.checkAndDeploy(
      "UpgradeBeaconEnvoy",
      constants.UPGRADE_BEACON_ENVOY_ADDRESS,
      constants.UPGRADE_BEACON_ENVOY_SALT,
      constants.UPGRADE_BEACON_ENVOY_RUNTIME_CODE,
      constants.UPGRADE_BEACON_ENVOY_CREATION_CODE,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // UpgradeBeaconController
  const upgradeBeaconControllerRuntimeCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
      constants.UPGRADE_BEACON_CONTROLLER_METADATA
  );

  const upgradeBeaconControllerCreationCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.bytecode,
      constants.UPGRADE_BEACON_CONTROLLER_METADATA
  );

  await tester.checkAndDeploy(
      "UpgradeBeaconController",
      constants.UPGRADE_BEACON_CONTROLLER_ADDRESS,
      constants.UPGRADE_BEACON_CONTROLLER_SALT,
      upgradeBeaconControllerRuntimeCode,
      upgradeBeaconControllerCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // KeyRingUpgradeBeaconController
  const keyRingUpgradeBeaconControllerRuntimeCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
      constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_METADATA
  );

  const keyRingUpgradeBeaconControllerCreationCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.bytecode,
      constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_METADATA
  );

  await tester.checkAndDeploy(
      "KeyRingUpgradeBeaconController",
      constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS,
      constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_SALT,
      keyRingUpgradeBeaconControllerRuntimeCode,
      keyRingUpgradeBeaconControllerCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  await tester.runTest(
    `DharmaUpgradeBeaconController contract deployment`,
    DharmaUpgradeBeaconControllerDeployer,
    '',
    'deploy'
  );

  await tester.runTest(
    `failure when deploying UpgradeBeaconProxyV1 contract using an undeployed beacon`,
    UpgradeBeaconProxyV1Deployer,
    '',
    'deploy',
    ["0x"],
    false
  );


  // UpgradeBeacon
  const upgradeBeaconRuntimeCode = swapMetadataHash(
      DharmaUpgradeBeaconArtifact.deployedBytecode,
      constants.UPGRADE_BEACON_METADATA
  );

  const upgradeBeaconCreationCode = swapMetadataHash(
      DharmaUpgradeBeaconArtifact.bytecode,
      constants.UPGRADE_BEACON_METADATA
  );

  await tester.checkAndDeploy(
      "UpgradeBeacon",
      constants.UPGRADE_BEACON_ADDRESS,
      constants.UPGRADE_BEACON_SALT,
      upgradeBeaconRuntimeCode,
      upgradeBeaconCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  await tester.runTest(
    `DharmaUpgradeBeacon contract deployment`,
    DharmaUpgradeBeaconDeployer,
    '',
    'deploy'
  );


  // KeyRingUpgradeBeacon
  const keyRingUpgradeBeaconRuntimeCode = swapMetadataHash(
      DharmaKeyRingUpgradeBeaconArtifact.deployedBytecode,
      constants.KEY_RING_UPGRADE_BEACON_METADATA
  );

  const keyRingUpgradeBeaconCreationCode = swapMetadataHash(
      DharmaKeyRingUpgradeBeaconArtifact.bytecode,
      constants.KEY_RING_UPGRADE_BEACON_METADATA
  );

  await tester.checkAndDeploy(
      "KeyRingUpgradeBeacon",
      constants.KEY_RING_UPGRADE_BEACON_ADDRESS,
      constants.KEY_RING_UPGRADE_BEACON_SALT,
      keyRingUpgradeBeaconRuntimeCode,
      keyRingUpgradeBeaconCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  await tester.runTest(
    `DharmaKeyRingUpgradeBeacon contract deployment`,
    DharmaKeyRingUpgradeBeaconDeployer,
    '',
    'deploy'
  );


  // KeyRegistry
  const keyRegistryRuntimeCode = swapMetadataHash(
      DharmaKeyRegistryV1Artifact.deployedBytecode,
      constants.KEY_REGISTRY_METADATA
  );

  const keyRegistryCreationCode = swapMetadataHash(
      DharmaKeyRegistryV1Artifact.bytecode,
      constants.KEY_REGISTRY_METADATA
  );

  await tester.checkAndDeploy(
      "KeyRegistry",
      constants.KEY_REGISTRY_ADDRESS,
      constants.KEY_REGISTRY_SALT,
      keyRegistryRuntimeCode,
      keyRegistryCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // KeyRegistryV2
  const keyRegistryV2RuntimeCode = swapMetadataHash(
      DharmaKeyRegistryV2Artifact.deployedBytecode,
      constants.KEY_REGISTRY_V2_METADATA
  );

  const keyRegistryV2CreationCode = swapMetadataHash(
      DharmaKeyRegistryV2Artifact.bytecode,
      constants.KEY_REGISTRY_V2_METADATA
  );

  await tester.checkAndDeploy(
      "KeyRegistryV2",
      constants.KEY_REGISTRY_V2_ADDRESS,
      constants.KEY_REGISTRY_V2_SALT,
      keyRegistryV2RuntimeCode,
      keyRegistryV2CreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // RevertReasonHelper
  const revertReasonHelperRuntimeCode = swapMetadataHash(
      SmartWalletRevertReasonHelperV1Artifact.deployedBytecode,
      constants.REVERT_REASON_HELPER_METADATA
  );

  const revertReasonHelperCreationCode = swapMetadataHash(
      SmartWalletRevertReasonHelperV1Artifact.bytecode,
      constants.REVERT_REASON_HELPER_METADATA
  );

  await tester.checkAndDeploy(
      "RevertReasonHelper",
      constants.REVERT_REASON_HELPER_ADDRESS,
      constants.NULL_BYTES_32,
      revertReasonHelperRuntimeCode,
      revertReasonHelperCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // EscapeHatchRegistry
  const escapeHatchRegistryRuntimeCode = swapMetadataHash(
      DharmaEscapeHatchRegistryArtifact.deployedBytecode,
      constants.ESCAPE_HATCH_REGISTRY_METADATA
  );

  const escapeHatchRegistryCreationCode = swapMetadataHash(
      DharmaEscapeHatchRegistryArtifact.bytecode,
      constants.ESCAPE_HATCH_REGISTRY_METADATA
  );

  await tester.checkAndDeploy(
      "EscapeHatchRegistry",
      constants.ESCAPE_HATCH_REGISTRY_ADDRESS,
      constants.ESCAPE_HATCH_REGISTRY_SALT,
      escapeHatchRegistryRuntimeCode,
      escapeHatchRegistryCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // Dharma Smart Wallet Implementations
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

  /*
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
  */

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

  /*
  const DharmaKeyRingImplementationV0 = await runTest(
    `DharmaKeyRingImplementationV0 contract deployment`,
    DharmaKeyRingImplementationV0Deployer,
    '',
    'deploy'
  )
  */

  // Dharma Key Ring Implementations
  const DharmaKeyRingImplementationV1 = await tester.runTest(
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


  // AccountRecoveryManager
  const accountRecoveryManagerRuntimeCode = swapMetadataHash(
      DharmaAccountRecoveryManagerV2Artifact.deployedBytecode,
      constants.ACCOUNT_RECOVERY_MANAGER_V2_METADATA
  );

  const accountRecoveryManagerCreationCode = swapMetadataHash(
      DharmaAccountRecoveryManagerV2Artifact.bytecode,
      constants.ACCOUNT_RECOVERY_MANAGER_V2_METADATA
  );

  await tester.checkAndDeploy(
      "AccountRecoveryManager",
      constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS,
      constants.ACCOUNT_RECOVERY_MANAGER_V2_SALT,
      accountRecoveryManagerRuntimeCode,
      accountRecoveryManagerCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  await tester.runTest(
    `DharmaAccountRecoveryManagerV2 contract deployment`,
    DharmaAccountRecoveryManagerV2Deployer,
    '',
    'deploy'
  );


  // DharmaSmartWalletFactory
  const dharmaSmartWalletFactoryRuntimeCode = swapMetadataHash(
      DharmaSmartWalletFactoryV1Artifact.deployedBytecode,
      constants.FACTORY_METADATA
  );

  const dharmaSmartWalletFactoryCreationCode = swapMetadataHash(
      DharmaSmartWalletFactoryV1Artifact.bytecode,
      constants.FACTORY_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaSmartWalletFactory",
      constants.FACTORY_ADDRESS,
      constants.FACTORY_SALT,
      dharmaSmartWalletFactoryRuntimeCode,
      dharmaSmartWalletFactoryCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  await tester.runTest(
    `DharmaSmartWalletFactoryV1 contract deployment`,
    DharmaSmartWalletFactoryV1Deployer,
    '',
    'deploy',
    []
  );


  // KeyRingFactory
  const keyRingFactoryRuntimeCode = swapMetadataHash(
      DharmaKeyRingFactoryV2Artifact.deployedBytecode,
      constants.KEY_RING_FACTORY_V2_METADATA
  );

  const keyRingFactoryCreationCode = swapMetadataHash(
      DharmaKeyRingFactoryV2Artifact.bytecode,
      constants.KEY_RING_FACTORY_V2_METADATA
  );

  await tester.checkAndDeploy(
      "KeyRingFactory",
      constants.KEY_RING_FACTORY_V2_ADDRESS,
      constants.KEY_RING_FACTORY_V2_SALT,
      keyRingFactoryRuntimeCode,
      keyRingFactoryCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  await tester.runTest(
    `DharmaKeyRingFactoryV2 contract deployment`,
    DharmaKeyRingFactoryV2Deployer,
    '',
    'deploy',
    []
  );

  // AdharmaSmartWalletImplementation
  const adharmaSmartWalletImplementationRuntimeCode = swapMetadataHash(
      AdharmaSmartWalletImplementationArtifact.deployedBytecode,
      constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_METADATA
  );

  const adharmaSmartWalletImplementationCreationCode = swapMetadataHash(
      AdharmaSmartWalletImplementationArtifact.bytecode,
      constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_METADATA
  );

  await tester.checkAndDeploy(
      "AdharmaSmartWalletImplementation",
      constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS,
      constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_SALT,
      adharmaSmartWalletImplementationRuntimeCode,
      adharmaSmartWalletImplementationCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // DharmaDaiUpgrageBeaconController
  const dharmaDaiUpgradeBeaconControllerRuntimeCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
      constants.DHARMA_DAI_UPGRADE_BEACON_CONTROLLER_METADATA
  );

  const dharmaDaiUpgradeBeaconControllerCreationCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.bytecode,
      constants.DHARMA_DAI_UPGRADE_BEACON_CONTROLLER_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaDaiUpgrageBeaconController",
      constants.DHARMA_DAI_UPGRADE_BEACON_CONTROLLER_ADDRESS,
      constants.DHARMA_DAI_UPGRADE_BEACON_CONTROLLER_SALT,
      dharmaDaiUpgradeBeaconControllerRuntimeCode,
      dharmaDaiUpgradeBeaconControllerCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // DharmaUSDCUpgrageBeaconController
  const dharmaUSDCUpgradeBeaconControllerRuntimeCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.deployedBytecode,
      constants.DHARMA_USDC_UPGRADE_BEACON_CONTROLLER_METADATA
  );

  const dharmaUSDCUpgradeBeaconControllerCreationCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerArtifact.bytecode,
      constants.DHARMA_USDC_UPGRADE_BEACON_CONTROLLER_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaUSDCUpgrageBeaconController",
      constants.DHARMA_USDC_UPGRADE_BEACON_CONTROLLER_ADDRESS,
      constants.DHARMA_USDC_UPGRADE_BEACON_CONTROLLER_SALT,
      dharmaUSDCUpgradeBeaconControllerRuntimeCode,
      dharmaUSDCUpgradeBeaconControllerCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  // DharmaUSDCUpgrageBeacon
  const dharmaDaiUpgradeBeaconRuntimeCode = swapMetadataHash(
      DharmaDaiUpgradeBeaconArtifact.deployedBytecode,
      constants.DHARMA_DAI_UPGRADE_BEACON_METADATA
  );

  const dharmaDaiUpgradeBeaconCreationCode = swapMetadataHash(
      DharmaDaiUpgradeBeaconArtifact.bytecode,
      constants.DHARMA_DAI_UPGRADE_BEACON_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaDaiUpgrageBeacon",
      constants.DHARMA_DAI_UPGRADE_BEACON_ADDRESS,
      constants.DHARMA_DAI_UPGRADE_BEACON_SALT,
      dharmaDaiUpgradeBeaconRuntimeCode,
      dharmaDaiUpgradeBeaconCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  // DharmaUSDCUpgrageBeacon
  const dharmaUSDCUpgradeBeaconRuntimeCode = swapMetadataHash(
      DharmaUSDCUpgradeBeaconArtifact.deployedBytecode,
      constants.DHARMA_USDC_UPGRADE_BEACON_METADATA
  );

  const dharmaUSDCUpgradeBeaconCreationCode = swapMetadataHash(
      DharmaUSDCUpgradeBeaconArtifact.bytecode,
      constants.DHARMA_USDC_UPGRADE_BEACON_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaUSDCUpgrageBeacon",
      constants.DHARMA_USDC_UPGRADE_BEACON_ADDRESS,
      constants.DHARMA_USDC_UPGRADE_BEACON_SALT,
      dharmaUSDCUpgradeBeaconRuntimeCode,
      dharmaUSDCUpgradeBeaconCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  // DharmaDai
  const dharmaDaiRuntimeCode = swapMetadataHash(
      DharmaDaiArtifact.deployedBytecode,
      constants.DHARMA_DAI_METADATA
  );

  const dharmaDaiCreationCode = swapMetadataHash(
      DharmaDaiArtifact.bytecode,
      constants.DHARMA_DAI_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaDai",
      constants.DHARMA_DAI_ADDRESS,
      constants.DHARMA_DAI_SALT,
      dharmaDaiRuntimeCode,
      dharmaDaiCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );

  // DharmaUSDC
  const dharmaUSDCRuntimeCode = swapMetadataHash(
      DharmaUSDCArtifact.deployedBytecode,
      constants.DHARMA_USDC_METADATA
  );

  const dharmaUSDCCreationCode = swapMetadataHash(
      DharmaUSDCArtifact.bytecode,
      constants.DHARMA_USDC_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaDai",
      constants.DHARMA_USDC_ADDRESS,
      constants.DHARMA_USDC_SALT,
      dharmaUSDCRuntimeCode,
      dharmaUSDCCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  const DharmaDaiInitializerImplementation = await tester.runTest(
    `DharmaDaiInitializer contract deployment`,
    DharmaDaiInitializerDeployer,
    '',
    'deploy'
  )

  const DharmaUSDCInitializerImplementation = await tester.runTest(
    `DharmaUSDCInitializer contract deployment`,
    DharmaUSDCInitializerDeployer,
    '',
    'deploy'
  )

  const DharmaDaiImplementationV1 = await tester.runTest(
    `DharmaDaiImplementationV1 contract deployment`,
    DharmaDaiImplementationV1Deployer,
    '',
    'deploy'
  )

  const DharmaUSDCImplementationV1 = await tester.runTest(
    `DharmaUSDCImplementationV1 contract deployment`,
    DharmaUSDCImplementationV1Deployer,
    '',
    'deploy'
  )

  await tester.runTest(
    'DharmaDaiUpgradeBeaconController can set initializer implementation',
    DharmaDaiUpgradeBeaconController,
    'upgrade',
    'send',
    [constants.DHARMA_DAI_UPGRADE_BEACON_ADDRESS, DharmaDaiInitializerImplementation.options.address]
  )

  await tester.runTest(
    'DharmaDai can be initialized',
    DharmaDaiInitializer,
    'initialize'
  )

  await tester.runTest(
    'DharmaDaiUpgradeBeaconController can set implementation V1',
    DharmaDaiUpgradeBeaconController,
    'upgrade',
    'send',
    [constants.DHARMA_DAI_UPGRADE_BEACON_ADDRESS, DharmaDaiImplementationV1.options.address]
  )

  await tester.runTest(
    'DharmaUSDCUpgradeBeaconController can set initializer implementation',
    DharmaUSDCUpgradeBeaconController,
    'upgrade',
    'send',
    [constants.DHARMA_USDC_UPGRADE_BEACON_ADDRESS, DharmaUSDCInitializerImplementation.options.address]
  )

  await tester.runTest(
    'DharmaUSDC can be initialized',
    DharmaUSDCInitializer,
    'initialize'
  )

  await tester.runTest(
    'DharmaUSDCUpgradeBeaconController can set implementation V1',
    DharmaUSDCUpgradeBeaconController,
    'upgrade',
    'send',
    [constants.DHARMA_USDC_UPGRADE_BEACON_ADDRESS, DharmaUSDCImplementationV1.options.address]
  )

  await tester.runTest(
    `AdharmaSmartWalletImplementation contract deployment`,
    AdharmaSmartWalletImplementationDeployer,
    '',
    'deploy'
  )


  // ADharmaKeyRingImplementation
  const adharmaKeyRingImplementationRuntimeCode = swapMetadataHash(
      AdharmaKeyRingImplementationArtifact.deployedBytecode,
      constants.ADHARMA_KEY_RING_IMPLEMENTATION_METADATA
  );

  const adharmaKeyRingImplementationCreationCode = swapMetadataHash(
      AdharmaKeyRingImplementationArtifact.bytecode,
      constants.ADHARMA_KEY_RING_IMPLEMENTATION_METADATA
  );

  await tester.checkAndDeploy(
      "DharmaDai",
      constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS,
      constants.ADHARMA_KEY_RING_IMPLEMENTATION_SALT,
      adharmaKeyRingImplementationRuntimeCode,
      adharmaKeyRingImplementationCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  await tester.runTest(
    `AdharmaKeyRingImplementation contract deployment`,
    AdharmaKeyRingImplementationDeployer,
    '',
    'deploy'
  )

  await tester.runTest(
    `DharmaAccountRecoveryMultisig contract deployment fails if threshold is not met`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig contract deployment fails if threshold is not met`,
    DharmaAccountRecoveryOperatorMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig contract deployment fails if sigs are out of order`,
    DharmaAccountRecoveryOperatorMultisigDeployer,
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

  await tester.runTest(
    `DharmaAccountRecoveryOperatorMultisig contract deployment fails with too many owners`,
    DharmaAccountRecoveryOperatorMultisigDeployer,
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

  await tester.runTest(
    `DharmaAccountRecoveryMultisig contract deployment`,
    DharmaAccountRecoveryMultisigDeployer,
    '',
    'deploy',
    [[tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour]]
  )

  await tester.runTest(
    `DharmaKeyRegistryMultisig contract deployment fails if threshold is not met`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    `DharmaKeyRegistryMultisig contract deployment`,
    DharmaKeyRegistryMultisigDeployer,
    '',
    'deploy',
    [[tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour, tester.ownerFive]]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment fails before indestructible registration`,
    DharmaUpgradeBeaconControllerManagerCoverageDeployer,
    '',
    'deploy',
    [],
    false
  )

  await tester.runTest(
      '"actual" IndestructibleRegistry can register the upgrade beacon as indestructible',
      ActualIndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [constants.UPGRADE_BEACON_ADDRESS]
  )

  await tester.runTest(
      '"actual" IndestructibleRegistry can register the upgrade beacon controller as indestructible',
      ActualIndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [constants.UPGRADE_BEACON_CONTROLLER_ADDRESS]
  )

  await tester.runTest(
      '"actual" IndestructibleRegistry can register the key ring upgrade beacon as indestructible',
      ActualIndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [constants.KEY_RING_UPGRADE_BEACON_ADDRESS]
  )

  await tester.runTest(
      '"actual" IndestructibleRegistry can register the key ring upgrade beacon controller as indestructible',
      ActualIndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS]
  )

  await tester.runTest(
      '"actual" IndestructibleRegistry can register the Adharma smart wallet implementation as indestructible',
      ActualIndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS]
  )

  await tester.runTest(
      '"actual" IndestructibleRegistry can register the Adharma key ring implementation as indestructible',
      ActualIndestructibleRegistry,
      'registerAsIndestructible',
      'send',
      [constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS]
  )


  const CodeHashCache = await tester.runTest(
    `CodeHashCache contract deployment`,
    CodeHashCacheDeployer,
    '',
    'deploy'
  )

  await tester.runTest(
    'CodeHashCache can register the runtime code hash of the smart wallet factory',
    CodeHashCache,
    'registerCodeHash',
    'send',
    [constants.FACTORY_ADDRESS]
  )

  // UpgradeBeaconControllerManager
  const upgradeBeaconControllerManagerRuntimeCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerManagerArtifact.deployedBytecode,
      constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
  );

  const upgradeBeaconControllerManagerCreationCode = swapMetadataHash(
      DharmaUpgradeBeaconControllerManagerArtifact.bytecode,
      constants.UPGRADE_BEACON_CONTROLLER_MANAGER_METADATA
  );

  await tester.checkAndDeploy(
      "UpgradeBeaconControllerManager",
      constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS,
      constants.UPGRADE_BEACON_CONTROLLER_MANAGER_SALT,
      upgradeBeaconControllerManagerRuntimeCode,
      upgradeBeaconControllerManagerCreationCode,
      MockCodeCheck,
      ImmutableCreate2Factory
  );


  const testIndestructibleRegistryContracts = {
    DharmaSmartWalletImplementationV0,
    DharmaSmartWalletImplementationV1,
    DharmaSmartWalletImplementationV2,
    DharmaSmartWalletImplementationV5,
    DharmaSmartWalletImplementationV6,
    DharmaSmartWalletImplementationV7,
    DharmaKeyRingImplementationV1,
  };

  await testIndestructibleRegistry(tester, testIndestructibleRegistryContracts);

  await tester.runTest(
    `DharmaUpgradeMultisig contract deployment fails if threshold is not met`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[
      '0x0000000000000000000000000000000000000001'
    ]],
    false
  )

  await tester.runTest(
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

  await tester.runTest(
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

  await tester.runTest(
    `DharmaUpgradeMultisig contract deployment`,
    DharmaUpgradeMultisigDeployer,
    '',
    'deploy',
    [[tester.ownerOne, tester.ownerTwo, tester.ownerThree, tester.ownerFour, tester.ownerFive]]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contract deployment`,
    DharmaUpgradeBeaconControllerManagerDeployer,
    '',
    'deploy'
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contract coverage deployment`,
    DharmaUpgradeBeaconControllerManagerCoverageDeployer,
    '',
    'deploy'
  )

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


  console.log(
    `completed ${tester.passed + tester.failed} test${tester.passed + tester.failed === 1 ? '' : 's'} ` +
    `with ${tester.failed} failure${tester.failed === 1 ? '' : 's'}.`
  )

  if (tester.failed > 0) {
    process.exit(1)
  }

  // exit.
  return 0

}

module.exports = {
    test,
};
