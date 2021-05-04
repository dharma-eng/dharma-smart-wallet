pragma solidity 0.8.4;


interface CUSDCInterestRateModelInterface {
  function getBorrowRate(
    uint256 cash, uint256 borrows, uint256 reserves
  ) external view returns (uint256 err, uint256 borrowRate);
}
