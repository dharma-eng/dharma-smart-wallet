pragma solidity 0.5.17;


interface DharmaKeyRingFactoryV1Interface {
  // Fires an event when a new key ring is deployed and initialized.
  event KeyRingDeployed(address keyRing, address userSigningKey);

  function newKeyRing(
    address userSigningKey
  ) external returns (address keyRing);

  function newKeyRingAndAdditionalKey(
    address userSigningKey,
    address additionalSigningKey,
    bytes calldata signature
  ) external returns (address keyRing);

  function newKeyRingAndDaiWithdrawal(
    address userSigningKey,
    address smartWallet,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address keyRing, bool withdrawalSuccess);

  function newKeyRingAndUSDCWithdrawal(
    address userSigningKey,
    address smartWallet,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address keyRing, bool withdrawalSuccess);

   function getNextKeyRing(
    address userSigningKey
  ) external view returns (address keyRing);
}
