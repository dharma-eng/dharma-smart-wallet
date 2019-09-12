var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')

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

const UpgradeBeaconImplementationCheckArtifact = require('../../build/contracts/UpgradeBeaconImplementationCheck.json')
const BadBeaconArtifact = require('../../build/contracts/BadBeacon.json')
const BadBeaconTwoArtifact = require('../../build/contracts/BadBeaconTwo.json')
const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const IERC20Artifact = require('../../build/contracts/IERC20.json')
const ImmutableCreate2FactoryArtifact = require('../../build/contracts/ImmutableCreate2Factory.json')

const nullAddress = '0x0000000000000000000000000000000000000000'
const nullBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
const emptyHash = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
const FULL_APPROVAL = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

const keylessCreate2DeployerAddress = '0x4c8D290a1B368ac4728d83a9e8321fC3af2b39b1'
const keylessCreate2DeploymentTransaction = '0xf87e8085174876e800830186a08080ad601f80600e600039806000f350fe60003681823780368234f58015156014578182fd5b80825250506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222'
const keylessCreate2Address = '0x7A0D94F55792C434d74a40883C6ed8545E406D12'
const keylessCreate2Runtime = '0x60003681823780368234f58015156014578182fd5b80825250506014600cf3'

const InefficientImmutableCreate2FactoryAddress = '0xcfA3A7637547094fF06246817a35B8333C315196'
const ImmutableCreate2FactoryAddress = '0x0000000000FFe8B47B3e2130213B802212439497'
const ImmutableCreate2FactoryRuntimeHash = '0x767db8f19b71e367540fa372e8e81e4dcb7ca8feede0ae58a0c0bd08b7320dee'

