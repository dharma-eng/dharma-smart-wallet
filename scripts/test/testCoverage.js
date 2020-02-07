// import tests
var deployMockExternal = require('./deployMockExternal.js')
var deploy = require('./deploy.js')
var test = require('./test.js')

// run tests
async function runTests() {
  await deployMockExternal.test('coverage')
  await deploy.test('coverage')
  await test.test('coverage')
  process.exit(0)
}

runTests()
