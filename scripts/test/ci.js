const connectionConfig = require('../../truffle-config.js')

const connection = connectionConfig.networks['development']

let web3Provider = connection.provider

// import tests
var deploy = require('./deploy.js')
var test = require('./test.js')

// run tests
async function runTests() {
	await deploy.test(web3Provider, 'development')
	await test.test(web3Provider, 'development')
	process.exit(0)
}

runTests()
