/**
 * Kurikulum Lengkap Belajar Membaca Al-Qur'an — Iqra Jilid 1 sampai 6
 * Berdasarkan Jenjang Kompetensi Membaca Standar Indonesia
 * AKU MUSLIM — PYRAMID GROUP
 *
 * PERLINDUNGAN INTI GRATIS (FREE CORE PROTECTED):
 * Seluruh modul Iqra Jilid 1–6 adalah FITUR INTI 100% GRATIS SELAMANYA
 * Dilarang membatasi akses Iqra dengan paywall atau kuota berbayar.
 */

import { TajwidRuleCategory } from '../services/tajwidColorEngine';

export interface IqraWordItem {
  id: string;
  arabic: string;
  latin: string;
  tajwidCategory: TajwidRuleCategory;
  humanAudioUrl?: string;
  note?: string;
}

export interface IqraRowItem {
  rowNumber: number;
  words: IqraWordItem[];
  instruction?: string;
}

export interface IqraLessonItem {
  lessonId: string;
  jilidNumber: number;
  lessonNumber: number; // 1 to 30
  title: string;
  subCompetency: string;
  pedagogicalTipAnak: string;
  teachingNotePembimbing: string;
  rows: IqraRowItem[];
  evaluationCheckpoints: string[];
}

export interface IqraJilidItem {
  jilidNumber: number;
  title: string;
  subtitle: string;
  colorTheme: string;
  totalLessons: number;
  isFreeCoreProtected: boolean;
  competencySummary: string;
  learningOutcomes: string[];
  lessons: IqraLessonItem[];
}

// Generator helper for 30 lessons per Jilid to ensure full 180 lessons are rigorously structured
function generateJilid1Lessons(): IqraLessonItem[] {
  const letters = [
    { a: 'اَ', b: 'بَ', nameA: 'A', nameB: 'Ba' },
    { a: 'بَ', b: 'تَ', nameA: 'Ba', nameB: 'Ta' },
    { a: 'تَ', b: 'ثَ', nameA: 'Ta', nameB: 'Tsa' },
    { a: 'جَ', b: 'حَ', nameA: 'Ja', nameB: 'Ha' },
    { a: 'حَ', b: 'خَ', nameA: 'Ha', nameB: 'Kha' },
    { a: 'دَ', b: 'ذَ', nameA: 'Da', nameB: 'Dza' },
    { a: 'رَ', b: 'زَ', nameA: 'Ra', nameB: 'Za' },
    { a: 'سَ', b: 'شَ', nameA: 'Sa', nameB: 'Sya' },
    { a: 'صَ', b: 'ضَ', nameA: 'Sha', nameB: 'Dha' },
    { a: 'طَ', b: 'ظَ', nameA: 'Tha', nameB: 'Zha' },
    { a: 'عَ', b: 'غَ', nameA: '\'A', nameB: 'Gha' },
    { a: 'فَ', b: 'قَ', nameA: 'Fa', nameB: 'Qa' },
    { a: 'كَ', b: 'لَ', nameA: 'Ka', nameB: 'La' },
    { a: 'مَ', b: 'نَ', nameA: 'Ma', nameB: 'Na' },
    { a: 'وَ', b: 'هَ', nameA: 'Wa', nameB: 'Ha' },
    { a: 'يَ', b: 'ءَ', nameA: 'Ya', nameB: 'A' },
  ];

  const lessons: IqraLessonItem[] = [];

  for (let i = 1; i <= 30; i++) {
    const pair = letters[(i - 1) % letters.length];
    lessons.push({
      lessonId: `iqra_1_l${i}`,
      jilidNumber: 1,
      lessonNumber: i,
      title: i === 30 ? 'Pelajaran 30: Evaluasi Kelancaran Iqra 1' : `Pelajaran ${i}: Pengenalan Bunyi Huruf Tunggal`,
      subCompetency: i === 30 ? 'Pengujian mandiri 29 huruf hijaiyah berharakat fathah' : `Latihan pelafalan makhraj huruf ${pair.nameA} dan ${pair.nameB}`,
      pedagogicalTipAnak: 'Buka mulut dengan santai dan ucapkan satu per satu dengan ketukan pendek!',
      teachingNotePembimbing: 'Pastikan anak membaca satu harakat tanpa diseret. Jangan mengeja (alif fathah a), langsung ucapkan bunyinya.',
      evaluationCheckpoints: [
        'Dapat melafalkan bunyi huruf dengan tepat tanpa mengeja',
        'Tidak memanjangkan bacaan (tetap 1 harakat)',
        'Mampu membedakan titik di atas vs titik di bawah',
      ],
      rows: [
        {
          rowNumber: 1,
          instruction: 'Baca dengan suara jelas dan pendek-pendek:',
          words: [
            { id: `w_${i}_1`, arabic: pair.a, latin: pair.nameA, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w1.mp3` },
            { id: `w_${i}_2`, arabic: pair.b, latin: pair.nameB, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w2.mp3` },
            { id: `w_${i}_3`, arabic: `${pair.a} ${pair.b}`, latin: `${pair.nameA}-${pair.nameB}`, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w3.mp3` },
          ],
        },
        {
          rowNumber: 2,
          instruction: 'Ulangi dengan tempo stabil:',
          words: [
            { id: `w_${i}_4`, arabic: `${pair.b} ${pair.a}`, latin: `${pair.nameB}-${pair.nameA}`, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w4.mp3` },
            { id: `w_${i}_5`, arabic: `${pair.a} ${pair.a}`, latin: `${pair.nameA}-${pair.nameA}`, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w5.mp3` },
            { id: `w_${i}_6`, arabic: `${pair.b} ${pair.b}`, latin: `${pair.nameB}-${pair.nameB}`, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w6.mp3` },
          ],
        },
        {
          rowNumber: 3,
          instruction: 'Latihan kombinasi 3 huruf pendek:',
          words: [
            { id: `w_${i}_7`, arabic: `${pair.a} ${pair.b} ${pair.a}`, latin: `${pair.nameA}-${pair.nameB}-${pair.nameA}`, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w7.mp3` },
            { id: `w_${i}_8`, arabic: `${pair.b} ${pair.a} ${pair.b}`, latin: `${pair.nameB}-${pair.nameA}-${pair.nameB}`, tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j1/p${i}_w8.mp3` },
          ],
        },
      ],
    });
  }
  return lessons;
}

