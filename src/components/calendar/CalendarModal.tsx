import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  checkSunnahFast,
  getHijriDate,
  getUpcoming12HijriMonths,
  ISLAMIC_EVENTS,
} from '../../services/hijriService';
import { X, Calendar as CalendarIcon, Moon, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CalendarModal: React.FC = () => {
  const { showCalendarModal, setShowCalendarModal } = useApp();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const hijri = getHijriDate(today);
  const sunnahFast = checkSunnahFast(today);

  const months12 = useMemo(() => getUpcoming12HijriMonths(today), [todayIso]);
  const activeMonth = months12[selectedMonthIndex] || months12[0];

  if (!showCalendarModal) return null;

  const leadingEmptyDays = activeMonth?.days[0]?.dayOfWeek ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Kalender Hijriah 12 Bulan &amp; Puasa Sunnah
            </h2>
          </div>
          <button
            onClick={() => setShowCalendarModal(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Today Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                  Hari Ini
                </span>
                <h3 className="text-2xl font-black mt-0.5">{hijri.formatted}</h3>
                <p className="text-xs text-emerald-100 mt-1">
                  {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Moon className="w-10 h-10 text-amber-300 opacity-90" />
            </div>

            {sunnahFast.isFastDay && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-400/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">{sunnahFast.fastType}</span>: {sunnahFast.description}
                </div>
              </div>
            )}
          </div>

          {/* 12 Months Selector Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                12 Bulan Hijriah ke Depan
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedMonthIndex((i) => Math.max(0, i - 1))}
                  disabled={selectedMonthIndex === 0}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800"
                  aria-label="Bulan Hijriah Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedMonthIndex((i) => Math.min(months12.length - 1, i + 1))}
                  disabled={selectedMonthIndex >= months12.length - 1}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800"
                  aria-label="Bulan Hijriah Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {months12.map((m, idx) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMonthIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedMonthIndex === idx
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                  }`}
                >
                  {m.monthName} {m.year} H
                </button>
              ))}
            </div>
          </div>

          {/* Active Month Grid with Gregorian Equivalents */}
          {activeMonth && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-stone-900 dark:text-white">
                    {activeMonth.monthName} {activeMonth.year} H
                  </h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Padanan Masehi: {activeMonth.gregorianRangeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Puasa Sunnah
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" /> Hari Penting
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400">
                {WEEKDAY_LABELS.map((w) => (
                  <div key={w} className="py-1">{w}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: leadingEmptyDays }).map((_, i) => (
                  <div key={`empty_${i}`} className="h-12" />
                ))}
                {activeMonth.days.map((d) => {
                  const isToday = d.gregorianIso === todayIso;
                  return (
                    <div
                      key={d.gregorianIso}
                      title={`${d.hijriDay} ${activeMonth.monthName} ${activeMonth.year} H · ${d.gregorianShort}${d.islamicEventTitle ? ' · ' + d.islamicEventTitle : ''}${d.sunnahFastType ? ' · ' + d.sunnahFastType : ''}`}
                      className={`h-12 p-1 rounded-xl border flex flex-col items-center justify-between text-center transition-colors ${
                        isToday
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : d.islamicEventTitle
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                          : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-0.5 leading-none">
                        <span className="text-xs font-black tabular-nums">{d.hijriDay}</span>
                        {d.islamicEventTitle && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {d.sunnahFastType && !d.islamicEventTitle && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <span
                        className={`text-[9px] leading-none tabular-nums ${
                          isToday ? 'text-emerald-100' : 'text-stone-400'
                        }`}
                      >
                        {d.gregorianShort}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Events inside selected Hijri Month */}
              {activeMonth.events.length > 0 && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-700/70 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                    Hari Penting Islam di Bulan {activeMonth.monthName}:
                  </span>
                  {activeMonth.events.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800/60 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <strong className="text-stone-900 dark:text-white">{ev.title}</strong>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          {ev.hijriDateLabel} · {ev.gregorianFormatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">{ev.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Official Kemenag Notice */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <p>
              <strong>Ketetapan Resmi Indonesia:</strong> Penetapan 1 Ramadhan, 1 Syawwal (Idul Fitri), dan 10 Dzulhijjah (Idul Adha) secara resmi mengikuti hasil Sidang Isbat Kementerian Agama Republik Indonesia (Kemenag).
            </p>
          </div>

          {/* All Major Events Overview */}
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Ringkasan Hari Besar Islam Sepanjang Tahun
            </h4>
            <div className="space-y-2">
              {ISLAMIC_EVENTS.map((event, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {event.title}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      {event.hijriDate}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-[11px] text-stone-400 dark:text-stone-500 pt-1">
            Sumber: Kalender Hijriah Ummul Qura &amp; Ketetapan Sidang Isbat Kemenag RI · Pembaruan 2026
          </div>
        </div>
      </div>
    </div>
  );
};
