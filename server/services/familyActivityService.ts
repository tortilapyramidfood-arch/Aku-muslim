/**
 * Family Activity Tracking & Parent Dashboard Service
 * AKU MUSLIM — PYRAMID GROUP
 * Memisahkan secara ketat durasi aktif layar vs audio latar belakang
 */

import { dbStore, type FamilyMember, type ActivitySession, type LearningGoal } from '../db/database.ts';

export class FamilyActivityService {
  /**
   * Catat Sesi Aktivitas Belajar
   * Wajib membedakan FOREGROUND_ACTIVE (waktu layar) vs BACKGROUND_AUDIO (murottal layar mati)
   */
  public recordSession(data: {
    userId: string;
    familyId?: string;
    profileId?: string;
    sessionType: 'FOREGROUND_ACTIVE' | 'BACKGROUND_AUDIO';
    activityCategory: 'QURAN_READING' | 'HIFZ_PRACTICE' | 'TAJWID_LESSON' | 'GAME_PLAY' | 'AUDIO_LISTENING';
    durationSeconds: number;
    surahNumber?: number;
    ayahNumber?: number;
    details?: Record<string, unknown>;
    devicePlatform: 'WEB' | 'ANDROID';
  }): ActivitySession {
    // Validasi durasi wajar (hindari durasi absurd > 12 jam akibat timer macet)
    const sanitizedDuration = Math.min(Math.max(1, data.durationSeconds), 43200);

    const session: ActivitySession = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      familyId: data.familyId,
      profileId: data.profileId,
      sessionType: data.sessionType,
      activityCategory: data.activityCategory,
      durationSeconds: sanitizedDuration,
      surahNumber: data.surahNumber,
      ayahNumber: data.ayahNumber,
      details: data.details,
      timestamp: new Date().toISOString(),
      devicePlatform: data.devicePlatform,
    };

    dbStore.addActivitySession(session);

    // Otomatis sinkronkan kemajuan ke Learning Goals jika ada
    if (data.familyId && data.profileId) {
      this.syncSessionToGoals(session);
    }

