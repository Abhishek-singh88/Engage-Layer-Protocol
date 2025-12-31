'use client';

import { useState, useEffect } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { encodeFunctionData } from 'viem';
import { CONTRACT_ADDRESS } from '../lib/contract';

export default function UserStats() {
  const { sdk, connected, account } = useSDK();
  
  const [points, setPoints] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user points
  useEffect(() => {
    if (connected && account) {
      fetchPoints();
    }
  }, [connected, account]);

  const fetchPoints = async () => {
    try {
      const provider = sdk?.getProvider();
      if (!provider || !account) return;

      // Call points(address) view function
      const data = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'points',
          inputs: [{ type: 'address', name: '' }],
          outputs: [{ type: 'uint256', name: '' }],
          stateMutability: 'view',
        }],
        functionName: 'points',
        args: [account as `0x${string}`],
      });

      const result = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESS,
          data,
        }, 'latest'],
      });

      // Decode result (hex string to number)
      const pointsValue = parseInt(result as string, 16);
      setPoints(pointsValue);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };

  const handleRedeem = async () => {
    if (!connected || !account) {
      alert('Please connect wallet');
      return;
    }

    const amount = parseInt(redeemAmount);
    if (!amount || amount <= 0) {
      alert('Please enter valid amount');
      return;
    }

    if (amount > points) {
      alert('Insufficient points');
      return;
    }

    setIsLoading(true);
    try {
      const provider = sdk?.getProvider();
      if (!provider) throw new Error('Provider not found');

      // redeemPoints(uint256 amount)
      const data = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'redeemPoints',
          inputs: [{ type: 'uint256', name: 'amount' }],
        }],
        functionName: 'redeemPoints',
        args: [BigInt(amount)],
      });

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: CONTRACT_ADDRESS,
          data,
          value: '0x0',
        }],
      });

      console.log('Points redeemed:', txHash);
      
      setShowSuccess(true);
      setRedeemAmount('');
      
      // Refresh points after redemption
      setTimeout(() => {
        fetchPoints();
        setShowSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Redeem failed:', error);
      alert('Failed to redeem points: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Your Stats</h3>
        <div className="text-3xl">📊</div>
      </div>

      {/* Points Display */}
      <div className="bg-white rounded-lg p-6 mb-4 border-2 border-purple-200">
        <p className="text-sm text-gray-600 mb-2">Total Points</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-purple-600">{points}</span>
          <span className="text-lg text-gray-500">points</span>
        </div>
      </div>

      {/* Redeem Section */}
      {points > 0 && (
        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            💎 Redeem Points
          </p>
          
          {showSuccess && (
            <div className="mb-3 bg-green-50 border border-green-200 rounded p-2 text-sm text-green-800 flex items-center gap-2">
              <span>✓</span>
              <span>Points redeemed successfully!</span>
            </div>
          )}

          <div className="flex gap-2 mb-2">
            <input
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder="Amount"
              max={points}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleRedeem}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Redeem'}
            </button>
          </div>
          
          <p className="text-xs text-gray-500">
            Available: {points} points
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900 font-semibold mb-1">
          How to earn points:
        </p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Like posts: +1 point</li>
          <li>• Vote on polls: +1 point</li>
          <li>• Sponsored posts: +1 point + ETH reward</li>
        </ul>
      </div>
    </div>
  );
}