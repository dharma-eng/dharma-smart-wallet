pragma solidity 0.5.17;


interface MinimalEscapeHatchRegistryInterface {
  function getEscapeHatch() external view returns (
    bool exists, address escapeHatch
  );
}
