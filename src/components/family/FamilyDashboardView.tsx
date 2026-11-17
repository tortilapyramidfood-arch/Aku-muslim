import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  BookOpen,
  Sparkles,
  Flame,
  Award,
  Headphones,
  Gamepad2,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldCheck,
  ChevronRight,
  Smile,
  AlertCircle,
  BarChart3,
  Calendar,
  X,
} from 'lucide-react';

interface FamilyMember {
  memberId: string;
  id?: string;
  name: string;
  role: string;
  avatar: string;
  ageGroup: string;
  shareActivityConsent?: boolean;
  totalActiveMinutes: number;
  quranMinutes: number;
  hifzMinutes: number;
  tajwidMinutes: number;
  goalsCount: number;
  achievedGoalsCount: number;
}

interface FamilySummary {
  familyId: string;
  familyName: string;
  periodDays: number;
  totals: {
    totalActiveMinutes: number;
    quranMinutes: number;
    hifzMinutes: number;
    tajwidMinutes: number;
    gameMinutes: number;
    backgroundAudioMinutes: number; // Strictly separated from screen time
  };
  memberStats: FamilyMember[];
  goals: Array<{
    id: string;
    profileId: string;
    title: string;
    goalType: string;
    targetValue: number;
    currentValue: number;
    period: string;
    isAchieved: boolean;
    rewardPraise: string;
  }>;
}

