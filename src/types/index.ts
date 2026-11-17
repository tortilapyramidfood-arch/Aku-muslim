export type AppMode = 'umum' | 'anak';

export type ActiveTab = 'beranda' | 'quran' | 'ibadah' | 'belajar' | 'profil';

export interface CityLocation {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
  timezone: 'WIB' | 'WITA' | 'WIT';
  utcOffset: number; // in hours, e.g. 7, 8, 9
  elevationMeters?: number;
}

export interface PrayerTimes {
  date: string; // YYYY-MM-DD
  imsak: string; // HH:mm
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  fajr?: string;
  sunrise?: string;
  dhuhr?: string;
  asr?: string;
  isha?: string;
}

export interface NextPrayerInfo {
  name: 'Subuh' | 'Terbit' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya' | 'Imsak';
  time: string;
  remainingSeconds: number;
  remainingFormatted: string;
  isPassed: boolean;
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameLatin: string;
  nameTranslation: string;
  revelationType: 'Makkiyah' | 'Madaniyah';
  numberOfAyahs: number;
  juzNumber: number;
}

export interface Ayah {
  numberInSurah: number;
  numberInQuran: number;
  textArabic: string;
  textLatin: string;
  textTranslation: string;
  tafsirSummary?: string;
  juz: number;
  audioUrl?: string;
  surahNumber?: number;
  surahName?: string;
  surahArabic?: string;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  createdAt: string;
  note?: string;
}

export interface LastReadProgress {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  itemCount: number;
}

export interface DuaItem {
  id: string;
  categoryId: string;
  title: string;
  arabic: string;
  latin?: string;
  translation: string;
  source: string;
  repetition?: number;
  virtue?: string;
  contextNote?: string;
  orderNumber?: number;
  audioUrl?: string;
}

export interface HijaiyahLetter {
  id: number;
  arabic: string;
  name: string;
  makhraj: string;
  transliteration: string;
  fathah: string;
  kasrah: string;
  dhammah: string;
  soundCue: string;
}

export interface TajwidRule {
  id: string;
  title: string;
  arabicTitle: string;
  category: string;
  description: string;
  exampleArabic: string;
  exampleLatin: string;
  howToRead: string;
}

export interface MemorizationTarget {
  id: string;
  surahNumber: number;
  surahName: string;
  targetAyahCount: number;
  memorizedAyahCount: number;
  status: 'belum' | 'sedang' | 'selesai' | 'murajaah';
  lastReviewed: string;
  assignedTo?: string;
}

export type FamilyShareCategory = 'hasilKuis' | 'hafalan' | 'tajwid' | 'bacaanQuran';

export interface FamilyLearningNote {
  id: string;
  category: FamilyShareCategory;
  title: string;
  detail: string;
  pointsEarned: number; // Strictly derived from quiz/learning activity, never piety/sin judgment
  createdAt: string; // ISO string
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'ayah' | 'ibu' | 'anak' | 'wali' | 'dewasa';
  memberType?: 'anak' | 'dewasa';
  age?: number;
  avatar: string;
  completedQuizzes: number;
  memorizedSurahs: number;
  dailyGoalMinutes: number;
  consentStatus?: 'active' | 'pending_invite' | 'declined';
  inviteCode?: string;
  shareSettings?: {
    hasilKuis: boolean;
    hafalan: boolean;
    tajwid: boolean;
    bacaanQuran: boolean;
  };
  learningPoints?: number;
  learningNotes?: FamilyLearningNote[];
}

export interface MuhasabahEntry {
  id: string;
  date: string; // YYYY-MM-DD
  inginDiperbaiki: string;
  niatPerbaikan: string;
  langkahKebaikan: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'kisah_nabi' | 'sholat' | 'akhlak' | 'hijaiyah';
}

export interface ProphetStory {
  id: number;
  name: string;
  title: string;
  arabicName: string;
  period: string;
  summary: string;
  moralLesson: string;
}

export interface OwnerAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'important' | 'event';
  isActive: boolean;
  createdAt: string;
}

export interface ContentAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  details: string;
}

export interface AppSettings {
  mode: AppMode;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'large' | 'xlarge';
  selectedCity: CityLocation;
  notificationEnabled: {
    subuh: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  adzanSound: 'makkah' | 'madinah' | 'beep' | 'silent';
  audioReciter: string;
  parentPin: string;
  parentPinEnabled: boolean;
}
