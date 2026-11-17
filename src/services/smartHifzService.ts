/**
 * Smart Hifz Service — Mesin Pengenalan Suara & Pencocokan Hafalan Al-Qur'an
 * AKU MUSLIM — PYRAMID GROUP
 * Mendukung Seluruh 114 Surah Al-Qur'an & Referensi Audio Syaikh Mahmud Khalil Al-Husary
 * Berjalan On-Device / Browser Web Speech API (Rp 0 Biaya AI Runtime)
 */

import { SURAH_LIST } from '../data/surahList';
import { fetchSurahVerses } from '../data/quranSampleVerses';

export interface HifzWord {
  id: number;
  arabicOriginal: string;
  arabicNormalized: string;
  transliteration: string;
  translation: string;
  isRevealed: boolean;
  wasAssisted: boolean;
  status?: 'COCOK' | 'PERLU_DIULANG' | 'BELUM_DIKENALI';
}

export interface HifzAyah {
  ayahNumber: number;
  fullArabic: string;
  translation: string;
  words: HifzWord[];
  audioUrl?: string;
}

export interface HifzSurahData {
  surahNumber: number;
  surahName: string;
  arabicName: string;
  totalAyahs: number;
  ayahs: HifzAyah[];
  qariName?: string;
  qariEdition?: string;
  licenseStatus?: string;
}

export interface SmartHifzCatalogItem {
  number: number;
  nameArabic: string;
  nameLatin: string;
  nameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Makkiyah' | 'Madaniyah';
  juzNumber: number;
  memorizationStatus: 'BELUM_MULAI' | 'SEDANG_DIHAFAL' | 'SELESAI';
  lastAyahPracticed: number;
  accuracyPercent: number;
}

export interface TalaqqiRecord {
  id: string;
  date: string;
  surahName: string;
  ayahRange: string;
  accuracyPercent: number;
  evaluatorRole: 'Orang Tua' | 'Ustadz / Pembimbing' | 'Mandiri';
  evaluatorName: string;
  status: 'Mumtaz (Sempurna)' | 'Jayyid Jiddan (Sangat Baik)' | 'Perlu Murajaah';
  notes: string;
}

/**
 * Metadata Resmi Qari Mahmud Khalil Al-Husary
 * Sesuai Kepatuhan Lisensi Hak Cipta ERTU & Al-Husary Family Waqf
 */
export const QARI_MAHMUD_METADATA = {
  id: 'husary',
  name: 'Syaikh Mahmud Khalil Al-Husary',
  arabicName: 'محمود خليل الحصري',
  style: 'Murattal Tartil Standar Mesir (Sangat Jelas & Lambat untuk Belajar)',
  editionName: "Murattal Radio Al-Qur'an Kairo 1960 (Edisi Standar Mesir)",
  baseUrl: 'https://everyayah.com/data/Husary_128kbps/',
  rightsHolder: 'Egyptian Radio and Television Union (ERTU) & Al-Husary Family Waqf',
  licenseStatus: 'LICENSE_REVIEW_REQUIRED' as const,
  legalNotice: 'Digunakan untuk pembelajaran tartil dan uji coba internal non-komersial. Memerlukan izin resmi sebelum rilis publik.',
};

/**
 * Menghasilkan URL Audio Per Ayat Syaikh Mahmud Khalil Al-Husary dari EveryAyah CDN
 * Format standar resmi: 001001.mp3 (3 digit surah, 3 digit ayat)
 */
