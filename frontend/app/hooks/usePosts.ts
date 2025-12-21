'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../lib/config';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export interface PollOption {
  text: string;
  voteCount: bigint;
}

export interface Post {
  id: number;
  author: `0x${string}`;
  content: string;
  campaignId: bigint;
  likeCount: bigint;
  totalVotes: bigint;
  createdAt: bigint;
  isPoll: boolean;
  pollOptions: PollOption[];
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const nextPostId = (await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'nextPostId',
        })) as bigint;

        const maxId = Number(nextPostId) - 1;
        if (maxId <= 0) {
          setPosts([]);
          return;
        }

        const newPosts: Post[] = [];
        for (let id = maxId; id >= 1; id--) {
          const [author, contentUri, campaignId, likeCount, totalVotes, createdAt] =
            (await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'posts',
              args: [BigInt(id)],
            })) as [string, string, bigint, bigint, bigint, bigint];

          if (author === '0x0000000000000000000000000000000000000000') continue;

          let pollOptions: PollOption[] = [];
          let isPoll = false;

          try {
            pollOptions = (await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getPollOptions',
              args: [BigInt(id)],
            })) as any as PollOption[];

            if (pollOptions.length > 0) {
              isPoll = true;
            }
          } catch {
            // not a poll, ignore error
          }

          newPosts.push({
            id,
            author: author as `0x${string}`,
            content: contentUri,
            campaignId,
            likeCount,
            totalVotes,
            createdAt,
            isPoll,
            pollOptions: pollOptions || [],
          });
        }

        setPosts(newPosts);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { posts, loading };
}
