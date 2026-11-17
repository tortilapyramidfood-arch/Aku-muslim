import React, { useState, useEffect } from 'react';
import {
  quranAudioStorage,
  DownloadProgress,
  DownloadedSurahRecord,
} from '../../services/quranAudioStorageService';
import { QARI_LIST, QariInfo, DEFAULT_QARI } from '../../data/qariList';
import { SURAH_LIST } from '../../data/surahList';
import { quranPlayer } from '../../services/quranPlayerController';
import {
  Download,
  Trash2,
  HardDrive,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RotateCcw,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface OfflineAudioDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSurahNumber?: number;
  initialTab?: 'unduh_surah' | 'unduh_juz' | 'kelola_storage';
  initialJuzNumber?: number;
}

export const OfflineAudioDownloadModal: React.FC<OfflineAudioDownloadModalProps> = ({
  isOpen,
  onClose,
  activeSurahNumber = 1,
  initialTab = 'unduh_surah',
  initialJuzNumber = 30,
}) => {
  const [activeTab, setActiveTab] = useState<'unduh_surah' | 'unduh_juz' | 'kelola_storage'>(initialTab);
  const [selectedQari, setSelectedQari] = useState<QariInfo>(DEFAULT_QARI);
  const [storageInfo, setStorageInfo] = useState<{ usedMB: number; totalMB: number; percentUsed: number }>({
    usedMB: 0,
    totalMB: 10000,
    percentUsed: 0,
  });
  const [downloadedSurahs, setDownloadedSurahs] = useState<DownloadedSurahRecord[]>([]);
  const [downloadProgresses, setDownloadProgresses] = useState<Record<number, DownloadProgress>>({});
  const [batchJuzNumber, setBatchJuzNumber] = useState(initialJuzNumber);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialJuzNumber) setBatchJuzNumber(initialJuzNumber);
      loadStorageData();
    }
  }, [isOpen, initialTab, initialJuzNumber]);

  const loadStorageData = async () => {
    const est = await quranAudioStorage.getStorageEstimate();
    setStorageInfo(est);
    const surahs = await quranAudioStorage.getDownloadedSurahs();
    setDownloadedSurahs(surahs);
  };

  if (!isOpen) return null;

  const handleDownloadSurah = async (surahNumber: number) => {
    const sMeta = SURAH_LIST.find((s) => s.number === surahNumber);
    if (!sMeta) return;

    await quranAudioStorage.downloadSurah(
      surahNumber,
      sMeta.nameLatin,
      sMeta.numberOfAyahs,
      selectedQari.id,
      selectedQari.baseUrl,
      (p) => {
        setDownloadProgresses((prev) => ({ ...prev, [surahNumber]: p }));
        if (p.status === 'completed') {
          loadStorageData();
        }
      }
    );
  };

  const handlePauseDownload = (surahNumber: number) => {
    quranAudioStorage.pauseOrCancelDownload(surahNumber);
  };

  const handleDeleteSurah = async (surahNumber: number, totalAyahs: number) => {
    await quranAudioStorage.deleteSurahAudio(selectedQari.id, surahNumber, totalAyahs);
    await loadStorageData();
  };

  const handleClearAll = async () => {
    if (window.confirm('Yakin ingin menghapus seluruh audio Al-Qur\'an yang telah diunduh?')) {
      await quranAudioStorage.clearAllOfflineAudio();
      await loadStorageData();
    }
  };

  const isSurahDownloaded = (surahNum: number) => {
    return downloadedSurahs.some((d) => d.surahNumber === surahNum && d.isComplete);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-stone-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700 shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Kelola Audio Murottal Offline
              </h2>
              <span className="text-[11px] text-stone-500">
                Penyimpanan Lokal Persisten (IndexedDB) · 100% Bebas Kuota
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Bar Indicator */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs space-y-2">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
            <span className="flex items-center gap-1.5 font-bold">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>Penyimpanan Audio Terpakai:</span>
            </span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {downloadedSurahs.reduce((a, b) => a + b.totalBytes, 0) > 0
                ? `${Math.round(downloadedSurahs.reduce((a, b) => a + b.totalBytes, 0) / (1024 * 1024))} MB`
                : '0 MB'}
            </span>
          </div>

          <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(2, storageInfo.percentUsed))}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-stone-400">
            <span>{downloadedSurahs.length} Surah Siap Diputar Offline</span>
            <span>Total Kuota Browser: {storageInfo.totalMB} MB</span>
          </div>
        </div>

        {/* Qari Selection with Legal Registry Notice */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 dark:text-amber-200">Pilihan Qari Berlisensi:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wider">
              {selectedQari.verificationStatus}
            </span>
          </div>

          <select
            value={selectedQari.id}
            onChange={(e) => {
              const q = QARI_LIST.find((item) => item.id === e.target.value);
              if (q) {
                setSelectedQari(q);
                quranPlayer.setQari(q);
              }
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-xs font-bold text-stone-900 dark:text-white"
          >
            {QARI_LIST.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name} ({q.style})
              </option>
            ))}
          </select>

          <div className="space-y-1 text-[11px] text-amber-900/90 dark:text-amber-300/90">
            <p className="font-semibold text-stone-700 dark:text-stone-300">
              Edisi: {selectedQari.editionName}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              Sumber: {selectedQari.audioSource} • Pemegang Hak: {selectedQari.rightsHolder}
            </p>
            <p className="p-1.5 bg-amber-100/70 dark:bg-amber-900/40 rounded text-[10px] border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              {selectedQari.legalNotice}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('unduh_surah')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'unduh_surah'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Unduh Per Surah
          </button>
          <button
            onClick={() => setActiveTab('unduh_juz')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'unduh_juz'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Unduh Per Juz
          </button>
          <button
            onClick={() => setActiveTab('kelola_storage')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'kelola_storage'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Kelola Audio ({downloadedSurahs.length})
          </button>
        </div>

        {/* TAB 1: Unduh Per Surah */}
        {activeTab === 'unduh_surah' && (
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {SURAH_LIST.map((surah) => {
              const isDownloaded = isSurahDownloaded(surah.number);
              const progress = downloadProgresses[surah.number];
              const isDownloading = progress?.status === 'downloading';

              return (
                <div
                  key={surah.number}
                  className="p-3 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-white">
                        {surah.number}. {surah.nameLatin}
                      </span>
                      <span className="font-arabic text-sm text-emerald-800 dark:text-emerald-300 font-bold">
                        {surah.nameArabic}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      {surah.numberOfAyahs} Ayat · Estimasi: ~{(surah.numberOfAyahs * 0.15).toFixed(1)} MB
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDownloading ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">
                          {progress.percent}%
                        </span>
                        <button
                          onClick={() => handlePauseDownload(surah.number)}
                          className="p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isDownloaded ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersimpan</span>
                        </span>
                        <button
                          onClick={() => handleDeleteSurah(surah.number, surah.numberOfAyahs)}
                          title="Hapus Audio Surah"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadSurah(surah.number)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Unduh Per Juz */}
        {activeTab === 'unduh_juz' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl space-y-2">
              <span className="font-bold text-stone-900 dark:text-white block">
                Pilih Juz untuk Diunduh Bertahap:
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={batchJuzNumber}
                  onChange={(e) => setBatchJuzNumber(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                    <option key={juz} value={juz}>
                      Juz {juz} {juz === 30 ? '(Juz \'Amma - Populer)' : ''}
                    </option>
                  ))}
                </select>

                <button
                  onClick={async () => {
                    const juzSurahs = SURAH_LIST.filter((s) => s.juzNumber === batchJuzNumber);
                    for (const s of juzSurahs) {
                      await handleDownloadSurah(s.number);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Mulai Unduh Seluruh Juz {batchJuzNumber}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 flex items-start gap-2">
              <Wifi className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Saran Hemat Kuota:</strong> Pengunduhan 1 juz penuh (~40-80 MB) sangat disarankan menggunakan koneksi Wi-Fi. File akan otomatis tersimpan permanen di HP Anda.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: Kelola Storage & Hapus */}
        {activeTab === 'kelola_storage' && (
          <div className="space-y-3 text-xs">
            {downloadedSurahs.length === 0 ? (
              <div className="p-6 text-center text-stone-400 space-y-2">
                <HardDrive className="w-8 h-8 mx-auto opacity-50" />
                <p>Belum ada surah yang diunduh secara offline.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-stone-500 font-bold">
                    Daftar {downloadedSurahs.length} Surah Tersimpan:
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Audio</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {downloadedSurahs.map((rec) => (
                    <div
                      key={rec.surahNumber}
                      className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white block">
                          Surah {rec.surahName} ({rec.totalAyahs} Ayat)
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Ukuran: {Math.round(rec.totalBytes / (1024 * 1024))} MB · {new Date(rec.downloadedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteSurah(rec.surahNumber, rec.totalAyahs)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs">
          <span className="text-stone-400">AKU MUSLIM Offline Audio Vault</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
