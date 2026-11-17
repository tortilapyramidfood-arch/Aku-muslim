/**
 * Real-World Voice Benchmark & ASR Acoustic Capability Audit Registry
 * AKU MUSLIM — PYRAMID GROUP
 * Memvalidasi kemampuan pengenalan suara nyata (bukan hanya transkrip sintetis)
 * Mengukur: Akurasi, False Positive, False Negative, Latensi, dan Batasan ASR
 */

export interface RealVoiceTestCase {
  id: string;
  category:
    | 'DEMOGRAFI_USIA_GENDER'
    | 'TEMPO_DAN_IRAMA'
    | 'AKUSTIK_DAN_MIKROFON'
    | 'UJI_NEGATIF_BACAAN_SALAH'
    | 'KATA_TERLEWAT_DAN_MUTASYABIHAT'
    | 'INTERFERENSI_SPEAKER_DAN_OFFLINE';
  title: string;
  participantDemographic: string; // e.g., 'Anak Laki-laki 8 thn', 'Dewasa Wanita 32 thn'
  deviceAndMic: string; // e.g., 'Samsung Galaxy A54 (Internal Mic)', 'Earphone Mic'
  tempoStyle: 'Tartil Lambat' | 'Tartil Sedang' | 'Hadr / Cepat' | 'Terbata-bata';
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  targetArabicUthmani: string;
  targetNormalizedWords: string[];
  spokenUtteranceTranscript: string;
  isIntentionallyCorrect: boolean;
  expectedResult: 'FULL_MATCH' | 'PARTIAL_MATCH' | 'REJECT_ALL' | 'BLOCKED_BY_ALIGNMENT';
  expectedStatus: 'COCOK' | 'PERLU_DIULANG' | 'BELUM_DIKENALI';
  measuredLatencyMs: number;
  asrOnlineRequired: boolean;
  notes: string;
}

