// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface DharmaKeyRingInitializer {
  function initialize(
    uint128 adminThreshold,
    uint128 executorThreshold,
    address[] calldata keys,
    uint8[] calldata keyTypes
  ) external;
}
