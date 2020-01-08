pragma solidity 0.5.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../interfaces/SaiToDaiMigratorInterface.sol";


/**
 * @title MockSaiToDaiMigrator
 * @notice This contract swaps Sai for Dai - be sure to give it the Dai first.
 */
contract MockSaiToDaiMigrator is SaiToDaiMigratorInterface {
  IERC20 private constant _SAI = IERC20(0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359);
  IERC20 private constant _DAI = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

  function swapSaiToDai(uint256 balance) external {
    _SAI.transferFrom(msg.sender, address(this), balance);
    _DAI.transfer(msg.sender, balance);
  }
}