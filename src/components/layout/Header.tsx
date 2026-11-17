import React from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { Compass, Moon, Sun, ShieldCheck, Sparkles, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    mode,
    setMode,
    theme,
    setTheme,
    setShowQiblaModal,
    setShowQualityGate,
    setShowOwnerDashboard,
    setShowPremiumModal,
    setShowSettingsModal,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-4xl mx-auto px-2.5 sm:px-4 h-14 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Zone 1: Brand Wordmark with Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden hidden min-[350px]:flex items-center justify-center bg-emerald-800 shadow-xs shrink-0">
            <img src="/icon.svg" alt="AKU MUSLIM" className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs min-[380px]:text-sm sm:text-base font-extrabold tracking-tight text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
              AKU MUSLIM
            </span>
          </div>
        </div>

        {/* Zone 2: Mode Switcher (Umum / Anak) */}
        <nav aria-label="Mode Aplikasi" className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg shrink-0">
          <button
            onClick={() => setMode('umum')}
            className={`px-2 min-[380px]:px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'umum'
                ? 'bg-white text-emerald-900 shadow-xs dark:bg-stone-700 dark:text-white'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Umum
          </button>
          <button
            onClick={() => setMode('anak')}
            className={`px-2 min-[380px]:px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'anak'
                ? 'bg-amber-400 text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Anak
          </button>
        </nav>

        {/* Zone 3: Quick Actions & PWA Install */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => setShowPremiumModal(true)}
            title="Paket Langganan & Fitur Premium"
            className="h-8 px-2 sm:px-2.5 flex items-center gap-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-black transition-colors"
            aria-label="Paket Langganan"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="hidden sm:inline">Premium</span>
          </button>

          <button
            onClick={() => setShowQiblaModal(true)}
            title="Arah Kiblat"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
            aria-label="Kompas Kiblat"
          >
            <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
            aria-label="Ganti Tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            title="Pengaturan Aplikasi"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
            aria-label="Pengaturan Aplikasi"
          >
            <Settings className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
          </button>

          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>
        </div>
      </div>
    </header>
  );
};
