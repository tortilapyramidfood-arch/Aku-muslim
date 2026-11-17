import { humanAudioService } from './humanAudioService';

/**
 * Audio Service for Adzan, Murottal, Hijaiyah, and Tasbih Click
 * 100% Bebas TTS/Suara AI untuk modul pembelajaran Quran & Hijaiyah
 */
class AudioService {
  private adzanAudio: HTMLAudioElement | null = null;
  private murottalAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a subtle haptic-like click sound for Digital Tasbih
   */
  playTasbihClick() {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio synthesis errors on strict browsers
    }
  }

  /**
   * Plays a celebratory gentle chime for quiz completion or memorization success
   */
  playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Plays Adzan audio preview (Makkah / Madinah) with synthetic melody fallback
   */
  async playAdzan(type: 'makkah' | 'madinah' | 'beep' = 'makkah', onEnd?: () => void): Promise<void> {
    this.stopAdzan();

    if (type === 'beep') {
      this.playSuccessChime();
      if (onEnd) onEnd();
      return;
    }

    // Authentic reliable adzan audio link (public domain / open Islamic archive)
    const adzanUrl = type === 'madinah'
      ? 'https://raw.githubusercontent.com/AalianKhan/adhans/master/adhan_fajr.mp3'
      : 'https://raw.githubusercontent.com/AalianKhan/adhans/master/adhan.mp3';

    try {
      this.adzanAudio = new Audio(adzanUrl);
      this.adzanAudio.volume = 0.85;

      this.adzanAudio.onended = () => {
        if (onEnd) onEnd();
      };

      this.adzanAudio.onerror = () => {
        // Fallback to soothing chime if audio network is unreachable
        this.playSuccessChime();
        if (onEnd) onEnd();
      };

      await this.adzanAudio.play();
    } catch {
      this.playSuccessChime();
      if (onEnd) onEnd();
    }
  }

  stopAdzan() {
    if (this.adzanAudio) {
      this.adzanAudio.pause();
      this.adzanAudio.currentTime = 0;
      this.adzanAudio = null;
    }
  }

  isAdzanPlaying(): boolean {
    return !!this.adzanAudio && !this.adzanAudio.paused;
  }

  /**
   * Plays Quran Ayah recitation audio (Syaikh Mahmud Khalil Al-Husary - Standar Tartil)
   * Format: https://everyayah.com/data/Husary_128kbps/{surahPadded}{ayahPadded}.mp3
   */
  async playAyahAudio(surahNumber: number, ayahNumber: number, onEnd?: () => void): Promise<boolean> {
    this.stopMurottal();

    const sStr = String(surahNumber).padStart(3, '0');
    const aStr = String(ayahNumber).padStart(3, '0');
    const url = `https://everyayah.com/data/Husary_128kbps/${sStr}${aStr}.mp3`;

    try {
      this.murottalAudio = new Audio(url);
      this.murottalAudio.volume = 1.0;

      this.murottalAudio.onended = () => {
        if (onEnd) onEnd();
      };

      await this.murottalAudio.play();
      return true;
    } catch {
      return false;
    }
  }

  stopMurottal() {
    if (this.murottalAudio) {
      this.murottalAudio.pause();
      this.murottalAudio.currentTime = 0;
      this.murottalAudio = null;
    }
  }

  isMurottalPlaying(): boolean {
    return !!this.murottalAudio && !this.murottalAudio.paused;
  }

  /**
   * Putar pelafalan huruf Hijaiyah menggunakan 100% rekaman suara manusia asli.
   * Dilarang keras menggunakan TTS / Web Speech API sesuai mandat Owner & Syariah.
   */
  speakHijaiyah(arabicText: string, latinName?: string) {
    // Memutar rekaman ustadz bersanad tanpa suara sintetis browser
    return humanAudioService.playHijaiyahAudio(arabicText || latinName || '', 'name');
  }

  /**
   * Helper alias untuk pemutaran audio manusia asli
   */
  playHijaiyahHumanAudio(arabicOrId: string | number, variant: 'name' | 'fathah' | 'kasrah' | 'dhammah' | 'sukun' | 'quran' = 'name') {
    return humanAudioService.playHijaiyahAudio(arabicOrId, variant);
  }
}

export const audioService = new AudioService();
