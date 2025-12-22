'use client';

import { ConnectButton } from './components/ConnectButton';
import { PermissionRequest } from './components/PermissionRequest';
import { PostCard } from './components/PostCard';
import { CreatePostForm } from './components/CreatePostForm';
import { usePosts } from './hooks/usePosts';

export default function Home() {
  const { posts, loading } = usePosts();

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

        <CreatePostForm />

        {loading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet. Create the first one!</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                author={post.author}
                content={post.content}
                likeCount={Number(post.likeCount)}
                isPoll={post.isPoll}
                pollOptions={
                  post.isPoll
                    ? post.pollOptions.map((o) => ({
                        text: o.text,
                        voteCount: Number(o.voteCount),
                      }))
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
