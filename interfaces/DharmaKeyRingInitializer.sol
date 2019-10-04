pragma solidity 0.5.11;


interface DharmaKeyRingInitializer {
  function initialize(
    uint128 adminThreshold,
    uint128 executorThreshold,
    address[] calldata keys,
    uint8[] calldata keyTypes
  ) external;
}