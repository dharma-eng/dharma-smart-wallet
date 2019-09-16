pragma solidity 0.5.11;


library ECDSAGroup {
  /**
   * @dev Returns each address that signed a hashed message (`hash`) from a
   * collection of `signatures`.
   *
   * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
   * this function rejects them by requiring the `s` value to be in the lower
   * half order, and the `v` value to be either 27 or 28.
   *
   * NOTE: This call _does not revert_ if a signature is invalid, or if the
   * signer is otherwise unable to be retrieved. In those scenarios, the zero
   * address is returned for that signature.
   *
   * IMPORTANT: `hash` _must_ be the result of a hash operation for the
   * verification to be secure: it is possible to craft signatures that recover
   * to arbitrary addresses for non-hashed data.
   */
  function recoverGroup(
    bytes32 hash,
    bytes memory signatures
  ) internal pure returns (uint160[] memory signers) {
    // Ensure that the signatures length is a multiple of 65.
    if (signatures.length % 65 != 0) {
      return new uint160[](0);
    }

    // Create an appropriately-sized array of addresses for each signer.
    signers = new uint160[](signatures.length / 65);

    // Get each signature location and divide into r, s and v variables.
    bytes32 signatureLocation;
    bytes32 r;
    bytes32 s;
    uint8 v;

    for (uint256 i = 0; i < signers.length; i++) {
      assembly {
        signatureLocation := add(signatures, mul(i, 65))
        r := mload(add(signatureLocation, 0x20))
        s := mload(add(signatureLocation, 0x40))
        v := byte(0, mload(add(signatureLocation, 0x60)))
      }

      // EIP-2 still allows signature malleability for ecrecover(). Remove
      // this possibility and make the signature unique. 
      if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
        continue;
      }

      if (v != 27 && v != 28) {
        continue;
      }

      // If signature is valid & not malleable, add signer address as uint160.
      signers[i] = uint160(ecrecover(hash, v, r, s));
    }
  }
}