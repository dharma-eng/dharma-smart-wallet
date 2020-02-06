pragma solidity 0.5.11;


interface ERC1271Interface {
  function isValidSignature(
    bytes calldata data, bytes calldata signature
  ) external view returns (bytes4 magicValue);
}