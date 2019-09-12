pragma solidity 0.5.11;


/**
 * @title CodeHashCache
 * @author 0age
 * @notice This contract allows callers to register the runtime code hash of any
 * contract that is currently deployed with runtime code. It then allows callers
 * to determine whether or not the runtime code hash of any registered contract
 * has been altered since it was initially registered. A critical consideration
 * to bear in mind is that registered contracts can still be destroyed and later
 * redeployed with the same runtime code - their runtime code hash will be the
 * same, but their creation code may differ, and their contract storage will be
 * completely wiped upon destruction.
 */
contract CodeHashCache {
  // Maintain a mapping of runtime code hashes of deployed contracts.
  mapping (address => bytes32) private _cachedHashes;

  /**
   * @notice Register a target contract's current runtime code hash. This call
   * will revert if the supplied target contract has already been registered or
   * does not currently have any runtime code.
   * @param target address The contract to retrieve and store the runtime code
   * hash for.
   */
  function registerCodeHash(address target) external {
    // Ensure that the target contract has not already had a hash registered.
    require(_cachedHashes[target] == bytes32(0), "Target already registered.");    

    // Ensure that the target contract currently has runtime code.
    uint256 currentCodeSize;
    assembly { currentCodeSize := extcodesize(target) }
    require(currentCodeSize > 0, "Target currently has no runtime code.");

    // Retrieve the current runtime code hash of the target contract.
    bytes32 currentCodeHash;
    assembly { currentCodeHash := extcodehash(target) }

    // Register the runtime code hash for the target contract.
    _cachedHashes[target] = currentCodeHash;
  }

  /**
   * @notice View function to determine if the current runtime code hash of a
   * target contract matches the registered runtime code hash for the target
   * contract. Reverts if no runtime code hash has been registered yet for the
   * target contract.
   * @param target address The contract to retrieve the runtime code hash for,
   * which will be compared against the runtime code hash that was initially
   * registered for that contract.
   * @return A boolean signifying that the target contract's runtime code has
   * not been altered since it was initially registered.
   */
  function matchesRegisteredCodeHash(
    address target
  ) external view returns (bool codeHashMatchesRegisteredCodeHash) {
    // Get the runtime code hash that is currently registered for the target.
    bytes32 cachedCodeHash = _cachedHashes[target];

    // Ensure that the target contract has already had a code hash registered.
    require(cachedCodeHash != bytes32(0), "Target not yet registered.");

    // Retrieve the current runtime code hash of the target contract.
    bytes32 currentCodeHash;
    assembly { currentCodeHash := extcodehash(target) }

    // Compare current runtime code hash to registered runtime code hash.
    codeHashMatchesRegisteredCodeHash = currentCodeHash == cachedCodeHash;
  }

  /**
   * @notice View function to retrieve the runtime code hash registered for the
   * target contract. Returns bytes32(0) if there is no runtime code hash
   * registered for the target.
   * @param target address The contract to retrieve the registered runtime code
   * hash for.
   * @return The runtime code hash registered for the target contract. Returns
   * bytes32(0) if there runtime code hash has been registered for the target.
   */
  function getRegisteredCodeHash(
    address target
  ) external view returns (bytes32 registeredCodeHash) {
    // Get the runtime code hash that is currently registered for the target.
    registeredCodeHash = _cachedHashes[target];
  }
}