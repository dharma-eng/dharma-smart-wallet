pragma solidity 0.8.4;


interface DharmaSmartWalletImplementationV7Interface {
  // Fires when a new user signing key is set on the smart wallet.
  event NewUserSigningKey(address userSigningKey);

  // Fires when an error occurs as part of an attempted action.
  event ExternalError(address indexed source, string revertReason);

  // The smart wallet recognizes DAI, USDC, ETH, and SAI as supported assets.
  enum AssetType {
    DAI,
    USDC,
    ETH,
    SAI
  }

  // Actions, or protected methods (i.e. not deposits) each have an action type.
  enum ActionType {
    Cancel,
    SetUserSigningKey,
    Generic,
    GenericAtomicBatch,
    SAIWithdrawal,
    USDCWithdrawal,
    ETHWithdrawal,
    SetEscapeHatch,
    RemoveEscapeHatch,
    DisableEscapeHatch,
    DAIWithdrawal,
    SignatureVerification,
    DAIBorrow,
    USDCBorrow
  }

  function initialize(address userSigningKey) external;

  function repayAndDeposit() external;

  function withdrawDai(
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (bool ok);

  function withdrawUSDC(
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (bool ok);

  function cancel(
    uint256 minimumActionGas,
    bytes calldata signature
  ) external;

  function setUserSigningKey(
    address userSigningKey,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external;

  function migrateSaiToDai() external;

  function migrateCSaiToDDai() external;

  function migrateCDaiToDDai() external;

  function migrateCUSDCToDUSDC() external;

  function getBalances() external view returns (
    uint256 daiBalance,
    uint256 usdcBalance,
    uint256 etherBalance,
    uint256 dDaiUnderlyingDaiBalance,
    uint256 dUsdcUnderlyingUsdcBalance,
    uint256 dEtherUnderlyingEtherBalance // always returns zero
  );

  function getUserSigningKey() external view returns (address userSigningKey);

  function getNonce() external view returns (uint256 nonce);

  function getNextCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID);

  function getCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID);

  function getVersion() external pure returns (uint256 version);
}
