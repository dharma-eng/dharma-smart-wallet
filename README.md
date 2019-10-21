![Dharma Smart Wallet](https://i.ibb.co/GpdW464/Smart-Wallet-Banner.png)

# Dharma Smart Wallet (dharma-smart-wallet)

> An upgradeable, joint-custody, meta-transaction-enabled smart wallet for Dharma users.

![GitHub](https://img.shields.io/github/license/dharmaprotocol/dharma-smart-wallet.svg)
![CircleCI](https://img.shields.io/circleci/build/github/dharmaprotocol/dharma-smart-wallet/master?token=cfe6c9bcab23789a52477ff865f9fe2d66e87ce7)

## Summary
The **Dharma Smart Wallet** is a 2/2 "multisig" smart contract that:
- allows users to **make deposits and mint cDai or cUSDC from Compound** by simply sending Dai or USDC to their smart wallet address, even **before a contract has been deployed** to that address
- allows users to **make withdrawals without paying for gas**, by providing signed messages that are validated against their **Dharma KeyRing contract** and by the **Dharma Key Registry**
- allows users to **recover their account if access is lost or compromised** after a seven-day timelock, or to opt out of account recovery entirely, via the **Account Recovery Manager**
- allows for **upgrades to all user smart wallets at once**, without requiring any action on behalf of the user, and with a seven-day timelock before upgrading to a new implementation, using the **Upgrade Beacon Controller Manager**

The **Dharma Key Ring** is an N/M "multisig" smart contract that:
- is **owned and controlled entirely by the user** and controls access to their Dharma Smart Wallet so that they **retain custody over their own funds at all times**
- allows users to **take actions on their smart wallet without paying for gas**, simply by providing signed messages that map to keys that they have set on their key ring
- allows users to **add multiple devices to their Dharma Smart Wallet** using existing devices so that their **keys stay on their own devices**, not in the cloud
- allows for **upgrades to all user key rings at once**, without requiring any action on behalf of the user, and with a seven-day timelock before upgrading to a new implementation, using the **Upgrade Beacon Controller Manager**

## Table of Contents
- [Contract Deployment Addresses & Verified Source Code](#contract-deployment-addresses-&-verified-source-code)
- [Overview](#overview)
- [Install](#install)
- [Usage](#usage)
- [Example Contracts and Notable Transactions](#example-contracts-and-notable-transactions)

## Contract Deployment Addresses & Verified Source Code
| Core Contracts                                                                                                                                  | Implementations                                                                                                                              | Factories                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| <a href="https://etherscan.io/address/0x00000000005330029d3de861454979d0dd8c89dc#code" target="_blank">DharmaUpgradeBeaconControllerManager</a> |                                                             Dharma Smart Wallet                                                              |                                                         Dharma Smart Wallet                                                           |
| <a href="https://etherscan.io/address/0x00000000002226c940b74d674b85e4be05539663#code" target="_blank">DharmaUpgradeBeaconController</a>        | <a href="https://etherscan.io/address/0x0000000053d300f11703dcdd1e90921db83f0048#code" target="_blank">AdharmaSmartWalletImplementation</a>  | <a href="https://etherscan.io/address/0xfc00c80b0000007f73004edb00094cad80626d8d#code" target="_blank">DharmaSmartWalletFactoryV1</a> |
| <a href="https://etherscan.io/address/0x000000000026750c571ce882b17016557279adaa#code" target="_blank">DharmaUpgradeBeacon</a>                  | <a href="https://etherscan.io/address/0x0000000010a653849f221a573e00f3a37c8c4082#code" target="_blank">DharmaSmartWalletImplementationV1</a> | DharmaSmartWalletFactoryV2                                                                                                            |
| <a href="https://etherscan.io/address/0x00000000011df015e8ad00d7b2486a88c2eb8210#code" target="_blank">DharmaKeyRingUpgradeBeaconController</a> | <a href="https://etherscan.io/address/0x000000000088387c42fe85a60df4dce8e34eea4e#code" target="_blank">DharmaSmartWalletImplementationV2</a> |                                                                                                                                       |
| <a href="https://etherscan.io/address/0x0000000000bda2152794ac8c76b2dc86cba57cad#code" target="_blank">DharmaKeyRingUpgradeBeacon</a>           | DharmaSmartWalletImplementationV3                                                                                                            |                                                           Dharma Key Ring                                                             |
| <a href="https://etherscan.io/address/0x000000000067503c398f4c9652530dbc4ea95c02#code" target="_blank">DharmaUpgradeBeaconEnvoy</a>             |                                                                                                                                              | <a href="https://etherscan.io/address/0x00dd005247b300f700cfdff89c00e2acc94c7b00#code" target="_blank">DharmaKeyRingFactoryV1</a>     |
| <a href="https://etherscan.io/address/0x000000005d7065eb9716a410070ee62d51092c98#code" target="_blank">DharmaKeyRegistryV1</a>                  |                                                               Dharma Key Ring                                                                | <a href="https://etherscan.io/address/0x2484000059004afb720000dc738434fa6200f49d#code" target="_blank">DharmaKeyRingFactoryV2</a>     |
| <a href="https://etherscan.io/address/0x00000000ea4044b4b60091836a6d47554f43a100#code" target="_blank">DharmaKeyRegistryV2</a>                  | <a href="https://etherscan.io/address/0x00000000480003d5ee4f51134ce73cc9ac00f693#code" target="_blank">AdharmaKeyRingImplementation</a>      | DharmaKeyRingFactoryV3                                                                                                                |
| <a href="https://etherscan.io/address/0x00000000003709edea9182789f1153e59cfe849e#code" target="_blank">DharmaAccountRecoveryManager</a>         | <a href="https://etherscan.io/address/0x00000000ea0007cdab60e07437e59e9cc41c2e49#code" target="_blank">DharmaKeyRingImplementationV1</a>     |                                                                                                                                       |

## Overview
The Dharma Smart Wallet and Dharma Key Ring are designed with the following assumptions in mind:
- Dharma users are content to **share joint custody** of the smart wallet with Dharma in order to better protect their funds from loss and from external adversaries and to simplify the process of earning interest on their stablecoins. If users decide they would rather use a fully non-custodial wallet and handle the details themselves, they will migrate away from the smart wallet by transferring their funds to a new address, or wait for upgrades to the smart wallet that unlock options for greater levels of custody.
- Users are content to **let Dharma make upgrades to their smart wallets**, and do not require opt-in upgrades. That being said, there is a seven-day timelock placed on upgrades that gives users a window of time to "opt-out" by transferring their funds from the smart wallet.
- The initial wallet implementation will use a **subsidized [meta-transaction](https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84) mechanism**, where Dharma pays for the gas - in other words, there is no need to implement strict gas metering or extra fees in order to pay the transaction relayer back (as a matter of fact, **the user won't have to deal with gas or transaction submissions at all**).
- All signatures will use **standard ethereum message signatures** ([ECDSA](https://tools.ietf.org/search/rfc4492) + [ecrecover](https://solidity.readthedocs.io/en/v0.5.10/units-and-global-variables.html#mathematical-and-cryptographic-functions) + [EIP-191](http://eips.ethereum.org/EIPS/eip-191)) with **replay protection** baked in. Additionally, the Dharma Smart Wallet supports [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271), which allows for the Dharma Key Ring to hold multiple signing keys and to eventually support per-key and per-action-type permissions and thresholds.
- The smart wallet will **not be set up to do anything too fancy**, like deploy contracts or run arbitrary code - it will just make transfers and calls into other accounts. 

The current implementation of the Dharma Smart Wallet works as follows:
- Smart wallet deployments and stablecoin deposits can be initiated by anyone who is willing to pay the gas. Smart Wallet addresses are counterfactual based on the initial user signing key, so can be safely deployed by anyone using a Dharma Smart Wallet Factory, and withdrawals atomically redeem and transfer the relevant stablecoin Therefore, expect any Dai or USDC that are sent to the smart wallet address to quickly be converted to cDAI or cUSDC.
- Every withdrawal requires both a signature from the user **and** a signature from Dharma's hot key in order to be accepted. Either party may cancel a given signature at any time prior to execution.
- The Dharma Account Recovery Manager will only be used in the event that a user has lost access to their Dharma Key Ring or it has been compromised and they need to set a new one, and will not have any other control over the user's smart wallet. A user can also permanently opt out of account recovery, though this is not recommended unless the user is highly confident in their own key management.
- Both required signatures must be provided at the same time - this enables actions to be taken in a single transaction, and also lets an account that is not a signatory on the wallet submit the transaction and pay for the gas. We can safely skip one of the signature verifications if the submitting account *is* a signatory.
- To protect against replay attacks, every call to the smart wallet will include a nonce that must match the current nonce on the smart wallet, as well as an optional minimum gas amount, and each time the smart wallet is called with enough gas and valid signatures that nonce will be incremented. This applies even when the action being taken by the smart wallet reverts, in which case an event will be emitted.
- Additional features will be rolled out incrementally, like the ability to assume greater custody over the smart wallet or to designate alternate recovery mechanisms for the smart wallet.

The Dharma Smart Wallet is controlled by the Dharma Key Ring:
- It implements [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271), which allows for the Dharma Key Ring to hold multiple signing keys and to eventually support per-key and per-action-type permissions and thresholds. It is not intended to be used for _submitting_ transactions, but instead as a source for _validating_ signatures passed to it by the Dharma Smart Wallet and other sources.
- It differentiates between two primary key types (note that "dual" keys can be both types at once):
  - Admin keys, which are used to add or remove other keys and to change thresholds or other properties of the key ring
  - Standard keys, which are used to verify most external signatures that it receives based on the data provided (notably, attempts to set a new user signing key for the smart wallet must provide signatures from Admin keys)
- All required signatures must be provided at the same time - this enables actions to be taken in a single transaction.
- To protect against replay attacks, every call to the key ring to execute an Admin action will include a nonce that must match the current nonce on the key ring, and each time the smart wallet is called with enough gas and valid signatures that nonce will be incremented. Note that gas is not an input to signatures on the key ring, since there are no external calls made by the key ring during execution, so calls with insufficient gas can be replayed until they succeed or until another admin action is taken that increments the nonce.

Both the Dharma Smart Wallet and the Dharma Key Ring are upgradeable:
- Like most upgradeable contracts, they utilize a proxy mechanism, where each instance performs a `DELEGATECALL` to an updateable "implementation" contract when called. However, in contrast to most upgradeable proxy contracts, which store an implementation address and an admin address that can change that implementation, smart wallet and key ring instances have no proxy-specific state, and instead retrieve their current implementation from a dedicated "upgrade beacon" contract.
- Each upgrade beacon is a minimally-simple contract that has a hard-coded controller and a single storage slot that represents the current implementation. Only the controller may update this storage slot, and the upgrade beacon will return the address contained at that storage slot for any other caller.
- Each controller is an ownable contract that emits events related to each upgrade, enforces some conditions as to what upgrades are allowable, and enables the current owner of the controller to transfer ownership to a new owner. Once the contract suite is stable, ownership of each controller will be transferred to the Dharma Upgrade Beacon Controller Manager.
- The Dharma Upgrade Beacon Controller Manager will own each Upgrade Beacon Controller, and can also support other, future upgrade beacon controllers. It enforces configurable time-locks for each protected function, including upgrades, changes in controller ownership, and modifications to the timelock parameters themselves.
- While "new" upgrades require a seven-day timelock, there are two notable exceptions:
  - If a bug is introduced in a new upgrade, the Dharma Upgrade Beacon Controller Manager can immediately "roll back" to the last implementation.
  - If a critical vulnerability is discovered, or if 90 days go by without a "heartbeat" being triggered on the Dharma Upgrade Beacon Controller Manager, an "Adharma Contingency" upgrade can be executed on the smart wallet or the key ring. These implementations strip out all but the most basic functionality and give the user direct, singular control over their smart wallet and key ring contracts - basically, it ensures that users can recover their funds, no matter what. A new upgrade can be performed by the Dharma Upgrade Beacon Controller Manager after 48 hours in the contingency state.
- Prior to each upgrade, a prospective implementation needs to first be deployed and registered as a potential candidate. This gives the community a chance to review the implementation, and to raise any potential concerns or opt-out of the upgrade by withdrawing their funds.

## Install
To install locally, you'll need Node.js 10+ and Yarn *(or npm)*. To get everything set up:
```sh
$ git clone https://github.com/dharmaprotocol/dharma-smart-wallet.git
$ cd dharma-smart-wallet
$ yarn install
$ yarn build
```

## Usage
To run tests locally, start the testRPC, trigger the tests, run the linter, and tear down the testRPC *(you can do all of this at once via* `yarn all` *if you prefer)*:
```sh
$ yarn start
$ yarn test
$ yarn lint
$ yarn stop
```

You can also run code coverage if you like:
```sh
$ yarn coverage
```

There is also an option to run tests against a fork of mainnet - be warned that these tests take a long time.
```sh
$ yarn forkStart
$ yarn test
$ yarn stop
```

Finally, there is an option to run code coverage against a mainnet fork (same caveat as above):
```sh
$ yarn forkCoverage
```

## Example Contracts and Notable Transactions:

##### Example UpgradeBeaconProxyV1 instance
https://etherscan.io/address/0x1eb2bc53fc25a917cca3f031913a3522933a5b92#code

##### Example KeyRingUpgradeBeaconProxyV1
https://etherscan.io/address/0x0c2b7c1b73229483464d3fc4db4d4c2130374e4f#code

##### V1 Implementation Set on Smart Wallet Upgrade Beacon
https://etherscan.io/tx/0xb11b065a67bff15e70863e843c43ca231f7cb53cce7d9a5a85e1e8e3e7b14d32#eventlog

##### First Dharma Smart Wallet deploy through Factory (with deposits)
https://etherscan.io/tx/0xcac4120cacd385f9ee4a29f9c6e8fd8fb39977eed0bce4c9f2150741dc95e901

##### First Dharma Smart Wallet withdrawals
https://etherscan.io/tx/0x484ab51c86ba6794af4460aae7b17f56b63ac0b4223f38bcf4d7a87029fff378
https://etherscan.io/tx/0xb13acf0ad97efef0138e0f1ff0e7f9e682a4d8e7eb7e33b4e3a1ecaa55b9dca9

##### Dharma Key Registry V1 seting a global key
https://etherscan.io/tx/0xbbe90a37df4488d725b602a4c214856cd0d5c414fe52e0010ece6060210966e1

##### V2 Implementation Set on Smart Wallet Upgrade Beacon
https://etherscan.io/tx/0xc12cf1c3ca9ef8503cdd5536d8d42d29f8f833d24fb3dcdbea00b18c0b2aa52f#eventlog

##### V0 Implementation Set on Key Ring Upgrade Beacon
https://etherscan.io/tx/0xcdf785050d7cd41a30eee0666aca312fd6254189d981a55fa3a18cab2fb3f624#eventlog

##### V1 Implementation Set on Key Ring Upgrade Beacon
https://etherscan.io/tx/0xbe6a44535505b0409820fe4e2c1cec4adc6a9abde8ea0287960c899e5b149105#eventlog