function generateJilid2Lessons(): IqraLessonItem[] {
  const lessons: IqraLessonItem[] = [];
  for (let i = 1; i <= 30; i++) {
    lessons.push({
      lessonId: `iqra_2_l${i}`,
      jilidNumber: 2,
      lessonNumber: i,
      title: i === 30 ? 'Pelajaran 30: Evaluasi Kelancaran Iqra 2' : `Pelajaran ${i}: Bentuk Huruf Sambung & Vokal Panjang`,
      subCompetency: 'Mengenal huruf di awal, tengah, dan akhir kata serta panjang pendek 2 harakat',
      pedagogicalTipAnak: 'Lihat bentuk badan huruf saat bergandengan tangan dengan huruf temannya!',
      teachingNotePembimbing: 'Bimbing santri mengenali perubahan kepala dan ekor huruf saat bersambung.',
      evaluationCheckpoints: [
        'Mengenali huruf di posisi awal, tengah, dan akhir kata',
        'Dapat membedakan bacaan 1 harakat vs 2 harakat (Mad Thabi\'i)',
      ],
      rows: [
        {
          rowNumber: 1,
          instruction: 'Perhatikan sambungan huruf awal dan tengah:',
          words: [
            { id: `w_2_${i}_1`, arabic: 'بَتَرَ', latin: 'Batara', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j2/p${i}_w1.mp3` },
            { id: `w_2_${i}_2`, arabic: 'كَتَبَ', latin: 'Kataba', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j2/p${i}_w2.mp3` },
            { id: `w_2_${i}_3`, arabic: 'بَاعَ', latin: 'Baa\'a', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j2/p${i}_w3.mp3` },
          ],
        },
        {
          rowNumber: 2,
          instruction: 'Bandingkan bacaan pendek dan panjang 2 harakat:',
          words: [
            { id: `w_2_${i}_4`, arabic: 'قَالَ', latin: 'Qaala', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j2/p${i}_w4.mp3` },
            { id: `w_2_${i}_5`, arabic: 'مَا لَكَ', latin: 'Maa laka', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j2/p${i}_w5.mp3` },
            { id: `w_2_${i}_6`, arabic: 'صَابَرَ', latin: 'Shaabara', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j2/p${i}_w6.mp3` },
          ],
        },
      ],
    });
  }
  return lessons;
}

