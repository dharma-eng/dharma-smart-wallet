var Web3 = require('web3')
web3Provider = new Web3('ws://localhost:8555')

// import tests
var deployMockExternal = require('./deployMockExternal.js')
var deploy = require('./deploy.js')
var test = require('./test.js')

// run tests
async function runTests() {
  await deployMockExternal.test(web3Provider, 'coverage')
  await deploy.test(web3Provider, 'coverage')
  await test.test(web3Provider, 'coverage')
  process.exit(0)
}

runTests()
