pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../interfaces/CTokenInterface.sol";
import "./DharmaTokenOverrides.sol";


/**
 * @title DharmaTokenHelpers
 * @author 0age
 * @notice A collection of constants and internal pure functions used by Dharma
 * Tokens.
 */
contract DharmaTokenHelpers is DharmaTokenOverrides {
  using SafeMath for uint256;

  uint8 internal constant _DECIMALS = 8; // matches cToken decimals
  uint256 internal constant _SCALING_FACTOR = 1e18;
  uint256 internal constant _SCALING_FACTOR_MINUS_ONE = 999999999999999999;
  uint256 internal constant _HALF_OF_SCALING_FACTOR = 5e17;
  uint256 internal constant _COMPOUND_SUCCESS = 0;
  uint256 internal constant _MAX_UINT_112 = 5192296858534827628530496329220095;
  uint256 internal constant _MAX_UNMALLEABLE_S = (
    0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
  );

  /**
   * @notice Internal pure function to determine if a call to Compound succeeded
   * and to revert, supplying the reason, if it failed. Failure can be caused by
   * a call that reverts, or by a call that does not revert but returns a
   * non-zero error code.
   * @param functionSelector bytes4 The function selector that was called.
   * @param ok bool A boolean representing whether the call returned or
   * reverted.
   * @param data bytes The data provided by the returned or reverted call.
   */
  function _checkCompoundInteraction(
    bytes4 functionSelector, bool ok, bytes memory data
  ) internal pure {
    CTokenInterface cToken;
    if (ok) {
      if (
        functionSelector == cToken.transfer.selector ||
        functionSelector == cToken.transferFrom.selector
      ) {
        require(
          abi.decode(data, (bool)), string(
            abi.encodePacked(
              "Compound ",
              _getCTokenSymbol(),
              " contract returned false on calling ",
              _getFunctionName(functionSelector),
              "."
            )
          )
        );
      } else {
        uint256 compoundError = abi.decode(data, (uint256)); // throw on no data
        if (compoundError != _COMPOUND_SUCCESS) {
          revert(
            string(
              abi.encodePacked(
                "Compound ",
                _getCTokenSymbol(),
                " contract returned error code ",
                uint8((compoundError / 10) + 48),
                uint8((compoundError % 10) + 48),
                " on calling ",
                _getFunctionName(functionSelector),
                "."
              )
            )
          );
        }
      }
    } else {
      revert(
        string(
          abi.encodePacked(
            "Compound ",
            _getCTokenSymbol(),
            " contract reverted while attempting to call ",
            _getFunctionName(functionSelector),
            ": ",
            _decodeRevertReason(data)
          )
        )
      );
    }
  }

  /**
   * @notice Internal pure function to get a Compound function name based on the
   * selector.
   * @param functionSelector bytes4 The function selector.
   * @return The name of the function as a string.
   */
  function _getFunctionName(
    bytes4 functionSelector
  ) internal pure returns (string memory functionName) {
    CTokenInterface cToken;
    if (functionSelector == cToken.mint.selector) {
      functionName = "mint";
    } else if (functionSelector == cToken.redeem.selector) {
      functionName = "redeem";
    } else if (functionSelector == cToken.redeemUnderlying.selector) {
      functionName = "redeemUnderlying";
    } else if (functionSelector == cToken.transferFrom.selector) {
      functionName = "transferFrom";
    } else if (functionSelector == cToken.transfer.selector) {
      functionName = "transfer";
    } else if (functionSelector == cToken.accrueInterest.selector) {
      functionName = "accrueInterest";
    } else {
      functionName = "an unknown function";
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

  /**
   * @notice Internal pure function to construct a failure message string for
   * the revert reason on transfers of underlying tokens that do not succeed.
   * @return The failure message.
   */
  function _getTransferFailureMessage() internal pure returns (
    string memory message
  ) {
    message = string(
      abi.encodePacked(_getUnderlyingName(), " transfer failed.")
    );
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

  /**
   * @notice Internal pure function to convert an underlying amount to a dToken
   * or cToken amount using an exchange rate and fixed-point arithmetic.
   * @param underlying uint256 The underlying amount to convert.
   * @param exchangeRate uint256 The exchange rate (multiplied by 10^18).
   * @param roundUp bool Whether the final amount should be rounded up - it will
   * instead be truncated (rounded down) if this value is false.
   * @return The cToken or dToken amount.
   */
  function _fromUnderlying(
    uint256 underlying, uint256 exchangeRate, bool roundUp
  ) internal pure returns (uint256 amount) {
    if (roundUp) {
      amount = (
        (underlying.mul(_SCALING_FACTOR)).add(exchangeRate.sub(1))
      ).div(exchangeRate);
    } else {
      amount = (underlying.mul(_SCALING_FACTOR)).div(exchangeRate);
    }
  }

  /**
   * @notice Internal pure function to convert a dToken or cToken amount to the
   * underlying amount using an exchange rate and fixed-point arithmetic.
   * @param amount uint256 The cToken or dToken amount to convert.
   * @param exchangeRate uint256 The exchange rate (multiplied by 10^18).
   * @param roundUp bool Whether the final amount should be rounded up - it will
   * instead be truncated (rounded down) if this value is false.
   * @return The underlying amount.
   */
  function _toUnderlying(
    uint256 amount, uint256 exchangeRate, bool roundUp
  ) internal pure returns (uint256 underlying) {
    if (roundUp) {
      underlying = (
        (amount.mul(exchangeRate).add(_SCALING_FACTOR_MINUS_ONE)
      ) / _SCALING_FACTOR);
    } else {
      underlying = amount.mul(exchangeRate) / _SCALING_FACTOR;
    }
  }

  /**
   * @notice Internal pure function to convert an underlying amount to a dToken
   * or cToken amount and back to the underlying, so as to properly capture
   * rounding errors, by using an exchange rate and fixed-point arithmetic.
   * @param underlying uint256 The underlying amount to convert.
   * @param exchangeRate uint256 The exchange rate (multiplied by 10^18).
   * @param roundUpOne bool Whether the intermediate dToken or cToken amount
   * should be rounded up - it will instead be truncated (rounded down) if this
   * value is false.
   * @param roundUpTwo bool Whether the final underlying amount should be
   * rounded up - it will instead be truncated (rounded down) if this value is
   * false.
   * @return The intermediate cToken or dToken amount and the final underlying
   * amount.
   */
  function _fromUnderlyingAndBack(
    uint256 underlying, uint256 exchangeRate, bool roundUpOne, bool roundUpTwo
  ) internal pure returns (uint256 amount, uint256 adjustedUnderlying) {
    amount = _fromUnderlying(underlying, exchangeRate, roundUpOne);
    adjustedUnderlying = _toUnderlying(amount, exchangeRate, roundUpTwo);
  }
}