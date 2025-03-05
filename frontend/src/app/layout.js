import './globals.css';
import { Inter } from 'next/font/google';
import { Web3Provider } from './providers/web3-providers';
import { Toaster } from "../components/ui/sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gift Card Dapp',
  description: 'A decentralized gift card application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  );
}