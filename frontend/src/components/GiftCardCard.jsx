'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, isExpired } from '@/app/utils/utilities';
import { SendGiftCardModal } from './SendGiftCardModal';
import { Gift, Send } from 'lucide-react';

export function GiftCardCard({ giftCard }) {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const expired = isExpired(giftCard.expiryDate);

  return (
    <>
      <Card className={`w-full ${expired ? 'opacity-70' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {giftCard.vendor}
          </CardTitle>
          <CardDescription>
            {expired ? (
              <span className="text-red-500">Expired on {formatDate(giftCard.expiryDate)}</span>
            ) : (
              <span>Expires on {formatDate(giftCard.expiryDate)}</span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm">Token ID: {giftCard.tokenId}</p>
          {showDetails && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-semibold">Encrypted Data:</p>
              <p className="text-xs break-all">{giftCard.encryptedData}</p>
              <p className="text-xs mt-2 text-gray-500">This data is encrypted and can only be decrypted with the appropriate credentials.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <Button 
            size="sm" 
            disabled={expired}
            onClick={() => setShowSendModal(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </CardFooter>
      </Card>
      
      {showSendModal && (
        <SendGiftCardModal
          giftCard={giftCard}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </>
  );
}