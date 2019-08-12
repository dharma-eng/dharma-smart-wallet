pragma solidity 0.5.10;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title DharmaUpgradeBeaconManager
 * @author 0age
 * @notice This contract will be owned by DharmaUpgradeMultisig and will manage
 * upgrades to the global smart wallet implementation via dedicated control over
 * an "upgrade beacon" contract (and can additionally be used to manage other
 * upgrade beacons). It implements a set of timelocked functions, where the
 * `setTimelock` function must first be called, with the same arguments that the
 * function will be supplied with. Then, a given time interval must first fully
 * transpire before the timelock functions can be successfully called.
 *
 * The timelocked functions currently implemented include:
 *  upgrade(address beacon, address implementation)
 *  freeze(address beacon)
 *  modifyTimelockInterval(bytes4 functionSelector, uint256 newTimelockInterval)
 *
 * Note that, for the Dharma Smart Wallet, we could also provide an `unwind` or
 * `triggerGlobalSettlement` function in the event of catastrophic failure that
 * would set an implementation on the upgrade beacon that would allow the
 * address contained at storage slot zero (or the Dharma Key) to withdraw any
 * funds on the user's smart wallet and/or take full control of the account.
 *
 * One additional consideration is whether this contract should itself be an
 * upgradeable contract that utilizes a transparent proxy. If we elect to make
 * this contract upgradeable, special care must be taken to ensure that existing
 * timelocks are still enforceable after an upgrade, likely by implementing an
 * independent timelock on the upgrade mechanism itself.
 */
