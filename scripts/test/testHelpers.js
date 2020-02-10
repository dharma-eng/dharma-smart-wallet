const { web3 } = require("./web3");
const constants = require("./constants");
const assert = require("assert");
const util = require("ethereumjs-util");

const MockCodeCheckArtifact = require("../../build/contracts/MockCodeCheck.json");

const AdharmaSmartWalletImplementationArtifact = require("../../build/contracts/AdharmaSmartWalletImplementation.json");
const AdharmaKeyRingImplementationArtifact = require("../../build/contracts/AdharmaKeyRingImplementation.json");

const DharmaUpgradeBeaconControllerManagerArtifact = require("../../build/contracts/DharmaUpgradeBeaconControllerManager.json");
const DharmaUpgradeBeaconControllerArtifact = require("../../build/contracts/DharmaUpgradeBeaconController.json");
const DharmaUpgradeBeaconArtifact = require("../../build/contracts/DharmaUpgradeBeacon.json");
const DharmaKeyRingUpgradeBeaconArtifact = require("../../build/contracts/DharmaKeyRingUpgradeBeacon.json");
const DharmaUpgradeBeaconEnvoyArtifact = require("../../build/contracts/DharmaUpgradeBeaconEnvoy.json");

const DharmaAccountRecoveryManagerV2Artifact = require("../../build/contracts/DharmaAccountRecoveryManagerV2.json");
const DharmaKeyRegistryV2Artifact = require("../../build/contracts/DharmaKeyRegistryV2.json");
const DharmaSmartWalletFactoryV1Artifact = require("../../build/contracts/DharmaSmartWalletFactoryV1.json");
const DharmaSmartWalletFactoryV2Artifact = require("../../build/contracts/DharmaSmartWalletFactoryV2.json");

const DharmaSmartWalletImplementationV6Artifact = require("../../build/contracts/DharmaSmartWalletImplementationV6.json");
const DharmaSmartWalletImplementationV7Artifact = require("../../build/contracts/DharmaSmartWalletImplementationV7.json");

const DharmaKeyRingImplementationV1Artifact = require("../../build/contracts/DharmaKeyRingImplementationV1.json");
const DharmaKeyRingFactoryV1Artifact = require("../../build/contracts/DharmaKeyRingFactoryV1.json");
const DharmaKeyRingFactoryV2Artifact = require("../../build/contracts/DharmaKeyRingFactoryV2.json");
const DharmaKeyRingFactoryV3Artifact = require("../../build/contracts/DharmaKeyRingFactoryV3.json");

const UpgradeBeaconProxyV1Artifact = require("../../build/contracts/UpgradeBeaconProxyV1.json");
const KeyRingUpgradeBeaconProxyV1Artifact = require("../../build/contracts/KeyRingUpgradeBeaconProxyV1.json");

const DharmaUpgradeMultisigArtifact = require("../../build/contracts/DharmaUpgradeMultisig.json");
const DharmaAccountRecoveryMultisigArtifact = require("../../build/contracts/DharmaAccountRecoveryMultisig.json");
const DharmaAccountRecoveryOperatorMultisigArtifact = require("../../build/contracts/DharmaAccountRecoveryOperatorMultisig.json");
const DharmaKeyRegistryMultisigArtifact = require("../../build/contracts/DharmaKeyRegistryMultisig.json");

const DharmaEscapeHatchRegistryArtifact = require("../../build/contracts/DharmaEscapeHatchRegistry.json");

const UpgradeBeaconImplementationCheckArtifact = require("../../build/contracts/UpgradeBeaconImplementationCheck.json");
const BadBeaconArtifact = require("../../build/contracts/BadBeacon.json");
const BadBeaconTwoArtifact = require("../../build/contracts/BadBeaconTwo.json");
const TimelockEdgecaseTesterArtifact = require("../../build/contracts/TimelockEdgecaseTester.json");

const MockDharmaKeyRingFactoryArtifact = require("../../build/contracts/MockDharmaKeyRingFactory.json");
const IERC20Artifact = require("../../build/contracts/IERC20.json");
const CTokenInterfaceArtifact = require("../../build/contracts/CTokenInterface.json");
const BalanceCheckerArtifact = require("../../build/contracts/BalanceChecker.json");

