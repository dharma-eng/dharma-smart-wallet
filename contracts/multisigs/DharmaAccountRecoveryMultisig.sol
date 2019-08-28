pragma solidity 0.5.11;

import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";


/**
 * @title DharmaAccountRecoveryMultisig
 * @notice This contract is an example of a multisig that will control account
 * recovery on the initial implentation of Dharma smart wallets.
 */
contract DharmaAccountRecoveryMultisig is GnosisSafe {
  constructor(address[] memory owners, uint256 threshold) public {
    domainSeparator = keccak256(
      abi.encode(
        DOMAIN_SEPARATOR_TYPEHASH,
        address(this)
      )
    );
    setupSafe(owners, threshold, address(0), "");
  }
}