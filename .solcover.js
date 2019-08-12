module.exports = {
  norpc: true,
  testCommand: 'node --max-old-space-size=4096 ./scripts/test/testCoverage.js',
  compileCommand: '../node_modules/.bin/truffle compile',
  copyPackages: ['web3'],
  skipFiles: [
    'openzeppelin-upgradeability/cryptography/ECDSA.sol',
    'openzeppelin-upgradeability/ownership/Ownable.sol',
    'openzeppelin-upgradeability/upgradeability/AdminUpgradeabilityProxy.sol',
    'openzeppelin-upgradeability/upgradeability/BaseAdminUpgradeabilityProxy.sol',
    'openzeppelin-upgradeability/upgradeability/BaseUpgradeabilityProxy.sol',
    'openzeppelin-upgradeability/upgradeability/Proxy.sol',
    'openzeppelin-upgradeability/upgradeability/ProxyAdmin.sol',
    'openzeppelin-upgradeability/upgradeability/UpgradeabilityProxy.sol',
    'openzeppelin-upgradeability/utils/Address.sol',
    'mock/MockCodeCheck.sol',
    'test/UpgradeBeaconImplementationCheck.sol'
  ]
}