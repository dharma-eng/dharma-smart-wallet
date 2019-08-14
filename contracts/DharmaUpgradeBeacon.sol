pragma solidity 0.5.11;


/**
 * @title DharmaUpgradeBeacon
 * @author 0age
 * @notice This contract holds the address of the current implementation for
 * Dharma smart wallets and lets a controller update that address in storage.
 */
contract DharmaUpgradeBeacon {
  address private _implementation;
  address private _controller;

  /**
   * @notice In the constructor, set the controller of this contract. This value
   * can be hardcoded for the production version.
   */
  constructor(address controller) public {
    _controller = controller;
  }

  /**
   * @notice In the fallback function, allow only the controller to update the
   * implementation address - for all other callers, return the current address.
   */
  function () external {
    if (msg.sender == _controller) {
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