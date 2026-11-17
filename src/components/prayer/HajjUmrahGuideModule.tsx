import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Users,
  Wallet,
  Heart,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface ManasikStep {
  step: number;
  title: string;
  arabicTitle: string;
  location: string;
  description: string;
  hajjRuling: 'Rukun (Wajib Ada)' | 'Wajib Haji' | 'Sunnah';
  keyDua: string;
}

export interface HajjSavingDeposit {
  id: string;
  amountIdr: number;
  note: string;
  date: string;
}

export interface HajjCompanion {
  id: string;
  name: string;
  relation: string;
}

interface HajjPlannerState {
  targetCostIdr: number;
  deposits: HajjSavingDeposit[];
  companions: HajjCompanion[];
  intentionReflection: string;
}

const PLANNER_STORAGE_KEY = 'akumuslim_hajj_planner_v1';

export const HAJJ_STEPS: ManasikStep[] = [
  {
    step: 1,
    title: 'Ihram & Niat dari Miqat',
    arabicTitle: 'الإِحْرَامُ مِنَ الْمِيقَاتِ',
    location: 'Miqat Makani (Dzulhulaifah / Yalamlam / Qarnul Manazil)',
    description: 'Mengenakan pakaian ihram (dua lembar kain putih tanpa jahitan bagi pria), berniat haji, dan mulai bertalbiyah.',
    hajjRuling: 'Rukun (Wajib Ada)',
    keyDua: 'لَبَّيْكَ اللَّهُمَّ حَجًّا — لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ...',
  },
  {
    step: 2,
    title: 'Wukuf di Padang Arafah (9 Dzulhijjah)',
    arabicTitle: 'الْوُقُوفُ بِعَرَفَةَ',
    location: 'Padang Arafah',
    description: 'Puncak ibadah haji. Berdiam diri dari tergelincirnya matahari hingga terbenam, memperbanyak istighfar, dzikir, dan doa tulus.',
    hajjRuling: 'Rukun (Wajib Ada)',
    keyDua: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
  },
  {
    step: 3,
    title: 'Mabit di Muzdalifah (Malam 10 Dzulhijjah)',
    arabicTitle: 'الْمَبِيتُ بِمُزْدَلِفَةَ',
    location: 'Muzdalifah',
    description: 'Bermalam atau singgah setelah maghrib/isya hingga lewat tengah malam, serta mengumpulkan kerikil untuk melontar jumrah.',
    hajjRuling: 'Wajib Haji',
    keyDua: 'Berzikir di Masy\'aril Haram (QS. Al-Baqarah: 198)',
  },
  {
    step: 4,
    title: 'Melontar Jumrah Aqabah & Tahallul Awal (10 Dzulhijjah)',
    arabicTitle: 'رَمْيُ جَمْرَةِ الْعَقَبَةِ وَالتَّحَلُّلُ',
    location: 'Mina',
    description: 'Melontar 7 butir kerikil ke tiang Jumrah Aqabah dengan mengucap takbir pada tiap lontaran, dilanjutkan memotong/mencukur rambut.',
    hajjRuling: 'Wajib Haji',
    keyDua: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ، رَغْمًا لِلشَّيْطَانِ وَرِضًا لِلرَّحْمَنِ',
  },
  {
    step: 5,
    title: 'Thawaf Ifadhah & Sa\'i (10 Dzulhijjah)',
    arabicTitle: 'طَوَافُ الإِفَاضَةِ وَالسَّعْيُ',
    location: 'Masjidil Haram Makkah',
    description: 'Mengelilingi Ka\'bah 7 putaran berlawanan arah jarum jam, dilanjutkan berjalan bolak-balik antara Shafa dan Marwah 7 kali.',
    hajjRuling: 'Rukun (Wajib Ada)',
    keyDua: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
  },
  {
    step: 6,
    title: 'Mabit di Mina & Melontar 3 Jumrah (Hari Tasyriq 11-13 Dzulhijjah)',
    arabicTitle: 'أَيَّامُ التَّشْرِيقِ بِمِنَى',
    location: 'Mina',
    description: 'Bermalam di Mina pada hari Tasyriq dan melontar Jumrah Ula, Wustha, dan Aqabah setelah waktu zawal.',
    hajjRuling: 'Wajib Haji',
    keyDua: 'Dzikir dan takbir muqayyad di hari-hari tasyriq.',
  },
  {
    step: 7,
    title: 'Thawaf Wada\' (Thawaf Perpisahan)',
    arabicTitle: 'طَوَافُ الْوَدَاعِ',
    location: 'Masjidil Haram Makkah',
    description: 'Thawaf 7 putaran sebelum meninggalkan tanah suci Makkah sebagai penghormatan terakhir kepada Baitullah.',
    hajjRuling: 'Wajib Haji',
    keyDua: 'Doa memohon agar kunjungan ke Baitullah bukan yang terakhir.',
  },
];

