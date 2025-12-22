'use client';

import { useSDK } from '@metamask/sdk-react';
import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../lib/config';
import { encodeFunctionData } from 'viem';
import { parseEther } from 'viem';

export function useEngageLayer() {
  const { sdk, connected, account } = useSDK();
  const [loading, setLoading] = useState(false);

const requestPermissions = useCallback(async () => {
  if (!sdk) throw new Error('MetaMask SDK not ready');

  const provider = sdk.getProvider();
  if (!provider) throw new Error('No provider from MetaMask SDK');

  try {
    setLoading(true);

    // Standard MetaMask permission (NOT ERC-7715 yet)
    const res = await provider.request({
      method: 'wallet_requestPermissions',
      params: [
        {
          eth_accounts: {},
        },
      ],
    });

    console.log('wallet_requestPermissions response:', res);
    return res;
  } catch (err: any) {
    console.error('Permission request failed raw:', err);
    if (err && err.message) {
      console.error('Permission error message:', err.message);
    }
    throw err;
  } finally {
    setLoading(false);
  }
}, [sdk]);


  const likePost = useCallback(
    async (postId: number) => {
      if (!sdk || !account) throw new Error('Not connected');
      const provider = sdk.getProvider();
      if (!provider) throw new Error('No provider');

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'likePost',
        args: [BigInt(postId)],
      });

      const txHash = await provider.request({
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

  const voteOnPost = useCallback(
    async (postId: number, optionIndex: number) => {
      if (!sdk || !account) throw new Error('Not connected');
      const provider = sdk.getProvider();
      if (!provider) throw new Error('No provider');

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'voteOnPost',
        args: [BigInt(postId), optionIndex],
      });

      const txHash = await provider.request({
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

  const createPost = useCallback(
  async (content: string, campaignId: number) => {
    if (!sdk || !account) throw new Error('Not connected');
    const provider = sdk.getProvider();
    if (!provider) throw new Error('No provider');

    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: 'createPost',
      args: [content, BigInt(campaignId)],
    });

    const txHash = await provider.request({
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

const createPoll = useCallback(
  async (content: string, campaignId: number, options: string[]) => {
    if (!sdk || !account) throw new Error('Not connected');
    const provider = sdk.getProvider();
    if (!provider) throw new Error('No provider');

    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: 'createPoll',
      args: [content, BigInt(campaignId), options],
    });

    const txHash = await provider.request({
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
  createPost,
  createPoll,
};
}
