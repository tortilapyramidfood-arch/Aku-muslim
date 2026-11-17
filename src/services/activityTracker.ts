/**
 * Client Activity Tracking Service
 * AKU MUSLIM — PYRAMID GROUP
 * Memantau durasi aktif membaca Qur'an, hafalan Smart Hifz, dan belajar tajwid
 * Memisahkan secara tegas durasi aktif layar vs audio latar belakang
 */

export interface ActivityLogPayload {
  activityCategory: 'QURAN_READING' | 'HIFZ_PRACTICE' | 'TAJWID_LESSON' | 'GAME_PLAY' | 'AUDIO_LISTENING';
  durationSeconds: number;
  sessionType?: 'FOREGROUND_ACTIVE' | 'BACKGROUND_AUDIO';
  surahNumber?: number;
  ayahNumber?: number;
  details?: Record<string, unknown>;
}

class ClientActivityTracker {
  private activeCategory: ActivityLogPayload['activityCategory'] | null = null;
  private sessionStartTime: number = 0;
  private currentSurah?: number;
  private currentAyah?: number;
  private isAppForeground: boolean = true;
  private isMurottalPlayingInBackground: boolean = false;
  private backgroundAudioStartTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.handleAppBackground();
        } else {
          this.handleAppForeground();
        }
      });
    }
  }

  public setMurottalBackgroundState(isPlaying: boolean, surahNumber?: number) {
    if (isPlaying && !this.isAppForeground) {
      if (!this.isMurottalPlayingInBackground) {
        this.isMurottalPlayingInBackground = true;
        this.backgroundAudioStartTime = Date.now();
      }
    } else {
      if (this.isMurottalPlayingInBackground) {
        const durationSec = Math.round((Date.now() - this.backgroundAudioStartTime) / 1000);
        if (durationSec >= 5) {
          this.sendSession({
            activityCategory: 'AUDIO_LISTENING',
            durationSeconds: durationSec,
            sessionType: 'BACKGROUND_AUDIO', // Strictly separated from screen time!
            surahNumber,
          });
        }
        this.isMurottalPlayingInBackground = false;
      }
    }
  }

  private handleAppBackground() {
    this.isAppForeground = false;
    // End any active foreground screen time session
    if (this.activeCategory && this.sessionStartTime > 0) {
      const elapsedSec = Math.round((Date.now() - this.sessionStartTime) / 1000);
      if (elapsedSec >= 5) {
        this.sendSession({
          activityCategory: this.activeCategory,
          durationSeconds: elapsedSec,
          sessionType: 'FOREGROUND_ACTIVE',
          surahNumber: this.currentSurah,
          ayahNumber: this.currentAyah,
        });
      }
      this.activeCategory = null;
      this.sessionStartTime = 0;
    }
  }

  private handleAppForeground() {
    this.isAppForeground = true;
    if (this.isMurottalPlayingInBackground) {
      const durationSec = Math.round((Date.now() - this.backgroundAudioStartTime) / 1000);
      if (durationSec >= 5) {
        this.sendSession({
          activityCategory: 'AUDIO_LISTENING',
          durationSeconds: durationSec,
          sessionType: 'BACKGROUND_AUDIO',
          surahNumber: this.currentSurah,
        });
      }
      this.isMurottalPlayingInBackground = false;
    }
  }

  public startSession(category: ActivityLogPayload['activityCategory'], surahNumber?: number, ayahNumber?: number) {
    if (!this.isAppForeground) return;

    if (this.activeCategory && this.sessionStartTime > 0) {
      this.endSession();
    }

    this.activeCategory = category;
    this.sessionStartTime = Date.now();
    this.currentSurah = surahNumber;
    this.currentAyah = ayahNumber;
  }

  public endSession(details?: Record<string, unknown>) {
    if (!this.activeCategory || this.sessionStartTime === 0) return;

    const durationSec = Math.round((Date.now() - this.sessionStartTime) / 1000);
    if (durationSec >= 5) {
      this.sendSession({
        activityCategory: this.activeCategory,
        durationSeconds: durationSec,
        sessionType: 'FOREGROUND_ACTIVE',
        surahNumber: this.currentSurah,
        ayahNumber: this.currentAyah,
        details,
      });
    }

    this.activeCategory = null;
    this.sessionStartTime = 0;
  }

  public recordAction(
    actionOrObj: string | { actionType?: string; details?: string; metadata?: Record<string, unknown> },
    meta?: Record<string, unknown>
  ) {
    try {
      const details = typeof actionOrObj === 'string'
        ? { actionName: actionOrObj, ...meta }
        : { ...actionOrObj, ...meta };
      this.sendSession({
        activityCategory: 'TAJWID_LESSON',
        durationSeconds: 1,
        sessionType: 'FOREGROUND_ACTIVE',
        details,
      });
    } catch {
      // safe fallback
    }
  }

  private async sendSession(payload: ActivityLogPayload) {
    try {
      const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
      await fetch('/api/family/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          devicePlatform: isAndroid ? 'ANDROID' : 'WEB',
        }),
      });
    } catch {
      // Offline queue can handle retry
    }
  }
}

export const activityTracker = new ClientActivityTracker();
