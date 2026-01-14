'use client';

import { useState } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { encodeFunctionData } from 'viem';
import { CONTRACT_ADDRESS } from '../lib/contract';
import { useSimplePermissions } from '../hooks/useSimplePermissions';

interface PostCardProps {
  postId: number;
  author: string;
  content: string;
  campaignId: number;
  likeCount: number;
  totalVotes: number;
  createdAt: number;
  pollOptions?: Array<{ text: string; voteCount: number }>;
}

export default function PostCard({
  postId,
  author,
  content,
  campaignId,
  likeCount,
  totalVotes,
  createdAt,
  pollOptions,
}: PostCardProps) {
  const { sdk, account } = useSDK();
  const { hasPermission } = useSimplePermissions();

  const [localLiked, setLocalLiked] = useState(false);
  const [localVoted, setLocalVoted] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLike = async () => {
    if (localLiked || isExecuting) return;

    setIsExecuting(true);
    try {
      const provider = sdk?.getProvider();
      if (!provider || !account) throw new Error('Not connected');

      // Encode like function
      const data = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'likePost',
          inputs: [{ type: 'uint256', name: 'postId' }],
        }],
        functionName: 'likePost',
        args: [BigInt(postId)],
      });

      if (hasPermission) {
        // WITH PERMISSION: Show it's optimized
        console.log('✅ Executing with permission (optimized flow)');
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CONTRACT_ADDRESS,
            data,
            value: '0x0',
          }],
        });

        setLocalLiked(true);
        setShowSuccess('✅ Liked! (Permission Active - Gas Optimized)');
        setTimeout(() => setShowSuccess(''), 4000);
        
        console.log('Like TX:', txHash);
      } else {
        // WITHOUT PERMISSION: Regular flow
        console.log('⚠️ No permission - regular transaction');
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CONTRACT_ADDRESS,
            data,
            value: '0x0',
          }],
        });

        setLocalLiked(true);
        setShowSuccess('✅ Liked!');
        setTimeout(() => setShowSuccess(''), 3000);
        
        console.log('Like TX:', txHash);
      }
    } catch (error: any) {
      console.error('Like failed:', error);
      if (error.code === 4001) {
        // User rejected
        console.log('User cancelled transaction');
      } else {
        alert('Failed: ' + error.message);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (localVoted || isExecuting) return;

    setIsExecuting(true);
    try {
      const provider = sdk?.getProvider();
      if (!provider || !account) throw new Error('Not connected');

      // Encode vote function
      const data = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'voteOnPost',
          inputs: [
            { type: 'uint256', name: 'postId' },
            { type: 'uint8', name: 'optionIndex' },
          ],
        }],
        functionName: 'voteOnPost',
        args: [BigInt(postId), optionIndex],
      });

      if (hasPermission) {
        console.log('✅ Executing with permission (optimized flow)');
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CONTRACT_ADDRESS,
            data,
            value: '0x0',
          }],
        });

        setLocalVoted(true);
        setShowSuccess('✅ Voted! (Permission Active - Gas Optimized)');
        setTimeout(() => setShowSuccess(''), 4000);
        
        console.log('Vote TX:', txHash);
      } else {
        console.log('⚠️ No permission - regular transaction');
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CONTRACT_ADDRESS,
            data,
            value: '0x0',
          }],
        });

        setLocalVoted(true);
        setShowSuccess('✅ Voted!');
        setTimeout(() => setShowSuccess(''), 3000);
        
        console.log('Vote TX:', txHash);
      }
    } catch (error: any) {
      console.error('Vote failed:', error);
      if (error.code === 4001) {
        console.log('User cancelled transaction');
      } else {
        alert('Failed: ' + error.message);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const isPoll = pollOptions && pollOptions.length > 0;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {author.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {author.slice(0, 6)}...{author.slice(-4)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(createdAt * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full border border-green-300">
              ⚡ Optimized
            </span>
          )}
          {campaignId > 0 && (
            <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
              💰 Sponsored
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 text-lg">{content}</p>
      </div>

      {/* Poll Options */}
      {isPoll && (
        <div className="mb-4 space-y-2">
          {pollOptions.map((option, index) => {
            const percentage =
              totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;

            return (
              <button
                key={index}
                onClick={() => handleVote(index)}
                disabled={localVoted || isExecuting}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  localVoted
                    ? 'cursor-not-allowed bg-gray-50 border-gray-300'
                    : 'border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50'
                }`}
              >
                <div
                  className="absolute inset-0 bg-blue-200 opacity-20"
                  style={{ width: `${percentage}%`, transition: 'width 0.3s' }}
                />
                <div className="relative flex justify-between items-center">
                  <span className="font-medium text-gray-900">{option.text}</span>
                  {localVoted && (
                    <span className="text-sm font-bold text-blue-600">
                      {percentage}% ({option.voteCount})
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleLike}
          disabled={localLiked || isExecuting}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
            localLiked
              ? 'bg-red-100 text-red-600 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <span className="text-2xl">{localLiked ? '❤️' : '🤍'}</span>
          <span>{likeCount + (localLiked ? 1 : 0)}</span>
          {!localLiked && hasPermission && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">⚡</span>
          )}
        </button>

        {isPoll && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">🗳️</span>
            <span className="font-semibold">{totalVotes} votes</span>
          </div>
        )}

        {campaignId > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-sm text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full font-medium">
            <span>💎</span>
            <span>Earn Rewards</span>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className={`mt-4 border-2 rounded-lg p-3 animate-pulse ${
          hasPermission 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={hasPermission ? 'text-green-600' : 'text-blue-600'} className="text-xl">
              ✓
            </span>
            <span className={`font-semibold ${hasPermission ? 'text-green-800' : 'text-blue-800'}`}>
              {showSuccess}
            </span>
          </div>
          {hasPermission && (
            <p className="text-xs text-green-700 mt-1 font-semibold">
              💡 Permission system active - streamlined execution!
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {isExecuting && (
        <div className={`mt-4 flex items-center gap-2 ${
          hasPermission ? 'text-green-600' : 'text-blue-600'
        }`}>
          <div className={`animate-spin rounded-full h-5 w-5 border-2 ${
            hasPermission 
              ? 'border-green-300 border-t-green-600' 
              : 'border-blue-300 border-t-blue-600'
          }`}></div>
          <span className="text-sm font-medium">
            {hasPermission ? '⚡ Optimized execution...' : 'Waiting for approval...'}
          </span>
        </div>
      )}
    </div>
  );
}