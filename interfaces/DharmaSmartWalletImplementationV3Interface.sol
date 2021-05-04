// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface DharmaSmartWalletImplementationV3Interface {
  event Cancel(uint256 cancelledNonce);
  event EthWithdrawal(uint256 amount, address recipient);
}
