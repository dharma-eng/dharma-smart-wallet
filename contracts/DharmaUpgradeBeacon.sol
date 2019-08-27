pragma solidity 0.5.11;


/**
 * @title DharmaUpgradeBeacon
 * @author 0age
 * @notice This contract holds the address of the current implementation for
 * Dharma smart wallets and lets a controller update that address in storage.
 */
contract DharmaUpgradeBeacon {
  // The implementation address is held in storage slot zero.
  address private _implementation;

  // The controller that can update the implementation is set as a constant.
  address private constant _CONTROLLER = address(
    0x000000004B982c329903E699A304013079FD15aF
  );

  /**
   * @notice In the fallback function, allow only the controller to update the
   * implementation address - for all other callers, return the current address.
   */
  function () external {
    if (msg.sender == _CONTROLLER) {
      // assembly required as fallback functions do not natively take arguments.
      assembly {
        // set the first word from calldata as the new implementation.
        sstore(0, calldataload(0))
      }
    } else {
      // move implementation into memory so it can be accessed from assembly.
      address implementation = _implementation;
      // assembly required as fallback functions do not natively return values.
      assembly {
        // put the implementation into scratch space and return it.
        mstore(0, implementation)
        return(0, 32)
      }
    }
  }
}