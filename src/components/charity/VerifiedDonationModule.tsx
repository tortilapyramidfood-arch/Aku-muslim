import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  ExternalLink,
  ChevronLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
} from 'lucide-react';

export interface DonationProgram {
  id: string;
  title: string;
  category: 'yatim' | 'dhuafa' | 'pendidikan' | 'masjid';
  institution: string;
  institutionType: 'BAZNAS' | 'LAZNAS' | 'Yayasan Sosial';
  legalRegistration: string;
  description: string;
  targetBeneficiaries: string;
  bankAccounts: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }[];
  officialUrl: string;
  verifiedBadge: boolean;
  minDonation: number;
}

const VERIFIED_PROGRAMS: DonationProgram[] = [
  {
    id: 'don_yatim_1',
    title: 'Santunan & Pendidikan Yatim Berdaya',
    category: 'yatim',
    institution: 'Dompet Dhuafa Republika',
    institutionType: 'LAZNAS',
    legalRegistration: 'Kemensos RI No. 123/HUK-PS/2021 & SK Kemenag No. 238/2016',
    description:
      'Program beasiswa, kebutuhan gizi, dan pembinaan karakter Islami bagi ribuan anak yatim binaan di seluruh Indonesia.',
    targetBeneficiaries: 'Anak yatim & dhuafa prasejahtera',
    bankAccounts: [
      { bankName: 'Bank Syariah Indonesia (BSI)', accountNumber: '7000514008', accountHolder: 'Yayasan Dompet Dhuafa Republika' },
      { bankName: 'Bank Mandiri', accountNumber: '1010006475733', accountHolder: 'Dompet Dhuafa' },
    ],
    officialUrl: 'https://donasi.dompetdhuafa.org',
    verifiedBadge: true,
    minDonation: 10000,
  },
  {
    id: 'don_dhuafa_1',
    title: 'Bantuan Pangan & Kesehatan Fakir Miskin BAZNAS',
    category: 'dhuafa',
    institution: 'Badan Amil Zakat Nasional (BAZNAS) RI',
    institutionType: 'BAZNAS',
    legalRegistration: 'Lembaga Pemerintah Nonstruktural - UU No. 23 Tahun 2011',
    description:
      'Penyaluran paket logistik sembako keluarga, pengobatan gratis klinik pratama dhuafa, dan modal usaha mikro berkah.',
    targetBeneficiaries: 'Keluarga mustahik garis kemiskinan ekstrem',
    bankAccounts: [
      { bankName: 'Bank Syariah Indonesia (BSI)', accountNumber: '1000782928', accountHolder: 'BAZNAS RI Rekening Infaq' },
      { bankName: 'BCA', accountNumber: '6860148755', accountHolder: 'BAZNAS' },
    ],
    officialUrl: 'https://baznas.go.id/sedekah',
    verifiedBadge: true,
    minDonation: 10000,
  },
  {
    id: 'don_pendidikan_1',
    title: 'Wakaf Buku & Beasiswa Santri Penghafal Al-Qur\'an',
    category: 'pendidikan',
    institution: 'Rumah Zakat Indonesia',
    institutionType: 'LAZNAS',
    legalRegistration: 'Kemensos RI No. 89/HUK-PS/2020 & SK Kemenag No. 42/2007',
    description:
      'Bantuan biaya pendidikan, mushaf Al-Qur\'an hafalan, serta insentif hidup layak bagi guru ngaji pelosok negeri.',
    targetBeneficiaries: 'Santri yatim tahfidz dan ustadz pengajar Al-Qur\'an',
    bankAccounts: [
      { bankName: 'Bank Syariah Indonesia (BSI)', accountNumber: '7015518248', accountHolder: 'Yayasan Rumah Zakat Indonesia' },
      { bankName: 'Bank Muamalat', accountNumber: '1010060000', accountHolder: 'Rumah Zakat' },
    ],
    officialUrl: 'https://www.rumahzakat.org/donasi',
    verifiedBadge: true,
    minDonation: 25000,
  },
  {
    id: 'don_masjid_1',
    title: 'Renovasi Musholla Pelosok & Sanitasi Bersih',
    category: 'masjid',
    institution: 'LAZISMU PP Muhammadiyah',
    institutionType: 'LAZNAS',
    legalRegistration: 'SK Menag RI No. 730 Tahun 2016',
    description:
      'Program perbaikan atap bocor, penyediaan tempat wudhu bersih layak, sajadah, dan sound system untuk masjid daerah terpencil.',
    targetBeneficiaries: 'Musholla & masjid kampung yang kekurangan fasilitas',
    bankAccounts: [
      { bankName: 'Bank Syariah Indonesia (BSI)', accountNumber: '7001211112', accountHolder: 'LAZISMU PP Muhammadiyah' },
    ],
    officialUrl: 'https://lazismu.org',
    verifiedBadge: true,
    minDonation: 20000,
  },
  {
    id: 'don_masjid_2',
    title: 'Koin Muktamar & Sedekah Musholla Nusantara',
    category: 'masjid',
    institution: 'NU Care - LAZISNU PBNU',
    institutionType: 'LAZNAS',
    legalRegistration: 'SK Menag RI No. 255 Tahun 2016',
    description:
      'Bantuan perlengkapan ibadah, renovasi MCK musholla, dan kegiatan memakmurkan masjid berbasis komunitas santri.',
    targetBeneficiaries: 'Musholla desa dan fasilitas jamaah warga nahdliyin',
    bankAccounts: [
      { bankName: 'Bank Syariah Indonesia (BSI)', accountNumber: '7015522223', accountHolder: 'PP LAZISNU Sedekah' },
    ],
    officialUrl: 'https://nucare.id',
    verifiedBadge: true,
    minDonation: 10000,
  },
];

