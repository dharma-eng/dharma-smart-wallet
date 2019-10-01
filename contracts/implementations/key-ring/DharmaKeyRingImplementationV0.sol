pragma solidity 0.5.11;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "../../../interfaces/DharmaKeyRingImplementationV0Interface.sol";
import "../../../interfaces/ERC1271.sol";


/**
 * @title DharmaKeyRingImplementationV0
 * @author 0age
 * @notice The Dharma Key Ring is a smart contract that implements ERC-1271 and
 * can be used in place of an externally-owned account for the user signing key
 * on the Dharma Smart Wallet to support multiple user signing keys. For this V0
 * implementation, new Dual keys (standard + admin) can be added, but cannot be
 * removed, and the action threshold is fixed at one. Upgrades are managed by an
 * upgrade beacon, similar to the one utilized by the Dharma Smart Wallet.
 */
contract DharmaKeyRingImplementationV0 is
  DharmaKeyRingImplementationV0Interface,
  ERC1271 {
  using ECDSA for bytes32;
  // WARNING: DO NOT REMOVE OR REORDER STORAGE WHEN WRITING NEW IMPLEMENTATIONS!

  // Track all keys as an address (as uint160) => key type mapping in slot zero.
  mapping (uint160 => KeyType) private _keys;

  // Track the nonce in slot 1 so that actions cannot be replayed. Note that
  // proper nonce management must be managed by the implementing contract when
  // using `isValidSignature`, as it is a static method and cannot change state.
  uint256 private _nonce;

  // Track the total number of standard and admin keys in storage slot 2.
  AdditionalKeyCount private _additionalKeyCounts;

  // Track the required threshold standard and admin actions in storage slot 3.
  // AdditionalThreshold private _additionalThresholds;

  // END STORAGE DECLARATIONS - DO NOT REMOVE OR REORDER STORAGE ABOVE HERE!

  // The key ring version will be used when constructing valid signatures.
  uint256 internal constant _DHARMA_KEY_RING_VERSION = 0;

  // ERC-1271 must return this magic value when `isValidSignature` is called.
  bytes4 internal constant _ERC_1271_MAGIC_VALUE = bytes4(0x20c13b0b);

  function initialize(
    uint128 adminThreshold,
    uint128 executorThreshold,
    address[] calldata keys,
    uint8[] calldata keyTypes // must all be 3 (Dual) for V0
  ) external {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    require(keys.length == 1, "Must supply exactly one key in V0.");

    require(keys[0] != address(0), "Cannot supply the null address as a key.");

    require(
      keyTypes.length == 1 && keyTypes[0] == uint8(3),
      "Must supply exactly one Dual keyType (3) in V0."
    );

    require(adminThreshold == 1, "Admin threshold must be exactly one in V0.");

    require(
      executorThreshold == 1, "Executor threshold must be exactly one in V0."
    );

    _keys[uint160(keys[0])] = KeyType.Dual;

    emit KeyModified(keys[0], true, true);

    // Note: skip additional key counts + thresholds setup in V0 (only one key).
  }

  function takeAdminAction(
    AdminActionType adminActionType, uint160 argument, bytes calldata signatures
  ) external {
    // Only Admin Action Type 6 (AddDualKey) is supported in V0.
    require(
      adminActionType == AdminActionType.AddDualKey,
      "Only adding new Dual key types (admin action type 6) is supported in V0."
    );

    require(argument != uint160(0), "Cannot supply the null address as a key.");

    require(_keys[argument] == KeyType.None, "Key already exists.");

    _verifyOrderedSignatures(_getAdminActionHash(argument), signatures);

    _additionalKeyCounts.standard++;
    _additionalKeyCounts.admin++;

    _keys[argument] = KeyType.Dual;

    emit KeyModified(address(argument), true, true);

    _nonce++;
  }

  function isValidSignature(
    bytes calldata data, bytes calldata signatures
  ) external view returns (bytes4 magicValue) {
    (bytes32 hash, , ) = abi.decode(data, (bytes32, uint8, bytes));

    _verifyOrderedSignatures(hash, signatures);

    magicValue = _ERC_1271_MAGIC_VALUE;
  }

  function getAdminActionID(
    AdminActionType adminActionType, uint160 argument
  ) external view returns (bytes32 adminActionID) {
    adminActionType;
    adminActionID = _getAdminActionHash(argument);
  }

  /**
   * @notice Pure function for getting the current Dharma Key Ring version.
   * @return The current Dharma Key Ring version.
   */
  function getVersion() external pure returns (uint256 version) {
    version = _DHARMA_KEY_RING_VERSION;
  }

  function _getAdminActionHash(
    uint160 argument
  ) internal view returns (bytes32 hash) {
    hash = keccak256(
      abi.encodePacked(
        address(this), _DHARMA_KEY_RING_VERSION, _nonce, argument
      )
    );
  }

  function _verifyOrderedSignatures(
    bytes32 hash, bytes memory signature
  ) internal view {   
    require(
      _keys[uint160(hash.recover(signature))] == KeyType.Dual,
      "Supplied signature does not have a signer with the required key type."
    );
  }
}