const immutableCreate2FactoryCreationCode = (
  '0x608060405234801561001057600080fd5b50610833806100206000396000f3fe60806040' +
  '526004361061003f5760003560e01c806308508b8f1461004457806364e030871461009857' +
  '806385cf97ab14610138578063a49a7c90146101bc575b600080fd5b348015610050576000' +
  '80fd5b506100846004803603602081101561006757600080fd5b503573ffffffffffffffff' +
  'ffffffffffffffffffffffff166101ec565b604080519115158252519081900360200190f3' +
  '5b61010f600480360360408110156100ae57600080fd5b8135919081019060408101602082' +
  '01356401000000008111156100d057600080fd5b8201836020820111156100e257600080fd' +
  '5b8035906020019184600183028401116401000000008311171561010457600080fd5b5090' +
  '92509050610217565b6040805173ffffffffffffffffffffffffffffffffffffffff909216' +
  '8252519081900360200190f35b34801561014457600080fd5b5061010f6004803603604081' +
  '101561015b57600080fd5b8135919081019060408101602082013564010000000081111561' +
  '017d57600080fd5b82018360208201111561018f57600080fd5b8035906020019184600183' +
  '02840111640100000000831117156101b157600080fd5b509092509050610592565b348015' +
  '6101c857600080fd5b5061010f600480360360408110156101df57600080fd5b5080359060' +
  '20013561069e565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020' +
  '819052604090205460ff1690565b600083606081901c33148061024c57507fffffffffffff' +
  'ffffffffffffffffffffffffffff0000000000000000000000008116155b6102a157604051' +
  '7f08c379a00000000000000000000000000000000000000000000000000000000081526004' +
  '01808060200182810382526045815260200180610774604591396060019150506040518091' +
  '0390fd5b606084848080601f01602080910402602001604051908101604052809392919081' +
  '81526020018383808284376000920182905250604051855195965090943094508b93508692' +
  '506020918201918291908401908083835b6020831061033557805182527fffffffffffffff' +
  'ffffffffffffffffffffffffffffffffffffffffffffffffe0909201916020918201910161' +
  '02f8565b51815160209384036101000a7fffffffffffffffffffffffffffffffffffffffff' +
  'ffffffffffffffffffffffff018019909216911617905260408051929094018281037fffff' +
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe001835280855282' +
  '51928201929092207fff000000000000000000000000000000000000000000000000000000' +
  '000000008383015260609890981b7fffffffffffffffffffffffffffffffffffffffff0000' +
  '00000000000000000000166021830152603582019690965260558082019790975282518082' +
  '03909701875260750182525084519484019490942073ffffffffffffffffffffffffffffff' +
  'ffffffffff81166000908152938490529390922054929350505060ff16156104a757604051' +
  '7f08c379a00000000000000000000000000000000000000000000000000000000081526004' +
  '0180806020018281038252603f815260200180610735603f91396040019150506040518091' +
  '0390fd5b81602001825188818334f5955050508073ffffffffffffffffffffffffffffffff' +
  'ffffffff168473ffffffffffffffffffffffffffffffffffffffff161461053a576040517f' +
  '08c379a0000000000000000000000000000000000000000000000000000000008152600401' +
  '8080602001828103825260468152602001806107b960469139606001915050604051809103' +
  '90fd5b50505073ffffffffffffffffffffffffffffffffffffffff81166000908152602081' +
  '90526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffff' +
  'ffffff001660011790559392505050565b6000308484846040516020018083838082843760' +
  '408051919093018181037fffffffffffffffffffffffffffffffffffffffffffffffffffff' +
  'ffffffffffe001825280845281516020928301207fff000000000000000000000000000000' +
  '000000000000000000000000000000008383015260609990991b7fffffffffffffffffffff' +
  'ffffffffffffffffffff000000000000000000000000166021820152603581019790975260' +
  '558088019890985282518088039098018852607590960182525085519585019590952073ff' +
  'ffffffffffffffffffffffffffffffffffffff811660009081529485905294909320549394' +
  '50505060ff909116159050610697575060005b9392505050565b604080517fff0000000000' +
  '00000000000000000000000000000000000000000000000000006020808301919091523060' +
  '601b6021830152603582018590526055808301859052835180840390910181526075909201' +
  '835281519181019190912073ffffffffffffffffffffffffffffffffffffffff8116600090' +
  '8152918290529190205460ff161561072e575060005b9291505056fe496e76616c69642063' +
  '6f6e7472616374206372656174696f6e202d20636f6e74726163742068617320616c726561' +
  '6479206265656e206465706c6f7965642e496e76616c69642073616c74202d206669727374' +
  '203230206279746573206f66207468652073616c74206d757374206d617463682063616c6c' +
  '696e6720616464726573732e4661696c656420746f206465706c6f7920636f6e7472616374' +
  '207573696e672070726f76696465642073616c7420616e6420696e697469616c697a617469' +
  '6f6e20636f64652ea265627a7a723058202bdc55310d97c4088f18acf04253db593f091405' +
  '9f0c781a9df3624dcef0d1cf64736f6c634300050a0032'
)

const eth_whale = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
const dai_whale = '0x76B03EB651153a81fA1f212f2f59329B4180A46F'
const usdc_whale = '0x035e742A7E62253C606b9028eeB65178B44F1e7E'

const DAI_MAINNET_ADDRESS = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'
const USDC_MAINNET_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const CDAI_MAINNET_ADDRESS = '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC'
const CUSDC_MAINNET_ADDRESS = '0x39AA39c021dfbaE8faC545936693aC917d5E7563'
const CETH_MAINNET_ADDRESS = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'
const COMPTROLLER_MAINNET_ADDRESS = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B'

const UPGRADE_BEACON_ENVOY_ADDRESS = '0x000000000067503c398F4c9652530DBC4eA95C02'
const UPGRADE_BEACON_CONTROLLER_ADDRESS = '0x00000000003284ACb9aDEb78A2dDe0A8499932b9'
const UPGRADE_BEACON_ADDRESS = '0x0000000000b45D6593312ac9fdE193F3D0633644'
const KEY_REGISTRY_ADDRESS = '0x00000000006c7f32F0cD1eA4C1383558eb68802D'
const ACCOUNT_RECOVERY_MANAGER_ADDRESS = '0x0000000000C5Ebce8297A7E8f9ED34161a32D528'
const UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS = '0x0000000000de600425774E508869563B583843FC'
const FACTORY_ADDRESS = '0x8D1e00b000e56d5BcB006F3a008Ca6003b9F0033'
const ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS = '0x000000000006FD7FA6B5E08621d480b8e7Ab04eD'

