'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTokenMetadata } from '@/app/hooks/useGiftCardContract';
import { formatDate } from '@/app/utils/utilities';
import { decryptGiftCardData } from '@/app/utils/utilities';
import { useReadContract } from 'wagmi';
import { GIFT_CARD_ABI, GIFT_CARD_ADDRESS } from '@/app/utils/constants';
export function TokenMetadataViewer() {
  const [tokenId, setTokenId] = useState('');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [showDecryptForm, setShowDecryptForm] = useState(false);

  
  
  const { data: metadata, isError, isLoading } = useReadContract({
    address: GIFT_CARD_ADDRESS,
    abi: GIFT_CARD_ABI,
    functionName: 'getTokenMetadata',
    args: [tokenId || "0"],
    enabled: Boolean(tokenId),
});
  
  const [decryptedData, setDecryptedData] = useState(null);
  
  const handleDecrypt = () => {
    if (!metadata || !decryptionKey) return;
    
    const decrypted = decryptGiftCardData(metadata[2], decryptionKey);
    setDecryptedData(decrypted);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>View Gift Card Details</CardTitle>
        <CardDescription>Look up gift card information by token ID</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="tokenId">Token ID</Label>
            <Input 
              id="tokenId" 
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter token ID"
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" disabled={!tokenId}>
              Look Up
            </Button>
          </div>
        </div>
        
        {isLoading && <p className="text-sm">Loading...</p>}
        
        {isError && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md">
            <p className="text-sm">Error: Gift card not found or invalid token ID</p>
          </div>
        )}

        {metadata && !isError && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Vendor:</span>
              <span className="text-sm">{metadata[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Expiry Date:</span>
              <span className="text-sm">{formatDate(Number(metadata[1]) * 1000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Encrypted Data:</span>
              <button 
                className="text-xs text-blue-600 hover:underline"
                onClick={() => setShowDecryptForm(!showDecryptForm)}
              >
                {showDecryptForm ? "Hide Decryption" : "Decrypt Data"}
              </button>
            </div>
            
            {showDecryptForm && (
              <div className="space-y-3 p-3 border rounded-md">
                <Label htmlFor="decryptionKey">Decryption Key</Label>
                <Input
                  id="decryptionKey"
                  value={decryptionKey}
                  onChange={(e) => setDecryptionKey(e.target.value)}
                  type="password"
                  placeholder="Enter your decryption key"
                />
                <Button 
                  onClick={handleDecrypt}
                  disabled={!decryptionKey}
                  size="sm"
                  className="mt-2"
                >
                  Decrypt
                </Button>
                
                {decryptedData && (
                  <div className="mt-3 p-3 bg-green-50 rounded-md">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Decrypted Gift Card Data</h4>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="font-medium">Vendor:</span>
                      <span>{decryptedData.vendor}</span>
                      
                      <span className="font-medium">Code:</span>
                      <span>{decryptedData.code}</span>
                      
                      <span className="font-medium">Expiry Date:</span>
                      <span>{decryptedData.expiryDate}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}