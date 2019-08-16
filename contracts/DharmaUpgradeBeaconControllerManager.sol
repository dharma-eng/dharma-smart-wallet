pragma solidity 0.5.11;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./DharmaUpgradeBeaconController.sol";
import "./implementations/AdharmaSmartWalletImplementation.sol";

/**
 * @title DharmaUpgradeBeaconControllerManager
 * @author 0age
 * @notice This contract will be owned by DharmaUpgradeMultisig and will manage
 * upgrades to the global smart wallet implementation via dedicated control over
 * an "upgrade beacon" controller contract (and can additionally be used to
 * manage other upgrade beacon controllers). It implements a set of timelocked
 * functions, where the `setTimelock` function must first be called, with the
 * same arguments that the function will be supplied with. Then, a given time
 * interval must first fully transpire before the timelock functions can be
 * successfully called.
 *
 * The timelocked functions currently implemented include:
 *  upgrade(address controller, address implementation)
 *  freeze(address controller)
 *  transferControllerOwnership(address controller, address newOwner)
 *  modifyTimelockInterval(bytes4 functionSelector, uint256 newTimelockInterval)
 *
 * Note that, for the Dharma Smart Wallet, we could also provide an `unwind` or
 * `triggerGlobalSettlement` function in the event of catastrophic failure that
 * would set an implementation on the upgrade beacon that would allow the
 * address contained at storage slot zero (or the Dharma Key) to withdraw any
 * funds on the user's smart wallet and/or take full control of the account.
 *
 * This contract can transfer ownership of any upgrade beacon controller it owns
 * (subject to the timelock on `transferControllerOwnership`), in order to
 * introduce new upgrade conditions or to otherwise alter the way that upgrades
 * are carried out.
 */
