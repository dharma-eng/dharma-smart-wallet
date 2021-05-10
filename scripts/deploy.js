const ethers = require("hardhat").ethers;
const util = require("ethereumjs-util");

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

async function deploy(name, args = [], signerCallBack = signerCallbackDefault) {
    let contract = await ethers.getContractFactory(name);

    const deployTransaction = await contract.getDeployTransaction(...args);

    const receipt = await signerCallBack(deployTransaction);

    const contractAddress = receipt.creates || receipt.contractAddress;

    if (!contractAddress) {
        throw new Error("Could not find contract address");
    }
    return new ethers.Contract(
        contractAddress,
        contract.interface,
        ethers.provider
    );
}

async function getKeyRegistrySignature(keyResigtryAddress) {
    const { privateKey, signer } = await getSigner();

    const hexString =
        keyResigtryAddress +
        signer.address.slice(2) +
        ethers.utils
            .hexlify(
                ethers.utils.toUtf8Bytes(
                    "This signature demonstrates that the supplied signing key is valid."
                )
            )
            .slice(2);

    const sig = util.ecsign(
        util.toBuffer(
            ethers.utils.keccak256(
                // prefix => "\x19Ethereum Signed Message:\n32"
                "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
                    ethers.utils
                        .keccak256(hexString, { encoding: "hex" })
                        .slice(2),
                { encoding: "hex" }
            )
        ),
        util.toBuffer(privateKey)
    );

    return (
        util.bufferToHex(sig.r) +
        util.bufferToHex(sig.s).slice(2) +
        ethers.utils.hexlify(sig.v).slice(2)
    );
}

async function run(signerCallback = signerCallbackDefault) {
    // TODO: use env file when deploying contracts to production environment.
    // Set up signer
    const { signer } = await getSigner();
    const jsonRPCsigners = await ethers.getSigners();
    const jsonRPCSigner = jsonRPCsigners[0];
    await jsonRPCSigner.sendTransaction({
        to: signer.address,
        value: ethers.utils.parseEther("100")
    });

    // deploy key-registry
    const dharmaKeyRegistry = await deploy(
        "DharmaKeyRegistryV2",
        [],
        signerCallback
    );

    // deploy revert reason helper
    const revertReasonHelper = await deploy(
        "SmartWalletRevertReasonHelperV3",
        [],
        signerCallback
    );

    // deploy implementation: smart-wallet (v16), key-ring (v1)
    const dharmaSmartWalletImplementation = await deploy(
        "DharmaSmartWalletImplementationV16",
        [dharmaKeyRegistry.address, revertReasonHelper.address],
        signerCallback
    );

    const dharmaKeyRingImplementation = await deploy(
        "DharmaKeyRingImplementationV1",
        [],
        signerCallback
    );

    // deploy envoy
    const dharmaUpgradeBeaconEnvoy = await deploy(
        "DharmaUpgradeBeaconEnvoy",
        [],
        signerCallback
    );

    // deploy upgrade-beacon-controllers
    const dharmaSmartWalletUpgradeBeaconController = await deploy(
        "DharmaUpgradeBeaconController",
        [dharmaUpgradeBeaconEnvoy.address],
        signerCallback
    );

    const dharmaKeyRingBeaconController = await deploy(
        "DharmaUpgradeBeaconController",
        [dharmaUpgradeBeaconEnvoy.address],
        signerCallback
    );

    // deploy upgrade-beacon: smart-wallet, key-ring
    const dharmaSmartWalletUpgradeBeacon = await deploy(
        "DharmaUpgradeBeacon",
        [dharmaSmartWalletUpgradeBeaconController.address],
        signerCallback
    );

    const dharmaKeyRingBeacon = await deploy(
        "DharmaUpgradeBeacon",
        [dharmaKeyRingBeaconController.address],
        signerCallback
    );

    // deploy factory: smart-wallet (v3), key-ring (v4)
    const dharmaSmartWalletFactory = await deploy(
        "DharmaSmartWalletFactoryV3",
        [dharmaSmartWalletUpgradeBeacon.address],
        signerCallback
    );

    const dharmaKeyRingFactory = await deploy(
        "DharmaKeyRingFactoryV4",
        [dharmaKeyRingBeacon.address],
        signerCallback
    );

    // set dharma-smart-wallet implementation
    const upgradeDharmaSmartWalletBeaconTransaction = await dharmaSmartWalletUpgradeBeaconController.populateTransaction.upgrade(
        ethers.utils.getAddress(dharmaSmartWalletUpgradeBeacon.address),
        ethers.utils.getAddress(dharmaSmartWalletImplementation.address)
    );

    await signerCallback(upgradeDharmaSmartWalletBeaconTransaction);

    // set dharma-key-ring implementation

    const upgradeDharmaKeyRingBeaconTransaction = await dharmaKeyRingBeaconController.populateTransaction.upgrade(
        ethers.utils.getAddress(dharmaKeyRingBeacon.address),
        ethers.utils.getAddress(dharmaKeyRingImplementation.address)
    );

    await signerCallback(upgradeDharmaKeyRingBeaconTransaction);

    // deploy key-ring instance
    const userSigningAddress = ethers.utils.getAddress(signer.address);
    const targetKeyRing = await dharmaKeyRingFactory.callStatic.getNextKeyRing(
        userSigningAddress
    );

    const newKeyRingTransaction = await dharmaKeyRingFactory.populateTransaction.newKeyRing(
        userSigningAddress,
        ethers.utils.getAddress(targetKeyRing)
    );

    // deploy deployment-helper
    const dharmaDeploymentHelper = await deploy(
        "DharmaDeploymentHelperV2",
        [
            dharmaSmartWalletFactory.address, // smartWalletFactory
            dharmaKeyRingFactory.address, // keyRingFactory
            dharmaKeyRegistry.address, // keyRegistry
            dharmaSmartWalletUpgradeBeacon.address // smartWalletUpgradeBeacon
        ],
        signerCallback
    );

    const newKeyRingReceipt = await signerCallback(newKeyRingTransaction);

    // deploy smart-wallet instance
    const targetSmartWallet = await dharmaSmartWalletFactory.callStatic.getNextSmartWallet(
        targetKeyRing
    );

    const newSmartWalletRingTransaction = await dharmaSmartWalletFactory.populateTransaction.newSmartWallet(
        userSigningAddress
    );

    const newSmartWalletReceipt = await signerCallback(
        newSmartWalletRingTransaction
    );
}

module.exports = {
    run
};
