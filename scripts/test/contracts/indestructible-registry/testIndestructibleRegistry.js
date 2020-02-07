const constants = require("../../constants");
const { newContractAndSwapMetadataHash } = require("../../testHelpers");

const IndestructibleRegistryArtifact = require('../../../../build/contracts/IndestructibleRegistry.json');

async function testIndestructibleRegistry(tester, contracts) {
    const {
        DharmaSmartWalletImplementationV6,
        DharmaSmartWalletImplementationV7,
        DharmaKeyRingImplementationV1,
    } = contracts;

    const IndestructibleRegistryDeployer =  newContractAndSwapMetadataHash(
        IndestructibleRegistryArtifact
    );

    const IndestructibleRegistry = await tester.runTest(
        `IndestructibleRegistry contract deployment`,
        IndestructibleRegistryDeployer,
        '',
        'deploy'
    )

    await tester.runTest(
        'IndestructibleRegistry can register itself as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [IndestructibleRegistry.options.address]
    )

    await tester.runTest(
        'IndestructibleRegistry can register the upgrade beacon as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.UPGRADE_BEACON_ADDRESS]
    )

    await tester.runTest(
        'IndestructibleRegistry can register the upgrade beacon controller as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.UPGRADE_BEACON_CONTROLLER_ADDRESS]
    )

    await tester.runTest(
        'IndestructibleRegistry can register the key ring upgrade beacon as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.KEY_RING_UPGRADE_BEACON_ADDRESS]
    )

    await tester.runTest(
        'IndestructibleRegistry can register the key ring upgrade beacon controller as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS]
    )

    await tester.runTest(
        'IndestructibleRegistry can register the upgrade beacon envoy as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.UPGRADE_BEACON_ENVOY_ADDRESS]
    )

    await tester.runTest(
        'IndestructibleRegistry can register the account recovery manager V2 as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS]
    )

    /*
    await tester.runTest(
        'IndestructibleRegistry can register DharmaKeyRegistryV1 as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.KEY_REGISTRY_ADDRESS]
    )
    */

    await tester.runTest(
        'IndestructibleRegistry can register DharmaKeyRegistryV2 as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.KEY_REGISTRY_V2_ADDRESS]
    )

    await tester.runTest(
        'IndestructibleRegistry can register DharmaEscapeHatchRegistry as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.ESCAPE_HATCH_REGISTRY_ADDRESS]
    )

    await tester.runTest(
        'WARNING: IndestructibleRegistry CANNOT register the smart wallet factory as indestructible (even though it is in fact NOT destructible)',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.FACTORY_ADDRESS],
        false
    )

    await tester.runTest(
        'IndestructibleRegistry can register the Adharma smart wallet implementation as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.ADHARMA_SMART_WALLET_IMPLEMENTATION_ADDRESS]
    )

    await tester.runTest(
        'IndestructibleRegistry can register the Adharma key ring implementation as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.ADHARMA_KEY_RING_IMPLEMENTATION_ADDRESS]
    )

    /*
    await tester.runTest(
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
    */

    /*
    await tester.runTest(
        'IndestructibleRegistry can register V1 implementation as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [DharmaSmartWalletImplementationV1.options.address]
    )
    */

    if (tester.context !== 'coverage') {
        /*
        await tester.runTest(
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


        await tester.runTest(
            'IndestructibleRegistry can register V5 implementation as indestructible',
            IndestructibleRegistry,
            'registerAsIndestructible',
            'send',
            [DharmaSmartWalletImplementationV5.options.address]
        )
        */

        await tester.runTest(
            'IndestructibleRegistry can register V6 implementation as indestructible',
            IndestructibleRegistry,
            'registerAsIndestructible',
            'send',
            [DharmaSmartWalletImplementationV6.options.address]
        )

        await tester.runTest(
            'IndestructibleRegistry can register V7 implementation as indestructible',
            IndestructibleRegistry,
            'registerAsIndestructible',
            'send',
            [DharmaSmartWalletImplementationV7.options.address]
        )

        await tester.runTest(
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

    await tester.runTest(
        'IndestructibleRegistry can register the upgrade beacon controller manager as indestructible',
        IndestructibleRegistry,
        'registerAsIndestructible',
        'send',
        [constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS]
    )
}

module.exports = {
    testIndestructibleRegistry,
}

