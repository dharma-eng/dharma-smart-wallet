pragma solidity 0.5.11;


interface UpgradeBeaconControllerInterface {
  function upgrade(address beacon, address implementation) external;
}