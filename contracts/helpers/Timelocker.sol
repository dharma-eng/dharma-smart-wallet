pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title Timelocker
 * @author 0age
 * @notice This contract allows contracts that inherit it to implement timelocks
 * on functions, where the `_setTimelock` internal function must first be called
 * and passed the target function selector and arguments. Then, a given time
 * interval must first fully transpire before the timelock functions can be
 * successfully called. Furthermore, once a timelock is complete, it will expire
 * after a period of time. It also includes a `modifyTimelockInterval` function
 * and a `modifyTimelockExpiration` function, both of which implement timelocks,
 * and that are given a function selector and a new timelock interval or default
 * expiration time for the specified function as arguments. IT IS IMPORTANT THAT
 * THESE FUNCTIONS ARE OVERRIDDEN IN WHATEVER CONTRACT INHERITS TIMELOCKER, as
 * they do not implement any access control since Timelocker is not an ownable.
 *
 * To make a function timelocked, use the `_enforceTimelock` internal function.
 * To set initial defult minimum timelock intervals and expirations, use the
 * `_setInitialTimelockInterval` and `_setInitialTimelockExpiration` internal
 * functions - they can only be used during contract creation. Finally, there
 * are three public getters: `getTimelock`, `getDefaultTimelockInterval`, and
 * `getDefaultTimelockExpiration`.
 */
