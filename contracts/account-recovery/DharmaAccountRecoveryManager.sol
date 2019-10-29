pragma solidity 0.5.11; // optimization runs: 200, evm version: petersburg

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../helpers/Timelocker.sol";
import "../helpers/TwoStepOwnable.sol";
import "../../interfaces/DharmaAccountRecoveryManagerInterface.sol";
import "../../interfaces/TimelockerModifiersInterface.sol";

interface DharmaSmartWalletRecovery {
  function recover(address newUserSigningKey) external;
  function getUserSigningKey() external view returns (address userSigningKey);
}


/**
 * @title DharmaAccountRecoveryManager
 * @author 0age
 * @notice This contract will be owned by DharmaAccountRecoveryMultisig and will
 * manage resets to the user's signing key. It implements a set of timelocked
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
 */
contract DharmaAccountRecoveryManager is
  DharmaAccountRecoveryManagerInterface,
  TimelockerModifiersInterface,
  TwoStepOwnable,
  Timelocker {
  using SafeMath for uint256;

  // Maintain mapping of smart wallets that have opted out of account recovery.
  mapping(address => bool) private _accountRecoveryDisabled;

  /**
   * @notice In the constructor, set the initial owner to the transaction
   * submitter and initial minimum timelock interval and default timelock
   * expiration values.
   */
  constructor() public {
    // Set initial minimum timelock interval values.
    _setInitialTimelockInterval(this.modifyTimelockInterval.selector, 4 weeks);
    _setInitialTimelockInterval(
      this.modifyTimelockExpiration.selector, 4 weeks
    );
    _setInitialTimelockInterval(this.recover.selector, 7 days);
    _setInitialTimelockInterval(this.disableAccountRecovery.selector, 3 days);

    // Set initial default timelock expiration values.
    _setInitialTimelockExpiration(this.modifyTimelockInterval.selector, 7 days);
    _setInitialTimelockExpiration(
      this.modifyTimelockExpiration.selector, 7 days
    );
    _setInitialTimelockExpiration(this.recover.selector, 7 days);
    _setInitialTimelockExpiration(this.disableAccountRecovery.selector, 7 days);
  }

  /**
   * @notice Initiates a timelocked account recovery process for a smart wallet
   * user signing key. Only the owner may call this function. Once the timelock
   * period is complete (and before it has expired) the owner may call `recover`
   * to complete the process and reset the user's signing key.
   * @param smartWallet the smart wallet address.
   * @param userSigningKey the new user signing key.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateAccountRecovery(
    address smartWallet, address userSigningKey, uint256 extraTime
  ) external onlyOwner {
    require(smartWallet != address(0), "No smart wallet address provided.");
    require(userSigningKey != address(0), "No new user signing key provided.");

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(
      this.recover.selector, abi.encode(smartWallet, userSigningKey), extraTime
    );
  }

  /**
   * @notice Timelocked function to set a new user signing key on a smart
   * wallet. Only the owner may call this function.
   * @param smartWallet Address of the smart wallet to recover a key on.
   * @param newUserSigningKey Address of the new signing key for the user.
   */
  function recover(
    address smartWallet, address newUserSigningKey
  ) external onlyOwner {
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
    DharmaSmartWalletRecovery walletToRecover = DharmaSmartWalletRecovery(
      smartWallet
    );

    // Attempt to get current signing key - a failure should not block recovery.
    address oldUserSigningKey;
    (bool ok, bytes memory data) = smartWallet.call.gas(gasleft() / 2)(
      abi.encodeWithSelector(walletToRecover.getUserSigningKey.selector)
    );
    if (ok && data.length == 32) {
      oldUserSigningKey = abi.decode(data, (address));
    }

    // Call the specified smart wallet and supply the new user signing key.
    DharmaSmartWalletRecovery(smartWallet).recover(newUserSigningKey);

    // Emit an event to signify that the wallet in question was recovered.
    emit Recovery(smartWallet, oldUserSigningKey, newUserSigningKey);
  }

  /**
   * @notice Initiates a timelocked account recovery disablement process for a
   * smart wallet. Only the owner may call this function. Once the timelock
   * period is complete (and before it has expired) the owner may call
   * `disableAccountRecovery` to complete the process and opt a smart wallet out
   * of account recovery. Once account recovery has been disabled, it cannot be
   * reenabled - the process is irreversible.
   * @param smartWallet the smart wallet address.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateAccountRecoveryDisablement(
    address smartWallet, uint256 extraTime
  ) external onlyOwner {
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
   * supported. Only the owner may call this function.
   * @param smartWallet Address of the smart wallet to disable account recovery
   * for.
   */
  function disableAccountRecovery(address smartWallet) external onlyOwner {
    require(smartWallet != address(0), "No smart wallet address provided.");

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(abi.encode(smartWallet));

    // Register the specified wallet as having opted out of account recovery.
    _accountRecoveryDisabled[smartWallet] = true;

    // Emit an event to signify the wallet in question is no longer recoverable.
    emit RecoveryDisabled(smartWallet);
  }

  /**
   * @notice External function check whether a given smart wallet has disabled
   * account recovery by opting out.
   * @param smartWallet Address of the smart wallet to check.
   * @return A boolean indicating if account recovery has been disabled for the
   * wallet in question.
   */
  function accountRecoveryDisabled(
    address smartWallet
  ) external view returns (bool hasDisabledAccountRecovery) {
    // Determine if the wallet in question has opted out of account recovery.
    hasDisabledAccountRecovery = _accountRecoveryDisabled[smartWallet];
  }

  /**
   * @notice Sets the timelock for a new timelock interval for a given function
   * selector. Only the owner may call this function.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval The new timelock interval to set for the given
   * function selector.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateModifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval, uint256 extraTime
  ) external onlyOwner {
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
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
   * @param newTimelockInterval The new timelock interval to set for the given
   * function selector.
   */
  function modifyTimelockInterval(
    bytes4 functionSelector, uint256 newTimelockInterval
  ) external onlyOwner {
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
   * @param functionSelector the selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration The new timelock expiration to set for the
   * given function selector.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateModifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration, uint256 extraTime
  ) external onlyOwner {
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
   * @param functionSelector the selector of the function to set the timelock
   * expiration for.
   * @param newTimelockExpiration The new timelock expiration to set for the
   * given function selector.
   */
  function modifyTimelockExpiration(
    bytes4 functionSelector, uint256 newTimelockExpiration
  ) external onlyOwner {
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
}