pragma solidity 0.5.11;


interface USDCV1Interface {
  function isBlacklisted(address _account) external view returns (bool);
  
  function paused() external view returns (bool);
}