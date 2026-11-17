import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs px-3 py-1.5 flex items-center justify-center gap-2 font-medium shadow-inner">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Mode Offline Aktif — Jadwal sholat, Al-Qur'an, dan doa tetap dapat diakses.</span>
    </div>
  );
};
