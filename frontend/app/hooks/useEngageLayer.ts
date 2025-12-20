'use client';

import { useSDK } from '@metamask/sdk-react';
import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../lib/config';
import { encodeFunctionData, parseEther } from 'viem';

export function useEngageLayer() {
  const { sdk, connected, account } = useSDK();
  const [loading, setLoading] = useState(false);

  // Request Advanced Permissions (ERC-7715)
  const requestPermissions = useCallback(async () => {
    if (!sdk || !account) {
      throw new Error('MetaMask not connected');
    }

    try {
      setLoading(true);
      
      // Request wallet_grantPermissions for bounded session
      const permissions = await sdk.getProvider()?.request({
        method: 'wallet_grantPermissions',
        params: [
          {
            signer: {
              type: 'account',
              data: {
                id: account,
              },
            },
            permissions: [
              {
                type: 'native-token-recurring-allowance',
                data: {
                  allowance: parseEther('0.01').toString(), // 0.01 ETH per period
                  start: Math.floor(Date.now() / 1000),
                  period: 86400, // 24 hours in seconds
                },
                required: true,
              },
              {
                type: 'contract-call',
                data: {
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functions: [
                    { name: 'likePost' },
                    { name: 'voteOnPost' },
                  ],
                },
                required: true,
              },
            ],
            expiry: Math.floor(Date.now() / 1000) + 30 * 86400, // 30 days
          },
        ],
      });

      console.log('Permissions granted:', permissions);
      return permissions;
    } catch (error) {
      console.error('Permission request failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sdk, account]);

  // Like a post
  const likePost = useCallback(
    async (postId: number) => {
      if (!sdk || !account) throw new Error('Not connected');

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'likePost',
        args: [BigInt(postId)],
      });

      const txHash = await sdk.getProvider()?.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: CONTRACT_ADDRESS,
            data,
          },
        ],
      });

      return txHash;
    },
    [sdk, account]
  );

  // Vote on post
  const voteOnPost = useCallback(
    async (postId: number, optionIndex: number) => {
      if (!sdk || !account) throw new Error('Not connected');

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'voteOnPost',
        args: [BigInt(postId), optionIndex],
      });

      const txHash = await sdk.getProvider()?.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: CONTRACT_ADDRESS,
            data,
          },
        ],
      });

      return txHash;
    },
    [sdk, account]
  );

  return {
    connected,
    account,
    loading,
    requestPermissions,
    likePost,
    voteOnPost,
  };
}
