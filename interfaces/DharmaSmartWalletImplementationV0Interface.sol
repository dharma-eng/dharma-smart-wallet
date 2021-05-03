pragma solidity 0.5.17;


interface DharmaSmartWalletImplementationV0Interface {
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

  function getBalances() external returns (
    uint256 daiBalance,
    uint256 usdcBalance,
    uint256 etherBalance,
    uint256 cDaiUnderlyingDaiBalance,
    uint256 cUSDCUnderlyingUSDCBalance,
    uint256 cEtherUnderlyingEtherBalance
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
