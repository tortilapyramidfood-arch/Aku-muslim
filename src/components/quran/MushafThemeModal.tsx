import React from 'react';
import { MUSHAF_THEMES, MushafThemeId, MushafThemeDefinition } from '../../data/mushafThemes';
import { Palette, Check, X } from 'lucide-react';

interface MushafThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: MushafThemeId;
  onSelectTheme: (themeId: MushafThemeId) => void;
}

export const MushafThemeModal: React.FC<MushafThemeModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                Pilih Tema Mushaf Al-Qur'an
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Pilih gaya tampilan yang paling nyaman untuk tilawah harian Anda.
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

        {/* 4 Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.values(MUSHAF_THEMES) as MushafThemeDefinition[]).map((theme) => {
            const isSelected = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md scale-102'
                    : 'border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                }`}
              >
                {/* Mini Preview Box */}
                <div
                  className={`w-full h-20 rounded-xl p-3 border mb-3 flex flex-col justify-between ${theme.previewBg} ${theme.previewBorder}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.previewBadge}`}>
                      Halaman 01
                    </span>
                    <span className="text-[10px] text-stone-400 font-arabic">سورة الفاتحة</span>
                  </div>
                  <div className={`font-arabic text-lg text-right font-bold truncate ${theme.previewText}`}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-stone-900 dark:text-white">
                      {theme.name}
                    </h4>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                    {theme.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
