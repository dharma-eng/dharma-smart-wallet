const { web3 } = require("../../web3");
const constants = require("../../constants");
const assert = require("assert");

async function testKeyRegistryV2(
	tester,
	contract,
	unownedKeyRegistryAddress
) {
  await tester.runTest(
    'Dharma Key Registry V2 gets the initial global key correctly',
    contract,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 attempt to get an unset specific key throws',
    contract,
    'getSpecificKey',
    'call',
    [tester.address],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets the global key when requesting unset key',
    contract,
    'getKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot set a new empty global key',
    contract,
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
    contract.options.address +
    tester.addressTwo.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const newKeySignature = tester.signHashedPrefixedHashedHexString(
  	  message, tester.addressTwo
  )

  const badNewKeySignature = tester.signHashedPrefixedHashedHexString(
  	  '0x12', tester.addressTwo
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot set a new global key unless called by owner',
    contract,
    'setGlobalKey',
    'send',
    [
      tester.addressTwo,
      newKeySignature
    ],
    false,
    receipt => {},
    tester.addressTwo
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot set an empty global key',
    contract,
    'setGlobalKey',
    'send',
    [
      constants.NULL_ADDRESS,
      newKeySignature
    ],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot set a new global key with a bad signature',
    contract,
    'setGlobalKey',
    'send',
    [
      tester.addressTwo,
      badNewKeySignature
    ],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V2 can set a new global key correctly',
    contract,
    'setGlobalKey',
    'send',
    [
      tester.addressTwo,
      newKeySignature
    ]
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets the new global key correctly',
    contract,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.addressTwo)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot set a new specific key unless called by owner',
    contract,
    'setSpecificKey',
    'send',
    [
      tester.address,
      unownedKeyRegistryAddress
    ],
    false,
    receipt => {},
    tester.originalAddress
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets global key for a user if no specific key set',
    contract,
    'getKeyForUser',
    'call',
    [tester.address],
    true,
    value => {
      assert.strictEqual(value, tester.addressTwo)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 can set a new specific key',
    contract,
    'setSpecificKey',
    'send',
    [
      tester.address,
      unownedKeyRegistryAddress
    ]
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets specific key for user if one is set',
    contract,
    'getKeyForUser',
    'call',
    [tester.address],
    true,
    value => {
      assert.strictEqual(value, unownedKeyRegistryAddress)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets the new specific key correctly',
    contract,
    'getSpecificKey',
    'call',
    [tester.address],
    true,
    value => {
      assert.strictEqual(value, unownedKeyRegistryAddress)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets the specific key when requesting set key',
    contract,
    'getKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, unownedKeyRegistryAddress)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot reuse a specific key',
    contract,
    'setSpecificKey',
    'send',
    [
      tester.address,
      unownedKeyRegistryAddress
    ],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V2 new owner cannot accept ownership before added',
    contract,
    'acceptOwnership',
    'send',
    [],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot prepare to transfer to the null address',
    contract,
    'transferOwnership',
    'send',
    [
      constants.NULL_ADDRESS
    ],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V2 can prepare to transfer to a new owner',
    contract,
    'transferOwnership',
    'send',
    [
      tester.address
    ]
  )

  await tester.runTest(
    'Dharma Key Registry V2 can cancel an ownership transfer',
    contract,
    'cancelOwnershipTransfer'
  )

  await tester.runTest(
    'Dharma Key Registry V2 new owner cannot accept ownership after cancellation',
    contract,
    'acceptOwnership',
    'send',
    [],
    false
  )

  await tester.runTest(
    'Dharma Key Registry V2 can prepare to transfer to a new owner again',
    contract,
    'transferOwnership',
    'send',
    [
      tester.address
    ]
  )

  await tester.runTest(
    'Dharma Key Registry V2 new owner can accept ownership',
    contract,
    'acceptOwnership'
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets the new owner',
    contract,
    'owner',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.address)
    }
  )

  await tester.runTest(
    'Dharma Key Registry V2 gets the global key correctly',
    contract,
    'getGlobalKey',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, tester.addressTwo)
    }
  )

  const messageV2 = (
    contract.options.address +
    tester.address.slice(2) +
    web3.utils.asciiToHex(
      "This signature demonstrates that the supplied signing key is valid."
    ).slice(2)
  )

  const v2KeySignature = tester.signHashedPrefixedHashedHexString(
  	  messageV2, tester.address
  )

  await tester.runTest(
    'Dharma Key Registry V2 cannot set a previously used global key',
    contract,
    'setGlobalKey',
    'send',
    [
      tester.address,
      v2KeySignature
    ],
    false
  )
}

module.exports = {
    testKeyRegistryV2
};