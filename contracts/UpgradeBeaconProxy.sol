pragma solidity 0.5.11;


/**
 * @title UpgradeBeaconProxy
 * @author 0age
 * @notice This contract delegates all logic, including initialization, to an
 * implementation contract provided by an "upgrade beacon" contract.
 */
contract UpgradeBeaconProxy {
  /**
   * @dev Storage slot with the address of the upgrade beacon.
   * This is the keccak-256 hash of "eip1967.proxy.upgradeBeacon" subtracted by
   * 1, and is validated in the constructor.
   * Note: we are currently supplying the upgrade beacon as an argument and
   * setting it in unstructured storage, but for the production version we can
   * instead deploy the upgrade beacon ahead of time and set it's address as a
   * constant, since it does not change.
   */
  bytes32 internal constant UPGRADE_BEACON_SLOT = 0xe440fa59daa125604eafd5daa98aee77371c181c9615fbe21f4b96302321e8a7;

  constructor(address upgradeBeacon, bytes memory initializationCalldata) public payable {
    // Set the address of the upgrade beacon in unstructured storage - this way
    // it will not interfere with standard storage written to by implementation.
    assert(UPGRADE_BEACON_SLOT == bytes32(uint256(keccak256("eip1967.proxy.upgradeBeacon")) - 1));
    bytes32 slot = UPGRADE_BEACON_SLOT;
    assembly {
      sstore(slot, upgradeBeacon)
    }

    // Get the current implementation address from the upgrade beacon.
    (bool ok, bytes memory returnData) = upgradeBeacon.staticcall("");
    if (!ok) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }
    address implementation = abi.decode(returnData, (address));

    // Delegatecall into the implementation, supplying initialization calldata.
    (ok, returnData) = implementation.delegatecall(initializationCalldata);
    if (!ok) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }
  }

  function () external payable {
    // Get the current implementation address from the upgrade beacon.
    (bool ok, bytes memory returnData) = _upgradeBeacon().staticcall("");
    if (!ok) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }
    address implementation = abi.decode(returnData, (address));

    // Delegate execution to implementation contract provided by upgrade beacon.
    _delegate(implementation);
  }

  /**
   * @dev Returns the address of the upgrade beacon.
   * @return Address of the upgrade beacon.
   */
  function _upgradeBeacon() internal view returns (address upgradeBeacon) {
    bytes32 slot = UPGRADE_BEACON_SLOT;
    assembly {
      upgradeBeacon := sload(slot)
    }
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
      // delegatecall returns 0 on error.
      case 0 { revert(0, returndatasize) }
      default { return(0, returndatasize) }
    }
  }
}