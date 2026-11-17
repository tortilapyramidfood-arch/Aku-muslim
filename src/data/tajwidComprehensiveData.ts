/**
 * Data Lengkap Ilmu Tajwid & Makharijul Huruf Interaktif
 * AKU MUSLIM — Sumber Terverifikasi Kaidah Qira'at
 */

export interface MakhrajRegion {
  id: string;
  name: string;
  arabicName: string;
  category: 'jauf' | 'halq' | 'lisan' | 'syafatain' | 'khaisyum';
  description: string;
  letters: string[];
  articulationDetail: string;
  svgCoordinates: { cx: number; cy: number; r: number };
  exampleAyah: { arabic: string; latin: string; surah: string };
}

export interface LetterDifference {
  id: string;
  letters: string[];
  letterNames: string;
  makhrajDifference: string;
  characteristicDifference: string;
  commonMistake: string;
  practiceExample: { arabic: string; transliteration: string };
}

export interface ColorCodedVerseWord {
  id: number;
  arabic: string;
  latin: string;
  tajwidType?: 'mad' | 'ghunnah' | 'ikhfa' | 'iqlab' | 'idgham' | 'qalqalah' | 'none';
  tajwidExplanation?: string;
}

export interface ColorCodedVerse {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  fullArabic: string;
  translation: string;
  words: ColorCodedVerseWord[];
}

