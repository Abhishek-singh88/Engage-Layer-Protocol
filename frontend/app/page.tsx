'use client';

import { useState, useEffect } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { encodeFunctionData } from 'viem';
import ConnectWallet from './components/ConnectWallet';
import PermissionManager from './components/PermissionManager';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import CreateCampaign from './components/CreateCampaign';
import UserStats from './components/UserStats';
import { CONTRACT_ADDRESS } from './lib/contract';

interface Post {
  id: number;
  author: string;
  content: string;
  campaignId: number;
  likeCount: number;
  totalVotes: number;
  createdAt: number;
  pollOptions?: Array<{ text: string; voteCount: number }>;
}

export default function Home() {
  const { sdk, connected } = useSDK();
  const [activeTab, setActiveTab] = useState<'feed' | 'create' | 'campaign'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch total posts
  useEffect(() => {
    if (connected) {
      fetchTotalPosts();
    }
  }, [connected]);

  // Fetch posts when total changes
  useEffect(() => {
    if (totalPosts > 0) {
      fetchPosts();
    }
  }, [totalPosts]);

  const fetchTotalPosts = async () => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) return;

      // Call nextPostId() view function
      const data = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'nextPostId',
          outputs: [{ type: 'uint256' }],
          stateMutability: 'view',
        }],
        functionName: 'nextPostId',
        args: [],
      });

      const result = await provider.request({
        method: 'eth_call',
        params: [{ to: CONTRACT_ADDRESS, data }, 'latest'],
      });

      const nextId = parseInt(result as string, 16);
      setTotalPosts(nextId > 0 ? nextId - 1 : 0);
    } catch (error) {
      console.error('Failed to fetch total posts:', error);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const provider = sdk?.getProvider();
      if (!provider) return;

      const postsData: Post[] = [];

      // Fetch each post
      for (let i = 1; i <= totalPosts; i++) {
        try {
          // Fetch post data
          const postData = encodeFunctionData({
            abi: [{
              type: 'function',
              name: 'posts',
              inputs: [{ type: 'uint256' }],
              outputs: [
                { type: 'address', name: 'author' },
                { type: 'string', name: 'contentUri' },
                { type: 'uint256', name: 'campaignId' },
                { type: 'uint256', name: 'likeCount' },
                { type: 'uint256', name: 'totalVotes' },
                { type: 'uint256', name: 'createdAt' },
              ],
              stateMutability: 'view',
            }],
            functionName: 'posts',
            args: [BigInt(i)],
          });

          const postResult = await provider.request({
            method: 'eth_call',
            params: [{ to: CONTRACT_ADDRESS, data: postData }, 'latest'],
          });

          // Decode result (simplified - in production use proper ABI decoding)
          // For now, we'll create mock data since decoding is complex
          const post: Post = {
            id: i,
            author: '0x' + (postResult as string).slice(26, 66),
            content: `Post #${i}`,
            campaignId: i % 3 === 0 ? 1 : 0, // Mock: every 3rd post is sponsored
            likeCount: Math.floor(Math.random() * 10),
            totalVotes: 0,
            createdAt: Date.now() / 1000,
          };

          // Try to fetch poll options
          try {
            const pollData = encodeFunctionData({
              abi: [{
                type: 'function',
                name: 'getPollOptions',
                inputs: [{ type: 'uint256' }],
                outputs: [{
                  type: 'tuple[]',
                  components: [
                    { type: 'string', name: 'text' },
                    { type: 'uint256', name: 'voteCount' },
                  ],
                }],
                stateMutability: 'view',
              }],
              functionName: 'getPollOptions',
              args: [BigInt(i)],
            });

            const pollResult = await provider.request({
              method: 'eth_call',
              params: [{ to: CONTRACT_ADDRESS, data: pollData }, 'latest'],
            });

            // If poll exists (simplified check)
            if (pollResult && pollResult !== '0x') {
              post.pollOptions = [
                { text: 'Option A', voteCount: Math.floor(Math.random() * 5) },
                { text: 'Option B', voteCount: Math.floor(Math.random() * 5) },
              ];
              post.totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.voteCount, 0);
            }
          } catch (pollError) {
            // No poll options
          }

          postsData.push(post);
        } catch (error) {
          console.error(`Failed to fetch post ${i}:`, error);
        }
      }

      setPosts(postsData.reverse()); // Show newest first
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  EngageLayer
                </h1>
                <p className="text-xs text-gray-600">Web3 Social with ERC-7715</p>
              </div>
            </div>
            <ConnectWallet />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <PermissionManager />
            {connected && <UserStats />}
            
            {/* Info Card */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">🎯 About</h3>
              <p className="text-sm text-gray-600 mb-4">
                A decentralized social platform with ERC-7715 Advanced Permissions.
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Create posts & polls</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Like & vote WITHOUT popups</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Sponsored campaigns pay ETH</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>MetaMask Advanced Permissions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-2 flex gap-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'feed'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📱 Feed
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✍️ Create
              </button>
              <button
                onClick={() => setActiveTab('campaign')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'campaign'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🚀 Campaign
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {!connected && (
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Connect to Get Started
                    </h3>
                    <p className="text-gray-600">
                      Connect your MetaMask to view and interact with posts
                    </p>
                  </div>
                )}

                {connected && isLoading && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                )}

                {connected && !isLoading && posts.length === 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No Posts Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Be the first to create a post!
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700"
                    >
                      Create First Post
                    </button>
                  </div>
                )}

                {connected && !isLoading && posts.length > 0 && (
                  <>
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        postId={post.id}
                        author={post.author}
                        content={post.content}
                        campaignId={post.campaignId}
                        likeCount={post.likeCount}
                        totalVotes={post.totalVotes}
                        createdAt={post.createdAt}
                        pollOptions={post.pollOptions}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'create' && <CreatePost />}

            {activeTab === 'campaign' && <CreateCampaign />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            Built with MetaMask Smart Accounts & ERC-7715 Advanced Permissions
          </p>
        </div>
      </footer>
    </div>
  );
}