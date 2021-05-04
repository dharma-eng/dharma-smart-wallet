pragma solidity 0.8.4;

import "../../interfaces/TimelockerModifiersInterface.sol";
import "../../interfaces/TimelockerInterface.sol";


/**
 * @title TimelockerV2
 * @author 0age
 * @notice This contract allows contracts that inherit it to implement timelocks
 * on functions, where the `_setTimelock` internal function must first be called
 * and passed the target function selector and arguments. Then, a given time
 * interval must first fully transpire before the timelock functions can be
 * successfully called. Furthermore, once a timelock is complete, it will expire
 * after a period of time. In order to change timelock intervals or expirations,
 * the inheriting contract needs to implement `modifyTimelockInterval` and
 * `modifyTimelockExpiration` functions, respectively, as well as functions that
 * call `_setTimelock` in order to initiate the timelocks for those functions.
 * To make a function timelocked, use the `_enforceTimelock` internal function.
 * To set initial defult minimum timelock intervals and expirations, use the
 * `_setInitialTimelockInterval` and `_setInitialTimelockExpiration` internal
 * functions - they can only be used during contract creation. Additionally,
 * there are three external getters (and internal equivalents): `getTimelock`,
 * `getDefaultTimelockInterval`, and `getDefaultTimelockExpiration`. Finally,
 * version two of the timelocker builds on version one by including an internal
 * `_expireTimelock` function for expiring an existing timelock, which can then
 * be reactivated as long as the completion time does not become shorter than
 * the original completion time.
 */