export function getHusaryAyahAudioUrl(surahNumber: number, ayahNumber: number): string {
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/Husary_128kbps/${sStr}${aStr}.mp3`;
}

/**
 * Normalisasi Teks Arab Tingkat Lanjut untuk Evaluasi Hafalan & Pencocokan ASR
 * Menangani ortografi Mushaf Utsmani vs output ASR modern (ar-SA):
 * 1. Penghapusan tanda harakat/tashkil, waqaf, dagger alif, dan tanda baca.
 * 2. Standardisasi variasi Alif (أ, إ, آ, ٱ, ء -> ا).
 * 3. Normalisasi Waw Utsmani dengan Dagger Alif (صلوة -> صلاة, زكوة -> زكاة, حيوة -> حياة, ربوا -> ربا).
 * 4. Normalisasi Alif Maqsura & Ya (ى <-> ي).
 * 5. Normalisasi Ta Marbuthah (ة -> ه).
 * 6. Penghapusan Tatweel (ـ) dan spasi berlebih.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';

  let normalized = text
    // Hapus tanda harakat / tashkil & tanda waqaf Utsmani
    // \u064B-\u065F: fathah, dhammah, kasrah, tanwin, sukun, syaddah
    // \u0670: superscript alef (dagger alif)
    // \u06D6-\u06ED: Quranic stop signs, sajdah marks, small letters
    // \u06E5-\u06E6: small waw and ya
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u06E5\u06E6]/g, '')
    // Samakan variasi Alif (أ, إ, آ, ٱ, ء)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ء/g, '')
    // Samakan Ya mardudah / alif maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Samakan Ta Marbuthah (ة -> ه)
    .replace(/ة/g, 'ه')
    // Hapus tanda baca Arab & Latin
    .replace(/[،؛؟.,!?:;"'()\-–—«»/\\0-9\u0660-\u0669]/g, '')
    // Hapus tatweel / kashida (ـ)
    .replace(/\u0640/g, '')
    .trim()
    .replace(/\s+/g, ' ');

  // Ortografi Khusus Utsmani yang sering ditranskripsi berbeda oleh ASR:
  // صلوة -> صلاة (sholat)
  normalized = normalized.replace(/صلوه/g, 'صلاه');
  // زكوة -> زكاة (zakat)
  normalized = normalized.replace(/زكوه/g, 'زكاه');
  // حيوة -> حياة (hayat)
  normalized = normalized.replace(/حيوه/g, 'حياه');
  // ربوا -> ربا (riba)
  normalized = normalized.replace(/ربوا/g, 'ربا');

  return normalized;
}

/**
 * Menghitung jarak Levenshtein antara dua kata Arab yang telah dinormalisasi
 */
export function calculateArabicLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Membandingkan kata yang diucapkan dengan kata target Al-Qur'an
 * Menyediakan 3 kategori hasil resmi: COCOK, PERLU_DIULANG, BELUM_DIKENALI
 */
export function matchHifzWord(
  spokenTranscript: string,
  targetArabic: string
): {
  matched: boolean;
  confidence: number;
  matchType: 'exact' | 'normalized' | 'prefix' | 'phonetic' | 'none';
  status: 'COCOK' | 'PERLU_DIULANG' | 'BELUM_DIKENALI';
} {
  const normSpoken = normalizeArabicText(spokenTranscript);
  const normTarget = normalizeArabicText(targetArabic);

  if (!normSpoken || !normTarget) {
    return { matched: false, confidence: 0, matchType: 'none', status: 'BELUM_DIKENALI' };
  }

  // 1. Exact normalized match (Kecocokan 100%)
  if (normSpoken === normTarget) {
    return { matched: true, confidence: 1.0, matchType: 'exact', status: 'COCOK' };
  }

  // 2. Token match (Jika transkrip terdiri dari beberapa kata)
  const tokens = normSpoken.split(' ').filter(Boolean);
  if (tokens.includes(normTarget)) {
    return { matched: true, confidence: 0.98, matchType: 'normalized', status: 'COCOK' };
  }

  // 3. De-concatenation & Preposition Prefix match (Misal awalan و, ف, ب, ل, ك atau Alif Lam ال)
  // Contoh: ASR menghasilkan "الحمدلله" yang memuat "الحمد" dan "لله"
  for (const token of tokens) {
    // Exact token match
    if (token === normTarget) {
      return { matched: true, confidence: 0.98, matchType: 'normalized', status: 'COCOK' };
    }

    // Sambungan awalan waw athaf (و) atau fa (ف)
    if (token.startsWith('و') && token.substring(1) === normTarget) {
      return { matched: true, confidence: 0.92, matchType: 'prefix', status: 'COCOK' };
    }
    if (token.startsWith('ف') && token.substring(1) === normTarget) {
      return { matched: true, confidence: 0.92, matchType: 'prefix', status: 'COCOK' };
    }
    if (token.startsWith('ب') && token.substring(1) === normTarget) {
      return { matched: true, confidence: 0.92, matchType: 'prefix', status: 'COCOK' };
    }

    // Variasi Alif Lam (ال)
    if (token.startsWith('ال') && token.substring(2) === normTarget) {
      return { matched: true, confidence: 0.90, matchType: 'prefix', status: 'COCOK' };
    }
    if (normTarget.startsWith('ال') && normTarget.substring(2) === token) {
      return { matched: true, confidence: 0.90, matchType: 'prefix', status: 'COCOK' };
    }

    // 4. Toleransi Fonetik & Karakter Akustik (Anak, Lansia, Aksen Indonesia)
    // Menggunakan jarak Levenshtein yang dikalibrasi
    if (normTarget.length >= 3 && token.length >= 3) {
      const distance = calculateArabicLevenshteinDistance(token, normTarget);
      const maxLen = Math.max(token.length, normTarget.length);
      const similarity = 1 - distance / maxLen;

      // Jika hanya selisih 1 karakter pada kata 4+ huruf (misal ح vs ه, ص vs س, ق vs ك)
      if (distance <= 1 && maxLen >= 4) {
        return { matched: true, confidence: 0.88, matchType: 'phonetic', status: 'COCOK' };
      }

      if (similarity >= 0.82) {
        return { matched: true, confidence: similarity, matchType: 'phonetic', status: 'COCOK' };
      }

      // Jika kemiripan sedang (0.50 - 0.81), tandai PERLU_DIULANG agar pengguna terbantu
      if (similarity >= 0.5) {
        return { matched: false, confidence: similarity, matchType: 'none', status: 'PERLU_DIULANG' };
      }
    }
  }

  return { matched: false, confidence: 0, matchType: 'none', status: 'BELUM_DIKENALI' };
}

/**
 * Mencocokkan urutan kata secara berurutan dalam transkrip ucapan (Sequential Multi-Token Matcher)
 * Memastikan:
 * 1. Kata berikutnya HANYA terbuka jika urutan kata sebelumnya telah valid.
 * 2. Kata-kata yang dibaca dalam satu napas (multi-token) terbuka berurutan secara real-time.
 * 3. Menangani de-concatenation (misal ucapan "الحمد لله" atau "الحمدلله").
 * 4. Tidak ada loncatan acak ke kata berikutnya.
 */
export function matchSequentialWords(
  spokenTranscript: string,
  words: HifzWord[],
  alreadyRevealedCount: number
): {
  matchedCount: number;
  matchedWordIds: number[];
  lastMatchedName: string;
  statuses: Record<number, 'COCOK' | 'PERLU_DIULANG' | 'BELUM_DIKENALI'>;
} {
  const normSpoken = normalizeArabicText(spokenTranscript);
  if (!normSpoken || alreadyRevealedCount >= words.length) {
    return { matchedCount: 0, matchedWordIds: [], lastMatchedName: '', statuses: {} };
  }

  // Pecah token ucapan dan dukung de-concatenation jika diperlukan
  let spokenTokens = normSpoken.split(' ').filter(Boolean);
  if (spokenTokens.length === 0) {
    return { matchedCount: 0, matchedWordIds: [], lastMatchedName: '', statuses: {} };
  }

  const matchedWordIds: number[] = [];
  const statuses: Record<number, 'COCOK' | 'PERLU_DIULANG' | 'BELUM_DIKENALI'> = {};
  let lastMatchedName = '';
  let tokenPointer = 0;
  let wordIndex = alreadyRevealedCount;

  while (wordIndex < words.length && tokenPointer < spokenTokens.length) {
    const targetWord = words[wordIndex];
    const targetNorm = targetWord.arabicNormalized;

    // Cek apakah token dalam jendela lookahead (toleransi jeda 2 token) cocok dengan kata target
    let foundMatchInWindow = false;
    const maxLookahead = Math.min(spokenTokens.length, tokenPointer + 3);

    for (let k = tokenPointer; k < maxLookahead; k++) {
      const token = spokenTokens[k];
      const matchResult = matchHifzWord(token, targetNorm);

      if (matchResult.matched && matchResult.status === 'COCOK') {
        matchedWordIds.push(targetWord.id);
        statuses[targetWord.id] = 'COCOK';
        lastMatchedName = targetWord.transliteration || targetWord.arabicOriginal;
        tokenPointer = k + 1;
        wordIndex++;
        foundMatchInWindow = true;
        break;
      } else if (matchResult.status === 'PERLU_DIULANG') {
        statuses[targetWord.id] = 'PERLU_DIULANG';
      }
    }

    if (!foundMatchInWindow) {
      // Periksa apakah token gabungan mengandung target kata di awal
      const currentToken = spokenTokens[tokenPointer];
      if (currentToken && currentToken.startsWith(targetNorm) && currentToken.length > targetNorm.length) {
        matchedWordIds.push(targetWord.id);
        statuses[targetWord.id] = 'COCOK';
        lastMatchedName = targetWord.transliteration || targetWord.arabicOriginal;
        // Pangkas sisa token untuk kata selanjutnya
        spokenTokens[tokenPointer] = currentToken.substring(targetNorm.length);
        wordIndex++;
        continue;
      }

      // Jika kata urutan belum cocok, jangan loncat ke kata berikutnya
      if (!statuses[targetWord.id]) {
        statuses[targetWord.id] = 'BELUM_DIKENALI';
      }
      break;
    }
  }

  return {
    matchedCount: matchedWordIds.length,
    matchedWordIds,
    lastMatchedName,
    statuses,
  };
}

/**
 * Global Speech Recognition Wrapper dengan Auto-Reconnect & Heartbeat
 * Dioptimalkan untuk Mobile Web, Chrome Android, dan WebView
 */
export type SpeechRecognitionState =
  | 'IDLE'
  | 'STARTING'
  | 'LISTENING'
  | 'STOPPING'
  | 'PAUSED_FOR_QARI'
  | 'ERROR';

/**
 * Single Controller Speech Recognition State Machine
 * Mencegah error "Failed to execute 'start' on 'SpeechRecognition': recognition has already started"
 * Menggunakan synchronous lock, state transition terstruktur, dan penanganan auto-next tanpa duplikasi sesi.
 */
export class SmartSpeechRecognition {
  private recognition: any = null;
  private state: SpeechRecognitionState = 'IDLE';
  private isSupported = false;
  private restartTimeout: any = null;
  private shouldKeepListening = false;
  private isLockAcquired = false;
  private retryCount = 0;
  private maxRetries = 5;

  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((errorMsg: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onStateChangeCallback: ((state: SpeechRecognitionState) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ar-SA'; // Bahasa Arab Saudi Arabia (Standar Tilawah Al-Qur'an)
        this.recognition.maxAlternatives = 3;
        this.isSupported = true;
        this.setupEventHandlers();
      }
    }
  }

  private setState(newState: SpeechRecognitionState) {
    if (this.state !== newState) {
      this.state = newState;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(newState);
      }
    }
  }

  private setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.setState('LISTENING');
      this.isLockAcquired = false;
      this.retryCount = 0;
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interimTranscript += res[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (text && this.onResultCallback) {
        this.onResultCallback(text.trim(), !!finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isLockAcquired = false;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.shouldKeepListening = false;
        this.setState('ERROR');
        if (this.onErrorCallback) {
          this.onErrorCallback('Izin mikrofon ditolak oleh browser/perangkat.');
        }
      } else if (event.error === 'no-speech') {
        // Jeda hening normal antar ayat / hembusan nafas, biarkan onend restart halus jika shouldKeepListening
      } else if (event.error === 'aborted') {
        // Dijeda oleh aplikasi secara sengaja
      } else {
        if (this.onErrorCallback) {
          this.onErrorCallback(`Status mikrofon: ${event.error}`);
        }
      }
    };

    this.recognition.onend = () => {
      this.isLockAcquired = false;
      
      if (this.state === 'PAUSED_FOR_QARI') {
        // Tetap dalam status paused untuk qari
        if (this.onEndCallback) this.onEndCallback();
        return;
      }

      const wasStopping = this.state === 'STOPPING';
      this.setState('IDLE');

      if (this.onEndCallback) {
        this.onEndCallback();
      }

      // Auto-reconnect terjaga dengan backoff aman, batalkan jika sudah distop atau melebihi kuota
      if (this.shouldKeepListening && !wasStopping && this.retryCount < this.maxRetries) {
        this.clearRestartTimer();
        this.restartTimeout = setTimeout(() => {
          if (this.shouldKeepListening && this.state === 'IDLE' && !this.isLockAcquired) {
            this.retryCount++;
            this.executeStart();
          }
        }, 300);
      }
    };
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.state === 'LISTENING';
  }

  public getState(): SpeechRecognitionState {
    return this.state;
  }

  public onStateChange(cb: (state: SpeechRecognitionState) => void) {
    this.onStateChangeCallback = cb;
  }

  private clearRestartTimer() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
  }

  private executeStart() {
    if (!this.recognition || !this.isSupported) return;
    if (this.state === 'LISTENING' || this.state === 'STARTING') {
      return; // Sudah berjalan, cegah start ganda
    }

    this.isLockAcquired = true;
    this.setState('STARTING');

    try {
      this.recognition.start();
    } catch (err: any) {
      this.isLockAcquired = false;
      // Tangani kasus browser di mana recognition masih dalam proses transisi
      if (err?.name === 'InvalidStateError' || (err?.message && err.message.includes('already started'))) {
        this.setState('LISTENING');
      } else {
        this.setState('ERROR');
        if (this.onErrorCallback) {
          this.onErrorCallback(err?.message || 'Gagal memulai mikrofon');
        }
      }
    }
  }

  /**
   * Memulai pengenalan suara dengan jaminan Synchronous Lock dan Single Session
   */
  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (errorMsg: string) => void,
    onEnd: () => void
  ) {
    if (!this.isSupported || !this.recognition) {
      onError('Browser Anda belum mendukung Web Speech Recognition. Gunakan Mode Manual.');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    // Jika sudah aktif mendengarkan, jangan panggil start() ganda!
    if (this.state === 'LISTENING' || this.state === 'STARTING') {
      return;
    }

    // Jika sedang dalam proses stopping, tunggu onend sebelum restart
    if (this.state === 'STOPPING') {
      this.shouldKeepListening = true;
      return;
    }

    this.clearRestartTimer();
    this.shouldKeepListening = true;
    this.retryCount = 0;
    this.executeStart();
  }

  /**
   * Menghentikan mikrofon secara permanen
   */
  public stop() {
    this.shouldKeepListening = false;
    this.clearRestartTimer();
    this.retryCount = 0;

    if (this.recognition && (this.state === 'LISTENING' || this.state === 'STARTING')) {
      this.setState('STOPPING');
      try {
        this.recognition.stop();
      } catch {
        this.setState('IDLE');
      }
    } else {
      this.setState('IDLE');
    }
  }

  /**
   * Jeda mikrofon khusus saat Qari Mahmud sedang melafalkan contoh
   */
  public pauseForQari() {
    this.clearRestartTimer();
    if (this.recognition && (this.state === 'LISTENING' || this.state === 'STARTING')) {
      this.setState('PAUSED_FOR_QARI');
      try {
        this.recognition.abort();
      } catch {
        // Safe catch
      }
    } else {
      this.setState('PAUSED_FOR_QARI');
    }
  }

  /**
   * Lanjutkan mendengarkan setelah qari selesai memutar bacaan
   */
  public resumeAfterQari() {
    if (this.state === 'PAUSED_FOR_QARI') {
      this.setState('IDLE');
      this.shouldKeepListening = true;
      this.executeStart();
    }
  }

  /**
   * Reset untuk auto-next ayat tanpa menghentikan / memulai ulang mikrofon!
   */
  public notifyNextAyahStarted() {
    // Sesi mikrofon tetap LISTENING, tidak perlu stop() atau start() baru
    this.clearRestartTimer();
  }
}

export const smartSpeechEngine = new SmartSpeechRecognition();

/**
 * Memecah Teks Arab Ayat Menjadi Array Kata (HifzWord[])
 * Mempertahankan teks asli Utsmani dengan seluruh harakat & tanda baca pada arabicOriginal
 */
export function decomposeAyahIntoWords(
  textArabic: string,
  ayahNumber: number,
  surahNumber: number,
  textTranslation?: string
): HifzWord[] {
  if (!textArabic) return [];

  // Pisahkan berdasarkan spasi
  const rawWords = textArabic.trim().split(/\s+/).filter(Boolean);

  return rawWords.map((word, idx) => {
    const norm = normalizeArabicText(word);
    return {
      id: idx + 1,
      arabicOriginal: word,
      arabicNormalized: norm,
      transliteration: `Kata ${idx + 1}`,
      translation: idx === 0 && textTranslation ? textTranslation : '',
      isRevealed: false,
      wasAssisted: false,
      status: 'BELUM_DIKENALI',
    };
  });
}

/**
 * Memuat Data Surah Lengkap untuk Smart Hifz (Dukungan Penuh Seluruh 114 Surah)
 * Menggunakan dataset lokal terverifikasi atau API Kemenag Equran
 */
export async function loadSurahForSmartHifz(surahNumber: number): Promise<HifzSurahData> {
  const meta = SURAH_LIST.find((s) => s.number === surahNumber) || SURAH_LIST[0];

  // Ambil ayat-ayat resmi
  const rawVerses = await fetchSurahVerses(surahNumber);

  const ayahs: HifzAyah[] = rawVerses.map((v) => {
    const words = decomposeAyahIntoWords(
      v.textArabic,
      v.numberInSurah,
      surahNumber,
      v.textTranslation
    );

    return {
      ayahNumber: v.numberInSurah,
      fullArabic: v.textArabic,
      translation: v.textTranslation || '',
      words,
      audioUrl: getHusaryAyahAudioUrl(surahNumber, v.numberInSurah),
    };
  });

  return {
    surahNumber: meta.number,
    surahName: meta.nameLatin,
    arabicName: meta.nameArabic,
    totalAyahs: meta.numberOfAyahs,
    ayahs,
    qariName: QARI_MAHMUD_METADATA.name,
    qariEdition: QARI_MAHMUD_METADATA.editionName,
    licenseStatus: QARI_MAHMUD_METADATA.licenseStatus,
  };
}

const memoryStorageMap: Record<string, string> = {};

function getStoredItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorageMap[key] || null;
    }
  }
  return memoryStorageMap[key] || null;
}

function setStoredItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStorageMap[key] = value;
    }
  }
  memoryStorageMap[key] = value;
}

/**
 * Memuat Katalog 114 Surah Smart Hifz Lengkap dengan Status Hafalan Tersimpan
 */
export function getSmartHifzSurahCatalog(): SmartHifzCatalogItem[] {
  let savedProgress: Record<number, { lastAyah: number; isCompleted: boolean; accuracy: number }> = {};
  try {
    const raw = getStoredItem('akumuslim_hifz_catalog_progress');
    if (raw) savedProgress = JSON.parse(raw);
  } catch {
    // Ignored
  }

  return SURAH_LIST.map((s) => {
    const prog = savedProgress[s.number];
    let status: SmartHifzCatalogItem['memorizationStatus'] = 'BELUM_MULAI';
    let lastAyah = 1;
    let acc = 0;

    if (prog) {
      if (prog.isCompleted) {
        status = 'SELESAI';
      } else if (prog.lastAyah > 1) {
        status = 'SEDANG_DIHAFAL';
      }
      lastAyah = prog.lastAyah || 1;
      acc = prog.accuracy || 0;
    }

    return {
      number: s.number,
      nameArabic: s.nameArabic,
      nameLatin: s.nameLatin,
      nameTranslation: s.nameTranslation,
      numberOfAyahs: s.numberOfAyahs,
      revelationType: s.revelationType,
      juzNumber: s.juzNumber,
      memorizationStatus: status,
      lastAyahPracticed: lastAyah,
      accuracyPercent: acc,
    };
  });
}

/**
 * Simpan Progres Hafalan Surah ke Local Storage
 */
export function saveSurahMemorizationProgress(
  surahNumber: number,
  ayahNumber: number,
  totalAyahs: number,
  accuracyPercent: number
) {
  try {
    const raw = getStoredItem('akumuslim_hifz_catalog_progress');
    const catalogProg = raw ? JSON.parse(raw) : {};

    const isCompleted = ayahNumber >= totalAyahs;
    catalogProg[surahNumber] = {
      lastAyah: ayahNumber,
      isCompleted,
      accuracy: Math.max(accuracyPercent, catalogProg[surahNumber]?.accuracy || 0),
      updatedAt: new Date().toISOString(),
    };

    setStoredItem('akumuslim_hifz_catalog_progress', JSON.stringify(catalogProg));
  } catch {
    // Ignored
  }
}

/**
 * Data Pre-cached Bawaan untuk Pilihan Kilat (Kompatibilitas Mundur & Pengujian Cepat)
 */
export const SMART_HIFZ_SURAHS: HifzSurahData[] = [
  {
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    arabicName: 'الفَاتِحَة',
    totalAyahs: 7,
    ayahs: [
      {
        ayahNumber: 1,
        fullArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
        audioUrl: getHusaryAyahAudioUrl(1, 1),
        words: [
          { id: 1, arabicOriginal: 'بِسْمِ', arabicNormalized: 'بسم', transliteration: 'Bismi', translation: 'Dengan nama', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'اللَّهِ', arabicNormalized: 'الله', transliteration: 'Allaahi', translation: 'Allah', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'الرَّحْمَٰنِ', arabicNormalized: 'الرحمن', transliteration: 'Ar-Rahmaan', translation: 'Maha Pengasih', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'الرَّحِيمِ', arabicNormalized: 'الرحيم', transliteration: 'Ar-Rahiim', translation: 'Maha Penyayang', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 2,
        fullArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: 'Segala puji bagi Allah, Tuhan seluruh alam.',
        audioUrl: getHusaryAyahAudioUrl(1, 2),
        words: [
          { id: 1, arabicOriginal: 'الْحَمْدُ', arabicNormalized: 'الحمد', transliteration: 'Al-Hamdu', translation: 'Segala puji', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'لِلَّهِ', arabicNormalized: 'لله', transliteration: 'Lillaahi', translation: 'Bagi Allah', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'رَبِّ', arabicNormalized: 'رب', transliteration: 'Rabbi', translation: 'Tuhan', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'الْعَالَمِينَ', arabicNormalized: 'العالمين', transliteration: 'Al-\'Aalamiin', translation: 'Seluruh alam', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 3,
        fullArabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Yang Maha Pengasih, Maha Penyayang.',
        audioUrl: getHusaryAyahAudioUrl(1, 3),
        words: [
          { id: 1, arabicOriginal: 'الرَّحْمَٰنِ', arabicNormalized: 'الرحمن', transliteration: 'Ar-Rahmaan', translation: 'Maha Pengasih', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'الرَّحِيمِ', arabicNormalized: 'الرحيم', transliteration: 'Ar-Rahiim', translation: 'Maha Penyayang', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 4,
        fullArabic: 'مَالِكِ يَوْمِ الدِّينِ',
        translation: 'Pemilik hari pembalasan.',
        audioUrl: getHusaryAyahAudioUrl(1, 4),
        words: [
          { id: 1, arabicOriginal: 'مَالِكِ', arabicNormalized: 'مالك', transliteration: 'Maaliki', translation: 'Pemilik', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'يَوْمِ', arabicNormalized: 'يوم', transliteration: 'Yawmi', translation: 'Hari', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'الدِّينِ', arabicNormalized: 'الدين', transliteration: 'Ad-Diin', translation: 'Pembalasan', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 5,
        fullArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan.',
        audioUrl: getHusaryAyahAudioUrl(1, 5),
        words: [
          { id: 1, arabicOriginal: 'إِيَّاكَ', arabicNormalized: 'إياك', transliteration: 'Iyyaaka', translation: 'Hanya kepada-Mu', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'نَعْبُدُ', arabicNormalized: 'نعبد', transliteration: 'Na\'budu', translation: 'Kami menyembah', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'وَإِيَّاكَ', arabicNormalized: 'وإياك', transliteration: 'Wa-iyyaaka', translation: 'Dan hanya kepada-Mu', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'نَسْتَعِينُ', arabicNormalized: 'نستعين', transliteration: 'Nasta\'iin', translation: 'Kami memohon tolong', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 6,
        fullArabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Tunjukilah kami jalan yang lurus.',
        audioUrl: getHusaryAyahAudioUrl(1, 6),
        words: [
          { id: 1, arabicOriginal: 'اهْدِنَا', arabicNormalized: 'اهدنا', transliteration: 'Ihdinaa', translation: 'Tunjukilah kami', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'الصِّرَاطَ', arabicNormalized: 'الصراط', transliteration: 'Ash-Shiraatha', translation: 'Jalan', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'الْمُسْتَقِيمَ', arabicNormalized: 'المستقيم', transliteration: 'Al-Mustaqiim', translation: 'Yang lurus', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 7,
        fullArabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        translation: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.',
        audioUrl: getHusaryAyahAudioUrl(1, 7),
        words: [
          { id: 1, arabicOriginal: 'صِرَاطَ', arabicNormalized: 'صراط', transliteration: 'Shiraatha', translation: 'Jalan', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'الَّذِينَ', arabicNormalized: 'الذين', transliteration: 'Alladziina', translation: 'Orang-orang yang', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'أَنْعَمْتَ', arabicNormalized: 'أنعمت', transliteration: 'An\'amta', translation: 'Engkau beri nikmat', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'عَلَيْهِمْ', arabicNormalized: 'عليهم', transliteration: '\'Alayhim', translation: 'Atas mereka', isRevealed: false, wasAssisted: false },
          { id: 5, arabicOriginal: 'غَيْرِ', arabicNormalized: 'غير', transliteration: 'Ghayri', translation: 'Bukan', isRevealed: false, wasAssisted: false },
          { id: 6, arabicOriginal: 'الْمَغْضُوبِ', arabicNormalized: 'المغضوب', transliteration: 'Al-Maghdhuubi', translation: 'Yang dimurkai', isRevealed: false, wasAssisted: false },
          { id: 7, arabicOriginal: 'عَلَيْهِمْ', arabicNormalized: 'عليهم', transliteration: '\'Alayhim', translation: 'Atas mereka', isRevealed: false, wasAssisted: false },
          { id: 8, arabicOriginal: 'وَلَا', arabicNormalized: 'ولا', transliteration: 'Wa laa', translation: 'Dan bukan pula', isRevealed: false, wasAssisted: false },
          { id: 9, arabicOriginal: 'الضَّالِّينَ', arabicNormalized: 'الضالين', transliteration: 'Adh-Dhaalliin', translation: 'Mereka yang sesat', isRevealed: false, wasAssisted: false },
        ],
      },
    ],
  },
  {
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    arabicName: 'الإِخْلَاص',
    totalAyahs: 4,
    ayahs: [
      {
        ayahNumber: 1,
        fullArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
        audioUrl: getHusaryAyahAudioUrl(112, 1),
        words: [
          { id: 1, arabicOriginal: 'قُلْ', arabicNormalized: 'قل', transliteration: 'Qul', translation: 'Katakanlah', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'هُوَ', arabicNormalized: 'هو', transliteration: 'Huwa', translation: 'Dia', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'اللَّهُ', arabicNormalized: 'الله', transliteration: 'Allaahu', translation: 'Allah', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'أَحَدٌ', arabicNormalized: 'أحد', transliteration: 'Ahad', translation: 'Maha Esa', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 2,
        fullArabic: 'اللَّهُ الصَّمَدُ',
        translation: 'Allah tempat meminta segala sesuatu.',
        audioUrl: getHusaryAyahAudioUrl(112, 2),
        words: [
          { id: 1, arabicOriginal: 'اللَّهُ', arabicNormalized: 'الله', transliteration: 'Allaahu', translation: 'Allah', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'الصَّمَدُ', arabicNormalized: 'الصمد', transliteration: 'Ash-Shamad', translation: 'Tempat bergantung', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 3,
        fullArabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        translation: '(Allah) tidak beranak dan tidak pula diperanakkan,',
        audioUrl: getHusaryAyahAudioUrl(112, 3),
        words: [
          { id: 1, arabicOriginal: 'لَمْ', arabicNormalized: 'لم', transliteration: 'Lam', translation: 'Tidak', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'يَلِدْ', arabicNormalized: 'يلد', transliteration: 'Yalid', translation: 'Beranak', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'وَلَمْ', arabicNormalized: 'ولم', transliteration: 'Wa lam', translation: 'Dan tidak', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'يُولَدْ', arabicNormalized: 'يولد', transliteration: 'Yuulad', translation: 'Diperanakkan', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 4,
        fullArabic: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
        translation: 'Dan tidak ada sesuatu yang setara dengan Dia.',
        audioUrl: getHusaryAyahAudioUrl(112, 4),
        words: [
          { id: 1, arabicOriginal: 'وَلَمْ', arabicNormalized: 'ولم', transliteration: 'Wa lam', translation: 'Dan tidak', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'يَكُنْ', arabicNormalized: 'يكن', transliteration: 'Yakun', translation: 'Ada', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'لَهُ', arabicNormalized: 'له', transliteration: 'Lahuu', translation: 'Bagi-Nya', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'كُفُوًا', arabicNormalized: 'كفوا', transliteration: 'Kufuwan', translation: 'Setara', isRevealed: false, wasAssisted: false },
          { id: 5, arabicOriginal: 'أَحَدٌ', arabicNormalized: 'أحد', transliteration: 'Ahad', translation: 'Satupun', isRevealed: false, wasAssisted: false },
        ],
      },
    ],
  },
  {
    surahNumber: 114,
    surahName: 'An-Nas',
    arabicName: 'النَّاس',
    totalAyahs: 6,
    ayahs: [
      {
        ayahNumber: 1,
        fullArabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        translation: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia."',
        audioUrl: getHusaryAyahAudioUrl(114, 1),
        words: [
          { id: 1, arabicOriginal: 'قُلْ', arabicNormalized: 'قل', transliteration: 'Qul', translation: 'Katakanlah', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'أَعُوذُ', arabicNormalized: 'أعوذ', transliteration: 'A\'uudzu', translation: 'Aku berlindung', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'بِرَبِّ', arabicNormalized: 'برب', transliteration: 'Birabbi', translation: 'Kepada Tuhan', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'النَّاسِ', arabicNormalized: 'الناس', transliteration: 'An-Naas', translation: 'Manusia', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 2,
        fullArabic: 'مَلِكِ النَّاسِ',
        translation: 'Raja manusia.',
        audioUrl: getHusaryAyahAudioUrl(114, 2),
        words: [
          { id: 1, arabicOriginal: 'مَلِكِ', arabicNormalized: 'ملك', transliteration: 'Maliki', translation: 'Raja', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'النَّاسِ', arabicNormalized: 'الناس', transliteration: 'An-Naas', translation: 'Manusia', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 3,
        fullArabic: 'إِلَٰهِ النَّاسِ',
        translation: 'Sembahan manusia,',
        audioUrl: getHusaryAyahAudioUrl(114, 3),
        words: [
          { id: 1, arabicOriginal: 'إِلَٰهِ', arabicNormalized: 'إله', transliteration: 'Ilaahi', translation: 'Sembahan', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'النَّاسِ', arabicNormalized: 'الناس', transliteration: 'An-Naas', translation: 'Manusia', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 4,
        fullArabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        translation: 'Dari kejahatan (bisikan) setan yang bersembunyi,',
        audioUrl: getHusaryAyahAudioUrl(114, 4),
        words: [
          { id: 1, arabicOriginal: 'مِنْ', arabicNormalized: 'من', transliteration: 'Min', translation: 'Dari', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'شَرِّ', arabicNormalized: 'شر', transliteration: 'Syarri', translation: 'Kejahatan', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'الْوَسْوَاسِ', arabicNormalized: 'الوسواس', transliteration: 'Al-Waswaas', translation: 'Pembisik', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'الْخَنَّاسِ', arabicNormalized: 'الخناس', transliteration: 'Al-Khannaas', translation: 'Yang bersembunyi', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 5,
        fullArabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        translation: 'Yang membisikkan (kejahatan) ke dalam dada manusia,',
        audioUrl: getHusaryAyahAudioUrl(114, 5),
        words: [
          { id: 1, arabicOriginal: 'الَّذِي', arabicNormalized: 'الذي', transliteration: 'Alladzii', translation: 'Yang', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'يُوَسْوِسُ', arabicNormalized: 'يوسوس', transliteration: 'Yuwaswisu', translation: 'Membisikkan', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'فِي', arabicNormalized: 'في', transliteration: 'Fii', translation: 'Ke dalam', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'صُدُورِ', arabicNormalized: 'صدور', transliteration: 'Shuduuri', translation: 'Dada', isRevealed: false, wasAssisted: false },
          { id: 5, arabicOriginal: 'النَّاسِ', arabicNormalized: 'الناس', transliteration: 'An-Naas', translation: 'Manusia', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 6,
        fullArabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        translation: 'Dari (golongan) jin dan manusia.',
        audioUrl: getHusaryAyahAudioUrl(114, 6),
        words: [
          { id: 1, arabicOriginal: 'مِنَ', arabicNormalized: 'من', transliteration: 'Mina', translation: 'Dari', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'الْجِنَّةِ', arabicNormalized: 'الجنة', transliteration: 'Al-Jinnati', translation: 'Golongan jin', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'وَالنَّاسِ', arabicNormalized: 'والناس', transliteration: 'Wan-Naas', translation: 'Dan manusia', isRevealed: false, wasAssisted: false },
        ],
      },
    ],
  },
  {
    surahNumber: 108,
    surahName: 'Al-Kautsar',
    arabicName: 'الكَوْثَر',
    totalAyahs: 3,
    ayahs: [
      {
        ayahNumber: 1,
        fullArabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        translation: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
        audioUrl: getHusaryAyahAudioUrl(108, 1),
        words: [
          { id: 1, arabicOriginal: 'إِنَّا', arabicNormalized: 'إنا', transliteration: 'Innaa', translation: 'Sungguh Kami', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'أَعْطَيْنَاكَ', arabicNormalized: 'أعطيناك', transliteration: 'A\'thaynaaka', translation: 'Telah memberi kepadamu', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'الْكَوْثَرَ', arabicNormalized: 'الكوثر', transliteration: 'Al-Kautsar', translation: 'Nikmat yang banyak', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 2,
        fullArabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
        translation: 'Maka laksanakanlah sholat karena Tuhanmu, dan berkurbanlah.',
        audioUrl: getHusaryAyahAudioUrl(108, 2),
        words: [
          { id: 1, arabicOriginal: 'فَصَلِّ', arabicNormalized: 'فصل', transliteration: 'Fashalli', translation: 'Maka sholatlah', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'لِرَبِّكَ', arabicNormalized: 'لربك', transliteration: 'Lirabbika', translation: 'Karena Tuhanmu', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'وَانْحَرْ', arabicNormalized: 'وانحر', transliteration: 'Wanhar', translation: 'Dan berkurbanlah', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 3,
        fullArabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
        translation: 'Sungguh, orang-orang yang membencimu dialah yang terputus (dari rahmat Allah).',
        audioUrl: getHusaryAyahAudioUrl(108, 3),
        words: [
          { id: 1, arabicOriginal: 'إِنَّ', arabicNormalized: 'إن', transliteration: 'Inna', translation: 'Sungguh', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'شَانِئَكَ', arabicNormalized: 'شانئك', transliteration: 'Syaani\'aka', translation: 'Orang yang membencimu', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'هُوَ', arabicNormalized: 'هو', transliteration: 'Huwa', translation: 'Dialah', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'الْأَبْتَرُ', arabicNormalized: 'الأبتر', transliteration: 'Al-Abtar', translation: 'Yang terputus', isRevealed: false, wasAssisted: false },
        ],
      },
    ],
  },
  {
    surahNumber: 113,
    surahName: 'Al-Falaq',
    arabicName: 'الفَلَق',
    totalAyahs: 5,
    ayahs: [
      {
        ayahNumber: 1,
        fullArabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        translation: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar),',
        audioUrl: getHusaryAyahAudioUrl(113, 1),
        words: [
          { id: 1, arabicOriginal: 'قُلْ', arabicNormalized: 'قل', transliteration: 'Qul', translation: 'Katakanlah', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'أَعُوذُ', arabicNormalized: 'أعوذ', transliteration: 'A\'uudzu', translation: 'Aku berlindung', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'بِرَبِّ', arabicNormalized: 'برب', transliteration: 'Birabbi', translation: 'Kepada Tuhan', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'الْفَلَقِ', arabicNormalized: 'الفلق', transliteration: 'Al-Falaq', translation: 'Subuh / fajar', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 2,
        fullArabic: 'مِنْ شَرِّ مَا خَلَقَ',
        translation: 'dari kejahatan (makhluk yang) Dia ciptakan,',
        audioUrl: getHusaryAyahAudioUrl(113, 2),
        words: [
          { id: 1, arabicOriginal: 'مِنْ', arabicNormalized: 'من', transliteration: 'Min', translation: 'Dari', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'شَرِّ', arabicNormalized: 'شر', transliteration: 'Syarri', translation: 'Kejahatan', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'مَا', arabicNormalized: 'ما', transliteration: 'Maa', translation: 'Apa yang', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'خَلَقَ', arabicNormalized: 'خلق', transliteration: 'Khalaq', translation: 'Dia ciptakan', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 3,
        fullArabic: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        translation: 'dan dari kejahatan malam apabila telah gelap gulita,',
        audioUrl: getHusaryAyahAudioUrl(113, 3),
        words: [
          { id: 1, arabicOriginal: 'وَمِنْ', arabicNormalized: 'ومن', transliteration: 'Wa min', translation: 'Dan dari', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'شَرِّ', arabicNormalized: 'شر', transliteration: 'Syarri', translation: 'Kejahatan', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'غَاسِقٍ', arabicNormalized: 'غاسق', transliteration: 'Ghaasiqin', translation: 'Malam yang gelap', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'إِذَا', arabicNormalized: 'إذا', transliteration: 'Idzaa', translation: 'Apabila', isRevealed: false, wasAssisted: false },
          { id: 5, arabicOriginal: 'وَقَبَ', arabicNormalized: 'وقب', transliteration: 'Waqab', translation: 'Telah gelap', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 4,
        fullArabic: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        translation: 'dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),',
        audioUrl: getHusaryAyahAudioUrl(113, 4),
        words: [
          { id: 1, arabicOriginal: 'وَمِنْ', arabicNormalized: 'ومن', transliteration: 'Wa min', translation: 'Dan dari', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'شَرِّ', arabicNormalized: 'شر', transliteration: 'Syarri', translation: 'Kejahatan', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'النَّفَّاثَاتِ', arabicNormalized: 'النفاثات', transliteration: 'An-Naffaatsaati', translation: 'Peniup-peniup', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'فِي', arabicNormalized: 'في', transliteration: 'Fii', translation: 'Pada', isRevealed: false, wasAssisted: false },
          { id: 5, arabicOriginal: 'الْعُقَدِ', arabicNormalized: 'العقد', transliteration: 'Al-\'Uqad', translation: 'Buhul-buhul tali', isRevealed: false, wasAssisted: false },
        ],
      },
      {
        ayahNumber: 5,
        fullArabic: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        translation: 'dan dari kejahatan orang yang dengki apabila dia dengki."',
        audioUrl: getHusaryAyahAudioUrl(113, 5),
        words: [
          { id: 1, arabicOriginal: 'وَمِنْ', arabicNormalized: 'ومن', transliteration: 'Wa min', translation: 'Dan dari', isRevealed: false, wasAssisted: false },
          { id: 2, arabicOriginal: 'شَرِّ', arabicNormalized: 'شر', transliteration: 'Syarri', translation: 'Kejahatan', isRevealed: false, wasAssisted: false },
          { id: 3, arabicOriginal: 'حَاسِدٍ', arabicNormalized: 'حاسد', transliteration: 'Haasidin', translation: 'Orang yang dengki', isRevealed: false, wasAssisted: false },
          { id: 4, arabicOriginal: 'إِذَا', arabicNormalized: 'إذا', transliteration: 'Idzaa', translation: 'Apabila', isRevealed: false, wasAssisted: false },
          { id: 5, arabicOriginal: 'حَسَدَ', arabicNormalized: 'حسد', transliteration: 'Hasad', translation: 'Dia mendengki', isRevealed: false, wasAssisted: false },
        ],
      },
    ],
  },
];
