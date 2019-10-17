![Dharma Smart Wallet](https://i.ibb.co/6sV9hbb/Smart-Wallet-Banner.png)

# Dharma Smart Wallet (dharma-smart-wallet)

> An upgradeable, joint-custody, meta-transaction-enabled smart wallet for Dharma users.

![GitHub](https://img.shields.io/github/license/dharmaprotocol/dharma-smart-wallet.svg)
![CircleCI](https://img.shields.io/circleci/build/github/dharmaprotocol/dharma-smart-wallet/master?token=cfe6c9bcab23789a52477ff865f9fe2d66e87ce7)

### Currently Deployed Contracts (production) and example txs:
##### DharmaUpgradeBeaconController
https://etherscan.io/address/0x00000000002226c940b74d674b85e4be05539663#code

##### DharmaUpgradeBeacon
https://etherscan.io/address/0x000000000026750c571ce882b17016557279adaa#code

##### DharmaKeyRingUpgradeBeaconController
https://etherscan.io/address/0x00000000011df015e8ad00d7b2486a88c2eb8210#code

##### DharmaKeyRingUpgradeBeacon
https://etherscan.io/address/0x0000000000bda2152794ac8c76b2dc86cba57cad#code

##### DharmaUpgradeBeaconEnvoy
https://etherscan.io/address/0x000000000067503c398f4c9652530dbc4ea95c02#code

##### DharmaAccountRecoveryManager
https://etherscan.io/address/0x00000000008ac532ee543e89cfc462827afb9369#code

##### DharmaKeyRegistryV1
https://etherscan.io/address/0x000000005d7065eb9716a410070ee62d51092c98#code

##### DharmaKeyRegistryV2
https://etherscan.io/address/0x00000000f534674c252dfe4b9834a4d62ef40015#code

##### DharmaSmartWalletImplementationV1
https://etherscan.io/address/0x0000000010a653849f221a573e00f3a37c8c4082#code

##### DharmaSmartWalletImplementationV2
https://etherscan.io/address/0x000000000088387c42fe85a60df4dce8e34eea4e#code

##### DharmaSmartWalletFactoryV1
https://etherscan.io/address/0xfc00c80b0000007f73004edb00094cad80626d8d#code

##### Example UpgradeBeaconProxyV1 instance
https://etherscan.io/address/0x1eb2bc53fc25a917cca3f031913a3522933a5b92#code

##### DharmaKeyRingImplementationV0
https://etherscan.io/address/0x0000000000f732b182f375af6baa1770d83077ed#code

##### DharmaKeyRingImplementationV1
https://etherscan.io/address/0x00000000ea0007cdab60e07437e59e9cc41c2e49#code

##### DharmaKeyRingFactoryV1
https://etherscan.io/address/0x00dd005247b300f700cfdff89c00e2acc94c7b00#code

##### Example KeyRingUpgradeBeaconProxyV1
https://etherscan.io/address/0x0c2b7c1b73229483464d3fc4db4d4c2130374e4f#code

##### AdharmaSmartWalletImplementation
https://etherscan.io/address/0x0000000053d300f11703dcdd1e90921db83f0048#code

##### AdharmaKeyRingImplementation
https://etherscan.io/address/0x00000000480003d5ee4f51134ce73cc9ac00f693#code

##### DharmaUpgradeBeaconControllerManager
https://etherscan.io/address/0x000000000075a05df21466285a7ff8c9df5a11ed#code

##### Implementation Set on Upgrade Beacon
https://etherscan.io/tx/0xb11b065a67bff15e70863e843c43ca231f7cb53cce7d9a5a85e1e8e3e7b14d32#eventlog

##### First Dharma Smart Wallet deploy through Factory (with deposits)
https://etherscan.io/tx/0xcac4120cacd385f9ee4a29f9c6e8fd8fb39977eed0bce4c9f2150741dc95e901

##### First Dharma Smart Wallet withdrawals
https://etherscan.io/tx/0x484ab51c86ba6794af4460aae7b17f56b63ac0b4223f38bcf4d7a87029fff378
https://etherscan.io/tx/0xb13acf0ad97efef0138e0f1ff0e7f9e682a4d8e7eb7e33b4e3a1ecaa55b9dca9

##### Dharma Key Registry V1 seting a global key
https://etherscan.io/tx/0xbbe90a37df4488d725b602a4c214856cd0d5c414fe52e0010ece6060210966e1

##### Upgrade to DharmaSmartWalletImplementationV2
https://etherscan.io/tx/0xc12cf1c3ca9ef8503cdd5536d8d42d29f8f833d24fb3dcdbea00b18c0b2aa52f#eventlog

##### V0 Implementation Set on keyring Upgrade Beacon
https://etherscan.io/tx/0xcdf785050d7cd41a30eee0666aca312fd6254189d981a55fa3a18cab2fb3f624#eventlog

##### V1 Implementation Set on keyring Upgrade Beacon
https://etherscan.io/tx/0xbe6a44535505b0409820fe4e2c1cec4adc6a9abde8ea0287960c899e5b149105#eventlog

# Summary
Explore a minimal implementation of a smart wallet that:

- allows users to **submit transactions without paying for gas**, using their **Dharma Key and a "hot" key** controlled by Dharma
- allows users to **recover their account if their Dharma Key is lost or compromised**, using an **Account Recovery multisig** controlled by Dharma
- allows **funds to be sent** to the smart wallet address **before a contract has been deployed** to that address
- allows for **upgrades to all user smart wallets at once**, without requiring any action on behalf of the user, using an **Upgrade multisig** controlled by Dharma

We make a few simplifying assumptions:

- Users are content to **share joint custody** of the smart wallet with Dharma, and if they want to move to a fully non-custodial wallet they will migrate away from the smart wallet by transferring their funds to a new address, or wait for upgrades to the smart wallet that unlock options for greater levels of custody.
- Users are content to **let Dharma make upgrades to their smart wallets**, and do not require opt-in upgrades. However, there will be a time-lock placed on upgrades that gives users a window of time to "opt-out" by transferring their funds from the smart wallet.
- The initial wallet implementation will use a **subsidized [meta-transaction](https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84) mechanism**, where Dharma or another party intends to pay for the gas - in other words, we won't worry about paying the transaction relayer back (as a matter of fact, **we won't make the user deal with gas at all**).
- The Dharma Key may be derived from a combination of various sources of entropy (pin, recovery code, etc.) but from the perspective of the smart wallet the derivation method is irrelevant - it **just cares about the account of the signing key**.
- All signatures will use **standard ethereum message signatures** ([ECDSA](https://tools.ietf.org/search/rfc4492) + [ecrecover](https://solidity.readthedocs.io/en/v0.5.10/units-and-global-variables.html#mathematical-and-cryptographic-functions) + [EIP-191](http://eips.ethereum.org/EIPS/eip-191)) with **replay protection** baked in.
- The smart wallet will **not be set up to do anything too fancy**, like deploy contracts or run arbitrary code - it will just make transfers and calls into other accounts.

The initial implementation for Dharma smart wallets will work as follows:

- Every transaction will require both a signature from the user **and** a signature from Dharma's hot key in order to be accepted.
- The Dharma account recovery multisig will only be used in the event that a user has lost their Dharma Key or it has been compromised and they need to set a new Dharma Key, and will not have any other control over the user's smart wallet.
- Both required signatures will be provided at the same time - this enables actions to be taken in a single transaction, and also lets an account that is not a signatory on the wallet submit the transaction and pay for the gas. We can safely skip one of the signature verifications if the submitting account *is* a signatory.
- Every call to the smart wallet will include a nonce that must match the current nonce on the smart wallet, and each time the smart wallet is successfully called that nonce will be incremented.
- Additional features will be rolled out incrementally, like the ability to assume greater custody over the smart wallet or to designate alternate recovery mechanisms for the smart wallet.

## Table of Contents
- [Architectural Overview](#architectural-overview)
- [Install](#install)
- [Usage](#usage)
- [Technical Details](#technical-details)

## Architectural Overview
##### 1) Dharma Upgrade Multisig
- controlled by a group of accounts, where a supermajority needs to approve a transaction before it is triggered
- owns the Dharma Upgrade Beacon Manager and is the only account that can access it's protected methods
- all smart wallet contract upgrades will originate from this contract
- currently implemented using [Gnosis Safe](https://github.com/gnosis/safe-contracts/blob/development/contracts/GnosisSafe.sol)

##### 2) Dharma Upgrade Beacon Controller Manager
- owned by the Dharma Upgrade Multisig
- owns the Dharma Upgrade Beacon Controller, and can also support other, future upgrade beacon controllers
- enforces configurable time-locks for each protected function, including upgrades and changes in controller ownership
- uses a simple, custom timelock implementation with no upgradeability (to upgrade, transfer ownership of the upgrade beacon controller to a new owner)

##### 3) Dharma Upgrade Beacon Controller
- initially owned by the Dharma Upgrade Beacon Controller Manager
- the only account able to modify the implementation on the Smart Wallet Upgrade Beacon
- uses a minimally simple implementation of an ownable contract
- upgrades to upgradeability are accomplished by transferring ownership of this contract

##### 4) Dharma Smart Wallet Upgrade Beacon
- "owned" by the Dharma Upgrade Beacon Controller
- maximally-concise contract that only does two things:
  - if the owner is the caller, take a supplied implementation address and set it in storage.
  - if any other account is the caller, read the implementation address from storage and return it.
- each user's smart wallet will refer to this contract in order to retrieve the current implementation
- any time this contract's stored implementation is updated, the update will immediately go out to all user smart wallets
- alternative implementation in raw EVM assembly - no Solidity compiler bugs and a vanishingly small attack surface.

##### 5) Dharma Smart Wallet Factory V1
- public, unowned, non-upgradeable contract - can be called by anyone, and if there's an issue a new factory can easily be deployed
- deploys and sets up new Dharma Smart Wallets as "minimal upgradable proxies" that get their implementation from the Dharma Smart Wallet Beacon
- each smart wallet address can be known ahead of time based on the Dharma Key, so once users have a Dharma Key they can send funds to that address before the smart wallet has even been deployed
- alternative implemention in a "bare-metal" fashion so that contract deployments are as inexpensive as possible while still having an easy-to-use interface and emitting appropriate events

##### 6) Smart Wallet Implementation Contracts
- contracts that contain all the logic used by each smart contract instance
- a new implementation contract is deployed every time an upgrade is going to take place
- the multisig then instructs the upgrade manager contract to set the new implementation on an "upgrade beacon" contract (explained in the upgradeability RFC)
- there are an important set of rules and limitations on how to structure implementation contracts that we won't get into here (but do let me know if you'd like to learn more about it)

##### 7) Dharma Account Recovery Multisig
- controlled by a group of "support" accounts, where some threshold need to approve a transaction before it is triggered
- has exclusive access to a dedicated smart wallet function that allows for a user's registered key to be reset
- has a built-in time lock for added protection, and may be configurable by the user as part of future upgrades
- recommendation: [Gnosis Safe](https://github.com/gnosis/safe-contracts/blob/development/contracts/GnosisSafe.sol)

##### 8) Actual User Smart Wallets
- These all point to the same upgrade beacon - when the implementation is modified on that upgrade beacon, **all user smart wallets are upgraded at once**
- They are much cheaper to deploy and set up than regular contracts
- Using a smart wallet has a lot of advantages over using an externally-owned account (i.e. a regular key): you can have batch actions in one transaction, shared custody, account recovery, withdrawal limits, etc.


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

## Technical Details
There are two potential ways to implement the upgrade beacon contract and the proxy contracts that reference the upgrade beacon: with Solidity code, or with raw EVM assembly.

### Solidity Version
A Solidity-only implementation is the clear winner in terms of ease of developer comprehension and readability of the codebase. Admittedly, the Solidity implementation still contains a fair bit of inline assembly, anyway - there's really no easy way around it. It's looking quite likely that we'll take this approach, but I'll lay out my rationale at the end for using some limited code segments with raw EVM opcodes if you're interested to learn a little more about the alternative path.

##### Upgrade Beacon
- a dedicated controller can set an implementation address in storage
- retrieves and returns that implementation address for any other caller

##### Upgrade Beacon Proxy (deployment)
- gets current implementation contract address from the upgrade beacon via `STATICCALL`
- `DELEGATECALL`s into the implementation contract, providing initialization args as calldata
- ensures that the `DELEGATECALL` went smoothly, and if so returns the runtime code

##### Upgrade Beacon Proxy (runtime)
- gets current implementation contract address from the upgrade beacon via `STATICCALL`
- `DELEGATECALL`s into the implementation contract, passing along calldata
- returns or reverts based on `DELEGATECALL` status, supplying return buffer in either case

### Raw EVM Opcode Version

If we care about cost savings *(which, honestly, we might not)*, it is important that the proxies are especially efficient, both to deploy and to use, since *every* smart wallet contract will incur any overhead that the proxy pattern introduces. These contracts are well-suited to assembly since they have very specific, targeted behavior.  Another key benefit of using assembly is that the contracts are not susceptible to Solidity compiler bugs, and are therefore better candidates for formal verification.

Regardless, Solidity is a better fit for complex contracts like the upgrade beacon manager and the actual smart wallet implementation.

- `pc`: program counter, or index of the opcode. Execution starts at `pc 0` and works through the code one `pc` at a time, except that the `JUMP` and `JUMPI` (conditional jump) opcodes will look for a `JUMPDEST` with the provided `pc` in order to move the program counter around.
- `op`: the opcode.
- `name`: the name of the opcode, as well as the data for `PUSH` statements.
- `[stack]`: the stack immediately after executing the opcode, with the bottom stack items on the left and the top stack items on the right. (I order these backwards from convention, for whatever reason it feels more intuitive that way to me). Each stack item is a 32-byte value, and is the primary execution environment (think adding variables together, supplying arguments to functional opcodes, etc).
- `<memory>`: memory immediately after executing the opcode. I'm only showing it when it's changed, to avoid cluttering things up too much. Memory is more granular than stack items, and can be accessed byte-by-byte. To specify calldata when making a call, or returndata when returning or reverting, you provide a memory range (size and offset in memory) as stack arguments. Memory is allocated as it is used for the first time in the given execution environment and is cleared as soon as you return from that execution environment. The size of that allocation can be retrieved via `MSIZE` - before memory has been used at all, `MSIZE` will just put a `0` on the stack.
- `(storage)`: a sequential, persistent register of 32-byte values by "slot". This is a few orders of magnitude more expensive to use than memory.
- `{return_buffer}`: a dedicated range that behaves similar to memory and contains the data returned from the last function `call`, `STATICCALL`, or `DELEGATECALL` - it is cleared out every time a new call is made. It's initially sized at zero, so `RETURNDATASIZE` before any calls have been made will just put `0` on the stack.
- `~revert~` and `*return*` are to indicate the data that's returned when exiting the execution environment. If you return from a constructor (i.e. during contract creation), the return data becomes the new contract's runtime code.

Raw EVM assembly version of Upgrade Beacon:
- 37 bytes long when using standard addresses
- only 32 bytes long if controller has a compact address with 5 leading zero bytes
  - use `PUSH15` instead of `PUSH20`
  - subtract 5 from `JUMPI` program counter stack argument
```
0x5973<controller>3314602157545952593df35b355955

pc  op  name                      [stack] <memory> (storage) *return*
--  --  ------------------------  -----------------------------------
// put a zero at the bottom of the stack to use later.
00  59  MSIZE                     [0]

// put the address of the controller (Uprade Beacon Manager) on the stack.
01  73  PUSH20 <controller>       [0, multisig]

// put the address of the caller of this contract on the stack.
22  33  CALLER                    [0, multisig, caller]

// check if these two items are the same (i.e. if the caller is the controller).
23  14  EQ                        [0, controller == caller]

// put the pc to jump to if they ARE the same on the stack.
24  60  PUSH1 0x21                [0, controller == caller, 33]

// jump to that location if the caller is the controller, otherwise continue.
26  57  JUMPI                     [0]

// load the current implementation address from storage slot zero (set at pc 0).
27  54  SLOAD                     [slot_0 => implementation]

// put a zero on the stack (memory location to place the implementation.)
28  59  MSIZE                     [implementation, 0]

// move the implementation address from the stack into memory at location zero.
29  52  MSTORE                    [] <implementation>

// get the total size of memory (which is now one word or 32 bytes)
30  59  MSIZE                     [32]

// put another zero onto the stack for the offset of the return data in memory.
31  3d  RETURNDATASIZE            [32, 0]

// return implementation address as an abi-encoded address (one word) and exit.
32  f3  RETURN                    [] *implementation*

// jump here if and only if the caller IS the controller.
33  5b  JUMPDEST                  [0]

// load the first word of calldata (offset 0 from pc 0) directly to the stack.
34  35  CALLDATALOAD              [new_implementation]

// push a zero to the stack (the storage slot to use).
35  59  MSIZE                     [new_implementation, 0]

// put the implementation address from the stack into storage slot 0 and exit.
36  55  SSTORE                    [] (new_implementation => slot_0)
```

Minimal Upgrade Beacon Proxy (runtime code)
- gets current implementation contract address from the upgrade beacon via `STATICCALL`
- then proxy puts calldata in memory to supply as argument in `DELEGATECALL` to implementation
- finally, proxy returns or reverts based on `DELEGATECALL` status, supplying return buffer in either case
- 53 bytes long when using standard addresses
- 48 bytes long when using an upgrade beacon with a compact address
  - use `PUSH15` instead of `PUSH20`
  - subtract 5 from `JUMPI` program counter stack argument
```
0x595959593659602059595973<upgrade_beacon>5afa1551368280375af43d3d93803e603357fd5bf3

pc  op  name                      [stack] <memory> {return_buffer} *return* ~revert~
--  --  ------------------------  --------------------------------------------------
// put four zeroes + size of calldata + another zero on the stack to use later.
00  59  MSIZE                     [0]
01  59  MSIZE                     [0, 0]
02  59  MSIZE                     [0, 0, 0]
03  59  MSIZE                     [0, 0, 0, 0]
04  36  CALLDATASIZE              [0, 0, 0, 0, cds]
05  59  MSIZE                     [0, 0, 0, 0, cds, 0]

// put size of implementation address returned from upgrade beacon on the stack.
06  60  PUSH1 0x20                [0, 0, 0, 0, cds, 0, 32]

// put three zeroes on the stack: offset in memory for return data, no input data.
08  59  MSIZE                     [0, 0, 0, 0, cds, 0, 32, 0]
09  59  MSIZE                     [0, 0, 0, 0, cds, 0, 32, 0, 0]
10  59  MSIZE                     [0, 0, 0, 0, cds, 0, 32, 0, 0, 0]

// put the address of the upgrade beacon onto the stack.
11  73  PUSH20 <upgrade_beacon>   [0, 0, 0, 0, cds, 0, 32, 0, 0, 0, beacon]

// put current available gas onto the stack - upgrade beacon is unable to waste it.
32  5a  GAS                       [0, 0, 0, 0, cds, 0, 32, 0, 0, 0, beacon, gas]

// perform static call to upgrade beacon and put returned implementation in memory.
33  fa  STATICCALL                [0, 0, 0, 0, cds, 0, 1] <impl>

// flip success status stack item. Note that a call to upgrade beacon above will
// never fail (assuming the target is a valid upgrade beacon) unless gas runs
// out or the call stack depth is too great, in which case the next delegatecall
// will also fail, so we can infer it will be 1 => 0
34  15  ISZERO                    [0, 0, 0, 0, cds, 0, 0]

// take the implementation from memory and place it onto the stack.
35  51  MLOAD                     [0, 0, 0, 0, cds, 0, impl]

// put size of calldata and two zeroes onto the stack.
36  36  CALLDATASIZE              [0, 0, 0, 0, cds, 0, impl, cds]
37  82  DUP3                      [0, 0, 0, 0, cds, 0, impl, cds, 0]
38  80  DUP1                      [0, 0, 0, 0, cds, 0, impl, cds, 0, 0]

// load all calldata (0 to calldatasize) into memory starting at position 0.
39  37  CALLDATACOPY              [0, 0, 0, 0, cds, 0, impl] <calldata>

// put current available gas onto the stack - 1/64th reserved to handle return.
40  5a  GAS                       [0, 0, 0, 0, cds, 0, impl, gas] <calldata>

// supply calldata, delegatecall to implementation, and put status on the stack.
41  f4  DELEGATECALL              [0, 0, suc] {returndata}

// push and arrange items to the stack for getting data from the return buffer.
42  3d  RETURNDATASIZE            [0, 0, suc, rds]
43  3d  RETURNDATASIZE            [0, 0, suc, rds, rds]
44  93  SWAP4                     [rds, 0, suc, rds, 0]
45  80  DUP1                      [rds, 0, suc, rds, 0, 0]

// copy return buffer to memory so as to support dynamically-sized return data.
46  3e  RETURNDATACOPY            [rds, 0, suc] <returndata>

// put pc to jump to in the event that delegatecall was successful on the stack.
47  60  PUSH1 0x33                [rds, 0, suc, 51]

// jump to that location if delegatecall was successful, otherwise continue.
49  57  JUMPI                     [rds, 0]

// delegatecall was unsuccessful: revert and pass along returned revert message.
50  fd  REVERT                    [] ~returndata (revert message)~

// jump here if and only if delegatecall was successful.
51  5b  JUMPDEST                  [rds, 0]

// delegatecall was successful: return and pass along returned data.
52  f3  RETURN                    [] *returndata*
```

Lastly, when *deploying* these minimal upgradeable proxies, we want to be able to initialize them. In order to efficiently do so, the deployment code will get the same implementation address from the upgrade beacon, then `DELEGATECALL` into it and supply the abi-encoded constructor argument at the end of the creation code as calldata. Then, if that call succeeds, the deployment code will return the above minimal proxy code, thereby writing it to runtime and exiting. This is the actual code that the *factory* will supply in order to deploy new proxy contracts.

Minimal Upgrade Beacon Proxy (creation code)
- gets current implementation contract address from the upgrade beacon via `STATICCALL`
- `DELEGATECALL`s into the implementation contract, providing initialization args as calldata
- ensures that the `DELEGATECALL` went smoothly, and if so returns the runtime code
- 118 bytes total (65 init, 53 runtime) plus initializaton calldata at the end
- compact version will be 108 bytes total (60 init, 48 runtime) + calldata

```
0x595959596076380359602059595973<upgrade_beacon>5afa155182607683395af46038573d903d81803efd5b60356041819339f3595959593659602059595973<upgrade_beacon>5afa1551368280375af43d3d93803e603357fd5bf3 + initialization_calldata

pc  op  name                      [stack] <memory> {return_buffer} *return* ~revert~
--  --  ------------------------  --------------------------------------------------
// put four zeroes + size of calldata + another zero on the stack to use later.
00  59  MSIZE                     [0]
01  59  MSIZE                     [0, 0]
02  59  MSIZE                     [0, 0, 0]
03  59  MSIZE                     [0, 0, 0, 0]

// push size of deployment code, not including constructor argument, to the stack. 
04  60  PUSH1 0x76                [0, 0, 0, 0, 118 => code_no_args_size]

// push size of deployment code, *including* constructor argument, to the stack.
06  38  CODESIZE                  [0, 0, 0, 0, code_no_args_size, codesize]

// subtract code size without arguments from total size to get size of arguments.
07  03  SUB                       [0, 0, 0, 0, code_args_size]

// put a zero on the stack to use later.
08  59  MSIZE                     [0, 0, 0, 0, code_args_size, 0]

// put size of implementation address returned from upgrade beacon on the stack.
09  60  PUSH1 0x20                [0, 0, 0, 0, code_args_size, 0, 32]

// put three zeroes on the stack: offset in memory for return data, no input data.
11  59  MSIZE                     [0, 0, 0, 0, code_args_size, 0, 32, 0]
12  59  MSIZE                     [0, 0, 0, 0, code_args_size, 0, 32, 0, 0]
13  59  MSIZE                     [0, 0, 0, 0, code_args_size, 0, 32, 0, 0, 0]

// put the address of the upgrade beacon onto the stack.
14  73  PUSH20 <upgrade_beacon>   [0, 0, 0, 0, code_args_size, 0, 32, 0, 0, 0, beacon]

// put current available gas onto the stack - upgrade beacon is unable to waste it.
35  5a  GAS                       [0, 0, 0, 0, code_args_size, 0, 32, 0, 0, 0, beacon, gas]

// perform static call to upgrade beacon and put returned implementation in memory.
36  fa  STATICCALL                [0, 0, 0, 0, code_args_size, 0, 1] <impl>

// flip success status stack item. Same logic explained in runtime above applies here.
37  15  ISZERO                    [0, 0, 0, 0, code_args_size, 0, 0]

// take the implementation from memory and place it on the stack.
38  51  MLOAD                     [0, 0, 0, 0, code_args_size, 0, impl]

// copy the size of the provided constructor argument to the top of the stack.
39  82  DUP3                      [0, 0, 0, 0, code_args_size, 0, impl, code_args_size]

// put the offset of constructor argument (same constant used earlier) on the stack.
40  60  PUSH1 0x76                [0, 0, 0, 0, code_args_size, 0, impl, code_args_size, code_no_args_size]

// put a zero on the stack for the offset in memory to start copying the code.
42  83  DUP4                      [0, 0, 0, 0, code_args_size, 0, impl, code_args_size, code_no_args_size, 0]

// copy the constructor argument from the end of the supplied code to memory.
43  39  CODECOPY                  [0, 0, 0, 0, code_args_size, 0, impl] <delegatecall_args>

// put current available gas onto the stack - 1/64th reserved to handle revert.
44  5a  GAS                       [0, 0, 0, 0, code_args_size, 0, impl, gas] <delegatecall_args>

// supply constructor arg, delegatecall to implementation, and put status on the stack.
45  f4  DELEGATECALL              [0, 0, suc] {returndata}

// put pc to jump to in the event that initialization was successful on the stack.
46  60  PUSH1 0x38                [0, 0, suc, 56]

// jump to that location if initialization was successful, otherwise continue.
48  57  JUMPI                     [0, 0]

// initialization was unsuccessful: revert, supplying return buffer as revert message.
49  3d  RETURNDATASIZE            [0, 0, rds]
50  90  SWAP1                     [0, rds, 0]
51  3d  RETURNDATASIZE            [0, rds, 0, rds]
52  81  DUP2                      [0, rds, 0, rds, 0]
53  80  DUP1                      [0, rds, 0, rds, 0, 0]
54  3e  RETURNDATACOPY            [0, rds, 0] <revert_msg>
55  fd  REVERT                    [0] ~revert_msg~

// jump here if and only if initialization was successful.
56  5b  JUMPDEST                  [0, 0]

// push the size of minimal upgradeable proxy runtime code to the stack.
57  60  PUSH1 0x35                [0, 0, 53 => runtime_size]

// push offset where minimal upgradeable proxy runtime code is located to the stack.
59  60  PUSH1 0x41                [0, 0, runtime_size, 65 => runtime_code_offset]

// copy the size of runtime code and get it into position for use during return.
61  81  DUP2                      [0, 0, runtime_size, runtime_code_offset, runtime_size]
62  93  SWAP4                     [runtime_size, 0, runtime_size, runtime_code_offset, 0]

// take the minimal upgradeable proxy runtime code and place it into memory.
63  39  CODECOPY                  [runtime_size, 0] <runtime>

// return the minimal upgradeable proxy runtime code, writing it to runtime.
64  f3  RETURN                    *runtime*

// runtime code is the same as above.
+ runtime code

// initialization calldata varies depending on desired initialization function.
+ initialization calldata (function selector + abi-encoded args)
```

