import React, { useState } from 'react';
import { DUA_CATEGORIES, DUA_ITEMS } from '../../data/duaList';
import { DuaCategory, DuaItem } from '../../types';
import { audioService } from '../../services/audioService';
import {
  Search,
  BookOpen,
  Sun,
  Sparkles,
  Home,
  Heart,
  Compass,
  Users,
  Copy,
  Check,
  RotateCcw,
  Plus,
} from 'lucide-react';

export const DuaView: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  const iconMap: Record<string, React.ElementType> = {
    Sun,
    Sparkles,
    Home,
    Heart,
    BookOpen,
    Compass,
    Users,
  };

  const filteredItems = DUA_ITEMS.filter((item) => {
    const matchesCat = selectedCatId === 'all' || item.categoryId === selectedCatId;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.latin && item.latin.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (item: DuaItem) => {
    const text = `${item.title}\n\n${item.arabic}\n\n${item.latin || ''}\n\nArtinya:\n${item.translation}\n\nSumber: ${item.source}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCountClick = (id: string, maxRep: number) => {
    audioService.playTasbihClick();
    const current = itemCounts[id] || 0;
    const next = current + 1;
    if (next >= maxRep) {
      audioService.playSuccessChime();
    }
    setItemCounts((prev) => ({ ...prev, [id]: next }));
  };

  const handleResetCount = (id: string) => {
    setItemCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="space-y-4 pb-12">
      <div>
        <h1 className="text-xl font-black text-stone-900 dark:text-white">
          Kumpulan Doa & Dzikir Ma'tsur
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Dilengkapi teks Arab, transliterasi Latin, terjemahan, dan rujukan shahih.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari doa (contoh: Sayyidul Istighfar, sapu jagat, orang tua, tidur)..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills / Filter bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCatId('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            selectedCatId === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50'
          }`}
        >
          Semua Kategori
        </button>

        {DUA_CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.iconName] || BookOpen;
          const isActive = selectedCatId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dua Cards List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const currentCount = itemCounts[item.id] || 0;
          const targetRep = item.repetition || 1;
          const isDone = currentCount >= targetRep;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Sumber: {item.source}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(item)}
                    title="Salin Doa"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="text-right py-1">
                <p className="font-arabic text-xl sm:text-2xl text-stone-950 dark:text-stone-100 leading-loose">
                  {item.arabic}
                </p>
              </div>

              {/* Latin */}
              {item.latin && (
                <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                  {item.latin}
                </p>
              )}

              {/* Indonesian Meaning */}
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                "{item.translation}"
              </p>

              {/* Virtue if present */}
              {item.virtue && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300">
                  <span className="font-bold">Keutamaan: </span>
                  {item.virtue}
                </div>
              )}

              {/* Counter Action if repetition > 1 */}
              {targetRep > 1 && (
                <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    Dibaca: <strong className="text-stone-900 dark:text-white tabular-nums">{currentCount}</strong> / {targetRep} kali
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResetCount(item.id)}
                      className="p-1.5 text-xs text-stone-400 hover:text-stone-600"
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCountClick(item.id, targetRep)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Selesai' : 'Hitung (+1)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-500">
            Tidak ada doa yang cocok dengan pencarian "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
