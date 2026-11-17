import React, { useState } from 'react';
import { ASMAUL_HUSNA_LIST, AsmaulHusnaItem } from '../../data/asmaulHusnaData';
import { humanAudioService } from '../../services/humanAudioService';
import {
  Search,
  Sparkles,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';

export const AsmaulHusnaModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isHafalanMode, setIsHafalanMode] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<AsmaulHusnaItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('akumuslim_asmaul_husna_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [playbackMessage, setPlaybackMessage] = useState<string>('');

  const toggleBookmark = (id: number) => {
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem('akumuslim_asmaul_husna_bookmarks', JSON.stringify(updated));
  };

  const filteredList = ASMAUL_HUSNA_LIST.filter(
    (item) =>
      item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.arabic.includes(searchQuery) ||
      item.id.toString() === searchQuery.trim()
  );

  const handlePlayAudio = async (item: AsmaulHusnaItem) => {
    const audioUrl = `https://cdn.akumuslim.id/audio/asmaul_husna/human_v1/${String(item.id).padStart(2, '0')}_${item.latin.toLowerCase().replace(/[^a-z]/g, '')}.mp3`;
    setPlaybackMessage(`Memutar pelafalan: ${item.latin}`);
    const res = await humanAudioService.playCustomHumanAudio(audioUrl, item.latin);
    setPlaybackMessage(res.message);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* Search & Hafalan Mode Controls */}
      <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Asmaul Husna (Ar-Rahman, Maha Suci, 1)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsHafalanMode(!isHafalanMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isHafalanMode
                ? 'bg-amber-400 text-stone-900 border-amber-500 shadow-xs'
                : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600'
            }`}
          >
            {isHafalanMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isHafalanMode ? 'Mode Hafalan (Arti Disembunyikan)' : 'Mode Belajar'}</span>
          </button>
        </div>
      </div>

      {/* Grid of 99 Names: RTL grid flow (Arabic standard: starts top-right) with LTR card content */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" dir="rtl">
        {filteredList.map((item) => {
          const isBookmarked = bookmarkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              dir="ltr"
              onClick={() => setSelectedItem(item)}
              className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-mono font-bold text-stone-400">
                  #{String(item.id).padStart(2, '0')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(item.id);
                  }}
                  className="p-1 text-stone-400 hover:text-emerald-600"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Arabic Calligraphy */}
              <div className="text-center py-2">
                <span className="font-arabic text-3xl font-bold text-emerald-950 dark:text-emerald-200 group-hover:scale-105 transition-transform inline-block">
                  {item.arabic}
                </span>
                <h4 className="text-xs font-black text-stone-900 dark:text-white mt-1">
                  {item.latin}
                </h4>
              </div>

              {/* Meaning (Hidden in Hafalan mode) */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
                {isHafalanMode ? (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold italic">
                    Sentuh untuk menguji hafalan
                  </span>
                ) : (
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1">
                    {item.meaning}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Name Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  Asmaul Husna #{selectedItem.id}
                </span>
                <h3 className="text-xl font-black text-stone-900 dark:text-white mt-1">
                  {selectedItem.latin}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Arabic Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-amber-300 text-center shadow-md border border-emerald-600/30">
              <span className="font-arabic text-4xl sm:text-5xl font-bold leading-normal">
                {selectedItem.arabic}
              </span>
              <p className="text-xs text-emerald-100 font-semibold mt-1">
                "{selectedItem.meaning}"
              </p>
            </div>

            {/* Explanation */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 leading-relaxed space-y-1">
              <strong className="text-emerald-800 dark:text-emerald-300 block">
                Penjelasan Makna Akidah:
              </strong>
              <p>{selectedItem.explanation}</p>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => handlePlayAudio(selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs shadow-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengar Pelafalan</span>
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
