'use client';

import { useEngageLayer } from '../hooks/useEngageLayer';
import { useState } from 'react';

export function CreatePostForm() {
  const { connected, createPost, createPoll } = useEngageLayer();
  const [content, setContent] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [isPoll, setIsPoll] = useState(false);
  const [optionInputs, setOptionInputs] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  const handleAddOption = () => {
    setOptionInputs((prev) => [...prev, '']);
  };

  const handleChangeOption = (index: number, value: string) => {
    setOptionInputs((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      alert('Connect MetaMask first');
      return;
    }
    if (!content.trim()) {
      alert('Content is required');
      return;
    }

    const cid = campaignId ? Number(campaignId) : 0;
    if (Number.isNaN(cid) || cid < 0) {
      alert('Invalid campaign id');
      return;
    }

    try {
      setSubmitting(true);
      if (isPoll) {
        const options = optionInputs.map((o) => o.trim()).filter(Boolean);
        if (options.length < 2) {
          alert('Poll needs at least 2 options');
          setSubmitting(false);
          return;
        }
        const tx = await createPoll(content.trim(), cid, options);
        console.log('createPoll tx:', tx);
        alert('Poll created!');
      } else {
        const tx = await createPost(content.trim(), cid);
        console.log('createPost tx:', tx);
        alert('Post created!');
      }
      setContent('');
      setCampaignId('');
      setOptionInputs(['', '']);
      setIsPoll(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-white border rounded shadow-sm space-y-3"
    >
      <h3 className="font-semibold text-lg">Create Post</h3>

      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder="What do you want to share?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPoll}
            onChange={(e) => setIsPoll(e.target.checked)}
          />
          Make this a poll
        </label>

        <input
          type="number"
          min={0}
          className="border rounded p-1 text-sm ml-auto"
          placeholder="Campaign ID (optional)"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        />
      </div>

      {isPoll && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Poll options:</p>
          {optionInputs.map((val, idx) => (
            <input
              key={idx}
              type="text"
              className="w-full border rounded p-1 text-sm"
              placeholder={`Option ${idx + 1}`}
              value={val}
              onChange={(e) => handleChangeOption(idx, e.target.value)}
            />
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="text-xs text-blue-600"
          >
            + Add option
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : isPoll ? 'Create Poll' : 'Create Post'}
      </button>
    </form>
  );
}
