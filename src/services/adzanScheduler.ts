/**
 * Adzan Scheduler & Notification Readiness Diagnostics
 * AKU MUSLIM — PYRAMID GROUP
 *
 * Menjadwalkan 5 waktu sholat harian ke AlarmManager OS (Android Native)
 * serta memantau pemicu presisi saat aplikasi berjalan di web/PWA,
 * menghormati zona waktu kota (WIB/WITA/WIT) dan pengecekan izin OS/DND/baterai.
 */

import { AppSettings, CityLocation, PrayerTimes } from '../types';
import { androidBridge } from './androidBridge';
import { audioService } from './audioService';

export type PrayerKey = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export interface ScheduledPrayerAlarm {
  key: PrayerKey;
  label: string;
  time: string;
  timezone: 'WIB' | 'WITA' | 'WIT';
  triggerTimestamp: number;
  isEnabled: boolean;
  isPastToday: boolean;
  nativeScheduled: boolean;
}

export interface AdzanDiagnosticReport {
  checkedAt: string;
  isNativeAndroid: boolean;
  cityTimezone: 'WIB' | 'WITA' | 'WIT';
  cityOffsetHours: number;
  deviceOffsetHours: number;
  timezoneAligned: boolean;
  timezoneNote: string;
  notificationPermission: 'granted' | 'denied' | 'default' | 'unsupported';
  exactAlarmStatus: 'ready_native' | 'web_foreground_only';
  dndGuidance: string;
  batteryOptimizationIgnored: boolean;
  scheduledAlarms: ScheduledPrayerAlarm[];
}