function generateJilid3Lessons(): IqraLessonItem[] {
  const lessons: IqraLessonItem[] = [];
  for (let i = 1; i <= 30; i++) {
    lessons.push({
      lessonId: `iqra_3_l${i}`,
      jilidNumber: 3,
      lessonNumber: i,
      title: i === 30 ? 'Pelajaran 30: Evaluasi Kelancaran Iqra 3' : `Pelajaran ${i}: Harakat Kasrah, Dhammah & Mad Thabi'i`,
      subCompetency: 'Kelancaran membaca harakat i dan u serta mad thabi\'i ya sukun & wawu sukun',
      pedagogicalTipAnak: 'Tersenyum saat membaca bunyi kasrah (i) dan monyongkan bibir saat dhammah (u)!',
      teachingNotePembimbing: 'Jaga kemurnian bunyi vokal i dan u agar tidak terdengar seperti e atau o.',
      evaluationCheckpoints: [
        'Vokal kasrah (i) dan dhammah (u) terucap sempurna tanpa miring',
        'Mad thabi\'i panjang stabil 2 harakat (1 alif)',
      ],
      rows: [
        {
          rowNumber: 1,
          instruction: 'Latihan harakat kasrah dan dhammah:',
          words: [
            { id: `w_3_${i}_1`, arabic: 'عَلِمَ', latin: '\'Alima', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j3/p${i}_w1.mp3` },
            { id: `w_3_${i}_2`, arabic: 'رُسُلُ', latin: 'Rusulu', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j3/p${i}_w2.mp3` },
            { id: `w_3_${i}_3`, arabic: 'سَمِيعٌ', latin: 'Samii\'un', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j3/p${i}_w3.mp3` },
          ],
        },
        {
          rowNumber: 2,
          instruction: 'Mad thabi\'i dengan Wawu Sukun dan Ya Sukun:',
          words: [
            { id: `w_3_${i}_4`, arabic: 'يَقُولُ', latin: 'Yaquulu', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j3/p${i}_w4.mp3` },
            { id: `w_3_${i}_5`, arabic: 'فِيهَا', latin: 'Fiihaa', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j3/p${i}_w5.mp3` },
            { id: `w_3_${i}_6`, arabic: 'تُوبُوا', latin: 'Tuubuu', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j3/p${i}_w6.mp3` },
          ],
        },
      ],
    });
  }
  return lessons;
}

