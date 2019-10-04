pragma solidity 0.5.11;


interface DharmaKeyRegistryInterface {
  function setGlobalKey(address globalKey, bytes calldata signature) external;
  function setSpecificKey(address account, address specificKey) external;
  function getKey() external view returns (address key);
  function getKeyForUser(address account) external view returns (address key);
  function getGlobalKey() external view returns (address globalKey);
  function getSpecificKey(address account) external view returns (address specificKey);
}