/**
 * Tajwid Color Engine — Pedoman Standar LPMQ Kemenag RI
 * Lembaga Pentashihan Mushaf Al-Qur'an Kementerian Agama Republik Indonesia
 * AKU MUSLIM — PYRAMID GROUP
 *
 * Standar Warna Resmi LPMQ Kemenag:
 * 1. Merah (Red): Idgham Bilaghunnah (ر, ل)
 * 2. Magenta / Ungu Kemerahan: Idgham Bighunnah (ي, ن, م, و) & Ghunnah Musyaddadah (نّ, مّ)
 * 3. Biru Langit / Cyan: Iqlab (ب) & Mad Shilah Thawilah
 * 4. Hijau (Green): Ikhfa Haqiqi (15 huruf) & Ikhfa Syafawi (م bertemu ب)
 * 5. Biru (Blue): Qalqalah Sughra & Kubra (ق, ط, ب, ج, د)
 * 6. Oranye / Amber: Mad Wajib Muttashil & Mad Jaiz Munfashil (4-5 harakat)
 * 7. Netral / Hitam: Izhar Halqi, Izhar Syafawi, Mad Thabi'i dasar (2 harakat)
 *
 * Fitur Aksesibilitas Disabilitas Netra / Buta Warna:
 * - Dukungan tanda simbol fonetik & pola garis bawah (Solid, Wavy, Dashed, Dotted, Double)
 */

export type TajwidRuleCategory =
  | 'IDGHAM_BILAGHUNNAH'
  | 'IDGHAM_BIGHUNNAH'
  | 'GHUNNAH'
  | 'IQLAB'
  | 'IKHFA_HAQIQI'
  | 'IKHFA_SYAFAWI'
  | 'QALQALAH'
  | 'MAD_FAR_I'
  | 'MAD_SHILAH'
  | 'IZHAR_HALQI'
  | 'IZHAR_SYAFAWI'
  | 'NORMAL';

export interface TajwidRuleDefinition {
  category: TajwidRuleCategory;
  name: string;
  arabicName: string;
  colorName: string;
  // Tailwind color classes for dark & light mode
  badgeBg: string;
  badgeText: string;
  textClass: string;
  borderClass: string;
  underlineClass: string;
  // Accessibility symbol for color blind mode
  accessibleSymbol: string;
  accessiblePattern: 'wavy' | 'dashed' | 'dotted' | 'double' | 'solid' | 'none';
  // Pedagogical guidance
  description: string;
  caraMembaca: string;
  contohHuruf: string;
  durasiHarakat?: string;
  audioExampleUrl?: string;
}

