pragma solidity 0.8.4;


/**
 * @title BadBeaconTwo
 */
contract BadBeaconTwo {
  fallback () external {
    if (msg.data.length > 0) {
      revert("This is not an upgradeable upgrade beacon.");
    }

    address implementation = address(0);
    assembly {
      mstore(0, implementation)
      return(0, 32)
    }
  }
}
