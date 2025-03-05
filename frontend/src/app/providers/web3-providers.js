'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Define Hardhat chain
const hardhat = {
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Hardhat Explorer', url: 'http://localhost:8545' },
  },
};

// Create chains array for easier reference
const chains = [mainnet, sepolia, hardhat];

// Define the WalletConnect project ID if available
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Wagmi configuration with additional injected connector for Core Wallet
export const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
  connectors: [
    // Generic injected connector - will find Core wallet and others
    injected({ 
      chains,
      options: {
        name: 'Browser Wallet',
        shimDisconnect: true,
      }
    }),
    
    // Specific MetaMask connector
    metaMask({ 
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      }
    }),
    
    // Coinbase Wallet connector
    coinbaseWallet({
      chains,
      options: {
        appName: 'Gift Card DApp',
        headlessMode: false,
      },
    }),
    
    // Only add WalletConnect if we have a project ID
    ...(walletConnectProjectId ? [
      walletConnect({
        chains,
        options: {
          projectId: walletConnectProjectId,
          showQrModal: true,
          metadata: {
            name: 'Gift Card DApp',
            description: 'A DApp for gift cards',
            url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
            icons: ['https://avatars.githubusercontent.com/u/37784886'],
          },
        },
      })
    ] : []),
  ],
});

// Web3Provider component
export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}