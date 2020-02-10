pragma solidity 0.5.11;


/**
 * @title SmartWalletRevertReasonHelperV1
 * @author 0age
 * @notice This contract takes revert reason "codes" and returns revert reason
 * strings for use in handling failures on the Dharma Smart Wallet.
 */
contract SmartWalletRevertReasonHelperV1 {
  /**
   * @notice Pure function to retrieve a revert reason string for a given code.
   * @param code uint256 The code for the revert reason.
   * @return A string with the revert reason.
   */
  function reason(uint256 code) external pure returns (string memory) {
    if (code == 0) return "Insufficient Dai supplied.";
    if (code == 1) return "No recipient supplied.";
    if (code == 2) return "Could not transfer Dai.";
    if (code == 3) return "Insufficient USDC supplied.";
    if (code == 4) return "Must supply a non-zero amount of Ether.";
    if (code == 5) return "Must supply an escape hatch account.";
    if (code == 6) return "No escape hatch is currently set for this smart wallet.";
    if (code == 7) return "Only the escape hatch account may call this function.";
    if (code == 8) return "Only the account recovery manager may call this function.";
    if (code == 9) return "cSai redeem failed.";
    if (code == 10) return "Dai approval failed.";
    if (code == 11) return "Must supply two 65-byte signatures.";
    if (code == 12) return "Verification failed - invalid user signature.";
    if (code == 13) return "Verification failed - invalid Dharma signature.";
    if (code == 14) return "No user signing key provided.";
    if (code == 15) return "Sai approval failed.";
    if (code == 16) return "Exchange rate cannot be below 1:1.";
    if (code == 17) return "DAI contract reverted on approval.";
    if (code == 18) return "Recipient rejected ether transfer.";
    if (code == 19) return "Invalid action - insufficient gas supplied by transaction submitter.";
    if (code == 20) return "Invalid action - invalid user signature.";
    if (code == 21) return "Invalid action - invalid Dharma signature.";
    if (code == 22) return "Invalid action - invalid signature.";
    if (code == 23) return "CToken approval failed.";
    if (code == 24) return "Failed to mint any dTokens using the cToken balance on this contract.";
    if (code == 25) return "External accounts or unapproved internal functions cannot call this.";
    if (code == 26) return "Invalid `to` parameter - must supply a contract address containing code.";
    if (code == 27) return "Invalid `to` parameter - cannot supply the address of this contract.";
    if (code == 28) return "Invalid `to` parameter - cannot supply the Dharma Escape Hatch Registry.";
    if (code == 29) return "Invalid custom action type.";
    if (code == 30) return "Insufficient data supplied.";
    return "(no revert reason)";
  }
}