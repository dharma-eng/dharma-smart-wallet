pragma solidity 0.5.11;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../../interfaces/DharmaSmartWalletImplementationV0Interface.sol";
import "../../../interfaces/CTokenInterface.sol";
import "../../../interfaces/USDCV1Interface.sol";
import "../../../interfaces/ComptrollerInterface.sol";
import "../../../interfaces/DharmaKeyRegistryInterface.sol";


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

  // The user signing key associated with this account is in storage slot 0.
  // It is the core differentiator when it comes to the account in question.
  address private _userSigningKey;

  // The nonce associated with this account is in storage slot 1. Every time a
  // signature is submitted, it must have the appropriate nonce, and once it has
  // been accepted the nonce will be incremented.
  uint256 private _nonce;

  // The self-call context flag is in storage slot 2. Some protected functions
  // may only be called externally from calls originating from other methods on
  // this contract, which enables appropriate exception handling on reverts.
  // Any storage should only be set immediately preceding a self-call and should
  // be cleared upon entering the protected function being called.
  bytes4 internal _selfCallContext;

  // END STORAGE DECLARATIONS - DO NOT REMOVE OR REORDER STORAGE ABOVE HERE!

  // The smart wallet version will be used when constructing valid signatures.
  uint256 internal constant _DHARMA_SMART_WALLET_VERSION = 0;

  // The Dharma Key Registry holds a public key for verifying meta-transactions.
  DharmaKeyRegistryInterface internal constant _DHARMA_KEY_REGISTRY = (
    DharmaKeyRegistryInterface(0x000000005D7065eB9716a410070Ee62d51092C98)
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

  /**
   * @notice In initializer, set up user signing key, set approval on the cDAI
   * and cUSDC contracts, deposit any Dai and/or USDC already at the address to
   * Compound, and enter markets for cDAI, cUSDC, and cETH (just so it doesn't
   * need to be performed at some later stage when we move to a borrow-enabled
   * smart wallet). In V0, the user signing key is not actually used to sign
   * actions - the goal is to get all of the smart wallets set up with a user
   * signing key before V1. Note that this initializer is only callable while
   * the smart wallet instance is still in the contract creation phase.
   * @param userSigningKey address The initial user signing key for the smart
   * wallet.
   */
  function initialize(address userSigningKey) external {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    // Set up the user's signing key and emit a corresponding event.
    _setUserSigningKey(userSigningKey);

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

  /**
   * @notice Deposit all Dai and USDC currently residing at this address to
   * Compound. Note that "repay" is not currently implemented, but the function
   * is still named "repayAndDeposit" so that infrastructure around calling this
   * function will not need to be altered for a future smart wallet version. If
   * some step of this function fails, the function itself will still succeed,
   * but an ExternalError with information on what went wrong will be emitted.
   */
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

  /**
   * @notice Withdraw Dai to a provided recipient address by redeeming the
   * underlying Dai from the cDAI contract and transferring it to the recipient.
   * All Dai in Compound and in the smart wallet itself can be withdrawn by
   * providing an amount of uint256(-1) or 0xfff...fff. This function can be
   * called directly by the account set as the global key on the Dharma Key
   * Registry, or by any relayer that provides a signed message from the same
   * keyholder. The nonce used for the signature must match the current nonce on
   * the smart wallet, and gas supplied to the call must exceed the specified
   * minimum action gas, plus the gas that will be spent before the gas check is
   * reached - usually somewhere around 25,000 gas. If the withdrawal fails, an
   * ExternalError with additional details on what went wrong will be emitted.
   * Note that some dust may still be left over, even in the event of a max
   * withdrawal, due to the fact that Dai has a higher precision than cDAI. Also
   * note that the withdrawal will fail in the event that Compound does not have
   * sufficient Dai available to withdraw.
   * @param amount uint256 The amount of Dai to withdraw.
   * @param recipient address The account to transfer the withdrawn Dai to.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @param userSignature bytes Unused in V0.
   * @param dharmaSignature bytes A signature that resolves to the public key
   * returned for this account from the Dharma Key Registry. A unique hash
   * returned from `getCustomActionID` is prefixed and hashed to create the
   * signed message.
   * @return True if the withdrawal succeeded, otherwise false.
   */
  function withdrawDai(
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (bool ok) {
    // Declare the unused value to avoid compiler and linter warnings.
    userSignature;

    // Ensure either caller or supplied signature is valid and increment nonce.
    _validateActionAndIncrementNonce(
      ActionType.DAIWithdrawal,
      amount,
      recipient,
      minimumActionGas,
      dharmaSignature
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
      _diagnoseAndEmitErrorRelatedToWithdrawal(AssetType.DAI);
    } else {
      // Set ok to false if the call succeeded but the withdrawal failed.
      ok = abi.decode(returnData, (bool));
    }
  }

  /**
   * @notice Protected function that can only be called from `withdrawDai` on
   * this contract. It will attempt to withdraw the supplied amount of Dai, or
   * the maximum amount if specified using `uint256(-1)`, to the supplied
   * recipient address by redeeming the underlying Dai from the cDAI contract
   * and transferring it to the recipient. An ExternalError will be emitted and
   * the transfer will be skipped if the call to `redeemUnderlying` fails, and
   * any revert will be caught by `withdrawDai` and diagnosed in order to emit
   * an appropriate ExternalError as well.
   * @param amount uint256 The amount of Dai to withdraw.
   * @param recipient address The account to transfer the withdrawn Dai to.
   * @return True if the withdrawal succeeded, otherwise false.
   */
  function _withdrawDaiAtomic(
    uint256 amount,
    address recipient
  ) external returns (bool success) {
    // Ensure caller is this contract and self-call context is correctly set.
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

  /**
   * @notice Withdraw USDC to a provided recipient address by redeeming the
   * underlying USDC from the cUSDC contract and transferring it to recipient.
   * All USDC in Compound and in the smart wallet itself can be withdrawn by
   * providing an amount of uint256(-1) or 0xfff...fff. This function can be
   * called directly by the account set as the global key on the Dharma Key
   * Registry, or by any relayer that provides a signed message from the same
   * keyholder. The nonce used for the signature must match the current nonce on
   * the smart wallet, and gas supplied to the call must exceed the specified
   * minimum action gas, plus the gas that will be spent before the gas check is
   * reached - usually somewhere around 25,000 gas. If the withdrawal fails, an
   * ExternalError with additional details on what went wrong will be emitted.
   * Note that the USDC contract can be paused and also allows for blacklisting
   * accounts - either of these possibilities may cause a withdrawal to fail. In
   * addition, Compound may not have sufficient USDC available at the time to
   * withdraw.
   * @param amount uint256 The amount of USDC to withdraw.
   * @param recipient address The account to transfer the withdrawn USDC to.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @param userSignature bytes Unused in V0.
   * @param dharmaSignature bytes A signature that resolves to the public key
   * returned for this account from the Dharma Key Registry. A unique hash
   * returned from `getCustomActionID` is prefixed and hashed to create the
   * signed message.
   * @return True if the withdrawal succeeded, otherwise false.
   */
  function withdrawUSDC(
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external returns (bool ok) {
    // Declare the unused value to avoid compiler and linter warnings.
    userSignature;

    // Ensure either caller or supplied signature is valid and increment nonce.
    _validateActionAndIncrementNonce(
      ActionType.USDCWithdrawal,
      amount,
      recipient,
      minimumActionGas,
      dharmaSignature
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
      _diagnoseAndEmitErrorRelatedToWithdrawal(AssetType.USDC);
    } else {
      // Ensure that ok == false in the event the withdrawal failed.
      ok = abi.decode(returnData, (bool));
    }
  }

  /**
   * @notice Protected function that can only be called from `withdrawUSDC` on
   * this contract. It will attempt to withdraw the supplied amount of USDC, or
   * the maximum amount if specified using `uint256(-1)`, to the supplied
   * recipient address by redeeming the underlying USDC from the cUSDC contract
   * and transferring it to the recipient. An ExternalError will be emitted and
   * the transfer will be skipped if the call to `redeemUnderlying` fails, and
   * any revert will be caught by `withdrawUSDC` and diagnosed in order to emit
   * an appropriate ExternalError as well.
   * @param amount uint256 The amount of USDC to withdraw.
   * @param recipient address The account to transfer the withdrawn USDC to.
   * @return True if the withdrawal succeeded, otherwise false.
   */
  function _withdrawUSDCAtomic(
    uint256 amount,
    address recipient
  ) external returns (bool success) {
    // Ensure caller is this contract and self-call context is correctly set.
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

  /**
   * @notice Allow signatory to increment the nonce at any point. The current
   * nonce needs to be provided as an argument to the a signature so as not to
   * enable griefing attacks. All arguments can be omitted if called directly.
   * No value is returned from this function - it will either succeed or revert.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @param signature bytes A signature that resolves to the public key returned
   * for this account from the Dharma Key Registry. A unique hash returned from
   * `getCustomActionID` is prefixed and hashed to create the signed message.
   */  
  function cancel(
    uint256 minimumActionGas,
    bytes calldata signature
  ) external {
    // Ensure either caller or supplied signature is valid and increment nonce.
    _validateActionAndIncrementNonce(
      ActionType.Cancel,
      0,
      address(0),
      minimumActionGas,
      signature
    );
  }

  /**
   * @notice Allow signatory to set a new user signing key. The current nonce
   * needs to be provided as an argument to the a signature so as not to enable
   * griefing attacks. All arguments apart from the user signing key can be
   * omitted if called directly. No value is returned from this function - it
   * will either succeed or revert.
   * @param userSigningKey address The new user signing key to set on this smart
   * wallet.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @param userSignature bytes Unused in V0.
   * @param dharmaSignature bytes A signature that resolves to the public key
   * returned for this account from the Dharma Key Registry. A unique hash
   * returned from `getCustomActionID` is prefixed and hashed to create the
   * signed message.
   */
  function setUserSigningKey(
    address userSigningKey,
    uint256 minimumActionGas,
    bytes calldata userSignature,
    bytes calldata dharmaSignature
  ) external {
    // Declare the unused value to avoid compiler and linter warnings.
    userSignature;

    // Ensure either caller or supplied signature is valid and increment nonce.
    _validateActionAndIncrementNonce(
      ActionType.SetUserSigningKey,
      0,
      userSigningKey,
      minimumActionGas,
      dharmaSignature
    );

    // Set new user signing key on smart wallet and emit a corresponding event.
    _setUserSigningKey(userSigningKey);
  }

  /**
   * @notice Retrieve the Dai and USDC balances held by the smart wallet, both
   * directly and held in Compound. This is not a view function since Compound
   * will calculate accrued interest as part of the underlying balance checks,
   * but can still be called from an off-chain source as though it were a view
   * function.
   * @return The Dai balance, the USDC balance, the underlying Dai balance of
   * the cDAI balance, and the underlying USDC balance of the cUSDC balance.
   */
  function getBalances() external returns (
    uint256 daiBalance,
    uint256 usdcBalance,
    uint256 etherBalance, // always returns 0
    uint256 cDaiUnderlyingDaiBalance,
    uint256 cUsdcUnderlyingUsdcBalance,
    uint256 cEtherUnderlyingEtherBalance // always returns 0
  ) {
    daiBalance = _DAI.balanceOf(address(this));
    usdcBalance = _USDC.balanceOf(address(this));
    cDaiUnderlyingDaiBalance = _CDAI.balanceOfUnderlying(address(this));
    cUsdcUnderlyingUsdcBalance = _CUSDC.balanceOfUnderlying(address(this));
  }

  /**
   * @notice View function for getting the current user signing key for the
   * smart wallet.
   * @return The current user signing key.
   */
  function getUserSigningKey() external view returns (address userSigningKey) {
    userSigningKey = _userSigningKey;
  }

  /**
   * @notice View function for getting the current nonce of the smart wallet.
   * This nonce is incremented whenever an action is taken that requires a
   * signature and/or a specific caller.
   * @return The current nonce.
   */
  function getNonce() external view returns (uint256 nonce) {
    nonce = _nonce;
  }

  /**
   * @notice View function that, given an action type and arguments, will return
   * the action ID or message hash that will need to be prefixed (according to
   * EIP-191 0x45), hashed, and signed by the key designated by the Dharma Key
   * Registry in order to construct a valid signature for the corresponding
   * action. The current nonce will be used, which means that it will only be
   * valid for the next action taken.
   * @param action uint8 The type of action, designated by it's index. Valid
   * actions in V0 include Cancel (0), SetUserSigningKey (1), DAIWithdrawal (4),
   * and USDCWithdrawal (5).
   * @param amount uint256 The amount to withdraw for Withdrawal actions, or 0
   * for other action types.
   * @param recipient address The account to transfer withdrawn funds to, the
   * new user signing key, or the null address for cancelling.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @return The action ID, which will need to be prefixed, hashed and signed in
   * order to construct a valid signature.
   */
  function getNextCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID) {
    // Determine the actionID - this serves as a signature hash for an action.
    actionID = _getCustomActionID(
      action, amount, recipient, _nonce, minimumActionGas, _getDharmaSigningKey()
    );
  }

  /**
   * @notice View function that, given an action type and arguments, will return
   * the action ID or message hash that will need to be prefixed (according to
   * EIP-191 0x45), hashed, and signed by the key designated by the Dharma Key
   * Registry in order to construct a valid signature for the corresponding
   * action. Any nonce value may be supplied, which enables constructing valid
   * message hashes for multiple future actions ahead of time.
   * @param action uint8 The type of action, designated by it's index. Valid
   * actions in V0 include Cancel (0), SetUserSigningKey (1), DAIWithdrawal (4),
   * and USDCWithdrawal (5).
   * @param amount uint256 The amount to withdraw for Withdrawal actions, or 0
   * for other action types.
   * @param recipient address The account to transfer withdrawn funds to, the
   * new user signing key, or the null address for cancelling.
   * @param nonce uint256 The nonce to use.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @return The action ID, which will need to be prefixed, hashed and signed in
   * order to construct a valid signature.
   */
  function getCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID) {
    // Determine the actionID - this serves as a signature hash for an action.
    actionID = _getCustomActionID(
      action, amount, recipient, nonce, minimumActionGas, _getDharmaSigningKey()
    );
  }

  /**
   * @notice Pure function for getting the current Dharma Smart Wallet version.
   * @return The current Dharma Smart Wallet version.
   */
  function getVersion() external pure returns (uint256 version) {
    version = _DHARMA_SMART_WALLET_VERSION;
  }

  function test() external pure returns (bool) {
    return true;
  }

  function testRevert() external pure returns (bool) {
    revert("This revert message should be visible.");
  }

  /**
   * @notice Internal function for setting a new user signing key. A
   * NewUserSigningKey event will also be emitted.
   * @param userSigningKey address The new user signing key to set on this smart
   * wallet.
   */
  function _setUserSigningKey(address userSigningKey) internal {
    // Ensure that a user signing key is set on this smart wallet.
    require(userSigningKey != address(0), "No user signing key provided.");

    _userSigningKey = userSigningKey;
    emit NewUserSigningKey(userSigningKey);
  }

  /**
   * @notice Internal function for incrementing the nonce.
   */
  function _incrementNonce() internal {
    _nonce++;
  }

  /**
   * @notice Internal function for setting the allowance of a given ERC20 asset
   * to the maximum value. This enables the corresponding cToken for the asset
   * to pull in tokens in order to make deposits.
   * @param asset uint256 The ID of the asset, either Dai (0) or USDC (1).
   * @return True if the approval succeeded, otherwise false.
   */
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
      // Note: since both cTokens have the same interface, just use cDAI's.
      _DAI.approve.selector, cToken, uint256(-1)
    ));

    // Emit a corresponding event if the approval failed.
    if (!ok) {
      if (asset == AssetType.DAI) {
        emit ExternalError(address(_DAI), "DAI contract reverted on approval.");
      } else {
        // Find out why USDC transfer reverted (it doesn't give revert reasons).
        _diagnoseAndEmitUSDCSpecificError(_USDC.approve.selector);
      }
    }
  }

  /**
   * @notice Internal function for depositing a given ERC20 asset and balance on
   * the corresponding cToken. No value is returned, as no additional steps need
   * to be conditionally performed after the deposit.
   * @param asset uint256 The ID of the asset, either Dai (0) or USDC (1).
   * @param balance uint256 The amount of the asset to deposit. Note that an
   * attempt to deposit "dust" (i.e. very small amounts) may result in 0 cTokens
   * being minted, or in fewer cTokens being minted than is implied by the
   * current exchange rate (due to lack of sufficient precision on the tokens).
   */
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

  /**
   * @notice Internal function for withdrawing a given ERC20 asset and balance
   * from the corresponding cToken. Note that the requested balance may not be
   * currently available on Compound, which will cause the withdrawal to fail.
   * @param asset uint256 The ID of the asset, either Dai (0) or USDC (1).
   * @param balance uint256 The amount of the asset to withdraw, denominated in
   * the underlying token. Note that an attempt to withdraw "dust" (i.e. very
   * small amounts) may result in 0 underlying tokens being redeemed, or in
   * fewer tokens being redeemed than is implied by the current exchange rate
   * (due to lack of sufficient precision on the tokens).
   * @return True if the withdrawal succeeded, otherwise false.
   */
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

  /**
   * @notice Internal function for validating supplied gas (if specified),
   * retrieving the signer's public key from the Dharma Key Registry, deriving
   * the action ID, validating the provided signature using the signer's key and
   * the action ID, and incrementing the nonce. This function serves as the
   * entrypoint for all protected "actions" on the smart wallet, and is the only
   * area where these functions should revert (other than due to out-of-gas
   * errors, which can be guarded against by supplying a minimum action gas
   * requirement).
   * @param action uint8 The type of action, designated by it's index. Valid
   * actions in V0 include Cancel (0), SetUserSigningKey (1), DAIWithdrawal (4),
   * and USDCWithdrawal (5).
   * @param amount uint256 The amount to withdraw for Withdrawal actions, or 0
   * for other action types.
   * @param recipient address The account to transfer withdrawn funds to, the
   * new user signing key, or the null address for cancelling.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @param dharmaSignature bytes A signature that resolves to the public key
   * returned for this account from the Dharma Key Registry. A unique hash
   * returned from `getCustomActionID` is prefixed and hashed to create the
   * signed message.
   */
  function _validateActionAndIncrementNonce(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 minimumActionGas,
    bytes memory dharmaSignature
  ) internal {
    // Ensure that the current gas exceeds the minimum required action gas.
    // This prevents griefing attacks where an attacker can invalidate a
    // signature without providing enough gas for the action to succeed. Also
    // note that some gas will be spent before this check is reached - supplying
    // ~30,000 additional gas should suffice when submitting transactions. To
    // skip this requirement, supply zero for the minimumActionGas argument.
    if (minimumActionGas != 0) {
      require(
        gasleft() >= minimumActionGas,
        "Invalid action - insufficient gas supplied by transaction submitter."
      );
    }

    // Get the Dharma signing key that will be used to verify the signature.
    address dharmaSigningKey = _getDharmaSigningKey();

    // Determine the actionID - this serves as the signature hash.
    bytes32 actionID = _getCustomActionID(
      action, amount, recipient, _nonce, minimumActionGas, dharmaSigningKey
    );

    // Validate Dharma signing key signature unless it is `msg.sender`.
    if (msg.sender != dharmaSigningKey) {
      require(
        dharmaSigningKey == actionID.toEthSignedMessageHash().recover(
          dharmaSignature
        ),
        "Invalid action - invalid Dharma signature."
      );
    }

    // Increment nonce in order to prevent reuse of signatures after the call.
    _incrementNonce();
  }

  /**
   * @notice Internal function for entering cDAI, cUSDC, and cETH markets. This
   * is performed now so that V0 smart wallets will not need to be reinitialized
   * in order to support using these assets as collateral when borrowing funds.
   */
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
      // Decode the revert reason in the event one was returned.
      string memory revertReason = _decodeRevertReason(data);

      emit ExternalError(
        address(_COMPTROLLER),
        string(
          abi.encodePacked(
            "Compound Comptroller contract reverted on enterMarkets: ",
            revertReason
          )
        )
      );
    }
  }

  /**
   * @notice Internal function to determine whether a call to a given cToken
   * succeeded, and to emit a relevant ExternalError event if it failed. The
   * failure can be caused by a call that reverts, or by a call that does not
   * revert but returns a non-zero error code.
   * @param asset uint256 The ID of the asset, either Dai (0) or USDC (1).
   * @param functionSelector bytes4 The function selector that was called on the
   * corresponding cToken of the asset type.
   * @param ok bool A boolean representing whether the call returned or
   * reverted.
   * @param data bytes The data provided by the returned or reverted call.
   * @return True if the interaction was successful, otherwise false. This will
   * be used to determine if subsequent steps in the action should be attempted
   * or not, specifically a transfer following a withdrawal.
   */
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
        // Get called contract address, name of contract, and function name.
        (address account, string memory name, string memory functionName) = (
          _getCTokenDetails(asset, functionSelector)
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
      // Get called contract address, name of contract, and function name.
      (address account, string memory name, string memory functionName) = (
        _getCTokenDetails(asset, functionSelector)
      );

      // Decode the revert reason in the event one was returned.
      string memory revertReason = _decodeRevertReason(data);

      emit ExternalError(
        account,
        string(
          abi.encodePacked(
            "Compound ",
            name,
            " contract reverted while attempting to call ",
            functionName,
            ": ",
            revertReason
          )
        )
      );
    }
  }

  /**
   * @notice Internal function to diagnose the reason that a withdrawal attempt
   * failed and to emit a corresponding ExternalError event. Errors related to
   * the call to `redeemUnderlying` on the cToken are handled by
   * `_checkCompoundInteractionAndLogAnyErrors` - if the error did not originate
   * from that call, it could be caused by a call to `balanceOfUnderlying` (i.e.
   * when attempting a maximum withdrawal) or by the call to `transfer` on the
   * underlying token after the withdrawal has been completed.
   * @param asset uint256 The ID of the asset, either Dai (0) or USDC (1).
   */
  function _diagnoseAndEmitErrorRelatedToWithdrawal(AssetType asset) internal {
    // Get called contract address and name of contract (no need for selector).
    (address cToken, string memory name, ) = _getCTokenDetails(
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
        _diagnoseAndEmitUSDCSpecificError(_USDC.transfer.selector);
      }   
    }
  }

  /**
   * @notice Internal function to diagnose the reason that a call to the USDC
   * contract failed and to emit a corresponding ExternalError event. USDC can
   * blacklist accounts and pause the contract, which can both cause a transfer
   * or approval to fail.
   * @param functionSelector bytes4 The function selector that was called on the
   * USDC contract.
   */
  function _diagnoseAndEmitUSDCSpecificError(bytes4 functionSelector) internal {
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
            functionName, " failed - USDC has blacklisted this user."
          )
        )
      );
    } else { // Note: `else if` breaks coverage.
      if (_USDC_NAUGHTY.paused()) {
        emit ExternalError(
          address(_USDC),
          string(
            abi.encodePacked(
              functionName, " failed - USDC contract is currently paused."
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

  /**
   * @notice Internal function to ensure that protected functions can only be
   * called from this contract and that they have the appropriate context set.
   * The self-call context is then cleared. It is used as an additional guard
   * against reentrancy, especially once generic actions are supported by the
   * smart wallet in future versions.
   * @param selfCallContext bytes4 The expected self-call context, equal to the
   * function selector of the approved calling function.
   */
  function _enforceSelfCallFrom(bytes4 selfCallContext) internal {
    // Ensure caller is this contract and self-call context is correctly set.
    require(
      msg.sender == address(this) &&
      _selfCallContext == selfCallContext,
      "External accounts or unapproved internal functions cannot call this."
    );

    // Clear the self-call context.
    delete _selfCallContext;
  }

  /**
   * @notice Internal view function to get the Dharma signing key for the smart
   * wallet from the Dharma Key Registry. Note that, for V0, this is actually
   * the *only* key used, as the primary user signing key will first need to be
   * provided for each smart wallet. This version uses the global key from the
   * Dharma Key Registry; to support the use of user-specific keys with a global
   * fallback, instead call `getKey()` on the registry.
   * @return The address of the Dharma signing key, or public key corresponding
   * to the secondary signer.
   */
  function _getDharmaSigningKey() internal view returns (
    address dharmaSigningKey
  ) {
    dharmaSigningKey = _DHARMA_KEY_REGISTRY.getGlobalKey();
  }

  /**
   * @notice Internal view function that, given an action type and arguments,
   * will return the action ID or message hash that will need to be prefixed
   * (according to EIP-191 0x45), hashed, and signed by the key designated by
   * the Dharma Key Registry in order to construct a valid signature for the
   * corresponding action. The current nonce will be supplied to this function
   * when reconstructing an action ID during protected function execution based
   * on the supplied parameters.
   * @param action uint8 The type of action, designated by it's index. Valid
   * actions in V0 include Cancel (0), SetUserSigningKey (1), DAIWithdrawal (4),
   * and USDCWithdrawal (5).
   * @param amount uint256 The amount to withdraw for Withdrawal actions, or 0
   * for other action types.
   * @param recipient address The account to transfer withdrawn funds to, the
   * new user signing key, or the null address for cancelling.
   * @param nonce uint256 The nonce to use.
   * @param minimumActionGas uint256 The minimum amount of gas that must be
   * provided to this call - be aware that additional gas must still be included
   * to account for the cost of overhead incurred up until the start of this
   * function call.
   * @param dharmaSigningKey address The address of the secondary key, or public
   * key corresponding to the secondary signer.
   * @return The action ID, which will need to be prefixed, hashed and signed in
   * order to construct a valid signature.
   */
  function _getCustomActionID(
    ActionType action,
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 minimumActionGas,
    address dharmaSigningKey
  ) internal view returns (bytes32 actionID) {
    // The actionID is constructed according to EIP-191-0x45 to prevent replays.
    actionID = keccak256(
      abi.encodePacked(
        address(this),
        _DHARMA_SMART_WALLET_VERSION,
        _userSigningKey,
        dharmaSigningKey,
        nonce,
        minimumActionGas,
        action,
        amount,
        recipient
      )
    );
  }

  /**
   * @notice Internal pure function to get the cToken address, it's name, and
   * the name of the called function, based on a supplied asset type and
   * function selector. It is used to help construct ExternalError events.
   * @param asset uint256 The ID of the asset, either Dai (0) or USDC (1).
   * @param functionSelector bytes4 The function selector that was called on the
   * corresponding cToken of the asset type.
   * @return The cToken address, it's name, and the name of the called function.
   */
  function _getCTokenDetails(
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

  /**
   * @notice Internal pure function to decode revert reasons. The revert reason
   * prefix is removed and the remaining string argument is decoded.
   * @param revertData bytes The raw data supplied alongside the revert.
   * @return The decoded revert reason string.
   */
  function _decodeRevertReason(
    bytes memory revertData
  ) internal pure returns (string memory revertReason) {
    // Solidity prefixes revert reason with 0x08c379a0 -> Error(string) selector
    if (
      revertData.length > 68 && // prefix (4) + position (32) + length (32)
      revertData[0] == byte(0x08) &&
      revertData[1] == byte(0xc3) &&
      revertData[2] == byte(0x79) &&
      revertData[3] == byte(0xa0)
    ) {
      // Get the revert reason without the prefix from the revert data.
      bytes memory revertReasonBytes = new bytes(revertData.length - 4);
      for (uint256 i = 4; i < revertData.length; i++) {
        revertReasonBytes[i - 4] = revertData[i];
      }

      // Decode the resultant revert reason as a string.
      revertReason = abi.decode(revertReasonBytes, (string));
    } else {
      // Simply return the default, with no revert reason.
      revertReason = "(no revert reason)";
    }
  }
}