pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;


contract RelayContractInterface {
  // A struct representation of a signature.
  struct ECDSASignature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  // A struct representing the parameters required for to execute a transaction.
  struct transactionParameters {
    address to;
    bytes data;
    uint value;
    ECDSASignature signature;
    address signer;
    uint nonce;
  }

  function getHash(
    address to, bytes calldata data, uint256 value, uint256 nonce
  ) external view returns (bytes32 prefixedHash);

  function executeTransactions(
    transactionParameters[] memory transactions
  ) public;
}