export const MAKHRAJ_REGIONS: MakhrajRegion[] = [
  {
    id: 'jauf',
    name: 'Al-Jauf (Rongga Mulut & Tenggorokan)',
    arabicName: 'الجَوْف',
    category: 'jauf',
    description: 'Rongga udara terbuka dari tenggorokan hingga keluarnya suara lewat mulut. Merupakan tempat keluarnya huruf mad.',
    letters: ['ا', 'و', 'ي'],
    articulationDetail: 'Udara mengalir bebas tanpa hambatan lidah atau bibir saat membaca mad (Alif setelah fathah, Wawu sukun setelah dhammah, Ya sukun setelah kasrah).',
    svgCoordinates: { cx: 160, cy: 155, r: 24 },
    exampleAyah: {
      arabic: 'نُوحِيهَا',
      latin: 'Nuu-hii-haa (Memuat ketiga huruf mad)',
      surah: 'QS. Hud: 49',
    },
  },
  {
    id: 'halq_bawah',
    name: 'Aqshal Halq (Pangkal Tenggorokan Paling Dalam)',
    arabicName: 'أَقْصَى الحَلْق',
    category: 'halq',
    description: 'Bagian tenggorokan paling bawah yang paling dekat dengan dada (pita suara).',
    letters: ['ء', 'هـ'],
    articulationDetail: 'Huruf Hamzah (ء) keluar dengan merapatkan pita suara lalu melepaskannya, sedangkan Ha (هـ) keluar dengan mengalirkan nafas halus (hams).',
    svgCoordinates: { cx: 160, cy: 260, r: 18 },
    exampleAyah: {
      arabic: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',
      latin: 'Innal insaana lafii khusr',
      surah: 'QS. Al-\'Asr: 2',
    },
  },
  {
    id: 'halq_tengah',
    name: 'Wasathul Halq (Tengah Tenggorokan)',
    arabicName: 'وَسَطُ الحَلْق',
    category: 'halq',
    description: 'Bagian tengah tenggorokan pada katup epiglotis (di atas jakun).',
    letters: ['ع', 'ح'],
    articulationDetail: 'Huruf \'Ain (ع) keluar dengan menekan katup epiglotis ke dinding belakang tenggorokan, sedangkan Ha (ح) mengalirkan suara bersih tanpa getaran kasar.',
    svgCoordinates: { cx: 160, cy: 215, r: 18 },
    exampleAyah: {
      arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
      latin: 'Ar-Rahmaanir-Rahiim',
      surah: 'QS. Al-Fatihah: 3',
    },
  },
  {
    id: 'halq_atas',
    name: 'Adnal Halq (Tenggorokan Atas / Anak Tekak)',
    arabicName: 'أَدْنَى الحَلْق',
    category: 'halq',
    description: 'Bagian tenggorokan paling atas dekat pangkal lidah dan anak lidah (uvula).',
    letters: ['غ', 'خ'],
    articulationDetail: 'Huruf Ghain (غ) keluar dengan gesekan suara halus (jahr), sedangkan Kha (خ) disertai desis gesekan kasar udara (hams).',
    svgCoordinates: { cx: 160, cy: 175, r: 18 },
    exampleAyah: {
      arabic: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ',
      latin: 'Ghayril maghdhuubi \'alayhim',
      surah: 'QS. Al-Fatihah: 7',
    },
  },
  {
    id: 'lisan_pangkal',
    name: 'Aqshal Lisan (Pangkal Lidah Paling Belakang)',
    arabicName: 'أَقْصَى اللِّسَان',
    category: 'lisan',
    description: 'Pangkal lidah menempel pada langit-langit lunak (palatum molle) dan langit-langit keras.',
    letters: ['ق', 'ك'],
    articulationDetail: 'Qaf (ق) menempel langit-langit lunak paling belakang (tebal/isti\'la), sedangkan Kaf (ك) sedikit lebih ke depan di langit-langit keras (disertai hembusan nafas/hams).',
    svgCoordinates: { cx: 180, cy: 155, r: 18 },
    exampleAyah: {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      latin: 'Qul huwallahu ahad',
      surah: 'QS. Al-Ikhlas: 1',
    },
  },
  {
    id: 'lisan_tengah',
    name: 'Wasathul Lisan (Tengah Lidah)',
    arabicName: 'وَسَطُ اللِّسَان',
    category: 'lisan',
    description: 'Tengah permukaan lidah terangkat menuju langit-langit rongga mulut bagian atas.',
    letters: ['ج', 'ش', 'ي'],
    articulationDetail: 'Jim (ج) menempel rapat menahan suara, Syin (ش) menghembuskan udara menyebar (tafasy-syi), Ya (ي) mengalirkan suara lembut tanpa menempel sempurna.',
    svgCoordinates: { cx: 205, cy: 150, r: 18 },
    exampleAyah: {
      arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ',
      latin: 'Idzaa jaa-a nashrullah',
      surah: 'QS. An-Nashr: 1',
    },
  },
  {
    id: 'lisan_tepi',
    name: 'Haffatul Lisan (Tepi / Sisi Lidah)',
    arabicName: 'حَافَةُ اللِّسَان',
    category: 'lisan',
    description: 'Salah satu atau kedua tepi sisi lidah menempel pada gigi geraham atas.',
    letters: ['ض', 'ل'],
    articulationDetail: 'Dhad (ض) tepi lidah menekan geraham atas dengan pemanjangan suara (istithalah), Lam (ل) dari tepi lidah terdekat hingga ujungnya menempel gusi atas.',
    svgCoordinates: { cx: 215, cy: 165, r: 16 },
    exampleAyah: {
      arabic: 'وَلَا الضَّالِّينَ',
      latin: 'Wa ladh-dhaalliin',
      surah: 'QS. Al-Fatihah: 7',
    },
  },
  {
    id: 'lisan_ujung',
    name: 'Tharaful Lisan (Ujung Lidah)',
    arabicName: 'طَرَفُ اللِّسَان',
    category: 'lisan',
    description: 'Ujung lidah bertemu dengan gusi atas, pangkal gigi seri, atau ujung gigi seri.',
    letters: ['ن', 'ر', 'ط', 'د', 'ت', 'ص', 'ز', 'س', 'ظ', 'ذ', 'ث'],
    articulationDetail: 'Merupakan makhraj dengan huruf terbanyak (11 huruf), terbagi atas huruf nith\'iyyah (ط, د, ت), asaliyyah (ص, ز, س), dan litsawiyyah (ظ, ذ, ث).',
    svgCoordinates: { cx: 240, cy: 160, r: 20 },
    exampleAyah: {
      arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      latin: 'Ihdinash-shiraathal mustaqiim',
      surah: 'QS. Al-Fatihah: 6',
    },
  },
  {
    id: 'syafatain',
    name: 'Asy-Syafatain (Kedua Bibir)',
    arabicName: 'الشَّفَتَان',
    category: 'syafatain',
    description: 'Bibir atas dan bibir bawah, baik dirapatkan, dibulatkan, atau bibir bawah bertemu gigi seri atas.',
    letters: ['ف', 'ب', 'م', 'و'],
    articulationDetail: 'Fa (ف) bibir bawah bagian dalam bertemu ujung gigi seri atas. Ba (ب) dan Mim (م) kedua bibir merapat. Wawu (و) kedua bibir membulat ke depan.',
    svgCoordinates: { cx: 270, cy: 160, r: 22 },
    exampleAyah: {
      arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
      latin: 'Tabbat yadaa abii lahabin watabb',
      surah: 'QS. Al-Lahab: 1',
    },
  },
  {
    id: 'khaisyum',
    name: 'Al-Khaisyum (Rongga Hidung)',
    arabicName: 'الخَيْشُوم',
    category: 'khaisyum',
    description: 'Pangkal rongga hidung bagian dalam yang tersambung ke tenggorokan. Pusat getaran suara dengung (ghunnah).',
    letters: ['Ghunnah (نّ, مّ, Ikhfa, Idgham Bighunnah, Iqlab)'],
    articulationDetail: 'Suara dengung alami yang bergetar di rongga hidung selama 2 harakat.',
    svgCoordinates: { cx: 220, cy: 110, r: 20 },
    exampleAyah: {
      arabic: 'مِنْ شَرِّ مَا خَلَقَ',
      latin: 'Min syarri maa khalaq',
      surah: 'QS. Al-Falaq: 2',
    },
  },
];

