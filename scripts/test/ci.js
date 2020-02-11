// import tests
const deployMockExternal = require("./deployMockExternal.js");
const deploy = require("./deploy");
const test = require("./test");

// run tests
async function runTests() {
    const context = process.env.TESTING_CONTEXT;

    await deployMockExternal.test(context);
    await deploy.test(context);
    await test.test(context);
    process.exit(0);
}

runTests();
