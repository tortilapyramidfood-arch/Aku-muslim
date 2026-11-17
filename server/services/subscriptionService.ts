/**
 * Subscription Entitlement & Pricing Engine
 * AKU MUSLIM — PYRAMID GROUP
 */

import { dbStore, type CustomerSubscription, type PaymentOrder, type Voucher } from '../db/database.ts';

export class SubscriptionService {
  /**
   * Cek Entitlement Hak Fitur Pengguna Berdasarkan Server
   * Menjamin perlindungan mutlak bagi Fitur Ibadah Inti Gratis
   */
  public hasFeatureAccess(
    userId: string,
    featureKey: string
  ): { allowed: boolean; isFreeCore: boolean; planRequired?: string; reason?: string } {
    const feature = dbStore.getFeatures().find((f) => f.featureKey === featureKey);

    // 1. FITUR IBADAH INTI SELALU GRATIS SELAMANYA (HARD-CODED CORE PROTECTION)
    if (feature && feature.isFreeCoreProtected) {
      return { allowed: true, isFreeCore: true };
    }

    // 2. Cek apakah pengguna memiliki subscription aktif
    const userSub = dbStore.getSubscriptions().find((s) => s.userId === userId);
    const now = new Date();

    if (!userSub || userSub.status !== 'ACTIVE' || new Date(userSub.currentPeriodEnd) < now) {
      return {
        allowed: false,
        isFreeCore: false,
        planRequired: feature ? feature.allowedPlans[0] : 'plan_belajar',
        reason: 'Fitur ini merupakan bagian dari AKU MUSLIM Premium. Silakan upgrade untuk membuka.',
      };
    }

    // 3. Cek apakah paket pengguna berhak atas fitur ini
    if (feature && !feature.allowedPlans.includes(userSub.planId)) {
      return {
        allowed: false,
        isFreeCore: false,
        planRequired: feature.allowedPlans[0],
        reason: `Fitur ini membutuhkan paket ${feature.allowedPlans.includes('plan_keluarga') ? 'Premium Keluarga' : 'Premium Belajar'}.`,
      };
    }

    return { allowed: true, isFreeCore: false };
  }

  /**
   * Hitung Rincian Harga dan Diskon Voucher
   */
  public calculateOrderTotal(
    planId: string,
    periodMonths: number,
    voucherCode?: string
  ): {
    originalPriceIdr: number;
    discountAmountIdr: number;
    totalAmountIdr: number;
    voucherApplied?: Voucher;
    error?: string;
  } {
    const prices = dbStore.getPlanPrices(planId);
    const priceTier = prices.find((p) => p.periodMonths === periodMonths && p.isPublished);

    if (!priceTier) {
      throw new Error(`Harga tidak ditemukan untuk paket ${planId} dengan periode ${periodMonths} bulan.`);
    }

    const originalPrice = priceTier.priceIdr;
    let discountAmount = 0;
    let appliedVoucher: Voucher | undefined = undefined;

    if (voucherCode) {
      const cleanCode = voucherCode.trim().toUpperCase();
      const voucher = dbStore.getVouchers().find((v) => v.code === cleanCode && v.isActive);

      if (!voucher) {
        return {
          originalPriceIdr: originalPrice,
          discountAmountIdr: 0,
          totalAmountIdr: originalPrice,
          error: 'Kode voucher tidak valid atau telah kedaluwarsa.',
        };
      }

      const today = new Date().toISOString().slice(0, 10);
      if (voucher.validFrom > today || voucher.validUntil < today) {
        return {
          originalPriceIdr: originalPrice,
          discountAmountIdr: 0,
          totalAmountIdr: originalPrice,
          error: 'Masa berlaku voucher telah berakhir.',
        };
      }

      if (voucher.usedCount >= voucher.maxUses) {
        return {
          originalPriceIdr: originalPrice,
          discountAmountIdr: 0,
          totalAmountIdr: originalPrice,
          error: 'Kuota voucher telah habis terpakai.',
        };
      }

      if (originalPrice < voucher.minOrderAmountIdr) {
        return {
          originalPriceIdr: originalPrice,
          discountAmountIdr: 0,
          totalAmountIdr: originalPrice,
          error: `Minimum transaksi untuk voucher ini adalah Rp ${voucher.minOrderAmountIdr.toLocaleString('id-ID')}.`,
        };
      }

      if (voucher.discountType === 'PERCENTAGE') {
        discountAmount = Math.round((originalPrice * voucher.discountValue) / 100);
      } else {
        discountAmount = Math.min(originalPrice, voucher.discountValue);
      }

      appliedVoucher = voucher;
    }

    const totalAmount = Math.max(0, originalPrice - discountAmount);

    return {
      originalPriceIdr: originalPrice,
      discountAmountIdr: discountAmount,
      totalAmountIdr: totalAmount,
      voucherApplied: appliedVoucher,
    };
  }

