pragma solidity 0.5.11;


interface DharmaSmartWalletRecoveryInterface {
  function recover(address newUserSigningKey) external;
  function getUserSigningKey() external view returns (address userSigningKey);
}