const contractNames = {}
contractNames[DAI_MAINNET_ADDRESS] = 'DAI'
contractNames[USDC_MAINNET_ADDRESS] = 'USDC'
contractNames[CDAI_MAINNET_ADDRESS] = 'CDAI'
contractNames[CUSDC_MAINNET_ADDRESS] = 'CUSDC'
contractNames[CETH_MAINNET_ADDRESS] = 'CETH'
contractNames[COMPTROLLER_MAINNET_ADDRESS] = 'Comptroller'

// keccak256 of NewUserSigningKey(address) -> dharmaKey
const NEW_DHARMA_KEY_TOPIC = '0x7083aac3cab97f1219cedd0ab328a5b138a10b0fc72dd9348f1dc50199b21fda'
const NEW_DHARMA_KEY_ABI = [
  {
    type: 'address',
    name: 'userSigningKey'
  }
]

// keccak256 of ExternalError(address,string) -> source, revertReason
const EXTERNAL_ERROR_TOPIC = '0x5bbd5ab79029b89a22c80c7b7bfdc2f0c8e3f0d2a7330c7148cabc044250674b'
const EXTERNAL_ERROR_ABI = [
  {
    type: 'address',
    name: 'source',
    indexed: true
  }, {
    type: 'string',
    name: 'revertReason'
  }
]

// keccak256 of SmartWalletDeployed(address,address) -> wallet, dharmaKey
const SMART_WALLET_DEPLOYED_TOPIC = '0x6e60d84846384a1994833ed675b0a0f76bef64943304debf6e42a9706d1a7dd7'
const SMART_WALLET_DEPLOYED_ABI = [
  {
    type: 'address',
    name: 'wallet'
  }, {
    type: 'address',
    name: 'dharmaKey'
  }
]

// keccak256 of Approval(address,address,uint256) -> owner, spender, value
const APPROVAL_TOPIC = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
const APPROVAL_ABI = [
  {
    type: 'address',
    name: 'owner',
    indexed: true
  }, {
    type: 'address',
    name: 'spender',
    indexed: true
  }, {
    type: 'uint256',
    name: 'value'
  }
]

// keccak256 of Transfer(address,address,uint256) -> to, from, value
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const TRANSFER_ABI = [
  {
    type: 'address',
    name: 'from',
    indexed: true
  }, {
    type: 'address',
    name: 'to',
    indexed: true
  }, {
    type: 'uint256',
    name: 'value'
  }
]

// keccak256 of Mint(address,uint256,uint256) -> minter, mintTokens, mintAmount
const MINT_TOPIC = '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
const MINT_ABI = [
  {
    type: 'address',
    name: 'minter'
  }, {
    type: 'uint256',
    name: 'mintTokens'
  }, {
    type: 'uint256',
    name: 'mintAmount'
  }
]

// keccak256 of Redeem(address,uint256,uint256) -> redeemer, redeemTokens, redeemAmount
const REDEEM_TOPIC = '0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929'
const REDEEM_ABI = [
  {
    type: 'address',
    name: 'redeemer'
  }, {
    type: 'uint256',
    name: 'redeemTokens'
  }, {
    type: 'uint256',
    name: 'redeemAmount'
  }
]

// keccak256 of MarketEntered(address,address) -> cToken, account
const MARKET_ENTERED_TOPIC = '0x3ab23ab0d51cccc0c3085aec51f99228625aa1a922b3a8ca89a26b0f2027a1a5'
const MARKET_ENTERED_ABI = [
  {
    type: 'address',
    name: 'cToken'
  }, {
    type: 'address',
    name: 'account'
  }
]

// keccak256 of AccrueInterest(uint256,uint256,uint256) -> interestAccumulated, borrowIndex, totalBorrows
const ACCRUE_INTEREST_TOPIC = '0x875352fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9'
const ACCRUE_INTEREST_ABI = [
  {
    type: 'uint256',
    name: 'interestAccumulated'
  }, {
    type: 'uint256',
    name: 'borrowIndex'
  }, {
    type: 'uint256',
    name: 'totalBorrows'
  }
]

