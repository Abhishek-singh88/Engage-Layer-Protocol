'use client';

import { useEngageLayer } from '../hooks/useEngageLayer';
import { useState } from 'react';

export function PermissionRequest() {
  const { connected, requestPermissions, loading } = useEngageLayer();
  const [granted, setGranted] = useState(false);

  const handleRequest = async () => {
    try {
      await requestPermissions();
      setGranted(true);
      alert('Permissions granted! You can now engage without popups.');
    } catch (error) {
      console.error(error);
      alert('Permission denied or failed.');
    }
  };

  if (!connected) {
    return null;
  }

  if (granted) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-800">✅ Session active - engage freely!</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-300 rounded">
      <h3 className="font-bold text-lg mb-2">Enable Engage Co-Pilot</h3>
      <p className="text-sm mb-4">
        Grant permission to like and vote without popups. Daily limit: 0.01 ETH
      </p>
      <button
        onClick={handleRequest}
        disabled={loading}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Requesting...' : 'Grant Permissions'}
      </button>
    </div>
  );
}
