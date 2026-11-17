import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PROPHET_STORIES, QUIZ_QUESTIONS } from '../../data/learningData';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';
import { TajwidInteractiveModule } from './TajwidInteractiveModule';
import { SmartHifzModule } from './SmartHifzModule';
import { IqraInteractiveModule } from './IqraInteractiveModule';
import { HijaiyahMakhrajModule } from './HijaiyahMakhrajModule';
import {
  Volume2,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  RotateCcw,
  GraduationCap,
  Heart,
  ChevronLeft,
  ChevronRight,
  Mic,
  Target,
  BookText,
  ArrowRight,
} from 'lucide-react';

export type LearningFeatureType =
  | 'tajwid'
  | 'smart_hifz'
  | 'hijaiyah'
  | 'target_hafalan'
  | 'kisah_nabi'
  | 'kuis_islami'
  | 'iqra';

export const LearningView: React.FC = () => {
  const { memorizationTargets, updateMemorizationStatus, setActiveTab } = useApp();
  const [activeFeature, setActiveFeature] = useState<LearningFeatureType | null>(null);

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

    // Listen for custom event whenever user navigates within Iqra
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
  }, [activeFeature]);

  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswerQuiz = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    setShowExplanation(true);

    const isCorrect = optionIdx === QUIZ_QUESTIONS[currentQuestionIdx].correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 10);
      audioService.playSuccessChime();
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  // 6 Tombol Utama Belajar Sesuai Urutan Keputusan Final Owner
  const LEARNING_BUTTONS: {
    id: LearningFeatureType;
    number: string;
    title: string;
    shortDesc: string;
    icon: React.ReactNode;
    bgAccent: string;
    borderAccent: string;
    textAccent: string;
  }[] = [
    {
      id: 'tajwid',
      number: '01',
      title: 'Tajwid Visual & Audio',
      shortDesc: 'Diagram anatomi makhraj, tajwid warna & audio qari asli',
      icon: <Volume2 className="w-8 h-8" />,
      bgAccent: 'from-emerald-800 to-teal-900',
      borderAccent: 'border-emerald-500/40',
      textAccent: 'text-emerald-300',
    },
    {
      id: 'smart_hifz',
      number: '02',
      title: 'Smart Hifz (Suara)',
      shortDesc: 'Katalog 114 surah, blur per kata & evaluasi mikrofon',
      icon: <Mic className="w-8 h-8" />,
      bgAccent: 'from-emerald-900 to-stone-900',
      borderAccent: 'border-amber-500/40',
      textAccent: 'text-amber-300',
    },
    {
      id: 'hijaiyah',
      number: '03',
      title: 'Huruf Hijaiyah',
      shortDesc: '28 huruf, variasi harakat & audio qari manusia asli',
      icon: <span className="font-arabic text-3xl font-black">أ ب ت</span>,
      bgAccent: 'from-amber-800 to-emerald-900',
      borderAccent: 'border-amber-400/40',
      textAccent: 'text-amber-200',
    },
    {
      id: 'target_hafalan',
      number: '04',
      title: 'Target Hafalan',
      shortDesc: 'Target surat, progres ayat & jadwal murajaah mandiri',
      icon: <Target className="w-8 h-8" />,
      bgAccent: 'from-teal-900 to-emerald-950',
      borderAccent: 'border-teal-500/40',
      textAccent: 'text-teal-300',
    },
    {
      id: 'kisah_nabi',
      number: '05',
      title: 'Kisah 25 Nabi',
      shortDesc: 'Kisah teladan akhlak para nabi dari Al-Qur\'an',
      icon: <BookText className="w-8 h-8" />,
      bgAccent: 'from-stone-800 to-emerald-900',
      borderAccent: 'border-stone-500/40',
      textAccent: 'text-amber-300',
    },
    {
      id: 'kuis_islami',
      number: '06',
      title: 'Kuis Islami',
      shortDesc: 'Latihan soal interaktif fiqih, sirah & tajwid',
      icon: <HelpCircle className="w-8 h-8" />,
      bgAccent: 'from-emerald-950 to-stone-900',
      borderAccent: 'border-emerald-400/40',
      textAccent: 'text-emerald-300',
    },
  ];

  return (
    <div className="space-y-5 pb-14">
      {/* If a feature is active, show the prominent Back Bar */}
      {activeFeature !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setActiveFeature(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs sm:text-sm shadow-xs hover:border-emerald-500 active:scale-98 transition-all min-h-[48px]"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-600" />
              <span>Kembali ke Menu Belajar</span>
            </button>

            <span className="text-xs sm:text-sm font-black text-stone-500 uppercase tracking-wider font-mono">
              {activeFeature === 'iqra'
                ? 'IQRA INTERAKTIF (JILID 1–6)'
                : LEARNING_BUTTONS.find((b) => b.id === activeFeature)?.title || 'Materi'}
            </span>
          </div>

          {/* 1. TAJWID VISUAL & AUDIO */}
          {activeFeature === 'tajwid' && <TajwidInteractiveModule />}

          {/* 2. SMART HIFZ (SUARA) */}
          {activeFeature === 'smart_hifz' && <SmartHifzModule />}

          {/* 3. HURUF HIJAIYAH (100% SUARA MANUSIA ASLI) */}
          {activeFeature === 'hijaiyah' && <HijaiyahMakhrajModule />}

          {/* 4. TARGET HAFALAN */}
          {activeFeature === 'target_hafalan' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  Target & Progres Hafalan Keluarga
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Lacak kemajuan hafalan surah Juz 'Amma secara mandiri tanpa tes memberatkan.
                </p>
              </div>

              <div className="space-y-2.5">
                {memorizationTargets.map((target) => (
                  <div
                    key={target.id}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                          Surah {target.surahName}
                        </span>
                        {target.assignedTo && (
                          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            {target.assignedTo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                        Target: {target.memorizedAyahCount} dari {target.targetAyahCount} ayat · Terakhir: {target.lastReviewed}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={target.status}
                        onChange={(e) => updateMemorizationStatus(target.id, e.target.value as 'belum' | 'sedang' | 'selesai')}
                        className={`text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border min-h-[44px] ${
                          target.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : target.status === 'sedang'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-stone-100 text-stone-600 border-stone-300 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        <option value="belum">Belum</option>
                        <option value="sedang">Sedang Dihafal</option>
                        <option value="selesai">Alhamdulillah Hafal</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. KISAH 25 NABI */}
          {activeFeature === 'kisah_nabi' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  Kisah 25 Nabi & Rasul
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Kisah para nabi berdasarkan Al-Qur'an dan riwayat terpercaya untuk memetik teladan akhlak mulia.
                </p>
              </div>

              <div className="space-y-3">
                {PROPHET_STORIES.map((story) => (
                  <div
                    key={story.id}
                    className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                          {story.name}
                        </h3>
                        <span className="text-xs sm:text-sm text-stone-400 font-medium">
                          {story.title} · {story.period}
                        </span>
                      </div>
                      <span className="font-arabic text-2xl text-emerald-800 dark:text-emerald-300 font-bold">
                        {story.arabicName}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                      {story.summary}
                    </p>

                    <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
                      <span className="font-bold">Hikmah & Teladan: </span>
                      {story.moralLesson}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. KUIS ISLAMI */}
          {activeFeature === 'kuis_islami' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4">
              {!quizFinished ? (
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 pb-3 border-b border-stone-100 dark:border-stone-800">
                    <span className="font-bold">
                      Pertanyaan {currentQuestionIdx + 1} dari {QUIZ_QUESTIONS.length}
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">
                      Skor: {score}
                    </span>
                  </div>

                  <div className="py-4">
                    <h3 className="text-base sm:text-xl font-bold text-stone-900 dark:text-white">
                      {QUIZ_QUESTIONS[currentQuestionIdx].question}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {QUIZ_QUESTIONS[currentQuestionIdx].options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === QUIZ_QUESTIONS[currentQuestionIdx].correctIndex;
                      let btnColor = 'bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-100';

                      if (showExplanation) {
                        if (isCorrect) {
                          btnColor = 'bg-emerald-600 text-white border-emerald-700 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnColor = 'bg-rose-600 text-white border-rose-700 font-bold';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={showExplanation}
                          onClick={() => handleAnswerQuiz(idx)}
                          className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm min-h-[48px] transition-all flex items-center justify-between ${btnColor}`}
                        >
                          <span>{opt}</span>
                          {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <div className="mt-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2.5">
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                        <strong>Penjelasan:</strong> {QUIZ_QUESTIONS[currentQuestionIdx].explanation}
                      </p>
                      <button
                        onClick={handleNextQuizQuestion}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition-colors min-h-[48px]"
                      >
                        Lanjut ke Pertanyaan Berikutnya →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Award className="w-16 h-16 text-amber-500 mx-auto" />
                  <h2 className="text-2xl font-black text-stone-900 dark:text-white">
                    Masya Allah, Kuis Selesai!
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
                    Skor akhir Anda: <strong className="text-emerald-700 dark:text-emerald-400 text-xl">{score} poin</strong>
                  </p>
                  <button
                    onClick={handleRestartQuiz}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm min-h-[48px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ulangi Kuis</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* IQRA INTERACTIVE MODULE */}
          {activeFeature === 'iqra' && (
            <IqraInteractiveModule
              initialJilidNumber={lastIqraProgress.jilid}
              initialLessonNumber={lastIqraProgress.lesson}
              onBackToParent={() => setActiveFeature(null)}
              onPageChange={(jilid, lesson) => {
                setLastIqraProgress({ jilid, lesson });
              }}
            />
          )}
        </div>
      ) : (
        /* DEFAULT VIEW: TOMBOL IQRA BESAR (FULL-WIDTH) DI ATAS + GRID 6 TOMBOL UTAMA */
        <div className="space-y-5">
          {/* Hero Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>KURIKULUM BELAJAR MANDIRI ISLAMI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Belajar & Hafalan Al-Qur'an
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
              Pilih materi di bawah ini. Tersedia dalam Mode Umum dan Mode Anak dengan navigasi satu sentuhan.
            </p>
          </div>

          {/* Alur Belajar Terhubung: Belajar sampai Praktik */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800 dark:text-stone-100">
                Alur Terhubung: Belajar sampai Praktik
              </span>
              <span className="text-stone-400">Ketuk langkah</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              <button
                onClick={() => setActiveFeature('iqra')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0 hover:bg-emerald-100"
              >
                1. Iqra 1–6
              </button>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <button
                onClick={() => setActiveFeature('tajwid')}
                className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 whitespace-nowrap shrink-0 hover:bg-teal-100"
              >
                2. Tajwid
              </button>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <button
                onClick={() => setActiveFeature('smart_hifz')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap shrink-0 hover:bg-amber-100"
              >
                3. Hafalan (Smart Hifz)
              </button>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <button
                onClick={() => setActiveTab('quran')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 whitespace-nowrap shrink-0 hover:bg-stone-200"
              >
                4. Audio Murottal
              </button>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <button
                onClick={() => {
                  localStorage.setItem('akumuslim_open_ibadah_subview', 'tuntunan');
                  setActiveTab('ibadah');
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white whitespace-nowrap shrink-0 hover:bg-emerald-600"
              >
                5. Panduan Sholat Bergambar
              </button>
            </div>
          </div>

          {/* 1. TOMBOL IQRA BESAR (FULL-WIDTH BANNER UTAMA — DI ATAS GRID 6 TOMBOL) */}
          <div
            onClick={() => setActiveFeature('iqra')}
            className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white border-2 border-amber-400/70 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer transition-all relative overflow-hidden group min-h-[96px]"
          >
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  📖
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-black tracking-wider uppercase">
                      Kurikulum Standar Indonesia
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      100% GRATIS
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors mt-0.5">
                    IQRA INTERAKTIF — JILID 1–6
                  </h2>
                  <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
                    Iqra Interaktif (Jilid 1 – 6) — Belajar membaca Al-Qur'an bertahap dari huruf tunggal hingga kalimat sempurna dengan rekaman qari manusia asli.
                  </p>
                </div>
              </div>

              {/* Progress & Quick Continue */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-stone-400 block">Progres Terakhir:</span>
                  <span className="text-xs font-bold text-amber-300">
                    Jilid {lastIqraProgress.jilid} · Pelajaran {lastIqraProgress.lesson}
                  </span>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-amber-400 text-stone-950 font-black text-xs shadow-xs flex items-center gap-1.5 group-hover:bg-amber-300 transition-colors">
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 6 Large Buttons in 2 columns x 3 rows Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-1">
            {LEARNING_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveFeature(btn.id)}
                className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br ${btn.bgAccent} text-white border ${btn.borderAccent} shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between text-left min-h-[96px] sm:min-h-[108px] group`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 [&>svg]:w-[22px] [&>svg]:h-[22px] shadow-inner group-hover:scale-105 transition-transform">
                    {btn.icon}
                  </div>
                  <span className="text-[10px] font-mono font-black text-white/50 tracking-wider">
                    {btn.number}
                  </span>
                </div>

                <div className="mt-1.5">
                  <h3 className="text-xs font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
                    {btn.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-stone-300 mt-0.5 line-clamp-2 leading-snug">
                    {btn.shortDesc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
