import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { ZakatCalculator } from '../zakat/ZakatCalculator';
import { AdzanNotificationSettingsModal } from './AdzanNotificationSettingsModal';
import { PhysicalBeadDigitalTasbih } from './PhysicalBeadDigitalTasbih';
import { PrayerTrackerModule } from './PrayerTrackerModule';
import { PrayerGuideModule } from './PrayerGuideModule';
import { ModernQiblaCompass } from '../qibla/ModernQiblaCompass';
import { NearbyMosqueLocator } from './NearbyMosqueLocator';
import { DuaLibraryModule } from '../dua/DuaLibraryModule';
import { AsmaulHusnaModule } from './AsmaulHusnaModule';
import { HadithLibraryModule } from './HadithLibraryModule';
import { HajjUmrahGuideModule } from './HajjUmrahGuideModule';
import { VerifiedDonationModule } from '../charity/VerifiedDonationModule';
import { PrayerMonthlyCalendarModal } from './PrayerMonthlyCalendarModal';
import { MuhasabahDiaryModule } from '../muhasabah/MuhasabahDiaryModule';
import {
  Clock,
  Volume2,
  VolumeX,
  Compass,
  Calendar,
  Bell,
  BellOff,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Sparkles,
  BookOpen,
  Heart,
  ScrollText,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Lock,
} from 'lucide-react';

export type PrayerSubView =
  | 'jadwal'
  | 'pelacak'
  | 'tasbih'
  | 'tuntunan'
  | 'kiblat'
  | 'masjid'
  | 'doa'
  | 'asmaul_husna'
  | 'hadits'
  | 'haji_umrah'
  | 'donasi'
  | 'zakat'
  | 'muhasabah';

interface IbadahButtonItem {
  id: PrayerSubView;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
}

