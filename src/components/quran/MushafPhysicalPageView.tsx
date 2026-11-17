import React, { useState, useEffect, useRef } from 'react';
import {
  getMushafPageMeta,
  getMushafPageSurahs,
  findPageForAyah,
  getJuzStartPage,
  MushafPageMeta,
} from '../../data/mushafPageMapping';
import { MUSHAF_THEMES, MushafThemeId } from '../../data/mushafThemes';
import { QARI_LIST, QariInfo, DEFAULT_QARI } from '../../data/qariList';
import { fetchSurahVerses } from '../../data/quranSampleVerses';
import { Ayah } from '../../types';
import { quranPlayer, PlayerState } from '../../services/quranPlayerController';
import { MushafThemeModal } from './MushafThemeModal';
import { QariSelectorModal } from './QariSelectorModal';
import { QuranCoverModal } from './QuranCoverModal';
import {
  QURAN_COVER_TEMPLATES,
  QuranCoverTemplate,
  getQuranCoverTemplate,
  getSavedQuranCoverId,
  saveQuranCoverId,
  isQuranFrameEnabled,
  setQuranFrameEnabled,
} from '../../data/quranCoverTemplates';
import {
  LPMQ_TAJWID_RULES,
  TajwidRuleCategory,
  TajwidRuleDefinition,
} from '../../services/tajwidColorEngine';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Palette,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  Settings,
  Type,
  List,
  Info,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export type QuranReadingMode = 'mushaf_arab' | 'mushaf_terjemahan' | 'daftar_ayat';

interface MushafPhysicalPageViewProps {
  initialPage?: number;
  onSwitchToListMode: (surahNumber?: number) => void;
  bookmarks: Array<{ id: string; surahNumber: number; ayahNumber: number }>;
  onToggleBookmark: (surahNumber: number, ayahNumber: number, surahName: string) => void;
  onUpdateLastRead: (surahNumber: number, surahName: string, ayahNumber: number) => void;
}

