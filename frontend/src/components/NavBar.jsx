'use client';

import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";
import { useAccount, useReadContract } from "wagmi";
import { ONBOARDING_ADDRESS, VENDOR_ONBOARDING_ABI } from "@/app/utils/constants";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
const Navbar = () => {
  const { address, isConnected } = useAccount();
  const [isVendor, setIsVendor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is a vendor
  const { data: vendorStatus } = useReadContract({
    address: ONBOARDING_ADDRESS,
    abi: VENDOR_ONBOARDING_ABI,
    functionName: "isVendor",
    args: address ? [address] : undefined,
  });

  // Check if user is an admin (using default admin role)
  const { data: adminStatus } = useReadContract({
    address: ONBOARDING_ADDRESS,
    abi: VENDOR_ONBOARDING_ABI,
    functionName: "hasRole",
    args: address ? [
      "0x0000000000000000000000000000000000000000000000000000000000000000", 
      address
    ] : undefined,
  });

  useEffect(() => {
    if (vendorStatus !== undefined) {
      setIsVendor(vendorStatus);
    }
    if (adminStatus !== undefined) {
      setIsAdmin(adminStatus);
    }
  }, [vendorStatus, adminStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center  dark:text-white">
      {/* Logo/Home Link */}
      <Link href="/">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer">CardSphere</h1>
      </Link>

      {/* Navigation Links */}
      <nav className="space-x-6">
        <Link href="/marketplace" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          Marketplace
        </Link>
       
        <Link href="/about" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          About
        </Link>

        {/* Conditional Rendering Based on Roles */}
        {!isVendor && (
          <Link href="/vendor-boarding" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Become a Vendor
          </Link>
        )}

        {isVendor && (
          <Link href="/vendor-dashboard" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Vendor Dashboard
          </Link>
        )}

        {isAdmin && (
          <Link href="/super-admin" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Super Admin
          </Link>
        )}
      </nav>

      {/* Connect Wallet Button */}
      <ConnectWallet />
     <ThemeToggle />
    </div>
  );
};

export default Navbar;
