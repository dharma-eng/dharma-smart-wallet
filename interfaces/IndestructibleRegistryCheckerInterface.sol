pragma solidity 0.8.4;


interface IndestructibleRegistryCheckerInterface {
  function isRegisteredAsIndestructible(
    address target
  ) external view returns (bool registeredAsIndestructible);
}
