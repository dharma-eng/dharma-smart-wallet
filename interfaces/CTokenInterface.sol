pragma solidity 0.5.11;


interface CTokenInterface {
  function mint(uint256 mintAmount) external returns (uint256 err);
  function redeem(uint256 redeemAmount) external returns (uint256 err);
  function redeemUnderlying(uint256 redeemAmount) external returns (uint256 err);
  function accrueInterest() external returns (uint256 err);
  function transfer(address recipient, uint256 value) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 value) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function balanceOfUnderlying(address account) external returns (uint256 balance);
  function exchangeRateCurrent() external returns (uint256 exchangeRate);

  function getCash() external view returns (uint256);
  function totalSupply() external view returns (uint256 supply);
  function totalBorrows() external view returns (uint256 borrows);
  function totalReserves() external view returns (uint256 reserves);
  function interestRateModel() external view returns (address model);
  function reserveFactorMantissa() external view returns (uint256 factor);
  function supplyRatePerBlock() external view returns (uint256 rate);
  function exchangeRateStored() external view returns (uint256 rate);
  function accrualBlockNumber() external view returns (uint256 blockNumber);
  function balanceOf(address account) external view returns (uint256 balance);
  function allowance(address owner, address spender) external view returns (uint256);
}