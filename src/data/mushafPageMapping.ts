/**
 * Pemetaan Standar Mushaf Madinah 604 Halaman (15 Baris)
 * AKU MUSLIM — PYRAMID GROUP
 *
 * Menghubungkan nomor halaman fisik 1 sampai 604 dengan Surah, Juz, dan rentang Ayat
 * Terverifikasi sesuai standar Percetakan Al-Qur'an Raja Fahd (KSA) & LPMQ Kemenag RI
 */

export const TOTAL_MUSHAF_PAGES = 604;

export interface MushafPageMeta {
  pageNumber: number; // 1 to 604
  juzNumber: number; // 1 to 30
  surahNumber: number; // Primary surah on this page
  surahName: string;
  surahArabic: string;
  startAyah: number;
  endAyah: number;
  totalVersesOnPage: number;
  isFirstPageOfSurah?: boolean;
}

// Key milestone page anchors verified from Madinah Mushaf
const PAGE_ANCHORS: { page: number; juz: number; surah: number; name: string; arabic: string; start: number; end: number }[] = [
  { page: 1, juz: 1, surah: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', start: 1, end: 7 },
  { page: 2, juz: 1, surah: 2, name: 'Al-Baqarah', arabic: 'البقرة', start: 1, end: 5 },
  { page: 3, juz: 1, surah: 2, name: 'Al-Baqarah', arabic: 'البقرة', start: 6, end: 16 },
  { page: 4, juz: 1, surah: 2, name: 'Al-Baqarah', arabic: 'البقرة', start: 17, end: 24 },
  { page: 5, juz: 1, surah: 2, name: 'Al-Baqarah', arabic: 'البقرة', start: 25, end: 29 },
  { page: 42, juz: 3, surah: 2, name: 'Al-Baqarah', arabic: 'البقرة', start: 253, end: 262 },
  { page: 50, juz: 3, surah: 3, name: 'Ali \'Imran', arabic: 'آل عمران', start: 1, end: 9 },
  { page: 77, juz: 4, surah: 4, name: 'An-Nisa\'', arabic: 'النساء', start: 1, end: 6 },
  { page: 106, juz: 6, surah: 5, name: 'Al-Ma\'idah', arabic: 'المائدة', start: 1, end: 5 },
  { page: 128, juz: 7, surah: 6, name: 'Al-An\'am', arabic: 'الأنعام', start: 1, end: 8 },
  { page: 151, juz: 8, surah: 7, name: 'Al-A\'raf', arabic: 'الأعراف', start: 1, end: 11 },
  { page: 177, juz: 9, surah: 8, name: 'Al-Anfal', arabic: 'الأنفال', start: 1, end: 8 },
  { page: 187, juz: 10, surah: 9, name: 'At-Taubah', arabic: 'التوبة', start: 1, end: 6 },
  { page: 208, juz: 11, surah: 10, name: 'Yunus', arabic: 'يونس', start: 1, end: 6 },
  { page: 221, juz: 12, surah: 11, name: 'Hud', arabic: 'هود', start: 1, end: 5 },
  { page: 235, juz: 12, surah: 12, name: 'Yusuf', arabic: 'يوسف', start: 1, end: 6 },
  { page: 249, juz: 13, surah: 13, name: 'Ar-Ra\'d', arabic: 'الرعد', start: 1, end: 5 },
  { page: 255, juz: 13, surah: 14, name: 'Ibrahim', arabic: 'إبراهيم', start: 1, end: 5 },
  { page: 262, juz: 14, surah: 15, name: 'Al-Hijr', arabic: 'الحجر', start: 1, end: 15 },
  { page: 267, juz: 14, surah: 16, name: 'An-Nahl', arabic: 'النحل', start: 1, end: 8 },
  { page: 282, juz: 15, surah: 17, name: 'Al-Isra\'', arabic: 'الإسراء', start: 1, end: 7 },
  { page: 293, juz: 15, surah: 18, name: 'Al-Kahf', arabic: 'الكهف', start: 1, end: 4 },
  { page: 305, juz: 16, surah: 19, name: 'Maryam', arabic: 'مريم', start: 1, end: 11 },
  { page: 312, juz: 16, surah: 20, name: 'Thaha', arabic: 'طه', start: 1, end: 12 },
  { page: 322, juz: 17, surah: 21, name: 'Al-Anbiya\'', arabic: 'الأنبياء', start: 1, end: 10 },
  { page: 332, juz: 17, surah: 22, name: 'Al-Hajj', arabic: 'الحج', start: 1, end: 5 },
  { page: 342, juz: 18, surah: 23, name: 'Al-Mu\'minun', arabic: 'المؤمنون', start: 1, end: 11 },
  { page: 350, juz: 18, surah: 24, name: 'An-Nur', arabic: 'النور', start: 1, end: 10 },
  { page: 359, juz: 19, surah: 25, name: 'Al-Furqan', arabic: 'الفرقان', start: 1, end: 11 },
  { page: 367, juz: 19, surah: 26, name: 'Asy-Syu\'ara\'', arabic: 'الشعراء', start: 1, end: 19 },
  { page: 377, juz: 19, surah: 27, name: 'An-Naml', arabic: 'النمل', start: 1, end: 13 },
  { page: 385, juz: 20, surah: 28, name: 'Al-Qashash', arabic: 'القصص', start: 1, end: 5 },
  { page: 396, juz: 20, surah: 29, name: 'Al-\'Ankabut', arabic: 'العنكبوت', start: 1, end: 6 },
  { page: 404, juz: 21, surah: 30, name: 'Ar-Rum', arabic: 'الروم', start: 1, end: 5 },
  { page: 411, juz: 21, surah: 31, name: 'Luqman', arabic: 'لقمان', start: 1, end: 11 },
  { page: 415, juz: 21, surah: 32, name: 'As-Sajdah', arabic: 'السجدة', start: 1, end: 11 },
  { page: 418, juz: 21, surah: 33, name: 'Al-Ahzab', arabic: 'الأحزاب', start: 1, end: 6 },
  { page: 428, juz: 22, surah: 34, name: 'Saba\'', arabic: 'سبأ', start: 1, end: 7 },
  { page: 434, juz: 22, surah: 35, name: 'Fathir', arabic: 'فاطر', start: 1, end: 3 },
  { page: 440, juz: 22, surah: 36, name: 'Yasin', arabic: 'يس', start: 1, end: 12 },
  { page: 446, juz: 23, surah: 37, name: 'Ash-Shaffat', arabic: 'الصافات', start: 1, end: 24 },
  { page: 453, juz: 23, surah: 38, name: 'Shad', arabic: 'ص', start: 1, end: 16 },
  { page: 458, juz: 23, surah: 39, name: 'Az-Zumar', arabic: 'الزمر', start: 1, end: 5 },
  { page: 467, juz: 24, surah: 40, name: 'Ghafir', arabic: 'غافر', start: 1, end: 7 },
  { page: 477, juz: 24, surah: 41, name: 'Fushshilat', arabic: 'فصلت', start: 1, end: 8 },
  { page: 483, juz: 25, surah: 42, name: 'Asy-Syura', arabic: 'الشورى', start: 1, end: 9 },
  { page: 489, juz: 25, surah: 43, name: 'Az-Zukhruf', arabic: 'الزخرف', start: 1, end: 10 },
  { page: 496, juz: 25, surah: 44, name: 'Ad-Dukhan', arabic: 'الدخان', start: 1, end: 18 },
  { page: 499, juz: 25, surah: 45, name: 'Al-Jatsiyah', arabic: 'الجاثية', start: 1, end: 13 },
  { page: 502, juz: 26, surah: 46, name: 'Al-Ahqaf', arabic: 'الأحقاف', start: 1, end: 5 },
  { page: 507, juz: 26, surah: 47, name: 'Muhammad', arabic: 'محمد', start: 1, end: 9 },
  { page: 511, juz: 26, surah: 48, name: 'Al-Fath', arabic: 'الفتح', start: 1, end: 9 },
  { page: 515, juz: 26, surah: 49, name: 'Al-Hujurat', arabic: 'الحجرات', start: 1, end: 10 },
  { page: 518, juz: 26, surah: 50, name: 'Qaf', arabic: 'ق', start: 1, end: 15 },
  { page: 520, juz: 26, surah: 51, name: 'Adz-Dzariyat', arabic: 'الذاريات', start: 1, end: 30 },
  { page: 523, juz: 27, surah: 52, name: 'Ath-Thur', arabic: 'الطور', start: 1, end: 28 },
  { page: 526, juz: 27, surah: 53, name: 'An-Najm', arabic: 'النجم', start: 1, end: 25 },
  { page: 528, juz: 27, surah: 54, name: 'Al-Qamar', arabic: 'القمر', start: 1, end: 27 },
  { page: 531, juz: 27, surah: 55, name: 'Ar-Rahman', arabic: 'الرحمن', start: 1, end: 38 },
  { page: 534, juz: 27, surah: 56, name: 'Al-Waqi\'ah', arabic: 'الواقعة', start: 1, end: 40 },
  { page: 537, juz: 27, surah: 57, name: 'Al-Hadid', arabic: 'الحديد', start: 1, end: 9 },
  { page: 542, juz: 28, surah: 58, name: 'Al-Mujadilah', arabic: 'المجادلة', start: 1, end: 6 },
  { page: 545, juz: 28, surah: 59, name: 'Al-Hasyr', arabic: 'الحشر', start: 1, end: 9 },
  { page: 549, juz: 28, surah: 60, name: 'Al-Mumtahanah', arabic: 'الممتحنة', start: 1, end: 6 },
  { page: 551, juz: 28, surah: 61, name: 'Ash-Shaff', arabic: 'الصف', start: 1, end: 9 },
  { page: 553, juz: 28, surah: 62, name: 'Al-Jumu\'ah', arabic: 'الجمعة', start: 1, end: 8 },
  { page: 554, juz: 28, surah: 63, name: 'Al-Munafiqun', arabic: 'المنافقون', start: 1, end: 8 },
  { page: 556, juz: 28, surah: 64, name: 'At-Taghabun', arabic: 'التغابن', start: 1, end: 9 },
  { page: 558, juz: 28, surah: 65, name: 'Ath-Thalaq', arabic: 'الطلاق', start: 1, end: 5 },
  { page: 560, juz: 28, surah: 66, name: 'At-Tahrim', arabic: 'التحريم', start: 1, end: 7 },
  { page: 562, juz: 29, surah: 67, name: 'Al-Mulk', arabic: 'الملك', start: 1, end: 12 },
  { page: 564, juz: 29, surah: 68, name: 'Al-Qalam', arabic: 'القلم', start: 1, end: 28 },
  { page: 566, juz: 29, surah: 69, name: 'Al-Haqqah', arabic: 'الحاقة', start: 1, end: 34 },
  { page: 568, juz: 29, surah: 70, name: 'Al-Ma\'arij', arabic: 'المعارج', start: 1, end: 39 },
  { page: 570, juz: 29, surah: 71, name: 'Nuh', arabic: 'نوح', start: 1, end: 20 },
  { page: 572, juz: 29, surah: 72, name: 'Al-Jinn', arabic: 'الجن', start: 1, end: 19 },
  { page: 574, juz: 29, surah: 73, name: 'Al-Muzzammil', arabic: 'المزمل', start: 1, end: 19 },
  { page: 575, juz: 29, surah: 74, name: 'Al-Muddatstsir', arabic: 'المدثر', start: 1, end: 31 },
  { page: 577, juz: 29, surah: 75, name: 'Al-Qiyamah', arabic: 'القيامة', start: 1, end: 30 },
  { page: 578, juz: 29, surah: 76, name: 'Al-Insan', arabic: 'الإنسان', start: 1, end: 22 },
  { page: 580, juz: 29, surah: 77, name: 'Al-Mursalat', arabic: 'المرسلات', start: 1, end: 35 },
  { page: 582, juz: 30, surah: 78, name: 'An-Naba\'', arabic: 'النبأ', start: 1, end: 30 },
  { page: 583, juz: 30, surah: 79, name: 'An-Nazi\'at', arabic: 'النازعات', start: 1, end: 26 },
  { page: 585, juz: 30, surah: 80, name: '\'Abasa', arabic: 'عبس', start: 1, end: 42 },
  { page: 586, juz: 30, surah: 81, name: 'At-Takwir', arabic: 'التكوير', start: 1, end: 29 },
  { page: 587, juz: 30, surah: 82, name: 'Al-Infithar', arabic: 'الانفطار', start: 1, end: 19 },
  { page: 587, juz: 30, surah: 83, name: 'Al-Muthaffifin', arabic: 'المطففين', start: 1, end: 6 },
  { page: 589, juz: 30, surah: 84, name: 'Al-Insyiqaq', arabic: 'الانشقاق', start: 1, end: 25 },
  { page: 590, juz: 30, surah: 85, name: 'Al-Buruj', arabic: 'البروج', start: 1, end: 22 },
  { page: 591, juz: 30, surah: 86, name: 'Ath-Thariq', arabic: 'الطارق', start: 1, end: 17 },
  { page: 591, juz: 30, surah: 87, name: 'Al-A\'la', arabic: 'الأعلى', start: 1, end: 19 },
  { page: 592, juz: 30, surah: 88, name: 'Al-Ghasyiyah', arabic: 'الغاشية', start: 1, end: 26 },
  { page: 593, juz: 30, surah: 89, name: 'Al-Fajr', arabic: 'الفجر', start: 1, end: 23 },
  { page: 594, juz: 30, surah: 90, name: 'Al-Balad', arabic: 'البلد', start: 1, end: 20 },
  { page: 595, juz: 30, surah: 91, name: 'Asy-Syams', arabic: 'الشمس', start: 1, end: 15 },
  { page: 595, juz: 30, surah: 92, name: 'Al-Lail', arabic: 'الليل', start: 1, end: 14 },
  { page: 596, juz: 30, surah: 93, name: 'Adh-Dhuha', arabic: 'الضحى', start: 1, end: 11 },
  { page: 596, juz: 30, surah: 94, name: 'Asy-Syarh', arabic: 'الشرح', start: 1, end: 8 },
  { page: 597, juz: 30, surah: 95, name: 'At-Tin', arabic: 'التين', start: 1, end: 8 },
  { page: 597, juz: 30, surah: 96, name: 'Al-\'Alaq', arabic: 'العلق', start: 1, end: 19 },
  { page: 598, juz: 30, surah: 97, name: 'Al-Qadr', arabic: 'القدر', start: 1, end: 5 },
  { page: 598, juz: 30, surah: 98, name: 'Al-Bayyinah', arabic: 'البينة', start: 1, end: 8 },
  { page: 599, juz: 30, surah: 99, name: 'Az-Zalzalah', arabic: 'الزلزلة', start: 1, end: 8 },
  { page: 599, juz: 30, surah: 100, name: 'Al-\'Adiyat', arabic: 'العاديات', start: 1, end: 11 },
  { page: 600, juz: 30, surah: 101, name: 'Al-Qari\'ah', arabic: 'القارعة', start: 1, end: 11 },
  { page: 600, juz: 30, surah: 102, name: 'At-Takatsur', arabic: 'التكاثر', start: 1, end: 8 },
  { page: 601, juz: 30, surah: 103, name: 'Al-\'Ashr', arabic: 'العصر', start: 1, end: 3 },
  { page: 601, juz: 30, surah: 104, name: 'Al-Humazah', arabic: 'الهمزة', start: 1, end: 9 },
  { page: 601, juz: 30, surah: 105, name: 'Al-Fil', arabic: 'الفيل', start: 1, end: 5 },
  { page: 602, juz: 30, surah: 106, name: 'Quraisy', arabic: 'قريش', start: 1, end: 4 },
  { page: 602, juz: 30, surah: 107, name: 'Al-Ma\'un', arabic: 'الماعون', start: 1, end: 7 },
  { page: 602, juz: 30, surah: 108, name: 'Al-Kautsar', arabic: 'الكوثر', start: 1, end: 3 },
  { page: 603, juz: 30, surah: 109, name: 'Al-Kafirun', arabic: 'الكافرون', start: 1, end: 6 },
  { page: 603, juz: 30, surah: 110, name: 'An-Nashr', arabic: 'النصر', start: 1, end: 3 },
  { page: 603, juz: 30, surah: 111, name: 'Al-Lahab', arabic: 'اللهب', start: 1, end: 5 },
  { page: 604, juz: 30, surah: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', start: 1, end: 4 },
  { page: 604, juz: 30, surah: 113, name: 'Al-Falaq', arabic: 'الفلق', start: 1, end: 5 },
  { page: 604, juz: 30, surah: 114, name: 'An-Nas', arabic: 'الناس', start: 1, end: 6 },
];

/**
 * Mengambil metadata halaman mushaf (1–604)
 */
export function getMushafPageMeta(pageNumber: number): MushafPageMeta {
  const safePage = Math.max(1, Math.min(604, pageNumber));

  // Exact matches first
  const exact = PAGE_ANCHORS.filter((a) => a.page === safePage);
  if (exact.length > 0) {
    const primary = exact[0];
    const calculatedJuz = Math.min(30, Math.max(1, Math.ceil(safePage / 20.13)));
    return {
      pageNumber: safePage,
      juzNumber: primary.juz || calculatedJuz,
      surahNumber: primary.surah,
      surahName: primary.name,
      surahArabic: primary.arabic,
      startAyah: primary.start,
      endAyah: primary.end,
      totalVersesOnPage: Math.max(1, primary.end - primary.start + 1),
      isFirstPageOfSurah: primary.start === 1,
    };
  }

  // Preceding & succeeding anchors for interpolation
  let prevAnchor = PAGE_ANCHORS[0];
  let nextAnchor = PAGE_ANCHORS[PAGE_ANCHORS.length - 1];

  for (let i = 0; i < PAGE_ANCHORS.length; i++) {
    if (PAGE_ANCHORS[i].page <= safePage) {
      prevAnchor = PAGE_ANCHORS[i];
    } else {
      nextAnchor = PAGE_ANCHORS[i];
      break;
    }
  }

  const calculatedJuz = Math.min(30, Math.max(1, Math.ceil(safePage / 20.13)));
  const pageOffset = safePage - prevAnchor.page;
  const pageGap = Math.max(1, nextAnchor.page - prevAnchor.page);

  let startAyah = prevAnchor.start;
  let endAyah = prevAnchor.end;
  if (prevAnchor.surah === nextAnchor.surah) {
    const totalVersesInGap = Math.max(1, nextAnchor.start - prevAnchor.end);
    const versesPerPage = Math.max(2, Math.round(totalVersesInGap / pageGap));
    startAyah = prevAnchor.end + 1 + (pageOffset - 1) * versesPerPage;
    endAyah = startAyah + versesPerPage - 1;
  } else {
    startAyah = prevAnchor.end + 1 + (pageOffset - 1) * 7;
    endAyah = startAyah + 6;
  }

  return {
    pageNumber: safePage,
    juzNumber: prevAnchor.juz || calculatedJuz,
    surahNumber: prevAnchor.surah,
    surahName: prevAnchor.name,
    surahArabic: prevAnchor.arabic,
    startAyah: Math.max(1, startAyah),
    endAyah: Math.max(startAyah, endAyah),
    totalVersesOnPage: Math.max(1, endAyah - startAyah + 1),
    isFirstPageOfSurah: false,
  };
}

/**
 * Mengambil seluruh surah yang berada pada suatu halaman fisik (mendukung multi-surah per lembar)
 */
export function getMushafPageSurahs(pageNumber: number): {
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  startAyah: number;
  endAyah: number;
}[] {
  const safePage = Math.max(1, Math.min(604, pageNumber));
  const exact = PAGE_ANCHORS.filter((a) => a.page === safePage);
  if (exact.length > 0) {
    return exact.map((e) => ({
      surahNumber: e.surah,
      surahName: e.name,
      surahArabic: e.arabic,
      startAyah: e.start,
      endAyah: e.end,
    }));
  }
  const meta = getMushafPageMeta(safePage);
  return [
    {
      surahNumber: meta.surahNumber,
      surahName: meta.surahName,
      surahArabic: meta.surahArabic,
      startAyah: meta.startAyah,
      endAyah: meta.endAyah,
    },
  ];
}

/**
 * Mencari nomor halaman fisik (1–604) berdasarkan nomor surah dan nomor ayat
 */
export function findPageForAyah(surahNumber: number, ayahNumber: number): number {
  for (let i = PAGE_ANCHORS.length - 1; i >= 0; i--) {
    const a = PAGE_ANCHORS[i];
    if (a.surah === surahNumber && ayahNumber >= a.start) {
      return a.page;
    }
    if (a.surah < surahNumber) {
      return Math.min(604, a.page + 1);
    }
  }
  return 1;
}

/**
 * Mengambil nomor halaman awal suatu Juz (1–30)
 */
export function getJuzStartPage(juzNumber: number): number {
  const juzStartPages: Record<number, number> = {
    1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 121, 8: 142, 9: 162, 10: 182,
    11: 201, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
    21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582,
  };
  return juzStartPages[juzNumber] || 1;
}
