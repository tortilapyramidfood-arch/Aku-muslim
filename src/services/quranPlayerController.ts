/**
 * Quran Audio Player Controller (Full Surah, Juz, & Single Ayah Continuous Playback)
 * AKU MUSLIM — MediaSession API, Lockscreen Controls, & True Offline Player
 */

import { QARI_LIST, QariInfo, DEFAULT_QARI } from '../data/qariList';
import { SURAH_LIST } from '../data/surahList';
import { JUZ_LIST } from '../data/juzList';
import { quranAudioStorage } from './quranAudioStorageService';

export type RepeatMode = 'none' | 'repeat_ayah' | 'repeat_surah';

export interface PlayerState {
  isPlaying: boolean;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  ayahNumber: number;
  qari: QariInfo;
  playbackRate: number;
  repeatMode: RepeatMode;
  autoPlayNextSurah: boolean;
  currentTime: number;
  duration: number;
  isOffline: boolean;
  isCurrentAyahOfflineReady: boolean;
  activeJuzNumber?: number;
  statusMessage?: string;
}

type StateListener = (state: PlayerState) => void;

class QuranPlayerController {
  private audio: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private listeners: Set<StateListener> = new Set();

  private state: PlayerState = {
    isPlaying: false,
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    totalAyahs: 7,
    ayahNumber: 1,
    qari: DEFAULT_QARI,
    playbackRate: 1.0,
    repeatMode: 'none',
    autoPlayNextSurah: true,
    currentTime: 0,
    duration: 0,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    isCurrentAyahOfflineReady: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateOnlineStatus(true));
      window.addEventListener('offline', () => this.updateOnlineStatus(false));
      this.initMediaSession();
    }
  }

  private updateOnlineStatus(online: boolean) {
    this.state.isOffline = !online;
    this.notify();
  }

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.ontimeupdate = () => {
        if (this.audio) {
          this.state.currentTime = this.audio.currentTime;
          this.state.duration = this.audio.duration || 0;
          this.notify();
        }
      };

      this.audio.onended = () => {
        this.handleTrackEnded();
      };

      this.audio.onerror = () => {
        this.state.isPlaying = false;
        this.state.statusMessage = 'Gagal memutar audio. Periksa koneksi internet atau unduh surah ini.';
        this.notify();
      };
    }
    return this.audio;
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
    this.updateMediaSession();
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  getState(): PlayerState {
    return { ...this.state };
  }

  private initMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prevAyah());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextAyah());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && this.audio) {
          this.audio.currentTime = details.seekTime;
        }
      });
    } catch {
      // Ignored if browser rejects some action handlers
    }
  }

  private updateMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `QS. ${this.state.surahName}: Ayat ${this.state.ayahNumber}`,
        artist: this.state.qari.name,
        album: `AKU MUSLIM — Al-Qur'an 30 Juz (${this.state.qari.style})`,
        artwork: [
          { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      });
      navigator.mediaSession.playbackState = this.state.isPlaying ? 'playing' : 'paused';
    } catch {
      // Fallback
    }
  }

  /**
   * Putar satu ayat tertentu atau mulai rangkaian surah
   */
  async playAyah(surahNumber: number, ayahNumber: number, surahName?: string, totalAyahs?: number): Promise<boolean> {
    const sMeta = SURAH_LIST.find((s) => s.number === surahNumber);
    const surahTitle = surahName || sMeta?.nameLatin || `Surah ${surahNumber}`;
    const totalCount = totalAyahs || sMeta?.numberOfAyahs || 7;

    this.state.surahNumber = surahNumber;
    this.state.surahName = surahTitle;
    this.state.totalAyahs = totalCount;
    this.state.ayahNumber = ayahNumber;
    this.state.statusMessage = undefined;

    const audioEl = this.getAudio();

    // 1. Cek apakah file sudah tersimpan di IndexedDB offline
    const offlineBlobUrl = await quranAudioStorage.getAyahAudioUrl(this.state.qari.id, surahNumber, ayahNumber);

    if (offlineBlobUrl) {
      if (this.currentBlobUrl) URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = offlineBlobUrl;
      audioEl.src = offlineBlobUrl;
      this.state.isCurrentAyahOfflineReady = true;
    } else {
      this.state.isCurrentAyahOfflineReady = false;

      // Jika offline dan audio belum diunduh, jangan streaming diam-diam!
      if (!navigator.onLine) {
        this.state.isPlaying = false;
        this.state.statusMessage = `Ayat ${ayahNumber} belum diunduh untuk penggunaan offline. Aktifkan internet atau unduh Surah ${surahTitle}.`;
        this.notify();
        return false;
      }

      // Streaming online
      const sStr = String(surahNumber).padStart(3, '0');
      const aStr = String(ayahNumber).padStart(3, '0');
      audioEl.src = `${this.state.qari.baseUrl}${sStr}${aStr}.mp3`;
    }

    audioEl.playbackRate = this.state.playbackRate;

    try {
      await audioEl.play();
      this.state.isPlaying = true;
      this.notify();
      return true;
    } catch (err: any) {
      this.state.isPlaying = false;
      this.state.statusMessage = 'Sentuh tombol putar untuk memulai audio.';
      this.notify();
      return false;
    }
  }

  /**
   * Putar satu surah penuh dari ayat 1
   */
  async playFullSurah(surahNumber: number, surahName?: string, totalAyahs?: number): Promise<boolean> {
    this.state.activeJuzNumber = undefined;
    return this.playAyah(surahNumber, 1, surahName, totalAyahs);
  }

  /**
   * Putar satu juz penuh mulai dari surah pertama dalam juz tersebut
   */
  async playFullJuz(juzNumber: number): Promise<boolean> {
    const juzMeta = JUZ_LIST.find((j) => j.juzNumber === juzNumber);
    const surahNumber = juzMeta ? juzMeta.startSurahNumber : (SURAH_LIST.find((s) => s.juzNumber === juzNumber)?.number || 1);
    const targetSurah = SURAH_LIST.find((s) => s.number === surahNumber);
    if (!targetSurah) return false;
    this.state.activeJuzNumber = juzNumber;
    return this.playAyah(targetSurah.number, 1, targetSurah.nameLatin, targetSurah.numberOfAyahs);
  }

  /**
   * Menangani ketika ayat selesai diputar
   */
  private handleTrackEnded() {
    // 1. Repeat Ayah
    if (this.state.repeatMode === 'repeat_ayah') {
      this.playAyah(this.state.surahNumber, this.state.ayahNumber);
      return;
    }

    // 2. Next Ayah in current surah
    if (this.state.ayahNumber < this.state.totalAyahs) {
      this.playAyah(this.state.surahNumber, this.state.ayahNumber + 1);
      return;
    }

    // 3. Surah finished! Repeat surah if requested
    if (this.state.repeatMode === 'repeat_surah') {
      this.playAyah(this.state.surahNumber, 1);
      return;
    }

    // 4. If playing a full Juz, advance to next surah in this Juz
    if (this.state.activeJuzNumber) {
      const juzMeta = JUZ_LIST.find((j) => j.juzNumber === this.state.activeJuzNumber);
      const surahListInJuz = juzMeta
        ? (juzMeta.includedSurahNumbers.map((num) => SURAH_LIST.find((s) => s.number === num)).filter(Boolean) as typeof SURAH_LIST)
        : SURAH_LIST.filter((s) => s.juzNumber === this.state.activeJuzNumber);

      const currentIndex = surahListInJuz.findIndex((s) => s.number === this.state.surahNumber);
      if (currentIndex !== -1 && currentIndex + 1 < surahListInJuz.length) {
        const nextSurahInJuz = surahListInJuz[currentIndex + 1];
        this.playAyah(nextSurahInJuz.number, 1, nextSurahInJuz.nameLatin, nextSurahInJuz.numberOfAyahs);
        return;
      }
    }

    // 5. Auto-play next surah if enabled
    if (this.state.autoPlayNextSurah && this.state.surahNumber < 114) {
      const nextSurah = SURAH_LIST.find((s) => s.number === this.state.surahNumber + 1);
      if (nextSurah) {
        this.playAyah(nextSurah.number, 1, nextSurah.nameLatin, nextSurah.numberOfAyahs);
        return;
      }
    }

    // End of playback
    this.state.isPlaying = false;
    this.state.activeJuzNumber = undefined;
    this.notify();
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
      this.state.isPlaying = false;
      this.notify();
    }
  }

  resume() {
    if (this.audio) {
      this.audio.play().then(() => {
        this.state.isPlaying = true;
        this.notify();
      }).catch(() => {
        this.state.isPlaying = false;
        this.notify();
      });
    }
  }

  togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      if (this.audio && this.audio.src) {
        this.resume();
      } else {
        this.playAyah(this.state.surahNumber, this.state.ayahNumber);
      }
    }
  }

  nextAyah() {
    if (this.state.ayahNumber < this.state.totalAyahs) {
      this.playAyah(this.state.surahNumber, this.state.ayahNumber + 1);
    } else if (this.state.surahNumber < 114) {
      const nextSurah = SURAH_LIST.find((s) => s.number === this.state.surahNumber + 1);
      if (nextSurah) {
        this.playAyah(nextSurah.number, 1, nextSurah.nameLatin, nextSurah.numberOfAyahs);
      }
    }
  }

  prevAyah() {
    if (this.state.ayahNumber > 1) {
      this.playAyah(this.state.surahNumber, this.state.ayahNumber - 1);
    } else if (this.state.surahNumber > 1) {
      const prevSurah = SURAH_LIST.find((s) => s.number === this.state.surahNumber - 1);
      if (prevSurah) {
        this.playAyah(prevSurah.number, prevSurah.numberOfAyahs, prevSurah.nameLatin, prevSurah.numberOfAyahs);
      }
    }
  }

  seek(seconds: number) {
    if (this.audio) {
      this.audio.currentTime = seconds;
      this.state.currentTime = seconds;
      this.notify();
    }
  }

  setPlaybackRate(rate: number) {
    this.state.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.notify();
  }

  setRepeatMode(mode: RepeatMode) {
    this.state.repeatMode = mode;
    this.notify();
  }

  setAutoPlayNextSurah(enabled: boolean) {
    this.state.autoPlayNextSurah = enabled;
    this.notify();
  }

  setQari(qari: QariInfo) {
    const wasPlaying = this.state.isPlaying;
    this.state.qari = qari;
    this.notify();
    if (wasPlaying) {
      this.playAyah(this.state.surahNumber, this.state.ayahNumber);
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    this.notify();
  }
}

export const quranPlayer = new QuranPlayerController();
