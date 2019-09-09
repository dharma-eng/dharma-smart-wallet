pragma solidity 0.5.11;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./DharmaUpgradeBeaconController.sol";
import "./implementations/AdharmaSmartWalletImplementation.sol";
import "./helpers/Timelocker.sol";


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
 *  transferControllerOwnership(address controller, address newOwner)
 *  modifyTimelockInterval(bytes4 functionSelector, uint256 newTimelockInterval)
 *
 * It also specifies a dedicated implementation, meant for the Dharma Smart
 * Wallet upgrade beacon, that can be triggered in an emergency or in the event
 * of an extended period of inactivity from Dharma that allows for the address
 * contained at storage slot zero (the user signing key) to withdraw any funds
 * on the user's smart wallet and otherwise take full control over the smart
 * wallet.
 *
 * This contract can transfer ownership of any upgrade beacon controller it owns
 * (subject to the timelock on `transferControllerOwnership`), in order to
 * introduce new upgrade conditions or to otherwise alter the way that upgrades
 * are carried out.
 */
contract DharmaUpgradeBeaconControllerManager is Ownable, Timelocker {
  using SafeMath for uint256;

  // store the Adharma Contingency implementation. Note that this is specific to
  // smart wallets, and should not be invoked on other upgrade beacons.
  address private _adharmaImplementation;

  // store a safeguard against accidentally triggering the Adharma Contingency.
  bool private _adharmaContingencyArmed;

  // store timestamp and last implementation in case of Adharma Contingency.
  // Note that this is specific to a particular controller and beacon.
  struct AdharmaContingency {
    bool activated;
    uint256 activationTime;
  }

  mapping(address => mapping (address => address)) private _lastImplementation;

  mapping(address => mapping (address => AdharmaContingency)) private _adharmaContingency;

  // Track the last heartbeat timestamp as well as the current heartbeat address
  uint256 private _lastHeartbeat;
  address private _heartbeater;

  /**
   * @notice In the constructor, set the initial owner of this contract and the
   * initial minimum timelock interval values.
   * @param owner Initial owner of the contract.
   */
  constructor(address owner) public {
    // Set the supplied account as the initial owner of this contract.
    _transferOwnership(owner);

    // Set initial minimum timelock interval values.
    _setInitialTimelockInterval(
      this.transferControllerOwnership.selector, 4 weeks
    );
    _setInitialTimelockInterval(this.modifyTimelockInterval.selector, 4 weeks);
    _setInitialTimelockInterval(this.upgrade.selector, 7 days);

    // Deploy the Adharma Smart Wallet implementation in case of emergencies.
    _adharmaImplementation = address(new AdharmaSmartWalletImplementation());
    _adharmaContingencyArmed = false;

    // Set the owner as the initial heartbeater.
    _heartbeater = owner;
    _lastHeartbeat = now;
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
    bytes calldata arguments,
    uint256 extraTime
  ) external onlyOwner {
    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(functionSelector, arguments, extraTime);
  }

  /**
   * @notice Timelocked function to set a new implementation address on an
   * upgrade beacon contract. This function could optionally check the
   * runtime code of the specified upgrade beacon, but that step is not strictly
   * necessary.
   * @param controller address of controller to call into that will trigger the
   * update to the specified upgrade beacon.
   * @param beacon address of upgrade beacon to set the new implementation on.
   * @param implementation the address of the new implementation.
   */
  function upgrade(
    address controller,
    address beacon,
    address implementation
  ) external onlyOwner {
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
      this.upgrade.selector, abi.encode(controller, beacon, implementation)
    );
    
    // Call controller with beacon to upgrade and implementation to upgrade to.
    _upgrade(controller, beacon, implementation);
  }

  /**
   * @notice Timelocked function to set a new owner on an upgrade beacon
   * controller.
   */
  function transferControllerOwnership(
    address controller,
    address newOwner
  ) external onlyOwner {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(
      this.transferControllerOwnership.selector,
      abi.encode(controller, newOwner)
    );
    
    // Transfer ownership of the controller to the new owner.
    Ownable(controller).transferOwnership(newOwner);
  }

  /**
   * @notice Send a new heartbeat.
   */
  function heartbeat() external {
    require(msg.sender == _heartbeater, "Must be called from the heartbeater.");
    _lastHeartbeat = now;
  }

  /**
   * @notice Set a new heartbeater.
   */
  function newHeartbeater(address heartbeater) external onlyOwner {
    require(heartbeater != address(0), "Must specify a heartbeater address.");
    _heartbeater = heartbeater;
  }

  /**
   * @notice Arm the Adharma Contingency upgrade. This is required as an extra
   * safeguard against accidentally triggering the Adharma Contingency.
   */
  function armAdharmaContingency(bool armed) external {
    // Determine if 90 days have passed since the last heartbeat.
    (bool expired, ) = heartbeatStatus();
    require(
      isOwner() || expired,
      "Only callable by the owner or after 90 days without a heartbeat."
    );

    // Arm (or disarm) the Adharma Contingency.
    _adharmaContingencyArmed = armed;
  }

  /**
   * @notice Trigger the Adharma Contingency upgrade. This requires that the
   * owner first call `armAdharmaContingency` and set `armed` to `true`. This is
   * only to be invoked in cases of a time-sensitive emergency, or if the owner
   * has become inactive for over 90 days.
   * @param controller address of controller to call into that will trigger the
   * update to the Adharma contingency implementation on the specified upgrade
   * beacon.
   * @param beacon address of upgrade beacon to set the Adharma contingency
   * implementation on.
   */
  function activateAdharmaContingency(
    address controller,
    address beacon
  ) external {
    // Determine if 90 days have passed since the last heartbeat.
    (bool expired, ) = heartbeatStatus();
    require(
      isOwner() || expired,
      "only callable by the owner or after 90 days without a heartbeat."
    );

    // Ensure that the Adharma Contingency has been armed.
    require(
      _adharmaContingencyArmed,
      "Adharma Contingency is not armed - are SURE you meant to call this?"
    );

    require(
      !_adharmaContingency[controller][beacon].activated,
      "Adharma Contingency is already activated on this controller + beacon."
    );

    // Mark the Adharma Contingency as having been activated.
    _adharmaContingency[controller][beacon] = AdharmaContingency({
      activated: true,
      activationTime: now
    });

    // Disarm the Adharma Contingency so that it is not mistakenly retriggered.
    _adharmaContingencyArmed = false;

    // Trigger the upgrade to the Adharma Smart Wallet implementation contract.
    _upgrade(controller, beacon, _adharmaImplementation);
  }

  /**
   * @notice Roll back an upgrade to the last implementation and exit from
   * contingency status if one currently exists. Note that you can also roll
   * back a rollback to restore it back to the original implementation that was
   * just rolled back from.
   * @param controller address of controller to call into that will trigger the
   * rollback on the specified upgrade beacon.
   * @param beacon address of upgrade beacon to roll back to the last
   * implementation.
   */
  function rollback(address controller, address beacon) external onlyOwner {
    // Ensure that there is an implementation address to roll back to.
    require(
      _lastImplementation[controller][beacon] != address(0),
      "No prior implementation to roll back to."
    );

    // Exit the contingency state if there is currently one active.
    if (_adharmaContingency[controller][beacon].activated) {
      delete _adharmaContingency[controller][beacon];
    } else {
      // Reenter the contingency state if the last implementation is set to it.
      if (_lastImplementation[controller][beacon] == _adharmaImplementation) {
        _adharmaContingency[controller][beacon] = AdharmaContingency({
          activated: true,
          activationTime: now
        });
      }
    }

    // Upgrade to the last implementation contract.
    _upgrade(controller, beacon, _lastImplementation[controller][beacon]);
  }

  /**
   * @notice Exit the Adharma Contingency by upgrading to a new contract. This
   * requires that the contingency is currently activated and that at least 48
   * hours has elapsed since it was activated.
   * @param controller address of controller to call into that will trigger the
   * update to the Adharma contingency implementation on the specified upgrade
   * beacon.
   * @param beacon address of upgrade beacon to set the Adharma contingency
   * implementation on.
   * @param implementation the address of the new implementation.
   */
  function exitAdharmaContingency(
    address controller,
    address beacon,
    address implementation
  ) external onlyOwner {
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

    // Exit the contingency state.
    delete _adharmaContingency[controller][beacon];

    // Call controller with beacon to upgrade and implementation to upgrade to.
    _upgrade(controller, beacon, implementation);
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

  /**
   * @notice Determine if the deadman's switch has expired and the expiration
   * time (90 days from the last heartbeat).
   */
  function heartbeatStatus() public view returns (
    bool expired,
    uint256 expirationTime
  ) {
    expirationTime = _lastHeartbeat + 90 days;
    expired = now > expirationTime;
  }

  /**
   * @notice Private function that sets a new implementation address on an
   * upgrade beacon contract.
   * @param controller address of controller to call into that will trigger the
   * update to the specified upgrade beacon.
   * @param beacon address of upgrade beacon to set the new implementation on.
   * @param implementation the address of the new implementation.
   */
  function _upgrade(
    address controller,
    address beacon,
    address implementation
  ) private {
    // Try to get current implementation contract, defaulting to null address.
    address currentImplementation;
    (bool ok, bytes memory returnData) = beacon.call("");
    if (ok && returnData.length == 32) {
      currentImplementation = abi.decode(returnData, (address));
    } else {
      currentImplementation = address(0);
    }

    // Record the last implementation in case it needs to be restored.
    _lastImplementation[controller][beacon] = currentImplementation;

    // Trigger the upgrade to the new implementation contract.
    DharmaUpgradeBeaconController(controller).upgrade(beacon, implementation);
  }
}
