'use client';

import { createConfig, WagmiProvider, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MetaMaskProvider } from '@metamask/sdk-react';

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: 'Engage Layer Protocol',
          url: typeof window !== 'undefined' ? window.location.href : '',
        },
        infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_KEY, // optional
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </MetaMaskProvider>
  );
}
