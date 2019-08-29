pragma solidity 0.5.11;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface CTokenInterface {
  function mint(uint256 mintAmount) external returns (uint256 err);
  
  function redeemUnderlying(uint256 redeemAmount) external returns (uint256 err);

  function balanceOfUnderlying(address account) external returns (uint256 balance);
}


interface USDCV1Interface {
  function isBlacklisted(address _account) external view returns (bool);
  
  function paused() external view returns (bool);
}


interface ComptrollerInterface {
  function enterMarkets(address[] calldata cTokens) external returns (uint256[] memory errs);
}


interface DharmaKeyRegistryInterface {
  function getGlobalKey() external view returns (address globalKey);
}


interface DharmaSmartWalletImplementationV0Interface {
  event NewDharmaKey(address dharmaKey);
  
  event ExternalError(address indexed source, string revertReason);

  // Actions, or protected methods (i.e. not deposits) each have an action type.
  enum ActionType {
    Cancel,
    SetDharmaKey,
    Generic,
    GenericAtomicBatch,
    DAIWithdrawal,
    USDCWithdrawal,
    ETHWithdrawal,
    DAIBorrow,
    USDCBorrow
  }

  function initialize(address dharmaKey) external payable;

  function repayAndDeposit() external;

  function withdrawDai(
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata dharmaKeySignature,
    bytes calldata dharmaSecondaryKeySignature
  ) external returns (bool ok);

  function withdrawUSDC(
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata dharmaKeySignature,
    bytes calldata dharmaSecondaryKeySignature
  ) external returns (bool ok);

  function cancel(
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata signature
  ) external;

  function setDharmaKey(
    address dharmaKey,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata signature
  ) external;

  function getBalances() external returns (
    uint256 daiBalance,
    uint256 usdcBalance,
    uint256 cDaiUnderlyingDaiBalance,
    uint256 cUsdcUnderlyingUsdcBalance
  );

  function getDharmaKey() external view returns (address dharmaKey);
  
  function getNonce() external view returns (uint256 nonce);
  
  function getNextCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID);

  function getCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID);

  function getVersion() external pure returns (uint256 version);
}


/**
 * @title DharmaSmartWalletImplementationV0
 * @notice The V1 implementation for the Dharma smart wallet is a joint-custody,
 * meta-transaction-enabled wallet with an account recovery option. It is
 * deployed by a factory that allows for the address to be known ahead of time,
 * and any Dai that has been sent to the address will automatically be deposited
 * into Compound at the time the wallet is deployed.
 */
