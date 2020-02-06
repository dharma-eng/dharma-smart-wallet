const { web3 } = require("./web3");
const constants = require("./constants");

const SCALING_FACTOR = web3.utils.toBN("1000000000000000000");
const ZERO = web3.utils.toBN("0");
const ONE = web3.utils.toBN("1");
const NINE = web3.utils.toBN("9");
const TEN = web3.utils.toBN("10");

class Tester {
    constructor(testingContext) {
        this.context = testingContext;
        this.failed = 0;
        this.passed = 0;
    }

    async init() {
        // get available addresses and assign them to various roles
        const addresses = await web3.eth.getAccounts();
        if (addresses.length < 1) {
            console.log('cannot find enough addresses to run tests!');
            process.exit(1)
        }

        let latestBlock = await web3.eth.getBlock('latest');

        this.originalAddress = addresses[0];

        this.address = await this.setupNewDefaultAddress(
            '0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed'
        );

        let addressTwo = await this.setupNewDefaultAddress(
            '0xf00df00df00df00df00df00df00df00df00df00df00df00df00df00df00df00d'
        );

        this.ownerOne = await this.setupNewDefaultAddress(
            constants.MOCK_OWNER_PRIVATE_KEYS[0]
        );
        this.ownerTwo = await this.setupNewDefaultAddress(
            constants.MOCK_OWNER_PRIVATE_KEYS[1]
        );
        this.ownerThree = await this.setupNewDefaultAddress(
            constants.MOCK_OWNER_PRIVATE_KEYS[2]
        );
        this.ownerFour = await this.setupNewDefaultAddress(
            constants.MOCK_OWNER_PRIVATE_KEYS[3]
        );
        this.ownerFive = await this.setupNewDefaultAddress(
            constants.MOCK_OWNER_PRIVATE_KEYS[4]
        );

        this.gasLimit = latestBlock.gasLimit
    }

    async setupNewDefaultAddress(newPrivateKey) {
        const pubKey = await web3.eth.accounts.privateKeyToAccount(
            newPrivateKey
        );
        await web3.eth.accounts.wallet.add(pubKey);

        await web3.eth.sendTransaction({
            from: this.originalAddress,
            to: pubKey.address,
            value: 2 * 10 ** 18,
            gas: "0x5208",
            gasPrice: "0x4A817C800"
        });

        return pubKey.address;
    }

    async raiseGasLimit(necessaryGas) {
        let iterations = 9999;

        if (necessaryGas > 8000000) {
            console.error("the gas needed is too high!");
            process.exit(1);
        } else if (typeof necessaryGas === "undefined") {
            iterations = 20;
            necessaryGas = 8000000;
        }

        // bring up gas limit if necessary by doing additional transactions
        let block = await web3.eth.getBlock("latest");
        while (iterations > 0 && block.gasLimit < necessaryGas) {
            await web3.eth.sendTransaction({
                from: originalAddress,
                to: originalAddress,
                value: "0x01",
                gas: "0x5208",
                gasPrice: "0x4A817C800"
            });
            block = await web3.eth.getBlock("latest");
            iterations--;
        }

        console.log("raising gasLimit, currently at " + block.gasLimit);
        return block.gasLimit;
    }

    async getDeployGas(dataPayload) {
        await web3.eth
            .estimateGas({
                from: address,
                data: dataPayload
            })
            .catch(async error => {
                if (
                    error.message ===
                    "Returned error: gas required exceeds allowance or always failing " +
                    "transaction"
                ) {
                    await this.raiseGasLimit();
                    await this.getDeployGas(dataPayload);
                }
            });

        return web3.eth.estimateGas({
            from: address,
            data: dataPayload
        });
    }