export const LPMQ_TAJWID_RULES: Record<TajwidRuleCategory, TajwidRuleDefinition> = {
  IDGHAM_BILAGHUNNAH: {
    category: 'IDGHAM_BILAGHUNNAH',
    name: 'Idgham Bilaghunnah',
    arabicName: 'إدغام بغير غنة',
    colorName: 'Merah (Red)',
    badgeBg: 'bg-red-500/20 dark:bg-red-950/40',
    badgeText: 'text-red-700 dark:text-red-300',
    textClass: 'text-red-600 dark:text-red-400 font-bold',
    borderClass: 'border-red-500',
    underlineClass: 'underline decoration-red-500 decoration-wavy decoration-2',
    accessibleSymbol: '[ID-BL]',
    accessiblePattern: 'wavy',
    description: 'Nun sukun (نْ) atau tanwin bertemu huruf Lam (ل) atau Ra (ر). Bunyi nun/tanwin dimasukkan penuh ke huruf berikutnya tanpa dengung.',
    caraMembaca: 'Leburkan suara langsung ke huruf berikutnya secara tegas tanpa menahan dengung sama sekali.',
    contohHuruf: 'ل (Lam), ر (Ra)',
    durasiHarakat: 'Langsung lebur (0 harakat dengung)',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/idgham_bilaghunnah_mir_rabbi.mp3',
  },

  IDGHAM_BIGHUNNAH: {
    category: 'IDGHAM_BIGHUNNAH',
    name: 'Idgham Bighunnah',
    arabicName: 'إدغام بغنة',
    colorName: 'Magenta / Fusia',
    badgeBg: 'bg-fuchsia-500/20 dark:bg-fuchsia-950/40',
    badgeText: 'text-fuchsia-700 dark:text-fuchsia-300',
    textClass: 'text-fuchsia-600 dark:text-fuchsia-400 font-bold',
    borderClass: 'border-fuchsia-500',
    underlineClass: 'underline decoration-fuchsia-500 decoration-dashed decoration-2',
    accessibleSymbol: '[ID-BG]',
    accessiblePattern: 'dashed',
    description: 'Nun sukun (نْ) atau tanwin bertemu salah satu huruf: Ya (ي), Nun (ن), Mim (م), Wawu (و). Suara dilebur dengan mendengung melalui rongga hidung.',
    caraMembaca: 'Leburkan ke huruf berikutnya sambil menahan dengung di pangkal hidung (Al-Khaisyum) selama 2 harakat.',
    contohHuruf: 'ي, ن, م, و (Yanmu)',
    durasiHarakat: '2 Harakat (Dengung sempurna)',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/idgham_bighunnah_may_yaqulu.mp3',
  },

  GHUNNAH: {
    category: 'GHUNNAH',
    name: 'Ghunnah Musyaddadah',
    arabicName: 'غنة مشددة',
    colorName: 'Magenta / Pink Tua',
    badgeBg: 'bg-pink-500/20 dark:bg-pink-950/40',
    badgeText: 'text-pink-700 dark:text-pink-300',
    textClass: 'text-pink-600 dark:text-pink-400 font-bold',
    borderClass: 'border-pink-500',
    underlineClass: 'underline decoration-pink-500 decoration-double decoration-2',
    accessibleSymbol: '[GH]',
    accessiblePattern: 'double',
    description: 'Huruf Nun bertasydid (نّ) atau Mim bertasydid (مّ) asli dalam Al-Qur\'an.',
    caraMembaca: 'Wajib didengungkan secara kuat dan merdu di rongga hidung selama 2 harakat penuh sebelum melanjutkan bacaan.',
    contohHuruf: 'نّ, مّ',
    durasiHarakat: '2 Harakat penuh',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/ghunnah_inna_amma.mp3',
  },

  IQLAB: {
    category: 'IQLAB',
    name: 'Iqlab',
    arabicName: 'إقلاب',
    colorName: 'Cyan / Biru Langit',
    badgeBg: 'bg-cyan-500/20 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    textClass: 'text-cyan-600 dark:text-cyan-400 font-bold',
    borderClass: 'border-cyan-500',
    underlineClass: 'underline decoration-cyan-500 decoration-dotted decoration-2',
    accessibleSymbol: '[IQ]',
    accessiblePattern: 'dotted',
    description: 'Nun sukun (نْ) atau tanwin bertemu huruf Ba (ب). Bunyi nun/tanwin ditukar menjadi bunyi mim samar (م) disertai dengung.',
    caraMembaca: 'Tukar bunyi nun/tanwin menjadi mim lembut tanpa merapatkan bibir terlalu keras, dengungkan 2 harakat.',
    contohHuruf: 'ب (Ba)',
    durasiHarakat: '2 Harakat',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/iqlab_mim_ba\'di.mp3',
  },

  IKHFA_HAQIQI: {
    category: 'IKHFA_HAQIQI',
    name: 'Ikhfa Haqiqi',
    arabicName: 'إخفاء حقيقي',
    colorName: 'Hijau (Green)',
    badgeBg: 'bg-emerald-500/20 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    textClass: 'text-emerald-600 dark:text-emerald-400 font-bold',
    borderClass: 'border-emerald-500',
    underlineClass: 'underline decoration-emerald-500 decoration-solid decoration-2',
    accessibleSymbol: '[IK-H]',
    accessiblePattern: 'solid',
    description: 'Nun sukun (نْ) atau tanwin bertemu salah satu dari 15 huruf ikhfa: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك.',
    caraMembaca: 'Samarkan bunyi nun sukun antara izhar dan idgham, siapkan makhraj huruf berikutnya disertai dengung.',
    contohHuruf: '15 huruf (Ta, Tsa, Jim, Dal, Dzal, Zai, Sin, Syin, Shad, Dhad, Tha, Zha, Fa, Qaf, Kaf)',
    durasiHarakat: '2 Harakat',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/ikhfa_min_duni.mp3',
  },

  IKHFA_SYAFAWI: {
    category: 'IKHFA_SYAFAWI',
    name: 'Ikhfa Syafawi',
    arabicName: 'إخفاء شفوي',
    colorName: 'Hijau Muda (Light Green)',
    badgeBg: 'bg-teal-500/20 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    textClass: 'text-teal-600 dark:text-teal-400 font-bold',
    borderClass: 'border-teal-500',
    underlineClass: 'underline decoration-teal-500 decoration-solid decoration-2',
    accessibleSymbol: '[IK-S]',
    accessiblePattern: 'solid',
    description: 'Mim sukun (مْ) bertemu dengan huruf Ba (ب). Bunyi mim disamarkan di dua bibir disertai dengung lembut.',
    caraMembaca: 'Rapatkan dua bibir dengan lembut tanpa ditekan keras, tahan dengung 2 harakat.',
    contohHuruf: 'ب (Ba)',
    durasiHarakat: '2 Harakat',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/ikhfa_syafawi_tarmihim.mp3',
  },

  QALQALAH: {
    category: 'QALQALAH',
    name: 'Qalqalah (Pantulan)',
    arabicName: 'قلقلة',
    colorName: 'Biru (Blue)',
    badgeBg: 'bg-blue-500/20 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    textClass: 'text-blue-600 dark:text-blue-400 font-bold',
    borderClass: 'border-blue-500',
    underlineClass: 'underline decoration-blue-500 decoration-wavy decoration-2',
    accessibleSymbol: '[QL]',
    accessiblePattern: 'wavy',
    description: 'Huruf Qalqalah: Qaf (ق), Tha (ط), Ba (ب), Jim (ج), Dal (د) (Baju Di Toko / Quthbu Jadin) saat berharakat sukun asli atau waqaf.',
    caraMembaca: 'Lepaskan makhraj dengan getaran pantulan suara yang tegas dan bersih tanpa menambah vokal tambahan.',
    contohHuruf: 'ق, ط, ب, ج, د',
    durasiHarakat: 'Pantulan seketika (Sughra di tengah kata, Kubra di akhir waqaf)',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/qalqalah_ahad_qul.mp3',
  },

  MAD_FAR_I: {
    category: 'MAD_FAR_I',
    name: 'Mad Wajib / Jaiz (Mad Far\'i)',
    arabicName: 'مد واجب متصل / مد جائز منفصل',
    colorName: 'Oranye / Emas (Amber)',
    badgeBg: 'bg-amber-500/20 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    textClass: 'text-amber-600 dark:text-amber-400 font-bold',
    borderClass: 'border-amber-500',
    underlineClass: 'underline decoration-amber-500 decoration-double decoration-2',
    accessibleSymbol: '[MD-4/5]',
    accessiblePattern: 'double',
    description: 'Mad Thabi\'i yang bertemu hamzah dalam satu kata (Mad Wajib Muttashil) atau di kata terpisah (Mad Jaiz Munfashil).',
    caraMembaca: 'Panjangkan bacaan secara teratur dan stabil sepanjang 4 hingga 5 harakat (2 hingga 2,5 alif).',
    contohHuruf: 'Huruf mad (ا, و, ي) bertemu ء',
    durasiHarakat: '4–5 Harakat (Wajib/Jaiz) atau 6 Harakat (Mad Lazim)',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/mad_wajib_jaa\'a.mp3',
  },

  MAD_SHILAH: {
    category: 'MAD_SHILAH',
    name: 'Mad Shilah Thawilah',
    arabicName: 'مد صلة طويلة',
    colorName: 'Biru Cerah / Sky Blue',
    badgeBg: 'bg-sky-500/20 dark:bg-sky-950/40',
    badgeText: 'text-sky-700 dark:text-sky-300',
    textClass: 'text-sky-600 dark:text-sky-400 font-bold',
    borderClass: 'border-sky-500',
    underlineClass: 'underline decoration-sky-500 decoration-dotted decoration-2',
    accessibleSymbol: '[MD-SH]',
    accessiblePattern: 'dotted',
    description: 'Ha dhamir (ـه / ـهُ) yang bertemu dengan huruf Hamzah di kata berikutnya.',
    caraMembaca: 'Panjangkan bacaan 4–5 harakat seperti Mad Jaiz Munfashil.',
    contohHuruf: 'ـهُ bertemu ء',
    durasiHarakat: '4–5 Harakat',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/mad_shilah_thawilah.mp3',
  },

  IZHAR_HALQI: {
    category: 'IZHAR_HALQI',
    name: 'Izhar Halqi',
    arabicName: 'إظهار حلقي',
    colorName: 'Netral / Hitam',
    badgeBg: 'bg-stone-500/15 dark:bg-stone-700/30',
    badgeText: 'text-stone-700 dark:text-stone-300',
    textClass: 'text-stone-800 dark:text-stone-200',
    borderClass: 'border-stone-400',
    underlineClass: '',
    accessibleSymbol: '[IZ-H]',
    accessiblePattern: 'none',
    description: 'Nun sukun (نْ) atau tanwin bertemu 6 huruf halq: Hamzah (ء), Ha (هـ), \'Ain (ع), Ha (ح), Ghain (غ), Kha (خ).',
    caraMembaca: 'Baca bunyi nun/tanwin dengan sangat jelas, tegas, tanpa dengung dan tanpa dipanjangkan.',
    contohHuruf: 'ء, هـ, ع, ح, غ, خ',
    durasiHarakat: 'Tegas tanpa jeda/dengung',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/izhar_man_amana.mp3',
  },

  IZHAR_SYAFAWI: {
    category: 'IZHAR_SYAFAWI',
    name: 'Izhar Syafawi',
    arabicName: 'إظهار شفوي',
    colorName: 'Netral / Abu-abu',
    badgeBg: 'bg-stone-500/15 dark:bg-stone-700/30',
    badgeText: 'text-stone-700 dark:text-stone-300',
    textClass: 'text-stone-800 dark:text-stone-200',
    borderClass: 'border-stone-400',
    underlineClass: '',
    accessibleSymbol: '[IZ-S]',
    accessiblePattern: 'none',
    description: 'Mim sukun (مْ) bertemu huruf hijaiyah selain Mim (م) dan Ba (ب).',
    caraMembaca: 'Rapatkan dua bibir dan bunyikan mim sukun dengan jelas tanpa memanjangkan dengung.',
    contohHuruf: '26 huruf selain Mim & Ba',
    durasiHarakat: 'Tegas seketika',
    audioExampleUrl: 'https://cdn.akumuslim.id/audio/tajwid/izhar_syafawi_alaihim.mp3',
  },

  NORMAL: {
    category: 'NORMAL',
    name: 'Bacaan Biasa / Mad Thabi\'i',
    arabicName: 'طبيعي',
    colorName: 'Hitam / Abu Standar',
    badgeBg: 'bg-stone-100 dark:bg-stone-800',
    badgeText: 'text-stone-600 dark:text-stone-400',
    textClass: 'text-stone-900 dark:text-stone-100',
    borderClass: 'border-transparent',
    underlineClass: '',
    accessibleSymbol: '',
    accessiblePattern: 'none',
    description: 'Huruf berharakat biasa atau Mad Thabi\'i dasar (2 harakat).',
    caraMembaca: 'Baca sesuai harakat vokal normal (a, i, u) atau panjang 2 harakat untuk huruf mad dasar.',
    contohHuruf: 'Semua huruf dasar',
    durasiHarakat: '1–2 Harakat',
  },
};

export interface TokenizedTajwidWord {
  id: string;
  wordArabic: string;
  wordLatin: string;
  tajwidCategory: TajwidRuleCategory;
  ruleExplanation?: TajwidRuleDefinition;
  specificSegmentText?: string;
}

/**
 * Helper to get rule definition by category
 */
export function getLpmqRuleDefinition(category: TajwidRuleCategory): TajwidRuleDefinition {
  return LPMQ_TAJWID_RULES[category] || LPMQ_TAJWID_RULES.NORMAL;
}
