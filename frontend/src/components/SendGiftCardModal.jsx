'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSendGiftCard } from '@/app/hooks/useGiftCardContract';
import { toast } from 'sonner';

export function SendGiftCardModal({ giftCard, onClose }) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(false);
  
  const { 
    sendGiftCard, 
    isPending, 
    isSuccess, 
    error 
  } = useSendGiftCard();

  const handleAddressChange = (e) => {
    const address = e.target.value;
    setRecipientAddress(address);
    setIsAddressValid(/^0x[a-fA-F0-9]{40}$/.test(address));
  };

  const handleSend = () => {
    if (!isAddressValid) return;

    sendGiftCard(recipientAddress, giftCard.tokenId)
    ;
  };

  // Watch for success and error states
  useEffect(() => {
    if (isSuccess) {
      toast.success(`Successfully sent ${giftCard.vendor} gift card to ${recipientAddress}`);
      onClose();
    }
    
    if (error) {
      const errorMessage = error.message || "Transaction failed";
      toast.error(errorMessage);
    }
  }, [isSuccess, error, giftCard?.vendor, recipientAddress, onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Gift Card</DialogTitle>
          <DialogDescription>
            Send your {giftCard.vendor} gift card to another wallet address.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipientAddress}
              onChange={handleAddressChange}
              placeholder="0x..."
            />
            {recipientAddress && !isAddressValid && (
              <p className="text-xs text-red-500">Please enter a valid Ethereum address</p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium">Gift Card Details:</p>
            <p className="text-sm">Vendor: {giftCard.vendor}</p>
            <p className="text-sm">Token ID: {giftCard.tokenId}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSend} 
            disabled={!isAddressValid || isPending}
          >
            {isPending ? "Sending..." : "Send Gift Card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}