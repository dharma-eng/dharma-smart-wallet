pragma solidity 0.5.11;


interface DharmaKeyRingInterface {
  enum ActionType {
    Standard,
    Admin
  }

  enum AdminActionType {
    AddKey,
    RemoveKey,
    SetThreshold,
    AddAdminKey,
    RemoveAdminKey,
    SetAdminThreshold
  }

  struct KeyGroup {
    uint128 count;
    uint128 threshold;
  }

  function takeAction(
    address payable to, uint256 value, bytes calldata data, bytes calldata signatures
  ) external returns (bool ok, bytes memory returnData);

  function getActionID(
    address payable to, uint256 value, bytes calldata data
  ) external view returns (bytes32 actionID);

  function takeAdminAction(
    AdminActionType adminActionType, uint160 argument, bytes calldata signatures
  ) external;

  function getAdminActionID(
    AdminActionType adminActionType, uint160 argument
  ) external view returns (bytes32 adminActionID);
}