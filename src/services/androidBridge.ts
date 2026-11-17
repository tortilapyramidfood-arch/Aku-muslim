/**
 * Android Native Bridge & Notification Integration Foundation
 * AKU MUSLIM — Production-Ready Android Specifications (Capacitor / Kotlin Native)
 *
 * This module defines the architecture, platform checks, and exact specifications
 * for building and deploying AKU MUSLIM on Android (Google Play Store).
 */

export interface AndroidBridgeStatus {
  isAndroid: boolean;
  isNativeApp: boolean;
  hasNotificationPermission: boolean;
  hasGeolocation: boolean;
  hasCompassSensor: boolean;
  batteryOptimizationIgnored: boolean;
  hardwareVerificationStatus: 'NOT_VERIFIED_ON_PHYSICAL_HARDWARE' | 'TESTED_IN_BROWSER_ONLY';
}

export interface AndroidLifecycleCondition {
  state: 'APP_FOREGROUND' | 'APP_BACKGROUND' | 'DEVICE_LOCKED' | 'DOZE_MODE_DEEP_SLEEP' | 'FORCE_STOPPED' | 'DEVICE_REBOOT';
  behavior: string;
  nativeSolution: string;
  verifiableInWeb: boolean;
  physicalDeviceRequired: boolean;
}

export const ANDROID_LIFECYCLE_MATRIX: AndroidLifecycleCondition[] = [
  {
    state: 'APP_FOREGROUND',
    behavior: 'Aplikasi aktif di layar. Audio adzan dan notifikasi langsung berbunyi instan.',
    nativeSolution: 'Web Audio API / MediaPlayer standard playback.',
    verifiableInWeb: true,
    physicalDeviceRequired: false,
  },
  {
    state: 'APP_BACKGROUND',
    behavior: 'Aplikasi diminimalkan. OS Android dapat membunuh proses sewaktu-waktu jika RAM menipis.',
    nativeSolution: 'WorkManager periodic background sync + local notification dispatch.',
    verifiableInWeb: true,
    physicalDeviceRequired: false,
  },
  {
    state: 'DEVICE_LOCKED',
    behavior: 'Layar HP mati/terkunci. CPU dapat masuk sleep mode.',
    nativeSolution: 'AlarmManager.setExactAndAllowWhileIdle() + ForegroundService dengan FOREGROUND_SERVICE_MEDIA_PLAYBACK dan WAKE_LOCK.',
    verifiableInWeb: false,
    physicalDeviceRequired: true,
  },
  {
    state: 'DOZE_MODE_DEEP_SLEEP',
    behavior: 'HP diam di meja tanpa digerakkan selama beberapa puluh menit (Android 6.0+ Doze Mode). Seluruh timer web terhenti.',
    nativeSolution: 'Minta pengecualian penghemat baterai (Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS) + AlarmManager exact alarm.',
    verifiableInWeb: false,
    physicalDeviceRequired: true,
  },
  {
    state: 'FORCE_STOPPED',
    behavior: 'Pengguna melakukan "Paksa Berhenti" (Force Stop) di Pengaturan Aplikasi Android.',
    nativeSolution: 'Arsitektur OS Android sengaja menonaktifkan seluruh BroadcastReceiver dan alarm sampai pengguna membuka kembali aplikasi secara manual (Kebijakan Inti Keamanan Linux/Android).',
    verifiableInWeb: false,
    physicalDeviceRequired: true,
  },
  {
    state: 'DEVICE_REBOOT',
    behavior: 'HP dimatikan lalu dinyalakan ulang. Seluruh jadwal AlarmManager OS terhapus dari memori volatil.',
    nativeSolution: 'BroadcastReceiver mendengarkan Intent.ACTION_BOOT_COMPLETED untuk langsung menghitung dan mendaftarkan ulang 5 jadwal sholat.',
    verifiableInWeb: false,
    physicalDeviceRequired: true,
  },
];