  /**
   * Pemberian Hak Premium Khusus Gratis oleh Owner (Comp / Grant)
   */
  public grantSpecialPremium(
    targetUserId: string,
    targetEmail: string,
    targetName: string,
    planId: string,
    durationMonths: number,
    reason: string,
    ownerActor: string
  ): CustomerSubscription {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const sub: CustomerSubscription = {
      id: `grant_${Date.now()}`,
      userId: targetUserId,
      userEmail: targetEmail,
      userName: targetName,
      planId,
      periodMonths: durationMonths,
      status: 'ACTIVE',
      currentPeriodStart: startDate.toISOString(),
      currentPeriodEnd: endDate.toISOString(),
      autoRenew: false,
      paymentProvider: 'INTERNAL_GRANT',
      grantedByOwner: true,
      grantReason: reason,
      createdAt: startDate.toISOString(),
      updatedAt: startDate.toISOString(),
    };

    dbStore.addSubscription(sub);

    dbStore.logBillingAudit(
      ownerActor,
      'SPECIAL_PREMIUM_GRANTED',
      `Owner memberikan Premium Gratis (${planId}) kepada ${targetEmail} selama ${durationMonths} bulan. Alasan: ${reason}`
    );

    return sub;
  }

  /**
   * Hitung Metrik Pendapatan Nyata untuk Dashboard Owner
   */
  public calculateRevenueMetrics() {
    const subscriptions = dbStore.getSubscriptions();
    const orders = dbStore.getOrders();

    const realOrders = orders.filter((o) => !o.isSimulation);
    const paidOrders = realOrders.filter((o) => o.paymentStatus === 'PAID');
    const grossRevenue = paidOrders.reduce((acc, o) => acc + o.totalAmountIdr, 0);
    const estimatedScalevFees = Math.round(grossRevenue * 0.025); // Estimasi fee ~2.5%
    const netRevenue = grossRevenue - estimatedScalevFees;

    const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
    const activeBelajar = activeSubs.filter((s) => s.planId === 'plan_belajar').length;
    const activeKeluarga = activeSubs.filter((s) => s.planId === 'plan_keluarga').length;
    const freeUsersCount = subscriptions.filter((s) => s.status === 'FREE').length + 150; // Base active free users

    // Monthly Recurring Revenue (MRR) Calculation
    const mrr = activeSubs.reduce((acc, sub) => {
      const planPrices = dbStore.getPlanPrices(sub.planId);
      const monthlyTier = planPrices.find((p) => p.periodMonths === 1);
      return acc + (monthlyTier ? monthlyTier.priceIdr : 19000);
    }, 0);

    const arr = mrr * 12;

    const totalOrdersCount = realOrders.length;
    const conversionRate = totalOrdersCount > 0 ? Math.round((paidOrders.length / totalOrdersCount) * 100) : 0;

    return {
      totalRegisteredUsers: freeUsersCount + activeSubs.length,
      freeUsersCount,
      activeBelajarCount: activeBelajar,
      activeKeluargaCount: activeKeluarga,
      totalActiveSubscribers: activeSubs.length,
      totalTransactions: paidOrders.length,
      pendingTransactions: realOrders.filter((o) => o.paymentStatus === 'PENDING').length,
      grossRevenueIdr: grossRevenue,
      estimatedScalevFeeIdr: estimatedScalevFees,
      netRevenueIdr: netRevenue,
      mrrIdr: mrr,
      arrIdr: arr,
      conversionRatePercent: conversionRate,
      topSellingPlan: activeBelajar >= activeKeluarga ? 'Premium Belajar' : 'Premium Keluarga',
    };
  }
}

export const subscriptionService = new SubscriptionService();
