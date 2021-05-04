// SPDX-License-Identifier: MIT
pragma solidity 0.8.4; // optimization runs: 200, evm version: petersburg

import "../helpers/TimelockerV2.sol";
import "../helpers/TwoStepOwnable.sol";
import "../../interfaces/DharmaAccountRecoveryManagerInterface.sol";
import "../../interfaces/DharmaAccountRecoveryManagerV2Interface.sol";
import "../../interfaces/DharmaSmartWalletRecoveryInterface.sol";
import "../../interfaces/TimelockerModifiersInterface.sol";


/**
 * @title DharmaAccountRecoveryManagerV2
 * @author 0age
 * @notice This contract is owned by an Account Recovery multisig and manages
 * resets to user signing keys when necessary. It implements a set of timelocked
 * functions, where the `setTimelock` function must first be called, with the
 * same arguments that the function will be supplied with. Then, a given time
 * interval must first fully transpire before the timelock functions can be
 * successfully called.
 *
 * The timelocked functions currently implemented include:
 *  recover(address wallet, address newUserSigningKey)
 *  disableAccountRecovery(address wallet)
 *  modifyTimelockInterval(bytes4 functionSelector, uint256 newTimelockInterval)
 *  modifyTimelockExpiration(
 *    bytes4 functionSelector, uint256 newTimelockExpiration
 *  )
 *
 * Note that special care should be taken to differentiate between lost keys and
 * compromised keys, and that the danger of a user being impersonated is
 * extremely high. Account recovery should progress to a system where the user
 * builds their preferred account recovery procedure into a "key ring" smart
 * contract at their signing address, reserving this "hard reset" for extremely
 * unusual circumstances and eventually sunsetting it entirely.
 *
 * V2 of the Account Recovery Manager builds on V1 by introducing the concept of
 * "roles" - these are dedicated accounts that can be modified by the owner, and
 * that can trigger specific functionality on the manager. These roles are:
 *  - operator: initiates timelocks for account recovery + disablement
 *  - recoverer: triggers account recovery once timelock is complete
 *  - disabler: triggers account recovery disablement once timelock is complete
 *  - canceller: cancels account recovery and recovery disablement timelocks
 *  - pauser: pauses any role (where only the owner is then able to unpause it)
 *
 * V2 also provides dedicated methods for cancelling timelocks related to
 * account recovery or the disablement of account recovery, as well as functions
 * for managing, pausing, and querying for the status of the various roles.
 */
