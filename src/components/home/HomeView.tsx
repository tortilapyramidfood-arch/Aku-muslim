import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INDONESIA_CITIES } from '../../services/prayerTimeService';
import { getHijriDate, checkSunnahFast } from '../../services/hijriService';
import { audioService } from '../../services/audioService';
import { DailyAmalanModule } from './DailyAmalanModule';
import {
  MapPin,
  Clock,
  Compass,
  BookOpen,
  Volume2,
  VolumeX,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Crosshair,
  HeartHandshake,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    mode,
    selectedCity,
    setSelectedCity,
    requestGPSLocation,
    prayerTimes,
    nextPrayer,
    lastRead,
    setActiveTab,
    setShowQiblaModal,
    setShowCalendarModal,
    announcements,
    dismissAnnouncement,
  } = useApp();

  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isPlayingAdzan, setIsPlayingAdzan] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  const today = new Date();
  const hijri = getHijriDate(today);
  const sunnahFast = checkSunnahFast(today);

  const isAnak = mode === 'anak';

  const prayerItems = [
    { name: 'Subuh', time: prayerTimes.subuh },
    { name: 'Terbit', time: prayerTimes.terbit },
    { name: 'Dzuhur', time: prayerTimes.dzuhur },
    { name: 'Ashar', time: prayerTimes.ashar },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isya', time: prayerTimes.isya },
  ];

  const handleToggleAdzan = () => {
    if (isPlayingAdzan) {
      audioService.stopAdzan();
      setIsPlayingAdzan(false);
    } else {
      setIsPlayingAdzan(true);
      audioService.playAdzan('makkah', () => {
        setIsPlayingAdzan(false);
      });
    }
  };

  const handleGPSClick = async () => {
    setIsLocatingGPS(true);
    await requestGPSLocation();
    setIsLocatingGPS(false);
    setShowCityPicker(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Active Announcement Banner */}
      {announcements.length > 0 && announcements[0].isActive && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{announcements[0].title}</p>
              <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">{announcements[0].message}</p>
            </div>
          </div>
          <button
            onClick={() => dismissAnnouncement(announcements[0].id)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-black text-stone-900 dark:text-white text-xl">
            {isAnak ? 'Halo Sobat Sholeh & Sholehah!' : "Assalamu'alaikum Warahmatullahi Wabarakatuh"}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400">
            <span>{today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{hijri.formatted}</span>
            </button>
          </div>
        </div>

        {/* Location Selector Button */}
        <div className="relative">
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700/60 shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[140px]">{selectedCity.name}</span>
            <span className="text-[10px] text-stone-400">({selectedCity.timezone})</span>
          </button>

          {/* City Selection Dropdown Modal */}
          {showCityPicker && (
            <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl z-50 p-2 space-y-1">
              <button
                onClick={handleGPSClick}
                disabled={isLocatingGPS}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg hover:bg-emerald-100"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                <span>{isLocatingGPS ? 'Mencari Koordinat GPS...' : 'Gunakan Lokasi GPS Perangkat'}</span>
              </button>

              <div className="pt-1 pb-0.5 px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Pilih Kota di Indonesia:
              </div>

              {INDONESIA_CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCity(city);
                    setShowCityPicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                    selectedCity.id === city.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <span>{city.name}</span>
                  <span className={`text-[10px] ${selectedCity.id === city.id ? 'text-emerald-100' : 'text-stone-400'}`}>
                    {city.timezone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sunnah Fasting Alert if applicable today */}
      {sunnahFast.isFastDay && (
        <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Hari ini disunnahkan: <strong>{sunnahFast.fastType}</strong></span>
          </div>
          <button
            onClick={() => setShowCalendarModal(true)}
            className="text-amber-800 dark:text-amber-300 underline font-semibold"
          >
            Lihat Jadwal
          </button>
        </div>
      )}

      {/* Hero Prayer Countdown Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-5 sm:p-6 shadow-xl border border-emerald-700/40">
        {/* Subtle decorative Islamic arch geometric SVG backdrop */}
        <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <path d="M50 0 C65 20, 90 40, 90 70 C90 90, 70 100, 50 100 C30 100, 10 90, 10 70 C10 40, 35 20, 50 0 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Menuju Sholat Berikutnya</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-black text-amber-300">
                {nextPrayer.name}
              </h2>
              <span className="text-lg sm:text-xl font-bold text-emerald-100 tabular-nums">
                {nextPrayer.time} {selectedCity.timezone}
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-200">
              Sisa Waktu: <strong className="text-white font-mono tabular-nums text-sm">{nextPrayer.remainingFormatted}</strong>
            </p>
          </div>

          {/* Adzan Preview Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAdzan}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                isPlayingAdzan
                  ? 'bg-amber-400 text-stone-900 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/40'
              }`}
            >
              {isPlayingAdzan ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAdzan ? 'Hentikan Adzan' : 'Dengar Adzan'}</span>
            </button>
          </div>
        </div>

        {/* 5 Prayer Times Horizontal Grid */}
        <div className="relative z-10 mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {prayerItems.map((p) => {
            const isTarget = nextPrayer.name === p.name;
            return (
              <div
                key={p.name}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                  isTarget
                    ? 'bg-amber-400/20 border border-amber-300/80 shadow-inner'
                    : 'bg-emerald-950/40 border border-emerald-700/30'
                }`}
              >
                <span className={`text-[11px] font-medium ${isTarget ? 'text-amber-300 font-bold' : 'text-emerald-200'}`}>
                  {p.name}
                </span>
                <span className="text-sm font-bold text-white tabular-nums mt-0.5">
                  {p.time}
                </span>
              </div>
            );
          })}
        </div>

        <p className="relative z-10 mt-3 text-[11px] text-emerald-200/80 flex flex-wrap items-center justify-between gap-1">
          <span>Sumber: Hisab Kemenag RI · Elevasi & Koordinat Astronomis</span>
          <span>Pembaruan: {prayerTimes.date}</span>
        </p>
      </div>

      {/* Last Read Progress Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Lanjutkan Membaca
            </span>
            <p className="text-sm font-bold text-stone-900 dark:text-white">
              Surah {lastRead.surahName} : Ayat {lastRead.ayahNumber}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('quran')}
          className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
        >
          <span>Buka</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Target Kebaikan & Poin Semangat (Daily Amalan & Check-in) */}
      <DailyAmalanModule />
    </div>
  );
};
