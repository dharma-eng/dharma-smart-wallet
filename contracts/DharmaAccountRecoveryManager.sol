pragma solidity 0.5.11;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./implementations/DharmaSmartWalletImplementationV1.sol";


/**
 * @title DharmaAccountRecoveryManager
 * @author 0age
 * @notice This contract will be owned by DharmaAccountRecoveryMultisig and will
 * manage resets to user's Dharma keys. It implements a set of timelocked
 * functions, where the `setTimelock` function must first be called, with the
 * same arguments that the function will be supplied with. Then, a given time
 * interval must first fully transpire before the timelock functions can be
 * successfully called.
 *
 * The timelocked functions currently implemented include:
 *  recover(address wallet, address newDharmaKey)
 *  modifyTimelockInterval(bytes4 functionSelector, uint256 newTimelockInterval)
 *
 * Note that special care should be taken to differentiate between lost keys and
 * compromised keys, and that the danger of a user being impersonated is
 * extremely high.
 */
contract DharmaAccountRecoveryManager is Ownable {
  using SafeMath for uint256;

  // Fire an event any time a time lock is initiated to signal incoming upgrade.
  event TimelockInitiated(
    bytes4 functionSelector, // selector of the function 
    uint256 timeComplete,    // timestamp at which the function can be called
    bytes arguments          // abi-encoded function arguments to call with
  );

  // Implement a timelock for each function and set of arguments.
  mapping(bytes4 => mapping(bytes32 => uint256)) private _timelocks;

  // Implement a timelock interval for each timelocked function.
  mapping(bytes4 => uint256) private _timelockIntervals;

  /**
   * @notice In the constructor, set the initial owner of this contract and the
   * initial minimum timelock interval values.
   * @param owner Initial owner of the contract.
   */
  constructor(address owner) public {
    // Set the supplied account as the initial owner of this contract.
    _transferOwnership(owner);

    // Set initial minimum timelock interval values.
    _timelockIntervals[this.modifyTimelockInterval.selector] = 4 weeks;
    _timelockIntervals[this.recover.selector] = 7 days;
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
   * in the case of `update`, it is the beacon address and the implementation
   * address, each encoded as left-padded 32-byte values.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function setTimelock(
    bytes4 functionSelector,
    bytes memory arguments,
    uint256 extraTime
  ) public onlyOwner {
    // Get timelock using current time, inverval for timelock ID, & extra time.
    uint256 timelock = _timelockIntervals[functionSelector].add(now).add(extraTime);

    // Get timelock ID using the function arguments.
    bytes32 timelockID = _getTimelockID(arguments);

    // Get the current timelock, if any.
    uint256 currentTimelock = _timelocks[functionSelector][timelockID];

    // Ensure that the timelock does not decrease. Note that the same function
    // may set up a new, shorter timelock on a call with different arguments.
    require(
      currentTimelock == 0 || timelock > currentTimelock,
      "Cannot shorten an existing timelock."
    );

    // Set time that timelock will be complete using timelock ID and extra time.
    _timelocks[functionSelector][timelockID] = timelock;

    // Emit an event with all of the relevant information.
    emit TimelockInitiated(functionSelector, timelock, arguments);
  }

  /**
   * @notice Timelocked function to set a new Dharma key on a smart wallet.
   * @param wallet Address of the smart wallet to recover a key on.
   * @param newDharmaKey Address of the new signing key for the user.
   */
  function recover(address wallet, address newDharmaKey) public onlyOwner {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(this.recover.selector, abi.encode(wallet, newDharmaKey));
    
    // Call the specified smart wallet and supply the new key.
    DharmaSmartWalletImplementationV1(wallet).recover(newDharmaKey);
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
    // Ensure that the function selector is specified.
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

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.modifyTimelockInterval.selector,
      abi.encode(newTimelockInterval)
    );
    
    // Update the timelock interval on the provided function.
    _timelockIntervals[functionSelector] = newTimelockInterval;
  }

  /**
   * @notice View function to check if a timelock for the specified function and
   * arguments has completed.
   * @param functionSelector function to be called.
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `update`, it is the beacon controller address, the beacon
   * address, and the implementation address, each encoded as left-padded
   * 32-byte values.
   * @return A boolean indicating if the timelock is complete or not.
   */
  function isTimelockComplete(
    bytes4 functionSelector,
    bytes memory arguments
  ) public view returns (bool complete) {
    // Get timelock ID using the target arguments.
    bytes32 timelockID = _getTimelockID(arguments);

    // Get the current timelock, if any.
    uint256 currentTimelock = _timelocks[functionSelector][timelockID];

    // Ensure that the timelock is set and has completed.
    if (currentTimelock != 0 && currentTimelock <= now) {
      complete = true;
    }
  }

  /**
   * @notice View function to check the current minimum timelock interval on a
   * given function.
   * @param functionSelector function to retrieve the timelock interval for.
   */
  function getTimelockInterval(bytes4 functionSelector) public view returns (uint256) {
    return _timelockIntervals[functionSelector];
  }

  /**
   * @notice Private function to ensure that a timelock is complete and to clear
   * the existing timelock so it cannot later be reused.
   * @param functionSelector function to be called.   
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `update`, it is the beacon controller address, the beacon
   * address, and the implementation address, each encoded as left-padded
   * 32-byte values.
   */
  function _enforceTimelock(
    bytes4 functionSelector,
    bytes memory arguments
  ) private {
    // Ensure that the timelock is set and has completed.
    require(
      isTimelockComplete(functionSelector, arguments),
      "Function cannot be called until a timelock has been set and has expired."
    );

    // Get timelock ID using the beacon and target address.
    bytes32 timelockID = _getTimelockID(arguments);

    // Clear out the existing timelock so that it cannot be reused.
    delete _timelocks[functionSelector][timelockID];
  }

  /**
   * @notice Private view function to get the timelock ID associated with a
   * given function and arguments.
   * @param arguments The abi-encoded arguments of the function to be called -
   * in the case of `update`, it is the beacon controller address, the beacon
   * address, and the implementation address, each encoded as left-padded
   * 32-byte values.
   * @return The timelock ID.
   */
  function _getTimelockID(
    bytes memory arguments
  ) private pure returns (bytes32 timelockID) {
    // Get timelock ID using the beacon and target address.
    timelockID = keccak256(abi.encodePacked(arguments));
  }
}
