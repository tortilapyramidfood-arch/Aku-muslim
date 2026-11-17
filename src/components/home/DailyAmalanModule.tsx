import React, { useState } from 'react';
import { activityTracker } from '../../services/activityTracker';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Plus,
  Play,
  RotateCcw,
  BookOpen,
  Share2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export interface AmalanTask {
  id: string;
  title: string;
  category: 'harian' | 'bulanan' | 'lain';
  points: number;
  icon: string;
  isCompleted: boolean;
  actionText: string;
  progressText?: string;
  progressPercent?: number;
}

export const DailyAmalanModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'harian' | 'bulanan' | 'lain'>('harian');
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('akumuslim_user_points');
    return saved ? parseInt(saved, 10) : 360;
  });

  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    const saved = localStorage.getItem('akumuslim_daily_checkin');
    const today = new Date().toDateString();
    return saved === today;
  });

  const [tasks, setTasks] = useState<AmalanTask[]>([
    {
      id: 'task_tasbih',
      title: 'Pindahkan manik-manik 33 kali',
      category: 'harian',
      points: 100,
      icon: '📿',
      isCompleted: false,
      actionText: 'Pergi',
      progressText: '15 / 33',
      progressPercent: 45,
    },
    {
      id: 'task_sholat',
      title: 'Rekam sholat 1 kali',
      category: 'harian',
      points: 100,
      icon: '🧎‍♂️',
      isCompleted: false,
      actionText: 'Pergi',
    },
    {
      id: 'task_azkar',
      title: 'Baca Azakar 2 menit',
      category: 'harian',
      points: 100,
      icon: '📖',
      isCompleted: false,
      actionText: 'Pergi',
    },
    {
      id: 'task_quran',
      title: 'Baca Quran 2 menit',
      category: 'harian',
      points: 100,
      icon: '📗',
      isCompleted: false,
      actionText: 'Pergi',
      progressText: '1 / 2 menit',
      progressPercent: 50,
    },
    {
      id: 'task_share',
      title: 'Bagikan AkuMuslim',
      category: 'harian',
      points: 30,
      icon: '🌱',
      isCompleted: true,
      actionText: 'Selesai',
    },
  ]);

  // Handle Daily Checkin (+30 points)
  const handleDailyCheckin = () => {
    if (hasCheckedInToday) return;
    const newPoints = userPoints + 30;
    setUserPoints(newPoints);
    setHasCheckedInToday(true);
    localStorage.setItem('akumuslim_user_points', newPoints.toString());
    localStorage.setItem('akumuslim_daily_checkin', new Date().toDateString());

    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });
      activityTracker.recordAction({
        actionType: 'DAILY_CHECKIN',
        details: 'Tanda Masuk Harian (+30 Poin Semangat)',
        metadata: { pointsEarned: 30 },
      });
    } catch {
      // safe
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && !t.isCompleted) {
          const newPts = userPoints + t.points;
          setUserPoints(newPts);
          localStorage.setItem('akumuslim_user_points', newPts.toString());
          try {
            confetti({ particleCount: 40, spread: 45 });
          } catch {
            // safe
          }
          return { ...t, isCompleted: true, actionText: 'Selesai' };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      {/* 1. TOP CHECKIN BANNER (MATCHING SCREENSHOT 2: "TANDA MASUK HARIAN") */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0 border border-cyan-500/20">
            🌙
          </div>
          <div>
            <h3 className="text-sm font-black text-stone-900 dark:text-white">
              Tanda Masuk Harian
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-400">
                ⚡ +30
              </span>
              <span className="text-[11px] text-stone-400">
                Total Poin: <strong className="text-emerald-600">{userPoints}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDailyCheckin}
          disabled={hasCheckedInToday}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            hasCheckedInToday
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              : 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
          }`}
        >
          {hasCheckedInToday ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Sudah Masuk ✓</span>
            </>
          ) : (
            <span>Klaim +30</span>
          )}
        </button>
      </div>

      {/* 2. TABS: PERBUATAN HARIAN | PERBUATAN BULANAN | PERBUATAN LAIN (MATCHING SCREENSHOT 2) */}
      <div className="flex items-center gap-4 px-2 border-b border-stone-200 dark:border-stone-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('harian')}
          className={`pb-2.5 transition-all relative ${
            activeTab === 'harian'
              ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 font-black'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          Perbuatan Harian
        </button>
        <button
          onClick={() => setActiveTab('bulanan')}
          className={`pb-2.5 transition-all relative ${
            activeTab === 'bulanan'
              ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 font-black'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          Perbuatan Bulanan
        </button>
        <button
          onClick={() => setActiveTab('lain')}
          className={`pb-2.5 transition-all relative ${
            activeTab === 'lain'
              ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 font-black'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          Perbuatan Lain
        </button>
      </div>

      {/* 3. TASK LIST (MATCHING SCREENSHOT 2) */}
      <div className="space-y-3">
        {tasks
          .filter((t) => t.category === activeTab)
          .map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-emerald-400"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xl flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700">
                  {task.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-stone-900 dark:text-white truncate">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      ⚡ +{task.points}
                    </span>
                    {task.progressText && (
                      <span className="text-[10px] text-stone-400 font-mono">
                        ({task.progressText})
                      </span>
                    )}
                  </div>

                  {/* Progress bar if present */}
                  {task.progressPercent !== undefined && !task.isCompleted && (
                    <div className="w-full max-w-xs h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${task.progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: "Pergi" or "Selesai" (Green badge) */}
              <button
                onClick={() => handleCompleteTask(task.id)}
                disabled={task.isCompleted}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  task.isCompleted
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                }`}
              >
                {task.isCompleted ? 'Selesai ✓' : 'Pergi'}
              </button>
            </div>
          ))}
      </div>

      {/* Refresh info timestamp matching screenshot */}
      <div className="text-center text-[11px] text-stone-400 font-mono">
        Waktu penyegaran tugas: 05:00 WIB
      </div>
    </div>
  );
};
