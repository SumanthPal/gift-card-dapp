'use client';

import { useGiftCards } from '@/app/hooks/useGiftCards';
import { GiftCardCard } from './GiftCardCard';
import { useAccount } from 'wagmi';
import { Skeleton } from '@/components/ui/skeleton';

export function GiftCardGrid() {
  const { isConnected } = useAccount();
  const { giftCards, isLoading } = useGiftCards();

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">Connect your wallet to see your gift cards</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (giftCards.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">You don't have any gift cards yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {giftCards.map((giftCard) => (
        <GiftCardCard key={giftCard.tokenId} giftCard={giftCard} />
      ))}
    </div>
  );
}