    return session;
  }

  /**
   * Sinkronisasi Progres Sesi Belajar ke Target Orang Tua
   */
  private syncSessionToGoals(session: ActivitySession) {
    if (session.sessionType !== 'FOREGROUND_ACTIVE') return;

    const goals = dbStore.getLearningGoals(session.familyId).filter((g) => g.profileId === session.profileId);
    const durationMinutes = Math.round(session.durationSeconds / 60);

    for (const goal of goals) {
      if (goal.goalType === 'QURAN_MINUTES' && session.activityCategory === 'QURAN_READING') {
        goal.currentValue += durationMinutes;
        if (goal.currentValue >= goal.targetValue) {
          goal.isAchieved = true;
        }
        dbStore.updateLearningGoal(goal.id, goal);
      } else if (goal.goalType === 'HIFZ_AYAHS' && session.activityCategory === 'HIFZ_PRACTICE') {
        const completedCount = Number(session.details?.completedAyahs || 1);
        goal.currentValue += completedCount;
        if (goal.currentValue >= goal.targetValue) {
          goal.isAchieved = true;
        }
        dbStore.updateLearningGoal(goal.id, goal);
      } else if (goal.goalType === 'TAJWID_LESSONS' && session.activityCategory === 'TAJWID_LESSON') {
        goal.currentValue += durationMinutes;
        if (goal.currentValue >= goal.targetValue) {
          goal.isAchieved = true;
        }
        dbStore.updateLearningGoal(goal.id, goal);
      }
    }
  }

  /**
   * Rekap Statistik Aktivitas Keluarga Berdasarkan Rentang Waktu
   */
  public getFamilySummary(familyId: string, days: number = 7) {
    const family = dbStore.getFamilies().find((f) => f.id === familyId);
    if (!family) {
      throw new Error(`Data keluarga #${familyId} tidak ditemukan.`);
    }

    const members = dbStore.getFamilyMembers(familyId);
    const allSessions = dbStore.getActivitySessions();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantSessions = allSessions.filter(
      (s) => s.familyId === familyId && new Date(s.timestamp) >= cutoffDate
    );

    // 1. Durasi Total Aktif Layar (HANYA FOREGROUND_ACTIVE, tidak termasuk audio background)
    const activeScreenSessions = relevantSessions.filter((s) => s.sessionType === 'FOREGROUND_ACTIVE');
    const totalActiveSeconds = activeScreenSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    const quranSessions = activeScreenSessions.filter((s) => s.activityCategory === 'QURAN_READING');
    const quranSeconds = quranSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    const hifzSessions = activeScreenSessions.filter((s) => s.activityCategory === 'HIFZ_PRACTICE');
    const hifzSeconds = hifzSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    const tajwidSessions = activeScreenSessions.filter((s) => s.activityCategory === 'TAJWID_LESSON');
    const tajwidSeconds = tajwidSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    const gameSessions = activeScreenSessions.filter((s) => s.activityCategory === 'GAME_PLAY');
    const gameSeconds = gameSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    // 2. Durasi Terpisah Audio Latar Belakang (Murottal Layar Mati)
    const backgroundAudioSessions = relevantSessions.filter((s) => s.sessionType === 'BACKGROUND_AUDIO');
    const backgroundAudioSeconds = backgroundAudioSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    // 3. Ringkasan Per Anggota Keluarga
    const memberStats = members.map((member) => {
      const hasConsent = member.shareActivityConsent !== false;
      const memberSessions = hasConsent
        ? activeScreenSessions.filter((s) => s.profileId === member.id)
        : [];
      const memberQuran = memberSessions.filter((s) => s.activityCategory === 'QURAN_READING').reduce((a, s) => a + s.durationSeconds, 0);
      const memberHifz = memberSessions.filter((s) => s.activityCategory === 'HIFZ_PRACTICE').reduce((a, s) => a + s.durationSeconds, 0);
      const memberTajwid = memberSessions.filter((s) => s.activityCategory === 'TAJWID_LESSON').reduce((a, s) => a + s.durationSeconds, 0);
      const memberTotal = memberSessions.reduce((a, s) => a + s.durationSeconds, 0);

      const goals = hasConsent
        ? dbStore.getLearningGoals(familyId).filter((g) => g.profileId === member.id)
        : [];
      const achievedGoals = goals.filter((g) => g.isAchieved).length;

      return {
        memberId: member.id,
        name: member.profileName,
        role: member.role,
        avatar: member.avatar,
        ageGroup: member.ageGroup,
        shareActivityConsent: hasConsent,
        totalActiveMinutes: Math.round(memberTotal / 60),
        quranMinutes: Math.round(memberQuran / 60),
        hifzMinutes: Math.round(memberHifz / 60),
        tajwidMinutes: Math.round(memberTajwid / 60),
        goalsCount: goals.length,
        achievedGoalsCount: achievedGoals,
      };
    });

    return {
      familyId,
      familyName: family.familyName,
      periodDays: days,
      totals: {
        totalActiveMinutes: Math.round(totalActiveSeconds / 60),
        quranMinutes: Math.round(quranSeconds / 60),
        hifzMinutes: Math.round(hifzSeconds / 60),
        tajwidMinutes: Math.round(tajwidSeconds / 60),
        gameMinutes: Math.round(gameSeconds / 60),
        backgroundAudioMinutes: Math.round(backgroundAudioSeconds / 60), // Terpisah secara jujur!
      },
      memberStats,
      goals: dbStore.getLearningGoals(familyId),
    };
  }

  /**
   * Tambah Profil Anggota Keluarga Baru
   * Memvalidasi batas maksimum profil (default 5, dapat diubah Owner)
   */
  public addMember(familyId: string, profile: { name: string; role: 'PARENT' | 'CHILD' | 'MEMBER'; ageGroup: 'ANAK' | 'REMAJA' | 'DEWASA'; avatar: string }): FamilyMember {
    const family = dbStore.getFamilies().find((f) => f.id === familyId);
    if (!family) throw new Error('Data keluarga tidak ditemukan.');

    const currentMembers = dbStore.getFamilyMembers(familyId);
    if (currentMembers.length >= family.maxMembers) {
      throw new Error(`Batas maksimum ${family.maxMembers} profil keluarga telah tercapai. Hubungi Owner untuk upgrade kuota.`);
    }

    const isAdult = profile.ageGroup === 'DEWASA';

    const newMember: FamilyMember = {
      id: `mem_${Date.now()}`,
      familyId,
      profileName: profile.name,
      role: profile.role,
      avatar: profile.avatar || '👤',
      ageGroup: profile.ageGroup,
      shareActivityConsent: !isAdult,
      deviceSyncStatus: isAdult ? 'PENDING' : 'SYNCED',
      lastActiveAt: new Date().toISOString(),
    };

    dbStore.addFamilyMember(newMember);
    return newMember;
  }
}

export const familyActivityService = new FamilyActivityService();
