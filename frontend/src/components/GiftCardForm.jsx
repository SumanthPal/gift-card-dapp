'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { encryptGiftCardData } from '../app/utils/utilities';
import { useAccount, useWriteContract } from 'wagmi';
import { isAddress } from 'viem';
import { GIFT_CARD_ABI, GIFT_CARD_ADDRESS } from "../app/utils/constants";

export function GiftCardForm() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    tokenId: '',
    vendor: '',
    code: '',
    expiryDate: '',
    secretKey: ''
  });

  const { writeContract, isLoading, isSuccess, isError, error  } = useWriteContract();

  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const isFormValid = () => {
    return (
      address && // Ensure wallet is connected
      formData.tokenId &&
      formData.vendor &&
      formData.code &&
      formData.expiryDate &&
      formData.secretKey
    );
  };

  const handleSubmit = async (e) => {
    console.log("form has been submitted")
    e.preventDefault();

    if (!isFormValid()) {
      toast.error('Please connect your wallet and fill out all fields');
      return;
    }
    console.log(address)

    try {
      // Prepare gift card data for encryption
      const giftCardData = {
        vendor: formData.vendor,
        code: formData.code,
        expiryDate: formData.expiryDate
      };

      // Encrypt the gift card data
      const encryptedData = encryptGiftCardData(giftCardData.code, formData.secretKey);
      console.log("encrypted data: ", encryptedData)

      if (!encryptedData) {
        throw new Error('Encryption failed');
      }

      const expiryTimestamp = Math.floor(new Date(formData.expiryDate).getTime() / 1000);
      console.log("expiryTimestamp: ", expiryTimestamp)

      console.log(isAddress(address.toString()))
      console.log(formData.tokenId)
      console.log(formData.vendor)

        writeContract({
        address: GIFT_CARD_ADDRESS,
        abi: GIFT_CARD_ABI,
        functionName: 'mintGiftCard',
        args: [
          address, // Use connected wallet address as recipient
          formData.tokenId,
          formData.vendor,
          expiryTimestamp,
          encryptedData
        ],
      });
      console.log("mintGiftCard has been called")

      setIsSubmitting(true);
    } catch (err) {
      toast.error(err?.message || "There was an error preparing the transaction", {
        description: "Please try again or contact support",
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Successfully minted ${formData.vendor} gift card`, {
        description: "The gift card has been minted to your wallet",
      });

      setFormData({
        tokenId: '',
        vendor: '',
        code: '',
        expiryDate: '',
        secretKey: ''
      });

      setIsSubmitting(false);
    }

    if (isError) {
      toast.error(error?.message || "There was an error minting the gift card", {
        description: "Transaction failed",
      });
      setIsSubmitting(false);
    }
  }, [isSuccess, isError, error, formData.vendor]);

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Please connect your wallet to mint a gift card</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint Gift Card to Your Wallet</CardTitle>
        <CardDescription>Create a new encrypted gift card NFT</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient Address</Label>
            <Input 
              value={address} 
              disabled 
              className="bg-muted text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenId">Token ID</Label>
            <Input 
              id="tokenId" 
              placeholder="Unique token ID" 
              value={formData.tokenId}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input 
              id="vendor" 
              placeholder="e.g. Amazon, Target, etc." 
              value={formData.vendor}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Gift Card Code</Label>
            <Input 
              id="code" 
              placeholder="Gift card code or number" 
              value={formData.code}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input 
              id="expiryDate" 
              type="date" 
              value={formData.expiryDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Encryption Secret Key</Label>
            <Input 
              id="secretKey" 
              type="password"
              placeholder="Secret key for encrypting gift card details" 
              value={formData.secretKey}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">Keep this key safe. You'll need it to decrypt the gift card details.</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            disabled={!isFormValid() || isSubmitting || isLoading}
          >
            {isSubmitting ? "Minting..." : "Mint Gift Card"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}