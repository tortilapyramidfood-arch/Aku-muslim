/**
 * Tema Tampilan Mushaf Al-Qur'an Standar
 * AKU MUSLIM — PYRAMID GROUP
 *
 * 4 Tema Visual Sesuai Ketetapan Owner:
 * 1. Mushaf Klasik: Latar krem/kertas fisik, tulisan hitam, ornamen hijau & emas
 * 2. Mushaf Putih Bersih: Latar putih terang, font Arab jelas, ornamen minimal
 * 3. Mushaf Emerald: Nuansa hijau islami anggun, ornamen emas, kontras lembut
 * 4. Mushaf Malam: Latar gelap nyaman di mata, kontras tinggi, sorotan ayat teduh
 */

export type MushafThemeId = 'mushaf_klasik' | 'mushaf_putih' | 'mushaf_emerald' | 'mushaf_malam';

export interface MushafThemeDefinition {
  id: MushafThemeId;
  name: string;
  description: string;
  previewBg: string;
  previewBorder: string;
  previewText: string;
  previewBadge: string;
  // Styling classes
  containerBg: string;
  pageBg: string;
  pageBorder: string;
  pageShadow: string;
  textPrimary: string;
  textSecondary: string;
  headerBannerBg: string;
  headerBannerText: string;
  activeAyahHighlight: string;
  ayahBadgeClass: string;
  bismillahClass: string;
}

export const MUSHAF_THEMES: Record<MushafThemeId, MushafThemeDefinition> = {
  mushaf_klasik: {
    id: 'mushaf_klasik',
    name: 'Mushaf Klasik (Kertas Krem)',
    description: 'Menyerupai Al-Qur\'an cetak fisik dengan warna kertas krem hangat dan nyaman dibaca berjam-jam.',
    previewBg: 'bg-[#faf6eb]',
    previewBorder: 'border-[#d6c7a1]',
    previewText: 'text-[#2a2118]',
    previewBadge: 'bg-[#e8dec0] text-[#423420]',
    containerBg: 'bg-stone-100 dark:bg-stone-900',
    pageBg: 'bg-[#faf6eb] dark:bg-[#23201a]',
    pageBorder: 'border-[#d8caa6] dark:border-[#3e382d]',
    pageShadow: 'shadow-xl shadow-amber-950/10',
    textPrimary: 'text-[#1c1813] dark:text-[#f5eedf]',
    textSecondary: 'text-[#5a4d3a] dark:text-[#a89980]',
    headerBannerBg: 'bg-gradient-to-r from-emerald-800 to-teal-900 text-amber-300',
    headerBannerText: 'text-amber-300',
    activeAyahHighlight: 'bg-emerald-500/20 ring-2 ring-emerald-500/40 rounded-xl transition-all',
    ayahBadgeClass: 'bg-[#e5d9b6] text-[#3b2f1c] border border-[#c2b386]',
    bismillahClass: 'text-emerald-800 dark:text-emerald-300',
  },

  mushaf_putih: {
    id: 'mushaf_putih',
    name: 'Mushaf Putih Bersih',
    description: 'Latar putih jernih modern dengan kontras tajam dan ornamen minimalis.',
    previewBg: 'bg-white',
    previewBorder: 'border-stone-300',
    previewText: 'text-stone-900',
    previewBadge: 'bg-stone-100 text-stone-700',
    containerBg: 'bg-stone-50 dark:bg-stone-950',
    pageBg: 'bg-white dark:bg-stone-900',
    pageBorder: 'border-stone-200 dark:border-stone-800',
    pageShadow: 'shadow-lg shadow-stone-400/10',
    textPrimary: 'text-stone-900 dark:text-stone-50',
    textSecondary: 'text-stone-600 dark:text-stone-400',
    headerBannerBg: 'bg-stone-800 dark:bg-stone-700 text-white',
    headerBannerText: 'text-white',
    activeAyahHighlight: 'bg-emerald-500/15 ring-2 ring-emerald-500/40 rounded-xl transition-all',
    ayahBadgeClass: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
    bismillahClass: 'text-stone-800 dark:text-stone-200',
  },

  mushaf_emerald: {
    id: 'mushaf_emerald',
    name: 'Mushaf Emerald Islami',
    description: 'Sentuhan nuansa hijau zamrud klasik dengan aksen ornamen keemasan yang menenangkan ruhani.',
    previewBg: 'bg-[#064e3b]',
    previewBorder: 'border-[#047857]',
    previewText: 'text-amber-200',
    previewBadge: 'bg-[#022c22] text-amber-300',
    containerBg: 'bg-[#02231c]',
    pageBg: 'bg-[#043d2e] border-[#065f46]',
    pageBorder: 'border-[#047857]',
    pageShadow: 'shadow-2xl shadow-emerald-950/40',
    textPrimary: 'text-[#f0fdf4]',
    textSecondary: 'text-[#a7f3d0]',
    headerBannerBg: 'bg-gradient-to-r from-emerald-950 to-teal-950 text-amber-300 border border-emerald-600/30',
    headerBannerText: 'text-amber-300',
    activeAyahHighlight: 'bg-amber-400/20 ring-2 ring-amber-400/50 rounded-xl transition-all',
    ayahBadgeClass: 'bg-emerald-900/80 text-amber-300 border border-amber-400/40',
    bismillahClass: 'text-amber-300',
  },

  mushaf_malam: {
    id: 'mushaf_malam',
    name: 'Mushaf Mode Malam (OLED)',
    description: 'Latar hitam pekat sangat nyaman untuk tilawah di malam hari atau ruangan redup.',
    previewBg: 'bg-[#0a0a0a]',
    previewBorder: 'border-[#262626]',
    previewText: 'text-stone-100',
    previewBadge: 'bg-stone-800 text-emerald-300',
    containerBg: 'bg-black',
    pageBg: 'bg-[#121212] border-stone-800',
    pageBorder: 'border-stone-800',
    pageShadow: 'shadow-2xl shadow-black/80',
    textPrimary: 'text-stone-100',
    textSecondary: 'text-stone-400',
    headerBannerBg: 'bg-stone-900 text-emerald-400 border border-stone-800',
    headerBannerText: 'text-emerald-400',
    activeAyahHighlight: 'bg-emerald-500/25 ring-2 ring-emerald-400/50 rounded-xl transition-all',
    ayahBadgeClass: 'bg-stone-800 text-emerald-300 border border-stone-700',
    bismillahClass: 'text-emerald-400',
  },
};
