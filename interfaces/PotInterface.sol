pragma solidity 0.5.11;


interface PotInterface {
  function chi() external view returns (uint256);
  function dsr() external view returns (uint256);
  function rho() external view returns (uint256);
  function pie(address account) external view returns (uint256);
}