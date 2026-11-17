/**
 * Daftar Qari & Legal Registry Status Lisensi Murottal Resmi
 * AKU MUSLIM — Audit Hak Cipta & Integritas Audio
 * 
 * KRITERIA KEPATUHAN HUKUM:
 * 1. Ketersediaan file pada CDN terbuka (seperti EveryAyah / Archive.org) TIDAK OTOMATIS
 *    menjadikan rekaman berstatus Public Domain atau bebas diredistribusikan secara komersial.
 * 2. Seluruh qari wajib memiliki metadata lengkap hak cipta, entitas pemegang hak,
 *    dan batasan izin (streaming vs offline download vs in-app redistribution).
 * 3. Status rilis publik diatur ketat: default adalah 'LICENSE_REVIEW_REQUIRED'.
 *    Penggunaan saat ini dibatasi tegas HANYA untuk INTERNAL_TESTING_ALLOWED.
 */

export type QariVerificationStatus = 'LICENSE_REVIEW_REQUIRED' | 'INTERNAL_TESTING_ALLOWED';

export interface QariInfo {
  // Identitas & URL
  id: string; // alias id untuk kompatibilitas mundur
  qariId: string;
  name: string;
  arabicName: string;
  style: string;
  editionName: string;
  baseUrl: string;
  audioBitrate: string;

  // Legal & Rights Registry Schema Lengkap
  audioSource: string;
  rightsHolder: string;
  streamingPermission: boolean;
  offlineDownloadPermission: boolean;
  inAppRedistributionPermission: boolean;
  commercialUsePermission: boolean;
  sourceDocumentUrl: string;
  verificationStatus: QariVerificationStatus;

  // Penjelasan & Status Kompatibilitas UI
  licenseStatus: QariVerificationStatus;
  licenseDescription: string;
  legalNotice: string;
  isDownloadAllowed: boolean;
}

export const QARI_LIST: QariInfo[] = [
  {
    id: 'husary',
    qariId: 'husary',
    name: 'Syaikh Mahmud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    style: 'Murattal Tartil Standar Mesir (Sangat Jelas untuk Belajar)',
    editionName: "Murattal Radio Al-Qur'an Kairo 1960 (Edisi Standar Mesir)",
    baseUrl: 'https://everyayah.com/data/Husary_128kbps/',
    audioBitrate: '128 kbps',
    audioSource: 'EveryAyah CDN (Origin: Egyptian Radio Waqf / Archive.org)',
    rightsHolder: 'Egyptian Radio and Television Union (ERTU) & Al-Husary Family Waqf',
    streamingPermission: true,
    offlineDownloadPermission: true, // Untuk uji coba internal aplikasi
    inAppRedistributionPermission: false, // Memerlukan izin legal resmi tertulis untuk publikasi toko aplikasi
    commercialUsePermission: false,
    sourceDocumentUrl: 'https://everyayah.com/data/Husary_128kbps/',
    verificationStatus: 'LICENSE_REVIEW_REQUIRED',
    licenseStatus: 'LICENSE_REVIEW_REQUIRED',
    licenseDescription: "Tersedia di EveryAyah CDN untuk syiar dakwah personal. Namun, lisensi redistribusi formal ke dalam aplikasi publik dan status domain publik Mesir masih berstatus LICENSE_REVIEW_REQUIRED sebelum rilis publik Google Play.",
    legalNotice: 'PERHATIAN OWNER: Tersedia untuk Uji Coba Beta Internal non-komersial. Memerlukan konfirmasi tertulis status wakaf/lisensi dari pihak berwenang sebelum rilis publik.',
    isDownloadAllowed: true,
  },
  {
    id: 'alafasy',
    qariId: 'alafasy',
    name: 'Syaikh Mishary Rashid Alafasy',
    arabicName: 'مشاري بن راشد العفاسي',
    style: 'Murattal Merdu Populer Internasional',
    editionName: 'Murattal Studio Alafasy 2003',
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/',
    audioBitrate: '128 kbps',
    audioSource: 'EveryAyah CDN (Origin: Alafasy Media / Studio Alafasy)',
    rightsHolder: 'Sheikh Mishary Rashid Alafasy & Alafasy Media Corp',
    streamingPermission: true,
    offlineDownloadPermission: true, // Untuk uji coba internal aplikasi
    inAppRedistributionPermission: false,
    commercialUsePermission: false,
    sourceDocumentUrl: 'https://everyayah.com/data/Alafasy_128kbps/',
    verificationStatus: 'LICENSE_REVIEW_REQUIRED',
    licenseStatus: 'LICENSE_REVIEW_REQUIRED',
    licenseDescription: 'Hak cipta rekaman dimiliki oleh Alafasy Media. Penggunaan streaming non-komersial diizinkan secara umum, namun redistribusi unduhan offline massal wajib melalui persetujuan resmi (LICENSE_REVIEW_REQUIRED).',
    legalNotice: 'STATUS HUKUM: Terbuka untuk internal beta testing. Wajib surat izin penggunaan/MoU sebelum peluncuran produksi komersial atau donasi terikat.',
    isDownloadAllowed: true,
  },
  {
    id: 'sudais',
    qariId: 'sudais',
    name: 'Syaikh Abdul Rahman As-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Murattal Khas Imam Masjidil Haram Makkah',
    editionName: 'Murattal Khutbah & Sholat Dua Masjid Suci (Haramain)',
    baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/',
    audioBitrate: '192 kbps',
    audioSource: 'EveryAyah CDN (Origin: General Authority for Care of Two Holy Mosques)',
    rightsHolder: 'General Authority for the Care of the Two Holy Mosques, Kingdom of Saudi Arabia',
    streamingPermission: true,
    offlineDownloadPermission: true, // Untuk uji coba internal aplikasi
    inAppRedistributionPermission: false,
    commercialUsePermission: false,
    sourceDocumentUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/',
    verificationStatus: 'LICENSE_REVIEW_REQUIRED',
    licenseStatus: 'LICENSE_REVIEW_REQUIRED',
    licenseDescription: 'Rekaman ibadah Haramain berstatus wakaf dakwah non-profit. Belum ada dokumen lisensi CC/Domain Publik eksplisit yang mengizinkan bundel offline pihak ketiga (LICENSE_REVIEW_REQUIRED).',
    legalNotice: 'STATUS HUKUM: Diizinkan untuk testing internal non-komersial. Wajib review legal sebelum aplikasi didistribusikan luas di Google Play Store.',
    isDownloadAllowed: true,
  },
];

export const DEFAULT_QARI = QARI_LIST[0]; // Husary (Edisi Standar Tartil Mesir)
