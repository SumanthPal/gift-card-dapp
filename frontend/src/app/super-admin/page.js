"use client";
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  useAccount, 
  useReadContract, 
  useWriteContract,
  useWaitForTransactionReceipt 
} from 'wagmi';
import { truncateAddress } from '@/app/utils/utilities';
import { ONBOARDING_ADDRESS, VENDOR_ONBOARDING_ABI } from '@/app/utils/constants';
import Navbar from '@/components/NavBar';

export default function VendorApplications() {
  const { address } = useAccount();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Read vendor applications
  const { 
    data: vendorApplications, 
    refetch 
  } = useReadContract({
    address: ONBOARDING_ADDRESS,
    abi: VENDOR_ONBOARDING_ABI,
    functionName: 'getVendorApplications',
  });
  console.log(vendorApplications)

  // Write contract hooks for approve/reject
  const { 
    writeContract: approveVendor, 
    isPending: isApproving 
  } = useWriteContract();

  const { 
    writeContract: rejectVendor, 
    isPending: isRejecting 
  } = useWriteContract();

  // Handle application approval
  const handleApprove = (applicantAddress) => {
    approveVendor({
      address: ONBOARDING_ADDRESS,
      abi: VENDOR_ONBOARDING_ABI,
      functionName: 'approveVendor',
      args: [applicantAddress]
    });
    setIsDialogOpen(false);
    refetch();
  };

  // Handle application rejection
  const handleReject = (applicantAddress) => {
    rejectVendor({
      address: ONBOARDING_ADDRESS,
      abi: VENDOR_ONBOARDING_ABI,
      functionName: 'rejectVendor',
      args: [applicantAddress]
    });
    setIsDialogOpen(false);
    refetch();
  };

  // Open confirmation dialog
  const openConfirmationDialog = (application, action) => {
    setSelectedApplication({ 
      address: application, 
      action 
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
        <Navbar />
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorApplications && vendorApplications.length > 0 ? (
                vendorApplications.map((application) => (
                  <TableRow key={application}>
                    <TableCell>{truncateAddress(application)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => openConfirmationDialog(application, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => openConfirmationDialog(application, 'reject')}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No pending vendor applications
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedApplication?.action === 'approve' 
                ? 'Approve Vendor Application' 
                : 'Reject Vendor Application'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedApplication?.action} the application for 
              {' '}{truncateAddress(String(selectedApplication?.address))}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {selectedApplication?.action === 'approve' ? (
              <Button 
                onClick={() => handleApprove(selectedApplication.address)}
                disabled={isApproving}
              >
                {isApproving ? 'Approving...' : 'Confirm Approval'}
              </Button>
            ) : (
              <Button 
                variant="destructive"
                onClick={() => handleReject(selectedApplication.address)}
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}