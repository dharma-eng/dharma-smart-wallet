pragma solidity 0.5.17;

import "../../proxies/key-ring/KeyRingUpgradeBeaconProxyV1.sol";
import "../../../interfaces/DharmaKeyRingFactoryV1Interface.sol";
import "../../../interfaces/DharmaKeyRingInitializer.sol";
import "../../../interfaces/DharmaKeyRingImplementationV0Interface.sol";
import "../../../interfaces/DharmaSmartWalletImplementationV0Interface.sol";


/**
 * @title DharmaKeyRingFactoryV1
 * @author 0age
 * @notice This contract deploys new Dharma Key Ring instances as "Upgrade
 * Beacon" proxies that reference a shared implementation contract specified by
 * the Dharma Key Ring Upgrade Beacon contract. It also supplies methods for
 * performing additional operations post-deployment, including setting a second
 * signing key on the keyring and making a withdrawal from the associated smart
 * wallet. Note that the batch operations may fail, or be applied to the wrong
 * keyring, if another caller frontruns them by deploying a keyring to the
 * intended address first. If this becomes an issue, a future version of this
 * factory can remedy this by passing the target deployment address as an
 * additional argument and checking for existence of a contract at that address.
 */
contract DharmaKeyRingFactoryV1 is DharmaKeyRingFactoryV1Interface {
  // Use DharmaKeyRing initialize selector to construct initialization calldata.
  bytes4 private constant _INITIALIZE_SELECTOR = bytes4(0x30fc201f);

  /**
   * @notice In the constructor, ensure that the initialize selector constant is
   * correct.
   */
  constructor() public {
    DharmaKeyRingInitializer initializer;
    require(
      initializer.initialize.selector == _INITIALIZE_SELECTOR,
      "Incorrect initializer selector supplied."
    );
  }

  /**
   * @notice Deploy a new key ring contract using the provided user signing key.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @return The address of the new key ring.
   */
  function newKeyRing(
    address userSigningKey
  ) external returns (address keyRing) {
    // Deploy and initialize a keyring instance and emit a corresponding event.
    keyRing = _deployNewKeyRing(userSigningKey);
  }

  /**
   * @notice Deploy a new key ring contract using the provided user signing key
   * and immediately add a second signing key to the key ring.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @param additionalSigningKey address The second user signing key, supplied
   * as an argument to `takeAdminAction` on the newly-deployed keyring.
   * @param signature bytes A signature approving the addition of the second key
   * that has been signed by the first key.
   * @return The address of the new key ring.
   */
  function newKeyRingAndAdditionalKey(
    address userSigningKey,
    address additionalSigningKey,
    bytes calldata signature
  ) external returns (address keyRing) {
    // Deploy and initialize a keyring instance and emit a corresponding event.
    keyRing = _deployNewKeyRing(userSigningKey);

    // Set the additional key on the newly-deployed keyring.
    DharmaKeyRingImplementationV0Interface(keyRing).takeAdminAction(
      DharmaKeyRingImplementationV0Interface.AdminActionType.AddDualKey,
      uint160(additionalSigningKey),
      signature
    );
  }

  /**
   * @notice Deploy a new key ring contract using the provided user signing key
   * and immediately make a Dai withdrawal from the supplied smart wallet.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @param smartWallet address The smart wallet to make the withdrawal from and
   * that has the keyring to be deployed set as its user singing address.
   * @param amount uint256 The amount of Dai to withdraw.
   * @param recipient address The account to transfer the withdrawn Dai to.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to the call to the smart wallet - be aware that additional gas
   * must still be included to account for the cost of overhead incurred up
   * until the start of the function call.
   * @param userSignature bytes A signature that resolves to userSigningKey set
   * on the keyring and resolved using ERC1271. A unique hash returned from
   * `getCustomActionID` on the smart wallet is prefixed and hashed to create
   * the message hash for the signature.
   * @param dharmaSignature bytes A signature that resolves to the public key
   * returned for the smart wallet from the Dharma Key Registry. A unique hash
   * returned from `getCustomActionID` on the smart wallet is prefixed and
   * hashed to create the signed message.
   * @return The address of the new key ring and the success status of the
   * withdrawal.
   */
  function newKeyRingAndDaiWithdrawal(
    address userSigningKey,
    address smartWallet,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address keyRing, bool withdrawalSuccess) {
    // Deploy and initialize a keyring instance and emit a corresponding event.
    keyRing = _deployNewKeyRing(userSigningKey);

    // Attempt to withdraw Dai from the provided smart wallet.
    withdrawalSuccess = DharmaSmartWalletImplementationV0Interface(
      smartWallet
    ).withdrawDai(
      amount, recipient, minimumActionGas, userSignature, dharmaSignature
    );
  }

  /**
   * @notice Deploy a new key ring contract using the provided user signing key
   * and immediately make a USDC withdrawal from the supplied smart wallet.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @param smartWallet address The smart wallet to make the withdrawal from and
   * that has the keyring to be deployed set as its user singing address.
   * @param amount uint256 The amount of USDC to withdraw.
   * @param recipient address The account to transfer the withdrawn USDC to.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to the call to the smart wallet - be aware that additional gas
   * must still be included to account for the cost of overhead incurred up
   * until the start of the function call.
   * @param userSignature bytes A signature that resolves to userSigningKey set
   * on the keyring and resolved using ERC1271. A unique hash returned from
   * `getCustomActionID` on the smart wallet is prefixed and hashed to create
   * the message hash for the signature.
   * @param dharmaSignature bytes A signature that resolves to the public key
   * returned for the smart wallet from the Dharma Key Registry. A unique hash
   * returned from `getCustomActionID` on the smart wallet is prefixed and
   * hashed to create the signed message.
   * @return The address of the new key ring and the success status of the
   * withdrawal.
   */
  function newKeyRingAndUSDCWithdrawal(
    address userSigningKey,
    address smartWallet,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (address keyRing, bool withdrawalSuccess) {
    // Deploy and initialize a keyring instance and emit a corresponding event.
    keyRing = _deployNewKeyRing(userSigningKey);

    // Attempt to withdraw USDC from the provided smart wallet.
    withdrawalSuccess = DharmaSmartWalletImplementationV0Interface(
      smartWallet
    ).withdrawUSDC(
      amount, recipient, minimumActionGas, userSignature, dharmaSignature
    );
  }

  /**
   * @notice View function to find the address of the next key ring address that
   * will be deployed for a given user signing key. Note that a new value will
   * be returned if a particular user signing key has been used before.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @return The future address of the next key ring.
   */
  function getNextKeyRing(
    address userSigningKey
  ) external view returns (address keyRing) {
    // Ensure that a user signing key has been provided.
    require(userSigningKey != address(0), "No user signing key supplied.");

    // Get initialization calldata using the initial user signing key.
    bytes memory initializationCalldata = _constructInitializationCalldata(
      userSigningKey
    );

    // Determine the user's key ring address based on the user signing key.
    keyRing = _computeNextAddress(initializationCalldata);
  }

  /**
   * @notice Internal function to deploy a new key ring contract using the
   * provided user signing key.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument during deployment.
   * @return The address of the new key ring.
   */
  function _deployNewKeyRing(
    address userSigningKey
  ) internal returns (address keyRing) {
    // Get initialization calldata using the initial user signing key.
    bytes memory initializationCalldata = _constructInitializationCalldata(
      userSigningKey
    );

    // Deploy and initialize new user key ring as an Upgrade Beacon proxy.
    keyRing = _deployUpgradeBeaconProxyInstance(initializationCalldata);

    // Emit an event to signal the creation of the new key ring contract.
    emit KeyRingDeployed(keyRing, userSigningKey);
  }

  /**
   * @notice Private function to deploy an upgrade beacon proxy via `CREATE2`.
   * @param initializationCalldata bytes The calldata that will be supplied to
   * the `DELEGATECALL` from the deployed contract to the implementation set on
   * the upgrade beacon during contract creation.
   * @return The address of the newly-deployed upgrade beacon proxy.
   */
  function _deployUpgradeBeaconProxyInstance(
    bytes memory initializationCalldata
  ) private returns (address upgradeBeaconProxyInstance) {
    // Place creation code and constructor args of new proxy instance in memory.
    bytes memory initCode = abi.encodePacked(
      type(KeyRingUpgradeBeaconProxyV1).creationCode,
      abi.encode(initializationCalldata)
    );

    // Get salt to use during deployment using the supplied initialization code.
    (uint256 salt, ) = _getSaltAndTarget(initCode);

    // Deploy the new upgrade beacon proxy contract using `CREATE2`.
    assembly {
      let encoded_data := add(0x20, initCode) // load initialization code.
      let encoded_size := mload(initCode)     // load the init code's length.
      upgradeBeaconProxyInstance := create2(  // call `CREATE2` w/ 4 arguments.
        callvalue,                            // forward any supplied endowment.
        encoded_data,                         // pass in initialization code.
        encoded_size,                         // pass in init code's length.
        salt                                  // pass in the salt value.
      )

      // Pass along failure message and revert if contract deployment fails.
      if iszero(upgradeBeaconProxyInstance) {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }
  }

  function _constructInitializationCalldata(
    address userSigningKey
  ) private pure returns (bytes memory initializationCalldata) {
    address[] memory keys = new address[](1);
    keys[0] = userSigningKey;

    uint8[] memory keyTypes = new uint8[](1);
    keyTypes[0] = uint8(3); // Dual key type

    // Get initialization calldata from initialize selector & arguments.
    initializationCalldata = abi.encodeWithSelector(
      _INITIALIZE_SELECTOR, 1, 1, keys, keyTypes
    );
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
      type(KeyRingUpgradeBeaconProxyV1).creationCode,
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
                nonce,              // pass in the salt from above.
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
}
