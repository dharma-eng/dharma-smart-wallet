// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface DharmaSmartWalletRecoveryInterface {
  function recover(address newUserSigningKey) external;
  function getUserSigningKey() external view returns (address userSigningKey);
}
