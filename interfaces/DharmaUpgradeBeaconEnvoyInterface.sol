pragma solidity 0.8.4;


interface DharmaUpgradeBeaconEnvoyInterface {
  function getImplementation(address beacon) external view returns (address);
}
