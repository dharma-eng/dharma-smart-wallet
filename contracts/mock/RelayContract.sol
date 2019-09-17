pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;


// A contract that is uniquely associated with one Dharma user,
// who can use it to store funds and execute transactions "trustlessly".
contract RelayContract {
    // The public address of the key pair that controls this relay contract.
    address public controller;

     // A struct representation of a signature.
    struct ECDSASignature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

     // A struct representing the parameters required for to execute a transaction.
    struct transactionParameters {
        address to;
        bytes data;
        uint value;
        ECDSASignature signature;
        address signer;
        uint nonce;
    }

     // Events related to setting the controller variable.
    event SetControllerAttempt(address candidate);
    event SetControllerSuccess(address candidate);
    event SetControllerFailure(address candidate);

     // Events related to executing transactions.
    event ExecuteTransactionAttempt(
        address to,
        address signer
    );
    event ExecuteTransactionSuccess(
        address to,
        address signer
    );

     // The prefix used for all signed messages.
    bytes constant internal PREFIX = "\x19Ethereum Signed Message:\n32";

     // A function that can only be executed once, by the original deployer.
    function setController(address candidate) public {
        emit SetControllerAttempt(candidate);

        if (msg.sender == controller) {
            controller = candidate;

            emit SetControllerSuccess(candidate);
        } else {
            emit SetControllerFailure(candidate);
        }
    }

     // A function that returns the controller of the current contract.
    function getController() public view returns (address) {
        return controller;
    }

    function recoverSignerAddress(
        bytes32 prefixedHash,
        ECDSASignature memory signature
    ) public view returns (address signer) {
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s);
    }

     // Payable fallback function
    function () external payable {}
}