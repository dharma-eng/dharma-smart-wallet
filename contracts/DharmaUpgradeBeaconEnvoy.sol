pragma solidity 0.5.11;


/**
 * @title DharmaUpgradeBeaconEnvoy
 * @author 0age
 * @notice This contract calls into an upgrade beacon on behalf of a controller
 * to retrieve the implementation address, since a call from the controller will
 * instead trigger an update of the upgrade beacon's implementation.
 */
contract DharmaUpgradeBeaconEnvoy {
  /**
   * @notice View function to check the existing implementation on a given
   * beacon. This is accomplished via a staticcall to the beacon with no data,
   * and the beacon will return an abi-encoded implementation address.
   * @param beacon Address of the upgrade beacon to check for an implementation.
   * @return implementation Address of the implementation.
   */
  function getImplementation(
    address beacon
  ) external view returns (address implementation) {
    // Perform the staticcall into the supplied upgrade beacon.
    (bool ok, bytes memory returnData) = beacon.staticcall("");

    // Revert if underlying staticcall reverts, passing along revert message.
    require(ok, string(returnData));

    // Ensure that the data returned from the beacon is the correct length.
    require(returnData.length == 32, "Return data must be exactly 32 bytes.");

    // Decode the address from the returned data and return it to the caller.
    implementation = abi.decode(returnData, (address));
  }
}