contract DharmaAccountRecoveryManagerV2 is
  DharmaAccountRecoveryManagerInterface,
  DharmaAccountRecoveryManagerV2Interface,
  TimelockerModifiersInterface,
  TwoStepOwnable,
  TimelockerV2 {

  // Maintain a role status mapping with assigned accounts and paused states.
  mapping(uint256 => RoleStatus) private _roles;

  // Maintain mapping of smart wallets that have opted out of account recovery.
  mapping(address => bool) private _accountRecoveryDisabled;

  /**
   * @notice In the constructor, set the initial owner to the transaction
   * submitter and initial minimum timelock interval and default timelock
   * expiration values.
   */
  constructor() {
    // Set initial minimum timelock interval values.
    _setInitialTimelockInterval(this.modifyTimelockInterval.selector, 2 weeks);
    _setInitialTimelockInterval(
      this.modifyTimelockExpiration.selector, 2 weeks
    );
    _setInitialTimelockInterval(this.recover.selector, 3 days);
    _setInitialTimelockInterval(this.disableAccountRecovery.selector, 3 days);

    // Set initial default timelock expiration values.
    _setInitialTimelockExpiration(this.modifyTimelockInterval.selector, 7 days);
    _setInitialTimelockExpiration(
      this.modifyTimelockExpiration.selector, 7 days
    );
    _setInitialTimelockExpiration(this.recover.selector, 3 days);
    _setInitialTimelockExpiration(this.disableAccountRecovery.selector, 3 days);
  }

  /**
   * @notice Initiates a timelocked account recovery process for a smart wallet
   * user signing key. Only the owner or the designated operator may call this
   * function. Once the timelock period is complete (and before it has expired)
   * the owner or the designated recoverer may call `recover` to complete the
   * process and reset the user's signing key.
   * @param smartWallet The smart wallet address.
   * @param userSigningKey The new user signing key.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateAccountRecovery(
    address smartWallet, address userSigningKey, uint256 extraTime
  ) external override onlyOwnerOr(Role.OPERATOR) {
    require(smartWallet != address(0), "No smart wallet address provided.");
    require(userSigningKey != address(0), "No new user signing key provided.");

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(
      this.recover.selector, abi.encode(smartWallet, userSigningKey), extraTime
    );
  }

  /**
   * @notice Timelocked function to set a new user signing key on a smart
   * wallet. Only the owner or the designated recoverer may call this function.
   * @param smartWallet Address of the smart wallet to recover a key on.
   * @param newUserSigningKey Address of the new signing key for the user.
   */
  function recover(
    address smartWallet, address newUserSigningKey
  ) external override onlyOwnerOr(Role.RECOVERER) {
    require(smartWallet != address(0), "No smart wallet address provided.");
    require(
      newUserSigningKey != address(0),
      "No new user signing key provided."
    );

    // Ensure that the wallet in question has not opted out of account recovery.
    require(
      !_accountRecoveryDisabled[smartWallet],
      "This wallet has elected to opt out of account recovery functionality."
    );

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(abi.encode(smartWallet, newUserSigningKey));

    // Declare the proper interface for the smart wallet in question.
    DharmaSmartWalletRecoveryInterface walletInterface;

    // Attempt to get current signing key - a failure should not block recovery.
    address oldUserSigningKey;
    (bool ok, bytes memory data) = smartWallet.call{gas: gasleft() / 2}(
      abi.encodeWithSelector(walletInterface.getUserSigningKey.selector)
    );
    if (ok && data.length == 32) {
      oldUserSigningKey = abi.decode(data, (address));
    }

    // Call the specified smart wallet and supply the new user signing key.
    DharmaSmartWalletRecoveryInterface(smartWallet).recover(newUserSigningKey);

    // Emit an event to signify that the wallet in question was recovered.
    emit Recovery(smartWallet, oldUserSigningKey, newUserSigningKey);
  }

  /**
   * @notice Initiates a timelocked account recovery disablement process for a
   * smart wallet. Only the owner or the designated operator may call this
   * function. Once the timelock period is complete (and before it has expired)
   * the owner or the designated disabler may call `disableAccountRecovery` to
   * complete the process and opt a smart wallet out of account recovery. Once
   * account recovery has been disabled, it cannot be reenabled - the process is
   * irreversible.
   * @param smartWallet The smart wallet address.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateAccountRecoveryDisablement(
    address smartWallet, uint256 extraTime
  ) external override onlyOwnerOr(Role.OPERATOR) {
    require(smartWallet != address(0), "No smart wallet address provided.");

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(
      this.disableAccountRecovery.selector, abi.encode(smartWallet), extraTime
    );
  }

  /**
   * @notice Timelocked function to opt a given wallet out of account recovery.
   * This action cannot be undone - any future account recovery would require an
   * upgrade to the smart wallet implementation itself and is not likely to be
   * supported. Only the owner or the designated disabler may call this
   * function.
   * @param smartWallet Address of the smart wallet to disable account recovery
   * for.
   */
  function disableAccountRecovery(
    address smartWallet
  ) external override onlyOwnerOr(Role.DISABLER) {
    require(smartWallet != address(0), "No smart wallet address provided.");

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(abi.encode(smartWallet));

    // Register the specified wallet as having opted out of account recovery.
    _accountRecoveryDisabled[smartWallet] = true;

    // Emit an event to signify the wallet in question is no longer recoverable.
    emit RecoveryDisabled(smartWallet);
  }

  /**
   * @notice Cancel a pending timelock for setting a new user signing key on a
   * smart wallet. Only the owner or the designated canceller may call this
   * function.
   * @param smartWallet Address of the smart wallet to cancel the recovery on.
   * @param userSigningKey Address of the signing key supplied for the user.
   */
  function cancelAccountRecovery(
    address smartWallet, address userSigningKey
  ) external override onlyOwnerOr(Role.CANCELLER) {
    require(smartWallet != address(0), "No smart wallet address provided.");
    require(userSigningKey != address(0), "No user signing key provided.");

    // Expire the timelock for the account recovery in question if one exists.
    _expireTimelock(
      this.recover.selector, abi.encode(smartWallet, userSigningKey)
    );

    // Emit an event to signify that the recovery was cancelled.
    emit RecoveryCancelled(smartWallet, userSigningKey);
  }

  /**
   * @notice Cancel a pending timelock for disabling account recovery for a
   * smart wallet. Only the owner or the designated canceller may call this
   * function.
   * @param smartWallet Address of the smart wallet to cancel the recovery
   * disablement on.
   */
  function cancelAccountRecoveryDisablement(
    address smartWallet
  ) external override onlyOwnerOr(Role.CANCELLER) {
    require(smartWallet != address(0), "No smart wallet address provided.");

    // Expire account recovery disablement timelock in question if one exists.
    _expireTimelock(
      this.disableAccountRecovery.selector, abi.encode(smartWallet)
    );

    // Emit an event to signify that the recovery disablement was cancelled.
    emit RecoveryDisablementCancelled(smartWallet);
  }

  /**
   * @notice Pause a currently unpaused role and emit a `RolePaused` event. Only
   * the owner or the designated pauser may call this function. Also, bear in
   * mind that only the owner may unpause a role once paused.
   * @param role The role to pause. Permitted roles are operator (0),
   * recoverer (1), canceller (2), disabler (3), and pauser (4).
   */
  function pause(Role role) external override onlyOwnerOr(Role.PAUSER) {
    RoleStatus storage storedRoleStatus = _roles[uint256(role)];
    require(!storedRoleStatus.paused, "Role in question is already paused.");
    storedRoleStatus.paused = true;
    emit RolePaused(role);
  }

  /**
   * @notice Unause a currently paused role and emit a `RoleUnpaused` event.
   * Only the owner may call this function.
   * @param role The role to pause. Permitted roles are operator (0),
   * recoverer (1), canceller (2), disabler (3), and pauser (4).
   */
  function unpause(Role role) external override onlyOwner {
    RoleStatus storage storedRoleStatus = _roles[uint256(role)];
    require(storedRoleStatus.paused, "Role in question is already unpaused.");
    storedRoleStatus.paused = false;
    emit RoleUnpaused(role);
  }

  /**
   * @notice Sets the timelock for a new timelock interval for a given function
   * selector. Only the owner may call this function.
   * @param functionSelector The selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval The new timelock interval to set for the given
   * function selector.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateModifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval, uint256 extraTime
  ) external override onlyOwner {
    // Ensure that a function selector is specified (no 0x00000000 selector).
    require(
      functionSelector != bytes4(0),
      "Function selector cannot be empty."
    );

    // Ensure a timelock interval over eight weeks is not set on this function.
    if (functionSelector == this.modifyTimelockInterval.selector) {
      require(
        newTimelockInterval <= 8 weeks,
        "Timelock interval of modifyTimelockInterval cannot exceed eight weeks."
      );
    }

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(
      this.modifyTimelockInterval.selector,
      abi.encode(functionSelector, newTimelockInterval),
      extraTime
    );
  }

  /**
   * @notice Sets a new timelock interval for a given function selector. The
   * default for this function may also be modified, but has a maximum allowable
   * value of eight weeks. Only the owner may call this function.
   * @param functionSelector The selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval The new timelock interval to set for the given
   * function selector.
   */
  function modifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) external override onlyOwner {
    // Ensure that a function selector is specified (no 0x00000000 selector).
    require(
      functionSelector != bytes4(0),
      "Function selector cannot be empty."
    );

    // Continue via logic in the inherited `_modifyTimelockInterval` function.
    _modifyTimelockInterval(functionSelector, newTimelockInterval);
  }

  /**
   * @notice Sets a new timelock expiration for a given function selector. The
   * default Only the owner may call this function. New expiration durations may
   * not exceed one month.
   * @param functionSelector The selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration The new timelock expiration to set for the
   * given function selector.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateModifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration, uint256 extraTime
  ) external override onlyOwner {
    // Ensure that a function selector is specified (no 0x00000000 selector).
    require(
      functionSelector != bytes4(0),
      "Function selector cannot be empty."
    );

    // Ensure that the supplied default expiration does not exceed 1 month.
    require(
      newTimelockExpiration <= 30 days,
      "New timelock expiration cannot exceed one month."
    );

    // Ensure a timelock expiration under one hour is not set on this function.
    if (functionSelector == this.modifyTimelockExpiration.selector) {
      require(
        newTimelockExpiration >= 60 minutes,
        "Expiration of modifyTimelockExpiration must be at least an hour long."
      );
    }

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(
      this.modifyTimelockExpiration.selector,
      abi.encode(functionSelector, newTimelockExpiration),
      extraTime
    );
  }

  /**
   * @notice Sets a new timelock expiration for a given function selector. The
   * default for this function may also be modified, but has a minimum allowable
   * value of one hour. Only the owner may call this function.
   * @param functionSelector The selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration The new timelock expiration to set for the
   * given function selector.
   */
  function modifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) external override onlyOwner {
    // Ensure that a function selector is specified (no 0x00000000 selector).
    require(
      functionSelector != bytes4(0),
      "Function selector cannot be empty."
    );

    // Continue via logic in the inherited `_modifyTimelockExpiration` function.
    _modifyTimelockExpiration(
      functionSelector, newTimelockExpiration
    );
  }

  /**
   * @notice Set a new account on a given role and emit a `RoleModified` event
   * if the role holder has changed. Only the owner may call this function.
   * @param role The role that the account will be set for. Permitted roles are
   * operator (0), recoverer (1), canceller (2), disabler (3), and pauser (4).
   * @param account The account to set as the designated role bearer.
   */
  function setRole(Role role, address account) external override onlyOwner {
    require(account != address(0), "Must supply an account.");
    _setRole(role, account);
  }

  /**
   * @notice Remove any current role bearer for a given role and emit a
   * `RoleModified` event if a role holder was previously set. Only the owner
   * may call this function.
   * @param role The role that the account will be removed from. Permitted roles
   * are operator (0), recoverer (1), canceller (2), disabler (3), and
   * pauser (4).
   */
  function removeRole(Role role) external override onlyOwner {
    _setRole(role, address(0));
  }

  /**
   * @notice External view function to check whether a given smart wallet has
   * disabled account recovery by opting out.
   * @param smartWallet Address of the smart wallet to check.
   * @return hasDisabledAccountRecovery - a boolean indicating if account recovery has been disabled for the
   * wallet in question.
   */
  function accountRecoveryDisabled(
    address smartWallet
  ) external view override returns (bool hasDisabledAccountRecovery) {
    // Determine if the wallet in question has opted out of account recovery.
    hasDisabledAccountRecovery = _accountRecoveryDisabled[smartWallet];
  }

  /**
   * @notice External view function to check whether or not the functionality
   * associated with a given role is currently paused or not. The owner or the
   * pauser may pause any given role (including the pauser itself), but only the
   * owner may unpause functionality. Additionally, the owner may call paused
   * functions directly.
   * @param role The role to check the pause status on. Permitted roles are
   * operator (0), recoverer (1), canceller (2), disabler (3), and pauser (4).
   * @return paused - a boolean to indicate if the functionality associated with the role
   * in question is currently paused.
   */
  function isPaused(Role role) external view override returns (bool paused) {
    paused = _isPaused(role);
  }

  /**
   * @notice External view function to check whether the caller is the current
   * role holder.
   * @param role The role to check for. Permitted roles are operator (0),
   * recoverer (1), canceller (2), disabler (3), and pauser (4).
   * @return hasRole - a boolean indicating if the caller has the specified role.
   */
  function isRole(Role role) external view override returns (bool hasRole) {
    hasRole = _isRole(role);
  }

  /**
   * @notice External view function to check the account currently holding the
   * operator role. The operator can initiate timelocks for account recovery and
   * account recovery disablement.
   * @return operator - the address of the current operator, or the null address if none is
   * set.
   */
  function getOperator() external view override returns (address operator) {
    operator = _roles[uint256(Role.OPERATOR)].account;
  }

  /**
   * @notice External view function to check the account currently holding the
   * recoverer role. The recoverer can trigger smart wallet account recovery in
   * the event that a timelock has been initiated and is complete and not yet
   * expired.
   * @return recoverer - the address of the current recoverer, or the null address if none
   * is set.
   */
  function getRecoverer() external view override returns (address recoverer) {
    recoverer = _roles[uint256(Role.RECOVERER)].account;
  }

  /**
   * @notice External view function to check the account currently holding the
   * canceller role. The canceller can expire a timelock related to account
   * recovery or account recovery disablement prior to its execution.
   * @return canceller - the address of the current canceller, or the null address if none
   * is set.
   */
  function getCanceller() external view override returns (address canceller) {
    canceller = _roles[uint256(Role.CANCELLER)].account;
  }

  /**
   * @notice External view function to check the account currently holding the
   * disabler role. The disabler can trigger permanent smart wallet account
   * recovery disablement in the event that a timelock has been initiated and is
   * complete and not yet expired.
   * @return disabler - the address of the current disabler, or the null address if none is
   * set.
   */
  function getDisabler() external view override returns (address disabler) {
    disabler = _roles[uint256(Role.DISABLER)].account;
  }

  /**
   * @notice External view function to check the account currently holding the
   * pauser role. The pauser can pause any role from taking its standard action,
   * though the owner will still be able to call the associated function in the
   * interim and is the only entity able to unpause the given role once paused.
   * @return pauser - the address of the current pauser, or the null address if none is
   * set.
   */
  function getPauser() external view override returns (address pauser) {
    pauser = _roles[uint256(Role.PAUSER)].account;
  }

  /**
   * @notice Internal function to set a new account on a given role and emit a
   * `RoleModified` event if the role holder has changed.
   * @param role The role that the account will be set for. Permitted roles are
   * operator (0), recoverer (1), canceller (2), disabler (3), and pauser (4).
   * @param account The account to set as the designated role bearer.
   */
  function _setRole(Role role, address account) internal {
    RoleStatus storage storedRoleStatus = _roles[uint256(role)];

    if (account != storedRoleStatus.account) {
      storedRoleStatus.account = account;
      emit RoleModified(role, account);
    }
  }

  /**
   * @notice Internal view function to check whether the caller is the current
   * role holder.
   * @param role The role to check for. Permitted roles are operator (0),
   * recoverer (1), canceller (2), disabler (3), and pauser (4).
   * @return hasRole - a boolean indicating if the caller has the specified role.
   */
  function _isRole(Role role) internal view returns (bool hasRole) {
    hasRole = msg.sender == _roles[uint256(role)].account;
  }

  /**
   * @notice Internal view function to check whether the given role is paused or
   * not.
   * @param role The role to check for. Permitted roles are operator (0),
   * recoverer (1), canceller (2), disabler (3), and pauser (4).
   * @return paused - a boolean indicating if the specified role is paused or not.
   */
  function _isPaused(Role role) internal view returns (bool paused) {
    paused = _roles[uint256(role)].paused;
  }

  /**
   * @notice Modifier that throws if called by any account other than the owner
   * or the supplied role, or if the caller is not the owner and the role in
   * question is paused.
   * @param role The role to require unless the caller is the owner. Permitted
   * roles are operator (0), recoverer (1), canceller (2), disabler (3), and
   * pauser (4).
   */
  modifier onlyOwnerOr(Role role) {
    if (!isOwner()) {
      require(_isRole(role), "Caller does not have a required role.");
      require(!_isPaused(role), "Role in question is currently paused.");
    }
    _;
  }
}
