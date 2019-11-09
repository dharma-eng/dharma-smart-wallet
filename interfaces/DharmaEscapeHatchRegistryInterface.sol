pragma solidity 0.5.11;


interface DharmaEscapeHatchRegistryInterface {
  // Fire an event when an escape hatch is set or removed.
  event EscapeHatchModified(
    address indexed smartWallet, address oldEscapeHatch, address newEscapeHatch
  );

  // Fire an event when an escape hatch is permanently disabled.
  event EscapeHatchDisabled(address smartWallet);

  // Store the escape hatch account, as well as a flag indicating if the escape
  // hatch has been disabled, for each smart wallet that elects to set one.
  struct EscapeHatch {
    address escapeHatch;
    bool disabled;
  }

  function setEscapeHatch(address newEscapeHatch) external;

  function removeEscapeHatch() external;

  function permanentlyDisableEscapeHatch() external;

  function getEscapeHatch() external view returns (
    bool exists, address escapeHatch
  );

  function getEscapeHatchForSmartWallet(
    address smartWallet
  ) external view returns (bool exists, address escapeHatch);

  function hasDisabledEscapeHatchForSmartWallet(
    address smartWallet
  ) external view returns (bool disabled);
}