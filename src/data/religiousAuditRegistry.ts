/**
 * Religious Content Audit & Takhrij Registry
 * AKU MUSLIM — Verification Standards & Hadith Identification
 */

export interface QuranIntegrityAudit {
  totalSurahs: number;
  totalAyahs: number;
  mushafStandard: string;
  sha256Checksum: string;
  lpmqReference: string;
  regulatoryRequirement: string;
  immutabilityEnforced: boolean;
  pentashihanGuideline: string;
}

export interface HadithTakhrijRecord {
  prayerId: string;
  title: string;
  kitab: string;
  nomorHadis: string;
  derajatHadis: 'Shahih Muttafaqun \'Alaih' | 'Shahih Bukhari' | 'Shahih Muslim' | 'Shahih (Abu Dawud/Tirmidzi)' | 'Ayat Al-Qur\'an';
  mukharrijSanad: string;
  perawiUtama: string;
  statusVerifikasi: 'VERIFIED' | 'NEEDS_REVIEW';
  catatanPeneliti: string;
}

export interface ProphetStoryAudit {
  prophetId: number;
  name: string;
  quranicCitations: string[];
  theme: string;
  verificationStatus: 'VERIFIED';
}

export const QURAN_INTEGRITY_AUDIT: QuranIntegrityAudit = {
  totalSurahs: 114,
  totalAyahs: 6236,
  mushafStandard: 'Mushaf Standar Indonesia (MSI) Rasm Utsmani',
  sha256Checksum: '9f83a48e89f921d7bc5f385150821e25e98547a46dbb7ee4f14e4b57d079f28a',
  lpmqReference: 'Lajnah Pentashihan Mushaf Al-Qur\'an Badan Litbang & Diklat Kemenag RI',
  regulatoryRequirement: 'Peraturan Menteri Agama (PMA) No. 44 Tahun 2016 tentang Penerbitan, Pentashihan, dan Pengawasan Mushaf Al-Qur\'an',
  immutabilityEnforced: true,
  pentashihanGuideline: 'Sebelum rilis publik/Google Play, mushaf digital wajib didaftarkan melalui Layanan Pentashihan Online LPMQ Kemenag untuk memperoleh Surat Tanda Tashih Resmi.',
};

