pragma solidity 0.8.4;

import "./DharmaUpgradeBeaconController.sol";


/**
 * @title DharmaUpgradeBeacon
 * @author 0age
 * @notice This contract holds the address of the current implementation for
 * upgradeable proxies and lets a controller update that address in storage.
 */
contract DharmaUpgradeBeacon {
  // The implementation address is held in storage slot zero.
  address private _implementation;

  // The controller that can update the implementation is set as a constant.
  address private immutable _CONTROLLER;

  constructor(address controller) {
    require(
      controller != address(0),
      "DharmaUpgradeBeacon#constructor: No controller address supplied."
    );

    // Note: consider how to verify correctness without compromising on efficiency.
    // require(
    //   envoy != address(0),
    //   "DharmaUpgradeBeacon#constructor: No envoy address supplied."
    // );
    //
    // // Ensure the upgrade beacon controller has the expected runtime code.
    // bytes32 controllerCodeHash = controller.codehash;
    // require(
    //   controllerCodeHash == keccak256(
    //     abi.encodePacked(
    //       type(DharmaUpgradeBeaconController).runtimeCode,
    //       bytes12(0),
    //       envoy,
    //     )
    //   ),
    //   "DharmaUpgradeBeaconController#constructor: controller runtime code is incorrect."
    // );

    _CONTROLLER = controller;
  }

  /**
   * @notice In the fallback function, allow only the controller to update the
   * implementation address - for all other callers, return the current address.
   * Note that this requires inline assembly, as Solidity fallback functions do
   * not natively take arguments or return values.
   */
  fallback () external {
    // Return implementation address for all callers other than the controller.
    if (msg.sender != _CONTROLLER) {
      // Load implementation from storage slot zero into memory and return it.
      assembly {
        mstore(0, sload(0))
        return(0, 32)
      }
    } else {
      // Set implementation - put first word in calldata in storage slot zero.
      assembly { sstore(0, calldataload(0)) }
    }
  }
}