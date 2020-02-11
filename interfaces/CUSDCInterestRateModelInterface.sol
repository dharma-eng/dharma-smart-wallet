pragma solidity 0.5.11;


interface CUSDCInterestRateModelInterface {
  function getBorrowRate(
    uint256 cash, uint256 borrows, uint256 reserves
  ) external view returns (uint256 err, uint256 borrowRate);
}