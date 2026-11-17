import React, { useState } from 'react';
import { DUA_CATEGORIES, DUA_ITEMS } from '../../data/duaList';
import { DuaItem } from '../../types';
import { humanAudioService } from '../../services/humanAudioService';
import {
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Volume2,
  Copy,
  Info,
} from 'lucide-react';

export const DuaLibraryModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [audioFeedback, setAudioFeedback] = useState<{ id: string; text: string } | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('akumuslim_bookmarked_duas');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleBookmark = (id: string) => {
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem('akumuslim_bookmarked_duas', JSON.stringify(updated));
  };

  const handleCopyDua = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.latin}\n\nArtinya: "${dua.translation}"\n(Sumber: ${dua.source})`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayDuaAudio = async (dua: DuaItem) => {
    if (!dua.audioUrl) {
      humanAudioService.stopAllAudio();
      setAudioFeedback({
        id: dua.id,
        text: 'Audio qari/muadzin untuk bacaan ini belum tersedia — silakan baca teks Arab berharakat lengkap tanpa suara sintetis.',
      });
      setTimeout(() => setAudioFeedback(null), 4000);
      return;
    }

    const res = await humanAudioService.playCustomHumanAudio(dua.audioUrl, dua.title);
    setAudioFeedback({
      id: dua.id,
      text: res.message,
    });
    if (!res.success) {
      setTimeout(() => setAudioFeedback(null), 4000);
    }
  };

  const filteredDuas = DUA_ITEMS.filter((item) => {
    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.latin?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-12">
      {/* Search & Categories Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari doa atau bacaan tahlil (misal: arwah, kursi, tidur, orang tua)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategoryId === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
            }`}
          >
            Semua Kategori ({DUA_ITEMS.length})
          </button>
          {DUA_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategoryId === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scholarly Context Header for Tahlil & Doa Arwah */}
      {selectedCategoryId === 'yasin_tahlil' && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-950 dark:text-emerald-200">
          <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <strong className="block">Catatan Susunan & Adab Bacaan Tahlil & Doa Arwah:</strong>
            <p>
              Rangkaian 6 bacaan di bawah disusun secara runtut mengikuti panduan Kementerian Agama RI dan kitab{' '}
              <em>Al-Adzkar</em> (Imam An-Nawawi): dimulai dari pembuka Al-Fatihah, surah pendek penegas tauhid, Ayat Kursi & akhir Al-Baqarah, dzikir tahlil & tasbih, shalawat, lalu doa ampunan ahli kubur bersumber HR. Muslim no. 963.
            </p>
          </div>
        </div>
      )}

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.map((dua) => {
          const isBookmarked = bookmarkedIds.includes(dua.id);
          const isCopied = copiedId === dua.id;
          const showAudioNote = audioFeedback?.id === dua.id;

          return (
            <div
              key={dua.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 transition-all hover:border-emerald-400"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {dua.orderNumber && (
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-[11px] font-black flex items-center justify-center shrink-0 tabular-nums">
                      {dua.orderNumber}
                    </span>
                  )}
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    {dua.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handlePlayDuaAudio(dua)}
                    className={`p-1.5 rounded-lg transition-all ${
                      dua.audioUrl
                        ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer'
                        : 'text-stone-300 dark:text-stone-600 cursor-default opacity-50'
                    }`}
                    title={
                      dua.audioUrl
                        ? 'Putar Audio Qari Syaikh Mahmud Khalil Al-Husary'
                        : 'Audio belum tersedia (Menunggu rekaman ustadz bersanad)'
                    }
                    aria-label={dua.audioUrl ? 'Putar Audio Bacaan' : 'Audio belum tersedia'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyDua(dua)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600"
                    title="Salin Teks Doa"
                    aria-label="Salin Teks Doa"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleBookmark(dua.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600"
                    title={isBookmarked ? 'Hapus Bookmark' : 'Simpan Doa'}
                    aria-label={isBookmarked ? 'Hapus Bookmark' : 'Simpan Doa'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {showAudioNote && audioFeedback && (
                <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                  {audioFeedback.text}
                </div>
              )}

              {/* Arabic Text */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-right">
                <p dir="rtl" className="font-arabic text-xl sm:text-2xl text-emerald-950 dark:text-emerald-200 leading-loose">
                  {dua.arabic}
                </p>
              </div>

              {/* Latin & Translation */}
              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                <p className="italic text-stone-500 dark:text-stone-400">{dua.latin}</p>
                <p className="font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                  "{dua.translation}"
                </p>
              </div>

              {/* Scholarly context explanation (e.g. Tahlil flow notes) */}
              {dua.contextNote && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700/70 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{dua.contextNote}</span>
                </div>
              )}

              {/* Source & Virtue badge */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400">
                <span>Sumber: <strong>{dua.source}</strong></span>
                {dua.repetition && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                    Dibaca {dua.repetition}x
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sumber & Pembaruan Terakhir */}
      <div className="text-center text-[11px] text-stone-400 dark:text-stone-500 pt-2">
        Sumber: Al-Qur&apos;an LPMQ Kemenag RI, Kutubus Sittah, Hisnul Muslim &amp; Panduan Tahlil Kemenag · Pembaruan 2026
      </div>
    </div>
  );
};
