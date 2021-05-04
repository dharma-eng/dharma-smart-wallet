pragma solidity 0.8.4;


interface PotInterface {
  function chi() external view returns (uint256);
  function dsr() external view returns (uint256);
  function rho() external view returns (uint256);
  function pie(address account) external view returns (uint256);
}
