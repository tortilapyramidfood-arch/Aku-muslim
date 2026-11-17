import React, { useState, useEffect } from 'react';
import {
  HIJAIYAH_AUDIO_CATALOG,
  HijaiyahAudioItem,
} from '../../data/hijaiyahAudioCatalog';
import { humanAudioService, AudioVariant } from '../../services/humanAudioService';
import {
  Volume2,
  RotateCcw,
  ShieldCheck,
  Award,
  BookOpen,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRightLeft,
  X,
  AlertCircle,
  Square,
} from 'lucide-react';

export const HijaiyahMakhrajModule: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<HijaiyahAudioItem>(HIJAIYAH_AUDIO_CATALOG[0]);
  const [selectedMakhrajFilter, setSelectedMakhrajFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayingVariant, setCurrentPlayingVariant] = useState<AudioVariant | null>(null);
  const [playbackMessage, setPlaybackMessage] = useState<string>('Pilih huruf untuk mendengarkan bacaan qari bersanad');
  const [isNoticeVisible, setIsNoticeVisible] = useState<boolean>(true);

  // Subscribe to audio service status
  useEffect(() => {
    const unsubscribe = humanAudioService.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentPlayingVariant(state.currentVariant);
      if (state.statusMessage) {
        setPlaybackMessage(state.statusMessage);
      }
    });

    return () => {
      unsubscribe();
      humanAudioService.stopAllAudio();
    };
  }, []);

  const handlePlayVariant = async (variant: AudioVariant) => {
    const result = await humanAudioService.playHijaiyahAudio(selectedLetter.letter_id, variant);
    setPlaybackMessage(result.message);
  };

  const handleStopAudio = () => {
    humanAudioService.stopAllAudio();
    setPlaybackMessage('Audio dihentikan');
  };

  const filteredLetters = HIJAIYAH_AUDIO_CATALOG.filter((letter) => {
    const matchesMakhraj = selectedMakhrajFilter === 'ALL' || letter.makhraj_category === selectedMakhrajFilter;
    const matchesSearch =
      letter.latin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.arabic_letter.includes(searchQuery) ||
      letter.transliteration.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMakhraj && matchesSearch;
  });

  const makhrajCategories = [
    { id: 'ALL', label: 'Semua (29 Huruf)' },
    { id: 'Al-Jauf', label: 'Al-Jauf (Rongga Mulut)' },
    { id: 'Al-Halq', label: 'Al-Halq (Tenggorokan)' },
    { id: 'Al-Lisan', label: 'Al-Lisan (Lidah)' },
    { id: 'Asy-Syafatain', label: 'Asy-Syafatain (Bibir)' },
  ];

  return (
    <div className="space-y-6">
      {/* Syariah & Owner Guarantee Banner */}
      {isNoticeVisible && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-white relative">
          <button
            onClick={() => setIsNoticeVisible(false)}
            className="absolute top-3 right-3 text-emerald-300 hover:text-white"
            title="Tutup pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Keputusan Syariah & Owner
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  Status Rekaman: Menunggu Verifikasi
                </span>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed">
                Pembelajaran makharijul huruf mengutamakan rekaman manusia asli bersanad (kandidat: Ustadz Muhammad Ridwan Al-Hafizh). Bebas suara AI dan TTS browser. File fisik rekaman saat ini berstatus menanti verifikasi izin & ketersediaan studio; sistem menampilkan status "Audio belum tersedia" secara transparan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Letters Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {makhrajCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedMakhrajFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedMakhrajFilter === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Cari huruf (misal: Ba, Kaf, ق)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-56 px-3.5 py-1.5 rounded-xl text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:border-emerald-500"
        />
      </div>

      {/* Main Studio View: Responsive Grid (4 cols mobile, 7 cols tablet/desktop) */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3">
        {filteredLetters.map((letter) => {
          const isSelected = selectedLetter.letter_id === letter.letter_id;
          return (
            <button
              key={letter.letter_id}
              onClick={() => {
                setSelectedLetter(letter);
                humanAudioService.playHijaiyahAudio(letter.letter_id, 'name');
              }}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between relative group ${
                isSelected
                  ? 'bg-gradient-to-b from-emerald-700 to-teal-800 text-white border-emerald-500 shadow-md scale-102 ring-2 ring-emerald-400/50'
                  : 'bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700/80 text-stone-900 dark:text-white hover:border-emerald-500 hover:shadow-xs'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 self-start">
                #{letter.letter_id}
              </span>
              <span className="font-arabic text-4xl sm:text-5xl font-bold my-1 text-amber-500 dark:text-amber-300 group-hover:scale-110 transition-transform">
                {letter.arabic_letter}
              </span>
              <span className={`text-xs font-bold truncate max-w-full ${isSelected ? 'text-white' : 'text-stone-700 dark:text-stone-300'}`}>
                {letter.latin_name}
              </span>
              <span className={`text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-emerald-100' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'}`}>
                {letter.makhraj_category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Letter Detail Studio */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white border border-stone-800 shadow-xl space-y-5">
        {/* Top Header letter info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center font-arabic text-5xl sm:text-6xl text-amber-300 shadow-inner shrink-0">
              {selectedLetter.arabic_letter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wide uppercase">
                  {selectedLetter.makhraj_category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  Huruf ke-{selectedLetter.letter_id}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                {selectedLetter.latin_name} ({selectedLetter.transliteration})
              </h2>
              <p className="text-xs text-stone-300 mt-1 max-w-xl">
                {selectedLetter.makhraj_description}
              </p>
            </div>
          </div>

          {/* Quick stop/replay & status */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <button
                  onClick={handleStopAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Hentikan</span>
                </button>
              )}
              <button
                onClick={() => handlePlayVariant('name')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 text-xs font-black shadow-md hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Nama</span>
              </button>
            </div>
            <span className="text-[11px] text-stone-400 max-w-xs text-right truncate">
              {playbackMessage}
            </span>
          </div>
        </div>

        {/* 6 Human Audio Playback Buttons */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>Pilih Bunyi Huruf (Rekaman Asli Ustadz Bersanad):</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Nama Huruf */}
            <button
              onClick={() => handlePlayVariant('name')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                currentPlayingVariant === 'name' && isPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                  : 'bg-stone-800/80 border-stone-700 hover:border-amber-400/60'
              }`}
            >
              <span className="text-[10px] text-stone-400 block font-semibold">1. Nama Huruf</span>
              <span className="font-arabic text-2xl text-amber-300 font-bold block my-1">{selectedLetter.arabic_letter}</span>
              <span className="text-xs font-bold block truncate">{selectedLetter.latin_name}</span>
            </button>

            {/* 2. Fathah */}
            <button
              onClick={() => handlePlayVariant('fathah')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                currentPlayingVariant === 'fathah' && isPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                  : 'bg-stone-800/80 border-stone-700 hover:border-amber-400/60'
              }`}
            >
              <span className="text-[10px] text-stone-400 block font-semibold">2. Fathah (َ)</span>
              <span className="font-arabic text-2xl text-emerald-300 font-bold block my-1">
                {selectedLetter.arabic_letter}َ
              </span>
              <span className="text-xs font-bold block truncate">{selectedLetter.fathah_text}</span>
            </button>

            {/* 3. Kasrah */}
            <button
              onClick={() => handlePlayVariant('kasrah')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                currentPlayingVariant === 'kasrah' && isPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                  : 'bg-stone-800/80 border-stone-700 hover:border-amber-400/60'
              }`}
            >
              <span className="text-[10px] text-stone-400 block font-semibold">3. Kasrah (ِ)</span>
              <span className="font-arabic text-2xl text-cyan-300 font-bold block my-1">
                {selectedLetter.arabic_letter}ِ
              </span>
              <span className="text-xs font-bold block truncate">{selectedLetter.kasrah_text}</span>
            </button>

            {/* 4. Dhammah */}
            <button
              onClick={() => handlePlayVariant('dhammah')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                currentPlayingVariant === 'dhammah' && isPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                  : 'bg-stone-800/80 border-stone-700 hover:border-amber-400/60'
              }`}
            >
              <span className="text-[10px] text-stone-400 block font-semibold">4. Dhammah (ُ)</span>
              <span className="font-arabic text-2xl text-fuchsia-300 font-bold block my-1">
                {selectedLetter.arabic_letter}ُ
              </span>
              <span className="text-xs font-bold block truncate">{selectedLetter.dhammah_text}</span>
            </button>

            {/* 5. Sukun */}
            <button
              onClick={() => handlePlayVariant('sukun')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                currentPlayingVariant === 'sukun' && isPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                  : 'bg-stone-800/80 border-stone-700 hover:border-amber-400/60'
              }`}
            >
              <span className="text-[10px] text-stone-400 block font-semibold">5. Sukun Mati (ْ)</span>
              <span className="font-arabic text-xl text-blue-300 font-bold block my-1">
                {selectedLetter.sukun_example_text.split(' ')[0]}
              </span>
              <span className="text-xs font-bold block truncate">{selectedLetter.sukun_example_text}</span>
            </button>

            {/* 6. Contoh Al-Qur'an */}
            <button
              onClick={() => handlePlayVariant('quran')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                currentPlayingVariant === 'quran' && isPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                  : 'bg-stone-800/80 border-stone-700 hover:border-amber-400/60'
              }`}
            >
              <span className="text-[10px] text-stone-400 block font-semibold">6. Contoh Al-Qur'an</span>
              <span className="font-arabic text-xl text-amber-200 font-bold block my-1">
                {selectedLetter.quran_example_arabic}
              </span>
              <span className="text-xs font-bold block truncate">{selectedLetter.quran_example_latin}</span>
            </button>
          </div>
        </div>

        {/* Similar Letter Comparison Box & Pedagogical Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Comparison */}
          <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-700/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Perbandingan Huruf Serupa: {selectedLetter.arabic_letter} vs {selectedLetter.similar_letter_comparison.pairArabic}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-arabic font-bold text-amber-300">
                {selectedLetter.arabic_letter} ↔ {selectedLetter.similar_letter_comparison.pairArabic}
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                <strong>Perbedaan:</strong> {selectedLetter.similar_letter_comparison.difference}
              </p>
            </div>
          </div>

          {/* Sifat Huruf & Pedagogical Note */}
          <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-700/80 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
              Sifat-Sifat Huruf:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedLetter.sifat_huruf.map((sifat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30"
                >
                  {sifat}
                </span>
              ))}
            </div>
            {selectedLetter.special_pedagogical_note && (
              <p className="text-[11px] text-amber-200/90 pt-1 leading-snug">
                💡 <strong>Catatan Pedagogis:</strong> {selectedLetter.special_pedagogical_note}
              </p>
            )}
          </div>
        </div>

        {/* Provenance & Legal Rights Card */}
        <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-stone-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Qari: <strong className="text-stone-200">{selectedLetter.narrator_name}</strong> ({selectedLetter.narrator_credentials})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[10px]">
              {selectedLetter.review_status}
            </span>
            <span className="text-stone-500 font-mono text-[10px]">
              Versi: {selectedLetter.audio_version}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
