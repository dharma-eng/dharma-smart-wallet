pragma solidity 0.5.11;


interface IndestructibleRegistryCheckerInterface {
  function isRegisteredAsIndestructible(
    address target
  ) external view returns (bool registeredAsIndestructible);
}