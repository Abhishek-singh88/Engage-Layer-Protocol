'use client';

import { useState } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { encodeFunctionData, parseEther } from 'viem';
import { CONTRACT_ADDRESS } from '../lib/contract';

export default function CreateCampaign() {
  const { sdk, connected, account } = useSDK();
  
  const [budget, setBudget] = useState('');
  const [rewardPerAction, setRewardPerAction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [campaignId, setCampaignId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !account) {
      alert('Please connect your wallet');
      return;
    }

    if (!budget || !rewardPerAction) {
      alert('Please fill all fields');
      return;
    }

    const budgetWei = parseEther(budget);
    const rewardWei = parseEther(rewardPerAction);

    if (budgetWei < rewardWei) {
      alert('Budget must be at least equal to reward per action');
      return;
    }

    setIsLoading(true);
    try {
      const provider = sdk?.getProvider();
      if (!provider) throw new Error('Provider not found');

      // createCampaign(uint256 rewardPerAction) payable
      const data = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'createCampaign',
          inputs: [{ type: 'uint256', name: 'rewardPerAction' }],
          stateMutability: 'payable',
        }],
        functionName: 'createCampaign',
        args: [rewardWei],
      });

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: CONTRACT_ADDRESS,
          data,
          value: '0x' + budgetWei.toString(16), // Convert to hex
        }],
      });

      console.log('Campaign created:', txHash);
      
      setShowSuccess(true);
      setBudget('');
      setRewardPerAction('');
      
      // Mock campaign ID (in real app, parse from transaction receipt)
      setCampaignId(Math.floor(Math.random() * 1000) + 1);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Create campaign failed:', error);
      alert('Failed to create campaign: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Create Campaign</h3>
      
      {showSuccess && campaignId && (
        <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-2xl">✓</span>
            <span className="text-green-800 font-semibold">Campaign Created!</span>
          </div>
          <p className="text-sm text-green-700">
            Campaign ID: <span className="font-bold">#{campaignId}</span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Use this ID when creating sponsored posts
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Budget (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0.1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Total ETH to allocate for rewards
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reward Per Action (ETH)
          </label>
          <input
            type="number"
            step="0.0001"
            value={rewardPerAction}
            onChange={(e) => setRewardPerAction(e.target.value)}
            placeholder="0.001"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            ETH users earn per like/vote
          </p>
        </div>

        {budget && rewardPerAction && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900 font-semibold mb-2">
              Campaign Summary:
            </p>
            <div className="text-sm text-purple-800 space-y-1">
              <p>• Total Budget: {budget} ETH</p>
              <p>• Reward per action: {rewardPerAction} ETH</p>
              <p>
                • Estimated actions: ~
                {Math.floor(parseFloat(budget) / parseFloat(rewardPerAction))}
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Creating Campaign...' : '💰 Create Campaign'}
        </button>
      </form>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900 font-semibold mb-2">
          💡 What is a Campaign?
        </p>
        <p className="text-xs text-blue-800">
          Campaigns sponsor posts and reward users for engagement. Users earn ETH 
          for liking and voting on sponsored content.
        </p>
      </div>
    </div>
  );
}