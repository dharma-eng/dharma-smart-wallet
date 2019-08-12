var Web3 = require('web3')
web3Provider = new Web3('ws://localhost:8555')

// import tests
var test = require('./test.js')

// run tests
async function runTests() {
  await test.test(web3Provider, 'coverage')
  process.exit(0)
}

runTests()