export const FamilyDashboardView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [summary, setSummary] = useState<FamilySummary | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(7);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Modal State for adding member
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAgeGroup, setNewMemberAgeGroup] = useState<'ANAK' | 'REMAJA' | 'DEWASA'>('ANAK');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👦');

  // Modal State for adding goal
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState<'QURAN_MINUTES' | 'HIFZ_AYAHS' | 'TAJWID_LESSONS'>('QURAN_MINUTES');
  const [goalTargetValue, setGoalTargetValue] = useState(15);
  const [goalRewardPraise, setGoalRewardPraise] = useState('Barakallahu fiik, target berhasil tercapai!');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSummary();
  }, [selectedDays]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/family/summary?days=${selectedDays}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        if (!activeProfileId && data.memberStats?.length > 0) {
          setActiveProfileId(data.memberStats[0].memberId);
        }
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      const res = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName.trim(),
          ageGroup: newMemberAgeGroup,
          avatar: newMemberAvatar,
          role: newMemberAgeGroup === 'DEWASA' ? 'PARENT' : 'CHILD',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddMemberModal(false);
        setNewMemberName('');
        loadSummary();
      } else {
        setErrorMsg(data.error || 'Gagal menambahkan profil.');
      }
    } catch {
      setErrorMsg('Gagal menambahkan anggota keluarga.');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      const res = await fetch('/api/family/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfileId,
          title: goalTitle.trim(),
          goalType,
          targetValue: goalTargetValue,
          rewardPraise: goalRewardPraise.trim(),
        }),
      });
      if (res.ok) {
        setShowAddGoalModal(false);
        setGoalTitle('');
        loadSummary();
      }
    } catch {
      // Ignore
    }
  };

  const activeMember = summary?.memberStats.find((m) => m.memberId === activeProfileId) || summary?.memberStats[0];
  const activeMemberGoals = summary?.goals.filter((g) => g.profileId === activeMember?.memberId) || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-800 text-white space-y-2 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Dashboard Keluarga Muslim</h2>
              <p className="text-xs text-emerald-200">
                Pantau durasi belajar Al-Qur'an dan perkembangan hafalan seluruh anggota keluarga.
              </p>
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-900/80 rounded-2xl border border-stone-800 text-xs">
            {[
              { days: 1, label: 'Hari' },
              { days: 7, label: 'Minggu' },
              { days: 30, label: 'Bulan' },
            ].map((d) => (
              <button
                key={d.days}
                onClick={() => setSelectedDays(d.days)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedDays === d.days
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-300 hover:text-white bg-stone-900/60 hover:bg-stone-800 transition-colors"
              title="Tutup Dashboard Keluarga"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 8 KARTU RINGKASAN UTAMA AKTIVITAS KELUARGA */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* 1. Durasi Penggunaan Aktif Layar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Waktu Aktif Layar</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {summary.totals.totalActiveMinutes} <span className="text-xs font-normal text-stone-400">menit</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">Interaksi Foreground</span>
          </div>

          {/* 2. Durasi Membaca Al-Qur'an */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Membaca Al-Qur'an</span>
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {summary.totals.quranMinutes} <span className="text-xs font-normal text-stone-400">menit</span>
            </div>
            <span className="text-[10px] text-stone-400 block">Tilawah & Tadabbur</span>
          </div>

          {/* 3. Durasi Latihan Smart Hifz */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Latihan Smart Hifz</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {summary.totals.hifzMinutes} <span className="text-xs font-normal text-stone-400">menit</span>
            </div>
            <span className="text-[10px] text-amber-600 font-semibold block">Hafalan Per Ayat</span>
          </div>

          {/* 4. Durasi Belajar Tajwid */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Belajar Tajwid</span>
              <Award className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {summary.totals.tajwidMinutes} <span className="text-xs font-normal text-stone-400">menit</span>
            </div>
            <span className="text-[10px] text-stone-400 block">Makhraj & Tartil</span>
          </div>

          {/* 5. Durasi Game Edukasi */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Game Edukasi</span>
              <Gamepad2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {summary.totals.gameMinutes} <span className="text-xs font-normal text-stone-400">menit</span>
            </div>
            <span className="text-[10px] text-stone-400 block">Kuis Sambung Ayat</span>
          </div>

          {/* 6. Durasi Audio Latar Belakang (Terpisah dari Screen Time!) */}
          <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Murottal Background</span>
              <Headphones className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-stone-700 dark:text-stone-300">
              {summary.totals.backgroundAudioMinutes} <span className="text-xs font-normal text-stone-400">menit</span>
            </div>
            <span className="text-[10px] text-teal-700 font-bold block">Terpisah Dari Screen Time</span>
          </div>

          {/* 7. Target Belajar Tercapai */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Target Tercapai</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {summary.goals.filter((g) => g.isAchieved).length} / {summary.goals.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">Kedisiplinan Harian</span>
          </div>

          {/* 8. Profil Terhubung */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Profil Keluarga</span>
              <Users className="w-4 h-4 text-stone-500" />
            </div>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {summary.memberStats.length} / 5
            </div>
            <span className="text-[10px] text-stone-400 block">Kuota Maksimal 5</span>
          </div>
        </div>
      )}

      {/* PROFIL ANGGOTA KELUARGA SWITCHER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-700 dark:text-stone-300">Pilih Anggota Keluarga:</span>
          {summary && summary.memberStats.length < 5 && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Profil Anak / Keluarga</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {summary?.memberStats.map((member) => (
            <button
              key={member.memberId}
              onClick={() => setActiveProfileId(member.memberId)}
              className={`p-3 rounded-2xl border text-left min-w-[150px] transition-all flex items-center gap-2.5 ${
                activeProfileId === member.memberId
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-lg">
                {member.avatar}
              </div>
              <div>
                <span className="font-bold text-xs text-stone-900 dark:text-white block leading-tight">
                  {member.name}
                </span>
                <span className="text-[10px] text-stone-400 capitalize">
                  {member.role.toLowerCase()} · {member.totalActiveMinutes}m
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DETAIL PERKEMBANGAN ANGGOTA TERPILIH */}
      {activeMember && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeMember.avatar}</span>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Hasil Belajar: {activeMember.name}
                </h3>
                <span className="text-xs text-stone-400">
                  {activeMember.shareActivityConsent === false
                    ? 'Catatan anggota dewasa privat (menunggu persetujuan undangan)'
                    : `Waktu aktif: ${activeMember.totalActiveMinutes} menit · Poin belajar: ${(activeMember.achievedGoalsCount * 20) + activeMember.quranMinutes} pt (dari latihan & target)`}
                </span>
              </div>
            </div>

            {activeMember.shareActivityConsent !== false && (
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Target Baru</span>
              </button>
            )}
          </div>

          {/* TARGET BELAJAR AKTIF DENGAN REWARD APRESIASI */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
              Target Belajar & Hafalan ({activeMemberGoals.length}):
            </span>

            {activeMemberGoals.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Belum ada target khusus untuk anggota ini.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeMemberGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      goal.isAchieved
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-950 dark:text-emerald-100'
                        : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">{goal.title}</span>
                      {goal.isAchieved ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          ✓ Tercapai
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">
                          {goal.currentValue} / {goal.targetValue}
                        </span>
                      )}
                    </div>

                    <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%` }}
                      />
                    </div>

                    {goal.isAchieved && (
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold italic">
                        "{goal.rewardPraise}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRIVACY & SYARIAH POLICY NOTICE */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Prinsip Keamanan & Privasi Keluarga AKU MUSLIM:</span>
        </div>
        <p className="leading-relaxed">
          1. Data aktivitas ibadah hanya dapat diakses oleh kepala keluarga yang sah.<br />
          2. Sistem <strong>TIDAK PERNAH</strong> merekam mikrofon secara sembunyi-sembunyi dan tidak memonitor aplikasi lain di HP pengguna.<br />
          3. Evaluasi hafalan adalah pendampingan belajar, bukan penilaian keimanan.
        </p>
      </div>

      {/* MODAL TAMBAH PROFIL ANGGOTA KELUARGA */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-xs border border-stone-200 dark:border-stone-700 shadow-xl">
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Tambah Profil Anggota Keluarga
            </h3>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Nama Panggilan:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bilal"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Jenjang Usia:
                </label>
                <select
                  value={newMemberAgeGroup}
                  onChange={(e) => setNewMemberAgeGroup(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                >
                  <option value="ANAK">Anak-anak (4 - 12 Tahun)</option>
                  <option value="REMAJA">Remaja (13 - 18 Tahun)</option>
                  <option value="DEWASA">Dewasa / Orang Tua</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Pilih Avatar:
                </label>
                <div className="flex gap-2 text-xl">
                  {['👦', '👧', '👨‍👧‍👦', '👩‍👧‍👦', '🧒', '🧕'].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewMemberAvatar(emoji)}
                      className={`p-2 rounded-xl border ${newMemberAvatar === emoji ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-stone-200 dark:border-stone-700'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && <p className="text-rose-500 text-[11px]">{errorMsg}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  Simpan Profil
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BUAT TARGET BELAJAR BARU */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-xs border border-stone-200 dark:border-stone-700 shadow-xl">
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Buat Target Belajar ({activeMember?.name})
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Judul Target:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tilawah 15 Menit"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Jenis Aktivitas:
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                >
                  <option value="QURAN_MINUTES">Durasi Membaca Al-Qur'an (Menit)</option>
                  <option value="HIFZ_AYAHS">Target Hafalan Smart Hifz (Ayat)</option>
                  <option value="TAJWID_LESSONS">Durasi Belajar Tajwid (Menit)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Nilai Target Angka:
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={goalTargetValue}
                  onChange={(e) => setGoalTargetValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Pesan Apresiasi Saat Tercapai:
                </label>
                <input
                  type="text"
                  value={goalRewardPraise}
                  onChange={(e) => setGoalRewardPraise(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  Simpan Target
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
