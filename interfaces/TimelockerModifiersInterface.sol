pragma solidity 0.5.11;


interface TimelockerModifiersInterface {
  function initiateModifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval, uint256 extraTime
  ) external;

  function modifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) external;

  function initiateModifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration, uint256 extraTime
  ) external;

  function modifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) external;
}