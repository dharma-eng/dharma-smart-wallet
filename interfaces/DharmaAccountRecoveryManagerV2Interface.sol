pragma solidity 0.8.4;


interface DharmaAccountRecoveryManagerV2Interface {
  // Fires an event whenever a pending account recovery is cancelled.
  event RecoveryCancelled(
    address indexed wallet, address cancelledUserSigningKey
  );

  event RecoveryDisablementCancelled(address wallet);

  event RoleModified(Role indexed role, address account);

  event RolePaused(Role indexed role);

  event RoleUnpaused(Role indexed role);

  enum Role {
    OPERATOR,
    RECOVERER,
    CANCELLER,
    DISABLER,
    PAUSER
  }

  struct RoleStatus {
    address account;
    bool paused;
  }

  function cancelAccountRecovery(
    address smartWallet, address newUserSigningKey
  ) external;

  function cancelAccountRecoveryDisablement(address smartWallet) external;

  function setRole(Role role, address account) external;

  function removeRole(Role role) external;

  function pause(Role role) external;

  function unpause(Role role) external;

  function isPaused(Role role) external view returns (bool paused);

  function isRole(Role role) external view returns (bool hasRole);

  function getOperator() external view returns (address operator);

  function getRecoverer() external view returns (address recoverer);

  function getCanceller() external view returns (address canceller);

  function getDisabler() external view returns (address disabler);

  function getPauser() external view returns (address pauser);
}
