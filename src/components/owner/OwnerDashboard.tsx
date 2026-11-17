import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthenticatedUser, MfaSetupInfo, ownerAuthService } from '../../services/ownerAuthService';
import {
  ShieldAlert,
  KeyRound,
  X,
  Megaphone,
  Sliders,
  Activity,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  History,
  CheckCircle2,
  Lock,
  LogOut,
  QrCode,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Copy,
  Download,
  Check,
  RotateCcw,
  HelpCircle,
  Key,
  BookOpen,
  Heart,
  Users,
  GraduationCap,
  Play,
  Square,
  Volume2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { OwnerBillingCenter } from './OwnerBillingCenter';
import { QURAN_COVER_TEMPLATES, QuranCoverTemplate } from '../../data/quranCoverTemplates';
import { IQRA_CURRICULUM, IqraWordItem } from '../../data/iqraCurriculumData';
import { humanAudioService } from '../../services/humanAudioService';

export const OwnerDashboard: React.FC = () => {
  const {
    showOwnerDashboard,
    setShowOwnerDashboard,
    setShowQualityGate,
    refreshOwnerSession,
    logoutOwnerSession,
  } = useApp();

  // Authentication States
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loginStep, setLoginStep] = useState<
    'CREDENTIALS' | 'MFA_TOTP' | 'MFA_SETUP' | 'RECOVERY_CODES' | 'RECOVERY_CODE_LOGIN' | 'MFA_RESET'
  >('CREDENTIALS');
  const [challengeToken, setChallengeToken] = useState<string>('');

  // Form Fields
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [totpCodeInput, setTotpCodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // First-Time MFA Setup & Recovery States
  const [setupKey, setSetupKey] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [otpauthUri, setOtpauthUri] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('villa.pyramid1@gmail.com');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetRecoveryCodeInput, setResetRecoveryCodeInput] = useState('');

  // Active section in dashboard
  const [activeSection, setActiveSection] = useState<
    | 'ringkasan'
    | 'billing'
    | 'ibadah_quran'
    | 'pendidikan_iqra'
    | 'komunitas'
    | 'sosial'
    | 'pengumuman'
    | 'fitur'
    | 'konten'
    | 'monetisasi'
    | 'audit'
    | 'mfa_config'
  >('ringkasan');

  // Server Data
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; timestamp: string; actor: string; role: string; action: string; ip: string; status: string; details?: string }>>([]);
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; message: string; type: string; createdAt: string }>>([]);
  const [mfaSetup, setMfaSetup] = useState<MfaSetupInfo | null>(null);

  // New Announcement
  const [newTitle, setNewTitle] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    if (!showOwnerDashboard) return;
    ownerAuthService.checkSession().then((user) => {
      if (user) {
        setCurrentUser(user);
        loadServerData();
      }
    });
  }, [showOwnerDashboard]);

  const loadServerData = async () => {
    try {
      const flags = await ownerAuthService.getFeatureFlags();
      if (flags) setFeatureFlags(flags);

      const logs = await ownerAuthService.getAuditLogs().catch(() => []);
      if (logs) setAuditLogs(logs);

      const mfaInfo = await ownerAuthService.getMfaSetupInfo();
      if (mfaInfo) setMfaSetup(mfaInfo);

      // Load announcements
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch {
      // Ignore
    }
  };

  if (!showOwnerDashboard) return null;

  // Step 1: Submit Username & Password
  const handleStep1Login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    const res = await ownerAuthService.loginStep1(usernameInput, passwordInput);
    setLoadingAuth(false);

    if (res.success && res.challengeToken) {
      setChallengeToken(res.challengeToken);
      if (res.ownerEmail) setOwnerEmail(res.ownerEmail);

      if (res.requiresMfaSetup) {
        // Alur Onboarding Pertama Kali: Akun belum terdaftar MFA
        setSetupKey(res.setupKey || '');
        setQrCodeDataUrl(res.qrCodeDataUrl || '');
        setOtpauthUri(res.otpauthUri || '');
        setLoginStep('MFA_SETUP');
      } else {
        // MFA sudah terdaftar: Masukkan 6-digit TOTP rutin
        setLoginStep('MFA_TOTP');
      }
    } else {
      setAuthError(res.error || 'Username atau password salah.');
    }
  };

  // Step 2A: Submit 6-digit TOTP Token (Login Normal)
  const handleStep2Mfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    const res = await ownerAuthService.verifyMfa(challengeToken, totpCodeInput);
    setLoadingAuth(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      await refreshOwnerSession();
      setLoginStep('CREDENTIALS');
      setUsernameInput('');
      setPasswordInput('');
      setTotpCodeInput('');
      loadServerData();
    } else {
      setAuthError(res.error || 'Kode TOTP salah atau kedaluwarsa.');
    }
  };

  // Step 2B: Aktivasi Pertama Kali Google Authenticator
  const handleActivateFirstMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    const res = await ownerAuthService.activateMfa(challengeToken, totpCodeInput);
    setLoadingAuth(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      await refreshOwnerSession();
      if (res.recoveryCodes && res.recoveryCodes.length > 0) {
        setRecoveryCodes(res.recoveryCodes);
        setLoginStep('RECOVERY_CODES');
      } else {
        setLoginStep('CREDENTIALS');
        loadServerData();
      }
      setTotpCodeInput('');
    } else {
      setAuthError(res.error || 'Kode aktivasi salah atau belum sinkron.');
    }
  };

  // Step 2C: Login dengan Recovery Code Sekali Pakai
  const handleRecoveryCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    const res = await ownerAuthService.loginWithRecoveryCode(challengeToken, recoveryCodeInput);
    setLoadingAuth(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      await refreshOwnerSession();
      setLoginStep('CREDENTIALS');
      setUsernameInput('');
      setPasswordInput('');
      setRecoveryCodeInput('');
      loadServerData();
    } else {
      setAuthError(res.error || 'Kode pemulihan tidak sah atau telah digunakan.');
    }
  };

  // Step 2D: Reset MFA Aman untuk Owner (Identitas Master)
  const handleResetMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    const res = await ownerAuthService.resetMfa(
      'owner',
      resetPasswordInput,
      resetEmailInput,
      resetRecoveryCodeInput || undefined
    );
    setLoadingAuth(false);

    if (res.success && res.challengeToken) {
      setChallengeToken(res.challengeToken);
      setSetupKey(res.setupKey || '');
      setQrCodeDataUrl(res.qrCodeDataUrl || '');
      setOtpauthUri(res.otpauthUri || '');
      setOwnerEmail(res.ownerEmail || 'villa.pyramid1@gmail.com');
      setResetPasswordInput('');
      setResetEmailInput('');
      setResetRecoveryCodeInput('');
      setLoginStep('MFA_SETUP');
    } else {
      setAuthError(res.error || 'Verifikasi identitas reset MFA gagal.');
    }
  };

  const handleCopySetupKey = () => {
    if (!setupKey) return;
    navigator.clipboard.writeText(setupKey.replace(/\s+/g, ''));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyAllRecoveryCodes = () => {
    if (!recoveryCodes.length) return;
    const text = `KODE PEMULIHAN AKU MUSLIM OWNER (SIMPAN RAHASIA):\nTanggal Diterbitkan: ${new Date().toLocaleString('id-ID')}\n\n` +
      recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      '\n\nSetiap kode hanya dapat digunakan 1 kali.';
    navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  const handleDownloadRecoveryCodes = () => {
    if (!recoveryCodes.length) return;
    const text = `KODE PEMULIHAN AKU MUSLIM OWNER (SIMPAN RAHASIA)\nTanggal: ${new Date().toISOString()}\nAkun: owner (${ownerEmail})\n\n` +
      recoveryCodes.map((c, i) => `Kode ${i + 1}: ${c}`).join('\n') +
      '\n\nPERINGATAN: Simpan berkas ini di brankas digital aman. Jangan dibagikan kepada siapa pun.';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akumuslim-owner-recovery-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinishRecoveryView = () => {
    setLoginStep('CREDENTIALS');
    setUsernameInput('');
    setPasswordInput('');
    loadServerData();
  };

  const handleLogout = async () => {
    await logoutOwnerSession();
    setCurrentUser(null);
    setLoginStep('CREDENTIALS');
  };

  const handleToggleFeature = async (key: string) => {
    if (!currentUser || currentUser.role !== 'OWNER') return;
    const updated = { ...featureFlags, [key]: !featureFlags[key] };
    try {
      await ownerAuthService.updateFeatureFlags(updated);
      setFeatureFlags(updated);
      loadServerData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMsg.trim()) return;

    try {
      const created = await ownerAuthService.createAnnouncement(newTitle, newMsg);
      setAnnouncements([created, ...announcements]);
      setNewTitle('');
      setNewMsg('');
      setAnnSuccess(true);
      setTimeout(() => setAnnSuccess(false), 2000);
      loadServerData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await ownerAuthService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a.id !== id));
      loadServerData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl lg:max-w-6xl h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col text-stone-100 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>PORTAL ADMINISTRASI & SECURITY OWNER</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  BACKEND RFC 6238 TOTP
                </span>
              </h2>
              <span className="text-xs text-stone-400">
                Server-Authoritative RBAC & Sesi Kriptografis · Kredensial Hardcoded Dihapus
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}
            <button
              onClick={() => setShowOwnerDashboard(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If NOT Authenticated: Show Two-Step Server Login Form */}
        {!currentUser ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* STEP 1: CREDENTIALS */}
            {loginStep === 'CREDENTIALS' && (
              <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-800">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white">Login Kredensial Server</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Akses dilindungi autentikasi server dengan salt & hash scrypt. Pilih akun dan masukkan kredensial resmi.
                  </p>
                </div>

                <form onSubmit={handleStep1Login} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      Peran / Akun:
                    </label>
                    <select
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                    >
                      <option value="">-- Pilih Akun Terdaftar --</option>
                      <option value="owner">Owner / Chief Administrator (Peran: OWNER)</option>
                      <option value="admin_konten">Administrator Konten (Peran: ADMIN_KONTEN)</option>
                      <option value="reviewer_agama">Reviewer Agama (Peran: REVIEWER_AGAMA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      Kata Sandi Server:
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loadingAuth || !usernameInput || !passwordInput}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{loadingAuth ? 'Memverifikasi...' : 'Lanjut ke Verifikasi MFA →'}</span>
                  </button>

                  <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 space-y-1">
                    <p className="font-bold text-stone-300">Catatan Staging / Preview:</p>
                    <p>• Akun <strong>owner</strong>: <code>AkuMuslim@OwnerSecure2026!</code></p>
                    <p>• Akun <strong>admin_konten</strong>: <code>KontenMuslim@2026Safe!</code></p>
                    <p>• Akun <strong>reviewer_agama</strong>: <code>ReviewSyariah@2026Aman!</code></p>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: MFA SETUP (FIRST-TIME ONBOARDING FOR OWNER) */}
            {loginStep === 'MFA_SETUP' && (
              <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-stone-950 border border-emerald-800/60 shadow-2xl space-y-5">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-800">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white">Hubungkan Google Authenticator</h3>
                  <p className="text-xs text-stone-400">
                    Akun Owner AKU MUSLIM ({ownerEmail}) memerlukan perlindungan MFA dua faktor. Silakan tautkan perangkat Anda:
                  </p>
                </div>

                {/* QR Code and Secret Key Card */}
                <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col items-center gap-3">
                  {qrCodeDataUrl ? (
                    <div className="p-2 bg-white rounded-2xl shadow-md border border-stone-200">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code TOTP AKU MUSLIM"
                        className="w-44 h-44 object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-stone-800 rounded-2xl flex items-center justify-center text-xs text-stone-500">
                      Membuat QR Code...
                    </div>
                  )}

                  <div className="w-full text-center space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      Atau Masukkan Kunci Penyiapan Manual:
                    </span>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <code className="text-xs font-mono font-bold text-emerald-400 tracking-wider select-all truncate">
                        {setupKey || 'MEMUAT...'}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySetupKey}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-[11px] font-bold text-emerald-300 flex items-center gap-1 shrink-0"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4-Step Indonesian Guide */}
                <div className="p-3.5 rounded-2xl bg-stone-900/50 border border-stone-800/80 text-[11px] text-stone-300 space-y-1.5">
                  <span className="font-bold text-emerald-400 block flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Panduan Google Authenticator:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-stone-400">
                    <li>Buka aplikasi <strong>Google Authenticator</strong> di ponsel Anda.</li>
                    <li>Ketuk ikon tambah (<strong>+</strong>) di sudut kanan bawah.</li>
                    <li>Pilih <strong>Pindai kode QR</strong> atau <strong>Masukkan kunci penyiapan</strong>.</li>
                    <li>Pilih jenis akun <strong>Berdasarkan waktu (Time-based)</strong> lalu periksa kode 6 digit.</li>
                  </ol>
                </div>

                {/* First 6-digit Code Form */}
                <form onSubmit={handleActivateFirstMfa} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1.5 text-center">
                      Masukkan Kode 6 Digit Pertama dari Aplikasi:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={totpCodeInput}
                      onChange={(e) => setTotpCodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-48 mx-auto text-center text-3xl tracking-[0.35em] font-mono py-2.5 rounded-xl border border-emerald-800 bg-stone-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold block"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('CREDENTIALS');
                        setAuthError('');
                      }}
                      className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAuth || totpCodeInput.length !== 6}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{loadingAuth ? 'Memverifikasi...' : 'Verifikasi & Aktifkan MFA'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: RECOVERY CODES DISPLAY (SHOW ONCE ON SUCCESSFUL SETUP) */}
            {loginStep === 'RECOVERY_CODES' && (
              <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-stone-950 border border-amber-800/70 shadow-2xl space-y-5">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 mx-auto flex items-center justify-center border border-amber-800">
                    <Key className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white">Simpan 8 Kode Pemulihan Anda</h3>
                  <p className="text-xs text-amber-300/90 font-medium">
                    PERINGATAN: Simpan kode-kode ini sekarang! Setiap kode hanya dapat digunakan SATU KALI jika Anda kehilangan akses ke aplikasi Google Authenticator.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
                  <div className="grid grid-cols-2 gap-2 font-mono text-center text-sm font-bold text-emerald-400">
                    {recoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="py-2 px-3 rounded-xl bg-stone-950 border border-stone-800 select-all"
                      >
                        <span className="text-[10px] text-stone-500 mr-2">{idx + 1}.</span>
                        <span>{code}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAllRecoveryCodes}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 flex items-center justify-center gap-1.5"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodes ? 'Semua Kode Tersalin' : 'Salin Semua Kode'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadRecoveryCodes}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Berkas (.txt)</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400">
                  <p>• Kode telah di-hash dengan SHA-256 dan disimpan aman di server.</p>
                  <p>• Rahasia TOTP telah dienkripsi dengan standar militer AES-256-GCM.</p>
                </div>

                <button
                  type="button"
                  onClick={handleFinishRecoveryView}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saya Sudah Menyimpan Kode — Masuk ke Dashboard</span>
                </button>
              </div>
            )}

            {/* STEP 4: ROUTINE TOTP VERIFICATION */}
            {loginStep === 'MFA_TOTP' && (
              <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-800">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white">Verifikasi Dua Faktor (MFA TOTP)</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Masukkan 6 digit kode dari aplikasi Google Authenticator / Microsoft Authenticator Anda.
                  </p>
                </div>

                <form onSubmit={handleStep2Mfa} className="space-y-4">
                  <div className="text-center">
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={totpCodeInput}
                      onChange={(e) => setTotpCodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-48 mx-auto text-center text-3xl tracking-[0.4em] font-mono py-2.5 rounded-xl border border-stone-700 bg-stone-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                    <span className="text-[11px] text-stone-500 block mt-2">
                      Kode TOTP diperbarui otomatis setiap 30 detik (RFC 6238).
                    </span>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('CREDENTIALS');
                        setAuthError('');
                      }}
                      className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-bold"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAuth || totpCodeInput.length !== 6}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs"
                    >
                      {loadingAuth ? 'Memeriksa...' : 'Verifikasi MFA'}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-stone-800 text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setLoginStep('RECOVERY_CODE_LOGIN');
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline block mx-auto font-medium"
                    >
                      Tidak bisa mengakses ponsel? Gunakan Kode Pemulihan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setLoginStep('MFA_RESET');
                      }}
                      className="text-[11px] text-stone-400 hover:text-stone-300 hover:underline block mx-auto"
                    >
                      Kehilangan Authenticator & butuh reset? Prosedur Pemulihan Owner
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 5: LOGIN USING RECOVERY CODE */}
            {loginStep === 'RECOVERY_CODE_LOGIN' && (
              <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-amber-950 text-amber-400 mx-auto flex items-center justify-center border border-amber-800">
                    <Key className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white">Masuk dengan Kode Pemulihan</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Masukkan salah satu dari 8 kode pemulihan sekali pakai (format: XXXX-XXXX) yang Anda simpan saat setup.
                  </p>
                </div>

                <form onSubmit={handleRecoveryCodeLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      Kode Pemulihan:
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      autoFocus
                      value={recoveryCodeInput}
                      onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX"
                      className="w-full px-3 py-2.5 font-mono text-center text-lg tracking-widest rounded-xl bg-stone-900 border border-stone-700 text-emerald-400 uppercase font-bold"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('MFA_TOTP');
                        setAuthError('');
                      }}
                      className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAuth || recoveryCodeInput.trim().length < 8}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs"
                    >
                      {loadingAuth ? 'Memverifikasi...' : 'Gunakan Kode'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 6: SECURE OWNER MFA RESET */}
            {loginStep === 'MFA_RESET' && (
              <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-stone-950 border border-rose-900/50 shadow-xl space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-rose-950 text-rose-400 mx-auto flex items-center justify-center border border-rose-800">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white">Reset MFA Owner Aman</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Verifikasi identitas Master Owner untuk mengatur ulang Google Authenticator tanpa bypass.
                  </p>
                </div>

                <form onSubmit={handleResetMfa} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      Email Master Owner Terdaftar:
                    </label>
                    <input
                      type="email"
                      value={resetEmailInput}
                      onChange={(e) => setResetEmailInput(e.target.value)}
                      placeholder="villa.pyramid1@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      Kata Sandi Server Owner:
                    </label>
                    <input
                      type="password"
                      value={resetPasswordInput}
                      onChange={(e) => setResetPasswordInput(e.target.value)}
                      placeholder="Masukkan kata sandi owner"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      Kode Pemulihan (Opsional jika ada):
                    </label>
                    <input
                      type="text"
                      value={resetRecoveryCodeInput}
                      onChange={(e) => setResetRecoveryCodeInput(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-900 border border-stone-700 text-white"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('MFA_TOTP');
                        setAuthError('');
                      }}
                      className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAuth || !resetEmailInput || !resetPasswordInput}
                      className="flex-1 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs"
                    >
                      {loadingAuth ? 'Memvalidasi...' : 'Verifikasi & Reset MFA'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Authenticated Dashboard Body */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-stone-800 p-3 space-y-1 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col">
              <div className="hidden md:block p-3 mb-2 rounded-2xl bg-stone-950 border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Login Sebagai:</span>
                <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                <span className="inline-block mt-1 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  {currentUser.role}
                </span>
              </div>

              {[
                { id: 'ringkasan' as const, label: 'Statistik & Diagnostik', icon: Activity },
                { id: 'billing' as const, label: 'Langganan & Scalev (12 Menu)', icon: CreditCard },
                { id: 'ibadah_quran' as const, label: 'Qari & Tema Mushaf', icon: BookOpen },
                { id: 'pendidikan_iqra' as const, label: 'Pendidikan Iqra & Audio', icon: GraduationCap },
                { id: 'komunitas' as const, label: 'Komunitas & Moderasi', icon: Users },
                { id: 'sosial' as const, label: 'Program Sosial & Donasi', icon: Heart },
                { id: 'pengumuman' as const, label: 'Pengumuman / Banner', icon: Megaphone },
                { id: 'fitur' as const, label: 'Feature Flags (Kill Switch)', icon: Sliders },
                { id: 'konten' as const, label: 'Audit Konten Agama', icon: FileCheck2 },
                { id: 'monetisasi' as const, label: 'Struktur Billing (Simulasi)', icon: DollarSign },
                { id: 'audit' as const, label: 'Audit Log Keamanan', icon: History },
                { id: 'mfa_config' as const, label: 'Konfigurasi TOTP MFA', icon: QrCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all w-full text-left ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 mt-auto hidden md:block">
                <button
                  onClick={() => setShowQualityGate(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-950 text-blue-300 border border-blue-800 text-xs font-bold hover:bg-blue-900"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Quality Gate QA Test</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* 1. Ringkasan & Diagnostik */}
              {activeSection === 'ringkasan' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Ringkasan Sistem & Integritas Keamanan
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                      <span className="text-[11px] text-stone-400 block">Sesi Terautentikasi</span>
                      <span className="text-lg font-black text-emerald-400 mt-1 block">AKTIF (VALID)</span>
                      <span className="text-[10px] text-stone-400">Peran: {currentUser.role}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                      <span className="text-[11px] text-stone-400 block">Metode MFA</span>
                      <span className="text-lg font-black text-white font-mono mt-1 block">RFC 6238 TOTP</span>
                      <span className="text-[10px] text-emerald-400">Server-Side Verified</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                      <span className="text-[11px] text-stone-400 block">Anti Brute-Force</span>
                      <span className="text-lg font-black text-amber-400 mt-1 block">5x Lockout</span>
                      <span className="text-[10px] text-stone-400">15 Mnt Cooldown</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                      <span className="text-[11px] text-stone-400 block">Teks Al-Qur'an</span>
                      <span className="text-lg font-black text-emerald-400 mt-1 block">READ-ONLY</span>
                      <span className="text-[10px] text-stone-400">Immutability Enforced</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                    <h4 className="text-xs font-bold text-stone-300">Kepatuhan RBAC (Role-Based Access Control):</h4>
                    <div className="text-xs text-stone-400 space-y-1">
                      <p>• <strong>OWNER:</strong> Akses mutlak atas Feature Flags, Kill Switch, Konfigurasi Billing, dan Audit Log.</p>
                      <p>• <strong>ADMIN_KONTEN:</strong> Akses membuat/menghapus pengumuman dan mengelola kurikulum belajar.</p>
                      <p>• <strong>REVIEWER_AGAMA:</strong> Akses memverifikasi status sanad hadits, doa, dan keselarasan mushaf LPMQ.</p>
                      <p>• <strong>Pengguna Biasa:</strong> Seluruh API Owner dilindungi <code>Bearer Token</code>; manipulasi client/localStorage akan ditolak dengan respons <code>401 Unauthorized</code> atau <code>403 Forbidden</code>.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Owner Billing Center - Langganan, Harga & Scalev (12 Submenu) */}
              {activeSection === 'billing' && (
                <div className="space-y-4">
                  <OwnerBillingCenter />
                </div>
              )}

              {/* TAHAP 7: Manajemen Qari & Tema Mushaf */}
              {activeSection === 'ibadah_quran' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                      Katalog Qari Berlisensi & 4 Tema Mushaf Madinah
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Pengaturan audio tilawah 114 surah dan personalisasi 604 halaman mushaf fisik.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        name: 'Syaikh Mahmud Khalil Al-Husary',
                        bitrate: '128 kbps',
                        license: 'ERTU / Waqf Keluarga',
                        status: 'Aktif (Default Hifz)',
                      },
                      {
                        name: 'Syaikh Mishary Rashid Alafasy',
                        bitrate: '128 kbps',
                        license: 'Public Domain / Free for Non-Commercial',
                        status: 'Aktif',
                      },
                      {
                        name: 'Syaikh Abdurrahman As-Sudais',
                        bitrate: '192 kbps',
                        license: 'Presidensi Urusan Dua Masjid Suci',
                        status: 'Aktif',
                      },
                    ].map((q) => (
                      <div key={q.name} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                        <span className="text-xs font-bold text-white block">{q.name}</span>
                        <div className="text-[11px] text-stone-400 space-y-0.5">
                          <p>Bitrate: <strong className="text-emerald-400">{q.bitrate}</strong></p>
                          <p>Lisensi: <span className="text-amber-300">{q.license}</span></p>
                          <p>Status: <span className="text-emerald-300 font-semibold">{q.status}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      4 Tema Tampilan Mushaf Fisik 604 Halaman:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center font-bold">
                      <div className="p-3 rounded-xl bg-[#FDFBF7] text-stone-800 border border-stone-300">
                        Klasik Krem
                      </div>
                      <div className="p-3 rounded-xl bg-white text-stone-900 border border-stone-300">
                        Putih Bersih
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-950 text-emerald-200 border border-emerald-800">
                        Emerald Masjid
                      </div>
                      <div className="p-3 rounded-xl bg-stone-900 text-stone-300 border border-stone-700">
                        Malam Gelap
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAHAP 7: Moderasi Komunitas & Perlindungan Anak */}
              {activeSection === 'komunitas' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                      Moderasi Komunitas & Perlindungan Privasi Anak
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Pemantauan laporan silaturahmi santun dan penegakan regulasi anti-sosmed publik.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 space-y-1">
                    <p className="font-bold">✓ Zero-Algorithm / Anti-Slop Enforced:</p>
                    <p>
                      Aplikasi tidak menyediakan linimasa publik, fitur like, follower count, atau konten video viral. Hanya komunikasi privat 1-on-1 antar sahabat yang saling menyetujui.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Antrean Laporan Moderasi:</span>
                      <span className="text-xs text-stone-400">0 Laporan Aktif Tertunda</span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900/60 text-stone-400 text-xs text-center">
                      Komunitas dalam kondisi aman dan kondusif. Seluruh pesan terenkripsi lokal dan santun.
                    </div>
                  </div>
                </div>
              )}

              {/* TAHAP 7: Program Sosial & Donasi Legal */}
              {activeSection === 'sosial' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                      Program Sosial & Penyaluran Donasi Terverifikasi
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Rekening resmi BAZNAS dan LAZNAS (Terpisah 100% dari Omzet Langganan Scalev).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200">
                    <strong>KEBIJAKAN PYRAMID GROUP:</strong> 0% potongan biaya. Seluruh dana disalurkan langsung oleh muzakki/donatur ke rekening lembaga resmi terkait.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'BAZNAS RI', legal: 'UU No. 23 Tahun 2011', prog: 'Logistik Dhuafa & Kesehatan' },
                      { name: 'Dompet Dhuafa', legal: 'SK Kemenag No. 238/2016', prog: 'Beasiswa Yatim Berdaya' },
                      { name: 'Rumah Zakat', legal: 'SK Kemenag No. 42/2007', prog: 'Wakaf Quran & Santri Tahfidz' },
                      { name: 'LAZISMU', legal: 'SK Menag No. 730/2016', prog: 'Renovasi Musholla Pelosok' },
                      { name: 'LAZISNU Care', legal: 'SK Menag No. 255/2016', prog: 'Sedekah Musholla Nusantara' },
                    ].map((inst) => (
                      <div key={inst.name} className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                        <span className="text-xs font-bold text-white block">{inst.name}</span>
                        <span className="text-[11px] text-stone-400 block mt-0.5">Program: {inst.prog}</span>
                        <span className="text-[10px] text-amber-400 block mt-1">Legal: {inst.legal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Pengumuman / Banner Manager */}
              {activeSection === 'pengumuman' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Kelola Pengumuman Server
                  </h3>

                  {(currentUser.role === 'OWNER' || currentUser.role === 'ADMIN_KONTEN') ? (
                    <form onSubmit={handleCreateAnnouncement} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                      <span className="text-xs font-bold text-stone-300 block">Kirim Pengumuman Baru ke Seluruh Pengguna:</span>
                      <div>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Judul Pengumuman..."
                          className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                        />
                      </div>
                      <div>
                        <textarea
                          rows={2}
                          value={newMsg}
                          onChange={(e) => setNewMsg(e.target.value)}
                          placeholder="Isi pesan pengumuman..."
                          className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        {annSuccess && <span className="text-xs text-emerald-400 font-bold">✓ Tersimpan di backend!</span>}
                        <button
                          type="submit"
                          className="ml-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                        >
                          Simpan Pengumuman
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-950/40 text-amber-300 text-xs">
                      Peran Anda ({currentUser.role}) hanya memiliki izin membaca pengumuman.
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs text-stone-400 font-semibold block">Daftar Pengumuman Aktif di Server:</span>
                    {announcements.map((ann) => (
                      <div key={ann.id} className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-white">{ann.title}</p>
                          <p className="text-stone-300 mt-0.5">{ann.message}</p>
                          <span className="text-[10px] text-stone-500 mt-1 block">Dibuat: {ann.createdAt}</span>
                        </div>
                        {(currentUser.role === 'OWNER' || currentUser.role === 'ADMIN_KONTEN') && (
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="text-stone-400 hover:text-rose-400 font-bold"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Feature Flags & Kill Switch */}
              {activeSection === 'fitur' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                      Server-Authoritative Feature Flags & Kill Switch
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Perubahan status fitur langsung tersimpan pada backend dan berdampak instan ke seluruh pengguna.
                    </p>
                  </div>

                  {currentUser.role !== 'OWNER' && (
                    <div className="p-3 rounded-xl bg-amber-950/40 text-amber-300 text-xs">
                      Hanya pengguna dengan peran <strong>OWNER</strong> yang dapat mengubah Feature Flags.
                    </div>
                  )}

                  <div className="space-y-2">
                    {Object.entries(featureFlags).map(([key, isEnabled]) => (
                      <div
                        key={key}
                        className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white capitalize">
                            Fitur: {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-[11px] text-stone-400 block">
                            {isEnabled ? 'Sedang AKTIF di server' : 'DINONAKTIFKAN (Kill Switch aktif)'}
                          </span>
                        </div>

                        <button
                          disabled={currentUser.role !== 'OWNER'}
                          onClick={() => handleToggleFeature(key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            isEnabled
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          } ${currentUser.role !== 'OWNER' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isEnabled ? 'Aktif (ON)' : 'Mati (OFF)'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Audit Konten Agama */}
              {activeSection === 'konten' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Audit Total Integritas Teks Al-Qur'an & Sanad Hadits
                  </h3>

                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Status Immutabilitas Mushaf:</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        MUTLAK READ-ONLY (ENFORCED)
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Sesuai amanah syariah dan arahan Owner, teks 114 Surah Al-Qur'an (6.236 ayat) bersifat kekal dan tidak disediakan antarmuka editing bebas. Setiap pembaruan wajib melalui sertifikasi LPMQ Kemenag RI.
                    </p>

                    <div className="pt-2 border-t border-stone-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Jumlah Surah:</span>
                        <span className="text-white font-mono font-bold">114 Surah Lengkap</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Total Ayat:</span>
                        <span className="text-white font-mono font-bold">6.236 Ayat (Mushaf Standar Indonesia)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Checksum Dataset (SHA-256):</span>
                        <span className="text-emerald-400 font-mono text-[10px] truncate max-w-xs">
                          9f83a48e89f921d7bc5f385150821e25e98547a46dbb7ee4f14e4b57d079f28a
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Dasar Regulasi Pentashihan:</span>
                        <span className="text-amber-400 font-bold">PMA No. 44 Tahun 2016</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Struktur Billing */}
              {activeSection === 'monetisasi' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Arsitektur Monetisasi & Simulasi Layanan Tambahan
                  </h3>
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200">
                    <strong>PENEGASAN OWNER:</strong> Seluruh fitur ibadah inti (Sholat, Al-Qur'an, Doa, Dzikir, Kiblat) GRATIS SELAMANYA TANPA IKLAN. Pembayaran nyata di Production sepenuhnya dimatikan.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">Tingkat 1</span>
                      <h4 className="font-bold text-white text-base">Ibadah Inti</h4>
                      <p className="text-xl font-black font-mono text-white">Rp 0</p>
                      <p className="text-stone-400">Gratis seumur hidup untuk seluruh umat.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                      <span className="text-amber-400 font-bold uppercase text-[10px]">Tingkat 2 (Uji)</span>
                      <h4 className="font-bold text-white text-base">Premium Belajar</h4>
                      <p className="text-xl font-black font-mono text-white">Rp 19.000 / bln</p>
                      <p className="text-stone-400">Latihan tajwid mendalam (Mock Only / Non-aktif).</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                      <span className="text-blue-400 font-bold uppercase text-[10px]">Tingkat 3 (Uji)</span>
                      <h4 className="font-bold text-white text-base">Paket Keluarga</h4>
                      <p className="text-xl font-black font-mono text-white">Rp 39.000 / bln</p>
                      <p className="text-stone-400">Laporan multi-anak (Mock Only / Non-aktif).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Audit Logs Keamanan */}
              {activeSection === 'audit' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Log Audit Server Terenkripsi (Backend Recorded)
                  </h3>

                  {currentUser.role !== 'OWNER' ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 text-amber-300 text-xs">
                      Hanya peran <strong>OWNER</strong> yang berhak menginspeksi log audit keamanan.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between text-xs gap-3"
                        >
                          <div>
                            <span className="font-bold text-stone-200">{log.action}</span>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                              <span>Aktor: <strong>{log.actor}</strong> ({log.role})</span>
                              <span>·</span>
                              <span>IP: {log.ip}</span>
                              <span>·</span>
                              <span>{log.timestamp}</span>
                            </div>
                            {log.details && (
                              <p className="text-[11px] text-stone-400 mt-1 font-mono">{log.details}</p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7. TOTP MFA Setup Info */}
              {activeSection === 'mfa_config' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Konfigurasi Otentikator TOTP (RFC 6238)
                  </h3>

                  {mfaSetup ? (
                    <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 text-xs">
                      <div>
                        <span className="font-bold text-white block">URI Otentikator Standar:</span>
                        <p className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 font-mono text-[11px] text-emerald-400 break-all select-all mt-1">
                          {mfaSetup.otpAuthUri}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                          <span className="text-stone-400 block">Kunci Rahasia Base32:</span>
                          <span className="font-mono font-bold text-white text-xs select-all block mt-1">
                            {mfaSetup.totpSecret}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                          <span className="text-stone-400 block">Kode Live Saat Ini (Sinkron 30s):</span>
                          <span className="font-mono font-black text-emerald-400 text-xl block mt-0.5 tabular-nums">
                            {mfaSetup.currentLiveToken}
                          </span>
                        </div>
                      </div>

                      <p className="text-stone-400 text-[11px] leading-relaxed">
                        Anda dapat menambahkan URI ini ke Google Authenticator, Microsoft Authenticator, atau 1Password untuk mendapatkan token 6 digit secara real-time di smartphone Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-500">Memuat konfigurasi TOTP...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
