pragma solidity 0.5.17;


interface UpgradeBeaconControllerInterface {
  function upgrade(address beacon, address implementation) external;
}
