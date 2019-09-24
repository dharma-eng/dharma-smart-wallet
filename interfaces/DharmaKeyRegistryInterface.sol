pragma solidity 0.5.11;


interface DharmaKeyRegistryInterface {
  function getGlobalKey() external view returns (address globalKey);
  function getKey() external view returns (address key);
  function getKeyForUser(address account) external view returns (address key);
}