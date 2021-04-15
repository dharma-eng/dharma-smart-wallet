![Dharma Smart Wallet](https://i.ibb.co/GpdW464/Smart-Wallet-Banner.png)

# Dharma Smart Wallet (dharma-smart-wallet)

> An upgradeable, meta-transaction-enabled smart wallet for earning interest on stablecoins while retaining custody of funds, with an added security backstop provided by Dharma Labs.

[![Smart Wallet Version](https://img.shields.io/endpoint?url=https%3A%2F%2Fdharma-version-api.netlify.com%2F.netlify%2Ffunctions%2Fserver%3Ftarget%3Dsmartwallet)](https://etherscan.io/address/0x4d90ca10f218ebd4509ca0f9816cf20fd9903c35#code)
[![Key Ring Version](https://img.shields.io/endpoint?url=https%3A%2F%2Fdharma-version-api.netlify.com%2F.netlify%2Ffunctions%2Fserver%3Ftarget%3Dkeyring)](https://etherscan.io/address/0x00000000ea0007cdab60e07437e59e9cc41c2e49#code)
[![License](https://img.shields.io/github/license/dharma-eng/dharma-smart-wallet.svg)](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/LICENSE.md)
[![Build Status](https://img.shields.io/travis/dharma-eng/dharma-smart-wallet)](https://travis-ci.org/dharma-eng/dharma-smart-wallet)
[![Coverage](https://img.shields.io/coveralls/github/dharma-eng/dharma-smart-wallet)](https://coveralls.io/github/dharma-eng/dharma-smart-wallet)
[![Audit](https://img.shields.io/badge/audited%20by-Trail%20of%20Bits-red)](https://github.com/trailofbits/publications/blob/master/reviews/dharma-smartwallet.pdf)
[![Community](https://img.shields.io/badge/community-Discord-blueviolet)](https://discordapp.com/invite/qvKTDgR)


## Summary
The **Dharma Smart Wallet** is a 2/2 "multisig" smart contract, controlled by the user's Dharma Key Ring and by Dharma Labs, that:
- allows users to **make deposits and mint [Dharma Dai or Dharma USD Coin](https://github.com/dharma-eng/dharma-token)** by simply sending Dai or USDC to their smart wallet address, even **before a contract has been deployed** to that address
- allows users to **make Dai or USDC withdrawals without paying for gas**, by providing signed messages that are validated against both the user's **Dharma Key Ring contract** and against the **Dharma Key Registry** and relayed by Dharma
- allows users to **recover their account if access is lost or compromised** after a three-day timelock, or to opt out of account recovery entirely, via the **Account Recovery Manager**
- allows for **upgrades to all user smart wallets at once**, without requiring any action on behalf of the user, and with a seven-day timelock prior to each upgrade, using the **Upgrade Beacon Controller Manager**

The **Dharma Key Ring** is an N/M "multisig" smart contract, controlled and configured by the user and set as one of the two signatories on their Dharma Smart Wallet, that:
- provides users with flexible, secure access to their Dharma Smart Wallet so that they **retain custody over their own funds at all times**
- allows users to **take actions on their smart wallet without paying for gas or submitting transactions themselves**, simply by providing signed messages that map to keys that they have set on their key ring
- allows users to **add multiple devices to their Dharma Smart Wallet** using existing devices so that their **keys stay on their own devices**, not in the cloud
- allows for **upgrades to all user key rings at once**, without requiring any action on behalf of the user, and with a seven-day timelock prior to each upgrade, using the **Upgrade Beacon Controller Manager**

These contracts have been audited by Trail of Bits - <a href="https://github.com/trailofbits/publications/blob/master/reviews/dharma-smartwallet.pdf" target="_blank">see their security assessment</a> for more information.


## Table of Contents
- [Contract Deployment Addresses and Verified Source Code](#contract-deployment-addresses-and-verified-source-code)
- [Overview](#overview)
- [Install](#install)
- [Usage](#usage)
- [Example Contracts and Notable Transactions](#example-contracts-and-notable-transactions)
- [Additional Information](#additional-information)


## Contract Deployment Addresses and Verified Source Code
| Core Contracts                                                                                                                                  | Implementations                                                                                                                              | Factories                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a href="https://etherscan.io/address/0x00000000008a10a98969a000d1c0aba90f858d6a#code" target="_blank">DharmaUpgradeBeaconControllerManager</a> | <a href="https://etherscan.io/address/0x00000000009f22da6feb6735614563b9af0339fb#code" target="_blank">AdharmaSmartWalletImplementation</a>  | <a href="https://etherscan.io/address/0xfc00c80b0000007f73004edb00094cad80626d8d#code" target="_blank">DharmaSmartWalletFactoryV1</a>                       |
| <a href="https://etherscan.io/address/0x00000000002226c940b74d674b85e4be05539663#code" target="_blank">DharmaUpgradeBeaconController</a>        |<a href="https://etherscan.io/address/0x0000000010a653849f221a573e00f3a37c8c4082#code" target="_blank">DharmaSmartWalletImplementationV1</a> | [DharmaSmartWalletFactoryV2](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/factories/smart-wallet/DharmaSmartWalletFactoryV2.sol) |
| <a href="https://etherscan.io/address/0x000000000026750c571ce882b17016557279adaa#code" target="_blank">DharmaUpgradeBeacon</a>                  | <a href="https://etherscan.io/address/0x000000000088387c42fe85a60df4dce8e34eea4e#code" target="_blank">DharmaSmartWalletImplementationV2</a> |                                                                                                                                                             |
| <a href="https://etherscan.io/address/0x00000000011df015e8ad00d7b2486a88c2eb8210#code" target="_blank">DharmaKeyRingUpgradeBeaconController</a> | <a href="https://etherscan.io/address/0x0000000000861ff98a332571edd7e6ef73ab2b2b#code" target="_blank">DharmaSmartWalletImplementationV3</a> |                                                                                                                                                             |
| <a href="https://etherscan.io/address/0x0000000000bda2152794ac8c76b2dc86cba57cad#code" target="_blank">DharmaKeyRingUpgradeBeacon</a>           | <a href="https://etherscan.io/address/0x00000000004f319450e1e1ce5e40813e7e1fe0b4#code" target="_blank">DharmaSmartWalletImplementationV4</a> |                                                                                                                                                             |
| <a href="https://etherscan.io/address/0x000000000067503c398f4c9652530dbc4ea95c02#code" target="_blank">DharmaUpgradeBeaconEnvoy</a>             | <a href="https://etherscan.io/address/0x00000000001f2bec34d4a98c839cf711afc842c6#code" target="_blank">DharmaSmartWalletImplementationV5</a> | <a href="https://etherscan.io/address/0x00dd005247b300f700cfdff89c00e2acc94c7b00#code" target="_blank">DharmaKeyRingFactoryV1</a>                           |
| <a href="https://etherscan.io/address/0x000000005d7065eb9716a410070ee62d51092c98#code" target="_blank">DharmaKeyRegistryV1</a>                  | <a href="https://etherscan.io/address/0x0000000000ab32e9e7bd6bd3c37a7e99fb8c2d43#code" target="_blank">DharmaSmartWalletImplementationV6</a> | <a href="https://etherscan.io/address/0x2484000059004afb720000dc738434fa6200f49d#code" target="_blank">DharmaKeyRingFactoryV2</a>                           |
| <a href="https://etherscan.io/address/0x000000000d38df53b45c5733c7b34000de0bdf52#code" target="_blank">DharmaKeyRegistryV2</a>                  | <a href="https://etherscan.io/address/0x00000000000dbef74a0e053433503acae8dc80f5#code" target="_blank">DharmaSmartWalletImplementationV7</a> | [DharmaKeyRingFactoryV3](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/factories/key-ring/DharmaKeyRingFactoryV3.sol)             |
| <a href="https://etherscan.io/address/0x0000000000dfed903ad76996fc07bf89c0127b1e#code" target="_blank">DharmaAccountRecoveryManagerV2</a>       | <a href="https://etherscan.io/address/0x000000000053d1F0F8aA88b9001Bec1B49445B3c#code" target="_blank">AdharmaKeyRingImplementation</a>      |                                                                                                                                                             |
| <a href="https://etherscan.io/address/0x00000000005280b515004b998a944630b6c663f8#code" target="_blank">DharmaEscapeHatchRegistry</a>            | <a href="https://etherscan.io/address/0x00000000ea0007cdab60e07437e59e9cc41c2e49#code" target="_blank">DharmaKeyRingImplementationV1</a>     |                                                                                                                                                             |


## Overview
The Dharma Smart Wallet and Dharma Key Ring are designed with the following assumptions in mind:
- Dharma users will **share custody** of their smart wallet, with Dharma Labs serving as a **security backstop**, in order to better protect their funds from loss and from external adversaries and to simplify the process of earning interest on their stablecoins. The security backstop gives users the liberty to store keys in contexts that would be insufficient taken in isolation, such as in their web browser, while still maintaining non-custodial assurances that, were Dharma's key to ever become compromised, their funds would stay securely in their possession. If users decide they would rather use a fully self-custodial wallet and handle the details themselves, they will migrate away from the smart wallet by transferring their funds to a new address, or wait for upgrades to the smart wallet that unlock options for greater degrees of self-custody.
- Users are content to **let Dharma make upgrades to their smart wallets**, and do not require opt-in upgrades. However, a seven-day timelock on upgrades will let users "opt-out" of unwanted upgrades by giving them a window of time to withdraw their funds from the smart wallet.
- The initial wallet implementation uses a **subsidized <a href="https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84" target="_blank">meta-transaction</a> mechanism**, where Dharma pays for the gas - in other words, there is no need to implement strict gas metering or extra fees in order to pay the transaction relayer back (as a matter of fact, **the user won't have to deal with gas or transaction submissions at all**).
- The wallet validates protected actions using **standard ethereum message signatures** (<a href="https://tools.ietf.org/search/rfc4492" target="_blank">ECDSA</a> + <a href="https://solidity.readthedocs.io/en/v0.5.12/units-and-global-variables.html#mathematical-and-cryptographic-functions" target="_blank">ecrecover</a> + <a href="https://eips.ethereum.org/EIPS/eip-191" target="_blank">EIP-191</a>) with **replay protection** baked in. Additionally, the Dharma Smart Wallet supports <a href="https://eips.ethereum.org/EIPS/eip-1271" target="_blank">EIP-1271</a>, which allows for the Dharma Key Ring to hold multiple signing keys and to eventually support per-key and per-action-type permissions and thresholds.
- The smart wallet is **not set up to do anything too fancy**, like deploy contracts or run arbitrary code - it only needs to be able to make transfers and calls into other contract accounts. In particular, interactions with Dharma Tokens and Compound V2 contracts are mediated via custom, streamlined functions.

### Dharma Smart Wallet
The current implementation of the [Dharma Smart Wallet](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/implementations/smart-wallet/DharmaSmartWalletImplementationV7.sol) works as follows:
- Smart wallet deployments and stablecoin deposits can be initiated by anyone who is willing to pay the gas. Smart wallet addresses are counterfactual based on the initial user signing key, and can be safely deployed by anyone using a [Dharma Smart Wallet Factory](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/factories/smart-wallet/DharmaSmartWalletFactoryV1.sol), as withdrawals will atomically redeem and transfer the relevant stablecoin. Therefore, expect any Dai or USDC sent to the smart wallet address to quickly be converted to dDAI or dUSDC.
- Every withdrawal requires signatures from both the user **and** from Dharma Labs in order to be accepted. The signature component from the user is validated against their Dharma Key Ring, and the signature component from Dharma Labs is validated against the [Dharma Key Registry](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/registries/DharmaKeyRegistryV2.sol). Either party may cancel a given signature at any time prior to execution.
- The [Dharma Account Recovery Manager](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/account-recovery/DharmaAccountRecoveryManagerV2.sol) will only be used in the event that a user has lost access to their Dharma Key Ring or it has been compromised - it will not have any other control over the user's smart wallet. Furthermore, the Account Recovery Manager enforces a three-day timelock before any account can be recovered. A user can also permanently opt out of account recovery through the Account Recovery Manager, though this is not recommended unless the user is highly confident in their own key management.
- Both required signatures must be provided at the same time - this enables actions to be taken in a single transaction, and also lets an account that is not a signatory on the wallet submit the transaction and pay for the gas. One of the signatures can be omitted if the submitting account _is_ a valid signatory.
- To protect against replay attacks, every call to the smart wallet will include a nonce that must match the current nonce on the smart wallet, as well as an optional minimum gas amount, and each time the smart wallet is called with enough gas and valid signatures that nonce will be incremented. This applies even when the action being taken by the smart wallet reverts, in which case an event will be emitted.
- Additional features will be rolled out incrementally, like the ability to assume greater degrees of self-custody over the smart wallet or to designate alternate recovery mechanisms for the smart wallet.

### Dharma Key Ring
The Dharma Smart Wallet is controlled by the [Dharma Key Ring](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/implementations/key-ring/DharmaKeyRingImplementationV1.sol):
- It implements <a href="https://eips.ethereum.org/EIPS/eip-1271" target="_blank">EIP-1271</a>, which allows for the Dharma Key Ring to hold multiple signing keys and to eventually support per-key and per-action-type permissions and thresholds. It is not intended to be used for _submitting_ transactions, but instead as a source for _validating_ signatures passed to it by the Dharma Smart Wallet and other sources.
- It differentiates between two primary key types (note that "dual" keys can be both types at once):
  - Admin keys, which are used to add or remove other keys and to change thresholds or other properties of the key ring
  - Standard keys, which are used to verify most external signatures that it receives based on the data provided (notably, attempts to set a new user signing key for the smart wallet must provide signatures from Admin keys)
- Key Ring addresses are _also_ counterfactual, based on their initial signing key, and are only deployed once they are needed to make a withdrawal or to add an additional key. They can be deployed by anyone, using a [Dharma Key Ring Factory](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/factories/key-ring/DharmaKeyRingFactoryV2.sol) - furthermore, anyone can deploy their own Dharma Key Ring for use in other applications.
- All required signatures must be provided at the same time - this enables actions to be taken in a single transaction. Provided signatures must be ordered based on the signing address, from lowest to highest, in order to be considered valid.
- To protect against replay attacks, every call to the key ring to execute an Admin action will include a nonce that must match the current nonce on the key ring, and each time the smart wallet is called with enough gas and valid signatures that nonce will be incremented. Note that gas is not an input to signatures on the key ring, since there are no external calls made by the key ring during execution, so calls with insufficient gas can be replayed until they succeed or until another admin action is taken that increments the nonce.

### Upgradeability
Both the Dharma Smart Wallet and the Dharma Key Ring are upgradeable:
- Like most upgradeable contracts, they utilize a proxy mechanism, where each instance performs a `DELEGATECALL` to an updateable "implementation" contract when called. However, in contrast to most upgradeable proxy contracts, which store an implementation address and an admin address that can change that implementation, smart wallet and key ring instances have no proxy-specific state, and instead retrieve their current implementation from a dedicated [Upgrade Beacon](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/upgradeability/smart-wallet/DharmaUpgradeBeacon.sol) contract.
- Each upgrade beacon is a minimally-simple contract that has a hard-coded controller and a single storage slot that represents the current implementation. Only the controller may update this storage slot, and the upgrade beacon will return the address contained at that storage slot for any other caller.
- Each [Upgrade Beacon Controller](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/upgradeability/DharmaUpgradeBeaconController.sol) is an ownable contract that emits events related to each upgrade, enforces some conditions as to what upgrades are allowable, and enables the current owner of the controller to transfer ownership to a new owner.
- The [Dharma Upgrade Beacon Controller Manager](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/upgradeability/DharmaUpgradeBeaconControllerManager.sol) owns each Upgrade Beacon Controller, and can also support other, future upgrade beacon controllers. It enforces configurable time-locks for each protected function - these include functions for making upgrades, for transferring ownership of controllers, and for modifying the default timelock intervals and other parameters.
- While all new upgrades have a seven-day timelock, there are two notable exceptions:
  - If a bug is introduced in a new upgrade, the Dharma Upgrade Beacon Controller Manager can immediately "downgrade" and roll back to a prior implementation (with the exception of implementations that have been explicitly blocked due to discovered vulnerabilities or other undesired features).
  - If a critical vulnerability is discovered, or if 90 days go by without a "heartbeat" being triggered on the Dharma Upgrade Beacon Controller Manager, an "[Adharma Contingency](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/implementations/smart-wallet/AdharmaSmartWalletImplementation.sol)" upgrade can be executed on both the smart wallet and the key ring simultaneously. These implementations strip out all but the most basic functionality and give the user direct, singular control over their smart wallet and key ring contracts - basically, it ensures that users can recover their funds, no matter what. A new upgrade can be performed by the Dharma Upgrade Beacon Controller Manager after 48 hours in the contingency state.
- Prior to each upgrade, a prospective implementation needs to first be deployed and registered as a potential upgrade candidate. This gives the community a chance to review the implementation, and to raise any potential concerns or opt-out of the upgrade by withdrawing their funds.
- The Dharma Escape Hatch is an opt-in feature that enables a smart wallet to call into the [Dharma Escape Hatch Registry](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/registries/DharmaEscapeHatchRegistry.sol) and designate an "escape hatch" account that can sweep the entire balance from the wallet by [calling into the `escape()` function](https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/implementations/smart-wallet/DharmaSmartWalletImplementationV7.sol#L767) directly. This gives users with an existing, secure key the option to exit the system at any point without needing to first secure Dharma's approval.


## Install
To install locally, you'll need Node.js 10 through 12 and Yarn *(or npm)*. To get everything set up:
```sh
$ git clone https://github.com/dharma-eng/dharma-smart-wallet.git
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
$ yarn build
$ yarn coverage
```

There is also an option to run tests against a fork of mainnet - be warned that these tests take a _very long_ time.
```sh
$ yarn forkStart
$ yarn test
$ yarn stop
```

Finally, there is an option to run code coverage against a mainnet fork (same caveat as above):
```sh
$ yarn build
$ yarn forkCoverage
```


## Example Contracts and Notable Transactions
Example Contracts:
- <a href="https://etherscan.io/address/0x1eb2bc53fc25a917cca3f031913a3522933a5b92#code" target="_blank">Example UpgradeBeaconProxyV1 smart wallet instance</a>
- <a href="https://etherscan.io/address/0x0c2b7c1b73229483464d3fc4db4d4c2130374e4f#code" target="_blank">Example KeyRingUpgradeBeaconProxyV1 key ring instance</a>

Notable Transactions:
- <a href="https://etherscan.io/tx/0xb11b065a67bff15e70863e843c43ca231f7cb53cce7d9a5a85e1e8e3e7b14d32#eventlog" target="_blank">V1 implementation set on Smart Wallet Upgrade Beacon</a>
- <a href="https://etherscan.io/tx/0xcac4120cacd385f9ee4a29f9c6e8fd8fb39977eed0bce4c9f2150741dc95e901" target="_blank">First Dharma Smart Wallet deploy + deposit through Dharma Smart Wallet Factory</a>
- First <a href="https://etherscan.io/tx/0x484ab51c86ba6794af4460aae7b17f56b63ac0b4223f38bcf4d7a87029fff378" target="_blank">Dai</a> and <a href="https://etherscan.io/tx/0xb13acf0ad97efef0138e0f1ff0e7f9e682a4d8e7eb7e33b4e3a1ecaa55b9dca9" target="_blank">USDC</a> withdrawals
- <a href="https://etherscan.io/tx/0xc12cf1c3ca9ef8503cdd5536d8d42d29f8f833d24fb3dcdbea00b18c0b2aa52f#eventlog" target="_blank">V2 implementation set on Smart Wallet Upgrade Beacon</a>
- <a href="https://etherscan.io/tx/0xcdf785050d7cd41a30eee0666aca312fd6254189d981a55fa3a18cab2fb3f624#eventlog" target="_blank">V0 implementation set on Key Ring Upgrade Beacon</a>
- <a href="https://etherscan.io/tx/0xbe6a44535505b0409820fe4e2c1cec4adc6a9abde8ea0287960c899e5b149105#eventlog" target="_blank">V1 implementation set on Key Ring Upgrade Beacon</a>
- <a href="https://etherscan.io/tx/0x7d7a5595d1e005ddf5ec26e495be3a134f0f308985319d406c0f3097dadce2ba#eventlog" target="_blank">V3 implementation set on Smart Wallet Upgrade Beacon</a>
- <a href="https://etherscan.io/tx/0xd18047f130ceea515897eab2442fce1244f7154aeed76cb4983ab6fa23591cbf#eventlog" target="_blank">Dharma Account Recovery Manager ownership transferred to multisig</a>
- <a href="https://etherscan.io/tx/0x6c55fee5a433fb883a7963537ae6c3d3ff252e85c835c214f06ae7284cac68ff#eventlog" target="_blank">Dharma Key Registry V2 ownership transferred to multisig</a>
- <a href="https://etherscan.io/tx/0x2b910669067659870ad4ab623e77527ee50c67ffe1200dffe8b2e768c9053f96#eventlog" target="_blank">V4 implementation set on Smart Wallet Upgrade Beacon</a>
- <a href="https://etherscan.io/tx/0xdb36f04570088e41633e41e0102a15f4172d9c72155720b921a9a7642288219c#eventlog" target="_blank">Key Ring Upgrade Beacon Controller ownership transferred to Upgrade Beacon Controller Manager</a>
- <a href="https://etherscan.io/tx/0x84493c801433d32831e45aa114fec5027dfd9519a3b6e66950e66ae3f6d248c1#eventlog" target="_blank">Smart Wallet Upgrade Beacon Controller ownership transferred to Upgrade Beacon Controller Manager</a>
- <a href="https://etherscan.io/tx/0x8a9b88bfd8201c22daee8be52d93d29b0985293a31b5a9b737c780db3a00f98b#eventlog" target="_blank">Upgrade Beacon Controller Manager ownership transferred to multisig</a>
- <a href="https://etherscan.io/tx/0x65ce24a5e41bb6d25f3eade681bc22614174c1a4c4b7ff8a89c8f54c81a1f969#eventlog" target="_blank">Dharma Account Recovery Manager V2 ownership transferred to multisig</a>
- <a href="https://etherscan.io/tx/0xa82b6d55e552491678794e5a53032715914e131399a2dbd5634e7cbdc6ec88e4#eventlog" target="_blank">V5 implementation set on Smart Wallet Upgrade Beacon</a>
- <a href="https://etherscan.io/tx/0x09a68a17b30273b5e51d1313795361010f70952fa12d86bb57a689140af2cec4#eventlog" target="_blank">V6 implementation set on Smart Wallet Upgrade Beacon</a>


## Additional Information
Have any questions or feedback? Join the conversation in the <a href="https://discordapp.com/invite/qvKTDgR" target="_blank">Dharma_HQ Discord server</a>. Also, see the "<a href="https://blog.dharma.io/why-smart-wallets-should-catch-your-interest-c85e4401b89a" target="_blank">Why Smart Wallets Should Catch Your Interest</a>" article for a more informal discussion around some of the motivations, features, and design decisions of the Dharma Smart Wallet.
