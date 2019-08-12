pragma solidity 0.5.10;

import "../implementations/DharmaSmartWalletImplementationV1.sol";
import "../UpgradeBeaconProxy.sol";


/**
 * @title DharmaSmartWalletFactoryV1
 * @author 0age
 * @notice This contract deploys new Dharma smart wallets as upgrade beacon
 * proxies pointing to a shared implementation contract.
 */
contract DharmaSmartWalletFactoryV1 {
  // Fires an event when a new smart wallet is created - this may not be needed.
  event SmartWalletDeployed(address wallet, address dharmaKey);

  // NOTE: setting this value in storage is unnecessary - we should deploy the
  // upgrade beacon first and use a constant (here now for easier testing)
  address private _dharmaSmartWalletUpgradeBeacon;
  
  constructor(address dharmaSmartWalletUpgradeBeacon) public {
    _dharmaSmartWalletUpgradeBeacon = dharmaSmartWalletUpgradeBeacon;
  }

  function newSmartWallet(address dharmaKey) public returns (address wallet) {
    // Construct initialization calldata as initialize selector and dharma key.
    DharmaSmartWalletImplementationV1 implementation;
    bytes memory initializationCalldata = abi.encodeWithSelector(
      implementation.initialize.selector,
      dharmaKey
    );
    
    // Initialize and deploy user smart wallet as minimal beacon-upgrade proxy.
    // NOTE: by deploying the dharma smart wallet to a compact address, we can
    // instead call _spawnCompact (using regular _spawn now for easier testing)
    wallet = _spawn(initializationCalldata);

    // Emit an event to signal the creation of a new smart wallet.
    emit SmartWalletDeployed(wallet, dharmaKey);
  }

  function getNextSmartWallet(
    address dharmaKey
  ) public view returns (address wallet) {
    // Construct initialization calldata as initialize selector and dharma key.
    DharmaSmartWalletImplementationV1 implementation;
    bytes memory initializationCalldata = abi.encodeWithSelector(
      implementation.initialize.selector,
      dharmaKey
    );
    
    // Determine the user's smart wallet address based on the dharma key.
    // NOTE: by deploying the dharma smart wallet to a compact address, we can
    // instead call _computeNextCompactAddress (using now for easier testing)
    wallet = _computeNextAddress(initializationCalldata);
  }

  /**
   * @notice Internal function for spawning a minimal upgradeable proxy using
   * `CREATE2`.
   * @param initializationCalldata bytes The calldata that will be supplied to
   * the `DELEGATECALL` from the spawned contract to the logic contract during
   * contract creation.
   * @return The address of the newly-spawned contract.
   */
  function _spawn(
    bytes memory initializationCalldata
  ) internal returns (address spawnedContract) {
    // place creation code and constructor args of contract to spawn in memory.
    bytes memory initCode = abi.encodePacked(
      type(UpgradeBeaconProxy).creationCode,
      abi.encode(
        _dharmaSmartWalletUpgradeBeacon,
        initializationCalldata
      )
    );

    // spawn the contract using `CREATE2`.
    spawnedContract = _spawnCreate2(initCode);
  }

  /**
   * @notice Internal view function for finding the address of the next standard
   * minimal upgradeable proxy created using `CREATE2` with a given
   * initialization calldata payload.
   * @param initializationCalldata bytes The calldata that will be supplied to
   * the `DELEGATECALL` from the spawned contract to the logic contract during
   * contract creation.
   * @return The address of the next spawned minimal upgradeable proxy contract
   * with the given parameters.
   */
  function _computeNextAddress(
    bytes memory initializationCalldata
  ) internal view returns (address target) {
    // place creation code and constructor args of contract to spawn in memory.
    bytes memory initCode = abi.encodePacked(
      type(UpgradeBeaconProxy).creationCode,
      abi.encode(
        _dharmaSmartWalletUpgradeBeacon,
        initializationCalldata
      )
    );

    // get target address using the constructed initialization code.
    (, target) = _getSaltAndTarget(initCode);
  }

  /**
   * @notice Private function for spawning a minimal upgradeable proxy using
   * `CREATE2`. Provides logic that is reused by internal functions. A salt will
   * also be chosen based on the calling address and a computed nonce that
   * prevents deployments to existing addresses.
   * @param initCode bytes The contract creation code.
   * @return The address of the newly-spawned contract.
   */
  function _spawnCreate2(
    bytes memory initCode
  ) private returns (address spawnedContract) {
    // get salt to use during deployment using the supplied initialization code.
    (bytes32 salt, ) = _getSaltAndTarget(initCode);

    assembly {
      let encoded_data := add(0x20, initCode) // load initialization code.
      let encoded_size := mload(initCode)     // load the init code's length.
      spawnedContract := create2(             // call `CREATE2` w/ 4 arguments.
        callvalue,                            // forward any supplied endowment.
        encoded_data,                         // pass in initialization code.
        encoded_size,                         // pass in init code's length.
        salt                                  // pass in the salt value.
      )

      // pass along failure message from failed contract deployment and revert.
      if iszero(spawnedContract) {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }
  }

  /**
   * @notice Private function for determining the salt and the target deployment
   * address for the next spawned contract (using create2) based on the contract
   * creation code.
   */
  function _getSaltAndTarget(
    bytes memory initCode
  ) private view returns (bytes32 salt, address target) {
    // get the keccak256 hash of the init code for address derivation.
    bytes32 initCodeHash = keccak256(initCode);

    // set the initial nonce to be provided when constructing the salt.
    uint256 nonce = 0;
    
    // declare variable for code size of derived address.
    uint256 codeSize;

    while (true) {
      // derive `CREATE2` salt using `msg.sender` and nonce.
      salt = keccak256(abi.encodePacked(msg.sender, nonce));

      target = address(    // derive the target deployment address.
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

      // determine if a contract is already deployed to the target address.
      assembly { codeSize := extcodesize(target) }

      // exit the loop if no contract is deployed to the target address.
      if (codeSize == 0) {
        break;
      }

      // otherwise, increment the nonce and derive a new salt.
      nonce++;
    }
  }  
}