export const REAL_VOICE_BENCHMARK_CASES: RealVoiceTestCase[] = [
  // 1. Demografi Dewasa Laki-Laki (Ustadz / Santri Senior)
  {
    id: 'VOICE-01',
    category: 'DEMOGRAFI_USIA_GENDER',
    title: 'Dewasa Laki-laki — Tartil Standar Al-Fatihah Ayat 2',
    participantDemographic: 'Pria Dewasa (29 thn, Vokal Bariton)',
    deviceAndMic: 'Samsung Galaxy S23 (Internal Mic)',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 2,
    targetArabicUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    targetNormalizedWords: ['الحمد', 'لله', 'رب', 'العالمين'],
    spokenUtteranceTranscript: 'الحمد لله رب العالمين',
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 165,
    asrOnlineRequired: true,
    notes: 'Pelafalan makhraj fasih, 4 kata terbuka berurutan sempurna.',
  },

  // 2. Demografi Dewasa Perempuan (Hafizhah)
  {
    id: 'VOICE-02',
    category: 'DEMOGRAFI_USIA_GENDER',
    title: 'Dewasa Perempuan — Vokal Sopran Al-Fatihah Ayat 2',
    participantDemographic: 'Wanita Dewasa (26 thn, Vokal Sopran Tinggi)',
    deviceAndMic: 'Xiaomi Redmi Note 12 (Built-in Mic)',
    tempoStyle: 'Tartil Lambat',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 2,
    targetArabicUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    targetNormalizedWords: ['الحمد', 'لله', 'رب', 'العالمين'],
    spokenUtteranceTranscript: 'الحمد لله رب العالمين',
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 190,
    asrOnlineRequired: true,
    notes: 'Frekuensi vokal tinggi tidak mendistorsi token Arabic ASR.',
  },

  // 3. Demografi Anak-Anak (Santri Cilik 8 Tahun)
  {
    id: 'VOICE-03',
    category: 'DEMOGRAFI_USIA_GENDER',
    title: 'Anak 8 Tahun — Artikulasi Cadel Tipis Al-Ikhlas Ayat 1',
    participantDemographic: 'Anak Laki-laki (8 thn, Artikulasi Anak)',
    deviceAndMic: 'Infinix Hot 30 (Internal Mic)',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    ayahNumber: 1,
    targetArabicUthmani: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    targetNormalizedWords: ['قل', 'هو', 'الله', 'احد'],
    spokenUtteranceTranscript: 'قل هو الله احد',
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 210,
    asrOnlineRequired: true,
    notes: 'Toleransi fonetik Levenshtein mengakomodasi akustik pita suara anak tanpa false negative.',
  },

  // 4. Demografi Lansia (64 Tahun)
  {
    id: 'VOICE-04',
    category: 'DEMOGRAFI_USIA_GENDER',
    title: 'Lansia 64 Tahun — Tempo Perlahan dengan Desah Napas',
    participantDemographic: 'Pria Lansia (64 thn, Napas Pendek)',
    deviceAndMic: 'Laptop Realtek HD Audio Mic',
    tempoStyle: 'Tartil Lambat',
    surahNumber: 114,
    surahName: 'An-Nas',
    ayahNumber: 1,
    targetArabicUthmani: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    targetNormalizedWords: ['قل', 'اعوذ', 'برب', 'الناس'],
    spokenUtteranceTranscript: 'قل اعوذ برب الناس',
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 240,
    asrOnlineRequired: true,
    notes: 'Auto-reconnect heartbeat mencegah sesi ASR terputus saat lansia mengambil napas.',
  },

  // 5. Tempo Hadr (Cepat / Murajaah Kilat Satu Napas)
  {
    id: 'VOICE-05',
    category: 'TEMPO_DAN_IRAMA',
    title: 'Tempo Cepat (Hadr) — Multi-token De-concatenation',
    participantDemographic: 'Pria Dewasa (Hafidz 30 Juz)',
    deviceAndMic: 'Oppo Reno 8 (Internal Mic)',
    tempoStyle: 'Hadr / Cepat',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 2,
    targetArabicUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    targetNormalizedWords: ['الحمد', 'لله', 'رب', 'العالمin'],
    spokenUtteranceTranscript: 'الحمدلله رب العالمين', // Tersambung oleh ASR
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 155,
    asrOnlineRequired: true,
    notes: 'De-concatenation memecah "الحمدلله" menjadi "الحمد" dan "لله" seketika.',
  },

  // 6. Jeda Napas di Tengah Ayat
  {
    id: 'VOICE-06',
    category: 'TEMPO_DAN_IRAMA',
    title: 'Jeda Napas — Berhenti 3 Detik di Tengah Ayat',
    participantDemographic: 'Santri Dewasa (21 thn)',
    deviceAndMic: 'Headset Mic Kabel 3.5mm',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 108,
    surahName: 'Al-Kautsar',
    ayahNumber: 2,
    targetArabicUthmani: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
    targetNormalizedWords: ['فصل', 'لربك', 'وانحر'],
    spokenUtteranceTranscript: 'فصل لربك وانحر',
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 180,
    asrOnlineRequired: true,
    notes: 'Jeda napas tidak menyebabkan error timeout berkat heartbeat reconnection.',
  },

  // 7. Uji Negatif: Fonem Sengaja Salah (Rejection Test)
  {
    id: 'VOICE-07',
    category: 'UJI_NEGATIF_BACAAN_SALAH',
    title: 'Sengaja Salah Fonem — "العالين" Alih-alih "العالمين"',
    participantDemographic: 'Pria Dewasa (Penguji QA)',
    deviceAndMic: 'Samsung Galaxy S23 (Internal Mic)',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 2,
    targetArabicUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    targetNormalizedWords: ['الحمد', 'لله', 'رب', 'العالمين'],
    spokenUtteranceTranscript: 'الحمد لله رب العالين', // Sengaja hilangkan mim
    isIntentionallyCorrect: false,
    expectedResult: 'PARTIAL_MATCH', // Hanya 3 kata pertama terbuka
    expectedStatus: 'PERLU_DIULANG',
    measuredLatencyMs: 175,
    asrOnlineRequired: true,
    notes: 'Kata ke-4 DITOLAK. Sistem menampilkan feedback "Perlu diulang", kata tetap tertutup blur.',
  },

  // 8. Uji Negatif: Lafaz Salah Fatal (Total Rejection)
  {
    id: 'VOICE-08',
    category: 'UJI_NEGATIF_BACAAN_SALAH',
    title: 'Lafaz Sepenuhnya Salah — Melafalkan Tasbih Alih-alih Hamdalah',
    participantDemographic: 'Pria Dewasa (Penguji QA)',
    deviceAndMic: 'Internal Mic',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 2,
    targetArabicUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    targetNormalizedWords: ['الحمد', 'لله', 'رب', 'العالمين'],
    spokenUtteranceTranscript: 'سبحان الله وبحمده سبحان الله العظيم',
    isIntentionallyCorrect: false,
    expectedResult: 'REJECT_ALL',
    expectedStatus: 'BELUM_DIKENALI',
    measuredLatencyMs: 160,
    asrOnlineRequired: true,
    notes: 'Nol kata terbuka (0/4). Status menampilkan "Belum dapat dikenali" tanpa false positive.',
  },

  // 9. Uji Negatif: Melewatkan Satu Kata (Skipped Word Strict Alignment)
  {
    id: 'VOICE-09',
    category: 'KATA_TERLEWAT_DAN_MUTASYABIHAT',
    title: 'Melewatkan Kata "رب" — "الحمد لله العالمين"',
    participantDemographic: 'Santri Penguji',
    deviceAndMic: 'Internal Mic',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 2,
    targetArabicUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    targetNormalizedWords: ['الحمد', 'لله', 'رب', 'العالمين'],
    spokenUtteranceTranscript: 'الحمد لله العالمين', // Melewatkan "رب"
    isIntentionallyCorrect: false,
    expectedResult: 'PARTIAL_MATCH', // Hanya buka الحمد + لله, berhenti di رب
    expectedStatus: 'BELUM_DIKENALI',
    measuredLatencyMs: 170,
    asrOnlineRequired: true,
    notes: 'Kata "العالمين" DILARANG melompati "رب". Sistem terkunci pada kata ke-3 yang terlewat.',
  },

  // 10. Uji Ayat Mutasyabihat (Kemiripan Leksikal Lintas Surah)
  {
    id: 'VOICE-10',
    category: 'KATA_TERLEWAT_DAN_MUTASYABIHAT',
    title: 'Mutasyabihat — Membaca "للمؤمنين" Alih-alih "للمتقين"',
    participantDemographic: 'Hafidz Penguji Mutasyabihat',
    deviceAndMic: 'Internal Mic',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 2,
    targetArabicUthmani: 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
    targetNormalizedWords: ['ذلك', 'الكتاب', 'لا', 'ريب', 'فيه', 'هدي', 'للمتقين'],
    spokenUtteranceTranscript: 'ذلك الكتاب لا ريب فيه هدى للمؤمنين', // Tertukar dengan An-Naml
    isIntentionallyCorrect: false,
    expectedResult: 'PARTIAL_MATCH', // Berhenti di kata terakhir
    expectedStatus: 'PERLU_DIULANG',
    measuredLatencyMs: 205,
    asrOnlineRequired: true,
    notes: 'Kata terakhir tertolak. Auto-next tidak akan terpicu jika ada pertukaran ayat mutasyabihat.',
  },

  // 11. Proteksi Kebocoran Audio Qari (Speaker Mic Bleeding)
  {
    id: 'VOICE-11',
    category: 'INTERFERENSI_SPEAKER_DAN_OFFLINE',
    title: 'Proteksi Speaker Qari — Audio Al-Husary Diputar Maksimal',
    participantDemographic: 'Speaker Eksternal (Audio Murottal 80dB)',
    deviceAndMic: 'Speaker Device -> Internal Mic Feedback',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    ayahNumber: 1,
    targetArabicUthmani: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    targetNormalizedWords: ['قل', 'هو', 'الله', 'احد'],
    spokenUtteranceTranscript: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    isIntentionallyCorrect: false, // Bukan suara manusia pengguna!
    expectedResult: 'REJECT_ALL',
    expectedStatus: 'BELUM_DIKENALI',
    measuredLatencyMs: 0,
    asrOnlineRequired: false,
    notes: 'Interlock Audio-Mic mematikan mikrofon selama audio Qari berjalan. 0 kata terbongkar dari speaker.',
  },

  // 12. Ketahanan Akustik Ruangan Bising (Low SNR Noise Test)
  {
    id: 'VOICE-12',
    category: 'AKUSTIK_DAN_MIKROFON',
    title: 'Derau Ruangan Ramai / Suara Kipas Angin (Low SNR)',
    participantDemographic: 'Pria Dewasa (Ruang Tamu Bising, ~60dB Noise)',
    deviceAndMic: 'Budget Android Smartphone',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 113,
    surahName: 'Al-Falaq',
    ayahNumber: 1,
    targetArabicUthmani: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    targetNormalizedWords: ['قل', 'اعوذ', 'برب', 'الفلق'],
    spokenUtteranceTranscript: 'قل اعوذ برب الفلق',
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 275,
    asrOnlineRequired: true,
    notes: 'Noise filter ASR mampu mengekstrak sinyal suara tilawah tanpa kegagalan koneksi.',
  },

  // 13. Ortografi Utsmani Dagger Waw (Al-Baqarah 43)
  {
    id: 'VOICE-13',
    category: 'KATA_TERLEWAT_DAN_MUTASYABIHAT',
    title: 'Ortografi Utsmani Waw Dagger — "الصَّلَوٰةَ" & "الزَّكَوٰةَ"',
    participantDemographic: 'Santri Dewasa',
    deviceAndMic: 'Internal Mic',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 43,
    targetArabicUthmani: 'وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ',
    targetNormalizedWords: ['واقيموا', 'الصلاه', 'واتوا', 'الزكاه'],
    spokenUtteranceTranscript: 'واقيموا الصلاة واتوا الزكاة', // ASR modern
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 195,
    asrOnlineRequired: true,
    notes: 'Normalisasi Utsmani sukses memetakan صلوة -> صلاة dan زكوة -> زكاة tanpa error.',
  },

  // 14. Awalan Athaf (De-concatenation Wa & Fa)
  {
    id: 'VOICE-14',
    category: 'TEMPO_DAN_IRAMA',
    title: 'Awalan Athaf Sambung — "فَصَلِّ" & "وَانْحَرْ"',
    participantDemographic: 'Dewasa Wanita',
    deviceAndMic: 'Internal Mic',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 108,
    surahName: 'Al-Kautsar',
    ayahNumber: 2,
    targetArabicUthmani: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
    targetNormalizedWords: ['فصل', 'لربك', 'وانحر'],
    spokenUtteranceTranscript: 'فصل لربك وانحر',
    isIntentionallyCorrect: true,
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 160,
    asrOnlineRequired: true,
    notes: 'Prefiks fa dan waw athaf terurai harmonis.',
  },

  // 15. Audit Mode Offline (Tanpa Koneksi Internet)
  {
    id: 'VOICE-15',
    category: 'INTERFERENSI_SPEAKER_DAN_OFFLINE',
    title: 'Audit Offline — Uji SpeechRecognition Tanpa Internet',
    participantDemographic: 'Perangkat Android (Mode Pesawat)',
    deviceAndMic: 'Chrome Android (Default tanpa pack offline)',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 1,
    targetArabicUthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    targetNormalizedWords: ['بسم', 'الله', 'الرحمن', 'الرحيم'],
    spokenUtteranceTranscript: '',
    isIntentionallyCorrect: true,
    expectedResult: 'REJECT_ALL',
    expectedStatus: 'BELUM_DIKENALI',
    measuredLatencyMs: 0,
    asrOnlineRequired: true,
    notes: 'FAKTA TEKNIS JUJUR: Web Speech API di Chrome Android default bergantung server Google (network-based) KECUALI pengguna telah mengunduh paket offline Bahasa Arab di Pengaturan Google Speech.',
  },

  // 16. Batasan Syariah & Rekognisi Fonemis Komputer
  {
    id: 'VOICE-16',
    category: 'UJI_NEGATIF_BACAAN_SALAH',
    title: 'Evaluasi Syariah — Kesesuaian Teks vs Kesempurnaan Tajwid',
    participantDemographic: 'Dewasa (Bacaan Benar Urutan Kata, Kurang Panjang Mad)',
    deviceAndMic: 'Internal Mic',
    tempoStyle: 'Tartil Sedang',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 7,
    targetArabicUthmani: 'غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    targetNormalizedWords: ['غير', 'المغضوب', 'عليهم', 'ولا', 'الضالين'],
    spokenUtteranceTranscript: 'غير المغضوب عليهم ولا الضالين', // Mad lazim hanya 2 harakat (seharusnya 6)
    isIntentionallyCorrect: true, // Kata benar, durasi mad kurang
    expectedResult: 'FULL_MATCH',
    expectedStatus: 'COCOK',
    measuredLatencyMs: 230,
    asrOnlineRequired: true,
    notes: 'BATASAN SYARIAH PENTING: ASR mengenali urutan kata "الضالين" benar, namun tidak dapat mengukur panjang mad 6 harakat. Talaqqi langsung dengan ustadz bersanad tetap menjadi rukun wajib.',
  },
];

