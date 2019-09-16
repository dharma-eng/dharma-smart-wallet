pragma solidity 0.5.11;


interface DharmaKeyRingInterface {
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

  function takeAdminAction(
    AdminActionType adminActionType, uint160 argument, bytes calldata signatures
  ) external;

  function getAdminActionID(
    AdminActionType adminActionType, uint160 argument
  ) external view returns (bytes32 adminActionID);
}