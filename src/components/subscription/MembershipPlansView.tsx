import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  ChevronLeft,
  HelpCircle,
  Sparkles,
  Users,
  BookOpen,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export interface MembershipPlanTier {
  id: 'plan_belajar' | 'plan_keluarga';
  name: string;
  badge: string;
  description: string;
  maxProfiles: number;
  periods: {
    months: 1 | 3 | 6 | 12;
    label: string;
    priceIdr: number;
    priceFormatted: string;
    monthlyEquivalent: string;
  }[];
}

export const APPROVED_MEMBERSHIP_PLANS: MembershipPlanTier[] = [
  {
    id: 'plan_belajar',
    name: 'Keanggotaan Premium Belajar',
    badge: '1 Profil Mandiri',
    description: 'Akses penuh Smart Hifz lanjutan, evaluasi suara tartil, audio qari lengkap, dan bebas iklan.',
    maxProfiles: 1,
    periods: [
      { months: 1, label: '1 Bulan', priceIdr: 19000, priceFormatted: 'Rp 19.000', monthlyEquivalent: 'Rp 19.000/bln' },
      { months: 3, label: '3 Bulan', priceIdr: 54000, priceFormatted: 'Rp 54.000', monthlyEquivalent: 'Rp 18.000/bln' },
      { months: 6, label: '6 Bulan', priceIdr: 102000, priceFormatted: 'Rp 102.000', monthlyEquivalent: 'Rp 17.000/bln' },
      { months: 12, label: '12 Bulan', priceIdr: 190000, priceFormatted: 'Rp 190.000', monthlyEquivalent: 'Rp 15.833/bln' },
    ],
  },
  {
    id: 'plan_keluarga',
    name: 'Keanggotaan Premium Keluarga',
    badge: 'Hingga 5 Profil',
    description: 'Seluruh fitur Belajar + Dashboard Aktivitas Keluarga, kontrol orang tua, dan kuota 5 anggota.',
    maxProfiles: 5,
    periods: [
      { months: 1, label: '1 Bulan', priceIdr: 39000, priceFormatted: 'Rp 39.000', monthlyEquivalent: 'Rp 39.000/bln' },
      { months: 3, label: '3 Bulan', priceIdr: 111000, priceFormatted: 'Rp 111.000', monthlyEquivalent: 'Rp 37.000/bln' },
      { months: 6, label: '6 Bulan', priceIdr: 210000, priceFormatted: 'Rp 210.000', monthlyEquivalent: 'Rp 35.000/bln' },
      { months: 12, label: '12 Bulan', priceIdr: 390000, priceFormatted: 'Rp 390.000', monthlyEquivalent: 'Rp 32.500/bln' },
    ],
  },
];

interface MembershipPlansViewProps {
  onBack?: () => void;
  onSelectPlan?: (planId: string, periodMonths: number, priceIdr: number) => void;
}

