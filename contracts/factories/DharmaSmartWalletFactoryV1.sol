pragma solidity 0.5.11;

import "../UpgradeBeaconProxy.sol";


interface DharmaSmartWalletFactoryV1Interface {
  // Fires an event when a new smart wallet is deployed and initialized.
  event SmartWalletDeployed(address wallet, address dharmaKey);

  function newSmartWallet(address dharmaKey) external returns (address wallet);
  
  function getNextSmartWallet(
    address dharmaKey
  ) external view returns (address wallet);
}


interface DharmaSmartWalletInitializer {
  function initialize(address dharmaKey) external;
}


/**
 * @title DharmaSmartWalletFactoryV1
 * @author 0age
 * @notice This contract deploys new Dharma smart wallets as "Upgrade Beacon"
 * proxies that reference a shared implementation contract specified by the
 * Dharma Upgrade Beacon contract.
 */
contract DharmaSmartWalletFactoryV1 is DharmaSmartWalletFactoryV1Interface {
  // Use Dharma Smart Wallet initializer to construct initialization calldata.
  DharmaSmartWalletInitializer private _initializer;

  /**
   * @notice Deploy a new smart wallet address using the provided Dharma Key.
   * @param dharmaKey address The Dharma key supplied as a constructor argument.
   * @return The address of the new smart wallet.
   */
  function newSmartWallet(address dharmaKey) external returns (address wallet) {
    // Construct initialization calldata as initialize selector and Dharma key.
    bytes memory initializationCalldata = abi.encodeWithSelector(
      _initializer.initialize.selector,
      dharmaKey
    );
    
    // Initialize and deploy new user smart wallet as an Upgrade Beacon proxy.
    wallet = _deployUpgradeBeaconProxyInstance(initializationCalldata);

    // Emit an event to signal the creation of the new smart wallet.
    emit SmartWalletDeployed(wallet, dharmaKey);
  }

  /**
   * @notice View function to find the address of the next smart wallet address
   * that will be deployed for a given Dharma Key. Note that a new value will be
   * returned if a particular Dharma key has been used before.
   * @param dharmaKey address The Dharma key supplied as a constructor argument.
   * @return The future address of the next smart wallet.
   */
  function getNextSmartWallet(
    address dharmaKey
  ) external view returns (address wallet) {
    // Construct initialization calldata as initialize selector and Dharma key.
    bytes memory initializationCalldata = abi.encodeWithSelector(
      _initializer.initialize.selector,
      dharmaKey
    );
    
    // Determine the user's smart wallet address based on the Dharma key.
    wallet = _computeNextAddress(initializationCalldata);
  }

  /**
   * @notice Private function to deploy an upgrade beacon proxy via `CREATE2`.
   * @param initializationCalldata bytes The calldata that will be supplied to
   * the `DELEGATECALL` from the deployed contract to the implementation set on
   * the upgrade beacon during contract creation.
   * @return The address of the newly-deployed upgrade beacon proxy.
   */
  function _deployUpgradeBeaconProxyInstance(
    bytes memory initializationCalldata
  ) private returns (address upgradeBeaconProxyInstance) {
    // Place creation code and constructor args of new proxy instance in memory.
    bytes memory initCode = abi.encodePacked(
      type(UpgradeBeaconProxy).creationCode,
      abi.encode(initializationCalldata)
    );

    // Get salt to use during deployment using the supplied initialization code.
    (bytes32 salt, ) = _getSaltAndTarget(initCode);

    // Deploy the new upgrade beacon proxy contract using `CREATE2`.
    assembly {
      let encoded_data := add(0x20, initCode) // load initialization code.
      let encoded_size := mload(initCode)     // load the init code's length.
      upgradeBeaconProxyInstance := create2(  // call `CREATE2` w/ 4 arguments.
        callvalue,                            // forward any supplied endowment.
        encoded_data,                         // pass in initialization code.
        encoded_size,                         // pass in init code's length.
        salt                                  // pass in the salt value.
      )

      // Pass along failure message and revert if contract deployment fails.
      if iszero(upgradeBeaconProxyInstance) {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
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
   * @return The address of the next upgrade beacon proxy contract with the
   * given initialization calldata.
   */
  function _computeNextAddress(
    bytes memory initializationCalldata
  ) private view returns (address target) {
    // Place creation code and constructor args of the proxy instance in memory.
    bytes memory initCode = abi.encodePacked(
      type(UpgradeBeaconProxy).creationCode,
      abi.encode(initializationCalldata)
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
  ) private view returns (bytes32 salt, address target) {
    // Get the keccak256 hash of the init code for address derivation.
    bytes32 initCodeHash = keccak256(initCode);

    // Set the initial nonce to be provided when constructing the salt.
    uint256 nonce = 0;
    
    // Declare variable for code size of derived address.
    uint256 codeSize;

    // Loop until an contract deployment address with no code has been found.
    while (true) {
      // Derive `CREATE2` salt using `msg.sender` and nonce.
      salt = keccak256(abi.encodePacked(msg.sender, nonce));

      target = address(            // derive the target deployment address.
        uint160(                   // downcast to match the address type.
          uint256(                 // cast to uint to truncate upper digits.
            keccak256(             // compute CREATE2 hash using 4 inputs.
              abi.encodePacked(    // pack all inputs to the hash together.
                bytes1(0xff),      // pass in the control character.
                address(this),     // pass in the address of this contract.
                salt,              // pass in the salt from above.
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
