import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Copy,
  Check,
  MoreVertical,
  PlusSquare,
  ChevronDown,
  ChevronUp,
  WifiOff,
  Maximize2,
  ShieldCheck,
  X,
  Menu,
  Globe,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

type AndroidBrowserId = 'chrome' | 'samsung' | 'edge';

interface BrowserStep {
  stepNumber: string;
  title: string;
  description: string;
  hint?: string;
}

const BROWSER_GUIDES: Record<
  AndroidBrowserId,
  {
    label: string;
    menuLabel: string;
    actionLabel: string;
    steps: BrowserStep[];
  }
> = {
  chrome: {
    label: 'Google Chrome',
    menuLabel: 'Titik tiga (⋮) di kanan atas',
    actionLabel: 'Tambahkan ke layar utama / Instal aplikasi',
    steps: [
      {
        stepNumber: '01',
        title: 'Buka di Google Chrome Android',
        description: 'Pastikan halaman AKU MUSLIM terbuka menggunakan aplikasi browser Google Chrome di HP Android Anda.',
        hint: 'Jika Anda membukanya dari link WhatsApp/Telegram, ketuk ikon ⋮ lalu pilih "Buka di Chrome".',
      },
      {
        stepNumber: '02',
        title: 'Ketuk Menu Titik Tiga (⋮)',
        description: 'Ketuk tombol menu titik tiga vertikal (⋮) di pojok kanan atas layar Google Chrome.',
      },
      {
        stepNumber: '03',
        title: 'Pilih "Tambahkan ke layar utama"',
        description: 'Gulir daftar menu lalu ketuk "Tambahkan ke layar utama" (Add to Home Screen) atau "Instal aplikasi".',
      },
      {
        stepNumber: '04',
        title: 'Konfirmasi "Instal" atau "Tambah"',
        description: 'Ketuk tombol Instal/Tambah pada jendela konfirmasi. Ikon AKU MUSLIM akan muncul di layar utama HP Anda.',
      },
    ],
  },
  samsung: {
    label: 'Samsung Internet',
    menuLabel: 'Garis tiga (≡) di kanan bawah',
    actionLabel: 'Tambahkan halaman ke → Layar depan',
    steps: [
      {
        stepNumber: '01',
        title: 'Buka di Samsung Internet',
        description: 'Kunjungi halaman AKU MUSLIM melalui browser bawaan Samsung Internet.',
      },
      {
        stepNumber: '02',
        title: 'Ketuk Menu Garis Tiga (≡)',
        description: 'Ketuk ikon tiga garis mendatar (≡) yang berada di pojok kanan bawah layar browser.',
      },
      {
        stepNumber: '03',
        title: 'Pilih "Tambahkan halaman ke"',
        description: 'Ketuk menu "Tambahkan halaman ke" (Add page to), lalu pilih opsi "Layar depan" (Home screen).',
      },
      {
        stepNumber: '04',
        title: 'Ketuk "Tambah"',
        description: 'Pastikan nama aplikasi bertuliskan AKU MUSLIM, lalu ketuk Tambah untuk menyematkannya ke beranda HP.',
      },
    ],
  },
  edge: {
    label: 'Edge & Lainnya',
    menuLabel: 'Menu (⋯) di bilah bawah/atas',
    actionLabel: 'Tambahkan ke ponsel / Instal',
    steps: [
      {
        stepNumber: '01',
        title: 'Buka di Browser Android',
        description: 'Buka AKU MUSLIM di Microsoft Edge, Brave, atau browser berbasis Chromium lainnya di Android.',
      },
      {
        stepNumber: '02',
        title: 'Buka Menu Pengaturan Browser',
        description: 'Ketuk ikon menu tiga titik (⋯ atau ⋮) pada bilah navigasi browser Anda.',
      },
      {
        stepNumber: '03',
        title: 'Pilih "Tambahkan ke ponsel"',
        description: 'Cari opsi "Tambahkan ke ponsel" (Add to phone) atau "Tambahkan ke layar utama".',
      },
      {
        stepNumber: '04',
        title: 'Sematkan ke Layar Utama',
        description: 'Konfirmasi pemasangan hingga ikon pintasan AKU MUSLIM tampil sejajar dengan aplikasi Android lainnya.',
      },
    ],
  },
};

export interface AndroidDownloadGuideProps {
  variant?: 'card' | 'modal';
  onClose?: () => void;
  defaultExpanded?: boolean;
}

