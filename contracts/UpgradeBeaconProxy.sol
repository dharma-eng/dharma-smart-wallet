pragma solidity 0.5.11;


/**
 * @title UpgradeBeaconProxy
 * @author 0age
 * @notice This contract delegates all logic, including initialization, to an
 * implementation contract provided by the "upgrade beacon" contract.
 */
contract UpgradeBeaconProxy {
  // Set the upgrade beacon as a constant (i.e. not in contract storage).
  address private constant _UPGRADE_BEACON = address(
    0x000000006B8a7e3a9bfdf9Fa5102770F031628f1
  );

  constructor(bytes memory initializationCalldata) public payable {
    // Get the current implementation address from the upgrade beacon.
    address implementation = _getImplementation();

    // Delegatecall into the implementation, supplying initialization calldata.
    (bool ok, ) = implementation.delegatecall(initializationCalldata);
    if (!ok) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }
  }

  function () external payable {
    // Delegate execution to implementation contract provided by upgrade beacon.
    _delegate(_getImplementation());
  }

  /**
   * @dev Returns the implementation set on the upgrade beacon.
   * @return Implementation set on the upgrade beacon.
   */
  function _getImplementation() internal view returns (address implementation) {
    // Get the current implementation address from the upgrade beacon.
    (bool ok, bytes memory returnData) = _UPGRADE_BEACON.staticcall("");
    
    // Revert and pass along revert message if call to upgrade beacon reverts.
    require(ok, string(returnData));

    // Set the implementation to the address returned from the upgrade beacon.
    implementation = abi.decode(returnData, (address));
  }

  /**
   * @dev Delegates execution to an implementation contract.
   * This is a low level function that doesn't return to its internal call site.
   * It will return to the external caller whatever the implementation returns.
   * @param implementation Address to delegate.
   */
  function _delegate(address implementation) internal {
    assembly {
      // Copy msg.data. We take full control of memory in this inline assembly
      // block because it will not return to Solidity code. We overwrite the
      // Solidity scratch pad at memory position 0.
      calldatacopy(0, 0, calldatasize)

      // Call the implementation.
      // out and outsize are 0 because we don't know the size yet.
      let result := delegatecall(gas, implementation, 0, calldatasize, 0, 0)

      // Copy the returned data.
      returndatacopy(0, 0, returndatasize)

      switch result
      // Delegatecall returns 0 on error.
      case 0 { revert(0, returndatasize) }
      default { return(0, returndatasize) }
    }
  }
}