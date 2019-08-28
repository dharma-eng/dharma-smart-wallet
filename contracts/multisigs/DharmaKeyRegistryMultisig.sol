pragma solidity 0.5.11;

import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";


/**
 * @title DharmaKeyRegistryMultisig
 * @notice This contract is an example of a multisig that will control the
 * Dharma Key Registry. Upgrades to the Dharma Key Registry will be controlled
 * by the Dharma Upgrade Multisig.
 */
contract DharmaKeyRegistryMultisig is GnosisSafe {
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