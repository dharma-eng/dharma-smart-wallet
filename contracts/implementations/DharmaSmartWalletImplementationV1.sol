pragma solidity 0.5.11;
// WARNING - `executeActionWithAtomicBatchCalls` has a `bytes[]` argument that
// requires ABIEncoderV2, and the alternatives are pretty convoluted. Consider
// losing that function and ABIEncoderV2 for the V1 smart wallet implementation.
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface CTokenInterface {
  function mint(uint256 mintAmount) external returns (uint256 err);
}


interface USDCV1Interface {
  function isBlacklisted(address _account) external view returns (bool);
  
  function paused() external view returns (bool);
}


interface DharmaSmartWalletImplementationV1Interface {
  event NewDharmaKey(address dharmaKey);
  
  event CallSuccess(
    bytes32 actionID,
    uint256 nonce,
    address to,
    bytes data,
    bytes returnData
  );
  
  event CallFailure(
    bytes32 actionID,
    uint256 nonce,
    address to,
    bytes data,
    string revertReason
  );
  
  event ExternalError(address source, string revertReason);

  function initialize(address dharmaKey) external;
  
  function executeAction(
    address to,
    bytes calldata data,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata dharmaKeySignature,
    bytes calldata dharmaSecondaryKeySignature
  ) external returns (bool ok, bytes memory returnData);

  function getDharmaKey() external view returns (address dharmaKey);
  
  function getNonce() external view returns (uint256 nonce);
  
  function getNextActionID(
    address to,
    bytes calldata data,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID);
  
  function getActionID(
    address to,
    bytes calldata data,
    uint256 nonce,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID);
}


/**
 * @title DharmaSmartWalletImplementationV1
 * @notice The V1 implementation for the Dharma smart wallet is a joint-custody,
 * meta-transaction-enabled wallet with an account recovery option. It is
 * deployed by a factory that allows for the address to be known ahead of time,
 * and any Dai that has been sent to the address will automatically be deposited
 * into Compound at the time the wallet is deployed.
 */
