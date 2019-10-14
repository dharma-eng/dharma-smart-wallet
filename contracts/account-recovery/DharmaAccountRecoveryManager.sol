pragma solidity 0.5.11; // optimization runs: 200, evm version: petersburg

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../helpers/Timelocker.sol";


interface DharmaSmartWalletRecovery {
  function recover(address newUserSigningKey) external;
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
 *  modifyTimelockInterval(bytes4 functionSelector, uint256 newTimelockInterval)
 *
 * Note that special care should be taken to differentiate between lost keys and
 * compromised keys, and that the danger of a user being impersonated is
 * extremely high. Account recovery should progress to a system where the user
 * builds their preferred account recovery procedure into a "key ring" smart
 * contract at their signing address, reserving this "hard reset" for extremely
 * unusual circumstances and eventually sunsetting it entirely.
 */
contract DharmaAccountRecoveryManager is Ownable, Timelocker {
  using SafeMath for uint256;

  // Maintain mapping of smart wallets that have opted out of account recovery.
  mapping(address => bool) private _accountRecoveryDisabled;

  /**
   * @notice In the constructor, set initial minimum timelock interval values.
   */
  constructor() public {
    // Set initial owner to the transaction submitter.
    _transferOwnership(tx.origin);

    // Set initial minimum timelock interval values.
    _setInitialTimelockInterval(this.modifyTimelockInterval.selector, 4 weeks);
    _setInitialTimelockInterval(this.recover.selector, 7 days);
    _setInitialTimelockInterval(this.disableAccountRecovery.selector, 3 days);
  }

  /**
   * @notice Sets a timelock so that the specified function can be called with
   * the specified arguments. Note that existing timelocks may be extended, but
   * not shortened - this can also be used as a method for "cancelling" an
   * account recovery by extending the timelock to an arbitrarily long duration.
   * Keep in mind that new timelocks may be created with a shorter duration on
   * functions that already have other timelocks on them, but only if they have
   * different arguments (i.e. a new wallet or user signing key is specified).
   * Only the owner may call this function.
   * @param functionSelector selector of the function to be called.
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `recover`, it is the smart wallet address and the new user
   * signing key.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function setTimelock(
    bytes4 functionSelector,
    bytes calldata arguments,
    uint256 extraTime
  ) external onlyOwner {
    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(functionSelector, arguments, extraTime);
  }

  /**
   * @notice Timelocked function to set a new user signing key on a smart
   * wallet. Only the owner may call this function.
   * @param wallet Address of the smart wallet to recover a key on.
   * @param newUserSigningKey Address of the new signing key for the user.
   */
  function recover(
    address wallet,
    address newUserSigningKey
  ) external onlyOwner {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.recover.selector, abi.encode(wallet, newUserSigningKey)
    );

    // Ensure that the wallet in question has not opted out of account recovery.
    require(
      !_accountRecoveryDisabled[wallet],
      "This wallet has elected to opt out of account recovery functionality."
    );

    // Call the specified smart wallet and supply the new user signing key.
    DharmaSmartWalletRecovery(wallet).recover(newUserSigningKey);
  }

  /**
   * @notice Timelocked function to opt a given wallet out of account recovery.
   * This action cannot be undone - any future account recovery would require an
   * upgrade to the smart wallet implementation itself and is not likely to be
   * supported. Only the owner may call this function.
   * @param wallet Address of the smart wallet to disable account recovery for.
   */
  function disableAccountRecovery(address wallet) external onlyOwner {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(this.disableAccountRecovery.selector, abi.encode(wallet));

    // Register the specified wallet as having opted out of account recovery.
    _accountRecoveryDisabled[wallet] = true;
  }

  /**
   * @notice External function check whether a given smart wallet has disabled
   * account recovery by opting out.
   * @param wallet Address of the smart wallet to check.
   * @return A boolean indicating if account recovery has been disabled for the
   * wallet in question.
   */
  function accountRecoveryDisabled(
    address wallet
  ) external view returns (bool hasDisabledAccountRecovery) {
    // Determine if the wallet in question has opted out of account recovery.
    hasDisabledAccountRecovery = _accountRecoveryDisabled[wallet];
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
    bytes4 functionSelector,
    uint256 newTimelockInterval
  ) public onlyOwner {
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

    // Continue via logic in the inherited `modifyTimelockInterval` function.
    Timelocker.modifyTimelockInterval(functionSelector, newTimelockInterval);
  }
}
