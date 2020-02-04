pragma solidity 0.5.11;

import "../../interfaces/CTokenInterface.sol";
import "../../interfaces/ERC20Interface.sol";


/**
 * @title DharmaDaiInitializer
 * @author 0age
 * @notice Initializer implementation for the Dharma Dai token.
 */
contract DharmaDaiInitializer {
  event Accrue(uint256 dTokenExchangeRate, uint256 cTokenExchangeRate);

  // The block number and cToken + dToken exchange rates are updated on accrual.
  struct AccrualIndex {
    uint112 dTokenExchangeRate;
    uint112 cTokenExchangeRate;
    uint32 block;
  }

  CTokenInterface internal constant _CDAI = CTokenInterface(
    0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643 // mainnet
  );

  ERC20Interface internal constant _DAI = ERC20Interface(
    0x6B175474E89094C44Da98b954EedeAC495271d0F // mainnet
  );

  uint256 internal constant _MAX_UINT_112 = 5192296858534827628530496329220095;

  // Set block number and dToken + cToken exchange rate in slot zero on accrual.
  AccrualIndex private _accrualIndex;

  /**
   * @notice Initialize Dharma Dai by approving cDai to transfer Dai on behalf
   * of this contract and setting the initial dDai and cDai exchange rates in
   * storage.
   */
  function initialize() external {
    // Approve cToken to transfer underlying for this contract in order to mint.
    require(
      _DAI.approve(address(_CDAI), uint256(-1)), "Initial cDai approval failed."
    );

    // Initial dToken exchange rate is 1-to-1 (dTokens have 8 decimals).
    uint256 dTokenExchangeRate = 1e28;

    // Accrue cToken interest and retrieve the current cToken exchange rate.
    uint256 cTokenExchangeRate = _CDAI.exchangeRateCurrent();

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