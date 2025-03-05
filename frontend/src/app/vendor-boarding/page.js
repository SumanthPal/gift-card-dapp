"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ONBOARDING_ADDRESS, VENDOR_ONBOARDING_ABI } from "@/app/utils/constants";
import Navbar from "@/components/NavBar";

export default function VendorOnboarding() {
  const { address, isConnected } = useAccount();
  const [isApplied, setIsApplied] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  
  // Read contract hooks
  const { data: appliedData } = useReadContract({
    address: ONBOARDING_ADDRESS,
    abi: VENDOR_ONBOARDING_ABI,
    functionName: "hasAppliedForVendor",
    args: address ? [address] : undefined,
  });

  const { data: vendorData } = useReadContract({
    address: ONBOARDING_ADDRESS,
    abi: VENDOR_ONBOARDING_ABI,
    functionName: "isVendor",
    args: address ? [address] : undefined,
  });

  // Write contract hook
  const { 
    writeContract, 
    isPending, 
    data: hash 
  } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash 
  });

  // Update application status
  useEffect(() => {
    if (appliedData !== undefined) {
      setIsApplied(appliedData);
    }
  }, [appliedData]);

  // Update vendor status
  useEffect(() => {
    if (vendorData !== undefined) {
      setIsVendor(vendorData);
    }
  }, [vendorData]);

  // Handle successful application
  useEffect(() => {
    if (isSuccess) {
      toast.success("Application submitted!");
      setIsApplied(true);
    }
  }, [isSuccess]);

  // Apply for vendor function
  const applyForVendor = () => {
    if (!isConnected) {
      return toast.error("Please connect your wallet.");
    }

    writeContract({
      address: ONBOARDING_ADDRESS,
      abi: VENDOR_ONBOARDING_ABI,
      functionName: "applyForVendor",
    });
  };

  return (
    <div className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
      <Navbar />
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md p-6 text-center shadow-lg">
          <CardHeader>
            <CardTitle>Vendor Application</CardTitle>
          </CardHeader>
          <CardContent>
            {isVendor ? (
              <p className="text-green-600">✅ You are already a vendor!</p>
            ) : isApplied ? (
              <p className="text-blue-500">⏳ Application Pending...</p>
            ) : (
              <Button 
                onClick={applyForVendor} 
                disabled={isPending || isConfirming}
              >
                {(isPending || isConfirming) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Apply for Vendor"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}