export const MushafPhysicalPageView: React.FC<MushafPhysicalPageViewProps> = ({
  initialPage = 1,
  onSwitchToListMode,
  bookmarks,
  onToggleBookmark,
  onUpdateLastRead,
}) => {
  // Page number (1 to 604)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem('akumuslim_mushaf_page');
    return saved ? parseInt(saved, 10) : initialPage;
  });

  // Reading Mode: Default is 'mushaf_arab' (without translation as requested by Owner!)
  const [readingMode, setReadingMode] = useState<QuranReadingMode>(() => {
    const saved = localStorage.getItem('akumuslim_quran_reading_mode') as QuranReadingMode;
    return saved || 'mushaf_arab';
  });

  // Theme: Default is 'mushaf_klasik'
  const [themeId, setThemeId] = useState<MushafThemeId>(() => {
    const saved = localStorage.getItem('akumuslim_mushaf_theme') as MushafThemeId;
    return saved || 'mushaf_klasik';
  });

  // Selected Qari
  const [selectedQari, setSelectedQari] = useState<QariInfo>(() => {
    const savedId = localStorage.getItem('akumuslim_selected_qari');
    return QARI_LIST.find((q) => q.qariId === savedId) || DEFAULT_QARI;
  });

  // Font zoom scale: [A] normal, [A+] large, [A++] xlarge
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>(() => {
    const saved = localStorage.getItem('akumuslim_quran_font_scale');
    return (saved as 'normal' | 'large' | 'xlarge') || 'normal';
  });

  // Tajwid Berwarna toggle (LPMQ Kemenag RI standard)
  const [isTajwidActive, setIsTajwidActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('akumuslim_quran_tajwid_active');
    return saved === 'true';
  });

  // Selected Cover & Frame Template (10 verified templates)
  const [selectedCover, setSelectedCover] = useState<QuranCoverTemplate>(() => {
    return getQuranCoverTemplate(getSavedQuranCoverId());
  });

  const [frameEnabled, setFrameEnabled] = useState<boolean>(() => isQuranFrameEnabled());

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('akumuslim_quran_speed');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [autoFollowPage, setAutoFollowPage] = useState<boolean>(true);

  // Fullscreen Mode, Controls Visibility & Unified Settings Drawer
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsHidden, setControlsHidden] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Modals
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showQariModal, setShowQariModal] = useState<boolean>(false);
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [showTajwidLegendModal, setShowTajwidLegendModal] = useState<boolean>(false);
  const [showNavigationModal, setShowNavigationModal] = useState<boolean>(false);
  const [targetJumpPage, setTargetJumpPage] = useState<string>('');

  // Audio Player State
  const [playerState, setPlayerState] = useState<PlayerState>(quranPlayer.getState());
  const [versesOnPage, setVersesOnPage] = useState<Ayah[]>([]);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(false);

  const activeTheme = MUSHAF_THEMES[themeId] || MUSHAF_THEMES.mushaf_klasik;
  const pageMeta: MushafPageMeta = getMushafPageMeta(currentPage);

  // Track if audio is currently playing on another page
  const currentAudioPage =
    playerState.isPlaying && playerState.surahNumber && playerState.ayahNumber
      ? findPageForAyah(playerState.surahNumber, playerState.ayahNumber)
      : null;

  const isAudioOnDifferentPage =
    currentAudioPage !== null && currentAudioPage !== currentPage;

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('akumuslim_mushaf_page', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('akumuslim_quran_reading_mode', readingMode);
  }, [readingMode]);

  useEffect(() => {
    localStorage.setItem('akumuslim_mushaf_theme', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('akumuslim_quran_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem('akumuslim_quran_tajwid_active', isTajwidActive ? 'true' : 'false');
  }, [isTajwidActive]);

  useEffect(() => {
    localStorage.setItem('akumuslim_selected_qari', selectedQari.qariId);
    quranPlayer.setQari(selectedQari);
  }, [selectedQari]);

  useEffect(() => {
    setQuranFrameEnabled(frameEnabled);
  }, [frameEnabled]);

  useEffect(() => {
    saveQuranCoverId(selectedCover.id);
  }, [selectedCover.id]);

  useEffect(() => {
    localStorage.setItem('akumuslim_quran_speed', playbackSpeed.toString());
  }, [playbackSpeed]);

  // Audio Player subscription & Auto Page Follow
  useEffect(() => {
    const unsub = quranPlayer.subscribe((state) => {
      setPlayerState(state);

      if (autoFollowPage && state.isPlaying && state.surahNumber && state.ayahNumber) {
        const expectedPage = findPageForAyah(state.surahNumber, state.ayahNumber);
        if (expectedPage !== currentPage && expectedPage >= 1 && expectedPage <= 604) {
          setCurrentPage(expectedPage);
        }
      }
    });
    return () => unsub();
  }, [autoFollowPage, currentPage]);

  // Load verses for the current physical page (supporting multi-surah pages like 604)
  useEffect(() => {
    let isMounted = true;
    setLoadingVerses(true);

    const surahsOnPage = getMushafPageSurahs(currentPage);

    Promise.all(
      surahsOnPage.map(async (s) => {
        const data = await fetchSurahVerses(s.surahNumber);
        return data
          .filter((v) => v.numberInSurah >= s.startAyah && v.numberInSurah <= s.endAyah)
          .map((v) => ({
            ...v,
            surahNumber: s.surahNumber,
            surahName: s.surahName,
            surahArabic: s.surahArabic,
          }));
      })
    ).then((results) => {
      if (isMounted) {
        const combined = results.flat();
        if (combined.length > 0) {
          setVersesOnPage(combined);
        } else {
          setVersesOnPage([
            {
              surahNumber: pageMeta.surahNumber,
              surahName: pageMeta.surahName,
              surahArabic: pageMeta.surahArabic,
              numberInSurah: pageMeta.startAyah,
              numberInQuran: pageMeta.startAyah,
              textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
              textLatin: `${pageMeta.surahName} (Ayat ${pageMeta.startAyah}–${pageMeta.endAyah})`,
              textTranslation: `Halaman ${currentPage} memuat surah ${pageMeta.surahName} ayat ${pageMeta.startAyah} sampai ${pageMeta.endAyah}. Sambungkan internet untuk sinkronisasi teks lengkap.`,
              juz: pageMeta.juzNumber,
            },
          ]);
        }
        setLoadingVerses(false);
        onUpdateLastRead(pageMeta.surahNumber, pageMeta.surahName, pageMeta.startAyah);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageMeta.surahNumber, pageMeta.startAyah, pageMeta.endAyah]);

  const handleNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleJumpToPage = (pageNum: number) => {
    const safe = Math.max(1, Math.min(604, pageNum));
    setCurrentPage(safe);
    setShowNavigationModal(false);
  };

  const handlePlayCurrentPage = () => {
    if (versesOnPage.length === 0) return;

    if (playerState.isPlaying && playerState.surahNumber === pageMeta.surahNumber) {
      quranPlayer.pause();
    } else {
      quranPlayer.playAyah(
        pageMeta.surahNumber,
        pageMeta.startAyah,
        pageMeta.surahName,
        pageMeta.totalVersesOnPage
      );
    }
  };

  const handlePlayAyah = (ayahNumber: number, surahNumber?: number) => {
    const targetSurah = surahNumber || pageMeta.surahNumber;
    const isThisPlaying =
      playerState.isPlaying &&
      playerState.surahNumber === targetSurah &&
      playerState.ayahNumber === ayahNumber;

    if (isThisPlaying) {
      quranPlayer.pause();
    } else {
      quranPlayer.playAyah(targetSurah, ayahNumber, pageMeta.surahName, pageMeta.totalVersesOnPage);
    }
  };

  const isAyahBookmarked = (ayahNum: number, surahNumber?: number) => {
    const targetSurah = surahNumber || pageMeta.surahNumber;
    return bookmarks.some((b) => b.surahNumber === targetSurah && b.ayahNumber === ayahNum);
  };

  // Helper untuk mewarnai teks Arab (tajwid) sekaligus menempelkan kata terakhir dengan ornamen akhir ayat
  const renderTajwidToken = (word: string, key: string | number) => {
    if (!isTajwidActive) {
      return <React.Fragment key={key}>{word}</React.Fragment>;
    }
    let wordClass = '';
    if (/[\u0653\u06E4~]/.test(word)) {
      wordClass = 'text-blue-600 dark:text-blue-400 font-bold';
    } else if (/[ن|م]ّ/.test(word)) {
      wordClass = 'text-fuchsia-600 dark:text-fuchsia-400 font-bold';
    } else if (/[قطبجد]ْ/.test(word)) {
      wordClass = 'text-red-600 dark:text-red-400 font-bold';
    } else if (/[\u06E2ۢ]/.test(word) || /نْ\s*ب/.test(word)) {
      wordClass = 'text-cyan-600 dark:text-cyan-400 font-bold';
    } else if (/[\u064B\u064C\u064Dنْ]/.test(word)) {
      wordClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
    }
    return (
      <span key={key} className={wordClass}>
        {word}
      </span>
    );
  };

  const renderTajwidArabicText = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.map((word, wIdx) => (
      <React.Fragment key={wIdx}>
        {renderTajwidToken(word, wIdx)}
        {wIdx < words.length - 1 ? ' ' : ''}
      </React.Fragment>
    ));
  };

  // Pisahkan bagian awal ayat dan kata terakhir agar ornamen nomor ayat selalu menempel pada akhir bacaan
  const renderArabicWithAttachedEndBadge = (
    text: string,
    ayahNumber: number,
    badgeClass: string
  ) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return (
        <span
          className={`inline-flex items-center justify-center font-sans font-bold text-xs mx-1 w-7 h-7 rounded-full align-middle shrink-0 ${badgeClass}`}
        >
          {ayahNumber}
        </span>
      );
    }

    const headWords = words.slice(0, -1);
    const tailWord = words[words.length - 1];

    return (
      <>
        {headWords.length > 0 && (
          <>
            {headWords.map((w, idx) => (
              <React.Fragment key={`h_${idx}`}>
                {renderTajwidToken(w, `t_${idx}`)}{' '}
              </React.Fragment>
            ))}
          </>
        )}
        <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          <span>{renderTajwidToken(tailWord, 'tail')}</span>
          <span
            aria-label={`Ayat ${ayahNumber}`}
            className={`inline-flex items-center justify-center font-sans font-bold text-xs w-7 h-7 rounded-full align-middle shrink-0 ${badgeClass}`}
          >
            {ayahNumber}
          </span>
        </span>
      </>
    );
  };

  const fontSizeClass =
    fontScale === 'xlarge'
      ? 'text-3xl sm:text-4xl leading-[2.6]'
      : fontScale === 'large'
      ? 'text-2xl sm:text-3xl leading-[2.3]'
      : 'text-xl sm:text-2xl leading-[2.1]';

  const showBars = !controlsHidden;

  return (
    <div
      className={`transition-colors duration-300 ${activeTheme.containerBg} ${
        isFullscreen
          ? `fixed inset-0 z-50 overflow-y-auto ${controlsHidden ? 'p-1.5 sm:p-4 pb-10' : 'p-2 sm:p-5 pb-24'} shadow-2xl`
          : 'space-y-4 pb-14'
      }`}
    >
      {/* Floating Control Reveal Button when controls are hidden in Focus Mode */}
      {controlsHidden && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5">
          <button
            onClick={() => setShowSettingsDrawer(true)}
            className="px-3 py-2 rounded-xl bg-stone-900/85 text-white backdrop-blur-md text-xs font-bold shadow-lg flex items-center gap-1.5 min-h-[40px]"
            title="Pengaturan Al-Qur'an"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
          <button
            onClick={() => setControlsHidden(false)}
            className="px-3 py-2 rounded-xl bg-emerald-700/90 text-white backdrop-blur-md text-xs font-bold shadow-lg flex items-center gap-1.5 min-h-[40px]"
            title="Tampilkan Kontrol Layar Baca"
          >
            <Eye className="w-4 h-4" />
            <span>Tampilkan Kontrol</span>
          </button>
        </div>
      )}

      {/* Floating Audio Follow Warning / Re-sync Banner */}
      {showBars && isAudioOnDifferentPage && (
        <div className="p-3 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-pulse shrink-0" />
            <span>Qari sedang membaca di Halaman {currentAudioPage} ({selectedQari.name})</span>
          </div>
          <button
            onClick={() => {
              if (currentAudioPage) setCurrentPage(currentAudioPage);
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-black shadow-xs hover:bg-stone-800 transition-all shrink-0"
          >
            Ikuti Bacaan →
          </button>
        </div>
      )}

      {/* Top Streamlined Toolbar: [Daftar] [Surah & Hal. X/604] [Sembunyikan Kontrol] [Layar Penuh] [Pengaturan Al-Qur'an] */}
      {showBars && (
        <div className="p-2 sm:p-3 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-sm flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Back to Surah List + Surah/Page Indicator */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => onSwitchToListMode(pageMeta.surahNumber)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs transition-all min-h-[42px] shrink-0"
              title="Kembali ke Daftar Surah / Mode List"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Daftar</span>
            </button>

            <button
              onClick={() => setShowNavigationModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 text-stone-900 dark:text-white font-black text-xs hover:border-emerald-500 transition-all min-h-[42px] min-w-0"
              title="Buka Navigasi Halaman & Juz"
            >
              <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[96px] sm:max-w-none">
                {pageMeta.surahName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-mono shrink-0">
                Hal. {currentPage}/604
              </span>
            </button>
          </div>

          {/* Right Group: Focus Hide-Controls and Unified Pengaturan Al-Qur'an */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={() => setControlsHidden(true)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 font-bold text-xs transition-all min-h-[42px]"
              title="Sembunyikan kontrol agar layar baca lebih bersih"
              aria-label="Sembunyikan Kontrol"
            >
              <EyeOff className="w-4 h-4 text-stone-500" />
              <span className="hidden md:inline">Fokus</span>
            </button>

            <button
              onClick={() => setShowSettingsDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold text-xs shadow-xs hover:bg-stone-800 transition-all min-h-[42px]"
              title="Buka Pengaturan Al-Qur'an"
              aria-label="Pengaturan Al-Qur'an"
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Al-Qur'an</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Physical Mushaf Page Frame Container */}
      <div className={`relative mx-auto ${isFullscreen && controlsHidden ? 'max-w-3xl' : 'max-w-2xl'}`}>
        {/* Ornamental Illuminated Frame Backdrop if enabled */}
        {frameEnabled && (
          <div className="pointer-events-none absolute -inset-2 sm:-inset-4 z-0 rounded-3xl overflow-hidden opacity-90">
            <img
              src={selectedCover.assetPath}
              alt="Bingkai Ornamen Islami"
              className="w-full h-full object-fill"
            />
          </div>
        )}

        {/* Mushaf Physical Page Container */}
        <div
          className={`relative z-10 rounded-2xl p-4 sm:p-7 border transition-all ${
            frameEnabled ? 'm-2 sm:m-4 shadow-2xl' : ''
          } ${activeTheme.pageBg} ${activeTheme.pageBorder} ${activeTheme.pageShadow}`}
        >
          {/* Physical Page Meta Row: Juz (Left), Page (Center/Right), Continuation Surah Name */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-300/40 dark:border-stone-700/40 text-xs font-bold">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Juz {pageMeta.juzNumber}
            </span>

            <span className="font-mono text-stone-500 dark:text-stone-400">
              Halaman {pageMeta.pageNumber}
            </span>

            {!pageMeta.isFirstPageOfSurah && (
              <span className="font-arabic text-base sm:text-lg text-amber-700 dark:text-amber-400 font-bold leading-normal">
                سُورَةُ {pageMeta.surahArabic}
              </span>
            )}
          </div>

          {/* Streamlined Single-Line Horizontal Surah Header (44-52px height) */}
          {pageMeta.isFirstPageOfSurah && (
            <div className="mb-3">
              <div
                data-testid="mushaf-surah-header"
                className={`px-3 sm:px-4 py-1.5 rounded-xl border flex items-center justify-between gap-2 shadow-xs ${activeTheme.headerBannerBg} min-h-[44px] sm:min-h-[48px]`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 shrink-0">
                    {pageMeta.surahNumber}
                  </span>
                  <span className="text-xs sm:text-sm font-bold tracking-tight truncate">
                    {pageMeta.surahName}
                  </span>
                </div>

                <span className="font-arabic text-lg sm:text-xl font-bold leading-normal shrink-0">
                  سُورَةُ {pageMeta.surahArabic}
                </span>
              </div>

              {/* Bismillah: Slim, elegant calligraphic row (Surah 1 & 9 excluded) */}
              {pageMeta.surahNumber !== 9 && pageMeta.surahNumber !== 1 && (
                <div className="text-center py-1.5 font-arabic text-xl sm:text-2xl text-stone-800 dark:text-stone-200 opacity-90 leading-loose">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}
            </div>
          )}

          {/* Continuous 15-Line Physical Mushaf Text Flow */}
          {loadingVerses ? (
            <div className="py-20 text-center text-xs sm:text-sm text-stone-400">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Menata halaman fisik Al-Qur'an...</span>
            </div>
          ) : readingMode === 'mushaf_arab' ? (
            /* 1. MUSHAF ARAB (DEFAULT FISIK — TANPA TERJEMAHAN, RATA KANAN BARIS TERAKHIR) */
            <div dir="rtl" className="text-right py-4 rtl-mushaf-flow">
              <p dir="rtl" className={`font-arabic ${fontSizeClass} ${activeTheme.textPrimary} tracking-wide rtl-mushaf-flow`}>
                {versesOnPage.map((ayah, idx) => {
                  const ayahSurah = ayah.surahNumber || pageMeta.surahNumber;
                  const isPlaying =
                    playerState.isPlaying &&
                    playerState.surahNumber === ayahSurah &&
                    playerState.ayahNumber === ayah.numberInSurah;
                  const isSubsequentSurahHeader =
                    ayah.numberInSurah === 1 &&
                    idx > 0 &&
                    ayah.surahNumber &&
                    ayah.surahNumber !== versesOnPage[idx - 1]?.surahNumber;

                  return (
                    <React.Fragment key={`mushaf_frag_p${currentPage}_s${ayahSurah}_a${ayah.numberInSurah}_${idx}`}>
                      {isSubsequentSurahHeader && (
                        <span dir="ltr" className="block my-3 text-center">
                          <span
                            className={`px-3 sm:px-4 py-1.5 rounded-xl border flex items-center justify-between gap-2 shadow-xs ${activeTheme.headerBannerBg} min-h-[44px] sm:min-h-[48px]`}
                          >
                            <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 shrink-0">
                                {ayah.surahNumber}
                              </span>
                              <span className="text-xs sm:text-sm font-bold truncate">
                                {ayah.surahName}
                              </span>
                            </span>
                            <span className="font-arabic text-lg sm:text-xl font-bold leading-normal shrink-0">
                              سُورَةُ {ayah.surahArabic}
                            </span>
                          </span>
                          {ayah.surahNumber !== 9 && (
                            <span className="block text-center py-1.5 font-arabic text-xl sm:text-2xl text-stone-800 dark:text-stone-200 opacity-90 leading-loose">
                              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </span>
                          )}
                        </span>
                      )}
                      <span
                        key={`mushaf_ayah_p${currentPage}_s${ayahSurah}_a${ayah.numberInSurah}_${idx}`}
                        onClick={() => handlePlayAyah(ayah.numberInSurah, ayahSurah)}
                        className={`inline cursor-pointer px-0.5 py-0.5 rounded-lg transition-all ${
                          isPlaying ? activeTheme.activeAyahHighlight : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        title={`Sentuh untuk mendengarkan Ayat ${ayah.numberInSurah}`}
                      >
                        {renderArabicWithAttachedEndBadge(
                          ayah.textArabic,
                          ayah.numberInSurah,
                          activeTheme.ayahBadgeClass
                        )}{' '}
                      </span>
                    </React.Fragment>
                  );
                })}
              </p>
            </div>
          ) : (
            /* 2. MUSHAF + TERJEMAHAN (OPSIONAL) */
            <div className="space-y-4">
              {versesOnPage.map((ayah, idx) => {
                const ayahSurah = ayah.surahNumber || pageMeta.surahNumber;
                const isPlaying =
                  playerState.isPlaying &&
                  playerState.surahNumber === ayahSurah &&
                  playerState.ayahNumber === ayah.numberInSurah;
                const bookmarked = isAyahBookmarked(ayah.numberInSurah, ayahSurah);
                const isSubsequentSurahHeader =
                  ayah.numberInSurah === 1 &&
                  idx > 0 &&
                  ayah.surahNumber &&
                  ayah.surahNumber !== versesOnPage[idx - 1]?.surahNumber;

                return (
                  <React.Fragment key={`mushaf_trans_frag_p${currentPage}_s${ayahSurah}_a${ayah.numberInSurah}_${idx}`}>
                    {isSubsequentSurahHeader && (
                      <div className="my-3 space-y-1">
                        <div
                          className={`px-3 sm:px-4 py-1.5 rounded-xl border flex items-center justify-between gap-2 shadow-xs ${activeTheme.headerBannerBg} min-h-[44px] sm:min-h-[48px]`}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 shrink-0">
                              {ayah.surahNumber}
                            </span>
                            <span className="text-xs sm:text-sm font-bold truncate">
                              {ayah.surahName}
                            </span>
                          </div>
                          <span className="font-arabic text-lg sm:text-xl font-bold leading-normal shrink-0">
                            سُورَةُ {ayah.surahArabic}
                          </span>
                        </div>
                        {ayah.surahNumber !== 9 && (
                          <div className="text-center py-1.5 font-arabic text-xl sm:text-2xl text-stone-800 dark:text-stone-200 opacity-90 leading-loose">
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      key={`mushaf_trans_card_p${currentPage}_s${ayahSurah}_a${ayah.numberInSurah}_${idx}`}
                      className={`p-5 rounded-2xl border transition-all ${
                        isPlaying
                          ? activeTheme.activeAyahHighlight
                          : 'border-stone-200/60 dark:border-stone-800 bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200/40">
                        <span className="text-xs sm:text-sm font-mono font-bold opacity-60">
                          {ayah.surahName ? `${ayah.surahName} — ` : ''}Ayat {ayah.numberInSurah}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePlayAyah(ayah.numberInSurah, ayahSurah)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-600 min-h-[40px] min-w-[40px] flex items-center justify-center"
                            title={isPlaying ? 'Jeda' : 'Dengar'}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() =>
                              onToggleBookmark(ayahSurah, ayah.numberInSurah, ayah.surahName || pageMeta.surahName)
                            }
                            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-600 min-h-[40px] min-w-[40px] flex items-center justify-center"
                          >
                            {bookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className={`font-arabic text-right mb-2.5 ${fontSizeClass} ${activeTheme.textPrimary}`}>
                        {renderTajwidArabicText(ayah.textArabic)}
                      </p>
                      <p className={`text-xs sm:text-sm leading-relaxed ${activeTheme.textSecondary}`}>
                        {ayah.textTranslation}
                      </p>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Physical Page Footer */}
          <div className="pt-5 mt-6 border-t border-stone-300/40 dark:border-stone-700/40 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-500">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1.5 hover:text-emerald-600 disabled:opacity-30 py-2 min-h-[44px]"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Halaman Sebelumnya</span>
            </button>

            <span className="font-mono text-base font-bold text-stone-700 dark:text-stone-300">
              {currentPage}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= 604}
              className="flex items-center gap-1.5 hover:text-emerald-600 disabled:opacity-30 py-2 min-h-[44px]"
            >
              <span>Halaman Berikutnya</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-3 text-[11px] text-stone-400 text-center">
            Teks & Terjemahan: LPMQ Kementerian Agama RI · Pembaruan 2026
          </p>
        </div>
      </div>

      {/* Floating Sticky Bottom Bar for Physical Page Tilawah (Hidden in Focus Mode) */}
      {showBars && (
        <div className="max-w-2xl mx-auto p-2.5 sm:p-3.5 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayCurrentPage}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs min-h-[44px]"
            >
              {playerState.isPlaying && playerState.surahNumber === pageMeta.surahNumber ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Jeda Tilawah</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Putar Halaman Ini</span>
                </>
              )}
            </button>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFollowPage}
                onChange={(e) => setAutoFollowPage(e.target.checked)}
                className="rounded text-emerald-600 w-4 h-4"
              />
              <span className="hidden sm:inline">Ikuti Halaman Otomatis</span>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-mono font-bold text-stone-700 dark:text-stone-300">
              {currentPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= 604}
              className="p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation & Jump to Page Modal */}
      {showNavigationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
              Navigasi Halaman Al-Qur'an (1–604)
            </h3>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-stone-500">Ketik Nomor Halaman:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="604"
                  value={targetJumpPage}
                  onChange={(e) => setTargetJumpPage(e.target.value)}
                  placeholder="Contoh: 1, 293, 604"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white min-h-[44px]"
                />
                <button
                  onClick={() => {
                    const num = parseInt(targetJumpPage, 10);
                    if (!isNaN(num)) handleJumpToPage(num);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                >
                  Buka
                </button>
              </div>
            </div>

            {/* Quick Juz Jump Grid */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
              <span className="text-xs font-bold text-stone-500 block">Lompat Cepat ke Juz:</span>
              <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <button
                    key={juz}
                    onClick={() => handleJumpToPage(getJuzStartPage(juz))}
                    className="p-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-300 min-h-[40px]"
                  >
                    Juz {juz}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowNavigationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tajwid Color Legend Modal (LPMQ Kemenag RI 6 Rules) */}
      {showTajwidLegendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  Panduan Warna Tajwid Standar LPMQ RI
                </h3>
              </div>
              <button
                onClick={() => setShowTajwidLegendModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Panduan pewarnaan teks Arab berdasarkan standar resmi Lembaga Pentashihan Mushaf Al-Qur'an (LPMQ) Kementerian Agama RI:
            </p>

            <div className="space-y-2.5 text-xs sm:text-sm">
              {[
                { name: 'Mad Wajib / Jaiz (Panjang 4-5 Harakat)', color: 'Biru (Blue)', desc: 'Panjangkan suara 4–5 harakat pada tanda maddah ~', badge: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300' },
                { name: 'Ghunnah Musyaddadah & Idgham Bighunnah', color: 'Magenta / Pink', desc: 'Dengung 2 harakat di rongga hidung pada huruf bertasydid نّ atau مّ', badge: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 dark:bg-fuchsia-950 dark:text-fuchsia-300' },
                { name: 'Ikhfa Haqiqi (Samar Mendengung)', color: 'Hijau (Green)', desc: 'Samarkan bunyi nun sukun / tanwin dengan dengung halus', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' },
                { name: 'Qalqalah (Pantulan Getar)', color: 'Merah (Red)', desc: 'Pantulkan huruf Qaf, Tha, Ba, Jim, Dal saat sukun atau waqaf', badge: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300' },
                { name: 'Iqlab (Tukar Suara ke Mim)', color: 'Cyan / Biru Langit', desc: 'Tukar bunyi nun sukun menjadi mim lembut saat bertemu Ba', badge: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300' },
                { name: 'Izhar (Jelas Tanpa Dengung)', color: 'Netral / Hitam', desc: 'Baca huruf dengan jelas dan tegas tanpa ditahan atau didengungkan', badge: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-900 dark:text-white">{item.name}</strong>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${item.badge}`}>
                      {item.color}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTajwidLegendModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-500"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      <MushafThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentThemeId={themeId}
        onSelectTheme={(newTheme) => setThemeId(newTheme)}
      />

      {/* Cover / Frame Modal */}
      <QuranCoverModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        selectedCoverId={selectedCover.id}
        frameEnabled={frameEnabled}
        onToggleFrame={(enabled) => {
          setFrameEnabled(enabled);
          setQuranFrameEnabled(enabled);
        }}
        onSelectCover={(cover) => {
          setSelectedCover(cover);
          saveQuranCoverId(cover.id);
          setFrameEnabled(true);
          setQuranFrameEnabled(true);
        }}
      />

      {/* Qari Modal */}
      <QariSelectorModal
        isOpen={showQariModal}
        onClose={() => setShowQariModal(false)}
        currentQari={selectedQari}
        onSelectQari={(newQari) => setSelectedQari(newQari)}
        playbackSpeed={playbackSpeed}
        onSpeedChange={(speed) => {
          setPlaybackSpeed(speed);
        }}
      />

      {/* UNIFIED PENGATURAN AL-QUR'AN PANEL (SATU PANEL TERPUSAT) */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-stone-900 dark:text-white">
                  Pengaturan Al-Qur'an
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Tutup Pengaturan Al-Qur'an"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Mode Tampilan & Terjemahan */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Terjemahan & Tampilan Halaman
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setReadingMode('mushaf_arab')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
                    readingMode === 'mushaf_arab'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div>Mushaf Arab (Tanpa Terjemahan)</div>
                  <div className="text-[11px] opacity-80 mt-0.5 font-normal">Fokus 604 Halaman Fisik</div>
                </button>
                <button
                  onClick={() => setReadingMode('mushaf_terjemahan')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
                    readingMode === 'mushaf_terjemahan'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div>Arab + Terjemahan</div>
                  <div className="text-[11px] opacity-80 mt-0.5 font-normal">Terjemahan Kemenag RI</div>
                </button>
              </div>
            </div>

            {/* 2. Ukuran Teks Arab (A / A+ / A++) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Ukuran Teks Arab
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal' as const, label: 'A (Normal)' },
                  { id: 'large' as const, label: 'A+ (Besar)' },
                  { id: 'xlarge' as const, label: 'A++ (Ekstra)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFontScale(s.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                      fontScale === s.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tajwid Berwarna */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Tajwid Warna (LPMQ Kemenag RI)
              </span>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                    Aktifkan Tajwid Berwarna
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Mad, ikhfa, ghunnah, iqlab & qalqalah
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowSettingsDrawer(false);
                      setShowTajwidLegendModal(true);
                    }}
                    className="p-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold"
                    title="Buka Legenda Warna Tajwid"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsTajwidActive(!isTajwidActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isTajwidActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {isTajwidActive ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Audio Murottal, Qari, Kecepatan & Ikuti Halaman */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Audio Murottal & Qari
              </span>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                    {selectedQari.name}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {selectedQari.audioBitrate} · {selectedQari.style}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSettingsDrawer(false);
                    setShowQariModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Ganti Qari
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Kecepatan Bacaan</span>
                <div className="flex items-center gap-1">
                  {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        playbackSpeed === spd
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                    Ikuti Halaman Otomatis
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Pindah halaman otomatis mengikuti lantunan qari
                  </div>
                </div>
                <button
                  onClick={() => setAutoFollowPage(!autoFollowPage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    autoFollowPage
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {autoFollowPage ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>
            </div>

            {/* 5. Tema & Bingkai Mushaf (Persisten) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Tema & Bingkai Mushaf
              </span>

              {/* Quick Bingkai On/Off Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                    Tampilkan Bingkai Mushaf
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Pilihan aktif: {selectedCover.name} (tersimpan otomatis)
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = !frameEnabled;
                    setFrameEnabled(next);
                    setQuranFrameEnabled(next);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    frameEnabled
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {frameEnabled ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowSettingsDrawer(false);
                    setShowThemeModal(true);
                  }}
                  className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-left hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                    <Palette className="w-4 h-4 text-emerald-600" />
                    <span>Pilih Tema Mushaf</span>
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                    {activeTheme.name}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowSettingsDrawer(false);
                    setShowCoverModal(true);
                  }}
                  className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-left hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>Pilih Bingkai ({QURAN_COVER_TEMPLATES.length})</span>
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1 truncate">
                    {selectedCover.name}
                  </div>
                </button>
              </div>
            </div>

            {/* 6. Mode Layar Penuh & Bersih */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div>
                <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Mode Layar Penuh (Fullscreen)
                </div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  {isFullscreen ? 'Layar penuh sedang aktif' : 'Maksimalkan area mushaf saat membaca'}
                </div>
              </div>
              <button
                onClick={() => {
                  const nextFs = !isFullscreen;
                  setIsFullscreen(nextFs);
                  if (nextFs) setControlsHidden(true);
                  else setControlsHidden(false);
                  setShowSettingsDrawer(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-bold text-xs transition-all ${
                  isFullscreen ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-700 hover:bg-emerald-600'
                }`}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Aktifkan'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-500"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
