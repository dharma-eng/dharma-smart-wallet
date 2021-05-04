// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../../proxies/UpgradeBeaconProxyV1.sol";
import "../../../interfaces/DharmaSmartWalletFactoryV1Interface.sol";
import "../../../interfaces/DharmaSmartWalletInitializer.sol";


/**
 * @title DharmaSmartWalletFactoryV3
 * @author 0age
 * @notice This contract deploys new Dharma Smart Wallet instances as "Upgrade
 * Beacon" proxies that reference a shared implementation contract specified by
 * the Dharma Upgrade Beacon contract.
 */
contract DharmaSmartWalletFactoryV3 is DharmaSmartWalletFactoryV1Interface {
  // Store the upgrade beacon used by the proxies as a constant.
  address private immutable _UPGRADE_BEACON;

  // Use Dharma Smart Wallet initializer to construct initialization calldata.
  bytes4 private immutable _INITIALIZE;

  constructor(address upgradeBeacon) {
    // Set the upgrade beacon that will be used by the proxies.
    _UPGRADE_BEACON = upgradeBeacon;

    // set the initializer function selector as a constant.
    DharmaSmartWalletInitializer _initializer;
    _INITIALIZE = _initializer.initialize.selector;
  }

  /**
   * @notice Deploy a new smart wallet address using the provided user signing
   * key.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @return wallet - the address of the new smart wallet.
   */
  function newSmartWallet(
    address userSigningKey
  ) external override returns (address wallet) {
    // Get initialization calldata from initialize selector & user signing key.
    bytes memory initializationCalldata = abi.encodeWithSelector(
      _INITIALIZE,
      userSigningKey
    );

    // Initialize and deploy new user smart wallet as an Upgrade Beacon proxy.
    wallet = _deployUpgradeBeaconProxyInstance(initializationCalldata);

    // Emit an event to signal the creation of the new smart wallet.
    emit SmartWalletDeployed(wallet, userSigningKey);
  }

  /**
   * @notice View function to find the address of the next smart wallet address
   * that will be deployed for a given user signing key. Note that a new value
   * will be returned if a particular user signing key has been used before.
   * @param userSigningKey address The user signing key, supplied as a
   * constructor argument.
   * @return wallet - the future address of the next smart wallet.
   */
  function getNextSmartWallet(
    address userSigningKey
  ) external view override returns (address wallet) {
    // Get initialization calldata from initialize selector & user signing key.
    bytes memory initializationCalldata = abi.encodeWithSelector(
      _INITIALIZE,
      userSigningKey
    );

    // Determine the user's smart wallet address based on the user signing key.
    wallet = _computeNextAddress(initializationCalldata);
  }

  /**
   * @notice Private function to deploy an upgrade beacon proxy via `CREATE2`.
   * @param initializationCalldata bytes The calldata that will be supplied to
   * the `DELEGATECALL` from the deployed contract to the implementation set on
   * the upgrade beacon during contract creation.
   * @return upgradeBeaconProxyInstance - the address of the newly-deployed upgrade beacon proxy.
   */
  function _deployUpgradeBeaconProxyInstance(
    bytes memory initializationCalldata
  ) private returns (address upgradeBeaconProxyInstance) {
    // Place creation code and constructor args of new proxy instance in memory.
    bytes memory initCode = abi.encodePacked(
      type(UpgradeBeaconProxyV1).creationCode,
      abi.encode(
        _UPGRADE_BEACON,
        initializationCalldata
      )
    );

    // Get salt to use during deployment using the supplied initialization code.
    (uint256 salt, ) = _getSaltAndTarget(initCode);

    // Deploy the new upgrade beacon proxy contract using `CREATE2`.
    assembly {
      let encoded_data := add(32, initCode)  // load initialization code.
      let encoded_size := mload(initCode)    // load the init code's length.
      upgradeBeaconProxyInstance := create2( // call `CREATE2` w/ 4 arguments.
        callvalue(),                         // forward any supplied endowment.
        encoded_data,                        // pass in initialization code.
        encoded_size,                        // pass in init code's length.
        salt                                 // pass in the salt value.
      )

      // Pass along failure message and revert if contract deployment fails.
      if iszero(upgradeBeaconProxyInstance) {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }
  }

  /**
   * @notice Private view function for finding the address of the next upgrade
   * beacon proxy that will be deployed, given a particular initialization
   * calldata payload.
   * @param initializationCalldata bytes The calldata that will be supplied to
   * the `DELEGATECALL` from the deployed contract to the implementation set on
   * the upgrade beacon during contract creation.
   * @return target - the address of the next upgrade beacon proxy contract with the
   * given initialization calldata.
   */
  function _computeNextAddress(
    bytes memory initializationCalldata
  ) private view returns (address target) {
    // Place creation code and constructor args of the proxy instance in memory.
    bytes memory initCode = abi.encodePacked(
      type(UpgradeBeaconProxyV1).creationCode,
      abi.encode(
        _UPGRADE_BEACON,
        initializationCalldata
      )
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
                nonce,             // pass in the salt from above.
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