export const ANDROID_MANIFEST_PERMISSIONS = [
  {
    permission: 'android.permission.POST_NOTIFICATIONS',
    targetSdk: '33+ (Android 13+)',
    purpose: 'Menampilkan notifikasi jadwal sholat dan pengingat harian kepada pengguna.',
    googlePlayPolicy: 'Wajib meminta runtime permission eksplisit di UI sebelum mengirim notifikasi.',
  },
  {
    permission: 'android.permission.SCHEDULE_EXACT_ALARM',
    targetSdk: '31+ (Android 12+)',
    purpose: 'Menjadwalkan waktu adzan tepat waktu per menit tanpa ditunda oleh OS.',
    googlePlayPolicy: 'Pengguna dapat mematikan izin ini di Settings. Aplikasi harus menangani fallback dengan tenang.',
  },
  {
    permission: 'android.permission.USE_EXACT_ALARM',
    targetSdk: '33+ (Android 13+)',
    purpose: 'Alternatif exact alarm otomatis khusus aplikasi pengingat waktu ibadah dan jam weker.',
    googlePlayPolicy: 'Diizinkan oleh Google Play Console untuk kategori Prayer Time Alarm / Clock, memerlukan pengisian deklarasi formulir review.',
  },
  {
    permission: 'android.permission.FOREGROUND_SERVICE',
    targetSdk: '28+ (Android 9+)',
    purpose: 'Memutar audio adzan penuh ketika layar HP dalam kondisi terkunci.',
    googlePlayPolicy: 'Wajib menampilkan notifikasi berjalan (ongoing notification) saat audio adzan bersuara.',
  },
  {
    permission: 'android.permission.RECEIVE_BOOT_COMPLETED',
    targetSdk: 'All',
    purpose: 'Menjadwalkan ulang seluruh waktu sholat setelah HP mati dan dinyalakan kembali.',
    googlePlayPolicy: 'Diizinkan tanpa pembatasan khusus.',
  },
  {
    permission: 'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    targetSdk: '23+ (Android 6+)',
    purpose: 'Meminta sistem agar tidak mematikan alarm adzan saat Doze Mode aktif.',
    googlePlayPolicy: 'Hanya boleh dipicu melalui interaksi pengguna (dialog konfirmasi di menu pengaturan notifikasi).',
  },
];

class AndroidBridge {
  private status: AndroidBridgeStatus = {
    isAndroid: false,
    isNativeApp: false,
    hasNotificationPermission: false,
    hasGeolocation: false,
    hasCompassSensor: false,
    batteryOptimizationIgnored: false,
    hardwareVerificationStatus: 'TESTED_IN_BROWSER_ONLY',
  };

  constructor() {
    this.detectEnvironment();
  }

  private detectEnvironment() {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent.toLowerCase();
    this.status.isAndroid = /android/.test(ua);
    this.status.isNativeApp =
      !!(window as unknown as { AndroidBridge?: unknown }).AndroidBridge ||
      (window as unknown as { Capacitor?: unknown }).Capacitor !== undefined;
    this.status.hasGeolocation = 'geolocation' in navigator;
    this.status.hasCompassSensor = 'DeviceOrientationEvent' in window;

    if ('Notification' in window) {
      this.status.hasNotificationPermission = Notification.permission === 'granted';
    }
  }

  getStatus(): AndroidBridgeStatus {
    this.detectEnvironment();
    return { ...this.status };
  }

