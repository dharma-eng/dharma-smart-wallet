pragma solidity 0.5.11; // optimization runs: 200, evm version: petersburg

import "../../interfaces/DharmaSmartWalletFactoryV1Interface.sol";
import "../../interfaces/DharmaSmartWalletImplementationV0Interface.sol";


/**
 * A contract to update the user signing key on a smart wallet deployed or
 * counterfactually determined by a DharmaSmartWalletFactoryV1 contract, using
 * an existing smart wallet or deploying the smart wallet if necessary. Note
 * that this helper only supports V1 smart wallet factories - future versions
 * have similar functionality included directly, which improves reliability and
 * efficiency.
 */
contract SmartWalletFactoryV1UserSigningKeyUpdater {
  function updateUserSigningKey(
    address smartWallet,
    DharmaSmartWalletFactoryV1Interface smartWalletFactory,
    address currentUserSigningKey,
    address newUserSigningKey,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (
    DharmaSmartWalletImplementationV0Interface wallet
  ) {
    // Deploy a new smart wallet if needed. Factory emits a corresponding event.
    wallet = _deployNewSmartWalletIfNeeded(
      smartWalletFactory, currentUserSigningKey, smartWallet
    );

    // Set new user signing key. Smart wallet emits a corresponding event.
    wallet.setUserSigningKey(
      newUserSigningKey, minimumActionGas, userSignature, dharmaSignature
    );
  }

  function _deployNewSmartWalletIfNeeded(
    DharmaSmartWalletFactoryV1Interface smartWalletFactory,
    address userSigningKey,
    address expectedSmartWallet
  ) internal returns (
    DharmaSmartWalletImplementationV0Interface smartWallet
  ) {
    // Only deploy if a smart wallet doesn't already exist at expected address.
    uint256 size;
    assembly { size := extcodesize(expectedSmartWallet) }
    if (size == 0) {
      // Deploy the smart wallet.
      smartWallet = DharmaSmartWalletImplementationV0Interface(
        smartWalletFactory.newSmartWallet(userSigningKey)
      );
    } else {
      // Reuse the supplied smart wallet address. Note that this helper does
      // not perform an extcodehash check, meaning that a contract that is
      // not actually a smart wallet may be supplied instead.
      smartWallet = DharmaSmartWalletImplementationV0Interface(
        expectedSmartWallet
      );

      // Ensure that the smart wallet in question has the right key.
      require(
        smartWallet.getUserSigningKey() == userSigningKey,
        "Existing user signing key differs from supplied current signing key."
      );
    }
  }
}