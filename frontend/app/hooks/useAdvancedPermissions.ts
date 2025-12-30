import { useState } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { CONTRACT_ADDRESS } from '../lib/contract';

interface Permission {
  context: any;
  expiry: number;
  grantedAt: number;
}

export function useAdvancedPermissions() {
  const { sdk } = useSDK();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grant ERC-7715 Permission
  const grantPermission = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = sdk?.getProvider();
      if (!provider) throw new Error('MetaMask not connected');

      // Get current account
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAddress = accounts[0];

      // Request ERC-7715 Permission
      const permissionResponse = await provider.request({
        method: 'wallet_grantPermissions',
        params: [
          {
            signer: {
              type: 'account',
              data: {
                id: userAddress,
              },
            },
            permissions: [
              {
                type: 'contract-call',
                data: {
                  address: CONTRACT_ADDRESS,
                  abi: [
                    {
                      type: 'function',
                      name: 'likePost',
                      inputs: [{ type: 'uint256', name: 'postId' }],
                    },
                    {
                      type: 'function',
                      name: 'voteOnPost',
                      inputs: [
                        { type: 'uint256', name: 'postId' },
                        { type: 'uint8', name: 'optionIndex' },
                      ],
                    },
                  ],
                  functions: [
                    {
                      functionName: 'likePost',
                    },
                    {
                      functionName: 'voteOnPost',
                    },
                  ],
                },
                required: true,
              },
              {
                type: 'native-token-transfer',
                data: {
                  ticker: 'ETH',
                },
                required: false,
              },
            ],
            expiry: Math.floor(Date.now() / 1000) + 86400, // 24 hours
            policies: [
              {
                type: 'spending-limit',
                data: {
                  limit: '0x470DE4DF820000', // 0.02 ETH in hex
                  period: 86400, // 24 hours in seconds
                },
              },
            ],
          },
        ],
      });

      console.log('Permission granted:', permissionResponse);

      const perm = {
        context: permissionResponse,
        expiry: Date.now() + 86400000,
        grantedAt: Date.now(),
      };

      setPermission(perm);
      localStorage.setItem('erc7715_permission', JSON.stringify(perm));

      return perm;
    } catch (err: any) {
      console.error('Permission grant failed:', err);
      setError(err.message || 'Failed to grant permission');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke permission
  const revokePermission = async () => {
    try {
      const provider = sdk?.getProvider();
      if (!provider || !permission) return;

      // Revoke via MetaMask
      await provider.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            [CONTRACT_ADDRESS]: permission.context,
          },
        ],
      });

      setPermission(null);
      localStorage.removeItem('erc7715_permission');
    } catch (err: any) {
      console.error('Revoke failed:', err);
      setError(err.message);
    }
  };

  // Check if permission exists
  const checkPermission = () => {
    const stored = localStorage.getItem('erc7715_permission');
    if (stored) {
      const perm = JSON.parse(stored);
      if (Date.now() < perm.expiry) {
        setPermission(perm);
        return true;
      } else {
        localStorage.removeItem('erc7715_permission');
      }
    }
    return false;
  };

  return {
    permission,
    grantPermission,
    revokePermission,
    checkPermission,
    isLoading,
    error,
    hasPermission: !!permission,
  };
}