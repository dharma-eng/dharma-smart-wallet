const constants = require("../../constants");
const assert = require("assert");

const MockCodeCheckArtifact = require('../../../../build/contracts/MockCodeCheck.json');

async function testPerformingUpgrade(
	tester,
	contract, // new implementation
	userSmartWalletContract,
	upgradeBeaconControllerContract,
	upgradeBeaconAddress,
	newImplementationVersion,
  initial = false
) {
  let nonce;
  let userSigningKey;
  let oldImplementation;
  let oldImplementationCodeHash;
  let newImplementationCodeHash;

  if (!initial) {
    await tester.runTest(
      'User Smart Wallet can check the user signing key prior to upgrade',
      userSmartWalletContract,
      'getUserSigningKey',
      'call',
      [],
      true,
      value => {
        userSigningKey = value
      }
    )

    await tester.runTest(
      'User Smart Wallet can get the nonce prior to upgrade',
      userSmartWalletContract,
      'getNonce',
      'call',
      [],
      true,
      value => {
        nonce = value
      }
    )
  }

  await tester.runTest(
    'DharmaUpgradeBeacon current implementation can be retrieved',
    upgradeBeaconControllerContract,
    'getImplementation',
    'call',
    [upgradeBeaconAddress],
    true,
    value => {
      oldImplementation = value;
    }
  )
    
  const MockCodeCheck = await tester.getOrdeploy("MockCodeCheck", MockCodeCheckArtifact);

	await tester.runTest(
	    'Old implementation code hash can be retrieved',
	    tester.MockCodeCheck,
	    'hash',
	    'call',
	    [oldImplementation],
	    true,
	    value => {
	      oldImplementationCodeHash = value;
	    }
	)

	await tester.runTest(
	    'New implementation code hash can be retrieved',
	    tester.MockCodeCheck,
	    'hash',
	    'call',
	    [contract.options.address],
	    true,
	    value => {
	      newImplementationCodeHash = value;
	    }
	)

  await tester.runTest(
    `Dharma Upgrade Beacon Controller can upgrade to V${newImplementationVersion.toString()} implementation`,
    upgradeBeaconControllerContract,
    'upgrade',
    'send',
    [
      upgradeBeaconAddress,
      contract.options.address
    ],
    true,
    receipt => {
      if (tester.context !== 'coverage') {
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.upgradeBeacon,
          upgradeBeaconAddress
        )

        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementation,
          oldImplementation
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.oldImplementationCodeHash,
          oldImplementationCodeHash
        )

        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementation,
          contract.options.address
        )
        assert.strictEqual(
          receipt.events.Upgraded.returnValues.newImplementationCodeHash,
          newImplementationCodeHash
        )
      }
    }
  )

  await tester.runTest(
    'DharmaUpgradeBeacon has the new implementation set',
    upgradeBeaconControllerContract,
    'getImplementation',
    'call',
    [upgradeBeaconAddress],
    true,
    value => {
      assert.strictEqual(value, contract.options.address)
    }
  )

  await tester.runTest(
    `UpgradeBeaconImplementationCheck deployment`,
    tester.UpgradeBeaconImplementationCheckDeployer,
    '',
    'deploy',
    [
      upgradeBeaconAddress, contract.options.address
    ]
  )

  if (!initial) {
    await tester.runTest(
      `V${newImplementationVersion.toString()} User Smart Wallet can get the new version (${newImplementationVersion.toString()})`,
      userSmartWalletContract,
      'getVersion',
      'call',
      [],
      true,
      value => {
        assert.strictEqual(value, newImplementationVersion.toString())
      }
    )
      
    await tester.runTest(
      `V${newImplementationVersion.toString()} user smart wallet still has the same user signing key set`,
      userSmartWalletContract,
      'getUserSigningKey',
      'call',
      [],
      true,
      value => {
        assert.strictEqual(value, userSigningKey)
      }
    )

    await tester.runTest(
      `V${newImplementationVersion.toString()} User Smart Wallet nonce is still set to value from before upgrade`,
      userSmartWalletContract,
      'getNonce',
      'call',
      [],
      true,
      value => {
        assert.strictEqual(value, nonce)
      }
    )
  }
}

module.exports = {
    testPerformingUpgrade
};