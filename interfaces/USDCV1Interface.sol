pragma solidity 0.8.4;


interface USDCV1Interface {
  function isBlacklisted(address _account) external view returns (bool);

  function paused() external view returns (bool);
}
