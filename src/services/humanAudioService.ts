/**
 * Layanan Audio Suara Manusia Asli (100% Human Voice Audio Service)
 * AKU MUSLIM — PYRAMID GROUP
 *
 * PERATURAN MUTLAK SYARIAH & OWNER (TAHAP 7.4):
 * 1. DILARANG KERAS menggunakan speechSynthesis.speak(), SpeechSynthesisUtterance,
 *    Google TTS, atau suara generatif AI dalam bentuk apa pun.
 * 2. Seluruh pelafalan huruf hijaiyah dan Iqra 1–6 WAJIB menggunakan rekaman suara manusia asli.
 * 3. Jika rekaman audio belum tersedia, kembalikan status "Audio belum tersedia" tanpa fallback sintetis.
 * 4. Mendukung kontrol: Dengarkan, Ulangi, Pelan (0.75x tanpa distorsi), dan Lanjutkan.
 * 5. Menghentikan audio yang sedang berjalan sebelum memutar audio baru (mencegah audio tumpang-tindih).
 */

import { HIJAIYAH_AUDIO_CATALOG, HijaiyahAudioItem } from '../data/hijaiyahAudioCatalog';

export type AudioVariant = 'name' | 'fathah' | 'kasrah' | 'dhammah' | 'sukun' | 'quran';

export interface HumanAudioPlayResult {
  success: boolean;
  status: 'PLAYING' | 'UNAVAILABLE' | 'ERROR';
  message: string;
  letterId?: number;
  variant?: AudioVariant;
  audioUrl?: string;
  arabic?: string;
  playbackRate?: number;
}

export type PlaybackStateListener = (state: {
  isPlaying: boolean;
  currentLetterId: number | null;
  currentVariant: AudioVariant | null;
  statusMessage: string;
  playbackRate: number;
}) => void;

class HumanAudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentLetterId: number | null = null;
  private currentVariant: AudioVariant | null = null;
  private lastPlayedUrl: string | null = null;
  private lastPlayedTitle: string | null = null;
  private currentPlaybackRate: number = 1.0;
  private listeners: Set<PlaybackStateListener> = new Set();

  /**
   * Menghentikan seluruh pemutaran audio yang aktif
   */
  public stopAllAudio(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Safe catch on abort
      }
      this.currentAudio = null;
    }
    this.currentLetterId = null;
    this.currentVariant = null;
    this.notifyListeners(false, null, null, 'Audio dihentikan', this.currentPlaybackRate);
  }

  /**
   * Memeriksa apakah audio sedang diputar
   */
  public isAudioPlaying(): boolean {
    return !!this.currentAudio && !this.currentAudio.paused;
  }

  /**
   * Mengatur kecepatan pemutaran (misal 1.0x normal, 0.75x pelan untuk santri anak)
   */
  public setPlaybackRate(rate: number): void {
    this.currentPlaybackRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.currentPlaybackRate;
    }
  }

  public getPlaybackRate(): number {
    return this.currentPlaybackRate;
  }

  /**
   * Ambil item katalog hijaiyah berdasarkan id atau huruf arab
   */
  public getLetterCatalog(letterIdOrArabic: number | string): HijaiyahAudioItem | undefined {
    if (typeof letterIdOrArabic === 'number') {
      return HIJAIYAH_AUDIO_CATALOG.find((item) => item.letter_id === letterIdOrArabic);
    }
    return HIJAIYAH_AUDIO_CATALOG.find(
      (item) => item.arabic_letter === letterIdOrArabic || item.latin_name.toLowerCase() === letterIdOrArabic.toLowerCase()
    );
  }

  /**
   * Putar rekaman suara manusia asli untuk huruf hijaiyah tertentu
   */
  public async playHijaiyahAudio(
    letterIdOrArabic: number | string,
    variant: AudioVariant = 'name',
    rate: number = 1.0
  ): Promise<HumanAudioPlayResult> {
    // 1. Hentikan audio sebelumnya untuk mencegah tumpang-tindih
    this.stopAllAudio();
    this.currentPlaybackRate = rate;

    const letter = this.getLetterCatalog(letterIdOrArabic);
    if (!letter) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        message: 'Huruf tidak ditemukan dalam katalog pembelajaran.',
        playbackRate: rate,
      };
    }

    // 2. Cek status review rekaman
    if (letter.review_status === 'BELUM ADA AUDIO' || letter.license_status === 'PENDING_RECORDING') {
      return {
        success: false,
        status: 'UNAVAILABLE',
        message: `Audio belum tersedia untuk huruf ${letter.latin_name} (${letter.arabic_letter}). Menunggu rekaman ustadz bersanad.`,
        letterId: letter.letter_id,
        variant,
        arabic: letter.arabic_letter,
        playbackRate: rate,
      };
    }

    // 3. Tentukan URL audio sesuai variasi
    let audioUrl: string | undefined;
    switch (variant) {
      case 'name':
        audioUrl = letter.audio_letter_name;
        break;
      case 'fathah':
        audioUrl = letter.audio_fathah;
        break;
      case 'kasrah':
        audioUrl = letter.audio_kasrah;
        break;
      case 'dhammah':
        audioUrl = letter.audio_dhammah;
        break;
      case 'sukun':
        audioUrl = letter.audio_sukun_example;
        break;
      case 'quran':
        audioUrl = letter.audio_quran_example;
        break;
    }

    // Cek ketersediaan file rekaman nyata & status verifikasi domain
    if (
      !audioUrl ||
      audioUrl.trim() === '' ||
      audioUrl.includes('cdn.akumuslim.id')
    ) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        message: `Audio belum tersedia untuk huruf ${letter.latin_name} (${letter.arabic_letter}). Menunggu verifikasi file rekaman fisik & izin lisensi resmi.`,
        letterId: letter.letter_id,
        variant,
        arabic: letter.arabic_letter,
        playbackRate: rate,
      };
    }

    this.lastPlayedUrl = audioUrl;
    this.lastPlayedTitle = `${letter.latin_name} (${variant})`;

    // 4. Putar menggunakan elemen HTMLAudioElement manusia asli
    if (typeof window === 'undefined') {
      return {
        success: true,
        status: 'PLAYING',
        message: 'Simulasi pemutaran di lingkungan server.',
        letterId: letter.letter_id,
        variant,
        audioUrl,
        arabic: letter.arabic_letter,
        playbackRate: rate,
      };
    }

    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = this.currentPlaybackRate;
      this.currentAudio = audio;
      this.currentLetterId = letter.letter_id;
      this.currentVariant = variant;

      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.currentLetterId = null;
          this.currentVariant = null;
          this.notifyListeners(false, null, null, 'Selesai', this.currentPlaybackRate);
        }
      };

      audio.onerror = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.currentLetterId = null;
          this.currentVariant = null;
          this.notifyListeners(false, null, null, 'Audio belum tersedia', this.currentPlaybackRate);
        }
      };

      this.notifyListeners(true, letter.letter_id, variant, `Memutar suara: ${letter.latin_name} (${variant})`, this.currentPlaybackRate);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((err) => {
          console.warn('[HumanAudioService] Playback notice:', err?.message || err);
        });
      }

      return {
        success: true,
        status: 'PLAYING',
        message: `Memutar suara manusia asli: ${letter.latin_name} (${variant}) oleh ${letter.narrator_name}`,
        letterId: letter.letter_id,
        variant,
        audioUrl,
        arabic: letter.arabic_letter,
        playbackRate: rate,
      };
    } catch (err: unknown) {
      this.stopAllAudio();
      return {
        success: false,
        status: 'UNAVAILABLE',
        message: `Audio belum tersedia: ${(err as Error)?.message || 'Galat jaringan'}`,
        letterId: letter.letter_id,
        variant,
        audioUrl,
        arabic: letter.arabic_letter,
        playbackRate: rate,
      };
    }
  }

  /**
   * Putar audio pembelajaran umum (misal audio kata Iqra / contoh tajwid dari pengajar manusia)
   */
  public async playCustomHumanAudio(
    audioUrl: string,
    title: string,
    rate: number = 1.0
  ): Promise<HumanAudioPlayResult> {
    this.stopAllAudio();
    this.currentPlaybackRate = rate;

    if (!audioUrl || audioUrl.trim() === '' || audioUrl.includes('cdn.akumuslim.id')) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        message: 'Audio belum tersedia untuk materi ini (menunggu rekaman fisik asli terverifikasi).',
        playbackRate: rate,
      };
    }

    this.lastPlayedUrl = audioUrl;
    this.lastPlayedTitle = title;

    if (typeof window === 'undefined') {
      return {
        success: true,
        status: 'PLAYING',
        message: `Memutar audio manusia: ${title}`,
        audioUrl,
        playbackRate: rate,
      };
    }

    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = this.currentPlaybackRate;
      this.currentAudio = audio;

      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.notifyListeners(false, null, null, 'Selesai', this.currentPlaybackRate);
        }
      };

      audio.onerror = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.notifyListeners(false, null, null, 'Audio belum tersedia', this.currentPlaybackRate);
        }
      };

      this.notifyListeners(true, null, null, `Memutar audio pengajar: ${title}`, this.currentPlaybackRate);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((err) => {
          console.warn('[HumanAudioService] Playback notice:', err?.message || err);
        });
      }

      return {
        success: true,
        status: 'PLAYING',
        message: `Memutar rekaman pengajar: ${title} (${rate < 1 ? 'Tempo Pelan' : 'Tempo Normal'})`,
        audioUrl,
        playbackRate: rate,
      };
    } catch {
      this.stopAllAudio();
      return {
        success: false,
        status: 'UNAVAILABLE',
        message: 'Audio belum tersedia.',
        audioUrl,
        playbackRate: rate,
      };
    }
  }

  /**
   * Ulangi bacaan audio terakhir yang baru diputar
   */
  public async replayLastAudio(): Promise<HumanAudioPlayResult> {
    if (!this.lastPlayedUrl) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        message: 'Belum ada audio yang dipilih untuk diulangi.',
      };
    }
    return this.playCustomHumanAudio(
      this.lastPlayedUrl,
      this.lastPlayedTitle || 'Bacaan Terakhir',
      this.currentPlaybackRate
    );
  }

  /**
   * Berlangganan status pemutaran
   */
  public subscribe(listener: PlaybackStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(
    isPlaying: boolean,
    letterId: number | null,
    variant: AudioVariant | null,
    statusMessage: string,
    playbackRate: number
  ): void {
    this.listeners.forEach((listener) => {
      try {
        listener({
          isPlaying,
          currentLetterId: letterId,
          currentVariant: variant,
          statusMessage,
          playbackRate,
        });
      } catch {
        // Ignore listener error
      }
    });
  }
}

export const humanAudioService = new HumanAudioService();
