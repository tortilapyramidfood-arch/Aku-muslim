/**
 * AKU MUSLIM — Family Dashboard & Activity Tracking Routes
 * PYRAMID GROUP
 */

import { Router, type Request, type Response } from 'express';
import { dbStore, type LearningGoal } from '../db/database.ts';
import { familyActivityService } from '../services/familyActivityService.ts';

export const familyRouter = Router();

// 1. Ringkasan Aktivitas Keluarga (Hari Ini, 7 Hari, 30 Hari)
familyRouter.get('/summary', (req: Request, res: Response) => {
  const familyId = (req.query.familyId as string) || 'fam_demo_1';
  const days = Number(req.query.days) || 7;

  try {
    const family = dbStore.getFamilies().find((f) => f.id === familyId);
    if (!family) {
      return res.status(404).json({ error: `Akses ditolak: Data keluarga #${familyId} tidak ditemukan atau Anda tidak memiliki izin.` });
    }

    const summary = familyActivityService.getFamilySummary(familyId, days);
    res.json(summary);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// 2. Daftar Anggota Keluarga
familyRouter.get('/members', (req: Request, res: Response) => {
  const familyId = (req.query.familyId as string) || 'fam_demo_1';
  const family = dbStore.getFamilies().find((f) => f.id === familyId);

  if (!family) {
    return res.status(404).json({ error: `Keluarga #${familyId} tidak ditemukan atau akses tidak diizinkan.` });
  }

  const members = dbStore.getFamilyMembers(familyId);

  res.json({
    familyId,
    familyName: family.familyName,
    maxMembers: family.maxMembers || 5,
    members,
  });
});

// 3. Tambah Anggota Keluarga (Validasi Batas Profil)
familyRouter.post('/members', (req: Request, res: Response) => {
  const { familyId, name, role, ageGroup, avatar } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama anggota keluarga wajib diisi.' });

  try {
    const member = familyActivityService.addMember(familyId || 'fam_demo_1', {
      name: name.trim(),
      role: role || 'CHILD',
      ageGroup: ageGroup || 'ANAK',
      avatar: avatar || '👦',
    });
    res.status(201).json({ success: true, member });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Hapus Anggota Profil
familyRouter.delete('/members/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbStore.removeFamilyMember(id);
  res.json({ success: true });
});

// 5. Catat Sesi Aktivitas (Membedakan Foreground vs Background Audio)
familyRouter.post('/activity', (req: Request, res: Response) => {
  const { userId, familyId, profileId, sessionType, activityCategory, durationSeconds, surahNumber, ayahNumber, details, devicePlatform } = req.body;

  if (!activityCategory || !durationSeconds) {
    return res.status(400).json({ error: 'Kategori aktivitas dan durasi detik wajib disertakan.' });
  }

  const session = familyActivityService.recordSession({
    userId: userId || 'usr_guest_demo',
    familyId: familyId || 'fam_demo_1',
    profileId,
    sessionType: sessionType === 'BACKGROUND_AUDIO' ? 'BACKGROUND_AUDIO' : 'FOREGROUND_ACTIVE',
    activityCategory,
    durationSeconds: Number(durationSeconds),
    surahNumber: surahNumber ? Number(surahNumber) : undefined,
    ayahNumber: ayahNumber ? Number(ayahNumber) : undefined,
    details: details || {},
    devicePlatform: devicePlatform === 'ANDROID' ? 'ANDROID' : 'WEB',
  });

  res.status(201).json({ success: true, session });
});

// 6. Target Belajar Anak
familyRouter.get('/goals', (req: Request, res: Response) => {
  const familyId = (req.query.familyId as string) || 'fam_demo_1';
  const goals = dbStore.getLearningGoals(familyId);
  res.json(goals);
});

familyRouter.post('/goals', (req: Request, res: Response) => {
  const { familyId, profileId, title, goalType, targetValue, period, rewardPraise } = req.body;

  if (!title || !goalType || !targetValue) {
    return res.status(400).json({ error: 'Judul target, jenis, dan nilai target wajib diisi.' });
  }

  const goal: LearningGoal = {
    id: `goal_${Date.now()}`,
    familyId: familyId || 'fam_demo_1',
    profileId: profileId || 'mem_2',
    title: title.trim(),
    goalType,
    targetValue: Number(targetValue),
    currentValue: 0,
    period: period || 'DAILY',
    isAchieved: false,
    rewardPraise: rewardPraise || 'Alhamdulillah, target belajar hari ini berhasil tercapai!',
    updatedAt: new Date().toISOString(),
  };

  dbStore.addLearningGoal(goal);
  res.status(201).json({ success: true, goal });
});

familyRouter.put('/goals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = dbStore.updateLearningGoal(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Target tidak ditemukan.' });
  res.json({ success: true, goal: updated });
});
