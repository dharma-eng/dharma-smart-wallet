pragma solidity 0.5.11;

import "..//helpers/ECDSAGroup.sol";
import "../../interfaces/DharmaKeyRingInterface.sol";
import "../../interfaces/ERC1271.sol";


/**
 * @title DharmaKeyRing
 * @author 0age
 * @notice The Dharma Key Ring is a proof-of-concept for a smart contract that
 * implements ERC-1271 and can be used in place of an externally-owned account
 * for the user signing key on the Dharma Smart Wallet V1+ to support multiple
 * user signing keys. It distinguishes between Admin keys, which are used to
 * modify sigining keys that are set on the key ring or to set a new signing key
 * for the user on the smart wallet, and Executor keys, which are used when
 * calling isValidSignature from the smart wallet in order to validate all other
 * smart wallet actions.
 * @dev There are multiple enhancements that can be made to this POC from here,
 * including (but not limited to):
 *   - Adding events for adding or removing keys and modifying thresholds
 *   - Iterating over all keys that have been set on the keyring
 *   - Allowing for other smart contracts to be specified as signers
 *   - Allowing for keys that have a more restrictive set of permissions
 */
contract DharmaKeyRing is DharmaKeyRingInterface, ERC1271 {
  using ECDSAGroup for bytes32;

  // isAdmin => KeyGroup
  mapping(bool => KeyGroup) private _keyGroups;

  // isAdmin => keys => isKey
  mapping(bool => mapping (uint160 => bool)) private _keys;

  // Track a nonce for the keyring so that admin actions cannot be replayed.
  uint256 private _nonce;

  // ERC-1271 must return this magic value when `isValidSignature` is called.
  bytes4 internal constant _ERC_1271_MAGIC_VALUE = bytes4(0x20c13b0b);

  constructor(
    uint128 adminThreshold,
    uint128 executorThreshold,
    address[] memory adminKeys,
    address[] memory executorKeys
  ) public {
    require(
      adminThreshold >= uint128(adminKeys.length),
      "Admin threshold cannot be less than the total supplied admin keys."
    );
    require(
      executorThreshold >= uint128(executorKeys.length),
      "Executor threshold cannot be less than the total supplied executor keys."
    );

    _keyGroups[true] = KeyGroup({
      count: uint128(adminKeys.length),
      threshold: adminThreshold
    });
    _keyGroups[false] = KeyGroup({
      count: uint128(executorKeys.length),
      threshold: executorThreshold
    });

    for (uint256 i = 0; i < adminKeys.length; i++) {
      require(
        !_keys[true][uint160(adminKeys[i])],
        "Cannot supply duplicate admin keys."
      );
      _keys[true][uint160(adminKeys[i])] = true;
    }

    for (uint256 i = 0; i < executorKeys.length; i++) {
      require(
        !_keys[false][uint160(executorKeys[i])],
        "Cannot supply duplicate executor keys."
      );
      _keys[false][uint160(executorKeys[i])] = true;
    }
  }

  function takeAdminAction(
    AdminActionType adminActionType, uint160 argument, bytes calldata signatures
  ) external {
    _verifyOrderedSignatures(
      true, _getHash(adminActionType, argument), signatures
    );

    uint8 adminActionTypeIndex = uint8(adminActionType);
    uint8 adminActionCategory = adminActionTypeIndex % 3;
    bool admin = adminActionTypeIndex > 2;
    KeyGroup storage keyGroup = _keyGroups[admin];

    if (adminActionCategory == 0) { // AddKey or AddAdminKey
      require(!_keys[admin][argument], "Key already exists.");

      keyGroup.count++;
      _keys[admin][argument] = true;
    } else if (adminActionCategory == 1) { // RemoveKey or RemoveAdminKey
      require(_keys[admin][argument], "Key does not exist.");
      
      require(
        keyGroup.threshold > keyGroup.count,
        "Cannot reduce number of keys below required threshold."
      );
      
      keyGroup.count--;
      delete _keys[admin][argument];
    } else if (adminActionCategory == 2) { // SetThreshold or SetAdminThreshold
      uint128 threshold = uint128(argument);
      
      require(
        threshold >= keyGroup.count,
        "Cannot reduce threshold below current number of keys for the group."
      );
      
      keyGroup.threshold = threshold;
    }

    _nonce++;
  }

  function isValidSignature(
    bytes calldata data, bytes calldata signatures
  ) external view returns (bytes4 magicValue) {
    (bytes32 hash, uint8 action, ) = abi.decode(data, (bytes32, uint8, bytes));

    // Calling setUserSigningKey (ActionType 1) requires admin signatures.
    _verifyOrderedSignatures(action == 1, hash, signatures);

    magicValue = _ERC_1271_MAGIC_VALUE;
  }

  function getAdminActionID(
    AdminActionType adminActionType, uint160 argument
  ) external view returns (bytes32 adminActionID) {
    adminActionID = _getHash(adminActionType, argument);
  }

  function _getHash(
    AdminActionType adminActionType, uint160 argument
  ) internal view returns (bytes32 hash) {
    hash = keccak256(
      abi.encodePacked(address(this), _nonce, adminActionType, argument)
    );
  }

  function _verifyOrderedSignatures(
    bool admin, bytes32 hash, bytes memory signatures
  ) internal view {
    KeyGroup memory keyGroup = _keyGroups[admin];

    uint160[] memory signers = hash.recoverGroup(signatures);
    
    require(
      signers.length >= keyGroup.threshold,
      "Supplied number of signatures does not meet the required threshold."
    );
    
    uint160 lastSigner = 0;
    for (uint256 i = 0; i < signers.length; i++) {
      uint160 signer = signers[i];
      require(_keys[admin][signer], "Supplied signature has no valid signer.");
      require(signer > lastSigner, "Invalid signature ordering.");
      lastSigner = signer;
    }
  }
}