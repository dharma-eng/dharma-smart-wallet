pragma solidity 0.8.4;


interface MinimalEscapeHatchRegistryInterface {
  function getEscapeHatch() external view returns (
    bool exists, address escapeHatch
  );
}
