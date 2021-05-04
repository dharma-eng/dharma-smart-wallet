require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const url = process.env.WEB3_PROVIDER_URL;

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    networks: {
        hardhat: {
            forking: {
                url
            }
        }
    },
    mocha: {
        timeout: 99999,
        parallel: true
    }
};
