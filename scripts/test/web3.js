const context = process.env.TESTING_CONTEXT;

const connectionConfig = require('../../truffle-config.js');

const connection = connectionConfig.networks[context];

const web3 = connection.provider;

module.exports = {
    web3,
};