pragma solidity 0.5.11;


interface DharmaKeyRingFactoryV1Interface {
  // Fires an event when a new key ring is deployed and initialized.
  event KeyRingDeployed(address keyRing, address userSigningKey);

  function newKeyRing(
    address userSigningKey
  ) external returns (address keyRing);
  
  function getNextKeyRing(
    address userSigningKey
  ) external view returns (address keyRing);
}