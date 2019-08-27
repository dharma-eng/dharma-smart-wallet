pragma solidity 0.5.11;

import "@openzeppelin/contracts/ownership/Ownable.sol";


interface DharmaUpgradeBeaconEnvoyInterface {
  function getImplementation(address beacon) external view returns (address);
}


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

  // Store a mapping of the implementation code hash at the time of the last
  // upgrade for each beacon. This can be used by calling contracts to verify
  // that the implementation has not been altered since it was initially set.
  mapping(address => bytes32) private _codeHashAtLastUpgrade;

  // The upgrade beacon envoy is used to check the implementation of a beacon. 
  DharmaUpgradeBeaconEnvoyInterface private constant _UPGRADE_BEACON_ENVOY = (
    DharmaUpgradeBeaconEnvoyInterface(
      0x000000000067503c398F4c9652530DBC4eA95C02
    )
  );

  /**
   * @notice In the constructor, set the initial owner of this contract and
   * verify the runtime code of the referenced upgrade beacon envoy.
   * @param owner Initial owner of the contract.
   */
  constructor(address owner) public {
    // Set the supplied account as the initial owner of this contract.
    _transferOwnership(owner);
    
    // Ensure the upgrade beacon envoy has the expected runtime code.
    address envoy = address(_UPGRADE_BEACON_ENVOY);
    bytes32 envoyCodeHash;
    assembly { envoyCodeHash := extcodehash(envoy)}
    assert(envoyCodeHash == bytes32(
      0x7332d06692fd32b21bdd8b8b7a0a3f0de5cf549668cbc4498fc6cfaa453f1176
    ));
  }

  /**
   * @notice Set a new implementation address on an upgrade beacon contract.
   * This function may only be called by the owner of this contract.
   * @param beacon Address of upgrade beacon to set the new implementation on.
   * @param implementation The address of the new implementation.
   */
  function upgrade(address beacon, address implementation) external onlyOwner {
    // Ensure that the implementaton contract is not the null address.
    require(implementation != address(0), "Must specify an implementation.");

    // Ensure that the implementation contract has code via extcodesize.
    uint256 size;
    assembly { size := extcodesize(implementation) }
    require(size > 0, "Implementation must have contract code.");
    
    // Update the upgrade beacon with the new implementation address.
    _update(beacon, implementation);
  }

  /**
   * @notice Clear the implementation address from the specified upgrade beacon
   * contract, which will freeze all contracts that rely on that upgrade beacon.
   * This function may only be called by the owner of this contract. Also, be
   * aware that contracts that utilize a frozen beacon for their implementation
   * will still be able to receive funds.
   * @param beacon Address of upgrade beacon to remove the implementation from.
   */
  function freeze(address beacon) external onlyOwner {
    // Update the upgrade beacon to delete the implementation address.
    _update(beacon, address(0));
  }

  /**
   * @notice View function to check the existing implementation on a given
   * beacon. This is accomplished via a staticcall to the upgrade beacon envoy,
   * which in turn performs a staticcall into the given beacon and passes along
   * the returned implementation address.
   * @param beacon Address of the upgrade beacon to check for an implementation.
   * @return implementation Address of the implementation.
   */
  function getImplementation(
    address beacon
  ) external view returns (address implementation) {
    // Perform a staticcall into envoy, supplying the beacon as the argument.
    implementation = _UPGRADE_BEACON_ENVOY.getImplementation(beacon);
  }

  /**
   * @notice View function to check the runtime code hash of a beacon's
   * implementation contract at the time it was last updated. This can be used
   * by other callers to verify that the implementation has not been altered
   * since it was last updated by comparing this value to the current runtime
   * code hash of the beacon's implementation contract. Note that this function
   * will return `bytes32(0)` in the event the supplied beacon has not yet been
   * updated.
   * @param beacon Address of the upgrade beacon to check for a code hash.
   * @return codeHashAtLastUpgrade Runtime code hash of the implementation
   * contract when the beacon was last updated.
   */
  function getCodeHashAtLastUpgrade(
    address beacon
  ) external view returns (bytes32 codeHashAtLastUpgrade) {
    // Return the code hash that was set when the given beacon was last updated.
    codeHashAtLastUpgrade = _codeHashAtLastUpgrade[beacon];
  }

  /**
   * @notice Private function to perform an update to a given upgrade beacon and
   * determine the runtime code hash of both the old and the new implementation.
   * The latest code hash for the new implementation of the given beacon will be
   * updated, and event containing the beacon, the old and new implementation
   * addresses, and the old and new implementation runtime code hashes will be
   * emitted.
   * @param beacon Address of upgrade beacon to set the new implementation on.
   * @param implementation The address of the new implementation.
   */
  function _update(address beacon, address implementation) private {
    // Get the address of the current implementation set on the upgrade beacon.
    address oldImplementation = _UPGRADE_BEACON_ENVOY.getImplementation(beacon);

    // Get the runtime code hash for the current implementation.
    bytes32 oldImplementationCodeHash;
    assembly { oldImplementationCodeHash := extcodehash(oldImplementation) }

    // Call into beacon and supply address of new implementation to update it.
    (bool success,) = beacon.call(abi.encode(implementation));

    // Revert with message on failure (i.e. if the beacon is somehow incorrect).
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // Get address of the new implementation that was set on the upgrade beacon.
    address newImplementation = _UPGRADE_BEACON_ENVOY.getImplementation(beacon);

    // Get the runtime code hash for the new implementation.
    bytes32 newImplementationCodeHash;
    assembly { newImplementationCodeHash := extcodehash(newImplementation) }

    // Set runtime code hash of the new implementation for the given beacon.
    _codeHashAtLastUpgrade[beacon] = newImplementationCodeHash;

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
