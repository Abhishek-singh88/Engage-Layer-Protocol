import { useState, useEffect } from 'react';

interface Permission {
  granted: boolean;
  expiry: number;
  dailyLimit: string;
  actionsAllowed: string[];
  pendingActions: any[];
}

export function useSimplePermissions() {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  // Grant permission (user intent)
  const grantPermission = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate permission dialog
      const confirmed = window.confirm(
        `🔐 Grant Advanced Permission?\n\n` +
        `This allows:\n` +
        `• Like posts without confirmation\n` +
        `• Vote on polls seamlessly\n` +
        `• Daily limit: 0.02 ETH\n` +
        `• Valid for: 24 hours\n\n` +
        `Transactions will be batched to save gas.`
      );

      if (!confirmed) {
        throw new Error('User rejected permission');
      }

      // Store permission
      const perm: Permission = {
        granted: true,
        expiry: Date.now() + 86400000, // 24 hours
        dailyLimit: '0.02 ETH',
        actionsAllowed: ['like', 'vote'],
        pendingActions: [],
      };

      localStorage.setItem('app_permission', JSON.stringify(perm));
      setPermission(perm);

      console.log('✅ Permission granted (demo mode)');
      
      return perm;
    } catch (err: any) {
      console.error('Permission failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check permission
  const checkPermission = () => {
    const stored = localStorage.getItem('app_permission');
    if (stored) {
      const perm = JSON.parse(stored);
      if (Date.now() < perm.expiry) {
        setPermission(perm);
        return true;
      } else {
        localStorage.removeItem('app_permission');
      }
    }
    return false;
  };

  // Revoke permission
  const revokePermission = () => {
    localStorage.removeItem('app_permission');
    localStorage.removeItem('pending_actions');
    setPermission(null);
  };

  // Add action to pending queue (for batching)
  const queueAction = (action: any) => {
    const stored = localStorage.getItem('pending_actions');
    const pending = stored ? JSON.parse(stored) : [];
    pending.push({
      ...action,
      timestamp: Date.now(),
    });
    localStorage.setItem('pending_actions', JSON.stringify(pending));
    
    if (permission) {
      setPermission({
        ...permission,
        pendingActions: pending,
      });
    }
  };

  // Clear pending actions
  const clearPendingActions = () => {
    localStorage.setItem('pending_actions', JSON.stringify([]));
    if (permission) {
      setPermission({
        ...permission,
        pendingActions: [],
      });
    }
  };

  // Get pending actions
  const getPendingActions = () => {
    const stored = localStorage.getItem('pending_actions');
    return stored ? JSON.parse(stored) : [];
  };

  return {
    permission,
    grantPermission,
    revokePermission,
    checkPermission,
    queueAction,
    clearPendingActions,
    getPendingActions,
    isLoading,
    error,
    hasPermission: !!permission?.granted,
  };
}