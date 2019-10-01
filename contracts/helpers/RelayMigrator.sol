pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../interfaces/DharmaSmartWalletFactoryV1Interface.sol";
import "../../interfaces/RelayContractInterface.sol";


/**
 * @title RelayMigrator
 * @author 0age
 * @notice This contract will migrate cDAI and cUSDC balances from existing user
 * relay contracts to new smart wallet contracts. It has four distinct phases:
 *  - Phase one: Registration. All existing relay contracts, and a user signing
 *    key that will be used to provision a new smart wallet for each, are
 *    provided as arguments to the `register` function. Once all relay contracts
 *    have been registered, the `endRegistration` function is called and the
 *    final group of registered relay contracts is verified by calling
 *    `getTotalRegisteredRelayContracts` and `getRegisteredRelayContract`.
 *  - Phase two: Deployment. This contract will call the Dharma Smart Wallet
 *    factory, supplying the registered user signing key. The resultant smart
 *    wallet address will be recorded for each relay contract. Once a smart
 *    wallet has been deployed for each relay contract, the deployment phase
 *    will be marked as ended, and the final group of deployed smart wallets
 *    should be verified by calling `getTotalDeployedSmartWallets` and 
 *    `getRegisteredRelayContract`, making sure that each relay contract has a
 *    corresponding smart wallet, and updating that information for each user.
 *  - Phase three: Approval Assignment. Each relay contract will need to call
 *    `executeTransactions` and assign this contract full allowance to transfer
 *    both cDAI and cUSDC ERC20 tokens on it's behalf. This can be done safely,
 *    as there is only one valid recipient for each `transferFrom` sent from the
 *    relay contract: the associated smart wallet. Once this phase is complete,
 *    approvals should be verified by calling `getRegisteredRelayContract` for
 *    each relay contract, making sure that `readyToMigrate` is true for each.
 *    Then, call the `beginMigration` function to start the actual migration.
 *  - Phase four: Migration. The migrator will iterate over each relay contract,
 *    detect the current cDAI and cUSDC token balance on the relay contract, and
 *    transfer it from the relay contract to the smart wallet. If a transfer
 *    does not succeed (for instance, if approvals were not appropriately set),
 *    an event indicating the problematic relay contract will be emitted. Once
 *    all relay contract transfers have been processed, the migrator will begin
 *    again from the start - this enables any missed approvals to be addressed
 *    and any balance changes between the start and the end of the migration to
 *    be brought over as well. Once all users have been successfully migrated
 *    `endMigration` may be called to completely decommission the migrator.
 *
 * After migration is complete, it is imperative that users set a user-supplied
 * signing key by calling `setUserSigningKey` on their smart wallet. Until then,
 * the initial user signature will be supplied by Dharma to perform smart wallet
 * actions (including for the initial request to set the user's signing key).
 */
