import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppMode, FamilyLearningNote, FamilyMember, FamilyShareCategory } from '../../types';
import {
  Shield,
  Moon,
  Sun,
  Lock,
  Download,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
  Clock,
  MessageSquare,
  Award,
  UserPlus,
  MailCheck,
  RefreshCw,
} from 'lucide-react';
import { MembershipPlansView } from '../subscription/MembershipPlansView';
import { MuslimCommunityModule } from '../community/MuslimCommunityModule';

const SHARE_CATEGORY_LABELS: Record<FamilyShareCategory, string> = {
  hasilKuis: 'Hasil Kuis',
  hafalan: 'Hafalan',
  tajwid: 'Tajwid',
  bacaanQuran: "Bacaan Qur'an",
};

export const ProfileView: React.FC = () => {
  const {
    familyMembers,
    updateFamilyMembers,
    setShowOwnerDashboard,
    setShowQualityGate,
    setShowFamilyDashboard,
    isOwnerAuthenticated,
    ownerUser,
    logoutOwnerSession,
  } = useApp();

  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(familyMembers[0]?.id || 'fam_1');
  const [familyPeriod, setFamilyPeriod] = useState<'hari' | 'minggu' | 'bulan'>('minggu');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberType, setNewMemberType] = useState<'anak' | 'dewasa'>('anak');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [syncEmail, setSyncEmail] = useState<string>(() => localStorage.getItem('akumuslim_sync_email') || '');
  const [syncActive, setSyncActive] = useState<boolean>(() => localStorage.getItem('akumuslim_sync_enabled') === '1');
  const [showSyncForm, setShowSyncForm] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || familyMembers.length >= 5) return;

    const isDewasa = newMemberType === 'dewasa';
    const inviteCode = isDewasa ? `AKM-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const newMember: FamilyMember = {
      id: `fam_${Date.now()}`,
      name: newMemberName.trim(),
      role: isDewasa ? 'dewasa' : 'anak',
      memberType: newMemberType,
      age: newMemberAge ? Number(newMemberAge) : undefined,
      avatar: isDewasa ? 'user' : 'smile',
      completedQuizzes: 0,
      memorizedSurahs: 0,
      dailyGoalMinutes: 15,
      consentStatus: isDewasa ? 'pending_invite' : 'active',
      inviteCode,
      shareSettings: {
        hasilKuis: !isDewasa,
        hafalan: !isDewasa,
        tajwid: !isDewasa,
        bacaanQuran: !isDewasa,
      },
      learningPoints: 0,
      learningNotes: isDewasa
        ? [
            {
              id: `note_${Date.now()}`,
              category: 'bacaanQuran',
              title: 'Catatan Bacaan Al-Qur\'an Mandiri',
              detail: 'Catatan pribadi anggota dewasa menunggu persetujuan berbagi.',
              pointsEarned: 15,
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    };

    const nextList = [...familyMembers, newMember];
    updateFamilyMembers(nextList);
    setSelectedFamilyId(newMember.id);
    setNewMemberName('');
    setNewMemberAge('');
    setShowAddMemberForm(false);
  };

  const handleRespondInvite = (memberId: string, decision: 'active' | 'declined') => {
    const updated = familyMembers.map((m) =>
      m.id === memberId
        ? {
            ...m,
            consentStatus: decision,
            shareSettings:
              decision === 'active'
                ? m.shareSettings || { hasilKuis: true, hafalan: true, tajwid: false, bacaanQuran: true }
                : { hasilKuis: false, hafalan: false, tajwid: false, bacaanQuran: false },
          }
        : m
    );
    updateFamilyMembers(updated);
  };

  const handleToggleShareCategory = (memberId: string, cat: FamilyShareCategory) => {
    const updated = familyMembers.map((m) => {
      if (m.id !== memberId) return m;
      const current = m.shareSettings || {
        hasilKuis: true,
        hafalan: true,
        tajwid: true,
        bacaanQuran: true,
      };
      return {
        ...m,
        shareSettings: {
          ...current,
          [cat]: !current[cat],
        },
      };
    });
    updateFamilyMembers(updated);
  };

  const handleRemoveMember = (memberId: string) => {
    if (familyMembers.length <= 1) return;
    const filtered = familyMembers.filter((m) => m.id !== memberId);
    updateFamilyMembers(filtered);
    if (selectedFamilyId === memberId && filtered[0]) {
      setSelectedFamilyId(filtered[0].id);
    }
  };

  const handleAddSampleQuizNote = (memberId: string) => {
    const note: FamilyLearningNote = {
      id: `note_${Date.now()}`,
      category: 'hasilKuis',
      title: 'Kuis Tajwid & Makhraj Huruf',
      detail: 'Menjawab tepat 5 soal latihan dasar (+15 poin belajar).',
      pointsEarned: 15,
      createdAt: new Date().toISOString(),
    };
    const updated = familyMembers.map((m) =>
      m.id === memberId
        ? {
            ...m,
            completedQuizzes: (m.completedQuizzes || 0) + 1,
            learningPoints: (m.learningPoints || 0) + 15,
            learningNotes: [note, ...(m.learningNotes || [])],
          }
        : m
    );
    updateFamilyMembers(updated);
  };

  const handleToggleSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncEmail.trim()) return;
    localStorage.setItem('akumuslim_sync_email', syncEmail.trim());
    localStorage.setItem('akumuslim_sync_enabled', '1');
    setSyncActive(true);
    setShowSyncForm(false);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-stone-900 dark:text-white">
          Profil Pengguna
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Kelola profil keluarga, keanggotaan, dan aktivitas ibadah Anda. Buka pengaturan aplikasi melalui ikon roda gigi di bar atas.
        </p>
      </div>

      {/* Modal / Subview: Keanggotaan Istimewa (Screenshot 1) */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-50 bg-stone-900 overflow-y-auto">
          <MembershipPlansView onBack={() => setShowMembershipModal(false)} />
        </div>
      )}

      {/* Modal / Subview: Komunitas Sahabat Muslim (Fitur N) */}
      {showCommunityModal && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-stone-900 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <MuslimCommunityModule onClose={() => setShowCommunityModal(false)} />
          </div>
        </div>
      )}

      {/* TAHAP 7: Kartu Keanggotaan, Komunitas, dan Dashboard Keluarga */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Kartu 1: Keanggotaan & Hak Istimewa (Matching Screenshot 1) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/90 via-stone-900 to-amber-900/60 border border-amber-600/40 text-white shadow-lg space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950">
                Keanggotaan
              </span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-base font-black tracking-tight text-white">
              Hak Istimewa Anggota
            </h2>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              15 fasilitas eksklusif: Murottal offline 114 surah, audio adzan tanah suci, sinkronisasi pesan cloud, dan nama emas.
            </p>
            <div className="pt-1 text-[11px] text-amber-200/90 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Tanpa biaya tersembunyi · Garansi pembatalan mudah kapan saja.</span>
            </div>
          </div>

          <button
            onClick={() => setShowMembershipModal(true)}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Buka Keanggotaan</span>
          </button>
        </div>

        {/* Kartu 2: Komunitas Sahabat Muslim */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Silaturahmi
              </span>
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-base font-black tracking-tight text-stone-900 dark:text-white">
              Komunitas Sahabat Muslim
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Silaturahmi 1-lawan-1 santun, cari teman mengaji terdekat, dan perlindungan privasi anak aktif.
            </p>
            <div className="pt-1 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Bebas algoritma sosmed dan bebas konten viral.</span>
            </div>
          </div>

          <button
            onClick={() => setShowCommunityModal(true)}
            className="w-full mt-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Buka Komunitas</span>
          </button>
        </div>

        {/* Kartu 3: Dashboard Aktivitas Keluarga */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Maksimal 5 Profil
              </span>
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-base font-black tracking-tight text-stone-900 dark:text-white">
              Dashboard Keluarga
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Pantau waktu aktif layar vs audio murottal latar belakang secara terpisah dan target belajar anak.
            </p>
            <div className="pt-1 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Audio murottal layar mati tidak menambah screen time.</span>
            </div>
          </div>

          <button
            onClick={() => setShowFamilyDashboard(true)}
            className="w-full mt-2 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Buka Dashboard</span>
          </button>
        </div>
      </div>

      {/* Bagikan Kebaikan & Kode Referral Syiar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-stone-900 text-white border border-teal-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold uppercase tracking-wider">
              Syiar & Amal Jariyah
            </span>
          </div>
          <h3 className="text-base font-black text-amber-300 mt-1">
            Ajak Keluarga & Sahabat Beribadah Bersama
          </h3>
          <p className="text-xs text-teal-100/90 max-w-xl leading-relaxed">
            Bagikan kode referral Anda untuk menyebarkan kebaikan dan mempermudah akses belajar Al-Qur'an serta Iqra 1–6 tanpa iklan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-teal-400/40 text-amber-300 font-mono font-bold text-xs select-all">
            AKUMUSLIM-BERKAH
          </div>
          <button
            onClick={() => {
              const referralCode = 'AKUMUSLIM-BERKAH';
              const shareText = `Bismillah, yuk gunakan aplikasi AKU MUSLIM — Sahabat Ibadah Setiap Hari (Al-Qur'an 30 Juz, Iqra 1–6, Jadwal Sholat, Arah Kiblat 100% Bebas Iklan). Gunakan kode rujukan saya: ${referralCode}`;
              const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
              if (nav && typeof nav.share === 'function') {
                nav.share({
                  title: 'AKU MUSLIM — Sahabat Ibadah Setiap Hari',
                  text: shareText,
                  url: window.location.origin,
                }).catch(() => {});
              } else if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
                nav.clipboard.writeText(`${shareText}\n${window.location.origin}`);
                alert('Teks dan kode referral berhasil disalin ke clipboard!');
              }
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span>Bagikan</span>
          </button>
        </div>
      </div>

      {/* Keluarga di Dalam Profil (Maksimal 5 Anggota) */}
      {(() => {
        const selectedMember = familyMembers.find((m) => m.id === selectedFamilyId) || familyMembers[0];
        const isAdultLocked =
          selectedMember &&
          (selectedMember.memberType === 'dewasa' || selectedMember.role === 'dewasa') &&
          selectedMember.consentStatus !== 'active';

        const periodCutoffMs =
          familyPeriod === 'hari'
            ? Date.now() - 24 * 3600 * 1000
            : familyPeriod === 'minggu'
            ? Date.now() - 7 * 24 * 3600 * 1000
            : Date.now() - 30 * 24 * 3600 * 1000;

        const sharePrefs = selectedMember?.shareSettings || {
          hasilKuis: true,
          hafalan: true,
          tajwid: true,
          bacaanQuran: true,
        };

        const visibleNotes = (selectedMember?.learningNotes || []).filter((note) => {
          const ts = new Date(note.createdAt).getTime();
          const inPeriod = Number.isNaN(ts) || ts >= periodCutoffMs;
          const isCategoryAllowed = sharePrefs[note.category] === true;
          return inPeriod && isCategoryAllowed;
        });

        return (
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                    Keluarga (Maksimal 5 Anggota)
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Pilih nama anggota untuk melihat Poin &amp; Hasil Belajar berdasarkan hari, minggu, atau bulan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {familyMembers.length}/5 Anggota
                </span>
                {familyMembers.length < 5 && (
                  <button
                    onClick={() => setShowAddMemberForm((v) => !v)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tambah Anggota</span>
                  </button>
                )}
              </div>
            </div>

            {/* Form Tambah Anggota (Anak dibuat Wali vs Orang Dewasa kirim Undangan) */}
            {showAddMemberForm && (
              <form
                onSubmit={handleAddFamilyMember}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-emerald-200 dark:border-emerald-800/60 space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMemberType('anak')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newMemberType === 'anak'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <span className="font-bold block">Anggota Anak</span>
                    <span className="text-[10px] opacity-85">Profil dibuat langsung oleh wali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemberType('dewasa')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newMemberType === 'dewasa'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <span className="font-bold block">Orang Dewasa</span>
                    <span className="text-[10px] opacity-85">Kirim undangan persetujuan</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={newMemberType === 'anak' ? 'Nama anak (contoh: Bilal)' : 'Nama anggota dewasa (contoh: Bunda Aminah)'}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                    required
                  />
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(e.target.value)}
                    placeholder="Usia (opsional)"
                    className="w-full sm:w-28 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    {newMemberType === 'anak' ? 'Buat Profil Anak' : 'Kirim Undangan'}
                  </button>
                </div>
              </form>
            )}

            {/* Daftar Anggota (Klik nama untuk baca catatan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {familyMembers.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                const isPending = member.consentStatus === 'pending_invite';
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedFamilyId(member.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 ring-1 ring-emerald-500'
                        : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-stone-900 dark:text-white block truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                          {member.memberType === 'dewasa' || member.role === 'dewasa' || member.role === 'ayah' || member.role === 'ibu'
                            ? 'Dewasa'
                            : 'Anak'}
                          {member.age ? ` (${member.age} thn)` : ''} · {isPending ? 'Menunggu Persetujuan' : `${member.learningPoints || 0} Poin`}
                        </span>
                      </div>
                    </div>

                    {isPending ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold shrink-0">
                        Undangan
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0">
                        {member.learningPoints || 0} pt
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detail Anggota Terpilih */}
            {selectedMember && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200 dark:border-stone-700">
                  <div>
                    <h3 className="text-sm font-black text-stone-900 dark:text-white">
                      {selectedMember.name}
                    </h3>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Poin berasal dari kegiatan belajar &amp; kuis — bukan pengakuan dosa atau penilaian kesalehan.
                    </span>
                  </div>
                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(selectedMember.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600"
                      title="Hapus anggota keluarga"
                      aria-label="Hapus anggota keluarga"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Poin & Hasil Belajar */}
                {!isAdultLocked && (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-400 block">Poin Belajar</span>
                      <strong className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {selectedMember.learningPoints || 0}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-400 block">Kuis Selesai</span>
                      <strong className="text-base font-black text-stone-900 dark:text-white tabular-nums">
                        {selectedMember.completedQuizzes || 0}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-400 block">Surah Hafalan</span>
                      <strong className="text-base font-black text-stone-900 dark:text-white tabular-nums">
                        {selectedMember.memorizedSurahs || 0}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Undangan Persetujuan Anggota Dewasa */}
                {isAdultLocked ? (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>
                        {selectedMember.consentStatus === 'declined'
                          ? 'Undangan Berbagi Ditolak — Catatan Tetap Privat'
                          : 'Catatan Orang Dewasa Bersifat Privat Hingga Undangan Disetujui'}
                      </span>
                    </div>
                    {selectedMember.inviteCode && (
                      <p className="text-[11px] text-amber-800 dark:text-amber-300">
                        Kode undangan keluarga: <strong className="font-mono">{selectedMember.inviteCode}</strong>. Anggota dewasa dapat menyetujui undangan dan memilih jenis catatan yang ingin dibagikan.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleRespondInvite(selectedMember.id, 'active')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                      >
                        <MailCheck className="w-3.5 h-3.5" />
                        <span>Setujui Undangan (Oleh Anggota Dewasa)</span>
                      </button>
                      {selectedMember.consentStatus === 'pending_invite' && (
                        <button
                          type="button"
                          onClick={() => handleRespondInvite(selectedMember.id, 'declined')}
                          className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold"
                        >
                          Tolak &amp; Jaga Privat
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Kontrol Kategori Catatan yang Boleh Dibagikan */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                        Catatan &amp; Hasil yang Dibagikan ke Keluarga:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(SHARE_CATEGORY_LABELS) as FamilyShareCategory[]).map((cat) => {
                          const enabled = sharePrefs[cat] === true;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleToggleShareCategory(selectedMember.id, cat)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                enabled
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-white dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
                              }`}
                            >
                              {enabled ? '✓ ' : ''}{SHARE_CATEGORY_LABELS[cat]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filter Periode: Hari / Minggu / Bulan */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-[11px] font-bold">
                        {(['hari', 'minggu', 'bulan'] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setFamilyPeriod(period)}
                            className={`px-3 py-1 rounded-lg capitalize ${
                              familyPeriod === period
                                ? 'bg-emerald-700 text-white'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-white'
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSampleQuizNote(selectedMember.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-200"
                      >
                        + Catat Hasil Kuis (+15 Poin)
                      </button>
                    </div>

                    {/* Daftar Catatan Belajar Tersaring */}
                    {visibleNotes.length === 0 ? (
                      <p className="text-xs text-stone-400 italic py-2">
                        Belum ada catatan yang dibagikan pada rentang {familyPeriod} ini (atau kategori berbagi sedang dimatikan).
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {visibleNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs flex items-start justify-between gap-2"
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                                {SHARE_CATEGORY_LABELS[note.category]} · {new Date(note.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                              <strong className="text-stone-900 dark:text-white block mt-0.5">
                                {note.title}
                              </strong>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                {note.detail}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] shrink-0 tabular-nums">
                              +{note.pointsEarned} pt
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Sinkronisasi Antarperangkat Opsional (Tanpa Wajib Login) */}
            <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="space-y-0.5">
                <strong className="text-stone-900 dark:text-white block">
                  {syncActive ? `Sinkronisasi Aktif (${syncEmail})` : 'Mode Offline Tanpa Wajib Login'}
                </strong>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                  Penggunaan dasar berjalan penuh tanpa akun. Masuk hanya diperlukan bila anggota ingin menyinkronkan catatan antarperangkat.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSyncForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{syncActive ? 'Kelola Sync' : 'Masuk Sinkronisasi'}</span>
                </button>
              </div>
            </div>

            {showSyncForm && (
              <form onSubmit={handleToggleSync} className="flex flex-col sm:flex-row gap-2 text-xs">
                <input
                  type="email"
                  value={syncEmail}
                  onChange={(e) => setSyncEmail(e.target.value)}
                  placeholder="Email keluarga untuk sinkronisasi antarperangkat..."
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold"
                >
                  Aktifkan Sinkronisasi
                </button>
              </form>
            )}
          </div>
        );
      })()}

      {/* Bagian: Tentang AKU MUSLIM & Titip Doa untuk Kami */}
      <div className="space-y-4">
        {/* Identitas Aplikasi & Pyramid Group */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 p-3 shadow-md flex items-center justify-center">
            {/* Logo Orisinal AKU MUSLIM: Bulan Sabit & Mushaf Terbuka */}
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
              {/* Bulan Sabit Emas */}
              <path
                d="M 68 18 C 50 18 36 32 36 50 C 36 68 50 82 68 82 C 60 82 48 76 44 65 C 40 54 44 40 52 30 C 58 22 64 19 68 18 Z"
                fill="#f59e0b"
              />
              {/* Bintang / Cahaya */}
              <circle cx="65" cy="35" r="4.5" fill="#fcd34d" />
              {/* Mushaf Terbuka Hijau Emerald */}
              <path
                d="M 22 68 Q 38 64 50 72 Q 62 64 78 68 L 76 74 Q 62 70 50 78 Q 38 70 24 74 Z"
                fill="#34d399"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
              AKU MUSLIM
            </h2>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Sahabat Ibadah Setiap Hari
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-700/80">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block">
              Pengembang Resmi:
            </span>
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              Dibuat dan dikembangkan oleh <span className="text-emerald-800 dark:text-emerald-400 font-black">PYRAMID GROUP</span>
            </p>
            <span className="text-[10px] text-stone-400 block mt-1">
              Versi 1.0.0 (Tahap 3 Staging & Internal Android Ready)
            </span>
            {!isOwnerAuthenticated && (
              <div className="pt-2.5">
                <button
                  type="button"
                  onClick={() => setShowOwnerDashboard(true)}
                  className="text-[11px] text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Lock className="w-3 h-3 text-stone-400" />
                  <span>Akses Pengelola (Owner)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kartu Khusus: Titip Doa untuk Kami 🤲 */}
        <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-950 text-white border-2 border-amber-400/50 shadow-xl overflow-hidden space-y-3">
          {/* Subtle Decorative Background Star & Glow */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          <div className="absolute top-3 right-4 font-arabic text-3xl text-amber-300/20 select-none pointer-events-none">
            دعاء
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl">🤲</span>
            <h3 className="text-base sm:text-lg font-black text-amber-300 tracking-tight">
              Titip Doa untuk Kami 🤲
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-emerald-50 leading-relaxed pt-1">
            <p className="italic font-medium">
              "Dengan penuh kerendahan hati, kami memohon doa dari seluruh pengguna AKU MUSLIM untuk keluarga besar <strong>Abah H. Fauzi</strong> dan <strong>Abi Haidar Hayazee</strong>."
            </p>

            <p className="font-normal opacity-95">
              Semoga Allah SWT senantiasa memberikan kesehatan, keselamatan, keberkahan rezeki, kebahagiaan dunia dan akhirat, serta menjadikan aplikasi ini sebagai amal jariyah yang terus mengalir manfaatnya.
            </p>

            <div className="pt-2 text-center sm:text-left">
              <span className="font-arabic text-base sm:text-lg text-amber-300 font-bold block">
                آمِيْنَ يَا رَبَّ العَالَمِيْنَ
              </span>
              <span className="text-xs text-amber-200 font-bold block mt-0.5">
                Aamiin ya Rabbal 'alamin.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Dashboard Gate & Quality Gate Link — Strictly restricted to authenticated OWNER */}
      {isOwnerAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                Sesi Owner Aktif
              </span>
              <span className="text-xs font-bold text-stone-900 dark:text-white">
                {ownerUser?.displayName || ownerUser?.username || 'villa.pyramid1@gmail.com'}
              </span>
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              Portal Administrasi Owner
            </span>
            <span className="text-[11px] text-stone-500">
              Akses dashboard kontrol aplikasi, audit konten agama, dan pengujian sistem.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowQualityGate(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Quality Gate Test
            </button>

            <button
              onClick={() => setShowOwnerDashboard(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
            >
              Buka Dashboard Owner
            </button>

            <button
              onClick={logoutOwnerSession}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-rose-100 hover:text-rose-700 transition-colors"
            >
              Keluar Sesi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
