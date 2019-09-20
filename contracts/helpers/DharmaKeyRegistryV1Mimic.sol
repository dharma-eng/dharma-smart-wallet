pragma solidity 0.5.11;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "../../interfaces/DharmaKeyRegistryInterface.sol";
import "../../interfaces/ERC1271.sol";


/**
 * @title DharmaKeyRegistryV1Mimic
 * @author 0age
 * @notice This contract will require that the provided signature resolves to
 * the key set for a smart wallet on the Dharma Key Registry when it is set as
 * the address of a user's signing key.
 */
contract DharmaKeyRegistryV1Mimic is ERC1271 {
  using ECDSA for bytes32;

  // The Dharma Key Registry holds a public key for verifying meta-transactions.
  DharmaKeyRegistryInterface internal constant _DHARMA_KEY_REGISTRY = (
    DharmaKeyRegistryInterface(0x000000005D7065eB9716a410070Ee62d51092C98)
  );

  // ERC-1271 must return this magic value when `isValidSignature` is called.
  bytes4 internal constant _ERC_1271_MAGIC_VALUE = bytes4(0x20c13b0b);

  function isValidSignature(
    bytes calldata data, bytes calldata signature
  ) external view returns (bytes4 magicValue) {
    (bytes32 hash, , ) = abi.decode(data, (bytes32, uint8, bytes));

    require(
      hash.recover(signature) == _DHARMA_KEY_REGISTRY.getKeyForUser(msg.sender),
      "Supplied signature does not resolve to the required signer."
    );

    magicValue = _ERC_1271_MAGIC_VALUE;
  }
}