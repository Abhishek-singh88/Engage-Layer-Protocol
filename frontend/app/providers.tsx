'use client';

import { MetaMaskProvider } from '@metamask/sdk-react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "EngageLayer",
          url: typeof window !== 'undefined' ? window.location.href : '',
        },
        infuraAPIKey: process.env.NEXT_PUBLIC_RPC_URL,
      }}
    >
      {children}
    </MetaMaskProvider>
  );
}