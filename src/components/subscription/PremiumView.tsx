import React, { useState, useEffect } from 'react';
import {
  clientSubscriptionService,
  ClientPlan,
  UserEntitlement,
} from '../../services/subscriptionService';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Users,
  Award,
  CreditCard,
  Tag,
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  HeartHandshake,
  AlertCircle,
  Smartphone,
} from 'lucide-react';

export const PremiumView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_belajar');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1); // 1, 3, 6, 12 bulan

  // Form & Checkout State
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState<{ valid: boolean; discountAmountIdr?: number; message?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
  const billingMode = clientSubscriptionService.getAndroidBillingMode();

  useEffect(() => {
    loadPlansAndEntitlement();
  }, []);

  const loadPlansAndEntitlement = async () => {
    const fetchedPlans = await clientSubscriptionService.getPlans();
    if (fetchedPlans && fetchedPlans.length > 0) {
      setPlans(fetchedPlans);
    }
    const myEnt = await clientSubscriptionService.getMyEntitlement();
    setEntitlement(myEnt);
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1] || plans[0];
  const selectedPriceTier = selectedPlan?.prices?.find((pr) => pr.periodMonths === selectedPeriod);
  const basePrice = selectedPriceTier ? selectedPriceTier.priceIdr : 19000;
  const discountVal = voucherResult?.valid ? (voucherResult.discountAmountIdr || 0) : 0;
  const finalPrice = Math.max(0, basePrice - discountVal);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setErrorMessage('');
    const res = await clientSubscriptionService.validateVoucher(voucherCode, selectedPlanId, selectedPeriod);
    if (res.valid) {
      setVoucherResult({ valid: true, discountAmountIdr: res.discountAmountIdr, message: res.description });
    } else {
      setVoucherResult({ valid: false, message: res.message || 'Kode voucher tidak valid.' });
    }
  };

  const handleProceedScalevCheckout = async () => {
    if (!customerEmail.trim() || !customerName.trim()) {
      setErrorMessage('Silakan lengkapi nama dan alamat email Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await clientSubscriptionService.createCheckout({
        planId: selectedPlanId,
        periodMonths: selectedPeriod,
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        voucherCode: voucherResult?.valid ? voucherCode.trim() : undefined,
      });

      if (res.success && res.checkoutUrl) {
        setCheckoutUrl(res.checkoutUrl);
        // Buka checkout resmi Scalev di tab baru atau window
        window.open(res.checkoutUrl, '_blank');
      } else {
        setErrorMessage(res.error || 'Gagal membuat sesi pembayaran Scalev.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Terjadi kesalahan sistem pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white relative overflow-hidden shadow-xl border border-emerald-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              AKU MUSLIM Premium
            </span>
            {entitlement?.isPremium && (
              <span className="px-3 py-1 rounded-full bg-emerald-700 text-emerald-200 text-xs font-bold border border-emerald-500">
                Status: {entitlement.planName} Aktif
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sahabat Terbaik untuk Belajar & Menghafal Al-Qur'an
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Dukung keluarga Anda semakin istiqomah menghafal Al-Qur'an dengan teknologi Smart Hifz real-time, tajwid mendalam, dan dashboard pantau orang tua.
          </p>
        </div>
      </div>

      {/* Pesan Sukses Aktivasi */}
      {paymentSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 text-center space-y-3 shadow-md animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <div>
            <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-100">
              Alhamdulillah, AKU MUSLIM Premium Anda telah aktif!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Semoga semakin semangat belajar dan menghafal Al-Qur'an. Seluruh fitur berbayar kini otomatis terbuka.
            </p>
          </div>
        </div>
      )}

      {/* Google Play Consumption-Only Notice (Jika Terbuka di HP Android) */}
      {isAndroid && billingMode === 'CONSUMPTION_ONLY' && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Kepatuhan Resmi Google Play Store:</span>
            <p className="text-[11px] leading-relaxed opacity-90">
              Aplikasi Android AKU MUSLIM mendukung sinkronisasi akun terpusat. Langganan Premium yang diaktifkan melalui akun Anda otomatis terbuka di seluruh perangkat Android tanpa perlu mengunduh ulang APK.
            </p>
          </div>
        </div>
      )}

      {/* Period Billing Switcher */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Pilih Periode Berlangganan:
        </span>
        <div className="inline-flex p-1.5 bg-stone-100 dark:bg-stone-800 rounded-2xl gap-1 border border-stone-200 dark:border-stone-700 max-w-full overflow-x-auto">
          {[
            { months: 1, label: '1 Bulan' },
            { months: 3, label: '3 Bulan', badge: 'Hemat 5%' },
            { months: 6, label: '6 Bulan', badge: 'Hemat 10%' },
            { months: 12, label: '12 Bulan (1 Thn)', badge: 'Hemat 17%' },
          ].map((item) => (
            <button
              key={item.months}
              onClick={() => setSelectedPeriod(item.months)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                selectedPeriod === item.months
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="block text-[9px] font-extrabold text-amber-300 mt-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* PLAN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PAKET 1: GRATIS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                Fitur Ibadah Inti
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">AKU MUSLIM Gratis</h3>
              <p className="text-xs text-stone-500 mt-0.5">Ibadah lengkap & tanpa iklan selamanya.</p>
            </div>
            <div className="pt-2">
              <span className="text-3xl font-black text-stone-900 dark:text-white">Rp 0</span>
              <span className="text-xs text-stone-400 block mt-0.5">Gratis Selamanya</span>
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Al-Qur'an 30 Juz & 114 Surah Kemenag</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Jadwal Sholat & Kumandang Adzan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Arah Kiblat Kompas Sensor</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Doa, Dzikir Pagi Petang & Tasbih</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kalkulator Zakat SK BAZNAS 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Smart Hifz Latihan Dasar</span>
              </div>
            </div>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-700 text-stone-500 font-bold text-xs"
          >
            Paket Bawaan Aktif
          </button>
        </div>

        {/* PAKET 2: PREMIUM BELAJAR */}
        <div
          onClick={() => setSelectedPlanId('plan_belajar')}
          className={`p-6 rounded-3xl bg-white dark:bg-stone-800 border-2 shadow-lg flex flex-col justify-between space-y-4 cursor-pointer transition-all relative ${
            selectedPlanId === 'plan_belajar'
              ? 'border-emerald-600 ring-4 ring-emerald-500/20'
              : 'border-stone-200 dark:border-stone-700 hover:border-emerald-400'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Paling Populer
              </span>
              <span className="text-[10px] font-semibold text-stone-400">1 Pengguna</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">Premium Belajar</h3>
              <p className="text-xs text-stone-500 mt-0.5">Tingkatkan hafalan & bacaan tartil.</p>
            </div>
            <div className="pt-2">
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                Rp {selectedPeriod === 1 ? '19.000' : selectedPeriod === 3 ? '54.000' : selectedPeriod === 6 ? '102.000' : '190.000'}
              </span>
              <span className="text-xs text-stone-400 block mt-0.5">
                / {selectedPeriod === 1 ? 'bulan' : `${selectedPeriod} bulan`}
              </span>
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Smart Hifz Lanjutan (Real-Time Reveal & Auto-Next)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ujian Sambung Ayat & Ujian Acak</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Jadwal Murajaah Terjadwal</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tajwid Visual & Animasi Makhraj</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Statistik & Analisis Hafalan Pribadi</span>
              </div>
            </div>
          </div>

          <button
            className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all ${
              selectedPlanId === 'plan_belajar'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            {selectedPlanId === 'plan_belajar' ? '✓ Paket Terpilih' : 'Pilih Paket Ini'}
          </button>
        </div>

        {/* PAKET 3: PREMIUM KELUARGA */}
        <div
          onClick={() => setSelectedPlanId('plan_keluarga')}
          className={`p-6 rounded-3xl bg-gradient-to-b from-white to-amber-50/50 dark:from-stone-800 dark:to-stone-900 border-2 shadow-lg flex flex-col justify-between space-y-4 cursor-pointer transition-all relative ${
            selectedPlanId === 'plan_keluarga'
              ? 'border-amber-500 ring-4 ring-amber-500/20'
              : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-stone-900 shadow-xs">
                Hemat Untuk Keluarga
              </span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Hingga 5 Profil
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">Premium Keluarga</h3>
              <p className="text-xs text-stone-500 mt-0.5">Pantau & dampingi belajar seluruh anak.</p>
            </div>
            <div className="pt-2">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                Rp {selectedPeriod === 1 ? '39.000' : selectedPeriod === 3 ? '109.000' : selectedPeriod === 6 ? '209.000' : '390.000'}
              </span>
              <span className="text-xs text-stone-400 block mt-0.5">
                / {selectedPeriod === 1 ? 'bulan' : `${selectedPeriod} bulan`} (5 HP/Profil)
              </span>
            </div>

            <div className="space-y-2 pt-3 border-t border-amber-200/60 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <Users className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Seluruh Fasilitas Premium Belajar (5 Profil)</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dashboard Orang Tua & Pantau Aktivitas Anak</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Target Hafalan Anak & Audio Apresiasi</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Laporan Harian, Mingguan & Bulanan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sinkronisasi Antar-Perangkat Real-time</span>
              </div>
            </div>
          </div>

          <button
            className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all ${
              selectedPlanId === 'plan_keluarga'
                ? 'bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-md'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            {selectedPlanId === 'plan_keluarga' ? '✓ Paket Terpilih' : 'Pilih Paket Keluarga'}
          </button>
        </div>
      </div>

      {/* CHECKOUT SUMMARY & SCALEV PAYMENT FORM */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-5 max-w-xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Rincian Pembayaran AKU MUSLIM
            </h3>
          </div>
          <span className="text-[10px] text-stone-400">Pengelola: PYRAMID GROUP</span>
        </div>

        {/* Selected Plan Details */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 space-y-2 text-xs">
          <div className="flex justify-between font-bold text-stone-900 dark:text-white">
            <span>{selectedPlan.name} ({selectedPeriod} Bulan)</span>
            <span>Rp {basePrice.toLocaleString('id-ID')}</span>
          </div>

          {voucherResult?.valid && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
              <span>Diskon Voucher ({voucherCode.toUpperCase()})</span>
              <span>- Rp {(voucherResult.discountAmountIdr || 0).toLocaleString('id-ID')}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-stone-700 text-sm font-black text-emerald-800 dark:text-emerald-300">
            <span>Total Tagihan:</span>
            <span>Rp {finalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Voucher Input */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            Kode Voucher Diskon (Opsional):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: RAMADHANBERKAH"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-white uppercase"
            />
            <button
              onClick={handleApplyVoucher}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs"
            >
              Gunakan
            </button>
          </div>
          {voucherResult?.message && (
            <span className={`text-[11px] block mt-1 ${voucherResult.valid ? 'text-emerald-600 font-semibold' : 'text-rose-500'}`}>
              {voucherResult.message}
            </span>
          )}
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Nama Lengkap:
            </label>
            <input
              type="text"
              placeholder="Nama Anda"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Alamat Email (Untuk Entitlement Akun):
            </label>
            <input
              type="email"
              placeholder="email@anda.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-medium"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Payment Button */}
        <div className="space-y-2 pt-2">
          <button
            disabled={isSubmitting}
            onClick={handleProceedScalevCheckout}
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Bayar Sekarang (Portal Resmi Scalev)</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-stone-400 text-center leading-relaxed">
            Pembayaran diproses aman melalui <strong>Scalev</strong> (QRIS, Virtual Account, & E-Wallet). Begitu pembayaran berhasil, status Premium otomatis aktif seketika.
          </p>
        </div>
      </div>
    </div>
  );
};
