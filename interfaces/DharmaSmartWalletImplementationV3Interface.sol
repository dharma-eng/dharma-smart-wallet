pragma solidity 0.5.17;


interface DharmaSmartWalletImplementationV3Interface {
  event Cancel(uint256 cancelledNonce);
  event EthWithdrawal(uint256 amount, address recipient);
}
