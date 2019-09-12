pragma solidity 0.5.11;


interface ERC1271 {
  /**
   * @dev Should return whether the signature provided is valid for the provided data
   * @param data Arbitrary length data signed on the behalf of address(this)
   * @param signature Signature byte array associated with data
   *
   * MUST return the bytes4 magic value 0x20c13b0b when function passes.
   * MUST NOT modify state (using STATICCALL for solc < 0.5, view modifier for solc > 0.5)
   * MUST allow external calls
   */ 
  function isValidSignature(
    bytes calldata data, 
    bytes calldata signature
  ) external view returns (bytes4 magicValue);
}