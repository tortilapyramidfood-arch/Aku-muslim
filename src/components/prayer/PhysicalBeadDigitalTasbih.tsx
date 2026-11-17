import React, { useState } from 'react';
import { audioService } from '../../services/audioService';
import { activityTracker } from '../../services/activityTracker';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  ChevronDown,
  CheckCircle2,
  Eye,
  Settings,
} from 'lucide-react';

export interface DzikirPreset {
  id: string;
  arabic: string;
  latin: string;
  meaning: string;
  defaultTarget: number;
}

export const DZIKIR_PRESETS: DzikirPreset[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    latin: 'Subhanallah',
    meaning: 'Maha Suci Allah',
    defaultTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    latin: 'Alhamdulillah',
    meaning: 'Segala puji bagi Allah',
    defaultTarget: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    latin: 'Allahu Akbar',
    meaning: 'Allah Maha Besar',
    defaultTarget: 33,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    latin: 'Astaghfirullah',
    meaning: 'Aku memohon ampun kepada Allah',
    defaultTarget: 100,
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    latin: 'Laa ilaha illallah',
    meaning: 'Tiada Tuhan selain Allah',
    defaultTarget: 100,
  },
  {
    id: 'shalawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ',
    latin: 'Allahumma shalli \'ala sayyidina Muhammad',
    meaning: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad',
    defaultTarget: 100,
  },
];

