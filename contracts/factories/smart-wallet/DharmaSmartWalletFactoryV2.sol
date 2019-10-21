pragma solidity 0.5.11;

import "../../proxies/smart-wallet/UpgradeBeaconProxyV1.sol";
import "../../../interfaces/DharmaSmartWalletFactoryV2Interface.sol";
import "../../../interfaces/DharmaSmartWalletImplementationV0Interface.sol";
import "../../../interfaces/DharmaKeyRegistryInterface.sol";


/**
 * @title DharmaSmartWalletFactoryV2
 * @author 0age
 * @notice This contract deploys new Dharma Smart Wallet instances as "Upgrade
 * Beacon" proxies that reference a shared implementation contract specified by
 * the Dharma Upgrade Beacon contract. It prevents operations from or being
 * applied to the wrong smart wallet if another caller frontruns them by
 * passing the target deployment address as an additional argument and checking
 * for existence of a smart wallet contract at that address. It builds upon V1
 * by including functions for setting new user signing key or cancelling a
 * signed transaction upon deployment, as well as for getting an actionID prior
 * to deployment of the smart wallet.
 */
contract DharmaSmartWalletFactoryV2 is DharmaSmartWalletFactoryV2Interface {
  // Use DharmaSmartWallet initialize selector for initialization calldata.
  bytes4 private constant _INITIALIZE_SELECTOR = bytes4(0x30fc201f);

  // The smart wallet upgrade beacon is used to get the current version.
  address private constant _SMART_WALLET_UPGRADE_BEACON = address(
    0x000000000026750c571ce882B17016557279ADaa
  );

  // DharmaKeyRegistryV2 holds a public key for verifying meta-transactions.
  DharmaKeyRegistryInterface internal constant _DHARMA_KEY_REGISTRY = (
    DharmaKeyRegistryInterface(0x5a74865419815411f00A81956A6010FA7c454d5E)
  );

  // Use the smart wallet instance runtime code hash to verify expected targets.
  bytes32 private constant _SMART_WALLET_INSTANCE_RUNTIME_HASH = bytes32(
    0xe25d4f154acb2394ee6c18d64fb5635959ba063d57f83091ec9cf34be16224d7
  );

  /**
   * @notice In the constructor, ensure that the initialize selector constant
   * and smart wallet instance runtime code hash are both correct.
   */
  constructor() public {
    DharmaSmartWalletImplementationV0Interface initializer;
    require(
      initializer.initialize.selector == _INITIALIZE_SELECTOR,
      "Incorrect initializer selector supplied."
    );

    require(
      _SMART_WALLET_INSTANCE_RUNTIME_HASH == keccak256(
        type(UpgradeBeaconProxyV1).runtimeCode
      ),
      "Incorrect smart wallet runtime code hash supplied."
    );
  }

  /**
   * @notice Deploy a new smart wallet address using the provided user signing
   * key.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @param targetSmartWallet address The expected counterfactual address of the
   * new smart wallet - if a smart wallet contract is already deployed to this
   * address, the deployment step will be skipped (supply the null address for
   * this argument to force a deployment of a new smart wallet).
   * @return The address of the new smart wallet.
   */
  function newSmartWallet(
    address userSigningKey, address targetSmartWallet
  ) external returns (address wallet) {
    // Deploy a new smart wallet if needed and emit a corresponding event.
    wallet = _deployNewSmartWalletIfNeeded(userSigningKey, targetSmartWallet);
  }

  /**
   * @notice Deploy a new smart wallet address using the provided user signing
   * key and immediately set a new user signing key on the new smart wallet. If
   * the existing signing address is a key ring, be sure that it has been
   * deployed before calling this function.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @param targetSmartWallet address The expected counterfactual address of the
   * new smart wallet - if a smart wallet contract is already deployed to this
   * address, the deployment step will be skipped and the supplied address will
   * be used for all subsequent steps.
   * @param newUserSigningKey address The new user signing key to set on the new
   * smart wallet.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to the call to the new smart wallet - be aware that additional gas
   * must still be included to account for the cost of overhead incurred up
   * until the start of the function call to the smart wallet.
   * @param userSignature bytes A signature that resolves to `userSigningKey`.
   * If the user signing key is not a contract, ecrecover will be used;
   * otherwise, ERC1271 will be used. A unique hash returned from
   * `getFirstCustomActionID` is prefixed and hashed to create the message hash
   * for the signature.
   * @param dharmaSignature bytes A signature that resolves to the public key
   * returned for the smart wallet from the Dharma Key Registry. A unique hash
   * returned from `getFirstCustomActionID` is prefixed and hashed to create the
   * signed message.
   * @return The address of the new smart wallet.
   */
  function newSmartWalletAndNewUserSigningKey(
    address userSigningKey,
    address targetSmartWallet,
    address newUserSigningKey,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address wallet) {
    // Deploy a new smart wallet if needed and emit a corresponding event.
    wallet = _deployNewSmartWalletIfNeeded(userSigningKey, targetSmartWallet);

    // Set the new user signing key on the newly-deployed smart wallet.
    DharmaSmartWalletImplementationV0Interface(wallet).setUserSigningKey(
      newUserSigningKey, minimumActionGas, userSignature, dharmaSignature
    );
  }

  /**
   * @notice Deploy a new smart wallet address using the provided user signing
   * key and immediately increment the nonce, cancelling any outstanding actions
   * by invalidating their signatures. Note that this only cancels actions that
   * depend on a nonce of zero.  If the existing signing address is a key ring,
   * be sure that it has been deployed before calling this function.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @param targetSmartWallet address The expected counterfactual address of the
   * new smart wallet - if a smart wallet contract is already deployed to this
   * address, the deployment step will be skipped and the supplied address will
   * be used for all subsequent steps.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to the call to the new smart wallet - be aware that additional gas
   * must still be included to account for the cost of overhead incurred up
   * until the start of the function call to the smart wallet.
   * @param signature bytes A signature that resolves to either `userSigningKey`
   * or the public key returned for the smart wallet from the Dharma Key
   * Registry. A unique hash returned from `getFirstCustomActionID` is prefixed
   * and hashed to create the signed message.
   * @return The address of the new smart wallet.
   */
  function newSmartWalletAndCancel(
    address userSigningKey,
    address targetSmartWallet,
    uint256 minimumActionGas,
    bytes calldata signature
  ) external returns (address wallet) {
    // Deploy a new smart wallet if needed and emit a corresponding event.
    wallet = _deployNewSmartWalletIfNeeded(userSigningKey, targetSmartWallet);

    // Increment the nonce on the newly-deployed smart wallet.
    DharmaSmartWalletImplementationV0Interface(wallet).cancel(
      minimumActionGas, signature
    );
  }

  /**
   * @notice View function to find the address of the next smart wallet address
   * that will be deployed for a given user signing key. Note that a new value
   * will be returned if a particular user signing key has been used before.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @return The future address of the next smart wallet.
   */
  function getNextSmartWallet(
    address userSigningKey
  ) external view returns (address wallet) {
    // Get initialization calldata from initialize selector & user signing key.
    bytes memory initializationCalldata = abi.encodeWithSelector(
      _INITIALIZE_SELECTOR, userSigningKey
    );

    // Determine the user's smart wallet address based on the user signing key.
    wallet = _computeNextAddress(initializationCalldata);
  }

  /**
   * @notice View function for deriving the actionID that must be signed in
   * order to perform a custom action for a smart wallet that has not yet been
   * deployed based on given parameters.
   * @param userSigningKey address The user signing key that will be supplied as
   * a constructor argument when deploying the smart wallet.
   * @param smartWallet address The yet-to-be-deployed smart wallet address.
   * @param action uint8 The type of action, designated by it's index. Valid
   * actions in V3 include Cancel (0), SetUserSigningKey (1), Generic (2),
   * GenericAtomicBatch (3), DAIWithdrawal (4), USDCWithdrawal (5), and
   * ETHWithdrawal (6).
   * @param amount uint256 The amount to withdraw for Withdrawal actions, or 0
   * for other action types.
   * @param recipient address The account to transfer withdrawn funds to, the
   * new user signing key, or the null address for cancelling.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to the call to the smart wallet - be aware that additional gas
   * must still be included to account for the cost of overhead incurred up
   * until the start of the call to the smart wallet.
   * @return The action ID, which will need to be prefixed, hashed and signed in
   * order to construct a valid signature.
   */
  function getFirstSmartWalletCustomActionID(
    address userSigningKey,
    address smartWallet,
    DharmaSmartWalletImplementationV0Interface.ActionType action,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID) {
    // Determine the actionID - this serves as a signature hash for an action.
    if (
      action == DharmaSmartWalletImplementationV0Interface.ActionType.Cancel
    ) {
      // actionID is constructed according to EIP-191-0x45 to prevent replays.
      actionID = keccak256(
        abi.encodePacked(
          smartWallet,
          _getSmartWalletVersion(),
          userSigningKey,
          _getDharmaSigningKey(smartWallet),
          uint256(0),
          minimumActionGas,
          action
        )
      );
    } else {
      // actionID is constructed according to EIP-191-0x45 to prevent replays.
      actionID = keccak256(
        abi.encodePacked(
          smartWallet,
          _getSmartWalletVersion(),
          userSigningKey,
          _getDharmaSigningKey(smartWallet),
          uint256(0),
          minimumActionGas,
          action,
          abi.encode(amount, recipient)
        )
      );
    }
  }

  /**
   * @notice Internal function to deploy a new smart wallet if needed using the
   * provided user signing key. The expected smart wallet address is supplied as
   * an argument, and if a contract is already deployed to that address then the
   * deployment will be skipped and the supplied address will be returned.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument during deployment.
   * @param expectedSmartWallet address The intended address of the smart
   * wallet. If a smart wallet is already deployed to that address, this
   * function will do nothing (except return this address), but if it is not, it
   * will determine whether the next smart wallet with the given user signing
   * key will be deployed to this address and deploy it if there is a match.
   * Otherwise, it will revert before attempting to deploy. Passing the null
   * address will deploy a smart wallet to whatever address is available.
   * @return The address of the new smart wallet, or of the supplied smart
   * wallet if one already exists at the supplied address.
   */
  function _deployNewSmartWalletIfNeeded(
    address userSigningKey, address expectedSmartWallet
  ) internal returns (address smartWallet) {
    // Only deploy if a smart wallet doesn't already exist at expected address.
    bytes32 hash;
    assembly { hash := extcodehash(expectedSmartWallet) }
    if (hash != _SMART_WALLET_INSTANCE_RUNTIME_HASH) {
      // Get initialization calldata using the initial user signing key.
      bytes memory initializationCalldata = abi.encodeWithSelector(
        _INITIALIZE_SELECTOR, userSigningKey
      );

      // Place creation code & constructor args of new proxy instance in memory.
      bytes memory initCode = abi.encodePacked(
        type(UpgradeBeaconProxyV1).creationCode,
        abi.encode(initializationCalldata)
      );

      // Get salt and deployment address using the supplied initialization code.
      (uint256 salt, address target) = _getSaltAndTarget(initCode);

      // Only require that target matches an expected target if one is supplied.
      if (expectedSmartWallet != address(0)) {
        // Only proceed with deployment if target matches the required target.
        require(
          target == expectedSmartWallet,
          "Target deployment address doesn't match expected deployment address."
        );
      }

      // Deploy the new upgrade beacon proxy contract using `CREATE2`.
      assembly {
        let encoded_data := add(32, initCode) // load initialization code.
        let encoded_size := mload(initCode)   // load the init code's length.
        smartWallet := create2(               // call `CREATE2` w/ 4 arguments.
          callvalue,                          // forward any supplied endowment.
          encoded_data,                       // pass in initialization code.
          encoded_size,                       // pass in init code's length.
          salt                                // pass in the salt value.
        )

        // Pass along failure message and revert if contract deployment fails.
        if iszero(smartWallet) {
          returndatacopy(0, 0, returndatasize)
          revert(0, returndatasize)
        }
      }

      // Emit an event to signal the creation of the new smart wallet.
      emit SmartWalletDeployed(smartWallet, userSigningKey);
    } else {
      // Note: the smart wallet at the expected address may have been modified
      // so that the supplied user signing key is no longer a valid key.
      // Therefore, treat this helper as a way to protect against race
      // conditions, not as a primary mechanism for interacting with smart
      // wallet contracts.
      smartWallet = expectedSmartWallet;
    }
  }

  /**
   * @notice Private view function for finding the address of the next upgrade
   * beacon proxy that will be deployed, given a particular initialization
   * calldata payload.
   * @param initializationCalldata bytes The calldata that will be supplied to
   * the `DELEGATECALL` from the deployed contract to the implementation set on
   * the upgrade beacon during contract creation.
   * @return The address of the next upgrade beacon proxy contract with the
   * given initialization calldata.
   */
  function _computeNextAddress(
    bytes memory initializationCalldata
  ) private view returns (address target) {
    // Place creation code and constructor args of the proxy instance in memory.
    bytes memory initCode = abi.encodePacked(
      type(UpgradeBeaconProxyV1).creationCode,
      abi.encode(initializationCalldata)
    );

    // Get target address using the constructed initialization code.
    (, target) = _getSaltAndTarget(initCode);
  }

  /**
   * @notice Private function for determining the salt and the target deployment
   * address for the next deployed contract (using `CREATE2`) based on the
   * contract creation code.
   */
  function _getSaltAndTarget(
    bytes memory initCode
  ) private view returns (uint256 nonce, address target) {
    // Get the keccak256 hash of the init code for address derivation.
    bytes32 initCodeHash = keccak256(initCode);

    // Set the initial nonce to be provided when constructing the salt.
    nonce = 0;

    // Declare variable for code size of derived address.
    uint256 codeSize;

    // Loop until an contract deployment address with no code has been found.
    while (true) {
      target = address(            // derive the target deployment address.
        uint160(                   // downcast to match the address type.
          uint256(                 // cast to uint to truncate upper digits.
            keccak256(             // compute CREATE2 hash using 4 inputs.
              abi.encodePacked(    // pack all inputs to the hash together.
                bytes1(0xff),      // pass in the control character.
                address(this),     // pass in the address of this contract.
                nonce,             // pass in the salt from above.
                initCodeHash       // pass in hash of contract creation code.
              )
            )
          )
        )
      );

      // Determine if a contract is already deployed to the target address.
      assembly { codeSize := extcodesize(target) }

      // Exit the loop if no contract is deployed to the target address.
      if (codeSize == 0) {
        break;
      }

      // Otherwise, increment the nonce and derive a new salt.
      nonce++;
    }
  }

  /**
   * @notice Private view function for getting the version of the current smart
   * wallet implementation by using the upgrade beacon to determine the
   * implementation and then calling into the returned implementation contract
   * directly.
   */
  function _getSmartWalletVersion() private view returns (uint256 version) {
    // Perform the staticcall into the smart wallet upgrade beacon.
    (bool ok, bytes memory data) = _SMART_WALLET_UPGRADE_BEACON.staticcall("");

    // Revert if underlying staticcall reverts, passing along revert message.
    require(ok, string(data));

    // Ensure that the data returned from the beacon is the correct length.
    require(data.length == 32, "Return data must be exactly 32 bytes.");

    // Decode the implementation address from the returned data.
    address implementation = abi.decode(data, (address));

    // Call into the implementation address directly to get the version.
    version = DharmaSmartWalletImplementationV0Interface(
      implementation
    ).getVersion();
  }

  /**
   * @notice Private view function to get the Dharma signing key for a smart
   * wallet from the Dharma Key Registry. This key can be set for each specific
   * smart wallet - if none has been set, a global fallback key will be used.
   * @param smartWallet address The smart wallet address to get the key for.
   * @return The address of the Dharma signing key, or public key corresponding
   * to the secondary signer.
   */
  function _getDharmaSigningKey(address smartWallet) private view returns (
    address dharmaSigningKey
  ) {
    dharmaSigningKey = _DHARMA_KEY_REGISTRY.getKeyForUser(smartWallet);
  }
}