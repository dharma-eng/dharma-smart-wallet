pragma solidity 0.5.11;


/**
 * @title UpgradeBeaconImplementationCheck
 */
contract UpgradeBeaconImplementationCheck {
  constructor(address beacon, address expectedImplementation) public {
    (bool success, bytes memory returnData) = beacon.staticcall("");
    require(success, "call to beacon failed.");
    require(
      abi.decode(returnData, (address)) == expectedImplementation,
      "returned implementation does not match expected implementation."
    );
  }
}