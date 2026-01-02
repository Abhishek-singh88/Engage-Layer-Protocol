'use client';

import { useState } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { encodeFunctionData } from 'viem';
import { CONTRACT_ADDRESS } from '../lib/contract';

export default function CreatePost() {
  const { sdk, connected, account } = useSDK();
  
  const [content, setContent] = useState('');
  const [campaignId, setCampaignId] = useState('0');
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !account) {
      alert('Please connect your wallet');
      return;
    }

    if (!content.trim()) {
      alert('Please enter content');
      return;
    }

    if (isPoll && pollOptions.some(opt => !opt.trim())) {
      alert('Please fill all poll options');
      return;
    }

    setIsLoading(true);
    try {
      const provider = sdk?.getProvider();
      if (!provider) throw new Error('Provider not found');

      let data: string;

      if (isPoll) {
        // createPoll(string contentUri, uint256 campaignId, string[] options)
        data = encodeFunctionData({
          abi: [{
            type: 'function',
            name: 'createPoll',
            inputs: [
              { type: 'string', name: 'contentUri' },
              { type: 'uint256', name: 'campaignId' },
              { type: 'string[]', name: 'options' },
            ],
          }],
          functionName: 'createPoll',
          args: [content, BigInt(campaignId), pollOptions],
        });
      } else {
        // createPost(string contentUri, uint256 campaignId)
        data = encodeFunctionData({
          abi: [{
            type: 'function',
            name: 'createPost',
            inputs: [
              { type: 'string', name: 'contentUri' },
              { type: 'uint256', name: 'campaignId' },
            ],
          }],
          functionName: 'createPost',
          args: [content, BigInt(campaignId)],
        });
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: CONTRACT_ADDRESS,
          data,
          value: '0x0',
        }],
      });

      console.log('Post created:', txHash);
      
      setShowSuccess(true);
      setContent('');
      setPollOptions(['', '']);
      setIsPoll(false);
      setCampaignId('0');
      
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Create post failed:', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-8 text-center">
        <p className="text-gray-600">Connect your wallet to create posts</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Post</h3>
      
      {showSuccess && (
        <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-2">
          <span className="text-green-600 text-2xl">✓</span>
          <span className="text-green-800 font-semibold">Post created successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPoll}
              onChange={(e) => setIsPoll(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-sm font-semibold text-gray-700">
              Create as Poll
            </span>
          </label>
        </div>

        {isPoll && (
          <div className="space-y-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm font-semibold text-blue-900">Poll Options</p>
            {pollOptions.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              + Add Option
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Campaign ID (Optional)
          </label>
          <input
            type="number"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="0 for no campaign"
            min="0"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter 0 for regular post, or campaign ID to earn rewards
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Creating...' : isPoll ? '📊 Create Poll' : '📝 Create Post'}
        </button>
      </form>
    </div>
  );
}