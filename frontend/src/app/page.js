'use client';

import { useState, useEffect } from 'react';
import { ConnectWallet } from '@/components/ConnectWallet';
import { GiftCardGrid } from '@/components/GiftCardGrid';
import { GiftCardForm } from '@/components/GiftCardForm';
import { TokenMetadataViewer } from '@/components/TokenMetadataViewer';
import { TabsContent, TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';
import { useAccount, useReadContract } from 'wagmi';
import { GIFT_CARD_ABI, GIFT_CARD_ADDRESS } from './utils/constants';
import Link from "next/link";
import Navbar from '@/components/NavBar';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { PulseBeams } from '@/components/ui/pulse-beams';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('my-cards');
  const [mounted, setMounted] = useState(false);
  
  // Check if user has MINTER_ROLE
  const { data: hasMinterRole } = useReadContract({
    address: GIFT_CARD_ADDRESS,
    abi: GIFT_CARD_ABI,
    functionName: 'hasRole',
    args: [
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // MINTER_ROLE
      address
    ],
    enabled: !!address && mounted,
  });

  // Only render after component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!mounted ? (
          // Show a simple loading state during hydration
          <div className="text-center py-12">
            <p >Loading...</p>
          </div>
        ) : isConnected ? (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6">
              {/* Only render TabsList after component is mounted */}
              <TabsList>
                <TabsTrigger value="my-cards">My Gift Cards</TabsTrigger>
                <TabsTrigger value="look-up">Look Up Card</TabsTrigger>
                
                  <TabsTrigger value="mint">Mint Cards</TabsTrigger>
                
              </TabsList>
            </div>
            
            <TabsContent value="my-cards">
              <GiftCardGrid />
            </TabsContent>
            
            <TabsContent value="look-up">
              <div className="max-w-md mx-auto">
                <TokenMetadataViewer />
              </div>
            </TabsContent>
            
            
              <TabsContent value="mint">
                <div className="max-w-md mx-auto">
                  <GiftCardForm />
                </div>
              </TabsContent>
            
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Welcome to CardSphere</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to manage your digital gift cards</p>
            <div className="flex justify-center">
              <PulseBeams />
              
            </div>
          </div>
        )}
      </div>
    </main>
  );
}