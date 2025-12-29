import { useState } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { CONTRACT_ADDRESS } from '../lib/contract';
import { encodeFunctionData } from 'viem';

export function useExecuteWithPermission() {
  const { sdk } = useSDK();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Execute transaction with permission (NO POPUP!)
  const executeWithPermission = async (
    functionName: string,
    args: any[]
  ): Promise<string> => {
    setIsExecuting(true);
    setError(null);

    try {
      const provider = sdk?.getProvider();
      if (!provider) throw new Error('MetaMask not connected');

      // Get permission context
      const permissionStr = localStorage.getItem('erc7715_permission');
      if (!permissionStr) {
        throw new Error('No permission granted. Please enable Co-Pilot mode first.');
      }

      const permission = JSON.parse(permissionStr);

      // Check if permission expired
      if (Date.now() > permission.expiry) {
        localStorage.removeItem('erc7715_permission');
        throw new Error('Permission expired. Please grant permission again.');
      }

      // Encode function call
      let data: string;
      if (functionName === 'likePost') {
        // likePost(uint256)
        data = encodeFunctionData({
          abi: [{
            type: 'function',
            name: 'likePost',
            inputs: [{ type: 'uint256', name: 'postId' }],
          }],
          functionName: 'likePost',
          args: [BigInt(args[0])],
        });
      } else if (functionName === 'voteOnPost') {
        // voteOnPost(uint256, uint8)
        data = encodeFunctionData({
          abi: [{
            type: 'function',
            name: 'voteOnPost',
            inputs: [
              { type: 'uint256', name: 'postId' },
              { type: 'uint8', name: 'optionIndex' },
            ],
          }],
          functionName: 'voteOnPost',
          args: [BigInt(args[0]), args[1]],
        });
      } else {
        throw new Error(`Unknown function: ${functionName}`);
      }

      console.log('Executing with permission (no popup):', {
        function: functionName,
        args,
        data,
      });

      // Send transaction WITH permission context (NO POPUP!)
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: permission.context.signer?.data?.id,
            to: CONTRACT_ADDRESS,
            data,
            value: '0x0',
            // CRITICAL: Include permission context to skip popup
            permissionContext: permission.context,
          },
        ],
      });

      console.log('Transaction sent without popup!', txHash);
      return txHash as string;

    } catch (err: any) {
      console.error('Execute with permission failed:', err);
      setError(err.message || 'Transaction failed');
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute WITHOUT permission (with popup - fallback)
  const executeWithoutPermission = async (
    functionName: string,
    args: any[]
  ): Promise<string> => {
    setIsExecuting(true);
    setError(null);

    try {
      const provider = sdk?.getProvider();
      if (!provider) throw new Error('MetaMask not connected');

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      let data: string;
      if (functionName === 'likePost') {
        data = encodeFunctionData({
          abi: [{
            type: 'function',
            name: 'likePost',
            inputs: [{ type: 'uint256', name: 'postId' }],
          }],
          functionName: 'likePost',
          args: [BigInt(args[0])],
        });
      } else if (functionName === 'voteOnPost') {
        data = encodeFunctionData({
          abi: [{
            type: 'function',
            name: 'voteOnPost',
            inputs: [
              { type: 'uint256', name: 'postId' },
              { type: 'uint8', name: 'optionIndex' },
            ],
          }],
          functionName: 'voteOnPost',
          args: [BigInt(args[0]), args[1]],
        });
      } else {
        throw new Error(`Unknown function: ${functionName}`);
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: CONTRACT_ADDRESS,
            data,
            value: '0x0',
          },
        ],
      });

      return txHash as string;

    } catch (err: any) {
      console.error('Execute without permission failed:', err);
      setError(err.message || 'Transaction failed');
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeWithPermission,
    executeWithoutPermission,
    isExecuting,
    error,
  };
}