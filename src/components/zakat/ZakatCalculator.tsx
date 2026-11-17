import React, { useState } from 'react';
import { Coins, AlertCircle, HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export type ZakatCategory = 'maal' | 'emas' | 'profesi';

export interface ZakatCalculationResult {
  isWajib: boolean;
  nisabRupiah: number;
  hartaKenaZakat: number;
  zakatHarusDibayar: number;
  alasan: string;
}

export interface BAZNASReference {
  nomorSK: string;
  tahunBerlaku: number;
  tanggalPenetapan: string;
  sumberResmi: string;
  nisabBulanan: number;
  nisabTahunan: number;
  dasarHukum: string;
}

export const BAZNAS_SK_2026_REFERENCE: BAZNASReference = {
  nomorSK: 'SK Ketua BAZNAS Nomor 15 Tahun 2026',
  tahunBerlaku: 2026,
  tanggalPenetapan: '02 Januari 2026',
  sumberResmi: 'Badan Amil Zakat Nasional Republik Indonesia (BAZNAS RI)',
  nisabBulanan: 7640144, // Rp 7.640.144 per bulan
  nisabTahunan: 91681728, // Rp 91.681.728 per tahun
  dasarHukum: 'Peraturan BAZNAS No. 15 Tahun 2026 & Fatwa MUI No. 3 Tahun 2003 (Setara 85 gram emas)',
};

export const BAZNAS_SK_2024_REFERENCE: BAZNASReference = {
  nomorSK: 'SK Ketua BAZNAS Nomor 2 Tahun 2024',
  tahunBerlaku: 2024,
  tanggalPenetapan: 'Januari 2024',
  sumberResmi: 'Badan Amil Zakat Nasional Republik Indonesia (BAZNAS RI)',
  nisabBulanan: 6859394,
  nisabTahunan: 82312725,
  dasarHukum: 'SK BAZNAS No. 2/2024 (Riwayat Regulasi)',
};

export function calculateZakat(
  category: ZakatCategory,
  goldPricePerGram: number,
  values: {
    // Maal
    tabungan?: number;
    investasi?: number;
    utangJatuhTempo?: number;
    // Emas Fisik
    beratEmasGram?: number;
    // Profesi
    gajiBulanan?: number;
    pendapatanLain?: number;
    pengeluaranPokok?: number;
    nisabMethod?: 'baznas_sk_2026' | 'dinamis_emas' | 'baznas_sk_2024';
  }
): ZakatCalculationResult {
  const nisabTahunanEmas = 85 * goldPricePerGram;
  const nisabBulananDinamis = Math.round(nisabTahunanEmas / 12);

  // Standar Default Tahun 2026: SK Ketua BAZNAS No. 15 Tahun 2026 (Rp 7.640.144 / bulan)
  const method = values.nisabMethod || 'baznas_sk_2026';
  let nisabBulanan = BAZNAS_SK_2026_REFERENCE.nisabBulanan;
  let namaNisab = `SK Ketua BAZNAS No. 15/2026 (Rp ${BAZNAS_SK_2026_REFERENCE.nisabBulanan.toLocaleString('id-ID')}/bulan)`;

  if (method === 'dinamis_emas') {
    nisabBulanan = nisabBulananDinamis;
    namaNisab = `Dinamis Emas Pasar (Rp ${nisabBulananDinamis.toLocaleString('id-ID')}/bulan)`;
  } else if (method === 'baznas_sk_2024') {
    nisabBulanan = BAZNAS_SK_2024_REFERENCE.nisabBulanan;
    namaNisab = `SK BAZNAS No. 2/2024 Arsip (Rp ${BAZNAS_SK_2024_REFERENCE.nisabBulanan.toLocaleString('id-ID')}/bulan)`;
  }

  if (category === 'maal') {
    const totalHarta = (values.tabungan || 0) + (values.investasi || 0);
    const utang = values.utangJatuhTempo || 0;
    const bersih = Math.max(0, totalHarta - utang);
    const isWajib = bersih >= nisabTahunanEmas;
    const zakatHarusDibayar = isWajib ? Math.round(bersih * 0.025) : 0;

    return {
      isWajib,
      nisabRupiah: nisabTahunanEmas,
      hartaKenaZakat: bersih,
      zakatHarusDibayar,
      alasan: isWajib
        ? `Harta tabungan & investasi bersih (Rp ${bersih.toLocaleString('id-ID')}) telah melampaui nisab 85 gr emas (Rp ${nisabTahunanEmas.toLocaleString('id-ID')}) dan telah mencapai haul 1 tahun.`
        : `Harta tabungan & investasi bersih (Rp ${bersih.toLocaleString('id-ID')}) belum mencapai batas nisab 85 gr emas (Rp ${nisabTahunanEmas.toLocaleString('id-ID')}). Bebas kewajiban zakat maal.`,
    };
  }

  if (category === 'emas') {
    const gram = values.beratEmasGram || 0;
    const nilaiTotalEmas = gram * goldPricePerGram;
    const isWajib = gram >= 85;
    const zakatHarusDibayar = isWajib ? Math.round(nilaiTotalEmas * 0.025) : 0;

    return {
      isWajib,
      nisabRupiah: nisabTahunanEmas,
      hartaKenaZakat: nilaiTotalEmas,
      zakatHarusDibayar,
      alasan: isWajib
        ? `Berat simpanan emas murni (${gram} gram) telah mencapai atau melebihi batas nisab 85 gram emas fisik (haul 1 tahun).`
        : `Berat simpanan emas (${gram} gram) masih di bawah batas nisab 85 gram. Bebas kewajiban zakat emas fisik.`,
    };
  }

  // category === 'profesi'
  const pendapatan = (values.gajiBulanan || 0) + (values.pendapatanLain || 0);
  const pengeluaran = values.pengeluaranPokok || 0;
  const sisaBersih = Math.max(0, pendapatan - pengeluaran);
  const isWajib = sisaBersih >= nisabBulanan;
  const zakatHarusDibayar = isWajib ? Math.round(sisaBersih * 0.025) : 0;

  return {
    isWajib,
    nisabRupiah: nisabBulanan,
    hartaKenaZakat: sisaBersih,
    zakatHarusDibayar,
    alasan: isWajib
      ? `Penghasilan bersih bulanan (Rp ${sisaBersih.toLocaleString('id-ID')}) telah melampaui standar nisab ${namaNisab}.`
      : `Penghasilan bersih bulanan (Rp ${sisaBersih.toLocaleString('id-ID')}) belum melampaui nisab ${namaNisab}. Sangat dianjurkan memperbanyak infaq dan sedekah sukarela.`,
  };
}

export const ZakatCalculator: React.FC = () => {
  const [zakatType, setZakatType] = useState<ZakatCategory>('profesi');

  // Market reference gold price (Default e.g. Rp 1.480.000 / gram)
  const [goldPrice, setGoldPrice] = useState<number>(1480000);
  const [goldPriceUpdatedDate] = useState<string>('13 November 2026');

  // Form Fields - Maal
  const [tabungan, setTabungan] = useState<number>(0);
  const [investasi, setInvestasi] = useState<number>(0);
  const [utangJatuhTempo, setUtangJatuhTempo] = useState<number>(0);

  // Form Fields - Emas
  const [beratEmas, setBeratEmas] = useState<number>(0);

  // Form Fields - Profesi
  const [gajiBulanan, setGajiBulanan] = useState<number>(0);
  const [pendapatanLain, setPendapatanLain] = useState<number>(0);
  const [pengeluaranPokok, setPengeluaranPokok] = useState<number>(0);
  const [nisabMethod, setNisabMethod] = useState<'baznas_sk_2026' | 'dinamis_emas' | 'baznas_sk_2024'>('baznas_sk_2026');

  const result = calculateZakat(zakatType, goldPrice, {
    tabungan,
    investasi,
    utangJatuhTempo,
    beratEmasGram: beratEmas,
    gajiBulanan,
    pendapatanLain,
    pengeluaranPokok,
    nisabMethod,
  });

  const handleReset = () => {
    setTabungan(0);
    setInvestasi(0);
    setUtangJatuhTempo(0);
    setBeratEmas(0);
    setGajiBulanan(0);
    setPendapatanLain(0);
    setPengeluaranPokok(0);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-5 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Kalkulator Zakat Komprehensif
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Atur Ulang</span>
          </button>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Sesuai regulasi resmi BAZNAS RI — SK Ketua BAZNAS Nomor 15 Tahun 2026 & Fatwa MUI No. 3 Tahun 2003.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-700/60 rounded-xl">
        <button
          onClick={() => setZakatType('maal')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
            zakatType === 'maal'
              ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          1. Zakat Maal (Tabungan)
        </button>
        <button
          onClick={() => setZakatType('emas')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
            zakatType === 'emas'
              ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          2. Zakat Emas Fisik
        </button>
        <button
          onClick={() => setZakatType('profesi')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
            zakatType === 'profesi'
              ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          3. Zakat Penghasilan
        </button>
      </div>

      {/* Adjustable Gold Price Reference Panel */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              Acuan Harga Emas Pasar Murni (Antam):
            </span>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Pembaruan: {goldPriceUpdatedDate} (Dapat disesuaikan secara manual)
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500">Rp/gr:</span>
            <input
              type="number"
              value={goldPrice}
              onChange={(e) => setGoldPrice(Math.max(100000, Number(e.target.value)))}
              className="w-32 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 font-mono font-bold text-stone-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-1 border-t border-amber-200/60 dark:border-amber-800/40 flex flex-wrap items-center justify-between gap-1 text-[11px] text-amber-800 dark:text-amber-300">
          <span>Nisab 85 gr Emas (Tahunan): <strong>Rp {(85 * goldPrice).toLocaleString('id-ID')}</strong></span>
          <span>Nisab Bulanan: <strong>Rp {Math.round((85 * goldPrice) / 12).toLocaleString('id-ID')}</strong></span>
        </div>
      </div>

      {/* Inputs Form */}
      {zakatType === 'maal' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Uang Tabungan, Giro, & Deposito yang Telah Tersimpan 1 Tahun (Haul)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rp</span>
              <input
                type="number"
                value={tabungan || ''}
                onChange={(e) => setTabungan(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Nilai Investasi Liquid / Surat Berharga (Saham, Reksa Dana, Piutang Lancar)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rp</span>
              <input
                type="number"
                value={investasi || ''}
                onChange={(e) => setInvestasi(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Pengurang: Utang Jatuh Tempo yang Wajib Dibayar Tahun Ini
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rp</span>
              <input
                type="number"
                value={utangJatuhTempo || ''}
                onChange={(e) => setUtangJatuhTempo(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {zakatType === 'emas' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Total Berat Emas Batangan / Simpanan (Bukan perhiasan yang dipakai wajar sehari-hari)
            </label>
            <div className="relative">
              <input
                type="number"
                value={beratEmas || ''}
                onChange={(e) => setBeratEmas(Math.max(0, Number(e.target.value)))}
                placeholder="Contoh: 100"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Gram</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500">
            *Nisab emas murni fisik adalah 85 gram yang dimiliki dan tersimpan penuh selama 1 tahun hijriah (haul).
          </p>
        </div>
      )}

      {zakatType === 'profesi' && (
        <div className="space-y-3">
          {/* Nisab Reference Selector */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-1.5">
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
              Pilihan Standar Nisab Zakat Penghasilan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setNisabMethod('baznas_sk_2026')}
                className={`p-2 text-left rounded-lg text-xs transition-all border ${
                  nisabMethod === 'baznas_sk_2026'
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>SK BAZNAS RI 2026</span>
                  {nisabMethod === 'baznas_sk_2026' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] block opacity-90 mt-0.5 font-mono">Rp 7.640.144 / bln</span>
                <span className="text-[9px] block text-emerald-700 dark:text-emerald-400 mt-0.5 font-normal">Standar Resmi 2026</span>
              </button>

              <button
                type="button"
                onClick={() => setNisabMethod('dinamis_emas')}
                className={`p-2 text-left rounded-lg text-xs transition-all border ${
                  nisabMethod === 'dinamis_emas'
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Dinamis Emas Pasar</span>
                  {nisabMethod === 'dinamis_emas' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] block opacity-80 mt-0.5 font-mono">
                  Rp {Math.round((85 * goldPrice) / 12).toLocaleString('id-ID')} / bln
                </span>
                <span className="text-[9px] block text-stone-400 mt-0.5 font-normal">85 gr emas / 12</span>
              </button>

              <button
                type="button"
                onClick={() => setNisabMethod('baznas_sk_2024')}
                className={`p-2 text-left rounded-lg text-xs transition-all border ${
                  nisabMethod === 'baznas_sk_2024'
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>SK BAZNAS 2024</span>
                  {nisabMethod === 'baznas_sk_2024' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] block opacity-80 mt-0.5 font-mono">Rp 6.859.394 / bln</span>
                <span className="text-[9px] block text-stone-400 mt-0.5 font-normal">Arsip Regulasi Lama</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Gaji Pokok & Tunjangan Bulanan
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rp</span>
              <input
                type="number"
                value={gajiBulanan || ''}
                onChange={(e) => setGajiBulanan(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Pendapatan Lain / Bonus / Freelance (Rata-rata Bulanan)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rp</span>
              <input
                type="number"
                value={pendapatanLain || ''}
                onChange={(e) => setPendapatanLain(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Pengurang: Kebutuhan Pokok Sandang, Pangan, Papan & Cicilan Mendesak
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rp</span>
              <input
                type="number"
                value={pengeluaranPokok || ''}
                onChange={(e) => setPengeluaranPokok(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Result Display Box */}
      <div className={`p-4 rounded-xl border ${
        result.isWajib
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Hasil Perhitungan Zakat:
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
            result.isWajib
              ? 'bg-emerald-600 text-white'
              : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
          }`}>
            {result.isWajib ? 'Wajib Zakat (2,5%)' : 'Bebas Kewajiban Zakat'}
          </span>
        </div>

        <div className="mt-3">
          <span className="text-xs text-stone-500">Estimasi Zakat yang Harus Dikeluarkan:</span>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-mono tabular-nums mt-0.5">
            Rp {result.zakatHarusDibayar.toLocaleString('id-ID')}
          </p>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
          {result.alasan}
        </p>
      </div>

      {/* Religious Legal Notice (Bukan Fatwa Individual) */}
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-[11px] text-blue-900 dark:text-blue-300 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Disclaimer Syariah:</span>
        </p>
        <p>
          Hasil kalkulator ini berstatus <strong>ESTIMASI KONSULTATIF</strong> berdasarkan standar baku fiqih zakat dan SK Ketua BAZNAS RI Nomor 15 Tahun 2026, bukan merupakan fatwa hukum individual mutlak. Pembayaran zakat dapat disalurkan melalui BAZNAS atau LAZ resmi berizin pemerintah.
        </p>
        <p className="pt-1 border-t border-blue-200/60 dark:border-blue-800/40 text-blue-800/80 dark:text-blue-300/80">
          Sumber: {BAZNAS_SK_2026_REFERENCE.sumberResmi} ({BAZNAS_SK_2026_REFERENCE.nomorSK}) · Pembaruan harga emas acuan: {goldPriceUpdatedDate}.
        </p>
      </div>
    </div>
  );
};