contract DharmaSmartWalletImplementationV0 is DharmaSmartWalletImplementationV0Interface {
  using Address for address;
  using ECDSA for bytes32;
  // WARNING: DO NOT REMOVE OR REORDER STORAGE WHEN WRITING NEW IMPLEMENTATIONS!
  // Note: One way to protect against this is to inherit V0 on V1.

  // The dharma key associated with this account is in storage slot 0.
  // It is the core differentiator when it comes to the account in question.
  address private _dharmaKey;

  // The nonce associated with this account is in storage slot 1. Every time a
  // signature is submitted, it must have the appropriate nonce, and once it has
  // been accepted the nonce will be incremented.
  uint256 private _nonce;

  // The self-call context flag is in storage slot 2. Some protected functions
  // may only be called externally from calls originating from other methods on
  // this contract, which enables appropriate exception handling on reverts.
  // Another, more complex way to achieve this without needing any local storage
  // would be to perform and handle a call into a dedicated contract and back.
  // Any storage set here should be cleared before execution environment exits.
  bytes4 internal _selfCallContext;

  // END STORAGE DECLARATIONS - DO NOT REMOVE OR REPLACE STORAGE ABOVE HERE!

  // The smart wallet version will be used when constructing valid signatures.
  uint256 internal constant _DHARMA_SMART_WALLET_VERSION = 0;

  // The dharma secondary key is a signing key held in the Dharma Key Registry,
  // used in conjunction with user's Dharma Key to make smart wallet actions.
  DharmaKeyRegistryInterface internal constant _DHARMA_KEY_REGISTRY = (
    DharmaKeyRegistryInterface(0x00000000006c7f32F0cD1eA4C1383558eb68802D)
  );

  ComptrollerInterface internal constant _COMPTROLLER = ComptrollerInterface(
    0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B
  );

  CTokenInterface internal constant _CDAI = CTokenInterface(
    0xF5DCe57282A584D2746FaF1593d3121Fcac444dC // mainnet
  );

  CTokenInterface internal constant _CUSDC = CTokenInterface(
    0x39AA39c021dfbaE8faC545936693aC917d5E7563 // mainnet
  );

  IERC20 internal constant _DAI = IERC20(
    0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359 // mainnet
  );

  IERC20 internal constant _USDC = IERC20(
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // mainnet
  );

  USDCV1Interface internal constant _USDC_NAUGHTY = USDCV1Interface(
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // mainnet
  );

  // Compound returns a value of 0 to indicate success, or lack of an error.
  uint256 internal constant _COMPOUND_SUCCESS = 0;

  function initialize(address dharmaKey) external payable {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    require(dharmaKey != address(0), "No key provided.");

    // Set up the user's dharma key and emit a corresponding event.
    _setDharmaKey(dharmaKey);

    // Approve the cDAI contract to transfer Dai on behalf of this contract.
    if (_setFullDaiApproval()) {
      // Get the current Dai balance on this contract.
      uint256 daiBalance = _DAI.balanceOf(address(this));

      // Try to deposit any dai balance on Compound.
      _depositDaiOnCompound(daiBalance);
    }

    // Approve the cUSDC contract to transfer USDC on behalf of this contract.
    if (_setFullUSDCApproval()) {
      // Get the current USDC balance on this contract.
      uint256 usdcBalance = _USDC.balanceOf(address(this));

      // Try to deposit any USDC balance on Compound.
      _depositUSDCOnCompound(usdcBalance);
    }

    // Enter DAI + USDC + ETH markets now to avoid a need to reinitialize later.
    _enterMarkets();
  }

  function repayAndDeposit() external {
    // Get the current Dai balance on this contract.
    uint256 daiBalance = _DAI.balanceOf(address(this));

    // Deposit any available Dai.
    _depositDaiOnCompound(daiBalance);

    // Get the current USDC balance on this contract.
    uint256 usdcBalance = _USDC.balanceOf(address(this));

    // If there is any USDC balance, check for adequate approval for cUSDC.
    // Once borrows are enabled, first use funds to repay USDC borrow balance.
    if (usdcBalance > 0) {
      uint256 usdcAllowance = _USDC.allowance(address(this), address(_CUSDC));
      // If allowance is insufficient, try to set it before depositing.
      if (usdcAllowance < usdcBalance) {
        if (_setFullUSDCApproval()) {
          // Deposit any available USDC.
          _depositUSDCOnCompound(usdcBalance);
        }
      // otherwise, go ahead and try the deposit.
      } else {
        // Deposit any available USDC.
        _depositUSDCOnCompound(usdcBalance);
      }
    }
  }

  function withdrawDai(
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata dharmaKeySignature,
    bytes calldata dharmaSecondaryKeySignature
  ) external returns (bool ok) {
    _validateCustomActionAndIncrementNonce(
      ActionType.DAIWithdrawal,
      amount,
      recipient,
      nonce,
      minimumActionGas,
      dharmaKeySignature,
      dharmaSecondaryKeySignature
    );

    // Set the self-call context so we can call _withdrawDaiAtomic.
    _selfCallContext = this.withdrawDai.selector;

    // Make the atomic self-call - if redeemUnderlying fails on cDAI, it will
    // succeed but nothing will happen except firing an ExternalError event. If
    // the second part of the self-call (the Dai transfer) fails, it will revert
    // and roll back the first part of the call, and we'll fire an ExternalError
    // event after returning from the failed call.
    bytes memory returnData;
    (ok, returnData) = address(this).call(abi.encodeWithSelector(
      this._withdrawDaiAtomic.selector, amount, recipient
    ));
    if (!ok) {
      emit ExternalError(address(_DAI), "DAI contract reverted on transfer.");
    } else {
      // Ensure that ok == false in the event the withdrawal failed.
      ok = abi.decode(returnData, (bool));
    }

    // Clear the self-call context.
    delete _selfCallContext;
  }

  function _withdrawDaiAtomic(uint256 amount, address recipient) external returns (bool success) {
    require(
      msg.sender == address(this) &&
      _selfCallContext == this.withdrawDai.selector,
      "External accounts or unapproved internal functions cannot call this."
    );
    if (_withdrawDaiFromCompound(amount)) {
      // at this point dai transfer *should* never fail - wrap it just in case.
      require(_DAI.transfer(recipient, amount));
      success = true;
    }
  }

  function withdrawUSDC(
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata dharmaKeySignature,
    bytes calldata dharmaSecondaryKeySignature
  ) external returns (bool ok) {
    _validateCustomActionAndIncrementNonce(
      ActionType.USDCWithdrawal,
      amount,
      recipient,
      nonce,
      minimumActionGas,
      dharmaKeySignature,
      dharmaSecondaryKeySignature
    );

    // Set the self-call context so we can call _withdrawUSDCAtomic.
    _selfCallContext = this.withdrawUSDC.selector;

    // Make the atomic self-call - if redeemUnderlying fails on cUSDC, it will
    // succeed but nothing will happen except firing an ExternalError event. If
    // the second part of the self-call (USDC transfer) fails, it will revert
    // and roll back the first part of the call, and we'll fire an ExternalError
    // event after returning from the failed call.
    bytes memory returnData;
    (ok, returnData) = address(this).call(abi.encodeWithSelector(
      this._withdrawUSDCAtomic.selector, amount, recipient
    ));
    if (!ok) {
      // find out *why* USDC transfer reverted (it doesn't give revert reasons).
      if (_USDC_NAUGHTY.isBlacklisted(address(this))) {
        emit ExternalError(
          address(_USDC),
          "transfer failed - USDC has blacklisted this user."
        );
      } else { // Note: `else if` breaks coverage.
        if (_USDC_NAUGHTY.paused()) {
          emit ExternalError(
            address(_USDC),
            "transfer failed - USDC contract is currently paused."
          );
        } else {
          emit ExternalError(
            address(_USDC),
            "USDC contract reverted on transfer."
          );
        }
      }
    } else {
      // Ensure that ok == false in the event the withdrawal failed.
      ok = abi.decode(returnData, (bool));
    }

    // Clear the self-call context.
    delete _selfCallContext;
  }

  function _withdrawUSDCAtomic(uint256 amount, address recipient) external returns (bool success) {
    require(
      msg.sender == address(this) &&
      _selfCallContext == this.withdrawUSDC.selector,
      "External accounts or unapproved internal functions cannot call this."
    );
    if (_withdrawUSDCFromCompound(amount)) {
      // ensure that the USDC transfer does not fail.
      require(_USDC.transfer(recipient, amount));
      success = true;
    }
  }

  // Allow signatory to increment the nonce at any point - the current nonce
  // needs to be provided when using a signature so as not to enable griefing
  // attacks. All arguments can be omitted if called directly.
  function cancel(
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata signature
  ) external {
    address secondaryKey = _getSecondaryKey();

    if (msg.sender == secondaryKey) {
      _incrementNonce();
    } else {
      // Ensure that the action has the correct nonce.
      require(_nonce == nonce, "Invalid action - incorrect nonce.");

      // Ensure that the current gas exceeds the minimum required action gas.
      // This prevents griefing attacks where an attacker can invalidate a
      // signature without providing enough gas for the action to succeed.
      require(
        gasleft() >= minimumActionGas,
        "Invalid action - insufficient gas supplied by transaction submitter."
      );

      bytes32 actionID = _getCustomActionID(
        ActionType.Cancel,
        0,
        address(0),
        nonce,
        minimumActionGas,
        secondaryKey
      );

      // Either signature may be used to submit a cancellation action.
      _verifySignatureAndIncrementNonce(actionID, signature, secondaryKey);
    }
  }

  // Allow signatory to set a new Dharma Key - the current nonce needs to be
  // provided when using a signature so as not to enable griefing attacks. All
  // arguments (except for the dharma key) can be omitted if called directly.
  function setDharmaKey(
    address dharmaKey,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata signature
  ) external {
    // This function is only callable with one signature in V0.
    require(
      _DHARMA_SMART_WALLET_VERSION == 0,
      "This function is no longer callable by a single signatory."
    );

    address secondaryKey = _getSecondaryKey();

    if (msg.sender == secondaryKey) {
      _incrementNonce();
    } else {
      // Ensure that the action has the correct nonce.
      require(_nonce == nonce, "Invalid action - incorrect nonce.");

      // Ensure that the current gas exceeds the minimum required action gas.
      // This prevents griefing attacks where an attacker can invalidate a
      // signature without providing enough gas for the action to succeed.
      require(
        gasleft() >= minimumActionGas,
        "Invalid action - insufficient gas supplied by transaction submitter."
      );

      bytes32 actionID = _getCustomActionID(
        ActionType.SetDharmaKey,
        0,
        dharmaKey,
        nonce,
        minimumActionGas,
        secondaryKey
      );

      _verifySignatureAndIncrementNonce(actionID, signature, secondaryKey);

      _setDharmaKey(dharmaKey);
    }
  }

  function getBalances() external returns (
    uint256 daiBalance,
    uint256 usdcBalance,
    uint256 cDaiUnderlyingDaiBalance,
    uint256 cUsdcUnderlyingUsdcBalance
  ) {
    daiBalance = _DAI.balanceOf(address(this));
    usdcBalance = _USDC.balanceOf(address(this));
    cDaiUnderlyingDaiBalance = _CDAI.balanceOfUnderlying(address(this));
    cUsdcUnderlyingUsdcBalance = _CUSDC.balanceOfUnderlying(address(this));
  }

  function getDharmaKey() external view returns (address dharmaKey) {
    dharmaKey = _dharmaKey;
  }

  function getNonce() external view returns (uint256 nonce) {
    nonce = _nonce;
  }

  function getNextCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID) {
    // Determine the actionID - this serves as the signature hash.
    actionID = _getCustomActionID(
      action, amount, recipient, _nonce, minimumActionGas, _getSecondaryKey()
    );
  }

  function getCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID) {
    // Determine the actionID - this serves as the signature hash.
    actionID = _getCustomActionID(
      action, amount, recipient, nonce, minimumActionGas, _getSecondaryKey()
    );
  }

  function getVersion() external pure returns (uint256 version) {
    version = _DHARMA_SMART_WALLET_VERSION;
  }

  function test() external pure returns (bool) {
    return true;
  }

  function testRevert() external pure returns (bool) {
    revert("This revert message should be visible.");
  }

  function _setDharmaKey(address dharmaKey) internal {
    _dharmaKey = dharmaKey;
    emit NewDharmaKey(dharmaKey);
  }

  function _incrementNonce() internal {
    _nonce++;
  }

  function _setFullDaiApproval() internal returns (bool ok) {
    // Approve the cDAI contract to transfer Dai on behalf of this contract.
    (ok, ) = address(_DAI).call(abi.encodeWithSelector(
      _DAI.approve.selector, address(_CDAI), uint256(-1)
    ));

    // Note: handling the failure on dai approvals is unnecessary.
  }

  function _depositDaiOnCompound(uint256 daiBalance) internal {
    if (daiBalance > 0) {
      // Attempt to mint the Dai balance on the cDAI contract.
      (bool ok, bytes memory data) = address(_CDAI).call(abi.encodeWithSelector(
        _CDAI.mint.selector, daiBalance
      ));

      // Log an external error if something went wrong with the attempt.
      if (ok) {
        uint256 compoundError = abi.decode(data, (uint256));
        if (compoundError != _COMPOUND_SUCCESS) {
          emit ExternalError(
            address(_CDAI),
            string(
              abi.encodePacked(
                "Compound cDAI contract returned error code ",
                uint8((compoundError / 10) + 48),
                uint8((compoundError % 10) + 48),
                " while attempting to deposit dai."
              )
            )
          );
        }
      } else {
        emit ExternalError(
          address(_CDAI),
          string(
            abi.encodePacked("Compound cDAI contract reverted on mint: ", data)
          )
        );
      }
    }
  }

  function _withdrawDaiFromCompound(
    uint256 daiToWithdraw
  ) internal returns (bool success) {
    // Attempt to mint the Dai balance on the cDAI contract.
    (bool ok, bytes memory data) = address(_CDAI).call(abi.encodeWithSelector(
      _CDAI.redeemUnderlying.selector, daiToWithdraw
    ));

    // Log an external error if something went wrong with the attempt.
    if (ok) {
      uint256 compoundError = abi.decode(data, (uint256));
      if (compoundError != _COMPOUND_SUCCESS) {
        emit ExternalError(
          address(_CDAI),
          string(
            abi.encodePacked(
              "Compound cDAI contract returned error code ",
              uint8((compoundError / 10) + 48),
              uint8((compoundError % 10) + 48),
              " while attempting to redeem Dai."
            )
          )
        );
      } else {
        success = true;
      }
    } else {
      emit ExternalError(
        address(_CDAI),
        string(
          abi.encodePacked(
            "Compound cDAI contract reverted on redeemUnderlying: ",
            data
          )
        )
      );
    }
  }

  function _setFullUSDCApproval() internal returns (bool ok) {
    // Approve the cUSDC contract to transfer USDC on behalf of this contract.
    (ok, ) = address(_USDC).call(abi.encodeWithSelector(
      _USDC.approve.selector, address(_CUSDC), uint256(-1)
    ));

    // If the USDC approval failed, find out *why* it failed and log it.
    if (!ok) {
      if (_USDC_NAUGHTY.isBlacklisted(address(this))) {
        emit ExternalError(
          address(_USDC),
          "approval failed - USDC has blacklisted this user."
        );
      } else { // Note: `else if` breaks coverage.
        if (_USDC_NAUGHTY.paused()) {
          emit ExternalError(
            address(_USDC),
            "approval failed - USDC contract is currently paused."
          );
        } else {
          emit ExternalError(address(_USDC), "USDC approval failed.");        
        }
      }
    }
  }

  function _depositUSDCOnCompound(uint256 usdcBalance) internal {
    if (usdcBalance > 0) {
      // Attempt to mint the USDC balance on the cUSDC contract.
      (bool ok, bytes memory data) = address(_CUSDC).call(abi.encodeWithSelector(
        _CUSDC.mint.selector, usdcBalance
      ));

      // Log an external error if something went wrong with the attempt.
      if (ok) {
        uint256 compoundError = abi.decode(data, (uint256));
        if (compoundError != _COMPOUND_SUCCESS) {
          emit ExternalError(
            address(_CUSDC),
            string(
              abi.encodePacked(
                "Compound cUSDC contract returned error code ",
                uint8((compoundError / 10) + 48),
                uint8((compoundError % 10) + 48),
                " while attempting to deposit USDC."
              )
            )
          );
        }
      } else {
        emit ExternalError(
          address(_CUSDC),
          string(
            abi.encodePacked("Compound cUSDC contract reverted on mint: ", data)
          )
        );
      }
    }
  }

  function _withdrawUSDCFromCompound(
    uint256 usdcToWithdraw
  ) internal returns (bool success) {
    // Attempt to mint the Dai balance on the cDAI contract.
    (bool ok, bytes memory data) = address(_CDAI).call(abi.encodeWithSelector(
      _CUSDC.redeemUnderlying.selector, usdcToWithdraw
    ));

    // Log an external error if something went wrong with the attempt.
    if (ok) {
      uint256 compoundError = abi.decode(data, (uint256));
      if (compoundError != _COMPOUND_SUCCESS) {
        emit ExternalError(
          address(_CDAI),
          string(
            abi.encodePacked(
              "Compound cUSDC contract returned error code ",
              uint8((compoundError / 10) + 48),
              uint8((compoundError % 10) + 48),
              " while attempting to redeem USDC."
            )
          )
        );
      } else {
        success = true;
      }
    } else {
      emit ExternalError(
        address(_CUSDC),
        string(
          abi.encodePacked(
            "Compound cUSDC contract reverted on redeemUnderlying: ",
            data
          )
        )
      );
    }
  }

  function _enterMarkets() internal {
    address[] memory marketsToEnter = new address[](3);
    marketsToEnter[0] = address(_CDAI);
    marketsToEnter[1] = address(_CUSDC);
    marketsToEnter[2] = address(0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5); // CEther

    // Attempt to mint the USDC balance on the cUSDC contract.
    (bool ok, bytes memory data) = address(_COMPTROLLER).call(abi.encodeWithSelector(
      _COMPTROLLER.enterMarkets.selector, marketsToEnter
    ));

    // Log an external error if something went wrong with the attempt.
    if (ok) {
      uint256[] memory compoundErrors = abi.decode(data, (uint256[]));
      for (uint256 i = 0; i < compoundErrors.length; i++) {
        uint256 compoundError = compoundErrors[i];
        if (compoundError != _COMPOUND_SUCCESS) {
          emit ExternalError(
            address(_COMPTROLLER),
            string(
              abi.encodePacked(
                "Compound comptroller contract returned error code ",
                uint8((compoundError / 10) + 48),
                uint8((compoundError % 10) + 48),
                " while attempting to enter a market."
              )
            )
          );
        }
      }
    } else {
      emit ExternalError(
        address(_COMPTROLLER),
        string(
          abi.encodePacked(
            "Compound comptroller contract reverted on enterMarkets: ",
            data
          )
        )
      );
    }
  }

  function _validateCustomActionAndIncrementNonce(
    ActionType actionType,
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes memory dharmaKeySignature,
    bytes memory dharmaSecondaryKeySignature
  ) internal returns (bytes32 actionID) {
    // Ensure that the action has the correct nonce.
    require(_nonce == nonce, "Invalid action - incorrect nonce.");

    address secondaryKey = _getSecondaryKey();

    // Determine the actionID - this serves as the signature hash.
    actionID = _getCustomActionID(
      actionType,
      amount,
      recipient,
      nonce,
      minimumActionGas,
      secondaryKey
    );

    _verifySignatureAndIncrementNonce(
      actionID,
      dharmaSecondaryKeySignature,
      secondaryKey
    );

    // Ensure that the current gas exceeds the minimum required action gas.
    // This prevents griefing attacks where an attacker can invalidate a
    // signature without providing enough gas for the action to succeed.
    // To skip this requirement, supply zero for the minimumActionGas argument.
    require(
      gasleft() >= minimumActionGas,
      "Invalid action - insufficient gas supplied by transaction submitter."
    );

    // Avoid unused variable warning - dharma key is not used for txs in V0.
    dharmaKeySignature;
  }

  function _verifySignatureAndIncrementNonce(
    bytes32 actionID,
    bytes memory dharmaSecondaryKeySignature,
    address secondaryKey
  ) internal {
    // Validate Dharma Secondary Key signature unless it is `msg.sender`.
    if (msg.sender != secondaryKey) {
      require(
        secondaryKey == actionID.toEthSignedMessageHash().recover(
          dharmaSecondaryKeySignature
        ),
        "Invalid action - invalid Dharma Secondary Key signature."
      );
    }

    // Increment nonce in order to prevent reuse of signatures after the call.
    _incrementNonce();
  }

  function _getCustomActionID(
    ActionType actionType,
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas,
    address secondaryKey
  ) internal view returns (bytes32 actionID) {
    // The actionID is constructed according to EIP-191-0x45 to prevent replays.
    actionID = keccak256(
      abi.encodePacked(
        address(this),
        _DHARMA_SMART_WALLET_VERSION,
        _dharmaKey,
        secondaryKey,
        nonce,
        minimumActionGas,
        actionType,
        amount,
        recipient
      )
    );
  }

  function _getDharmaKey() internal view returns (address dharmaKey) {
    dharmaKey = _dharmaKey;
  }

  function _getSecondaryKey() internal view returns (address secondaryKey) {
    secondaryKey = _DHARMA_KEY_REGISTRY.getGlobalKey();
  }

  function _getNonce() internal view returns (uint256 nonce) {
    nonce = _nonce;
  }
}