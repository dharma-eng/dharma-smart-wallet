pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./RelayContract.sol";


// V2 of Relay Contracts
contract RelayContractV2 is RelayContract, Ownable {
    // A list of the hash of completed transactions,
    // to prevent replay attacks.
    mapping (bytes32 => bool) public completedTransactions;

    // Emitted when funds are paid to this contract.
    event ETHReceived(
        address payee,
        uint256 value
    );

    // Events related to force-changing the controller variable.
    event ForceChangeControllerSuccess(
        address candidate,
        address sender
    );

    // Takes in the address of the owner, and the address of the controller.
    // The owner is an offline address for emergency use.
    constructor(address ownerIn, address controllerIn) public payable {
        controller = controllerIn;
        transferOwnership(ownerIn);
    }

    // Given parameters for a transaction, execute that transaction.
    function executeTransaction(
        transactionParameters memory parameters
    ) public
    {
        address to = parameters.to;
        bytes memory data = parameters.data;
        uint value = parameters.value;
        address signer = parameters.signer;

        // An attempt has been made to execute a transaction; log an event.
        emit ExecuteTransactionAttempt(to, signer);

        // Prevent unsigned transactions or replay attacks.
        requireUniqueAndSignedByController(parameters);

        // Execute the transaction.
        (bool ok, ) = to.call.value(value)(data);
        require(ok, "Transaction failed during execution");

        // The execution was successfully submitted; log a success event.
        emit ExecuteTransactionSuccess(to, signer);
    }

    // Allows an array of transactions to be executed serially.
    function executeTransactions(
        transactionParameters[] memory transactions
    ) public
    {
        for (uint8 i = 0 ; i < transactions.length; i++) {
            executeTransaction(transactions[i]);
        }
    }

    // Reverts if the transaction was not signed by the controller,
    // of if the transaction has already been submitted.
    function requireUniqueAndSignedByController(
        transactionParameters memory parameters
    ) public returns (bool) {
        address to = parameters.to;
        bytes memory data = parameters.data;
        uint value = parameters.value;
        address signer = parameters.signer;
        uint nonce = parameters.nonce;
        ECDSASignature memory signature = parameters.signature;

        // The person who signed the data must be the controller of the contract.
        require(signer == controller);

        // Ethereum prefixed hash of the data.
        bytes32 prefixedHash = getHash(to, data, value, nonce);

        // Prevent replay attacks.
        requireIsUniqueTransaction(prefixedHash);

        // We verify that the given signer address signed the hash.
        address recoveredSigner = recoverSignerAddress(prefixedHash, signature);

        require(
            recoveredSigner == signer,
            "Controller is not authorized to execute transaction"
        );
    }

    function getHash(
        address to,
        bytes memory data,
        uint value,
        uint nonce
    ) public view returns (bytes32 prefixedHash) {
        // A hash of all the relevant data.
        bytes32 hash = keccak256(abi.encodePacked(to, data, value, nonce));

        // Ethereum prefixed hash of the data.
        return keccak256(abi.encodePacked(PREFIX, hash));
    }

    function requireIsUniqueTransaction(bytes32 prefixedHash) public {
        require(
            !completedTransactions[prefixedHash],
            "Nonce has already been used for these transaction parameters"
        );

        // Store that this transaction has completed.
        completedTransactions[prefixedHash] = true;
    }

    function forceChangeController(address candidate) public onlyOwner {
        controller = candidate;

        emit ForceChangeControllerSuccess(candidate, msg.sender);
    }

    // Payable fallback function
    function () external payable {
        emit ETHReceived(
            msg.sender,
            msg.value
        );
    }
}