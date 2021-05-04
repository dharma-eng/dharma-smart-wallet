// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/**
 * @title MockCodeCheck
 * @notice This contract checks the deployed runtime code of another contract.
 */
contract MockCodeCheck {
  function code(address target) public view returns (bytes memory codeValue) {
    /* solhint-disable no-inline-assembly */
    assembly {
      // retrieve the size of the external code
      let size := extcodesize(target)

      // allocate output byte array
      codeValue := mload(0x40)

      // new "memory end" including padding
      mstore(0x40, add(codeValue, and(add(size, 0x3f), not(0x1f))))

      // store length in memory
      mstore(codeValue, size)

      // get the code using extcodecopy
      extcodecopy(target, add(codeValue, 0x20), 0, size)
    } /* solhint-enable no-inline-assembly */
  }

  function hash(address target) public view returns (bytes32 hashValue) {
  	/* solhint-disable no-inline-assembly */
    assembly {
  	  hashValue := extcodehash(target)
    } /* solhint-enable no-inline-assembly */
  }
}