const PRAYER_META: Array<{ key: PrayerKey; label: string }> = [
  { key: 'subuh', label: 'Subuh' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
];

/**
 * Konversi waktu sholat "HH:mm" pada zona waktu kota (UTC+7/+8/+9) menjadi epoch UTC ms.
 */
export function computePrayerEpochTimestamp(
  dateStr: string, // YYYY-MM-DD
  hhmm: string,
  cityUtcOffsetHours: number
): number {
  const [year, month, day] = dateStr.split('-').map((n) => parseInt(n, 10));
  const [hour, minute] = hhmm.split(':').map((n) => parseInt(n, 10));
  if ([year, month, day, hour, minute].some((v) => Number.isNaN(v))) {
    return Date.now() + 60000;
  }
  // Epoch dalam UTC untuk HH:mm di zona cityUtcOffsetHours
  return Date.UTC(year, month - 1, day, hour - cityUtcOffsetHours, minute, 0, 0);
}

class AdzanSchedulerService {
  private lastSyncSignature = '';
  private latestAlarms: ScheduledPrayerAlarm[] = [];
  private firedKeys = new Set<string>();

  /**
   * Sinkronkan jadwal sholat hari ini (atau besok bila waktu sudah lewat) ke Native AlarmManager.
   */
  public async syncDailySchedule(
    prayerTimes: PrayerTimes,
    city: CityLocation,
    notificationEnabled: AppSettings['notificationEnabled'],
    adzanSound: AppSettings['adzanSound']
  ): Promise<ScheduledPrayerAlarm[]> {
    const now = Date.now();
    const signature = `${prayerTimes.date}|${city.id}|${city.utcOffset}|${adzanSound}|${JSON.stringify(notificationEnabled)}`;
    const shouldPushNative = signature !== this.lastSyncSignature;

    const scheduledList: ScheduledPrayerAlarm[] = [];

    for (const meta of PRAYER_META) {
      const timeStr = prayerTimes[meta.key];
      const enabled = notificationEnabled?.[meta.key] ?? true;
      let targetTs = computePrayerEpochTimestamp(prayerTimes.date, timeStr, city.utcOffset);
      const isPastToday = targetTs <= now;

      // Jika sudah lewat hari ini, jadwalkan untuk besok pada jam yang sama
      if (isPastToday) {
        targetTs += 24 * 3600 * 1000;
      }

      let nativeScheduled = false;
      if (enabled && shouldPushNative) {
        const res = await androidBridge.scheduleNativeAlarm({
          prayerName: meta.label,
          prayerTime: timeStr,
          cityName: `${city.name} (${city.timezone})`,
          timestamp: targetTs,
          soundType: adzanSound,
        });
        nativeScheduled = res.success;
      }

      scheduledList.push({
        key: meta.key,
        label: meta.label,
        time: timeStr,
        timezone: city.timezone,
        triggerTimestamp: targetTs,
        isEnabled: enabled,
        isPastToday,
        nativeScheduled,
      });
    }

    this.lastSyncSignature = signature;
    this.latestAlarms = scheduledList;
    return scheduledList;
  }

  /**
   * Pemeriksaan detik-demi-detik saat aplikasi terbuka (foreground Web/PWA)
   * untuk memastikan suara adzan dan notifikasi tepat pada menit jadwal sholat.
   */
  public checkAndTriggerForeground(
    prayerTimes: PrayerTimes,
    city: CityLocation,
    notificationEnabled: AppSettings['notificationEnabled'],
    adzanSound: AppSettings['adzanSound']
  ): PrayerKey | null {
    const now = Date.now();

    for (const meta of PRAYER_META) {
      const enabled = notificationEnabled?.[meta.key] ?? true;
      if (!enabled) continue;

      const timeStr = prayerTimes[meta.key];
      const triggerTs = computePrayerEpochTimestamp(prayerTimes.date, timeStr, city.utcOffset);
      const diffMs = now - triggerTs;

      // Trigger dalam jendela [0 .. +45 detik] dari menit waktu sholat
      if (diffMs >= 0 && diffMs <= 45000) {
        const fireId = `akumuslim_adzan_fired_${prayerTimes.date}_${city.id}_${meta.key}`;
        if (this.firedKeys.has(fireId)) continue;
        if (typeof window !== 'undefined' && localStorage.getItem(fireId) === '1') {
          this.firedKeys.add(fireId);
          continue;
        }

        this.firedKeys.add(fireId);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(fireId, '1');
          } catch {
            // ignore quota
          }
        }

        androidBridge.sendNotification(`Waktu Sholat ${meta.label} Telah Tiba (${timeStr} ${city.timezone})`, {
          body: `Wilayah ${city.name} dan sekitarnya.`,
          tag: fireId,
        });

        if (adzanSound !== 'silent') {
          audioService.playAdzan(
            adzanSound === 'madinah' ? 'madinah' : adzanSound === 'beep' ? 'beep' : 'makkah'
          );
        }

        return meta.key;
      }
    }

    return null;
  }

  public getDiagnostics(
    prayerTimes: PrayerTimes,
    city: CityLocation,
    settings: AppSettings
  ): AdzanDiagnosticReport {
    const status = androidBridge.getStatus();
    const now = new Date();
    // JS getTimezoneOffset() returns minutes behind UTC (WIB = -420 => +7)
    const deviceOffsetHours = Number((-now.getTimezoneOffset() / 60).toFixed(2));
    const timezoneAligned = Math.abs(deviceOffsetHours - city.utcOffset) < 0.1;

    const notifPerm: AdzanDiagnosticReport['notificationPermission'] =
      typeof window === 'undefined' || !('Notification' in window)
        ? 'unsupported'
        : Notification.permission;

    const alarms =
      this.latestAlarms.length > 0
        ? this.latestAlarms
        : PRAYER_META.map((meta) => {
            const timeStr = prayerTimes[meta.key];
            const rawTs = computePrayerEpochTimestamp(prayerTimes.date, timeStr, city.utcOffset);
            const isPast = rawTs <= Date.now();
            return {
              key: meta.key,
              label: meta.label,
              time: timeStr,
              timezone: city.timezone,
              triggerTimestamp: isPast ? rawTs + 86400000 : rawTs,
              isEnabled: settings.notificationEnabled?.[meta.key] ?? true,
              isPastToday: isPast,
              nativeScheduled: status.isNativeApp,
            };
          });

    return {
      checkedAt: now.toISOString(),
      isNativeAndroid: status.isNativeApp,
      cityTimezone: city.timezone,
      cityOffsetHours: city.utcOffset,
      deviceOffsetHours,
      timezoneAligned,
      timezoneNote: timezoneAligned
        ? `Jam perangkat (UTC+${deviceOffsetHours}) selaras dengan zona ${city.name} (${city.timezone} / UTC+${city.utcOffset}).`
        : `Zona jam perangkat (UTC+${deviceOffsetHours}) berbeda dengan ${city.name} (${city.timezone} / UTC+${city.utcOffset}). Perhitungan alarm tetap memakai waktu ${city.timezone}.`,
      notificationPermission: status.isNativeApp && status.hasNotificationPermission ? 'granted' : notifPerm,
      exactAlarmStatus: status.isNativeApp ? 'ready_native' : 'web_foreground_only',
      dndGuidance:
        'Saluran alarm adzan memakai CATEGORY_ALARM (bypass DND sistem bila diizinkan). Jika HP dalam mode Jangan Ganggu total, tambahkan AKU MUSLIM ke pengecualian DND di Setelan > Suara.',
      batteryOptimizationIgnored: status.batteryOptimizationIgnored,
      scheduledAlarms: alarms,
    };
  }
}

export const adzanScheduler = new AdzanSchedulerService();