class Tester {
    constructor(testingContext) {
        this.context = testingContext;
        this.failed = 0;
        this.passed = 0;

        const UpgradeBeaconImplementationCheckDeployer = new web3.eth.Contract(
            UpgradeBeaconImplementationCheckArtifact.abi
        );
        UpgradeBeaconImplementationCheckDeployer.options.data =
            UpgradeBeaconImplementationCheckArtifact.bytecode;
        this.UpgradeBeaconImplementationCheckDeployer = UpgradeBeaconImplementationCheckDeployer;
    }

    async init() {
        // get available addresses and assign them to various roles
        const addresses = await web3.eth.getAccounts();
        if (addresses.length < 1) {
            console.log("cannot find enough addresses to run tests!");
            process.exit(1);
        }

        let latestBlock = await web3.eth.getBlock("latest");

        this.originalAddress = addresses[0];

        this.address = await this.setupNewDefaultAddress(
            "0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed"
        );

        this.addressTwo = await this.setupNewDefaultAddress(
            "0xf00df00df00df00df00df00df00df00df00df00df00df00df00df00df00df00d"
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

        this.gasLimit = latestBlock.gasLimit;

        const BalanceCheckerDeployer = new web3.eth.Contract(
            BalanceCheckerArtifact.abi
        );
        BalanceCheckerDeployer.options.data = BalanceCheckerArtifact.bytecode;

        this.BalanceChecker = await this.runTest(
            `BalanceChecker contract deployment`,
            BalanceCheckerDeployer,
            "",
            "deploy"
        );

        const MockCodeCheckDeployer = new web3.eth.Contract(
            MockCodeCheckArtifact.abi
        );
        MockCodeCheckDeployer.options.data = MockCodeCheckArtifact.bytecode;

        this.MockCodeCheck = await this.runTest(
            `MockCodeCheck contract deployment`,
            MockCodeCheckDeployer,
            "",
            "deploy"
        );

        await this.runTest(
            "Deployed MockCodeCheck code is correct",
            this.MockCodeCheck,
            "code",
            "call",
            [this.MockCodeCheck.options.address],
            true,
            value => {
                assert.strictEqual(
                    value,
                    MockCodeCheckArtifact.deployedBytecode
                );
            }
        );

        await this.runTest(
            "Deployed MockCodeCheck has correct extcodehash",
            this.MockCodeCheck,
            "hash",
            "call",
            [this.MockCodeCheck.options.address],
            true,
            value => {
                assert.strictEqual(
                    value,
                    web3.utils.keccak256(
                        MockCodeCheckArtifact.deployedBytecode,
                        { encoding: "hex" }
                    )
                );
            }
        );

        await this.setupDeployedContracts();
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
                from: this.originalAddress,
                to: this.originalAddress,
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

    async withBalanceCheck(account, initial, final, test, testArgs) {
        // Get the initial balances.
        const initialBalances = await this.getBalances(account);
        const initialBalancesSet = new Set(Object.keys(initialBalances));

        const initialSet = new Set(Object.keys(initial));
        const finalSet = new Set(Object.keys(final));

        // Initial and final sets must both have the same balance checks.
        assert.strictEqual(initialSet.size, finalSet.size);
        assert.strictEqual(
            initialSet.size,
            new Set([...initialSet, ...finalSet]).size
        );

        // Ensure that all the specified balance checks are actually returned.
        assert.strictEqual(
            new Set([...initialSet].filter(x => !initialBalancesSet.has(x)))
                .size,
            0
        );

        // Get specified keys from balance check and compare to expected values.
        const balanceChecks = [
            ...new Set([...initialSet].filter(x => initialBalancesSet.has(x)))
        ];

        for (const balance of balanceChecks) {
            assert.strictEqual(initialBalances[balance], initial[balance]);
        }

        // Run the test.
        await test.bind(this)(...testArgs);

        // Get the final balances.
        const finalBalances = await this.getBalances(account);
        const fiinalBalancesSet = new Set(Object.keys(finalBalances));

        for (const balance of balanceChecks) {
            assert.strictEqual(final[balance], finalBalances[balance]);
        }
    }

    async getBalances(account) {
        const balances = await this.BalanceChecker.methods
            .getBalances(account)
            .call()
            .catch(error => {
                console.error(error);
                process.exit(1);
            });

        const underlyingBalances = await this.BalanceChecker.methods
            .getUnderlyingBalances(account)
            .call()
            .catch(error => {
                console.error(error);
                process.exit(1);
            });

        return {
            account,
            dDai:
                parseFloat(web3.utils.fromWei(balances.dDaiBalance, "gwei")) *
                10,
            dUSDC:
                parseFloat(web3.utils.fromWei(balances.dUSDCBalance, "gwei")) *
                10,
            dai: parseFloat(web3.utils.fromWei(balances.daiBalance, "ether")),
            usdc: parseFloat(web3.utils.fromWei(balances.usdcBalance, "mwei")),
            sai: parseFloat(web3.utils.fromWei(balances.saiBalance, "ether")),
            cSai:
                parseFloat(web3.utils.fromWei(balances.cSaiBalance, "gwei")) *
                10,
            cDai:
                parseFloat(web3.utils.fromWei(balances.cDaiBalance, "gwei")) *
                10,
            cUSDC:
                parseFloat(web3.utils.fromWei(balances.cUSDCBalance, "gwei")) *
                10,
            ether: parseFloat(
                web3.utils.fromWei(balances.etherBalance, "ether")
            ),
            dDaiUnderlying: parseFloat(
                web3.utils.fromWei(
                    underlyingBalances.dDaiBalanceUnderlying,
                    "ether"
                )
            ),
            dUSDCUnderlying: parseFloat(
                web3.utils.fromWei(
                    underlyingBalances.dUSDCBalanceUnderlying,
                    "mwei"
                )
            ),
            cSaiUnderlying: parseFloat(
                web3.utils.fromWei(
                    underlyingBalances.cSaiBalanceUnderlying,
                    "ether"
                )
            ),
            cDaiUnderlying: parseFloat(
                web3.utils.fromWei(
                    underlyingBalances.cDaiBalanceUnderlying,
                    "ether"
                )
            ),
            cUSDCUnderlying: parseFloat(
                web3.utils.fromWei(
                    underlyingBalances.cUSDCBalanceUnderlying,
                    "mwei"
                )
            ),
            dDaiRaw: balances.dDaiBalance,
            dUSDCRaw: balances.dUSDCBalance,
            daiRaw: balances.daiBalance,
            usdcRaw: balances.usdcBalance,
            saiRaw: balances.saiBalance,
            cSaiRaw: balances.cSaiBalance,
            cDaiRaw: balances.cDaiBalance,
            cUSDCRaw: balances.cUSDCBalance,
            etherRaw: balances.etherBalance,
            dDaiUnderlyingRaw: underlyingBalances.dDaiBalanceUnderlying,
            dUSDCUnderlyingRaw: underlyingBalances.dUSDCBalanceUnderlying,
            cSaiUnderlyingRaw: underlyingBalances.cSaiBalanceUnderlying,
            cDaiUnderlyingRaw: underlyingBalances.cDaiBalanceUnderlying,
            cUSDCUnderlyingRaw: underlyingBalances.cUSDCBalanceUnderlying
        };
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

    async checkAndDeploy(
        name,
        address,
        salt,
        runtimeCode,
        creationCode,
        mockCodeCheck,
        create2Factory
    ) {
        let currentCode;
        await this.runTest(
            `Checking ${name} runtime code`,
            mockCodeCheck,
            "code",
            "call",
            [address],
            true,
            value => {
                currentCode = value;
            }
        );

        if (currentCode !== runtimeCode) {
            await this.runTest(
                `${name} contract address check through immutable create2 factory`,
                create2Factory,
                "findCreate2Address",
                "call",
                [salt, creationCode],
                true,
                value => {
                    assert.strictEqual(value, address);
                }
            );

            await this.runTest(
                `${name} contract deployment through immutable create2 factory`,
                create2Factory,
                "safeCreate2",
                "send",
                [salt, creationCode]
            );
        }

        await this.runTest(
            `Deployed ${name} code is correct`,
            mockCodeCheck,
            "code",
            "call",
            [address],
            true,
            value => {
                assert.strictEqual(value, runtimeCode);
            }
        );
    }

    newDeployer(artifact) {
        let deployer = new web3.eth.Contract(artifact.abi);
        deployer.options.data = artifact.bytecode;
        return deployer;
    }

    async setupDeployedContracts() {
        this.DharmaUpgradeBeaconController = new web3.eth.Contract(
            DharmaUpgradeBeaconControllerArtifact.abi,
            constants.UPGRADE_BEACON_CONTROLLER_ADDRESS
        );
        this.DharmaUpgradeBeacon = new web3.eth.Contract(
            DharmaUpgradeBeaconArtifact.abi,
            constants.UPGRADE_BEACON_ADDRESS
        );
        this.DharmaKeyRingUpgradeBeaconController = new web3.eth.Contract(
            DharmaUpgradeBeaconControllerArtifact.abi,
            constants.KEY_RING_UPGRADE_BEACON_CONTROLLER_ADDRESS
        );

        this.DharmaKeyRingUpgradeBeacon = new web3.eth.Contract(
            DharmaKeyRingUpgradeBeaconArtifact.abi,
            constants.KEY_RING_UPGRADE_BEACON_ADDRESS
        );

        this.DharmaAccountRecoveryManagerV2 = new web3.eth.Contract(
            DharmaAccountRecoveryManagerV2Artifact.abi,
            constants.ACCOUNT_RECOVERY_MANAGER_V2_ADDRESS
        );

        this.DharmaKeyRegistryV2 = new web3.eth.Contract(
            DharmaKeyRegistryV2Artifact.abi,
            constants.KEY_REGISTRY_V2_ADDRESS
        );

        this.DharmaUpgradeBeaconControllerManager = new web3.eth.Contract(
            DharmaUpgradeBeaconControllerManagerArtifact.abi,
            constants.UPGRADE_BEACON_CONTROLLER_MANAGER_ADDRESS
        );

        this.DharmaSmartWalletFactoryV1OnChain = new web3.eth.Contract(
            DharmaSmartWalletFactoryV1Artifact.abi,
            constants.FACTORY_ADDRESS
        );

        this.Comptroller = new web3.eth.Contract(
            constants.COMPTROLLER_ABI,
            constants.COMPTROLLER_MAINNET_ADDRESS
        );

        this.CSAI_BORROW = new web3.eth.Contract(
            [
                {
                    constant: false,
                    inputs: [{ name: "borrowAmount", type: "uint256" }],
                    name: "borrow",
                    outputs: [{ name: "", type: "uint256" }],
                    payable: false,
                    stateMutability: "nonpayable",
                    type: "function"
                }
            ],
            constants.CSAI_MAINNET_ADDRESS
        );

        this.FIAT_TOKEN = new web3.eth.Contract(
            [
                {
                    constant: true,
                    inputs: [],
                    name: "blacklister",
                    outputs: [{ name: "", type: "address" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: false,
                    inputs: [{ name: "_account", type: "address" }],
                    name: "unBlacklist",
                    outputs: [],
                    payable: false,
                    stateMutability: "nonpayable",
                    type: "function"
                },
                {
                    constant: false,
                    inputs: [{ name: "_account", type: "address" }],
                    name: "blacklist",
                    outputs: [],
                    payable: false,
                    stateMutability: "nonpayable",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [{ name: "_account", type: "address" }],
                    name: "isBlacklisted",
                    outputs: [{ name: "", type: "bool" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: false,
                    inputs: [],
                    name: "pause",
                    outputs: [],
                    payable: false,
                    stateMutability: "nonpayable",
                    type: "function"
                },
                {
                    constant: false,
                    inputs: [],
                    name: "unpause",
                    outputs: [],
                    payable: false,
                    stateMutability: "nonpayable",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [],
                    name: "pauser",
                    outputs: [{ name: "", type: "address" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                }
            ],
            constants.USDC_MAINNET_ADDRESS
        );

        this.SAI = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.SAI_MAINNET_ADDRESS
        );

        this.DAI = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.DAI_MAINNET_ADDRESS
        );

        this.USDC = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.USDC_MAINNET_ADDRESS
        );

        this.CSAI = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.CSAI_MAINNET_ADDRESS
        );

        this.CSAI_MINT = new web3.eth.Contract(
            CTokenInterfaceArtifact.abi,
            constants.CSAI_MAINNET_ADDRESS
        );

        this.CDAI = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.CDAI_MAINNET_ADDRESS
        );

        this.CUSDC = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.CUSDC_MAINNET_ADDRESS
        );

        this.DDAI = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.DDAI_MAINNET_ADDRESS
        );

        this.DUSDC = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.DUSDC_MAINNET_ADDRESS
        );

        const MetaABI = [
            {
                constant: false,
                inputs: [
                    { internalType: "address", name: "owner", type: "address" },
                    {
                        internalType: "address",
                        name: "spender",
                        type: "address"
                    },
                    { internalType: "uint256", name: "value", type: "uint256" },
                    { internalType: "bool", name: "increase", type: "bool" },
                    {
                        internalType: "uint256",
                        name: "expiration",
                        type: "uint256"
                    },
                    { internalType: "bytes32", name: "salt", type: "bytes32" },
                    { internalType: "bytes", name: "signatures", type: "bytes" }
                ],
                name: "modifyAllowanceViaMetaTransaction",
                outputs: [
                    { internalType: "bool", name: "success", type: "bool" }
                ],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: true,
                inputs: [
                    {
                        internalType: "bytes4",
                        name: "functionSelector",
                        type: "bytes4"
                    },
                    { internalType: "bytes", name: "arguments", type: "bytes" },
                    {
                        internalType: "uint256",
                        name: "expiration",
                        type: "uint256"
                    },
                    { internalType: "bytes32", name: "salt", type: "bytes32" }
                ],
                name: "getMetaTransactionMessageHash",
                outputs: [
                    {
                        internalType: "bytes32",
                        name: "messageHash",
                        type: "bytes32"
                    },
                    { internalType: "bool", name: "valid", type: "bool" }
                ],
                payable: false,
                stateMutability: "view",
                type: "function"
            }
        ];

        this.DDAI_META = new web3.eth.Contract(
            MetaABI,
            constants.DDAI_MAINNET_ADDRESS
        );

        this.DUSDC_META = new web3.eth.Contract(
            MetaABI,
            constants.DUSDC_MAINNET_ADDRESS
        );

        this.BadBeaconDeployer = this.newDeployer(BadBeaconArtifact);

        this.BadBeaconTwoDeployer = this.newDeployer(BadBeaconTwoArtifact);

        this.AdharmaSmartWalletImplementationDeployer = this.newDeployer(
            AdharmaSmartWalletImplementationArtifact
        );

        this.DharmaSmartWalletImplementationV6Deployer = this.newDeployer(
            DharmaSmartWalletImplementationV6Artifact
        );

        this.DharmaSmartWalletImplementationV7Deployer = this.newDeployer(
            DharmaSmartWalletImplementationV7Artifact
        );

        this.AdharmaKeyRingImplementationDeployer = this.newDeployer(
            AdharmaKeyRingImplementationArtifact
        );

        this.DharmaKeyRingImplementationV1Deployer = this.newDeployer(
            DharmaKeyRingImplementationV1Artifact
        );

        this.UpgradeBeaconImplementationCheckDeployer = this.newDeployer(
            UpgradeBeaconImplementationCheckArtifact
        );

        this.TimelockEdgecaseTesterDeployer = this.newDeployer(
            TimelockEdgecaseTesterArtifact
        );

        this.DharmaUpgradeBeaconControllerDeployer = this.newDeployer(
            DharmaUpgradeBeaconControllerArtifact
        );

        this.DharmaUpgradeBeaconDeployer = this.newDeployer(
            DharmaUpgradeBeaconArtifact
        );

        this.DharmaKeyRingUpgradeBeaconDeployer = this.newDeployer(
            DharmaKeyRingUpgradeBeaconArtifact
        );

        this.DharmaUpgradeBeaconEnvoyDeployer = this.newDeployer(
            DharmaUpgradeBeaconEnvoyArtifact
        );

        this.DharmaUpgradeBeaconControllerManagerDeployer = this.newDeployer(
            DharmaUpgradeBeaconControllerManagerArtifact
        );

        this.UpgradeBeaconProxyV1Deployer = this.newDeployer(
            UpgradeBeaconProxyV1Artifact
        );

        this.KeyRingUpgradeBeaconProxyV1Deployer = this.newDeployer(
            KeyRingUpgradeBeaconProxyV1Artifact
        );

        this.DharmaKeyRegistryV2Deployer = this.newDeployer(
            DharmaKeyRegistryV2Artifact
        );

        this.DharmaSmartWalletFactoryV1Deployer = this.newDeployer(
            DharmaSmartWalletFactoryV1Artifact
        );

        this.DharmaSmartWalletFactoryV2Deployer = this.newDeployer(
            DharmaSmartWalletFactoryV2Artifact
        );

        this.DharmaKeyRingFactoryV1Deployer = this.newDeployer(
            DharmaKeyRingFactoryV1Artifact
        );

        this.DharmaKeyRingFactoryV2Deployer = this.newDeployer(
            DharmaKeyRingFactoryV2Artifact
        );

        this.DharmaKeyRingFactoryV3Deployer = this.newDeployer(
            DharmaKeyRingFactoryV3Artifact
        );

        this.MockDharmaKeyRingFactoryDeployer = this.newDeployer(
            MockDharmaKeyRingFactoryArtifact
        );

        this.DharmaAccountRecoveryManagerV2Deployer = this.newDeployer(
            DharmaAccountRecoveryManagerV2Artifact
        );

        this.DharmaUpgradeMultisigDeployer = this.newDeployer(
            DharmaUpgradeMultisigArtifact
        );

        this.DharmaAccountRecoveryMultisigDeployer = this.newDeployer(
            DharmaAccountRecoveryMultisigArtifact
        );

        this.DharmaAccountRecoveryOperatorMultisigDeployer = this.newDeployer(
            DharmaAccountRecoveryOperatorMultisigArtifact
        );

        this.DharmaKeyRegistryMultisigDeployer = this.newDeployer(
            DharmaKeyRegistryMultisigArtifact
        );

        this.DharmaEscapeHatchRegistryDeployer = this.newDeployer(
            DharmaEscapeHatchRegistryArtifact
        );
    }
}

function swapMetadataHash(bytecode, newMetadataHashes) {
    const totalBzzrs = bytecode.split(constants.METADATA_IDENTIFIER).length - 1;

    if (totalBzzrs !== newMetadataHashes.length) {
        throw "number of metadata hashes to replace must match provided number.";
    }

    let startingPoint = bytecode.length - 1;

    for (let i = 0; i < totalBzzrs; i++) {
        let replacement =
            constants.METADATA_IDENTIFIER + newMetadataHashes.slice(i)[0];
        let lastIndex = bytecode.lastIndexOf(
            constants.METADATA_IDENTIFIER,
            startingPoint
        );
        bytecode =
            bytecode.slice(0, lastIndex) +
            replacement +
            bytecode.slice(lastIndex + replacement.length, bytecode.length);
        startingPoint = lastIndex - 1;
    }
    return bytecode;
}

function newContractAndSwapMetadataHash(artifact) {
    const contract = new web3.eth.Contract(artifact.abi);

    contract.options.data = swapMetadataHash(artifact.bytecode, [
        "0000000000000000000000000000000000000000000000000000000000000000"
    ]);

    return contract;
}

// used to wait for more confirmations
function longer() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 500);
    });
}

module.exports = {
    Tester,
    swapMetadataHash,
    newContractAndSwapMetadataHash,
    longer
};
