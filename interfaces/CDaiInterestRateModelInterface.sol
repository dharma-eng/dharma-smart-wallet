pragma solidity 0.5.11;


interface CDaiInterestRateModelInterface {
  function getBorrowRate(
    uint256 cash, uint256 borrows, uint256 reserves
  ) external view returns (uint256 borrowRate);

  function getSupplyRate(
    uint256 cash, uint256 borrows, uint256 reserves, uint256 reserveFactor
  ) external view returns (uint256 supplyRate);
}