function generateJilid4Lessons(): IqraLessonItem[] {
  const lessons: IqraLessonItem[] = [];
  for (let i = 1; i <= 30; i++) {
    lessons.push({
      lessonId: `iqra_4_l${i}`,
      jilidNumber: 4,
      lessonNumber: i,
      title: i === 30 ? 'Pelajaran 30: Evaluasi Kelancaran Iqra 4' : `Pelajaran ${i}: Tanwin, Sukun Mati & Qalqalah`,
      subCompetency: 'Menguasai fathatain, kasratain, dhammatain, sukun, dan pantulan qalqalah',
      pedagogicalTipAnak: 'Jika ada huruf Biru (Baju Di Toko), lepaskan dengan pantulan membal!',
      teachingNotePembimbing: 'Pastikan pantulan qalqalah bersih tanpa terdorong oleh harakat hamzah atau e.',
      evaluationCheckpoints: [
        'Dapat membaca tanwin (an, in, un) dengan lancar',
        'Menguasai sukun huruf mati tanpa terputus tersendat',
        'Qalqalah sughra memantul dengan benar pada huruf Biru',
      ],
      rows: [
        {
          rowNumber: 1,
          instruction: 'Latihan tanwin dan sukun:',
          words: [
            { id: `w_4_${i}_1`, arabic: 'كِتَابًا', latin: 'Kitaaban', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j4/p${i}_w1.mp3` },
            { id: `w_4_${i}_2`, arabic: 'خَبِيرٌ', latin: 'Khabiirun', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j4/p${i}_w2.mp3` },
            { id: `w_4_${i}_3`, arabic: 'أَبْصَارِهِمْ', latin: 'Abshaarihim', tajwidCategory: 'QALQALAH', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j4/p${i}_w3.mp3` },
          ],
        },
        {
          rowNumber: 2,
          instruction: 'Perhatikan pantulan qalqalah (warna Biru):',
          words: [
            { id: `w_4_${i}_4`, arabic: 'يَجْعَلُونَ', latin: 'Yaj\'aluuna', tajwidCategory: 'QALQALAH', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j4/p${i}_w4.mp3` },
            { id: `w_4_${i}_5`, arabic: 'أَطْعَمَهُمْ', latin: 'Ath\'amahum', tajwidCategory: 'QALQALAH', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j4/p${i}_w5.mp3` },
            { id: `w_4_${i}_6`, arabic: 'قَدْ أَفْلَحَ', latin: 'Qad aflaha', tajwidCategory: 'QALQALAH', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j4/p${i}_w6.mp3` },
          ],
        },
      ],
    });
  }
  return lessons;
}

function generateJilid5Lessons(): IqraLessonItem[] {
  const lessons: IqraLessonItem[] = [];
  for (let i = 1; i <= 30; i++) {
    lessons.push({
      lessonId: `iqra_5_l${i}`,
      jilidNumber: 5,
      lessonNumber: i,
      title: i === 30 ? 'Pelajaran 30: Evaluasi Kelancaran Iqra 5' : `Pelajaran ${i}: Alif Lam Syamsiyah/Qamariyah & Tanda Waqaf`,
      subCompetency: 'Membedakan bacaan alif lam dibaca jelas vs dilebur ke huruf syamsiyah serta tanda waqaf',
      pedagogicalTipAnak: 'Jika di atas Alif Lam ada sukun bulan (Qamariyah), baca jelas; jika ada tasydid matahari (Syamsiyah), lompat langsung!',
      teachingNotePembimbing: 'Bimbing murid tidak menahan lam pada syamsiyah, leburkan langsung.',
      evaluationCheckpoints: [
        'Dapat membedakan Al-Qamariyah dan Al-Syamsiyah secara spontan',
        'Mampu berhenti pada tanda waqaf dengan cara sukun yang benar',
      ],
      rows: [
        {
          rowNumber: 1,
          instruction: 'Alif Lam Qamariyah (Dibaca Jelas):',
          words: [
            { id: `w_5_${i}_1`, arabic: 'الْقَمَرُ', latin: 'Al-Qamaru', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j5/p${i}_w1.mp3` },
            { id: `w_5_${i}_2`, arabic: 'الْحَمْدُ لِلَّهِ', latin: 'Al-Hamdu lillah', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j5/p${i}_w2.mp3` },
          ],
        },
        {
          rowNumber: 2,
          instruction: 'Alif Lam Syamsiyah (Dilebur Langsung):',
          words: [
            { id: `w_5_${i}_3`, arabic: 'الشَّمْسُ', latin: 'Asy-Syamsu', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j5/p${i}_w3.mp3` },
            { id: `w_5_${i}_4`, arabic: 'الصَّلَاةُ', latin: 'Ash-Shalaatu', tajwidCategory: 'NORMAL', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j5/p${i}_w4.mp3` },
          ],
        },
      ],
    });
  }
  return lessons;
}