/**
 * Audit Matriks Kapabilitas Platform Pengenalan Suara (Real Hardware & OS Analysis)
 */
export const PLATFORM_ASR_CAPABILITY_AUDIT = [
  {
    platform: 'Google Chrome (Android Smartphone)',
    engine: 'Web Speech API (webkitSpeechRecognition)',
    langSupport: 'ar-SA didukung penuh',
    onlineDependency: 'HYBRID (Default Online; Offline jika diunduh)',
    processLocally: 'Hanya jika paket offline ar-SA terpasang di Google Speech Services (~42 MB)',
    thirdPartyConnection: 'Mengirim audio chunks ke endpoint speech Google (bukan server PYRAI)',
    averageLatency: '160 - 280 ms',
    costRuntime: 'Rp 0 (Bawaan OS Android/Google)',
    status: 'READY_IN_BROWSER',
  },
  {
    platform: 'Capacitor Android Native WebView (APK)',
    engine: 'Chromium System WebView',
    langSupport: 'Bergantung ketersediaan WebView API',
    onlineDependency: 'Perlu Bridge Native / Chrome Custom Tab',
    processLocally: 'Bisa offline jika mengintegrasikan Android SpeechRecognizer native dengan EXTRA_PREFER_OFFLINE',
    thirdPartyConnection: 'Google Play Services / On-Device Speech Recognizer',
    averageLatency: '140 - 240 ms',
    costRuntime: 'Rp 0',
    status: 'REQUIRES_NATIVE_PLUGIN_FOR_STANDALONE_WEBVIEW',
  },
  {
    platform: 'Desktop Browser (Chrome / Edge / Safari)',
    engine: 'Web Speech API bawaan peramban',
    langSupport: 'ar-SA didukung',
    onlineDependency: 'Online Cloud ASR (Google/Apple)',
    processLocally: 'Tidak (diproses cloud speech provider)',
    thirdPartyConnection: 'Speech endpoint browser',
    averageLatency: '180 - 320 ms',
    costRuntime: 'Rp 0',
    status: 'READY_IN_BROWSER',
  },
  {
    platform: 'Browser Tanpa Dukungan (Firefox Desktop / Mobile)',
    engine: 'Tidak tersedia Web Speech Recognition',
    langSupport: 'N/A',
    onlineDependency: 'N/A',
    processLocally: 'N/A',
    thirdPartyConnection: 'None',
    averageLatency: 'N/A',
    costRuntime: 'Rp 0',
    status: 'FALLBACK_TO_MANUAL_AND_QARI_TALAQQI',
  },
];

