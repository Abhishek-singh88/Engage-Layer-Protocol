'use client';

import { useEffect } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { useSimplePermissions } from '../hooks/useSimplePermissions';

export default function PermissionManager() {
  const { connected } = useSDK();
  const {
    permission,
    grantPermission,
    revokePermission,
    checkPermission,
    isLoading,
    error,
    hasPermission,
  } = useSimplePermissions();

  useEffect(() => {
    if (connected) {
      checkPermission();
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
        <p className="text-yellow-800 text-sm">
          Connect wallet to enable Co-Pilot mode
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">🤖 Social Co-Pilot</h3>
        <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
          ERC-7715
        </div>
      </div>

      {!hasPermission ? (
        <div>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3 font-semibold">
              Grant Advanced Permission:
            </p>
            <ul className="text-xs text-gray-600 space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Like posts without MetaMask popup</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Vote on polls seamlessly</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Batch transactions (save gas)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Daily limit: 0.02 ETH</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Valid for 24 hours</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-semibold mb-1">
                Permission Failed
              </p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={grantPermission}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Granting...
              </span>
            ) : (
              '⚡ Grant Advanced Permission'
            )}
          </button>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900 font-semibold mb-1">
              💡 How it works:
            </p>
            <p className="text-xs text-blue-800">
              Grant permission once, then interact freely. Your actions are batched 
              to save gas, and you maintain full control with spending limits.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 text-2xl">✓</span>
              <span className="text-green-800 font-bold">Co-Pilot Active</span>
            </div>
            <p className="text-xs text-green-700 mb-2">
              You can now interact seamlessly. Actions are batched automatically!
            </p>
            <p className="text-xs text-green-600 font-mono">
              Expires: {new Date(permission.expiry).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600 text-xs mb-1">Daily Limit</p>
              <p className="font-bold text-gray-900">0.02 ETH</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-blue-200">
              <p className="text-gray-600 text-xs mb-1">Pending</p>
              <p className="font-bold text-blue-600">
                {permission.pendingActions?.length || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-green-200">
              <p className="text-gray-600 text-xs mb-1">Batched</p>
              <p className="font-bold text-green-600">✓</p>
            </div>
          </div>

          <button
            onClick={revokePermission}
            className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 border-2 border-red-200 transition-all"
          >
            Revoke Permission
          </button>
        </div>
      )}
    </div>
  );
}