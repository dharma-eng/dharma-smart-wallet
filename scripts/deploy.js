const ethers = require("hardhat").ethers;

async function getSigner(index = 0) {
    const signers = await ethers.getSigners();
    return signers[index];
}

async function signerCallbackDefault(transaction) {
    const signer = await getSigner();
    return signer.sendTransaction(transaction);
}

async function deploy(name, args = [], signerCallBack = signerCallbackDefault) {
    let contract = await ethers.getContractFactory(name);

    const deployTransaction = await contract.getDeployTransaction(...args);

    const receipt = await signerCallBack(deployTransaction);

    const contractAddress = receipt.creates || receipt.contractAddres;

    return new ethers.Contract(
        contractAddress,
        contract.interface,
        ethers.provider
    );
}

async function run(signerCallback = signerCallbackDefault) {
    // TODO: use env file when deploying contracts to production environment.
    const signer = await getSigner();

    // deploy key-registry
    const dharmaKeyRegistry = await deploy("DharmaKeyRegistryV2");

    // deploy envoy
    const dharmaUpgradeBeaconEnvoy = await deploy("DharmaUpgradeBeaconEnvoy");

    // deploy upgrade-beacon-controllers
    const dharmaSmartWalletUpgradeBeaconController = await deploy(
        "DharmaUpgradeBeaconController",
        [dharmaUpgradeBeaconEnvoy.address]
    );

    const dharmaKeyRingBeaconController = await deploy(
        "DharmaUpgradeBeaconController",
        [dharmaUpgradeBeaconEnvoy.address]
    );

    // deploy upgrade-beacon: smart-wallet, key-ring
    const dharmaSmartWalletUpgradeBeacon = await deploy("DharmaUpgradeBeacon", [
        dharmaSmartWalletUpgradeBeaconController.address
    ]);

    const dharmaKeyRingBeacon = await deploy("DharmaUpgradeBeacon", [
        dharmaKeyRingBeaconController.address
    ]);

    // deploy factory: smart-wallet (v3), key-ring (v4)
    const dharmaSmartWalletFactory = await deploy(
        "DharmaSmartWalletFactoryV3",
        [dharmaSmartWalletUpgradeBeacon.address]
    );

    const dharmaKeyRingFactory = await deploy("DharmaKeyRingFactoryV4", [
        dharmaKeyRingBeacon.address
    ]);

    // deploy implementation: smart-wallet (v16), key-ring (v1)
    const dharmaSmartWalletImplementation = await deploy(
        "DharmaSmartWalletImplementationV16",
        [dharmaKeyRegistry.address]
    );

    const dharmaKeyRingImplementation = await deploy(
        "DharmaKeyRingImplementationV1"
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

run();
