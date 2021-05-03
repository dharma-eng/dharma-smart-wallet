pragma solidity 0.5.17;


interface DharmaSmartWalletRecoveryInterface {
  function recover(address newUserSigningKey) external;
  function getUserSigningKey() external view returns (address userSigningKey);
}
