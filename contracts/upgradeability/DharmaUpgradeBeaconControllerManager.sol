pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../helpers/TwoStepOwnable.sol";
import "../helpers/Timelocker.sol";
import "../../interfaces/UpgradeBeaconControllerInterface.sol";
import "../../interfaces/DharmaUpgradeBeaconControllerManagerInterface.sol";
import "../../interfaces/TimelockerModifiersInterface.sol";


/**
 * @title DharmaUpgradeBeaconControllerManager
 * @author 0age
 * @notice This contract will be owned by DharmaUpgradeMultisig and will manage
 * upgrades to the global smart wallet and key ring implementation contracts via
 * dedicated control over the "upgrade beacon" controller contracts (and can
 * additionally be used to manage other upgrade beacon controllers). It contains
 * a set of timelocked functions, where the `setTimelock` function must first be
 * called, with the same arguments that the function will be supplied with.
 * Then, a given time interval must first fully transpire before the timelock
 * functions can be successfully called.
 *
 * The timelocked functions currently implemented include:
 *  upgrade(address controller, address implementation)
 *  transferControllerOwnership(address controller, address newOwner)
 *  modifyTimelockInterval(bytes4 functionSelector, uint256 newTimelockInterval)
 *  modifyTimelockExpiration(
 *    bytes4 functionSelector, uint256 newTimelockExpiration
 *  )
 *
 * This contract also allows for immediately triggering a "rollback" to a prior
 * implementation in the event that a new vulnerability is introduced. It can
 * roll back to any implementation for a given controller + upgrade beacon pair
 * unless that implementation has been explicitly "blocked" by the owner.
 *
 * It also specifies dedicated implementations for the Dharma Smart Wallet and
 * Dharma Key Ring upgrade beacons that can be triggered in an emergency or in
 * the event of an extended period of inactivity from Dharma. These contingency
 * implementations give the user the ability to withdraw any funds on their
 * smart wallet by submitting a transaction directly from the account of any of
 * their signing keys, but are otherwise kept as simple as possible. After 48
 * hours in the contingency state, the owner may bypass the standard upgrade
 * timelock and trigger upgrades to the smart wallet and key ring implementation
 * contracts. (Note that triggering a rollback)
 *
 * This contract can transfer ownership of any upgrade beacon controller it owns
 * (subject to the timelock on `transferControllerOwnership`), in order to
 * introduce new upgrade conditions or to otherwise alter the way that upgrades
 * are carried out.
 */
