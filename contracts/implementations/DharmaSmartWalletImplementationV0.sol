pragma solidity 0.5.11;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface DharmaSmartWalletImplementationV0Interface {
  event NewDharmaKey(address dharmaKey);
  
  event ExternalError(address indexed source, string revertReason);

  // DAI + USDC are the only assets initially supported (include ETH for later).
  enum AssetType {
    DAI,
    USDC,
    ETH
  }

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

  function initialize(address dharmaKey) external;

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


/**
 * @title DharmaSmartWalletImplementationV0
 * @author 0age
 * @notice The V0 implementation for the Dharma Smart Wallet contains helper
 * functions to facilitate lending funds to CompoundV2 and for preparing Dharma
 * users for a smooth transition to a joint-custody smart wallet. It supports
 * meta-transactions, signed by a key corresponding to the public key returned
 * by the Dharma Key Registry and relayed by any transaction submitter that has
 * provided the specified gas requirement. The smart wallet instances utilizing
 * this implementation are deployed through the Dharma Smart Wallet Factory via
 * `CREATE2`, which allows for their address to be known ahead of time, and any
 * Dai or USDC that has already been sent into that address will automatically
 * be deposited into Compound upon deployment of the new smart wallet instance.
 */
contract DharmaSmartWalletImplementationV0 is DharmaSmartWalletImplementationV0Interface {
  using Address for address;
  using ECDSA for bytes32;
  // WARNING: DO NOT REMOVE OR REORDER STORAGE WHEN WRITING NEW IMPLEMENTATIONS!
  // Note: One way to protect against this is to inherit V0 on V1.

  // The Dharma key associated with this account is in storage slot 0.
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

  // The Dharma Key Registry holds a public key for verifying meta-transactions.
  DharmaKeyRegistryInterface internal constant _DHARMA_KEY_REGISTRY = (
    DharmaKeyRegistryInterface(0x00000000006c7f32F0cD1eA4C1383558eb68802D)
  );

  // This contract interfaces with Dai, USDC, and related CompoundV2 contracts.
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

  ComptrollerInterface internal constant _COMPTROLLER = ComptrollerInterface(
    0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B // mainnet
  );

  // Compound returns a value of 0 to indicate success, or lack of an error.
  uint256 internal constant _COMPOUND_SUCCESS = 0;

  function initialize(address dharmaKey) external {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    // Ensure that a Dharma key is set on this smart wallet.
    require(dharmaKey != address(0), "No key provided.");

    // Set up the user's Dharma key and emit a corresponding event.
    _setDharmaKey(dharmaKey);

    // Approve the cDAI contract to transfer Dai on behalf of this contract.
    if (_setFullApproval(AssetType.DAI)) {
      // Get the current Dai balance on this contract.
      uint256 daiBalance = _DAI.balanceOf(address(this));

      // Try to deposit any dai balance on Compound.
      _depositOnCompound(AssetType.DAI, daiBalance);
    }

    // Approve the cUSDC contract to transfer USDC on behalf of this contract.
    if (_setFullApproval(AssetType.USDC)) {
      // Get the current USDC balance on this contract.
      uint256 usdcBalance = _USDC.balanceOf(address(this));

      // Try to deposit any USDC balance on Compound.
      _depositOnCompound(AssetType.USDC, usdcBalance);
    }

    // Enter DAI + USDC + ETH markets now to avoid a need to reinitialize later.
    _enterMarkets();
  }

  function repayAndDeposit() external {
    // Get the current Dai balance on this contract.
    uint256 daiBalance = _DAI.balanceOf(address(this));

    // Deposit any available Dai.
    _depositOnCompound(AssetType.DAI, daiBalance);

    // Get the current USDC balance on this contract.
    uint256 usdcBalance = _USDC.balanceOf(address(this));

    // If there is any USDC balance, check for adequate approval for cUSDC.
    if (usdcBalance > 0) {
      uint256 usdcAllowance = _USDC.allowance(address(this), address(_CUSDC));
      // If allowance is insufficient, try to set it before depositing.
      if (usdcAllowance < usdcBalance) {
        if (_setFullApproval(AssetType.USDC)) {
          // Deposit any available USDC.
          _depositOnCompound(AssetType.USDC, usdcBalance);
        }
      // Otherwise, go ahead and try the deposit.
      } else {
        // Deposit any available USDC.
        _depositOnCompound(AssetType.USDC, usdcBalance);
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
    // Ensure either caller or supplied signature is valid and increment nonce.
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

    // If the atomic call failed, diagnose the reason and emit an event.
    if (!ok) {
      // This revert could be caused by cDai MathError or Dai transfer error.
      _logWithdrawalError(AssetType.DAI);
    } else {
      // Set ok to false if the call succeeded but the withdrawal failed.
      ok = abi.decode(returnData, (bool));
    }

    // Clear the self-call context.
    delete _selfCallContext;
  }

  function _withdrawDaiAtomic(
    uint256 amount,
    address recipient
  ) external returns (bool success) {
    _enforceSelfCallFrom(this.withdrawDai.selector);

    // If amount = 0xfff...fff, withdraw the maximum amount possible.
    bool maxWithdraw = (amount == uint256(-1));
    uint256 redeemUnderlyingAmount;
    if (maxWithdraw) {
      redeemUnderlyingAmount = _CDAI.balanceOfUnderlying(address(this));
    } else {
      redeemUnderlyingAmount = amount;
    }

    // Attempt to withdraw specified Dai amount from Compound before proceeding.
    if (_withdrawFromCompound(AssetType.DAI, redeemUnderlyingAmount)) {
      // At this point dai transfer *should* never fail - wrap it just in case.
      if (maxWithdraw) {
        require(_DAI.transfer(recipient, _DAI.balanceOf(address(this))));
      } else {
        require(_DAI.transfer(recipient, amount));
      }
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
    // Ensure either caller or supplied signature is valid and increment nonce.
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
      // This revert could be caused by cUSDC MathError or USDC transfer error.
      _logWithdrawalError(AssetType.USDC);
    } else {
      // Ensure that ok == false in the event the withdrawal failed.
      ok = abi.decode(returnData, (bool));
    }

    // Clear the self-call context.
    delete _selfCallContext;
  }

  function _withdrawUSDCAtomic(
    uint256 amount,
    address recipient
  ) external returns (bool success) {
    _enforceSelfCallFrom(this.withdrawUSDC.selector);

    // If amount = 0xfff...fff, withdraw the maximum amount possible.
    bool maxWithdraw = (amount == uint256(-1));
    uint256 redeemUnderlyingAmount;
    if (maxWithdraw) {
      redeemUnderlyingAmount = _CUSDC.balanceOfUnderlying(address(this));
    } else {
      redeemUnderlyingAmount = amount;
    }

    // Try to withdraw specified USDC amount from Compound before proceeding.
    if (_withdrawFromCompound(AssetType.USDC, redeemUnderlyingAmount)) {
      // Ensure that the USDC transfer does not fail.
      if (maxWithdraw) {
        require(_USDC.transfer(recipient, _USDC.balanceOf(address(this))));
      } else {
        require(_USDC.transfer(recipient, amount));
      }
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
    // Get the secondary public key that will be used to verify the signature.
    address secondaryKey = _getSecondaryKey();

    // Increment nonce and exit if the caller matches the retrieved key.
    if (msg.sender == secondaryKey) {
      _incrementNonce();
      return;
    }

    // Ensure the nonce and the minimum action gas are supplied correctly.
    _checkNonceAndMinimumActionGas(nonce, minimumActionGas);

    // Determine the actionID - this serves as the signature hash.
    bytes32 actionID = _getCustomActionID(
      ActionType.Cancel, 0, address(0), nonce, minimumActionGas, secondaryKey
    );

    // Ensure that the signature is valid - if so, increment the nonce.
    _verifySignatureAndIncrementNonce(actionID, signature, secondaryKey);

  }

  // Allow signatory to set a new Dharma Key - the current nonce needs to be
  // provided when using a signature so as not to enable griefing attacks. All
  // arguments (except for the Dharma key) can be omitted if called directly.
  function setDharmaKey(
    address dharmaKey,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata signature
  ) external {
    // Get the secondary public key that will be used to verify the signature.
    address secondaryKey = _getSecondaryKey();

    // Increment nonce, set Dharma key and exit if caller matches retrieved key.
    if (msg.sender == secondaryKey) {
      _incrementNonce();
      _setDharmaKey(dharmaKey);
      return;
    }

    // Ensure the nonce and the minimum action gas are supplied correctly.
    _checkNonceAndMinimumActionGas(nonce, minimumActionGas);

    // Determine the actionID - this serves as the signature hash.
    bytes32 actionID = _getCustomActionID(
      ActionType.SetDharmaKey, 0, dharmaKey, nonce, minimumActionGas, secondaryKey
    );

    // Ensure that the signature is valid - if so, increment nonce and set key.
    _verifySignatureAndIncrementNonce(actionID, signature, secondaryKey);
    _setDharmaKey(dharmaKey);
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
    // Determine the actionID - this serves as a signature hash for an action.
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
    // Determine the actionID - this serves as a signature hash for an action.
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

  function _setFullApproval(AssetType asset) internal returns (bool ok) {
    // Get asset's underlying token address and corresponding cToken address.
    address token;
    address cToken;
    if (asset == AssetType.DAI) {
      token = address(_DAI);
      cToken = address(_CDAI);
    } else {
      token = address(_USDC);
      cToken = address(_CUSDC);
    }

    // Approve cToken contract to transfer underlying on behalf of this wallet.
    (ok, ) = token.call(abi.encodeWithSelector(
      _DAI.approve.selector, cToken, uint256(-1)
    ));

    // Emit a corresponding event if the approval failed.
    if (!ok) {
      if (asset == AssetType.DAI) {
        emit ExternalError(address(_DAI), "DAI contract reverted on approval.");
      } else {
        // Find out why USDC transfer reverted (it doesn't give revert reasons).
        _logNaughtyUSDCErrors(_USDC.approve.selector);
      }
    }
  }

  function _depositOnCompound(AssetType asset, uint256 balance) internal {
    // Only perform a deposit if the balance is non-zero. This could also take
    // into account the safe deposit threshold for each asset - for instance, a
    // deposit of 1 wei of Dai will mint 0 cDai, since cDai precision is lower.
    if (balance > 0) {
      // Get cToken address for the asset type.
      address cToken = asset == AssetType.DAI ? address(_CDAI) : address(_CUSDC);

      // Attempt to mint the balance on the cToken contract.
      (bool ok, bytes memory data) = cToken.call(abi.encodeWithSelector(
        // Note: since both cTokens have the same interface, just use cDAI's.
        _CDAI.mint.selector, balance
      ));

      // Log an external error if something went wrong with the attempt.
      _checkCompoundInteractionAndLogAnyErrors(
        asset, _CDAI.mint.selector, ok, data
      );
    }
  }

  function _withdrawFromCompound(
    AssetType asset,
    uint256 balance
  ) internal returns (bool success) {
    // Get cToken address for the asset type.
    address cToken = asset == AssetType.DAI ? address(_CDAI) : address(_CUSDC);

    // Attempt to redeem the underlying balance from the cToken contract.
    (bool ok, bytes memory data) = cToken.call(abi.encodeWithSelector(
      // Note: since both cTokens have the same interface, just use cDAI's.
      _CDAI.redeemUnderlying.selector, balance
    ));

    // Log an external error if something went wrong with the attempt.
    success = _checkCompoundInteractionAndLogAnyErrors(
      asset, _CDAI.redeemUnderlying.selector, ok, data
    );
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
    // Ensure the nonce and the minimum action gas are supplied correctly.
    _checkNonceAndMinimumActionGas(nonce, minimumActionGas);

    // Get the secondary public key that will be used to verify the signature.
    address secondaryKey = _getSecondaryKey();

    // Determine the actionID - this serves as the signature hash.
    actionID = _getCustomActionID(
      actionType, amount, recipient, nonce, minimumActionGas, secondaryKey
    );

    // Ensure that the signature is valid - if so, increment the nonce.
    _verifySignatureAndIncrementNonce(
      actionID, dharmaSecondaryKeySignature, secondaryKey
    );

    // Avoid unused variable warning - Dharma key is not used for txs in V0.
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

  function _enterMarkets() internal {
    // Create input array with each cToken address on which to enter a market. 
    address[] memory marketsToEnter = new address[](3);
    marketsToEnter[0] = address(_CDAI);
    marketsToEnter[1] = address(_CUSDC);
    marketsToEnter[2] = address(0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5); // CEther

    // Attempt to enter each market by calling into the Comptroller contract.
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
                "Compound Comptroller contract returned error code ",
                uint8((compoundError / 10) + 48),
                uint8((compoundError % 10) + 48),
                " while attempting to call enterMarkets."
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
            "Compound Comptroller contract reverted on enterMarkets: ",
            data
          )
        )
      );
    }
  }

  function _checkCompoundInteractionAndLogAnyErrors(
    AssetType asset,
    bytes4 functionSelector,
    bool ok,
    bytes memory data
  ) internal returns (bool success) {
    // Log an external error if something went wrong with the attempt.
    if (ok) {
      uint256 compoundError = abi.decode(data, (uint256));
      if (compoundError != _COMPOUND_SUCCESS) {
        // Get called contract address, name of contract, and function selector.
        (address account, string memory name, string memory functionName) = (
          _getCompoundErrorDetails(asset, functionSelector)
        );

        emit ExternalError(
          account,
          string(
            abi.encodePacked(
              "Compound ",
              name,
              " contract returned error code ",
              uint8((compoundError / 10) + 48),
              uint8((compoundError % 10) + 48),
              " while attempting to call ",
              functionName,
              "."
            )
          )
        );
      } else {
        success = true;
      }
    } else {
      // Get called contract address, name of contract, and function selector.
      (address account, string memory name, string memory functionName) = (
        _getCompoundErrorDetails(asset, functionSelector)
      );

      emit ExternalError(
        account,
        string(
          abi.encodePacked(
            "Compound ",
            name,
            " contract reverted while attempting to call ",
            functionName,
            ": ",
            data
          )
        )
      );
    }
  }

  function _logWithdrawalError(AssetType asset) internal {
    // Get called contract address and name of contract (no need for selector).
    (address cToken, string memory name, ) = _getCompoundErrorDetails(
      asset, bytes4(0)
    );

    // Revert could be caused by cToken MathError or underlying transfer error.
    (bool check, ) = cToken.call(abi.encodeWithSelector(
      // Note: since both cTokens have the same interface, just use cDAI's.
      _CDAI.balanceOfUnderlying.selector, address(this)
    ));
    if (!check) {
      emit ExternalError(
        cToken,
        string(
          abi.encodePacked(
            name, " contract reverted on call to balanceOfUnderlying."
          )
        )
      );
    } else {
      if (asset == AssetType.DAI) {
        emit ExternalError(address(_DAI), "DAI contract reverted on transfer.");
      } else {
      // Find out why USDC transfer reverted (it doesn't give revert reasons).
      _logNaughtyUSDCErrors(_USDC.transfer.selector);        
      }   
    }
  }

  function _logNaughtyUSDCErrors(bytes4 functionSelector) internal {
    // Determine the name of the function that was called on USDC.
    string memory functionName;
    if (functionSelector == _USDC.transfer.selector) {
      functionName = "transfer";
    } else {
      functionName = "approve";
    }

    // Find out why USDC transfer reverted (it doesn't give revert reasons).
    if (_USDC_NAUGHTY.isBlacklisted(address(this))) {
      emit ExternalError(
        address(_USDC),
        string(
          abi.encodePacked(
            functionName, "failed - USDC has blacklisted this user."
          )
        )
      );
    } else { // Note: `else if` breaks coverage.
      if (_USDC_NAUGHTY.paused()) {
        emit ExternalError(
          address(_USDC),
          string(
            abi.encodePacked(
              functionName, "failed - USDC contract is currently paused."
            )
          )
        );
      } else {
        emit ExternalError(
          address(_USDC),
          string(
            abi.encodePacked(
              "USDC contract reverted on ", functionName, "."
            )
          )
        );
      }
    }
  }

  function _checkNonceAndMinimumActionGas(
    uint256 nonce,
    uint256 minimumActionGas
  ) internal view {
    // Ensure that the current gas exceeds the minimum required action gas.
    // This prevents griefing attacks where an attacker can invalidate a
    // signature without providing enough gas for the action to succeed. Also
    // note that some gas will be spent before this check is reached - supplying
    // ~30,000 additional gas should suffice when submitting transactions. To
    // skip this requirement, supply zero for the minimumActionGas argument.
    require(
      gasleft() >= minimumActionGas,
      "Invalid action - insufficient gas supplied by transaction submitter."
    );

    // Ensure that the action has the correct nonce.
    require(_nonce == nonce, "Invalid action - incorrect nonce.");
  }

  function _enforceSelfCallFrom(bytes4 selfCallContext) internal view {
    require(
      msg.sender == address(this) &&
      _selfCallContext == selfCallContext,
      "External accounts or unapproved internal functions cannot call this."
    );
  }

  function _getSecondaryKey() internal view returns (address secondaryKey) {
    secondaryKey = _DHARMA_KEY_REGISTRY.getGlobalKey();
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

  function _getCompoundErrorDetails(
    AssetType asset,
    bytes4 functionSelector
  ) internal pure returns (
    address account,
    string memory name,
    string memory functionName
  ) {
    if (asset == AssetType.DAI) {
      account = address(_CDAI);
      name = "cDAI";
    } else {
      account = address(_CUSDC);
      name = "cUSDC";
    }

    // Note: since both cTokens have the same interface, just use cDAI's.
    if (functionSelector == _CDAI.mint.selector) {
      functionName = "mint";
    } else {
      functionName = "redeemUnderlying";
    }
  }
}