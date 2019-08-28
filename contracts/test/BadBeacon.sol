pragma solidity 0.5.11;


/**
 * @title BadBeacon
 */
contract BadBeacon {
  function () external {
    revert("This is not a working upgrade beacon.");
  }
}