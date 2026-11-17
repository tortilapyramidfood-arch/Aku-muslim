import React, { useState, useEffect, useRef } from 'react';
import {
  IQRA_CURRICULUM,
  IqraJilidItem,
  IqraLessonItem,
  IqraWordItem,
} from '../../data/iqraCurriculumData';
import {
  getLpmqRuleDefinition,
  TajwidRuleCategory,
  TajwidRuleDefinition,
} from '../../services/tajwidColorEngine';
import { humanAudioService } from '../../services/humanAudioService';
import { activityTracker } from '../../services/activityTracker';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Award,
  Users,
  Eye,
  EyeOff,
  Palette,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Info,
  RotateCcw,
  Square,
  X,
  Smile,
  GraduationCap,
  Play,
  Gauge,
  ArrowRight,
} from 'lucide-react';

export interface IqraInteractiveModuleProps {
  initialJilidNumber?: number;
  initialLessonNumber?: number;
  pageId?: string | number;
  initialPageId?: string | number;
  currentPageId?: string | number;
  jilid?: number;
  lesson?: number;
  onBackToParent?: () => void;
  onPageChange?: (jilid: number, lesson: number, lessonId: string) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

// Helper to reliably parse page identifiers into valid jilid and lesson numbers
function parseJilidAndLesson(
  pId?: string | number,
  jNum?: number,
  lNum?: number
): { jilid: number; lesson: number } {
  let j = jNum ?? 1;
  let l = lNum ?? 1;

  if (pId !== undefined && pId !== null) {
    if (typeof pId === 'number') {
      l = Math.max(1, Math.min(30, pId));
    } else {
      const str = String(pId).trim();
      const match = str.match(/iqra_?(\d+)_l?(\d+)/i) || str.match(/(\d+)[_-](\d+)/);
      if (match) {
        j = parseInt(match[1], 10);
        l = parseInt(match[2], 10);
      } else {
        const numMatch = str.match(/\d+/);
        if (numMatch) {
          l = parseInt(numMatch[0], 10);
        }
      }
    }
  }

  return {
    jilid: Math.max(1, Math.min(6, j)),
    lesson: Math.max(1, Math.min(30, l)),
  };
}

export const IqraInteractiveModule: React.FC<IqraInteractiveModuleProps> = ({
  initialJilidNumber,
  initialLessonNumber,
  pageId,
  initialPageId,
  currentPageId,
  jilid,
  lesson,
  onBackToParent,
  onPageChange,
  onNextPage,
  onPrevPage,
}) => {
  // Resolve initial state from any combination of prop formats
  const initialResolved = parseJilidAndLesson(
    pageId ?? initialPageId ?? currentPageId,
    jilid ?? initialJilidNumber,
    lesson ?? initialLessonNumber
  );

  const [selectedJilidNumber, setSelectedJilidNumber] = useState<number>(initialResolved.jilid);
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number>(initialResolved.lesson);
  const [isColorActive, setIsColorActive] = useState<boolean>(true);
  const [isAccessibleColorBlindMode, setIsAccessibleColorBlindMode] = useState<boolean>(false);
  const [uiMode, setUiMode] = useState<'ANAK' | 'PEMBIMBING'>('ANAK');
  const [activeTajwidModal, setActiveTajwidModal] = useState<TajwidRuleDefinition | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [currentPlaybackWordId, setCurrentPlaybackWordId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<IqraWordItem | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string>('');
  const [isSlowMode, setIsSlowMode] = useState<boolean>(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);

  const lessonCardRef = useRef<HTMLDivElement | null>(null);

  // prevPropsRef prevents parent re-renders from overwriting user navigation
  const prevPropsRef = useRef({
    jilid: initialResolved.jilid,
    lesson: initialResolved.lesson,
    pageId: pageId ?? initialPageId ?? currentPageId ?? '',
  });

  const currentJilid: IqraJilidItem =
    IQRA_CURRICULUM.find((j) => j.jilidNumber === selectedJilidNumber) || IQRA_CURRICULUM[0];
  const currentLesson: IqraLessonItem =
    currentJilid.lessons.find((l) => l.lessonNumber === selectedLessonNumber) || currentJilid.lessons[0];
  const currentLessonId = currentLesson.lessonId;

  // 1. External Props Sync: updates internal state when caller changes props intentionally
  useEffect(() => {
    const incomingResolved = parseJilidAndLesson(
      pageId ?? initialPageId ?? currentPageId,
      jilid ?? initialJilidNumber,
      lesson ?? initialLessonNumber
    );

    const hasChanged =
      incomingResolved.jilid !== prevPropsRef.current.jilid ||
      incomingResolved.lesson !== prevPropsRef.current.lesson;

    if (hasChanged) {
      prevPropsRef.current = {
        jilid: incomingResolved.jilid,
        lesson: incomingResolved.lesson,
        pageId: String(pageId ?? initialPageId ?? currentPageId ?? ''),
      };
      setSelectedJilidNumber(incomingResolved.jilid);
      setSelectedLessonNumber(incomingResolved.lesson);
    }
  }, [pageId, initialPageId, currentPageId, jilid, initialJilidNumber, lesson, initialLessonNumber]);

  // 2. Active Page ID Synchronization: triggers re-render, audio reset, database tracking, and storage persistence
  useEffect(() => {
    // Reset word selection to first word of the new page
    const firstWord = currentLesson.rows[0]?.words[0] || null;
    setSelectedWord(firstWord);
    setCurrentPlaybackWordId(null);
    humanAudioService.stopAllAudio();
    setPlaybackNotice(`Pelajaran ${selectedLessonNumber} dibuka: ${currentLesson.title}`);

    // Update prevPropsRef to keep in sync with current state
    prevPropsRef.current = {
      jilid: selectedJilidNumber,
      lesson: selectedLessonNumber,
      pageId: currentLessonId,
    };

    // Persist progress to localStorage & dispatch custom event
    try {
      localStorage.setItem('akumuslim_iqra_last_jilid', selectedJilidNumber.toString());
      localStorage.setItem('akumuslim_iqra_last_lesson', selectedLessonNumber.toString());
      localStorage.setItem('akumuslim_iqra_last_lesson_id', currentLessonId);
      localStorage.setItem('akumuslim_iqra_current_page_id', currentLessonId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('akumuslim_iqra_progress', {
            detail: {
              jilid: selectedJilidNumber,
              lesson: selectedLessonNumber,
              lessonId: currentLessonId,
              pageId: currentLessonId,
            },
          })
        );
      }
    } catch {
      // safe fallback
    }

    // Database activity tracker (recording foreground progress)
    activityTracker.recordAction({
      actionType: 'IQRA_PRACTICE',
      details: `Membuka Iqra Jilid ${selectedJilidNumber} Pelajaran ${selectedLessonNumber} (${currentLessonId})`,
      metadata: {
        jilid: selectedJilidNumber,
        lesson: selectedLessonNumber,
        lessonId: currentLessonId,
        pageId: currentLessonId,
        subCompetency: currentLesson.subCompetency,
        timestamp: new Date().toISOString(),
      },
    });

    // Notify caller callback if provided
    onPageChange?.(selectedJilidNumber, selectedLessonNumber, currentLessonId);

    // Smooth scroll reading card into focus
    if (lessonCardRef.current) {
      lessonCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentLessonId, selectedJilidNumber, selectedLessonNumber]);

  // Unified navigation controller ensuring atomic state updates
  const navigateToLesson = (newJilid: number, newLesson: number) => {
    const validJilid = Math.max(1, Math.min(6, newJilid));
    const validLesson = Math.max(1, Math.min(30, newLesson));

    setSelectedJilidNumber(validJilid);
    setSelectedLessonNumber(validLesson);
  };

  // Audio subscription
  useEffect(() => {
    const unsub = humanAudioService.subscribe((state) => {
      if (!state.isPlaying) {
        setCurrentPlaybackWordId(null);
      }
    });
    return () => {
      unsub();
      humanAudioService.stopAllAudio();
    };
  }, []);

  const handlePlayWord = async (word: IqraWordItem, forceRate?: number) => {
    setSelectedWord(word);
    setCurrentPlaybackWordId(word.id);
    const rate = forceRate !== undefined ? forceRate : (isSlowMode ? 0.75 : 1.0);
    setPlaybackNotice(`Memutar bacaan: ${word.latin} (${rate < 1 ? 'Tempo Pelan 0.75x' : 'Tempo Normal'})`);

    if (word.humanAudioUrl) {
      const res = await humanAudioService.playCustomHumanAudio(word.humanAudioUrl, word.latin, rate);
      setPlaybackNotice(res.message);
    } else {
      setPlaybackNotice('Audio belum tersedia');
    }
  };

  const handleWordClick = (word: IqraWordItem) => {
    handlePlayWord(word);
    if (word.tajwidCategory !== 'NORMAL') {
      const ruleDef = getLpmqRuleDefinition(word.tajwidCategory);
      setActiveTajwidModal(ruleDef);
    }
  };

  // 4 Action Buttons according to Section D
  const handleListenAction = () => {
    if (selectedWord) {
      handlePlayWord(selectedWord);
    } else if (currentLesson.rows[0]?.words[0]) {
      handlePlayWord(currentLesson.rows[0].words[0]);
    }
  };

  const handleReplayAction = () => {
    if (selectedWord) {
      handlePlayWord(selectedWord);
    } else {
      humanAudioService.replayLastAudio();
    }
  };

  const handleToggleSlowRate = () => {
    const nextSlow = !isSlowMode;
    setIsSlowMode(nextSlow);
    const newRate = nextSlow ? 0.75 : 1.0;
    humanAudioService.setPlaybackRate(newRate);
    if (selectedWord) {
      handlePlayWord(selectedWord, newRate);
    }
  };

  const handleContinueAction = () => {
    handleMarkLessonComplete();
    handleNextLesson();
  };

  const handleMarkLessonComplete = () => {
    const key = `${selectedJilidNumber}_${selectedLessonNumber}`;
    setCompletedLessons((prev) => ({ ...prev, [key]: true }));

    try {
      activityTracker.recordAction({
        actionType: 'IQRA_PRACTICE',
        details: `Menyelesaikan Iqra Jilid ${selectedJilidNumber} Pelajaran ${selectedLessonNumber} (${currentLesson.lessonId})`,
        metadata: {
          jilid: selectedJilidNumber,
          lesson: selectedLessonNumber,
          lessonId: currentLesson.lessonId,
          completed: true,
        },
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // safe catch
    }
  };

  const handleNextLesson = () => {
    if (selectedLessonNumber < 30) {
      navigateToLesson(selectedJilidNumber, selectedLessonNumber + 1);
      onNextPage?.();
    } else {
      // Reached lesson 30 -> Open Jilid Completion / Evaluation Modal
      setShowEvaluationModal(true);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // safe fallback
      }
    }
  };

  const handlePrevLesson = () => {
    if (selectedLessonNumber > 1) {
      navigateToLesson(selectedJilidNumber, selectedLessonNumber - 1);
      onPrevPage?.();
    } else if (selectedJilidNumber > 1) {
      navigateToLesson(selectedJilidNumber - 1, 30);
      onPrevPage?.();
    }
  };

  const currentLessonKey = `${selectedJilidNumber}_${selectedLessonNumber}`;
  const isLessonCompleted = !!completedLessons[currentLessonKey];

  return (
    <div className="space-y-5 pb-6">
      {/* Optional Top Back Button if launched from parent */}
      {onBackToParent && (
        <button
          onClick={onBackToParent}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs shadow-xs hover:border-emerald-500 active:scale-98 transition-all min-h-[48px]"
        >
          <ChevronLeft className="w-4 h-4 text-emerald-600" />
          <span>Kembali ke Halaman Sebelumnya</span>
        </button>
      )}

      {/* 6 Volume Cards (Jilid 1 to 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {IQRA_CURRICULUM.map((jilid) => {
          const isSelected = selectedJilidNumber === jilid.jilidNumber;
          return (
            <button
              key={jilid.jilidNumber}
              onClick={() => {
                navigateToLesson(jilid.jilidNumber, 1);
              }}
              className={`p-3.5 sm:p-4 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-800 to-teal-900 text-white border-amber-400 shadow-lg scale-102 ring-2 ring-amber-400/50'
                  : 'bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-100 hover:border-emerald-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-stone-400'}`}>
                    JILID 0{jilid.jilidNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    GRATIS
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black mt-1 leading-tight">{jilid.title}</h3>
                <p className={`text-xs line-clamp-2 mt-0.5 ${isSelected ? 'text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>
                  {jilid.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/20 flex items-center justify-between text-xs">
                <span className={isSelected ? 'text-amber-300 font-bold' : 'text-stone-500'}>
                  30 Pelajaran
                </span>
                <span className="font-bold text-emerald-400">100% Free</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Dual Modes & Accessibility Toggles */}
      <div className="p-3.5 rounded-3xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 flex flex-wrap items-center justify-between gap-3">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setUiMode('ANAK')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              uiMode === 'ANAK'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            <Smile className="w-4 h-4 text-amber-300" />
            <span>Mode Santri Ceria</span>
          </button>
          <button
            onClick={() => setUiMode('PEMBIMBING')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              uiMode === 'PEMBIMBING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Mode Guru / Orang Tua</span>
          </button>
        </div>

        {/* Tajwid Colors & Color-blind Toggles */}
        <div className="flex items-center gap-2">
          {/* Color Blind Toggle */}
          <button
            onClick={() => setIsAccessibleColorBlindMode(!isAccessibleColorBlindMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[40px] ${
              isAccessibleColorBlindMode
                ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border-cyan-400'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
            title="Aksesibilitas Buta Warna: Menampilkan pola garis bawah dan simbol tag fonetik"
          >
            <Info className="w-4 h-4" />
            <span>Simbol Buta Warna: {isAccessibleColorBlindMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Tajwid Color On/Off */}
          <button
            onClick={() => setIsColorActive(!isColorActive)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[40px] ${
              isColorActive
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-400'
                : 'bg-stone-200 dark:bg-stone-900 text-stone-500 border-stone-300'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Warna Tajwid: {isColorActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Lesson Selector Bar (1 to 30) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 px-1">
          <span>Pilih Pelajaran ({currentJilid.title}):</span>
          <span className="text-emerald-700 dark:text-emerald-400">
            Pelajaran {selectedLessonNumber} dari 30
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {currentJilid.lessons.map((lesson) => {
            const isSelected = lesson.lessonNumber === selectedLessonNumber;
            const isDone = !!completedLessons[`${selectedJilidNumber}_${lesson.lessonNumber}`];
            return (
              <button
                key={lesson.lessonNumber}
                onClick={() => navigateToLesson(selectedJilidNumber, lesson.lessonNumber)}
                className={`min-w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-amber-400 shadow-md scale-105 ring-2 ring-amber-400/40'
                    : isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                }`}
              >
                {isDone ? '✓' : lesson.lessonNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Lesson Display Card with key for complete DOM re-render on lesson change */}
      <div
        ref={lessonCardRef}
        key={`iqra-card-${selectedJilidNumber}-${currentLesson.lessonId}`}
        className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6"
      >
        {/* Header Lesson */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                {currentJilid.title}
              </span>
              <span className="text-xs font-mono text-stone-400">
                Pelajaran #{selectedLessonNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white mt-1.5">
              {currentLesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {currentLesson.subCompetency}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevLesson}
              disabled={selectedJilidNumber === 1 && selectedLessonNumber === 1}
              data-testid="prev-page-btn"
              aria-label="Sebelumnya"
              className="inline-flex items-center gap-1 px-3 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 min-h-[44px] text-xs font-bold transition-all"
              title="Pelajaran Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>
            <button
              onClick={handleNextLesson}
              data-testid="next-page-btn"
              aria-label="Berikutnya"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs min-h-[44px] transition-all"
              title={selectedLessonNumber === 30 ? 'Evaluasi Jilid Selesai' : 'Pelajaran Berikutnya'}
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pedagogical Tip Banner */}
        {uiMode === 'ANAK' ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <Smile className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
              <strong>Tips Santri:</strong> {currentLesson.pedagogicalTipAnak}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <span>Panduan Mengajar Guru / Orang Tua:</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
              {currentLesson.teachingNotePembimbing}
            </p>
            <div className="pt-2 border-t border-blue-200/40">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">
                Kriteria Kelulusan Pelajaran:
              </span>
              <ul className="list-disc list-inside text-xs text-blue-900/80 dark:text-blue-200/80 space-y-0.5">
                {currentLesson.evaluationCheckpoints.map((cp, idx) => (
                  <li key={idx}>{cp}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 4 ACTION AUDIO BUTTONS (SECTION D REQUIREMENT: Dengarkan, Ulangi, Pelan, Lanjutkan) */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Dengarkan */}
            <button
              onClick={handleListenAction}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-all min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Dengarkan</span>
            </button>

            {/* 2. Ulangi */}
            <button
              onClick={handleReplayAction}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xs sm:text-sm shadow-xs transition-all min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi</span>
            </button>

            {/* 3. Pelan (0.75x) */}
            <button
              onClick={handleToggleSlowRate}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-all min-h-[44px] ${
                isSlowMode
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span>{isSlowMode ? 'Pelan (0.75x) AKTIF' : 'Pelan (0.75x)'}</span>
            </button>
          </div>

          {/* 4. Lanjutkan */}
          <button
            onClick={handleContinueAction}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 font-bold text-xs sm:text-sm shadow-xs transition-all min-h-[44px]"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Reading Rows with Tajwid Color Engine */}
        <div className="space-y-4 pt-1">
          {currentLesson.rows.map((row) => (
            <div
              key={row.rowNumber}
              className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/60 space-y-3"
            >
              {row.instruction && (
                <div className="text-xs sm:text-sm font-semibold text-stone-500 dark:text-stone-400">
                  Baris {row.rowNumber}: {row.instruction}
                </div>
              )}

              {/* Words Row (Right to Left flow for Arabic) */}
              <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 direction-rtl">
                {row.words.map((word) => {
                  const ruleDef = getLpmqRuleDefinition(word.tajwidCategory);
                  const isPlayingThis = currentPlaybackWordId === word.id;
                  const isSelected = selectedWord?.id === word.id;

                  // Compute styles based on tajwid toggles
                  let wordColorClass = 'text-stone-900 dark:text-stone-100';
                  let underlineClass = '';

                  if (isColorActive && word.tajwidCategory !== 'NORMAL') {
                    wordColorClass = ruleDef.textClass;
                  }

                  if (isAccessibleColorBlindMode && word.tajwidCategory !== 'NORMAL') {
                    underlineClass = ruleDef.underlineClass;
                  }

                  return (
                    <button
                      key={word.id}
                      onClick={() => handleWordClick(word)}
                      className={`min-w-24 sm:min-w-28 p-3.5 sm:p-4 rounded-2xl border text-center transition-all group flex flex-col items-center justify-center active:scale-95 ${
                        isPlayingThis
                          ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                          : isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-400'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-emerald-400 hover:shadow-md'
                      }`}
                      title={word.note || word.latin}
                    >
                      {/* Accessible Symbol Badge */}
                      {isAccessibleColorBlindMode && word.tajwidCategory !== 'NORMAL' && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 mb-1">
                          {ruleDef.accessibleSymbol}
                        </span>
                      )}

                      {/* Arabic Word Display */}
                      <span
                        className={`font-arabic text-3xl sm:text-4xl font-bold leading-normal transition-colors ${wordColorClass} ${underlineClass}`}
                      >
                        {word.arabic}
                      </span>

                      {/* Latin Transliteration */}
                      <span className="text-xs sm:text-sm font-semibold text-stone-500 dark:text-stone-400 mt-1">
                        {word.latin}
                      </span>

                      {/* Tajwid Indicator Pill */}
                      {isColorActive && word.tajwidCategory !== 'NORMAL' && (
                        <span className={`text-[11px] mt-1.5 px-2 py-0.5 rounded-full font-bold ${ruleDef.badgeBg} ${ruleDef.badgeText}`}>
                          {ruleDef.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions: Audio status & Mark Complete */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            <Volume2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{playbackNotice || 'Sentuh kata Arab untuk mendengarkan pelafalan qari manusia & melihat hukum tajwid'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrevLesson}
              disabled={selectedJilidNumber === 1 && selectedLessonNumber === 1}
              data-testid="bottom-prev-page-btn"
              aria-label="Sebelumnya"
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs font-bold disabled:opacity-30 min-h-[48px]"
              title="Pelajaran Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              onClick={handleNextLesson}
              data-testid="bottom-next-page-btn"
              aria-label="Berikutnya"
              className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-700 hover:bg-stone-200 text-xs font-bold min-h-[48px]"
              title={selectedLessonNumber === 30 ? 'Evaluasi Jilid Selesai' : 'Pelajaran Berikutnya'}
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                handleMarkLessonComplete();
                if (selectedLessonNumber < 30) {
                  navigateToLesson(selectedJilidNumber, selectedLessonNumber + 1);
                } else {
                  setShowEvaluationModal(true);
                  try {
                    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                  } catch {
                    // safe fallback
                  }
                }
              }}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all min-h-[48px] ${
                isLessonCompleted
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md hover:from-emerald-500 hover:to-teal-600'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isLessonCompleted
                  ? (selectedLessonNumber === 30 ? 'Evaluasi Jilid Tuntas ✓' : 'Pelajaran Selesai ✓ Lanjut')
                  : (selectedLessonNumber === 30 ? 'Tuntaskan Evaluasi Jilid 🏆' : 'Tandai Selesai & Lanjut →')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* JILID 30 LESSONS COMPLETION / EVALUATION CELEBRATION MODAL */}
      {showEvaluationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-amber-400/60 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🏆
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Evaluasi Jilid 0{selectedJilidNumber} Tuntas
              </span>
              <h3 className="text-2xl font-black text-stone-900 dark:text-white">
                {selectedJilidNumber === 6
                  ? 'Masya Allah! Khatam Kurikulum Iqra!'
                  : `Alhamdulillah! Iqra Jilid ${selectedJilidNumber} Selesai`}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-md mx-auto">
                {selectedJilidNumber === 6
                  ? 'Selamat! Ananda/Anda telah menuntaskan seluruh 6 Jilid (180 Pelajaran) kurikulum Iqra dengan pengucapan makhraj dan kaidah tajwid berstandar Kemenag RI. Anda kini siap membaca Mushaf Al-Qur\'an 30 Juz secara lancar!'
                  : `Selamat! Seluruh 30 pelajaran pada ${currentJilid.title} telah dipelajari dengan baik. Silakan lanjutkan ke jenjang jilid berikutnya.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Hasil Capaian Kompetensi:</span>
              </div>
              <p className="text-amber-950 dark:text-amber-200">
                {currentJilid.competencySummary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {selectedJilidNumber < 6 ? (
                <button
                  onClick={() => {
                    setShowEvaluationModal(false);
                    navigateToLesson(selectedJilidNumber + 1, 1);
                  }}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Lanjut ke Iqra Jilid 0{selectedJilidNumber + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowEvaluationModal(false);
                    if (onBackToParent) onBackToParent();
                  }}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-900 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Buka Mushaf Al-Qur'an 30 Juz</span>
                  <BookOpen className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  setShowEvaluationModal(false);
                  navigateToLesson(selectedJilidNumber, 30);
                }}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs sm:text-sm min-h-[48px]"
              >
                Ulangi Evaluasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Clickable Tajwid Segment Modal */}
      {activeTajwidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTajwidModal.badgeBg} ${activeTajwidModal.badgeText}`}>
                  {activeTajwidModal.colorName}
                </span>
                <h3 className="text-xl font-black text-stone-900 dark:text-white mt-1">
                  {activeTajwidModal.name} ({activeTajwidModal.arabicName})
                </h3>
              </div>
              <button
                onClick={() => setActiveTajwidModal(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {activeTajwidModal.description}
            </p>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs sm:text-sm">
              <div>
                <strong className="text-emerald-700 dark:text-emerald-400">Cara Membaca:</strong>
                <p className="text-stone-700 dark:text-stone-300 mt-0.5">{activeTajwidModal.caraMembaca}</p>
              </div>
              <div>
                <strong className="text-amber-700 dark:text-amber-400">Huruf Terkait:</strong>
                <p className="text-stone-700 dark:text-stone-300 mt-0.5">{activeTajwidModal.contohHuruf}</p>
              </div>
              {activeTajwidModal.durasiHarakat && (
                <div>
                  <strong className="text-cyan-700 dark:text-cyan-400">Durasi Panjang / Dengung:</strong>
                  <p className="text-stone-700 dark:text-stone-300 mt-0.5">{activeTajwidModal.durasiHarakat}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveTajwidModal(null)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300"
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

export const IqraReader = IqraInteractiveModule;
export default IqraInteractiveModule;