const eventDetails = {}
eventDetails[NEW_DHARMA_KEY_TOPIC] = {
  name: 'NewUserSigningKey',
  abi: NEW_DHARMA_KEY_ABI
}
eventDetails[EXTERNAL_ERROR_TOPIC] = {
  name: 'ExternalError',
  abi: EXTERNAL_ERROR_ABI
}
eventDetails[SMART_WALLET_DEPLOYED_TOPIC] = {
  name: 'SmartWalletDeployed',
  abi: SMART_WALLET_DEPLOYED_ABI
}
eventDetails[APPROVAL_TOPIC] = {
  name: 'Approval',
  abi: APPROVAL_ABI
}
eventDetails[TRANSFER_TOPIC] = {
  name: 'Transfer',
  abi: TRANSFER_ABI
}
eventDetails[MINT_TOPIC] = {
  name: 'Mint',
  abi: MINT_ABI
}
eventDetails[REDEEM_TOPIC] = {
  name: 'Redeem',
  abi: REDEEM_ABI
}
eventDetails[MARKET_ENTERED_TOPIC] = {
  name: 'MarketEntered',
  abi: MARKET_ENTERED_ABI
}
eventDetails[ACCRUE_INTEREST_TOPIC] = {
  name: 'AccrueInterest',
  abi: ACCRUE_INTEREST_ABI
}

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
    //DharmaUpgradeBeaconControllerManagerArtifact = require('../../../build/contracts/DharmaAccountRecoveryManager.json')
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
    //DharmaUpgradeBeaconControllerManagerArtifact = require('../../build/contracts/DharmaAccountRecoveryManager.json')
  }

  var web3 = provider
  let passed = 0
  let failed = 0
  let gasUsage = {}
  let counts = {}

  const DharmaUpgradeBeaconController = new web3.eth.Contract(
    DharmaUpgradeBeaconControllerArtifact.abi,
    UPGRADE_BEACON_CONTROLLER_ADDRESS
  )

  const DharmaUpgradeBeacon = new web3.eth.Contract(
    DharmaUpgradeBeaconArtifact.abi,
    UPGRADE_BEACON_ADDRESS
  )

  const DharmaSmartWalletFactoryV1 = new web3.eth.Contract(
    DharmaSmartWalletFactoryV1Artifact.abi,
    FACTORY_ADDRESS
  )

  const DharmaAccountRecoveryManager = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi,
    ACCOUNT_RECOVERY_MANAGER_ADDRESS
  )

  const DharmaUpgradeBeaconControllerManager = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi,
    ACCOUNT_RECOVERY_MANAGER_ADDRESS
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

  const UpgradeBeaconImplementationCheckDeployer = new web3.eth.Contract(
    UpgradeBeaconImplementationCheckArtifact.abi
  )
  UpgradeBeaconImplementationCheckDeployer.options.data = (
    UpgradeBeaconImplementationCheckArtifact.bytecode
  )

  const InefficientImmutableCreate2Factory = new web3.eth.Contract(
    ImmutableCreate2FactoryArtifact.abi,
    InefficientImmutableCreate2FactoryAddress
  )

  const ImmutableCreate2Factory = new web3.eth.Contract(
    ImmutableCreate2FactoryArtifact.abi,
    ImmutableCreate2FactoryAddress
  )

  const MockCodeCheckDeployer = new web3.eth.Contract(
    MockCodeCheckArtifact.abi
  )
  MockCodeCheckDeployer.options.data = MockCodeCheckArtifact.bytecode

  // construct the payload passed to create2 in order to verify correct behavior
  const testCreate2payload = (
    '0xff' +
    keylessCreate2Address.slice(2) +
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

  const DAI = new web3.eth.Contract(IERC20Artifact.abi, DAI_MAINNET_ADDRESS)

  const USDC = new web3.eth.Contract(IERC20Artifact.abi, USDC_MAINNET_ADDRESS)

  const CDAI = new web3.eth.Contract(IERC20Artifact.abi, CDAI_MAINNET_ADDRESS)

  const CUSDC = new web3.eth.Contract(IERC20Artifact.abi, CUSDC_MAINNET_ADDRESS)

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

  let initialControllerOwner = await setupNewDefaultAddress(
    '0x58e0348ce225c18ece7f2d6a069afa340365019481903b221481706d291a66bf'
  )

  const gasLimit = latestBlock.gasLimit

  console.log('funding initial create2 contract deployer address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: keylessCreate2DeployerAddress,
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
    [keylessCreate2Address],
    true,
    value => {
      currentKeylessCreate2Runtime = value
    }
  )

  // submit the initial create2 deployment transaction if needed
  if (currentKeylessCreate2Runtime !== keylessCreate2Runtime) {
    console.log(' ✓ submitting initial create2 contract deployment transaction...')
    await web3.eth.sendSignedTransaction(keylessCreate2DeploymentTransaction);
    passed++

    // deploy a mock code check contract using the initial create2 deployer
    console.log(' ✓ deploying test contract via create2 contract...')
    const DeploymentTx = await web3.eth.sendTransaction({
      from: originalAddress,
      to: keylessCreate2Address,
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
    [InefficientImmutableCreate2FactoryAddress],
    true,
    value => {
      currentInefficientImmutableCreate2FactoryRuntimeHash = value
    }
  )

  // submit the inefficient immutable create2 deployment transaction if needed  
  if (currentInefficientImmutableCreate2FactoryRuntimeHash !== ImmutableCreate2FactoryRuntimeHash) {
    console.log(' ✓ submitting inefficient immutable create2 factory deployment through initial create2 contract...')
    await web3.eth.sendTransaction({
      from: originalAddress,
      to: keylessCreate2Address,
      value: '0',
      gas: (testingContext !== 'coverage') ? '608261' : gasLimit - 1,
      gasPrice: 1,
      data: immutableCreate2FactoryCreationCode
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
    [ImmutableCreate2FactoryAddress],
    true,
    value => {
      currentImmutableCreate2FactoryRuntimeHash = value
    }
  )  

  // submit the immutable create2 deployment transaction if needed  
  if (currentImmutableCreate2FactoryRuntimeHash !== ImmutableCreate2FactoryRuntimeHash) {
    await runTest(
      `submitting immutable create2 factory deployment through initial create2 contract...`,
      InefficientImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x0000000000000000000000000000000000000000f4b0218f13a6440a6f020000',
        immutableCreate2FactoryCreationCode
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
    [UPGRADE_BEACON_ENVOY_ADDRESS],
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
        '0x00000000000000000000000000000000000000003b4cf3f5b304150b79010000',
        DharmaUpgradeBeaconEnvoyArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, UPGRADE_BEACON_ENVOY_ADDRESS)
      }
    )

    await runTest(
      `Upgrade Beacon Envoy contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x00000000000000000000000000000000000000003b4cf3f5b304150b79010000',
        DharmaUpgradeBeaconEnvoyArtifact.bytecode
      ]
    )
  }

  await runTest(
    'Deployed Upgrade Beacon Envoy code is correct',
    MockCodeCheck,
    'code',
    'call',
    [UPGRADE_BEACON_ENVOY_ADDRESS],
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
    [UPGRADE_BEACON_CONTROLLER_ADDRESS],
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
        '0x00000000000000000000000000000000000000005aa398eb9566310e02000000',
        DharmaUpgradeBeaconControllerArtifact.bytecode + 
        '000000000000000000000000990774Aa5DFB8a2600EB78101C1eeAa8d6104623'
      ],
      true,
      value => {
        assert.strictEqual(value, UPGRADE_BEACON_CONTROLLER_ADDRESS)
      }
    )

    await runTest(
      `DharmaUpgradeBeaconController contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x00000000000000000000000000000000000000005aa398eb9566310e02000000',
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
    [UPGRADE_BEACON_ADDRESS],
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
        '0x0000000000000000000000000000000000000000795c924476188b0e6c020000',
        DharmaUpgradeBeaconArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, UPGRADE_BEACON_ADDRESS)
      }
    )

    await runTest(
      `DharmaUpgradeBeacon contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x0000000000000000000000000000000000000000795c924476188b0e6c020000',
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
    [KEY_REGISTRY_ADDRESS],
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
        '0x0000000000000000000000000000000000000000003e4b8475edaa0ebb0b0000',
        DharmaKeyRegistryV1Artifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, KEY_REGISTRY_ADDRESS)
      }
    )

    await runTest(
      `DharmaKeyRegistryV1 contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x0000000000000000000000000000000000000000003e4b8475edaa0ebb0b0000',
        DharmaKeyRegistryV1Artifact.bytecode
      ]
    )
  }

  DharmaKeyRegistryV1 = await runTest(
    `DharmaKeyRegistryV1 contract deployment`,
    DharmaKeyRegistryV1Deployer,
    '',
    'deploy',
    [],
    true,
    receipt => {},
    originalAddress
  )

  await runTest(
    'Dharma Key Registry V1 gets the initial global key correctly',
    DharmaKeyRegistryV1,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, originalAddress)
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
      assert.strictEqual(value, originalAddress)
    }
  )

  await runTest(
    'Dharma Key Registry V1 cannot set a new empty global key',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      nullAddress,
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
    false
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
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'Dharma Key Registry V1 can set a new global key correctly',
    DharmaKeyRegistryV1,
    'setGlobalKey',
    'send',
    [
      address,
      newKeySignature
    ],
    true,
    receipt => {},
    originalAddress
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
    false
  )

  await runTest(
    'Dharma Key Registry V1 can set a new specific key',
    DharmaKeyRegistryV1,
    'setSpecificKey',
    'send',
    [
      address,
      DharmaKeyRegistryV1.options.address
    ],
    true,
    receipt => {},
    originalAddress
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
    ],
    true,
    receipt => {},
    originalAddress
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

  await runTest(
    'Dharma Upgrade Beacon Controller cannot set null address as implementation',
    DharmaUpgradeBeaconController,
    'upgrade',
    'send',
    [
      DharmaUpgradeBeacon.options.address,
      nullAddress
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
    'freeze',
    'send',
    [DharmaUpgradeBeacon.options.address],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'Dharma Upgrade Beacon Controller is accessible from the owner',
    DharmaUpgradeBeaconController,
    'freeze',
    'send',
    [DharmaUpgradeBeacon.options.address],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          nullAddress
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          emptyHash
        )
      }
    }
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
          nullAddress
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          emptyHash
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
    'Dharma Upgrade Beacon Controller can clear upgrade beacon implementation',
    DharmaUpgradeBeaconController,
    'freeze',
    'send',
    [
      DharmaUpgradeBeacon.options.address
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
          ...
        )
        */
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          nullAddress
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          emptyHash
        )
      }
    }
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
          nullAddress
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          emptyHash
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

  let currentFactoryCode;
  await runTest(
    'Checking Factory runtime code',
    MockCodeCheck,
    'code',
    'call',
    [FACTORY_ADDRESS],
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
        '0x00000000000000000000000000000000000000000fc65f91c50a530250000000',
        DharmaSmartWalletFactoryV1Artifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, FACTORY_ADDRESS)
      }
    )

    await runTest(
      `DharmaSmartWalletFactoryV1 contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x00000000000000000000000000000000000000000fc65f91c50a530250000000',
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
    [ACCOUNT_RECOVERY_MANAGER_ADDRESS],
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
        '0x0000000000000000000000000000000000000000ff0345dfe982180456210000',
        DharmaAccountRecoveryManagerArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, ACCOUNT_RECOVERY_MANAGER_ADDRESS)
      }
    )

    await runTest(
      `DharmaAccountRecoveryManager contract deployment through immutable create2 factory`,
      ImmutableCreate2Factory,
      'safeCreate2',
      'send',
      [
        '0x0000000000000000000000000000000000000000ff0345dfe982180456210000',
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
    [ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS],
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
        assert.strictEqual(value, ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS)
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
    `DharmaAccountRecoveryManager contract deployment`,
    DharmaAccountRecoveryManagerDeployer,
    '',
    'deploy'
  )

  let currentUpgradeBeaconControllerManagerCode;
  await runTest(
    'Checking Upgrade Beacon Controller Manager runtime code',
    MockCodeCheck,
    'code',
    'call',
    [UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS],
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
        '0x0000000000000000000000000000000000000000ab7cfa72f49fa70a011d0000',
        DharmaUpgradeBeaconControllerManagerArtifact.bytecode
      ],
      true,
      value => {
        assert.strictEqual(value, UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS)
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

  let currentDaiCode;
  await runTest(
    'Checking for required external contracts...',
    MockCodeCheck,
    'code',
    'call',
    [DAI_MAINNET_ADDRESS],
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

  await web3.eth.sendTransaction({
    from: eth_whale,
    to: targetWalletAddress,
    value: web3.utils.toWei('100', 'ether'),
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
          dai_whale
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
    dai_whale
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
          usdc_whale
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
    usdc_whale
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 cannot deploy a new smart wallet with no key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [nullAddress],
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
          const log = eventDetails[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(log.abi, value.raw.data, value.raw.topics)        
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
        assert.strictEqual(events[1].returnValues.value, FULL_APPROVAL)

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
        assert.strictEqual(events[6].returnValues.value, FULL_APPROVAL)

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
    from: eth_whale,
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
          dai_whale
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
    dai_whale
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
          usdc_whale
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
    usdc_whale
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
          const log = eventDetails[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(log.abi, value.raw.data, value.raw.topics)        
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
          const log = eventDetails[value.raw.topics[0]]
          const decoded = web3.eth.abi.decodeLog(log.abi, value.raw.data, value.raw.topics)        
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
    'Deployed User Smart Wallet code is correct',
    MockCodeCheck,
    'code',
    'call',
    [UserSmartWallet.options.address],
    true,
    value => {
      assert.strictEqual(value, UpgradeBeaconProxyArtifact.deployedBytecode) 
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
        console.log(receipt.events)
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
    'UserSmartWallet secondary can call to set dharmaKey',
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

  let customActionId;
  await runTest(
    'UserSmartWallet can get next custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DAIWithdrawal,
      FULL_APPROVAL,
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
      FULL_APPROVAL,
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
      FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  const usdcWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  await runTest(
    'UserSmartWallet relay cannot call with bad signature to withdraw USDC',
    UserSmartWallet,
    'withdrawUSDC',
    'send',
    [
      FULL_APPROVAL,
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
      FULL_APPROVAL,
      address,
      0,
      '0x',
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
    UserSmartWallet.options.address + // smart wallet address
    nullBytes32.slice(2) +            // smart wallet version
    address.slice(2) +                // user dharma key
    address.slice(2) +                // dharma key registry key
    '5'.padStart(64, '0') +           // nonce
    nullBytes32.slice(2) +            // minimum gas
    '4'.padStart(64, '0') +           // action type
    'f'.padStart(64, 'f') +           // amount
    address.slice(2)                  // recipient
  )

  const daiWithdrawalSignature = signHashedPrefixedHashedHexString(
    withdrawalMessage,
    address
  )
  */

  await runTest(
    'UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      FULL_APPROVAL,
      address,
      0
    ],
    true,
    value => {
      customActionId = value
    }
  )

  const daiWithdrawalSignature = signHashedPrefixedHexString(
    customActionId,
    address
  )

  await runTest(
    'UserSmartWallet relay cannot call with bad signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      FULL_APPROVAL,
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
      FULL_APPROVAL,
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

  // ABCDE

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
        console.log(receipt.events)
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
        console.log(receipt.events)
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
      if (testingContext !== 'coverage') {
        console.log(receipt.events)
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
    'UserSmartWallet calls revert if insufficient action gas is supplied',
    UserSmartWallet,
    'cancel',
    'send',
    [
      FULL_APPROVAL,
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
