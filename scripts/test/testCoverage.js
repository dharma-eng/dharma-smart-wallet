// import tests
var deployMockExternal = require('./deployMockExternal.js')
var deploy = require('./deploy.js')
var test = require('./test.js')

// run tests
async function runTests() {
  const context = process.env.TESTING_CONTEXT;

  await deployMockExternal.test(context);
  await deploy.test(context);
  await test.test(context);
  
  process.exit(0)
}

runTests()
