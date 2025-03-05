'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { truncateAddress } from '@/app/utils/utilities';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import blockies from 'ethereum-blockies'; // Import Blockies

export function ConnectWallet() {
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect({
    onError: (error) => {
      console.error('Connection error:', error);
      toast.error('Connection Failed', {
        description: error.message || 'Failed to connect wallet. Please try again.',
      });
    },
    onSuccess: (data) => {
      toast.success('Connected', {
        description: `Wallet connected successfully with ${data.connector.name}!`,
      });
    },
  });
  const { disconnect } = useDisconnect();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      console.log('Connection status:', { 
        isConnected, 
        address,
        activeConnector: activeConnector?.name 
      });
      
      // Log available ethereum providers in window object
      console.log('Available ethereum providers:', {
        ethereum: window.ethereum,
        coinbaseWallet: window.coinbaseWallet,
        coreWallet: window.coreWallet,
        _coreWallet: window._coreWallet, // Sometimes Core uses this naming
      });
      
      // Log detailed info about each connector
      connectors.forEach(connector => {
        console.log(`Connector ${connector.name} (${connector.id}):`, {
          ready: connector.ready,
          id: connector.id
        });
      });
    }
  }, [connectors, isConnected, address, activeConnector, isMounted]);

  // Render nothing on the server
  if (!isMounted) {
    return null;
  }

  // Generate the profile picture (identicon)
  const profilePic = address ? blockies.create({ seed: address }).toDataURL() : null;

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {profilePic && <img src={profilePic} alt="Profile" className="w-6 h-6 rounded-full" />}
            {activeConnector?.name ? `${activeConnector.name}: ` : ''}
            {truncateAddress(address)}
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Connected with {activeConnector?.name || 'Wallet'}</DropdownMenuLabel>
          <DropdownMenuLabel className="font-mono text-xs break-all">{address}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => {
              disconnect();
              toast.info('Disconnected', {
                description: 'Your wallet has been disconnected.'
              });
            }}
            className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Make sure to handle cases where connectors array might be empty
  const availableConnectors = Array.isArray(connectors) ? connectors : [];
  
  // Always show the Connect Wallet button/dropdown, even if no connectors are ready yet
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableConnectors.length === 0 ? (
          <DropdownMenuItem disabled>
            No wallet providers detected
          </DropdownMenuItem>
        ) : (
          availableConnectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={isLoading && pendingConnector?.id === connector.id}
              className="cursor-pointer"
            >
              {connector.name}
              {isLoading && pendingConnector?.id === connector.id && ' (connecting...)'}
            </DropdownMenuItem>
          ))
        )}
        {error && (
          <DropdownMenuItem disabled className="text-red-500 opacity-100">
            Error: {error.message}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
