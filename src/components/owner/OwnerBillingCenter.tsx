import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Tag,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Gift,
  TrendingUp,
  History,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Edit2,
  Save,
  Clock,
  Eye,
  Sliders,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const OwnerBillingCenter: React.FC = () => {
  const [activeSubmenu, setActiveSubmenu] = useState<
    | 'summary'
    | 'plans'
    | 'features'
    | 'prices'
    | 'vouchers'
    | 'customers'
    | 'family'
    | 'scalev'
    | 'transactions'
    | 'grants'
    | 'revenue'
    | 'audit'
  >('summary');

  // Server Data
  const [summaryData, setSummaryData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [scalevConfig, setScalevConfig] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [familySettings, setFamilySettings] = useState<any>(null);

  // Notifications
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forms State
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantName, setGrantName] = useState('');
  const [grantPlanId, setGrantPlanId] = useState('plan_keluarga');
  const [grantMonths, setGrantMonths] = useState(12);
  const [grantReason, setGrantReason] = useState('Mitra Dakwah & Keluarga Kehormatan');

  // New Voucher Form
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherVal, setNewVoucherVal] = useState(25);
  const [newVoucherType, setNewVoucherType] = useState<'PERCENTAGE' | 'FIXED_NOMINAL'>('PERCENTAGE');

  // Staging Webhook Simulator States (Submenu 8)
  const [simEventType, setSimEventType] = useState<'order.payment_status_changed' | 'payment.received' | 'payment.failed'>('order.payment_status_changed');
  const [simPlanId, setSimPlanId] = useState<'plan_belajar' | 'plan_keluarga'>('plan_belajar');
  const [simPeriodMonths, setSimPeriodMonths] = useState<number>(1);
  const [simEmail, setSimEmail] = useState('staging.tester@akumuslim.id');
  const [simName, setSimName] = useState('Tester QA Staging');
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sumRes, planRes, featRes, vchRes, custRes, scRes, txRes, audRes, famRes] = await Promise.all([
        fetch('/api/owner/billing/summary').then((r) => r.json()).catch(() => null),
        fetch('/api/owner/billing/plans').then((r) => r.json()).catch(() => null),
        fetch('/api/owner/billing/features').then((r) => r.json()).catch(() => []),
        fetch('/api/owner/billing/vouchers').then((r) => r.json()).catch(() => []),
        fetch('/api/owner/billing/customers').then((r) => r.json()).catch(() => []),
        fetch('/api/owner/billing/scalev-config').then((r) => r.json()).catch(() => null),
        fetch('/api/owner/billing/transactions').then((r) => r.json()).catch(() => []),
        fetch('/api/owner/billing/audit-logs').then((r) => r.json()).catch(() => []),
        fetch('/api/owner/billing/family-settings').then((r) => r.json()).catch(() => null),
      ]);

      if (sumRes) setSummaryData(sumRes);
      if (planRes) {
        setPlans(planRes.plans || []);
        setPrices(planRes.prices || []);
      }
      if (featRes) setFeatures(featRes);
      if (vchRes) setVouchers(vchRes);
      if (custRes) setCustomers(custRes);
      if (scRes) setScalevConfig(scRes);
      if (txRes) setTransactions(txRes);
      if (audRes) setAuditLogs(audRes);
      if (famRes) setFamilySettings(famRes);
    } finally {
      setLoading(false);
    }
  };

  const handleTestScalev = async () => {
    setStatusMsg('Menguji handshake koneksi Scalev v3...');
    setErrorMsg('');
    try {
      const res = await fetch('/api/owner/billing/scalev-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Koneksi Scalev Berhasil Terhubung! Store ID: ${data.storeId} (Ping: ${data.pingMs}ms)`);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Gagal terhubung ke Scalev.');
      }
    } catch {
      setErrorMsg('Gagal menguji koneksi Scalev.');
    }
  };

  const handleRunSimulation = async () => {
    setSimLoading(true);
    setSimResult(null);
    setErrorMsg('');
    try {
      const res = await fetch('/api/owner/billing/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: simEventType,
          planId: simPlanId,
          periodMonths: simPeriodMonths,
          customerEmail: simEmail,
          customerName: simName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimResult(data);
        setStatusMsg(`Simulasi Webhook (${simEventType}) Sukses! Order: ${data.order?.orderNumber || '-'}`);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Simulasi webhook gagal.');
      }
    } catch {
      setErrorMsg('Gagal mengirim simulasi webhook ke server.');
    } finally {
      setSimLoading(false);
    }
  };

  const handleToggleFeature = async (featureKey: string, planId: string, currentAllowed: string[]) => {
    setErrorMsg('');
    let nextAllowed = [...currentAllowed];
    if (nextAllowed.includes(planId)) {
      nextAllowed = nextAllowed.filter((p) => p !== planId);
    } else {
      nextAllowed.push(planId);
    }

    try {
      const res = await fetch(`/api/owner/billing/features/${featureKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedPlans: nextAllowed }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`Fasilitas "${featureKey}" berhasil diperbarui.`);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Gagal mengubah fasilitas.');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleGrantSpecial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim()) return;

    setStatusMsg('Memproses pemberian Premium khusus...');
    try {
      const res = await fetch('/api/owner/billing/grant-special', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: grantEmail.trim(),
          targetName: grantName.trim(),
          planId: grantPlanId,
          durationMonths: grantMonths,
          reason: grantReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Alhamdulillah, Premium berhasil diberikan kepada ${grantEmail} selama ${grantMonths} bulan.`);
        setGrantEmail('');
        loadAllData();
      }
    } catch {
      setErrorMsg('Gagal memproses grant premium.');
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode.trim()) return;

    try {
      const res = await fetch('/api/owner/billing/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newVoucherCode.trim().toUpperCase(),
          discountType: newVoucherType,
          discountValue: newVoucherVal,
          maxUses: 500,
          validFrom: '2026-01-01',
          validUntil: '2026-12-31',
        }),
      });
      if (res.ok) {
        setStatusMsg(`Voucher ${newVoucherCode.toUpperCase()} berhasil dibuat!`);
        setNewVoucherCode('');
        loadAllData();
      }
    } catch {
      setErrorMsg('Gagal membuat voucher.');
    }
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Submenu Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-700">
        {[
          { key: 'summary', label: '1. Ringkasan', icon: TrendingUp },
          { key: 'plans', label: '2. Paket & Harga', icon: Layers },
          { key: 'features', label: '3. Pengaturan Fasilitas', icon: Sliders },
          { key: 'prices', label: '4. Periode Diskon', icon: DollarSign },
          { key: 'vouchers', label: '5. Voucher Promo', icon: Tag },
          { key: 'customers', label: '6. Data Pelanggan', icon: Users },
          { key: 'family', label: '7. Premium Keluarga', icon: Users },
          { key: 'scalev', label: '8. Pembayaran Scalev', icon: CreditCard },
          { key: 'transactions', label: '9. Transaksi', icon: FileText },
          { key: 'grants', label: '10. Premium Gratis', icon: Gift },
          { key: 'revenue', label: '11. Laporan Omzet', icon: TrendingUp },
          { key: 'audit', label: '12. Audit Log', icon: History },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActiveSubmenu(item.key as any)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeSubmenu === item.key
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 rounded-xl flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUBMENU 1: RINGKASAN LANGGANAN */}
      {activeSubmenu === 'summary' && summaryData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-400 font-medium">Total Pelanggan</span>
              <div className="text-2xl font-black text-stone-900 dark:text-white">
                {summaryData.totalRegisteredUsers}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">
                {summaryData.totalActiveSubscribers} Berlangganan Aktif
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-400 font-medium">MRR (Monthly Run Rate)</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                Rp {summaryData.mrrIdr.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-stone-400">ARR: Rp {summaryData.arrIdr.toLocaleString('id-ID')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-400 font-medium">Omzet Kotor Transaksi</span>
              <div className="text-2xl font-black text-stone-900 dark:text-white">
                Rp {summaryData.grossRevenueIdr.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-stone-400">{summaryData.totalTransactions} Transaksi Berhasil</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-400 font-medium">Tingkat Konversi</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {summaryData.conversionRatePercent}%
              </div>
              <span className="text-[10px] text-stone-400">Paket Terlaris: {summaryData.topSellingPlan}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBMENU 2: PAKET & HARGA */}
      {activeSubmenu === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Daftar Paket Berlangganan & Status Penjualan:
            </h3>
            <span className="text-[10px] text-stone-400">Semua perubahan harga tersimpan versi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-stone-900 dark:text-white">{p.name}</h4>
                    <span className="text-[11px] text-stone-500">{p.tagline}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {p.isActive ? 'AKTIF DIJUAL' : 'DINONAKTIFKAN'}
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 dark:text-stone-300">{p.description}</p>

                <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-700 flex justify-between">
                  <span>Maks Profil: {p.maxFamilyProfiles}</span>
                  <span>Siklus: {p.allowedBillingCycles.join(', ')} Bulan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMENU 3: PENGATURAN FASILITAS (MATRIKS) */}
      {activeSubmenu === 'features' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
            <span className="font-bold block">Proteksi Hak Ibadah Pengguna (Aturan Wajib Owner):</span>
            <p className="text-[11px] mt-0.5">
              Fitur ibadah bertanda gembok hijau <strong>(PROTECTED)</strong> dikunci oleh sistem dan DILARANG dipindahkan ke paket berbayar demi menjaga amanah dakwah.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="p-3 font-bold">Nama Fasilitas Fitur</th>
                  <th className="p-3 font-bold text-center">Gratis</th>
                  <th className="p-3 font-bold text-center">Premium Belajar</th>
                  <th className="p-3 font-bold text-center">Premium Keluarga</th>
                  <th className="p-3 font-bold">Status Kebijakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                {features.map((feat) => (
                  <tr key={feat.featureKey} className="hover:bg-stone-50 dark:hover:bg-stone-700/30">
                    <td className="p-3">
                      <span className="font-bold text-stone-900 dark:text-white block">{feat.name}</span>
                      <span className="text-[10px] text-stone-400">{feat.description}</span>
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={feat.allowedPlans.includes('plan_gratis')}
                        disabled={feat.isFreeCoreProtected}
                        onChange={() => handleToggleFeature(feat.featureKey, 'plan_gratis', feat.allowedPlans)}
                        className="rounded text-emerald-600"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={feat.allowedPlans.includes('plan_belajar')}
                        onChange={() => handleToggleFeature(feat.featureKey, 'plan_belajar', feat.allowedPlans)}
                        className="rounded text-emerald-600"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={feat.allowedPlans.includes('plan_keluarga')}
                        onChange={() => handleToggleFeature(feat.featureKey, 'plan_keluarga', feat.allowedPlans)}
                        className="rounded text-emerald-600"
                      />
                    </td>
                    <td className="p-3">
                      {feat.isFreeCoreProtected ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 w-max">
                          <Lock className="w-3 h-3" /> Core Free Protected
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Konfigurasi Fleksibel</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMENU 5: VOUCHER & PROMOSI */}
      {activeSubmenu === 'vouchers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-white text-xs">Buat Voucher Promo Baru:</h4>
            <form onSubmit={handleCreateVoucher} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Kode Voucher (RAMADHAN)"
                value={newVoucherCode}
                onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold uppercase"
                required
              />
              <select
                value={newVoucherType}
                onChange={(e) => setNewVoucherType(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs"
              >
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED_NOMINAL">Nominal (IDR)</option>
              </select>
              <input
                type="number"
                placeholder="Nilai (25% / Rp10.000)"
                value={newVoucherVal}
                onChange={(e) => setNewVoucherVal(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold"
                required
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                + Tambah Voucher
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-sm text-stone-900 dark:text-white block">{v.code}</span>
                  <span className="text-[11px] text-stone-500">
                    Diskon: {v.discountValue}{v.discountType === 'PERCENTAGE' ? '%' : ' IDR'} · Terpakai: {v.usedCount} / {v.maxUses}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  AKTIF
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMENU 8: PEMBAYARAN SCALEV */}
      {activeSubmenu === 'scalev' && scalevConfig && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                    Integrasi Gateway Pembayaran Scalev v3
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    Merchant Terhubung: {scalevConfig.merchantName}
                  </span>
                </div>
              </div>

              <button
                onClick={handleTestScalev}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Uji Koneksi Scalev</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 space-y-1">
                <span className="text-stone-400 font-medium block">Store ID Scalev:</span>
                <span className="font-bold text-stone-900 dark:text-white">{scalevConfig.storeId}</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 space-y-1">
                <span className="text-stone-400 font-medium block">Status Lingkungan:</span>
                <span className="font-bold text-amber-600 uppercase">{scalevConfig.environment} (STAGING)</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 space-y-1">
                <span className="text-stone-400 font-medium block">Webhook Sukses / Gagal:</span>
                <span className="font-bold text-emerald-700">{scalevConfig.webhookSuccessCount} Sukses</span> · <span className="text-stone-400">{scalevConfig.webhookFailedCount} Gagal</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 space-y-1">
                <span className="text-stone-400 font-medium block">Waktu Sinkronisasi Terakhir:</span>
                <span className="text-stone-600 dark:text-stone-300 font-medium">{new Date(scalevConfig.lastSyncAt).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* STAGING WEBHOOK SIMULATOR (OWNER ONLY) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-700">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                    Simulator Webhook Resmi Scalev (Staging Sandbox)
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded">
                    isSimulation: true · Terisolasi dari Omzet Riil
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Uji coba penerimaan event resmi (order.payment_status_changed, payment.received, payment.failed) dengan verifikasi HMAC Base64.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Pilih Event Resmi:</label>
                <select
                  value={simEventType}
                  onChange={(e: any) => setSimEventType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                >
                  <option value="order.payment_status_changed">order.payment_status_changed (PAID)</option>
                  <option value="payment.received">payment.received</option>
                  <option value="payment.failed">payment.failed</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Paket Langganan:</label>
                <select
                  value={simPlanId}
                  onChange={(e: any) => setSimPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                >
                  <option value="plan_belajar">Premium Belajar (Rp 19.000)</option>
                  <option value="plan_keluarga">Premium Keluarga (Rp 39.000)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Durasi Paket:</label>
                <select
                  value={simPeriodMonths}
                  onChange={(e: any) => setSimPeriodMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                >
                  <option value={1}>1 Bulan</option>
                  <option value={12}>12 Bulan (Tahunan)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Email Pengguna Uji:</label>
                <input
                  type="email"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={simLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                {simLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{simLoading ? 'Mengirim Webhook...' : 'Kirim Webhook Uji Coba'}</span>
              </button>

              <span className="text-[11px] text-stone-500">
                Otomatis dihitung dengan signature Base64 valid dan didelegasikan ke endpoint /api/billing/webhooks/scalev.
              </span>
            </div>

            {/* Simulation Result Box */}
            {simResult && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Hasil Simulasi Berhasil
                  </span>
                  <span className="font-mono text-[11px] text-stone-400">
                    Order: {simResult.order?.orderNumber}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                  <p>• Status: <strong className="text-emerald-600">{simResult.order?.status}</strong></p>
                  <p>• Event ID: <code className="text-stone-400">{simResult.eventId}</code></p>
                  <p>• Isolasi Omzet: <span className="text-amber-500 font-bold">{simResult.order?.isSimulation ? 'TRUE (Terisolasi)' : 'FALSE'}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMENU 10: PREMIUM GRATIS KHUSUS */}
      {activeSubmenu === 'grants' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-sm text-stone-900 dark:text-white">
              Pemberian Hak Premium Khusus (Owner Grant)
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Berikan akses Premium gratis kepada keluarga besar, ustadz, reviewer agama, atau mitra dakwah terpilih.
            </p>
          </div>

          <form onSubmit={handleGrantSpecial} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Email Penerima:</label>
                <input
                  type="email"
                  placeholder="mitra@keluarga.com"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Nama Penerima:</label>
                <input
                  type="text"
                  placeholder="Nama Ustadz / Kerabat"
                  value={grantName}
                  onChange={(e) => setGrantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Paket yang Diberikan:</label>
                <select
                  value={grantPlanId}
                  onChange={(e) => setGrantPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                >
                  <option value="plan_keluarga">Premium Keluarga (5 Profil)</option>
                  <option value="plan_belajar">Premium Belajar (1 Profil)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Masa Aktif (Bulan):</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={grantMonths}
                  onChange={(e) => setGrantMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Alasan Pemberian (Tercatat di Audit Log):</label>
              <input
                type="text"
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
            >
              Aktifkan Hak Premium Sekarang
            </button>
          </form>
        </div>
      )}

      {/* SUBMENU 12: AUDIT LOGS */}
      {activeSubmenu === 'audit' && (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-stone-900 dark:text-white">Audit Log Keamanan & Transaksi:</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px]"
              >
                <div className="flex justify-between font-bold text-stone-900 dark:text-white">
                  <span>{log.action}</span>
                  <span className="text-stone-400 font-normal">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 mt-0.5">{log.details}</p>
                <span className="text-[10px] text-stone-400 block mt-1">Aktor: {log.actor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
