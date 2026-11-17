import {
  AppSettings,
  FamilyMember,
  LastReadProgress,
  MemorizationTarget,
  OwnerAnnouncement,
  QuranBookmark,
} from '../types';
import { DEFAULT_CITY } from './prayerTimeService';

const STORAGE_KEYS = {
  SETTINGS: 'akumuslim_settings_v1',
  BOOKMARKS: 'akumuslim_bookmarks_v1',
  LAST_READ: 'akumuslim_last_read_v1',
  FAMILY_MEMBERS: 'akumuslim_family_v1',
  MEMORIZATION: 'akumuslim_memorization_v1',
  ANNOUNCEMENTS: 'akumuslim_announcements_v1',
  TASBIH_COUNT: 'akumuslim_tasbih_v1',
  COMPLETED_QUIZZES: 'akumuslim_quizzes_v1',
};

export const defaultSettings: AppSettings = {
  mode: 'umum',
  theme: 'light',
  fontSize: 'normal',
  selectedCity: DEFAULT_CITY,
  notificationEnabled: {
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true,
  },
  adzanSound: 'makkah',
  audioReciter: 'Mishary Rashid Alafasy',
  parentPin: '1234',
  parentPinEnabled: false,
};

export const defaultFamilyMembers: FamilyMember[] = [
  {
    id: 'parent_1',
    name: 'Abi Hasan',
    role: 'wali',
    memberType: 'dewasa',
    avatar: '👨',
    completedQuizzes: 4,
    memorizedSurahs: 12,
    dailyGoalMinutes: 20,
    consentStatus: 'active',
    shareSettings: {
      hasilKuis: true,
      hafalan: true,
      tajwid: true,
      bacaanQuran: true,
    },
    learningPoints: 180,
    learningNotes: [
      {
        id: 'note_p1',
        category: 'bacaanQuran',
        title: 'Tadarus QS. Al-Kahfi (Hal. 293–296)',
        detail: 'Membaca 4 halaman dengan tartil.',
        pointsEarned: 40,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'note_p2',
        category: 'tajwid',
        title: 'Latihan Mad Wajib & Jaiz',
        detail: 'Menyelesaikan modul hukum mad panjang 4-5 harakat.',
        pointsEarned: 30,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'child_1',
    name: 'Ahmad',
    role: 'anak',
    memberType: 'anak',
    age: 8,
    avatar: '👦',
    completedQuizzes: 6,
    memorizedSurahs: 5,
    dailyGoalMinutes: 15,
    consentStatus: 'active',
    shareSettings: {
      hasilKuis: true,
      hafalan: true,
      tajwid: true,
      bacaanQuran: true,
    },
    learningPoints: 240,
    learningNotes: [
      {
        id: 'note_c1',
        category: 'hasilKuis',
        title: 'Kuis Islami: Rukun Wudhu & Sholat',
        detail: 'Skor 90/100 pada kuis fiqih ibadah.',
        pointsEarned: 90,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'note_c2',
        category: 'hafalan',
        title: 'Smart Hifz: Surah Al-Ikhlas (4 Ayat)',
        detail: 'Lancar menyambung seluruh ayat.',
        pointsEarned: 50,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'child_2',
    name: 'Fatimah',
    role: 'anak',
    memberType: 'anak',
    age: 6,
    avatar: '👧',
    completedQuizzes: 3,
    memorizedSurahs: 3,
    dailyGoalMinutes: 10,
    consentStatus: 'active',
    shareSettings: {
      hasilKuis: true,
      hafalan: true,
      tajwid: true,
      bacaanQuran: true,
    },
    learningPoints: 150,
    learningNotes: [
      {
        id: 'note_f1',
        category: 'tajwid',
        title: 'Iqra Jilid 2 · Huruf Bersambung',
        detail: 'Melafalkan 12 kata dasar berharakat fathah & kasrah.',
        pointsEarned: 45,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },
];

export const defaultAnnouncements: OwnerAnnouncement[] = [
  {
    id: 'ann_1',
    title: 'Selamat Datang di AKU MUSLIM',
    message: 'Aplikasi sahabat ibadah harian Anda. Seluruh fitur ibadah gratis selamanya tanpa iklan mengganggu.',
    type: 'info',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

class StorageService {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        const normalizedMode = parsed.mode === 'anak' ? 'anak' : 'umum';
        return { ...defaultSettings, ...parsed, mode: normalizedMode };
      }
    } catch {
      // Fallback
    }
    return defaultSettings;
  }

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }

  getBookmarks(): QuranBookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'bm_1',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        ayahNumber: 1,
        createdAt: new Date().toISOString(),
        note: 'Pembuka Al-Qur\'an',
      },
      {
        id: 'bm_2',
        surahNumber: 36,
        surahName: 'Yasin',
        ayahNumber: 1,
        createdAt: new Date().toISOString(),
        note: 'Surah Yasin',
      },
    ];
  }

  saveBookmarks(bookmarks: QuranBookmark[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch {
      // Ignore
    }
  }

  getLastRead(): LastReadProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_READ);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      ayahNumber: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  saveLastRead(progress: LastReadProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(progress));
    } catch {
      // Ignore
    }
  }

  getFamilyMembers(): FamilyMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return defaultFamilyMembers;
  }

  saveFamilyMembers(members: FamilyMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
    } catch {
      // Ignore
    }
  }

  getMemorizationTargets(): MemorizationTarget[] {
    const DEFAULT_JUZ_30_TARGETS: MemorizationTarget[] = [
      { id: 'mem_78', surahNumber: 78, surahName: "An-Naba'", targetAyahCount: 40, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_79', surahNumber: 79, surahName: "An-Nazi'at", targetAyahCount: 46, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_80', surahNumber: 80, surahName: "'Abasa", targetAyahCount: 42, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_81', surahNumber: 81, surahName: 'At-Takwir', targetAyahCount: 29, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_82', surahNumber: 82, surahName: 'Al-Infitar', targetAyahCount: 19, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_83', surahNumber: 83, surahName: 'Al-Mutaffifin', targetAyahCount: 36, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_84', surahNumber: 84, surahName: 'Al-Insyiqaq', targetAyahCount: 25, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_85', surahNumber: 85, surahName: 'Al-Buruj', targetAyahCount: 22, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_86', surahNumber: 86, surahName: 'At-Tariq', targetAyahCount: 17, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_87', surahNumber: 87, surahName: "Al-A'la", targetAyahCount: 19, memorizedAyahCount: 19, status: 'selesai', lastReviewed: '3 hari lalu', assignedTo: 'Ahmad' },
      { id: 'mem_88', surahNumber: 88, surahName: 'Al-Ghasyiyah', targetAyahCount: 26, memorizedAyahCount: 10, status: 'sedang', lastReviewed: 'Kemarin', assignedTo: 'Ahmad' },
      { id: 'mem_89', surahNumber: 89, surahName: 'Al-Fajr', targetAyahCount: 30, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_90', surahNumber: 90, surahName: 'Al-Balad', targetAyahCount: 20, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_91', surahNumber: 91, surahName: 'Asy-Syams', targetAyahCount: 15, memorizedAyahCount: 15, status: 'murajaah', lastReviewed: 'Hari ini', assignedTo: 'Fatimah' },
      { id: 'mem_92', surahNumber: 92, surahName: 'Al-Lail', targetAyahCount: 21, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_93', surahNumber: 93, surahName: 'Ad-Duha', targetAyahCount: 11, memorizedAyahCount: 11, status: 'selesai', lastReviewed: 'Kemarin', assignedTo: 'Fatimah' },
      { id: 'mem_94', surahNumber: 94, surahName: 'Asy-Syarh', targetAyahCount: 8, memorizedAyahCount: 8, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Ahmad' },
      { id: 'mem_95', surahNumber: 95, surahName: 'At-Tin', targetAyahCount: 8, memorizedAyahCount: 8, status: 'selesai', lastReviewed: 'Kemarin', assignedTo: 'Fatimah' },
      { id: 'mem_96', surahNumber: 96, surahName: "Al-'Alaq", targetAyahCount: 19, memorizedAyahCount: 5, status: 'sedang', lastReviewed: '2 hari lalu', assignedTo: 'Ahmad' },
      { id: 'mem_97', surahNumber: 97, surahName: 'Al-Qadr', targetAyahCount: 5, memorizedAyahCount: 5, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Fatimah' },
      { id: 'mem_98', surahNumber: 98, surahName: 'Al-Bayyinah', targetAyahCount: 8, memorizedAyahCount: 0, status: 'belum', lastReviewed: '-' },
      { id: 'mem_99', surahNumber: 99, surahName: 'Az-Zalzalah', targetAyahCount: 8, memorizedAyahCount: 8, status: 'selesai', lastReviewed: 'Kemarin', assignedTo: 'Ahmad' },
      { id: 'mem_100', surahNumber: 100, surahName: "Al-'Adiyat", targetAyahCount: 11, memorizedAyahCount: 11, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Ahmad' },
      { id: 'mem_101', surahNumber: 101, surahName: "Al-Qari'ah", targetAyahCount: 11, memorizedAyahCount: 11, status: 'selesai', lastReviewed: '2 hari lalu', assignedTo: 'Fatimah' },
      { id: 'mem_102', surahNumber: 102, surahName: 'At-Takasur', targetAyahCount: 8, memorizedAyahCount: 8, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Fatimah' },
      { id: 'mem_103', surahNumber: 103, surahName: "Al-'Asr", targetAyahCount: 3, memorizedAyahCount: 3, status: 'murajaah', lastReviewed: 'Hari ini', assignedTo: 'Ahmad' },
      { id: 'mem_104', surahNumber: 104, surahName: 'Al-Humazah', targetAyahCount: 9, memorizedAyahCount: 9, status: 'selesai', lastReviewed: 'Kemarin', assignedTo: 'Fatimah' },
      { id: 'mem_105', surahNumber: 105, surahName: 'Al-Fil', targetAyahCount: 5, memorizedAyahCount: 5, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Ahmad' },
      { id: 'mem_106', surahNumber: 106, surahName: 'Quraisy', targetAyahCount: 4, memorizedAyahCount: 4, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Fatimah' },
      { id: 'mem_107', surahNumber: 107, surahName: "Al-Ma'un", targetAyahCount: 7, memorizedAyahCount: 7, status: 'selesai', lastReviewed: 'Kemarin', assignedTo: 'Ahmad' },
      { id: 'mem_108', surahNumber: 108, surahName: 'Al-Kausar', targetAyahCount: 3, memorizedAyahCount: 3, status: 'murajaah', lastReviewed: 'Hari ini', assignedTo: 'Ahmad' },
      { id: 'mem_109', surahNumber: 109, surahName: 'Al-Kafirun', targetAyahCount: 6, memorizedAyahCount: 6, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Fatimah' },
      { id: 'mem_110', surahNumber: 110, surahName: 'An-Nasr', targetAyahCount: 3, memorizedAyahCount: 3, status: 'selesai', lastReviewed: 'Kemarin', assignedTo: 'Ahmad' },
      { id: 'mem_111', surahNumber: 111, surahName: 'Al-Masad', targetAyahCount: 5, memorizedAyahCount: 5, status: 'selesai', lastReviewed: 'Hari ini', assignedTo: 'Fatimah' },
      { id: 'mem_112', surahNumber: 112, surahName: 'Al-Ikhlas', targetAyahCount: 4, memorizedAyahCount: 4, status: 'murajaah', lastReviewed: 'Hari ini', assignedTo: 'Fatimah' },
      { id: 'mem_113', surahNumber: 113, surahName: 'Al-Falaq', targetAyahCount: 5, memorizedAyahCount: 5, status: 'murajaah', lastReviewed: 'Hari ini', assignedTo: 'Ahmad' },
      { id: 'mem_114', surahNumber: 114, surahName: 'An-Nas', targetAyahCount: 6, memorizedAyahCount: 6, status: 'murajaah', lastReviewed: 'Hari ini', assignedTo: 'Ahmad' },
    ];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIZATION);
      if (data) {
        const parsed: MemorizationTarget[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= 37) {
          return parsed;
        }
        // Merge stored progress with the full 37 surahs
        const storedMap = new Map(parsed.map((item) => [item.surahNumber, item]));
        return DEFAULT_JUZ_30_TARGETS.map((def) => storedMap.get(def.surahNumber) || def);
      }
    } catch {
      // Fallback
    }

    return DEFAULT_JUZ_30_TARGETS;
  }

  saveMemorizationTargets(targets: MemorizationTarget[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIZATION, JSON.stringify(targets));
    } catch {
      // Ignore
    }
  }

  getAnnouncements(): OwnerAnnouncement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return defaultAnnouncements;
  }

  saveAnnouncements(ann: OwnerAnnouncement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(ann));
    } catch {
      // Ignore
    }
  }

  getTasbihCount(): { count: number; target: number; phraseIndex: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASBIH_COUNT);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return { count: 0, target: 33, phraseIndex: 0 };
  }

  saveTasbihCount(data: { count: number; target: number; phraseIndex: number }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASBIH_COUNT, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

export const storageService = new StorageService();
