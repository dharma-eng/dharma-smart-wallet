pragma solidity 0.5.11;

import "@openzeppelin/contracts/ownership/Ownable.sol";


/**
 * @title DharmaUpgradeBeaconController
 * @author 0age
 * @notice This contract has exclusive control over modifications to the stored
 * implementation address on controlled "upgrade beacon" contracts. It is an
 * owned contract, where ownership can be transferred to another contract - that
 * way, the upgrade mechanism itself can be "upgraded". Apart from the ownable
 * methods, this contract is deliberately simple and only has two non-view
 * methods - `upgrade` and `freeze`. Timelocks or other upgrade conditions will
 * be managed by the owner of this contract.
 */
contract DharmaUpgradeBeaconController is Ownable {
  // Fire an event any time a new implementation is set on an upgrade beacon.
  event Upgraded(
    address indexed upgradeBeacon,
    address oldImplementation,
    bytes32 oldImplementationCodeHash,
    address newImplementation,
    bytes32 newImplementationCodeHash
  );

  // Note this address will eventually be a constant & we'll just check runtime.
  address private _upgradeBeaconEnvoy;

  /**
   * @notice In the constructor, set the initial owner of this contract. We're
   * also deploying an upgrade beacon envoy, though this step is just included
   * here for testing purposes - the final version will deploy it independently,
   * set the address as a constant, and verify the runtime code at the address
   * during deployment of this contract.
   * @param owner Initial owner of the contract.
   */
  constructor(address owner) public {
    // Set the supplied account as the initial owner of this contract.
    _transferOwnership(owner);
    
    // Deploy upgrade beacon envoy. Note: this could be deployed independently.
    address upgradeBeaconEnvoy;
    bytes22 upgradeBeaconEnvoyCreationCode = bytes22(
      0x600b5981380380925939f3363659595959355afa15f3
    );
    assembly {
      // write 22-byte beacon envoy creation code to scratch space and deploy.
      mstore(0, upgradeBeaconEnvoyCreationCode)
      upgradeBeaconEnvoy := create(0, 0, 22)
    }
    assert(address(upgradeBeaconEnvoy) != address(0));
    _upgradeBeaconEnvoy = address(upgradeBeaconEnvoy);
  }

  /**
   * @notice Set a new implementation address on an upgrade beacon contract.
   * @param beacon address of upgrade beacon to set the new implementation on.
   * @param implementation the address of the new implementation.
   */
  function upgrade(address beacon, address implementation) public onlyOwner {
    // Ensure that the implementaton contract is not the null address.
    require(
      implementation != address(0),
      "Implementation cannot be the null address."
    );

    // Ensure that the implementation contract has code via extcodesize.
    uint256 size;
    assembly {
      size := extcodesize(implementation)
    }
    require(size > 0, "Implementation must have contract code.");
    
    // Update the upgrade beacon with the new implementation address.
    _update(beacon, implementation);
  }

  /**
   * @notice Clear the implementation address from the specified upgrade beacon
   * contract, which will freeze all contracts that rely on that upgrade beacon.
   * @param beacon address of upgrade beacon to remove the implementation from.
   */
  function freeze(address beacon) public onlyOwner {
    // Update the upgrade beacon to delete the implementation address.
    _update(beacon, address(0));
  }

  /**
   * @notice View function to check the existing implementation on a given
   * beacon. The request is passed through the upgrade beacon envoy, as a call
   * directly from the upgrade beacon controller will trigger an update of the
   * implementation stored on the upgrade beacon.
   * @param beacon Upgrade beacon to check for an implementation.
   */
  function getImplementation(address beacon) public view returns (address) {
    // Perform a staticcall into the envoy, supplying the beacon in calldata.
    // Note: we can declare `bytes memory returnData` to avoid inline assembly.
    (bool success, bytes memory returnData) = _upgradeBeaconEnvoy.staticcall(abi.encode(beacon));

    // Revert with message on failure (i.e. if the beacon or envoy is incorrect)
    require(success, string(returnData));

    // decode data from static call to envoy as an address and return it.
    return abi.decode(returnData, (address));
  }

  function _update(address beacon, address newImplementation) private {
    // Get the address of the current implementation set on the upgrade beacon.
    address oldImplementation = getImplementation(beacon);

    // Get the runtime code hash for both the current and new implementations.
    bytes32 oldImplementationCodeHash;
    bytes32 newImplementationCodeHash;
    assembly {
      oldImplementationCodeHash := extcodehash(oldImplementation)
      newImplementationCodeHash := extcodehash(newImplementation)
    }

    // Call into the beacon with new implementation as calldata to update it.
    (bool success,) = beacon.call(abi.encode(newImplementation));

    // Revert with message on failure (i.e. if the beacon is somehow incorrect).
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // Emit an event to signal that the upgrade beacon was updated.
    emit Upgraded(
      beacon,
      oldImplementation,
      oldImplementationCodeHash,
      newImplementation,
      newImplementationCodeHash
    );  
  }
}
