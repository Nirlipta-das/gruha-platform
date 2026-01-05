'use client';

import { useEffect, useState, useCallback } from 'react';

interface OfflineTransaction {
  id: string;
  url: string;
  method: string;
  timestamp: number;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<OfflineTransaction[]>([]);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Trigger background sync when back online
      if ('serviceWorker' in navigator && 'sync' in (window as any).SyncManager) {
        navigator.serviceWorker.ready.then((registration) => {
          (registration as any).sync.register('gruha-sync');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[GRUHA] Service worker registered:', registration.scope);
          setIsServiceWorkerReady(true);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, notify user
                  console.log('[GRUHA] New version available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[GRUHA] Service worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'OFFLINE_SYNC_COMPLETE') {
          console.log('[GRUHA] Offline sync complete:', event.data.requestId);
          // Refresh pending transactions
          getPendingTransactions();
        }
      });
    }
  }, []);

  // Get pending offline transactions
  const getPendingTransactions = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise<OfflineTransaction[]>((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          const queue = event.data || [];
          setPendingTransactions(queue);
          resolve(queue);
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_OFFLINE_QUEUE' },
          [messageChannel.port2]
        );
      });
    }
    return [];
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          ),
        });
        return subscription;
      } catch (error) {
        console.error('[GRUHA] Push subscription failed:', error);
        return null;
      }
    }
    return null;
  }, []);

  return {
    isOnline,
    isServiceWorkerReady,
    pendingTransactions,
    getPendingTransactions,
    requestNotificationPermission,
    subscribeToPush,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Offline-first fetch wrapper
export async function offlineFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // If offline and it's a mutation, the service worker will queue it
    if (!navigator.onLine && options.method && options.method !== 'GET') {
      console.log('[GRUHA] Request queued for offline sync');
    }
    throw error;
  }
}

// Generate offline transaction QR code data
export function generateOfflineTransaction(
  msmeId: string,
  vendorId: string,
  amount: number,
  category: string
): string {
  const transaction = {
    type: 'GRUHA_OFFLINE_TXN',
    version: 1,
    data: {
      msmeId,
      vendorId,
      amount,
      category,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substr(2, 16),
    },
    // In production, this would be signed with the user's private key
    signature: 'mock_signature_' + Date.now(),
  };

  return btoa(JSON.stringify(transaction));
}

// Parse offline transaction from QR code
export function parseOfflineTransaction(qrData: string): {
  msmeId: string;
  vendorId: string;
  amount: number;
  category: string;
  timestamp: number;
  isValid: boolean;
} | null {
  try {
    const decoded = JSON.parse(atob(qrData));
    
    if (decoded.type !== 'GRUHA_OFFLINE_TXN') {
      return null;
    }

    // In production, verify the signature here
    const isValid = decoded.signature?.startsWith('mock_signature_') || false;

    return {
      ...decoded.data,
      isValid,
    };
  } catch (error) {
    console.error('[GRUHA] Failed to parse offline transaction:', error);
    return null;
  }
}
