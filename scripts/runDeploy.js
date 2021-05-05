const ethers = require("hardhat").ethers;

const { LedgerSigner } = require("@ethersproject/hardware-wallets");

const { run } = require("./deploy");

const chainId = 137;

const provider = new ethers.providers.WebSocketProvider(
    "wss://ws-matic-mainnet.chainstacklabs.com",
    chainId
);

const signer = new LedgerSigner(provider /*, type, path */);

console.log(
    "attempting to connect to provider at 'wss://ws-matic-mainnet.chainstacklabs.com'..."
);

const tx = async (connection, { to = null, value = 0, data }) => {
    const ledgerWeb3 = connection;
    let addresses;
    try {
        addresses = await ledgerWeb3.eth.getAccounts();
        console.log(addresses);
    } catch (e) {
        if (e.name === "TransportStatusError") {
            console.error(
                "ERROR: cannot find ledger. Ensure that it is connected and unlocked."
            );
        } else {
            console.error(e);
        }
        process.exit(1);
    }

    // construct the transaction
    const from = addresses[0];

    if (
        to !== null &&
        !(
            typeof to === "string" &&
            to.length === 42 &&
            ledgerWeb3.utils.checkAddressChecksum(to)
        )
    ) {
        console.log(to);
        console.error(
            "ERROR: to must be null (for contract deploys) or a checksummed address!"
        );
        process.exit(1);
    }

    const nonce = (await ledgerWeb3.eth.getTransactionCount(from)).toString(10);
    if (
        !ledgerWeb3.utils.isHexStrict(data) ||
        data.length % 2 != 0 // even length
    ) {
        console.error(
            "ERROR: data must be a valid, 0x-prefixed hex string! (use '0x' for no data)"
        );
        process.exit(1);
    }

    const gasEstimateParameters = { from, to, value, nonce, data };

    let gasEstimate = 10000000;

    try {
        gasEstimate = await ledgerWeb3.eth.estimateGas(gasEstimateParameters);
    } catch (e) {}

    const gas = parseInt(gasEstimate * GAS_ESTIMATE_MULTIPLIER).toString(10);

    const gasPrice = "1";

    const transactionParameters = {
        from,
        to,
        value,
        nonce,
        gas,
        gasPrice,
        data
    };

    // get some additional context
    const balanceInWei = await ledgerWeb3.eth.getBalance(from);
    const currentEtherBalance = ledgerWeb3.utils.fromWei(balanceInWei, "ether");

    const getGasCostInEther = gasSpent =>
        ledgerWeb3.utils.fromWei(
            ledgerWeb3.utils
                .toBN(gasPrice)
                .mul(ledgerWeb3.utils.toBN(gasSpent))
                .toString(10),
            "ether"
        );

    const getTotalCostInEther = gasCost =>
        (parseFloat(gasCost) + parseInt(value) / 1e18).toString(10);

    const estimatedGasCostInEther = getGasCostInEther(gasEstimate);
    const maximumGasCostInEther = getGasCostInEther(gas);
    const estimatedTotalCostInEther = getTotalCostInEther(
        estimatedGasCostInEther
    );
    const maximumTotalCostInEther = getTotalCostInEther(maximumGasCostInEther);

    const additionalInformation = {
        currentEtherBalance,
        estimatedGasCostInEther,
        estimatedTotalCostInEther,
        maximumGasCostInEther,
        maximumTotalCostInEther
    };

    console.log(transactionParameters);
    console.log(additionalInformation);

    if (parseFloat(maximumTotalCostInEther) > parseFloat(currentEtherBalance)) {
        console.error(
            "ERROR: balance is insufficient to submit this transaction!"
        );
        process.exit(1);
    }

    if (PERFORM_DRY_RUN) {
        console.log("performing dry run...");
        const returnData = await ledgerWeb3.eth.call(transactionParameters);
        console.log(returnData);
        console.log();
    }

    let confirmations = {};
    console.log("submitting transaction...");
    const receipt = await ledgerWeb3.eth
        .sendTransaction(transactionParameters)
        .on("transactionHash", hash => {
            console.log(` * submitted - tx hash: ${hash}`);
        })
        .on("confirmation", (confirmationNumber, r) => {
            confirmations[r.transactionHash] = confirmationNumber;
            if (CONFIRMATIONS > 0) {
                console.log(
                    ` * confirmation ${confirmationNumber}/${CONFIRMATIONS}`
                );
            }
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });

    console.log(
        ` * transaction included in block ${
            receipt.blockNumber
        } — waiting for an additional confirmation...`
    );

    if (CONFIRMATIONS > 0) {
        while (confirmations[receipt.transactionHash] < CONFIRMATIONS) {
            await longer();
        }
        console.log(" * confirmed.");
    }

    console.log(receipt);
    if (!receipt.status) {
        console.error("revert");
        process.exit(1);
    }

    return receipt;
};

async function signerCallbackLedger(transaction) {
    const from = await signer.getAddress();

    const tx = {
        ...transaction,
        from,
        chainId
    };

    const expectedResult = await provider.call(tx);
    console.log({ transaction: tx, expectedResult });

    const txn = await signer.sendTransaction(tx);
    console.log({ txn });
    const receipt = await txn.wait();
    console.log({ receipt });
    return receipt;
}

async function runDeploy() {
    await run(signerCallbackLedger);
    console.log("Deploy complete.");
}

runDeploy();
