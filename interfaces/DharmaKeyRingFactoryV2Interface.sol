pragma solidity 0.5.17;


interface DharmaKeyRingFactoryV2Interface {
  // Fires an event when a new key ring is deployed and initialized.
  event KeyRingDeployed(address keyRing, address userSigningKey);

  function newKeyRing(
    address userSigningKey, address targetKeyRing
  ) external returns (address keyRing);

  function newKeyRingAndAdditionalKey(
    address userSigningKey,
    address targetKeyRing,
    address additionalSigningKey,
    bytes calldata signature
  ) external returns (address keyRing);

  function newKeyRingAndDaiWithdrawal(
    address userSigningKey,
    address targetKeyRing,
    address smartWallet,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address keyRing, bool withdrawalSuccess);

  function newKeyRingAndUSDCWithdrawal(
    address userSigningKey,
    address targetKeyRing,
    address smartWallet,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address keyRing, bool withdrawalSuccess);

  function getNextKeyRing(
    address userSigningKey
  ) external view returns (address targetKeyRing);

  function getFirstKeyRingAdminActionID(
    address keyRing, address additionalUserSigningKey
  ) external view returns (bytes32 adminActionID);
}