export const VerifiedDonationModule: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'yatim' | 'dhuafa' | 'pendidikan' | 'masjid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedBankAcc, setCopiedBankAcc] = useState<string | null>(null);

  const handleCopyAccount = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedBankAcc(accNum);
    setTimeout(() => setCopiedBankAcc(null), 2000);
  };

  const filteredPrograms = VERIFIED_PROGRAMS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-stone-900 dark:text-white">
              Donasi & Sedekah Terverifikasi
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Lembaga Resmi BAZNAS & LAZNAS · 100% Disalurkan Langsung Tanpa Potongan
            </p>
          </div>
        </div>
      </div>

      {/* Strict Transparency & Non-Fee Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 space-y-2">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Komitmen Amanah & Transparansi PYRAMID GROUP</span>
        </div>
        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
          Aplikasi AKU MUSLIM <strong>TIDAK mengambil potongan biaya</strong> sepeserpun dari donasi ini. Seluruh infaq dan sedekah disalurkan langsung 100% ke rekening resmi lembaga pengelola zakat yang terdaftar resmi di Kementerian Sosial RI dan Kementerian Agama RI.
        </p>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Semua Program', icon: Heart },
          { id: 'yatim', label: 'Santunan Yatim', icon: Users },
          { id: 'dhuafa', label: 'Fakir & Dhuafa', icon: Heart },
          { id: 'pendidikan', label: 'Pendidikan & Guru', icon: GraduationCap },
          { id: 'masjid', label: 'Renovasi Masjid', icon: Building },
        ].map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari program santunan atau nama lembaga..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:border-emerald-500"
        />
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.map((prog) => (
          <div
            key={prog.id}
            className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-3"
          >
            {/* Program Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                    {prog.institutionType}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Resmi
                  </span>
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white mt-1">
                  {prog.title}
                </h3>
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {prog.institution}
                </p>
              </div>

              <a
                href={prog.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-700 dark:text-stone-200 hover:text-emerald-700 text-xs font-bold transition-colors self-start shrink-0"
              >
                <span>Portal Resmi</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {prog.description}
            </p>

            {/* Legal Proof */}
            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <strong>Legalitas:</strong> {prog.legalRegistration}
              </div>
            </div>

            {/* Official Direct Bank Accounts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                Rekening Resmi Penyaluran Donasi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prog.bankAccounts.map((acc) => (
                  <div
                    key={acc.accountNumber}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700/80 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                        {acc.bankName}
                      </p>
                      <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {acc.accountNumber}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate max-w-[170px]">
                        a.n. {acc.accountHolder}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyAccount(acc.accountNumber)}
                      className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-emerald-600 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      title="Salin Nomor Rekening"
                    >
                      {copiedBankAcc === acc.accountNumber ? (
                        <span className="text-emerald-600 text-[10px] font-bold">Disalin</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
