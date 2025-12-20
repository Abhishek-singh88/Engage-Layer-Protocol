'use client';

import { useSDK } from '@metamask/sdk-react';

export function ConnectButton() {
  const { sdk, connected, connecting, account } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn('Failed to connect', err);
    }
  };

  const disconnect = () => {
    sdk?.terminate();
  };

  if (connecting) {
    return <button disabled>Connecting...</button>;
  }

  if (connected && account) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Connect MetaMask
    </button>
  );
}