export const AndroidDownloadGuide: React.FC<AndroidDownloadGuideProps> = ({
  variant = 'card',
  onClose,
  defaultExpanded = true,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [selectedBrowser, setSelectedBrowser] = useState<AndroidBrowserId>('chrome');
  const [isExpanded, setIsExpanded] = useState(variant === 'modal' ? true : defaultExpanded);
  const [copiedLink, setCopiedLink] = useState(false);
  const [installSuccessMsg, setInstallSuccessMsg] = useState(false);

  const activeGuide = BROWSER_GUIDES[selectedBrowser];
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleDirectInstall = async () => {
    const accepted = await install();
    if (accepted) {
      setInstallSuccessMsg(true);
    }
  };

  const handleCopyLink = async () => {
    if (!currentUrl) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(currentUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      // Clipboard fallback ignored gracefully
    }
  };

  const guideBody = (
    <div className="space-y-4">
      {/* Status Banner if Already Installed */}
      {(isInstalled || installSuccessMsg) && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Aplikasi Sudah Terpasang di Perangkat Ini</p>
            <p className="text-emerald-800/90 dark:text-emerald-300 mt-0.5 leading-relaxed">
              AKU MUSLIM sedang berjalan dalam mode aplikasi layar penuh (PWA). Anda tetap dapat menggunakan panduan di bawah untuk membantu keluarga memasangnya di HP Android lain.
            </p>
          </div>
        </div>
      )}

      {/* Primary Action Strip: One-Tap Install (if browser supports prompt) + Copy Link */}
      <div className="flex flex-wrap items-center gap-2">
        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={handleDirectInstall}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Instal Aplikasi Sekarang</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCopyLink}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap text-emerald-700 dark:text-emerald-300">Link Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
              <span className="whitespace-nowrap">Salin Link untuk Buka di Chrome</span>
            </>
          )}
        </button>
      </div>

      {/* Browser Selector Segmented Control */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
          Pilih Browser Android yang Anda Gunakan:
        </span>
        <div
          role="tablist"
          aria-label="Panduan per browser Android"
          className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
        >
          {(Object.keys(BROWSER_GUIDES) as AndroidBrowserId[]).map((id) => {
            const active = selectedBrowser === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedBrowser(id)}
                className={`min-h-[40px] px-2 py-1.5 rounded-lg text-xs font-bold transition-colors truncate ${
                  active
                    ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {BROWSER_GUIDES[id].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Menu Hint Preview (No nested card clutter — clean illustration surface) */}
      <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <img src="/icon.svg" alt="Ikon AKU MUSLIM" className="w-9 h-9" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
              AKU MUSLIM
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              Tampil sebagai ikon aplikasi di layar utama
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 shrink-0">
          {selectedBrowser === 'samsung' ? (
            <Menu className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          ) : (
            <MoreVertical className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          )}
          <span className="font-medium whitespace-nowrap">{activeGuide.menuLabel}</span>
          <span aria-hidden="true" className="text-stone-400">→</span>
          <PlusSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        </div>
      </div>

      {/* 4 Editorial Numbered Steps */}
      <ol className="space-y-2.5">
        {activeGuide.steps.map((step) => (
          <li
            key={step.stepNumber}
            className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800"
          >
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white text-xs font-bold font-mono tabular-nums flex items-center justify-center shrink-0 mt-0.5">
              {step.stepNumber}
            </span>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {step.description}
              </p>
              {step.hint && (
                <p className="text-xs text-emerald-800 dark:text-emerald-400 pt-1 leading-relaxed">
                  Tips: {step.hint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Key PWA Benefits & Honest Native Alarm Note */}
      <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Tampilan penuh tanpa bilah browser</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Tetap bisa dibuka saat offline</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Hemat penyimpanan, tanpa iklan</span>
          </div>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          <strong className="text-stone-700 dark:text-stone-200">Catatan:</strong> Pemasangan melalui browser (PWA) memberikan akses cepat dan mode offline penuh. Untuk alarm suara adzan otomatis saat layar HP terkunci, tetap diperlukan pemasangan file aplikasi Android native (.apk).
        </p>

        {isIOS && (
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong className="font-bold">Pengguna iPhone / iPad (Safari):</strong> Ketuk ikon <strong>Bagikan (Share)</strong> di bilah bawah Safari, lalu pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
          </p>
        )}
      </div>
    </div>
  );

  if (variant === 'modal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="android-pwa-guide-title"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-tab-fade"
      >
        <div className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 space-y-4">
          {/* Mobile sheet grab handle */}
          <div className="w-10 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto sm:hidden" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <h2 id="android-pwa-guide-title" className="text-base font-bold text-stone-900 dark:text-white">
                  Pasang AKU MUSLIM di Android
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                  <span>Panduan PWA</span>
                  <span aria-hidden="true">·</span>
                  <span>Tambahkan ke Layar Utama</span>
                </div>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup panduan pemasangan Android"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {guideBody}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            >
              Saya Mengerti
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="android-pwa-card-title"
      className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-4 shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h2 id="android-pwa-card-title" className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
              Pasang Aplikasi di HP Android (PWA)
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              <span>Add to Home Screen</span>
              <span aria-hidden="true">·</span>
              <span>Gratis &amp; Ringan</span>
              <span aria-hidden="true">·</span>
              <span>Mendukung Offline</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="min-h-[44px] px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="whitespace-nowrap">{isExpanded ? 'Tutup Panduan' : 'Lihat Cara Pasang'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && <div className="pt-1">{guideBody}</div>}
    </section>
  );
};

export default AndroidDownloadGuide;
