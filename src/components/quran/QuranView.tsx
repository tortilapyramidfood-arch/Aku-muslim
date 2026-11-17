import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SURAH_LIST } from '../../data/surahList';
import { JUZ_LIST } from '../../data/juzList';
import { fetchSurahVerses } from '../../data/quranSampleVerses';
import { Ayah, SurahMeta } from '../../types';
import { quranPlayer, PlayerState } from '../../services/quranPlayerController';
import { OfflineAudioDownloadModal } from './OfflineAudioDownloadModal';
import { MushafPhysicalPageView } from './MushafPhysicalPageView';
import { IqraInteractiveModule } from '../learning/IqraInteractiveModule';
import { IQRA_CURRICULUM } from '../../data/iqraCurriculumData';
import { findPageForAyah } from '../../data/mushafPageMapping';
import {
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  Square,
  ArrowLeft,
  Type,
  Share2,
  Check,
  Sparkles,
  Download,
  Volume2,
  HardDrive,
  Layers,
  ListMusic,
  Smile,
  ArrowRight,
  GraduationCap,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export const QuranView: React.FC = () => {
  const {
    mode,
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    lastRead,
    updateLastRead,
  } = useApp();

  const [mainQuranTab, setMainQuranTab] = useState<'mushaf_fisik' | 'daftar_surah'>('mushaf_fisik');
  const [targetPhysicalPage, setTargetPhysicalPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogTab, setCatalogTab] = useState<'surah' | 'juz'>('surah');
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [verses, setVerses] = useState<Ayah[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadModalTab, setDownloadModalTab] = useState<'unduh_surah' | 'unduh_juz'>('unduh_surah');
  const [downloadModalJuz, setDownloadModalJuz] = useState<number>(30);
  const [playerState, setPlayerState] = useState<PlayerState>(quranPlayer.getState());

  // Mode Anak: Active Iqra & Juz Amma sub-view states
  const [activeChildIqraJilid, setActiveChildIqraJilid] = useState<number | null>(null);
  const [showChildStandardMushaf, setShowChildStandardMushaf] = useState<boolean>(false);
  const [showChildJuzAmma, setShowChildJuzAmma] = useState<boolean>(false);

  // Iqra last progress from storage
  const [lastIqraProgress, setLastIqraProgress] = useState<{ jilid: number; lesson: number }>({
    jilid: 1,
    lesson: 1,
  });

  useEffect(() => {
    const savedJilid = localStorage.getItem('akumuslim_iqra_last_jilid');
    const savedLesson = localStorage.getItem('akumuslim_iqra_last_lesson');
    if (savedJilid || savedLesson) {
      setLastIqraProgress({
        jilid: savedJilid ? parseInt(savedJilid, 10) : 1,
        lesson: savedLesson ? parseInt(savedLesson, 10) : 1,
      });
    }

    const handleProgressUpdate = (e: Event) => {
      const customEv = e as CustomEvent<{ jilid: number; lesson: number }>;
      if (customEv.detail?.jilid && customEv.detail?.lesson) {
        setLastIqraProgress({
          jilid: customEv.detail.jilid,
          lesson: customEv.detail.lesson,
        });
      }
    };

    window.addEventListener('akumuslim_iqra_progress', handleProgressUpdate);
    return () => window.removeEventListener('akumuslim_iqra_progress', handleProgressUpdate);
  }, [activeChildIqraJilid, showChildStandardMushaf]);

  useEffect(() => {
    const unsub = quranPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsub();
  }, []);

  // Font size state (Normal, Besar, Sangat Besar)
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Filter surahs by number, latin name, or translation
  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.nameLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery.trim() ||
      s.nameArabic.includes(searchQuery.trim())
  );

  // Load verses when a Surah is clicked
  useEffect(() => {
    if (!selectedSurah) return;
    let isMounted = true;
    setLoadingVerses(true);

    fetchSurahVerses(selectedSurah.number).then((data) => {
      if (isMounted) {
        setVerses(data);
        setLoadingVerses(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurah]);

  const handleSelectSurah = (surah: SurahMeta) => {
    setSelectedSurah(surah);
    setTargetPhysicalPage(findPageForAyah(surah.number, 1));
    updateLastRead(surah.number, surah.nameLatin, 1);
  };

  const handlePlayAyah = (ayahNumber: number) => {
    if (!selectedSurah) return;

    const isThisPlaying =
      playerState.isPlaying &&
      playerState.surahNumber === selectedSurah.number &&
      playerState.ayahNumber === ayahNumber;

    if (isThisPlaying) {
      quranPlayer.pause();
    } else {
      quranPlayer.playAyah(selectedSurah.number, ayahNumber, selectedSurah.nameLatin, selectedSurah.numberOfAyahs);
    }
  };

  const handlePlayFullSurah = () => {
    if (!selectedSurah) return;
    quranPlayer.playFullSurah(selectedSurah.number, selectedSurah.nameLatin, selectedSurah.numberOfAyahs);
  };

  const handleCopyAyah = (ayah: Ayah) => {
    if (!selectedSurah) return;
    const text = `${selectedSurah.nameLatin} (${selectedSurah.number}:${ayah.numberInSurah})\n\n${ayah.textArabic}\n\n${ayah.textTranslation}`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const arabicFontSizeClass =
    fontScale === 'xlarge'
      ? 'text-3xl leading-[2.6]'
      : fontScale === 'large'
      ? 'text-2xl leading-[2.3]'
      : 'text-xl leading-[2.1]';

  // =========================================================================
  // TAHAP 7.4 REVISI: MODE ANAK PADA TAB AL-QUR'AN
  // =========================================================================
  if (mode === 'anak' && !showChildStandardMushaf) {
    if (activeChildIqraJilid !== null) {
      return (
        <div className="space-y-4 pb-12">
          {/* Back bar */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setActiveChildIqraJilid(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs sm:text-sm shadow-xs hover:border-emerald-500 active:scale-98 transition-all min-h-[48px]"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Kembali ke Al-Qur'an Anak</span>
            </button>

            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
              IQRA JILID 0{activeChildIqraJilid}
            </span>
          </div>

          <IqraInteractiveModule
            initialJilidNumber={activeChildIqraJilid}
            initialLessonNumber={activeChildIqraJilid === lastIqraProgress.jilid ? lastIqraProgress.lesson : 1}
            onBackToParent={() => setActiveChildIqraJilid(null)}
            onPageChange={(jilid, lesson) => {
              setLastIqraProgress({ jilid, lesson });
            }}
          />
        </div>
      );
    }

    if (showChildJuzAmma) {
      const juzAmmaSurahs = SURAH_LIST.filter((s) => s.number >= 78 && s.number <= 114);
      return (
        <div className="space-y-4 pb-12">
          {/* Back bar */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setShowChildJuzAmma(false)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs sm:text-sm shadow-xs hover:border-emerald-500 active:scale-98 transition-all min-h-[48px]"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Kembali ke Al-Qur'an Anak</span>
            </button>

            <span className="text-xs sm:text-sm font-black text-teal-600 dark:text-teal-400 font-mono">
              37 SURAH JUZ 30
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-800 to-emerald-900 text-white shadow-lg space-y-1">
            <h2 className="text-xl sm:text-2xl font-black">Juz 'Amma Anak</h2>
            <p className="text-xs sm:text-sm text-teal-100">
              37 surah pendek (Surah 78 An-Naba' s/d 114 An-Nas) dengan audio qari manusia asli
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {juzAmmaSurahs.map((surah) => (
              <div
                key={surah.number}
                className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 shadow-xs flex items-center justify-between gap-3 transition-all"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    setSelectedSurah(surah);
                    setShowChildStandardMushaf(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                    {surah.number}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {surah.nameLatin}
                    </h4>
                    <span className="text-[11px] text-stone-400 block">
                      {surah.numberOfAyahs} Ayat · {surah.revelationType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-arabic text-xl text-emerald-800 dark:text-emerald-300">
                    {surah.nameArabic}
                  </span>
                  <button
                    onClick={() => {
                      quranPlayer.playFullSurah(surah.number, surah.nameLatin, surah.numberOfAyahs);
                    }}
                    className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Putar Audio Qari"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5 pb-14">
        {/* Header Al-Qur'an Anak */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
            <Smile className="w-5 h-5 text-amber-300" />
            <span>MODE ANAK AKTIF</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            AL-QUR'AN ANAK
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-xl mt-1">
            Belajar membaca Al-Qur'an dengan ceria, bertahap, dan menyenangkan menggunakan rekaman suara manusia asli.
          </p>
        </div>

        {/* 1. JALAN PINTAS UTAMA: JUZ AMMA ANAK (SURAH 78–114) */}
        <div
          onClick={() => setShowChildJuzAmma(true)}
          className="w-full p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-950 text-white border-2 border-teal-400/60 shadow-xl hover:shadow-2xl active:scale-[0.99] cursor-pointer transition-all relative overflow-hidden group min-h-[140px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/40 text-teal-200 flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                🕌
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-200 text-[10px] font-mono font-black tracking-wider uppercase">
                  Hafalan & Murottal Khusus Anak
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  JUZ AMMA ANAK (SURAH 78–114)
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl leading-relaxed">
                  37 surah pendek Juz 30 lengkap dengan rekaman audio tilawah qari manusia asli yang jelas, bertahap, dan ramah anak.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
              <span className="text-xs font-bold text-amber-300">
                37 Surah Juz 30
              </span>
              <div className="px-4 py-2 rounded-2xl bg-amber-400 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
                <span>Buka Juz 'Amma</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. PILIHAN SURAH PENDEK FAVORIT SANTRI CILIK */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Surah Pendek Favorit Santri Cilik:
            </h3>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Sentuh untuk mendengarkan & membaca
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {[
              { number: 1, nameLatin: 'Al-Fatihah', nameArabic: 'الفاتحة', numberOfAyahs: 7 },
              { number: 112, nameLatin: 'Al-Ikhlas', nameArabic: 'الإخلاص', numberOfAyahs: 4 },
              { number: 113, nameLatin: 'Al-Falaq', nameArabic: 'الفلق', numberOfAyahs: 5 },
              { number: 114, nameLatin: 'An-Nas', nameArabic: 'الناس', numberOfAyahs: 6 },
              { number: 108, nameLatin: 'Al-Kautsar', nameArabic: 'الكوثر', numberOfAyahs: 3 },
              { number: 110, nameLatin: 'An-Nasr', nameArabic: 'النصر', numberOfAyahs: 3 },
              { number: 109, nameLatin: 'Al-Kafirun', nameArabic: 'الكافرون', numberOfAyahs: 6 },
              { number: 103, nameLatin: "Al-'Ashr", nameArabic: 'العصر', numberOfAyahs: 3 },
            ].map((s) => {
              const surahMeta = SURAH_LIST.find((item) => item.number === s.number) || {
                number: s.number,
                nameArabic: s.nameArabic,
                nameLatin: s.nameLatin,
                nameTranslation: '',
                revelationType: 'Makkiyah' as const,
                numberOfAyahs: s.numberOfAyahs,
                juzNumber: s.number === 1 ? 1 : 30,
              };

              return (
                <div
                  key={s.number}
                  onClick={() => {
                    setSelectedSurah(surahMeta);
                    setShowChildStandardMushaf(true);
                    setMainQuranTab('daftar_surah');
                  }}
                  className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between min-h-[94px] group active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      #{s.number}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        quranPlayer.playFullSurah(s.number, s.nameLatin, s.numberOfAyahs);
                      }}
                      className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-xs transition-colors"
                      title="Putar Qari"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="my-1">
                    <span className="font-arabic text-lg font-bold text-emerald-900 dark:text-emerald-300 block leading-normal">
                      {s.nameArabic}
                    </span>
                    <h4 className="text-xs font-black text-stone-900 dark:text-white leading-tight">
                      {s.nameLatin}
                    </h4>
                  </div>

                  <div className="pt-1 border-t border-stone-100 dark:border-stone-700/80 flex items-center justify-between text-[11px] text-stone-400">
                    <span>{s.numberOfAyahs} Ayat</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline">Baca →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. FITUR PENDUKUNG: Baca Al-Qur'an & Dengarkan Qari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Baca Al-Qur'an 30 Juz */}
          <div
            onClick={() => setShowChildStandardMushaf(true)}
            className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs hover:border-emerald-500 cursor-pointer active:scale-98 transition-all flex items-center justify-between gap-3 min-h-[72px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 font-bold block">Tadarus Mushaf:</span>
                <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white">
                  Baca Seluruh Mushaf 30 Juz
                </h4>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
          </div>

          {/* Dengarkan Qari */}
          <div
            onClick={() => {
              setShowChildStandardMushaf(true);
              setMainQuranTab('daftar_surah');
            }}
            className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs hover:border-emerald-500 cursor-pointer active:scale-98 transition-all flex items-center justify-between gap-3 min-h-[72px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 font-bold block">Audio Murottal:</span>
                <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white">
                  Dengarkan Qari Asli 114 Surah
                </h4>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STANDARD VIEW (MODE UMUM & MODE LANSIA) — MUSHAF FISIK 604 HALAMAN
  // =========================================================================
  return (
    <div className="space-y-4 pb-14">
      {/* Return button if child toggled standard mushaf */}
      {mode === 'anak' && showChildStandardMushaf && (
        <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
          <button
            onClick={() => setShowChildStandardMushaf(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-xs shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama Al-Qur'an Anak</span>
          </button>
          <span className="text-xs font-bold text-stone-400">Mushaf Al-Qur'an</span>
        </div>
      )}

      {/* 1. MUSHAF SATU HALAMAN FISIK (DEFAULT UTAMA OWNER) */}
      {mainQuranTab === 'mushaf_fisik' ? (
        <MushafPhysicalPageView
          initialPage={targetPhysicalPage}
          onSwitchToListMode={(surahNum) => {
            if (surahNum) {
              const s = SURAH_LIST.find((item) => item.number === surahNum);
              if (s) setSelectedSurah(s);
            }
            setMainQuranTab('daftar_surah');
          }}
          bookmarks={bookmarks}
          onToggleBookmark={(sNum, aNum, sName) => {
            const found = bookmarks.find((b) => b.surahNumber === sNum && b.ayahNumber === aNum);
            if (found) {
              removeBookmark(found.id);
            } else {
              addBookmark(sNum, sName, aNum);
            }
          }}
          onUpdateLastRead={(sNum, sName, aNum) => {
            updateLastRead(sNum, sName, aNum);
          }}
        />
      ) : selectedSurah ? (
        <div className="space-y-4">
          {/* Compact Top Bar inside Surah View (no duplicate title) */}
          <div className="sticky top-14 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md py-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedSurah(null)}
                className="flex items-center gap-1 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-emerald-700 px-2.5 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[42px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Daftar</span>
              </button>
              <button
                onClick={() => setMainQuranTab('mushaf_fisik')}
                className="flex items-center gap-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2.5 py-2 rounded-xl hover:bg-emerald-100 min-h-[42px]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mushaf</span>
              </button>
            </div>

            {/* Font scale toggles */}
            <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 shrink-0">
              <button
                onClick={() => setFontScale('normal')}
                title="Ukuran Normal"
                className={`px-2 py-1 text-xs font-bold rounded-lg min-h-[36px] ${
                  fontScale === 'normal' ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'text-stone-500'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontScale('large')}
                title="Ukuran Besar"
                className={`px-2 py-1 text-sm font-bold rounded-lg min-h-[36px] ${
                  fontScale === 'large' ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'text-stone-500'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontScale('xlarge')}
                title="Ukuran Sangat Besar"
                className={`px-2 py-1 text-base font-bold rounded-lg min-h-[36px] ${
                  fontScale === 'xlarge' ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'text-stone-500'
                }`}
              >
                A++
              </button>
            </div>
          </div>

          {/* Streamlined Single-line Horizontal Surah Header (44-52px height) */}
          <div className="space-y-1.5">
            <div
              data-testid="quran-surah-header"
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between gap-2 shadow-xs min-h-[44px] sm:min-h-[48px]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded-md bg-white/15 shrink-0">
                  {selectedSurah.number}
                </span>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {selectedSurah.nameLatin}
                  </span>
                  <span className="text-[10px] text-emerald-200 hidden sm:inline shrink-0">
                    · {selectedSurah.revelationType} · {selectedSurah.numberOfAyahs} Ayat
                  </span>
                </div>
              </div>

              <span className="font-arabic text-lg sm:text-xl font-bold text-amber-300 leading-normal shrink-0">
                سُورَةُ {selectedSurah.nameArabic}
              </span>
            </div>

            {/* Bismillah: Slim, elegant Mushaf typography */}
            {selectedSurah.number !== 9 && selectedSurah.number !== 1 && (
              <div className="text-center py-1 font-arabic text-xl sm:text-2xl text-stone-800 dark:text-stone-200 opacity-90 leading-loose">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}
          </div>

          {/* Surah Audio Action Bar: Play Full Surah & Download Offline */}
          <div className="p-3.5 bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayFullSurah}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs min-h-[44px]"
              >
                {playerState.isPlaying && playerState.surahNumber === selectedSurah.number ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Jeda Audio Surah</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Putar 1 Surah Penuh</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-700 dark:text-stone-200 font-bold transition-all min-h-[44px]"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Unduh Audio Offline</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Qari: <strong>{playerState.qari.name.split(' ')[1] || playerState.qari.name}</strong></span>
            </div>
          </div>

          {/* Verses List */}
          {loadingVerses ? (
            <div className="py-16 text-center text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Memuat ayat Al-Qur'an terverifikasi...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {verses.map((ayah) => {
                const bookmarked = isBookmarked(selectedSurah.number, ayah.numberInSurah);
                const isPlaying =
                  playerState.isPlaying &&
                  playerState.surahNumber === selectedSurah.number &&
                  playerState.ayahNumber === ayah.numberInSurah;

                return (
                  <div
                    key={`quran_ayah_${selectedSurah.number}_${ayah.numberInSurah}`}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      isPlaying
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/50 shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700/80'
                    }`}
                  >
                    {/* Ayah Action Bar */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-700/60">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                          {ayah.numberInSurah}
                        </span>
                        <span className="text-xs text-stone-400">
                          {selectedSurah.number}:{ayah.numberInSurah}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Audio Murottal button */}
                        <button
                          onClick={() => handlePlayAyah(ayah.numberInSurah)}
                          title={isPlaying ? 'Hentikan Audio' : 'Dengar Murottal'}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 min-h-[40px] min-w-[40px] justify-center ${
                            isPlaying
                              ? 'bg-amber-400 text-stone-900'
                              : 'text-stone-500 hover:text-emerald-700 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                          }`}
                        >
                          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4" />}
                        </button>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => {
                            if (bookmarked) {
                              const found = bookmarks.find(
                                (b) => b.surahNumber === selectedSurah.number && b.ayahNumber === ayah.numberInSurah
                              );
                              if (found) removeBookmark(found.id);
                            } else {
                              addBookmark(selectedSurah.number, selectedSurah.nameLatin, ayah.numberInSurah);
                            }
                          }}
                          title={bookmarked ? 'Hapus Bookmark' : 'Tandai Ayat'}
                          className="p-2 rounded-xl text-stone-500 hover:text-emerald-700 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600/20" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        {/* Copy / Share Button */}
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          title="Salin Ayat"
                          className="p-2 rounded-xl text-stone-500 hover:text-emerald-700 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                          {copiedAyah === ayah.numberInSurah ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div className="text-right py-2">
                      <p className={`font-arabic text-stone-950 dark:text-stone-50 ${arabicFontSizeClass}`}>
                        {ayah.textArabic}
                      </p>
                    </div>

                    {/* Latin transliteration */}
                    {ayah.textLatin && (
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 italic pt-2">
                        {ayah.textLatin}
                      </p>
                    )}

                    {/* Indonesian Translation */}
                    <p className="text-xs sm:text-base text-stone-800 dark:text-stone-200 font-medium pt-1.5 leading-relaxed">
                      {ayah.textTranslation}
                    </p>

                    {/* Tafsir Summary if available */}
                    {ayah.tafsirSummary && (
                      <div className="mt-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400">Tafsir Ringkas: </span>
                        {ayah.tafsirSummary}
                      </div>
                    )}
                  </div>
                );
              })}

              <p className="text-[11px] text-stone-400 text-center pt-2">
                Sumber Teks & Terjemahan: LPMQ Kementerian Agama RI · Pembaruan 2026
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Full 114 Surah Catalog */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                Al-Qur'an Digital 30 Juz
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                114 Surah lengkap dengan teks Arab Uthmani, terjemahan Kemenag RI, dan audio murottal.
              </p>
            </div>

            {/* Quick action buttons: Mushaf Fisik, Last Read & Offline Storage */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setMainQuranTab('mushaf_fisik')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:from-emerald-600 hover:to-teal-700 min-h-[44px]"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Buka Mushaf 1 Halaman (Fisik)</span>
              </button>

              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 min-h-[44px]"
              >
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>Audio Offline</span>
              </button>

              <button
                onClick={() => {
                  const s = SURAH_LIST.find((item) => item.number === lastRead.surahNumber);
                  if (s) handleSelectSurah(s);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 min-h-[44px]"
              >
                <Bookmark className="w-4 h-4" />
                <span>Lanjut: {lastRead.surahName} ({lastRead.ayahNumber})</span>
              </button>
            </div>
          </div>

          {/* Catalog View Toggle (Surah vs 30 Juz) */}
          <div className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-2xl">
            <button
              onClick={() => setCatalogTab('surah')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all min-h-[44px] ${
                catalogTab === 'surah'
                  ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Daftar 114 Surah</span>
            </button>
            <button
              onClick={() => setCatalogTab('juz')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all min-h-[44px] ${
                catalogTab === 'juz'
                  ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Daftar 30 Juz (Lengkap)</span>
            </button>
          </div>

          {/* VIEW A: Surah List (114 Surahs) */}
          {catalogTab === 'surah' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari surah (contoh: Yasin, Al-Mulk, Al-Fatihah, atau nomor 36)..."
                  className="w-full pl-12 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[48px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 px-2 py-1"
                  >
                    Bersihkan
                  </button>
                )}
              </div>

              {/* Surah List Table / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSelectSurah(surah)}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center justify-between group min-h-[68px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {surah.number}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                          {surah.nameLatin}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {surah.nameTranslation} · {surah.numberOfAyahs} Ayat
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="font-arabic text-lg text-emerald-900 dark:text-emerald-300 font-bold block leading-normal">
                        {surah.nameArabic}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {surah.revelationType}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {filteredSurahs.length === 0 && (
                <div className="py-12 text-center text-xs sm:text-sm text-stone-500">
                  Tidak ada surah yang cocok dengan "{searchQuery}".
                </div>
              )}
            </div>
          )}

          {/* VIEW B: 30 Juz Catalog with Full Juz Playback */}
          {catalogTab === 'juz' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {JUZ_LIST.map((juz) => {
                const isThisJuzPlaying =
                  playerState.isPlaying && playerState.activeJuzNumber === juz.juzNumber;

                return (
                  <div
                    key={juz.juzNumber}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      isThisJuzPlaying
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between pb-2 border-b border-stone-100 dark:border-stone-700/60">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-black text-xs sm:text-sm flex items-center justify-center">
                          {juz.juzNumber}
                        </span>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                            Juz {juz.juzNumber}: {juz.nameLatin}
                          </h3>
                          <span className="text-xs text-stone-400 block mt-0.5">
                            {juz.startSurahName} ({juz.startAyah}) s/d {juz.endSurahName} ({juz.endAyah})
                          </span>
                        </div>
                      </div>

                      <span className="font-arabic text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                        {juz.nameArabic}
                      </span>
                    </div>

                    {/* Surahs in this Juz */}
                    <div className="py-2.5 flex flex-wrap gap-1.5">
                      {juz.includedSurahNumbers.slice(0, 5).map((num) => {
                        const s = SURAH_LIST.find((item) => item.number === num);
                        if (!s) return null;
                        return (
                          <button
                            key={num}
                            onClick={() => handleSelectSurah(s)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-800 text-xs font-semibold text-stone-600 dark:text-stone-300 transition-colors"
                          >
                            {s.number}. {s.nameLatin}
                          </button>
                        );
                      })}
                      {juz.includedSurahNumbers.length > 5 && (
                        <span className="text-xs text-stone-400 self-center">
                          +{juz.includedSurahNumbers.length - 5} surah lainnya
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (isThisJuzPlaying) {
                            quranPlayer.pause();
                          } else {
                            quranPlayer.playFullJuz(juz.juzNumber);
                          }
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                          isThisJuzPlaying
                            ? 'bg-amber-500 hover:bg-amber-600 text-stone-900'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {isThisJuzPlaying ? (
                          <>
                            <Square className="w-4 h-4 fill-current" />
                            <span>Jeda Murottal</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>Putar 1 Juz Penuh</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setDownloadModalTab('unduh_juz');
                          setDownloadModalJuz(juz.juzNumber);
                          setShowDownloadModal(true);
                        }}
                        title="Unduh Audio Juz Ini"
                        className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-emerald-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          const s = SURAH_LIST.find((item) => item.number === juz.startSurahNumber);
                          if (s) handleSelectSurah(s);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 min-h-[44px]"
                      >
                        Baca
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Offline Audio Download & Storage Manager Modal */}
      <OfflineAudioDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        activeSurahNumber={selectedSurah ? selectedSurah.number : 1}
        initialTab={downloadModalTab}
        initialJuzNumber={downloadModalJuz}
      />
    </div>
  );
};
