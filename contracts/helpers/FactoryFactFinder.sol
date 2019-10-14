pragma solidity 0.5.11;

import "../../interfaces/DharmaSmartWalletFactoryV1Interface.sol";
import "../../interfaces/DharmaKeyRingFactoryV1Interface.sol";
import "../../interfaces/DharmaSmartWalletImplementationV0Interface.sol";


/**
 * @title FactoryFactFinder (staging)
 * @author 0age
 * @notice This contract facilitates determining information on counterfactual
 * deployment addresses, as well as current deployment statuses, of Dharma Smart
 * Wallet + Dharma Key Ring pairs.
 */
contract FactoryFactFinder {
  DharmaSmartWalletFactoryV1Interface private constant _smartWalletFactory = (
    DharmaSmartWalletFactoryV1Interface(
      0x8D1e00b000e56d5BcB006F3a008Ca6003b9F0033
    )
  );

  DharmaKeyRingFactoryV1Interface private constant _keyRingFactory = (
    DharmaKeyRingFactoryV1Interface(
      0x06f3342295530DdFF6182f7a40906FD60cd19100
    )
  );

  /**
   * @notice View function to find the address of the next key ring address that
   * will be deployed when supplying a given initial user signing key. Note that
   * a new value will be returned if a particular user signing key has been used
   * before.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @return The future address of the next key ring (with the user signing key
   * as its input) and of the next smart wallet (with the key ring address as
   * its input).
   */
  function getNextKeyRingAndSmartWallet(
    address userSigningKey
  ) external view returns (address keyRing, address smartWallet) {
    // Ensure that a user signing key has been provided.
    require(userSigningKey != address(0), "No user signing key supplied.");

    // Get the next key ring address based on the signing key.
    keyRing = _keyRingFactory.getNextKeyRing(userSigningKey);

    // Determine the next smart wallet address based on the key ring address.
    smartWallet = _smartWalletFactory.getNextSmartWallet(keyRing);
  }

  /**
   * @notice View function to determine whether a given smart wallet has been
   * deployed as well as whether the corresponding keyring contract still needs
   * to be deployed for the smart wallet.
   * @return Two booleans, indicating if the smart wallet and/or the keyring are
   * deployed or not, and the address of the keyring. Note that keyRing and
   * keyRingDeployed will always return the null address and false in the event
   * that the smart wallet has not been deployed yet.
   */
  function getDeploymentStatuses(
    address smartWallet
  ) external view returns (
    bool smartWalletDeployed,
    bool keyRingDeployed,
    address keyRing
  ) {
    // Ensure that a smart wallet address has been provided.
    require(smartWallet != address(0), "No smart wallet supplied.");

    // Determine if the smart wallet has been deployed.
    smartWalletDeployed = _hasContractCode(smartWallet);

    // Get keyring address and deployment status if smart wallet is deployed.
    if (smartWalletDeployed) {
      keyRing = DharmaSmartWalletImplementationV0Interface(
        smartWallet
      ).getUserSigningKey();

      keyRingDeployed = _hasContractCode(keyRing);
    }
  }

  /**
   * @notice View function for deriving the message hash that must be signed in
   * order to add a new key to a given key ring that has not yet been deployed
   * based on given parameters. Note that V0 does not include a prefix when
   * constructing the message hash.
   * @param keyRing address The yet-to-be-deployed keyring address.
   * @param additionalUserSigningKey address The additional user signing key to
   * add.
   * @return The message hash to sign.
   */
  function getFirstAdminActionHash(
    address keyRing, address additionalUserSigningKey
  ) external view returns (bytes32 hash) {
    hash = keccak256(
      abi.encodePacked(
        keyRing, uint256(0), uint256(0), uint160(additionalUserSigningKey)
      )
    );
  }

  /**
   * @notice View function to determine if a given account contains contract
   * code.
   * @return True if a contract is deployed at the address with code.
   */
  function hasContractCode(address target) external view returns (bool) {
    return _hasContractCode(target);
  }

  /**
   * @notice Internal view function to determine if a given account contains
   * contract code.
   * @return True if a contract is deployed at the address with code.
   */
  function _hasContractCode(address target) internal view returns (bool) {
    uint256 size;
    assembly { size := extcodesize(target) }
    return size > 0;
  }
}