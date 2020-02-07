const connectionConfig = require('../../truffle-config.js');

const connection = connectionConfig.networks['coverage'];

const web3 = connection.provider;

module.exports = {
    web3,
};
