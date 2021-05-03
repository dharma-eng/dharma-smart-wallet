pragma solidity 0.5.17;


interface DharmaSmartWalletImplementationV4Interface {
  event Escaped();

  function setEscapeHatch(
    address account,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external;

  function removeEscapeHatch(
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external;

  function permanentlyDisableEscapeHatch(
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external;

  function escape() external;
}
