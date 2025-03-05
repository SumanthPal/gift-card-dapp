'use client';

import { useState, useEffect } from "react";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { VENDOR_ENTITY_ABI, VENDOR_CONTRACT_ADDRESS } from "@/app/utils/constants";
import { toast } from "sonner";

export function MintTokenForm({ vendorAddress }) {
  const [tokenId, setTokenId] = useState("");
  const [value, setValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [tokenType, setTokenType] = useState(0); // 0 for COUPON, 1 for VOUCHER
  const [remainingUses, setRemainingUses] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("1");
  const [redeemableItems, setRedeemableItems] = useState([]);
  const [newRedeemableItem, setNewRedeemableItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContract, isLoading, isSuccess, isError, error } = useWriteContract();

  const handleAddRedeemableItem = () => {
    if (newRedeemableItem.trim()) {
      setRedeemableItems([...redeemableItems, newRedeemableItem]);
      setNewRedeemableItem("");
    }
  };

  const isFormValid = () => {
    // Validate all required fields
    const validations = [
      { field: 'Token ID', value: tokenId, type: 'number' },
      { field: 'Name', value: name, type: 'text' },
      { field: 'Expiry Date', value: expiryDate, type: 'date' },
      { field: 'Remaining Uses', value: remainingUses, type: 'number' },
      { field: 'Amount', value: amount, type: 'number' },
    ];

    // Validate text and numeric inputs
    for (const validation of validations) {
      // Check for empty values
      if (!validation.value) {
        toast.error('Validation Error', {
          description: `${validation.field} cannot be empty`
        });
        return false;
      }

      // Additional numeric validations
      if (validation.type === 'number') {
        const numValue = Number(validation.value);
        if (isNaN(numValue) || numValue <= 0) {
          toast.error('Validation Error', {
            description: `${validation.field} must be a positive number`
          });
          return false;
        }
      }

      // Date validation for expiry
      if (validation.type === 'date') {
        const selectedDate = new Date(validation.value);
        const today = new Date();
        if (selectedDate <= today) {
          toast.error('Validation Error', {
            description: 'Expiry date must be in the future'
          });
          return false;
        }
      }
    }

    // Specific type validations
    if (tokenType === 0 && !value) {
      toast.error('Validation Error', {
        description: 'Coupon must have a discount value'
      });
      return false;
    }

    if (tokenType === 1 && redeemableItems.length === 0) {
      toast.error('Validation Error', {
        description: 'Voucher must have at least one redeemable item'
      });
      return false;
    }

    return true;
  };

  const handleMint = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    try {
      // Ensure numeric conversions
      const parsedTokenId = BigInt(tokenId);
      const parsedValue = BigInt(value || 0);
      const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
      const parsedRemainingUses = BigInt(remainingUses);
      const parsedAmount = BigInt(amount);

      // Log the arguments for debugging
      console.log('Contract Arguments:', {
        to: vendorAddress,
        tokenId: parsedTokenId,
        vendor: name,
        value: parsedValue,
        expiryDate: expiryTimestamp,
        tokenType,
        remainingUses: parsedRemainingUses,
        redeemableItems: tokenType === 1 ? redeemableItems : [],
        encryptedData: "",
        amount: parsedAmount
      });

      setIsSubmitting(true);
      
      writeContract({
        address: VENDOR_CONTRACT_ADDRESS,
        abi: VENDOR_ENTITY_ABI,
        functionName: "mintVoucherOrCoupon",
        args: [
          vendorAddress,
          parsedTokenId,
          name,
          parsedValue,
          expiryTimestamp,
          tokenType,
          parsedRemainingUses,
          tokenType === 1 ? redeemableItems : [], 
          "", 
          parsedAmount
        ],
      });
    } catch (err) {
      console.error('Minting Preparation Error:', err);
      toast.error("Minting Preparation Failed", {
        description: err?.message || "Please check your inputs and try again"
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Successfully Minted ${name} Token`, {
        description: `Minted ${amount} token(s) of type ${tokenType === 0 ? 'Coupon' : 'Voucher'}`
      });

      // Reset form
      setTokenId("");
      setValue("");
      setExpiryDate("");
      setTokenType(0);
      setRemainingUses("");
      setName("");
      setAmount("1");
      setRedeemableItems([]);
      setNewRedeemableItem("");
      setIsSubmitting(false);
    }

    if (isError) {
      console.error('Minting Error:', error);
      toast.error("Token Minting Failed", {
        description: error?.message || "Transaction could not be completed",
      });
      setIsSubmitting(false);
    }
  }, [isSuccess, isError, error, name, amount, tokenType]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint New Token</CardTitle>
        <CardDescription>Create a new coupon or voucher.</CardDescription>
      </CardHeader>
      <form onSubmit={handleMint}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Token ID</Label>
            <Input 
              type="number"
              value={tokenId} 
              onChange={(e) => setTokenId(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input 
              type="date" 
              value={expiryDate} 
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Token Type</Label>
            <select
              value={tokenType}
              onChange={(e) => {
                setTokenType(Number(e.target.value));
                // Reset specific fields when changing type
                setValue("");
                setRedeemableItems([]);
              }}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            >
              <option value={0}>Coupon</option>
              <option value={1}>Voucher</option>
            </select>
          </div>
          {tokenType === 0 && (
            <div className="space-y-2">
              <Label>Discount Value (%)</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min={0}
                max={100}
                disabled={isSubmitting}
              />
            </div>
          )}
          {tokenType === 1 && (
            <div className="space-y-2">
              <Label>Redeemable Items</Label>
              <div className="flex gap-2">
                <Input
                  value={newRedeemableItem}
                  onChange={(e) => setNewRedeemableItem(e.target.value)}
                  placeholder="Add an item"
                  disabled={isSubmitting}
                />
                <Button 
                  type="button" 
                  onClick={handleAddRedeemableItem}
                  disabled={isSubmitting}
                >
                  Add
                </Button>
              </div>
              {redeemableItems.length > 0 && (
                <ul className="list-disc pl-5">
                  {redeemableItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label>Remaining Uses</Label>
            <Input
              type="number"
              value={remainingUses}
              onChange={(e) => setRemainingUses(e.target.value)}
              min={1}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Amount To Mint</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              disabled={isSubmitting}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Minting..." : "Mint Token"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}