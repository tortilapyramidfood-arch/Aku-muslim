import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { androidBridge } from '../../services/androidBridge';
import { audioService } from '../../services/audioService';
import { adzanScheduler } from '../../services/adzanScheduler';
import {
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldAlert,
  Battery,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Play,
  Square,
  HelpCircle,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';

interface AdzanNotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdzanNotificationSettingsModal: React.FC<AdzanNotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, prayerTimes, selectedCity } = useApp();
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'jadwal' | 'suara' | 'uji_alarm' | 'baterai' | 'izin'>('jadwal');
  const [selectedBrandGuide, setSelectedBrandGuide] = useState<'samsung' | 'xiaomi' | 'oppo' | 'vivo'>('samsung');
  const [testAlarmFeedback, setTestAlarmFeedback] = useState<string>('');
  const [scheduledAlarmTimestamp, setScheduledAlarmTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem('akumuslim_test_alarm_ts');
    return saved ? parseInt(saved, 10) : null;
  });

  const status = androidBridge.getStatus();
  const diag = adzanScheduler.getDiagnostics(prayerTimes, selectedCity, settings);

  useEffect(() => {
    if (scheduledAlarmTimestamp) {
      localStorage.setItem('akumuslim_test_alarm_ts', scheduledAlarmTimestamp.toString());
    }
  }, [scheduledAlarmTimestamp]);

  if (!isOpen) return null;

  const handleTogglePrayerNotif = (prayerKey: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya') => {
    const updated = {
      ...settings.notificationEnabled,
      [prayerKey]: !settings.notificationEnabled[prayerKey],
    };
    updateSettings({ notificationEnabled: updated });
  };

  const handleSoundChange = (sound: 'makkah' | 'madinah' | 'beep' | 'silent') => {
    updateSettings({ adzanSound: sound });
  };

  const handleTestAudio = () => {
    if (isPlayingTestAudio) {
      audioService.stopAdzan();
      androidBridge.stopNativeAdzan();
      setIsPlayingTestAudio(false);
    } else {
      setIsPlayingTestAudio(true);
      if (settings.adzanSound === 'silent') {
        androidBridge.sendNotification('Uji Notifikasi Adzan (Mode Silent)', {
          body: 'Notifikasi hening berhasil dikirim.',
        });
        setTimeout(() => setIsPlayingTestAudio(false), 2000);
      } else {
        audioService.playAdzan(
          settings.adzanSound === 'madinah' ? 'madinah' : settings.adzanSound === 'beep' ? 'beep' : 'makkah',
          () => setIsPlayingTestAudio(false)
        );
      }
    }
  };

  const handleScheduleTestAlarmInTwoMinutes = async () => {
    setTestAlarmFeedback('Menjadwalkan alarm uji coba ke AlarmManager OS...');
    const res = await androidBridge.scheduleTestAlarmTwoMinutes(settings.adzanSound);
    if (res.success) {
      const ts = res.timestamp || (Date.now() + 120000);
      setScheduledAlarmTimestamp(ts);
      const timeStr = new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTestAlarmFeedback(`✓ ${res.message} Waktu pemicu: ${timeStr} WIB.`);
    } else {
      setTestAlarmFeedback(`Gagal: ${res.message}`);
    }
  };

  const handleStopOngoingAdzan = async () => {
    audioService.stopAdzan();
    await androidBridge.stopNativeAdzan();
    setIsPlayingTestAudio(false);
    setTestAlarmFeedback('Suara adzan dan Foreground Service telah dihentikan.');
  };

  const handleRequestPermissions = async () => {
    await androidBridge.requestNotificationPermission();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700 shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Pengaturan Adzan & Notifikasi Android
              </h2>
              <span className="text-[11px] text-stone-500">
                Sistem 4-Level Audio Resilient & AlarmManager OS
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlayingTestAudio) audioService.stopAdzan();
              onClose();
            }}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'jadwal'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            5 Waktu Sholat
          </button>
          <button
            onClick={() => setActiveTab('suara')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'suara'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Suara Adzan
          </button>
          <button
            onClick={() => setActiveTab('uji_alarm')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'uji_alarm'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Tes 2 Menit (Native)
          </button>
          <button
            onClick={() => setActiveTab('baterai')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'baterai'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Panduan Baterai
          </button>
          <button
            onClick={() => setActiveTab('izin')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'izin'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Status Izin OS
          </button>
        </div>

        {/* TAB 1: 5 Waktu Sholat ON/OFF */}
        {activeTab === 'jadwal' && (
          <div className="space-y-3">
            <span className="text-xs text-stone-500 block">
              Pilih waktu sholat yang ingin menerima pengingat dan kumandang adzan otomatis:
            </span>

            {[
              { key: 'subuh' as const, label: 'Subuh', desc: 'Termasuk kumandang adzan fajar Ash-Shalatu Khairum Minan Naum' },
              { key: 'dzuhur' as const, label: 'Dzuhur', desc: 'Saat matahari tergelincir melewati zenith' },
              { key: 'ashar' as const, label: 'Ashar', desc: 'Saat panjang bayangan sama dengan panjang benda' },
              { key: 'maghrib' as const, label: 'Maghrib', desc: 'Saat piringan matahari terbenam sempurna' },
              { key: 'isya' as const, label: 'Isya', desc: 'Saat hilangnya syafaq (cahaya merah fajar malam)' },
            ].map((item) => {
              const isEnabled = settings.notificationEnabled[item.key];
              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      Sholat {item.label}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleTogglePrayerNotif(item.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      isEnabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Pilihan Suara Adzan Berizin */}
        {activeTab === 'suara' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold block mb-1">Audit Lisensi Audio:</span>
              <p className="opacity-90">
                Pilihan suara adzan menggunakan rekaman domain publik dan nada chime sintetis ringan bebas royalti yang aman dimasukkan ke dalam paket instalasi Android.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'makkah' as const, title: 'Adzan Makkah Al-Mukarramah', desc: 'Irama klasik Masjidil Haram dengan nada khusyuk' },
                { id: 'madinah' as const, title: 'Adzan Madinah Al-Munawwarah', desc: 'Irama merdu khas muadzin Masjid Nabawi' },
                { id: 'beep' as const, title: 'Nada Beep / Chime Lembut', desc: 'Suara pengingat pendek, sangat cocok untuk kantor & rapat' },
                { id: 'silent' as const, title: 'Hanya Notifikasi Layar (Mode Hening)', desc: 'Hanya getar dan tampilan notifikasi di layar tanpa suara' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSoundChange(opt.id)}
                  className={`w-full p-3 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${
                    settings.adzanSound === opt.id
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div>
                    <span className="block text-sm">{opt.title}</span>
                    <span className="text-[11px] font-normal opacity-75">{opt.desc}</span>
                  </div>
                  {settings.adzanSound === opt.id && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Test Play Audio Button */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={handleTestAudio}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {isPlayingTestAudio ? <Square className="w-4 h-4 fill-stone-900" /> : <Play className="w-4 h-4 fill-stone-900" />}
                <span>{isPlayingTestAudio ? 'Hentikan Uji Audio' : 'Uji Dengar Suara Adzan Terpilih'}</span>
              </button>

              <button
                onClick={handleStopOngoingAdzan}
                className="py-2.5 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold"
                title="Hentikan semua audio adzan berjalan"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Uji Coba Alarm Native 2 Menit (Physical Device Beta Ready) */}
        {activeTab === 'uji_alarm' && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Pengujian Alarm Fisik Nyata (AlarmManager Native)</span>
              </div>
              <p className="text-emerald-800/90 dark:text-emerald-300/90 text-[11px] leading-relaxed">
                Fitur ini mendaftarkan alarm tepat 2 menit ke depan di OS Android via <code>setExactAndAllowWhileIdle()</code>. Anda dapat mengunci layar HP atau meminimalkan aplikasi untuk membuktikan adzan tetap berkumandang saat layar mati.
              </p>
            </div>

            {/* Resilient Audio Fallback Level Box */}
            <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <span className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Arsitektur Resilient Audio 4-Tingkat:</span>
              </span>
              <ul className="space-y-1 text-[11px] text-stone-600 dark:text-stone-300 font-mono">
                <li><strong className="text-emerald-700 dark:text-emerald-400">Level 1:</strong> R.raw.adzan_* (Resource Native Android)</li>
                <li><strong className="text-emerald-700 dark:text-emerald-400">Level 2:</strong> Asset File Descriptor (public/audio/*.mp3)</li>
                <li><strong className="text-amber-700 dark:text-amber-400">Level 3:</strong> Android System Alarm Ringtone (RingtoneManager)</li>
                <li><strong className="text-blue-700 dark:text-blue-400">Level 4:</strong> ToneGenerator Alarm Chime (Jaminan 100% Suara)</li>
              </ul>
            </div>

            {/* Next Scheduled Alarm Status Indicator */}
            {scheduledAlarmTimestamp && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    Jadwal Uji Alarm Aktif:
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                  {new Date(scheduledAlarmTimestamp).toLocaleTimeString('id-ID')} WIB
                </span>
              </div>
            )}

            {testAlarmFeedback && (
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
                {testAlarmFeedback}
              </div>
            )}

            {/* Trigger 2-Minute Test Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleScheduleTestAlarmInTwoMinutes}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Jadwalkan Tes Alarm Native (2 Menit dari Sekarang)</span>
              </button>

              <button
                onClick={handleStopOngoingAdzan}
                className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
              >
                <VolumeX className="w-4 h-4" />
                <span>Hentikan Suara Adzan Berjalan (Stop Native Adzan)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Panduan Optimasi Baterai & Doze Mode Brand HP */}
        {activeTab === 'baterai' && (
          <div className="space-y-3">
            <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-xl text-xs space-y-1">
              <span className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-600" />
                <span>Mengapa Panduan Baterai Sangat Penting?</span>
              </span>
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                Vendor HP Android memiliki sistem agresif penghemat baterai (battery killer) yang sering mematikan alarm otomatis saat HP terkunci lama. Agar adzan berbunyi tepat waktu, ikuti langkah berikut:
              </p>
            </div>

            {/* Brand Switcher */}
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {[
                { id: 'samsung' as const, label: 'Samsung' },
                { id: 'xiaomi' as const, label: 'Xiaomi' },
                { id: 'oppo' as const, label: 'Oppo' },
                { id: 'vivo' as const, label: 'Vivo' },
              ].map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrandGuide(brand.id)}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    selectedBrandGuide === brand.id
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {brand.label}
                </button>
              ))}
            </div>

            {/* Brand Specific Instruction */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
              {selectedBrandGuide === 'samsung' && (
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white mb-1">Samsung (One UI):</h4>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
                    <li>Buka <strong>Pengaturan &gt; Aplikasi &gt; AKU MUSLIM</strong>.</li>
                    <li>Pilih menu <strong>Baterai</strong> lalu ubah dari "Dioptimalkan" ke <strong>"Tidak Dibatasi" (Unrestricted)</strong>.</li>
                    <li>Pastikan AKU MUSLIM tidak dimasukkan ke dalam daftar "Aplikasi yang Tidur Lelap" (Deep Sleeping Apps).</li>
                  </ol>
                </div>
              )}

              {selectedBrandGuide === 'xiaomi' && (
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white mb-1">Xiaomi / Redmi / POCO (MIUI / HyperOS):</h4>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
                    <li>Buka <strong>Setelan &gt; Aplikasi &gt; Kelola Aplikasi &gt; AKU MUSLIM</strong>.</li>
                    <li>Aktifkan <strong>Mulai Otomatis (Autostart)</strong>.</li>
                    <li>Pada <strong>Penghemat Baterai</strong>, pilih <strong>"Tidak ada batasan" (No restrictions)</strong>.</li>
                    <li>Di layar Recent Apps, tekan lama kartu AKU MUSLIM lalu ketuk ikon <strong>Gembok (Lock)</strong>.</li>
                  </ol>
                </div>
              )}

              {selectedBrandGuide === 'oppo' && (
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white mb-1">Oppo / Realme (ColorOS):</h4>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
                    <li>Buka <strong>Pengaturan &gt; Manajemen Aplikasi &gt; AKU MUSLIM</strong>.</li>
                    <li>Pilih <strong>Penggunaan Baterai</strong> lalu aktifkan <strong>"Izinkan aktivitas latar belakang"</strong> dan <strong>"Izinkan mulai otomatis"</strong>.</li>
                    <li>Kunci aplikasi di jendela aplikasi terkini (Recent Apps).</li>
                  </ol>
                </div>
              )}

              {selectedBrandGuide === 'vivo' && (
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white mb-1">Vivo / iQOO (Funtouch OS):</h4>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
                    <li>Buka <strong>Pengaturan &gt; Baterai &gt; Konsumsi Daya Latar Belakang Tinggi</strong>.</li>
                    <li>Cari dan aktifkan saklar untuk <strong>AKU MUSLIM</strong>.</li>
                    <li>Izinkan izin mulai otomatis (Autostart) pada menu Pengelola Izin.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Status Izin & Diagnostik Jadwal Adzan */}
        {activeTab === 'izin' && (
          <div className="space-y-3">
            <span className="text-xs text-stone-500 block">
              Pemeriksaan kesiapan adzan tepat waktu (izin, zona waktu, Jangan Ganggu &amp; baterai):
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-stone-900 dark:text-white block">
                    Izin Notifikasi (POST_NOTIFICATIONS)
                  </span>
                  <span className="text-[11px] text-stone-500">Wajib untuk menampilkan notifikasi dan pemicu suara</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] shrink-0 ${
                  diag.notificationPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {diag.notificationPermission === 'granted' ? 'DIIZINKAN' : diag.notificationPermission.toUpperCase()}
                </span>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-stone-900 dark:text-white block">
                    Exact Alarm (SCHEDULE_EXACT_ALARM)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {diag.isNativeAndroid
                      ? 'AlarmManager Android aktif untuk layar terkunci'
                      : 'Web/Preview aktif saat tab terbuka (APK Android mendukung layar terkunci)'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                  {diag.exactAlarmStatus === 'ready_native' ? 'NATIVE AKTIF' : 'SIAP DI APK'}
                </span>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-white">
                    Sinkronisasi Jadwal &amp; Zona Waktu
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    diag.timezoneAligned
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {diag.cityTimezone} (UTC+{diag.cityOffsetHours})
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  {diag.timezoneNote}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                <span className="font-bold text-stone-900 dark:text-white block">
                  Mode Jangan Ganggu (Do Not Disturb)
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  {diag.dndGuidance}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-stone-900 dark:text-white block">
                    Pengecualian Baterai (Doze Mode)
                  </span>
                  <span className="text-[11px] text-stone-500">Mencegah pembatasan OS saat layar terkunci lama</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] shrink-0 ${
                  diag.batteryOptimizationIgnored
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {diag.batteryOptimizationIgnored ? 'TIDAK DIBATASI' : 'PERLU CEK HP'}
                </span>
              </div>

              {/* 5 Scheduled Alarms Live List */}
              <div className="p-3 bg-white dark:bg-stone-950/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
                <span className="font-bold text-stone-900 dark:text-white block">
                  Jadwal Pemicu 5 Waktu Sholat ({selectedCity.name}):
                </span>
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {diag.scheduledAlarms.map((alarm) => (
                    <div key={alarm.key} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {alarm.label} ({alarm.time} {alarm.timezone})
                      </span>
                      <span className="font-mono text-stone-500 dark:text-stone-400">
                        {!alarm.isEnabled
                          ? 'Senyap'
                          : alarm.isPastToday
                          ? `Besok ${alarm.time}`
                          : `Hari ini ${alarm.time}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {diag.notificationPermission !== 'granted' && (
                <button
                  onClick={handleRequestPermissions}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                >
                  Minta Izin Notifikasi
                </button>
              )}
              <button
                onClick={() => {
                  androidBridge.sendNotification(`Uji Notifikasi Adzan · ${selectedCity.name}`, {
                    body: `Zona ${selectedCity.timezone} · Suara aktif: ${settings.adzanSound.toUpperCase()}`,
                  });
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-900 dark:text-white font-bold text-xs"
              >
                Uji Notifikasi Layar
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs text-stone-400">
          <span>AKU MUSLIM Android Bridge Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