const DEFAULT_PLANNER: HajjPlannerState = {
  targetCostIdr: 32000000,
  deposits: [
    {
      id: 'dep_seed',
      amountIdr: 2500000,
      note: 'Setoran awal niat menuju Baitullah',
      date: new Date().toISOString().slice(0, 10),
    },
  ],
  companions: [
    { id: 'comp_1', name: 'Orang Tua', relation: 'Keluarga Utama' },
  ],
  intentionReflection: 'Bismillah, berniat memuliakan ibadah kepada Allah dengan rezeki halal dan sabar menabung bertahap.',
};

export const HajjUmrahGuideModule: React.FC = () => {
  const [guideTab, setGuideTab] = useState<'haji' | 'umrah' | 'checklist'>('haji');
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('akumuslim_hajj_checklist');
    return saved ? JSON.parse(saved) : {};
  });

  const [planner, setPlanner] = useState<HajjPlannerState>(() => {
    try {
      const saved = localStorage.getItem(PLANNER_STORAGE_KEY);
      return saved ? { ...DEFAULT_PLANNER, ...JSON.parse(saved) } : DEFAULT_PLANNER;
    } catch {
      return DEFAULT_PLANNER;
    }
  });

  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [companionRelation, setCompanionRelation] = useState('Pasangan / Keluarga');

  useEffect(() => {
    try {
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(planner));
    } catch {
      // Ignore quota errors
    }
  }, [planner]);

  const toggleChecklist = (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] };
    setChecklist(updated);
    localStorage.setItem('akumuslim_hajj_checklist', JSON.stringify(updated));
  };

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(depositAmount.replace(/[^0-9]/g, ''));
    if (!numeric || numeric <= 0) return;

    const entry: HajjSavingDeposit = {
      id: `dep_${Date.now()}`,
      amountIdr: numeric,
      note: depositNote.trim() || 'Tabungan bertahap Haji/Umrah',
      date: new Date().toISOString().slice(0, 10),
    };
    setPlanner((prev) => ({
      ...prev,
      deposits: [entry, ...prev.deposits],
    }));
    setDepositAmount('');
    setDepositNote('');
  };

  const handleRemoveDeposit = (id: string) => {
    setPlanner((prev) => ({
      ...prev,
      deposits: prev.deposits.filter((d) => d.id !== id),
    }));
  };

  const handleAddCompanion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companionName.trim()) return;
    setPlanner((prev) => ({
      ...prev,
      companions: [
        ...prev.companions,
        {
          id: `comp_${Date.now()}`,
          name: companionName.trim(),
          relation: companionRelation.trim() || 'Keluarga',
        },
      ],
    }));
    setCompanionName('');
  };

  const handleRemoveCompanion = (id: string) => {
    setPlanner((prev) => ({
      ...prev,
      companions: prev.companions.filter((c) => c.id !== id),
    }));
  };

  const totalSaved = planner.deposits.reduce((acc, d) => acc + d.amountIdr, 0);
  const progressPercent = planner.targetCostIdr > 0
    ? Math.min(100, Math.round((totalSaved / planner.targetCostIdr) * 100))
    : 0;

  const CHECKLIST_ITEMS = [
    { id: 'c1', cat: 'Manasik', text: 'Hafal niat ihram haji & umrah serta lafaz talbiyah' },
    { id: 'c2', cat: 'Manasik', text: 'Pahami rukun thawaf, sa\'i, dan syarat sah wudhu saat tawaf' },
    { id: 'c3', cat: 'Kesehatan', text: 'Vaksin meningitis & polio sesuai ketentuan Kemenkes RI' },
    { id: 'c4', cat: 'Dokumen', text: 'Paspor aktif minimal 6 bulan, KTP, KK & bukti porsi resmi' },
    { id: 'c5', cat: 'Perlengkapan', text: 'Kain ihram (2 lembar), sabuk ihram, sandal tanpa jahitan' },
    { id: 'c6', cat: 'Perlengkapan', text: 'Obat-obatan pribadi dan pelembap kulit tahan cuaca panas' },
    { id: 'c7', cat: 'Niat & Hati', text: 'Melunasi amanah/hak sesama dan memohon doa restu keluarga' },
  ];

  const completedChecklistCount = CHECKLIST_ITEMS.filter((i) => checklist[i.id]).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Official Kemenag Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed space-y-1">
          <strong className="block text-emerald-800 dark:text-emerald-300">
            Panduan Edukasi Manasik &amp; Persiapan Niat (Bukan Penjualan Paket):
          </strong>
          <p>
            Modul ini menyajikan pembelajaran fikih manasik sesuai tuntunan Al-Qur&apos;an, As-Sunnah, dan pedoman Kementerian Agama RI serta catatan persiapan pribadi Anda. AKU MUSLIM tidak menjual paket perjalanan komersial.
          </p>
        </div>
      </div>

      {/* Tabs: Haji vs Umrah vs Persiapan & Tabungan */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
        <button
          onClick={() => setGuideTab('haji')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            guideTab === 'haji'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          Manasik Haji (7 Tahapan)
        </button>
        <button
          onClick={() => setGuideTab('umrah')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            guideTab === 'umrah'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          Tata Cara Umrah
        </button>
        <button
          onClick={() => setGuideTab('checklist')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            guideTab === 'checklist'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          Persiapan &amp; Tabungan
        </button>
      </div>

      {guideTab === 'haji' ? (
        <div className="space-y-4">
          {HAJJ_STEPS.map((step) => (
            <div
              key={`hajj_step_${step.step}`}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {step.location}
                    </span>
                    <h3 className="text-sm font-black text-stone-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  step.hajjRuling === 'Rukun (Wajib Ada)'
                    ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {step.hajjRuling}
                </span>
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {step.description}
              </p>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-xs">
                <span className="text-[10px] font-bold text-stone-400 block mb-1">Bacaan Doa / Talbiyah:</span>
                <p className="font-arabic text-sm text-right text-emerald-950 dark:text-emerald-200">
                  {step.keyDua}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : guideTab === 'umrah' ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <h3 className="text-base font-black text-stone-900 dark:text-white">
            4 Rukun Ibadah Umrah (Selesai dalam 1 Rangkaian Waktu)
          </h3>
          <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">1. Ihram dari Miqat</strong>
              Mandi sunnah ihram, mengenakan kain ihram, sholat sunnah ihram 2 rakaat, dan berniat umrah: <em>&quot;Labbaika &apos;umratan&quot;</em>.
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">2. Thawaf Umrah (7 Putaran)</strong>
              Mengelilingi Ka&apos;bah 7 putaran dimulai dari Hajar Aswad berlawanan arah jarum jam dalam keadaan suci dari hadas.
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">3. Sa&apos;i Shafa dan Marwah (7 Kali)</strong>
              Berjalan kaki antara bukit Shafa dan Marwah sebanyak 7 kali, dimulai dari Shafa dan berakhir di Marwah.
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">4. Tahallul (Cukur Rambut)</strong>
              Mencukur gundul (utama bagi pria) atau memendekkan minimal 3 helai rambut (pria/wanita). Seluruh larangan ihram berakhir.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Doa & Niat Menuju Baitullah */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white shadow-md space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Niat &amp; Doa Memohon Kemudahan ke Baitullah</span>
            </div>
            <p dir="rtl" className="font-arabic text-xl text-right text-amber-100 leading-loose">
              اللَّهُمَّ ارْزُقْنَا زِيَارَةَ بَيْتِكَ الْحَرَامِ وَرَسُولِكَ عَلَيْهِ الصَّلَاةُ وَالسَّلَامُ فِي يُسْرٍ وَعَافِيَةٍ وَتَقَبُّلٍ
            </p>
            <p className="text-xs italic text-emerald-200">
              &quot;Allahummarzukna ziyarata baitikal-haram wa rasulika &apos;alaihish-shalatu was-salamu fi yusrin wa &apos;afiyatin wa taqabbul.&quot;
            </p>
            <p className="text-xs text-stone-100 leading-relaxed">
              &quot;Ya Allah, karuniakanlah kepada kami kesempatan menziarahi rumah-Mu yang mulia (Ka&apos;bah) dan masjid Rasul-Mu dalam kemudahan, kesehatan, dan amal yang Engkau terima.&quot;
            </p>
          </div>

          {/* 2. Target Biaya & Tabungan Bertahap */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-black text-stone-900 dark:text-white">
                  Target Biaya &amp; Tabungan Bertahap
                </h3>
              </div>
              <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                {progressPercent}% Tercapai
              </span>
            </div>

            {/* Target nominal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                  Target Biaya (Rp):
                </label>
                <input
                  type="number"
                  min={1000000}
                  step={500000}
                  value={planner.targetCostIdr}
                  onChange={(e) => setPlanner((p) => ({ ...p, targetCostIdr: Math.max(0, Number(e.target.value)) }))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-900 dark:text-white"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    { label: 'Umrah 32 Jt', val: 32000000 },
                    { label: 'Setoran Haji 25 Jt', val: 25000000 },
                    { label: 'Haji Reguler 56 Jt', val: 56000000 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setPlanner((p) => ({ ...p, targetCostIdr: preset.val }))}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 text-[10px] font-semibold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-center">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Total Tabungan Terkumpul</span>
                <strong className="text-lg font-black text-emerald-800 dark:text-emerald-300 tabular-nums mt-0.5">
                  Rp {totalSaved.toLocaleString('id-ID')}
                </strong>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums mt-0.5">
                  dari target Rp {planner.targetCostIdr.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Tambah Setoran */}
            <form onSubmit={handleAddDeposit} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <input
                type="number"
                min={10000}
                step={50000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Nominal setoran (Rp)"
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                required
              />
              <input
                type="text"
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                placeholder="Catatan (mis. Tabungan gaji bulan ini)"
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Setoran</span>
              </button>
            </form>

            {/* Riwayat Setoran */}
            {planner.deposits.length > 0 && (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pt-1">
                {planner.deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/70 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <strong className="text-stone-900 dark:text-white font-mono tabular-nums">
                        Rp {dep.amountIdr.toLocaleString('id-ID')}
                      </strong>
                      <span className="text-[11px] text-stone-500 block">
                        {dep.note} · {dep.date}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeposit(dep.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600"
                      aria-label="Hapus catatan setoran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Daftar Orang yang Ingin Diajak & Penguatan Niat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-black text-stone-900 dark:text-white">
                  Daftar Orang yang Ingin Diajak
                </h3>
              </div>

              <form onSubmit={handleAddCompanion} className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    placeholder="Nama (mis. Ibu, Ayah, Istri)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                    required
                  />
                  <input
                    type="text"
                    value={companionRelation}
                    onChange={(e) => setCompanionRelation(e.target.value)}
                    placeholder="Hubungan"
                    className="w-28 px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300 font-bold border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah ke Doa &amp; Daftar</span>
                </button>
              </form>

              <div className="space-y-1.5">
                {planner.companions.map((c) => (
                  <div
                    key={c.id}
                    className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-stone-900 dark:text-white">{c.name}</strong>
                      <span className="text-[11px] text-stone-400 ml-1.5">({c.relation})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompanion(c.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      aria-label="Hapus daftar orang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Penguatan Niat */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-black text-stone-900 dark:text-white">
                  Penguatan Niat &amp; Muhasabah Kesiapan
                </h3>
              </div>
              <textarea
                rows={4}
                value={planner.intentionReflection}
                onChange={(e) => setPlanner((p) => ({ ...p, intentionReflection: e.target.value }))}
                placeholder="Tuliskan penguatan niat agar keberangkatan murni mengharap ridha Allah SWT..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 leading-relaxed"
              />
              <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tersimpan otomatis secara privat di perangkat Anda.</span>
              </p>
            </div>
          </div>

          {/* 4. Checklist Manasik, Dokumen, Kesehatan & Perlengkapan */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-stone-900 dark:text-white">
                Checklist Manasik, Dokumen, Kesehatan &amp; Perlengkapan
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {completedChecklistCount} / {CHECKLIST_ITEMS.length}
              </span>
            </div>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => {
                const isChecked = !!checklist[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md border border-stone-300 dark:border-stone-600 flex items-center justify-center text-xs font-bold text-emerald-600">
                        {isChecked ? '✓' : ''}
                      </span>
                      <span>{item.text}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">{item.cat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