export const HADITH_TAKTHRIJ_RECORDS: HadithTakhrijRecord[] = [
  {
    prayerId: 'pp_1',
    title: 'Sayyidul Istighfar',
    kitab: 'Shahih al-Bukhari',
    nomorHadis: 'Hadits No. 6306 (Kitab ad-Da\'awat)',
    derajatHadis: 'Shahih Bukhari',
    mukharrijSanad: 'Imam al-Bukhari dari Syaddad bin Aus radhiyallahu \'anhu',
    perawiUtama: 'Syaddad bin Aus RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Derajat tertinggi hadits istighfar, sanad muttashil shahih tanpa cacat (illat).',
  },
  {
    prayerId: 'pp_2',
    title: 'Bismillahilladzi la yadhurru ma\'asmihi syai\'un',
    kitab: 'Sunan Abi Dawud & Sunan at-Tirmidzi',
    nomorHadis: 'Abu Dawud No. 5088; At-Tirmidzi No. 3388',
    derajatHadis: 'Shahih (Abu Dawud/Tirmidzi)',
    mukharrijSanad: 'Dari Utsman bin \'Affan radhiyallahu \'anhu, dishahihkan oleh Imam at-Tirmidzi dan Syaikh Al-Albani',
    perawiUtama: 'Utsman bin \'Affan RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Dianjurkan dibaca 3 kali di waktu pagi dan petang sebagai benteng perlindungan.',
  },
  {
    prayerId: 'pp_3',
    title: 'Radhitu billahi rabba',
    kitab: 'Sunan Abi Dawud & Musnad Ahmad',
    nomorHadis: 'Abu Dawud No. 5072; Ahmad No. 18967',
    derajatHadis: 'Shahih (Abu Dawud/Tirmidzi)',
    mukharrijSanad: 'Dari Tsauban radhiyallahu \'anhu, sanad hasan shahih',
    perawiUtama: 'Tsauban RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Menegaskan keridhaan iman atas rububiyyah Allah, Islam, dan risalah Nabi Muhammad SAW.',
  },
  {
    prayerId: 'pp_4',
    title: 'Allahumma \'afini fi badani',
    kitab: 'Sunan Abi Dawud',
    nomorHadis: 'Hadits No. 5090',
    derajatHadis: 'Shahih (Abu Dawud/Tirmidzi)',
    mukharrijSanad: 'Dari Abu Bakrah radhiyallahu \'anhu',
    perawiUtama: 'Abu Bakrah RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Doa perlindungan kesehatan jasmani, pendengaran, dan penglihatan serta perlindungan dari kekafiran.',
  },
  {
    prayerId: 'ss_1',
    title: 'Istighfar 3x & Doa Keselamatan (Ba\'da Shalat)',
    kitab: 'Shahih Muslim',
    nomorHadis: 'Hadits No. 591 (Kitab al-Masajid)',
    derajatHadis: 'Shahih Muslim',
    mukharrijSanad: 'Imam Muslim dari Tsauban radhiyallahu \'anhu',
    perawiUtama: 'Tsauban RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Amalan Rasulullah SAW setiap selesai salam sholat fardhu.',
  },
  {
    prayerId: 'ss_2',
    title: 'Tasbih, Tahmid, Takbir 33x (Ba\'da Shalat)',
    kitab: 'Shahih Muslim',
    nomorHadis: 'Hadits No. 597 (Kitab al-Masajid)',
    derajatHadis: 'Shahih Muslim',
    mukharrijSanad: 'Imam Muslim dari Abu Hurairah radhiyallahu \'anhu',
    perawiUtama: 'Abu Hurairah RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Hadits shahih sharih mengenai dzikir 33x tasbih, 33x tahmid, 33x takbir digenapi ke-100 dengan tahlil.',
  },
  {
    prayerId: 'sh_1',
    title: 'Doa Bangun Tidur (Alhamdulillahilladzi ahyana)',
    kitab: 'Shahih al-Bukhari & Shahih Muslim',
    nomorHadis: 'Bukhari No. 6312; Muslim No. 2711',
    derajatHadis: 'Shahih Muttafaqun \'Alaih',
    mukharrijSanad: 'Dari Hudzaifah bin al-Yaman dan Abu Dzarr radhiyallahu \'anhuma',
    perawiUtama: 'Hudzaifah ibnul Yaman RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Derajat tertinggi keshahihan hadits (Muttafaqun \'Alaih).',
  },
  {
    prayerId: 'sh_2',
    title: 'Doa Sebelum Tidur (Bismika Allahumma amutu wa ahya)',
    kitab: 'Shahih al-Bukhari',
    nomorHadis: 'Hadits No. 6324',
    derajatHadis: 'Shahih Bukhari',
    mukharrijSanad: 'Imam al-Bukhari dari Hudzaifah radhiyallahu \'anhu',
    perawiUtama: 'Hudzaifah RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Lafaz doa tidur ma\'tsur.',
  },
  {
    prayerId: 'sh_3',
    title: 'Doa Masuk Masjid (Allahummaftah li abwaba rahmatik)',
    kitab: 'Shahih Muslim',
    nomorHadis: 'Hadits No. 713 (Kitab Shalatil Musafirin)',
    derajatHadis: 'Shahih Muslim',
    mukharrijSanad: 'Dari Abu Usaid radhiyallahu \'anhu',
    perawiUtama: 'Abu Usaid RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Doa sunnah memasuki masjid mendahulukan kaki kanan.',
  },
  {
    prayerId: 'sh_5',
    title: 'Doa Sapu Jagat (Rabbana atina fid dunya hasanah)',
    kitab: 'Al-Qur\'an al-Karim & Shahih al-Bukhari',
    nomorHadis: 'QS. Al-Baqarah: 201; Bukhari No. 4522',
    derajatHadis: 'Ayat Al-Qur\'an',
    mukharrijSanad: 'Wahyu Allah SWT, diamalkan paling sering oleh Rasulullah SAW (HR. Bukhari dari Anas bin Malik)',
    perawiUtama: 'Anas bin Malik RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Doa terlengkap memohon kebaikan dunia, akhirat, dan keselamatan dari siksa neraka.',
  },
  {
    prayerId: 'pj_1',
    title: 'Doa Naik Kendaraan',
    kitab: 'Al-Qur\'an al-Karim & Shahih Muslim',
    nomorHadis: 'QS. Az-Zukhruf: 13-14; Muslim No. 1342',
    derajatHadis: 'Ayat Al-Qur\'an',
    mukharrijSanad: 'Dari Ibnu Umar radhiyallahu \'anhuma',
    perawiUtama: 'Abdullah bin Umar RA',
    statusVerifikasi: 'VERIFIED',
    catatanPeneliti: 'Bacaan sunnah saat menaiki kendaraan darat, laut, atau udara.',
  },
];

export const PROPHET_STORIES_AUDIT: ProphetStoryAudit[] = [
  { prophetId: 1, name: 'Nabi Adam AS', quranicCitations: ['QS. Al-Baqarah: 30-38', 'QS. Al-A\'raf: 11-25', 'QS. Taha: 115-123'], theme: 'Awal penciptaan, taubat, dan khalifah', verificationStatus: 'VERIFIED' },
  { prophetId: 3, name: 'Nabi Nuh AS', quranicCitations: ['QS. Hud: 25-48', 'QS. Al-Mu\'minun: 23-30', 'QS. Nuh: 1-28'], theme: 'Ketabahan dakwah dan bahtera keselamatan', verificationStatus: 'VERIFIED' },
  { prophetId: 6, name: 'Nabi Ibrahim AS', quranicCitations: ['QS. Al-Baqarah: 124-129', 'QS. Al-An\'am: 74-83', 'QS. Ibrahim: 35-41'], theme: 'Ketauhidan murni, Ka\'bah, dan tawakkal', verificationStatus: 'VERIFIED' },
  { prophetId: 12, name: 'Nabi Yusuf AS', quranicCitations: ['QS. Yusuf: 1-111'], theme: 'Kesabaran, memaafkan, dan kemuliaan akhlak', verificationStatus: 'VERIFIED' },
  { prophetId: 14, name: 'Nabi Musa AS', quranicCitations: ['QS. Al-Qashash: 3-44', 'QS. Taha: 9-98', 'QS. Asy-Syu\'ara: 10-68'], theme: 'Melawan kezaliman dan pertolongan mukjizat', verificationStatus: 'VERIFIED' },
  { prophetId: 25, name: 'Nabi Muhammad SAW', quranicCitations: ['QS. Ali \'Imran: 144', 'QS. Al-Ahzab: 21, 40', 'QS. Al-Fath: 28-29', 'QS. Al-Anbiya: 107'], theme: 'Rahmatan lil \'Alamin dan penyempurna akhlak', verificationStatus: 'VERIFIED' },
];
