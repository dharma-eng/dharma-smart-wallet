const constants = require("../../constants");
const assert = require("assert");

async function testAccountRecoveryManager(
    tester,
    contract,
    smartWalletAddress
) {
    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot transfer ownership from a non-owner`,
        contract,
        "transferOwnership",
        "send",
        [tester.addressTwo],
        false,
        receipt => {},
        tester.originalAddress
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot initiate recovery with null smart wallet`,
        contract,
        "initiateAccountRecovery",
        "send",
        [constants.NULL_ADDRESS, tester.addressTwo, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot initiate recovery with null new key`,
        contract,
        "initiateAccountRecovery",
        "send",
        [tester.address, constants.NULL_ADDRESS, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can initiate recovery timelock`,
        contract,
        "initiateAccountRecovery",
        "send",
        [constants.UPGRADE_BEACON_ADDRESS, tester.addressTwo, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can initiate another recovery timelock`,
        contract,
        "initiateAccountRecovery",
        "send",
        [smartWalletAddress, tester.addressTwo, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can initiate a third recovery timelock`,
        contract,
        "initiateAccountRecovery",
        "send",
        [tester.address, tester.addressTwo, 0]
    );

    await tester.runTest(
        "smart wallet account recovery cannot be cancelled with no smart wallet",
        contract,
        "cancelAccountRecovery",
        "send",
        [constants.NULL_ADDRESS, tester.addressTwo],
        false
    );

    await tester.runTest(
        "smart wallet account recovery cannot be cancelled with no user signing key",
        contract,
        "cancelAccountRecovery",
        "send",
        [tester.address, constants.NULL_ADDRESS],
        false
    );

    await tester.runTest(
        "smart wallet account recovery can be cancelled",
        contract,
        "cancelAccountRecovery",
        "send",
        [tester.address, tester.addressTwo],
        true,
        receipt => {
            // TODO: verify
            //console.log(receipt.events)
        }
    );

    await tester.runTest(
        "smart wallet account recovery cannot be cancelled if it is already cancelled",
        contract,
        "cancelAccountRecovery",
        "send",
        [tester.address, tester.addressTwo],
        false
    );

    await tester.runTest(
        "smart wallet account recovery cannot be cancelled if no timelock exists",
        contract,
        "cancelAccountRecovery",
        "send",
        [tester.addressTwo, tester.addressTwo],
        false
    );

    await tester.runTest(
        "smart wallet account recovery can be reinitiated",
        contract,
        "initiateAccountRecovery",
        "send",
        [
            tester.address,
            tester.addressTwo,
            1 // extraTime in seconds - add one to ensure that timelock is extended
        ],
        true,
        receipt => {
            // TODO: verify
            //console.log(receipt.events)
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot initiate recovery disablement with null smart wallet`,
        contract,
        "initiateAccountRecoveryDisablement",
        "send",
        [constants.NULL_ADDRESS, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can initiate recovery disablement timelock`,
        contract,
        "initiateAccountRecoveryDisablement",
        "send",
        [tester.address, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call recover with null new key`,
        contract,
        "recover",
        "send",
        [constants.NULL_ADDRESS, tester.addressTwo],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call recover with null new key`,
        contract,
        "recover",
        "send",
        [tester.address, constants.NULL_ADDRESS],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call recover prior to timelock completion`,
        contract,
        "recover",
        "send",
        [constants.UPGRADE_BEACON_ADDRESS, tester.addressTwo],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call disableAccountRecovery prior to timelock completion`,
        contract,
        "disableAccountRecovery",
        "send",
        [tester.address],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check if account recovery is disabled`,
        contract,
        "accountRecoveryDisabled",
        "call",
        [tester.address],
        true,
        value => {
            assert.ok(!value);
        }
    );

    // advance time by 3 days
    await tester.advanceTime(60 * 60 * 24 * 3 + 5);

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call recover after timelock completion`,
        contract,
        "recover",
        "send",
        [constants.UPGRADE_BEACON_ADDRESS, tester.addressTwo]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot recover an unowned smart wallet`,
        contract,
        "recover",
        "send",
        [smartWalletAddress, tester.addressTwo],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot recover an EOA`,
        contract,
        "recover",
        "send",
        [tester.address, tester.addressTwo],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call disableAccountRecovery with null smart wallet`,
        contract,
        "disableAccountRecovery",
        "send",
        [constants.NULL_ADDRESS],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call disableAccountRecovery after timelock completion`,
        contract,
        "disableAccountRecovery",
        "send",
        [tester.address]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check if account recovery is disabled`,
        contract,
        "accountRecoveryDisabled",
        "call",
        [tester.address],
        true,
        value => {
            assert.ok(value);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot recover an account that has disabled recovery`,
        contract,
        "recover",
        "send",
        [tester.address, tester.addressTwo],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockInterval with no selector`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0x00000000", 0, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockInterval to modify interval over 8 weeks`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xe950c085", 5443200, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockInterval to set a timelock`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xe950c085", 10000, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockInterval to set a timelock on another function`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xaaaaaaaa", 10000, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockInterval with no selector`,
        contract,
        "modifyTimelockInterval",
        "send",
        ["0x00000000", 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockInterval before timelock completion`,
        contract,
        "modifyTimelockInterval",
        "send",
        ["0xe950c085", 1000],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration with no selector`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0x00000000", 0, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to with expiration over one month`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xe950c085", 5443200, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to modify expiration under one minute`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 30, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to modify expiration under one hour`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 3000, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockExpiration to set a timelock`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 30000, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockExpiration to set a timelock on another function`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xaaaaaaaa", 300000, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockExpiration with no selector`,
        contract,
        "modifyTimelockExpiration",
        "send",
        ["0x00000000", 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockExpiration before timelock completion`,
        contract,
        "modifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 300],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can initiate recovery disablement timelock`,
        contract,
        "initiateAccountRecoveryDisablement",
        "send",
        [tester.addressTwo, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot cancel disablement with null address`,
        contract,
        "cancelAccountRecoveryDisablement",
        "send",
        [constants.NULL_ADDRESS],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can cancel recovery disablement timelock`,
        contract,
        "cancelAccountRecoveryDisablement",
        "send",
        [tester.addressTwo]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can re-initiate recovery disablement timelock`,
        contract,
        "initiateAccountRecoveryDisablement",
        "send",
        [tester.addressTwo, 1]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot shorten a timelock`,
        contract,
        "initiateAccountRecoveryDisablement",
        "send",
        [tester.addressTwo, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot initiate recovery with massive extraTime`,
        contract,
        "initiateAccountRecovery",
        "send",
        [tester.address, tester.addressTwo, constants.FULL_APPROVAL],
        false
    );

    // advance time by 2 weeks
    await tester.advanceTime(60 * 60 * 24 * 7 * 2 + 5);

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call disableAccountRecovery after timelock expiration`,
        contract,
        "disableAccountRecovery",
        "send",
        [tester.addressTwo],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot set a role to the null tester.address`,
        contract,
        "setRole",
        "send",
        [0, constants.NULL_ADDRESS],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can set a role`,
        contract,
        "setRole",
        "send",
        [0, tester.address]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can set a role that is already set`,
        contract,
        "setRole",
        "send",
        [0, tester.address]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check if the caller has a role`,
        contract,
        "isRole",
        "call",
        [0],
        true,
        value => {
            assert.ok(value);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check for an operator role`,
        contract,
        "getOperator",
        "call",
        [],
        true,
        value => {
            assert.strictEqual(value, tester.address);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check for a recoverer role`,
        contract,
        "getRecoverer",
        "call",
        [],
        true,
        value => {
            assert.strictEqual(value, constants.NULL_ADDRESS);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check for a canceller role`,
        contract,
        "getCanceller",
        "call",
        [],
        true,
        value => {
            assert.strictEqual(value, constants.NULL_ADDRESS);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check for a disabler role`,
        contract,
        "getDisabler",
        "call",
        [],
        true,
        value => {
            assert.strictEqual(value, constants.NULL_ADDRESS);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check for a pauser role`,
        contract,
        "getPauser",
        "call",
        [],
        true,
        value => {
            assert.strictEqual(value, constants.NULL_ADDRESS);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can remove a role`,
        contract,
        "removeRole",
        "send",
        [0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check if the caller has a role`,
        contract,
        "isRole",
        "call",
        [0],
        true,
        value => {
            assert.ok(!value);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check if a role is paused`,
        contract,
        "isPaused",
        "call",
        [0],
        true,
        value => {
            assert.ok(!value);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot pause a role if not owner or pauser`,
        contract,
        "pause",
        "send",
        [0],
        false,
        receipt => {},
        tester.addressTwo
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can set a role`,
        contract,
        "setRole",
        "send",
        [4, tester.addressTwo]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot unpause an unpaused role`,
        contract,
        "unpause",
        "send",
        [0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can pause an unpaused role`,
        contract,
        "pause",
        "send",
        [0],
        true,
        receipt => {},
        tester.addressTwo
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot pause a paused role`,
        contract,
        "pause",
        "send",
        [0],
        false,
        receipt => {},
        tester.addressTwo
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can pause the pauser role`,
        contract,
        "pause",
        "send",
        [4]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 pauser cannot call a paused role`,
        contract,
        "pause",
        "send",
        [4],
        false,
        receipt => {},
        tester.addressTwo
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can check if a role is paused`,
        contract,
        "isPaused",
        "call",
        [0],
        true,
        value => {
            assert.ok(value);
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can unpause a paused role`,
        contract,
        "unpause",
        "send",
        [0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can get an empty timelock`,
        contract,
        "getTimelock",
        "call",
        ["0x01020304", "0x"],
        true,
        value => {
            assert.ok(!value.exists);
            assert.ok(!value.completed);
            assert.ok(!value.expired);
            assert.strictEqual(value.completionTime, "0");
            assert.strictEqual(value.expirationTime, "0");
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can get an empty default timelock interval`,
        contract,
        "getDefaultTimelockInterval",
        "call",
        ["0x01020304"],
        true,
        value => {
            assert.strictEqual(value, "0");
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can get an empty default timelock expiration`,
        contract,
        "getDefaultTimelockExpiration",
        "call",
        ["0x01020304"],
        true,
        value => {
            assert.strictEqual(value, "0");
        }
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockInterval with no selector`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0x00000000", 0, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockInterval to modify interval over 8 weeks`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xe950c085", 5443200, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot create timelock with excessive duration`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xe950c085", constants.FULL_APPROVAL, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockInterval to set a timelock`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xe950c085", 10000, 5]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot shorten existing initiateModifyTimelockInterval timelock`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xe950c085", 10000, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockInterval to change a duration`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xe950c085", 10001, 5]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockInterval to set a timelock on another function`,
        contract,
        "initiateModifyTimelockInterval",
        "send",
        ["0xaaaaaaaa", 10000, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockInterval with no selector`,
        contract,
        "modifyTimelockInterval",
        "send",
        ["0x00000000", 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockInterval before timelock completion`,
        contract,
        "modifyTimelockInterval",
        "send",
        ["0xe950c085", 1000],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration with no selector`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0x00000000", 0, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to with expiration over one month`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xe950c085", 5443200, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call initiateModifyTimelockExpiration to modify expiration under one minute`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 30, 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockExpiration to set a timelock`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 300000, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call initiateModifyTimelockExpiration to set a timelock on another function`,
        contract,
        "initiateModifyTimelockExpiration",
        "send",
        ["0xe950c085", 30, 0]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockExpiration with no selector`,
        contract,
        "modifyTimelockExpiration",
        "send",
        ["0x00000000", 0],
        false
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockExpiration before timelock completion`,
        contract,
        "modifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 300],
        false
    );

    // advance time by 2 weeks
    await tester.advanceTime(60 * 60 * 24 * 7 * 2 + 5);

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call modifyTimelockInterval`,
        contract,
        "modifyTimelockInterval",
        "send",
        ["0xaaaaaaaa", 10000]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 can call modifyTimelockExpiration`,
        contract,
        "modifyTimelockExpiration",
        "send",
        ["0xd7ce3c6f", 300000]
    );

    await tester.runTest(
        `DharmaAccountRecoveryManagerV2 cannot call modifyTimelockExpiration if expiration is too short`,
        contract,
        "modifyTimelockExpiration",
        "send",
        ["0xe950c085", 30],
        false
    );
}

module.exports = {
    testAccountRecoveryManager
};
