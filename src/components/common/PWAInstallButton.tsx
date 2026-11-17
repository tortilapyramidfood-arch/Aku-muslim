import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { AndroidDownloadGuide } from './AndroidDownloadGuide';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Terpasang</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const prompted = await install();
    if (prompted) return;
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowAndroidGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Pasang aplikasi ke Layar Utama"
        className={`flex items-center gap-1.5 rounded-lg font-medium transition-all ${
          compact
            ? 'px-2.5 py-1 text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
            : 'px-3 py-1.5 text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-900/10'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">Pasang PWA</span>
      </button>

      {showAndroidGuide && (
        <AndroidDownloadGuide
          variant="modal"
          onClose={() => setShowAndroidGuide(false)}
        />
      )}

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Pasang AKU MUSLIM di iPhone / iPad
            </h3>
            <div className="mt-3 space-y-2 text-xs text-stone-600 dark:text-stone-300">
              <p>1. Ketuk tombol <strong>Bagikan (Share)</strong> di bar bawah Safari.</p>
              <p>2. Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</p>
              <p>3. Ketuk <strong>Tambah</strong> di pojok kanan atas.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full min-h-[44px] rounded-xl bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
