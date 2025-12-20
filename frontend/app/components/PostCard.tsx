'use client';

import { useEngageLayer } from '../hooks/useEngageLayer';
import { useState } from 'react';

interface PostCardProps {
  postId: number;
  author: string;
  content: string;
  likeCount: number;
  isPoll?: boolean;
  pollOptions?: { text: string; voteCount: number }[];
}

export function PostCard({
  postId,
  author,
  content,
  likeCount,
  isPoll,
  pollOptions,
}: PostCardProps) {
  const { likePost, voteOnPost, connected } = useEngageLayer();
  const [liking, setLiking] = useState(false);
  const [voting, setVoting] = useState(false);
  const [localLikes, setLocalLikes] = useState(likeCount);

  const handleLike = async () => {
    if (!connected) {
      alert('Connect MetaMask first');
      return;
    }
    try {
      setLiking(true);
      await likePost(postId);
      setLocalLikes((prev) => prev + 1);
      alert('Liked! Transaction sent.');
    } catch (error) {
      console.error(error);
      alert('Like failed');
    } finally {
      setLiking(false);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!connected) {
      alert('Connect MetaMask first');
      return;
    }
    try {
      setVoting(true);
      await voteOnPost(postId, optionIndex);
      alert('Vote submitted!');
    } catch (error) {
      console.error(error);
      alert('Vote failed');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="mb-2">
        <p className="text-xs text-gray-500">
          {author.slice(0, 6)}...{author.slice(-4)}
        </p>
      </div>
      <p className="mb-4">{content}</p>

      {isPoll && pollOptions ? (
        <div className="space-y-2 mb-4">
          {pollOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={voting}
              className="w-full text-left p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {opt.text} ({opt.voteCount} votes)
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={liking}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {liking ? '...' : `👍 Like (${localLikes})`}
        </button>
      </div>
    </div>
  );
}
