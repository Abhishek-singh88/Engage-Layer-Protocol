'use client';

import { useSDK } from '@metamask/sdk-react';

export default function ConnectWallet() {
  const { sdk, connected, connecting, account } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn('Failed to connect:', err);
    }
  };

  const disconnect = () => {
    if (sdk) {
      sdk.terminate();
    }
  };

  if (connected && account) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
        <button
          onClick={disconnect}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
    >
      {connecting ? 'Connecting...' : 'Connect MetaMask'}
    </button>
  );
}