export const PhysicalBeadDigitalTasbih: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [selectedPreset, setSelectedPreset] = useState<DzikirPreset>(DZIKIR_PRESETS[0]);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(true);
  const [totalAccumulated, setTotalAccumulated] = useState<number>(() => {
    const saved = localStorage.getItem('akumuslim_tasbih_total');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [beadAngle, setBeadAngle] = useState<number>(0);
  const [isLargeCounter, setIsLargeCounter] = useState<boolean>(false);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    const newTotal = totalAccumulated + 1;
    setTotalAccumulated(newTotal);
    localStorage.setItem('akumuslim_tasbih_total', newTotal.toString());

    // Rotate beads by 1 step (360 / 33 = ~10.9 degrees)
    setBeadAngle((prev) => prev + 10.9);

    // Audio click
    if (isSoundEnabled) {
      audioService.playTasbihClick();
    }

    // Haptic feedback
    if (isHapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (newCount === target) {
        navigator.vibrate([40, 60, 40]); // Double buzz on completion
      } else {
        navigator.vibrate(15);
      }
    }

    // Chime when target is achieved
    if (newCount === target) {
      audioService.playSuccessChime();
      try {
        activityTracker.recordAction({
          actionType: 'TASBIH_CYCLE',
          details: `Menyelesaikan putaran dzikir ${selectedPreset.latin} (${target}x)`,
          metadata: { dzikir: selectedPreset.id, count: target },
        });
      } catch {
        // safe
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleSelectPreset = (preset: DzikirPreset) => {
    setSelectedPreset(preset);
    setTarget(preset.defaultTarget);
    setCount(0);
  };

  const progressPercent = Math.min(100, Math.round((count / target) * 100));

  // Render 33 physical bead circles around circumference
  const beads = Array.from({ length: 33 }, (_, i) => {
    const angle = (i * (360 / 33) * Math.PI) / 180;
    const radius = 115; // px from center
    const x = Math.round(140 + radius * Math.cos(angle));
    const y = Math.round(140 + radius * Math.sin(angle));
    const isCurrentActive = i === (count % 33);
    return { id: i, x, y, isCurrentActive };
  });

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Top Presets & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80">
        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPreset.id}
            onChange={(e) => {
              const p = DZIKIR_PRESETS.find((item) => item.id === e.target.value);
              if (p) handleSelectPreset(p);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 focus:outline-hidden"
          >
            {DZIKIR_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.latin} ({p.defaultTarget}x)
              </option>
            ))}
          </select>
        </div>

        {/* Toggles: Sound, Haptic, Angka Besar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              isSoundEnabled
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-400'
                : 'text-stone-400 border-stone-200 dark:border-stone-700'
            }`}
            title="Suara Klik"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsHapticEnabled(!isHapticEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              isHapticEnabled
                ? 'bg-amber-500/10 text-amber-700 border-amber-400'
                : 'text-stone-400 border-stone-200 dark:border-stone-700'
            }`}
            title="Getaran Haptik"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLargeCounter(!isLargeCounter)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isLargeCounter
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            {isLargeCounter ? 'Angka Besar: ON' : 'Angka Besar'}
          </button>
        </div>
      </div>

      {/* Dzikir Text Display Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white text-center shadow-lg space-y-2 border border-emerald-600/30">
        <h2 className="font-arabic text-3xl sm:text-4xl text-amber-300 font-bold leading-normal">
          {selectedPreset.arabic}
        </h2>
        <div className="text-base font-bold text-emerald-100">
          {selectedPreset.latin}
        </div>
        <p className="text-xs text-emerald-200/80">
          "{selectedPreset.meaning}"
        </p>
      </div>

      {/* Target Selector Pills */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs font-bold text-stone-400 mr-1">Target:</span>
        {[33, 99, 100].map((t) => (
          <button
            key={`tasbih_target_${t}`}
            onClick={() => {
              setTarget(t);
              setCount(0);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              target === t
                ? 'bg-amber-400 text-stone-900 border-amber-500 shadow-xs font-black'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-400'
            }`}
          >
            {t}x
          </button>
        ))}
      </div>

      {/* PHYSICAL BEAD STRING TASBIH (MENYERUPAI TASBIH FISIK ASLI) */}
      <div className="flex flex-col items-center justify-center py-4">
        <div
          onClick={handleIncrement}
          className="relative w-72 h-72 rounded-full cursor-pointer select-none active:scale-98 transition-transform flex items-center justify-center group"
          title="Sentuh untuk menghitung butiran tasbih"
        >
          {/* Circular SVG of Physical Beads that rotate on touch */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200"
            style={{ transform: `rotate(${beadAngle}deg)` }}
            viewBox="0 0 280 280"
          >
            {/* Tasbih Cord String */}
            <circle
              cx="140"
              cy="140"
              r="115"
              fill="none"
              stroke="#047857"
              strokeWidth="3"
              strokeDasharray="4 2"
              className="opacity-40"
            />

            {/* 33 Round Physical Beads */}
            {beads.map((bead) => (
              <g key={bead.id} transform={`translate(${bead.x}, ${bead.y})`}>
                {/* Bead Shadow */}
                <circle cx="1" cy="2" r="8" fill="rgba(0,0,0,0.25)" />
                {/* Bead Body (Emerald and Gold gradient look) */}
                <circle
                  cx="0"
                  cy="0"
                  r="7.5"
                  fill={bead.isCurrentActive ? '#f59e0b' : '#047857'}
                  stroke={bead.isCurrentActive ? '#fbbf24' : '#10b981'}
                  strokeWidth="1.5"
                />
                {/* Specular Highlight on Bead */}
                <circle
                  cx="-2"
                  cy="-2"
                  r="2"
                  fill="rgba(255,255,255,0.7)"
                />
              </g>
            ))}
          </svg>

          {/* Central Large Digital Counter Hub */}
          <div
            className={`w-40 h-40 rounded-full bg-gradient-to-br from-emerald-800 to-teal-950 border-4 border-amber-400/80 shadow-2xl flex flex-col items-center justify-center text-white z-10 p-4 transition-all ${
              count === target ? 'ring-4 ring-amber-400 animate-pulse' : 'group-hover:border-amber-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Putaran ke-{Math.floor(count / target) + 1}
            </span>
            <span
              className={`font-black font-mono tracking-tight my-0.5 text-white ${
                isLargeCounter ? 'text-5xl' : 'text-4xl'
              }`}
            >
              {count}
            </span>
            <span className="text-xs font-mono text-emerald-200 font-bold">
              / {target}
            </span>

            {/* Mini Progress Ring indicator */}
            <span className="text-[9px] text-amber-300 mt-1 font-semibold">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Prompt */}
        <span className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-medium">
          Sentuh lingkaran untuk Bertasbih
        </span>
      </div>

      {/* Action Footer: Reset, Catat, Total Accumulated */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Total Tasbih Disimpan:
          </span>
          <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">
            {totalAccumulated.toLocaleString('id-ID')} Kali
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (count > 0) {
                try {
                  activityTracker.recordAction({
                    actionType: 'TASBIH_CYCLE',
                    details: `Mencatat dzikir ${selectedPreset.latin} (${count}x)`,
                    metadata: { dzikir: selectedPreset.id, count },
                  });
                } catch {
                  // safe
                }
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all active:scale-95"
            title="Catat bacaan tasbih ke amalan harian"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Catat Tasbih</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Putaran</span>
          </button>
        </div>
      </div>
    </div>
  );
};