contract DharmaSmartWalletImplementationV1 is DharmaSmartWalletImplementationV1Interface {
  using Address for address;
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
  // ABIEncoderV2 uses an array of Calls for executing actions with batch calls
  struct Call {
    address to;
    bytes data;
  }

  // The smart wallet version will be used when constructing valid signatures.
  uint256 internal constant _DHARMA_SMART_WALLET_VERSION = 1;

  // The dharma secondary key is a hard-coded signing key controlled by Dharma,
  // used in conjunction with user's Dharma Key to make smart wallet actions.
  // Note that, in the event that Dharma's signing key is compromised, a new
  // smart wallet implementation will need to be deployed - we can avoid this by
  // retrieving this key from a dedicated registry controlled by Dharma.
  address internal constant _DHARMA_SECONDARY_KEY = address(
    0x1234567890123456789012345678901234567890
  );

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

  // Compound returns a value of 0 to indicate success, or lack of an error.
  uint256 internal constant _COMPOUND_SUCCESS = 0;

  function initialize(address dharmaKey) external {
    // Ensure that this function is only callable during contract construction.
    assembly { if extcodesize(address) { revert(0, 0) } }

    // Set up the user's dharma key and emit a corresponding event.
    _dharmaKey = dharmaKey;
    emit NewDharmaKey(dharmaKey);

    /*
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
    */
  }

  function executeAction(
    address to,
    bytes calldata data,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes calldata dharmaKeySignature,
    bytes calldata dharmaSecondaryKeySignature
  ) external returns (bool ok, bytes memory returnData) {
    // Ensure that action is valid and increment the nonce before proceeding.
    bytes32 actionID = _validateActionAndIncrementNonce(
      to,
      data,
      nonce,
      minimumActionGas,
      dharmaKeySignature,
      dharmaSecondaryKeySignature
    );

    // Note: from this point on, there are no reverts (apart from out-of-gas or
    // call-depth-exceeded) originating from this action. However, the call
    // itself may revert, in which case the function will return `false`, along
    // with the revert reason encoded as bytes, and fire an CallFailure event.

    // Perform the action via low-level call and set return values using result.
    (ok, returnData) = to.call(data);

    // Emit a CallSuccess or CallFailure event based on the outcome of the call.
    if (ok) {
      // Note: while the call succeeded, the action may still have "failed"
      // (for example, successful calls to Compound can still return an error).
      emit CallSuccess(actionID, nonce, to, data, returnData);
    } else {
      // Note: while the call failed, the nonce will still be incremented, which
      // will invalidate all supplied signatures.
      emit CallFailure(actionID, nonce, to, data, string(returnData));
    }
  } 

  function getDharmaKey() external view returns (address dharmaKey) {
    dharmaKey = _dharmaKey;
  }

  function getNonce() external view returns (uint256 nonce) {
    nonce = _nonce;
  }

  function getNextActionID(
    address to,
    bytes calldata data,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID) {
    actionID = _getActionIDWithOneCall(to, data, _nonce, minimumActionGas);
  }

  function getActionID(
    address to,
    bytes calldata data,
    uint256 nonce,
    uint256 minimumActionGas
  ) external view returns (bytes32 actionID) {
    actionID = _getActionIDWithOneCall(to, data, nonce, minimumActionGas);
  }

  function test() external pure returns (bool) {
    return true;
  }

  function testRevert() external pure returns (bool) {
    revert("This revert message should be visible.");
  }

  // Note: this must currently be implemented as a public function (instead
  // of as the external one) due to an ABIEncoderV2 `UnimplementedFeatureError`
  function executeActionWithAtomicBatchCalls(
    Call[] memory calls,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes memory dharmaKeySignature,
    bytes memory dharmaSecondaryKeySignature
  ) public returns (bool[] memory ok, bytes[] memory returnData) {
    // Ensure that action is valid and increment the nonce before proceeding.
    bytes32 actionID = _validateActionWithAtomicBatchCallsAndIncrementNonce(
      calls,
      nonce,
      minimumActionGas,
      dharmaKeySignature,
      dharmaSecondaryKeySignature
    );

    // Note: from this point on, there are no reverts (apart from out-of-gas or
    // call-depth-exceeded) originating from this contract. However, one of the
    // calls may revert, in which case the function will return `false`, along
    // with the revert reason encoded as bytes, and fire an CallFailure event.
    
    ok = new bool[](calls.length);
    returnData = new bytes[](calls.length);

    for (uint256 i = 0; i < calls.length; i++) {
      // Perform low-level call and set return values using result.
      (ok[i], returnData[i]) = calls[i].to.call(calls[i].data);

      // Emit CallSuccess or CallFailure event based on the outcome of the call.
      if (ok[i]) {
        // Note: while the call succeeded, the action may still have "failed"
        // (i.e. a successful calls to Compound can still return an error).
        emit CallSuccess(actionID, nonce, calls[i].to, calls[i].data, returnData[i]);
      } else {
        // Note: while the call failed, the nonce will still be incremented,
        // which will invalidate all supplied signatures.
        emit CallFailure(actionID, nonce, calls[i].to, calls[i].data, string(returnData[i]));

        // exit early - any calls after the first failed call will not execute.
        break;
      }
    }
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

  function _validateActionAndIncrementNonce(
    address to,
    bytes memory data,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes memory dharmaKeySignature,
    bytes memory dharmaSecondaryKeySignature
  ) internal returns (bytes32 actionID) {
    // Ensure that the action has the correct nonce.
    require(_nonce == nonce, "Invalid action - incorrect nonce.");

    // Place the dharma key into memory to avoid repeated SLOAD operations.
    address dharmaKey = _dharmaKey;

    // Ensure that there is in fact a dharma key set on the smart wallet.
    require(dharmaKey != address(0), "Invalid action - no dharma key set.");

    // Ensure that the `to` address is a contract.
    require(
      to.isContract(),
      "Invalid action - must supply a contract as the `to` argument."
    );

    // Determine the actionID - this serves as the signature hash.
    actionID = _getActionIDWithOneCall(to, data, nonce, minimumActionGas);

    // First, validate the Dharma Key signature unless it is `msg.sender`.
    if (msg.sender != dharmaKey) {
      require(
        dharmaKey == actionID.toEthSignedMessageHash().recover(
          dharmaKeySignature
        ),
        "Invalid action - invalid Dharma Key signature."
      );
    }

    // Next, validate Dharma Secondary Key signature unless it is `msg.sender`.
    if (msg.sender != _DHARMA_SECONDARY_KEY) {
      require(
        _DHARMA_SECONDARY_KEY == actionID.toEthSignedMessageHash().recover(
          dharmaSecondaryKeySignature
        ),
        "Invalid action - invalid Dharma Secondary Key signature."
      );
    }

    // Increment nonce in order to prevent reuse of signatures after the call.
    _nonce++;

    // Ensure that the current gas exceeds the minimum required action gas.
    // This prevents griefing attacks where an attacker can invalidate a
    // signature without providing enough gas for the action to succeed.
    // To skip this requirement, supply zero for the minimumActionGas argument.
    require(
      gasleft() >= minimumActionGas,
      "Invalid action - insufficient gas supplied by transaction submitter."
    );
  }

  function _validateActionWithAtomicBatchCallsAndIncrementNonce(
    Call[] memory calls,
    uint256 nonce,
    uint256 minimumActionGas,
    bytes memory dharmaKeySignature,
    bytes memory dharmaSecondaryKeySignature
  ) internal returns (bytes32 actionID) {
    // Ensure that the action has the correct nonce.
    require(_nonce == nonce, "Invalid action - incorrect nonce.");

    // Place the dharma key into memory to avoid repeated SLOAD operations.
    address dharmaKey = _dharmaKey;

    // Ensure that there is in fact a dharma key set on the smart wallet.
    require(dharmaKey != address(0), "Invalid action - no dharma key set.");

    // Ensure that the `to` address is a contract for each call.
    for (uint256 i = 0; i < calls.length; i++) {
      require(
        calls[i].to.isContract(),
        "Invalid action - must supply a contract for each `to` argument."
      );
    }

    // Determine the actionID - this serves as the signature hash.
    actionID = _getActionIDWithBatchCall(calls, nonce, minimumActionGas);

    // First, validate the Dharma Key signature unless it is `msg.sender`.
    if (msg.sender != dharmaKey) {
      require(
        dharmaKey == actionID.toEthSignedMessageHash().recover(
          dharmaKeySignature
        ),
        "Invalid action - invalid Dharma Key signature."
      );
    }

    // Next, validate Dharma Secondary Key signature unless it is `msg.sender`.
    if (msg.sender != _DHARMA_SECONDARY_KEY) {
      require(
        _DHARMA_SECONDARY_KEY == actionID.toEthSignedMessageHash().recover(
          dharmaSecondaryKeySignature
        ),
        "Invalid action - invalid Dharma Secondary Key signature."
      );
    }

    // Increment nonce in order to prevent reuse of signatures after the call.
    _nonce++;

    // Ensure that the current gas exceeds the minimum required action gas.
    // This prevents griefing attacks where an attacker can invalidate a
    // signature without providing enough gas for the action to succeed.
    require(
      gasleft() >= minimumActionGas,
      "Invalid action - insufficient gas supplied by transaction submitter."
    );
  }

  function _getActionIDWithOneCall(
    address to,
    bytes memory data,
    uint256 nonce,
    uint256 minimumActionGas
  ) internal view returns (bytes32 actionID) {
    // The actionID is constructed according to EIP-191-0x45 to prevent replays.
    actionID = keccak256(
      abi.encodePacked(
        address(this),
        _DHARMA_SMART_WALLET_VERSION,
        _dharmaKey,
        _DHARMA_SECONDARY_KEY,
        nonce,
        minimumActionGas,
        false, // isBatchCall = false
        to,
        data
      )
    );
  }

  function _getActionIDWithBatchCall(
    Call[] memory calls,
    uint256 nonce,
    uint256 minimumActionGas
  ) internal view returns (bytes32 actionID) {
    // The actionID is constructed according to EIP-191-0x45 to prevent replays.
    actionID = keccak256(
      abi.encodePacked(
        address(this),
        _DHARMA_SMART_WALLET_VERSION,
        _dharmaKey,
        _DHARMA_SECONDARY_KEY,
        nonce,
        minimumActionGas,
        true, // isBatchCall = true
        abi.encode(calls)
      )
    );
  }
}