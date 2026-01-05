'use client';

import { useEffect, useState } from 'react';
import { FiWifiOff, FiWifi, FiX, FiCloud } from 'react-icons/fi';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowBanner(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowBanner(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Check for pending transactions
  useEffect(() => {
    const checkPending = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          const queue = event.data || [];
          setPendingCount(queue.length);
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_OFFLINE_QUEUE' },
          [messageChannel.port2]
        );
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!showBanner && pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* Offline/Online Banner */}
      {showBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-center gap-3 transition-all ${
            isOnline
              ? 'bg-secondary-500 text-white'
              : 'bg-warning-500 text-white'
          }`}
        >
          {isOnline ? (
            <>
              <FiWifi className="w-5 h-5" />
              <span className="font-medium">You're back online!</span>
              {pendingCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                  Syncing {pendingCount} pending transaction{pendingCount > 1 ? 's' : ''}...
                </span>
              )}
            </>
          ) : (
            <>
              <FiWifiOff className="w-5 h-5" />
              <span className="font-medium">You're offline</span>
              <span className="text-sm opacity-90">
                - Don't worry, GRUHA works offline too!
              </span>
            </>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 p-1 hover:bg-white/20 rounded"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Sync Indicator (subtle, in corner) */}
      {isOnline && pendingCount > 0 && !showBanner && (
        <div className="fixed bottom-4 right-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
          <FiCloud className="w-4 h-4" />
          <span className="text-sm font-medium">
            Syncing {pendingCount}...
          </span>
        </div>
      )}
    </>
  );
}