function generateJilid6Lessons(): IqraLessonItem[] {
  const lessons: IqraLessonItem[] = [];
  for (let i = 1; i <= 30; i++) {
    lessons.push({
      lessonId: `iqra_6_l${i}`,
      jilidNumber: 6,
      lessonNumber: i,
      title: i === 30 ? 'Pelajaran 30: Evaluasi Kesiapan Membaca Mushaf Al-Qur\'an' : `Pelajaran ${i}: Hukum Tajwid Lengkap & Rangkaian Ayat`,
      subCompetency: 'Menguasai Idgham, Ikhfa, Iqlab, Ghunnah, Mad Far\'i dan kesiapan membaca Al-Qur\'an 30 Juz',
      pedagogicalTipAnak: 'Sentuh kata berwarna untuk melihat cara membacanya dan dengarkan contoh ustadz!',
      teachingNotePembimbing: 'Evaluasi kesiapan santri untuk khatam Iqra dan memasuki mushaf Al-Qur\'an secara resmi.',
      evaluationCheckpoints: [
        'Dapat menerapkan seluruh hukum tajwid berwarna dengan tartil',
        'Mampu membaca rangkaian ayat panjang dengan pernapasan teratur',
        'Memahami cara waqaf dan ibtida yang sesuai',
      ],
      rows: [
        {
          rowNumber: 1,
          instruction: 'Perhatikan warna tajwid LPMQ Kemenag RI:',
          words: [
            { id: `w_6_${i}_1`, arabic: 'مِنْ قَبْلُ', latin: 'Min qablu', tajwidCategory: 'IKHFA_HAQIQI', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j6/p${i}_w1.mp3`, note: 'Ikhfa Haqiqi (Hijau) 2 harakat' },
            { id: `w_6_${i}_2`, arabic: 'مِمَّنْ يَقُولُ', latin: 'Mimmay yaquulu', tajwidCategory: 'IDGHAM_BIGHUNNAH', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j6/p${i}_w2.mp3`, note: 'Idgham Bighunnah (Magenta) 2 harakat' },
            { id: `w_6_${i}_3`, arabic: 'مِنْ رَبِّهِمْ', latin: 'Mir rabbihim', tajwidCategory: 'IDGHAM_BILAGHUNNAH', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j6/p${i}_w3.mp3`, note: 'Idgham Bilaghunnah (Merah) tanpa dengung' },
          ],
        },
        {
          rowNumber: 2,
          instruction: 'Iqlab & Mad Far\'i:',
          words: [
            { id: `w_6_${i}_4`, arabic: 'مِنْ بَعْدِ', latin: 'Mim ba\'di', tajwidCategory: 'IQLAB', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j6/p${i}_w4.mp3`, note: 'Iqlab (Cyan) 2 harakat' },
            { id: `w_6_${i}_5`, arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ', latin: 'Idzaa jaa\'a nasrullaah', tajwidCategory: 'MAD_FAR_I', humanAudioUrl: `https://cdn.akumuslim.id/audio/iqra/j6/p${i}_w5.mp3`, note: 'Mad Wajib Muttashil (Oranye/Emas) 4-5 harakat' },
          ],
        },
      ],
    });
  }
  return lessons;
}

