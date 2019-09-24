pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title Timelocker
 * @author 0age
 * @notice This contract allows contracts that inherit it to implement timelocks
 * on functions, where the `setTimelock` function must first be called, with the
 * same arguments that the function will be supplied with. Then, a given time
 * interval must first fully transpire before the timelock functions can be
 * successfully called. It also includes a `modifyTimelockInterval` function
 * that is itself able to be timelocked, and that is given a function selector
 * and a new timelock interval for the function as arguments. To make a function
 * timelocked, use the `_enforceTimelock` internal function. To set initial
 * minimum timelock intervals, use the `_setInitialTimelockInterval` internal
 * function - it can only be used from within a constructor. Finally, there are
 * two public getters: `getTimelock` and `getTimelockInterval`.
 */
contract Timelocker {
  using SafeMath for uint256;

  // Fire an event any time a timelock is initiated.
  event TimelockInitiated(
    bytes4 functionSelector, // selector of the function 
    uint256 timeComplete,    // timestamp at which the function can be called
    bytes arguments          // abi-encoded function arguments to call with
  );

  // Fire an event any time a minimum timelock interval is modified.
  event TimelockIntervalModified(
    bytes4 functionSelector, // selector of the function 
    uint256 oldInterval,     // new minimum timelock interval for the function
    uint256 newInterval      // new minimum timelock interval for the function
  );

  // Implement a timelock for each function and set of arguments.
  mapping(bytes4 => mapping(bytes32 => uint256)) private _timelocks;

  // Implement a timelock interval for each timelocked function.
  mapping(bytes4 => uint256) private _timelockIntervals;

  /**
   * @notice Public function for setting a new timelock interval for a given 
   * function selector. The default for this function may also be modified, but
   * excessive values will cause the `modifyTimelockInterval` function to become
   * unusable.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval the new minimum timelock interval to set for the
   * given function.
   */
  function modifyTimelockInterval(
    bytes4 functionSelector,
    uint256 newTimelockInterval
  ) public {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.modifyTimelockInterval.selector, abi.encode(newTimelockInterval)
    );

    // Set new timelock interval and emit a `TimelockIntervalModified` event.
    _setTimelockInterval(functionSelector, newTimelockInterval);
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
    bytes4 functionSelector,
    bytes memory arguments
  ) public view returns (bool exists, uint256 completionTime) {
    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // Get the current timelock, if any.
    completionTime = _timelocks[functionSelector][timelockID];
    exists = completionTime != 0;
  }

  /**
   * @notice View function to check the current minimum timelock interval on a
   * given function.
   * @param functionSelector function to retrieve the timelock interval for.
   * @return The current minimum timelock interval for the given function.
   */
  function getTimelockInterval(
    bytes4 functionSelector
  ) public view returns (uint256 timelockInterval) {
    timelockInterval = _timelockIntervals[functionSelector];
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
    bytes4 functionSelector,
    bytes memory arguments,
    uint256 extraTime
  ) internal {
    // Get timelock using current time, inverval for timelock ID, & extra time.
    uint256 timelock = _timelockIntervals[functionSelector].add(now).add(
      extraTime
    );

    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // Get the current timelock, if any.
    uint256 currentTimelock = _timelocks[functionSelector][timelockID];

    // Ensure that the timelock duration does not decrease. Note that a new,
    // shorter timelock may still be set up on the same function in the event
    // that it is provided with different arguments.
    require(
      currentTimelock == 0 || timelock > currentTimelock,
      "Existing timelocks may only be extended."
    );

    // Set time that timelock will be complete using timelock ID and extra time.
    _timelocks[functionSelector][timelockID] = timelock;

    // Emit an event with all of the relevant information.
    emit TimelockInitiated(functionSelector, timelock, arguments);
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
    bytes4 functionSelector,
    uint256 newTimelockInterval
  ) internal {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }
    
    // Set the timelock interval and emit a `TimelockIntervalModified` event.
    _setTimelockInterval(functionSelector, newTimelockInterval);
  }

  /**
   * @notice Internal function to ensure that a timelock is complete and to
   * clear the existing timelock so it cannot later be reused.
   * @param functionSelector function to be called.   
   * @param arguments The abi-encoded arguments of the function to be called.
   */
  function _enforceTimelock(
    bytes4 functionSelector,
    bytes memory arguments
  ) internal {
    // Get timelock ID using the supplied function arguments.
    bytes32 timelockID = keccak256(abi.encodePacked(arguments));

    // Get the current timelock, if any.
    uint256 currentTimelock = _timelocks[functionSelector][timelockID];

    // Ensure that the timelock is set and has completed.
    require(
      currentTimelock != 0 && currentTimelock <= now,
      "Function cannot be called until a timelock has been set and has expired."
    );

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
    bytes4 functionSelector,
    uint256 newTimelockInterval
  ) private {
    // Get the existing timelock interval, if any.
    uint256 oldTimelockInterval = _timelockIntervals[functionSelector];
    
    // Update the timelock interval on the provided function.
    _timelockIntervals[functionSelector] = newTimelockInterval;

    // Emit a `TimelockIntervalModified` event with the appropriate arguments.
    emit TimelockIntervalModified(
      functionSelector, oldTimelockInterval, newTimelockInterval
    );
  }
}
