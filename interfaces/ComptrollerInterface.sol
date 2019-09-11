pragma solidity 0.5.11;


interface ComptrollerInterface {
  function enterMarkets(
    address[] calldata cTokens
  ) external returns (uint256[] memory errs);
  
  function getAccountLiquidity(
    address account
  ) external view returns (uint256 err, uint256 liquidity, uint256 shortfall);
}