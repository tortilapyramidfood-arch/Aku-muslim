import React, { useState, useEffect } from 'react';
import { PRAYER_CITIES, calculatePrayerTimes } from '../../services/prayerTimeService';
import { activityTracker } from '../../services/activityTracker';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ShieldCheck,
  ChevronDown,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PrayerLogState {
  [dateStr: string]: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export const PrayerTrackerModule: React.FC = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>('jakarta');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isGregorianView, setIsGregorianView] = useState<boolean>(false);

  // Prayer logs persisted in localStorage
  const [prayerLogs, setPrayerLogs] = useState<PrayerLogState>(() => {
    const saved = localStorage.getItem('akumuslim_prayer_checkins');
    return saved ? JSON.parse(saved) : {};
  });

  const city = PRAYER_CITIES.find((c) => c.id === selectedCityId) || PRAYER_CITIES[0];
  const prayerTimes = calculatePrayerTimes(selectedDate, city);

  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const todayCheckin = prayerLogs[dateKey] || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };

  const handleTogglePrayer = (prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const updated = {
      ...prayerLogs,
      [dateKey]: {
        ...todayCheckin,
        [prayerName]: !todayCheckin[prayerName],
      },
    };
    setPrayerLogs(updated);
    localStorage.setItem('akumuslim_prayer_checkins', JSON.stringify(updated));

    if (!todayCheckin[prayerName]) {
      try {
        activityTracker.recordAction({
          actionType: 'PRAYER_CHECKIN',
          details: `Mencatat sholat ${prayerName.toUpperCase()} pada ${dateKey}`,
          metadata: { prayer: prayerName, date: dateKey },
        });
      } catch {
        // safe
      }
    }
  };

  // Calculate stats
  let totalPrayersLogged = 0;
  let activeDaysLogged = 0;
  Object.keys(prayerLogs).forEach((key) => {
    const day = prayerLogs[key];
    const completed = [day.fajr, day.dhuhr, day.asr, day.maghrib, day.isha].filter(Boolean).length;
    if (completed > 0) {
      activeDaysLogged++;
      totalPrayersLogged += completed;
    }
  });

  // Calculate current streak
  let currentStreak = 0;
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const log = prayerLogs[k];
    if (log && (log.fajr || log.dhuhr || log.asr || log.maghrib || log.isha)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Days in month for calendar grid
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const hijriDay = ((dayNum + 9) % 30) + 1;
    const k = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayLog = prayerLogs[k];
    const isToday = dayNum === new Date().getDate() && currentMonth === new Date().getMonth();
    const isSelected = dayNum === selectedDate.getDate();
    return {
      dayNum,
      hijriDay,
      isToday,
      isSelected,
      completedCount: dayLog ? [dayLog.fajr, dayLog.dhuhr, dayLog.asr, dayLog.maghrib, dayLog.isha].filter(Boolean).length : 0,
    };
  });

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      {/* 1. HEADER SECTION (MATCHING SCREENSHOT 3) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-stone-900 dark:to-stone-950 border border-emerald-100 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center sm:text-left">
          {/* Streak Counter with Laurel Branches */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-2xl text-emerald-600">🌿</span>
            <span className="text-4xl font-black font-mono text-emerald-800 dark:text-emerald-400">
              {currentStreak}
            </span>
            <span className="text-2xl text-emerald-600">🌿</span>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300 ml-1">
              Sholat Berurutan
            </span>
          </div>

          {/* 3 Accumulation Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-center">
              <span className="font-mono text-sm font-black text-stone-900 dark:text-white block">
                {activeDaysLogged} hari
              </span>
              <span className="text-[10px] text-stone-500 block">Akumulasi Hari</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-center">
              <span className="font-mono text-sm font-black text-stone-900 dark:text-white block">
                {totalPrayersLogged} kali
              </span>
              <span className="text-[10px] text-stone-500 block">Akumulasi Waktu</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-center">
              <span className="font-mono text-sm font-black text-stone-900 dark:text-white block">
                {totalPrayersLogged * 10} m
              </span>
              <span className="text-[10px] text-stone-500 block">Akumulasi Durasi</span>
            </div>
          </div>
        </div>

        {/* 3D Islamic Illustration Placeholder / Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-4xl shadow-md border-2 border-emerald-400/40 shrink-0">
          🧎‍♂️
        </div>
      </div>

      {/* 2. DAILY 5 PRAYERS ROW (MATCHING SCREENSHOT 3) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        {/* Month Title & Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              Hari ini
            </span>
            <div>
              <span className="text-xs font-black text-stone-900 dark:text-white block">
                Jumada al-Thani, 1448
              </span>
              <span className="text-[10px] text-stone-400">
                November-Desember, 2026
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsGregorianView(!isGregorianView)}
            className="flex items-center gap-1 text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isGregorianView ? 'Hijriah' : 'Gregorian'}</span>
          </button>
        </div>

        {/* 5 Daily Prayer Columns: Fajr, Dhuhr, Asr, Maghrib, Isha */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'fajr' as const, label: 'Fajr', time: prayerTimes.fajr },
            { id: 'dhuhr' as const, label: 'Dhuhr', time: prayerTimes.dhuhr },
            { id: 'asr' as const, label: 'Asr', time: prayerTimes.asr },
            { id: 'maghrib' as const, label: 'Maghrib', time: prayerTimes.maghrib },
            { id: 'isha' as const, label: 'Isha', time: prayerTimes.isha },
          ].map((prayer) => {
            const isDone = todayCheckin[prayer.id];
            return (
              <div
                key={prayer.id}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                  isDone
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-400'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40'
                }`}
              >
                <div>
                  <span className="w-5 h-5 mx-auto rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[10px] text-stone-500 mb-1">
                    {isDone ? '✓' : '–'}
                  </span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block truncate">
                    {prayer.label}
                  </span>
                  <span className="font-mono text-[11px] text-stone-500 block my-0.5">
                    {prayer.time}
                  </span>
                </div>

                <button
                  onClick={() => handleTogglePrayer(prayer.id)}
                  className={`mt-2 py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all w-full ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
                  }`}
                >
                  {isDone ? 'Sudah ✓' : 'Belum'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CALENDAR MONTHLY DUAL-DATE GRID (MATCHING SCREENSHOT 3) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
          <span>Kalender Sholat Bulan Ini:</span>
          <span className="text-emerald-600 font-mono">
            {activeDaysLogged} / {daysInMonth} Hari Tercatat
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {calendarDays.map((d) => (
            <button
              key={d.dayNum}
              onClick={() => {
                const nextDate = new Date(currentYear, currentMonth, d.dayNum);
                setSelectedDate(nextDate);
              }}
              className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                d.isToday
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : d.isSelected
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {/* Hijri Day on top */}
              <span className="font-mono text-xs font-bold leading-none">
                {d.hijriDay}
              </span>
              {/* Gregorian Day below */}
              <span className={`text-[10px] mt-0.5 leading-none ${d.isToday ? 'text-emerald-200' : 'text-stone-400'}`}>
                {d.dayNum}
              </span>

              {/* Dot if recorded */}
              {d.completedCount > 0 && !d.isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PRIVACY NOTICE (STRICTLY PRIVATE AS MANDATED BY OWNER) */}
      <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex items-center gap-2.5 text-xs text-stone-500 dark:text-stone-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Privasi Dijamin:</strong> Catatan sholat disimpan 100% secara lokal dan privat di perangkat Anda. Tidak ada papan peringkat publik atau perbandingan dengan pengguna lain.
        </span>
      </div>
    </div>
  );
};
