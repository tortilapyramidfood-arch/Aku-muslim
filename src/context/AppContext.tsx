import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppMode,
  AppSettings,
  CityLocation,
  FamilyMember,
  LastReadProgress,
  MemorizationTarget,
  NextPrayerInfo,
  OwnerAnnouncement,
  PrayerTimes,
  QuranBookmark,
} from '../types';
import { DEFAULT_CITY, calculatePrayerTimes, getNextPrayerInfo } from '../services/prayerTimeService';
import { storageService } from '../services/storageService';
import { adzanScheduler } from '../services/adzanScheduler';
import { AuthenticatedUser, ownerAuthService } from '../services/ownerAuthService';
import { clientSubscriptionService, UserEntitlement, hasFeatureAccess } from '../services/subscriptionService';

interface AppContextType {
  activeTab: 'beranda' | 'quran' | 'ibadah' | 'belajar' | 'profil';
  setActiveTab: (tab: 'beranda' | 'quran' | 'ibadah' | 'belajar' | 'profil') => void;

  mode: AppMode;
  setMode: (mode: AppMode) => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;

  selectedCity: CityLocation;
  setSelectedCity: (city: CityLocation) => void;
  requestGPSLocation: () => Promise<boolean>;

  prayerTimes: PrayerTimes;
  nextPrayer: NextPrayerInfo;

