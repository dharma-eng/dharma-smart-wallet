pragma solidity 0.5.17;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./DharmaTokenV1.sol";
import "../../../interfaces/CTokenInterface.sol";
import "../../../interfaces/ERC20Interface.sol";
import "../../../interfaces/CUSDCInterestRateModelInterface.sol";


/**
 * @title DharmaUSDCImplementationV1
 * @author 0age (dToken mechanics derived from Compound cTokens, ERC20 methods
 * derived from Open Zeppelin's ERC20 contract)
 * @notice Dharma USD Coin is an interest-bearing token, with cUSDC as the
 * backing token and USD Coin as the underlying token. The dUSDC exchange rate
 * will initially increase at 90% the rate of the cUSDC exchange rate.
 */
contract DharmaUSDCImplementationV1 is DharmaTokenV1 {
  string internal constant _NAME = "Dharma USD Coin";
  string internal constant _SYMBOL = "dUSDC";
  string internal constant _UNDERLYING_NAME = "USD Coin";
  string internal constant _CTOKEN_SYMBOL = "cUSDC";

  CTokenInterface internal constant _CUSDC = CTokenInterface(
    0x39AA39c021dfbaE8faC545936693aC917d5E7563 // mainnet
  );

  ERC20Interface internal constant _USDC = ERC20Interface(
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // mainnet
  );

  // Note: this is just an EOA for the initial prototype.
  address internal constant _VAULT = 0x7e4A8391C728fEd9069B2962699AB416628B19Fa;

  uint256 internal constant _SCALING_FACTOR_SQUARED = 1e36;

  /**
   * @notice Internal view function to get the current cUSDC exchange rate and
   * supply rate per block.
   * @return The current cUSDC exchange rate, or amount of USDC that is
   * redeemable for each cUSDC, and the cUSDC supply rate per block (with 18
   * decimal places added to each returned rate).
   */
  function _getCurrentCTokenRates() internal view returns (
    uint256 exchangeRate, uint256 supplyRate
  ) {
    // Determine number of blocks that have elapsed since last cUSDC accrual.
    uint256 blockDelta = block.number.sub(_CUSDC.accrualBlockNumber());

    // Return stored values if accrual has already been performed this block.
    if (blockDelta == 0) return (
      _CUSDC.exchangeRateStored(), _CUSDC.supplyRatePerBlock()
    );

    // Determine total "cash" held by cUSDC contract.
    uint256 cash = _USDC.balanceOf(address(_CUSDC));

    // Get the latest interest rate model from the cUSDC contract.
    CUSDCInterestRateModelInterface interestRateModel = (
      CUSDCInterestRateModelInterface(_CUSDC.interestRateModel())
    );

    // Get the current stored total borrows, reserves, and reserve factor.
    uint256 borrows = _CUSDC.totalBorrows();
    uint256 reserves = _CUSDC.totalReserves();
    uint256 reserveFactor = _CUSDC.reserveFactorMantissa();

    // Get accumulated borrow interest via interest rate model and block delta.
    (uint256 err, uint256 borrowRate) = interestRateModel.getBorrowRate(
      cash, borrows, reserves
    );
    require(
      err == _COMPOUND_SUCCESS, "Interest Rate Model borrow rate check failed."
    );

    uint256 interest = borrowRate.mul(blockDelta).mul(borrows) / _SCALING_FACTOR;

    // Update total borrows and reserves using calculated accumulated interest.
    borrows = borrows.add(interest);
    reserves = reserves.add(reserveFactor.mul(interest) / _SCALING_FACTOR);

    // Get "underlying": (cash + borrows - reserves)
    uint256 underlying = (cash.add(borrows)).sub(reserves);

    // Determine cUSDC exchange rate: underlying / total supply
    exchangeRate = (underlying.mul(_SCALING_FACTOR)).div(_CUSDC.totalSupply());

    // Get "borrows per" by dividing total borrows by underlying and scaling up.
    uint256 borrowsPer = (
      borrows.mul(_SCALING_FACTOR_SQUARED)
    ).div(underlying);

    // Supply rate is borrow interest * (1 - reserveFactor) * borrowsPer
    supplyRate = (
      interest.mul(_SCALING_FACTOR.sub(reserveFactor)).mul(borrowsPer)
    ) / _SCALING_FACTOR_SQUARED;
  }

  function _getUnderlyingName() internal pure returns (string memory underlyingName) {
    underlyingName = _UNDERLYING_NAME;
  }

  function _getUnderlying() internal pure returns (address underlying) {
    underlying = address(_USDC);
  }

  function _getCTokenSymbol() internal pure returns (string memory cTokenSymbol) {
    cTokenSymbol = _CTOKEN_SYMBOL;
  }

  function _getCToken() internal pure returns (address cToken) {
    cToken = address(_CUSDC);
  }

  function _getDTokenName() internal pure returns (string memory dTokenName) {
    dTokenName = _NAME;
  }

  function _getDTokenSymbol() internal pure returns (string memory dTokenSymbol) {
    dTokenSymbol = _SYMBOL;
  }

  function _getVault() internal pure returns (address vault) {
    vault = _VAULT;
  }
}
