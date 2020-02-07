pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./DharmaTokenV1.sol";
import "../../../interfaces/CTokenInterface.sol";
import "../../../interfaces/ERC20Interface.sol";
import "../../../interfaces/CUSDCInterestRateModelInterface.sol";
import "../../../interfaces/PotInterface.sol";


/**
 * @title MockDharmaDaiImplementationV1
 * @author 0age (dToken mechanics derived from Compound cTokens, ERC20 methods
 * derived from Open Zeppelin's ERC20 contract)
 * @notice Dharma Dai is an interest-bearing token, with cDai as the backing
 * token and Dai as the underlying token. The dDai exchange rate will initially
 * increase at 90% the rate of the cDai exchange rate.
 */
contract MockDharmaDaiImplementationV1 is DharmaTokenV1 {
  string internal constant _NAME = "Dharma Dai";
  string internal constant _SYMBOL = "dDai";
  string internal constant _UNDERLYING_NAME = "Dai";
  string internal constant _CTOKEN_SYMBOL = "cDai";

  CTokenInterface internal constant _CDAI = CTokenInterface(
    0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643 // mainnet
  );

  ERC20Interface internal constant _DAI = ERC20Interface(
    0x6B175474E89094C44Da98b954EedeAC495271d0F // mainnet
  );

  // Note: this is just an EOA for the initial prototype.
  address internal constant _VAULT = 0x7e4A8391C728fEd9069B2962699AB416628B19Fa;

  uint256 internal constant _SCALING_FACTOR_SQUARED = 1e36;

  /**
   * @notice Internal view function to get the current cDAI exchange rate and
   * supply rate per block. NOTE: THIS IS MOCKED USING SAI DEPLOYED TO THE DAI
   * ADDRESS!
   * @return The current cDAI exchange rate, or amount of Dai that is
   * redeemable for each cDAI, and the cDAI supply rate per block (with 18
   * decimal places added to each returned rate).
   */
  function _getCurrentCTokenRates() internal view returns (
    uint256 exchangeRate, uint256 supplyRate
  ) {
    // Determine number of blocks that have elapsed since last cDAI accrual.
    uint256 blockDelta = block.number.sub(_CDAI.accrualBlockNumber());

    // Return stored values if accrual has already been performed this block.
    if (blockDelta == 0) return (
      _CDAI.exchangeRateStored(), _CDAI.supplyRatePerBlock()
    );

    // Determine total "cash" held by cDAI contract.
    uint256 cash = _DAI.balanceOf(address(_CDAI));

    // Get the latest interest rate model from the cDAI contract.
    CUSDCInterestRateModelInterface interestRateModel = (
      CUSDCInterestRateModelInterface(_CDAI.interestRateModel())
    );

    // Get the current stored total borrows, reserves, and reserve factor.
    uint256 borrows = _CDAI.totalBorrows();
    uint256 reserves = _CDAI.totalReserves();
    uint256 reserveFactor = _CDAI.reserveFactorMantissa();

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

    // Determine cDAI exchange rate: underlying / total supply
    exchangeRate = (underlying.mul(_SCALING_FACTOR)).div(_CDAI.totalSupply());

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
    underlying = address(_DAI);
  }

  function _getCTokenSymbol() internal pure returns (string memory cTokenSymbol) {
    cTokenSymbol = _CTOKEN_SYMBOL;
  }

  function _getCToken() internal pure returns (address cToken) {
    cToken = address(_CDAI);
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

  /**
   * @notice Internal pure function to emulate exponentiation performed by the
   * Dai Savings Rate contract.
   * @param x uint256 The number that will be raised to the given power.
   * @param n uint256 The power to raise that number by.
   * @param base uint256 The scaling factor that will be applied to n and z.
   * @return The number raised to the given power.
   */
  function _rpow(
    uint256 x, uint256 n, uint256 base
  ) internal pure returns (uint256 z) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      switch x case 0 {switch n case 0 {z := base} default {z := 0}}
      default {
        switch mod(n, 2) case 0 { z := base } default { z := x }
        let half := div(base, 2)  // for rounding.
        for { n := div(n, 2) } n { n := div(n, 2) } {
          let xx := mul(x, x)
          if iszero(eq(div(xx, x), x)) { revert(0, 0) }
          let xxRound := add(xx, half)
          if lt(xxRound, xx) { revert(0, 0) }
          x := div(xxRound, base)
          if mod(n, 2) {
            let zx := mul(z, x)
            if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) { revert(0, 0) }
            let zxRound := add(zx, half)
            if lt(zxRound, zx) { revert(0, 0) }
            z := div(zxRound, base)
          }
        }
      }
    }
  }
}