pragma solidity 0.5.11;


interface DharmaSmartWalletImplementationV7Interface {
  function migrateSaiToDai() external;
  function migrateCSaiToDDai() external;
  function migrateCDaiToDDai() external;
  function migrateCUSDCToDUSDC() external;
}