/**
 * AKU MUSLIM — Centralized Database & Schema Migrations
 * Tahap 6: Subscription, Scalev Payment, Family Activity & Security Audit
 * Pengembang: PYRAMID GROUP
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SubscriptionPlan {
  id: string; // 'plan_gratis' | 'plan_belajar' | 'plan_keluarga' | 'plan_gabungan' | 'plan_lembaga'
  code: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  isRecommended: boolean;
  isActive: boolean; // Dapat dibeli atau disembunyikan
  displayOrder: number;
  maxFamilyProfiles: number; // 1 for regular, 5 for family (configurable)
  allowedBillingCycles: number[]; // [1, 3, 6, 12] bulan
  currency?: string; // IDR
  scalevProductId?: string; // Pemetaan produk Scalev
  scalevPriceId?: string;
  scalevProductSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanPrice {
  id: string;
  planId: string;
  periodMonths: number; // 1, 3, 6, 12
  priceIdr: number;
  originalPriceIdr: number;
  discountPercent: number;
  versionNumber: number;
  isPublished: boolean;
  effectiveFrom: string;
  currency?: string; // IDR
  scalevPriceId?: string; // Pemetaan ID varian harga di Scalev
}

export interface FeatureCatalogItem {
  featureKey: string;
  name: string;
  category: 'IBADAH_INTI' | 'HAFALAN_HIFZ' | 'TAJWID_BELAJAR' | 'KELUARGA' | 'SINKRONISASI';
  description: string;
  isFreeCoreProtected: boolean; // JIKA TRUE: DILARANG DIKUNCI / DIPINDAH KE BERBAYAR
  defaultStatus: boolean;
  allowedPlans: string[]; // ['plan_gratis', 'plan_belajar', 'plan_keluarga', 'plan_gabungan']
  usageLimit?: number; // optional limit
}

export interface CustomerSubscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  periodMonths: number;
  status:
    | 'FREE'
    | 'PENDING_PAYMENT'
    | 'ACTIVE'
    | 'GRACE_PERIOD'
    | 'CANCELED_BUT_ACTIVE'
    | 'EXPIRED'
    | 'REFUNDED'
    | 'REVOKED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  paymentProvider: 'SCALEV' | 'INTERNAL_GRANT';
  orderId?: string;
  scalevSubscriptionId?: string;
  grantedByOwner?: boolean;
  grantReason?: string;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScalevConnectionConfig {
  storeId: string;
  merchantName: string;
  apiEndpoint: string;
  apiKey: string;
  webhookSecret: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  isConnected: boolean;
  lastSyncAt: string;
  webhookSuccessCount: number;
  webhookFailedCount: number;
  lastWebhookReceivedAt?: string;
  lastWebhookEvent?: string;
  lastWebhookStatus?: string;
  lastError?: string;
  processedEventIds: string[]; // Unique constraint to prevent replay attacks
}

export interface PaymentOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  planId: string;
  planName: string;
  periodMonths: number;
  originalAmountIdr: number;
  discountAmountIdr: number;
  totalAmountIdr: number;
  voucherCode?: string;
  scalevOrderId?: string;
  scalevPaymentUrl?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'EXPIRED' | 'REFUNDED' | 'FAILED';
  idempotencyKey: string;
  createdAt: string;
  paidAt?: string;
  isSimulation?: boolean; // TAHAP 6.1: Staging simulator isolation
  activationProcessed?: boolean; // TAHAP 6.1: Deduplication per order
  metadata?: Record<string, unknown>;
}

export interface OwnerSecurityProfile {
  username: string;
  email: string;
  displayName: string;
  salt: string;
  passwordHash: string;
  encryptedTotpSecret: string; // AES-256-GCM encrypted
  totpSecretIv: string;
  totpSecretTag: string;
  mfaEnrolled: boolean;
  recoveryCodesHashed: string[]; // SHA-256 hashes of single-use recovery codes
  recoveryCodesUsed: string[];
  failedAttempts: number;
  lockoutUntil: number;
  lastEnrolledAt?: string;
  lastLoginAt?: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_NOMINAL';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  minOrderAmountIdr: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description: string;
}

export interface Family {
  id: string;
  familyName: string;
  headUserId: string;
  maxMembers: number; // default 5, configurable by owner
  subscriptionId?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId?: string;
  profileName: string;
  role: 'PARENT' | 'CHILD' | 'MEMBER';
  avatar: string;
  ageGroup: 'ANAK' | 'REMAJA' | 'DEWASA';
  shareActivityConsent: boolean;
  deviceSyncStatus: 'SYNCED' | 'PENDING' | 'OFFLINE';
  lastActiveAt: string;
}

export interface ActivitySession {
  id: string;
  userId: string;
  familyId?: string;
  profileId?: string;
  sessionType: 'FOREGROUND_ACTIVE' | 'BACKGROUND_AUDIO'; // Strictly separated! Background audio != screen time
  activityCategory: 'QURAN_READING' | 'HIFZ_PRACTICE' | 'TAJWID_LESSON' | 'GAME_PLAY' | 'AUDIO_LISTENING';
  durationSeconds: number;
  surahNumber?: number;
  ayahNumber?: number;
  details?: Record<string, unknown>;
  timestamp: string;
  devicePlatform: 'WEB' | 'ANDROID';
}

export interface LearningGoal {
  id: string;
  familyId: string;
  profileId: string;
  title: string;
  goalType: 'QURAN_MINUTES' | 'HIFZ_AYAHS' | 'TAJWID_LESSONS' | 'MURAJAAH_COUNT';
  targetValue: number;
  currentValue: number;
  period: 'DAILY' | 'WEEKLY';
  isAchieved: boolean;
  rewardPraise: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  version: number;
  plans: SubscriptionPlan[];
  planPrices: PlanPrice[];
  features: FeatureCatalogItem[];
  subscriptions: CustomerSubscription[];
  scalevConfig: ScalevConnectionConfig;
  orders: PaymentOrder[];
  vouchers: Voucher[];
  families: Family[];
  familyMembers: FamilyMember[];
  activitySessions: ActivitySession[];
  learningGoals: LearningGoal[];
  webhookLogs: Array<{ id: string; eventType: string; payload: unknown; status: string; receivedAt: string }>;
  billingAuditLogs: Array<{ id: string; actor: string; action: string; details: string; timestamp: string }>;
  ownerSecurityProfile: OwnerSecurityProfile;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'server/db/database.json');

class DatabaseStore {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private getDefaultData(): DatabaseSchema {
    return {
      version: 1,
      plans: [
        {
          id: 'plan_gratis',
          code: 'FREE',
          name: 'AKU MUSLIM Gratis',
          tagline: 'Sahabat Ibadah Setiap Hari',
          description: 'Seluruh fitur ibadah wajib gratis selamanya tanpa iklan yang mengganggu.',
          isRecommended: false,
          isActive: true,
          displayOrder: 1,
          maxFamilyProfiles: 1,
          allowedBillingCycles: [1],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'plan_belajar',
          code: 'PREMIUM_BELAJAR',
          name: 'Premium Belajar',
          tagline: 'Tingkatkan Hafalan & Bacaan Al-Qur\'an',
          description: 'Akses penuh Smart Hifz real-time auto-reveal, ujian hafalan acak, dan tajwid visual mendalam.',
          badge: 'Paling Populer',
          isRecommended: true,
          isActive: true,
          displayOrder: 2,
          maxFamilyProfiles: 1,
          allowedBillingCycles: [1, 3, 6, 12],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'plan_keluarga',
          code: 'PREMIUM_KELUARGA',
          name: 'Premium Keluarga',
          tagline: 'Pantau & Dampingi Ibadah Seluruh Anggota Keluarga',
          description: 'Seluruh fitur Premium Belajar untuk hingga 5 profil keluarga lengkap dengan Dashboard Orang Tua dan laporan perkembangan.',
          badge: 'Hemat Untuk Keluarga',
          isRecommended: false,
          isActive: true,
          displayOrder: 3,
          maxFamilyProfiles: 5,
          allowedBillingCycles: [1, 3, 6, 12],
          currency: 'IDR',
          scalevProductId: 'sc_prod_keluarga',
          scalevProductSlug: 'premium-keluarga',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'plan_gabungan',
          code: 'PREMIUM_GABUNGAN',
          name: 'Premium Gabungan (Belajar + Keluarga)',
          tagline: 'Paket Lengkap Belajar & Pengawasan Keluarga',
          description: 'Seluruh fitur Smart Hifz lanjutan, murottal qari, ujian hafalan, evaluasi tajwid mendalam, serta pengelolaan hingga 5 profil keluarga.',
          badge: 'Paling Komprehensif',
          isRecommended: false,
          isActive: true,
          displayOrder: 4,
          maxFamilyProfiles: 5,
          allowedBillingCycles: [1, 3, 6, 12],
          currency: 'IDR',
          scalevProductId: 'sc_prod_gabungan',
          scalevProductSlug: 'premium-gabungan',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'plan_lembaga',
          code: 'PREMIUM_LEMBAGA',
          name: 'Premium Lembaga (TPQ / Tahfidz)',
          tagline: 'Manajemen Kelas Ngaji & Santri',
          description: 'Disiapkan untuk TPQ, Rumah Tahfidz, dan Guru Ngaji.',
          isRecommended: false,
          isActive: false, // DISABLED sesuai instruksi Owner
          displayOrder: 5,
          maxFamilyProfiles: 50,
          allowedBillingCycles: [12],
          currency: 'IDR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      planPrices: [
        // Premium Belajar
        { id: 'pr_belajar_1m', planId: 'plan_belajar', periodMonths: 1, priceIdr: 19000, originalPriceIdr: 19000, discountPercent: 0, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_belajar_1m' },
        { id: 'pr_belajar_3m', planId: 'plan_belajar', periodMonths: 3, priceIdr: 54000, originalPriceIdr: 57000, discountPercent: 5, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_belajar_3m' },
        { id: 'pr_belajar_6m', planId: 'plan_belajar', periodMonths: 6, priceIdr: 102000, originalPriceIdr: 114000, discountPercent: 10, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_belajar_6m' },
        { id: 'pr_belajar_12m', planId: 'plan_belajar', periodMonths: 12, priceIdr: 190000, originalPriceIdr: 228000, discountPercent: 17, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_belajar_12m' },
        // Premium Keluarga
        { id: 'pr_keluarga_1m', planId: 'plan_keluarga', periodMonths: 1, priceIdr: 39000, originalPriceIdr: 39000, discountPercent: 0, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_keluarga_1m' },
        { id: 'pr_keluarga_3m', planId: 'plan_keluarga', periodMonths: 3, priceIdr: 109000, originalPriceIdr: 117000, discountPercent: 7, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_keluarga_3m' },
        { id: 'pr_keluarga_6m', planId: 'plan_keluarga', periodMonths: 6, priceIdr: 209000, originalPriceIdr: 234000, discountPercent: 11, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_keluarga_6m' },
        { id: 'pr_keluarga_12m', planId: 'plan_keluarga', periodMonths: 12, priceIdr: 390000, originalPriceIdr: 468000, discountPercent: 17, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_keluarga_12m' },
        // Premium Gabungan (Belajar + Keluarga)
        { id: 'pr_gabungan_1m', planId: 'plan_gabungan', periodMonths: 1, priceIdr: 49000, originalPriceIdr: 49000, discountPercent: 0, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_gabungan_1m' },
        { id: 'pr_gabungan_3m', planId: 'plan_gabungan', periodMonths: 3, priceIdr: 139000, originalPriceIdr: 147000, discountPercent: 5, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_gabungan_3m' },
        { id: 'pr_gabungan_6m', planId: 'plan_gabungan', periodMonths: 6, priceIdr: 269000, originalPriceIdr: 294000, discountPercent: 8, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_gabungan_6m' },
        { id: 'pr_gabungan_12m', planId: 'plan_gabungan', periodMonths: 12, priceIdr: 490000, originalPriceIdr: 588000, discountPercent: 17, versionNumber: 1, isPublished: true, effectiveFrom: '2026-01-01', currency: 'IDR', scalevPriceId: 'sc_price_gabungan_12m' },
      ],
      features: [
        // 1. FITUR IBADAH INTI GRATIS (PROTECTED DARI BERBAYAR)
        { featureKey: 'quran_30_juz', name: "Al-Qur'an 30 Juz & 114 Surah (MSI / Rasm Utsmani)", category: 'IBADAH_INTI', description: 'Teks terverifikasi Kemenag RI, terjemahan, dan tafsir standar.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },
        { featureKey: 'prayer_times_adzan', name: 'Jadwal Sholat & Kumandang Adzan Akurat', category: 'IBADAH_INTI', description: 'Metode hisab resmi Kemenag RI untuk seluruh kota di Indonesia.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },
        { featureKey: 'qibla_compass', name: 'Arah Kiblat Sensor Hardware Magnetometer', category: 'IBADAH_INTI', description: 'Penghitungan trigonometri bola akurat ke Ka\'bah Makkah.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },
        { featureKey: 'dua_dhikr_tasbih', name: 'Doa, Dzikir Pagi Petang & Tasbih Digital', category: 'IBADAH_INTI', description: 'Takhrij hadits shahih & pengingat dzikir harian.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },
        { featureKey: 'zakat_calculator', name: 'Kalkulator Zakat BAZNAS SK No. 15/2026', category: 'IBADAH_INTI', description: 'Nisab resmi Rp 7.640.144/bulan dengan verifikasi haul.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },
        { featureKey: 'murottal_offline_basic', name: 'Murottal Audio Per Ayat & Per Surah', category: 'IBADAH_INTI', description: 'Pemutaran audio qari resmi berlisensi.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },
        { featureKey: 'hifz_basic', name: 'Smart Hifz Latihan Dasar (Juz Amma)', category: 'HAFALAN_HIFZ', description: 'Latihan hafalan dasar dengan mode buka dan tutup.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },
        { featureKey: 'tajwid_basic', name: 'Belajar Hijaiyah & 10 Regio Makhraj Dasar', category: 'TAJWID_BELAJAR', description: 'Pengenalan artikulasi huruf dan audio makhraj.', isFreeCoreProtected: true, defaultStatus: true, allowedPlans: ['plan_gratis', 'plan_belajar', 'plan_keluarga'] },

        // 2. FITUR PREMIUM BELAJAR
        { featureKey: 'hifz_realtime_blur', name: 'Smart Hifz Lanjutan (Real-Time Reveal & Auto-Next)', category: 'HAFALAN_HIFZ', description: 'Satu ayat blur utuh, buka per kata saat dilafalkan, transisi antar-ayat otomatis.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_belajar', 'plan_keluarga'] },
        { featureKey: 'hifz_random_quiz', name: 'Ujian Sambung Ayat & Tebak Ayat Acak', category: 'HAFALAN_HIFZ', description: 'Tes ketangkasan daya ingat hafalan Al-Qur\'an.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_belajar', 'plan_keluarga'] },
        { featureKey: 'murajaah_scheduler', name: 'Jadwal Murajaah Berkala & Pengingat', category: 'HAFALAN_HIFZ', description: 'Algoritma pengulangan hafalan bertahap (Spaced Repetition).', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_belajar', 'plan_keluarga'] },
        { featureKey: 'tajwid_advanced_color', name: 'Mushaf Tajwid Warna & Visual Mendalam', category: 'TAJWID_BELAJAR', description: 'Penandaan hukum tajwid per kata dan panduan audio talaqqi.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_belajar', 'plan_keluarga'] },
        { featureKey: 'learning_stats_personal', name: 'Statistik & Riwayat Latihan Pribadi', category: 'TAJWID_BELAJAR', description: 'Analisis kecepatan hafalan dan grafik kemajuan harian.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_belajar', 'plan_keluarga'] },

        // 3. FITUR PREMIUM KELUARGA
        { featureKey: 'family_dashboard', name: 'Dashboard Pemantauan Orang Tua (5 Profil)', category: 'KELUARGA', description: 'Pantau durasi belajar, hafalan, dan bacaan Al-Qur\'an anak secara terpadu.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_keluarga'] },
        { featureKey: 'child_goals_tracker', name: 'Manajemen Target Belajar & Apresiasi Anak', category: 'KELUARGA', description: 'Buat target baca Qur\'an 15 menit dan hafalan 1 ayat dengan audio apresiasi.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_keluarga'] },
        { featureKey: 'family_reports_periodic', name: 'Laporan Aktivitas Harian, Mingguan & Bulanan', category: 'KELUARGA', description: 'Ringkasan komprehensif perkembangan ibadah keluarga tanpa melacak luar aplikasi.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_keluarga'] },
        { featureKey: 'cross_device_sync', name: 'Sinkronisasi Antar-Perangkat (HP Anak -> HP Orang Tua)', category: 'SINKRONISASI', description: 'Satu akun sinkron di web dan Android secara instan.', isFreeCoreProtected: false, defaultStatus: true, allowedPlans: ['plan_keluarga'] },
      ],
      subscriptions: [
        // Seed default free subscription for test user
        {
          id: 'sub_seed_1',
          userId: 'usr_guest_demo',
          userEmail: 'demo@akumuslim.id',
          userName: 'Sahabat Muslim Demo',
          planId: 'plan_gratis',
          periodMonths: 1,
          status: 'FREE',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: '2099-12-31T23:59:59.000Z',
          autoRenew: false,
          paymentProvider: 'INTERNAL_GRANT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      scalevConfig: {
        storeId: 'store_akumuslim_pyramid',
        merchantName: 'PYRAMID GROUP — AKU MUSLIM',
        apiEndpoint: 'https://api.scalev.com/v3',
        apiKey: 'scalev_live_sec_akumuslim_2026_pyramid',
        webhookSecret: 'whsec_akumuslim_pyramid_scalev_auth_hash',
        environment: 'SANDBOX',
        isConnected: true,
        lastSyncAt: new Date().toISOString(),
        webhookSuccessCount: 12,
        webhookFailedCount: 0,
        processedEventIds: [],
      },
      orders: [],
      vouchers: [
        {
          id: 'vch_ramadhan',
          code: 'RAMADHANBERKAH',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          maxUses: 1000,
          usedCount: 24,
          minOrderAmountIdr: 19000,
          validFrom: '2026-01-01',
          validUntil: '2026-12-31',
          isActive: true,
          description: 'Diskon 20% Sambut Keberkahan Belajar Al-Qur\'an',
        },
        {
          id: 'vch_keluarga',
          code: 'KELUARGABAHAGIA',
          discountType: 'FIXED_NOMINAL',
          discountValue: 10000,
          maxUses: 500,
          usedCount: 15,
          minOrderAmountIdr: 39000,
          validFrom: '2026-01-01',
          validUntil: '2026-12-31',
          isActive: true,
          description: 'Potongan Rp10.000 Paket Premium Keluarga',
        },
      ],
      families: [
        {
          id: 'fam_demo_1',
          familyName: 'Keluarga Hasan',
          headUserId: 'usr_guest_demo',
          maxMembers: 5,
          subscriptionId: 'sub_seed_1',
          createdAt: new Date().toISOString(),
        },
      ],
      familyMembers: [
        {
          id: 'mem_1',
          familyId: 'fam_demo_1',
          userId: 'usr_guest_demo',
          profileName: 'Abi Hasan (Ayah)',
          role: 'PARENT',
          avatar: '👨‍👧‍👦',
          ageGroup: 'DEWASA',
          shareActivityConsent: true,
          deviceSyncStatus: 'SYNCED',
          lastActiveAt: new Date().toISOString(),
        },
        {
          id: 'mem_2',
          familyId: 'fam_demo_1',
          profileName: 'Zaid (Anak - 9 Thn)',
          role: 'CHILD',
          avatar: '👦',
          ageGroup: 'ANAK',
          shareActivityConsent: true,
          deviceSyncStatus: 'SYNCED',
          lastActiveAt: new Date().toISOString(),
        },
        {
          id: 'mem_3',
          familyId: 'fam_demo_1',
          profileName: 'Fatimah (Anak - 7 Thn)',
          role: 'CHILD',
          avatar: '👧',
          ageGroup: 'ANAK',
          shareActivityConsent: true,
          deviceSyncStatus: 'SYNCED',
          lastActiveAt: new Date().toISOString(),
        },
      ],
      activitySessions: [
        // Real-life sample data demonstrating foreground active vs background separation
        {
          id: 'act_1',
          userId: 'usr_guest_demo',
          familyId: 'fam_demo_1',
          profileId: 'mem_2',
          sessionType: 'FOREGROUND_ACTIVE',
          activityCategory: 'QURAN_READING',
          durationSeconds: 1200, // 20 Menit
          surahNumber: 1,
          details: { surahName: 'Al-Fatihah', completedAyahs: 7 },
          timestamp: new Date().toISOString(),
          devicePlatform: 'ANDROID',
        },
        {
          id: 'act_2',
          userId: 'usr_guest_demo',
          familyId: 'fam_demo_1',
          profileId: 'mem_2',
          sessionType: 'FOREGROUND_ACTIVE',
          activityCategory: 'HIFZ_PRACTICE',
          durationSeconds: 900, // 15 Menit
          surahNumber: 112,
          details: { surahName: 'Al-Ikhlas', recognizedAsr: 4, manualAssisted: 0 },
          timestamp: new Date().toISOString(),
          devicePlatform: 'ANDROID',
        },
        {
          id: 'act_3',
          userId: 'usr_guest_demo',
          familyId: 'fam_demo_1',
          profileId: 'mem_3',
          sessionType: 'FOREGROUND_ACTIVE',
          activityCategory: 'TAJWID_LESSON',
          durationSeconds: 600, // 10 Menit
          details: { topic: 'Makharijul Huruf Halq', quizScore: 100 },
          timestamp: new Date().toISOString(),
          devicePlatform: 'WEB',
        },
        {
          id: 'act_4',
          userId: 'usr_guest_demo',
          familyId: 'fam_demo_1',
          profileId: 'mem_2',
          sessionType: 'BACKGROUND_AUDIO', // Strictly separated from screen time!
          activityCategory: 'AUDIO_LISTENING',
          durationSeconds: 1800, // 30 Menit Murottal Layar Mati
          surahNumber: 36,
          timestamp: new Date().toISOString(),
          devicePlatform: 'ANDROID',
        },
      ],
      learningGoals: [
        {
          id: 'goal_1',
          familyId: 'fam_demo_1',
          profileId: 'mem_2',
          title: 'Membaca Al-Qur\'an Harian 15 Menit',
          goalType: 'QURAN_MINUTES',
          targetValue: 15,
          currentValue: 20,
          period: 'DAILY',
          isAchieved: true,
          rewardPraise: 'Barakallahu fiik Zaid! Target membaca Al-Qur\'an hari ini tercapai gemilang.',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'goal_2',
          familyId: 'fam_demo_1',
          profileId: 'mem_2',
          title: 'Hafalan 1 Ayat Baru Smart Hifz',
          goalType: 'HIFZ_AYAHS',
          targetValue: 1,
          currentValue: 1,
          period: 'DAILY',
          isAchieved: true,
          rewardPraise: 'Masya Allah! Hafalan Surah Al-Ikhlas tuntas lancar.',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'goal_3',
          familyId: 'fam_demo_1',
          profileId: 'mem_3',
          title: 'Belajar Tajwid Makhraj 10 Menit',
          goalType: 'TAJWID_LESSONS',
          targetValue: 10,
          currentValue: 10,
          period: 'DAILY',
          isAchieved: true,
          rewardPraise: 'Alhamdulillah Fatimah menyelesaikan materi makhraj huruf Halq dengan skor 100.',
          updatedAt: new Date().toISOString(),
        },
      ],
      webhookLogs: [],
      billingAuditLogs: [
        {
          id: 'audit_init',
          actor: 'SYSTEM_BOOT',
          action: 'BILLING_ENGINE_INITIALIZED',
          details: 'Paket & harga default disinkronisasi dengan Scalev store ID: store_akumuslim_pyramid',
          timestamp: new Date().toISOString(),
        },
      ],
      ownerSecurityProfile: {
        username: 'owner',
        email: 'villa.pyramid1@gmail.com',
        displayName: 'Owner / Chief Administrator (PYRAMID GROUP)',
        salt: 'owner_sec_salt_2026_pyr',
        passwordHash: crypto.scryptSync('AkuMuslim@OwnerSecure2026!', 'owner_sec_salt_2026_pyr', 64).toString('hex'),
        encryptedTotpSecret: '',
        totpSecretIv: '',
        totpSecretTag: '',
        mfaEnrolled: false, // Audit confirmation: Not enrolled yet until first-time QR scan & verification!
        recoveryCodesHashed: [],
        recoveryCodesUsed: [],
        failedAttempts: 0,
        lockoutUntil: 0,
      },
    };
  }

  private loadDatabase(): DatabaseSchema {
    const defaultData = this.getDefaultData();
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
        const parsed = JSON.parse(raw);

        // Reconcile missing plans (e.g. plan_gabungan)
        const reconciledPlans = [...(parsed.plans || defaultData.plans)];
        defaultData.plans.forEach((dp) => {
          const exists = reconciledPlans.find((p) => p.id === dp.id);
          if (!exists) {
            reconciledPlans.push(dp);
          } else {
            // Ensure fields exist
            exists.currency = exists.currency || dp.currency || 'IDR';
            if (dp.scalevProductId && !exists.scalevProductId) exists.scalevProductId = dp.scalevProductId;
            if (dp.scalevProductSlug && !exists.scalevProductSlug) exists.scalevProductSlug = dp.scalevProductSlug;
          }
        });

        // Reconcile plan prices
        const reconciledPrices = [...(parsed.planPrices || defaultData.planPrices)];
        defaultData.planPrices.forEach((dpr) => {
          const exists = reconciledPrices.find((pr) => pr.id === dpr.id);
          if (!exists) {
            reconciledPrices.push(dpr);
          } else {
            exists.currency = exists.currency || dpr.currency || 'IDR';
            if (dpr.scalevPriceId && !exists.scalevPriceId) exists.scalevPriceId = dpr.scalevPriceId;
          }
        });

        // Reconcile features
        const reconciledFeatures = [...(parsed.features || defaultData.features)];
        reconciledFeatures.forEach((f) => {
          if (!f.isFreeCoreProtected && !f.allowedPlans.includes('plan_gabungan')) {
            f.allowedPlans.push('plan_gabungan');
          }
        });

        return {
          ...defaultData,
          ...parsed,
          plans: reconciledPlans,
          planPrices: reconciledPrices,
          features: reconciledFeatures,
          scalevConfig: {
            ...defaultData.scalevConfig,
            ...(parsed.scalevConfig || {}),
            processedEventIds: parsed.scalevConfig?.processedEventIds || [],
          },
          ownerSecurityProfile: parsed.ownerSecurityProfile || defaultData.ownerSecurityProfile,
        };
      }
    } catch {
      // Fallback to default
    }
    this.saveDatabase(defaultData);
    return defaultData;
  }

  public saveDatabase(data?: DatabaseSchema) {
    try {
      const toSave = data || this.db;
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(toSave, null, 2), 'utf8');
    } catch {
      // Write error handled gracefully
    }
  }

  // --- GETTERS ---
  public getPlans(): SubscriptionPlan[] {
    return this.db.plans.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getPlanPrices(planId?: string): PlanPrice[] {
    if (planId) {
      return this.db.planPrices.filter((p) => p.planId === planId);
    }
    return this.db.planPrices;
  }

  public getFeatures(): FeatureCatalogItem[] {
    return this.db.features;
  }

  public getScalevConfig(): ScalevConnectionConfig {
    return this.db.scalevConfig;
  }

  public getOrders(): PaymentOrder[] {
    return this.db.orders;
  }

  public getVouchers(): Voucher[] {
    return this.db.vouchers;
  }

  public getSubscriptions(): CustomerSubscription[] {
    return this.db.subscriptions;
  }

  public getFamilies(): Family[] {
    return this.db.families;
  }

  public getFamilyMembers(familyId?: string): FamilyMember[] {
    if (familyId) {
      return this.db.familyMembers.filter((m) => m.familyId === familyId);
    }
    return this.db.familyMembers;
  }

  public getActivitySessions(profileId?: string): ActivitySession[] {
    if (profileId) {
      return this.db.activitySessions.filter((s) => s.profileId === profileId);
    }
    return this.db.activitySessions;
  }

  public getLearningGoals(familyId?: string): LearningGoal[] {
    if (familyId) {
      return this.db.learningGoals.filter((g) => g.familyId === familyId);
    }
    return this.db.learningGoals;
  }

  public getBillingAuditLogs() {
    return this.db.billingAuditLogs;
  }

  // --- MUTATIONS ---
  public updateScalevConfig(update: Partial<ScalevConnectionConfig>) {
    this.db.scalevConfig = { ...this.db.scalevConfig, ...update };
    this.saveDatabase();
    return this.db.scalevConfig;
  }

  public createPlan(plan: SubscriptionPlan): SubscriptionPlan {
    const existing = this.db.plans.find((p) => p.id === plan.id);
    if (existing) {
      throw new Error(`Paket dengan ID ${plan.id} sudah ada.`);
    }
    const newPlan: SubscriptionPlan = {
      ...plan,
      currency: plan.currency || 'IDR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.plans.push(newPlan);
    this.saveDatabase();
    return newPlan;
  }

  public updatePlan(planId: string, updates: Partial<SubscriptionPlan>) {
    const idx = this.db.plans.findIndex((p) => p.id === planId);
    if (idx !== -1) {
      this.db.plans[idx] = { ...this.db.plans[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveDatabase();
      return this.db.plans[idx];
    }
    return null;
  }

  public deletePlan(planId: string): boolean {
    if (['plan_gratis', 'plan_belajar', 'plan_keluarga'].includes(planId)) {
      throw new Error(`Paket sistem dasar "${planId}" tidak dapat dihapus. Anda hanya dapat menonaktifkan statusnya.`);
    }
    const idx = this.db.plans.findIndex((p) => p.id === planId);
    if (idx !== -1) {
      this.db.plans.splice(idx, 1);
      this.db.planPrices = this.db.planPrices.filter((pr) => pr.planId !== planId);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public createPlanPrice(price: PlanPrice): PlanPrice {
    const newPrice: PlanPrice = {
      ...price,
      currency: price.currency || 'IDR',
      effectiveFrom: price.effectiveFrom || new Date().toISOString().slice(0, 10),
    };
    this.db.planPrices.push(newPrice);
    this.saveDatabase();
    return newPrice;
  }

  public updatePlanPrice(priceId: string, updates: Partial<PlanPrice>) {
    const idx = this.db.planPrices.findIndex((p) => p.id === priceId);
    if (idx !== -1) {
      this.db.planPrices[idx] = { ...this.db.planPrices[idx], ...updates };
      this.saveDatabase();
      return this.db.planPrices[idx];
    }
    return null;
  }

  public deletePlanPrice(priceId: string): boolean {
    const idx = this.db.planPrices.findIndex((p) => p.id === priceId);
    if (idx !== -1) {
      this.db.planPrices.splice(idx, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public updateFeature(featureKey: string, updates: Partial<FeatureCatalogItem>) {
    const idx = this.db.features.findIndex((f) => f.featureKey === featureKey);
    if (idx !== -1) {
      // PROTEKSI MUTLAK FITUR IBADAH INTI
      if (this.db.features[idx].isFreeCoreProtected && updates.allowedPlans && !updates.allowedPlans.includes('plan_gratis')) {
        throw new Error(`PELANGGARAN KEBIJAKAN OWNER: Fitur ibadah inti "${this.db.features[idx].name}" dilarang dikunci atau dipindahkan ke paket berbayar.`);
      }
      this.db.features[idx] = { ...this.db.features[idx], ...updates };
      this.saveDatabase();
      return this.db.features[idx];
    }
    return null;
  }

  public createOrder(order: PaymentOrder): PaymentOrder {
    this.db.orders.unshift(order);
    this.saveDatabase();
    return order;
  }

  public updateOrderStatus(orderId: string, status: PaymentOrder['paymentStatus']): PaymentOrder | null {
    const order = this.db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.paymentStatus = status;
      if (status === 'PAID') {
        order.paidAt = new Date().toISOString();
      }
      this.saveDatabase();
      return order;
    }
    return null;
  }

  public addVoucher(voucher: Voucher) {
    this.db.vouchers.push(voucher);
    this.saveDatabase();
    return voucher;
  }

  public addSubscription(sub: CustomerSubscription) {
    const existingIdx = this.db.subscriptions.findIndex((s) => s.userId === sub.userId);
    if (existingIdx !== -1) {
      this.db.subscriptions[existingIdx] = sub;
    } else {
      this.db.subscriptions.unshift(sub);
    }
    this.saveDatabase();
    return sub;
  }

  public updateCustomerSubscription(userIdOrSubId: string, updates: Partial<CustomerSubscription>): CustomerSubscription | null {
    const idx = this.db.subscriptions.findIndex((s) => s.userId === userIdOrSubId || s.id === userIdOrSubId);
    if (idx !== -1) {
      this.db.subscriptions[idx] = {
        ...this.db.subscriptions[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveDatabase();
      return this.db.subscriptions[idx];
    }
    return null;
  }

  public addActivitySession(session: ActivitySession) {
    this.db.activitySessions.unshift(session);
    this.saveDatabase();
    return session;
  }

  public addLearningGoal(goal: LearningGoal) {
    this.db.learningGoals.push(goal);
    this.saveDatabase();
    return goal;
  }

  public updateLearningGoal(goalId: string, update: Partial<LearningGoal>) {
    const idx = this.db.learningGoals.findIndex((g) => g.id === goalId);
    if (idx !== -1) {
      this.db.learningGoals[idx] = { ...this.db.learningGoals[idx], ...update, updatedAt: new Date().toISOString() };
      this.saveDatabase();
      return this.db.learningGoals[idx];
    }
    return null;
  }

  public addFamilyMember(member: FamilyMember) {
    this.db.familyMembers.push(member);
    this.saveDatabase();
    return member;
  }

  public removeFamilyMember(memberId: string) {
    this.db.familyMembers = this.db.familyMembers.filter((m) => m.id !== memberId);
    this.saveDatabase();
  }

  public logBillingAudit(actor: string, action: string, details: string) {
    // Redact any accidental tokens, keys, passwords, or hashes to prevent credential leakage in audit logs
    const safeDetails = details
      .replace(/(api[_-]?key|secret|token|password|bearer|authorization)[=:\s]+[A-Za-z0-9_\-\.]{8,}/gi, '$1=[REDACTED]')
      .replace(/\b[A-Za-z0-9]{32,64}\b/g, (match) => match.substring(0, 4) + '••••' + match.substring(match.length - 4));

    this.db.billingAuditLogs.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actor,
      action,
      details: safeDetails,
      timestamp: new Date().toISOString(),
    });
    this.saveDatabase();
  }

  public logWebhook(eventType: string, payload: unknown, status: string) {
    // Sanitize payload object to strip sensitive headers or credentials
    let sanitizedPayload = payload;
    try {
      const raw = JSON.stringify(payload);
      const cleaned = raw.replace(/"(api_?key|secret|token|password|authorization)":\s*"[^"]+"/gi, '"$1":"[REDACTED]"');
      sanitizedPayload = JSON.parse(cleaned);
    } catch {
      // Keep as-is if stringify fails
    }

    this.db.webhookLogs.unshift({
      id: `wh_${Date.now()}`,
      eventType,
      payload: sanitizedPayload,
      status,
      receivedAt: new Date().toISOString(),
    });
    this.saveDatabase();
  }

  // --- OWNER SECURITY PROFILE & RECOVERY ---
  public getOwnerSecurityProfile(): OwnerSecurityProfile {
    return this.db.ownerSecurityProfile;
  }

  public updateOwnerSecurityProfile(update: Partial<OwnerSecurityProfile>): OwnerSecurityProfile {
    this.db.ownerSecurityProfile = { ...this.db.ownerSecurityProfile, ...update };
    this.saveDatabase();
    return this.db.ownerSecurityProfile;
  }

  // --- SCALEV EVENT DEDUPLICATION ---
  public isWebhookEventProcessed(eventId: string): boolean {
    if (!this.db.scalevConfig.processedEventIds) {
      this.db.scalevConfig.processedEventIds = [];
    }
    return this.db.scalevConfig.processedEventIds.includes(eventId);
  }

  public markWebhookEventProcessed(eventId: string): void {
    if (!this.db.scalevConfig.processedEventIds) {
      this.db.scalevConfig.processedEventIds = [];
    }
    if (!this.db.scalevConfig.processedEventIds.includes(eventId)) {
      this.db.scalevConfig.processedEventIds.push(eventId);
      this.saveDatabase();
    }
  }

  public recordOrderActivation(orderIdOrNumber: string): boolean {
    const order = this.db.orders.find((o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
    if (!order) return false;
    if (order.activationProcessed) {
      return false; // Already activated previously
    }
    order.activationProcessed = true;
    this.saveDatabase();
    return true; // First time activated
  }
}

export const dbStore = new DatabaseStore();
