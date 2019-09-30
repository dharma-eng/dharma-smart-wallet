var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')

let AdharmaSmartWalletImplementationArtifact;

const DharmaUpgradeBeaconControllerArtifact = require('../../build/contracts/DharmaUpgradeBeaconController.json')
const DharmaUpgradeBeaconArtifact = require('../../build/contracts/DharmaUpgradeBeacon.json')
const DharmaAccountRecoveryManagerArtifact = require('../../build/contracts/DharmaAccountRecoveryManager.json')
const DharmaKeyRegistryV1Artifact = require('../../build/contracts/DharmaKeyRegistryV1.json')
const DharmaSmartWalletFactoryV1Artifact = require('../../build/contracts/DharmaSmartWalletFactoryV1.json')
const ComptrollerArtifact = require('../../build/contracts/ComptrollerInterface.json')

const DharmaSmartWalletImplementationV0Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV0.json')
const DharmaSmartWalletImplementationV1Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV1.json')
const DharmaSmartWalletImplementationV2Artifact = require('../../build/contracts/DharmaSmartWalletImplementationV2.json')

const UpgradeBeaconImplementationCheckArtifact = require('../../build/contracts/UpgradeBeaconImplementationCheck.json')
const BadBeaconArtifact = require('../../build/contracts/BadBeacon.json')
const BadBeaconTwoArtifact = require('../../build/contracts/BadBeaconTwo.json')
const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const IERC20Artifact = require('../../build/contracts/IERC20.json')

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
  if (testingContext === 'coverage') {
    AdharmaSmartWalletImplementationArtifact = require('../../../build/contracts/AdharmaSmartWalletImplementation.json')
  } else {
    AdharmaSmartWalletImplementationArtifact = require('../../build/contracts/AdharmaSmartWalletImplementation.json')
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

  const DharmaAccountRecoveryManager = new web3.eth.Contract(
    DharmaAccountRecoveryManagerArtifact.abi,
    constants.ACCOUNT_RECOVERY_MANAGER_ADDRESS
  )

  const DharmaKeyRegistryV1 = new web3.eth.Contract(
    DharmaKeyRegistryV1Artifact.abi,
    constants.KEY_REGISTRY_ADDRESS
  )

  const DharmaSmartWalletFactoryV1 = new web3.eth.Contract(
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

  const UserSmartWalletV2 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV2Artifact.abi,
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
    'V2 UserSmartWallet nonce is still set to value from before upgrade',
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
    'V2 UserSmartWallet can get balances',
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
    'V2 UserSmartWallet secondary can call to cancel',
    UserSmartWallet,
    'cancel',
    'send',
    [
      0,
     '0x'
    ]
  )

  await runTest(
    'V2 UserSmartWallet nonce is now set to original + 1',
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
    'V2 UserSmartWallet can get next custom action ID',
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
    'V2 UserSmartWallet can get custom action ID and it matches next action ID',
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
    'V2 UserSmartWallet can get next generic action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can get generic action ID and it matches next action ID',
    UserSmartWalletV2,
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
    'Dai Whale can deposit dai into the V2 smart wallet',
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
    'USDC Whale can deposit usdc into the V2 smart wallet',
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
    'V2 user smart wallet can trigger repayAndDeposit to deposit all new funds',
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
    'Dai Whale can deposit dai into the V2 smart wallet again',
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
    'V2 UserSmartWallet can get a generic action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can call executeAction',
    UserSmartWalletV2,
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
    'V2 user smart wallet repayAndDeposit cannot deposit without approval',
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
    'V2 UserSmartWallet can get a generic action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can call executeAction',
    UserSmartWalletV2,
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
    'V2 user smart wallet repayAndDeposit can deposit with approval added back',
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
    'V2 user smart wallet can trigger repayAndDeposit even with no funds',
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
    'V2 UserSmartWallet secondary cannot set an empty user userSigningKey',
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
    'V2 UserSmartWallet secondary can set a custom user userSigningKey',
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
    'V2 UserSmartWallet secondary cannot call to withdraw dai without primary',
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
    'V2 UserSmartWallet secondary cannot call to withdraw usdc without primary',
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
    'V2 UserSmartWallet secondary can no longer call to set userSigningKey without primary',
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
    'V2 UserSmartWallet can get a USDC withdrawal custom action ID',
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
    'V2 UserSmartWallet relay can call with two signatures to withdraw USDC',
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
    'V2 UserSmartWallet can get a USDC withdrawal custom action ID',
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
    'V2 UserSmartWallet relay cannot call with bad signature to withdraw USDC',
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
    'V2 UserSmartWallet cannot call with bad user signature to withdraw USDC',
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
    'V2 UserSmartWallet relay can call with two signatures to withdraw USDC',
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
    'V2 UserSmartWallet can get a Dai withdrawal custom action ID',
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
    'V2 UserSmartWallet relay cannot withdraw too little dai',
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
    true,
    receipt => {
      // TODO: verify logs
      //console.log(receipt.events)
    },
    originalAddress
  )

  await runTest(
    'V2 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWallet,
    'getNextCustomActionID',
    'call',
    [
      4, // DaiWithdrawal,
      '100000000000000',
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
    'V2 UserSmartWallet relay can call with signature to withdraw dai',
    UserSmartWallet,
    'withdrawDai',
    'send',
    [
      '100000000000000',
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
    'V2 UserSmartWallet can get a Dai withdrawal custom action ID',
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
    'V2 UserSmartWallet relay cannot call with bad signature to withdraw dai',
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
    'V2 UserSmartWallet relay cannot call with bad user signature to withdraw dai',
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
    'V2 UserSmartWallet relay can call with signature to withdraw dai',
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
    'V2 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet relay cannot call with bad signature to withdraw eth',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet relay cannot call with bad user signature to withdraw eth',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet relay can call with signature to withdraw ether',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet cancel reverts with bad signature',
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
    'V2 UserSmartWallet calls revert if insufficient action gas is supplied',
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
    'V2 UserSmartWallet calls succeed if sufficient non-zero action gas supplied',
    UserSmartWallet,
    'cancel',
    'send',
    [
      '1',
     '0x'
    ]
  )

  await runTest(
    'V2 UserSmartWallet can get a cancel custom action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can cancel using a signature',
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
    'V2 UserSmartWallet calls to atomic methods revert',
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
    'V2 UserSmartWallet calls to recover from random address revert',
    UserSmartWalletV2,
    'recover',
    'send',
    [
     address
    ],
    false
  )

  await runTest(
    'DharmaSmartWalletFactoryV1 can deploy a V2 smart wallet using a Dharma Key',
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
    'V2 UserSmartWallet can get a generic action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet cannot call executeAction and target a non-contract',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet cannot call executeAction and target itself',
    UserSmartWalletV2,
    'executeAction',
    'send',
    [
      UserSmartWalletV2.options.address,
      USDC.methods.approve(CUSDC.options.address, 0).encodeABI(),
      0,
      executeActionUserSignature,
      executeActionSignature
    ],
    false
  )

  await runTest(
    'V2 UserSmartWallet can call executeAction',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can get the next generic batch action ID',
    UserSmartWalletV2,
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
    UserSmartWalletV2,
    'getNonce',
    'call',
    [],
    true,
    value => {
      currentNonce = value
    }
  )

  await runTest(
    'V2 UserSmartWallet generic batch action ID with nonce matches next ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can call executeActionWithAtomicBatchCalls',
    UserSmartWalletV2,
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
    UserSmartWalletV2,
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

  const BlacklistedUserSmartWalletV2 = new web3.eth.Contract(
    DharmaSmartWalletImplementationV2Artifact.abi,
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
    BlacklistedUserSmartWalletV2,
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
    BlacklistedUserSmartWalletV2,
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
    BlacklistedUserSmartWalletV2,
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
    'V2 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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
    'V2 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    'V2 UserSmartWallet can get a USDC withdrawal custom action ID',
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
    'V2 UserSmartWallet relay call to withdraw USDC to itself',
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
    'V2 UserSmartWallet can get a blacklisted USDC withdrawal custom action ID',
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
    'V2 UserSmartWallet relay call to withdraw USDC to blacklisted address',
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
    'V2 UserSmartWallet can get a Ether withdrawal custom action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet relay cannot withdraw eth to a non-payable account',
    UserSmartWalletV2,
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
    'DharmaSmartWalletFactoryV1 can deploy a V2 smart wallet using a contract key',
    DharmaSmartWalletFactoryV1,
    'newSmartWallet',
    'send',
    [targetWalletAddress]
  )

  const UserSmartWalletV2Two = new web3.eth.Contract(
    DharmaSmartWalletImplementationV2Artifact.abi,
    targetWalletAddressTwo
  )

  await runTest(
    'V2 UserSmartWallet cancel reverts with bad contract signature',
    UserSmartWalletV2Two,
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
    'V2 UserSmartWallet can get a generic action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can call executeAction',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can get a Dai withdrawal custom action ID',
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
    'V2 UserSmartWallet relay cannot withdraw too much dai',
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
    'V2 UserSmartWallet can get a USDC withdrawal custom action ID',
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
    'V2 UserSmartWallet relay can call with two signatures to withdraw USDC',
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
    'V2 UserSmartWallet can get next generic batch action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet bad executeActionWithAtomicBatchCalls emits CallFailure',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can get a generic action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can call executeAction to enter dai market',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can get a generic action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can call executeAction to perform a borrow',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet can get a Dai withdrawal custom action ID',
    UserSmartWalletV2,
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
    'V2 UserSmartWallet relay cannot withdraw max dai with an outstanding borrow',
    UserSmartWalletV2,
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
    'setTimelock',
    'send',
    [
      '0x648bf774', // function selector: recover(address,address)
      '0x' + // arguments: the wallet to reset + 
      UserSmartWalletV2.options.address.slice(2).padStart(64, '0') +
      originalAddress.slice(2).padStart(64, '0'),
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
      UserSmartWalletV2.options.address,
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
      UserSmartWalletV2.options.address,
      originalAddress
    ],
    true,
    receipt => {    
      // TODO: verify
      //console.log(receipt.events)
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
