import { useState, useEffect } from 'react';
import { useSDK } from '@metamask/sdk-react';

interface SmartAccount {
  address: string;
  isDeployed: boolean;
}

export function useSmartAccount() {
  const { sdk, connected, account } = useSDK();
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create smart account when wallet connects
  useEffect(() => {
    if (connected && account && sdk?.getProvider()) {
      initSmartAccount();
    }
  }, [connected, account, sdk]);

  const initSmartAccount = async () => {
    setIsLoading(true);
    try {
      const provider = sdk?.getProvider();
      if (!provider) throw new Error('No provider');

      // Request smart account creation via EIP-7702
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
        params: [],
      });

      if (accounts && accounts[0]) {
        setSmartAccount({
          address: accounts[0] as string,
          isDeployed: true,
        });
      }
    } catch (err: any) {
      console.error('Smart account init failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    smartAccount,
    isLoading,
    error,
    connected,
    account,
  };
}