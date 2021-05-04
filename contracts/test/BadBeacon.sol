pragma solidity 0.8.4;


/**
 * @title BadBeacon
 */
contract BadBeacon {
  fallback () external {
    revert("This is not a working upgrade beacon.");
  }
}