contract DharmaUpgradeBeaconControllerManager is
  DharmaUpgradeBeaconControllerManagerInterface,
  TimelockerModifiersInterface,
  TwoStepOwnable,
  Timelocker {
  using SafeMath for uint256;

  // Store prior implementation addresses for each controller + beacon pair.
  mapping(address => mapping (address => PriorImplementation[])) private _implementations;

  // New controller owners must accept ownership before a transfer can occur.
  mapping(address => mapping(address => bool)) private _willAcceptOwnership;

  // Store information on the current Adharma Contingency status.
  AdharmaContingency private _adharma;

  // Track the last heartbeat timestamp as well as the current heartbeat address
  uint256 private _lastHeartbeat;
  address private _heartbeater;

  // Store address of Smart Wallet Upgrade Beacon Controller as a constant.
  address private constant _SMART_WALLET_UPGRADE_BEACON_CONTROLLER = address(
    0x00000000002226C940b74d674B85E4bE05539663
  );

  // Store the address of the Dharma Smart Wallet Upgrade Beacon as a constant.
  address private constant _DHARMA_SMART_WALLET_UPGRADE_BEACON = address(
    0x000000000026750c571ce882B17016557279ADaa
  );

  // Store the Adharma Smart Wallet Contingency implementation.
  address private constant _ADHARMA_SMART_WALLET_IMPLEMENTATION = address(
    0x0000000053d300f11703dcDD1e90921Db83F0048
  );

  // Store address of Key Ring Upgrade Beacon Controller as a constant.
  address private constant _KEY_RING_UPGRADE_BEACON_CONTROLLER = address(
    0x00000000011dF015e8aD00D7B2486a88C2Eb8210
  );

  // Store the address of the Dharma Key Ring Upgrade Beacon as a constant.
  address private constant _DHARMA_KEY_RING_UPGRADE_BEACON = address(
    0x0000000000BDA2152794ac8c76B2dc86cbA57cad
  );

  // Store the Adharma Key Ring Contingency implementation.
  address private constant _ADHARMA_KEY_RING_IMPLEMENTATION = address(
    0x0000000055551209ABF26d0061000b3CCd81eC98
  );

  /**
   * @notice In the constructor, set tx.origin as initial owner, the initial
   * minimum timelock interval and expiration values, and some initial variable
   * values.
   */
  constructor() public {
    // Ensure Smart Wallet Upgrade Beacon Controller has correct runtime code.
    bytes32 smartWalletControllerHash;
    bytes32 expectedSmartWalletControllerHash = bytes32(
      0x6586626c057b68d99775ec4cae9aa5ce96907fb5f8d8c8046123f49f8ad93f1e
    );
    address smartWalletController = _SMART_WALLET_UPGRADE_BEACON_CONTROLLER;
    assembly { smartWalletControllerHash := extcodehash(smartWalletController) }
    require(
      smartWalletControllerHash == expectedSmartWalletControllerHash,
      "Smart Wallet Upgrade Beacon Controller runtime code hash is incorrect."
    );

    // Ensure Smart Wallet Upgrade Beacon has correct runtime code.
    bytes32 smartWalletUpgradeBeaconHash;
    bytes32 expectedSmartWalletUpgradeBeaconHash = bytes32(
      0xca51e36cf6ab9af9a6f019a923588cd6df58aa1e58f5ac1639da46931167e436
    );
    address smartWalletBeacon = _DHARMA_SMART_WALLET_UPGRADE_BEACON;
    assembly { smartWalletUpgradeBeaconHash := extcodehash(smartWalletBeacon) }
    require(
      smartWalletUpgradeBeaconHash == expectedSmartWalletUpgradeBeaconHash,
      "Smart Wallet Upgrade Beacon runtime code hash is incorrect."
    );

    // Ensure Adharma Smart Wallet implementation has the correct runtime code.
    bytes32 adharmaSmartWalletHash;
    bytes32 expectedAdharmaSmartWalletHash = bytes32(
      0x2534c2b555b9011741eabee1c96e1683bb4f58483d05d3e654f00fde85c2673c
    );
    address adharmaSmartWallet = _ADHARMA_SMART_WALLET_IMPLEMENTATION;
    assembly { adharmaSmartWalletHash := extcodehash(adharmaSmartWallet) }
    require(
      adharmaSmartWalletHash == expectedAdharmaSmartWalletHash,
      "Adharma Smart Wallet implementation runtime code hash is incorrect."
    );

    // Ensure Key Ring Upgrade Beacon Controller has correct runtime code.
    bytes32 keyRingControllerHash;
    bytes32 expectedKeyRingControllerHash = bytes32(
      0xb98d105738145a629aeea247cee5f12bb25eabc1040eb01664bbc95f0e7e8d39
    );
    address keyRingController = _KEY_RING_UPGRADE_BEACON_CONTROLLER;
    assembly { keyRingControllerHash := extcodehash(keyRingController) }
    require(
      keyRingControllerHash == expectedKeyRingControllerHash,
      "Key Ring Upgrade Beacon Controller runtime code hash is incorrect."
    );

    // Ensure Key Ring Upgrade Beacon has correct runtime code.
    bytes32 keyRingUpgradeBeaconHash;
    bytes32 expectedKeyRingUpgradeBeaconHash = bytes32(
      0xb65d03cdc199085ae86b460e897b6d53c08a6c6d436063ea29822ea80d90adc3
    );
    address keyRingBeacon = _DHARMA_KEY_RING_UPGRADE_BEACON;
    assembly { keyRingUpgradeBeaconHash := extcodehash(keyRingBeacon) }
    require(
      keyRingUpgradeBeaconHash == expectedKeyRingUpgradeBeaconHash,
      "Key Ring Upgrade Beacon runtime code hash is incorrect."
    );

    // Ensure Adharma Key Ring implementation has the correct runtime code.
    bytes32 adharmaKeyRingHash;
    bytes32 expectedAdharmaKeyRingHash = bytes32(
      0xb23aba0d8cc5eadd7cbac3b303d8e915ec35aff2a910adebe7ef05ddbaa67501
    );
    address adharmaKeyRing = _ADHARMA_KEY_RING_IMPLEMENTATION;
    assembly { adharmaKeyRingHash := extcodehash(adharmaKeyRing) }
    require(
      adharmaKeyRingHash == expectedAdharmaKeyRingHash,
      "Adharma Key Ring implementation runtime code hash is incorrect."
    );

    // Set initial minimum timelock interval values.
    _setInitialTimelockInterval(
      this.transferControllerOwnership.selector, 4 weeks
    );
    _setInitialTimelockInterval(this.modifyTimelockInterval.selector, 4 weeks);
    _setInitialTimelockInterval(
      this.modifyTimelockExpiration.selector, 4 weeks
    );
    _setInitialTimelockInterval(this.upgrade.selector, 7 days);

    // Set initial default timelock expiration values.
    _setInitialTimelockExpiration(
      this.transferControllerOwnership.selector, 7 days
    );
    _setInitialTimelockExpiration(this.modifyTimelockInterval.selector, 7 days);
    _setInitialTimelockExpiration(
      this.modifyTimelockExpiration.selector, 7 days
    );
    _setInitialTimelockExpiration(this.upgrade.selector, 7 days);

    // Set the initial owner as the initial heartbeater and trigger a heartbeat.
    _heartbeater = tx.origin;
    _lastHeartbeat = now;
  }

  /**
   * @notice Initiates a timelocked upgrade process via a given controller and
   * upgrade beacon to a given implementation address. Only the owner may call
   * this function. Once the timelock period is complete (and before it has
   * expired) the owner may call `upgrade` to complete the process and trigger
   * the upgrade.
   * @param controller address of controller to call into that will trigger the
   * update to the specified upgrade beacon.
   * @param beacon address of upgrade beacon to set the new implementation on.
   * @param implementation the address of the new implementation.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateUpgrade(
    address controller,
    address beacon,
    address implementation,
    uint256 extraTime
  ) external onlyOwner {
    require(controller != address(0), "Must specify a controller address.");

    require(beacon != address(0), "Must specify a beacon address.");

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

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(
      this.upgrade.selector,
      abi.encode(controller, beacon, implementation),
      extraTime
    );
  }

  /**
   * @notice Timelocked function to set a new implementation address on an
   * upgrade beacon contract. Note that calling this function will cause the
   * contincency state to be exited if it is currently active. Only the owner
   * may call this function.
   * @param controller address of controller to call into that will trigger the
   * update to the specified upgrade beacon.
   * @param beacon address of upgrade beacon to set the new implementation on.
   * @param implementation the address of the new implementation.
   */
  function upgrade(
    address controller, address beacon, address implementation
  ) external onlyOwner {
    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(abi.encode(controller, beacon, implementation));

    // Exit contingency state if it is currently active and trigger a heartbeat.
    _exitAdharmaContingencyIfActiveAndTriggerHeartbeat();

    // Call controller with beacon to upgrade and implementation to upgrade to.
    _upgrade(controller, beacon, implementation);
  }

  /**
   * @notice Allow a new potential owner of an upgrade beacon controller to
   * accept ownership of the controller. Anyone may call this function, though
   * ownership transfer of the controller in question will only proceed once the
   * owner calls `transferControllerOwnership`.
   * @param controller address of controller to allow ownership transfer for.
   * @param willAcceptOwnership a boolean signifying if an ownership transfer to
   * the caller is acceptable.
   */
  function agreeToAcceptControllerOwnership(
    address controller, bool willAcceptOwnership
  ) external {
    require(controller != address(0), "Must specify a controller address.");

    // Register whether or not the new owner is willing to accept ownership.
    _willAcceptOwnership[controller][msg.sender] = willAcceptOwnership;
  }

  /**
   * @notice Initiates a timelock to set a new owner on an upgrade beacon
   * controller that is owned by this contract. Only the owner may call this
   * function.
   * @param controller address of controller to transfer ownership of.
   * @param newOwner address to assign ownership of the controller to.
   * @param extraTime Additional time in seconds to add to the timelock.
   */
  function initiateTransferControllerOwnership(
    address controller, address newOwner, uint256 extraTime
  ) external onlyOwner {
    require(controller != address(0), "No controller address provided.");

    require(newOwner != address(0), "No new owner address provided.");

    // Ensure that the new owner has confirmed that it can accept ownership.
    require(
      _willAcceptOwnership[controller][newOwner],
      "New owner must agree to accept ownership of the given controller."
    );

    // Set the timelock and emit a `TimelockInitiated` event.
    _setTimelock(
      this.transferControllerOwnership.selector,
      abi.encode(controller, newOwner),
      extraTime
    );
  }

  /**
   * @notice Timelocked function to set a new owner on an upgrade beacon
   * controller that is owned by this contract.
   * @param controller address of controller to transfer ownership of.
   * @param newOwner address to assign ownership of the controller to.
   */
  function transferControllerOwnership(
    address controller, address newOwner
  ) external onlyOwner {
    // Ensure that the new owner has confirmed that it can accept ownership.
    require(
      _willAcceptOwnership[controller][newOwner],
      "New owner must agree to accept ownership of the given controller."
    );

    // Ensure that the timelock has been set and is completed.
    _enforceTimelock(abi.encode(controller, newOwner));

    // Transfer ownership of the controller to the new owner.
    TwoStepOwnable(controller).transferOwnership(newOwner);
  }

  /**
   * @notice Send a new heartbeat. If 90 days pass without a heartbeat, anyone
   * may trigger the Adharma Contingency and force an upgrade to any controlled
   * upgrade beacon.
   */
  function heartbeat() external {
    require(msg.sender == _heartbeater, "Must be called from the heartbeater.");
    _lastHeartbeat = now;
  }

  /**
   * @notice Set a new heartbeater.
   * @param heartbeater address to designate as the heartbeating address.
   */
  function newHeartbeater(address heartbeater) external onlyOwner {
    require(heartbeater != address(0), "Must specify a heartbeater address.");
    _heartbeater = heartbeater;
  }

  /**
   * @notice Arm the Adharma Contingency upgrade. This is required as an extra
   * safeguard against accidentally triggering the Adharma Contingency.
   * @param armed Boolean that signifies the desired armed status.
   */
  function armAdharmaContingency(bool armed) external {
    // Non-owners can only call if 90 days have passed since the last heartbeat.
    _ensureCallerIsOwnerOrDeadmansSwitchActivated();

    // Arm (or disarm) the Adharma Contingency.
    _adharma.armed = armed;
  }

  /**
   * @notice Trigger the Adharma Contingency upgrade. This requires that the
   * owner first call `armAdharmaContingency` and set `armed` to `true`. This is
   * only to be invoked in cases of a time-sensitive emergency, or if the owner
   * has become inactive for over 90 days. It also requires that the Upgrade
   * Beacon Controller Manager contract still owns the specified upgrade beacon
   * controllers. It will simultaneously upgrade the Smart Wallet and the Key
   * Ring implementations to their designated contingency implementations.
   */
  function activateAdharmaContingency() external {
    // Non-owners can only call if 90 days have passed since the last heartbeat.
    _ensureCallerIsOwnerOrDeadmansSwitchActivated();

    // Ensure that the Adharma Contingency has been armed.
    require(
      _adharma.armed,
      "Adharma Contingency is not armed - are SURE you meant to call this?"
    );

    // Ensure that the Adharma Contingency is not already active.
    require(!_adharma.activated, "Adharma Contingency is already activated.");

    // Ensure this contract still owns the required upgrade beacon controllers.
    _ensureOwnershipOfSmartWalletAndKeyRingControllers();

    // Mark the Adharma Contingency as having been activated.
    _adharma = AdharmaContingency({
      armed: false,
      activated: true,
      activationTime: now
    });

    // Trigger upgrades on both beacons to the Adharma implementation contracts.
    _upgrade(
      _SMART_WALLET_UPGRADE_BEACON_CONTROLLER,
      _DHARMA_SMART_WALLET_UPGRADE_BEACON,
      _ADHARMA_SMART_WALLET_IMPLEMENTATION
    );
    _upgrade(
      _KEY_RING_UPGRADE_BEACON_CONTROLLER,
      _DHARMA_KEY_RING_UPGRADE_BEACON,
      _ADHARMA_KEY_RING_IMPLEMENTATION
    );

    // Emit an event to signal that the Adharma Contingency has been activated.
    emit AdharmaContingencyActivated();
  }

  /**
   * @notice Roll back an upgrade to a prior implementation and exit from
   * contingency status if one currently exists. Note that you can also "roll
   * forward" a rollback to restore it to a more recent implementation that has
   * been rolled back from. If the Adharma Contingency state is activated,
   * triggering a rollback will cause it to be immediately exited - in that
   * event it is recommended to simultaneously roll back both the smart wallet
   * implementation and the key ring implementation.
   * @param controller address of controller to call into that will trigger the
   * rollback on the specified upgrade beacon.
   * @param beacon address of upgrade beacon to roll back to the last
   * implementation.
   * @param index uint256 the index of the implementation to roll back to.
   */
  function rollback(
    address controller, address beacon, uint256 index
  ) external onlyOwner {
    // Ensure that there is an implementation address to roll back to.
    require(
      _implementations[controller][beacon].length > index,
      "No implementation with the given index available to roll back to."
    );

    // Get the specified prior implementation.
    PriorImplementation memory priorImplementation = (
      _implementations[controller][beacon][index]
    );

    // Ensure rollbacks to the implementation have not already been blocked.
    require(
      !priorImplementation.rollbackBlocked,
      "Rollbacks to this implementation have been permanently blocked."
    );

    // Exit contingency state if it is currently active and trigger a heartbeat.
    _exitAdharmaContingencyIfActiveAndTriggerHeartbeat();

    // Upgrade to the specified implementation contract.
    _upgrade(controller, beacon, priorImplementation.implementation);
  }

  /**
   * @notice Permanently prevent a prior implementation from being rolled back
   * to. This can be used to prevent accidentally rolling back to an
   * implementation with a known vulnerability, or to remove the possibility of
   * a rollback once the security of more recent implementations has been firmly
   * established. Note that a blocked implementation can still be upgraded to in
   * the usual fashion, and after an additional upgrade it will become possible
   * to roll back to it unless it is blocked again. Only the owner may call this
   * function.
   * @param controller address of controller that was used to set the
   * implementation.
   * @param beacon address of upgrade beacon that the implementation was set on.
   * @param index uint256 the index of the implementation to block rollbacks to.
   */
  function blockRollback(
    address controller, address beacon, uint256 index
  ) external onlyOwner {
    // Ensure that there is an implementation address to roll back to.
    require(
      _implementations[controller][beacon].length > index,
      "No implementation with the given index available to block."
    );

    // Ensure rollbacks to the implementation have not already been blocked.
    require(
      !_implementations[controller][beacon][index].rollbackBlocked,
      "Rollbacks to this implementation are aleady blocked."
    );

    // Permanently lock rollbacks to the implementation in question.
    _implementations[controller][beacon][index].rollbackBlocked = true;
  }

  /**
   * @notice Exit the Adharma Contingency by upgrading to new smart wallet and
   * key ring implementation contracts. This requires that the contingency is
   * currently activated and that at least 48 hours has elapsed since it was
   * activated. Only the owner may call this function.
   * @param smartWalletImplementation Address of the new smart wallet
   * implementation.
   * @param keyRingImpmementation Address of the new key ring implementation.
   */
  function exitAdharmaContingency(
    address smartWalletImplementation, address keyRingImpmementation
  ) external onlyOwner {
    // Ensure that the Adharma Contingency is currently active.
    require(
      _adharma.activated, "Adharma Contingency is not currently activated."
    );

    // Ensure that at least 48 hours has elapsed since the contingency commenced.
    require(
      now > _adharma.activationTime + 48 hours,
      "Cannot exit contingency with a new upgrade until 48 hours have elapsed."
    );

    // Ensure this contract still owns the required upgrade beacon controllers.
    _ensureOwnershipOfSmartWalletAndKeyRingControllers();

    // Exit the contingency state and trigger a heartbeat.
    _exitAdharmaContingencyIfActiveAndTriggerHeartbeat();

    // Trigger upgrades on both beacons to the Adharma implementation contracts.
    _upgrade(
      _SMART_WALLET_UPGRADE_BEACON_CONTROLLER,
      _DHARMA_SMART_WALLET_UPGRADE_BEACON,
      smartWalletImplementation
    );
    _upgrade(
      _KEY_RING_UPGRADE_BEACON_CONTROLLER,
      _DHARMA_KEY_RING_UPGRADE_BEACON,
      keyRingImpmementation
    );
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

  /**
   * @notice Get a count of total prior implementations for a given controller
   * and upgrade beacon.
   * @param controller address of controller that was used to set the
   * implementations.
   * @param beacon address of upgrade beacon that the implementations were set
   * on.
   * @return The total number of prior implementations.
   */
  function getTotalPriorImplementations(
    address controller, address beacon
  ) external view returns (uint256 totalPriorImplementations) {
    // Get the total number of prior implementation contracts.
    totalPriorImplementations = _implementations[controller][beacon].length;
  }

  /**
   * @notice Get an implementation contract that has been used in the past for a
   * specific controller and beacon by index, and determine whether or not the
   * implementation can be rolled back to or not.
   * @param controller address of controller that was used to set the
   * implementation.
   * @param beacon address of upgrade beacon that the implementation was set on.
   * @param index uint256 the index of the implementation.
   * @return The address of the prior implementation if one exists and a boolean
   * representing whether or not the prior implementation can be rolled back to.
   */
  function getPriorImplementation(
    address controller, address beacon, uint256 index
  ) external view returns (address priorImplementation, bool rollbackAllowed) {
    // Ensure that there is an implementation address with the given index.
    require(
      _implementations[controller][beacon].length > index,
      "No implementation contract found with the given index."
    );

    // Get information on the specified prior implementation contract.
    PriorImplementation memory implementation = (
      _implementations[controller][beacon][index]
    );

    priorImplementation = implementation.implementation;
    rollbackAllowed = (
      priorImplementation != address(0) && !implementation.rollbackBlocked
    );
  }

  /**
   * @notice Determine if the Adharma Contingency state is currently armed or
   * activated, and if so, what time it was activated. An upgrade to arbitrary
   * smart wallet and key ring implementations can be performed by the owner
   * after 48 hours has elapsed in the contingency state.
   */
  function contingencyStatus() external view returns (
    bool armed, bool activated, uint256 activationTime
  ) {
    AdharmaContingency memory adharma = _adharma;

    armed = adharma.armed;
    activated = adharma.activated;
    activationTime = adharma.activationTime;
  }

  /**
   * @notice Determine if the deadman's switch has expired and get the time at
   * which it is set to expire (i.e. 90 days from the last heartbeat).
   * @return A boolean signifying whether the upgrade beacon controller is in an
   * expired state, as well as the expiration time.
   */
  function heartbeatStatus() external view returns (
    bool expired, uint256 expirationTime
  ) {
    (expired, expirationTime) = _heartbeatStatus();
  }

  /**
   * @notice Internal view function to determine if the deadman's switch has
   * expired and to get the time at which it is set to expire (i.e. 90 days from
   * the last heartbeat).
   * @return A boolean signifying whether the upgrade beacon controller is in an
   * expired state, as well as the expiration time.
   */
  function _heartbeatStatus() internal view returns (
    bool expired, uint256 expirationTime
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
    address controller, address beacon, address implementation
  ) private {
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

    // Try to get current implementation and store it as a prior implementation.
    (bool ok, bytes memory returnData) = beacon.call("");
    if (ok && returnData.length == 32) {
      address currentImplementation = abi.decode(returnData, (address));

      _implementations[controller][beacon].push(PriorImplementation({
        implementation: currentImplementation,
        rollbackBlocked: false
      }));
    }

    // Trigger the upgrade to the new implementation contract.
    UpgradeBeaconControllerInterface(controller).upgrade(
      beacon, implementation
    );
  }

  /**
   * @notice Private function that exits the Adharma Contingency if currently
   * active and triggers a heartbeat.
   */
  function _exitAdharmaContingencyIfActiveAndTriggerHeartbeat() private {
    // Exit the contingency state if there is currently one active.
    if (_adharma.activated) {
      delete _adharma;

      emit AdharmaContingencyExited();
    }

    // Reset the heartbeat to the current time.
    _lastHeartbeat = now;
  }

  /**
   * @notice Private view function to enforce that either the owner is the
   * caller, or that the deadman's switch has been activated as a result of 90
   * days passing without a heartbeat.
   */
  function _ensureCallerIsOwnerOrDeadmansSwitchActivated() private view {
    // Do not check if heartbeat has expired if the owner is the caller.
    if (!isOwner()) {
      // Determine if 90 days have passed since the last heartbeat.
      (bool expired, ) = _heartbeatStatus();

      // Ensure that the deadman's switch is active.
      require(
        expired,
        "Only callable by the owner or after 90 days without a heartbeat."
      );
    }
  }

  /**
   * @notice Private view function to enforce that this contract is still the
   * owner of the Dharma Smart Wallet Upgrade Beacon Controller and the Dharma
   * Key Ring Upgrade Beacon Controller prior to triggering the Adharma
   * Contingency, or prior to upgrading those contracts on exiting the Adharma
   * Contingency.
   */
  function _ensureOwnershipOfSmartWalletAndKeyRingControllers() private view {
    // Ensure this contract still owns the required upgrade beacon controllers.
    require(
      TwoStepOwnable(_SMART_WALLET_UPGRADE_BEACON_CONTROLLER).isOwner(),
      "This contract no longer owns the Smart Wallet Upgrade Beacon Controller."
    );
    require(
      TwoStepOwnable(_KEY_RING_UPGRADE_BEACON_CONTROLLER).isOwner(),
      "This contract no longer owns the Key Ring Upgrade Beacon Controller."
    );
  }
}