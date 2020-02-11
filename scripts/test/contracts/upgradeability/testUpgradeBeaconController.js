const constants = require("../../constants");
const assert = require("assert");

async function testUpgradeBeaconController(
    tester,
    contract,
    smartWalletControllerContract,
    keyRingControllerContract,
    envoyContract,
    smartWalletUpgradeBeaconAddress,
    keyRingUpgradeBeaconAddress,
    badBeaconAddress
) {
    await tester.runTest(
        `DharmaUpgradeBeaconController initially gets zero for lastImplementation`,
        contract,
        "getCodeHashAtLastUpgrade",
        "call",
        [tester.address],
        true,
        value => {
            assert.strictEqual(value, constants.NULL_BYTES_32);
        }
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot call upgrade from non-owner account`,
        contract,
        "upgrade",
        "send",
        [
            smartWalletUpgradeBeaconAddress,
            smartWalletControllerContract.options.address
        ],
        false,
        receipt => {},
        tester.addressTwo
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController can set implementation on upgrade beacon contract`,
        smartWalletControllerContract,
        "upgrade",
        "send",
        [
            smartWalletUpgradeBeaconAddress,
            smartWalletControllerContract.options.address
        ]
    );

    await tester.runTest(
        `DharmaKeyRingUpgradeBeaconController can set implementation on key ring upgrade beacon contract`,
        keyRingControllerContract,
        "upgrade",
        "send",
        [
            keyRingUpgradeBeaconAddress,
            smartWalletControllerContract.options.address
        ]
    );

    await tester.runTest(
        `DharmaUpgradeBeaconEnvoy throws when given invalid beacon`,
        envoyContract,
        "getImplementation",
        "call",
        [envoyContract.options.address],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconEnvoy throws when given non-contract beacon`,
        envoyContract,
        "getImplementation",
        "call",
        [tester.address],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconEnvoy can get the implementation of a valid beacon`,
        envoyContract,
        "getImplementation",
        "call",
        [keyRingUpgradeBeaconAddress],
        true,
        value => {
            assert.strictEqual(
                value,
                smartWalletControllerContract.options.address
            );
        }
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot set null implementation on an upgrade beacon contract`,
        contract,
        "upgrade",
        "send",
        [smartWalletUpgradeBeaconAddress, constants.NULL_ADDRESS],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot set non-contract implementation`,
        contract,
        "upgrade",
        "send",
        [smartWalletUpgradeBeaconAddress, tester.address],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot set null address beacon`,
        contract,
        "upgrade",
        "send",
        [constants.NULL_ADDRESS, smartWalletControllerContract.options.address],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot set non-contract address beacon`,
        contract,
        "upgrade",
        "send",
        [tester.address, smartWalletControllerContract.options.address],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot set unowned bad beacon`,
        contract,
        "upgrade",
        "send",
        [badBeaconAddress, smartWalletControllerContract.options.address],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot set unowned beacon (Note that it still logs an event!)`,
        contract,
        "upgrade",
        "send",
        [
            smartWalletUpgradeBeaconAddress,
            smartWalletControllerContract.options.address
        ]
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController can get implementation of a beacon`,
        contract,
        "getImplementation",
        "call",
        [smartWalletUpgradeBeaconAddress],
        true,
        value => {
            assert.strictEqual(
                value,
                smartWalletControllerContract.options.address
            );
        }
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController can get owner`,
        contract,
        "owner",
        "call",
        [],
        true,
        value => {
            assert.strictEqual(value, tester.address);
        }
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController can call isOwner and value is ok`,
        contract,
        "isOwner",
        "call",
        [],
        true,
        value => {
            assert.ok(value);
        }
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController cannot transfer ownership to null address`,
        contract,
        "transferOwnership",
        "send",
        [constants.NULL_ADDRESS],
        false
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController can transfer ownership`,
        contract,
        "transferOwnership",
        "send",
        [tester.address]
    );

    await tester.runTest(
        `DharmaUpgradeBeaconController can renounce ownership`,
        contract,
        "renounceOwnership"
    );
}

module.exports = {
    testUpgradeBeaconController
};
