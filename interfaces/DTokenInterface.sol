pragma solidity 0.5.11;

/**
 * @title DTokenInterface
 * @author 0age
 * @notice Interface for dTokens (in addition to the standard ERC20 interface).
 */
interface DTokenInterface {
  // Events bear similarity to Compound's supply-related events.
  event Mint(address minter, uint256 mintAmount, uint256 mintDTokens);
  event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemDTokens);
  event Accrue(uint256 dTokenExchangeRate, uint256 cTokenExchangeRate);
  event CollectSurplus(uint256 surplusAmount, uint256 surplusCTokens);

  // The block number and cToken + dToken exchange rates are updated on accrual.
  struct AccrualIndex {
    uint112 dTokenExchangeRate;
    uint112 cTokenExchangeRate;
    uint32 block;
  }

  // These external functions trigger accrual on the dToken and backing cToken.
  function mint(uint256 underlyingToSupply) external returns (uint256 dTokensMinted);
  function redeem(uint256 dTokensToBurn) external returns (uint256 underlyingReceived);
  function redeemUnderlying(uint256 underlyingToReceive) external returns (uint256 dTokensBurned);
  function pullSurplus() external returns (uint256 cTokenSurplus);

  // These external functions only trigger accrual on the dToken.
  function mintViaCToken(uint256 cTokensToSupply) external returns (uint256 dTokensMinted);
  function redeemToCToken(uint256 dTokensToBurn) external returns (uint256 cTokensReceived);
  function redeemUnderlyingToCToken(uint256 underlyingToReceive) external returns (uint256 dTokensBurned);
  function accrueInterest() external;
  function transferUnderlying(address recipient, uint256 underlyingEquivalentAmount) external returns (bool success);
  function transferUnderlyingFrom(address sender, address recipient, uint256 underlyingEquivalentAmount) external returns (bool success);

  // This function provides basic meta-tx support and does not trigger accrual.
  function modifyAllowanceViaMetaTransaction(
    address owner,
    address spender,
    uint256 value,
    bool increase,
    uint256 expiration,
    bytes32 salt,
    bytes calldata signatures
  ) external returns (bool success);

  // View and pure functions do not trigger accrual on the dToken or the cToken.
  function getMetaTransactionMessageHash(
    bytes4 functionSelector, bytes calldata arguments, uint256 expiration, bytes32 salt
  ) external view returns (bytes32 digest, bool valid);
  function totalSupplyUnderlying() external view returns (uint256);
  function balanceOfUnderlying(address account) external view returns (uint256 underlyingBalance);
  function exchangeRateCurrent() external view returns (uint256 dTokenExchangeRate);
  function supplyRatePerBlock() external view returns (uint256 dTokenInterestRate);
  function accrualBlockNumber() external view returns (uint256 blockNumber);
  function getSurplus() external view returns (uint256 cTokenSurplus);
  function getSurplusUnderlying() external view returns (uint256 underlyingSurplus);
  function getSpreadPerBlock() external view returns (uint256 rateSpread);
  function getVersion() external pure returns (uint256 version);
  function getCToken() external pure returns (address cToken);
  function getUnderlying() external pure returns (address underlying);
}