    async advanceTime(time) {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send(
                {
                    jsonrpc: "2.0",
                    method: "evm_increaseTime",
                    params: [time],
                    id: new Date().getTime()
                },
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result);
                }
            );
        });
    }

    async takeSnapshot() {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send(
                {
                    jsonrpc: "2.0",
                    method: "evm_snapshot",
                    id: new Date().getTime()
                },
                (err, snapshotId) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(snapshotId);
                }
            );
        });
    }

    async revertToSnapShot(id) {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send(
                {
                    jsonrpc: "2.0",
                    method: "evm_revert",
                    params: [id],
                    id: new Date().getTime()
                },
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result);
                }
            );
        });
    }

    async advanceBlock() {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send(
                {
                    jsonrpc: "2.0",
                    method: "evm_mine",
                    id: new Date().getTime()
                },
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result);
                }
            );
        });
    }

    async rpc(request) {
        return new Promise((okay, fail) =>
            web3.currentProvider.send(request, (err, res) =>
                err ? fail(err) : okay(res)
            )
        );
    }

    async getLatestBlockNumber() {
        let { result: num } = await this.rpc({
            method: "eth_blockNumber",
            id: new Date().getTime() // for snapshotting
        });
        return num;
    }

    async advanceBlocks(blocksToAdvance, nonce) {
        if (blocksToAdvance < 1) {
            throw new Error("must advance at least one block.");
        }

        let currentBlockNumberHex = await this.getLatestBlockNumber();

        const accountNonce =
            typeof nonce === "undefined"
                ? await web3.eth.getTransactionCount(this.address)
                : nonce;

        const extraBlocks = blocksToAdvance - 1;
        const extraBlocksHex =
            "0x" + (extraBlocks + parseInt(currentBlockNumberHex)).toString(16);

        const nextBlockNumber = blocksToAdvance + 1;
        const nextBlockNumberHex =
            "0x" +
            (nextBlockNumber + parseInt(currentBlockNumberHex)).toString(16);

        await this.rpc({
            method: "evm_mineBlockNumber",
            params: [extraBlocksHex],
            id: new Date().getTime()
        });

        const newBlockNumberHex =
            "0x" +
            (blocksToAdvance + parseInt(currentBlockNumberHex)).toString(16);
        currentBlockNumberHex = await this.getLatestBlockNumber();

        if (currentBlockNumberHex !== newBlockNumberHex) {
            console.error(
                `current block is now ${parseInt(
                    currentBlockNumberHex
                )} - evm_mineBlockNumber failed... (expected ${parseInt(
                    newBlockNumberHex
                )})`
            );
            process.exit(1);
        }

        const dummyTxReceipt = await web3.eth.sendTransaction({
            from: this.address,
            to: this.address,
            data: "0x",
            value: 0,
            gas: 21000,
            gasPrice: 1,
            nonce: accountNonce
        });

        return await web3.eth.getBlock(dummyTxReceipt.blockHash);
    }

    async advanceTimeAndBlock(time) {
        await this.advanceTime(time);
        await this.advanceBlock();
        return Promise.resolve(web3.eth.getBlock("latest"));
    }

    async advanceTimeAndBlocks(blocks, nonce) {
        if (blocks < 2) {
            return reject("must advance by at least two blocks.");
        }
        //let block = await web3.eth.getBlock(await this.getLatestBlockNumber())
        await this.advanceTime(blocks * 15);
        //block = await web3.eth.getBlock(await this.getLatestBlockNumber())

        // next block must be extracted from this function ('getBlock' breaks)
        return await this.advanceBlocks(blocks - 1, nonce);
    }

    signHashedPrefixedHexString(hashedHexString, account) {
        const sig = util.ecsign(
            util.toBuffer(
                web3.utils.keccak256(
                    // prefix => "\x19Ethereum Signed Message:\n32"
                    "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
                    hashedHexString.slice(2),
                    { encoding: "hex" }
                )
            ),
            util.toBuffer(web3.eth.accounts.wallet[account].privateKey)
        );

        return (
            util.bufferToHex(sig.r) +
            util.bufferToHex(sig.s).slice(2) +
            web3.utils.toHex(sig.v).slice(2)
        );
    }

    signHashedPrefixedHashedHexString(hexString, account) {
        const sig = util.ecsign(
            util.toBuffer(
                web3.utils.keccak256(
                    // prefix => "\x19Ethereum Signed Message:\n32"
                    "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
                    web3.utils
                        .keccak256(hexString, { encoding: "hex" })
                        .slice(2),
                    { encoding: "hex" }
                )
            ),
            util.toBuffer(web3.eth.accounts.wallet[account].privateKey)
        );

        return (
            util.bufferToHex(sig.r) +
            util.bufferToHex(sig.s).slice(2) +
            web3.utils.toHex(sig.v).slice(2)
        );
    }

    async sendTransaction(
        instance,
        method,
        args,
        from,
        value,
        gas,
        gasPrice,
        transactionShouldSucceed,
        nonce
    ) {
        return instance.methods[method](...args)
            .send({
                from: from,
                value: value,
                gas: gas,
                gasPrice: gasPrice,
                nonce: nonce
            })
            .on("confirmation", (confirmationNumber, r) => {
                confirmations[r.transactionHash] = confirmationNumber;
            })
            .catch(error => {
                if (transactionShouldSucceed) {
                    console.error(error);
                }
                return { status: false };
            });
    }

    async callMethod(
        instance,
        method,
        args,
        from,
        value,
        gas,
        gasPrice,
        callShouldSucceed
    ) {
        let callSucceeded = true;

        const returnValues = await instance.methods[method](...args)
            .call({
                from: from,
                value: value,
                gas: gas,
                gasPrice: gasPrice
            })
            .catch(error => {
                if (callShouldSucceed) {
                    console.error(error);
                }
                callSucceeded = false;
            });

        return { callSucceeded, returnValues };
    }

    async send(
        title,
        instance,
        method,
        args,
        from,
        value,
        gas,
        gasPrice,
        transactionShouldSucceed,
        assertionCallback,
        nonce
    ) {
        const receipt = await this.sendTransaction(
            instance,
            method,
            args,
            from,
            value,
            gas,
            gasPrice,
            transactionShouldSucceed,
            nonce
        );

        const transactionSucceeded = receipt.status;

        if (transactionSucceeded) {
            try {
                assertionCallback(receipt);
            } catch (error) {
                console.log(error);
                return false; // return false if assertions fail and throw an error
            }
        }

        //return true if transaction success matches expectations, false if expectations are mismatched
        return transactionSucceeded === transactionShouldSucceed;
    }

    async call(
        title,
        instance,
        method,
        args,
        from,
        value,
        gas,
        gasPrice,
        callShouldSucceed,
        assertionCallback
    ) {
        const { callSucceeded, returnValues } = await this.callMethod(
            instance,
            method,
            args,
            from,
            value,
            gas,
            gasPrice,
            callShouldSucceed
        );

        // if call succeeds, try assertion callback
        if (callSucceeded) {
            try {
                assertionCallback(returnValues);
            } catch (error) {
                console.log(error);
                return false;
            }
        }
        return callSucceeded === callShouldSucceed;
    }

    async deploy(
        title,
        instance,
        args,
        from,
        value,
        gas,
        gasPrice,
        shouldSucceed,
        assertionCallback
    ) {
        let deployData = instance.deploy({ arguments: args }).encodeABI();
        let deployGas = await web3.eth
            .estimateGas({
                from: from,
                data: deployData
            })
            .catch(error => {
                if (shouldSucceed) {
                    console.error(error);
                }
                return this.gasLimit;
            });

        if (deployGas > this.gasLimit) {
            console.error(
                ` ✘ ${title}: deployment costs exceed block gas limit!`
            );
            process.exit(1);
        }

        if (typeof gas === "undefined") {
            gas = deployGas;
        }

        if (deployGas > gas) {
            console.error(` ✘ ${title}: deployment costs exceed supplied gas.`);
            process.exit(1);
        }

        let signed;
        let deployHash;
        let receipt;
        const contract = await instance
            .deploy({ arguments: args })
            .send({
                from: from,
                gas: gas,
                gasPrice: gasPrice
            })
            .on("transactionHash", hash => {
                deployHash = hash;
            })
            .on("receipt", r => {
                receipt = r;
            })
            .on("confirmation", (confirmationNumber, r) => {
                confirmations[r.transactionHash] = confirmationNumber;
            })
            .catch(error => {
                if (shouldSucceed) {
                    console.error(error);
                }

                receipt = { status: false };
            });

        if (receipt.status !== shouldSucceed) {
            if (contract) {
                return [false, contract, gas];
            }
            return [false, instance, gas];
        } else if (!shouldSucceed) {
            if (contract) {
                return [true, contract, gas];
            }
            return [true, instance, gas];
        }

        assert.ok(receipt.status);

        let assertionsPassed;
        try {
            assertionCallback(receipt);
            assertionsPassed = true;
        } catch (error) {
            assertionsPassed = false;
        }

        if (contract) {
            return [assertionsPassed, contract, gas];
        }
        return [assertionsPassed, instance, gas];
    }

    /* aggregates the first 3 functions
     * run test without coverage, once they're passing then run with coverage
     * coverage changes the gas -- orders of magnitued more expensive
     * any test that are gas dependent get grilled under coverage test
     *
     *
     * default: send
     */
    async runTest(
        title,
        instance,
        method,
        callOrSendOrDeploy,
        args,
        shouldSucceed,
        assertionCallback,
        from,
        value,
        gas,
        nonce
    ) {
        if (typeof callOrSendOrDeploy === "undefined") {
            callOrSendOrDeploy = "send";
        }
        if (typeof args === "undefined") {
            args = [];
        }
        if (typeof shouldSucceed === "undefined") {
            shouldSucceed = true;
        }
        if (typeof assertionCallback === "undefined") {
            assertionCallback = value => {};
        }
        if (typeof from === "undefined") {
            from = this.address;
        }
        if (typeof value === "undefined") {
            value = 0;
        }
        if (typeof gas === "undefined" && callOrSendOrDeploy !== "deploy") {
            gas = 6009006;
            if (this.context === "coverage") {
                gas = this.gasLimit - 1;
            }
        }
        let ok = false;
        let contract;
        let deployGas;
        if (callOrSendOrDeploy === "send") {
            ok = await this.send(
                title,
                instance,
                method,
                args,
                from,
                value,
                gas,
                1,
                shouldSucceed,
                assertionCallback,
                nonce
            );
        } else if (callOrSendOrDeploy === "call") {
            ok = await this.call(
                title,
                instance,
                method,
                args,
                from,
                value,
                gas,
                1,
                shouldSucceed,
                assertionCallback
            );
        } else if (callOrSendOrDeploy === "deploy") {
            const fields = await this.deploy(
                title,
                instance,
                args,
                from,
                value,
                gas,
                1,
                shouldSucceed,
                assertionCallback
            );
            ok = fields[0];
            contract = fields[1];
            deployGas = fields[2];
        } else {
            console.error("must use call, send, or deploy!");
            process.exit(1);
        }

        if (ok) {
            console.log(
                ` ✓ ${
                    callOrSendOrDeploy === "deploy" ? "successful " : ""
                    }${title}${
                    callOrSendOrDeploy === "deploy" ? ` (${deployGas} gas)` : ""
                    }`
            );
            this.passed++;
        } else {
            console.log(
                ` ✘ ${
                    callOrSendOrDeploy === "deploy" ? "failed " : ""
                    }${title}${
                    callOrSendOrDeploy === "deploy" ? ` (${deployGas} gas)` : ""
                    }`
            );
            this.failed++;
        }

        if (contract) {
            return contract;
        }
    }

    getEvents(receipt, contractNames) {
        const { events } = receipt;

        // web3 "helpfully" collects multiple events into arrays... flatten them :)
        let flattenedEvents = {};
        for (const e of Object.values(events)) {
            if (Array.isArray(e)) {
                for (const n of e) {
                    flattenedEvents[n.logIndex] = n;
                }
            } else {
                flattenedEvents[e.logIndex] = e;
            }
        }

        return Object.values(flattenedEvents)
            .map(value => {
                // Handle MKR events independently (Pot and Vat called by cDai)
                if (value.raw.topics.length === 4) {
                    const callerAddress = web3.utils.toChecksumAddress(
                        "0x" + value.raw.topics[1].slice(26)
                    );
                    return {
                        address: contractNames[value.address],
                        eventName: null,
                        returnValues: {
                            selector: value.raw.topics[0].slice(0, 10),
                            caller:
                                callerAddress in contractNames
                                    ? contractNames[callerAddress]
                                    : callerAddress,
                            arg1: value.raw.topics[2],
                            arg2: value.raw.topics[3]
                        }
                    };
                }

                const topic = value.raw.topics[0];
                const log = constants.EVENT_DETAILS[topic];

                return {
                    address: contractNames[value.address],
                    eventName: log.name,
                    returnValues: web3.eth.abi.decodeLog(
                        log.abi,
                        value.raw.data,
                        value.raw.topics.slice(1)
                    )
                };
            })
            .filter(value => value !== null);
    }
}

module.exports = {
    Tester,
};
