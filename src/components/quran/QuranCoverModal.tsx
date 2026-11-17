import React, { useState } from 'react';
import {
  QURAN_COVER_TEMPLATES,
  QuranCoverTemplate,
  isQuranFrameEnabled,
  setQuranFrameEnabled,
} from '../../data/quranCoverTemplates';
import {
  X,
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  Palette,
  Eye,
  Info,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface QuranCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCoverId: string;
  onSelectCover: (cover: QuranCoverTemplate) => void;
  frameEnabled?: boolean;
  onToggleFrame?: (enabled: boolean) => void;
}

export const QuranCoverModal: React.FC<QuranCoverModalProps> = ({
  isOpen,
  onClose,
  selectedCoverId,
  onSelectCover,
  frameEnabled: propFrameEnabled,
  onToggleFrame,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MIHRAB' | 'FLORAL' | 'HERITAGE'>('ALL');
  const [previewCover, setPreviewCover] = useState<QuranCoverTemplate | null>(null);
  const [localFrameEnabled, setLocalFrameEnabled] = useState<boolean>(() => isQuranFrameEnabled());
  const frameEnabled = propFrameEnabled !== undefined ? propFrameEnabled : localFrameEnabled;

  if (!isOpen) return null;

  const handleToggleFrame = (enabled: boolean) => {
    setLocalFrameEnabled(enabled);
    setQuranFrameEnabled(enabled);
    if (onToggleFrame) onToggleFrame(enabled);
  };

  const filteredTemplates = QURAN_COVER_TEMPLATES.filter((tpl) => {
    if (activeFilter === 'MIHRAB') return tpl.category === 'MIHRAB_ARCH';
    if (activeFilter === 'FLORAL') return tpl.category === 'ROYAL_FLORAL';
    if (activeFilter === 'HERITAGE') return tpl.category === 'CLASSICAL_HERITAGE' || tpl.category === 'GEOMETRIC_ARABESQUE';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  10 Template Cover & Bingkai Al-Qur'an
                </h2>
                <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/60 px-2 py-0.5 rounded-full font-mono">
                  100% Offline Asset
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Iluminasi ornamen Islam beresolusi tinggi terverifikasi untuk halaman mushaf fisik.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Layer Distinction Guide & Toggle Frame */}
        <div className="p-3.5 sm:p-4 bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200/80 dark:border-stone-800 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <strong className="block text-stone-900 dark:text-white">Cover / Sampul</strong>
                <span className="text-[11px] text-stone-500">Tampilan sampul depan Al-Qur'an</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <strong className="block text-stone-900 dark:text-white">Bingkai Halaman</strong>
                <span className="text-[11px] text-stone-500">Ornamen sekeliling 604 halaman mushaf</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <strong className="block text-stone-900 dark:text-white">Tema Warna Mushaf</strong>
                <span className="text-[11px] text-stone-500">4 Pilihan latar kertas (Klasik, Putih, dll)</span>
              </div>
            </div>
          </div>

          {/* Toggle Display Frame on 604 Pages */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="font-bold text-emerald-950 dark:text-emerald-200">
                Tampilkan Bingkai Ornamen pada Halaman Mushaf Fisik:
              </span>
            </div>
            <button
              onClick={() => handleToggleFrame(!frameEnabled)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                frameEnabled
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {frameEnabled ? 'AKTIF (TAMPILKAN BINGKAI)' : 'NONAKTIF (MUSHAF BERSIH)'}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-stone-400 shrink-0">Kategori:</span>
          {[
            { id: 'ALL' as const, label: 'Semua 10+1 Template' },
            { id: 'MIHRAB' as const, label: 'Lengkungan Mihrab' },
            { id: 'FLORAL' as const, label: 'Bunga & Kerajaan' },
            { id: 'HERITAGE' as const, label: 'Klasik & Perkamen' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === cat.id
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery 2-Column Responsive Grid */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedCoverId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Image Preview Box */}
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 shadow-inner group">
                      <img
                        src={tpl.thumbnailPath}
                        alt={tpl.name}
                        className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                      />

                      {/* Code Badge */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold tracking-wider">
                        {tpl.code}
                      </span>

                      {/* Selected Overlay Indicator */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}

                      {/* Zoom Preview Button */}
                      <button
                        onClick={() => setPreviewCover(tpl)}
                        className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Perbesar</span>
                      </button>
                    </div>

                    {/* Metadata */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-stone-900 dark:text-white leading-tight">
                          {tpl.name}
                        </h3>
                        <span className="font-arabic text-sm font-bold text-amber-700 dark:text-amber-400">
                          {tpl.arabicName}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {tpl.subtitle}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-stone-400">
                      {tpl.resolution}
                    </span>

                    <button
                      onClick={() => {
                        onSelectCover(tpl);
                        if (!frameEnabled) handleToggleFrame(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-100 hover:border-emerald-500 hover:text-emerald-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Bingkai Aktif</span>
                        </>
                      ) : (
                        <span>Terapkan Bingkai Ini</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>11 Template Ornamen Terverifikasi oleh PYRAMID GROUP</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold hover:opacity-90"
          >
            Selesai Memilih
          </button>
        </div>
      </div>

      {/* Fullscreen High-Resolution Preview Modal */}
      {previewCover && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="max-w-xl w-full bg-stone-900 rounded-3xl p-5 border border-stone-700 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{previewCover.name}</h3>
                <span className="text-xs text-stone-400 font-arabic">{previewCover.arabicName}</span>
              </div>
              <button
                onClick={() => setPreviewCover(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white/5 border border-stone-800 aspect-[3/4] flex items-center justify-center">
              <img
                src={previewCover.assetPath}
                alt={previewCover.name}
                className="w-full h-full object-contain p-2"
              />
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {previewCover.description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-stone-400">{previewCover.resolution}</span>
              <button
                onClick={() => {
                  onSelectCover(previewCover);
                  setPreviewCover(null);
                  if (!frameEnabled) handleToggleFrame(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
              >
                Gunakan Template Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
