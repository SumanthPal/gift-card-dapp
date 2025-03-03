// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Onboarding is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");

    event MinterAdded(address indexed account);
    event VendorAdded(address indexed account);
    event MinterRemoved(address indexed account);
    event VendorRemoved(address indexed account);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addMinter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
        emit MinterAdded(account);
    }

    function addVendor(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VENDOR_ROLE, account);
        emit VendorAdded(account);
    }

    function removeMinter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
        emit MinterRemoved(account);
    }

    function removeVendor(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VENDOR_ROLE, account);
        emit VendorRemoved(account);
    }

    function isMinter(address account) public view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    function isVendor(address account) public view returns (bool) {
        return hasRole(VENDOR_ROLE, account);
    }
}
