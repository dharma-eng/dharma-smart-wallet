pragma solidity 0.5.11;


interface DharmaUpgradeBeaconControllerManagerInterface {
  // Fire an event whenever the Adharma Contingency is activated or exited.
  event AdharmaContingencyActivated(address controller, address beacon);
  event AdharmaContingencyExited(address controller, address beacon);

  // Store timestamp and last implementation in case of Adharma Contingency.
  // Note that this is specific to a particular controller and beacon.
  struct AdharmaContingency {
    bool armed;
    bool activated;
    uint256 activationTime;
  }

  function initiateUpgrade(
    address controller,
    address beacon,
    address implementation,
    uint256 extraTime
  ) external;

  function upgrade(
    address controller, address beacon, address implementation
  ) external;

  function agreeToAcceptOwnership(
    address controller, bool willAcceptOwnership
  ) external;

  function initiateTransferControllerOwnership(
    address controller, address newOwner, uint256 extraTime
  ) external;

  function transferControllerOwnership(
    address controller, address newOwner
  ) external;

  function heartbeat() external;

  function newHeartbeater(address heartbeater) external;

  function armAdharmaContingency(
    address controller, address beacon, bool armed
  ) external;

  function activateAdharmaContingency(
    address controller, address beacon
  ) external;

  function rollback(address controller, address beacon) external;

  function exitAdharmaContingency(
    address controller, address beacon, address implementation
  ) external;

  function heartbeatStatus() external view returns (
    bool expired, uint256 expirationTime
  );
}