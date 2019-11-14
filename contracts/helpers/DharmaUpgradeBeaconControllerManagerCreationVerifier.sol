pragma solidity 0.5.11;

import "../../interfaces/IndestructibleRegistryCheckerInterface.sol";


/**
 * @title DharmaUpgradeBeaconControllerManagerCreationVerifier
 * @author 0age
 * @notice This contract is used to ensure that the constituent dependencies of
 * the Dharma Upgrade Beacon Controller Manager are all deployed correctly and
 * registered as indestructible.
 */
contract DharmaUpgradeBeaconControllerManagerCreationVerifier {
  // Store address of Smart Wallet Upgrade Beacon Controller as a constant.
  address private constant _SMART_WALLET_UPGRADE_BEACON_CONTROLLER = address(
    0x00000000002226C940b74d674B85E4bE05539663
  );

  // Store the address of the Dharma Smart Wallet Upgrade Beacon as a constant.
  address private constant _DHARMA_SMART_WALLET_UPGRADE_BEACON = address(
    0x000000000026750c571ce882B17016557279ADaa
  );

  // Store the Adharma Smart Wallet Contingency implementation.
  address private constant _ADHARMA_SMART_WALLET_IMPLEMENTATION = address(
    0x00000000009f22dA6fEB6735614563B9Af0339fB
  );

  // Store address of Key Ring Upgrade Beacon Controller as a constant.
  address private constant _KEY_RING_UPGRADE_BEACON_CONTROLLER = address(
    0x00000000011dF015e8aD00D7B2486a88C2Eb8210
  );

  // Store the address of the Dharma Key Ring Upgrade Beacon as a constant.
  address private constant _DHARMA_KEY_RING_UPGRADE_BEACON = address(
    0x0000000000BDA2152794ac8c76B2dc86cbA57cad
  );

  // Store the Adharma Key Ring Contingency implementation.
  address private constant _ADHARMA_KEY_RING_IMPLEMENTATION = address(
    0x000000000053d1F0F8aA88b9001Bec1B49445B3c
  );

  /**
   * @notice In the constructor, verifu the runtime code of the smart wallet and
   * key ring upgrade beacons, their controllers, and their contingency
   * implementations. Then, verify that each contract in question has also been
   * registered as indestructible at indestructible.eth - this makes it
   * impossible for their runtime bytecode to be altered from the point of the
   * deployment of this contract.
   */
  constructor() public {
    // Declare variable in order to put constants on the stack for hash checks.
    address extcodehashTarget;

    // Get Smart Wallet Upgrade Beacon Controller runtime code hash.
    bytes32 smartWalletControllerHash;
    extcodehashTarget = _SMART_WALLET_UPGRADE_BEACON_CONTROLLER;
    assembly { smartWalletControllerHash := extcodehash(extcodehashTarget) }

    // Get Smart Wallet Upgrade Beacon runtime code hash.
    bytes32 smartWalletUpgradeBeaconHash;
    extcodehashTarget = _DHARMA_SMART_WALLET_UPGRADE_BEACON;
    assembly { smartWalletUpgradeBeaconHash := extcodehash(extcodehashTarget) }

    // Get Adharma Smart Wallet implementation runtime code hash.
    bytes32 adharmaSmartWalletHash;
    extcodehashTarget = _ADHARMA_SMART_WALLET_IMPLEMENTATION;
    assembly { adharmaSmartWalletHash := extcodehash(extcodehashTarget) }

    // Get Key Ring Upgrade Beacon Controller runtime code hash.
    bytes32 keyRingControllerHash;
    extcodehashTarget = _KEY_RING_UPGRADE_BEACON_CONTROLLER;
    assembly { keyRingControllerHash := extcodehash(extcodehashTarget) }

    // Get Key Ring Upgrade Beacon runtime code hash.
    bytes32 keyRingUpgradeBeaconHash;
    extcodehashTarget = _DHARMA_KEY_RING_UPGRADE_BEACON;
    assembly { keyRingUpgradeBeaconHash := extcodehash(extcodehashTarget) }

    // Get Adharma Key Ring implementation runtime code hash.
    bytes32 adharmaKeyRingHash;
    extcodehashTarget = _ADHARMA_KEY_RING_IMPLEMENTATION;
    assembly { adharmaKeyRingHash := extcodehash(extcodehashTarget) }

    // Verify the runtime hashes of smart wallet and key ring upgrade contracts.
    bool allRuntimeCodeHashesMatchExpectations = (
      smartWalletControllerHash == bytes32(
        0x6586626c057b68d99775ec4cae9aa5ce96907fb5f8d8c8046123f49f8ad93f1e
      ) &&
      smartWalletUpgradeBeaconHash == bytes32(
        0xca51e36cf6ab9af9a6f019a923588cd6df58aa1e58f5ac1639da46931167e436
      ) &&
      adharmaSmartWalletHash == bytes32(
        0xa8d641085d608420781e0b49768aa57d6e19dfeef227f839c33e2e00e2b8d82e
      ) &&
      keyRingControllerHash == bytes32(
        0xb98d105738145a629aeea247cee5f12bb25eabc1040eb01664bbc95f0e7e8d39
      ) &&
      keyRingUpgradeBeaconHash == bytes32(
        0xb65d03cdc199085ae86b460e897b6d53c08a6c6d436063ea29822ea80d90adc3
      ) &&
      adharmaKeyRingHash == bytes32(
        0xc5a2c3124a4bf13329ce188ce5813ad643bedd26058ae22958f6b23962070949
      )
    );

    // Ensure that the all of the runtime code hashes match expectations.
    require(
      allRuntimeCodeHashesMatchExpectations,
      "Runtime code hash of supplied upgradeability contracts is incorrect."
    );

    // Set up interface to check Indestructible registry for indestructibility.
    IndestructibleRegistryCheckerInterface indestructible;
    indestructible = IndestructibleRegistryCheckerInterface(
      0x0000000000f55ff05D0080fE17A63b16596Fd59f
    );

    // Ensure that each specified upgradeability contract is indestructible.
    require(
      indestructible.isRegisteredAsIndestructible(
        _SMART_WALLET_UPGRADE_BEACON_CONTROLLER
      ) &&
      indestructible.isRegisteredAsIndestructible(
        _DHARMA_SMART_WALLET_UPGRADE_BEACON
      ) &&
      indestructible.isRegisteredAsIndestructible(
        _ADHARMA_SMART_WALLET_IMPLEMENTATION
      ) &&
      indestructible.isRegisteredAsIndestructible(
        _KEY_RING_UPGRADE_BEACON_CONTROLLER
      ) &&
      indestructible.isRegisteredAsIndestructible(
        _DHARMA_KEY_RING_UPGRADE_BEACON
      ) &&
      indestructible.isRegisteredAsIndestructible(
        _ADHARMA_KEY_RING_IMPLEMENTATION
      ),
      "Supplied upgradeability contracts are not registered as indestructible."
    );
  }

  /**
   * @notice Pure function to verify that this contract was successfully
   * deployed.
   */
  function verified() external pure returns (bool ok) {
    ok = true;
  }
}