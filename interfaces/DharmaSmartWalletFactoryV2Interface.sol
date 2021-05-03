pragma solidity 0.5.17;

import "./DharmaSmartWalletImplementationV0Interface.sol";


interface DharmaSmartWalletFactoryV2Interface {
  // Fires an event when a new smart wallet is deployed and initialized.
  event SmartWalletDeployed(address wallet, address userSigningKey);

  function newSmartWallet(
    address userSigningKey, address targetSmartWallet
  ) external returns (address wallet);

  function newSmartWalletAndNewUserSigningKey(
    address userSigningKey,
    address targetSmartWallet,
    address newUserSigningKey,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address wallet);

  function newSmartWalletAndCancel(
    address userSigningKey,
    address targetSmartWallet,
    uint256 minimumActionGas,
    bytes calldata signature
  ) external returns (address wallet);

  function getNextSmartWallet(
    address userSigningKey
  ) external view returns (address wallet);

  function getFirstSmartWalletCustomActionID(
    address smartWallet,
    DharmaSmartWalletImplementationV0Interface.ActionType action,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID);
}
