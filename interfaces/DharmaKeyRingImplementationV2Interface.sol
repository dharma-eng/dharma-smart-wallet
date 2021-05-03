pragma solidity 0.5.17;


interface DharmaKeyRingImplementationV2Interface {
  event ThresholdModified(uint256 standard, uint256 admin);

  struct AdditionalThreshold {
    uint128 standard;
    uint128 admin;
  }

  function takeAction(
    address payable to, uint256 value, bytes calldata data, bytes calldata signatures
  ) external returns (bool ok, bytes memory returnData);

  function getActionID(
    address payable to, uint256 value, uint256 nonce, bytes calldata data
  ) external view returns (bytes32 actionID);

  function getNextActionID(
    address payable to, uint256 value, bytes calldata data
  ) external view returns (bytes32 actionID);
}