export const IQRA_CURRICULUM: IqraJilidItem[] = [
  {
    jilidNumber: 1,
    title: 'Iqra Jilid 1',
    subtitle: 'Huruf Tunggal & Vokal Fathah',
    colorTheme: 'from-emerald-600 to-teal-700',
    totalLessons: 30,
    isFreeCoreProtected: true,
    competencySummary: 'Mengenal huruf hijaiyah tunggal alif sampai ya dengan harakat fathah (a) secara langsung tanpa mengeja.',
    learningOutcomes: [
      'Mengenal 29 huruf hijaiyah mandiri',
      'Mengucapkan bunyi fathah (a) pendek satu ketukan',
      'Tidak mengeja (alif fathah a), melainkan membaca langsung bunyi',
    ],
    lessons: generateJilid1Lessons(),
  },
  {
    jilidNumber: 2,
    title: 'Iqra Jilid 2',
    subtitle: 'Huruf Bersambung & Bacaan Panjang',
    colorTheme: 'from-teal-600 to-cyan-700',
    totalLessons: 30,
    isFreeCoreProtected: true,
    competencySummary: 'Mengenal perubahan bentuk huruf saat berada di awal, tengah, dan akhir kata serta membedakan bacaan pendek vs panjang 2 harakat.',
    learningOutcomes: [
      'Mengenal sambungan 2 dan 3 huruf',
      'Membedakan mad thabi\'i alif (2 harakat) vs bacaan pendek (1 harakat)',
      'Kelancaran tempo membaca kata bersambung',
    ],
    lessons: generateJilid2Lessons(),
  },
  {
    jilidNumber: 3,
    title: 'Iqra Jilid 3',
    subtitle: 'Kasrah, Dhammah & Mad Thabi\'i Lengkap',
    colorTheme: 'from-blue-600 to-indigo-700',
    totalLessons: 30,
    isFreeCoreProtected: true,
    competencySummary: 'Mengenal harakat kasrah (i), dhammah (u), mad thabi\'i ya sukun dan wawu sukun secara seimbang dan stabil.',
    learningOutcomes: [
      'Pelafalan murni vokal i dan u tanpa sengau',
      'Mad thabi\'i dengan wawu sukun dan ya sukun (2 harakat)',
      'Kelancaran membaca kalimat pendek 3-4 kata',
    ],
    lessons: generateJilid3Lessons(),
  },
  {
    jilidNumber: 4,
    title: 'Iqra Jilid 4',
    subtitle: 'Tanwin, Sukun & Qalqalah',
    colorTheme: 'from-purple-600 to-indigo-800',
    totalLessons: 30,
    isFreeCoreProtected: true,
    competencySummary: 'Menguasai tanda baca tanwin (an, in, un), sukun huruf mati, dan pantulan qalqalah sughra pada huruf qaf, tha, ba, jim, dal.',
    learningOutcomes: [
      'Membaca tanwin secara tegas',
      'Menguasai huruf sukun tanpa menambah vokal sisipan',
      'Menerapkan pantulan qalqalah yang membal bersih',
    ],
    lessons: generateJilid4Lessons(),
  },
  {
    jilidNumber: 5,
    title: 'Iqra Jilid 5',
    subtitle: 'Alif Lam, Tasydid & Waqaf Dasar',
    colorTheme: 'from-amber-600 to-orange-700',
    totalLessons: 30,
    isFreeCoreProtected: true,
    competencySummary: 'Mengenal Al-Qamariyah, Al-Syamsiyah, tasydid penekanan, cara berhenti pada akhir ayat (waqaf), dan tanda baca mushaf.',
    learningOutcomes: [
      'Membedakan Al-Qamariyah dan Al-Syamsiyah secara spontan',
      'Membaca huruf bertasydid dengan penekanan proporsional',
      'Menguasai teknik waqaf mematikan huruf terakhir',
    ],
    lessons: generateJilid5Lessons(),
  },
  {
    jilidNumber: 6,
    title: 'Iqra Jilid 6',
    subtitle: 'Tajwid Lengkap & Kesiapan Masuk Mushaf',
    colorTheme: 'from-emerald-700 to-stone-900',
    totalLessons: 30,
    isFreeCoreProtected: true,
    competencySummary: 'Penerapan seluruh hukum tajwid (Idgham, Ikhfa, Iqlab, Ghunnah, Mad Far\'i) dan evaluasi kesiapan membaca Al-Qur\'an 30 Juz.',
    learningOutcomes: [
      'Membaca Al-Qur\'an dengan tartil sesuai hukum tajwid',
      'Mengenali tajwid warna standar LPMQ Kemenag RI',
      'Lulus sertifikasi bacaan untuk melangkah ke Mushaf Al-Qur\'an',
    ],
    lessons: generateJilid6Lessons(),
  },
];
