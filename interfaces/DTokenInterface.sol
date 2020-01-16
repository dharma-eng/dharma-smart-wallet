pragma solidity 0.5.11;

/**
 * @title DTokenInterface
 * @author 0age
 * @notice Interface for dTokens.
 */
interface DTokenInterface {
  // Events (similar to Compound's events)
  event Mint(address minter, uint256 mintAmount, uint256 mintDTokens);
  event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemDTokens);
  event Accrue(uint256 dTokenExchangeRate, uint256 cTokenExchangeRate);
  event CollectSurplus(uint256 surplusAmount, uint256 surplusCTokens);

  // external functions (trigger accrual)
  function mint(uint256 underlyingToSupply) external returns (uint256 dTokensMinted);
  function mintViaCToken(uint256 cTokensToSupply) external returns (uint256 dTokensMinted);
  function redeem(uint256 dTokensToBurn) external returns (uint256 underlyingReceived);
  function redeemToCToken(uint256 dTokensToBurn) external returns (uint256 cTokensReceived);
  function redeemUnderlying(uint256 underelyingToReceive) external returns (uint256 dTokensBurned);
  function redeemUnderlyingToCToken(uint256 underlyingToReceive) external returns (uint256 dTokensBurned);
  function transferUnderlying(address recipient, uint256 amount) external returns (bool);
  function transferUnderlyingFrom(address sender, address recipient, uint256 amount) external returns (bool);
  function pullSurplus() external returns (uint256 cTokenSurplus);
  function accrueInterest() external;

  // view functions (do not trigger accrual)
  function totalSupplyUnderlying() external view returns (uint256);
  function balanceOfUnderlying(address account) external view returns (uint256 underlyingBalance);
  function getSurplus() external view returns (uint256 cTokenSurplus);
  function getSurplusUnderlying() external view returns (uint256 underlyingSurplus);
  function exchangeRateCurrent() external view returns (uint256 dTokenExchangeRate);
  function supplyRatePerBlock() external view returns (uint256 dTokenInterestRate);
  function getSpreadPerBlock() external view returns (uint256 rateSpread);
  function getVersion() external pure returns (uint256 version);
}