import React from 'react';
import { QARI_LIST, QariInfo } from '../../data/qariList';
import { Volume2, Check, X, ShieldCheck, Play, Info } from 'lucide-react';

interface QariSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQari: QariInfo;
  onSelectQari: (qari: QariInfo) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const QariSelectorModal: React.FC<QariSelectorModalProps> = ({
  isOpen,
  onClose,
  currentQari,
  onSelectQari,
  playbackSpeed,
  onSpeedChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                Pilih Qari Al-Qur'an (Murattal)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Audio suara manusia asli dengan lisensi tilawah terverifikasi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Adjustment Bar */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            Kecepatan Putar Audio:
          </span>
          <div className="flex items-center gap-1.5">
            {[0.75, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  playbackSpeed === speed
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-emerald-400'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Qari Registry List */}
        <div className="space-y-3">
          {QARI_LIST.map((qari) => {
            const isSelected = currentQari.qariId === qari.qariId;
            return (
              <div
                key={qari.qariId}
                onClick={() => onSelectQari(qari)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/40 shadow-xs'
                    : 'border-stone-200 dark:border-stone-700 hover:border-emerald-400 bg-white dark:bg-stone-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-stone-900 dark:text-white">
                        {qari.name}
                      </h4>
                      {qari.qariId === 'husary' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          Referensi Utama
                        </span>
                      )}
                    </div>
                    <span className="font-arabic text-sm text-stone-500 block my-0.5">
                      {qari.arabicName}
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      {qari.style}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Provenance Metadata Drawer */}
                <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-700/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Edisi: {qari.editionName}</span>
                  </div>
                  <span className="font-mono bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                    {qari.audioBitrate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
          >
            Terapkan Pilihan
          </button>
        </div>
      </div>
    </div>
  );
};
