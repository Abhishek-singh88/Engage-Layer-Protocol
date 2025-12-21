'use client';

import { ConnectButton } from './components/ConnectButton';
import { PermissionRequest } from './components/PermissionRequest';
import { PostCard } from './components/PostCard';

// Mock data for demo
const MOCK_POSTS = [
  {
    postId: 1,
    author: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    content: 'Welcome to Engage Layer Protocol! 🚀',
    likeCount: 12,
  },
  {
    postId: 2,
    author: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    content: 'What should we build next on Web3?',
    likeCount: 8,
    isPoll: true,
    pollOptions: [
      { text: 'DeFi Tools', voteCount: 5 },
      { text: 'NFT Marketplace', voteCount: 3 },
      { text: 'DAO Governance', voteCount: 7 },
    ],
  },
  {
    postId: 3,
    author: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    content: 'Just deployed a new feature using MetaMask Advanced Permissions!',
    likeCount: 15,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Engage Layer Protocol</h1>
          <ConnectButton />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <PermissionRequest />
        </div>

        <div className="space-y-4">
          {MOCK_POSTS.map((post) => (
            <PostCard key={post.postId} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
}
