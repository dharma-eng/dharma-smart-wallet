// import tests
const deployMockExternal = require('./deployMockExternal.js');
const deploy = require('./deploy.js');
const test = require('./test.js');

// run tests
async function runTests() {
    const context = "development";

	await deployMockExternal.test(context);
	await deploy.test(context);
	await test.test(context);
	process.exit(0)
}

runTests();
