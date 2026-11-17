/**
 * Client Subscription & Entitlement Service
 * AKU MUSLIM — PYRAMID GROUP
 */

export interface ClientPlanPrice {
  id: string;
  planId: string;
  periodMonths: number;
  priceIdr: number;
  originalPriceIdr: number;
  discountPercent: number;
  versionNumber: number;
  isPublished: boolean;
}

export interface ClientFeatureItem {
  featureKey: string;
  name: string;
  category: string;
  description: string;
  isFreeCoreProtected: boolean;
  defaultStatus: boolean;
  allowedPlans: string[];
}

export interface ClientPlan {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  isRecommended: boolean;
  isActive: boolean;
  displayOrder: number;
  maxFamilyProfiles: number;
  currency?: string;
  scalevProductId?: string;
  scalevPriceId?: string;
  scalevProductSlug?: string;
  prices: ClientPlanPrice[];
  features: ClientFeatureItem[];
}

export interface UserEntitlement {
  isPremium: boolean;
  status: string;
  planId: string;
  planName: string;
  periodMonths?: number;
  expiresAt?: string;
  grantedByOwner?: boolean;
  familyMaxProfiles: number;
  allowedFeatures?: string[];
}

// Protected core worship features that are ALWAYS free and never paywalled
export const FREE_CORE_FEATURES = [
  'quran_30_juz',
  'prayer_times_adzan',
  'qibla_compass',
  'dua_dhikr_tasbih',
  'zakat_calculator',
  'murottal_offline_basic',
  'hifz_basic',
  'tajwid_basic',
];

export function hasFeatureAccess(entitlement: UserEntitlement | null, featureKey: string): boolean {
  // 1. Core worship features are ALWAYS free regardless of login or subscription status
  if (FREE_CORE_FEATURES.includes(featureKey)) {
    return true;
  }
  // 2. If user has active entitlement with allowed features
  if (entitlement && entitlement.allowedFeatures && entitlement.allowedFeatures.includes(featureKey)) {
    return true;
  }
  // 3. Fallback: if premium is active, default grant access
  if (entitlement && entitlement.isPremium && entitlement.status === 'ACTIVE') {
    return true;
  }
  return false;
}

export type AndroidBillingMode = 'CONSUMPTION_ONLY' | 'USER_CHOICE_BILLING_APPROVED' | 'DISABLED';

class ClientSubscriptionService {
  // Sesuai kepatuhan Google Play: Android beroperasi sebagai CONSUMPTION_ONLY
  // Pembelian dilakukan di web resmi AKU MUSLIM dan entitlement otomatis sinkron ke HP
  private androidBillingMode: AndroidBillingMode = 'CONSUMPTION_ONLY';

  public getAndroidBillingMode(): AndroidBillingMode {
    return this.androidBillingMode;
  }

  public hasAccess(entitlement: UserEntitlement | null, featureKey: string): boolean {
    return hasFeatureAccess(entitlement, featureKey);
  }

  public async getPlans(): Promise<ClientPlan[]> {
    try {
      const res = await fetch('/api/subscription/plans');
      if (res.ok) {
        const data = await res.json();
        return data.plans || [];
      }
    } catch {
      // Fallback
    }
    return [];
  }

  public async getMyEntitlement(userId?: string): Promise<UserEntitlement> {
    try {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const res = await fetch(`/api/subscription/my-entitlement${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to Free
    }
    return {
      isPremium: false,
      status: 'FREE',
      planId: 'plan_gratis',
      planName: 'AKU MUSLIM Gratis',
      familyMaxProfiles: 1,
    };
  }

  public async validateVoucher(code: string, planId: string, periodMonths: number) {
    const res = await fetch('/api/subscription/validate-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, planId, periodMonths }),
    });
    return await res.json();
  }

  public async createCheckout(data: {
    planId: string;
    periodMonths: number;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    voucherCode?: string;
    userId?: string;
  }) {
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  }
}

export const clientSubscriptionService = new ClientSubscriptionService();
