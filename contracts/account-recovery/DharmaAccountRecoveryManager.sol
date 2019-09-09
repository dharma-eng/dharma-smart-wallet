pragma solidity 0.5.11;

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
 * extremely high.
 */
contract DharmaAccountRecoveryManager is Ownable, Timelocker {
  using SafeMath for uint256;

  /**
   * @notice In the constructor, set the initial owner of this contract and the
   * initial minimum timelock interval values.
   * @param owner Initial owner of the contract.
   */
  constructor(address owner) public {
    // Set the supplied account as the initial owner of this contract.
    _transferOwnership(owner);

    // Set initial minimum timelock interval values.
    _setInitialTimelockInterval(this.modifyTimelockInterval.selector, 4 weeks);
    _setInitialTimelockInterval(this.recover.selector, 7 days);
  }

  /**
   * @notice Sets a timelock so that the specified function can be called with
   * the specified arguments. Note that existing timelocks may be extended, but
   * not shortened - this can also be used as a method for "cancelling" an
   * upgrade by extending the timelock to an arbitrarily long duration. Keep in
   * mind that new timelocks may be created with a shorter duration on functions
   * that already have other timelocks on them, but only if they have different
   * arguments.
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
    // Set the timelock and emit an event.
    _setTimelock(functionSelector, arguments, extraTime);
  }

  /**
   * @notice Timelocked function to set a new user signing key on a smart
   * wallet.
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
    
    // Call the specified smart wallet and supply the new user signing key.
    DharmaSmartWalletRecovery(wallet).recover(newUserSigningKey);
  }

  /**
   * @notice Sets a new timelock interval for a given function selector. The
   * default for this function may also be modified, but has a maximum allowable
   * value of eight weeks.
   * @param functionSelector the selector of the function to set the timelock
   * interval for.
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