contract DharmaUpgradeBeaconManager is Ownable {
  using SafeMath for uint256;

  // Fire an event any time a time lock is initiated to signal incoming upgrade.
  event TimelockInitiated(
    bytes4 functionSelector, // selector of the function 
    uint256 timeComplete,    // timestamp at which the function can be called
    bytes arguments          // abi-encoded function arguments to call with
  );

  // Fire an event any time a beacon is upgraded.
  // Note: we may want to include the old implementation and/or the extcodehash
  // of the new implementation at the time it is set.
  event Upgraded(address indexed upgradeBeacon, address implementation);

  // Note this address will eventually be a constant & we'll just check runtime.
  address private _upgradeBeaconEnvoy;

  // Implement a timelock for each function and set of arguments.
  mapping(bytes4 => mapping(bytes32 => uint256)) private _timelocks;

  // Implement a timelock interval for each timelocked function.
  mapping(bytes4 => uint256) private _timelockIntervals;

  /**
   * @notice In the constructor, set the initial owner of this contract. We're
   * also deploying an upgrade beacon envoy, though this step is just included
   * here for testing purposes - the final version will deploy it independently,
   * set the address as a constant, and verify the runtime code at the address
   * during deployment of this contract. Initial implementations, followed by
   * timelock intervals, should be set up by the owner after contract deployment
   * by calling the following, in order:
   *  1) `setTimelock` for `modifyTimelockInterval` on `freeze`
   *  2) `modifyTimelockInterval` on `freeze`
   *  3) `setTimelock` for `upgrade` on the upgrade beacon and implementation
   *  4) `upgrade` on the upgrade beacon and implementation
   *  5) `setTimelock` for `modifyTimelockInterval` on `upgrade`
   *  6) `modifyTimelockInterval` on `upgrade`
   *  7) `setTimelock` for `modifyTimelockInterval` on `modifyTimelockInterval`
   *  8) `modifyTimelockInterval` on `modifyTimelockInterval`
   * @param owner Initial owner of the contract.
   */
  constructor(address owner) public {
    // Set the supplied account as the initial owner of this contract.
    _transferOwnership(owner);
    
    // Deploy upgrade beacon envoy. Note: this could be deployed independently.
    address upgradeBeaconEnvoy;
    assembly {
      // write 22-byte beacon envoy creation code to scratch space & deploy it.
      mstore(0, 0x600b5981380380925939f3363659595959355afa15f300000000000000000000)
      upgradeBeaconEnvoy := create(0, 0, 22)
    }
    assert(address(upgradeBeaconEnvoy) != address(0));
    _upgradeBeaconEnvoy = address(upgradeBeaconEnvoy);
  }

  // WARNING: REMOVE THIS FUNCTION, IT IS JUST HERE FOR TESTING FOR NOW!
  function upgradeNoOwnerOrTimeLock(address beacon, address implementation) public {
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
    
    // Call into the beacon with the implementation as calldata to update it.
    (bool success,) = beacon.call(abi.encode(implementation));

    // revert with message on failure (i.e. if the beacon is incorrect)
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // Emit an event to signal that the upgrade beacon was updated.
    emit Upgraded(beacon, implementation);
  }

  /**
   * @notice Sets a timelock so that the specified function can be called with
   * the specified arguments. Note that existing timelocks may be extended, but
   * not shortened - this can also be used as a method for "cancelling" an
   * upgrade by extending the timelock to an arbitrarily long duration. Keep in
   * mind that new timelocks may be created with a shorter duration on functions
   * that already have other timelocks on them, but only if they have different
   * arguments.
   * @param functionSelector selector of the function to be called.   
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `update`, it is the beacon address and the implementation
   * address, each encoded as left-padded 32-byte values.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function setTimelock(
    bytes4 functionSelector,
    bytes memory arguments,
    uint256 extraTime
  ) public onlyOwner {
    // Get timelock using current time, inverval for timelock ID, & extra time.
    uint256 timelock = _timelockIntervals[functionSelector].add(now).add(extraTime);

    // Get timelock ID using the function arguments.
    bytes32 timelockID = _getTimelockID(arguments);

    // Get the current timelock, if any.
    uint256 currentTimelock = _timelocks[functionSelector][timelockID];

    // Ensure that the timelock does not decrease. Note that the same function
    // may set up a new, shorter timelock on a call with different arguments.
    require(
      currentTimelock == 0 || timelock > currentTimelock,
      "Cannot shorten an existing timelock."
    );

    // Set time that timelock will be complete using timelock ID and extra time.
    _timelocks[functionSelector][timelockID] = timelock;

    // Emit an event with all of the relevant information.
    emit TimelockInitiated(functionSelector, timelock, arguments);
  }

  /**
   * @notice Timelocked function to set a new implementation address on an
   * upgrade beacon contract. This function could optionally check the runtime
   * code of the specified upgrade beacon, but this step is not strictly
   * necessary and may prevent improvements to upgrade beacons in the future.
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

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.upgrade.selector,
      abi.encode(beacon, implementation)
    );
    
    // Call into the beacon with the implementation as calldata to update it.
    (bool success,) = beacon.call(abi.encode(implementation));

    // revert with message on failure (i.e. if the beacon is incorrect)
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // Emit an event to signal that the upgrade beacon was updated.
    emit Upgraded(beacon, implementation);
  }

  /**
   * @notice Timelocked function to clear the implementation address from the
   * specified upgrade beacon contract, which will freeze all contracts that
   * rely on that upgrade beacon. This function could optionally check the
   * runtime code of the specified upgrade beacon, but this step is not strictly
   * necessary and may prevent improvements to upgrade beacons in the future.
   * @param beacon address of upgrade beacon to remove the implementation from.
   */
  function freeze(address beacon) public onlyOwner {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(this.freeze.selector, abi.encode(beacon));
    
    // Call into the beacon with the null address as calldata to update it.
    (bool success,) = beacon.call(abi.encode(address(0)));

    // revert with message on failure (i.e. if the beacon is incorrect)
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // Emit an event to signal that the upgrade beacon now has no impementation.
    emit Upgraded(beacon, address(0));
  }

  /**
   * @notice Sets a new timelock interval for a given function selector. The
   * default for this function may also be modified, but has a maximum allowable
   * value of eight weeks.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   */
  function modifyTimelockInterval(
    bytes4 functionSelector,
    uint256 newTimelockInterval
  ) public onlyOwner {
    // Ensure that the function selector is specified.
    require(
      functionSelector != bytes4(0),
      "Function selector cannot be empty."
    );

    // Ensure a timelock interval over eight weeks is not set on this function.
    if (functionSelector == this.modifyTimelockInterval.selector) {
      require(
        newTimelockInterval <= 8 weeks,
        "Timelock interval of modifyTimelockInterval cannot exceed eight weeks."
      );
    }

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.modifyTimelockInterval.selector,
      abi.encode(newTimelockInterval)
    );
    
    // Update the timelock interval on the provided function.
    _timelockIntervals[functionSelector] = newTimelockInterval;
  }

  /**
   * @notice View function to check the existing implementation on a given
   * beacon. The request is passed through the upgrade beacon envoy, as a call
   * directly from the upgrade beacon manager will trigger an update of the
   * implementation stored on the upgrade beacon.
   * @param beacon Upgrade beacon to check for an implementation.
   */
  function getImplementation(address beacon) public view returns (address) {
    // Perform a staticcall into the envoy, supplying the beacon in calldata.
    // Note: we can declare `bytes memory returnData` to avoid inline assembly.
    (bool success, ) = _upgradeBeaconEnvoy.staticcall(abi.encode(beacon));

    // revert with message on failure (i.e. if the beacon is incorrect)
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // The current implementation for the beacon will be returned by the envoy.
    // Note: we could optionally use `return abi.decode(returnData, (address))`.
    assembly {
      returndatacopy(0, 0, returndatasize)
      return(0, returndatasize)
    }
  }

  /**
   * @notice View function to check if a timelock for the specified function and
   * arguments has completed.
   * @param functionSelector function to be called.
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `update`, it is the beacon address and the implementation
   * address, each encoded as left-padded 32-byte values.
   * @return A boolean indicating if the timelock is complete or not.
   */
  function isTimelockComplete(
    bytes4 functionSelector,
    bytes memory arguments
  ) public view returns (bool complete) {
    // Get timelock ID using the target arguments.
    bytes32 timelockID = _getTimelockID(arguments);

    // Get the current timelock, if any.
    uint256 currentTimelock = _timelocks[functionSelector][timelockID];

    // Ensure that the timelock is set and has completed.
    if (currentTimelock != 0 && currentTimelock <= now) {
      complete = true;
    }
  }

  /**
   * @notice View function to check the current minimum timelock interval on a
   * given function.
   * @param functionSelector function to retrieve the timelock interval for.
   */
  function getTimelockInterval(bytes4 functionSelector) public view returns (uint256) {
    return _timelockIntervals[functionSelector];
  }

  /**
   * @notice Private function to ensure that a timelock is complete and to clear
   * the existing timelock so it cannot later be reused.
   * @param functionSelector function to be called.   
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `update`, it is the beacon address and the implementation
   * address, each encoded as left-padded 32-byte values.
   */
  function _enforceTimelock(
    bytes4 functionSelector,
    bytes memory arguments
  ) private {
    // Ensure that the timelock is set and has completed.
    require(
      isTimelockComplete(functionSelector, arguments),
      "Function cannot be called until a timelock has been set and has expired."
    );

    // Get timelock ID using the beacon and target address.
    bytes32 timelockID = _getTimelockID(arguments);

    // Clear out the existing timelock so that it cannot be reused.
    delete _timelocks[functionSelector][timelockID];
  }

  /**
   * @notice Private view function to get the timelock ID associated with a
   * given function and arguments.
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `update`, it is the beacon address and the implementation
   * address, each encoded as left-padded 32-byte values.
   * @return The timelock ID.
   */
  function _getTimelockID(
    bytes memory arguments
  ) private pure returns (bytes32 timelockID) {
    // Get timelock ID using the beacon and target address.
    timelockID = keccak256(abi.encodePacked(arguments));
  }
}
