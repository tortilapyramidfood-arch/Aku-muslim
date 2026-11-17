import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  BookOpen,
  Award,
  Heart,
  Volume2,
  CheckCircle,
  Lock,
  ArrowRight,
  Smile,
} from 'lucide-react';

export const KidsHome: React.FC = () => {
  const { setActiveTab, setMode, settings, nextPrayer } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Daily deeds checklist for children
  const [dailyDeeds, setDailyDeeds] = useState([
    { id: 1, text: 'Mengerjakan Sholat Tepat Waktu', done: true },
    { id: 2, text: 'Membantu Ayah dan Ibu di Rumah', done: false },
    { id: 3, text: 'Membaca atau Mendengar 1 Surah Pendek', done: false },
    { id: 4, text: 'Tersenyum & Bersikap Sopan ke Teman', done: true },
  ]);

  const toggleDeed = (id: number) => {
    audioService.playTasbihClick();
    setDailyDeeds((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextState = !d.done;
          if (nextState) {
            audioService.playSuccessChime();
            try {
              confetti({ particleCount: 30, spread: 60 });
            } catch {
              // Ignore
            }
          }
          return { ...d, done: nextState };
        }
        return d;
      })
    );
  };

  const handleUnlockPin = () => {
    const correctPin = settings.parentPin || '1234';
    if (pinInput === correctPin) {
      setMode('umum');
      setShowPinModal(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Cheerful Kids Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 text-stone-900 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider bg-white/80 px-2.5 py-0.5 rounded-full text-amber-800">
              🌟 Ruang Anak Sholeh
            </span>
            <button
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold bg-white/90 text-stone-700 px-2.5 py-1 rounded-full shadow-xs hover:bg-white"
            >
              <Lock className="w-3 h-3 text-stone-500" />
              <span>Keluar Mode Anak</span>
            </button>
          </div>

          <h1 className="text-2xl font-black mt-2 text-stone-950">
            Assalamu'alaikum, Sobat Juara! ✨
          </h1>
          <p className="text-xs font-semibold text-stone-800 mt-1">
            Waktu sholat berikutnya adalah <strong>{nextPrayer.name}</strong> ({nextPrayer.time}). Ayo kumpulkan pahala kebaikan hari ini!
          </p>
        </div>
      </div>

      {/* 4 Fun Learning Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab('belajar')}
          className="p-4 rounded-3xl bg-emerald-500 text-white text-left shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-32"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-arabic text-2xl text-amber-200">
            ا ب ت
          </div>
          <div>
            <h3 className="text-sm font-black">Huruf Hijaiyah</h3>
            <span className="text-[11px] text-emerald-100 font-medium">Belajar suara & makhraj</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('belajar')}
          className="p-4 rounded-3xl bg-sky-500 text-white text-left shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-32"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-black">Kuis Pintar</h3>
            <span className="text-[11px] text-sky-100 font-medium">Kumpulkan bintang & poin</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('belajar')}
          className="p-4 rounded-3xl bg-amber-500 text-white text-left shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-32"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black">Kisah 25 Nabi</h3>
            <span className="text-[11px] text-amber-100 font-medium">Teladan akhlak mulia</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('quran')}
          className="p-4 rounded-3xl bg-purple-500 text-white text-left shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-32"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-sm font-black">Al-Qur'an Juz Amma</h3>
            <span className="text-[11px] text-purple-100 font-medium">An-Nas, Al-Falaq, Al-Ikhlas</span>
          </div>
        </button>
      </div>

      {/* Daily Deeds Checklist (Misi Kebaikan) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-stone-800 border-2 border-amber-200 dark:border-stone-700 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-black text-stone-900 dark:text-white">
            Misi Kebaikan Anak Sholeh Hari Ini
          </h2>
        </div>

        <div className="space-y-2">
          {dailyDeeds.map((deed) => (
            <button
              key={`kid_deed_${deed.id}`}
              onClick={() => toggleDeed(deed.id)}
              className={`w-full p-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                deed.done
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-stone-50 dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600'
              }`}
            >
              <span>{deed.text}</span>
              <CheckCircle
                className={`w-4 h-4 ${deed.done ? 'text-emerald-600' : 'text-stone-300'}`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Parental PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Pengawasan Orang Tua
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Masukkan PIN orang tua untuk beralih ke Mode Umum (Default: 1234)
              </p>
            </div>

            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-xl tracking-widest font-mono py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
            />

            {pinError && (
              <p className="text-xs text-rose-600 font-bold">
                PIN salah. Silakan coba lagi.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={handleUnlockPin}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
              >
                Buka
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
