const constants = require("../../constants");
const assert = require("assert");

async function testUpgradeBeaconControllerManagerPartOne(
	tester,
	contract
) {
  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer ownership from a non-owner`,
    contract,
    'transferOwnership',
    'send',
    [tester.addressTwo],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null controller`,
    contract,
    'initiateUpgrade',
    'send',
    [constants.NULL_ADDRESS, tester.address, tester.addressTwo, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null beacon`,
    contract,
    'initiateUpgrade',
    'send',
    [tester.address, constants.NULL_ADDRESS, tester.addressTwo, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with null implementation`,
    contract,
    'initiateUpgrade',
    'send',
    [tester.address, tester.addressTwo, constants.NULL_ADDRESS, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with non-contract implementation`,
    contract,
    'initiateUpgrade',
    'send',
    [tester.address, tester.addressTwo, tester.address, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate an upgrade with massive extraTime`,
    contract,
    'initiateUpgrade',
    'send',
    [tester.address, tester.addressTwo, contract.options.address, constants.FULL_APPROVAL],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can initiate upgrade timelock`,
    contract,
    'initiateUpgrade',
    'send',
    [tester.address, tester.addressTwo, contract.options.address, 0]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can get an empty timelock`,
    contract,
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

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can get an empty default timelock interval`,
    contract,
    'getDefaultTimelockInterval',
    'call',
    ['0x01020304'],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can get an empty default timelock expiration`,
    contract,
    'getDefaultTimelockExpiration',
    'call',
    ['0x01020304'],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot upgrade before timelock is complete`,
    contract,
    'upgrade',
    'send',
    [tester.address, tester.addressTwo, contract.options.address],
    false
  )

  // advance time by 7 days
  await tester.advanceTime((60 * 60 * 24 * 7) + 5)

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot upgrade an unowned controller`,
    contract,
    'upgrade',
    'send',
    [tester.address, tester.addressTwo, contract.options.address],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer controller ownership before accepting ownership`,
    contract,
    'transferControllerOwnership',
    'send',
    [tester.address, tester.address],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot agree to accept ownership of null controller`,
    contract,
    'agreeToAcceptControllerOwnership',
    'send',
    [constants.NULL_ADDRESS, true],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can agree to accept ownership`,
    contract,
    'agreeToAcceptControllerOwnership',
    'send',
    [tester.address, true]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate controller ownership transfer with null controller`,
    contract,
    'initiateTransferControllerOwnership',
    'send',
    [constants.NULL_ADDRESS, tester.addressTwo, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate controller ownership transfer with null new owner`,
    contract,
    'initiateTransferControllerOwnership',
    'send',
    [tester.address, constants.NULL_ADDRESS, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot initiate controller ownership transfer if new owner has not accepted`,
    contract,
    'initiateTransferControllerOwnership',
    'send',
    [tester.address, tester.addressTwo, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can initiate controller ownership transfer if new owner has accepted`,
    contract,
    'initiateTransferControllerOwnership',
    'send',
    [tester.address, tester.address, 0]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer controller ownership prior to timelock completion`,
    contract,
    'transferControllerOwnership',
    'send',
    [tester.address, tester.address],
    false
  )

  // advance time by 4 weeks
  await tester.advanceTime((60 * 60 * 24 * 7 * 4) + 5)

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot transfer unowned controller ownership`,
    contract,
    'transferControllerOwnership',
    'send',
    [tester.address, tester.address],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot heartbeat from non-heartbeater`,
    contract,
    'heartbeat',
    'send',
    [],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can heartbeat`,
    contract,
    'heartbeat'
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot set new heartbeater to null address`,
    contract,
    'newHeartbeater',
    'send',
    [constants.NULL_ADDRESS],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can set new heartbeater`,
    contract,
    'newHeartbeater',
    'send',
    [tester.address]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot arm Adharma Contingency from non-owner when not expired`,
    contract,
    'armAdharmaContingency',
    'send',
    [true],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when not armed`,
    contract,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can arm an Adharma Contingency`,
    contract,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can disarm Adharma Contingency`,
    contract,
    'armAdharmaContingency',
    'send',
    [false]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can re-arm Adharma Contingency`,
    contract,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency from non-owner when not expired`,
    contract,
    'activateAdharmaContingency',
    'send',
    [],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when it doesn't own controllers`,
    contract,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot roll back prior to first upgrade`,
    contract,
    'rollback',
    'send',
    [tester.address, tester.address, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Adharma Contingency when not active`,
    contract,
    'exitAdharmaContingency',
    'send',
    [tester.address, tester.address],
    false
  )

  /*
  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can activate Adharma Contingency`,
    contract,
    'activateAdharmaContingency',
    'send',
    []
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner cannot arm Adharma Contingency while active`,
    contract,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Contingency when activated`,
    contract,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can disarm Adharma Contingency`,
    contract,
    'armAdharmaContingency',
    'send',
    [false]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Contingency before 48 hours`,
    contract,
    'exitAdharmaContingency',
    'send',
    [
      DharmaSmartWalletImplementationV6.options.address,
      DharmaKeyRingImplementationV1.options.address
    ],
    false
  )

  // advance time by 2 days
  await tester.advanceTime((60 * 60 * 24 * 2) + 5)

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Contingency to null address`,
    contract,
    'exitAdharmaContingency',
    'send',
    [constants.NULL_ADDRESS, DharmaKeyRingImplementationV1.options.address],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot exit Contingency to non-contract address`,
    contract,
    'exitAdharmaContingency',
    'send',
    [address, address],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can exit Contingency after 48 hours`,
    contract,
    'exitAdharmaContingency',
    'send',
    [
      DharmaSmartWalletImplementationV6.options.address,
      DharmaKeyRingImplementationV1.options.address
    ]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can arm Adharma Contingency again`,
    contract,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can activate fake Adharma Contingency again`,
    contract,
    'activateAdharmaContingency',
    'send',
    []
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can roll back from fake Adharma Contingency`,
    contract,
    'rollback',
    'send',
    [constants.UPGRADE_BEACON_CONTROLLER_ADDRESS, constants.UPGRADE_BEACON_ADDRESS, 0]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can "roll forward" after roll back`,
    contract,
    'rollback',
    'send',
    [constants.UPGRADE_BEACON_ADDRESS, constants.UPGRADE_BEACON_ADDRESS]
  )
  */

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can get heartbeat status`,
    contract,
    'heartbeatStatus',
    'call',
    [],
    true,
    value => {
      assert.ok(!value.expired)
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager get contingency status when armed but not activated`,
    contract,
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

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager gets 0 for non-existent total implementations`,
    contract,
    'getTotalPriorImplementations',
    'call',
    [tester.address, tester.address],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot get a prior implementation with no index`,
    contract,
    'getPriorImplementation',
    'call',
    [tester.address, tester.address, 100],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot rollback to implementation with no index`,
    contract,
    'rollback',
    'send',
    [tester.address, tester.address, 100],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot block rollback to implementation with no index`,
    contract,
    'blockRollback',
    'send',
    [tester.address, tester.address, 100],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockInterval with no selector`,
    contract,
    'initiateModifyTimelockInterval',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockInterval to modify interval over 8 weeks`,
    contract,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot create timelock with excessive duration`,
    contract,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', constants.FULL_APPROVAL, 0],
    false // TODO: move this outside of Controller manager
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to set a timelock`,
    contract,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10000, 5]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot shorten existing initiateModifyTimelockInterval timelock`,
    contract,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10000, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to change a duration`,
    contract,
    'initiateModifyTimelockInterval',
    'send',
    ['0xe950c085', 10001, 5]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockInterval to set a timelock on another function`,
    contract,
    'initiateModifyTimelockInterval',
    'send',
    ['0xaaaaaaaa', 10000, 0]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockInterval with no selector`,
    contract,
    'modifyTimelockInterval',
    'send',
    ['0x00000000', 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockInterval before timelock completion`,
    contract,
    'modifyTimelockInterval',
    'send',
    ['0xe950c085', 1000],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockExpiration with no selector`,
    contract,
    'initiateModifyTimelockExpiration',
    'send',
    ['0x00000000', 0, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockExpiration to with expiration over one month`,
    contract,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xe950c085', 5443200, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call initiateModifyTimelockExpiration to modify expiration under one minute`,
    contract,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 30, 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockExpiration to set a timelock`,
    contract,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300000, 0],
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call initiateModifyTimelockExpiration to set a timelock on another function`,
    contract,
    'initiateModifyTimelockExpiration',
    'send',
    ['0xe950c085', 30, 0]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration with no selector`,
    contract,
    'modifyTimelockExpiration',
    'send',
    ['0x00000000', 0],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration before timelock completion`,
    contract,
    'modifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300],
    false
  )

  // advance time by 4 weeks
  await tester.advanceTime((60 * 60 * 24 * 7 * 4) + 5)

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call modifyTimelockInterval`,
    contract,
    'modifyTimelockInterval',
    'send',
    ['0xaaaaaaaa', 10000]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call modifyTimelockExpiration`,
    contract,
    'modifyTimelockExpiration',
    'send',
    ['0xd7ce3c6f', 300000],
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call modifyTimelockExpiration if expiration is too short`,
    contract,
    'modifyTimelockExpiration',
    'send',
    ['0xe950c085', 30],
    false
  )
}

async function testUpgradeBeaconControllerManagerPartTwo(
  tester,
  contract,
  upgradeBeaconControllerContract,
  keyRingUpgradeBeaconControllerContract,
  upgradeBeaconAddress,
  adharmaSmartWalletImplementationAddress,
  smartWalletImplementationAddress,
  keyRingImplementationAddress
) {
  // Transfer smart wallet controller ownership to coverage manager
  await tester.runTest(
    `DharmaUpgradeBeaconController can transfer ownership to manager`,
    upgradeBeaconControllerContract,
    'transferOwnership',
    'send',
    [contract.options.address]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when it doesn't own keyring controller`,
    contract,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await tester.runTest(
    `DharmaKeyRingUpgradeBeaconController can transfer ownership to manager`,
    keyRingUpgradeBeaconControllerContract,
    'transferOwnership',
    'send',
    [contract.options.address]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can activate Adharma Contingency`,
    contract,
    'activateAdharmaContingency'
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can get contingency status when activated`,
    contract,
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

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can re-arm an active Adharma Contingency`,
    contract,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot activate Adharma Contingency when already active`,
    contract,
    'activateAdharmaContingency',
    'send',
    [],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager now gets a prior implementation count`,
    contract,
    'getTotalPriorImplementations',
    'call',
    [
      upgradeBeaconControllerContract.options.address,
      upgradeBeaconAddress
    ],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can get the initial prior implementation`,
    contract,
    'getPriorImplementation',
    'call',
    [
      upgradeBeaconControllerContract.options.address,
      upgradeBeaconAddress,
      0
    ],
    true,
    value => {
      assert.strictEqual(
        value.priorImplementation, adharmaSmartWalletImplementationAddress
      )
      assert.ok(value.rollbackAllowed)
    }
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call "exitAdharmaContingency" before 48 hours has elapsed`,
    contract,
    'exitAdharmaContingency',
    'send',
    [
      tester.address,
      tester.address
    ],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can rollback to initial prior implementation`,
    contract,
    'rollback',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      upgradeBeaconAddress,
      0
    ]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contingency status is exited after rollback`,
    contract,
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

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot rollback to implementation with no index`,
    contract,
    'rollback',
    'send',
    [tester.address, tester.address, 100],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager owner can re-arm an Adharma Contingency`,
    contract,
    'armAdharmaContingency',
    'send',
    [true]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contingency status shows armed`,
    contract,
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

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can rollback to initial prior implementation`,
    contract,
    'rollback',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      upgradeBeaconAddress,
      0
    ]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager contingency status shows no longer armed`,
    contract,
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

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can block rollback to prior implementation`,
    contract,
    'blockRollback',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      upgradeBeaconAddress,
      0
    ]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot block a blocked rollback`,
    contract,
    'blockRollback',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      upgradeBeaconAddress,
      0
    ],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot rollback to a blocked rollback`,
    contract,
    'rollback',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      upgradeBeaconAddress,
      0
    ],
    false
  )

  // advance time by 90 days
  await tester.advanceTime((60 * 60 * 24 * 90) + 5)

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager deadman switch can arm an Adharma Contingency`,
    contract,
    'armAdharmaContingency',
    'send',
    [true],
    true,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager deadman switch can activate an Adharma Contingency`,
    contract,
    'activateAdharmaContingency',
    'send',
    [],
    true,
    receipt => {},
    tester.originalAddress
  )

  // advance time by 2 days
  await tester.advanceTime((60 * 60 * 24 * 2) + 5)

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call exitAdharmaContingency with null implementation`,
    contract,
    'exitAdharmaContingency',
    'send',
    [
      constants.NULL_ADDRESS,
      tester.address
    ],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager cannot call exitAdharmaContingency with non-contract implementation`,
    contract,
    'exitAdharmaContingency',
    'send',
    [
      tester.address,
      tester.address
    ],
    false
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can call exitAdharmaContingency`,
    contract,
    'exitAdharmaContingency',
    'send',
    [
      smartWalletImplementationAddress,
      keyRingImplementationAddress
    ]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can have an EOA accept controller ownership`,
    contract,
    'agreeToAcceptControllerOwnership',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      true
    ]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can initiate timelock for transferring controller ownership`,
    contract,
    'initiateTransferControllerOwnership',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      tester.address,
      0
    ]
  )

  // advance time by 4 weeks
  await tester.advanceTime((60 * 60 * 24 * 7 * 4) + 5)

  await tester.runTest(
    `DharmaUpgradeBeaconControllerManager can transfer controller ownership`,
    contract,
    'transferControllerOwnership',
    'send',
    [
      upgradeBeaconControllerContract.options.address,
      tester.address
    ]
  )

  await tester.runTest(
    `DharmaUpgradeBeaconController can get new owner`,
    upgradeBeaconControllerContract,
    'isOwner',
    'call',
    [],
    true,
    value => {
      assert.ok(value)
    }
  )
}

module.exports = {
    testUpgradeBeaconControllerManagerPartOne,
    testUpgradeBeaconControllerManagerPartTwo
};