  /**
   * Requests notification permissions across Web & Android
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.status.hasNotificationPermission = permission === 'granted';
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Dispatches a local notification or delegates to Android Native Bridge
   */
  sendNotification(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined') return;

    // Check if running inside Android Native wrapper
    const androidBridge = (window as unknown as { AndroidBridge?: { showNotification: (t: string, b: string) => void } }).AndroidBridge;
    if (androidBridge && typeof androidBridge.showNotification === 'function') {
      androidBridge.showNotification(title, options?.body || '');
      return;
    }

    // Standard Web Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          ...options,
        });
      } catch {
        // Fallback for mobile browsers where Notification constructor is disabled
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              icon: '/icon.svg',
              badge: '/icon.svg',
              ...options,
            });
          });
        }
      }
    }
  }

  /**
   * Android Notification Channel Specifications for Google Play / Android SDK
   */
  getAndroidNotificationChannels() {
    return [
      {
        id: 'adzan_alarm_channel',
        name: 'Panggilan Adzan & Alarm Sholat',
        description: 'Notifikasi bersuara adzan saat tiba waktu sholat fardhu (Prioritas Tinggi)',
        importance: 4, // IMPORTANCE_HIGH
        sound: 'adzan_makkah.mp3',
        enableVibration: true,
        bypassDnd: true,
      },
      {
        id: 'sholat_reminder_channel',
        name: 'Pengingat Waktu Sholat',
        description: 'Notifikasi 10 menit sebelum masuk waktu sholat & waktu Imsak',
        importance: 3, // IMPORTANCE_DEFAULT
        enableVibration: true,
        bypassDnd: false,
      },
      {
        id: 'daily_dhikr_channel',
        name: 'Dzikir Pagi & Petang',
        description: 'Pengingat dzikir pagi setelah Subuh dan dzikir petang setelah Ashar',
        importance: 2, // IMPORTANCE_LOW
        enableVibration: false,
        bypassDnd: false,
      },
    ];
  }

  /**
   * Panggil bridge native Capacitor AkuMuslimNative jika berjalan di dalam container APK Android
   */
  async invokeNativeStatus(): Promise<{ isNative: boolean; details?: Record<string, unknown> }> {
    if (typeof window === 'undefined') return { isNative: false };
    const cap = (window as unknown as { Capacitor?: { Plugins?: { AkuMuslimNative?: { getNativeSystemStatus: () => Promise<Record<string, unknown>> } } } }).Capacitor;
    if (cap && cap.Plugins && cap.Plugins.AkuMuslimNative) {
      try {
        const res = await cap.Plugins.AkuMuslimNative.getNativeSystemStatus();
        return { isNative: true, details: res };
      } catch (err) {
        return { isNative: true, details: { error: String(err) } };
      }
    }
    return { isNative: false };
  }

  /**
   * Daftarkan alarm sholat langsung ke AlarmManager Android native via Plugin Bridge
   */
  async scheduleNativeAlarm(params: {
    prayerName: string;
    prayerTime: string;
    cityName: string;
    timestamp: number;
    soundType?: string;
  }): Promise<{ success: boolean; fallbackWeb?: boolean }> {
    if (typeof window === 'undefined') return { success: false };
    const cap = (window as unknown as { Capacitor?: { Plugins?: { AkuMuslimNative?: { scheduleNativeAdzanAlarm: (p: unknown) => Promise<unknown> } } } }).Capacitor;
    if (cap && cap.Plugins && cap.Plugins.AkuMuslimNative) {
      try {
        await cap.Plugins.AkuMuslimNative.scheduleNativeAdzanAlarm(params);
        return { success: true };
      } catch {
        return { success: false, fallbackWeb: true };
      }
    }
    return { success: false, fallbackWeb: true };
  }

  /**
   * Jadwalkan uji coba alarm native 2 menit dari sekarang untuk testing HP fisik
   */
  async scheduleTestAlarmTwoMinutes(soundType = 'makkah'): Promise<{ success: boolean; message: string; timestamp?: number }> {
    if (typeof window === 'undefined') return { success: false, message: 'Browser mode' };
    const cap = (window as unknown as { Capacitor?: { Plugins?: { AkuMuslimNative?: { scheduleTestAlarmInTwoMinutes: (p: unknown) => Promise<{ success: boolean; message: string; triggerTimestamp: number }> } } } }).Capacitor;
    if (cap && cap.Plugins && cap.Plugins.AkuMuslimNative) {
      try {
        const res = await cap.Plugins.AkuMuslimNative.scheduleTestAlarmInTwoMinutes({ soundType });
        return { success: true, message: res.message || 'Alarm 2 menit terjadwal di AlarmManager OS.', timestamp: res.triggerTimestamp };
      } catch (err) {
        return { success: false, message: `Gagal menjadwalkan: ${String(err)}` };
      }
    }
    return {
      success: true,
      message: 'Simulasi Alarm 2 Menit (Web/PWA): Pengingat diset 120 detik dari sekarang.',
      timestamp: Date.now() + 120000,
    };
  }

  /**
   * Hentikan Foreground Service Adzan yang sedang berbunyi
   */
  async stopNativeAdzan(): Promise<void> {
    if (typeof window === 'undefined') return;
    const cap = (window as unknown as { Capacitor?: { Plugins?: { AkuMuslimNative?: { stopAdzanAudio: () => Promise<unknown> } } } }).Capacitor;
    if (cap && cap.Plugins && cap.Plugins.AkuMuslimNative) {
      try {
        await cap.Plugins.AkuMuslimNative.stopAdzanAudio();
      } catch {
        // safe ignore
      }
    }
  }
}

export const androidBridge = new AndroidBridge();


