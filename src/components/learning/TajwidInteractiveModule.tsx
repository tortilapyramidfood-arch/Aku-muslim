import React, { useState } from 'react';
import {
  MAKHRAJ_REGIONS,
  LETTER_DIFFERENCES,
  COLOR_CODED_PRACTICE_VERSES,
  MakhrajRegion,
  ColorCodedVerse,
} from '../../data/tajwidComprehensiveData';
import { TAJWID_RULES } from '../../data/learningData';
import { MakhrajAnatomyDiagram } from './MakhrajAnatomyDiagram';
import { audioService } from '../../services/audioService';
import {
  Volume2,
  Sparkles,
  Info,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Award,
  HelpCircle,
  Layers,
  Activity,
} from 'lucide-react';

export const TajwidInteractiveModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'makhraj' | 'sifat' | 'perbedaan' | 'hukum' | 'praktik_warna' | 'kuis'
  >('makhraj');

  // Makhraj Section State
  const [selectedMakhraj, setSelectedMakhraj] = useState<MakhrajRegion>(MAKHRAJ_REGIONS[0]);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0); // 1.0 or 0.75
  const [repeatCount, setRepeatCount] = useState<number>(1); // 1, 2, or 3
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Practice Verse State
  const [selectedVerse, setSelectedVerse] = useState<ColorCodedVerse>(COLOR_CODED_PRACTICE_VERSES[0]);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

  // Kuis Tajwid State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const TAJWID_QUIZZES = [
    {
      question: 'Manakah makhraj keluarnya huruf Qaf (ق)?',
      options: [
        'Ujung lidah di atas gigi seri bawah',
        'Pangkal lidah menempel langit-langit lunak paling belakang',
        'Tengah tenggorokan dekat katup epiglotis',
        'Kedua bibir membulat ke depan',
      ],
      correctIndex: 1,
      explanation: 'Huruf Qaf keluar dari Aqshal Lisan (pangkal lidah paling belakang) menempel langit-langit lunak.',
    },
    {
      question: 'Huruf apakah yang memiliki sifat tebal (isti\'la) sekaligus memantul (qalqalah) saat sukun?',
      options: ['Kaf (ك)', 'Ta (ت)', 'Qaf (ق)', 'Sin (س)'],
      correctIndex: 2,
      explanation: 'Qaf (ق) termasuk huruf isti\'la dan huruf qalqalah (baju di toko / Quthbu Jadin).',
    },
    {
      question: 'Berapakah ketukan panjang harakat standar untuk Mad Thabi\'i / Mad Ashli?',
      options: ['1 Harakat', '2 Harakat (1 Alif)', '4 Harakat', '6 Harakat'],
      correctIndex: 1,
      explanation: 'Mad Thabi\'i dibaca konsisten sepanjang 2 harakat (setara dua ketukan sedang).',
    },
    {
      question: 'Kaidah apakah yang berlaku ketika Nun Sukun (نْ) bertemu huruf Ba (ب)?',
      options: ['Idzhar Halqi', 'Idgham Bilaghunnah', 'Iqlab', 'Ikhfa Syafawi'],
      correctIndex: 2,
      explanation: 'Iqlab: Bunyi nun sukun diganti menjadi mim samar disertai dengung 2 harakat.',
    },
    {
      question: 'Apa perbedaan utama antara pengucapan huruf Dzal (ذ) dengan huruf Zai (ز)?',
      options: [
        'Dzal menempel ujung gigi seri atas, sedangkan Zai di atas gigi seri bawah berdesis tajam',
        'Dzal keluar dari bibir, Zai keluar dari tenggorokan',
        'Dzal selalu dibaca tebal, Zai selalu dibaca dengung',
        'Tidak ada perbedaan makhraj',
      ],
      correctIndex: 0,
      explanation: 'Dzal dari ujung lidah bertemu ujung dua gigi seri atas, sedangkan Zai memiliki sifat shafir (desis lebah) di atas gigi seri bawah.',
    },
  ];

  const handlePlayLetter = async (letter: string, name: string) => {
    setIsPlayingAudio(true);
    for (let i = 0; i < repeatCount; i++) {
      audioService.speakHijaiyah(letter, name);
      if (i < repeatCount - 1) {
        await new Promise((res) => setTimeout(res, 900));
      }
    }
    setIsPlayingAudio(false);
  };

  const handleAnswerQuiz = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    if (idx === TAJWID_QUIZZES[currentQuizIdx].correctIndex) {
      setQuizScore((prev) => prev + 20);
      audioService.playSuccessChime();
    }
  };

  const handleNextQuiz = () => {
    setQuizAnswer(null);
    if (currentQuizIdx + 1 < TAJWID_QUIZZES.length) {
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIdx(0);
    setQuizAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-4">
      {/* Navigation Sub-Menu */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-x-auto text-xs font-bold">
        {[
          { id: 'makhraj' as const, label: '1. Makharijul Huruf' },
          { id: 'sifat' as const, label: '2. Sifat-Sifat Huruf' },
          { id: 'perbedaan' as const, label: '3. Huruf Berdekatan' },
          { id: 'hukum' as const, label: '4. Hukum Tajwid' },
          { id: 'praktik_warna' as const, label: '5. Praktik Ayat Warna' },
          { id: 'kuis' as const, label: '6. Kuis Uji Tajwid' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`py-1.5 px-3 rounded-lg whitespace-nowrap transition-all ${
              activeSection === item.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 1. SEKSI MAKHARIJUL HURUF & ANATOMI */}
      {activeSection === 'makhraj' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
            <span className="font-bold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Diagram Anatomi Titik Artikulasi (Makhraj):</span>
            </span>
            <p className="opacity-90">
              Makharijul Huruf adalah tempat-tempat keluarnya huruf saat dibunyikan. Sentuh titik organ pada diagram atau pilih dari daftar untuk mempelajari cara artikulasi yang benar.
            </p>
          </div>

          {/* Interactive SVG Diagram */}
          <MakhrajAnatomyDiagram
            regions={MAKHRAJ_REGIONS}
            selectedRegionId={selectedMakhraj.id}
            onSelectRegion={(r) => setSelectedMakhraj(r)}
          />

          {/* Region Selector Pills */}
          <div className="flex flex-wrap gap-1.5">
            {MAKHRAJ_REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedMakhraj(r)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  selectedMakhraj.id === r.id
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                }`}
              >
                {r.name.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Selected Region Detailed Spotlight Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Titik Artikulasi Terpilih
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {selectedMakhraj.name}
                </h3>
              </div>
              <span className="font-arabic text-2xl text-emerald-800 dark:text-emerald-300 font-bold">
                {selectedMakhraj.arabicName}
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {selectedMakhraj.description}
            </p>

            <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-700/60 text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                Cara Pelafalan (Artikulasi):
              </span>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                {selectedMakhraj.articulationDetail}
              </p>
            </div>

            {/* Audio Controls (Slow Motion & Repetition) */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 dark:text-amber-200">Kecepatan:</span>
                <button
                  onClick={() => setPlaybackRate(1.0)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    playbackRate === 1.0
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-700 border border-amber-300'
                  }`}
                >
                  1.0x Normal
                </button>
                <button
                  onClick={() => setPlaybackRate(0.75)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    playbackRate === 0.75
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-700 border border-amber-300'
                  }`}
                >
                  0.75x Lambat
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 dark:text-amber-200">Pengulangan:</span>
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRepeatCount(num)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      repeatCount === num
                        ? 'bg-amber-600 text-white'
                        : 'bg-white dark:bg-stone-800 text-stone-700 border border-amber-300'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            {/* Letters Grid in this Makhraj */}
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Huruf-Huruf yang Keluar dari Titik Ini (Sentuh untuk Suara):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMakhraj.letters.map((letter, idx) => (
                  <button
                    key={idx}
                    disabled={isPlayingAudio}
                    onClick={() => handlePlayLetter(letter, `Makhraj ${selectedMakhraj.name}`)}
                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 flex items-center gap-2 group transition-all"
                  >
                    <span className="font-arabic text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                      {letter}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Example Ayah */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Contoh Lafadz:</span>
                <span className="font-arabic text-lg text-stone-900 dark:text-white font-bold">
                  {selectedMakhraj.exampleAyah.arabic}
                </span>
                <span className="text-stone-500 text-[11px] block">
                  {selectedMakhraj.exampleAyah.latin} ({selectedMakhraj.exampleAyah.surah})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SEKSI SIFAT-SIFAT HURUF */}
      {activeSection === 'sifat' && (
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            Sifat huruf adalah karakteristik suara yang menyertai suatu huruf saat dilafalkan pada makhrajnya. Terbagi menjadi sifat berlawanan dan tanpa lawan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>1. Hams (هَمْس) vs Jahr (جَهْر)</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                <strong>Hams:</strong> Mengalirkan nafas karena lemahnya tekanan pada makhraj. Ada 10 huruf (فَحَثَّهُ شَخْصٌ سَكَتَ - Fa, Ha, Tsa, Ha, Syin, Kha, Shad, Sin, Kaf, Ta).<br />
                <strong>Jahr:</strong> Menahan nafas karena kuatnya tekanan pada makhraj (sisa huruf lainnya).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>2. Syiddah (شِدَّة) vs Rakhawah (رَخَاوَة)</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                <strong>Syiddah:</strong> Tertahannya suara (أَجِدُ قَطٍ بَكَتْ).<br />
                <strong>Tawassuth/Bainiyyah:</strong> Suara mengalir sedang (لِنْ عُمَر - Lam, Nun, \'Ain, Mim, Ra).<br />
                <strong>Rakhawah:</strong> Suara mengalir lepas (sisa huruf lainnya).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>3. Isti\'la (اِسْتِعْلَاء) vs Istifal (اِسْتِفَال)</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                <strong>Isti\'la (Tebal):</strong> Terangkatnya pangkal lidah ke langit-langit mulut (خُصَّ ضَغْطٍ قِظْ - Kha, Shad, Dhad, Ghain, Tha, Qaf, Zha).<br />
                <strong>Istifal (Tipis):</strong> Pangkal lidah mendatar di dasar mulut (sisa huruf).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>4. Sifat Tanpa Lawan Terpenting</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                <strong>Qalqalah:</strong> Pantulan suara saat sukun (ق ط ب ج د).<br />
                <strong>Shafir:</strong> Desis tajam seperti burung/lebah (ص, ز, س).<br />
                <strong>Tafasysyi:</strong> Angin menyebar luas di mulut (ش).<br />
                <strong>Istithalah:</strong> Pemanjangan suara dari tepi lidah ke depan (ض).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEKSI PERBEDAAN HURUF DENGAN MAKHRAJ BERDEKATAN */}
      {activeSection === 'perbedaan' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-500">
            Kompilasi huruf-huruf yang sering tertukar oleh lidah pembaca Indonesia karena makhrajnya yang sangat berdekatan.
          </p>

          <div className="space-y-3">
            {LETTER_DIFFERENCES.map((diff) => (
              <div
                key={diff.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                    {diff.letterNames}
                  </h4>
                  <div className="flex items-center gap-1">
                    {diff.letters.map((l, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-arabic text-base font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-800"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-900/60 rounded-xl">
                    <span className="font-bold text-stone-700 dark:text-stone-300 block mb-0.5">
                      Perbedaan Makhraj:
                    </span>
                    <p className="text-stone-600 dark:text-stone-400">{diff.makhrajDifference}</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-900/60 rounded-xl">
                    <span className="font-bold text-stone-700 dark:text-stone-300 block mb-0.5">
                      Perbedaan Sifat Suara:
                    </span>
                    <p className="text-stone-600 dark:text-stone-400">{diff.characteristicDifference}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200">
                  <strong>Kekeliruan Umum Pembaca:</strong> {diff.commonMistake}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Latihan Kontras:</span>
                    <span className="font-arabic text-base font-bold text-emerald-900 dark:text-emerald-200">
                      {diff.practiceExample.arabic}
                    </span>
                    <span className="text-stone-500 text-[11px] block">
                      ({diff.practiceExample.transliteration})
                    </span>
                  </div>
                  <button
                    onClick={() => audioService.speakHijaiyah(diff.practiceExample.arabic, diff.letterNames)}
                    className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dengar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SEKSI HUKUM TAJWID LENGKAP */}
      {activeSection === 'hukum' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-500">
            Kaidah hukum bacaan nun sukun, mim sukun, qalqalah, dan ragam mad menurut para ulama tajwid.
          </p>

          <div className="space-y-3">
            {TAJWID_RULES.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {rule.title}
                    </h4>
                  </div>
                  <span className="font-arabic text-base text-emerald-800 dark:text-emerald-300 font-bold">
                    {rule.arabicTitle}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">{rule.description}</p>
                <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Contoh:</span>
                    <span className="font-arabic text-base font-bold text-emerald-900 dark:text-emerald-200">
                      {rule.exampleArabic}
                    </span>
                    <span className="text-stone-500 text-[11px] block">({rule.exampleLatin})</span>
                  </div>
                  <div className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 p-2 rounded-lg font-medium text-[11px]">
                    <strong>Cara Baca:</strong> {rule.howToRead}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SEKSI PRAKTIK AYAT DENGAN PENANDA WARNA TAJWID */}
      {activeSection === 'praktik_warna' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 text-xs space-y-2">
            <span className="font-bold text-stone-900 dark:text-white block">
              Legenda Penanda Warna Tajwid:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Mad (Panjang 2-6 Harakat)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Ikhfa (Samar Dengung)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Qalqalah (Pantulan Suara)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                Ghunnah (Dengung Hidung)
              </span>
            </div>
          </div>

          {/* Verses Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COLOR_CODED_PRACTICE_VERSES.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVerse(v);
                  setSelectedWordId(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                  selectedVerse.id === v.id
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                QS. {v.surahName}: {v.ayahNumber}
              </button>
            ))}
          </div>

          {/* Interactive Colored Verse Board */}
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-5 shadow-xs">
            <span className="text-xs font-bold text-stone-400">
              Sentuh Tiap Kata untuk Melihat Hukum & Penjelasan Tajwidnya:
            </span>

            {/* Arabic Words Flex Container */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-4 dir-rtl" dir="rtl">
              {selectedVerse.words.map((word) => {
                const isSelected = selectedWordId === word.id;
                let colorClass = 'text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700';

                if (word.tajwidType === 'mad') {
                  colorClass = 'text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/40 border-rose-200';
                } else if (word.tajwidType === 'ikhfa') {
                  colorClass = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200';
                } else if (word.tajwidType === 'qalqalah') {
                  colorClass = 'text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 border-blue-200';
                } else if (word.tajwidType === 'ghunnah') {
                  colorClass = 'text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/40 border-amber-200';
                }

                return (
                  <button
                    key={word.id}
                    onClick={() => {
                      setSelectedWordId(word.id);
                      audioService.speakHijaiyah(word.arabic, word.latin);
                    }}
                    className={`px-3 py-2 rounded-xl border text-2xl font-arabic font-bold transition-all ${colorClass} ${
                      isSelected ? 'ring-2 ring-emerald-500 scale-105 shadow-md' : 'border-transparent'
                    }`}
                  >
                    {word.arabic}
                  </button>
                );
              })}
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic max-w-lg mx-auto">
              "{selectedVerse.translation}"
            </p>

            {/* Selected Word Detail Box */}
            {selectedWordId !== null && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 text-left space-y-1 text-xs animate-in fade-in">
                {(() => {
                  const word = selectedVerse.words.find((w) => w.id === selectedWordId);
                  if (!word) return null;
                  return (
                    <div>
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-emerald-200 dark:border-emerald-800">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200">
                          Lafadz: <span className="font-arabic text-lg">{word.arabic}</span> ({word.latin})
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                          {word.tajwidType === 'none' ? 'Kaidah Standar' : word.tajwidType?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-emerald-800 dark:text-emerald-300">
                        <strong>Uraian Kaidah:</strong> {word.tajwidExplanation}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. SEKSI KUIS TAJWID */}
      {activeSection === 'kuis' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
          {!quizFinished ? (
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 pb-3 border-b border-stone-100 dark:border-stone-700">
                <span className="font-bold">
                  Soal Tajwid {currentQuizIdx + 1} dari {TAJWID_QUIZZES.length}
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  Skor: {quizScore}
                </span>
              </div>

              <div className="py-4">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                  {TAJWID_QUIZZES[currentQuizIdx].question}
                </h3>
              </div>

              <div className="space-y-2">
                {TAJWID_QUIZZES[currentQuizIdx].options.map((opt, i) => {
                  const isSelected = quizAnswer === i;
                  const isCorrect = i === TAJWID_QUIZZES[currentQuizIdx].correctIndex;
                  let btnColor = 'bg-stone-50 dark:bg-stone-700/60 border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-stone-100';

                  if (quizAnswer !== null) {
                    if (isCorrect) {
                      btnColor = 'bg-emerald-600 text-white border-emerald-700 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnColor = 'bg-rose-600 text-white border-rose-700 font-bold';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={quizAnswer !== null}
                      onClick={() => handleAnswerQuiz(i)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnColor}`}
                    >
                      <span>{opt}</span>
                      {quizAnswer !== null && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>

              {quizAnswer !== null && (
                <div className="mt-4 p-3.5 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    <strong>Penjelasan Ulama:</strong> {TAJWID_QUIZZES[currentQuizIdx].explanation}
                  </p>
                  <button
                    onClick={handleNextQuiz}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Lanjut ke Soal Berikutnya →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <Award className="w-16 h-16 text-amber-500 mx-auto" />
              <h3 className="text-2xl font-black text-stone-900 dark:text-white">
                Alhamdulillah, Kuis Tajwid Selesai!
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Skor Anda: <strong className="text-emerald-700 dark:text-emerald-400 text-xl">{quizScore} / 100</strong>
              </p>
              <button
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Kuis Tajwid</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
