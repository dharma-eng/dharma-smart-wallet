var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')
const constants = require('./constants.js')

const IERC20Artifact = require('../../build/contracts/IERC20.json')

module.exports = {test: async function (provider, testingContext) {
  var web3 = provider
  let passed = 0
  let failed = 0
  let gasUsage = {}
  let counts = {}

  const DAI = new web3.eth.Contract(
    IERC20Artifact.abi, constants.DAI_MAINNET_ADDRESS
  )

  const USDC = new web3.eth.Contract(
    IERC20Artifact.abi, constants.USDC_MAINNET_ADDRESS
  )

  const CDAI = new web3.eth.Contract(
    IERC20Artifact.abi, constants.CDAI_MAINNET_ADDRESS
  )

  const CUSDC = new web3.eth.Contract(
    IERC20Artifact.abi, constants.CUSDC_MAINNET_ADDRESS
  )

  const UNITROLLER = new web3.eth.Contract(
    [
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "pendingAdmin",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newPendingAdmin",
            "type": "address"
          }
        ],
        "name": "_setPendingAdmin",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "comptrollerImplementation",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          
        ],
        "name": "_acceptImplementation",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "pendingComptrollerImplementation",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newPendingImplementation",
            "type": "address"
          }
        ],
        "name": "_setPendingImplementation",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          
        ],
        "name": "_acceptAdmin",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "admin",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "oldPendingImplementation",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "newPendingImplementation",
            "type": "address"
          }
        ],
        "name": "NewPendingImplementation",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "oldImplementation",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "newImplementation",
            "type": "address"
          }
        ],
        "name": "NewImplementation",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "oldPendingAdmin",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "newPendingAdmin",
            "type": "address"
          }
        ],
        "name": "NewPendingAdmin",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "oldAdmin",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "newAdmin",
            "type": "address"
          }
        ],
        "name": "NewAdmin",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "error",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "info",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "detail",
            "type": "uint256"
          }
        ],
        "name": "Failure",
        "type": "event"
      }
    ],
    constants.COMPTROLLER_MAINNET_ADDRESS
  )

  const FIAT_TOKEN = new web3.eth.Contract(
    [
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "name",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "unBlacklist",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_from",
            "type": "address"
          },
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "minter",
            "type": "address"
          }
        ],
        "name": "removeMinter",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "decimals",
        "outputs": [
          {
            "name": "",
            "type": "uint8"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_name",
            "type": "string"
          },
          {
            "name": "_symbol",
            "type": "string"
          },
          {
            "name": "_currency",
            "type": "string"
          },
          {
            "name": "_decimals",
            "type": "uint8"
          },
          {
            "name": "_masterMinter",
            "type": "address"
          },
          {
            "name": "_pauser",
            "type": "address"
          },
          {
            "name": "_blacklister",
            "type": "address"
          },
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "initialize",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "masterMinter",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          
        ],
        "name": "unpause",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "burn",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "minter",
            "type": "address"
          },
          {
            "name": "minterAllowedAmount",
            "type": "uint256"
          }
        ],
        "name": "configureMinter",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newPauser",
            "type": "address"
          }
        ],
        "name": "updatePauser",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "paused",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          
        ],
        "name": "pause",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "minter",
            "type": "address"
          }
        ],
        "name": "minterAllowance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "symbol",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "pauser",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newMasterMinter",
            "type": "address"
          }
        ],
        "name": "updateMasterMinter",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "account",
            "type": "address"
          }
        ],
        "name": "isMinter",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newBlacklister",
            "type": "address"
          }
        ],
        "name": "updateBlacklister",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "blacklister",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          
        ],
        "name": "currency",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "blacklist",
        "outputs": [
          
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "isBlacklisted",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "minter",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Mint",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "burner",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Burn",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "minter",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "minterAllowedAmount",
            "type": "uint256"
          }
        ],
        "name": "MinterConfigured",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "oldMinter",
            "type": "address"
          }
        ],
        "name": "MinterRemoved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "newMasterMinter",
            "type": "address"
          }
        ],
        "name": "MasterMinterChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "Blacklisted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "UnBlacklisted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "newBlacklister",
            "type": "address"
          }
        ],
        "name": "BlacklisterChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          
        ],
        "name": "Pause",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          
        ],
        "name": "Unpause",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "newAddress",
            "type": "address"
          }
        ],
        "name": "PauserChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      }
    ],
    constants.USDC_MAINNET_ADDRESS
  )

  const COMPTROLLER_ABI = [
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "isComptroller",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "payer",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "repayAmount",
          "type": "uint256"
        },
        {
          "name": "borrowerIndex",
          "type": "uint256"
        }
      ],
      "name": "repayBorrowVerify",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "payer",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "repayBorrowAllowed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "pendingAdmin",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCloseFactor",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "unitroller",
          "type": "address"
        },
        {
          "name": "_oracle",
          "type": "address"
        },
        {
          "name": "_closeFactorMantissa",
          "type": "uint256"
        },
        {
          "name": "_maxAssets",
          "type": "uint256"
        },
        {
          "name": "reinitializing",
          "type": "bool"
        }
      ],
      "name": "_become",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "minter",
          "type": "address"
        },
        {
          "name": "mintAmount",
          "type": "uint256"
        },
        {
          "name": "mintTokens",
          "type": "uint256"
        }
      ],
      "name": "mintVerify",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cTokenBorrowed",
          "type": "address"
        },
        {
          "name": "cTokenCollateral",
          "type": "address"
        },
        {
          "name": "liquidator",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "repayAmount",
          "type": "uint256"
        },
        {
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "liquidateBorrowVerify",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "liquidationIncentiveMantissa",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "minter",
          "type": "address"
        },
        {
          "name": "mintAmount",
          "type": "uint256"
        }
      ],
      "name": "mintAllowed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setLiquidationIncentive",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "redeemer",
          "type": "address"
        },
        {
          "name": "redeemAmount",
          "type": "uint256"
        },
        {
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemVerify",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newOracle",
          "type": "address"
        }
      ],
      "name": "_setPriceOracle",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "borrowVerify",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAccountLiquidity",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        },
        {
          "name": "",
          "type": "uint256"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cTokenBorrowed",
          "type": "address"
        },
        {
          "name": "cTokenCollateral",
          "type": "address"
        },
        {
          "name": "liquidator",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateBorrowAllowed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "src",
          "type": "address"
        },
        {
          "name": "dst",
          "type": "address"
        },
        {
          "name": "transferTokens",
          "type": "uint256"
        }
      ],
      "name": "transferVerify",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cTokenCollateral",
          "type": "address"
        },
        {
          "name": "cTokenBorrowed",
          "type": "address"
        },
        {
          "name": "liquidator",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "seizeVerify",
      "outputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "oracle",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "markets",
      "outputs": [
        {
          "name": "isListed",
          "type": "bool"
        },
        {
          "name": "collateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        },
        {
          "name": "cToken",
          "type": "address"
        }
      ],
      "name": "checkMembership",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "maxAssets",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        }
      ],
      "name": "_supportMarket",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAssetsIn",
      "outputs": [
        {
          "name": "",
          "type": "address[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "comptrollerImplementation",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "src",
          "type": "address"
        },
        {
          "name": "dst",
          "type": "address"
        },
        {
          "name": "transferTokens",
          "type": "uint256"
        }
      ],
      "name": "transferAllowed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cTokens",
          "type": "address[]"
        }
      ],
      "name": "enterMarkets",
      "outputs": [
        {
          "name": "",
          "type": "uint256[]"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "cTokenBorrowed",
          "type": "address"
        },
        {
          "name": "cTokenCollateral",
          "type": "address"
        },
        {
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateCalculateSeizeTokens",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cTokenCollateral",
          "type": "address"
        },
        {
          "name": "cTokenBorrowed",
          "type": "address"
        },
        {
          "name": "liquidator",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "seizeAllowed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newMaxAssets",
          "type": "uint256"
        }
      ],
      "name": "_setMaxAssets",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "borrower",
          "type": "address"
        },
        {
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "borrowAllowed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "accountAssets",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "pendingComptrollerImplementation",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCollateralFactor",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "closeFactorMantissa",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cToken",
          "type": "address"
        },
        {
          "name": "redeemer",
          "type": "address"
        },
        {
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemAllowed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "cTokenAddress",
          "type": "address"
        }
      ],
      "name": "exitMarket",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        
      ],
      "name": "admin",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "cToken",
          "type": "address"
        }
      ],
      "name": "MarketListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "cToken",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketEntered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "cToken",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketExited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "oldCloseFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCloseFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "cToken",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "oldCollateralFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCollateralFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "oldLiquidationIncentiveMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewLiquidationIncentive",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "oldMaxAssets",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "newMaxAssets",
          "type": "uint256"
        }
      ],
      "name": "NewMaxAssets",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "oldPriceOracle",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "newPriceOracle",
          "type": "address"
        }
      ],
      "name": "NewPriceOracle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "error",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "info",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "detail",
          "type": "uint256"
        }
      ],
      "name": "Failure",
      "type": "event"
    }
  ]

  // get available addresses and assign them to various roles
  const addresses = await web3.eth.getAccounts()
  if (addresses.length < 1) {
    console.log('cannot find enough addresses to run tests!')
    process.exit(1)
  }

  let latestBlock = await web3.eth.getBlock('latest')

  const originalAddress = addresses[0]

  let address = await setupNewDefaultAddress(
    '0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed'
  )

  let addressTwo = await setupNewDefaultAddress(
    '0xf00df00df00df00df00df00df00df00df00df00df00df00df00df00df00df00d'
  )

  const gasLimit = latestBlock.gasLimit

  // 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359
  // nonce: 4
  const mockDaiDeploymentData = (
    '0x608060405234801561001057600080fd5b5060405160208061085d8339810180604052' +
    '810190808051906020019092919050505080600160003373ffffffffffffffffffffffff' +
    'ffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001' +
    '9081526020016000208190555080600081905550506107cf8061008e6000396000f30060' +
    '8060405260043610610078576000357c0100000000000000000000000000000000000000' +
    '000000000000000000900463ffffffff168063095ea7b31461007d57806318160ddd1461' +
    '00e257806323b872dd1461010d57806370a0823114610192578063a9059cbb146101e957' +
    '8063dd62ed3e1461024e575b600080fd5b34801561008957600080fd5b506100c8600480' +
    '360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092' +
    '9190803590602001909291905050506102c5565b60405180821515151581526020019150' +
    '5060405180910390f35b3480156100ee57600080fd5b506100f76103b7565b6040518082' +
    '815260200191505060405180910390f35b34801561011957600080fd5b50610178600480' +
    '360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092' +
    '9190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035' +
    '90602001909291905050506103c0565b6040518082151515158152602001915050604051' +
    '80910390f35b34801561019e57600080fd5b506101d3600480360381019080803573ffff' +
    'ffffffffffffffffffffffffffffffffffff169060200190929190505050610686565b60' +
    '40518082815260200191505060405180910390f35b3480156101f557600080fd5b506102' +
    '34600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060' +
    '200190929190803590602001909291905050506106cf565b604051808215151515815260' +
    '200191505060405180910390f35b34801561025a57600080fd5b506102af600480360381' +
    '019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080' +
    '3573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506106' +
    'e4565b6040518082815260200191505060405180910390f35b600081600260003373ffff' +
    'ffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffff' +
    'ffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffff' +
    'ffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190' +
    '8152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff1633' +
    '73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d' +
    '1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405180828152602001915050604051' +
    '80910390a36001905092915050565b60008054905090565b60003373ffffffffffffffff' +
    'ffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16' +
    '1415156104fe5761047d600260008673ffffffffffffffffffffffffffffffffffffffff' +
    '1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000' +
    '2060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffff' +
    'ffffffffffffffffffffff168152602001908152602001600020548361076b565b600260' +
    '008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffff' +
    'ffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffff' +
    'ffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681' +
    '52602001908152602001600020819055505b610547600160008673ffffffffffffffffff' +
    'ffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152' +
    '602001908152602001600020548361076b565b600160008673ffffffffffffffffffffff' +
    'ffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020' +
    '01908152602001600020819055506105d3600160008573ffffffffffffffffffffffffff' +
    'ffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190' +
    '81526020016000205483610787565b600160008573ffffffffffffffffffffffffffffff' +
    'ffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152' +
    '602001600020819055508273ffffffffffffffffffffffffffffffffffffffff168473ff' +
    'ffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378d' +
    'aa952ba7f163c4a11628f55a4df523b3ef84604051808281526020019150506040518091' +
    '0390a3600190509392505050565b6000600160008373ffffffffffffffffffffffffffff' +
    'ffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081' +
    '52602001600020549050919050565b60006106dc3384846103c0565b905092915050565b' +
    '6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffff' +
    'ffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffff' +
    'ffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffff' +
    'ffffff16815260200190815260200160002054905092915050565b600082828403915081' +
    '1115151561078157600080fd5b92915050565b6000828284019150811015151561079d57' +
    '600080fd5b929150505600a165627a7a72305820b4ab3c13e840dd08d9787883bde3458d' +
    'cbab9a56f185c55a59574286095eb6e80029f00000000000000000000000000000000000' +
    '0000000000000000000000000000'
  )

  // 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
  // nonce: 20
  const mockUSDCDeploymentData = (
    '0x60806040526000600460146101000a81548160ff021916908315150217905550600060' +
    '0e5561003c33610041640100000000026401000000009004565b610084565b8060008061' +
    '01000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffff' +
    'ffffffffffffffffffffffffffffffffff16021790555050565b6135c580620000946000' +
    '396000f3006080604052600436106101a1576000357c0100000000000000000000000000' +
    '000000000000000000000000000000900463ffffffff16806306fdde03146101a6578063' +
    '095ea7b31461023657806318160ddd1461029b5780631a895266146102c657806323b872' +
    'dd146103095780633092afd51461038e578063313ce567146103e95780633357162b1461' +
    '041a57806335d99f351461059c57806339509351146105f35780633f4ba83a1461065857' +
    '806340c10f191461066f57806342966c68146106d45780634e44d9561461070157806355' +
    '4bab3c146107665780635c975abb146107a957806370a08231146107d85780638456cb59' +
    '1461082f5780638a6db9c3146108465780638da5cb5b1461089d57806395d89b41146108' +
    'f45780639fd0506d14610984578063a457c2d7146109db578063a9059cbb14610a405780' +
    '63aa20e1e414610aa5578063aa271e1a14610ae8578063ad38bf2214610b43578063bd10' +
    '243014610b86578063dd62ed3e14610bdd578063e5a6b10f14610c54578063f2fde38b14' +
    '610ce4578063f9f92be414610d27578063fe575a8714610d6a575b600080fd5b34801561' +
    '01b257600080fd5b506101bb610dc5565b60405180806020018281038252838181518152' +
    '60200191508051906020019080838360005b838110156101fb5780820151818401526020' +
    '810190506101e0565b50505050905090810190601f168015610228578082038051600183' +
    '6020036101000a031916815260200191505b509250505060405180910390f35b34801561' +
    '024257600080fd5b50610281600480360381019080803573ffffffffffffffffffffffff' +
    'ffffffffffffffff16906020019092919080359060200190929190505050610e63565b60' +
    '4051808215151515815260200191505060405180910390f35b3480156102a757600080fd' +
    '5b506102b0611033565b6040518082815260200191505060405180910390f35b34801561' +
    '02d257600080fd5b50610307600480360381019080803573ffffffffffffffffffffffff' +
    'ffffffffffffffff16906020019092919050505061103d565b005b348015610315576000' +
    '80fd5b50610374600480360381019080803573ffffffffffffffffffffffffffffffffff' +
    'ffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16' +
    '906020019092919080359060200190929190505050611137565b60405180821515151581' +
    '5260200191505060405180910390f35b34801561039a57600080fd5b506103cf60048036' +
    '0381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291' +
    '90505050611636565b604051808215151515815260200191505060405180910390f35b34' +
    '80156103f557600080fd5b506103fe61177d565b604051808260ff1660ff168152602001' +
    '91505060405180910390f35b34801561042657600080fd5b5061059a6004803603810190' +
    '80803590602001908201803590602001908080601f016020809104026020016040519081' +
    '016040528093929190818152602001838380828437820191505050505050919291929080' +
    '3590602001908201803590602001908080601f0160208091040260200160405190810160' +
    '405280939291908181526020018383808284378201915050505050509192919290803590' +
    '602001908201803590602001908080601f01602080910402602001604051908101604052' +
    '80939291908181526020018383808284378201915050505050509192919290803560ff16' +
    '9060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001' +
    '90929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190' +
    '803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ff' +
    'ffffffffffffffffffffffffffffffffffffff169060200190929190505050611790565b' +
    '005b3480156105a857600080fd5b506105b16119ed565b604051808273ffffffffffffff' +
    'ffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16' +
    '815260200191505060405180910390f35b3480156105ff57600080fd5b5061063e600480' +
    '360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092' +
    '919080359060200190929190505050611a13565b60405180821515151581526020019150' +
    '5060405180910390f35b34801561066457600080fd5b5061066d611ab8565b005b348015' +
    '61067b57600080fd5b506106ba600480360381019080803573ffffffffffffffffffffff' +
    'ffffffffffffffffff16906020019092919080359060200190929190505050611b5d565b' +
    '604051808215151515815260200191505060405180910390f35b3480156106e057600080' +
    'fd5b506106ff60048036038101908080359060200190929190505050611eff565b005b34' +
    '801561070d57600080fd5b5061074c600480360381019080803573ffffffffffffffffff' +
    'ffffffffffffffffffffff16906020019092919080359060200190929190505050612166' +
    '565b604051808215151515815260200191505060405180910390f35b3480156107725760' +
    '0080fd5b506107a7600480360381019080803573ffffffffffffffffffffffffffffffff' +
    'ffffffff1690602001909291905050506122d4565b005b3480156107b557600080fd5b50' +
    '6107be6123fa565b604051808215151515815260200191505060405180910390f35b3480' +
    '156107e457600080fd5b50610819600480360381019080803573ffffffffffffffffffff' +
    'ffffffffffffffffffff16906020019092919050505061240d565b604051808281526020' +
    '0191505060405180910390f35b34801561083b57600080fd5b50610844612456565b005b' +
    '34801561085257600080fd5b50610887600480360381019080803573ffffffffffffffff' +
    'ffffffffffffffffffffffff1690602001909291905050506124fb565b60405180828152' +
    '60200191505060405180910390f35b3480156108a957600080fd5b506108b2612544565b' +
    '604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffff' +
    'ffffffffffffffffffffffff16815260200191505060405180910390f35b348015610900' +
    '57600080fd5b5061090961256d565b604051808060200182810382528381815181526020' +
    '0191508051906020019080838360005b8381101561094957808201518184015260208101' +
    '905061092e565b50505050905090810190601f1680156109765780820380516001836020' +
    '036101000a031916815260200191505b509250505060405180910390f35b348015610990' +
    '57600080fd5b5061099961260b565b604051808273ffffffffffffffffffffffffffffff' +
    'ffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001915050' +
    '60405180910390f35b3480156109e757600080fd5b50610a266004803603810190808035' +
    '73ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001' +
    '90929190505050612631565b604051808215151515815260200191505060405180910390' +
    'f35b348015610a4c57600080fd5b50610a8b600480360381019080803573ffffffffffff' +
    'ffffffffffffffffffffffffffff16906020019092919080359060200190929190505050' +
    '612734565b604051808215151515815260200191505060405180910390f35b348015610a' +
    'b157600080fd5b50610ae6600480360381019080803573ffffffffffffffffffffffffff' +
    'ffffffffffffff169060200190929190505050612a37565b005b348015610af457600080' +
    'fd5b50610b29600480360381019080803573ffffffffffffffffffffffffffffffffffff' +
    'ffff169060200190929190505050612b5d565b6040518082151515158152602001915050' +
    '60405180910390f35b348015610b4f57600080fd5b50610b846004803603810190808035' +
    '73ffffffffffffffffffffffffffffffffffffffff169060200190929190505050612bb3' +
    '565b005b348015610b9257600080fd5b50610b9b612cd9565b604051808273ffffffffff' +
    'ffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffff' +
    'ff16815260200191505060405180910390f35b348015610be957600080fd5b50610c3e60' +
    '0480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001' +
    '90929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190' +
    '505050612cff565b6040518082815260200191505060405180910390f35b348015610c60' +
    '57600080fd5b50610c69612d86565b604051808060200182810382528381815181526020' +
    '0191508051906020019080838360005b83811015610ca957808201518184015260208101' +
    '9050610c8e565b50505050905090810190601f168015610cd65780820380516001836020' +
    '036101000a031916815260200191505b509250505060405180910390f35b348015610cf0' +
    '57600080fd5b50610d25600480360381019080803573ffffffffffffffffffffffffffff' +
    'ffffffffffff169060200190929190505050612e24565b005b348015610d3357600080fd' +
    '5b50610d68600480360381019080803573ffffffffffffffffffffffffffffffffffffff' +
    'ff169060200190929190505050612f4b565b005b348015610d7657600080fd5b50610dab' +
    '600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020' +
    '0190929190505050613045565b6040518082151515158152602001915050604051809103' +
    '90f35b60078054600181600116156101000203166002900480601f016020809104026020' +
    '016040519081016040528092919081815260200182805460018160011615610100020316' +
    '600290048015610e5b5780601f10610e3057610100808354040283529160200191610e5b' +
    '565b820191906000526020600020905b815481529060010190602001808311610e3e5782' +
    '9003601f168201915b505050505081565b6000600460149054906101000a900460ff1615' +
    '1515610e8157600080fd5b3360001515600660008373ffffffffffffffffffffffffffff' +
    'ffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081' +
    '5260200160002060009054906101000a900460ff161515141515610ee157600080fd5b83' +
    '60001515600660008373ffffffffffffffffffffffffffffffffffffffff1673ffffffff' +
    'ffffffffffffffffffffffffffffffff1681526020019081526020016000206000905490' +
    '6101000a900460ff161515141515610f4157600080fd5b83600d60003373ffffffffffff' +
    'ffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff' +
    '16815260200190815260200160002060008773ffffffffffffffffffffffffffffffffff' +
    'ffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020' +
    '01600020819055508473ffffffffffffffffffffffffffffffffffffffff163373ffffff' +
    'ffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd' +
    '0314c0f7b2291e5b200ac8c7c3b925866040518082815260200191505060405180910390' +
    'a360019250505092915050565b6000600e54905090565b600560009054906101000a9004' +
    '73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffff' +
    'ffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156110' +
    '9957600080fd5b6000600660008373ffffffffffffffffffffffffffffffffffffffff16' +
    '73ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020' +
    '60006101000a81548160ff0219169083151502179055508073ffffffffffffffffffffff' +
    'ffffffffffffffffff167f117e3210bb9aa7d9baff172026820255c6f6c30ba8999d1c2f' +
    'd88e2848137c4e60405160405180910390a250565b6000600460149054906101000a9004' +
    '60ff1615151561115557600080fd5b8260001515600660008373ffffffffffffffffffff' +
    'ffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260' +
    '200190815260200160002060009054906101000a900460ff1615151415156111b5576000' +
    '80fd5b3360001515600660008373ffffffffffffffffffffffffffffffffffffffff1673' +
    'ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060' +
    '009054906101000a900460ff16151514151561121557600080fd5b856000151560066000' +
    '8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffff' +
    'ffffffffffffffff16815260200190815260200160002060009054906101000a900460ff' +
    '16151514151561127557600080fd5b600073ffffffffffffffffffffffffffffffffffff' +
    'ffff168673ffffffffffffffffffffffffffffffffffffffff16141515156112b1576000' +
    '80fd5b600c60008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffff' +
    'ffffffffffffffffffffffffffffff168152602001908152602001600020548511151515' +
    '6112ff57600080fd5b600d60008873ffffffffffffffffffffffffffffffffffffffff16' +
    '73ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020' +
    '60003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffff' +
    'ffffffffffffffffffff16815260200190815260200160002054851115151561138a5760' +
    '0080fd5b6113dc85600c60008a73ffffffffffffffffffffffffffffffffffffffff1673' +
    'ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054' +
    '61309b90919063ffffffff16565b600c60008973ffffffffffffffffffffffffffffffff' +
    'ffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260' +
    '20016000208190555061147185600c60008973ffffffffffffffffffffffffffffffffff' +
    'ffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020' +
    '01600020546130e590919063ffffffff16565b600c60008873ffffffffffffffffffffff' +
    'ffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020' +
    '019081526020016000208190555061154385600d60008a73ffffffffffffffffffffffff' +
    'ffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001' +
    '90815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ff' +
    'ffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461' +
    '309b90919063ffffffff16565b600d60008973ffffffffffffffffffffffffffffffffff' +
    'ffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020' +
    '0160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffff' +
    'ffffffffffffffffffffffffffff168152602001908152602001600020819055508573ff' +
    'ffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffff' +
    'ffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4d' +
    'f523b3ef876040518082815260200191505060405180910390a360019350505050939250' +
    '5050565b6000600b60009054906101000a900473ffffffffffffffffffffffffffffffff' +
    'ffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffff' +
    'ffffffffffffffffffffffffff1614151561169457600080fd5b6000600f60008473ffff' +
    'ffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffff' +
    'ffffffff16815260200190815260200160002060006101000a81548160ff021916908315' +
    '1502179055506000601060008473ffffffffffffffffffffffffffffffffffffffff1673' +
    'ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081' +
    '9055508173ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc7' +
    '8f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a26001' +
    '9050919050565b600960009054906101000a900460ff1681565b600b6014905490610100' +
    '0a900460ff161515156117ac57600080fd5b600073ffffffffffffffffffffffffffffff' +
    'ffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141515156117e8' +
    '57600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffff' +
    'ffffffffffffffffffffffffffffffff161415151561182457600080fd5b600073ffffff' +
    'ffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffff' +
    'ffffffff161415151561186057600080fd5b600073ffffffffffffffffffffffffffffff' +
    'ffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415151561189c' +
    '57600080fd5b87600790805190602001906118b29291906134f4565b5086600890805190' +
    '602001906118c99291906134f4565b5085600a90805190602001906118e09291906134f4' +
    '565b5084600960006101000a81548160ff021916908360ff16021790555083600b600061' +
    '01000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffff' +
    'ffffffffffffffffffffffffffffffffff16021790555082600460006101000a81548173' +
    'ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffff' +
    'ffffffffffffffffffff16021790555081600560006101000a81548173ffffffffffffff' +
    'ffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffff' +
    'ffffff1602179055506119c88161316f565b6001600b60146101000a81548160ff021916' +
    '9083151502179055505050505050505050565b600b60009054906101000a900473ffffff' +
    'ffffffffffffffffffffffffffffffffff1681565b6000611aae3384611aa98560026000' +
    '3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffff' +
    'ffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffff' +
    'ffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152' +
    '602001908152602001600020546130e590919063ffffffff16565b6131b2565b60019050' +
    '92915050565b600460009054906101000a900473ffffffffffffffffffffffffffffffff' +
    'ffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffff' +
    'ffffffffffffffffffffffffff16141515611b1457600080fd5b6000600460146101000a' +
    '81548160ff0219169083151502179055507f7805862f689e2f13df9f062ff482ad3ad112' +
    'aca9e0847911ed832e158c525b3360405160405180910390a1565b600080600460149054' +
    '906101000a900460ff16151515611b7c57600080fd5b60011515600f60003373ffffffff' +
    'ffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffff' +
    'ffff16815260200190815260200160002060009054906101000a900460ff161515141515' +
    '611bdb57600080fd5b3360001515600660008373ffffffffffffffffffffffffffffffff' +
    'ffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260' +
    '200160002060009054906101000a900460ff161515141515611c3b57600080fd5b846000' +
    '1515600660008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffff' +
    'ffffffffffffffffffffffffffff16815260200190815260200160002060009054906101' +
    '000a900460ff161515141515611c9b57600080fd5b600073ffffffffffffffffffffffff' +
    'ffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff1614151515' +
    '611cd757600080fd5b600085111515611ce657600080fd5b601060003373ffffffffffff' +
    'ffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff' +
    '168152602001908152602001600020549250828511151515611d3757600080fd5b611d4c' +
    '85600e546130e590919063ffffffff16565b600e81905550611da485600c60008973ffff' +
    'ffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffff' +
    'ffffffff168152602001908152602001600020546130e590919063ffffffff16565b600c' +
    '60008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffff' +
    'ffffffffffffffffffff16815260200190815260200160002081905550611dfa85846130' +
    '9b90919063ffffffff16565b601060003373ffffffffffffffffffffffffffffffffffff' +
    'ffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001' +
    '600020819055508573ffffffffffffffffffffffffffffffffffffffff163373ffffffff' +
    'ffffffffffffffffffffffffffffffff167fab8530f87dc9b59234c4623bf917212bb253' +
    '6d647574c8e7e5da92c2ede0c9f8876040518082815260200191505060405180910390a3' +
    '8573ffffffffffffffffffffffffffffffffffffffff1660007fddf252ad1be2c89b69c2' +
    'b068fc378daa952ba7f163c4a11628f55a4df523b3ef8760405180828152602001915050' +
    '60405180910390a36001935050505092915050565b6000600460149054906101000a9004' +
    '60ff16151515611f1d57600080fd5b60011515600f60003373ffffffffffffffffffffff' +
    'ffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020' +
    '0190815260200160002060009054906101000a900460ff161515141515611f7c57600080' +
    'fd5b3360001515600660008373ffffffffffffffffffffffffffffffffffffffff1673ff' +
    'ffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000' +
    '9054906101000a900460ff161515141515611fdc57600080fd5b600c60003373ffffffff' +
    'ffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffff' +
    'ffff16815260200190815260200160002054915060008311151561202d57600080fd5b82' +
    '821015151561203c57600080fd5b61205183600e5461309b90919063ffffffff16565b60' +
    '0e8190555061206a838361309b90919063ffffffff16565b600c60003373ffffffffffff' +
    'ffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff' +
    '168152602001908152602001600020819055503373ffffffffffffffffffffffffffffff' +
    'ffffffffff167fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d' +
    '397ca5846040518082815260200191505060405180910390a2600073ffffffffffffffff' +
    'ffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16' +
    '7fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef856040' +
    '518082815260200191505060405180910390a3505050565b600060046014905490610100' +
    '0a900460ff1615151561218457600080fd5b600b60009054906101000a900473ffffffff' +
    'ffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffff' +
    'ffff163373ffffffffffffffffffffffffffffffffffffffff161415156121e057600080' +
    'fd5b6001600f60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffff' +
    'ffffffffffffffffffffffffffffffff1681526020019081526020016000206000610100' +
    '0a81548160ff02191690831515021790555081601060008573ffffffffffffffffffffff' +
    'ffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020' +
    '01908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff' +
    '167f46980fca912ef9bcdbd36877427b6b90e860769f604e89c0e67720cece530d208360' +
    '40518082815260200191505060405180910390a26001905092915050565b6122dc612544' +
    '565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffff' +
    'ffffffffffffffffffff1614151561231557600080fd5b600073ffffffffffffffffffff' +
    'ffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415' +
    '151561235157600080fd5b80600460006101000a81548173ffffffffffffffffffffffff' +
    'ffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602' +
    '17905550600460009054906101000a900473ffffffffffffffffffffffffffffffffffff' +
    'ffff1673ffffffffffffffffffffffffffffffffffffffff167fb80482a293ca2e013eda' +
    '8683c9bd7fc8347cfdaeea5ede58cba46df502c2a60460405160405180910390a250565b' +
    '600460149054906101000a900460ff1681565b6000600c60008373ffffffffffffffffff' +
    'ffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152' +
    '602001908152602001600020549050919050565b600460009054906101000a900473ffff' +
    'ffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffff' +
    'ffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156124b25760' +
    '0080fd5b6001600460146101000a81548160ff0219169083151502179055507f6985a022' +
    '10a168e66602d3235cb6db0e70f92b3ba4d376a33c0f3d9434bff6256040516040518091' +
    '0390a1565b6000601060008373ffffffffffffffffffffffffffffffffffffffff1673ff' +
    'ffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490' +
    '50919050565b60008060009054906101000a900473ffffffffffffffffffffffffffffff' +
    'ffffffffff16905090565b60088054600181600116156101000203166002900480601f01' +
    '602080910402602001604051908101604052809291908181526020018280546001816001' +
    '16156101000203166002900480156126035780601f106125d85761010080835404028352' +
    '9160200191612603565b820191906000526020600020905b815481529060010190602001' +
    '8083116125e657829003601f168201915b505050505081565b600460009054906101000a' +
    '900473ffffffffffffffffffffffffffffffffffffffff1681565b600061272a33846127' +
    '2585606060405190810160405280602581526020017f45524332303a2064656372656173' +
    '656420616c6c6f77616e63652062656c6f7781526020017f207a65726f00000000000000' +
    '0000000000000000000000000000000000000000815250600260003373ffffffffffffff' +
    'ffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16' +
    '815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffff' +
    'ffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001' +
    '600020546134339092919063ffffffff16565b6131b2565b6001905092915050565b6000' +
    '600460149054906101000a900460ff1615151561275257600080fd5b3360001515600660' +
    '008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffff' +
    'ffffffffffffffffff16815260200190815260200160002060009054906101000a900460' +
    'ff1615151415156127b257600080fd5b8360001515600660008373ffffffffffffffffff' +
    'ffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152' +
    '60200190815260200160002060009054906101000a900460ff1615151415156128125760' +
    '0080fd5b600073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffff' +
    'ffffffffffffffffffffffffffff161415151561284e57600080fd5b600c60003373ffff' +
    'ffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffff' +
    'ffffffff16815260200190815260200160002054841115151561289c57600080fd5b6128' +
    'ee84600c60003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffff' +
    'ffffffffffffffffffffffffffff1681526020019081526020016000205461309b909190' +
    '63ffffffff16565b600c60003373ffffffffffffffffffffffffffffffffffffffff1673' +
    'ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081' +
    '90555061298384600c60008873ffffffffffffffffffffffffffffffffffffffff1673ff' +
    'ffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461' +
    '30e590919063ffffffff16565b600c60008773ffffffffffffffffffffffffffffffffff' +
    'ffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020' +
    '01600020819055508473ffffffffffffffffffffffffffffffffffffffff163373ffffff' +
    'ffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa95' +
    '2ba7f163c4a11628f55a4df523b3ef866040518082815260200191505060405180910390' +
    'a360019250505092915050565b612a3f612544565b73ffffffffffffffffffffffffffff' +
    'ffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515612a78' +
    '57600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffff' +
    'ffffffffffffffffffffffffffffffff1614151515612ab457600080fd5b80600b600061' +
    '01000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffff' +
    'ffffffffffffffffffffffffffffffffff160217905550600b60009054906101000a9004' +
    '73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffff' +
    'ffffffffffffff167fdb66dfa9c6b8f5226fe9aac7e51897ae8ee94ac31dc70bb6c9900b' +
    '2574b707e660405160405180910390a250565b6000600f60008373ffffffffffffffffff' +
    'ffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152' +
    '60200190815260200160002060009054906101000a900460ff169050919050565b612bbb' +
    '612544565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffff' +
    'ffffffffffffffffffffffffff16141515612bf457600080fd5b600073ffffffffffffff' +
    'ffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff' +
    '1614151515612c3057600080fd5b80600560006101000a81548173ffffffffffffffffff' +
    'ffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffff' +
    'ff160217905550600560009054906101000a900473ffffffffffffffffffffffffffffff' +
    'ffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fc67398012c111c' +
    'e95ecb7429b933096c977380ee6c421175a71a4a4c6c88c06e60405160405180910390a2' +
    '50565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffff' +
    'ff1681565b6000600d60008473ffffffffffffffffffffffffffffffffffffffff1673ff' +
    'ffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000' +
    '8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffff' +
    'ffffffffffffffff16815260200190815260200160002054905092915050565b600a8054' +
    '600181600116156101000203166002900480601f01602080910402602001604051908101' +
    '604052809291908181526020018280546001816001161561010002031660029004801561' +
    '2e1c5780601f10612df157610100808354040283529160200191612e1c565b8201919060' +
    '00526020600020905b815481529060010190602001808311612dff57829003601f168201' +
    '915b505050505081565b612e2c612544565b73ffffffffffffffffffffffffffffffffff' +
    'ffffff163373ffffffffffffffffffffffffffffffffffffffff16141515612e65576000' +
    '80fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffff' +
    'ffffffffffffffffffffffffff1614151515612ea157600080fd5b7f8be0079c53165914' +
    '1344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0612eca612544565b82604051' +
    '808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffff' +
    'ffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffff' +
    'ff1673ffffffffffffffffffffffffffffffffffffffff16815260200192505050604051' +
    '80910390a1612f488161316f565b50565b600560009054906101000a900473ffffffffff' +
    'ffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffff' +
    'ff163373ffffffffffffffffffffffffffffffffffffffff16141515612fa757600080fd' +
    '5b6001600660008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffff' +
    'ffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a' +
    '81548160ff0219169083151502179055508073ffffffffffffffffffffffffffffffffff' +
    'ffffff167fffa4e6181777692565cf28528fc88fd1516ea86b56da075235fa575af6a4b8' +
    '5560405160405180910390a250565b6000600660008373ffffffffffffffffffffffffff' +
    'ffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190' +
    '815260200160002060009054906101000a900460ff169050919050565b60006130dd8383' +
    '6040805190810160405280601e81526020017f536166654d6174683a2073756274726163' +
    '74696f6e206f766572666c6f770000815250613433565b905092915050565b6000808284' +
    '019050838110151515613165576040517f08c379a0000000000000000000000000000000' +
    '00000000000000000000000000815260040180806020018281038252601b815260200180' +
    '7f536166654d6174683a206164646974696f6e206f766572666c6f770000000000815250' +
    '60200191505060405180910390fd5b8091505092915050565b806000806101000a815481' +
    '73ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffff' +
    'ffffffffffffffffffffff16021790555050565b600073ffffffffffffffffffffffffff' +
    'ffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415151561' +
    '327d576040517f08c379a000000000000000000000000000000000000000000000000000' +
    '00000081526004018080602001828103825260248152602001807f45524332303a206170' +
    '70726f76652066726f6d20746865207a65726f2061646481526020017f72657373000000' +
    '000000000000000000000000000000000000000000000000008152506040019150506040' +
    '5180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffff' +
    'ffffffffffffffffffffffffffffffffff1614151515613348576040517f08c379a00000' +
    '000000000000000000000000000000000000000000000000000081526004018080602001' +
    '828103825260228152602001807f45524332303a20617070726f766520746f2074686520' +
    '7a65726f20616464726581526020017f7373000000000000000000000000000000000000' +
    '00000000000000000000000081525060400191505060405180910390fd5b806002600085' +
    '73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffff' +
    'ffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffff' +
    'ffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260' +
    '2001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffff' +
    'ff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f' +
    '71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258360405180828152602001915050' +
    '60405180910390a3505050565b60008084841115839015156134e3576040517f08c379a0' +
    '000000000000000000000000000000000000000000000000000000008152600401808060' +
    '2001828103825283818151815260200191508051906020019080838360005b8381101561' +
    '34a857808201518184015260208101905061348d565b50505050905090810190601f1680' +
    '156134d55780820380516001836020036101000a031916815260200191505b5092505050' +
    '60405180910390fd5b508385039050809150509392505050565b82805460018160011615' +
    '6101000203166002900490600052602060002090601f016020900481019282601f106135' +
    '3557805160ff1916838001178555613563565b8280016001018555821561356357918201' +
    '5b82811115613562578251825591602001919060010190613547565b5b50905061357091' +
    '90613574565b5090565b61359691905b8082111561359257600081600090555060010161' +
    '357a565b5090565b905600a165627a7a72305820e15de5c992fd476a4778192f1e437474' +
    'd0da61a53e449a2db2ec25213f4be8620029'
  )

  // 0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B
  // nonce: 0
  const mockUnitrollerDeploymentData = (
    '0x608060405234801561001057600080fd5b50600080546001600160a01b031916331790' +
    '556105db806100326000396000f3fe60806040526004361061007b5760003560e01c8063' +
    'dcfbc0c71161004e578063dcfbc0c71461019e578063e992a041146101b3578063e9c714' +
    'f2146101e6578063f851a440146101fb5761007b565b806326782247146100fe578063b7' +
    '1d1a0c1461012f578063bb82aa5e14610174578063c1e8033414610189575b6002546040' +
    '516000916001600160a01b03169082903690808383808284376040519201945060009350' +
    '9091505080830381855af49150503d80600081146100de576040519150601f19603f3d01' +
    '1682016040523d82523d6000602084013e6100e3565b606091505b505090506040513d60' +
    '00823e8180156100fa573d82f35b3d82fd5b34801561010a57600080fd5b506101136102' +
    '10565b604080516001600160a01b039092168252519081900360200190f35b3480156101' +
    '3b57600080fd5b506101626004803603602081101561015257600080fd5b503560016001' +
    '60a01b031661021f565b60408051918252519081900360200190f35b3480156101805760' +
    '0080fd5b506101136102b0565b34801561019557600080fd5b506101626102bf565b3480' +
    '156101aa57600080fd5b506101136103ba565b3480156101bf57600080fd5b5061016260' +
    '0480360360208110156101d657600080fd5b50356001600160a01b03166103c9565b3480' +
    '156101f257600080fd5b5061016261044d565b34801561020757600080fd5b5061011361' +
    '0533565b6001546001600160a01b031681565b600080546001600160a01b031633146102' +
    '455761023e6001600e610542565b90506102ab565b600180546001600160a01b03848116' +
    '6001600160a01b0319831681179093556040805191909216808252602082019390935281' +
    '517fca4f2f25d0898edd99413412fb94012f9e54ec8142f9b093e7720646a95b16a99291' +
    '81900390910190a160005b9150505b919050565b6002546001600160a01b031681565b60' +
    '03546000906001600160a01b0316331415806102e557506003546001600160a01b031615' +
    '5b156102fc576102f5600180610542565b90506103b7565b600280546003805460016001' +
    '60a01b038082166001600160a01b03198086168217968790559092169092556040805193' +
    '8316808552949092166020840152815190927fd604de94d45953f9138079ec1b82d533cb' +
    '2160c906d1076d1f7ed54befbca97a92908290030190a1600354604080516001600160a0' +
    '1b038085168252909216602083015280517fe945ccee5d701fc83f9b8aa8ca94ea4219ec' +
    '1fcbd4f4cab4f0ea57c5c3e1d8159281900390910190a160005b925050505b90565b6003' +
    '546001600160a01b031681565b600080546001600160a01b031633146103e85761023e60' +
    '01600f610542565b600380546001600160a01b038481166001600160a01b031983161792' +
    '8390556040805192821680845293909116602083015280517fe945ccee5d701fc83f9b8a' +
    'a8ca94ea4219ec1fcbd4f4cab4f0ea57c5c3e1d8159281900390910190a160006102a756' +
    '5b6001546000906001600160a01b031633141580610468575033155b15610479576102f5' +
    '60016000610542565b60008054600180546001600160a01b038082166001600160a01b03' +
    '198086168217968790559092169092556040805193831680855294909216602084015281' +
    '5190927ff9ffabca9c8276e99321725bcb43fb076a6c66a54b7f21c4e8146d8519b417dc' +
    '92908290030190a1600154604080516001600160a01b0380851682529092166020830152' +
    '80517fca4f2f25d0898edd99413412fb94012f9e54ec8142f9b093e7720646a95b16a992' +
    '81900390910190a160006103b2565b6000546001600160a01b031681565b60007f45b96f' +
    'e442630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa083601181111561' +
    '057157fe5b83601381111561057d57fe5b60408051928352602083019190915260008282' +
    '0152519081900360600190a18260118111156105a857fe5b939250505056fea165627a7a' +
    '72305820deb1fa7c9392a8cb5591582fb6e4b04575db52ce8ef799b0a7a5140ae6ff75d8' +
    '0029'
  )

  // 0x178053c06006e67e09879C09Ff012fF9d263dF29
  // nonce: 68
  const mockCurrentComptrollerDeploymentData = (
    '0x608060405234801561001057600080fd5b50600080546001600160a01b031916331790' +
    '55612d15806100326000396000f3fe608060405234801561001057600080fd5b50600436' +
    '106102315760003560e01c80638e8f294b11610130578063d02f7351116100b8578063e4' +
    '028eee1161007c578063e4028eee1461090e578063e87554461461093a578063eabe7d91' +
    '14610942578063ede4edd014610978578063f851a4401461099e57610231565b8063d02f' +
    '735114610841578063d9226ced14610887578063da3d454c146108a4578063dce1544914' +
    '6108da578063dcfbc0c71461090657610231565b8063abfceffc116100ff578063abfcef' +
    'fc14610695578063bb82aa5e1461070b578063bdcdc25814610713578063c29982381461' +
    '074f578063c488847b146107f257610231565b80638e8f294b146105f8578063929fe9a1' +
    '1461063957806394b2294b14610667578063a76b3fda1461066f57610231565b80634ef4' +
    'c3e1116101be5780635ec88c79116101825780635ec88c79146104e45780635fc7e71e14' +
    '6105285780636a56947e1461056e5780636d35bf91146105aa5780637dc0d1d0146105f0' +
    '57610231565b80634ef4c3e1146103f95780634fd42e171461042f57806351dff9891461' +
    '044c57806355ee1fe1146104885780635c778605146104ae57610231565b8063317b0b77' +
    '11610205578063317b0b771461030857806332000e001461032557806341c728b9146103' +
    '6957806347ef3b3b146103a55780634ada90af146103f157610231565b80627e3dd21461' +
    '02365780631ededc911461025257806324008a621461029657806326782247146102e457' +
    '5b600080fd5b61023e6109a6565b604080519115158252519081900360200190f35b6102' +
    '94600480360360a081101561026857600080fd5b506001600160a01b0381358116916020' +
    '81013582169160408201351690606081013590608001356109ab565b005b6102d2600480' +
    '360360808110156102ac57600080fd5b506001600160a01b038135811691602081013582' +
    '169160408201351690606001356109b2565b60408051918252519081900360200190f35b' +
    '6102ec6109e8565b604080516001600160a01b039092168252519081900360200190f35b' +
    '6102d26004803603602081101561031e57600080fd5b50356109f7565b61029460048036' +
    '0360a081101561033b57600080fd5b506001600160a01b03813581169160208101359091' +
    '1690604081013590606081013590608001351515610b05565b6102946004803603608081' +
    '101561037f57600080fd5b506001600160a01b0381358116916020810135909116906040' +
    '8101359060600135610fcd565b610294600480360360c08110156103bb57600080fd5b50' +
    '6001600160a01b0381358116916020810135821691604082013581169160608101359091' +
    '169060808101359060a00135610fd3565b6102d2610fd8565b6102d26004803603606081' +
    '101561040f57600080fd5b506001600160a01b0381358116916020810135909116906040' +
    '0135610fde565b6102d26004803603602081101561044557600080fd5b5035611015565b' +
    '6102946004803603608081101561046257600080fd5b506001600160a01b038135811691' +
    '60208101359091169060408101359060600135611104565b6102d2600480360360208110' +
    '1561049e57600080fd5b50356001600160a01b0316611167565b61029460048036036060' +
    '8110156104c457600080fd5b506001600160a01b03813581169160208101359091169060' +
    '4001356111e9565b61050a600480360360208110156104fa57600080fd5b503560016001' +
    '60a01b03166111ee565b6040805193845260208401929092528282015251908190036060' +
    '0190f35b6102d2600480360360a081101561053e57600080fd5b506001600160a01b0381' +
    '358116916020810135821691604082013581169160608101359091169060800135611223' +
    '565b6102946004803603608081101561058457600080fd5b506001600160a01b03813581' +
    '169160208101358216916040820135169060600135610fcd565b610294600480360360a0' +
    '8110156105c057600080fd5b506001600160a01b03813581169160208101358216916040' +
    '820135811691606081013590911690608001356109ab565b6102ec6113aa565b61061e60' +
    '04803603602081101561060e57600080fd5b50356001600160a01b03166113b9565b6040' +
    '8051921515835260208301919091528051918290030190f35b61023e6004803603604081' +
    '101561064f57600080fd5b506001600160a01b03813581169160200135166113d8565b61' +
    '02d261140c565b6102d26004803603602081101561068557600080fd5b50356001600160' +
    'a01b0316611412565b6106bb600480360360208110156106ab57600080fd5b5035600160' +
    '0160a01b0316611541565b60408051602080825283518183015283519192839290830191' +
    '858101910280838360005b838110156106f75781810151838201526020016106df565b50' +
    '5050509050019250505060405180910390f35b6102ec6115ca565b6102d2600480360360' +
    '8081101561072957600080fd5b506001600160a01b038135811691602081013582169160' +
    '408201351690606001356115d9565b6106bb6004803603602081101561076557600080fd' +
    '5b81019060208101813564010000000081111561078057600080fd5b8201836020820111' +
    '1561079257600080fd5b8035906020019184602083028401116401000000008311171561' +
    '07b457600080fd5b91908080602002602001604051908101604052809392919081815260' +
    '20018383602002808284376000920191909152509295506115e6945050505050565b6108' +
    '286004803603606081101561080857600080fd5b506001600160a01b0381358116916020' +
    '810135909116906040013561178a565b6040805192835260208301919091528051918290' +
    '030190f35b6102d2600480360360a081101561085757600080fd5b506001600160a01b03' +
    '81358116916020810135821691604082013581169160608101359091169060800135611a' +
    '05565b6102d26004803603602081101561089d57600080fd5b5035611b4b565b6102d260' +
    '0480360360608110156108ba57600080fd5b506001600160a01b03813581169160208101' +
    '359091169060400135611baf565b6102ec600480360360408110156108f057600080fd5b' +
    '506001600160a01b038135169060200135611ce6565b6102ec611d1b565b6102d2600480' +
    '3603604081101561092457600080fd5b506001600160a01b038135169060200135611d2a' +
    '565b6102d2611edd565b6102d26004803603606081101561095857600080fd5b50600160' +
    '0160a01b03813581169160208101359091169060400135611ee3565b6102d26004803603' +
    '602081101561098e57600080fd5b50356001600160a01b0316611ef0565b6102ec612206' +
    '565b600181565b5050505050565b6001600160a01b038416600090815260096020526040' +
    '81205460ff166109da575060096109e0565b60005b90505b949350505050565b60015460' +
    '01600160a01b031681565b6000610a01612215565b610a1857610a116001600461226056' +
    '5b9050610b00565b610a20612bde565b506040805160208101909152828152610a37612b' +
    'de565b50604080516020810190915266b1a2bc2ec500008152610a5782826122c6565b15' +
    '610a7057610a67600580612260565b92505050610b00565b610a78612bde565b50604080' +
    '5160208101909152670c7d713b49da00008152610a9981846122ce565b15610ab357610a' +
    'a9600580612260565b9350505050610b00565b6005805490869055604080518281526020' +
    '810188905281517f3b9670cf975d26958e754b57098eaa2ac914d8d2a31b83257997b9f3' +
    '46110fd9929181900390910190a160005b9450505050505b919050565b846001600160a0' +
    '1b031663f851a4406040518163ffffffff1660e01b815260040160206040518083038186' +
    '803b158015610b3e57600080fd5b505afa158015610b52573d6000803e3d6000fd5b5050' +
    '50506040513d6020811015610b6857600080fd5b50516001600160a01b03163314610bb3' +
    '57604051600160e51b62461bcd0281526004018080602001828103825260278152602001' +
    '80612cc36027913960400191505060405180910390fd5b6000856001600160a01b031663' +
    'c1e803346040518163ffffffff1660e01b8152600401602060405180830381600087803b' +
    '158015610bf057600080fd5b505af1158015610c04573d6000803e3d6000fd5b50505050' +
    '6040513d6020811015610c1a57600080fd5b505190508015610c745760408051600160e5' +
    '1b62461bcd02815260206004820152601560248201527f6368616e6765206e6f74206175' +
    '74686f72697a65640000000000000000000000604482015290519081900360640190fd5b' +
    '81610fc55760008690506000816001600160a01b03166355ee1fe1886040518263ffffff' +
    'ff1660e01b815260040180826001600160a01b03166001600160a01b0316815260200191' +
    '5050602060405180830381600087803b158015610cd857600080fd5b505af1158015610c' +
    'ec573d6000803e3d6000fd5b505050506040513d6020811015610d0257600080fd5b5051' +
    '90508015610d5c5760408051600160e51b62461bcd028152602060048201526016602482' +
    '01527f736574207072696365206f7261636c65206572726f720000000000000000000060' +
    '4482015290519081900360640190fd5b816001600160a01b031663317b0b778760405182' +
    '63ffffffff1660e01b815260040180828152602001915050602060405180830381600087' +
    '803b158015610da257600080fd5b505af1158015610db6573d6000803e3d6000fd5b5050' +
    '50506040513d6020811015610dcc57600080fd5b505190508015610e2657604080516001' +
    '60e51b62461bcd02815260206004820152601660248201527f73657420636c6f73652066' +
    '6163746f72206572726f7200000000000000000000604482015290519081900360640190' +
    'fd5b816001600160a01b031663d9226ced866040518263ffffffff1660e01b8152600401' +
    '80828152602001915050602060405180830381600087803b158015610e6c57600080fd5b' +
    '505af1158015610e80573d6000803e3d6000fd5b505050506040513d6020811015610e96' +
    '57600080fd5b505190508015610ef05760408051600160e51b62461bcd02815260206004' +
    '820152601560248201527f736574206d61782061737373657473206572726f7200000000' +
    '00000000000000604482015290519081900360640190fd5b816001600160a01b0316634f' +
    'd42e17670de0b6b3a76400006040518263ffffffff1660e01b8152600401808281526020' +
    '01915050602060405180830381600087803b158015610f3e57600080fd5b505af1158015' +
    '610f52573d6000803e3d6000fd5b505050506040513d6020811015610f6857600080fd5b' +
    '505190508015610fc25760408051600160e51b62461bcd02815260206004820152601f60' +
    '248201527f736574206c69717569646174696f6e20696e63656e74697665206572726f72' +
    '00604482015290519081900360640190fd5b50505b505050505050565b50505050565b61' +
    '0fc5565b60065481565b6001600160a01b03831660009081526009602052604081205460' +
    'ff166110085760095b905061100e565b60005b90505b9392505050565b600061101f6122' +
    '15565b61102f57610a116001600b612260565b611037612bde565b506040805160208101' +
    '90915282815261104e612bde565b506040805160208101909152670de0b6b3a764000081' +
    '5261106f82826122ce565b1561108057610a676007600c612260565b611088612bde565b' +
    '5060408051602081019091526714d1120d7b16000081526110a981846122ce565b156110' +
    'ba57610aa96007600c612260565b60068054908690556040805182815260208101889052' +
    '81517faeba5a6c40a8ac138134bff1aaa65debf25971188a58804bad717f82f0ec131692' +
    '9181900390910190a16000610af9565b801580156111125750600082115b15610fcd5760' +
    '408051600160e51b62461bcd02815260206004820152601160248201527f72656465656d' +
    '546f6b656e73207a65726f00000000000000000000000000000060448201529051908190' +
    '0360640190fd5b6000611171612215565b61118157610a1160016010612260565b600480' +
    '546001600160a01b038481166001600160a01b0319831681179093556040805191909216' +
    '808252602082019390935281517fd52b2b9b7e9ee655fcb95d2e5b9e0c9f69e7ef2b8e9d' +
    '2d0ea78402d576d22e22929181900390910190a160009392505050565b505050565b6000' +
    '806000806000806112058760008060006122d5565b925092509250826011811115611217' +
    '57fe5b97919650945092505050565b6001600160a01b0385166000908152600960205260' +
    '4081205460ff16158061126457506001600160a01b038516600090815260096020526040' +
    '90205460ff16155b156112735760095b90506113a1565b60008061127f856126fd565b91' +
    '93509091506000905082601181111561129557fe5b146112af578160118111156112a657' +
    'fe5b925050506113a1565b806112bb5760036112a6565b6000886001600160a01b031663' +
    '95dd9193876040518263ffffffff1660e01b815260040180826001600160a01b03166001' +
    '600160a01b0316815260200191505060206040518083038186803b158015611313576000' +
    '80fd5b505afa158015611327573d6000803e3d6000fd5b505050506040513d6020811015' +
    '61133d57600080fd5b505160408051602081019091526005548152909150600090819061' +
    '1361908461271d565b9092509050600082600381111561137457fe5b1461138857600b5b' +
    '955050505050506113a1565b8087111561139757601161137c565b600095505050505050' +
    '5b95945050505050565b6004546001600160a01b031681565b6009602052600090815260' +
    '409020805460019091015460ff9091169082565b6001600160a01b038082166000908152' +
    '600960209081526040808320938616835260029093019052205460ff165b92915050565b' +
    '60075481565b600080546001600160a01b0316331461143157610a116001601261226056' +
    '5b6001600160a01b03821660009081526009602052604090205460ff161561145e57610a' +
    '11600a6011612260565b816001600160a01b031663fe9c44ae6040518163ffffffff1660' +
    'e01b815260040160206040518083038186803b15801561149757600080fd5b505afa1580' +
    '156114ab573d6000803e3d6000fd5b505050506040513d60208110156114c157600080fd' +
    '5b50506040805180820182526001808252600060208084018281526001600160a01b0388' +
    '1680845260098352928690209451855460ff191690151517855551939092019290925582' +
    '5191825291517fcf583bb0c569eb967f806b11601c4cb93c10310485c67add5f8362c2f2' +
    '12321f929181900390910190a1600092915050565b60608060086000846001600160a01b' +
    '03166001600160a01b031681526020019081526020016000208054806020026020016040' +
    '519081016040528092919081815260200182805480156115bd5760200282019190600052' +
    '6020600020905b81546001600160a01b0316815260019091019060200180831161159f57' +
    '5b5093979650505050505050565b6002546001600160a01b031681565b60006109dd8585' +
    '84612771565b606060008251905060608160405190808252806020026020018201604052' +
    '801561161a578160200160208202803883390190505b50905060005b8281101561178257' +
    '600085828151811061163657fe5b6020908102919091018101516001600160a01b038116' +
    '60009081526009909252604090912080549192509060ff1661168a5760095b8484815181' +
    '1061167757fe5b602002602001018181525050505061177a565b33600090815260028201' +
    '602052604090205460ff161515600114156116b057600061166b565b6007543360009081' +
    '5260086020526040902054106116cf57601061166b565b33600081815260028301602090' +
    '81526040808320805460ff19166001908117909155600883528184208054918201815584' +
    '529282902090920180546001600160a01b0387166001600160a01b031990911681179091' +
    '5582519081529081019290925280517f3ab23ab0d51cccc0c3085aec51f99228625aa1a9' +
    '22b3a8ca89a26b0f2027a1a59281900390910190a1600084848151811061176b57fe5b60' +
    '200260200101818152505050505b600101611620565b509392505050565b600480546040' +
    '8051600160e01b63fc57d4df0281526001600160a01b0387811694820194909452905160' +
    '00938493849391169163fc57d4df91602480820192602092909190829003018186803b15' +
    '80156117e357600080fd5b505afa1580156117f7573d6000803e3d6000fd5b5050505060' +
    '40513d602081101561180d57600080fd5b50516004805460408051600160e01b63fc57d4' +
    'df0281526001600160a01b038a8116948201949094529051939450600093929091169163' +
    'fc57d4df91602480820192602092909190829003018186803b15801561186957600080fd' +
    '5b505afa15801561187d573d6000803e3d6000fd5b505050506040513d60208110156118' +
    '9357600080fd5b505190508115806118a2575080155b156118b757600d93506000925061' +
    '19fd915050565b6000866001600160a01b031663182df0f56040518163ffffffff1660e0' +
    '1b815260040160206040518083038186803b1580156118f257600080fd5b505afa158015' +
    '611906573d6000803e3d6000fd5b505050506040513d602081101561191c57600080fd5b' +
    '50519050600061192a612bde565b611932612bde565b61193a612bde565b600061194860' +
    '0654896127e0565b94509050600081600381111561195a57fe5b1461197657600b5b9950' +
    '600098506119fd975050505050505050565b61198087876127e0565b9350905060008160' +
    '0381111561199257fe5b1461199e57600b611962565b6119a8848461281b565b92509050' +
    '60008160038111156119ba57fe5b146119c657600b611962565b6119d0828c61271d565b' +
    '9550905060008160038111156119e257fe5b146119ee57600b611962565b600099509397' +
    '50505050505050505b935093915050565b6001600160a01b038516600090815260096020' +
    '52604081205460ff161580611a4657506001600160a01b03851660009081526009602052' +
    '604090205460ff16155b15611a5257600961126c565b846001600160a01b0316635fe3b5' +
    '676040518163ffffffff1660e01b815260040160206040518083038186803b158015611a' +
    '8b57600080fd5b505afa158015611a9f573d6000803e3d6000fd5b505050506040513d60' +
    '20811015611ab557600080fd5b505160408051600160e01b635fe3b56702815290516001' +
    '600160a01b0392831692891691635fe3b567916004808301926020929190829003018186' +
    '803b158015611afe57600080fd5b505afa158015611b12573d6000803e3d6000fd5b5050' +
    '50506040513d6020811015611b2857600080fd5b50516001600160a01b031614611b3f57' +
    '600261126c565b60009695505050505050565b6000611b55612215565b611b6557610a11' +
    '6001600d612260565b6007805490839055604080518281526020810185905281517f7093' +
    'cf1eb653f749c3ff531d6df7f92764536a7fa0d13530cd26e070780c32ea929181900390' +
    '910190a1600061100e565b6001600160a01b038316600090815260096020526040812054' +
    '60ff16611bd6576009611001565b6001600160a01b038085166000908152600960209081' +
    '526040808320938716835260029093019052205460ff16611c0e576008611001565b6004' +
    '805460408051600160e01b63fc57d4df0281526001600160a01b03888116948201949094' +
    '529051929091169163fc57d4df91602480820192602092909190829003018186803b1580' +
    '15611c6257600080fd5b505afa158015611c76573d6000803e3d6000fd5b505050506040' +
    '513d6020811015611c8c57600080fd5b5051611c9957600d611001565b600080611ca985' +
    '876000876122d5565b91935090915060009050826011811115611cbf57fe5b14611cd957' +
    '816011811115611cd057fe5b9250505061100e565b8015611b3f576004611cd0565b6008' +
    '6020528160005260406000208181548110611cff57fe5b60009182526020909120015460' +
    '01600160a01b03169150829050565b6003546001600160a01b031681565b600080546001' +
    '600160a01b03163314611d5057611d4960016006612260565b9050611406565b60016001' +
    '60a01b0383166000908152600960205260409020805460ff16611d8557611d7d60096007' +
    '612260565b915050611406565b611d8d612bde565b506040805160208101909152838152' +
    '611da4612bde565b506040805160208101909152670c7d713b49da00008152611dc58183' +
    '6122ce565b15611de057611dd660066008612260565b9350505050611406565b84158015' +
    '90611e6c57506004805460408051600160e01b63fc57d4df0281526001600160a01b038a' +
    '8116948201949094529051929091169163fc57d4df916024808201926020929091908290' +
    '03018186803b158015611e3e57600080fd5b505afa158015611e52573d6000803e3d6000' +
    'fd5b505050506040513d6020811015611e6857600080fd5b5051155b15611e7d57611dd6' +
    '600d6009612260565b60018301805490869055604080516001600160a01b038916815260' +
    '20810183905280820188905290517f70483e6592cd5182d45ac970e05bc62cdcc90e9d8e' +
    'f2c2dbe686cf383bcd7fc59181900360600190a16000979650505050505050565b600554' +
    '81565b600061100b848484612771565b6000808290506000806000836001600160a01b03' +
    '1663c37f68e2336040518263ffffffff1660e01b815260040180826001600160a01b0316' +
    '6001600160a01b0316815260200191505060806040518083038186803b158015611f5157' +
    '600080fd5b505afa158015611f65573d6000803e3d6000fd5b505050506040513d608081' +
    '1015611f7b57600080fd5b50805160208201516040909201519094509092509050821561' +
    '1fd157604051600160e51b62461bcd028152600401808060200182810382526025815260' +
    '200180612c9e6025913960400191505060405180910390fd5b8015611fee57611fe3600c' +
    '6002612260565b945050505050610b00565b6000611ffb873385612771565b9050801561' +
    '201c57612010600e600383612833565b95505050505050610b00565b6001600160a01b03' +
    '85166000908152600960209081526040808320338452600281019092529091205460ff16' +
    '61205b5760009650505050505050610b00565b3360009081526002820160209081526040' +
    '808320805460ff1916905560088252918290208054835181840281018401909452808452' +
    '606093928301828280156120cd57602002820191906000526020600020905b8154600160' +
    '0160a01b031681526001909101906020018083116120af575b5050835193945083925060' +
    '009150505b8281101561212257896001600160a01b03168482815181106120fb57fe5b60' +
    '200260200101516001600160a01b0316141561211a57809150612122565b6001016120dd' +
    '565b5081811061212c57fe5b336000908152600860205260409020805481906000198101' +
    '90811061214d57fe5b9060005260206000200160009054906101000a90046001600160a0' +
    '1b031681838154811061217757fe5b600091825260209091200180546001600160a01b03' +
    '19166001600160a01b039290921691909117905580546121b0826000198301612bf1565b' +
    '50604080516001600160a01b038c16815233602082015281517fe699a64c18b07ac5b730' +
    '1aa273f36a2287239eb9501d81950672794afba29a0d929181900390910190a160009c9b' +
    '505050505050505050505050565b6000546001600160a01b031681565b60025460009081' +
    '906001600160a01b03163314801561223e57506000546001600160a01b031632145b6000' +
    '549091506001600160a01b0316331480806122585750815b925050505b90565b60007f45' +
    'b96fe442630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa08360118111' +
    '1561228f57fe5b83601381111561229b57fe5b6040805192835260208301919091526000' +
    '82820152519081900360600190a182601181111561100e57fe5b519051111590565b5190' +
    '511090565b60008060006122e2612c15565b6001600160a01b0388166000908152600860' +
    '209081526040808320805482518185028101850190935280835284936060939291908301' +
    '8282801561234f57602002820191906000526020600020905b81546001600160a01b0316' +
    '8152600190910190602001808311612331575b50939450600093505050505b8151811015' +
    '6126ae57600082828151811061237257fe5b60200260200101519050806001600160a01b' +
    '031663c37f68e28e6040518263ffffffff1660e01b815260040180826001600160a01b03' +
    '166001600160a01b0316815260200191505060806040518083038186803b1580156123d2' +
    '57600080fd5b505afa1580156123e6573d6000803e3d6000fd5b505050506040513d6080' +
    '8110156123fc57600080fd5b508051602082015160408084015160609485015160808c01' +
    '52938a019390935291880191909152945084156124425750600f97506000965086955061' +
    '26f3945050505050565b60408051602080820183526001600160a01b0380851660008181' +
    '526009845285902060010154845260c08b01939093528351808301855260808b01518152' +
    '60e08b0152600480548551600160e01b63fc57d4df028152918201949094529351921692' +
    '63fc57d4df9260248083019392829003018186803b1580156124c557600080fd5b505afa' +
    '1580156124d9573d6000803e3d6000fd5b505050506040513d60208110156124ef576000' +
    '80fd5b505160a087018190526125135750600d9750600096508695506126f39450505050' +
    '50565b604080516020810190915260a08701518152610100870181905260c087015160e0' +
    '88015161254092612899565b6101208801529350600084600381111561255657fe5b1461' +
    '25725750600b9750600096508695506126f3945050505050565b61258a86610120015187' +
    '6040015188600001516128f1565b87529350600084600381111561259c57fe5b146125b8' +
    '5750600b9750600096508695506126f3945050505050565b6125d0866101000151876060' +
    '015188602001516128f1565b6020880152935060008460038111156125e557fe5b146126' +
    '015750600b9750600096508695506126f3945050505050565b8b6001600160a01b031681' +
    '6001600160a01b031614156126a55761262f8661012001518c88602001516128f1565b60' +
    '208801529350600084600381111561264457fe5b146126605750600b9750600096508695' +
    '506126f3945050505050565b6126748661010001518b88602001516128f1565b60208801' +
    '529350600084600381111561268957fe5b146126a55750600b9750600096508695506126' +
    'f3945050505050565b5060010161235b565b506020840151845111156126d55750505060' +
    '208101519051600094500391508290506126f3565b505081516020909201516000955085' +
    '94509190910391506126f39050565b9450945094915050565b6000806000612710846000' +
    '8060006122d5565b9250925092509193909250565b600080600061272a612bde565b6127' +
    '34868661293e565b9092509050600082600381111561274757fe5b146127585750915060' +
    '00905061276a565b6000612763826129a6565b9350935050505b9250929050565b600160' +
    '0160a01b03831660009081526009602052604081205460ff16612798576009611001565b' +
    '6001600160a01b0380851660009081526009602090815260408083209387168352600290' +
    '93019052205460ff166127d0576000611001565b600080611ca985878660006122d5565b' +
    '60006127ea612bde565b6128106040518060200160405280868152506040518060200160' +
    '405280868152506129b5565b915091509250929050565b6000612825612bde565b835183' +
    '516128109190612a9e565b60007f45b96fe442630264581b197e84bbada861235052c5a1' +
    'aadfff9ea4e40a969aa084601181111561286257fe5b84601381111561286e57fe5b6040' +
    '80519283526020830191909152818101859052519081900360600190a183601181111561' +
    '100b57fe5b60006128a3612bde565b60006128ad612bde565b6128b787876129b5565b90' +
    '9250905060008260038111156128ca57fe5b146128d95790925090506119fd565b6128e3' +
    '81866129b5565b935093505050935093915050565b60008060006128fe612bde565b6129' +
    '08878761293e565b9092509050600082600381111561291b57fe5b1461292c5750915060' +
    '0090506119fd565b6128e3612938826129a6565b86612b4e565b6000612948612bde565b' +
    '600080612959866000015186612b74565b9092509050600082600381111561296c57fe5b' +
    '1461298b5750604080516020810190915260008152909250905061276a565b6040805160' +
    '2081019091529081526000969095509350505050565b51670de0b6b3a764000090049056' +
    '5b60006129bf612bde565b6000806129d486600001518660000151612b74565b90925090' +
    '5060008260038111156129e757fe5b14612a065750604080516020810190915260008152' +
    '909250905061276a565b600080612a1b6706f05b59d3b2000084612b4e565b9092509050' +
    '6000826003811115612a2e57fe5b14612a50575060408051602081019091526000815290' +
    '9450925061276a915050565b600080612a6583670de0b6b3a7640000612bb3565b909250' +
    '90506000826003811115612a7857fe5b14612a7f57fe5b60408051602081019091529081' +
    '5260009a909950975050505050505050565b6000612aa8612bde565b600080612abd8667' +
    '0de0b6b3a7640000612b74565b90925090506000826003811115612ad057fe5b14612aef' +
    '5750604080516020810190915260008152909250905061276a565b600080612afc838861' +
    '2bb3565b90925090506000826003811115612b0f57fe5b14612b31575060408051602081' +
    '0190915260008152909450925061276a915050565b604080516020810190915290815260' +
    '009890975095505050505050565b600080838301848110612b665760009250905061276a' +
    '565b50600291506000905061276a565b60008083612b875750600090508061276a565b83' +
    '830283858281612b9457fe5b0414612ba85750600291506000905061276a565b60009250' +
    '905061276a565b60008082612bc7575060019050600061276a565b6000838581612bd257' +
    'fe5b04915091509250929050565b6040518060200160405280600081525090565b815481' +
    '8355818111156111e9576000838152602090206111e9918101908301612c7f565b604051' +
    '806101400160405280600081526020016000815260200160008152602001600081526020' +
    '016000815260200160008152602001612c53612bde565b8152602001612c60612bde565b' +
    '8152602001612c6d612bde565b8152602001612c7a612bde565b905290565b61225d9190' +
    '5b80821115612c995760008155600101612c85565b509056fe657869744d61726b65743a' +
    '206765744163636f756e74536e617073686f74206661696c65646f6e6c7920756e697472' +
    '6f6c6c65722061646d696e2063616e206368616e676520627261696e73a165627a7a7230' +
    '582075d92d0e96eb01957b794704a02af0b7e3c5efe630de7186f3688639d7128e900029'
  )

  // 0xa1046abfc2598F48C44Fb320d281d3F3c0733c9a
  // nonce: 7
  const mockCDaiIRMDeploymentData = (
    '0x608060405234801561001057600080fd5b506040516040806106638339810180604052' +
    '604081101561003057600080fd5b50805160209091015160019190915560005561061280' +
    '6100516000396000f3fe608060405234801561001057600080fd5b506004361061005757' +
    '60003560e01c806315f240531461005c5780631b3ed7221461009e5780631f68f20a1461' +
    '00b85780632191f92a146100c0578063a385fb96146100dc575b600080fd5b6100856004' +
    '803603606081101561007257600080fd5b50803590602081013590604001356100e4565b' +
    '6040805192835260208301919091528051918290030190f35b6100a661017d565b604080' +
    '51918252519081900360200190f35b6100a6610183565b6100c8610189565b6040805191' +
    '15158252519081900360200190f35b6100a661018e565b60008060006100f16105d3565b' +
    '6100f96105d3565b6101038888610195565b919450925090506000836004811115610118' +
    '57fe5b146101385782600481111561012957fe5b94506000935061017592505050565b60' +
    '006101426105d3565b61014f8362201480610312565b9092509050600082600381111561' +
    '016257fe5b1461016957fe5b51600096509450505050505b935093915050565b60005481' +
    '565b60015481565b600181565b6220148081565b600061019f6105d3565b6101a76105d3' +
    '565b60006101b16105d3565b6101bb878761037c565b9092509050600082600481111561' +
    '01ce57fe5b146101fc575060408051602080820183526000808352835191820190935291' +
    '8252919450909250905061030b565b60006102066105d3565b6102128360005461043e56' +
    '5b9092509050600082600381111561022557fe5b14610257575050604080516020808201' +
    '835260008083528351918201909352918252600396509450925061030b915050565b6000' +
    '6102616105d3565b61027383670de0b6b3a7640000610312565b90925090506000826003' +
    '81111561028657fe5b1461028d57fe5b60006102976105d3565b6102b183604051806020' +
    '0160405280600154815250610459565b909250905060008260038111156102c457fe5b14' +
    '6102fa57505060408051602080820183526000808352835191820190935291825260049a' +
    '509850965061030b95505050505050565b60009a509598509496505050505050505b9250' +
    '925092565b600061031c6105d3565b60008061032d866000015186610493565b90925090' +
    '50600082600381111561034057fe5b1461035f5750604080516020810190915260008152' +
    '9092509050610375565b6040805160208101909152908152600093509150505b92509290' +
    '50565b60006103866105d3565b826103a357505060408051602081019091526000808252' +
    '90610375565b6000806103b086866104be565b909250905060008260038111156103c357' +
    'fe5b146103e4575050604080516020810190915260008152600192509050610375565b60' +
    '006103ee6105d3565b6103f887846104e4565b9092509050600082600381111561040b57' +
    'fe5b1461042f575050604080516020810190915260008152600294509250610375915050' +
    '565b60009890975095505050505050565b60006104486105d3565b60008061032d866000' +
    '015186610594565b60006104636105d3565b600080610478866000015186600001516104' +
    'be565b60408051602081019091529081529097909650945050505050565b600080826104' +
    'a75750600190506000610375565b60008385816104b257fe5b0491509150925092905056' +
    '5b6000808383018481106104d657600092509050610375565b5060029150600090506103' +
    '75565b60006104ee6105d3565b60008061050386670de0b6b3a7640000610594565b9092' +
    '509050600082600381111561051657fe5b14610535575060408051602081019091526000' +
    '81529092509050610375565b6000806105428388610493565b9092509050600082600381' +
    '111561055557fe5b14610577575060408051602081019091526000815290945092506103' +
    '75915050565b604080516020810190915290815260009890975095505050505050565b60' +
    '0080836105a757506000905080610375565b838302838582816105b457fe5b04146105c8' +
    '57506002915060009050610375565b600092509050610375565b60405180602001604052' +
    '8060008152509056fea165627a7a7230582021d1e96de1a54e5aaf17c19ae397dd393fa0' +
    'cd21afedd016b0e6d1fb0e4c749600290000000000000000000000000000000000000000' +
    '0000000000b1a2bc2ec50000000000000000000000000000000000000000000000000000' +
    '01aa535d3d0c0000'
  )

  // 0xc64C4cBA055eFA614CE01F4BAD8A9F519C4f8FaB
  // nonce: 8
  const mockCUSDCIRMDeploymentData = (
    '0x608060405234801561001057600080fd5b506040516040806106638339810180604052' +
    '604081101561003057600080fd5b50805160209091015160019190915560005561061280' +
    '6100516000396000f3fe608060405234801561001057600080fd5b506004361061005757' +
    '60003560e01c806315f240531461005c5780631b3ed7221461009e5780631f68f20a1461' +
    '00b85780632191f92a146100c0578063a385fb96146100dc575b600080fd5b6100856004' +
    '803603606081101561007257600080fd5b50803590602081013590604001356100e4565b' +
    '6040805192835260208301919091528051918290030190f35b6100a661017d565b604080' +
    '51918252519081900360200190f35b6100a6610183565b6100c8610189565b6040805191' +
    '15158252519081900360200190f35b6100a661018e565b60008060006100f16105d3565b' +
    '6100f96105d3565b6101038888610195565b919450925090506000836004811115610118' +
    '57fe5b146101385782600481111561012957fe5b94506000935061017592505050565b60' +
    '006101426105d3565b61014f8362201480610312565b9092509050600082600381111561' +
    '016257fe5b1461016957fe5b51600096509450505050505b935093915050565b60005481' +
    '565b60015481565b600181565b6220148081565b600061019f6105d3565b6101a76105d3' +
    '565b60006101b16105d3565b6101bb878761037c565b9092509050600082600481111561' +
    '01ce57fe5b146101fc575060408051602080820183526000808352835191820190935291' +
    '8252919450909250905061030b565b60006102066105d3565b6102128360005461043e56' +
    '5b9092509050600082600381111561022557fe5b14610257575050604080516020808201' +
    '835260008083528351918201909352918252600396509450925061030b915050565b6000' +
    '6102616105d3565b61027383670de0b6b3a7640000610312565b90925090506000826003' +
    '81111561028657fe5b1461028d57fe5b60006102976105d3565b6102b183604051806020' +
    '0160405280600154815250610459565b909250905060008260038111156102c457fe5b14' +
    '6102fa57505060408051602080820183526000808352835191820190935291825260049a' +
    '509850965061030b95505050505050565b60009a509598509496505050505050505b9250' +
    '925092565b600061031c6105d3565b60008061032d866000015186610493565b90925090' +
    '50600082600381111561034057fe5b1461035f5750604080516020810190915260008152' +
    '9092509050610375565b6040805160208101909152908152600093509150505b92509290' +
    '50565b60006103866105d3565b826103a357505060408051602081019091526000808252' +
    '90610375565b6000806103b086866104be565b909250905060008260038111156103c357' +
    'fe5b146103e4575050604080516020810190915260008152600192509050610375565b60' +
    '006103ee6105d3565b6103f887846104e4565b9092509050600082600381111561040b57' +
    'fe5b1461042f575050604080516020810190915260008152600294509250610375915050' +
    '565b60009890975095505050505050565b60006104486105d3565b60008061032d866000' +
    '015186610594565b60006104636105d3565b600080610478866000015186600001516104' +
    'be565b60408051602081019091529081529097909650945050505050565b600080826104' +
    'a75750600190506000610375565b60008385816104b257fe5b0491509150925092905056' +
    '5b6000808383018481106104d657600092509050610375565b5060029150600090506103' +
    '75565b60006104ee6105d3565b60008061050386670de0b6b3a7640000610594565b9092' +
    '509050600082600381111561051657fe5b14610535575060408051602081019091526000' +
    '81529092509050610375565b6000806105428388610493565b9092509050600082600381' +
    '111561055557fe5b14610577575060408051602081019091526000815290945092506103' +
    '75915050565b604080516020810190915290815260009890975095505050505050565b60' +
    '0080836105a757506000905080610375565b838302838582816105b457fe5b04146105c8' +
    '57506002915060009050610375565b600092509050610375565b60405180602001604052' +
    '8060008152509056fea165627a7a7230582021d1e96de1a54e5aaf17c19ae397dd393fa0' +
    'cd21afedd016b0e6d1fb0e4c749600290000000000000000000000000000000000000000' +
    '000000000000000000000000000000000000000000000000000000000000000000000000' +
    '02c68af0bb140000'
  )

  // 0xF5DCe57282A584D2746FaF1593d3121Fcac444dC
  // nonce: 14
  const mockCDaiDeploymentData = (
    '0x60806040523480156200001157600080fd5b506040516200523c3803806200523c8339' +
    '81018060405260e08110156200003757600080fd5b815160208301516040840151606085' +
    '0151608086018051949693959294919392830192916401000000008111156200006e5760' +
    '0080fd5b820160208101848111156200008257600080fd5b815164010000000081118282' +
    '01871017156200009d57600080fd5b505092919060200180516401000000008111156200' +
    '00ba57600080fd5b82016020810184811115620000ce57600080fd5b8151640100000000' +
    '811182820187101715620000e957600080fd5b5050602090910151600160005560048054' +
    '6001600160a01b0319163317905560088690559092509050858585858585836200017057' +
    '6040517f08c379a000000000000000000000000000000000000000000000000000000000' +
    '81526004018080602001828103825260308152602001806200520c603091396040019150' +
    '5060405180910390fd5b600062000183876200036460201b60201c565b90508015620001' +
    'f357604080517f08c379a000000000000000000000000000000000000000000000000000' +
    '000000815260206004820152601a60248201527f53657474696e6720636f6d7074726f6c' +
    '6c6572206661696c6564000000000000604482015290519081900360640190fd5b620002' +
    '03620004f760201b60201c565b600a55670de0b6b3a7640000600b556200022486620004' +
    'fc602090811b901c565b905080156200027f576040517f08c379a0000000000000000000' +
    '000000000000000000000000000000000000008152600401808060200182810382526022' +
    '815260200180620051ea6022913960400191505060405180910390fd5b83516200029490' +
    '60019060208701906200071e565b508251620002aa9060029060208601906200071e565b' +
    '50506003555050601280546001600160a01b0319166001600160a01b038c811691909117' +
    '91829055604080517f18160ddd0000000000000000000000000000000000000000000000' +
    '0000000000815290519290911694506318160ddd93506004808201935060209291829003' +
    '018186803b1580156200032857600080fd5b505afa1580156200033d573d6000803e3d60' +
    '00fd5b505050506040513d60208110156200035457600080fd5b50620007c09750505050' +
    '50505050565b6004546000906001600160a01b0316331462000396576200038e6001603f' +
    '620006ae60201b60201c565b9050620004f2565b600654604080517e7e3dd20000000000' +
    '0000000000000000000000000000000000000000000000815290516001600160a01b0392' +
    '831692851691627e3dd2916004808301926020929190829003018186803b158015620003' +
    'f557600080fd5b505afa1580156200040a573d6000803e3d6000fd5b505050506040513d' +
    '60208110156200042157600080fd5b50516200048f57604080517f08c379a00000000000' +
    '0000000000000000000000000000000000000000000000815260206004820152601c6024' +
    '8201527f6d61726b6572206d6574686f642072657475726e65642066616c736500000000' +
    '604482015290519081900360640190fd5b600680546001600160a01b0319166001600160' +
    'a01b03858116918217909255604080519284168352602083019190915280517f7ac369db' +
    'd14fa5ea3f473ed67cc9d598964a77501540ba6751eb0b3decf5870d9281900390910190' +
    'a160005b9150505b919050565b435b90565b60045460009081906001600160a01b031633' +
    '1462000531576200052860016042620006ae60201b60201c565b915050620004f2565b62' +
    '000541620004f760201b60201c565b600a54146200055e5762000528600a6041620006ae' +
    '60201b60201c565b600760009054906101000a90046001600160a01b0316905082600160' +
    '0160a01b0316632191f92a6040518163ffffffff1660e01b815260040160206040518083' +
    '038186803b158015620005b057600080fd5b505afa158015620005c5573d6000803e3d60' +
    '00fd5b505050506040513d6020811015620005dc57600080fd5b50516200064a57604080' +
    '517f08c379a0000000000000000000000000000000000000000000000000000000008152' +
    '60206004820152601c60248201527f6d61726b6572206d6574686f642072657475726e65' +
    '642066616c736500000000604482015290519081900360640190fd5b6007805460016001' +
    '60a01b0319166001600160a01b0385811691821790925560408051928416835260208301' +
    '9190915280517fedffc32e068c7c95dfd4bdfd5c4d939a084d6b11c4199eac8436ed234d' +
    '72f9269281900390910190a16000620004ee565b60007f45b96fe442630264581b197e84' +
    'bbada861235052c5a1aadfff9ea4e40a969aa0836010811115620006de57fe5b83604d81' +
    '1115620006eb57fe5b604080519283526020830191909152600082820152519081900360' +
    '600190a18260108111156200071757fe5b9392505050565b828054600181600116156101' +
    '000203166002900490600052602060002090601f016020900481019282601f1062000761' +
    '57805160ff191683800117855562000791565b8280016001018555821562000791579182' +
    '015b828111156200079157825182559160200191906001019062000774565b506200079f' +
    '929150620007a3565b5090565b620004f991905b808211156200079f5760008155600101' +
    '620007aa565b614a1a80620007d06000396000f3fe608060405234801561001057600080' +
    'fd5b506004361061028a5760003560e01c80638f840ddd1161015c578063c37f68e21161' +
    '00ce578063f3fdb15a11610087578063f3fdb15a14610708578063f5e3c4621461071057' +
    '8063f851a44014610746578063f8f9da281461074e578063fca7820b14610756578063fe' +
    '9c44ae146107735761028a565b8063c37f68e214610626578063c5ebeaec146106725780' +
    '63db006a751461068f578063dd62ed3e146106ac578063e9c714f2146106da578063f2b3' +
    'abbd146106e25761028a565b8063a9059cbb11610120578063a9059cbb14610586578063' +
    'aa5af0fd146105b2578063ae9d70b0146105ba578063b2a02ff1146105c2578063b71d1a' +
    '0c146105f8578063bd6d894d1461061e5761028a565b80638f840ddd1461052b57806395' +
    'd89b411461053357806395dd91931461053b578063a0712d6814610561578063a6afed95' +
    '1461057e5761028a565b80633af9e66911610200578063675d972c116101b9578063675d' +
    '972c146104c85780636c540baf146104d05780636f307dc3146104d857806370a0823114' +
    '6104e057806373acee9814610506578063852a12e31461050e5761028a565b80633af9e6' +
    '69146104475780633b1d21a21461046d5780634576b5db1461047557806347bd37181461' +
    '049b5780635fe3b567146104a3578063601a0bf1146104ab5761028a565b806318160ddd' +
    '1161025257806318160ddd146103a9578063182df0f5146103b157806323b872dd146103' +
    'b95780632608f818146103ef578063267822471461041b578063313ce5671461043f5761' +
    '028a565b806306fdde031461028f578063095ea7b31461030c5780630e7527021461034c' +
    '578063173b99041461037b57806317bfdfbc14610383575b600080fd5b61029761077b56' +
    '5b6040805160208082528351818301528351919283929083019185019080838360005b83' +
    '8110156102d15781810151838201526020016102b9565b50505050905090810190601f16' +
    '80156102fe5780820380516001836020036101000a031916815260200191505b50925050' +
    '5060405180910390f35b6103386004803603604081101561032257600080fd5b50600160' +
    '0160a01b038135169060200135610808565b604080519115158252519081900360200190' +
    'f35b6103696004803603602081101561036257600080fd5b5035610875565b6040805191' +
    '8252519081900360200190f35b610369610888565b610369600480360360208110156103' +
    '9957600080fd5b50356001600160a01b031661088e565b610369610951565b6103696109' +
    '57565b610338600480360360608110156103cf57600080fd5b506001600160a01b038135' +
    '811691602081013590911690604001356109bd565b610369600480360360408110156104' +
    '0557600080fd5b506001600160a01b038135169060200135610a29565b610423610a3c56' +
    '5b604080516001600160a01b039092168252519081900360200190f35b610369610a4b56' +
    '5b6103696004803603602081101561045d57600080fd5b50356001600160a01b0316610a' +
    '51565b610369610abf565b6103696004803603602081101561048b57600080fd5b503560' +
    '01600160a01b0316610ace565b610369610c23565b610423610c29565b61036960048036' +
    '0360208110156104c157600080fd5b5035610c38565b610369610cc6565b610369610ccc' +
    '565b610423610cd2565b610369600480360360208110156104f657600080fd5b50356001' +
    '600160a01b0316610ce1565b610369610cfc565b61036960048036036020811015610524' +
    '57600080fd5b5035610db6565b610369610dc1565b610297610dc7565b61036960048036' +
    '03602081101561055157600080fd5b50356001600160a01b0316610e1f565b6103696004' +
    '803603602081101561057757600080fd5b5035610e7f565b610369610e8a565b61033860' +
    '04803603604081101561059c57600080fd5b506001600160a01b03813516906020013561' +
    '1286565b6103696112f1565b6103696112f7565b610369600480360360608110156105d8' +
    '57600080fd5b506001600160a01b038135811691602081013590911690604001356115d1' +
    '565b6103696004803603602081101561060e57600080fd5b50356001600160a01b031661' +
    '188e565b610369611915565b61064c6004803603602081101561063c57600080fd5b5035' +
    '6001600160a01b03166119d0565b60408051948552602085019390935283830191909152' +
    '6060830152519081900360800190f35b6103696004803603602081101561068857600080' +
    'fd5b5035611a65565b610369600480360360208110156106a557600080fd5b5035611a70' +
    '565b610369600480360360408110156106c257600080fd5b506001600160a01b03813581' +
    '16916020013516611a7b565b610369611aa6565b610369600480360360208110156106f8' +
    '57600080fd5b50356001600160a01b0316611b95565b610423611bcf565b610369600480' +
    '3603606081101561072657600080fd5b506001600160a01b038135811691602081013591' +
    '60409091013516611bde565b610423611beb565b610369611bfa565b6103696004803603' +
    '602081101561076c57600080fd5b5035611cd9565b610338611d13565b60018054604080' +
    '516020600284861615610100026000190190941693909304601f81018490048402820184' +
    '0190925281815292918301828280156108005780601f106107d557610100808354040283' +
    '529160200191610800565b820191906000526020600020905b8154815290600101906020' +
    '018083116107e357829003601f168201915b505050505081565b33600081815260106020' +
    '90815260408083206001600160a01b038716808552908352818420869055815186815291' +
    '51939493909284927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200a' +
    'c8c7c3b925929081900390910190a360019150505b92915050565b600061088082611d18' +
    '565b90505b919050565b60095481565b60008054600101808255816108a1610e8a565b14' +
    '6108f65760408051600160e51b62461bcd02815260206004820152601660248201527f61' +
    '636372756520696e746572657374206661696c6564000000000000000000006044820152' +
    '90519081900360640190fd5b6108ff83610e1f565b91505b600054811461094b57604080' +
    '51600160e51b62461bcd02815260206004820152600a6024820152600160b21b691c994b' +
    '595b9d195c995902604482015290519081900360640190fd5b50919050565b600e548156' +
    '5b6000806000610964611d54565b9092509050600082600381111561097757fe5b146109' +
    'b657604051600160e51b62461bcd02815260040180806020018281038252603581526020' +
    '01806149626035913960400191505060405180910390fd5b9150505b90565b6000805460' +
    '0101808255816109d433878787611e02565b1491505b6000548114610a21576040805160' +
    '0160e51b62461bcd02815260206004820152600a6024820152600160b21b691c994b595b' +
    '9d195c995902604482015290519081900360640190fd5b509392505050565b6000610a35' +
    '8383612116565b9392505050565b6005546001600160a01b031681565b60035481565b60' +
    '00610a5b6146bb565b6040518060200160405280610a6e611915565b90526001600160a0' +
    '1b0384166000908152600f6020526040812054919250908190610a9a9084906121a6565b' +
    '90925090506000826003811115610aad57fe5b14610ab757600080fd5b94935050505056' +
    '5b6000610ac96121fa565b905090565b6004546000906001600160a01b03163314610af6' +
    '57610aef6001603f61227d565b9050610883565b60065460408051600160e11b623f1ee9' +
    '02815290516001600160a01b0392831692851691627e3dd2916004808301926020929190' +
    '829003018186803b158015610b3e57600080fd5b505afa158015610b52573d6000803e3d' +
    '6000fd5b505050506040513d6020811015610b6857600080fd5b5051610bbe5760408051' +
    '600160e51b62461bcd02815260206004820152601c60248201527f6d61726b6572206d65' +
    '74686f642072657475726e65642066616c73650000000060448201529051908190036064' +
    '0190fd5b600680546001600160a01b0319166001600160a01b0385811691821790925560' +
    '4080519284168352602083019190915280517f7ac369dbd14fa5ea3f473ed67cc9d59896' +
    '4a77501540ba6751eb0b3decf5870d9281900390910190a160009392505050565b600c54' +
    '81565b6006546001600160a01b031681565b6000805460010180825581610c4b610e8a56' +
    '5b90508015610c7157610c69816010811115610c6257fe5b603061227d565b9250506109' +
    '02565b610c7a846122e3565b925050600054811461094b5760408051600160e51b62461b' +
    'cd02815260206004820152600a6024820152600160b21b691c994b595b9d195c99590260' +
    '4482015290519081900360640190fd5b60085481565b600a5481565b6012546001600160' +
    'a01b031681565b6001600160a01b03166000908152600f602052604090205490565b6000' +
    '805460010180825581610d0f610e8a565b14610d645760408051600160e51b62461bcd02' +
    '815260206004820152601660248201527f61636372756520696e74657265737420666169' +
    '6c656400000000000000000000604482015290519081900360640190fd5b600c54915060' +
    '00548114610db25760408051600160e51b62461bcd02815260206004820152600a602482' +
    '0152600160b21b691c994b595b9d195c995902604482015290519081900360640190fd5b' +
    '5090565b600061088082612467565b600d5481565b600280546040805160206001841615' +
    '6101000260001901909316849004601f8101849004840282018401909252818152929183' +
    '01828280156108005780601f106107d55761010080835404028352916020019161080056' +
    '5b6000806000610e2d846124a4565b90925090506000826003811115610e4057fe5b1461' +
    '0a3557604051600160e51b62461bcd028152600401808060200182810382526037815260' +
    '2001806148366037913960400191505060405180910390fd5b600061088082612558565b' +
    '6000610e946146ce565b6007546001600160a01b03166315f24053610ead6121fa565b60' +
    '0c54600d546040518463ffffffff1660e01b815260040180848152602001838152602001' +
    '8281526020019350505050604080518083038186803b158015610ef457600080fd5b505a' +
    'fa158015610f08573d6000803e3d6000fd5b505050506040513d6040811015610f1e5760' +
    '0080fd5b50805160209182015160408401819052918301526601c6bf526340001015610f' +
    '905760408051600160e51b62461bcd02815260206004820152601c60248201527f626f72' +
    '726f772072617465206973206162737572646c7920686967680000000060448201529051' +
    '9081900360640190fd5b602081015115610fb357610fab60056002836020015161259356' +
    '5b9150506109ba565b610fbb6125f9565b60608201819052600a54610fcf91906125fd56' +
    '5b6080830181905282826003811115610fe357fe5b6003811115610fee57fe5b90525060' +
    '0090508151600381111561100257fe5b1461100957fe5b61102960405180602001604052' +
    '8083604001518152508260800151612620565b60a083018190528282600381111561103d' +
    '57fe5b600381111561104857fe5b905250600090508151600381111561105c57fe5b1461' +
    '107d57610fab600960068360000151600381111561107857fe5b612593565b61108d8160' +
    'a00151600c546121a6565b60c08301819052828260038111156110a157fe5b6003811115' +
    '6110ac57fe5b90525060009050815160038111156110c057fe5b146110dc57610fab6009' +
    '60018360000151600381111561107857fe5b6110ec8160c00151600c54612688565b60e0' +
    '83018190528282600381111561110057fe5b600381111561110b57fe5b90525060009050' +
    '8151600381111561111f57fe5b1461113b57610fab600960048360000151600381111561' +
    '107857fe5b61115c60405180602001604052806009548152508260c00151600d546126ae' +
    '565b61010083018190528282600381111561117157fe5b600381111561117c57fe5b9052' +
    '50600090508151600381111561119057fe5b146111ac57610fab60096005836000015160' +
    '0381111561107857fe5b6111bf8160a00151600b54600b546126ae565b61012083018190' +
    '52828260038111156111d457fe5b60038111156111df57fe5b9052506000905081516003' +
    '8111156111f357fe5b1461120f57610fab600960038360000151600381111561107857fe' +
    '5b606080820151600a55610120820151600b81905560e0830151600c8190556101008401' +
    '51600d5560c08401516040805191825260208201939093528083019190915290517f8753' +
    '52fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9929181900390' +
    '910190a1600091505090565b600080546001018082558161129d33338787611e02565b14' +
    '91505b60005481146112ea5760408051600160e51b62461bcd0281526020600482015260' +
    '0a6024820152600160b21b691c994b595b9d195c99590260448201529051908190036064' +
    '0190fd5b5092915050565b600b5481565b600080611302610957565b6007549091506000' +
    '9081906001600160a01b03166315f240536113236121fa565b600c54600d546040518463' +
    'ffffffff1660e01b81526004018084815260200183815260200182815260200193505050' +
    '50604080518083038186803b15801561136a57600080fd5b505afa15801561137e573d60' +
    '00803e3d6000fd5b505050506040513d604081101561139457600080fd5b508051602090' +
    '910151909250905081156113e257604051600160e51b62461bcd02815260040180806020' +
    '01828103825260318152602001806148d56031913960400191505060405180910390fd5b' +
    '60006113ec6146bb565b611406604051806020016040528087815250600e54612620565b' +
    '9092509050600082600381111561141957fe5b1461145857604051600160e51b62461bcd' +
    '02815260040180806020018281038252603181526020018061486d603191396040019150' +
    '5060405180910390fd5b60006114626146bb565b61146e600c548461270a565b90925090' +
    '50600082600381111561148157fe5b146114c057604051600160e51b62461bcd02815260' +
    '04018080602001828103825260318152602001806147b160319139604001915050604051' +
    '80910390fd5b60006114ca6146bb565b6114fa6040518060200160405280670de0b6b3a7' +
    '6400008152506040518060200160405280600954815250612769565b9092509050600082' +
    '600381111561150d57fe5b1461154c57604051600160e51b62461bcd0281526004018080' +
    '6020018281038252603c815260200180614926603c913960400191505060405180910390' +
    'fd5b60006115566146bb565b61156f60405180602001604052808b81525084876127a356' +
    '5b9092509050600082600381111561158257fe5b146115c157604051600160e51b62461b' +
    'cd0281526004018080602001828103825260318152602001806148056031913960400191' +
    '505060405180910390fd5b519a505050505050505050505090565b600080546001018082' +
    '5560065460408051600160e01b63d02f7351028152306004820152336024820152600160' +
    '0160a01b0388811660448301528781166064830152608482018790529151859392909216' +
    '9163d02f73519160a48082019260209290919082900301818787803b15801561164a5760' +
    '0080fd5b505af115801561165e573d6000803e3d6000fd5b505050506040513d60208110' +
    '1561167457600080fd5b5051905080156116935761168b6003601b83612593565b925050' +
    '6109d8565b856001600160a01b0316856001600160a01b031614156116b95761168b6006' +
    '601c61227d565b6001600160a01b0385166000908152600f602052604081205481908190' +
    '6116e090886125fd565b909350915060008360038111156116f357fe5b14611716576117' +
    '0b6009601a85600381111561107857fe5b9550505050506109d8565b6001600160a01b03' +
    '89166000908152600f60205260409020546117399088612688565b909350905060008360' +
    '0381111561174c57fe5b146117645761170b6009601985600381111561107857fe5b6001' +
    '600160a01b038089166000818152600f60209081526040808320879055938d1680835291' +
    '84902085905583518b815293519193600080516020614906833981519152929081900390' +
    '910190a360065460408051600160e01b636d35bf91028152306004820152336024820152' +
    '6001600160a01b038c811660448301528b81166064830152608482018b90529151919092' +
    '1691636d35bf919160a480830192600092919082900301818387803b15801561181e5760' +
    '0080fd5b505af1158015611832573d6000803e3d6000fd5b506000925061183f91505056' +
    '5b9550505050506000548114610a215760408051600160e51b62461bcd02815260206004' +
    '820152600a6024820152600160b21b691c994b595b9d195c995902604482015290519081' +
    '900360640190fd5b6004546000906001600160a01b031633146118af57610aef60016045' +
    '61227d565b600580546001600160a01b038481166001600160a01b031983168117909355' +
    '6040805191909216808252602082019390935281517fca4f2f25d0898edd99413412fb94' +
    '012f9e54ec8142f9b093e7720646a95b16a9929181900390910190a16000610a35565b60' +
    '00805460010180825581611928610e8a565b1461197d5760408051600160e51b62461bcd' +
    '02815260206004820152601660248201527f61636372756520696e746572657374206661' +
    '696c656400000000000000000000604482015290519081900360640190fd5b6119856109' +
    '57565b91506000548114610db25760408051600160e51b62461bcd028152602060048201' +
    '52600a6024820152600160b21b691c994b595b9d195c9959026044820152905190819003' +
    '60640190fd5b6001600160a01b0381166000908152600f60205260408120548190819081' +
    '908180806119fb896124a4565b935090506000816003811115611a0d57fe5b14611a2b57' +
    '60095b975060009650869550859450611a5e9350505050565b611a33611d54565b925090' +
    '506000816003811115611a4557fe5b14611a51576009611a15565b506000965091945092' +
    '5090505b9193509193565b6000610880826127ed565b600061088082612828565b600160' +
    '0160a01b0391821660009081526010602090815260408083209390941682529190915220' +
    '5490565b6005546000906001600160a01b031633141580611ac1575033155b15611ad957' +
    '611ad26001600061227d565b90506109ba565b60048054600580546001600160a01b0380' +
    '82166001600160a01b031980861682179687905590921690925560408051938316808552' +
    '949092166020840152815190927ff9ffabca9c8276e99321725bcb43fb076a6c66a54b7f' +
    '21c4e8146d8519b417dc92908290030190a1600554604080516001600160a01b03808516' +
    '8252909216602083015280517fca4f2f25d0898edd99413412fb94012f9e54ec8142f9b0' +
    '93e7720646a95b16a99281900390910190a160009250505090565b600080611ba0610e8a' +
    '565b90508015611bc657611bbe816010811115611bb757fe5b604061227d565b91505061' +
    '0883565b610a358361285e565b6007546001600160a01b031681565b6000610ab7848484' +
    '6129d1565b6004546001600160a01b031681565b600754600090819081906001600160a0' +
    '1b03166315f24053611c1a6121fa565b600c54600d546040518463ffffffff1660e01b81' +
    '526004018084815260200183815260200182815260200193505050506040805180830381' +
    '86803b158015611c6157600080fd5b505afa158015611c75573d6000803e3d6000fd5b50' +
    '5050506040513d6040811015611c8b57600080fd5b508051602090910151909250905081' +
    '156109b657604051600160e51b62461bcd02815260040180806020018281038252603781' +
    '526020018061489e6037913960400191505060405180910390fd5b600080546001018082' +
    '5581611cec610e8a565b90508015611d0a57610c69816010811115611d0357fe5b604661' +
    '227d565b610c7a84612adf565b600181565b6000805460010180825581611d2b610e8a56' +
    '5b90508015611d4957610c69816010811115611d4257fe5b603661227d565b610c7a3333' +
    '86612b82565b600080600e5460001415611d6f575050600854600090611dfe565b600061' +
    '1d796121fa565b90506000611d856146bb565b6000611d9684600c54600d54612fde565b' +
    '935090506000816003811115611da857fe5b14611dbc57945060009350611dfe92505050' +
    '565b611dc883600e5461301c565b925090506000816003811115611dda57fe5b14611dee' +
    '57945060009350611dfe92505050565b5051600094509250611dfe915050565b9091565b' +
    '60065460408051600160e31b6317b9b84b0281523060048201526001600160a01b038681' +
    '16602483015285811660448301526064820185905291516000938493169163bdcdc25891' +
    '608480830192602092919082900301818787803b158015611e6a57600080fd5b505af115' +
    '8015611e7e573d6000803e3d6000fd5b505050506040513d6020811015611e9457600080' +
    'fd5b505190508015611eb357611eab6003604a83612593565b915050610ab7565b836001' +
    '600160a01b0316856001600160a01b03161415611ed957611eab6002604b61227d565b60' +
    '006001600160a01b038781169087161415611ef85750600019611f20565b506001600160' +
    'a01b038086166000908152601060209081526040808320938a16835292905220545b6000' +
    '80600080611f3085896125fd565b90945092506000846003811115611f4357fe5b14611f' +
    '6157611f546009604b61227d565b9650505050505050610ab7565b6001600160a01b038a' +
    '166000908152600f6020526040902054611f8490896125fd565b90945091506000846003' +
    '811115611f9757fe5b14611fa857611f546009604c61227d565b6001600160a01b038916' +
    '6000908152600f6020526040902054611fcb9089612688565b9094509050600084600381' +
    '1115611fde57fe5b14611fef57611f546009604d61227d565b6001600160a01b03808b16' +
    '6000908152600f6020526040808220859055918b16815220819055600019851461204757' +
    '6001600160a01b03808b166000908152601060209081526040808320938f168352929052' +
    '208390555b886001600160a01b03168a6001600160a01b03166000805160206149068339' +
    '815191528a6040518082815260200191505060405180910390a360065460408051600160' +
    'e11b63352b4a3f0281523060048201526001600160a01b038d811660248301528c811660' +
    '44830152606482018c905291519190921691636a56947e91608480830192600092919082' +
    '900301818387803b1580156120e657600080fd5b505af11580156120fa573d6000803e3d' +
    '6000fd5b5060009250612107915050565b9b9a5050505050505050505050565b60008054' +
    '60010180825581612129610e8a565b9050801561214f5761214781601081111561214057' +
    'fe5b603561227d565b9250506112a1565b61215a338686612b82565b9250506000548114' +
    '6112ea5760408051600160e51b62461bcd02815260206004820152600a60248201526001' +
    '60b21b691c994b595b9d195c995902604482015290519081900360640190fd5b60008060' +
    '006121b36146bb565b6121bd8686612620565b909250905060008260038111156121d057' +
    'fe5b146121e157509150600090506121f3565b60006121ec826130cc565b935093505050' +
    '5b9250929050565b60125460408051600160e01b6370a082310281523060048201529051' +
    '6000926001600160a01b03169182916370a0823191602480820192602092909190829003' +
    '018186803b15801561224b57600080fd5b505afa15801561225f573d6000803e3d6000fd' +
    '5b505050506040513d602081101561227557600080fd5b505191505090565b60007f45b9' +
    '6fe442630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa0836010811115' +
    '6122ac57fe5b83604d8111156122b857fe5b604080519283526020830191909152600082' +
    '820152519081900360600190a1826010811115610a3557fe5b6004546000908190819060' +
    '01600160a01b03163314612311576123086001603161227d565b92505050610883565b61' +
    '23196125f9565b600a541461232d57612308600a603361227d565b836123366121fa565b' +
    '101561234857612308600e603261227d565b600d5484111561235e576123086002603461' +
    '227d565b50600d54838103908111156123a757604051600160e51b62461bcd0281526004' +
    '018080602001828103825260248152602001806149cb6024913960400191505060405180' +
    '910390fd5b600d8190556004546123c2906001600160a01b0316856130db565b91506000' +
    '8260108111156123d257fe5b1461241157604051600160e51b62461bcd02815260040180' +
    '80602001828103825260238152602001806147e260239139604001915050604051809103' +
    '90fd5b600454604080516001600160a01b03909216825260208201869052818101839052' +
    '517f3bad0c59cf2f06e7314077049f48a93578cd16f5ef92329f1dab1420a99c177e9181' +
    '900360600190a16000949350505050565b600080546001018082558161247a610e8a565b' +
    '9050801561249857610c6981601081111561249157fe5b602761227d565b610c7a336000' +
    '8661319a565b6001600160a01b0381166000908152601160205260408120805482918291' +
    '829182916124db57506000945084935061255392505050565b6124eb8160000154600b54' +
    '6136af565b909450925060008460038111156124fe57fe5b146125135750919350600092' +
    '50612553915050565b6125218382600101546136ee565b90945091506000846003811115' +
    '61253457fe5b14612549575091935060009250612553915050565b506000945092505050' +
    '5b915091565b600080546001018082558161256b610e8a565b9050801561258957610c69' +
    '81601081111561258257fe5b601e61227d565b610c7a3385613719565b60007f45b96fe4' +
    '42630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa08460108111156125' +
    'c257fe5b84604d8111156125ce57fe5b6040805192835260208301919091528181018590' +
    '52519081900360600190a1836010811115610ab757fe5b4390565b600080838311612614' +
    '5750600090508183036121f3565b506003905060006121f3565b600061262a6146bb565b' +
    '60008061263b8660000151866136af565b9092509050600082600381111561264e57fe5b' +
    '1461266d575060408051602081019091526000815290925090506121f3565b6040805160' +
    '2081019091529081526000969095509350505050565b6000808383018481106126a05760' +
    '00925090506121f3565b5060029150600090506121f3565b60008060006126bb6146bb56' +
    '5b6126c58787612620565b909250905060008260038111156126d857fe5b146126e95750' +
    '915060009050612702565b6126fb6126f5826130cc565b86612688565b9350935050505b' +
    '935093915050565b60006127146146bb565b600080612729670de0b6b3a7640000876136' +
    'af565b9092509050600082600381111561273c57fe5b1461275b57506040805160208101' +
    '9091526000815290925090506121f3565b6121ec81866000015161301c565b6000612773' +
    '6146bb565b600080612788866000015186600001516125fd565b60408051602081019091' +
    '529081529097909650945050505050565b60006127ad6146bb565b60006127b76146bb56' +
    '5b6127c18787613b67565b909250905060008260038111156127d457fe5b146127e35790' +
    '92509050612702565b6126fb8186613b67565b6000805460010180825581612800610e8a' +
    '565b9050801561281e57610c6981601081111561281757fe5b600861227d565b610c7a33' +
    '85613c50565b600080546001018082558161283b610e8a565b9050801561285257610c69' +
    '81601081111561249157fe5b610c7a3385600061319a565b600454600090819060016001' +
    '60a01b0316331461288157611bbe6001604261227d565b6128896125f9565b600a541461' +
    '289d57611bbe600a604161227d565b600760009054906101000a90046001600160a01b03' +
    '169050826001600160a01b0316632191f92a6040518163ffffffff1660e01b8152600401' +
    '60206040518083038186803b1580156128ee57600080fd5b505afa158015612902573d60' +
    '00803e3d6000fd5b505050506040513d602081101561291857600080fd5b505161296e57' +
    '60408051600160e51b62461bcd02815260206004820152601c60248201527f6d61726b65' +
    '72206d6574686f642072657475726e65642066616c736500000000604482015290519081' +
    '900360640190fd5b600780546001600160a01b0319166001600160a01b03858116918217' +
    '909255604080519284168352602083019190915280517fedffc32e068c7c95dfd4bdfd5c' +
    '4d939a084d6b11c4199eac8436ed234d72f9269281900390910190a16000610a35565b60' +
    '008054600101808255816129e4610e8a565b90508015612a025761168b81601081111561' +
    '29fb57fe5b600f61227d565b836001600160a01b031663a6afed956040518163ffffffff' +
    '1660e01b8152600401602060405180830381600087803b158015612a3d57600080fd5b50' +
    '5af1158015612a51573d6000803e3d6000fd5b505050506040513d6020811015612a6757' +
    '600080fd5b505190508015612a875761168b816010811115612a8057fe5b601061227d56' +
    '5b612a9333878787613fbf565b9250506000548114610a215760408051600160e51b6246' +
    '1bcd02815260206004820152600a6024820152600160b21b691c994b595b9d195c995902' +
    '604482015290519081900360640190fd5b6004546000906001600160a01b03163314612b' +
    '0057610aef6001604761227d565b612b086125f9565b600a5414612b1c57610aef600a60' +
    '4861227d565b670de0b6b3a7640000821115612b3857610aef6002604961227d565b6009' +
    '805490839055604080518281526020810185905281517faaa68312e2ea9d50e16af50684' +
    '10ab56e1a1fd06037b1a35664812c30f821460929181900390910190a16000610a35565b' +
    '60065460408051600160e11b63120045310281523060048201526001600160a01b038681' +
    '1660248301528581166044830152606482018590529151600093849316916324008a6291' +
    '608480830192602092919082900301818787803b158015612bea57600080fd5b505af115' +
    '8015612bfe573d6000803e3d6000fd5b505050506040513d6020811015612c1457600080' +
    'fd5b505190508015612c3357612c2b6003603883612593565b915050610a35565b612c3b' +
    '6125f9565b600a5414612c4f57612c2b600a603961227d565b612c57614728565b600160' +
    '0160a01b0385166000908152601160205260409020600101546060820152612c81856124' +
    'a4565b6080830181905260208301826003811115612c9857fe5b6003811115612ca357fe' +
    '5b9052506000905081602001516003811115612cba57fe5b14612cdf57612cd660096037' +
    '8360200151600381111561107857fe5b92505050610a35565b600019841415612cf85760' +
    '808101516040820152612d00565b604081018490525b612d0e8682604001516144b3565b' +
    '81906010811115612d1b57fe5b90816010811115612d2857fe5b90525060008151601081' +
    '1115612d3a57fe5b14612d4c578051612cd690603c61227d565b612d5e81608001518260' +
    '4001516125fd565b60a0830181905260208301826003811115612d7557fe5b6003811115' +
    '612d8057fe5b9052506000905081602001516003811115612d9757fe5b14612db357612c' +
    'd66009603a8360200151600381111561107857fe5b612dc3600c5482604001516125fd56' +
    '5b60c0830181905260208301826003811115612dda57fe5b6003811115612de557fe5b90' +
    '52506000905081602001516003811115612dfc57fe5b14612e1857612cd66009603b8360' +
    '200151600381111561107857fe5b612e268682604001516145ea565b8190601081111561' +
    '2e3357fe5b90816010811115612e4057fe5b905250600081516010811115612e5257fe5b' +
    '14612ea75760408051600160e51b62461bcd02815260206004820152601f60248201527f' +
    '726570617920626f72726f77207472616e7366657220696e206661696c65640060448201' +
    '5290519081900360640190fd5b60a080820180516001600160a01b038089166000818152' +
    '60116020908152604091829020948555600b5460019095019490945560c0870151600c81' +
    '90558188015195518251948e168552948401929092528281019490945260608201929092' +
    '52608081019190915290517f1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0' +
    '355478d6f5c362a1929181900390910190a1600654604080830151606084015182516001' +
    '60e01b631ededc910281523060048201526001600160a01b038b811660248301528a8116' +
    '6044830152606482019390935260848101919091529151921691631ededc919160a48082' +
    '019260009290919082900301818387803b158015612fb357600080fd5b505af115801561' +
    '2fc7573d6000803e3d6000fd5b5060009250612fd4915050565b9695505050505050565b' +
    '600080600080612fee8787612688565b9092509050600082600381111561300157fe5b14' +
    '6130125750915060009050612702565b6126fb81866125fd565b60006130266146bb565b' +
    '60008061303b86670de0b6b3a76400006136af565b909250905060008260038111156130' +
    '4e57fe5b1461306d575060408051602081019091526000815290925090506121f3565b60' +
    '008061307a83886136ee565b9092509050600082600381111561308d57fe5b146130af57' +
    '5060408051602081019091526000815290945092506121f3915050565b60408051602081' +
    '0190915290815260009890975095505050505050565b51670de0b6b3a764000090049056' +
    '5b60125460408051600160e01b63a9059cbb0281526001600160a01b0385811660048301' +
    '5260248201859052915160009392909216918391839163a9059cbb916044808201928692' +
    '90919082900301818387803b15801561313a57600080fd5b505af115801561314e573d60' +
    '00803e3d6000fd5b505050503d60008114613168576020811461317257600080fd5b6000' +
    '19915061317e565b60206000803e60005191505b508061318f5760109250505061086f56' +
    '5b506000949350505050565b60008215806131a7575081155b6131e557604051600160e5' +
    '1b62461bcd02815260040180806020018281038252603481526020018061499760349139' +
    '60400191505060405180910390fd5b6131ed614728565b6131f5611d54565b6040830181' +
    '90526020830182600381111561320c57fe5b600381111561321757fe5b90525060009050' +
    '8160200151600381111561322e57fe5b1461324a57612c2b6009602b8360200151600381' +
    '111561107857fe5b83156132cb5760608101849052604080516020810182529082015181' +
    '5261327190856121a6565b608083018190526020830182600381111561328857fe5b6003' +
    '81111561329357fe5b90525060009050816020015160038111156132aa57fe5b146132c6' +
    '57612c2b600960298360200151600381111561107857fe5b613344565b6132e783604051' +
    '806020016040528084604001518152506146a4565b606083018190526020830182600381' +
    '11156132fe57fe5b600381111561330957fe5b9052506000905081602001516003811115' +
    '61332057fe5b1461333c57612c2b6009602a8360200151600381111561107857fe5b6080' +
    '81018390525b600654606082015160408051600160e01b63eabe7d910281523060048201' +
    '526001600160a01b03898116602483015260448201939093529051600093929092169163' +
    'eabe7d919160648082019260209290919082900301818787803b1580156133ac57600080' +
    'fd5b505af11580156133c0573d6000803e3d6000fd5b505050506040513d602081101561' +
    '33d657600080fd5b5051905080156133ed57612cd66003602883612593565b6133f56125' +
    'f9565b600a541461340957612cd6600a602c61227d565b613419600e5483606001516125' +
    'fd565b60a084018190526020840182600381111561343057fe5b600381111561343b57fe' +
    '5b905250600090508260200151600381111561345257fe5b1461346e57612cd66009602e' +
    '8460200151600381111561107857fe5b6001600160a01b0386166000908152600f602052' +
    '6040902054606083015161349691906125fd565b60c08401819052602084018260038111' +
    '156134ad57fe5b60038111156134b857fe5b905250600090508260200151600381111561' +
    '34cf57fe5b146134eb57612cd66009602d8460200151600381111561107857fe5b816080' +
    '01516134f86121fa565b101561350a57612cd6600e602f61227d565b6135188683608001' +
    '516130db565b8290601081111561352557fe5b9081601081111561353257fe5b90525060' +
    '008251601081111561354457fe5b146135995760408051600160e51b62461bcd02815260' +
    '206004820152601a60248201527f72656465656d207472616e73666572206f7574206661' +
    '696c6564000000000000604482015290519081900360640190fd5b60a0820151600e5560' +
    'c08201516001600160a01b0387166000818152600f602090815260409182902093909355' +
    '6060850151815190815290513093600080516020614906833981519152928290030190a3' +
    '6080820151606080840151604080516001600160a01b038b168152602081019490945283' +
    '810191909152517fe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4' +
    'ec31a9299281900390910190a16006546080830151606084015160408051600160e01b63' +
    '51dff9890281523060048201526001600160a01b038b8116602483015260448201949094' +
    '5260648101929092525191909216916351dff98991608480830192600092919082900301' +
    '818387803b158015612fb357600080fd5b600080836136c2575060009050806121f3565b' +
    '838302838582816136cf57fe5b04146136e3575060029150600090506121f3565b600092' +
    '5090506121f3565b6000808261370257506001905060006121f3565b600083858161370d' +
    '57fe5b04915091509250929050565b60065460408051600160e01b634ef4c3e102815230' +
    '60048201526001600160a01b038581166024830152604482018590529151600093849316' +
    '91634ef4c3e191606480830192602092919082900301818787803b158015613779576000' +
    '80fd5b505af115801561378d573d6000803e3d6000fd5b505050506040513d6020811015' +
    '6137a357600080fd5b5051905080156137c2576137ba6003601f83612593565b91505061' +
    '086f565b6137ca6125f9565b600a54146137de576137ba600a602261227d565b6137e661' +
    '4766565b6137f085856144b3565b819060108111156137fd57fe5b908160108111156138' +
    '0a57fe5b90525060008151601081111561381c57fe5b1461383757805161382e90602661' +
    '227d565b9250505061086f565b61383f611d54565b604083018190526020830182600381' +
    '111561385657fe5b600381111561386157fe5b9052506000905081602001516003811115' +
    '61387857fe5b146138945761382e600960218360200151600381111561107857fe5b6138' +
    'b084604051806020016040528084604001518152506146a4565b60608301819052602083' +
    '018260038111156138c757fe5b60038111156138d257fe5b905250600090508160200151' +
    '60038111156138e957fe5b146139055761382e6009602083602001516003811115611078' +
    '57fe5b613915600e548260600151612688565b6080830181905260208301826003811115' +
    '61392c57fe5b600381111561393757fe5b90525060009050816020015160038111156139' +
    '4e57fe5b1461396a5761382e600960248360200151600381111561107857fe5b60016001' +
    '60a01b0385166000908152600f602052604090205460608201516139929190612688565b' +
    '60a08301819052602083018260038111156139a957fe5b60038111156139b457fe5b9052' +
    '5060009050816020015160038111156139cb57fe5b146139e75761382e60096023836020' +
    '0151600381111561107857fe5b6139f185856145ea565b819060108111156139fe57fe5b' +
    '90816010811115613a0b57fe5b905250600081516010811115613a1d57fe5b14613a2f57' +
    '805161382e90602561227d565b6080810151600e5560a08101516001600160a01b038616' +
    '6000818152600f6020908152604091829020939093556060808501518251938452938301' +
    '88905282820193909352517f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef' +
    '26394f4c03821c4f929181900390910190a1606081015160408051918252516001600160' +
    'a01b0387169130916000805160206149068339815191529181900360200190a360065460' +
    '6082015160408051600160e01b6341c728b90281523060048201526001600160a01b0389' +
    '81166024830152604482018990526064820193909352905191909216916341c728b99160' +
    '8480830192600092919082900301818387803b158015613b3d57600080fd5b505af11580' +
    '15613b51573d6000803e3d6000fd5b5060009250613b5e915050565b9594505050505056' +
    '5b6000613b716146bb565b600080613b86866000015186600001516136af565b90925090' +
    '506000826003811115613b9957fe5b14613bb85750604080516020810190915260008152' +
    '90925090506121f3565b600080613bcd6706f05b59d3b2000084612688565b9092509050' +
    '6000826003811115613be057fe5b14613c02575060408051602081019091526000815290' +
    '945092506121f3915050565b600080613c1783670de0b6b3a76400006136ee565b909250' +
    '90506000826003811115613c2a57fe5b14613c3157fe5b60408051602081019091529081' +
    '5260009a909950975050505050505050565b60065460408051600160e21b63368f515302' +
    '81523060048201526001600160a01b038581166024830152604482018590529151600093' +
    '8493169163da3d454c91606480830192602092919082900301818787803b158015613cb0' +
    '57600080fd5b505af1158015613cc4573d6000803e3d6000fd5b505050506040513d6020' +
    '811015613cda57600080fd5b505190508015613cf1576137ba6003600e83612593565b61' +
    '3cf96125f9565b600a5414613d0c576137ba600a8061227d565b82613d156121fa565b10' +
    '15613d27576137ba600e600961227d565b613d2f614780565b613d38856124a4565b6040' +
    '830181905260208301826003811115613d4f57fe5b6003811115613d5a57fe5b90525060' +
    '00905081602001516003811115613d7157fe5b14613d8d5761382e600960078360200151' +
    '600381111561107857fe5b613d9b816040015185612688565b6060830181905260208301' +
    '826003811115613db257fe5b6003811115613dbd57fe5b90525060009050816020015160' +
    '03811115613dd457fe5b14613df05761382e6009600c8360200151600381111561107857' +
    'fe5b613dfc600c5485612688565b6080830181905260208301826003811115613e1357fe' +
    '5b6003811115613e1e57fe5b9052506000905081602001516003811115613e3557fe5b14' +
    '613e515761382e6009600b8360200151600381111561107857fe5b613e5b85856130db56' +
    '5b81906010811115613e6857fe5b90816010811115613e7557fe5b905250600081516010' +
    '811115613e8757fe5b14613edc5760408051600160e51b62461bcd028152602060048201' +
    '52601a60248201527f626f72726f77207472616e73666572206f7574206661696c656400' +
    '0000000000604482015290519081900360640190fd5b606080820180516001600160a01b' +
    '038816600081815260116020908152604091829020938455600b54600190940193909355' +
    '608080870151600c819055945182519384529383018a9052828201939093529381019290' +
    '925291517f13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab' +
    '80929181900390910190a160065460408051600160e01b635c7786050281523060048201' +
    '526001600160a01b0388811660248301526044820188905291519190921691635c778605' +
    '91606480830192600092919082900301818387803b158015613b3d57600080fd5b600654' +
    '60408051600160e11b632fe3f38f0281523060048201526001600160a01b038481166024' +
    '830152878116604483015286811660648301526084820186905291516000938493169163' +
    '5fc7e71e9160a480830192602092919082900301818787803b15801561402f57600080fd' +
    '5b505af1158015614043573d6000803e3d6000fd5b505050506040513d60208110156140' +
    '5957600080fd5b50519050801561407057611eab6003601283612593565b6140786125f9' +
    '565b600a541461408c57611eab600a601661227d565b6140946125f9565b836001600160' +
    'a01b0316636c540baf6040518163ffffffff1660e01b8152600401602060405180830381' +
    '86803b1580156140cd57600080fd5b505afa1580156140e1573d6000803e3d6000fd5b50' +
    '5050506040513d60208110156140f757600080fd5b50511461410a57611eab600a601161' +
    '227d565b856001600160a01b0316856001600160a01b0316141561413057611eab600660' +
    '1761227d565b8361414157611eab6007601561227d565b60001984141561415757611eab' +
    '6007601461227d565b60065460408051600160e01b63c488847b02815230600482015260' +
    '01600160a01b038681166024830152604482018890528251600094859492169263c48884' +
    '7b926064808301939192829003018186803b1580156141b457600080fd5b505afa158015' +
    '6141c8573d6000803e3d6000fd5b505050506040513d60408110156141de57600080fd5b' +
    '50805160209091015190925090508115614209576141ff6004601384612593565b935050' +
    '5050610ab7565b846001600160a01b03166370a08231886040518263ffffffff1660e01b' +
    '815260040180826001600160a01b03166001600160a01b03168152602001915050602060' +
    '40518083038186803b15801561425f57600080fd5b505afa158015614273573d6000803e' +
    '3d6000fd5b505050506040513d602081101561428957600080fd5b505181111561429e57' +
    '6141ff600d601d61227d565b60006142ab898989612b82565b905080156142d4576142c9' +
    '8160108111156142c257fe5b601861227d565b945050505050610ab7565b604080516001' +
    '60e01b63b2a02ff10281526001600160a01b038b811660048301528a8116602483015260' +
    '448201859052915160009289169163b2a02ff19160648083019260209291908290030181' +
    '8787803b15801561433257600080fd5b505af1158015614346573d6000803e3d6000fd5b' +
    '505050506040513d602081101561435c57600080fd5b5051905080156143b65760408051' +
    '600160e51b62461bcd02815260206004820152601460248201527f746f6b656e20736569' +
    '7a757265206661696c656400000000000000000000000060448201529051908190036064' +
    '0190fd5b604080516001600160a01b03808d168252808c1660208301528183018b905289' +
    '1660608201526080810185905290517f298637f684da70674f26509b10f07ec2fbc77a33' +
    '5ab1e7d6215a4b2484d8bb529181900360a00190a160065460408051600160e01b6347ef' +
    '3b3b0281523060048201526001600160a01b038a811660248301528d811660448301528c' +
    '81166064830152608482018c905260a48201879052915191909216916347ef3b3b9160c4' +
    '80830192600092919082900301818387803b15801561448457600080fd5b505af1158015' +
    '614498573d6000803e3d6000fd5b50600092506144a5915050565b9a9950505050505050' +
    '505050565b60125460408051600160e11b636eb1769f0281526001600160a01b03858116' +
    '6004830152306024830152915160009392909216918491839163dd62ed3e916044808201' +
    '92602092909190829003018186803b15801561451157600080fd5b505afa158015614525' +
    '573d6000803e3d6000fd5b505050506040513d602081101561453b57600080fd5b505110' +
    '1561454d57600c91505061086f565b82816001600160a01b03166370a082318660405182' +
    '63ffffffff1660e01b815260040180826001600160a01b03166001600160a01b03168152' +
    '60200191505060206040518083038186803b1580156145a457600080fd5b505afa158015' +
    '6145b8573d6000803e3d6000fd5b505050506040513d60208110156145ce57600080fd5b' +
    '505110156145e057600d91505061086f565b5060009392505050565b6012546040805160' +
    '0160e01b6323b872dd0281526001600160a01b0385811660048301523060248301526044' +
    '820185905291516000939290921691839183916323b872dd916064808201928692909190' +
    '82900301818387803b15801561464f57600080fd5b505af1158015614663573d6000803e' +
    '3d6000fd5b505050503d6000811461467d576020811461468757600080fd5b6000199150' +
    '614693565b60206000803e60005191505b508061318f57600f9250505061086f565b6000' +
    '8060006146b16146bb565b6121bd868661270a565b604051806020016040528060008152' +
    '5090565b6040805161014081019091528060008152602001600081526020016000815260' +
    '200160008152602001600081526020016147066146bb565b815260200160008152602001' +
    '6000815260200160008152602001600081525090565b6040805160e08101909152806000' +
    '815260200160008152602001600081526020016000815260200160008152602001600081' +
    '52602001600081525090565b6040805160c0810190915280600081526020016000614706' +
    '565b6040805160a081019091528060008152602001600081526020016000815260200160' +
    '00815260200160008152509056fe737570706c7952617465506572426c6f636b3a206361' +
    '6c63756c6174696e6720626f72726f7773506572206661696c6564726564756365207265' +
    '736572766573207472616e73666572206f7574206661696c6564737570706c7952617465' +
    '506572426c6f636b3a2063616c63756c6174696e6720737570706c795261746520666169' +
    '6c6564626f72726f7742616c616e636553746f7265643a20626f72726f7742616c616e63' +
    '6553746f726564496e7465726e616c206661696c6564737570706c795261746550657242' +
    '6c6f636b3a2063616c63756c6174696e6720756e6465726c79696e67206661696c656462' +
    '6f72726f7752617465506572426c6f636b3a20696e746572657374526174654d6f64656c' +
    '2e626f72726f7752617465206661696c6564737570706c7952617465506572426c6f636b' +
    '3a2063616c63756c6174696e6720626f72726f7752617465206661696c6564ddf252ad1b' +
    'e2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef737570706c79526174' +
    '65506572426c6f636b3a2063616c63756c6174696e67206f6e654d696e75735265736572' +
    '7665466163746f72206661696c656465786368616e67655261746553746f7265643a2065' +
    '786368616e67655261746553746f726564496e7465726e616c206661696c65646f6e6520' +
    '6f662072656465656d546f6b656e73496e206f722072656465656d416d6f756e74496e20' +
    '6d757374206265207a65726f72656475636520726573657276657320756e657870656374' +
    '656420756e646572666c6f77a165627a7a72305820ae92d0e3e70b657d01891c7457bc6c' +
    '8a5ce2401a1a8857f346a2fa9af4627145002953657474696e6720696e74657265737420' +
    '72617465206d6f64656c206661696c6564496e697469616c2065786368616e6765207261' +
    '7465206d7573742062652067726561746572207468616e207a65726f2e' +
    '00000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359' + // dai
    '0000000000000000000000003d9819210a31b4961b30ef54be2aed79b9c9cd3b' + // troll
    '000000000000000000000000a1046abfc2598f48c44fb320d281d3f3c0733c9a' + // IRM
    '000000000000000000000000000000000000000000a56fa5b99019a5c8000000' +
    '00000000000000000000000000000000000000000000000000000000000000e0' +
    '0000000000000000000000000000000000000000000000000000000000000120' +
    '0000000000000000000000000000000000000000000000000000000000000008' +
    '000000000000000000000000000000000000000000000000000000000000000c' +
    '436f6d706f756e64204461690000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000004' +
    '6344414900000000000000000000000000000000000000000000000000000000'
  )

  // 0x39AA39c021dfbaE8faC545936693aC917d5E7563
  // nonce: 17
  const mockCUSDCDeploymentData = (
    '0x60806040523480156200001157600080fd5b506040516200523c3803806200523c8339' +
    '81018060405260e08110156200003757600080fd5b815160208301516040840151606085' +
    '0151608086018051949693959294919392830192916401000000008111156200006e5760' +
    '0080fd5b820160208101848111156200008257600080fd5b815164010000000081118282' +
    '01871017156200009d57600080fd5b505092919060200180516401000000008111156200' +
    '00ba57600080fd5b82016020810184811115620000ce57600080fd5b8151640100000000' +
    '811182820187101715620000e957600080fd5b5050602090910151600160005560048054' +
    '6001600160a01b0319163317905560088690559092509050858585858585836200017057' +
    '6040517f08c379a000000000000000000000000000000000000000000000000000000000' +
    '81526004018080602001828103825260308152602001806200520c603091396040019150' +
    '5060405180910390fd5b600062000183876200036460201b60201c565b90508015620001' +
    'f357604080517f08c379a000000000000000000000000000000000000000000000000000' +
    '000000815260206004820152601a60248201527f53657474696e6720636f6d7074726f6c' +
    '6c6572206661696c6564000000000000604482015290519081900360640190fd5b620002' +
    '03620004f760201b60201c565b600a55670de0b6b3a7640000600b556200022486620004' +
    'fc602090811b901c565b905080156200027f576040517f08c379a0000000000000000000' +
    '000000000000000000000000000000000000008152600401808060200182810382526022' +
    '815260200180620051ea6022913960400191505060405180910390fd5b83516200029490' +
    '60019060208701906200071e565b508251620002aa9060029060208601906200071e565b' +
    '50506003555050601280546001600160a01b0319166001600160a01b038c811691909117' +
    '91829055604080517f18160ddd0000000000000000000000000000000000000000000000' +
    '0000000000815290519290911694506318160ddd93506004808201935060209291829003' +
    '018186803b1580156200032857600080fd5b505afa1580156200033d573d6000803e3d60' +
    '00fd5b505050506040513d60208110156200035457600080fd5b50620007c09750505050' +
    '50505050565b6004546000906001600160a01b0316331462000396576200038e6001603f' +
    '620006ae60201b60201c565b9050620004f2565b600654604080517e7e3dd20000000000' +
    '0000000000000000000000000000000000000000000000815290516001600160a01b0392' +
    '831692851691627e3dd2916004808301926020929190829003018186803b158015620003' +
    'f557600080fd5b505afa1580156200040a573d6000803e3d6000fd5b505050506040513d' +
    '60208110156200042157600080fd5b50516200048f57604080517f08c379a00000000000' +
    '0000000000000000000000000000000000000000000000815260206004820152601c6024' +
    '8201527f6d61726b6572206d6574686f642072657475726e65642066616c736500000000' +
    '604482015290519081900360640190fd5b600680546001600160a01b0319166001600160' +
    'a01b03858116918217909255604080519284168352602083019190915280517f7ac369db' +
    'd14fa5ea3f473ed67cc9d598964a77501540ba6751eb0b3decf5870d9281900390910190' +
    'a160005b9150505b919050565b435b90565b60045460009081906001600160a01b031633' +
    '1462000531576200052860016042620006ae60201b60201c565b915050620004f2565b62' +
    '000541620004f760201b60201c565b600a54146200055e5762000528600a6041620006ae' +
    '60201b60201c565b600760009054906101000a90046001600160a01b0316905082600160' +
    '0160a01b0316632191f92a6040518163ffffffff1660e01b815260040160206040518083' +
    '038186803b158015620005b057600080fd5b505afa158015620005c5573d6000803e3d60' +
    '00fd5b505050506040513d6020811015620005dc57600080fd5b50516200064a57604080' +
    '517f08c379a0000000000000000000000000000000000000000000000000000000008152' +
    '60206004820152601c60248201527f6d61726b6572206d6574686f642072657475726e65' +
    '642066616c736500000000604482015290519081900360640190fd5b6007805460016001' +
    '60a01b0319166001600160a01b0385811691821790925560408051928416835260208301' +
    '9190915280517fedffc32e068c7c95dfd4bdfd5c4d939a084d6b11c4199eac8436ed234d' +
    '72f9269281900390910190a16000620004ee565b60007f45b96fe442630264581b197e84' +
    'bbada861235052c5a1aadfff9ea4e40a969aa0836010811115620006de57fe5b83604d81' +
    '1115620006eb57fe5b604080519283526020830191909152600082820152519081900360' +
    '600190a18260108111156200071757fe5b9392505050565b828054600181600116156101' +
    '000203166002900490600052602060002090601f016020900481019282601f1062000761' +
    '57805160ff191683800117855562000791565b8280016001018555821562000791579182' +
    '015b828111156200079157825182559160200191906001019062000774565b506200079f' +
    '929150620007a3565b5090565b620004f991905b808211156200079f5760008155600101' +
    '620007aa565b614a1a80620007d06000396000f3fe608060405234801561001057600080' +
    'fd5b506004361061028a5760003560e01c80638f840ddd1161015c578063c37f68e21161' +
    '00ce578063f3fdb15a11610087578063f3fdb15a14610708578063f5e3c4621461071057' +
    '8063f851a44014610746578063f8f9da281461074e578063fca7820b14610756578063fe' +
    '9c44ae146107735761028a565b8063c37f68e214610626578063c5ebeaec146106725780' +
    '63db006a751461068f578063dd62ed3e146106ac578063e9c714f2146106da578063f2b3' +
    'abbd146106e25761028a565b8063a9059cbb11610120578063a9059cbb14610586578063' +
    'aa5af0fd146105b2578063ae9d70b0146105ba578063b2a02ff1146105c2578063b71d1a' +
    '0c146105f8578063bd6d894d1461061e5761028a565b80638f840ddd1461052b57806395' +
    'd89b411461053357806395dd91931461053b578063a0712d6814610561578063a6afed95' +
    '1461057e5761028a565b80633af9e66911610200578063675d972c116101b9578063675d' +
    '972c146104c85780636c540baf146104d05780636f307dc3146104d857806370a0823114' +
    '6104e057806373acee9814610506578063852a12e31461050e5761028a565b80633af9e6' +
    '69146104475780633b1d21a21461046d5780634576b5db1461047557806347bd37181461' +
    '049b5780635fe3b567146104a3578063601a0bf1146104ab5761028a565b806318160ddd' +
    '1161025257806318160ddd146103a9578063182df0f5146103b157806323b872dd146103' +
    'b95780632608f818146103ef578063267822471461041b578063313ce5671461043f5761' +
    '028a565b806306fdde031461028f578063095ea7b31461030c5780630e7527021461034c' +
    '578063173b99041461037b57806317bfdfbc14610383575b600080fd5b61029761077b56' +
    '5b6040805160208082528351818301528351919283929083019185019080838360005b83' +
    '8110156102d15781810151838201526020016102b9565b50505050905090810190601f16' +
    '80156102fe5780820380516001836020036101000a031916815260200191505b50925050' +
    '5060405180910390f35b6103386004803603604081101561032257600080fd5b50600160' +
    '0160a01b038135169060200135610808565b604080519115158252519081900360200190' +
    'f35b6103696004803603602081101561036257600080fd5b5035610875565b6040805191' +
    '8252519081900360200190f35b610369610888565b610369600480360360208110156103' +
    '9957600080fd5b50356001600160a01b031661088e565b610369610951565b6103696109' +
    '57565b610338600480360360608110156103cf57600080fd5b506001600160a01b038135' +
    '811691602081013590911690604001356109bd565b610369600480360360408110156104' +
    '0557600080fd5b506001600160a01b038135169060200135610a29565b610423610a3c56' +
    '5b604080516001600160a01b039092168252519081900360200190f35b610369610a4b56' +
    '5b6103696004803603602081101561045d57600080fd5b50356001600160a01b0316610a' +
    '51565b610369610abf565b6103696004803603602081101561048b57600080fd5b503560' +
    '01600160a01b0316610ace565b610369610c23565b610423610c29565b61036960048036' +
    '0360208110156104c157600080fd5b5035610c38565b610369610cc6565b610369610ccc' +
    '565b610423610cd2565b610369600480360360208110156104f657600080fd5b50356001' +
    '600160a01b0316610ce1565b610369610cfc565b61036960048036036020811015610524' +
    '57600080fd5b5035610db6565b610369610dc1565b610297610dc7565b61036960048036' +
    '03602081101561055157600080fd5b50356001600160a01b0316610e1f565b6103696004' +
    '803603602081101561057757600080fd5b5035610e7f565b610369610e8a565b61033860' +
    '04803603604081101561059c57600080fd5b506001600160a01b03813516906020013561' +
    '1286565b6103696112f1565b6103696112f7565b610369600480360360608110156105d8' +
    '57600080fd5b506001600160a01b038135811691602081013590911690604001356115d1' +
    '565b6103696004803603602081101561060e57600080fd5b50356001600160a01b031661' +
    '188e565b610369611915565b61064c6004803603602081101561063c57600080fd5b5035' +
    '6001600160a01b03166119d0565b60408051948552602085019390935283830191909152' +
    '6060830152519081900360800190f35b6103696004803603602081101561068857600080' +
    'fd5b5035611a65565b610369600480360360208110156106a557600080fd5b5035611a70' +
    '565b610369600480360360408110156106c257600080fd5b506001600160a01b03813581' +
    '16916020013516611a7b565b610369611aa6565b610369600480360360208110156106f8' +
    '57600080fd5b50356001600160a01b0316611b95565b610423611bcf565b610369600480' +
    '3603606081101561072657600080fd5b506001600160a01b038135811691602081013591' +
    '60409091013516611bde565b610423611beb565b610369611bfa565b6103696004803603' +
    '602081101561076c57600080fd5b5035611cd9565b610338611d13565b60018054604080' +
    '516020600284861615610100026000190190941693909304601f81018490048402820184' +
    '0190925281815292918301828280156108005780601f106107d557610100808354040283' +
    '529160200191610800565b820191906000526020600020905b8154815290600101906020' +
    '018083116107e357829003601f168201915b505050505081565b33600081815260106020' +
    '90815260408083206001600160a01b038716808552908352818420869055815186815291' +
    '51939493909284927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200a' +
    'c8c7c3b925929081900390910190a360019150505b92915050565b600061088082611d18' +
    '565b90505b919050565b60095481565b60008054600101808255816108a1610e8a565b14' +
    '6108f65760408051600160e51b62461bcd02815260206004820152601660248201527f61' +
    '636372756520696e746572657374206661696c6564000000000000000000006044820152' +
    '90519081900360640190fd5b6108ff83610e1f565b91505b600054811461094b57604080' +
    '51600160e51b62461bcd02815260206004820152600a6024820152600160b21b691c994b' +
    '595b9d195c995902604482015290519081900360640190fd5b50919050565b600e548156' +
    '5b6000806000610964611d54565b9092509050600082600381111561097757fe5b146109' +
    'b657604051600160e51b62461bcd02815260040180806020018281038252603581526020' +
    '01806149626035913960400191505060405180910390fd5b9150505b90565b6000805460' +
    '0101808255816109d433878787611e02565b1491505b6000548114610a21576040805160' +
    '0160e51b62461bcd02815260206004820152600a6024820152600160b21b691c994b595b' +
    '9d195c995902604482015290519081900360640190fd5b509392505050565b6000610a35' +
    '8383612116565b9392505050565b6005546001600160a01b031681565b60035481565b60' +
    '00610a5b6146bb565b6040518060200160405280610a6e611915565b90526001600160a0' +
    '1b0384166000908152600f6020526040812054919250908190610a9a9084906121a6565b' +
    '90925090506000826003811115610aad57fe5b14610ab757600080fd5b94935050505056' +
    '5b6000610ac96121fa565b905090565b6004546000906001600160a01b03163314610af6' +
    '57610aef6001603f61227d565b9050610883565b60065460408051600160e11b623f1ee9' +
    '02815290516001600160a01b0392831692851691627e3dd2916004808301926020929190' +
    '829003018186803b158015610b3e57600080fd5b505afa158015610b52573d6000803e3d' +
    '6000fd5b505050506040513d6020811015610b6857600080fd5b5051610bbe5760408051' +
    '600160e51b62461bcd02815260206004820152601c60248201527f6d61726b6572206d65' +
    '74686f642072657475726e65642066616c73650000000060448201529051908190036064' +
    '0190fd5b600680546001600160a01b0319166001600160a01b0385811691821790925560' +
    '4080519284168352602083019190915280517f7ac369dbd14fa5ea3f473ed67cc9d59896' +
    '4a77501540ba6751eb0b3decf5870d9281900390910190a160009392505050565b600c54' +
    '81565b6006546001600160a01b031681565b6000805460010180825581610c4b610e8a56' +
    '5b90508015610c7157610c69816010811115610c6257fe5b603061227d565b9250506109' +
    '02565b610c7a846122e3565b925050600054811461094b5760408051600160e51b62461b' +
    'cd02815260206004820152600a6024820152600160b21b691c994b595b9d195c99590260' +
    '4482015290519081900360640190fd5b60085481565b600a5481565b6012546001600160' +
    'a01b031681565b6001600160a01b03166000908152600f602052604090205490565b6000' +
    '805460010180825581610d0f610e8a565b14610d645760408051600160e51b62461bcd02' +
    '815260206004820152601660248201527f61636372756520696e74657265737420666169' +
    '6c656400000000000000000000604482015290519081900360640190fd5b600c54915060' +
    '00548114610db25760408051600160e51b62461bcd02815260206004820152600a602482' +
    '0152600160b21b691c994b595b9d195c995902604482015290519081900360640190fd5b' +
    '5090565b600061088082612467565b600d5481565b600280546040805160206001841615' +
    '6101000260001901909316849004601f8101849004840282018401909252818152929183' +
    '01828280156108005780601f106107d55761010080835404028352916020019161080056' +
    '5b6000806000610e2d846124a4565b90925090506000826003811115610e4057fe5b1461' +
    '0a3557604051600160e51b62461bcd028152600401808060200182810382526037815260' +
    '2001806148366037913960400191505060405180910390fd5b600061088082612558565b' +
    '6000610e946146ce565b6007546001600160a01b03166315f24053610ead6121fa565b60' +
    '0c54600d546040518463ffffffff1660e01b815260040180848152602001838152602001' +
    '8281526020019350505050604080518083038186803b158015610ef457600080fd5b505a' +
    'fa158015610f08573d6000803e3d6000fd5b505050506040513d6040811015610f1e5760' +
    '0080fd5b50805160209182015160408401819052918301526601c6bf526340001015610f' +
    '905760408051600160e51b62461bcd02815260206004820152601c60248201527f626f72' +
    '726f772072617465206973206162737572646c7920686967680000000060448201529051' +
    '9081900360640190fd5b602081015115610fb357610fab60056002836020015161259356' +
    '5b9150506109ba565b610fbb6125f9565b60608201819052600a54610fcf91906125fd56' +
    '5b6080830181905282826003811115610fe357fe5b6003811115610fee57fe5b90525060' +
    '0090508151600381111561100257fe5b1461100957fe5b61102960405180602001604052' +
    '8083604001518152508260800151612620565b60a083018190528282600381111561103d' +
    '57fe5b600381111561104857fe5b905250600090508151600381111561105c57fe5b1461' +
    '107d57610fab600960068360000151600381111561107857fe5b612593565b61108d8160' +
    'a00151600c546121a6565b60c08301819052828260038111156110a157fe5b6003811115' +
    '6110ac57fe5b90525060009050815160038111156110c057fe5b146110dc57610fab6009' +
    '60018360000151600381111561107857fe5b6110ec8160c00151600c54612688565b60e0' +
    '83018190528282600381111561110057fe5b600381111561110b57fe5b90525060009050' +
    '8151600381111561111f57fe5b1461113b57610fab600960048360000151600381111561' +
    '107857fe5b61115c60405180602001604052806009548152508260c00151600d546126ae' +
    '565b61010083018190528282600381111561117157fe5b600381111561117c57fe5b9052' +
    '50600090508151600381111561119057fe5b146111ac57610fab60096005836000015160' +
    '0381111561107857fe5b6111bf8160a00151600b54600b546126ae565b61012083018190' +
    '52828260038111156111d457fe5b60038111156111df57fe5b9052506000905081516003' +
    '8111156111f357fe5b1461120f57610fab600960038360000151600381111561107857fe' +
    '5b606080820151600a55610120820151600b81905560e0830151600c8190556101008401' +
    '51600d5560c08401516040805191825260208201939093528083019190915290517f8753' +
    '52fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9929181900390' +
    '910190a1600091505090565b600080546001018082558161129d33338787611e02565b14' +
    '91505b60005481146112ea5760408051600160e51b62461bcd0281526020600482015260' +
    '0a6024820152600160b21b691c994b595b9d195c99590260448201529051908190036064' +
    '0190fd5b5092915050565b600b5481565b600080611302610957565b6007549091506000' +
    '9081906001600160a01b03166315f240536113236121fa565b600c54600d546040518463' +
    'ffffffff1660e01b81526004018084815260200183815260200182815260200193505050' +
    '50604080518083038186803b15801561136a57600080fd5b505afa15801561137e573d60' +
    '00803e3d6000fd5b505050506040513d604081101561139457600080fd5b508051602090' +
    '910151909250905081156113e257604051600160e51b62461bcd02815260040180806020' +
    '01828103825260318152602001806148d56031913960400191505060405180910390fd5b' +
    '60006113ec6146bb565b611406604051806020016040528087815250600e54612620565b' +
    '9092509050600082600381111561141957fe5b1461145857604051600160e51b62461bcd' +
    '02815260040180806020018281038252603181526020018061486d603191396040019150' +
    '5060405180910390fd5b60006114626146bb565b61146e600c548461270a565b90925090' +
    '50600082600381111561148157fe5b146114c057604051600160e51b62461bcd02815260' +
    '04018080602001828103825260318152602001806147b160319139604001915050604051' +
    '80910390fd5b60006114ca6146bb565b6114fa6040518060200160405280670de0b6b3a7' +
    '6400008152506040518060200160405280600954815250612769565b9092509050600082' +
    '600381111561150d57fe5b1461154c57604051600160e51b62461bcd0281526004018080' +
    '6020018281038252603c815260200180614926603c913960400191505060405180910390' +
    'fd5b60006115566146bb565b61156f60405180602001604052808b81525084876127a356' +
    '5b9092509050600082600381111561158257fe5b146115c157604051600160e51b62461b' +
    'cd0281526004018080602001828103825260318152602001806148056031913960400191' +
    '505060405180910390fd5b519a505050505050505050505090565b600080546001018082' +
    '5560065460408051600160e01b63d02f7351028152306004820152336024820152600160' +
    '0160a01b0388811660448301528781166064830152608482018790529151859392909216' +
    '9163d02f73519160a48082019260209290919082900301818787803b15801561164a5760' +
    '0080fd5b505af115801561165e573d6000803e3d6000fd5b505050506040513d60208110' +
    '1561167457600080fd5b5051905080156116935761168b6003601b83612593565b925050' +
    '6109d8565b856001600160a01b0316856001600160a01b031614156116b95761168b6006' +
    '601c61227d565b6001600160a01b0385166000908152600f602052604081205481908190' +
    '6116e090886125fd565b909350915060008360038111156116f357fe5b14611716576117' +
    '0b6009601a85600381111561107857fe5b9550505050506109d8565b6001600160a01b03' +
    '89166000908152600f60205260409020546117399088612688565b909350905060008360' +
    '0381111561174c57fe5b146117645761170b6009601985600381111561107857fe5b6001' +
    '600160a01b038089166000818152600f60209081526040808320879055938d1680835291' +
    '84902085905583518b815293519193600080516020614906833981519152929081900390' +
    '910190a360065460408051600160e01b636d35bf91028152306004820152336024820152' +
    '6001600160a01b038c811660448301528b81166064830152608482018b90529151919092' +
    '1691636d35bf919160a480830192600092919082900301818387803b15801561181e5760' +
    '0080fd5b505af1158015611832573d6000803e3d6000fd5b506000925061183f91505056' +
    '5b9550505050506000548114610a215760408051600160e51b62461bcd02815260206004' +
    '820152600a6024820152600160b21b691c994b595b9d195c995902604482015290519081' +
    '900360640190fd5b6004546000906001600160a01b031633146118af57610aef60016045' +
    '61227d565b600580546001600160a01b038481166001600160a01b031983168117909355' +
    '6040805191909216808252602082019390935281517fca4f2f25d0898edd99413412fb94' +
    '012f9e54ec8142f9b093e7720646a95b16a9929181900390910190a16000610a35565b60' +
    '00805460010180825581611928610e8a565b1461197d5760408051600160e51b62461bcd' +
    '02815260206004820152601660248201527f61636372756520696e746572657374206661' +
    '696c656400000000000000000000604482015290519081900360640190fd5b6119856109' +
    '57565b91506000548114610db25760408051600160e51b62461bcd028152602060048201' +
    '52600a6024820152600160b21b691c994b595b9d195c9959026044820152905190819003' +
    '60640190fd5b6001600160a01b0381166000908152600f60205260408120548190819081' +
    '908180806119fb896124a4565b935090506000816003811115611a0d57fe5b14611a2b57' +
    '60095b975060009650869550859450611a5e9350505050565b611a33611d54565b925090' +
    '506000816003811115611a4557fe5b14611a51576009611a15565b506000965091945092' +
    '5090505b9193509193565b6000610880826127ed565b600061088082612828565b600160' +
    '0160a01b0391821660009081526010602090815260408083209390941682529190915220' +
    '5490565b6005546000906001600160a01b031633141580611ac1575033155b15611ad957' +
    '611ad26001600061227d565b90506109ba565b60048054600580546001600160a01b0380' +
    '82166001600160a01b031980861682179687905590921690925560408051938316808552' +
    '949092166020840152815190927ff9ffabca9c8276e99321725bcb43fb076a6c66a54b7f' +
    '21c4e8146d8519b417dc92908290030190a1600554604080516001600160a01b03808516' +
    '8252909216602083015280517fca4f2f25d0898edd99413412fb94012f9e54ec8142f9b0' +
    '93e7720646a95b16a99281900390910190a160009250505090565b600080611ba0610e8a' +
    '565b90508015611bc657611bbe816010811115611bb757fe5b604061227d565b91505061' +
    '0883565b610a358361285e565b6007546001600160a01b031681565b6000610ab7848484' +
    '6129d1565b6004546001600160a01b031681565b600754600090819081906001600160a0' +
    '1b03166315f24053611c1a6121fa565b600c54600d546040518463ffffffff1660e01b81' +
    '526004018084815260200183815260200182815260200193505050506040805180830381' +
    '86803b158015611c6157600080fd5b505afa158015611c75573d6000803e3d6000fd5b50' +
    '5050506040513d6040811015611c8b57600080fd5b508051602090910151909250905081' +
    '156109b657604051600160e51b62461bcd02815260040180806020018281038252603781' +
    '526020018061489e6037913960400191505060405180910390fd5b600080546001018082' +
    '5581611cec610e8a565b90508015611d0a57610c69816010811115611d0357fe5b604661' +
    '227d565b610c7a84612adf565b600181565b6000805460010180825581611d2b610e8a56' +
    '5b90508015611d4957610c69816010811115611d4257fe5b603661227d565b610c7a3333' +
    '86612b82565b600080600e5460001415611d6f575050600854600090611dfe565b600061' +
    '1d796121fa565b90506000611d856146bb565b6000611d9684600c54600d54612fde565b' +
    '935090506000816003811115611da857fe5b14611dbc57945060009350611dfe92505050' +
    '565b611dc883600e5461301c565b925090506000816003811115611dda57fe5b14611dee' +
    '57945060009350611dfe92505050565b5051600094509250611dfe915050565b9091565b' +
    '60065460408051600160e31b6317b9b84b0281523060048201526001600160a01b038681' +
    '16602483015285811660448301526064820185905291516000938493169163bdcdc25891' +
    '608480830192602092919082900301818787803b158015611e6a57600080fd5b505af115' +
    '8015611e7e573d6000803e3d6000fd5b505050506040513d6020811015611e9457600080' +
    'fd5b505190508015611eb357611eab6003604a83612593565b915050610ab7565b836001' +
    '600160a01b0316856001600160a01b03161415611ed957611eab6002604b61227d565b60' +
    '006001600160a01b038781169087161415611ef85750600019611f20565b506001600160' +
    'a01b038086166000908152601060209081526040808320938a16835292905220545b6000' +
    '80600080611f3085896125fd565b90945092506000846003811115611f4357fe5b14611f' +
    '6157611f546009604b61227d565b9650505050505050610ab7565b6001600160a01b038a' +
    '166000908152600f6020526040902054611f8490896125fd565b90945091506000846003' +
    '811115611f9757fe5b14611fa857611f546009604c61227d565b6001600160a01b038916' +
    '6000908152600f6020526040902054611fcb9089612688565b9094509050600084600381' +
    '1115611fde57fe5b14611fef57611f546009604d61227d565b6001600160a01b03808b16' +
    '6000908152600f6020526040808220859055918b16815220819055600019851461204757' +
    '6001600160a01b03808b166000908152601060209081526040808320938f168352929052' +
    '208390555b886001600160a01b03168a6001600160a01b03166000805160206149068339' +
    '815191528a6040518082815260200191505060405180910390a360065460408051600160' +
    'e11b63352b4a3f0281523060048201526001600160a01b038d811660248301528c811660' +
    '44830152606482018c905291519190921691636a56947e91608480830192600092919082' +
    '900301818387803b1580156120e657600080fd5b505af11580156120fa573d6000803e3d' +
    '6000fd5b5060009250612107915050565b9b9a5050505050505050505050565b60008054' +
    '60010180825581612129610e8a565b9050801561214f5761214781601081111561214057' +
    'fe5b603561227d565b9250506112a1565b61215a338686612b82565b9250506000548114' +
    '6112ea5760408051600160e51b62461bcd02815260206004820152600a60248201526001' +
    '60b21b691c994b595b9d195c995902604482015290519081900360640190fd5b60008060' +
    '006121b36146bb565b6121bd8686612620565b909250905060008260038111156121d057' +
    'fe5b146121e157509150600090506121f3565b60006121ec826130cc565b935093505050' +
    '5b9250929050565b60125460408051600160e01b6370a082310281523060048201529051' +
    '6000926001600160a01b03169182916370a0823191602480820192602092909190829003' +
    '018186803b15801561224b57600080fd5b505afa15801561225f573d6000803e3d6000fd' +
    '5b505050506040513d602081101561227557600080fd5b505191505090565b60007f45b9' +
    '6fe442630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa0836010811115' +
    '6122ac57fe5b83604d8111156122b857fe5b604080519283526020830191909152600082' +
    '820152519081900360600190a1826010811115610a3557fe5b6004546000908190819060' +
    '01600160a01b03163314612311576123086001603161227d565b92505050610883565b61' +
    '23196125f9565b600a541461232d57612308600a603361227d565b836123366121fa565b' +
    '101561234857612308600e603261227d565b600d5484111561235e576123086002603461' +
    '227d565b50600d54838103908111156123a757604051600160e51b62461bcd0281526004' +
    '018080602001828103825260248152602001806149cb6024913960400191505060405180' +
    '910390fd5b600d8190556004546123c2906001600160a01b0316856130db565b91506000' +
    '8260108111156123d257fe5b1461241157604051600160e51b62461bcd02815260040180' +
    '80602001828103825260238152602001806147e260239139604001915050604051809103' +
    '90fd5b600454604080516001600160a01b03909216825260208201869052818101839052' +
    '517f3bad0c59cf2f06e7314077049f48a93578cd16f5ef92329f1dab1420a99c177e9181' +
    '900360600190a16000949350505050565b600080546001018082558161247a610e8a565b' +
    '9050801561249857610c6981601081111561249157fe5b602761227d565b610c7a336000' +
    '8661319a565b6001600160a01b0381166000908152601160205260408120805482918291' +
    '829182916124db57506000945084935061255392505050565b6124eb8160000154600b54' +
    '6136af565b909450925060008460038111156124fe57fe5b146125135750919350600092' +
    '50612553915050565b6125218382600101546136ee565b90945091506000846003811115' +
    '61253457fe5b14612549575091935060009250612553915050565b506000945092505050' +
    '5b915091565b600080546001018082558161256b610e8a565b9050801561258957610c69' +
    '81601081111561258257fe5b601e61227d565b610c7a3385613719565b60007f45b96fe4' +
    '42630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa08460108111156125' +
    'c257fe5b84604d8111156125ce57fe5b6040805192835260208301919091528181018590' +
    '52519081900360600190a1836010811115610ab757fe5b4390565b600080838311612614' +
    '5750600090508183036121f3565b506003905060006121f3565b600061262a6146bb565b' +
    '60008061263b8660000151866136af565b9092509050600082600381111561264e57fe5b' +
    '1461266d575060408051602081019091526000815290925090506121f3565b6040805160' +
    '2081019091529081526000969095509350505050565b6000808383018481106126a05760' +
    '00925090506121f3565b5060029150600090506121f3565b60008060006126bb6146bb56' +
    '5b6126c58787612620565b909250905060008260038111156126d857fe5b146126e95750' +
    '915060009050612702565b6126fb6126f5826130cc565b86612688565b9350935050505b' +
    '935093915050565b60006127146146bb565b600080612729670de0b6b3a7640000876136' +
    'af565b9092509050600082600381111561273c57fe5b1461275b57506040805160208101' +
    '9091526000815290925090506121f3565b6121ec81866000015161301c565b6000612773' +
    '6146bb565b600080612788866000015186600001516125fd565b60408051602081019091' +
    '529081529097909650945050505050565b60006127ad6146bb565b60006127b76146bb56' +
    '5b6127c18787613b67565b909250905060008260038111156127d457fe5b146127e35790' +
    '92509050612702565b6126fb8186613b67565b6000805460010180825581612800610e8a' +
    '565b9050801561281e57610c6981601081111561281757fe5b600861227d565b610c7a33' +
    '85613c50565b600080546001018082558161283b610e8a565b9050801561285257610c69' +
    '81601081111561249157fe5b610c7a3385600061319a565b600454600090819060016001' +
    '60a01b0316331461288157611bbe6001604261227d565b6128896125f9565b600a541461' +
    '289d57611bbe600a604161227d565b600760009054906101000a90046001600160a01b03' +
    '169050826001600160a01b0316632191f92a6040518163ffffffff1660e01b8152600401' +
    '60206040518083038186803b1580156128ee57600080fd5b505afa158015612902573d60' +
    '00803e3d6000fd5b505050506040513d602081101561291857600080fd5b505161296e57' +
    '60408051600160e51b62461bcd02815260206004820152601c60248201527f6d61726b65' +
    '72206d6574686f642072657475726e65642066616c736500000000604482015290519081' +
    '900360640190fd5b600780546001600160a01b0319166001600160a01b03858116918217' +
    '909255604080519284168352602083019190915280517fedffc32e068c7c95dfd4bdfd5c' +
    '4d939a084d6b11c4199eac8436ed234d72f9269281900390910190a16000610a35565b60' +
    '008054600101808255816129e4610e8a565b90508015612a025761168b81601081111561' +
    '29fb57fe5b600f61227d565b836001600160a01b031663a6afed956040518163ffffffff' +
    '1660e01b8152600401602060405180830381600087803b158015612a3d57600080fd5b50' +
    '5af1158015612a51573d6000803e3d6000fd5b505050506040513d6020811015612a6757' +
    '600080fd5b505190508015612a875761168b816010811115612a8057fe5b601061227d56' +
    '5b612a9333878787613fbf565b9250506000548114610a215760408051600160e51b6246' +
    '1bcd02815260206004820152600a6024820152600160b21b691c994b595b9d195c995902' +
    '604482015290519081900360640190fd5b6004546000906001600160a01b03163314612b' +
    '0057610aef6001604761227d565b612b086125f9565b600a5414612b1c57610aef600a60' +
    '4861227d565b670de0b6b3a7640000821115612b3857610aef6002604961227d565b6009' +
    '805490839055604080518281526020810185905281517faaa68312e2ea9d50e16af50684' +
    '10ab56e1a1fd06037b1a35664812c30f821460929181900390910190a16000610a35565b' +
    '60065460408051600160e11b63120045310281523060048201526001600160a01b038681' +
    '1660248301528581166044830152606482018590529151600093849316916324008a6291' +
    '608480830192602092919082900301818787803b158015612bea57600080fd5b505af115' +
    '8015612bfe573d6000803e3d6000fd5b505050506040513d6020811015612c1457600080' +
    'fd5b505190508015612c3357612c2b6003603883612593565b915050610a35565b612c3b' +
    '6125f9565b600a5414612c4f57612c2b600a603961227d565b612c57614728565b600160' +
    '0160a01b0385166000908152601160205260409020600101546060820152612c81856124' +
    'a4565b6080830181905260208301826003811115612c9857fe5b6003811115612ca357fe' +
    '5b9052506000905081602001516003811115612cba57fe5b14612cdf57612cd660096037' +
    '8360200151600381111561107857fe5b92505050610a35565b600019841415612cf85760' +
    '808101516040820152612d00565b604081018490525b612d0e8682604001516144b3565b' +
    '81906010811115612d1b57fe5b90816010811115612d2857fe5b90525060008151601081' +
    '1115612d3a57fe5b14612d4c578051612cd690603c61227d565b612d5e81608001518260' +
    '4001516125fd565b60a0830181905260208301826003811115612d7557fe5b6003811115' +
    '612d8057fe5b9052506000905081602001516003811115612d9757fe5b14612db357612c' +
    'd66009603a8360200151600381111561107857fe5b612dc3600c5482604001516125fd56' +
    '5b60c0830181905260208301826003811115612dda57fe5b6003811115612de557fe5b90' +
    '52506000905081602001516003811115612dfc57fe5b14612e1857612cd66009603b8360' +
    '200151600381111561107857fe5b612e268682604001516145ea565b8190601081111561' +
    '2e3357fe5b90816010811115612e4057fe5b905250600081516010811115612e5257fe5b' +
    '14612ea75760408051600160e51b62461bcd02815260206004820152601f60248201527f' +
    '726570617920626f72726f77207472616e7366657220696e206661696c65640060448201' +
    '5290519081900360640190fd5b60a080820180516001600160a01b038089166000818152' +
    '60116020908152604091829020948555600b5460019095019490945560c0870151600c81' +
    '90558188015195518251948e168552948401929092528281019490945260608201929092' +
    '52608081019190915290517f1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0' +
    '355478d6f5c362a1929181900390910190a1600654604080830151606084015182516001' +
    '60e01b631ededc910281523060048201526001600160a01b038b811660248301528a8116' +
    '6044830152606482019390935260848101919091529151921691631ededc919160a48082' +
    '019260009290919082900301818387803b158015612fb357600080fd5b505af115801561' +
    '2fc7573d6000803e3d6000fd5b5060009250612fd4915050565b9695505050505050565b' +
    '600080600080612fee8787612688565b9092509050600082600381111561300157fe5b14' +
    '6130125750915060009050612702565b6126fb81866125fd565b60006130266146bb565b' +
    '60008061303b86670de0b6b3a76400006136af565b909250905060008260038111156130' +
    '4e57fe5b1461306d575060408051602081019091526000815290925090506121f3565b60' +
    '008061307a83886136ee565b9092509050600082600381111561308d57fe5b146130af57' +
    '5060408051602081019091526000815290945092506121f3915050565b60408051602081' +
    '0190915290815260009890975095505050505050565b51670de0b6b3a764000090049056' +
    '5b60125460408051600160e01b63a9059cbb0281526001600160a01b0385811660048301' +
    '5260248201859052915160009392909216918391839163a9059cbb916044808201928692' +
    '90919082900301818387803b15801561313a57600080fd5b505af115801561314e573d60' +
    '00803e3d6000fd5b505050503d60008114613168576020811461317257600080fd5b6000' +
    '19915061317e565b60206000803e60005191505b508061318f5760109250505061086f56' +
    '5b506000949350505050565b60008215806131a7575081155b6131e557604051600160e5' +
    '1b62461bcd02815260040180806020018281038252603481526020018061499760349139' +
    '60400191505060405180910390fd5b6131ed614728565b6131f5611d54565b6040830181' +
    '90526020830182600381111561320c57fe5b600381111561321757fe5b90525060009050' +
    '8160200151600381111561322e57fe5b1461324a57612c2b6009602b8360200151600381' +
    '111561107857fe5b83156132cb5760608101849052604080516020810182529082015181' +
    '5261327190856121a6565b608083018190526020830182600381111561328857fe5b6003' +
    '81111561329357fe5b90525060009050816020015160038111156132aa57fe5b146132c6' +
    '57612c2b600960298360200151600381111561107857fe5b613344565b6132e783604051' +
    '806020016040528084604001518152506146a4565b606083018190526020830182600381' +
    '11156132fe57fe5b600381111561330957fe5b9052506000905081602001516003811115' +
    '61332057fe5b1461333c57612c2b6009602a8360200151600381111561107857fe5b6080' +
    '81018390525b600654606082015160408051600160e01b63eabe7d910281523060048201' +
    '526001600160a01b03898116602483015260448201939093529051600093929092169163' +
    'eabe7d919160648082019260209290919082900301818787803b1580156133ac57600080' +
    'fd5b505af11580156133c0573d6000803e3d6000fd5b505050506040513d602081101561' +
    '33d657600080fd5b5051905080156133ed57612cd66003602883612593565b6133f56125' +
    'f9565b600a541461340957612cd6600a602c61227d565b613419600e5483606001516125' +
    'fd565b60a084018190526020840182600381111561343057fe5b600381111561343b57fe' +
    '5b905250600090508260200151600381111561345257fe5b1461346e57612cd66009602e' +
    '8460200151600381111561107857fe5b6001600160a01b0386166000908152600f602052' +
    '6040902054606083015161349691906125fd565b60c08401819052602084018260038111' +
    '156134ad57fe5b60038111156134b857fe5b905250600090508260200151600381111561' +
    '34cf57fe5b146134eb57612cd66009602d8460200151600381111561107857fe5b816080' +
    '01516134f86121fa565b101561350a57612cd6600e602f61227d565b6135188683608001' +
    '516130db565b8290601081111561352557fe5b9081601081111561353257fe5b90525060' +
    '008251601081111561354457fe5b146135995760408051600160e51b62461bcd02815260' +
    '206004820152601a60248201527f72656465656d207472616e73666572206f7574206661' +
    '696c6564000000000000604482015290519081900360640190fd5b60a0820151600e5560' +
    'c08201516001600160a01b0387166000818152600f602090815260409182902093909355' +
    '6060850151815190815290513093600080516020614906833981519152928290030190a3' +
    '6080820151606080840151604080516001600160a01b038b168152602081019490945283' +
    '810191909152517fe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4' +
    'ec31a9299281900390910190a16006546080830151606084015160408051600160e01b63' +
    '51dff9890281523060048201526001600160a01b038b8116602483015260448201949094' +
    '5260648101929092525191909216916351dff98991608480830192600092919082900301' +
    '818387803b158015612fb357600080fd5b600080836136c2575060009050806121f3565b' +
    '838302838582816136cf57fe5b04146136e3575060029150600090506121f3565b600092' +
    '5090506121f3565b6000808261370257506001905060006121f3565b600083858161370d' +
    '57fe5b04915091509250929050565b60065460408051600160e01b634ef4c3e102815230' +
    '60048201526001600160a01b038581166024830152604482018590529151600093849316' +
    '91634ef4c3e191606480830192602092919082900301818787803b158015613779576000' +
    '80fd5b505af115801561378d573d6000803e3d6000fd5b505050506040513d6020811015' +
    '6137a357600080fd5b5051905080156137c2576137ba6003601f83612593565b91505061' +
    '086f565b6137ca6125f9565b600a54146137de576137ba600a602261227d565b6137e661' +
    '4766565b6137f085856144b3565b819060108111156137fd57fe5b908160108111156138' +
    '0a57fe5b90525060008151601081111561381c57fe5b1461383757805161382e90602661' +
    '227d565b9250505061086f565b61383f611d54565b604083018190526020830182600381' +
    '111561385657fe5b600381111561386157fe5b9052506000905081602001516003811115' +
    '61387857fe5b146138945761382e600960218360200151600381111561107857fe5b6138' +
    'b084604051806020016040528084604001518152506146a4565b60608301819052602083' +
    '018260038111156138c757fe5b60038111156138d257fe5b905250600090508160200151' +
    '60038111156138e957fe5b146139055761382e6009602083602001516003811115611078' +
    '57fe5b613915600e548260600151612688565b6080830181905260208301826003811115' +
    '61392c57fe5b600381111561393757fe5b90525060009050816020015160038111156139' +
    '4e57fe5b1461396a5761382e600960248360200151600381111561107857fe5b60016001' +
    '60a01b0385166000908152600f602052604090205460608201516139929190612688565b' +
    '60a08301819052602083018260038111156139a957fe5b60038111156139b457fe5b9052' +
    '5060009050816020015160038111156139cb57fe5b146139e75761382e60096023836020' +
    '0151600381111561107857fe5b6139f185856145ea565b819060108111156139fe57fe5b' +
    '90816010811115613a0b57fe5b905250600081516010811115613a1d57fe5b14613a2f57' +
    '805161382e90602561227d565b6080810151600e5560a08101516001600160a01b038616' +
    '6000818152600f6020908152604091829020939093556060808501518251938452938301' +
    '88905282820193909352517f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef' +
    '26394f4c03821c4f929181900390910190a1606081015160408051918252516001600160' +
    'a01b0387169130916000805160206149068339815191529181900360200190a360065460' +
    '6082015160408051600160e01b6341c728b90281523060048201526001600160a01b0389' +
    '81166024830152604482018990526064820193909352905191909216916341c728b99160' +
    '8480830192600092919082900301818387803b158015613b3d57600080fd5b505af11580' +
    '15613b51573d6000803e3d6000fd5b5060009250613b5e915050565b9594505050505056' +
    '5b6000613b716146bb565b600080613b86866000015186600001516136af565b90925090' +
    '506000826003811115613b9957fe5b14613bb85750604080516020810190915260008152' +
    '90925090506121f3565b600080613bcd6706f05b59d3b2000084612688565b9092509050' +
    '6000826003811115613be057fe5b14613c02575060408051602081019091526000815290' +
    '945092506121f3915050565b600080613c1783670de0b6b3a76400006136ee565b909250' +
    '90506000826003811115613c2a57fe5b14613c3157fe5b60408051602081019091529081' +
    '5260009a909950975050505050505050565b60065460408051600160e21b63368f515302' +
    '81523060048201526001600160a01b038581166024830152604482018590529151600093' +
    '8493169163da3d454c91606480830192602092919082900301818787803b158015613cb0' +
    '57600080fd5b505af1158015613cc4573d6000803e3d6000fd5b505050506040513d6020' +
    '811015613cda57600080fd5b505190508015613cf1576137ba6003600e83612593565b61' +
    '3cf96125f9565b600a5414613d0c576137ba600a8061227d565b82613d156121fa565b10' +
    '15613d27576137ba600e600961227d565b613d2f614780565b613d38856124a4565b6040' +
    '830181905260208301826003811115613d4f57fe5b6003811115613d5a57fe5b90525060' +
    '00905081602001516003811115613d7157fe5b14613d8d5761382e600960078360200151' +
    '600381111561107857fe5b613d9b816040015185612688565b6060830181905260208301' +
    '826003811115613db257fe5b6003811115613dbd57fe5b90525060009050816020015160' +
    '03811115613dd457fe5b14613df05761382e6009600c8360200151600381111561107857' +
    'fe5b613dfc600c5485612688565b6080830181905260208301826003811115613e1357fe' +
    '5b6003811115613e1e57fe5b9052506000905081602001516003811115613e3557fe5b14' +
    '613e515761382e6009600b8360200151600381111561107857fe5b613e5b85856130db56' +
    '5b81906010811115613e6857fe5b90816010811115613e7557fe5b905250600081516010' +
    '811115613e8757fe5b14613edc5760408051600160e51b62461bcd028152602060048201' +
    '52601a60248201527f626f72726f77207472616e73666572206f7574206661696c656400' +
    '0000000000604482015290519081900360640190fd5b606080820180516001600160a01b' +
    '038816600081815260116020908152604091829020938455600b54600190940193909355' +
    '608080870151600c819055945182519384529383018a9052828201939093529381019290' +
    '925291517f13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab' +
    '80929181900390910190a160065460408051600160e01b635c7786050281523060048201' +
    '526001600160a01b0388811660248301526044820188905291519190921691635c778605' +
    '91606480830192600092919082900301818387803b158015613b3d57600080fd5b600654' +
    '60408051600160e11b632fe3f38f0281523060048201526001600160a01b038481166024' +
    '830152878116604483015286811660648301526084820186905291516000938493169163' +
    '5fc7e71e9160a480830192602092919082900301818787803b15801561402f57600080fd' +
    '5b505af1158015614043573d6000803e3d6000fd5b505050506040513d60208110156140' +
    '5957600080fd5b50519050801561407057611eab6003601283612593565b6140786125f9' +
    '565b600a541461408c57611eab600a601661227d565b6140946125f9565b836001600160' +
    'a01b0316636c540baf6040518163ffffffff1660e01b8152600401602060405180830381' +
    '86803b1580156140cd57600080fd5b505afa1580156140e1573d6000803e3d6000fd5b50' +
    '5050506040513d60208110156140f757600080fd5b50511461410a57611eab600a601161' +
    '227d565b856001600160a01b0316856001600160a01b0316141561413057611eab600660' +
    '1761227d565b8361414157611eab6007601561227d565b60001984141561415757611eab' +
    '6007601461227d565b60065460408051600160e01b63c488847b02815230600482015260' +
    '01600160a01b038681166024830152604482018890528251600094859492169263c48884' +
    '7b926064808301939192829003018186803b1580156141b457600080fd5b505afa158015' +
    '6141c8573d6000803e3d6000fd5b505050506040513d60408110156141de57600080fd5b' +
    '50805160209091015190925090508115614209576141ff6004601384612593565b935050' +
    '5050610ab7565b846001600160a01b03166370a08231886040518263ffffffff1660e01b' +
    '815260040180826001600160a01b03166001600160a01b03168152602001915050602060' +
    '40518083038186803b15801561425f57600080fd5b505afa158015614273573d6000803e' +
    '3d6000fd5b505050506040513d602081101561428957600080fd5b505181111561429e57' +
    '6141ff600d601d61227d565b60006142ab898989612b82565b905080156142d4576142c9' +
    '8160108111156142c257fe5b601861227d565b945050505050610ab7565b604080516001' +
    '60e01b63b2a02ff10281526001600160a01b038b811660048301528a8116602483015260' +
    '448201859052915160009289169163b2a02ff19160648083019260209291908290030181' +
    '8787803b15801561433257600080fd5b505af1158015614346573d6000803e3d6000fd5b' +
    '505050506040513d602081101561435c57600080fd5b5051905080156143b65760408051' +
    '600160e51b62461bcd02815260206004820152601460248201527f746f6b656e20736569' +
    '7a757265206661696c656400000000000000000000000060448201529051908190036064' +
    '0190fd5b604080516001600160a01b03808d168252808c1660208301528183018b905289' +
    '1660608201526080810185905290517f298637f684da70674f26509b10f07ec2fbc77a33' +
    '5ab1e7d6215a4b2484d8bb529181900360a00190a160065460408051600160e01b6347ef' +
    '3b3b0281523060048201526001600160a01b038a811660248301528d811660448301528c' +
    '81166064830152608482018c905260a48201879052915191909216916347ef3b3b9160c4' +
    '80830192600092919082900301818387803b15801561448457600080fd5b505af1158015' +
    '614498573d6000803e3d6000fd5b50600092506144a5915050565b9a9950505050505050' +
    '505050565b60125460408051600160e11b636eb1769f0281526001600160a01b03858116' +
    '6004830152306024830152915160009392909216918491839163dd62ed3e916044808201' +
    '92602092909190829003018186803b15801561451157600080fd5b505afa158015614525' +
    '573d6000803e3d6000fd5b505050506040513d602081101561453b57600080fd5b505110' +
    '1561454d57600c91505061086f565b82816001600160a01b03166370a082318660405182' +
    '63ffffffff1660e01b815260040180826001600160a01b03166001600160a01b03168152' +
    '60200191505060206040518083038186803b1580156145a457600080fd5b505afa158015' +
    '6145b8573d6000803e3d6000fd5b505050506040513d60208110156145ce57600080fd5b' +
    '505110156145e057600d91505061086f565b5060009392505050565b6012546040805160' +
    '0160e01b6323b872dd0281526001600160a01b0385811660048301523060248301526044' +
    '820185905291516000939290921691839183916323b872dd916064808201928692909190' +
    '82900301818387803b15801561464f57600080fd5b505af1158015614663573d6000803e' +
    '3d6000fd5b505050503d6000811461467d576020811461468757600080fd5b6000199150' +
    '614693565b60206000803e60005191505b508061318f57600f9250505061086f565b6000' +
    '8060006146b16146bb565b6121bd868661270a565b604051806020016040528060008152' +
    '5090565b6040805161014081019091528060008152602001600081526020016000815260' +
    '200160008152602001600081526020016147066146bb565b815260200160008152602001' +
    '6000815260200160008152602001600081525090565b6040805160e08101909152806000' +
    '815260200160008152602001600081526020016000815260200160008152602001600081' +
    '52602001600081525090565b6040805160c0810190915280600081526020016000614706' +
    '565b6040805160a081019091528060008152602001600081526020016000815260200160' +
    '00815260200160008152509056fe737570706c7952617465506572426c6f636b3a206361' +
    '6c63756c6174696e6720626f72726f7773506572206661696c6564726564756365207265' +
    '736572766573207472616e73666572206f7574206661696c6564737570706c7952617465' +
    '506572426c6f636b3a2063616c63756c6174696e6720737570706c795261746520666169' +
    '6c6564626f72726f7742616c616e636553746f7265643a20626f72726f7742616c616e63' +
    '6553746f726564496e7465726e616c206661696c6564737570706c795261746550657242' +
    '6c6f636b3a2063616c63756c6174696e6720756e6465726c79696e67206661696c656462' +
    '6f72726f7752617465506572426c6f636b3a20696e746572657374526174654d6f64656c' +
    '2e626f72726f7752617465206661696c6564737570706c7952617465506572426c6f636b' +
    '3a2063616c63756c6174696e6720626f72726f7752617465206661696c6564ddf252ad1b' +
    'e2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef737570706c79526174' +
    '65506572426c6f636b3a2063616c63756c6174696e67206f6e654d696e75735265736572' +
    '7665466163746f72206661696c656465786368616e67655261746553746f7265643a2065' +
    '786368616e67655261746553746f726564496e7465726e616c206661696c65646f6e6520' +
    '6f662072656465656d546f6b656e73496e206f722072656465656d416d6f756e74496e20' +
    '6d757374206265207a65726f72656475636520726573657276657320756e657870656374' +
    '656420756e646572666c6f77a165627a7a72305820ae92d0e3e70b657d01891c7457bc6c' +
    '8a5ce2401a1a8857f346a2fa9af4627145002953657474696e6720696e74657265737420' +
    '72617465206d6f64656c206661696c6564496e697469616c2065786368616e6765207261' +
    '7465206d7573742062652067726561746572207468616e207a65726f2e' +
    '000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' + // usdc
    '0000000000000000000000003d9819210a31b4961b30ef54be2aed79b9c9cd3b' + // troll
    '000000000000000000000000c64c4cba055efa614ce01f4bad8a9f519c4f8fab' + // IRM
    '0000000000000000000000000000000000000000000000000000b5e620f48000' +
    '00000000000000000000000000000000000000000000000000000000000000e0' +
    '0000000000000000000000000000000000000000000000000000000000000120' +
    '0000000000000000000000000000000000000000000000000000000000000008' +
    '0000000000000000000000000000000000000000000000000000000000000011' +
    '436f6d706f756e642055534420436f696e000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000005' +
    '6355534443000000000000000000000000000000000000000000000000000000'
  )

  // ************************** helper functions **************************** //
  async function send(
    title,
    instance,
    method,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    const receipt = await instance.methods[method](...args).send({
      from: from,
      value: value,
      gas: gas,
      gasPrice: gasPrice
    }).on('confirmation', (confirmationNumber, r) => {
      confirmations[r.transactionHash] = confirmationNumber
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      return {status: false}
    })

    if (receipt.status !== shouldSucceed) {
      return false
    } else if (!shouldSucceed) {
      return true
    }

    let assertionsPassed
    try {
      assertionCallback(receipt)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
      console.log(error);
    }

    return assertionsPassed
  }

  async function call(
    title,
    instance,
    method,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    let succeeded = true
    returnValues = await instance.methods[method](...args).call({
      from: from,
      value: value,
      gas: gas,
      gasPrice: gasPrice
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      succeeded = false
    })

    if (succeeded !== shouldSucceed) {
      return false
    } else if (!shouldSucceed) {
      return true
    }

    let assertionsPassed
    try {
      assertionCallback(returnValues)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
      console.log(error);
    }

    return assertionsPassed
  }

  async function deploy(
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
    let deployData = instance.deploy({arguments: args}).encodeABI()
    let deployGas = await web3.eth.estimateGas({
        from: from,
        data: deployData
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      return gasLimit
    })

    if (deployGas > gasLimit) {
      console.error(` ✘ ${title}: deployment costs exceed block gas limit!`)
      process.exit(1)
    }

    if (typeof(gas) === 'undefined') {
      gas = deployGas
    }

    if (deployGas > gas) {
      console.error(` ✘ ${title}: deployment costs exceed supplied gas.`)
      process.exit(1)
    }

    let signed
    let deployHash
    let receipt
    const contract = await instance.deploy({arguments: args}).send({
      from: from,
      gas: gas,
      gasPrice: gasPrice
    }).on('transactionHash', hash => {
      deployHash = hash
    }).on('receipt', r => {
      receipt = r
    }).on('confirmation', (confirmationNumber, r) => {
      confirmations[r.transactionHash] = confirmationNumber
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }

      receipt = {status: false}
    })

    if (receipt.status !== shouldSucceed) {
      if (contract) {
        return [false, contract, gas]
      }
      return [false, instance, gas]
    } else if (!shouldSucceed) {
      if (contract) {
        return [true, contract, gas]
      }
      return [true, instance, gas]
    }

    assert.ok(receipt.status)

    let assertionsPassed
    try {
      assertionCallback(receipt)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
    }

    if (contract) {
      return [assertionsPassed, contract, gas]
    }
    return [assertionsPassed, instance, gas]
  }

  async function runTest(
    title,
    instance,
    method,
    callOrSend,
    args,
    shouldSucceed,
    assertionCallback,
    from,
    value,
    gas
  ) {
    if (typeof(callOrSend) === 'undefined') {
      callOrSend = 'send'
    }
    if (typeof(args) === 'undefined') {
      args = []
    }
    if (typeof(shouldSucceed) === 'undefined') {
      shouldSucceed = true
    }
    if (typeof(assertionCallback) === 'undefined') {
      assertionCallback = (value) => {}
    }
    if (typeof(from) === 'undefined') {
      from = address
    }
    if (typeof(value) === 'undefined') {
      value = 0
    }
    if (typeof(gas) === 'undefined' && callOrSend !== 'deploy') {
      gas = 6009006
      if (testingContext === 'coverage') {
        gas = gasLimit - 1
      }
    }
    let ok = false
    let contract
    let deployGas
    if (callOrSend === 'send') {
      ok = await send(
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
      )
    } else if (callOrSend === 'call') {
      ok = await call(
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
      )
    } else if (callOrSend === 'deploy') {
      const fields = await deploy(
        title,
        instance,
        args,
        from,
        value,
        gas,
        1,
        shouldSucceed,
        assertionCallback
      )
      ok = fields[0]
      contract = fields[1]
      deployGas = fields[2]
    } else {
      console.error('must use call, send, or deploy!')
      process.exit(1)
    }

    if (ok) {
      console.log(
        ` ✓ ${
          callOrSend === 'deploy' ? 'successful ' : ''
        }${title}${
          callOrSend === 'deploy' ? ` (${deployGas} gas)` : ''
        }`
      )
      passed++
    } else {
      console.log(
        ` ✘ ${
          callOrSend === 'deploy' ? 'failed ' : ''
        }${title}${
          callOrSend === 'deploy' ? ` (${deployGas} gas)` : ''
        }`
      )
      failed++
    }

    if (contract) {
      return contract
    }
  }

  async function setupNewDefaultAddress(newPrivateKey) {
    const pubKey = await web3.eth.accounts.privateKeyToAccount(newPrivateKey)
    await web3.eth.accounts.wallet.add(pubKey)

    const txCount = await web3.eth.getTransactionCount(pubKey.address)

    if (txCount > 0) {
      console.warn(
        `warning: ${pubKey.address} has already been used, which may cause ` +
        'some tests to fail or to be skipped.'
      )
    }

    await web3.eth.sendTransaction({
      from: originalAddress,
      to: pubKey.address,
      value: 10 ** 18,
      gas: '0x5208',
      gasPrice: '0x4A817C800'
    })

    return pubKey.address
  }

  async function raiseGasLimit(necessaryGas) {
    iterations = 9999
    if (necessaryGas > 8000000) {
      console.error('the gas needed is too high!')
      process.exit(1)
    } else if (typeof necessaryGas === 'undefined') {
      iterations = 20
      necessaryGas = 8000000
    }

    // bring up gas limit if necessary by doing additional transactions
    var block = await web3.eth.getBlock("latest")
    while (iterations > 0 && block.gasLimit < necessaryGas) {
      await web3.eth.sendTransaction({
        from: originalAddress,
        to: originalAddress,
        value: '0x01',
        gas: '0x5208',
        gasPrice: '0x4A817C800'
      })
      var block = await web3.eth.getBlock("latest")
      iterations--
    }

    console.log("raising gasLimit, currently at " + block.gasLimit)
    return block.gasLimit
  }

  async function getDeployGas(dataPayload) {
    await web3.eth.estimateGas({
      from: address,
      data: dataPayload
    }).catch(async error => {
      if (
        error.message === (
          'Returned error: gas required exceeds allowance or always failing ' +
          'transaction'
        )
      ) {
        await raiseGasLimit()
        await getDeployGas(dataPayload)
      }
    })

    deployGas = await web3.eth.estimateGas({
      from: address,
      data: dataPayload
    })

    return deployGas
  }

  function signHashedPrefixedHexString(hashedHexString, account) {
    const hashedPrefixedMessage = web3.utils.keccak256(
      // prefix => "\x19Ethereum Signed Message:\n32"
      "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
      hashedHexString.slice(2),
      {encoding: "hex"}
    )

    const sig = util.ecsign(
      util.toBuffer(hashedPrefixedMessage),
      util.toBuffer(web3.eth.accounts.wallet[account].privateKey)
    )

    return (
      util.bufferToHex(sig.r) +
      util.bufferToHex(sig.s).slice(2) +
      web3.utils.toHex(sig.v).slice(2)
    )
  }

  function signHashedPrefixedHashedHexString(hexString, account) {
    const hashedPrefixedHashedMessage = web3.utils.keccak256(
      // prefix => "\x19Ethereum Signed Message:\n32"
      "0x19457468657265756d205369676e6564204d6573736167653a0a3332" +
      web3.utils.keccak256(hexString, {encoding: "hex"}).slice(2),
      {encoding: "hex"}
    )

    const sig = util.ecsign(
      util.toBuffer(hashedPrefixedHashedMessage),
      util.toBuffer(web3.eth.accounts.wallet[account].privateKey)
    )

    return (
      util.bufferToHex(sig.r) +
      util.bufferToHex(sig.s).slice(2) +
      web3.utils.toHex(sig.v).slice(2)
    )
  }

  // *************************** deploy contracts *************************** //
  let deployGas
  let selfAddress

  const currentDaiCode = await web3.eth.getCode(constants.DAI_MAINNET_ADDRESS)
  if (currentDaiCode !== '0x') {
    console.log('contracts already set up, skipping...')
    return 0
  }

  console.log('funding dai deployer address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: '0x552F355CCb9b91C8FB47D9c011AbAD5B72EC30e9',
    value: web3.utils.toWei('10', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
    gasPrice: 1
  })

  console.log('funding usdc deployer address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: '0x95Ba4cF87D6723ad9C0Db21737D862bE80e93911',
    value: web3.utils.toWei('10', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
    gasPrice: 1
  })

  console.log('funding Compound deployer address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    value: web3.utils.toWei('10', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
    gasPrice: 1
  })

  console.log('incrementing dai deployment nonce...')
  let daiDeployReceipt
  for (i = 0; i < 4; i++) {
    daiDeployReceipt = await web3.eth.sendTransaction({
      from: '0x552F355CCb9b91C8FB47D9c011AbAD5B72EC30e9',
      gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
      gasPrice: 1,
      data: '0x3838533838f3'
    })
  }

  console.log('deploying mock Dai...')
  daiDeployReceipt = await web3.eth.sendTransaction({
    from: '0x552F355CCb9b91C8FB47D9c011AbAD5B72EC30e9',
    gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockDaiDeploymentData
  })

  assert.strictEqual(
    daiDeployReceipt.contractAddress, constants.DAI_MAINNET_ADDRESS
  )

  await runTest(
    'Transfer Dai to whale address',
    DAI,
    'transfer',
    'send',
    [
      constants.DAI_WHALE_ADDRESS,
      '8555083659983933209597798445644913612440610624038028786991485007418559037440'
    ],
    true,
    receipt => {},
    '0x552F355CCb9b91C8FB47D9c011AbAD5B72EC30e9'
  )

  await runTest(
    'Transfer Dai to primary address',
    DAI,
    'transfer',
    'send',
    [
      address,
      '100000000000000000000000000000000000000000000000000000000000000000000000000000'
    ],
    true,
    receipt => {},
    '0x552F355CCb9b91C8FB47D9c011AbAD5B72EC30e9'
  )

  await runTest(
    'Dai totalSupply is reachable',
    DAI,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(
        value,
        '108555083659983933209597798445644913612440610624038028786991485007418559037440'
      )
    }
  )

  console.log('incrementing usdc deployment nonce...')
  let usdcDeployReceipt
  for (i = 0; i < 20; i++) {
    usdcDeployReceipt = await web3.eth.sendTransaction({
      from: '0x95Ba4cF87D6723ad9C0Db21737D862bE80e93911',
      gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
      gasPrice: 1,
      data: '0x3838533838f3'
    })
  }

  console.log('deploying mock USDC...')
  usdcDeployReceipt = await web3.eth.sendTransaction({
    from: '0x95Ba4cF87D6723ad9C0Db21737D862bE80e93911',
    gas: (testingContext !== 'coverage') ? '4000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockUSDCDeploymentData
  })

  assert.strictEqual(
    usdcDeployReceipt.contractAddress, constants.USDC_MAINNET_ADDRESS
  )

  await runTest(
    'initialize USDC',
    FIAT_TOKEN,
    'initialize',
    'send',
    [
      'USD//C',
      'USDC',
      'USD',
      6,
      address,
      address,
      address,
      address
    ]
  )

  await runTest(
    'add USDC minter',
    FIAT_TOKEN,
    'configureMinter',
    'send',
    [
      address,
      '0xf000000000000000000000000000000000000000000000000000000000000000'
    ]
  )

  await runTest(
    'Mint USDC to whale address',
    FIAT_TOKEN,
    'mint',
    'send',
    [
      constants.USDC_WHALE_ADDRESS,
      '8555083659983933209597798445644913612440610624038028786991485007418559037440'
    ]
  )

  await runTest(
    'Mint USDC to primary address',
    FIAT_TOKEN,
    'mint',
    'send',
    [
      address,
      '100000000000000000000000000000000000000000000000000000000000000000000000000000'
    ]
  )

  await runTest(
    'USDC totalSupply is reachable',
    USDC,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(
        value,
        '108555083659983933209597798445644913612440610624038028786991485007418559037440'
      )
    }
  )

  await runTest(
    'blacklist a USDC address',
    FIAT_TOKEN,
    'blacklist',
    'send',
    [constants.MOCK_USDC_BLACKLISTED_ADDRESS]
  )

  console.log('deploying Compound unitroller...')
  const unitrollerDeploymentReceipt = await web3.eth.sendTransaction({
    from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockUnitrollerDeploymentData
  })

  assert.strictEqual(
    unitrollerDeploymentReceipt.contractAddress,
    constants.COMPTROLLER_MAINNET_ADDRESS
  )

  console.log('deploying v0 Compound comptroller...')
  let comptrollerDeploymentReceipt = await web3.eth.sendTransaction({
    from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    gas: (testingContext !== 'coverage') ? '5000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockCurrentComptrollerDeploymentData
  })

  let COMPTROLLER = new web3.eth.Contract(
    COMPTROLLER_ABI,
    comptrollerDeploymentReceipt.contractAddress
  )

  const UNITROLLER_COMPTROLLER = new web3.eth.Contract(
    COMPTROLLER_ABI,
    UNITROLLER.options.address
  )

  await runTest(
    'Set pending Comptroller on Unitroller',
    UNITROLLER,
    '_setPendingImplementation',
    'send',
    [
      COMPTROLLER.options.address
    ],
    true,
    receipt => {},
    '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6'
  )  

  await runTest(
    'Set Comptroller on Unitroller',
    COMPTROLLER,
    '_become',
    'send',
    [
      UNITROLLER.options.address,
      address,
      '500000000000000000',
      20,
      false
    ],
    true,
    receipt => {},
    '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6'
  )

  await runTest(
    'comptroller implementation is set correctly',
    UNITROLLER,
    'comptrollerImplementation',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, COMPTROLLER.options.address)
    }
  )

  console.log('incrementing Compound deployment nonce...')
  let compoundDeployReceipt
  for (i = 4; i < 7; i++) {
    compoundDeployReceipt = await web3.eth.sendTransaction({
      from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
      gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
      gasPrice: 1,
      data: '0x3838533838f3'
    })
  }

  console.log('deploying Compound cDAI IRM...')
  const cDAIIRMDeploymentReceipt = await web3.eth.sendTransaction({
    from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockCDaiIRMDeploymentData
  })  

  assert.strictEqual(
    cDAIIRMDeploymentReceipt.contractAddress,
    '0xa1046abfc2598F48C44Fb320d281d3F3c0733c9a'
  )

  console.log('deploying Compound cUSDC IRM...')
  const cUSDCIRMDeploymentReceipt = await web3.eth.sendTransaction({
    from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockCUSDCIRMDeploymentData
  })  

  assert.strictEqual(
    cUSDCIRMDeploymentReceipt.contractAddress,
    '0xc64C4cBA055eFA614CE01F4BAD8A9F519C4f8FaB'
  )

  console.log('incrementing Compound deployment nonce...')
  for (i = 9; i < 14; i++) {
    compoundDeployReceipt = await web3.eth.sendTransaction({
      from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
      gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
      gasPrice: 1,
      data: '0x3838533838f3'
    })
  }

  console.log('deploying Compound cDai...')
  const cDaiDeploymentReceipt = await web3.eth.sendTransaction({
    from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    gas: (testingContext !== 'coverage') ? '7000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockCDaiDeploymentData
  })  

  assert.strictEqual(
    cDaiDeploymentReceipt.contractAddress, constants.CDAI_MAINNET_ADDRESS
  )

  for (i = 15; i < 17; i++) {
    compoundDeployReceipt = await web3.eth.sendTransaction({
      from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
      gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
      gasPrice: 1,
      data: '0x3838533838f3'
    })
  }

  console.log('deploying Compound cUSDC...')
  const cUSDCDeploymentReceipt = await web3.eth.sendTransaction({
    from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    gas: (testingContext !== 'coverage') ? '7000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockCUSDCDeploymentData
  })  

  assert.strictEqual(
    cUSDCDeploymentReceipt.contractAddress, constants.CUSDC_MAINNET_ADDRESS
  )

  for (i = 18; i < 68; i++) {
    compoundDeployReceipt = await web3.eth.sendTransaction({
      from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
      gas: (testingContext !== 'coverage') ? '1000000' : gasLimit - 1,
      gasPrice: 1,
      data: '0x3838533838f3'
    })
  }

  console.log('deploying current Compound comptroller...')
  comptrollerDeploymentReceipt = await web3.eth.sendTransaction({
    from: '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6',
    gas: (testingContext !== 'coverage') ? '5000000' : gasLimit - 1,
    gasPrice: 1,
    data: mockCurrentComptrollerDeploymentData
  })  

  assert.strictEqual(
    comptrollerDeploymentReceipt.contractAddress,
    '0x178053c06006e67e09879C09Ff012fF9d263dF29'
  )

  COMPTROLLER = new web3.eth.Contract(
    COMPTROLLER_ABI,
    comptrollerDeploymentReceipt.contractAddress
  )

  await runTest(
    'Set pending Comptroller on Unitroller',
    UNITROLLER,
    '_setPendingImplementation',
    'send',
    [
      comptrollerDeploymentReceipt.contractAddress
    ],
    true,
    receipt => {},
    '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6'
  )

  await runTest(
    'Set Comptroller on Unitroller',
    COMPTROLLER,
    '_become',
    'send',
    [
      UNITROLLER.options.address,
      address,
      '500000000000000000',
      20,
      true
    ],
    true,
    receipt => {},
    '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6'
  )

  await runTest(
    'comptroller implementation is set correctly',
    UNITROLLER,
    'comptrollerImplementation',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, COMPTROLLER.options.address)
    }
  )

  await runTest(
    'Set pending admin on Unitroller',
    UNITROLLER,
    '_setPendingAdmin',
    'send',
    [
      address
    ],
    true,
    receipt => {},
    '0xA7ff0d561cd15eD525e31bbe0aF3fE34ac2059F6'
  )  

  await runTest(
    'Set new admin on Unitroller',
    UNITROLLER,
    '_acceptAdmin'
  )

  await runTest(
    'comptroller admin is set correctly',
    UNITROLLER,
    'admin',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'List cDai on Comptroller',
    UNITROLLER_COMPTROLLER,
    '_supportMarket',
    'send',
    [
      CDAI.options.address
    ]
  ) 

  await runTest(
    'List cUSDC on Comptroller',
    UNITROLLER_COMPTROLLER,
    '_supportMarket',
    'send',
    [
      CUSDC.options.address
    ]
  )

  // TODO: list increase cDAI and cUSDC collateral factor on comptroller

  // TODO: set prices using price oracle

  // TODO: verify comptroller state

  // TODO: supply and borrow some assets in each market

  console.log(
    `completed ${passed + failed} test${passed + failed === 1 ? '' : 's'} ` +
    `with ${failed} failure${failed === 1 ? '' : 's'}.`
  )

  if (failed > 0) {
    process.exit(1)
  }

  // exit.
  return 0
}}
