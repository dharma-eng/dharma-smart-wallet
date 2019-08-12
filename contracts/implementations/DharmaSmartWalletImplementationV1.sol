pragma solidity 0.5.10;


/**
 * @title DharmaSmartWalletImplementationV1
 * @notice This is currently a stub for the actual smart wallet implementation.
 */
contract DharmaSmartWalletImplementationV1 {
  // WARNING: DO NOT REMOVE OR REORDER STORAGE WHEN WRITING NEW IMPLEMENTATIONS!
  address private _dharmaKey;

  function initialize(address dharmaKey) public {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    _dharmaKey = dharmaKey;
  }

  function getDharmaKey() public view returns (address dharmaKey) {
    return _dharmaKey;
  }

  function test() public pure returns (bool) {
    return true;
  }

  function testRevert() public pure returns (bool) {
    revert("This revert message should be visible.");
  }  
}