contract DharmaUpgradeBeaconControllerManager is Ownable {
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

  // store the Adharma Contingency implementation. Note that this is specific to
  // smart wallets, and should not be invoked on other upgrade beacons.
  address private _adharmaImplementation;

  // store a safeguard against accidentally triggering the Adharma Contingency.
  bool private _adharmaContingencyArmed;

  // store timestamp and last implementation in case of Adharma Contingency.
  // Note that this is specific to a particular controller and beacon.
  struct AdharmaContingency {
    bool activated;
    address lastImplementation;
    uint256 activationTime;
  }
  mapping(address => mapping (address => AdharmaContingency)) private _adharmaContingency;

  /**
   * @notice In the constructor, set the initial owner of this contract and the
   * initial minimum timelock interval values.
   * @param owner Initial owner of the contract.
   */
  constructor(address owner) public {
    // Set the supplied account as the initial owner of this contract.
    _transferOwnership(owner);

    // Set initial minimum timelock interval values.
    _timelockIntervals[this.transferControllerOwnership.selector] = 4 weeks;
    _timelockIntervals[this.modifyTimelockInterval.selector] = 4 weeks;
    _timelockIntervals[this.upgrade.selector] = 7 days;
    _timelockIntervals[this.freeze.selector] = 3 days;

    // Deploy the Adharma Smart Wallet implementation in case of emergencies.
    _adharmaImplementation = address(new AdharmaSmartWalletImplementation());
    _adharmaContingencyArmed = false;
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
   * @notice Timelocked function to set a new implementation address on an
   * upgrade beacon contract. This function could optionally check the
   * runtime code of the specified upgrade beacon.
   * @param beacon address of upgrade beacon to set the new implementation on.
   * @param implementation the address of the new implementation.
   */
  function upgrade(
    address controller,
    address beacon,
    address implementation
  ) public onlyOwner {
    // Ensure that the implementaton contract is not the null address.
    require(
      implementation != address(0),
      "Implementation cannot be the null address."
    );

    // Ensure that the implementation contract has code via extcodesize.
    uint256 size;
    assembly {
      size := extcodesize(implementation)
    }
    require(size > 0, "Implementation must have contract code.");

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.upgrade.selector,
      abi.encode(controller, beacon, implementation)
    );
    
    // Call controller with beacon to upgrade and implementation to upgrade to.
    DharmaUpgradeBeaconController(controller).upgrade(beacon, implementation);
  }

  /**
   * @notice Timelocked function to clear the implementation address from the
   * specified upgrade beacon contract, which will freeze all contracts that
   * rely on that upgrade beacon. This function could optionally check the
   * runtime code of the specified upgrade beacon.
   * @param beacon address of upgrade beacon to remove the implementation from.
   */
  function freeze(address controller, address beacon) public onlyOwner {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(this.freeze.selector, abi.encode(controller, beacon));
    
    // Call controller with beacon to upgrade and implementation to upgrade to.
    DharmaUpgradeBeaconController(controller).freeze(beacon);
  }

  /**
   * @notice Timelocked function to set a new owner on an upgrade beacon
   * controller.
   */
  function transferControllerOwnership(
    address controller,
    address newOwner
  ) public onlyOwner {
    // Ensure that a new owner is specified.
    require(
      newOwner != address(0),
      "New owner must be specified."
    );

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.transferControllerOwnership.selector,
      abi.encode(controller, newOwner)
    );
    
    // Transfer ownership of the controller to the new owner.
    Ownable(controller).transferOwnership(newOwner);
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
   * @notice Arm the Adharma Contingency upgrade. This is required as an extra
   * safeguard against accidentally triggering the Adharma Contingency.
   */
  function armAdharmaContingency(
    bool armed
  ) public onlyOwner {
    // Arm (or disarm) the Adharma Contingency.
    _adharmaContingencyArmed = armed;
  }

  /**
   * @notice Trigger the Adharma Contingency upgrade. This requires that the
   * owner first call `armAdharmaContingency` and set `armed` to `true`. This is
   * only to be invoked in cases of a time-sensitive emergency.
   */
  function activateAdharmaContingency(
    address controller,
    address beacon
  ) public onlyOwner {
    // Ensure that the Adharma Contingency has been armed.
    require(
      _adharmaContingencyArmed,
      "Adharma Contingency is not armed - are SURE you meant to call this?"
    );

    // Try to get current implementation contract, defaulting to null address.
    address currentImplementation;
    (bool ok, bytes memory returnData) = beacon.call("");
    if (ok && returnData.length == 32) {
      currentImplementation = abi.decode(returnData, (address));
    } else {
      currentImplementation = address(0);
    }

    // Record the last implementation in case it needs to be restored.
    _adharmaContingency[controller][beacon] = AdharmaContingency({
      activated: true,
      lastImplementation: currentImplementation,
      activationTime: now
    });

    // Trigger the upgrade to the Adharma Smart Wallet implementation contract.
    DharmaUpgradeBeaconController(controller).upgrade(
      beacon,
      _adharmaImplementation
    );

    // Disarm the Adharma Contingency so that it is not mistakenly retriggered.
    _adharmaContingencyArmed = false;
  }

  /**
   * @notice Roll back a Adharma Contingency upgrade. This requires that the
   * contingency is currently activated. 
   */
  function rollbackAdharmaContingency(
    address controller,
    address beacon
  ) public onlyOwner {
    // Ensure that the Adharma Contingency is currently active.
    require(
      _adharmaContingency[controller][beacon].activated,
      "Adharma Contingency is not currently activated."
    );

    // Ensure that there is an implementation address to roll back to.
    require(
      _adharmaContingency[controller][beacon].lastImplementation != address(0),
      "No prior implementation to roll back to."
    );

    // Upgrade to the implementation contract before the contingency.
    DharmaUpgradeBeaconController(controller).upgrade(
      beacon,
      _adharmaContingency[controller][beacon].lastImplementation
    );

    // Exit the contingency state.
    delete _adharmaContingency[controller][beacon];
  }

  /**
   * @notice Exit the Adharma Contingency by upgrading to a new contract. This
   * requires that the contingency is currently activated and that at least 48
   * hours has elapsed since it was activated.
   */
  function exitAdharmaContingency(
    address controller,
    address beacon,
    address implementation
  ) public onlyOwner {
    // Ensure that the Adharma Contingency is currently active.
    require(
      _adharmaContingency[controller][beacon].activated,
      "Adharma Contingency is not currently activated."
    );

    // Ensure that at least 48 hours has elapsed since the contingency commenced.
    require(
      now > _adharmaContingency[controller][beacon].activationTime + 48 hours,
      "Cannot exit contingency with a new upgrade until 48 hours have elapsed."
    );

    // Trigger the upgrade to the Adharma Smart Wallet implementation contract.
    DharmaUpgradeBeaconController(controller).upgrade(beacon, implementation);

    // Exit the contingency state.
    delete _adharmaContingency[controller][beacon];
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