  bookmarks: QuranBookmark[];
  addBookmark: (surahNumber: number, surahName: string, ayahNumber: number, note?: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;

  lastRead: LastReadProgress;
  updateLastRead: (surahNumber: number, surahName: string, ayahNumber: number) => void;

  familyMembers: FamilyMember[];
  updateFamilyMembers: (members: FamilyMember[]) => void;

  memorizationTargets: MemorizationTarget[];
  updateMemorizationStatus: (id: string, status: 'belum' | 'sedang' | 'selesai', progressCount?: number) => void;

  announcements: OwnerAnnouncement[];
  dismissAnnouncement: (id: string) => void;

  showQiblaModal: boolean;
  setShowQiblaModal: (show: boolean) => void;

  showCalendarModal: boolean;
  setShowCalendarModal: (show: boolean) => void;

  showOwnerDashboard: boolean;
  setShowOwnerDashboard: (show: boolean) => void;

  showQualityGate: boolean;
  setShowQualityGate: (show: boolean) => void;

  showPremiumModal: boolean;
  setShowPremiumModal: (show: boolean) => void;

  showFamilyDashboard: boolean;
  setShowFamilyDashboard: (show: boolean) => void;

  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;

  isOwnerAuthenticated: boolean;
  ownerUser: AuthenticatedUser | null;
  refreshOwnerSession: () => Promise<AuthenticatedUser | null>;
  logoutOwnerSession: () => Promise<void>;

  userEntitlement: UserEntitlement;
  refreshEntitlement: () => Promise<UserEntitlement>;
  hasFeatureAccess: (featureKey: string) => boolean;

  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(() => storageService.getSettings());
  const [activeTab, setActiveTab] = useState<'beranda' | 'quran' | 'ibadah' | 'belajar' | 'profil'>('beranda');
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => storageService.getBookmarks());
  const [lastRead, setLastRead] = useState<LastReadProgress>(() => storageService.getLastRead());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => storageService.getFamilyMembers());
  const [memorizationTargets, setMemorizationTargets] = useState<MemorizationTarget[]>(() => storageService.getMemorizationTargets());
  const [announcements, setAnnouncements] = useState<OwnerAnnouncement[]>(() => storageService.getAnnouncements());

  const [showQiblaModal, setShowQiblaModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [showQualityGate, setShowQualityGate] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showFamilyDashboard, setShowFamilyDashboard] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [ownerUser, setOwnerUser] = useState<AuthenticatedUser | null>(() => ownerAuthService.getCurrentUser());
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => ownerAuthService.getCurrentUser()?.role === 'OWNER');

  const refreshOwnerSession = async (): Promise<AuthenticatedUser | null> => {
    try {
      const user = await ownerAuthService.checkSession();
      setOwnerUser(user);
      setIsOwnerAuthenticated(user?.role === 'OWNER');
      return user;
    } catch {
      setOwnerUser(null);
      setIsOwnerAuthenticated(false);
      return null;
    }
  };

  const logoutOwnerSession = async (): Promise<void> => {
    await ownerAuthService.logout();
    setOwnerUser(null);
    setIsOwnerAuthenticated(false);
  };

  const [userEntitlement, setUserEntitlement] = useState<UserEntitlement>({
    isPremium: false,
    status: 'FREE',
    planId: 'plan_gratis',
    planName: 'AKU MUSLIM Gratis',
    familyMaxProfiles: 1,
    allowedFeatures: [
      'quran_30_juz',
      'prayer_times_adzan',
      'qibla_compass',
      'dua_dhikr_tasbih',
      'zakat_calculator',
      'murottal_offline_basic',
      'hifz_basic',
      'tajwid_basic',
    ],
  });

  const refreshEntitlement = async (): Promise<UserEntitlement> => {
    try {
      const ent = await clientSubscriptionService.getMyEntitlement();
      setUserEntitlement(ent);
      return ent;
    } catch {
      return userEntitlement;
    }
  };

  const checkFeature = (featureKey: string): boolean => {
    return hasFeatureAccess(userEntitlement, featureKey);
  };

  useEffect(() => {
    refreshOwnerSession();
    refreshEntitlement();
  }, []);

  // Sync theme with document classList (remove any legacy lansia-mode class)
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.classList.remove('lansia-mode');
  }, [settings.theme, settings.mode]);

  // Real-time prayer times and countdown
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCity = settings.selectedCity || DEFAULT_CITY;
  const prayerTimes = calculatePrayerTimes(currentTime, activeCity);
  const nextPrayer = getNextPrayerInfo(prayerTimes, currentTime);

  // Sinkronisasi jadwal adzan otomatis ke AlarmManager native OS & web foreground watcher
  useEffect(() => {
    adzanScheduler.syncDailySchedule(
      prayerTimes,
      activeCity,
      settings.notificationEnabled,
      settings.adzanSound
    );
  }, [
    prayerTimes.date,
    activeCity.id,
    settings.notificationEnabled,
    settings.adzanSound,
  ]);

  useEffect(() => {
    adzanScheduler.checkAndTriggerForeground(
      prayerTimes,
      activeCity,
      settings.notificationEnabled,
      settings.adzanSound
    );
  }, [currentTime.getMinutes(), prayerTimes.date, activeCity.id, settings.adzanSound, settings.notificationEnabled]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    const normalizedPartial =
      partial.mode && partial.mode !== 'anak' ? { ...partial, mode: 'umum' as AppMode } : partial;
    const updated = { ...settings, ...normalizedPartial };
    setSettingsState(updated);
    storageService.saveSettings(updated);
  };

  const setMode = (mode: AppMode) => {
    updateSettings({ mode: mode === 'anak' ? 'anak' : 'umum' });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
  };

  const setFontSize = (fontSize: 'normal' | 'large' | 'xlarge') => {
    updateSettings({ fontSize });
  };

  const setSelectedCity = (city: CityLocation) => {
    updateSettings({ selectedCity: city });
  };

  const requestGPSLocation = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return false;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Determine approximate Indonesian timezone
          let tz: 'WIB' | 'WITA' | 'WIT' = 'WIB';
          let offset = 7;
          if (lon >= 115 && lon < 125) {
            tz = 'WITA';
            offset = 8;
          } else if (lon >= 125) {
            tz = 'WIT';
            offset = 9;
          }

          const gpsCity: CityLocation = {
            id: 'gps_current',
            name: 'Lokasi Perangkat (GPS)',
            province: 'Koordinat Akurat',
            latitude: lat,
            longitude: lon,
            timezone: tz,
            utcOffset: offset,
          };

          setSelectedCity(gpsCity);
          resolve(true);
        },
        () => {
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const addBookmark = (surahNumber: number, surahName: string, ayahNumber: number, note?: string) => {
    const newBm: QuranBookmark = {
      id: `bm_${Date.now()}`,
      surahNumber,
      surahName,
      ayahNumber,
      createdAt: new Date().toISOString(),
      note,
    };
    const updated = [newBm, ...bookmarks];
    setBookmarks(updated);
    storageService.saveBookmarks(updated);
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    storageService.saveBookmarks(updated);
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number): boolean => {
    return bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  };

  const updateLastRead = (surahNumber: number, surahName: string, ayahNumber: number) => {
    const progress: LastReadProgress = {
      surahNumber,
      surahName,
      ayahNumber,
      updatedAt: new Date().toISOString(),
    };
    setLastRead(progress);
    storageService.saveLastRead(progress);
  };

  const updateFamilyMembers = (members: FamilyMember[]) => {
    setFamilyMembers(members);
    storageService.saveFamilyMembers(members);
  };

  const updateMemorizationStatus = (id: string, status: 'belum' | 'sedang' | 'selesai', progressCount?: number) => {
    const updated = memorizationTargets.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          memorizedAyahCount: progressCount !== undefined ? progressCount : item.memorizedAyahCount,
          lastReviewed: 'Hari ini',
        };
      }
      return item;
    });
    setMemorizationTargets(updated);
    storageService.saveMemorizationTargets(updated);
  };

  const dismissAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    storageService.saveAnnouncements(updated);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        mode: settings.mode,
        setMode,
        theme: settings.theme === 'dark' ? 'dark' : 'light',
        setTheme,
        fontSize: settings.fontSize,
        setFontSize,
        selectedCity: settings.selectedCity || DEFAULT_CITY,
        setSelectedCity,
        requestGPSLocation,
        prayerTimes,
        nextPrayer,
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        lastRead,
        updateLastRead,
        familyMembers,
        updateFamilyMembers,
        memorizationTargets,
        updateMemorizationStatus,
        announcements,
        dismissAnnouncement,
        showQiblaModal,
        setShowQiblaModal,
        showCalendarModal,
        setShowCalendarModal,
        showOwnerDashboard,
        setShowOwnerDashboard,
        showQualityGate,
        setShowQualityGate,
        showPremiumModal,
        setShowPremiumModal,
        showFamilyDashboard,
        setShowFamilyDashboard,
        showSettingsModal,
        setShowSettingsModal,
        isOwnerAuthenticated,
        ownerUser,
        refreshOwnerSession,
        logoutOwnerSession,
        userEntitlement,
        refreshEntitlement,
        hasFeatureAccess: checkFeature,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
