import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppMode } from '../../types';
import {
  Sun,
  Moon,
  Type,
  Lock,
  Download,
  Shield,
  Smartphone,
  Eye,
  CheckCircle2,
  Check,
  X,
  Sliders,
  FileText,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { AndroidDownloadGuide } from '../common/AndroidDownloadGuide';

type SettingsTab = 'tampilan' | 'pin' | 'pwa' | 'privasi';

export interface AppSettingsMenuProps {
  variant?: 'embedded' | 'modal';
  onClose?: () => void;
  initialTab?: SettingsTab;
}

export const AppSettingsMenu: React.FC<AppSettingsMenuProps> = ({
  variant = 'embedded',
  onClose,
  initialTab = 'tampilan',
}) => {
  const {
    mode,
    setMode,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    settings,
    updateSettings,
    familyMembers,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Parental PIN change state
  const [pinInput, setPinInput] = useState('');
  const [pinSavedNotice, setPinSavedNotice] = useState(false);
  const [pinError, setPinError] = useState('');

  // Unlock prompt when switching from Anak to Umum
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  // Privacy policy modal state
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleModeChange = (targetMode: AppMode) => {
    if (mode === 'anak' && targetMode === 'umum') {
      // Prompt for parental PIN before leaving Mode Anak
      setUnlockPinInput('');
      setUnlockError(false);
      setShowUnlockModal(true);
      return;
    }
    setMode(targetMode);
  };

  const handleVerifyUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.parentPin || '1234';
    if (unlockPinInput.trim() === correctPin) {
      setMode('umum');
      setShowUnlockModal(false);
      setUnlockPinInput('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
      setTimeout(() => setUnlockError(false), 2000);
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.trim();
    if (cleaned.length >= 4 && cleaned.length <= 6 && /^\d+$/.test(cleaned)) {
      updateSettings({ parentPin: cleaned, parentPinEnabled: true });
      setPinSavedNotice(true);
      setPinInput('');
      setPinError('');
      setTimeout(() => setPinSavedNotice(false), 3000);
    } else {
      setPinError('PIN harus berupa 4–6 digit angka.');
    }
  };

  const handleExportData = () => {
    const data = {
      settings,
      familyMembers,
      exportedAt: new Date().toISOString(),
      appName: 'AKU MUSLIM',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akumuslim_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isAnak = mode === 'anak';

  const content = (
    <div className="space-y-4">
      {/* Tab Switcher - Horizontal Scrollable on Mobile */}
      <div
        role="tablist"
        aria-label="Kategori Pengaturan Aplikasi"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tampilan'}
          onClick={() => setActiveTab('tampilan')}
          className={`min-h-[42px] px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tampilan'
              ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Tampilan & Mode</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pin'}
          onClick={() => setActiveTab('pin')}
          className={`min-h-[42px] px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pin'
              ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">PIN Orang Tua</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pwa'}
          onClick={() => setActiveTab('pwa')}
          className={`min-h-[42px] px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pwa'
              ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Pasang PWA</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'privasi'}
          onClick={() => setActiveTab('privasi')}
          className={`min-h-[42px] px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'privasi'
              ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Privasi & Data</span>
        </button>
      </div>

      {/* TAB 1: TAMPILAN & MODE */}
      {activeTab === 'tampilan' && (
        <div className="space-y-4 animate-tab-fade">
          {/* Pilihan Mode Penggunaan (Mode Umum / Mode Anak) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                Pilihan Mode Penggunaan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'umum' as const,
                  title: 'Mode Umum',
                  desc: 'Tampilan bersih, teks mudah dibaca dengan kontrol A/A+/A++, lengkap untuk seluruh usia.',
                },
                {
                  id: 'anak' as const,
                  title: 'Mode Anak',
                  desc: 'Warna ramah anak, kuis edukasi, kisah nabi & pengawasan orang tua.',
                },
              ].map((m) => {
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeChange(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all min-h-[48px] ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 ring-1 ring-emerald-500'
                        : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        {m.title}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tampilan & Kenyamanan Baca (Tema & Ukuran Teks) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-3.5">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
              Tampilan & Kenyamanan Baca
            </h3>

            {/* Tema Tampilan */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Tema Tampilan
              </span>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] ${
                    theme === 'light'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Terang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] ${
                    theme === 'dark'
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gelap</span>
                </button>
              </div>
            </div>

            {/* Ukuran Teks Al-Qur'an & Terjemahan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-stone-100 dark:border-stone-700/60">
              <div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                  Ukuran Teks Al-Qur'an & Terjemahan
                </span>
                <span className="text-[11px] text-stone-400 block">
                  Menyesuaikan kenyamanan baca teks Arab dan latin
                </span>
              </div>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 shrink-0">
                {[
                  { id: 'normal' as const, label: 'Standar' },
                  { id: 'large' as const, label: 'Besar' },
                  { id: 'xlarge' as const, label: 'Sangat Besar' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFontSize(s.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] ${
                      fontSize === s.id
                        ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIN ORANG TUA */}
      {activeTab === 'pin' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-4 animate-tab-fade">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
              Kunci PIN Pengawasan Orang Tua
            </h3>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Cegah anak keluar dari Mode Anak tanpa seizin orang tua. PIN tersimpan secara aman di perangkat lokal Anda.
          </p>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700/80 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-800 dark:text-stone-200 block">
                Status Proteksi PIN Mode Anak
              </span>
              <span className="text-[11px] text-stone-400">
                {settings.parentPinEnabled ? 'Proteksi aktif (PIN diperlukan untuk keluar Mode Anak)' : 'PIN default aktif'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-mono">
              ••••
            </span>
          </div>

          {/* Form Ganti PIN Baru */}
          <form onSubmit={handleSaveNewPin} className="space-y-3">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
              Perbarui PIN Orang Tua (4–6 Digit Angka):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan 4-6 digit PIN baru"
                className="flex-1 min-h-[44px] px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono tracking-widest text-center sm:text-left text-stone-900 dark:text-white"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shrink-0"
              >
                Simpan PIN Baru
              </button>
            </div>
            {pinError && (
              <p className="text-xs text-rose-600 font-medium">{pinError}</p>
            )}
            {pinSavedNotice && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PIN orang tua berhasil diperbarui dan aktif!</span>
              </p>
            )}
          </form>
        </div>
      )}

      {/* TAB 3: PASANG PWA */}
      {activeTab === 'pwa' && (
        <div className="animate-tab-fade">
          <AndroidDownloadGuide variant="card" defaultExpanded={true} />
        </div>
      )}

      {/* TAB 4: PRIVASI & CADANGAN DATA */}
      {activeTab === 'privasi' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-4 animate-tab-fade">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
              Data, Keamanan &amp; Privasi Pengguna
            </h3>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            AKU MUSLIM memegang teguh prinsip privasi Islami: riwayat ibadah, penanda bacaan, dan koordinat lokasi disimpan secara lokal di perangkat Anda, tanpa mengirim data ke server analitik pihak ketiga atau pelacak iklan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleExportData}
              className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cadangkan Data (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
              className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{showPrivacyPolicy ? 'Tutup Kebijakan Privasi' : 'Kebijakan Privasi (UU PDP)'}</span>
            </button>
          </div>

          {showPrivacyPolicy && (
            <div className="mt-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-900 text-xs text-stone-600 dark:text-stone-300 space-y-2.5 border border-stone-200 dark:border-stone-700 leading-relaxed animate-tab-fade">
              <h4 className="font-bold text-stone-900 dark:text-white">
                Prinsip Kepatuhan &amp; Privasi AKU MUSLIM:
              </h4>
              <p>
                1. <strong>Penggunaan Lokasi:</strong> Lokasi GPS hanya digunakan secara lokal di perangkat Anda untuk menghitung waktu sholat dan arah kiblat Ka'bah secara astronomis. Data lokasi tidak pernah dikirim atau disimpan di server eksternal.
              </p>
              <p>
                2. <strong>Data Ibadah &amp; Belajar:</strong> Bookmark ayat, bacaan terakhir, dan progres hafalan tersimpan 100% lokal pada media penyimpanan browser / perangkat Anda.
              </p>
              <p>
                3. <strong>Perlindungan Anak:</strong> Mode Anak tidak mengumpulkan informasi pribadi anak dan tidak menayangkan iklan komersial.
              </p>
              <p>
                4. <strong>Kepatuhan Regulasi:</strong> Sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP) Indonesia No. 27 Tahun 2022 dan Kebijakan Google Play Families.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Parental PIN Unlock Prompt Modal (when leaving Mode Anak) */}
      {showUnlockModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-tab-fade"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    Verifikasi PIN Orang Tua
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Masukkan PIN untuk keluar dari Mode Anak
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUnlockModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyUnlockPin} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={unlockPinInput}
                onChange={(e) => setUnlockPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="4-6 digit PIN..."
                autoFocus
                className="w-full min-h-[44px] px-3 text-center text-sm font-mono tracking-widest rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />

              {unlockError && (
                <p className="text-xs text-rose-600 font-bold text-center">
                  PIN orang tua salah! Silakan coba lagi.
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1 min-h-[42px] px-3 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[42px] px-3 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                >
                  Buka Mode Umum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'modal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-settings-title"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-tab-fade"
      >
        <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-4 sm:p-6 space-y-4">
          <div className="w-10 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto sm:hidden" />

          <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 id="app-settings-title" className="text-base font-bold text-stone-900 dark:text-white">
                  Pengaturan Aplikasi
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Preferensi tampilan, mode, keamanan PIN, dan privasi
                </p>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Pengaturan"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {content}
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="embedded-settings-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 id="embedded-settings-heading" className="text-sm font-bold text-stone-900 dark:text-white">
              Pengaturan Aplikasi
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Kelola mode, tema, ukuran teks, PIN, dan privasi dalam satu menu
            </p>
          </div>
        </div>
      </div>

      {content}
    </section>
  );
};

export default AppSettingsMenu;
