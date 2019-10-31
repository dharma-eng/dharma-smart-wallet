pragma solidity 0.5.11;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "../helpers/TwoStepOwnable.sol";
import "../../interfaces/DharmaKeyRegistryInterface.sol";


/**
 * @title DharmaKeyRegistryV2
 * @author 0age
 * @notice The Dharma Key Registry is an owned contract that holds the public
 * user signing keys that will be used by the Dharma Smart Wallet. Each time a
 * particular Dharma Smart Wallet instance needs to validate a signature, it
 * will first retrieve the public address for the secondary signing key
 * associated with that wallet from the Dharma Key Registry. If a specific key
 * has not been set for that smart wallet, it will return the global public key.
 * Otherwise, it will return the specific signing key. Additional view functions
 * are also provided for retrieving public keys directly. Only the owner may
 * update these keys. Also, note that the V2 key registry includes an additional
 * mapping to track all global keys that have been used, and only allows a given
 * global key to be set one time.
 */
contract DharmaKeyRegistryV2 is TwoStepOwnable, DharmaKeyRegistryInterface {
  using ECDSA for bytes32;

  // The global public key serves as the default signing key.
  address private _globalKey;

  // Specific keys may also be set on a per-caller basis.
  mapping (address => address) private _specificKeys;

  // Maintain a mapping of all used keys (to prevent reuse).
  mapping (address => bool) private _usedKeys;

  /**
   * @notice In the constructor, set the initial global key and the initial
   * owner to tx.origin.
   */
  constructor() public {
    // Initially set the global key to the account of the transaction submitter.
    _registerGlobalKey(tx.origin);
  }

  /**
   * @notice Set a new global key. This method may only be called by the owner,
   * and a signature must also be provided in order to verify that the provided
   * global public key has a corresponding private key that can be used to sign
   * messages.
   * @param globalKey address The new global public key.
   * @param signature bytes A signature of a message hash containing the address
   * of this contract, the new global key, and a specific message, that must
   * resolve to the supplied global key.
   */
  function setGlobalKey(
    address globalKey, bytes calldata signature
  ) external onlyOwner {
    // Ensure that the provided global key is not the null address.
    require(globalKey != address(0), "A global key must be supplied.");

    // Message hash constructed according to EIP-191-0x45 to prevent replays.
    bytes32 messageHash = keccak256(
      abi.encodePacked(
        address(this),
        globalKey,
        "This signature demonstrates that the supplied signing key is valid."
      )
    );

    // Recover the signer of the message hash using the provided signature.
    address signer = messageHash.toEthSignedMessageHash().recover(signature);

    // Ensure that the provided signature resolves to the provided global key.
    require(globalKey == signer, "Invalid signature for supplied global key.");

    // Update global key to the provided global key and prevent future reuse.
    _registerGlobalKey(globalKey);
  }

  /**
   * @notice Set a new specific key for a particular account. This method may
   * only be called by the owner. Signatures are not required in order to make
   * setting specific keys more efficient at scale. Providing the null address
   * for the specific key will remove a specific key from the given account.
   * @param account address The account to set the new specific public key for.
   * @param specificKey address The new specific public key.
   */
  function setSpecificKey(
    address account, address specificKey
  ) external onlyOwner {
    // Ensure that the key has not been used previously.
    require(!_usedKeys[specificKey], "Key has been used previously.");

    // Emit an event signifying that the specific key has been modified.
    emit NewSpecificKey(account, _specificKeys[account], specificKey);

    // Update specific key for provided account to the provided specific key.
    _specificKeys[account] = specificKey;

    // Mark the key as having been used previously.
    _usedKeys[specificKey] = true;
  }

  /**
   * @notice Get the public key associated with the caller of this function. If
   * a specific key is set for the caller, it will be returned; otherwise, the
   * global key will be returned.
   * @return The public key to use for the caller.
   */
  function getKey() external view returns (address key) {
    // Retrieve the specific key, if any, for the caller.
    key = _specificKeys[msg.sender];

    // Fall back to the global key in the event that no specific key is set.
    if (key == address(0)) {
      key = _globalKey;
    }
  }

  /**
   * @notice Get the public key associated with a particular account. If a
   * specific key is set for the account, it will be returned; otherwise, the
   * global key will be returned.
   * @param account address The account to find the public key for.
   * @return The public key to use for the provided account.
   */
  function getKeyForUser(address account) external view returns (address key) {
    // Retrieve the specific key, if any, for the specified account.
    key = _specificKeys[account];

    // Fall back to the global key in the event that no specific key is set.
    if (key == address(0)) {
      key = _globalKey;
    }
  }

  /**
   * @notice Get the global public key.
   * @return The global public key.
   */
  function getGlobalKey() external view returns (address globalKey) {
    // Retrieve and return the global key.
    globalKey = _globalKey;
  }

  /**
   * @notice Get the specific public key associated with the supplied account.
   * The call will revert if a specific public key is not set for the account.
   * @param account address The account to find the specific public key for.
   * @return The specific public key set on the provided account, if one exists.
   */
  function getSpecificKey(
    address account
  ) external view returns (address specificKey) {
    // Retrieve the specific key, if any, for the account.
    specificKey = _specificKeys[account];

    // Revert in the event that there is no specific key set.
    require(
      specificKey != address(0),
      "No specific key set for the provided account."
    );
  }

  /**
   * @notice Internal function to set a new global key once contract ownership
   * and signature validity have both been checked, or during contract creation.
   * The provided global key must not have been used previously, and once set it
   * will be registered as having been used.
   * @param globalKey address The new global public key.
   */
  function _registerGlobalKey(address globalKey) internal {
    // Ensure that the key has not been used previously.
    require(!_usedKeys[globalKey], "Key has been used previously.");

    // Emit an event signifying that the global key has been modified.
    emit NewGlobalKey(_globalKey, globalKey);

    // Update the global key to the provided global key.
    _globalKey = globalKey;

    // Mark the key as having been used previously.
    _usedKeys[globalKey] = true;
  }
}