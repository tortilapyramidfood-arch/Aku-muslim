import React, { useState } from 'react';
import { PRAYER_CITIES, calculatePrayerTimes } from '../../services/prayerTimeService';
import { Calendar as CalendarIcon, Clock, MapPin, X, ChevronLeft, ChevronRight, Bell, ShieldAlert, Sparkles } from 'lucide-react';

interface PrayerMonthlyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerMonthlyCalendarModal: React.FC<PrayerMonthlyCalendarModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('jakarta');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [displayMode, setDisplayMode] = useState<'calendar' | 'table'>('calendar');
  const [showAdzanPermissionModal, setShowAdzanPermissionModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCity = PRAYER_CITIES.find((c) => c.id === selectedCityId) || PRAYER_CITIES[0];
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Hijri approximation for reference
  const hijriMonthNames = [
    'Muharram', 'Safar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir', 'Jumadil Ula', 'Jumada al-Thani',
    'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawwal', 'Dzulqa\'dah', 'Dzulhijjah',
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Generate prayer schedule for all days in selected month
  const monthlySchedule = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(selectedYear, selectedMonth, day);
    const times = calculatePrayerTimes(date, currentCity);
    const hijriDay = ((day + 9) % 30) + 1;
    return {
      day,
      date,
      hijriDay,
      times,
    };
  });

  const today = new Date();
  const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                Jadwal Sholat Bulanan
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Waktu sholat akurat untuk wilayah Indonesia (Metode Hisab Kemenag RI).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdzanPermissionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20"
              title="Pratinjau & Izin Adzan"
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Pratinjau Adzan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* City Selector */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 focus:outline-hidden"
            >
              {PRAYER_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.timezone})
                </option>
              ))}
            </select>
          </div>

          {/* Month & Year Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 min-w-32 text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Display Mode Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-700 p-1 rounded-xl border border-stone-200 dark:border-stone-600">
            <button
              onClick={() => setDisplayMode('calendar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                displayMode === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Kalender
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                displayMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Tabel
            </button>
          </div>
        </div>

        {/* Content Body: Calendar or Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          {displayMode === 'calendar' ? (
            /* Mode 1: Kalender Grid Bulanan */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {monthlySchedule.map((item) => {
                const isToday = isCurrentMonth && item.day === today.getDate();
                return (
                  <div
                    key={item.day}
                    className={`p-2.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                      isToday
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-400/40 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-stone-100 dark:border-stone-700/60">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isToday ? 'bg-emerald-600 text-white' : 'text-stone-800 dark:text-stone-200'
                      }`}>
                        {item.day}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.hijriDay} H
                      </span>
                    </div>

                    <div className="space-y-0.5 text-[10px] font-mono tabular-nums text-stone-600 dark:text-stone-300">
                      <div className="flex justify-between">
                        <span>Subuh:</span>
                        <strong className="text-stone-800 dark:text-stone-100">{item.times.fajr}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Dzuhur:</span>
                        <strong className="text-stone-800 dark:text-stone-100">{item.times.dhuhr}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Ashar:</span>
                        <strong className="text-stone-800 dark:text-stone-100">{item.times.asr}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Maghrib:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400">{item.times.maghrib}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Isya:</span>
                        <strong className="text-stone-800 dark:text-stone-100">{item.times.isha}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Mode 2: Tabel Lengkap */
            <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs font-medium">
                <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="py-2.5 px-3">Tgl</th>
                    <th className="py-2.5 px-3">Hijriah</th>
                    <th className="py-2.5 px-3">Imsak</th>
                    <th className="py-2.5 px-3">Subuh</th>
                    <th className="py-2.5 px-3">Terbit</th>
                    <th className="py-2.5 px-3">Dzuhur</th>
                    <th className="py-2.5 px-3">Ashar</th>
                    <th className="py-2.5 px-3">Maghrib</th>
                    <th className="py-2.5 px-3">Isya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200 font-mono text-[11px] tabular-nums">
                  {monthlySchedule.map((item) => {
                    const isToday = isCurrentMonth && item.day === today.getDate();
                    return (
                      <tr
                        key={item.day}
                        className={isToday ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold' : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'}
                      >
                        <td className="py-2 px-3 font-sans font-bold">{item.day}</td>
                        <td className="py-2 px-3 text-stone-500">{item.hijriDay} Jumada al-Thani</td>
                        <td className="py-2 px-3 text-amber-600">{item.times.imsak}</td>
                        <td className="py-2 px-3">{item.times.fajr}</td>
                        <td className="py-2 px-3 text-stone-400">{item.times.sunrise}</td>
                        <td className="py-2 px-3">{item.times.dhuhr}</td>
                        <td className="py-2 px-3">{item.times.asr}</td>
                        <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400">{item.times.maghrib}</td>
                        <td className="py-2 px-3">{item.times.isha}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <span>* Jadwal dihitung berdasarkan koordinat geografis resmi Kementerian Agama RI.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-200"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Adzan Preview & Notification Modal (Matching Screenshot 5) */}
      {showAdzanPermissionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-stone-900 dark:text-white">
                Pratinjau & Notifikasi Adzan
              </h4>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Mohon aktifkan izin notifikasi dan jendela mengambang agar Anda dapat menerima pengingat adzan tepat waktu untuk sholat berikutnya. Semoga Allah memberkati Anda!
            </p>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Izin Pengingat Adzan
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-bold">
                Aktif
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAdzanPermissionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100"
              >
                Batalkan
              </button>
              <button
                onClick={() => {
                  if (typeof Notification !== 'undefined') {
                    Notification.requestPermission();
                  }
                  setShowAdzanPermissionModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
