pragma solidity 0.5.11;

import "../../interfaces/CTokenInterface.sol";
import "../../interfaces/ERC20Interface.sol";


/**
 * @title DharmaUSDCInitializer
 * @author 0age
 * @notice Initializer for the Dharma USD Coin token.
 */
contract DharmaUSDCInitializer {
  event Accrue(uint256 dTokenExchangeRate, uint256 cTokenExchangeRate);

  // The block number and cToken + dToken exchange rates are updated on accrual.
  struct AccrualIndex {
    uint112 dTokenExchangeRate;
    uint112 cTokenExchangeRate;
    uint32 block;
  }

  CTokenInterface internal constant _CUSDC = CTokenInterface(
    0x39AA39c021dfbaE8faC545936693aC917d5E7563 // mainnet
  );

  ERC20Interface internal constant _USDC = ERC20Interface(
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // mainnet
  );

  uint256 internal constant _MAX_UINT_112 = 5192296858534827628530496329220095;

  // Set block number and dToken + cToken exchange rate in slot zero on accrual.
  AccrualIndex private _accrualIndex;

  /**
   * @notice Initialize Dharma USD Coin by approving cUSDC to transfer USDC on
   * behalf of this contract and setting the initial dUSDC and cUSDC exchange
   * rates in storage.
   */
  function initialize() public {
    // Approve cToken to transfer underlying for this contract in order to mint.
    require(
      _USDC.approve(address(_CUSDC), uint256(-1)),
      "Initial cUSDC approval failed."
    );

    // Initial dToken exchange rate is 1-to-1 (dTokens have 8 decimals).
    uint256 dTokenExchangeRate = 1e16;

    // Accrue cToken interest and retrieve the current cToken exchange rate.
    uint256 cTokenExchangeRate = _CUSDC.exchangeRateCurrent();

    // Initialize accrual index with current block number and exchange rates.
    AccrualIndex storage accrualIndex = _accrualIndex;
    accrualIndex.dTokenExchangeRate = uint112(dTokenExchangeRate);
    accrualIndex.cTokenExchangeRate = _safeUint112(cTokenExchangeRate);
    accrualIndex.block = uint32(block.number);
    emit Accrue(dTokenExchangeRate, cTokenExchangeRate);
  }

  /**
   * @notice Internal pure function to convert a uint256 to a uint112, reverting
   * if the conversion would cause an overflow.
   * @param input uint256 The unsigned integer to convert.
   * @return The converted unsigned integer.
   */
  function _safeUint112(uint256 input) internal pure returns (uint112 output) {
    require(input <= _MAX_UINT_112, "Overflow on conversion to uint112.");
    output = uint112(input);
  }
}