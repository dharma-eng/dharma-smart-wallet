const ethers = require("hardhat").ethers;

const { run } = require("./deploy");

async function getSigner() {
    const mnemonic =
        "toast input grunt first scare ancient frame canoe flag clinic cereal empty orange hire swap";
    const walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic);
    return {
        privateKey: walletMnemonic.privateKey,
        signer: new ethers.Wallet(walletMnemonic.privateKey, ethers.provider)
    };
}

async function signerCallbackDefault(transaction) {
    const { signer } = await getSigner();
    const txn = await signer.sendTransaction(transaction);
    return txn.wait();
}

async function runTestDeploy() {
    await run(signerCallbackDefault);
    console.log("Tests passed.");
}

runTestDeploy();
