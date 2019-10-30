pragma solidity 0.5.11; // optimization runs: 200, evm version: petersburg

import "../helpers/Timelocker.sol";
import "../helpers/TwoStepOwnable.sol";


/**
 * @title TimelockTwoStepOwnableTestContract
 * @author 0age
 * @notice This contract implements the TwoStepOwnable and timelocker contracts
 * (the timelock parameters themselves are not modifiable) and additionally a
 * single timelocked function, `test` (as well as `initiateTest` to trigger the
 * timelock for it). The timelock has a fixed five-second minimum interval and a
 * thirty-minute expiration time, and will emit a `Test` event.
 */
contract TimelockTwoStepOwnableTestContract is TwoStepOwnable, Timelocker {
  // Fires a test event with an address parameter.
  event Test(address addressTest);

  /**
   * @notice In the constructor, set the initial owner to the transaction
   * submitter and initial minimum timelock interval and default timelock
   * expiration values.
   */
  constructor() public {
    // Set initial minimum timelock interval values.
    _setInitialTimelockInterval(this.test.selector, 5); // 5 seconds

    // Set initial default timelock expiration values.
    _setInitialTimelockExpiration(this.test.selector, 30 minutes);
  }

  /**
   * @notice Initiates a timelocked test transaction. Only the owner may call
   * this function. Once the timelock period is complete (and before it has
   * expired) the owner may call `test` to complete the process.
   * @param addressTest an address that will be logged.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateTest(
    address addressTest, uint256 extraTime
  ) external onlyOwner {
    require(addressTest != address(0), "No test address provided.");

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(this.test.selector, abi.encode(addressTest), extraTime);
  }

  /**
   * @notice Timelocked function to perform a test transaction. Only the owner
   * may call this function.
   * @param addressTest an address that will be logged.
   */
  function test(address addressTest) external onlyOwner {
    require(addressTest != address(0), "No test address provided.");

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(abi.encode(addressTest));

    // Emit the test event.
    emit Test(addressTest);
  }
}