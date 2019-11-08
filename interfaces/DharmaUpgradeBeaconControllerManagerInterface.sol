pragma solidity 0.5.11;


interface DharmaUpgradeBeaconControllerManagerInterface {
  // Fire an event whenever the Adharma Contingency is activated or exited.
  event AdharmaContingencyActivated();
  event AdharmaContingencyExited();

  // Store timestamp and last implementation in case of Adharma Contingency.
  struct AdharmaContingency {
    bool armed;
    bool activated;
    uint256 activationTime;
  }

  // Store all prior implementations and allow for blocking rollbacks to them.
  struct PriorImplementation {
    address implementation;
    bool rollbackBlocked;
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

  function agreeToAcceptControllerOwnership(
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

  function armAdharmaContingency(bool armed) external;

  function activateAdharmaContingency() external;

  function rollback(address controller, address beacon, uint256 index) external;

  function blockRollback(
    address controller, address beacon, uint256 index
  ) external;

  function exitAdharmaContingency(
    address smartWalletImplementation, address keyRingImpmementation
  ) external;

  function getTotalPriorImplementations(
    address controller, address beacon
  ) external view returns (uint256 totalPriorImplementations);

  function getPriorImplementation(
    address controller, address beacon, uint256 index
  ) external view returns (address priorImplementation, bool rollbackAllowed);

  function heartbeatStatus() external view returns (
    bool expired, uint256 expirationTime
  );
}