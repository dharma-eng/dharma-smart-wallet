pragma solidity 0.5.11;


/**
 * @title DharmaTokenOverrides
 * @author 0age
 * @notice A collection of internal view and pure functions that should be
 * overridden by the ultimate Dharma Token implementation.
 */
contract DharmaTokenOverrides {
  /**
   * @notice Internal view function to get the current cToken exchange rate and
   * supply rate per block. This function is meant to be overridden by the
   * dToken that inherits this contract.
   * @return The current cToken exchange rate, or amount of underlying tokens
   * that are redeemable for each cToken, and the cToken supply rate per block
   * (with 18 decimal places added to each returned rate).
   */
  function _getCurrentCTokenRates() internal view returns (
    uint256 exchangeRate, uint256 supplyRate
  );

  function _getUnderlyingName() internal pure returns (string memory underlyingName);

  function _getUnderlying() internal pure returns (address underlying);

  function _getCTokenSymbol() internal pure returns (string memory cTokenSymbol);

  function _getCToken() internal pure returns (address cToken);

  function _getDTokenName() internal pure returns (string memory dTokenName);

  function _getDTokenSymbol() internal pure returns (string memory dTokenSymbol);

  function _getVault() internal pure returns (address vault);
}