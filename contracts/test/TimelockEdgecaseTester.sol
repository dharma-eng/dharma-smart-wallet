pragma solidity 0.5.17; // optimization runs: 200, evm version: petersburg

import "../helpers/Timelocker.sol";


/**
 * @title TimelockEdgecaseTester
 * @author 0age
 * @notice This contract is for testing overflow protection on the Timelocker
 * contract
 */
contract TimelockEdgecaseTester is Timelocker {
  // Store modifyTimelockInterval function selector as a constant.
  bytes4 private constant _MODIFY_TIMELOCK_INTERVAL_SELECTOR = bytes4(
    0xe950c085
  );

  // Store modifyTimelockExpiration function selector as a constant.
  bytes4 private constant _MODIFY_TIMELOCK_EXPIRATION_SELECTOR = bytes4(
    0xd7ce3c6f
  );

  // Exceed the ridiculously high duration that protects against overflows.
  uint256 private constant _TEN_TRILLION_YEARS = 3650000000000000 days;

  /**
   * @notice In the constructor, choose one of three edge cases that will cause
   * Timelocker to revert.
   */
  constructor(uint8 edgecase) public {
    if (edgecase == 0) {
      // Set insane initial minimum timelock interval value.
      _setInitialTimelockInterval(
        _MODIFY_TIMELOCK_INTERVAL_SELECTOR, _TEN_TRILLION_YEARS
      );
    }

    if (edgecase == 1) {
      // Set insane initial minimum timelock expiration value.
      _setInitialTimelockExpiration(
        _MODIFY_TIMELOCK_INTERVAL_SELECTOR, _TEN_TRILLION_YEARS
      );
    }

    // Set insane timelock for modifying a default timelock interval.
    _setTimelock(
      _MODIFY_TIMELOCK_INTERVAL_SELECTOR,
      abi.encode(_MODIFY_TIMELOCK_INTERVAL_SELECTOR, _TEN_TRILLION_YEARS),
      0
    );
  }
}
