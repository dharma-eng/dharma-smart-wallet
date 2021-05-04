// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface CEtherInterface {
  function mint() external payable;

  function redeemUnderlying(uint256 redeemAmount) external returns (uint256 err);

  function balanceOfUnderlying(address account) external returns (uint256 balance);
}
