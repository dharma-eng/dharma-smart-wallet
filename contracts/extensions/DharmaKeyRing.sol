pragma solidity 0.5.11;

import "../helpers/ECDSAGroup.sol";
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

  AdditionalKeyCount private _additionalKeyCounts;

  AdditionalThreshold private _additionalThresholds;

  mapping (uint160 => KeyType) private _keys;

  // Track a nonce for the keyring so that admin actions cannot be replayed.
  uint256 private _nonce;

  // ERC-1271 must return this magic value when `isValidSignature` is called.
  bytes4 internal constant _ERC_1271_MAGIC_VALUE = bytes4(0x20c13b0b);

  constructor(
    uint128 adminThreshold,
    uint128 executorThreshold,
    address[] memory keys,
    uint8[] memory keyTypes // 1: standard, 2: admin, 3: dual
  ) public {
    uint128 adminKeys;
    uint128 executorKeys;

    require(keys.length > 0, "Must supply at least one key.");

    require(adminThreshold > 0, "Admin threshold cannot be zero.");

    require(executorThreshold > 0, "Executor threshold cannot be zero.");

    require(
      keys.length == keyTypes.length,
      "Length of keys array and keyTypes arrays must be the same."
    );

    for (uint256 i = 0; i < keys.length; i++) {
      require(
        _keys[uint160(keys[i])] == KeyType.None,
        "Cannot supply duplicate keys."
      );

      KeyType keyType = KeyType(keyTypes[i]);

      _keys[uint160(keys[i])] = keyType;

      if (keyType == KeyType.Standard || keyType == KeyType.Dual) {
        executorKeys++;
      }

      if (keyType == KeyType.Admin || keyType == KeyType.Dual) {
        adminKeys++;
      }
    }

    require(adminKeys > 0, "Must supply at least one admin key.");

    require(executorKeys > 0, "Must supply at least one executor key.");

    require(
      adminThreshold >= adminKeys,
      "Admin threshold cannot be less than the total supplied admin keys."
    );

    require(
      executorThreshold >= executorKeys,
      "Executor threshold cannot be less than the total supplied executor keys."
    );

    if (adminKeys > 1 || executorKeys > 1) {
      _additionalKeyCounts = AdditionalKeyCount({
        standard: executorKeys - 1,
        admin: adminKeys - 1
      });
    }

    if (adminThreshold > 1 || executorThreshold > 1) {
      _additionalThresholds = AdditionalThreshold({
        standard: executorThreshold - 1,
        admin: adminThreshold - 1
      });
    }
  }

  function takeAdminAction(
    AdminActionType adminActionType, uint160 argument, bytes calldata signatures
  ) external {
    _verifyOrderedSignatures(
      KeyType.Admin, _getAdminActionHash(adminActionType, argument), signatures
    );

    uint8 adminActionCategory = uint8(adminActionType) % 3;
    uint8 adminActionKeyCategory = uint8(adminActionType) / 3 + 1;
    bool isStandard = adminActionKeyCategory != 2;
    bool isAdmin = adminActionKeyCategory != 1;

    if (adminActionCategory == 0) { // Add
      require(_keys[argument] == KeyType.None, "Key already exists.");

      _additionalKeyCounts = AdditionalKeyCount({
        standard: _additionalKeyCounts.standard + (isStandard ? 1 : 0),
        admin: _additionalKeyCounts.admin + (isAdmin ? 1 : 0)
      });

      _keys[argument] = KeyType(adminActionKeyCategory);
    } else if (adminActionCategory == 1) { // Remove
      require(_keys[argument] != KeyType.None, "Key does not exist.");
      
      if (isStandard) {
        require(
          _additionalThresholds.standard > _additionalKeyCounts.standard,
          "Cannot reduce number of standard keys below required threshold."
        );
      }

      if (isAdmin) {
        require(
          _additionalThresholds.admin > _additionalKeyCounts.admin,
          "Cannot reduce number of admin keys below required threshold."
        );
      }

      _additionalKeyCounts = AdditionalKeyCount({
        standard: _additionalKeyCounts.standard - (isStandard ? 1 : 0),
        admin: _additionalKeyCounts.admin - (isAdmin ? 1 : 0)
      });
      
      KeyType currentKeyType = _keys[argument];
      if (
        adminActionKeyCategory == 3 ||
        currentKeyType == KeyType(adminActionKeyCategory)
      ) {
        delete _keys[argument];
      } else if (currentKeyType == KeyType.Dual) {
        _keys[argument] = KeyType(isStandard ? 2 : 1);
      } else {
        revert("Supplied key type is not currently set.");
      }

    } else if (adminActionCategory == 2) { // SetThreshold
      uint128 threshold = uint128(argument);
      require(threshold > 0, "Cannot reduce threshold to zero.");
      threshold--;

      if (isStandard) {
        require(
          threshold <= _additionalKeyCounts.standard,
          "Cannot increase standard threshold above number of standard keys."
        );
      }

      if (isAdmin) {
        require(
          threshold <= _additionalKeyCounts.admin,
          "Cannot increase admin threshold above number of admin keys."
        );
      }
      
      _additionalThresholds = AdditionalThreshold({
        standard: isStandard ? threshold : _additionalThresholds.standard,
        admin: isAdmin ? threshold : _additionalThresholds.admin
      });
    }

    _nonce++;
  }

  function takeAction(
    address payable to, uint256 value, bytes calldata data, bytes calldata signatures
  ) external returns (bool ok, bytes memory returnData) {
    // admin-only: 0x44f62b3c => setUserSigningKey(address,uint256,bytes,bytes)
    _verifyOrderedSignatures(
      (
        (
          data.length >= 4 &&
          data[0] == byte(0x44) &&
          data[1] == byte(0xf6) &&
          data[2] == byte(0x2b) &&
          data[3] == byte(0x3c)
        )
        ? KeyType.Admin
        : KeyType.Standard
      ),
      _getStandardActionHash(to, value, data),
      signatures
    );

    _nonce++;

    (ok, returnData) = to.call.value(value)(data);
  }

  function isValidSignature(
    bytes calldata data, bytes calldata signatures
  ) external view returns (bytes4 magicValue) {
    (bytes32 hash, uint8 action, ) = abi.decode(data, (bytes32, uint8, bytes));

    // Calling setUserSigningKey (ActionType 1) requires admin signatures.
    _verifyOrderedSignatures(
      action != 1 ? KeyType.Standard : KeyType.Admin,
      hash,
      signatures
    );

    magicValue = _ERC_1271_MAGIC_VALUE;
  }

  function getActionID(
    address payable to, uint256 value, bytes calldata data
  ) external view returns (bytes32 actionID) {
    actionID = _getStandardActionHash(to, value, data);
  }

  function getAdminActionID(
    AdminActionType adminActionType, uint160 argument
  ) external view returns (bytes32 adminActionID) {
    adminActionID = _getAdminActionHash(adminActionType, argument);
  }

  function _getStandardActionHash(
    address payable to, uint256 value, bytes memory data
  ) internal view returns (bytes32 hash) {
    hash = keccak256(
      abi.encodePacked(
        address(this), _nonce, KeyType.Standard, to, value, data
      )
    );
  }

  function _getAdminActionHash(
    AdminActionType adminActionType, uint160 argument
  ) internal view returns (bytes32 hash) {
    hash = keccak256(
      abi.encodePacked(
        address(this), _nonce, KeyType.Admin, adminActionType, argument
      )
    );
  }

  function _verifyOrderedSignatures(
    KeyType requiredKeyType, bytes32 hash, bytes memory signatures
  ) internal view {
    uint160[] memory signers = hash.recoverGroup(signatures);
    
    uint256 threshold = (
      requiredKeyType == KeyType.Standard
        ? uint256(_additionalThresholds.standard)
        : uint256(_additionalThresholds.admin)
    ) + 1;

    require(
      signers.length >= threshold,
      "Supplied number of signatures does not meet the required threshold."
    );
    
    uint160 lastSigner = 0;
    for (uint256 i = 0; i < signers.length; i++) {
      uint160 signer = signers[i];
      KeyType keyType = _keys[signer];
      require(
        keyType == KeyType.Dual || keyType == requiredKeyType,
        "Supplied signature does not have a signer with the required key type."
      );
      require(signer > lastSigner, "Invalid signature ordering.");
      lastSigner = signer;
    }
  }
}