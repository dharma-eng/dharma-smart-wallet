pragma solidity 0.5.10;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface CTokenInterface {
  function mint(uint256 mintAmount) external returns (uint256 err);
}

interface USDCV1Interface {
  function isBlacklisted(address _account) external view returns (bool);
  function paused() external view returns (bool);
}


/**
 * @title DharmaSmartWalletImplementationV1
 * @notice The V1 implementation for the Dharma smart wallet is a joint-custody,
 * meta-transaction-enabled wallet with an account recovery option. It is
 * deployed by a factory that allows for the address to be known ahead of time,
 * and any Dai that has been sent to the address will automatically be deposited
 * into Compound at the time the wallet is deployed.
 */
contract DharmaSmartWalletImplementationV1 {
  using ECDSA for bytes32;
  // WARNING: DO NOT REMOVE OR REORDER STORAGE WHEN WRITING NEW IMPLEMENTATIONS!

  // The dharma key associated with this account is in storage slot 0.
  // It is the core differentiator when it comes to the account in question.
  address private _dharmaKey;

  // The nonce associated with this account is in storage slot 1. Every time a
  // signature is submitted, it must have the appropriate nonce, and once it has
  // been accepted the nonce will be incremented.
  uint256 private _nonce;

  // END STORAGE DECLARATIONS - DO NOT REMOVE OR REPLACE STORAGE ABOVE HERE!

  event NewDharmaKey(address dharmaKey);
  event ActionSuccess(/* ... */);
  event ActionFailure(/* ... */);
  event ExternalError(address source, string revertReason);

  // The dharma secondary key is a hard-coded signing key controlled by Dharma,
  // used in conjunction with user's Dharma Key to make smart wallet actions.
  // Note that, in the event that Dharma's signing key is compromised, a new
  // smart wallet implementation will need to be deployed - we can avoid this by
  // retrieving this key from a dedicated registry controlled by Dharma.
  address private constant _DHARMA_SECONDARY_KEY = address(
    0x1234567890123456789012345678901234567890
  );

  CTokenInterface private constant _CDAI = CTokenInterface(
    0xF5DCe57282A584D2746FaF1593d3121Fcac444dC // mainnet
  );

  CTokenInterface private constant _CUSDC = CTokenInterface(
    0x39AA39c021dfbaE8faC545936693aC917d5E7563 // mainnet
  );

  IERC20 private constant _DAI = IERC20(
    0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359 // mainnet
  );

  IERC20 private constant _USDC = IERC20(
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // mainnet
  );

  USDCV1Interface private constant _USDC_NAUGHTY = USDCV1Interface(
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // mainnet
  );

  // Compound returns a value of 0 to indicate success, or lack of an error.
  uint256 private constant _COMPOUND_SUCCESS = 0;

  function initialize(address dharmaKey) public {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    // Set up the user's dharma key and emit a corresponding event.
    _dharmaKey = dharmaKey;
    emit NewDharmaKey(dharmaKey);

    // Approve the cDAI contract to transfer Dai on behalf of this contract.
    if (_setFullDaiApproval()) {
      // If the approval was successful, try to deposit any Dai on Compound.
      _depositDaiOnCompound();
    }

    // Approve the cUSDC contract to transfer USDC on behalf of this contract.
    if (_setFullUSDCApproval()) {
      // If the approval was successful, try to deposit any USDC on Compound.
      _depositUSDCOnCompound();
    }
  }

  function getDharmaKey() public view returns (address dharmaKey) {
    return _dharmaKey;
  }

  function test() public pure returns (bool) {
    return true;
  }

  function testRevert() public pure returns (bool) {
    revert("This revert message should be visible.");
  }

  function _setFullDaiApproval() internal returns (bool ok) {
    // Approve the cDAI contract to transfer Dai on behalf of this contract.
    (ok, ) = address(_DAI).call(abi.encodeWithSelector(
      _DAI.approve.selector, address(_CDAI), uint256(-1)
    ));

    // Note: handling the failure on dai approvals is unnecessary.
  }

  function _depositDaiOnCompound() internal {
    // Get the current Dai balance on this contract.
    uint256 daiBalance = _DAI.balanceOf(address(this));

    // Only try to deposit the Dai on Compound if there is a non-zero balance.
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
      } else if (_USDC_NAUGHTY.paused()) {
        emit ExternalError(
          address(_USDC),
          "approval failed - USDC contract is currently paused."
        );
      } else {
        emit ExternalError(address(_USDC), "USDC approval failed.");        
      }
    }
  }

  function _depositUSDCOnCompound() internal {
    // Get the current USDC balance on this contract.
    uint256 usdcBalance = _USDC.balanceOf(address(this));

    // Only try to deposit the USDC on Compound if there is a non-zero balance.
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
}