export const PrayerView: React.FC = () => {
  const {
    prayerTimes,
    nextPrayer,
    selectedCity,
    settings,
    updateSettings,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<PrayerSubView | null>(() => {
    const requested = localStorage.getItem('akumuslim_open_ibadah_subview') as PrayerSubView | null;
    if (requested) {
      localStorage.removeItem('akumuslim_open_ibadah_subview');
      return requested;
    }
    return null;
  });
  const initialSound = settings.adzanSound === 'madinah' ? 'madinah' : settings.adzanSound === 'beep' ? 'beep' : 'makkah';
  const [adzanType, setAdzanType] = useState<'makkah' | 'madinah' | 'beep'>(initialSound);
  const [isPlayingAdzan, setIsPlayingAdzan] = useState(false);
  const [showAdzanModal, setShowAdzanModal] = useState(false);
  const [showMonthlyCalendarModal, setShowMonthlyCalendarModal] = useState(false);

  useEffect(() => {
    const requested = localStorage.getItem('akumuslim_open_ibadah_subview') as PrayerSubView | null;
    if (requested) {
      localStorage.removeItem('akumuslim_open_ibadah_subview');
      setActiveSubView(requested);
    }
  }, []);

  const handleToggleAdzan = () => {
    if (isPlayingAdzan) {
      audioService.stopAdzan();
      setIsPlayingAdzan(false);
    } else {
      setIsPlayingAdzan(true);
      audioService.playAdzan(adzanType, () => {
        setIsPlayingAdzan(false);
      });
    }
  };

  const toggleNotification = (prayer: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya') => {
    const current = settings.notificationEnabled || {
      subuh: true,
      dzuhur: true,
      ashar: true,
      maghrib: true,
      isya: true,
    };
    updateSettings({
      notificationEnabled: {
        ...current,
        [prayer]: !current[prayer],
      },
    });
  };

  // 12 TOMBOL UTAMA KEPUTUSAN FINAL OWNER DALAM 3 KELOMPOK VISUAL
  const GROUP_1_SHOLAT_MASJID: IbadahButtonItem[] = [
    {
      id: 'jadwal',
      number: '01',
      title: 'Jadwal Sholat',
      description: 'Waktu sholat harian, kalender bulanan & adzan tepat waktu',
      icon: <Calendar className="w-6 h-6" />,
      bgGradient: 'from-emerald-800 to-teal-900',
      borderColor: 'border-emerald-600/40',
      iconColor: 'text-amber-300',
    },
    {
      id: 'pelacak',
      number: '02',
      title: 'Catatan Sholat',
      description: 'Pencatatan 5 waktu sholat & riwayat privat di perangkat',
      icon: <CheckCircle2 className="w-6 h-6" />,
      bgGradient: 'from-emerald-900 to-stone-900',
      borderColor: 'border-emerald-700/40',
      iconColor: 'text-emerald-300',
    },
    {
      id: 'tasbih',
      number: '03',
      title: 'Tasbih Fisik',
      description: 'Tasbih digital 33 butir manik fisik dengan respon getar',
      icon: <Sparkles className="w-6 h-6" />,
      bgGradient: 'from-teal-900 to-emerald-950',
      borderColor: 'border-teal-600/40',
      iconColor: 'text-amber-200',
    },
    {
      id: 'tuntunan',
      number: '04',
      title: 'Tata Cara Sholat',
      description: '13 rukun sholat, 5 syarat sah, sunnah & wudhu standar Kemenag',
      icon: <BookOpen className="w-6 h-6" />,
      bgGradient: 'from-emerald-950 to-stone-900',
      borderColor: 'border-emerald-500/40',
      iconColor: 'text-emerald-200',
    },
    {
      id: 'kiblat',
      number: '05',
      title: 'Arah Kiblat',
      description: 'Kompas geodesik akurat mengarah langsung ke Ka\'bah Makkah',
      icon: <Compass className="w-6 h-6" />,
      bgGradient: 'from-stone-900 to-emerald-900',
      borderColor: 'border-stone-700/60',
      iconColor: 'text-amber-300',
    },
    {
      id: 'masjid',
      number: '06',
      title: 'Masjid Terdekat',
      description: 'Pencarian masjid & musholla terdekat dengan tautan navigasi',
      icon: <Navigation className="w-6 h-6" />,
      bgGradient: 'from-emerald-900 to-teal-950',
      borderColor: 'border-emerald-700/40',
      iconColor: 'text-teal-300',
    },
  ];

  const GROUP_2_DOA_PENGETAHUAN: IbadahButtonItem[] = [
    {
      id: 'doa',
      number: '07',
      title: 'Doa Harian',
      description: 'Kumpulan doa harian shahih berdasarkan aktivitas sehari-hari',
      icon: <HeartHandshake className="w-6 h-6" />,
      bgGradient: 'from-emerald-800 to-stone-900',
      borderColor: 'border-emerald-600/40',
      iconColor: 'text-emerald-300',
    },
    {
      id: 'asmaul_husna',
      number: '08',
      title: 'Asmaul Husna',
      description: '99 Asmaul Husna lengkap dengan makna dan keutamaan dzikir',
      icon: <Sparkles className="w-6 h-6" />,
      bgGradient: 'from-amber-900 to-stone-900',
      borderColor: 'border-amber-600/40',
      iconColor: 'text-amber-300',
    },
    {
      id: 'hadits',
      number: '09',
      title: 'Hadits Pilihan',
      description: 'Perpustakaan hadits shahih tematik dengan sanad dan rujukan',
      icon: <ScrollText className="w-6 h-6" />,
      bgGradient: 'from-stone-900 to-teal-950',
      borderColor: 'border-stone-700/60',
      iconColor: 'text-teal-200',
    },
  ];

  const GROUP_3_HAJI_KEPEDULIAN: IbadahButtonItem[] = [
    {
      id: 'haji_umrah',
      number: '10',
      title: 'Haji & Umrah',
      description: 'Panduan manasik haji & umrah lengkap dan persiapan ziarah',
      icon: <MapPin className="w-6 h-6" />,
      bgGradient: 'from-stone-900 to-emerald-950',
      borderColor: 'border-emerald-600/40',
      iconColor: 'text-amber-300',
    },
    {
      id: 'donasi',
      number: '11',
      title: 'Donasi Legal',
      description: 'Penyaluran resmi via BAZNAS & LAZNAS terverifikasi (0% fee developer)',
      icon: <Heart className="w-6 h-6" />,
      bgGradient: 'from-emerald-900 to-rose-950',
      borderColor: 'border-rose-700/40',
      iconColor: 'text-rose-300',
    },
    {
      id: 'zakat',
      number: '12',
      title: 'Kalkulator Zakat',
      description: 'Perhitungan zakat maal, fitrah, profesi & emas dengan nisab resmi',
      icon: <Calculator className="w-6 h-6" />,
      bgGradient: 'from-teal-900 to-stone-900',
      borderColor: 'border-teal-600/40',
      iconColor: 'text-teal-300',
    },
  ];

  const allItems = [...GROUP_1_SHOLAT_MASJID, ...GROUP_2_DOA_PENGETAHUAN, ...GROUP_3_HAJI_KEPEDULIAN];
  const activeItemMeta = allItems.find((i) => i.id === activeSubView);

  return (
    <div className="space-y-4 pb-14">
      {/* If a subview is active, render Back Navigation Bar */}
      {activeSubView !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setActiveSubView(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs shadow-xs hover:border-emerald-500 active:scale-98 transition-all min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-600" />
              <span>Kembali ke Menu Ibadah</span>
            </button>

            <span className="text-xs font-black text-stone-500 uppercase tracking-wider font-mono">
              {activeItemMeta?.title}
            </span>
          </div>

          {/* SUBVIEW 1: JADWAL SHOLAT HARIAN */}
          {activeSubView === 'jadwal' && (
            <div className="space-y-4">
              {/* Quick Launch Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 dark:bg-stone-800/80 rounded-2xl">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  {selectedCity.name} ({selectedCity.timezone})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdzanModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600 shadow-xs min-h-[38px]"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Pengaturan Adzan</span>
                  </button>
                  <button
                    onClick={() => setShowMonthlyCalendarModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 text-xs font-bold shadow-xs min-h-[38px]"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kalender Bulanan</span>
                  </button>
                </div>
              </div>

              {/* Hero Countdown Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menuju Waktu Sholat</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-amber-300">{nextPrayer.name}</span>
                    <span className="text-base text-emerald-100 tabular-nums font-bold">({nextPrayer.time})</span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-1">
                    Sisa Waktu: <strong className="text-white font-mono text-sm">{nextPrayer.remainingFormatted}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <button
                    onClick={handleToggleAdzan}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs min-h-[40px] ${
                      isPlayingAdzan ? 'bg-amber-400 text-stone-900 animate-pulse' : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isPlayingAdzan ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isPlayingAdzan ? 'Hentikan Adzan' : 'Uji Audio Adzan'}</span>
                  </button>

                  <select
                    value={adzanType}
                    onChange={(e) => setAdzanType(e.target.value as 'makkah' | 'madinah' | 'beep')}
                    className="text-xs bg-emerald-950 text-emerald-200 rounded-xl px-2.5 py-2 border border-emerald-700/60 min-h-[40px]"
                  >
                    <option value="makkah">Adzan Makkah</option>
                    <option value="madinah">Adzan Madinah</option>
                    <option value="beep">Nada Chime</option>
                  </select>
                </div>
              </div>

              {/* 5 Daily Prayers List */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden shadow-xs">
                {[
                  { id: 'subuh' as const, name: 'Subuh', time: prayerTimes.subuh },
                  { id: 'terbit' as const, name: 'Terbit (Syuruq)', time: prayerTimes.terbit, isNonPrayer: true },
                  { id: 'dzuhur' as const, name: 'Dzuhur', time: prayerTimes.dzuhur },
                  { id: 'ashar' as const, name: 'Ashar', time: prayerTimes.ashar },
                  { id: 'maghrib' as const, name: 'Maghrib', time: prayerTimes.maghrib },
                  { id: 'isya' as const, name: 'Isya', time: prayerTimes.isya },
                ].map((p) => {
                  const isTarget = nextPrayer.name === p.name;
                  const prayerKey = p.id as 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';
                  const notifEnabled = p.isNonPrayer
                    ? false
                    : (settings.notificationEnabled || {
                        subuh: true,
                        dzuhur: true,
                        ashar: true,
                        maghrib: true,
                        isya: true,
                      })[prayerKey];

                  return (
                    <div
                      key={p.name}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        isTarget ? 'bg-amber-50/70 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isTarget ? 'bg-amber-500 animate-ping' : 'bg-stone-300 dark:bg-stone-600'
                          }`}
                        />
                        <div>
                          <h4
                            className={`text-sm font-bold ${
                              isTarget ? 'text-amber-800 dark:text-amber-300' : 'text-stone-900 dark:text-white'
                            }`}
                          >
                            {p.name}
                          </h4>
                          {isTarget && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                              Waktu Berikutnya
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono text-base font-bold text-stone-800 dark:text-stone-200">
                          {p.time}
                        </span>

                        {!p.isNonPrayer && (
                          <button
                            onClick={() => toggleNotification(prayerKey)}
                            className={`p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
                              notifEnabled
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                            }`}
                            title={notifEnabled ? 'Notifikasi Aktif' : 'Notifikasi Senyap'}
                          >
                            {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-[11px] text-stone-400 dark:text-stone-500">
                Sumber: Metode Hisab Kementerian Agama RI · Wilayah {selectedCity.name} ({selectedCity.timezone}) · Diperbarui {prayerTimes.date}
              </div>
            </div>
          )}

          {/* SUBVIEW 2: CATATAN SHOLAT */}
          {activeSubView === 'pelacak' && <PrayerTrackerModule />}

          {/* SUBVIEW 3: TASBIH FISIK */}
          {activeSubView === 'tasbih' && <PhysicalBeadDigitalTasbih />}

          {/* SUBVIEW 4: TATA CARA SHOLAT */}
          {activeSubView === 'tuntunan' && <PrayerGuideModule />}

          {/* SUBVIEW 5: ARAH KIBLAT */}
          {activeSubView === 'kiblat' && <ModernQiblaCompass />}

          {/* SUBVIEW 6: MASJID TERDEKAT */}
          {activeSubView === 'masjid' && <NearbyMosqueLocator />}

          {/* SUBVIEW 7: DOA HARIAN */}
          {activeSubView === 'doa' && <DuaLibraryModule />}

          {/* SUBVIEW 8: ASMAUL HUSNA */}
          {activeSubView === 'asmaul_husna' && <AsmaulHusnaModule />}

          {/* SUBVIEW 9: HADITS PILIHAN */}
          {activeSubView === 'hadits' && <HadithLibraryModule />}

          {/* SUBVIEW 10: HAJI & UMRAH */}
          {activeSubView === 'haji_umrah' && <HajjUmrahGuideModule />}

          {/* SUBVIEW 11: DONASI LEGAL */}
          {activeSubView === 'donasi' && <VerifiedDonationModule />}

          {/* SUBVIEW 12: KALKULATOR ZAKAT */}
          {activeSubView === 'zakat' && <ZakatCalculator />}

          {/* SUBVIEW 13: DIARY ISLAMI / MUHASABAH PRIVAT */}
          {activeSubView === 'muhasabah' && <MuhasabahDiaryModule />}
        </div>
      ) : (
        /* DEFAULT VIEW: 12 TOMBOL BESAR DALAM 3 KELOMPOK VISUAL TANPA SUBMENU */
        <div className="space-y-6">
          {/* Top Banner Quick Glance */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Sparkles className="w-4 h-4" />
                <span>SAHABAT IBADAH SETIAP HARI</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-1">
                Pusat Ibadah & Amalan
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                Standar Kemenag RI · {selectedCity.name} · Waktu berikutnya: <strong className="text-amber-300">{nextPrayer.name} ({nextPrayer.time})</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubView('jadwal')}
                className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Lihat Jadwal Hari Ini
              </button>
            </div>
          </div>

          {/* KELOMPOK 1 — SHOLAT & MASJID (6 TOMBOL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>KELOMPOK 1 — SHOLAT & MASJID</span>
              </h2>
              <span className="text-[10px] text-stone-500 font-mono">6 Fitur</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {GROUP_1_SHOLAT_MASJID.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveSubView(btn.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br ${btn.bgGradient} text-white border ${btn.borderColor} shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between text-left min-h-[96px] sm:min-h-[108px] group`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 [&>svg]:w-[22px] [&>svg]:h-[22px] shadow-inner group-hover:scale-105 transition-transform">
                      {btn.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white/50">
                      {btn.number}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    <h3 className="text-xs font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
                      {btn.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-300 mt-0.5 line-clamp-2 leading-snug">
                      {btn.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* KELOMPOK 2 — DOA & PENGETAHUAN ISLAM (3 TOMBOL) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>KELOMPOK 2 — DOA & PENGETAHUAN ISLAM</span>
              </h2>
              <span className="text-[10px] text-stone-500 font-mono">3 Fitur</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {GROUP_2_DOA_PENGETAHUAN.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveSubView(btn.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br ${btn.bgGradient} text-white border ${btn.borderColor} shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between text-left min-h-[96px] sm:min-h-[108px] group`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 [&>svg]:w-[22px] [&>svg]:h-[22px] shadow-inner group-hover:scale-105 transition-transform">
                      {btn.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white/50">
                      {btn.number}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    <h3 className="text-xs font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
                      {btn.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-300 mt-0.5 line-clamp-2 leading-snug">
                      {btn.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* KELOMPOK 3 — HAJI & KEPEDULIAN (3 TOMBOL) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>KELOMPOK 3 — HAJI & KEPEDULIAN</span>
              </h2>
              <span className="text-[10px] text-stone-500 font-mono">3 Fitur</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {GROUP_3_HAJI_KEPEDULIAN.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveSubView(btn.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br ${btn.bgGradient} text-white border ${btn.borderColor} shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between text-left min-h-[96px] sm:min-h-[108px] group`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 [&>svg]:w-[22px] [&>svg]:h-[22px] shadow-inner group-hover:scale-105 transition-transform">
                      {btn.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white/50">
                      {btn.number}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    <h3 className="text-xs font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
                      {btn.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-300 mt-0.5 line-clamp-2 leading-snug">
                      {btn.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DIARY ISLAMI / MUHASABAH PRIVAT (LOKAL, TANPA POIN, TIDAK DIBAGIKAN) */}
          <button
            onClick={() => setActiveSubView('muhasabah')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 shadow-xs flex items-center justify-between gap-3 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-stone-900 dark:text-white">
                  Diary Islami / Muhasabah Diri
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Catatan refleksi privat di perangkat Anda · Tidak tampil di Keluarga · Tanpa poin &amp; bebas AI
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
          </button>
        </div>
      )}

      {/* Android Adzan Settings Modal */}
      <AdzanNotificationSettingsModal
        isOpen={showAdzanModal}
        onClose={() => setShowAdzanModal(false)}
      />

      {/* Monthly Prayer Calendar Modal */}
      {showMonthlyCalendarModal && (
        <PrayerMonthlyCalendarModal
          isOpen={showMonthlyCalendarModal}
          onClose={() => setShowMonthlyCalendarModal(false)}
        />
      )}
    </div>
  );
};