contract TimelockerV2 is TimelockerInterface {

  // Implement a timelock for each function and set of arguments.
  mapping(bytes4 => mapping(bytes32 => Timelock)) private _timelocks;

  // Implement default timelock intervals and expirations for each function.
  mapping(bytes4 => TimelockDefaults) private _timelockDefaults;

  // Only allow one new interval or expiration change at a time per function.
  mapping(bytes4 => mapping(bytes4 => bytes32)) private _protectedTimelockIDs;

  // Store modifyTimelockInterval function selector as a constant.
  bytes4 private constant _MODIFY_TIMELOCK_INTERVAL_SELECTOR = bytes4(
    0xe950c085
  );

  // Store modifyTimelockExpiration function selector as a constant.
  bytes4 private constant _MODIFY_TIMELOCK_EXPIRATION_SELECTOR = bytes4(
    0xd7ce3c6f
  );

  // Set a ridiculously high duration in order to protect against overflows.
  uint256 private constant _A_TRILLION_YEARS = 365000000000000 days;

  /**
   * @notice In the constructor, confirm that selectors specified as constants
   * are correct.
   */
  constructor() {
    TimelockerModifiersInterface modifiers;

    bytes4 targetModifyInterval = modifiers.modifyTimelockInterval.selector;
    require(
      _MODIFY_TIMELOCK_INTERVAL_SELECTOR == targetModifyInterval,
      "Incorrect modify timelock interval selector supplied."
    );

    bytes4 targetModifyExpiration = modifiers.modifyTimelockExpiration.selector;
    require(
      _MODIFY_TIMELOCK_EXPIRATION_SELECTOR == targetModifyExpiration,
      "Incorrect modify timelock expiration selector supplied."
    );
  }

  /**
   * @notice View function to check if a timelock for the specified function and
   * arguments has completed.
   * @param functionSelector Function to be called.
   * @param arguments The abi-encoded arguments of the function to be called.
   * @return exists - a boolean indicating if the timelock exists
   * @return completed -  a boolean indicating if the timelock has completed
   * @return expired -  a boolean indicating if the timelock has expired
   * @return completionTime - time at which the timelock completed
   * @return expirationTime - time at which the timelock expired
   */
  function getTimelock(
    bytes4 functionSelector, bytes memory arguments
  ) public view override returns (
    bool exists,
    bool completed,
    bool expired,
    uint256 completionTime,
    uint256 expirationTime
  ) {
    // Get information on the current timelock, if one exists.
    (exists, completed, expired, completionTime, expirationTime) = _getTimelock(
      functionSelector, arguments
    );
  }

  /**
   * @notice View function to check the current minimum timelock interval on a
   * given function.
   * @param functionSelector Function to retrieve the timelock interval for.
   * @return defaultTimelockInterval - the current minimum timelock interval for the given function.
   */
  function getDefaultTimelockInterval(
    bytes4 functionSelector
  ) public view override returns (uint256 defaultTimelockInterval) {
    defaultTimelockInterval = _getDefaultTimelockInterval(functionSelector);
  }

  /**
   * @notice View function to check the current default timelock expiration on a
   * given function.
   * @param functionSelector Function to retrieve the timelock expiration for.
   * @return defaultTimelockExpiration - the current default timelock expiration for the given function.
   */
  function getDefaultTimelockExpiration(
    bytes4 functionSelector
  ) public view override returns (uint256 defaultTimelockExpiration) {
    defaultTimelockExpiration = _getDefaultTimelockExpiration(functionSelector);
  }

  /**
   * @notice Internal function that sets a timelock so that the specified
   * function can be called with the specified arguments. Note that existing
   * timelocks may be extended, but not shortened - this can also be used as a
   * method for "cancelling" a function call by extending the timelock to an
   * arbitrarily long duration. Keep in mind that new timelocks may be created
   * with a shorter duration on functions that already have other timelocks on
   * them, but only if they have different arguments.
   * @param functionSelector Selector of the function to be called.
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
      functionSelector == _MODIFY_TIMELOCK_INTERVAL_SELECTOR ||
      functionSelector == _MODIFY_TIMELOCK_EXPIRATION_SELECTOR
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
    ) + block.timestamp + extraTime;

    // Get expiration time using timelock duration plus default expiration time.
    uint256 expiration = timelock + uint256(_timelockDefaults[functionSelector].expiration);

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
   * @param functionSelector The selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval the new minimum timelock interval to set for the
   * given function.
   */
  function _modifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) internal {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelockPrivate(
      _MODIFY_TIMELOCK_INTERVAL_SELECTOR,
      abi.encode(functionSelector, newTimelockInterval)
    );

    // Clear out the existing timelockID protection for the given function.
    delete _protectedTimelockIDs[
      _MODIFY_TIMELOCK_INTERVAL_SELECTOR
    ][functionSelector];

    // Set new timelock interval and emit a `TimelockIntervalModified` event.
    _setTimelockIntervalPrivate(functionSelector, newTimelockInterval);
  }

  /**
   * @notice Internal function for setting a new timelock expiration for a given
   * function selector. Once the minimum interval has elapsed, the timelock will
   * expire once the specified expiration time has elapsed. Setting this value
   * too low will result in timelocks that are very difficult to execute
   * correctly. Be sure to override the public version of this function with
   * appropriate access controls.
   * @param functionSelector The selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration The new minimum timelock expiration to set for
   * the given function.
   */
  function _modifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) internal {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelockPrivate(
      _MODIFY_TIMELOCK_EXPIRATION_SELECTOR,
      abi.encode(functionSelector, newTimelockExpiration)
    );

    // Clear out the existing timelockID protection for the given function.
    delete _protectedTimelockIDs[
      _MODIFY_TIMELOCK_EXPIRATION_SELECTOR
    ][functionSelector];

    // Set new default expiration and emit a `TimelockExpirationModified` event.
    _setTimelockExpirationPrivate(functionSelector, newTimelockExpiration);
  }

  /**
   * @notice Internal function to set an initial timelock interval for a given
   * function selector. Only callable during contract creation.
   * @param functionSelector The selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval The new minimum timelock interval to set for the
   * given function.
   */
  function _setInitialTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) internal {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address()) { revert(0, 0) } }

    // Set the timelock interval and emit a `TimelockIntervalModified` event.
    _setTimelockIntervalPrivate(functionSelector, newTimelockInterval);
  }

  /**
   * @notice Internal function to set an initial timelock expiration for a given
   * function selector. Only callable during contract creation.
   * @param functionSelector The selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration The new minimum timelock expiration to set for
   * the given function.
   */
  function _setInitialTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) internal {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address()) { revert(0, 0) } }

    // Set the timelock interval and emit a `TimelockExpirationModified` event.
    _setTimelockExpirationPrivate(functionSelector, newTimelockExpiration);
  }

  /**
   * @notice Internal function to expire or cancel a timelock so it is no longer
   * usable. Once it has been expired, the timelock in question will only be
   * reactivated if the timelock is reset, and this operation is only permitted
   * if the completion time is not shorter than the original completion time.
   * @param functionSelector The function that the timelock to expire is set on.
   * @param arguments The abi-encoded arguments of the timelocked function call
   * to be expired.
   */
  function _expireTimelock(
    bytes4 functionSelector, bytes memory arguments
  ) internal {
    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // Get the current timelock, if one exists.
    Timelock storage timelock = _timelocks[functionSelector][timelockID];

    uint256 currentTimelock = uint256(timelock.complete);
    uint256 expiration = uint256(timelock.expires);

    // Ensure a timelock is currently set for the given function and arguments.
    require(currentTimelock != 0, "No timelock found for the given arguments.");

    // Ensure that the timelock has not already expired.
    require(expiration > block.timestamp, "Timelock has already expired.");

    // Mark the timelock as expired.
    timelock.expires = uint128(0);
  }

  /**
   * @notice Internal function to ensure that a timelock is complete or expired
   * and to clear the existing timelock if it is complete so it cannot later be
   * reused. The function to enforce the timelock on is inferred from `msg.sig`.
   * @param arguments The abi-encoded arguments of the function to be called.
   */
  function _enforceTimelock(bytes memory arguments) internal {
    // Enforce the relevant timelock.
    _enforceTimelockPrivate(msg.sig, arguments);
  }

  /**
   * @notice Internal view function to check if a timelock for the specified
   * function and arguments has completed.
   * @param functionSelector Function to be called.
   * @param arguments The abi-encoded arguments of the function to be called.
   * @return exists - a boolean indicating if the timelock exists
   * @return completed -  a boolean indicating if the timelock has completed
   * @return expired -  a boolean indicating if the timelock has expired
   * @return completionTime - time at which the timelock completed
   * @return expirationTime - time at which the timelock expired
   */
  function _getTimelock(
    bytes4 functionSelector, bytes memory arguments
  ) internal view returns (
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
    completed = exists && block.timestamp > completionTime;
    expired = exists && block.timestamp > expirationTime;
  }

  /**
   * @notice Internal view function to check the current minimum timelock
   * interval on a given function.
   * @param functionSelector Function to retrieve the timelock interval for.
   * @return defaultTimelockInterval - the current minimum timelock interval for the given function.
   */
  function _getDefaultTimelockInterval(
    bytes4 functionSelector
  ) internal view returns (uint256 defaultTimelockInterval) {
    defaultTimelockInterval = uint256(
      _timelockDefaults[functionSelector].interval
    );
  }

  /**
   * @notice Internal view function to check the current default timelock
   * expiration on a given function.
   * @param functionSelector Function to retrieve the timelock expiration for.
   * @return defaultTimelockExpiration - the current default timelock expiration for the given function.
   */
  function _getDefaultTimelockExpiration(
    bytes4 functionSelector
  ) internal view returns (uint256 defaultTimelockExpiration) {
    defaultTimelockExpiration = uint256(
      _timelockDefaults[functionSelector].expiration
    );
  }

  /**
   * @notice Private function to ensure that a timelock is complete or expired
   * and to clear the existing timelock if it is complete so it cannot later be
   * reused.
   * @param functionSelector Function to be called.
   * @param arguments The abi-encoded arguments of the function to be called.
   */
  function _enforceTimelockPrivate(
    bytes4 functionSelector, bytes memory arguments
  ) private {
    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // Get the current timelock, if one exists.
    Timelock memory timelock = _timelocks[functionSelector][timelockID];

    uint256 currentTimelock = uint256(timelock.complete);
    uint256 expiration = uint256(timelock.expires);

    // Ensure that the timelock is set and has completed.
    require(
      currentTimelock != 0 && currentTimelock <= block.timestamp, "Timelock is incomplete."
    );

    // Ensure that the timelock has not expired.
    require(expiration > block.timestamp, "Timelock has expired.");

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
  function _setTimelockIntervalPrivate(
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
  function _setTimelockExpirationPrivate(
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
