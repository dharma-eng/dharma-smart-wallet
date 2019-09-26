pragma solidity 0.5.11;


interface CTokenInterface {
  function mint(uint256 mintAmount) external returns (uint256 err);

  function redeem(uint256 redeemAmount) external returns (uint256 err);
  
  function redeemUnderlying(uint256 redeemAmount) external returns (uint256 err);

  function balanceOf(address account) external returns (uint256 balance);

  function balanceOfUnderlying(address account) external returns (uint256 balance);

  function borrow(uint256 borrowAmount) external returns (uint256 err);

  function repayBorrow(uint256 borrowAmount) external returns (uint256 err);

  // NOTE: we could use borrowBalanceStored if interest has already been accrued
  function borrowBalanceCurrent(address account) external returns (uint256 err);
  
  function getAccountSnapshot(address account) external view returns (
    uint256 err,
    uint256 cTokenBalance,
    uint256 borrowBalance,
    uint256 exchangeRateMantissa
  ); // balanceOfUnderlying = (cTokenBalance * exchangeRateMantissa) / 1e18
}