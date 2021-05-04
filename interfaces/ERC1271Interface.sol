// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface ERC1271Interface {
  function isValidSignature(
    bytes calldata data, bytes calldata signature
  ) external view returns (bytes4 magicValue);
}