contract Timelocker {
  using SafeMath for uint256;

  // Fire an event any time a timelock is initiated.
  event TimelockInitiated(
    bytes4 functionSelector, // selector of the function
    uint256 timeComplete,    // timestamp at which the function can be called
    bytes arguments,         // abi-encoded function arguments to call with
    uint256 timeExpired      // timestamp where function can no longer be called
  );

  // Fire an event any time a minimum timelock interval is modified.
  event TimelockIntervalModified(
    bytes4 functionSelector, // selector of the function
    uint256 oldInterval,     // old minimum timelock interval for the function
    uint256 newInterval      // new minimum timelock interval for the function
  );

  // Fire an event any time a default timelock expiration is modified.
  event TimelockExpirationModified(
    bytes4 functionSelector, // selector of the function
    uint256 oldExpiration,   // old default timelock expiration for the function
    uint256 newExpiration    // new default timelock expiration for the function
  );

  // Each timelock has timestamps for when it is complete and when it expires.
  struct Timelock {
    uint128 complete;
    uint128 expires;
  }

  // Functions have a timelock interval and time from completion to expiration.
  struct TimelockDefaults {
    uint128 interval;
    uint128 expiration;
  }

  // Implement a timelock for each function and set of arguments.
  mapping(bytes4 => mapping(bytes32 => Timelock)) private _timelocks;

  // Implement default timelock intervals and expirations for each function.
  mapping(bytes4 => TimelockDefaults) private _timelockDefaults;

  // Only allow one new interval or expiration change at a time per function.
  mapping(bytes4 => mapping(bytes4 => bytes32)) private _protectedTimelockIDs;

  // Store reused revert reasons as constants.
  string constant _SHOULD_OVERRIDE = (
    "This function should be overridden by the inheriting contract."
  );

  // Set a ridiculously high duration in order to protect against overflows.
  uint256 private constant _A_TRILLION_YEARS = 365000000000000 days;

  /**
   * @notice External stub function for setting new timelock intervals. Be sure
   * to override the stub of this function with appropriate access controls, and
   * to call the corresponding internal function from within the overriding
   * function, in order to modify timelock intervals.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval the new minimum timelock interval to set for the
   * given function.
   */
  function modifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) external {
    (functionSelector, newTimelockInterval);
    revert(_SHOULD_OVERRIDE);
  }

  /**
   * @notice External stub for setting new default timelock expirations. Be sure
   * sure to override the stub of this function with appropriate access controls
   * in order to modify timelock expirations.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockExpiration the new default timelock expiration to set for
   * the given function.
   */
  function modifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) external {
    (functionSelector, newTimelockExpiration);
    revert(_SHOULD_OVERRIDE);
  }

  /**
   * @notice View function to check if a timelock for the specified function and
   * arguments has completed.
   * @param functionSelector function to be called.
   * @param arguments The abi-encoded arguments of the function to be called.
   * @return A boolean indicating if the timelock exists or not and the time at
   * which the timelock completes if it does exist.
   */
  function getTimelock(
    bytes4 functionSelector, bytes memory arguments
  ) public view returns (
    bool exists,
    bool completed,
    bool expired,
    uint256 completionTime,
    uint256 expirationTime
  ) {
    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // Get information on the current timelock, if one exists.
    completionTime = uint256(_timelocks[functionSelector][timelockID].complete);
    exists = completionTime != 0;
    expirationTime = uint256(_timelocks[functionSelector][timelockID].expires);
    completed = exists && now > completionTime;
    expired = exists && now > expirationTime;
  }

  /**
   * @notice View function to check the current minimum timelock interval on a
   * given function.
   * @param functionSelector function to retrieve the timelock interval for.
   * @return The current minimum timelock interval for the given function.
   */
  function getDefaultTimelockInterval(
    bytes4 functionSelector
  ) public view returns (uint256 defaultTimelockInterval) {
    defaultTimelockInterval = uint256(
      _timelockDefaults[functionSelector].interval
    );
  }

  /**
   * @notice View function to check the current default timelock expiration on a
   * given function.
   * @param functionSelector function to retrieve the timelock expiration for.
   * @return The current default timelock expiration for the given function.
   */
  function getDefaultTimelockExpiration(
    bytes4 functionSelector
  ) public view returns (uint256 defaultTimelockExpiration) {
    defaultTimelockExpiration = uint256(
      _timelockDefaults[functionSelector].expiration
    );
  }

  /**
   * @notice Internal function that sets a timelock so that the specified
   * function can be called with the specified arguments. Note that existing
   * timelocks may be extended, but not shortened - this can also be used as a
   * method for "cancelling" a function call by extending the timelock to an
   * arbitrarily long duration. Keep in mind that new timelocks may be created
   * with a shorter duration on functions that already have other timelocks on
   * them, but only if they have different arguments.
   * @param functionSelector selector of the function to be called.
   * @param arguments The abi-encoded arguments of the function to be called.
   * @param extraTime Additional time in seconds to add to the minimum timelock
   * interval for the given function.
   */
  function _setTimelock(
    bytes4 functionSelector, bytes memory arguments, uint256 extraTime
  ) internal {
    // Ensure that the specified extra time will not cause an overflow error.
    require(extraTime < _A_TRILLION_YEARS, "Supplied extra time is too large.");

    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // For timelock interval or expiration changes, first drop any existing
    // timelock for the function being modified if the argument has changed.
    if (
      functionSelector == this.modifyTimelockInterval.selector ||
      functionSelector == this.modifyTimelockExpiration.selector
    ) {
      // Determine the function that will be modified by the timelock.
      (bytes4 modifiedFunction, uint256 duration) = abi.decode(
        arguments, (bytes4, uint256)
      );

      // Ensure that the new timelock duration will not cause an overflow error.
      require(
        duration < _A_TRILLION_YEARS,
        "Supplied default timelock duration to modify is too large."
      );

      // Determine the current timelockID, if any, for the modified function.
      bytes32 currentTimelockID = (
        _protectedTimelockIDs[functionSelector][modifiedFunction]
      );

      // Determine if current timelockID differs from what is currently set.
      if (currentTimelockID != timelockID) {
        // Drop existing timelock if one exists and has a different timelockID.
        if (currentTimelockID != bytes32(0)) {
          delete _timelocks[functionSelector][currentTimelockID];
        }

        // Register the new timelockID as the current protected timelockID.
        _protectedTimelockIDs[functionSelector][modifiedFunction] = timelockID;
      }
    }

    // Get timelock using current time, inverval for timelock ID, & extra time.
    uint256 timelock = uint256(
      _timelockDefaults[functionSelector].interval
    ).add(now).add(extraTime);

    // Get expiration time using timelock duration plus default expiration time.
    uint256 expiration = timelock.add(
      uint256(_timelockDefaults[functionSelector].expiration)
    );

    // Get the current timelock, if one exists.
    Timelock storage timelockStorage = _timelocks[functionSelector][timelockID];

    // Determine the duration of the current timelock.
    uint256 currentTimelock = uint256(timelockStorage.complete);

    // Ensure that the timelock duration does not decrease. Note that a new,
    // shorter timelock may still be set up on the same function in the event
    // that it is provided with different arguments. Also note that this can be
    // circumvented when modifying intervals or expirations by setting a new
    // timelock (removing the old one), then resetting the original timelock but
    // with a shorter duration.
    require(
      currentTimelock == 0 || timelock > currentTimelock,
      "Existing timelocks may only be extended."
    );

    // Set timelock completion and expiration using timelock ID and extra time.
    timelockStorage.complete = uint128(timelock);
    timelockStorage.expires = uint128(expiration);

    // Emit an event with all of the relevant information.
    emit TimelockInitiated(functionSelector, timelock, arguments, expiration);
  }

  /**
   * @notice Internal function for setting a new timelock interval for a given
   * function selector. The default for this function may also be modified, but
   * excessive values will cause the `modifyTimelockInterval` function to become
   * unusable.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval the new minimum timelock interval to set for the
   * given function.
   */
  function _modifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) internal {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.modifyTimelockInterval.selector,
      abi.encode(functionSelector, newTimelockInterval)
    );

    // Clear out the existing timelockID protection for the given function.
    delete _protectedTimelockIDs[
      this.modifyTimelockInterval.selector
    ][functionSelector];

    // Set new timelock interval and emit a `TimelockIntervalModified` event.
    _setTimelockInterval(functionSelector, newTimelockInterval);
  }

  /**
   * @notice Internal function for setting a new timelock expiration for a given
   * function selector. Once the minimum interval has elapsed, the timelock will
   * expire once the specified expiration time has elapsed. Setting this value
   * too low will result in timelocks that are very difficult to execute
   * correctly. Be sure to override the public version of this function with
   * appropriate access controls.
   * @param functionSelector the selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration the new minimum timelock expiration to set for
   * the given function.
   */
  function _modifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) internal {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.modifyTimelockExpiration.selector,
      abi.encode(functionSelector, newTimelockExpiration)
    );

    // Clear out the existing timelockID protection for the given function.
    delete _protectedTimelockIDs[
      this.modifyTimelockExpiration.selector
    ][functionSelector];

    // Set new default expiration and emit a `TimelockExpirationModified` event.
    _setTimelockExpiration(functionSelector, newTimelockExpiration);
  }

  /**
   * @notice Internal function to set an initial timelock interval for a given
   * function selector. Only callable during contract creation.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval the new minimum timelock interval to set for the
   * given function.
   */
  function _setInitialTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) internal {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    // Set the timelock interval and emit a `TimelockIntervalModified` event.
    _setTimelockInterval(functionSelector, newTimelockInterval);
  }

  /**
   * @notice Internal function to set an initial timelock expiration for a given
   * function selector. Only callable during contract creation.
   * @param functionSelector the selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration the new minimum timelock expiration to set for
   * the given function.
   */
  function _setInitialTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) internal {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    // Set the timelock interval and emit a `TimelockExpirationModified` event.
    _setTimelockExpiration(functionSelector, newTimelockExpiration);
  }

  /**
   * @notice Internal function to ensure that a timelock is complete or expired
   * and to clear the existing timelock if it is complete so it cannot later be
   * reused.
   * @param functionSelector function to be called.
   * @param arguments The abi-encoded arguments of the function to be called.
   */
  function _enforceTimelock(
    bytes4 functionSelector, bytes memory arguments
  ) internal {
    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // Get the current timelock, if one exists.
    Timelock memory timelock = _timelocks[functionSelector][timelockID];

    uint256 currentTimelock = uint256(timelock.complete);
    uint256 expiration = uint256(timelock.expires);

    // Ensure that the timelock is set and has completed.
    require(
      currentTimelock != 0 && currentTimelock <= now, "Timelock is incomplete."
    );

    // Ensure that the timelock has not expired.
    require(expiration > now, "Timelock has expired.");

    // Clear out the existing timelock so that it cannot be reused.
    delete _timelocks[functionSelector][timelockID];
  }

  /**
   * @notice Private function for setting a new timelock interval for a given
   * function selector.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval the new minimum timelock interval to set for the
   * given function.
   */
  function _setTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) private {
    // Ensure that the new timelock interval will not cause an overflow error.
    require(
      newTimelockInterval < _A_TRILLION_YEARS,
      "Supplied minimum timelock interval is too large."
    );

    // Get the existing timelock interval, if any.
    uint256 oldTimelockInterval = uint256(
      _timelockDefaults[functionSelector].interval
    );

    // Update the timelock interval on the provided function.
    _timelockDefaults[functionSelector].interval = uint128(newTimelockInterval);

    // Emit a `TimelockIntervalModified` event with the appropriate arguments.
    emit TimelockIntervalModified(
      functionSelector, oldTimelockInterval, newTimelockInterval
    );
  }

  /**
   * @notice Private function for setting a new timelock expiration for a given
   * function selector.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockExpiration the new default timelock expiration to set for
   * the given function.
   */
  function _setTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) private {
    // Ensure that the new timelock expiration will not cause an overflow error.
    require(
      newTimelockExpiration < _A_TRILLION_YEARS,
      "Supplied default timelock expiration is too large."
    );

    // Ensure that the new timelock expiration is not too short.
    require(
      newTimelockExpiration > 1 minutes,
      "New timelock expiration is too short."
    );

    // Get the existing timelock expiration, if any.
    uint256 oldTimelockExpiration = uint256(
      _timelockDefaults[functionSelector].expiration
    );

    // Update the timelock expiration on the provided function.
    _timelockDefaults[functionSelector].expiration = uint128(
      newTimelockExpiration
    );

    // Emit a `TimelockExpirationModified` event with the appropriate arguments.
    emit TimelockExpirationModified(
      functionSelector, oldTimelockExpiration, newTimelockExpiration
    );
  }
}