export const MembershipPlansView: React.FC<MembershipPlansViewProps> = ({
  onBack,
  onSelectPlan,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'plan_belajar' | 'plan_keluarga'>('plan_belajar');
  const [selectedMonths, setSelectedMonths] = useState<1 | 3 | 6 | 12>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const currentPlan = APPROVED_MEMBERSHIP_PLANS.find((p) => p.id === selectedPlanId) || APPROVED_MEMBERSHIP_PLANS[0];
  const currentPeriod = currentPlan.periods.find((p) => p.months === selectedMonths) || currentPlan.periods[0];

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onSelectPlan) {
        onSelectPlan(selectedPlanId, selectedMonths, currentPeriod.priceIdr);
      }
    }, 800);
  };

  // 15 Hak Istimewa Keanggotaan (Bersih & Sesuai Nilai Islami Tanpa Fake Urgency)
  const MEMBERSHIP_FEATURES = [
    { title: 'Bebas Iklan', icon: '✨' },
    { title: 'Bonus Poin Harian', icon: '⚡' },
    { title: 'Penyaluran Infaq', icon: '🤲' },
    { title: 'Audio Adzan Tanah Suci', icon: '🕌' },
    { title: 'Widget Jadwal Sholat', icon: '📱' },
    { title: 'Multi-Perangkat', icon: '📲' },
    { title: 'Tuntunan Sholat Lengkap', icon: '🧎‍♂️' },
    { title: 'Doa & Hadits Favorit', icon: '❤️' },
    { title: 'Dashboard Keluarga', icon: '👥' },
    { title: 'Smart Hifz 114 Surah', icon: '📖' },
    { title: 'Evaluasi Tartil Qari', icon: '🎙️' },
    { title: 'Tajwid Warna Visual', icon: '🎨' },
    { title: 'Murottal Layar Mati', icon: '🎧' },
    { title: 'Pelacak Sholat Privat', icon: '📅' },
    { title: 'Penyimpanan Progres Lokal', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8cfb0] via-[#eedbc5] to-[#f7eedf] dark:from-[#1c1813] dark:via-[#262017] dark:to-[#17130d] text-stone-900 dark:text-stone-100 flex flex-col justify-between pb-8">
      {/* Top App Bar */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-black tracking-wide">
            Keanggotaan AKU MUSLIM
          </h1>
          <span className="text-[10px] text-stone-600 dark:text-stone-400 font-semibold block">
            Harga Resmi Keputusan Owner (Preview / Staging)
          </span>
        </div>

        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          <HelpCircle className="w-5 h-5 text-stone-700 dark:text-stone-300" />
        </button>
      </div>

      {/* Grid of 15 Features in Warm Gold */}
      <div className="px-5 py-2 flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-y-4 gap-x-2.5 text-center mb-4">
          {MEMBERSHIP_FEATURES.map((feat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center space-y-1 group">
              <div className="w-11 h-11 rounded-2xl bg-[#edd8bc] dark:bg-stone-800/80 border border-[#dfc29e] dark:border-stone-700 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                {feat.icon}
              </div>
              <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200 leading-tight max-w-24">
                {feat.title}
              </span>
            </div>
          ))}
        </div>

        {/* Free Core Guarantee Banner */}
        <div className="p-3 rounded-2xl bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-700/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Jaminan Syariah:</strong> Al-Qur'an 30 Juz, Jadwal Sholat, Arah Kiblat, Iqra Dasar, dan Zakat <strong>100% GRATIS SELAMANYA</strong>.
          </span>
        </div>
      </div>

      {/* Bottom Sheet Action Container: Official Owner Pricing Selector */}
      <div className="bg-white dark:bg-stone-900 rounded-t-3xl shadow-2xl p-5 sm:p-6 space-y-4 border-t border-stone-200 dark:border-stone-800">
        {/* Tier Selector (Belajar vs Keluarga) */}
        <div className="grid grid-cols-2 gap-2.5">
          {APPROVED_MEMBERSHIP_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    {plan.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
                </div>
                <p className="font-bold text-xs text-stone-900 dark:text-white mt-1">
                  {plan.id === 'plan_belajar' ? 'Premium Belajar' : 'Premium Keluarga'}
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Mulai {plan.periods[0].priceFormatted}/bln
                </p>
              </button>
            );
          })}
        </div>

        {/* Duration Selector (1, 3, 6, 12 Bulan) */}
        <div>
          <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1.5">
            Pilih Durasi Keanggotaan:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {currentPlan.periods.map((period) => {
              const isSelected = selectedMonths === period.months;
              return (
                <button
                  key={period.months}
                  onClick={() => setSelectedMonths(period.months)}
                  className={`py-2 px-1 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-stone-950 font-black shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-semibold'
                  }`}
                >
                  <span className="text-xs block">{period.label}</span>
                  <span className="text-[10px] block font-mono">
                    {period.priceFormatted}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Price Summary */}
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              Total Pembayaran:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black font-mono text-stone-900 dark:text-white">
                {currentPeriod.priceFormatted}
              </span>
              <span className="text-xs text-stone-500">
                ({currentPeriod.monthlyEquivalent})
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
            Tanpa Perpanjangan Otomatis
          </span>
        </div>

        {/* Honest CTA Button (Tanpa Fake Trial / Tanpa Fake Urgency) */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ffd363] via-[#ffc636] to-[#f5b820] text-stone-950 font-black text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Pilih Paket {currentPlan.name} ({currentPeriod.priceFormatted})</span>
          )}
        </button>

        {/* Honest Subtext */}
        <p className="text-[10px] text-center text-stone-500 dark:text-stone-400 leading-relaxed">
          Pembayaran satu kali untuk durasi {currentPeriod.label}. Tidak ada tagihan tersembunyi atau jebakan langganan. Dikelola aman via Scalev (Mode Staging / Preview).
        </p>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-3">
            <h3 className="text-sm font-black text-stone-900 dark:text-white">
              Struktur Keanggotaan Resmi
            </h3>
            <div className="text-xs text-stone-600 dark:text-stone-300 space-y-2 leading-relaxed">
              <p>
                <strong>Premium Belajar:</strong> Rp 19.000/bln (Rp 54k/3bln, Rp 102k/6bln, Rp 190k/12bln). Untuk 1 pengguna pribadi.
              </p>
              <p>
                <strong>Premium Keluarga:</strong> Rp 39.000/bln (Rp 111k/3bln, Rp 210k/6bln, Rp 390k/12bln). Untuk hingga 5 anggota keluarga.
              </p>
              <p>
                <strong>Anggota Lembaga:</strong> Status dinonaktifkan sesuai keputusan Owner.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
