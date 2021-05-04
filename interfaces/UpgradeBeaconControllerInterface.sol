// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface UpgradeBeaconControllerInterface {
  function upgrade(address beacon, address implementation) external;
}