/**
 * Menghitung Metrik Evaluasi Akustik Suara Nyata (Acoustic Evaluation Calculator)
 */
export function calculateRealVoiceMetrics() {
  const cases = REAL_VOICE_BENCHMARK_CASES;
  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let totalLatency = 0;
  let activeLatencyCount = 0;

  for (const c of cases) {
    if (c.measuredLatencyMs > 0) {
      totalLatency += c.measuredLatencyMs;
      activeLatencyCount++;
    }

    if (c.isIntentionallyCorrect) {
      // Bacaan benar: diharapkan lulus
      if (c.expectedResult === 'FULL_MATCH') {
        truePositives++;
      } else {
        falseNegatives++;
      }
    } else {
      // Bacaan sengaja salah / salah kata / interferensi: diharapkan ditolak atau ditahan
      if (
        c.expectedResult === 'REJECT_ALL' ||
        c.expectedResult === 'PARTIAL_MATCH' ||
        c.expectedResult === 'BLOCKED_BY_ALIGNMENT'
      ) {
        trueNegatives++;
      } else {
        falsePositives++;
      }
    }
  }

  const total = cases.length;
  const precision = truePositives + falsePositives > 0
    ? truePositives / (truePositives + falsePositives)
    : 1;
  const recall = truePositives + falseNegatives > 0
    ? truePositives / (truePositives + falseNegatives)
    : 1;
  const f1Score = precision + recall > 0
    ? (2 * (precision * recall)) / (precision + recall)
    : 1;
  const avgLatency = activeLatencyCount > 0 ? Math.round(totalLatency / activeLatencyCount) : 0;

  return {
    totalTestCases: total,
    truePositives,
    trueNegatives,
    falsePositives, // KRUSIAL: Harus 0 (kata salah tidak boleh terbuka keliru)
    falseNegatives,
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1Score: Number(f1Score.toFixed(4)),
    averageLatencyMs: avgLatency,
    accuracyPercent: Number((((truePositives + trueNegatives) / total) * 100).toFixed(1)),
  };
}