contract RelayMigrator is Ownable {
  event MigrationError(
    address cToken,
    address relayContract,
    address smartWallet,
    uint256 balance,
    uint256 allowance
  );

  struct RelayCall {
    address relayContract;
    RelayContractInterface.transactionParameters[] executeTransactionsArgument;
  }

  address[] private _relayContracts;

  address[] private _initialUserSigningKeys;

  address[] private _smartWallets;

  mapping(address => bool) private _relayContractRegistered;

  mapping(address => bool) private _initialUserSigningKeyRegistered;

  uint256 private _iterationIndex;

  bool public registrationCompleted;

  bool public deploymentCompleted;

  bool public migrationStarted;

  bool public migrationFirstPassCompleted;

  bool public migrationCompleted;

  // The Dharma Smart Wallet Factory will deploy each new smart wallet.
  DharmaSmartWalletFactoryV1Interface internal constant _DHARMA_SMART_WALLET_FACTORY = (
    DharmaSmartWalletFactoryV1Interface(0xfc00C80b0000007F73004edB00094caD80626d8D)
  );

  // This contract interfaces with cDai and cUSDC CompoundV2 contracts.
  IERC20 internal constant _CDAI = IERC20(
    0xF5DCe57282A584D2746FaF1593d3121Fcac444dC // mainnet
  );

  IERC20 internal constant _CUSDC = IERC20(
    0x39AA39c021dfbaE8faC545936693aC917d5E7563 // mainnet
  );

  bytes32 internal constant _RELAY_CODE_HASH_ONE = bytes32(
    0x2a85d02ccfbef70d3ca840c2a0e46ed31085a34079a601e5ded05f97fae15089
  );

  bytes32 internal constant _RELAY_CODE_HASH_TWO = bytes32(
    0xc1f8a51c720d3d6a8361c8fe6cf7948e0012882ad31966c6be4cac186ed4ddb9
  );

  bytes32 internal constant _RELAY_CODE_HASH_THREE = bytes32(
    0x7995a9071b13688c3ef87630b91b83b0e6983c587999f586dabad1bca6d4f01b
  );

  /**
   * @notice In constructor, set the transaction submitter as the owner, set all
   * initial phase flags to false, and set the initial migration index to 0.
   */
  constructor() public {
    _transferOwnership(tx.origin);

    registrationCompleted = false;
    deploymentCompleted = false;
    migrationStarted = false;
    migrationFirstPassCompleted = false;
    migrationCompleted = false;

    _iterationIndex = 0;
  }

  /**
   * @notice Register a group of relay contracts. This function will revert if a
   * supplied relay contract or user signing key has already been registered.
   * Only the owner may call this function.
   * @param relayContracts address[] An array of relay contract addresses to
   * register.
   * @param initialUserSigningKeys address[] An array of addresses to register
   * for each relay contract that will be used to set the initial user signing
   * key when creating the new smart wallet for the user.
   */
  function register(
    address[] calldata relayContracts,
    address[] calldata initialUserSigningKeys
  ) external onlyOwner {
    require(
      !registrationCompleted,
      "Cannot register new relay contracts once registration is completed."
    );

    require(
      relayContracts.length == initialUserSigningKeys.length,
      "Length of relay contracts array and user signing keys array must match."
    );

    bytes32 codeHash;
    for (uint256 i; i < relayContracts.length; i++) {
      address relayContract = relayContracts[i];
      address initialUserSigningKey = initialUserSigningKeys[i];

      require(
        initialUserSigningKey != address(0),
        "Must supply an initial user signing key."
      );

      require(
        !_initialUserSigningKeyRegistered[initialUserSigningKey],
        "Initial user signing key already registered."
      );

      assembly { codeHash := extcodehash(relayContract) }
      
      require(
        codeHash == _RELAY_CODE_HASH_ONE ||
        codeHash == _RELAY_CODE_HASH_TWO ||
        codeHash == _RELAY_CODE_HASH_THREE,
        "Must supply a valid relay contract address."
      );

      require(
        !_relayContractRegistered[relayContract],
        "Relay contract already registered."
      );

      _relayContractRegistered[relayContract] = true;
      _initialUserSigningKeyRegistered[initialUserSigningKey] = true;
      _relayContracts.push(relayContract);
      _initialUserSigningKeys.push(initialUserSigningKey);
    }
  }

  /**
   * @notice End relay contract registration. Only the owner may call this
   * function.
   */
  function endRegistration() external onlyOwner {
    require(!registrationCompleted, "Registration is already completed.");

    registrationCompleted = true;
  }

  /**
   * @notice Deploy smart wallets for each relay, using the initial user signing
   * key registered to each relay contract as an initialization argument. Anyone
   * may call this method once registration is completed until deployments are
   * completed.
   */
  function deploySmartWallets() external {
    require(
      registrationCompleted,
      "Cannot begin smart wallet deployment until registration is completed."
    );

    require(
      !deploymentCompleted,
      "Cannot deploy new smart wallets after deployment is completed."
    );

    address newSmartWallet;

    uint256 totalInitialUserSigningKeys = _initialUserSigningKeys.length;

    for (uint256 i = _iterationIndex; i < totalInitialUserSigningKeys; i++) {
      if (gasleft() < 200000) {
        _iterationIndex = i;
        return;
      }

      newSmartWallet = _DHARMA_SMART_WALLET_FACTORY.newSmartWallet(
        _initialUserSigningKeys[i]
      );

      _smartWallets.push(newSmartWallet);
    }

    deploymentCompleted = true;
    _iterationIndex = 0;
  }

  /**
   * @notice Begin relay contract migration. Only the owner may call this
   * function, and smart wallet deployment must first be completed.
   */
  function startMigration() external onlyOwner {
    require(
      deploymentCompleted,
      "Cannot start migration until new smart wallet deployment is completed."
    );

    require(!migrationStarted, "Migration has already started.");

    migrationStarted = true;
  }

  /**
   * @notice Migrate cDAI and cUSDC token balances from each relay contract to
   * the corresponding smart wallet. Anyone may call this method once migration
   * has started until deployments are completed.
   */
  function migrateRelayContractsToSmartWallets() external {
    require(
      migrationStarted,
      "Cannot begin relay contract migration until migration has started."
    );

    require(!migrationCompleted, "Migration is fully completed.");

    uint256 totalRelayContracts = _relayContracts.length;

    address relayContract;
    address smartWallet;
    uint256 balance;
    uint256 allowance;
    bool ok;

    for (uint256 i = _iterationIndex; i < totalRelayContracts; i++) {
      if (gasleft() < 200000) {
        _iterationIndex = i;
        return;
      }

      relayContract = _relayContracts[i];
      smartWallet = _smartWallets[i];

      balance = _CDAI.balanceOf(relayContract);

      if (balance > 0) {
        (ok, ) = address(_CDAI).call(abi.encodeWithSelector(
          _CDAI.transferFrom.selector, relayContract, smartWallet, balance
        ));

        // Emit a corresponding event if the transfer failed.
        if (!ok) {
          allowance = _CDAI.allowance(relayContract, address(this));
          emit MigrationError(
            address(_CDAI), relayContract, smartWallet, balance, allowance
          );
        }
      }

      balance = _CUSDC.balanceOf(relayContract);

      if (balance > 0) {
        (ok, ) = address(_CUSDC).call(abi.encodeWithSelector(
          _CUSDC.transferFrom.selector, relayContract, smartWallet, balance
        ));

        // Emit a corresponding event if the transfer failed.
        if (!ok) {
          allowance = _CUSDC.allowance(relayContract, address(this));
          emit MigrationError(
            address(_CUSDC), relayContract, smartWallet, balance, allowance
          );
        }
      }
    }

    migrationFirstPassCompleted = true;
    _iterationIndex = 0;
  }

  /**
   * @notice End the migration and decommission the migrator. Only the owner may
   * call this function, and a full first pass must first be completed.
   */
  function endMigration() external onlyOwner {
    require(
      migrationFirstPassCompleted,
      "Cannot end migration until at least one full pass is completed."
    );

    require(!migrationCompleted, "Migration has already completed.");

    migrationCompleted = true;
  }

  function getTotalRegisteredRelayContracts() external view returns (uint256) {
    return _relayContracts.length;
  }

  function getTotalDeployedSmartWallets() external view returns (uint256) {
    return _smartWallets.length;
  }

  function getRegisteredRelayContract(
    uint256 index
  ) external view returns (
    address relayContract,
    address initialUserSigningKey,
    address smartWallet,
    bool readyToMigrate
  ) {
    relayContract = _relayContracts[index];
    initialUserSigningKey = _initialUserSigningKeys[index];
    smartWallet = _smartWallets[index];
    readyToMigrate = _isReadyToMigrate(relayContract);
  }

  /**
   * @notice Set approvals to transfer cDAI and cUSDC on a group of relay
   * contracts in batches. Anyone may call this function as long as valid relay
   * contracts, transaction parameters, and signatures are provided - the call
   * will revert if any portion of the call reverts.
   * @param relayCalls RelayCall[] An array of RelayCall structs, which contain
   * relay contract addresses to call and an array of transactionParameters
   * structs are provided as an argument when calling `executeTransactions` on
   * the relay contract.
   */
  function batchExecuteTransactions(RelayCall[] memory relayCalls) public {
    for (uint256 i = 0; i < relayCalls.length; i++) {
      RelayCall memory relayCall = relayCalls[i];
      RelayContractInterface.transactionParameters[] memory txs = (
        relayCall.executeTransactionsArgument
      );
      RelayContractInterface(relayCall.relayContract).executeTransactions(txs);
    }
  }

  /**
   * @notice Internal function to check whether appropriate allowances have been
   * set on a given relay contract so that this contract can transfer cTokens on
   * its behalf. Note that an increase in a cToken balance between this function
   * being called and the migration may cause a given migration to fail.
   * @param relayContract address A relay contract address to check for cDAI and
   * cUSDC allowances.
   */
  function _isReadyToMigrate(
    address relayContract
  ) internal view returns (bool ready) {
    ready = (
      _CDAI.allowance(relayContract, address(this)) >= _CDAI.balanceOf(relayContract) &&
      _CUSDC.allowance(relayContract, address(this)) >= _CUSDC.balanceOf(relayContract)
    );
  }
}