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
    event VendorApplied(address indexed account);
    event VendorRejected(address indexed account);

    // Track vendor applications
    mapping(address => bool) public vendorApplications;
    mapping(address => uint256) public vendorListIndex;
    address[] public vendorList;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getVendorApplications() public view returns (address[] memory) {
        address[] memory applicants = new address[](vendorList.length);
        uint256 count = 0;

        for (uint256 i = 0; i < vendorList.length; i++) {
            address applicant = vendorList[i];
            if (vendorApplications[applicant]) {
                applicants[count] = applicant;
                count++;
            }
        }

        // Resize the array to the actual number of applicants
        assembly {
            mstore(applicants, count)
        }

        return applicants;
    }

    // ✅ Apply for Vendor Role
    function applyForVendor() public {
        require(!hasRole(VENDOR_ROLE, msg.sender), "Already a vendor");
        require(!vendorApplications[msg.sender], "Already applied");

        // Add to vendorList if not already present
        if (!vendorApplications[msg.sender]) {
            vendorListIndex[msg.sender] = vendorList.length;
            vendorList.push(msg.sender);
        }

        vendorApplications[msg.sender] = true;
        emit VendorApplied(msg.sender);
    }

    // ✅ Approve Vendor Application
    function approveVendor(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(vendorApplications[account], "No application found");

        grantRole(VENDOR_ROLE, account);
        vendorApplications[account] = false; // Remove from applicants list
        
        // Remove from vendorList
        _removeFromVendorList(account);

        emit VendorAdded(account);
    }

    // ✅ Reject Vendor Application
    function rejectVendor(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(vendorApplications[account], "No application found");

        vendorApplications[account] = false;
        
        // Remove from vendorList
        _removeFromVendorList(account);

        emit VendorRejected(account);
    }

    // Internal function to remove from vendorList
    function _removeFromVendorList(address account) internal {
        uint256 indexToRemove = vendorListIndex[account];
        uint256 lastIndex = vendorList.length - 1;
        
        // If not the last element, swap with the last element
        if (indexToRemove < lastIndex) {
            address lastAddress = vendorList[lastIndex];
            vendorList[indexToRemove] = lastAddress;
            vendorListIndex[lastAddress] = indexToRemove;
        }
        
        // Remove the last element
        vendorList.pop();
        delete vendorListIndex[account];
    }

    // ✅ Remove Vendor Role
    function removeVendor(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VENDOR_ROLE, account);
        
        // If the vendor was in the application list, remove from there too
        if (vendorApplications[account]) {
            vendorApplications[account] = false;
            _removeFromVendorList(account);
        }

        emit VendorRemoved(account);
    }

    // ✅ Check Vendor Application Status
    function hasAppliedForVendor(address account) public view returns (bool) {
        return vendorApplications[account];
    }

    // ✅ Check if Address is a Vendor
    function isVendor(address account) public view returns (bool) {
        return hasRole(VENDOR_ROLE, account);
    }

    // Getter for vendorList length
    function getVendorListLength() public view returns (uint256) {
        return vendorList.length;
    }
}