export const LETTER_DIFFERENCES: LetterDifference[] = [
  {
    id: 'dzal_zai_zha',
    letters: ['ذ', 'ز', 'ظ'],
    letterNames: 'Dzal (ذ) vs Zai (ز) vs Zha (ظ)',
    makhrajDifference: 'Dzal & Zha keluar dari ujung lidah bertemu ujung gigi seri atas. Sedangkan Zai keluar dari ujung lidah di atas gigi seri bawah (berdesis tajam).',
    characteristicDifference: 'Zha bersifat tebal (Isti\'la & Ithbaq). Dzal bersifat tipis (Istifal). Zai memiliki sifat Shafir (suara desis tajam seperti lebah).',
    commonMistake: 'Membaca Dzal seperti Zai (berdesis), atau membaca Zha seperti Za tebal tanpa menempelkan lidah ke ujung gigi seri atas.',
    practiceExample: {
      arabic: 'أَنْذَرْتَهُمْ - رِزْقًا - عَظِيمٌ',
      transliteration: 'Andzartahum - Rizqan - \'Azhiim',
    },
  },
  {
    id: 'tsa_sin_shad',
    letters: ['ث', 'س', 'ص'],
    letterNames: 'Tsa (ث) vs Sin (س) vs Shad (ص)',
    makhrajDifference: 'Tsa dari ujung lidah menempel ujung gigi seri atas. Sin dan Shad dari ujung lidah di atas gigi seri bawah.',
    characteristicDifference: 'Tsa dan Sin tipis (istifal). Shad tebal bulat (isti\'la dan ithbaq) dengan desis kuat (shafir).',
    commonMistake: 'Membaca Tsa menjadi Sin biasa (seperti huruf S), atau membaca Sin seperti Shad sehingga terdengar terlalu tebal.',
    practiceExample: {
      arabic: 'ثَلَاثَةَ - سَلَامٌ - صِرَاطَ',
      transliteration: 'Tsalaatsata - Salaamun - Shiraatha',
    },
  },
  {
    id: 'ta_tha',
    letters: ['ت', 'ط'],
    letterNames: 'Ta (ت) vs Tha (ط)',
    makhrajDifference: 'Keduanya sama-sama keluar dari ujung lidah bertemu pangkal gigi seri atas (huruf nith\'iyyah).',
    characteristicDifference: 'Ta tipis (istifal) dengan hembusan nafas halus (hams). Tha tebal kuat (isti\'la, ithbaq) tanpa hams dan memantul saat sukun (qalqalah).',
    commonMistake: 'Membaca Tha menjadi Ta tebal yang berangin (hams), padahal Tha tidak memiliki hams.',
    practiceExample: {
      arabic: 'تَبَّتْ - طَيِّبَاتِ',
      transliteration: 'Tabbat - Thayyibaat',
    },
  },
  {
    id: 'qaf_kaf',
    letters: ['ق', 'ك'],
    letterNames: 'Qaf (ق) vs Kaf (ك)',
    makhrajDifference: 'Qaf di pangkal lidah menempel langit-langit lunak paling belakang. Kaf sedikit lebih ke depan di langit-langit keras.',
    characteristicDifference: 'Qaf tebal (isti\'la) dan memantul saat sukun (qalqalah). Kaf tipis (istifal) dan memiliki sifat hams (letupan nafas halus saat sukun).',
    commonMistake: 'Membaca Qaf seperti Kaf (huruf K biasa) atau memberi hembusan nafas hams pada Qaf.',
    practiceExample: {
      arabic: 'قُلْ - كُلَّ',
      transliteration: 'Qul (Katakanlah) vs Kul (Makanlah)',
    },
  },
  {
    id: 'ha_kecil_ha_besar',
    letters: ['ح', 'هـ'],
    letterNames: 'Ha Tengah (ح) vs Ha Pangkal (هـ)',
    makhrajDifference: 'Ha kecil (ح) keluar dari tengah tenggorokan (wasathul halq). Ha besar (هـ) dari pangkal tenggorokan paling bawah (aqshal halq).',
    characteristicDifference: 'Keduanya memiliki sifat hams (mengalir nafas), namun Ha (ح) memiliki suara bersih lembut tanpa desah dada, sedangkan Ha (هـ) bergaung dari dada.',
    commonMistake: 'Membaca Al-Hamdu (الحَمْدُ) dengan Ha dada sehingga terdengar seperti keluhan, atau sebaliknya.',
    practiceExample: {
      arabic: 'الْحَمْدُ - اهْدِنَا',
      transliteration: 'Al-Hamdu - Ihdinaa',
    },
  },
  {
    id: 'ain_hamzah',
    letters: ['ع', 'ء'],
    letterNames: '\'Ain (ع) vs Hamzah (ء)',
    makhrajDifference: '\'Ain dari tengah tenggorokan dengan menekan katup epiglotis. Hamzah dari pangkal tenggorokan paling bawah dengan merapatkan pita suara.',
    characteristicDifference: 'Hamzah berbunyi hentakan tegas (syiddah). \'Ain bersuara mengalir sedang (tawassuth/bainiyyah) tanpa menyumbat hidung.',
    commonMistake: 'Membaca \'Ain seperti suara sengau dari hidung, atau menyamakan \'Ain dengan bunyi huruf vokal A biasa.',
    practiceExample: {
      arabic: 'أَنْعَمْتَ - يُؤْمِنُونَ',
      transliteration: 'An\'amta - Yu\'minuun',
    },
  },
];

