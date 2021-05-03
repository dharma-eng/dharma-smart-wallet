pragma solidity 0.5.17;


interface DharmaUpgradeBeaconEnvoyInterface {
  function getImplementation(address beacon) external view returns (address);
}
