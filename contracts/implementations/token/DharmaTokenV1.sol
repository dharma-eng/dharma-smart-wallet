pragma solidity 0.5.11;

import "./DharmaTokenHelpers.sol";
import "../../interfaces/CTokenInterface.sol";
import "../../interfaces/DTokenInterface.sol";
import "../../interfaces/ERC20Interface.sol";
import "../../interfaces/ERC1271Interface.sol";


/**
 * @title DharmaTokenV1
 * @author 0age (dToken mechanics derived from Compound cTokens, ERC20 mechanics
 * derived from Open Zeppelin's ERC20 contract)
 * @notice A Dharma Token (or dToken) is an upgradeable ERC20 token with support
 * for meta-transactions that earns interest with respect to a given stablecoin,
 * and is backed by that stablecoin's respective Compound cToken. The V1 dToken
 * exchange rate will grow at 90% the rate of the backing cToken exchange rate.
 * This abstract contract contains functionality shared by each dToken - those
 * implementations will then inherit this contract and override any relevant,
 * unimplemented internal functions with implementation-specific ones.
 */
contract DharmaTokenV1 is ERC20Interface, DTokenInterface, DharmaTokenHelpers {
  // Set the version of the Dharma Token as a constant.
  uint256 private constant _DTOKEN_VERSION = 1;

  // Set block number and dToken + cToken exchange rate in slot zero on accrual.
  AccrualIndex private _accrualIndex;

  // Slot one tracks the total issued dTokens.
  uint256 private _totalSupply;

  // Slots two and three are entrypoints into balance and allowance mappings.
  mapping (address => uint256) private _balances;
  mapping (address => mapping (address => uint256)) private _allowances;

  // Slot four is an entrypoint into a mapping for used meta-transaction hashes.
  mapping (bytes32 => bool) private _executedMetaTxs;

  /**
   * @notice Transfer `underlyingToSupply` underlying tokens from `msg.sender`
   * to this contract, use them to mint cTokens as backing, and mint dTokens to
   * `msg.sender`. Ensure that this contract has been approved to transfer the
   * underlying on behalf of the caller before calling this function.
   * @param underlyingToSupply uint256 The amount of underlying to provide as
   * part of minting.
   * @return The amount of dTokens received in return for the supplied
   * underlying tokens.
   */
  function mint(
    uint256 underlyingToSupply
  ) external returns (uint256 dTokensMinted) {
    // Instantiate interfaces for the underlying token and the backing cToken.
    ERC20Interface underlying = ERC20Interface(_getUnderlying());
    CTokenInterface cToken = CTokenInterface(_getCToken());

    // Pull in underlying - ensure that this contract has sufficient allowance.
    require(
      underlying.transferFrom(msg.sender, address(this), underlyingToSupply),
      _getTransferFailureMessage()
    );

    // Use underlying to mint cTokens and ensure that the operation succeeds.
    (bool ok, bytes memory data) = address(cToken).call(abi.encodeWithSelector(
      cToken.mint.selector, underlyingToSupply
    ));
    _checkCompoundInteraction(cToken.mint.selector, ok, data);

    // Accrue after the Compound mint to avoid duplicating accrual calculations.
    (uint256 dTokenExchangeRate, uint256 cTokenExchangeRate) = _accrue(false);

    // Get underlying equivalent of minted cTokens to prevent "dust" griefing.
    (, uint256 underlyingEquivalent) = _fromUnderlyingAndBack(
      underlyingToSupply, cTokenExchangeRate, false, false
    );

    // Determine dTokens to mint using underlying equivalent and exchange rate.
    dTokensMinted = _fromUnderlying(
      underlyingEquivalent, dTokenExchangeRate, false
    );

    // Mint dTokens to the caller.
    _mint(msg.sender, underlyingToSupply, dTokensMinted);
  }

  /**
   * @notice Transfer `cTokensToSupply` cTokens from `msg.sender` to this
   * contract and mint dTokens to `msg.sender`. Ensure that this contract has
   * been approved to transfer the cTokens on behalf of the caller before
   * calling this function.
   * @param cTokensToSupply uint256 The amount of cTokens to provide as part of
   * minting.
   * @return The amount of dTokens received in return for the supplied cTokens.
   */
  function mintViaCToken(
    uint256 cTokensToSupply
  ) external returns (uint256 dTokensMinted) {
    // Instantiate the interface for the backing cToken.
    CTokenInterface cToken = CTokenInterface(_getCToken());

    // Pull in cTokens - ensure that this contract has sufficient allowance.
    (bool ok, bytes memory data) = address(cToken).call(abi.encodeWithSelector(
      cToken.transferFrom.selector, msg.sender, address(this), cTokensToSupply
    ));
    _checkCompoundInteraction(cToken.transferFrom.selector, ok, data);

    // Accrue interest and retrieve current cToken and dToken exchange rates.
    (uint256 dTokenExchangeRate, uint256 cTokenExchangeRate) = _accrue(true);

    // Determine the underlying equivalent of the supplied cToken amount.
    uint256 underlyingEquivalent = _toUnderlying(
      cTokensToSupply, cTokenExchangeRate, false
    );

    // Determine dTokens to mint using underlying equivalent and exchange rate.
    dTokensMinted = _fromUnderlying(
      underlyingEquivalent, dTokenExchangeRate, false
    );

    // Mint dTokens to the caller.
    _mint(msg.sender, underlyingEquivalent, dTokensMinted);
  }

  /**
   * @notice Redeem `dTokensToBurn` dTokens from `msg.sender`, use the
   * corresponding cTokens to redeem the required underlying, and transfer the
   * redeemed underlying tokens to `msg.sender`.
   * @param dTokensToBurn uint256 The amount of dTokens to provide in exchange
   * for underlying tokens.
   * @return The amount of underlying received in return for the provided
   * dTokens.
   */
  function redeem(
    uint256 dTokensToBurn
  ) external returns (uint256 underlyingReceived) {
    // Instantiate interfaces for the underlying token and the backing cToken.
    ERC20Interface underlying = ERC20Interface(_getUnderlying());
    CTokenInterface cToken = CTokenInterface(_getCToken());

    // Accrue interest and retrieve current dToken and cToken exchange rates.
    (uint256 dTokenExchangeRate, uint256 cTokenExchangeRate) = _accrue(true);

    // Determine the equivalent underlying value of the dTokens to be burned.
    uint256 underlyingEquivalent = _toUnderlying(
      dTokensToBurn, dTokenExchangeRate, false
    );

    // Get minted cTokens and underlying equivalent to prevent "dust" griefing.
    uint256 cTokenEquivalent;
    (cTokenEquivalent, underlyingReceived) = _fromUnderlyingAndBack(
      underlyingEquivalent, cTokenExchangeRate, false, false
    );

    // Burn the dTokens.
    _burn(msg.sender, underlyingReceived, dTokensToBurn);

    // Use cTokens to redeem underlying and ensure that the operation succeeds.
    (bool ok, bytes memory data) = address(cToken).call(abi.encodeWithSelector(
      cToken.redeem.selector, cTokenEquivalent
    ));
    _checkCompoundInteraction(cToken.redeem.selector, ok, data);

    // Send the redeemed underlying tokens to the caller.
    require(
      underlying.transfer(msg.sender, underlyingReceived),
      _getTransferFailureMessage()
    );
  }

  /**
   * @notice Redeem `dTokensToBurn` dTokens from `msg.sender` and transfer the
   * corresponding amount of cTokens to `msg.sender`.
   * @param dTokensToBurn uint256 The amount of dTokens to provide in exchange
   * for the cTokens.
   * @return The amount of cTokens received in return for the provided dTokens.
   */
  function redeemToCToken(
    uint256 dTokensToBurn
  ) external returns (uint256 cTokensReceived) {
    // Instantiate the interface for the backing cToken.
    CTokenInterface cToken = CTokenInterface(_getCToken());

    // Accrue interest and retrieve current cToken and dToken exchange rates.
    (uint256 dTokenExchangeRate, uint256 cTokenExchangeRate) = _accrue(true);

    // Determine the underlying token value of the dTokens to be burned.
    uint256 underlyingEquivalent = _toUnderlying(
      dTokensToBurn, dTokenExchangeRate, false
    );

    // Determine amount of cTokens corresponding to underlying equivalent value.
    cTokensReceived = _fromUnderlying(
      underlyingEquivalent, cTokenExchangeRate, false
    );

    // Burn the dTokens.
    _burn(msg.sender, underlyingEquivalent, dTokensToBurn);

    // Transfer cTokens to the caller and ensure that the operation succeeds.
    (bool ok, bytes memory data) = address(cToken).call(abi.encodeWithSelector(
      cToken.transfer.selector, msg.sender, cTokensReceived
    ));
    _checkCompoundInteraction(cToken.transfer.selector, ok, data);
  }

  /**
   * @notice Redeem the dToken equivalent value of the underlying token amount
   * `underlyingToReceive` from `msg.sender`, use the corresponding cTokens to
   * redeem the underlying, and transfer the underlying to `msg.sender`.
   * @param underlyingToReceive uint256 The amount, denominated in the
   * underlying token, of the cToken to redeem in exchange for the received
   * underlying token.
   * @return The amount of dTokens burned in exchange for the returned
   * underlying tokens.
   */
  function redeemUnderlying(
    uint256 underlyingToReceive
  ) external returns (uint256 dTokensBurned) {
    // Instantiate interfaces for the underlying token and the backing cToken.
    ERC20Interface underlying = ERC20Interface(_getUnderlying());
    CTokenInterface cToken = CTokenInterface(_getCToken());

    // Use cTokens to redeem underlying and ensure that the operation succeeds.
    (bool ok, bytes memory data) = address(cToken).call(abi.encodeWithSelector(
      cToken.redeemUnderlying.selector, underlyingToReceive
    ));
    _checkCompoundInteraction(cToken.redeemUnderlying.selector, ok, data);

    // Accrue after the Compound redeem to avoid duplicating calculations.
    (uint256 dTokenExchangeRate, uint256 cTokenExchangeRate) = _accrue(false);

    // Get underlying equivalent of redeemed cTokens to prevent "dust" griefing.
    (, uint256 underlyingEquivalent) = _fromUnderlyingAndBack(
      underlyingToReceive, cTokenExchangeRate, true, true // rounding up both
    );

    // Determine the dTokens to redeem using the exchange rate, rounding up.
    dTokensBurned = _fromUnderlying(
      underlyingEquivalent, dTokenExchangeRate, true
    );

    // Burn the dTokens.
    _burn(msg.sender, underlyingToReceive, dTokensBurned);

    // Send the redeemed underlying tokens to the caller.
    require(
      underlying.transfer(msg.sender, underlyingToReceive),
      _getTransferFailureMessage()
    );
  }

  /**
   * @notice Redeem the dToken equivalent value of the underlying tokens of
   * amount `underlyingToReceive` from `msg.sender` and transfer the
   * corresponding amount of cTokens to `msg.sender`.
   * @param underlyingToReceive uint256 The amount, denominated in the
   * underlying token, of cTokens to receive.
   * @return The amount of dTokens burned in exchange for the returned cTokens.
   */
  function redeemUnderlyingToCToken(
    uint256 underlyingToReceive
  ) external returns (uint256 dTokensBurned) {
    // Instantiate the interface for the backing cToken.
    CTokenInterface cToken = CTokenInterface(_getCToken());

    // Accrue interest and retrieve current cToken and dToken exchange rates.
    (uint256 dTokenExchangeRate, uint256 cTokenExchangeRate) = _accrue(true);

    // Get received cTokens and underlying equivalent (prevent "dust" griefing).
    (
      uint256 cTokensToReceive, uint256 underlyingEquivalent
    ) = _fromUnderlyingAndBack(
      underlyingToReceive, cTokenExchangeRate, false, true // round down cTokens
    );

    // Determine redeemed dTokens using equivalent underlying value, rounded up.
    dTokensBurned = _fromUnderlying(
      underlyingEquivalent, dTokenExchangeRate, true
    );

    // Burn the dTokens.
    _burn(msg.sender, underlyingToReceive, dTokensBurned);

    // Transfer cTokens to the caller and ensure that the operation succeeds.
    (bool ok, bytes memory data) = address(cToken).call(abi.encodeWithSelector(
      cToken.transfer.selector, msg.sender, cTokensToReceive
    ));
    _checkCompoundInteraction(cToken.transfer.selector, ok, data);
  }

  /**
   * @notice Transfer cTokens with underlying value in excess of the total
   * underlying dToken value to a dedicated "vault" account. A "hard" accrual
   * will first be performed, triggering an accrual on both the cToken and the
   * dToken.
   * @return The amount of cTokens transferred to the vault account.
   */
  function pullSurplus() external returns (uint256 cTokenSurplus) {
    // Instantiate the interface for the backing cToken.
    CTokenInterface cToken = CTokenInterface(_getCToken());

    // Accrue interest on the cToken and ensure that the operation succeeds.
    (bool ok, bytes memory data) = address(cToken).call(abi.encodeWithSelector(
      cToken.accrueInterest.selector
    ));
    _checkCompoundInteraction(cToken.accrueInterest.selector, ok, data);

    // Accrue interest on the dToken, reusing the stored cToken exchange rate.
    _accrue(false);

    // Determine cToken surplus in underlying (cToken value - dToken value).
    uint256 underlyingSurplus;
    (underlyingSurplus, cTokenSurplus) = _getSurplus();

    // Transfer cToken surplus to vault and ensure that the operation succeeds.
    (ok, data) = address(cToken).call(abi.encodeWithSelector(
      cToken.transfer.selector, _getVault(), cTokenSurplus
    ));
    _checkCompoundInteraction(cToken.transfer.selector, ok, data);

    emit CollectSurplus(underlyingSurplus, cTokenSurplus);
  }

  /**
   * @notice Manually advance the dToken exchange rate and cToken exchange rate
   * to that of the current block. Note that dToken accrual does not trigger
   * cToken accrual - instead, the updated exchange rate will be calculated
   * internally.
   */
  function accrueInterest() external {
    // Accrue interest on the dToken.
    _accrue(true);
  }

  /**
   * @notice Transfer `amount` dTokens from `msg.sender` to `recipient`.
   * @param recipient address The account to transfer the dTokens to.
   * @param amount uint256 The amount of dTokens to transfer.
   * @return A boolean indicating whether the transfer was successful.
   */
  function transfer(
    address recipient, uint256 amount
  ) external returns (bool success) {
    _transfer(msg.sender, recipient, amount);
    success = true;
  }

  /**
   * @notice Transfer dTokens equivalent to `underlyingEquivalentAmount`
   * underlying from `msg.sender` to `recipient`.
   * @param recipient address The account to transfer the dTokens to.
   * @param underlyingEquivalentAmount uint256 The underlying equivalent amount
   * of dTokens to transfer.
   * @return A boolean indicating whether the transfer was successful.
   */
  function transferUnderlying(
    address recipient, uint256 underlyingEquivalentAmount
  ) external returns (bool success) {
    // Accrue interest and retrieve the current dToken exchange rate.
    (uint256 dTokenExchangeRate, ) = _accrue(true);

    // Determine dToken amount to transfer using the exchange rate, rounded up.
    uint256 dTokenAmount = _fromUnderlying(
      underlyingEquivalentAmount, dTokenExchangeRate, true
    );

    // Transfer the dTokens.
    _transfer(msg.sender, recipient, dTokenAmount);
    success = true;
  }

  /**
   * @notice Approve `spender` to transfer up to `value` dTokens on behalf of
   * `msg.sender`.
   * @param spender address The account to grant the allowance.
   * @param value uint256 The size of the allowance to grant.
   * @return A boolean indicating whether the approval was successful.
   */
  function approve(
    address spender, uint256 value
  ) external returns (bool success) {
    _approve(msg.sender, spender, value);
    success = true;
  }

  /**
   * @notice Transfer `amount` dTokens from `sender` to `recipient` as long as
   * `msg.sender` has sufficient allowance.
   * @param sender address The account to transfer the dTokens from.
   * @param recipient address The account to transfer the dTokens to.
   * @param amount uint256 The amount of dTokens to transfer.
   * @return A boolean indicating whether the transfer was successful.
   */
  function transferFrom(
    address sender, address recipient, uint256 amount
  ) external returns (bool success) {
    _transferFrom(sender, recipient, amount);
    success = true;
  }

  /**
   * @notice Transfer dTokens eqivalent to `underlyingEquivalentAmount`
   * underlying from `sender` to `recipient` as long as `msg.sender` has
   * sufficient allowance.
   * @param sender address The account to transfer the dTokens from.
   * @param recipient address The account to transfer the dTokens to.
   * @param underlyingEquivalentAmount uint256 The underlying equivalent amount
   * of dTokens to transfer.
   * @return A boolean indicating whether the transfer was successful.
   */
  function transferUnderlyingFrom(
    address sender, address recipient, uint256 underlyingEquivalentAmount
  ) external returns (bool success) {
    // Accrue interest and retrieve the current dToken exchange rate.
    (uint256 dTokenExchangeRate, ) = _accrue(true);

    // Determine dToken amount to transfer using the exchange rate, rounded up.
    uint256 dTokenAmount = _fromUnderlying(
      underlyingEquivalentAmount, dTokenExchangeRate, true
    );

    // Transfer the dTokens and adjust allowance accordingly.
    _transferFrom(sender, recipient, dTokenAmount);
    success = true;
  }

  /**
   * @notice Increase the current allowance of `spender` by `value` dTokens.
   * @param spender address The account to grant the additional allowance.
   * @param addedValue uint256 The amount to increase the allowance by.
   * @return A boolean indicating whether the modification was successful.
   */
  function increaseAllowance(
    address spender, uint256 addedValue
  ) external returns (bool success) {
    _approve(
      msg.sender, spender, _allowances[msg.sender][spender].add(addedValue)
    );
    success = true;
  }

  /**
   * @notice Decrease the current allowance of `spender` by `value` dTokens.
   * @param spender address The account to decrease the allowance for.
   * @param subtractedValue uint256 The amount to subtract from the allowance.
   * @return A boolean indicating whether the modification was successful.
   */
  function decreaseAllowance(
    address spender, uint256 subtractedValue
  ) external returns (bool success) {
    _approve(
      msg.sender, spender, _allowances[msg.sender][spender].sub(subtractedValue)
    );
    success = true;
  }

  /**
   * @notice Modify the current allowance of `spender` for `owner` by `value`
   * dTokens, increasing it if `increase` is true otherwise decreasing it, via a
   * meta-transaction that expires at `expiration` (or does not expire if the
   * value is zero) and uses `salt` as an additional input, validated using
   * `signatures`.
   * @param owner address The account granting the modified allowance.
   * @param spender address The account to modify the allowance for.
   * @param value uint256 The amount to modify the allowance by.
   * @param increase bool A flag that indicates whether the allowance will be
   * increased by the specified value (if true) or decreased by it (if false).
   * @param expiration uint256 A timestamp indicating how long the modification
   * meta-transaction is valid for - a value of zero will signify no expiration.
   * @param salt bytes32 An arbitrary salt to be provided as an additional input
   * to the hash digest used to validate the signatures.
   * @param signatures bytes A signature, or collection of signatures, that the
   * owner must provide in order to authorize the meta-transaction. If the
   * account of the owner does not have any runtime code deployed to it, the
   * signature will be verified using ecrecover; otherwise, it will be supplied
   * to the owner along with the message digest and context via ERC-1271 for
   * validation.
   * @return A boolean indicating whether the modification was successful.
   */
  function modifyAllowanceViaMetaTransaction(
    address owner,
    address spender,
    uint256 value,
    bool increase,
    uint256 expiration,
    bytes32 salt,
    bytes calldata signatures
  ) external returns (bool success) {
    require(expiration == 0 || now <= expiration, "Meta-transaction expired.");

    // Construct the meta-transaction's message hash based on relevant context.
    bytes memory context = abi.encodePacked(
      address(this),
      // _DTOKEN_VERSION,
      this.modifyAllowanceViaMetaTransaction.selector,
      expiration,
      salt,
      abi.encode(owner, spender, value, increase)
    );
    bytes32 messageHash = keccak256(context);

    // Ensure message hash has never been used before and register it as used.
    require(!_executedMetaTxs[messageHash], "Meta-transaction already used.");
    _executedMetaTxs[messageHash] = true;

    // Construct the digest to compare signatures against using EIP-191 0x45.
    bytes32 digest = keccak256(
      abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
    );

    // Calculate new allowance by applying modification to current allowance.
    uint256 currentAllowance = _allowances[owner][spender];
    uint256 newAllowance = (
      increase ? currentAllowance.add(value) : currentAllowance.sub(value)
    );

    // Use EIP-1271 if owner is a contract - otherwise, use ecrecover.
    if (_isContract(owner)) {
      // Validate via ERC-1271 against the owner account.
      bytes memory data = abi.encode(digest, context);
      bytes4 magic = ERC1271Interface(owner).isValidSignature(data, signatures);
      require(magic == bytes4(0x20c13b0b), "Invalid signatures.");
    } else {
      // Validate via ecrecover against the owner account.
      _verifyRecover(owner, digest, signatures);
    }

    // Modify the allowance.
    _approve(owner, spender, newAllowance);
    success = true;
  }

  /**
   * @notice View function to determine a meta-transaction message hash, and to
   * determine if it is still valid (i.e. it has not yet been used and is not
   * expired). The returned message hash will need to be prefixed using EIP-191
   * 0x45 and hashed again in order to generate a final digest for the required
   * signature - in other words, the same procedure utilized by `eth_Sign`.
   * @param functionSelector bytes4 The function selector for the given
   * meta-transaction. There is only one function selector available for V1:
   * `0x2d657fa5` (the selector for `modifyAllowanceViaMetaTransaction`).
   * @param arguments bytes The abi-encoded function arguments (aside from the
   * `expiration`, `salt`, and `signatures` arguments) that should be supplied
   * to the given function.
   * @param expiration uint256 A timestamp indicating how long the given
   * meta-transaction is valid for - a value of zero will signify no expiration.
   * @param salt bytes32 An arbitrary salt to be provided as an additional input
   * to the hash digest used to validate the signatures.
   * @return The total supply.
   */
  function getMetaTransactionMessageHash(
    bytes4 functionSelector,
    bytes calldata arguments,
    uint256 expiration,
    bytes32 salt
  ) external view returns (bytes32 messageHash, bool valid) {
    // Construct the meta-transaction's message hash based on relevant context.
    messageHash = keccak256(
      abi.encodePacked(
        address(this), functionSelector, expiration, salt, arguments
      )
    );

    // The meta-transaction is valid if it has not been used and is not expired.
    valid = (
      !_executedMetaTxs[messageHash] && (expiration == 0 || now <= expiration)
    );
  }

  /**
   * @notice View function to get the total dToken supply.
   * @return The total supply.
   */
  function totalSupply() external view returns (uint256 dTokenTotalSupply) {
    dTokenTotalSupply = _totalSupply;
  }

  /**
   * @notice View function to get the total dToken supply, denominated in the
   * underlying token.
   * @return The total supply.
   */
  function totalSupplyUnderlying() external view returns (
    uint256 dTokenTotalSupplyInUnderlying
  ) {
    (uint256 dTokenExchangeRate, ,) = _getExchangeRates(true);

    // Determine total value of all issued dTokens, denominated as underlying.
    dTokenTotalSupplyInUnderlying = _toUnderlying(
      _totalSupply, dTokenExchangeRate, false
    );
  }

  /**
   * @notice View function to get the total dToken balance of an account.
   * @param account address The account to check the dToken balance for.
   * @return The balance of the given account.
   */
  function balanceOf(address account) external view returns (uint256 dTokens) {
    dTokens = _balances[account];
  }

  /**
   * @notice View function to get the dToken balance of an account, denominated
   * in the underlying equivalent value.
   * @param account address The account to check the balance for.
   * @return The total underlying-equivalent dToken balance.
   */
  function balanceOfUnderlying(
    address account
  ) external view returns (uint256 underlyingBalance) {
    // Get most recent dToken exchange rate by determining accrued interest.
    (uint256 dTokenExchangeRate, ,) = _getExchangeRates(true);

    // Convert account balance to underlying equivalent using the exchange rate.
    underlyingBalance = _toUnderlying(
      _balances[account], dTokenExchangeRate, false
    );
  }

  /**
   * @notice View function to get the total allowance that `spender` has to
   * transfer dTokens from the `owner` account using `transferFrom`.
   * @param owner address The account that is granting the allowance.
   * @param spender address The account that has been granted the allowance.
   * @return The allowance of the given spender for the given owner.
   */
  function allowance(
    address owner, address spender
  ) external view returns (uint256 dTokenAllowance) {
    dTokenAllowance = _allowances[owner][spender];
  }

  /**
   * @notice View function to get the current dToken exchange rate (multiplied
   * by 10^18).
   * @return The current exchange rate.
   */
  function exchangeRateCurrent() external view returns (
    uint256 dTokenExchangeRate
  ) {
    // Get most recent dToken exchange rate by determining accrued interest.
    (dTokenExchangeRate, ,) = _getExchangeRates(true);
  }

  /**
   * @notice View function to get the current dToken interest earned per block
   * (multiplied by 10^18).
   * @return The current interest rate.
   */
  function supplyRatePerBlock() external view returns (
    uint256 dTokenInterestRate
  ) {
    (dTokenInterestRate,) = _getRatePerBlock();
  }

  /**
   * @notice View function to get the block number where accrual was last
   * performed.
   * @return The block number where accrual was last performed.
   */
  function accrualBlockNumber() external view returns (uint256 blockNumber) {
    blockNumber = _accrualIndex.block;
  }

  /**
   * @notice View function to get the total surplus, or the cToken balance that
   * exceeds the aggregate underlying value of the total dToken supply.
   * @return The total surplus in cTokens.
   */
  function getSurplus() external view returns (uint256 cTokenSurplus) {
    // Determine the cToken (cToken underlying value - dToken underlying value).
    (, cTokenSurplus) = _getSurplus();
  }

  /**
   * @notice View function to get the total surplus in the underlying, or the
   * underlying equivalent of the cToken balance that exceeds the aggregate
   * underlying value of the total dToken supply.
   * @return The total surplus, denominated in the underlying.
   */
  function getSurplusUnderlying() external view returns (
    uint256 underlyingSurplus
  ) {
    // Determine cToken surplus in underlying (cToken value - dToken value).
    (underlyingSurplus, ) = _getSurplus();
  }

  /**
   * @notice View function to get the interest rate spread taken by the dToken
   * from the current cToken supply rate per block (multiplied by 10^18).
   * @return The current interest rate spread.
   */
  function getSpreadPerBlock() external view returns (uint256 rateSpread) {
    (
      uint256 dTokenInterestRate, uint256 cTokenInterestRate
    ) = _getRatePerBlock();
    rateSpread = cTokenInterestRate.sub(dTokenInterestRate);
  }

  /**
   * @notice Pure function to get the name of the dToken.
   * @return The name of the dToken.
   */
  function name() external pure returns (string memory dTokenName) {
    dTokenName = _getDTokenName();
  }

  /**
   * @notice Pure function to get the symbol of the dToken.
   * @return The symbol of the dToken.
   */
  function symbol() external pure returns (string memory dTokenSymbol) {
    dTokenSymbol = _getDTokenSymbol();
  }

  /**
   * @notice Pure function to get the number of decimals of the dToken.
   * @return The number of decimals of the dToken.
   */
  function decimals() external pure returns (uint8 dTokenDecimals) {
    dTokenDecimals = _DECIMALS;
  }

  /**
   * @notice Pure function to get the dToken version.
   * @return The version of the dToken.
   */
  function getVersion() external pure returns (uint256 version) {
    version = _DTOKEN_VERSION;
  }

  /**
   * @notice Pure function to get the address of the cToken backing this dToken.
   * @return The address of the cToken backing this dToken.
   */
  function getCToken() external pure returns (address cToken) {
    cToken = _getCToken();
  }

  /**
   * @notice Pure function to get the address of the underlying token of this
   * dToken.
   * @return The address of the underlying token for this dToken.
   */
  function getUnderlying() external pure returns (address underlying) {
    underlying = _getUnderlying();
  }

  /**
   * @notice Private function to trigger accrual and to update the dToken and
   * cToken exchange rates in storage if necessary. The `compute` argument can
   * be set to false if an accrual has already taken place on the cToken before
   * calling this function.
   * @param compute bool A flag to indicate whether the cToken exchange rate
   * needs to be computed - if false, it will simply be read from storage on the
   * cToken in question.
   * @return The current dToken and cToken exchange rates.
   */
  function _accrue(bool compute) private returns (
    uint256 dTokenExchangeRate, uint256 cTokenExchangeRate
  ) {
    bool alreadyAccrued;
    (
      dTokenExchangeRate, cTokenExchangeRate, alreadyAccrued
    ) = _getExchangeRates(compute);

    if (!alreadyAccrued) {
      // Update storage with dToken + cToken exchange rates as of current block.
      AccrualIndex storage accrualIndex = _accrualIndex;
      accrualIndex.dTokenExchangeRate = _safeUint112(dTokenExchangeRate);
      accrualIndex.cTokenExchangeRate = _safeUint112(cTokenExchangeRate);
      accrualIndex.block = uint32(block.number);
      emit Accrue(dTokenExchangeRate, cTokenExchangeRate);
    }
  }

  /**
   * @notice Private function to mint `amount` tokens by exchanging `exchanged`
   * tokens to `account` and emit corresponding `Mint` & `Transfer` events.
   * @param account address The account to mint tokens to.
   * @param exchanged uint256 The amount of underlying tokens used to mint.
   * @param amount uint256 The amount of tokens to mint.
   */
  function _mint(address account, uint256 exchanged, uint256 amount) private {
    require(
      exchanged > 0 && amount > 0, "Mint failed: insufficient funds supplied."
    );
    _totalSupply = _totalSupply.add(amount);
    _balances[account] = _balances[account].add(amount);

    emit Mint(account, exchanged, amount);
    emit Transfer(address(0), account, amount);
  }

  /**
   * @notice Private function to burn `amount` tokens by exchanging `exchanged`
   * tokens from `account` and emit corresponding `Redeeem` & `Transfer` events.
   * @param account address The account to burn tokens from.
   * @param exchanged uint256 The amount of underlying tokens given for burning.
   * @param amount uint256 The amount of tokens to burn.
   */
  function _burn(address account, uint256 exchanged, uint256 amount) private {
    require(
      exchanged > 0 && amount > 0, "Redeem failed: insufficient funds supplied."
    );

    uint256 balancePriorToBurn = _balances[account];
    require(
      balancePriorToBurn >= amount, "Supplied amount exceeds account balance."
    );

    _totalSupply = _totalSupply.sub(amount);
    _balances[account] = balancePriorToBurn - amount; // overflow checked above

    emit Transfer(account, address(0), amount);
    emit Redeem(account, exchanged, amount);
  }

  /**
   * @notice Private function to move `amount` tokens from `sender` to
   * `recipient` and emit a corresponding `Transfer` event.
   * @param sender address The account to transfer tokens from.
   * @param recipient address The account to transfer tokens to.
   * @param amount uint256 The amount of tokens to transfer.
   */
  function _transfer(
    address sender, address recipient, uint256 amount
  ) private {
    require(sender != address(0), "ERC20: transfer from the zero address");
    require(recipient != address(0), "ERC20: transfer to the zero address");

    uint256 senderBalance = _balances[sender];
    require(senderBalance >= amount, "Insufficient funds.");

    _balances[sender] = senderBalance - amount; // overflow checked above.
    _balances[recipient] = _balances[recipient].add(amount);

    emit Transfer(sender, recipient, amount);
  }

  /**
   * @notice Private function to transfer `amount` tokens from `sender` to
   * `recipient` and to deduct the transferred amount from the allowance of the
   * caller unless the allowance is set to the maximum amount.
   * @param sender address The account to transfer tokens from.
   * @param recipient address The account to transfer tokens to.
   * @param amount uint256 The amount of tokens to transfer.
   */
  function _transferFrom(
    address sender, address recipient, uint256 amount
  ) private {
    _transfer(sender, recipient, amount);
    uint256 callerAllowance = _allowances[sender][msg.sender];
    if (callerAllowance != uint256(-1)) {
      require(callerAllowance >= amount, "Insufficient allowance.");
      _approve(sender, msg.sender, callerAllowance - amount); // overflow safe.
    }
  }

  /**
   * @notice Private function to set the allowance for `spender` to transfer up
   * to `value` tokens on behalf of `owner`.
   * @param owner address The account that has granted the allowance.
   * @param spender address The account to grant the allowance.
   * @param value uint256 The size of the allowance to grant.
   */
  function _approve(address owner, address spender, uint256 value) private {
    require(owner != address(0), "ERC20: approve for the zero address");
    require(spender != address(0), "ERC20: approve to the zero address");

    _allowances[owner][spender] = value;
    emit Approval(owner, spender, value);
  }

  /**
   * @notice Private view function to get the latest dToken and cToken exchange
   * rates and provide the value for each. The `compute` argument can be set to
   * false if an accrual has already taken place on the cToken before calling
   * this function.
   * @param compute bool A flag to indicate whether the cToken exchange rate
   * needs to be computed - if false, it will simply be read from storage on the
   * cToken in question.
   * @return The dToken and cToken exchange rate, as well as a boolean
   * indicating if interest accrual has been processed already or needs to be
   * calculated and placed in storage.
   */
  function _getExchangeRates(bool compute) private view returns (
    uint256 dTokenExchangeRate, uint256 cTokenExchangeRate, bool fullyAccrued
  ) {
    // Get the stored accrual block and dToken + cToken exhange rates.
    AccrualIndex memory accrualIndex = _accrualIndex;
    uint256 storedDTokenExchangeRate = uint256(accrualIndex.dTokenExchangeRate);
    uint256 storedCTokenExchangeRate = uint256(accrualIndex.cTokenExchangeRate);
    uint256 accrualBlock = uint256(accrualIndex.block);

    // Use stored exchange rates if an accrual has already occurred this block.
    fullyAccrued = (accrualBlock == block.number);
    if (fullyAccrued) {
      dTokenExchangeRate = storedDTokenExchangeRate;
      cTokenExchangeRate = storedCTokenExchangeRate;
    } else {
      // Only compute cToken exchange rate if it has not accrued this block.
      if (compute) {
        // Get current cToken exchange rate; inheriting contract overrides this.
        (cTokenExchangeRate,) = _getCurrentCTokenRates();
      } else {
        // Otherwise, get the stored cToken exchange rate.
        cTokenExchangeRate = CTokenInterface(_getCToken()).exchangeRateStored();
      }

      // Determine the cToken interest earned during the period.
      uint256 cTokenInterest = (
        (cTokenExchangeRate.mul(_SCALING_FACTOR)).div(storedCTokenExchangeRate)
      ).sub(_SCALING_FACTOR);

      // Calculate dToken exchange rate by applying 90% of the cToken interest.
      dTokenExchangeRate = storedDTokenExchangeRate.mul(
        _SCALING_FACTOR.add(cTokenInterest.mul(9) / 10)
      ) / _SCALING_FACTOR;
    }
  }

  /**
   * @notice Private view function to get the total surplus, or cToken
   * balance that exceeds the total dToken balance.
   * @return The total surplus, denominated in both the underlying and in the
   * cToken.
   */
  function _getSurplus() private view returns (
    uint256 underlyingSurplus, uint256 cTokenSurplus
  ) {
    // Instantiate the interface for the backing cToken.
    CTokenInterface cToken = CTokenInterface(_getCToken());

    (
      uint256 dTokenExchangeRate, uint256 cTokenExchangeRate,
    ) = _getExchangeRates(true);

    // Determine value of all issued dTokens in the underlying, rounded up.
    uint256 dTokenUnderlying = _toUnderlying(
      _totalSupply, dTokenExchangeRate, true
    );

    // Determine value of all retained cTokens in the underlying, rounded down.
    uint256 cTokenUnderlying = _toUnderlying(
      cToken.balanceOf(address(this)), cTokenExchangeRate, false
    );

    // Determine the size of the surplus in terms of underlying amount.
    underlyingSurplus = cTokenUnderlying > dTokenUnderlying
      ? cTokenUnderlying - dTokenUnderlying // overflow checked above
      : 0;

    // Determine the cToken equivalent of this surplus amount.
    cTokenSurplus = underlyingSurplus == 0
      ? 0
      : _fromUnderlying(underlyingSurplus, cTokenExchangeRate, false);
  }

  /**
   * @notice Private view function to get the current dToken and cToken interest
   * supply rate per block (multiplied by 10^18).
   * @return The current dToken and cToken interest rates.
   */
  function _getRatePerBlock() private view returns (
    uint256 dTokenSupplyRate, uint256 cTokenSupplyRate
  ) {
    (, cTokenSupplyRate) = _getCurrentCTokenRates();
    dTokenSupplyRate = cTokenSupplyRate.mul(9) / 10;
  }

  /**
   * @notice Private view function to determine if a given account has runtime
   * code or not - in other words, whether or not a contract is deployed to the
   * account in question. Note that contracts that are in the process of being
   * deployed will return false on this check.
   * @param account address The account to check for contract runtime code.
   * @return Whether or not there is contract runtime code at the account.
   */
  function _isContract(address account) private view returns (bool isContract) {
    uint256 size;
    assembly { size := extcodesize(account) }
    isContract = size > 0;
  }

  /**
   * @notice Private pure function to verify that a given signature of a digest
   * resolves to the supplied account. Any error, including incorrect length,
   * malleable signature types, or unsupported `v` values, will cause a revert.
   * @param account address The account to validate against.
   * @param digest bytes32 The digest to use.
   * @param signature bytes The signature to verify.
   */
  function _verifyRecover(
    address account, bytes32 digest, bytes memory signature
  ) private pure {
    // Ensure the signature length is correct.
    require(
      signature.length == 65,
      "Must supply a single 65-byte signature when owner is not a contract."
    );

    // Divide the signature in r, s and v variables.
    bytes32 r;
    bytes32 s;
    uint8 v;
    assembly {
      r := mload(add(signature, 0x20))
      s := mload(add(signature, 0x40))
      v := byte(0, mload(add(signature, 0x60)))
    }

    require(
      uint256(s) <= _MAX_UNMALLEABLE_S,
      "Signature `s` value cannot be potentially malleable."
    );

    require(v == 27 || v == 28, "Signature `v` value not permitted.");

    require(account == ecrecover(digest, v, r, s), "Invalid signature.");
  }
}