export const COLOR_CODED_PRACTICE_VERSES: ColorCodedVerse[] = [
  {
    id: 'fatihah_1',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    ayahNumber: 1,
    fullArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
    words: [
      { id: 1, arabic: 'بِسْمِ', latin: 'Bismi', tajwidType: 'none', tajwidExplanation: 'Huruf Sin sukun dibaca hams (berdesis halus).' },
      { id: 2, arabic: 'اللَّهِ', latin: 'Allaahi', tajwidType: 'none', tajwidExplanation: 'Lam Jalalah dibaca tarqiq (tipis) karena didahului kasrah.' },
      { id: 3, arabic: 'الرَّحْمَٰنِ', latin: 'Ar-Rahmaani', tajwidType: 'mad', tajwidExplanation: 'Mad Thabi\'i pada mim tegak dibaca panjang 2 harakat.' },
      { id: 4, arabic: 'الرَّحِيمِ', latin: 'Ar-Rahiim', tajwidType: 'mad', tajwidExplanation: 'Mad \'Aridh Lissukun di akhir ayat dibaca panjang 2, 4, atau 6 harakat.' },
    ],
  },
  {
    id: 'ikhlas_1_4',
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    ayahNumber: 1,
    fullArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
    words: [
      { id: 1, arabic: 'قُلْ', latin: 'Qul', tajwidType: 'none', tajwidExplanation: 'Lam sukun dibaca idzhar dengan jelas.' },
      { id: 2, arabic: 'هُوَ', latin: 'Huwa', tajwidType: 'none', tajwidExplanation: 'Wawu berharakat fathah dibaca pendek 1 harakat.' },
      { id: 3, arabic: 'اللَّهُ', latin: 'Allaahu', tajwidType: 'none', tajwidExplanation: 'Lam Jalalah dibaca tafkhim (tebal) karena didahului fathah.' },
      { id: 4, arabic: 'أَحَدٌ', latin: 'Ahad', tajwidType: 'qalqalah', tajwidExplanation: 'Qalqalah Kubra: Dal berharakat dhommatain saat waqaf memantul tebal dan jelas.' },
    ],
  },
  {
    id: 'falaq_2',
    surahNumber: 113,
    surahName: 'Al-Falaq',
    ayahNumber: 2,
    fullArabic: 'مِنْ شَرِّ مَا خَلَقَ',
    translation: 'Dari kejahatan (makhluk yang) Dia ciptakan.',
    words: [
      { id: 1, arabic: 'مِنْ', latin: 'Min', tajwidType: 'ikhfa', tajwidExplanation: 'Ikhfa Haqiqi: Nun sukun bertemu huruf Syin disamarkan dengan dengung 2 harakat.' },
      { id: 2, arabic: 'شَرِّ', latin: 'Syarri', tajwidType: 'none', tajwidExplanation: 'Ra bertasydid kasrah dibaca tarqiq (tipis).' },
      { id: 3, arabic: 'مَا', latin: 'Maa', tajwidType: 'mad', tajwidExplanation: 'Mad Thabi\'i dibaca panjang 2 harakat.' },
      { id: 4, arabic: 'خَلَقَ', latin: 'Khalaq', tajwidType: 'qalqalah', tajwidExplanation: 'Qalqalah Kubra: Qaf waqaf di akhir ayat memantul kuat.' },
    ],
  },
  {
    id: 'nas_1',
    surahNumber: 114,
    surahName: 'An-Nas',
    ayahNumber: 1,
    fullArabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia."',
    words: [
      { id: 1, arabic: 'قُلْ', latin: 'Qul', tajwidType: 'none', tajwidExplanation: 'Qaf tebal, Lam sukun jelas.' },
      { id: 2, arabic: 'أَعُوذُ', latin: 'A\'uudzu', tajwidType: 'mad', tajwidExplanation: 'Mad Thabi\'i pada Wawu sukun 2 harakat, Dzal berbunyi litsawiyyah tipis.' },
      { id: 3, arabic: 'بِرَبِّ', latin: 'Birabbi', tajwidType: 'none', tajwidExplanation: 'Ra fathah tafkhim, Ba tasydid ditekan kuat.' },
      { id: 4, arabic: 'النَّاسِ', latin: 'An-Naas', tajwidType: 'ghunnah', tajwidExplanation: 'Ghunnah Musyaddadah: Nun bertasydid wajib didengungkan 2 harakat, diakhiri Mad \'Aridh Lissukun.' },
    ],
  },
];
