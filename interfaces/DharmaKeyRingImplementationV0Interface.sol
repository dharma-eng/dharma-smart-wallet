pragma solidity 0.5.11;


interface DharmaKeyRingImplementationV0Interface {
  event KeyModified(address indexed key, bool standard, bool admin);

  enum KeyType {
    None,
    Standard,
    Admin,
    Dual
  }

  enum AdminActionType {
    AddStandardKey,
    RemoveStandardKey,
    SetStandardThreshold,
    AddAdminKey,
    RemoveAdminKey,
    SetAdminThreshold,
    AddDualKey,
    RemoveDualKey,
    SetDualThreshold
  }

  struct AdditionalKeyCount {
    uint128 standard;
    uint128 admin;
  }

  function takeAdminAction(
    AdminActionType adminActionType, uint160 argument, bytes calldata signatures
  ) external;

  function getAdminActionID(
    AdminActionType adminActionType, uint160 argument
  ) external view returns (bytes32 adminActionID);

  function getVersion() external pure returns (uint256 version);
}