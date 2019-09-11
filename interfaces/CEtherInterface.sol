pragma solidity 0.5.11;


interface CEtherInterface {
  function mint() external payable;
  
  function redeemUnderlying(uint256 redeemAmount) external returns (uint256 err);

  function balanceOfUnderlying(address account) external returns (uint256 balance);
}