import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineNetworkIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in slide-in-from-bottom-2 duration-200"
    >
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-xl border border-slate-800 backdrop-blur-md">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <span className="block font-bold">Khad la'aan (Offline Mode)</span>
            <span className="text-[11px] text-slate-300 block truncate">
              Qur'aanka iyo keydka la keydiyey waad akhri kartaa.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-semibold shadow-xl backdrop-blur-md">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Khadkii dib ayuu usoo noqday (Online)</span>
        </div>
      )}
    </div>
  );
};
