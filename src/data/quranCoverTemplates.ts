/**
 * 10 Template Cover & Bingkai Al-Qur'an Terverifikasi
 * AKU MUSLIM — PYRAMID GROUP
 *
 * Menggunakan aset bingkai ornamen Islam beresolusi tinggi yang diunggah resmi oleh Owner
 * pada direktori /public/assets/aistudio/
 */

export interface QuranCoverTemplate {
  id: string;
  code: string; // 'Cover 01' - 'Cover 10'
  name: string;
  arabicName: string;
  subtitle: string;
  description: string;
  category: 'ROYAL_FLORAL' | 'MIHRAB_ARCH' | 'GEOMETRIC_ARABESQUE' | 'CLASSICAL_HERITAGE';
  assetPath: string;
  thumbnailPath: string;
  accentColor: string;
  badgeColor: string;
  isDefault?: boolean;
  isActive: boolean;
  resolution: string;
}

export const QURAN_COVER_TEMPLATES: QuranCoverTemplate[] = [
  {
    id: 'cover_01_zamrud_kerajaan',
    code: 'Cover 01',
    name: 'Zamrud Kerajaan (Emerald Royal)',
    arabicName: 'الزمرّد الملكي',
    subtitle: 'Ornamen Bunga Zamrud Hijau & Daun Emas Murni',
    description: 'Bingkai iluminasi emas bercahaya di atas kanvas hijau zamrud klasik khas mushaf kesultanan Nusantara.',
    category: 'ROYAL_FLORAL',
    assetPath: '/assets/aistudio/file_0000000015d082118d092dc85a4cfa30_d2e559a3.png',
    thumbnailPath: '/assets/aistudio/file_0000000015d082118d092dc85a4cfa30_d2e559a3.png',
    accentColor: '#059669',
    badgeColor: 'bg-emerald-600 text-white',
    isDefault: true,
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_02_mawar_madinah',
    code: 'Cover 02',
    name: 'Mawar Madinah (Pastel Rose & Gold)',
    arabicName: 'وردة المدينة',
    subtitle: 'Sentuhan Lembut Bunga Mawar & Daun Emas Pastel',
    description: 'Desain elegan penuh keteduhan bernuansa mawar merah muda dan emas antik yang menyejukkan mata saat tadarus berlama-lama.',
    category: 'ROYAL_FLORAL',
    assetPath: '/assets/aistudio/file_00000000a7948207b796bdc8d27ecfc8_b1602cbc.png',
    thumbnailPath: '/assets/aistudio/file_00000000a7948207b796bdc8d27ecfc8_b1602cbc.png',
    accentColor: '#f43f5e',
    badgeColor: 'bg-rose-600 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_03_safir_mihrab',
    code: 'Cover 03',
    name: 'Safir Mihrab Nabawi (Royal Blue & Gold)',
    arabicName: 'محراب الياقوت الأزرق',
    subtitle: 'Kubah Mihrab Biru Safir Bertabur Filigri Emas',
    description: 'Ilustrasi lengkungan mihrab megah bernuansa biru safir kerajaan dengan ukiran arabesque emas yang agung.',
    category: 'MIHRAB_ARCH',
    assetPath: '/assets/aistudio/file_0000000051488211bdde5bb27b433791_672d82d5.png',
    thumbnailPath: '/assets/aistudio/file_0000000051488211bdde5bb27b433791_672d82d5.png',
    accentColor: '#2563eb',
    badgeColor: 'bg-blue-600 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_04_lapis_geometris',
    code: 'Cover 04',
    name: 'Lapis Lazuli Geometris (Cobalt & Silver)',
    arabicName: 'اللازورد الهندسي',
    subtitle: 'Arabesque Geometri Simetris Khas Samarkand',
    description: 'Pola geometris simetris khas arsitektur Islam klasik Asia Tengah dengan aksen perak dan biru kobalt yang presisi.',
    category: 'GEOMETRIC_ARABESQUE',
    assetPath: '/assets/aistudio/file_00000000575c821182eac13e3f1b78c9_b3a5b3c3.png',
    thumbnailPath: '/assets/aistudio/file_00000000575c821182eac13e3f1b78c9_b3a5b3c3.png',
    accentColor: '#0284c7',
    badgeColor: 'bg-sky-600 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_05_perkamen_klasik',
    code: 'Cover 05',
    name: 'Perkamen Klasik Utsmani (Parchment Heritage)',
    arabicName: 'الرق العثماني الكلاسيكي',
    subtitle: 'Tekstur Kertas Kuno dengan Bingkai Floral Lembut',
    description: 'Nuansa mushaf tulisan tangan zaman dahulu dengan latar kertas perkamen antik hangat dan ornamen herbal Islami.',
    category: 'CLASSICAL_HERITAGE',
    assetPath: '/assets/aistudio/file_0000000030488211abea9fc900d4c991_c1360d5c.png',
    thumbnailPath: '/assets/aistudio/file_0000000030488211abea9fc900d4c991_c1360d5c.png',
    accentColor: '#d97706',
    badgeColor: 'bg-amber-600 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_06_pirus_andalusia',
    code: 'Cover 06',
    name: 'Pirus Andalusia (Turquoise Floral Arch)',
    arabicName: 'الفيروز الأندلسي',
    subtitle: 'Lengkungan Istana Alhambra Warna Pirus Segar',
    description: 'Inspirasi kaligrafi dan ornamen floral dari Cordoba & Granada Spanyol dengan dominasi warna hijau toska pirus.',
    category: 'MIHRAB_ARCH',
    assetPath: '/assets/aistudio/file_000000006b948207973d5874bb686f53_77704655.png',
    thumbnailPath: '/assets/aistudio/file_000000006b948207973d5874bb686f53_77704655.png',
    accentColor: '#0d9488',
    badgeColor: 'bg-teal-600 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_07_kiswah_kabah',
    code: 'Cover 07',
    name: 'Kiswah Ka\'bah (Onyx Black & Gold Luxurious)',
    arabicName: 'كسوة الكعبة المشرفة',
    subtitle: 'Latar Hitam Pekat dengan Benang Emas Kaligrafi',
    description: 'Terinspirasi kemegahan kain Kiswah Ka\'bah di Masjidil Haram, memadukan latar hitam legam dan sulaman benang emas murni.',
    category: 'MIHRAB_ARCH',
    assetPath: '/assets/aistudio/file_00000000550482119be2731ef918c40c_93a35a7c.png',
    thumbnailPath: '/assets/aistudio/file_00000000550482119be2731ef918c40c_93a35a7c.png',
    accentColor: '#eab308',
    badgeColor: 'bg-stone-900 text-amber-300 border border-amber-500/40',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_08_lembayung_malam',
    code: 'Cover 08',
    name: 'Lembayung Malam (Violet & Gold Starlight)',
    arabicName: 'بنفسج ليلة القدر',
    subtitle: 'Kemegahan Ungu Dirgantara & Taburan Bintang',
    description: 'Suasana tenang malam lailatul qadr dengan gradasi warna ungu kerajaan dan ukiran batas emas berkilau.',
    category: 'ROYAL_FLORAL',
    assetPath: '/assets/aistudio/file_00000000b15c8211aad51c501a85b45b_d7099200.png',
    thumbnailPath: '/assets/aistudio/file_00000000b15c8211aad51c501a85b45b_d7099200.png',
    accentColor: '#7c3aed',
    badgeColor: 'bg-purple-600 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_09_marmer_putih',
    code: 'Cover 09',
    name: 'Marmer Putih Haramain (Ivory White & Gold)',
    arabicName: 'رخام الحرمين الأبيض',
    subtitle: 'Kemurnian Marmer Putih Thawaf & Garis Emas Halus',
    description: 'Tampilan bersih, sejuk, dan minimalis tanpa mengorbankan keagungan ornamen Islam klasik.',
    category: 'GEOMETRIC_ARABESQUE',
    assetPath: '/assets/aistudio/file_0000000032c082118561c3a2ae078e9a_9c542922.png',
    thumbnailPath: '/assets/aistudio/file_0000000032c082118561c3a2ae078e9a_9c542922.png',
    accentColor: '#64748b',
    badgeColor: 'bg-stone-100 text-stone-800 border border-stone-300',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_10_delima_sultan',
    code: 'Cover 10',
    name: 'Delima Sultan Utsmani (Ruby Red Classical)',
    arabicName: 'ياقوت السلطان العثماني',
    subtitle: 'Warna Merah Delima Kemewahan Istana Topkapi',
    description: 'Karakter kuat dan khusyuk dengan warna merah delima mendalam berpadu ornamen keemasan yang tajam.',
    category: 'CLASSICAL_HERITAGE',
    assetPath: '/assets/aistudio/file_00000000a31c8211b4256930ee6c056a_7def1269.png',
    thumbnailPath: '/assets/aistudio/file_00000000a31c8211b4256930ee6c056a_7def1269.png',
    accentColor: '#dc2626',
    badgeColor: 'bg-red-700 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
  {
    id: 'cover_11_kubah_hijau',
    code: 'Cover 11',
    name: 'Kubah Hijau Nabawi (Forest Green & Gold Dome)',
    arabicName: 'القبة الخضراء النبوية',
    subtitle: 'Hijau Tua Sakral Kubah Masjid Nabawi',
    description: 'Template pelengkap yang menghadirkan rasa rindu ke Raudhah dan Masjid Nabawi di Madinah Al-Munawwarah.',
    category: 'MIHRAB_ARCH',
    assetPath: '/assets/aistudio/file_00000000b56c82118085591d31e5d4b8_08e8d24e.png',
    thumbnailPath: '/assets/aistudio/file_00000000b56c82118085591d31e5d4b8_08e8d24e.png',
    accentColor: '#15803d',
    badgeColor: 'bg-emerald-800 text-white',
    isActive: true,
    resolution: '1536 × 2048 PNG',
  },
];

export const DEFAULT_QURAN_COVER = QURAN_COVER_TEMPLATES[0];

export function getQuranCoverTemplate(id?: string): QuranCoverTemplate {
  if (!id) return DEFAULT_QURAN_COVER;
  return QURAN_COVER_TEMPLATES.find((c) => c.id === id) || DEFAULT_QURAN_COVER;
}

export function getSavedQuranCoverId(): string {
  if (typeof window === 'undefined') return DEFAULT_QURAN_COVER.id;
  return localStorage.getItem('akumuslim_quran_cover') || DEFAULT_QURAN_COVER.id;
}

export function saveQuranCoverId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('akumuslim_quran_cover', id);
}

export function isQuranFrameEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('akumuslim_quran_frame_enabled');
  return saved === null ? true : saved === 'true';
}

export function setQuranFrameEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('akumuslim_quran_frame_enabled', enabled ? 'true' : 'false');
}
