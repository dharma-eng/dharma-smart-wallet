// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface MeterMaidInterface {
    function meter(address to, bytes calldata data) external returns (
        uint256 gasUsed, bool ok, bytes memory returnData
    );
}


contract MeterMaid is MeterMaidInterface {
    function meter(address to, bytes calldata data) external override returns (
        uint256 gasUsed, bool ok, bytes memory returnData
    ) {
    	uint256 initialGas = gasleft();
    	(ok, returnData) = to.call(data);
    	gasUsed = initialGas - gasleft();
    }
}