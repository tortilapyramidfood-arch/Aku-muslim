/**
 * AKU MUSLIM — Billing, Subscription & Scalev Routes
 * PYRAMID GROUP
 */

import { Router, type Request, type Response } from 'express';
import { dbStore, type PaymentOrder } from '../db/database.ts';
import { subscriptionService } from '../services/subscriptionService.ts';
import { scalevService } from '../services/scalevService.ts';

export const billingRouter = Router();

// ==========================================
// 1. PUBLIC / CUSTOMER SUBSCRIPTION ROUTES
// ==========================================

// Daftar Paket & Fasilitas Aktif
billingRouter.get('/plans', (_req: Request, res: Response) => {
  const plans = dbStore.getPlans().filter((p) => p.isActive);
  const prices = dbStore.getPlanPrices().filter((p) => p.isPublished);
  const features = dbStore.getFeatures();

  res.json({
    plans: plans.map((p) => ({
      ...p,
      prices: prices.filter((pr) => pr.planId === p.id),
      features: features.filter((f) => f.allowedPlans.includes(p.id)),
    })),
    currency: 'IDR',
  });
});

// Cek Status Entitlement Pengguna
billingRouter.get('/my-entitlement', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr_guest_demo';
  const sub = dbStore.getSubscriptions().find((s) => s.userId === userId && s.status === 'ACTIVE');
  const features = dbStore.getFeatures();

  if (sub && new Date(sub.currentPeriodEnd) > new Date()) {
    const plan = dbStore.getPlans().find((p) => p.id === sub.planId);
    const allowed = features.filter((f) => f.allowedPlans.includes(sub.planId)).map((f) => f.featureKey);
    return res.json({
      isPremium: true,
      status: sub.status,
      planId: sub.planId,
      planName: plan?.name || 'AKU MUSLIM Premium',
      periodMonths: sub.periodMonths,
      expiresAt: sub.currentPeriodEnd,
      grantedByOwner: !!sub.grantedByOwner,
      familyMaxProfiles: plan?.maxFamilyProfiles || 1,
      allowedFeatures: allowed,
    });
  }

  const freeAllowed = features.filter((f) => f.allowedPlans.includes('plan_gratis')).map((f) => f.featureKey);
  return res.json({
    isPremium: false,
    status: 'FREE',
    planId: 'plan_gratis',
    planName: 'AKU MUSLIM Gratis',
    familyMaxProfiles: 1,
    allowedFeatures: freeAllowed,
  });
});

// Validasi Kode Voucher
billingRouter.post('/validate-voucher', (req: Request, res: Response) => {
  const { code, planId, periodMonths } = req.body;
  if (!code || !planId || !periodMonths) {
    return res.status(400).json({ error: 'Kode voucher, paket, dan durasi wajib disertakan.' });
  }

  try {
    const calc = subscriptionService.calculateOrderTotal(planId, Number(periodMonths), code);
    if (calc.error) {
      return res.status(400).json({ valid: false, message: calc.error });
    }
    return res.json({
      valid: true,
      code: calc.voucherApplied?.code,
      discountAmountIdr: calc.discountAmountIdr,
      totalAmountIdr: calc.totalAmountIdr,
      description: calc.voucherApplied?.description,
    });
  } catch (err: any) {
    return res.status(400).json({ valid: false, message: err?.message || 'Gagal memvalidasi voucher' });
  }
});

// Buat Order & Sesi Checkout Scalev
billingRouter.post('/checkout', async (req: Request, res: Response) => {
  const { planId, periodMonths, customerEmail, customerName, customerPhone, voucherCode, userId } = req.body;

  if (!planId || !periodMonths || !customerEmail || !customerName) {
    return res.status(400).json({ error: 'Data pesanan dan informasi pelanggan wajib lengkap.' });
  }

  try {
    const plan = dbStore.getPlans().find((p) => p.id === planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ error: 'Paket langganan tidak valid atau sedang dinonaktifkan.' });
    }

    const calc = subscriptionService.calculateOrderTotal(planId, Number(periodMonths), voucherCode);

    const orderNumber = `AKU-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `idemp_${Date.now()}_${Math.random()}`;

    const order: PaymentOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      userId: userId || `usr_${Date.now()}`,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName.trim(),
      customerPhone: customerPhone?.trim(),
      planId,
      planName: plan.name,
      periodMonths: Number(periodMonths),
      originalAmountIdr: calc.originalPriceIdr,
      discountAmountIdr: calc.discountAmountIdr,
      totalAmountIdr: calc.totalAmountIdr,
      voucherCode: calc.voucherApplied?.code,
      paymentStatus: 'PENDING',
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    dbStore.createOrder(order);

    // Dapatkan URL Checkout Resmi Scalev
    const { checkoutUrl, scalevOrderId } = await scalevService.createCheckoutOrder(order);

    return res.json({
      success: true,
      orderNumber: order.orderNumber,
      totalAmountIdr: order.totalAmountIdr,
      scalevOrderId,
      checkoutUrl,
      message: 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran melalui portal resmi Scalev.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gagal membuat sesi pembayaran Scalev' });
  }
});

// ==========================================
// 2. SCALEV WEBHOOK & RECONCILIATION ENDPOINTS
// ==========================================
billingRouter.post('/webhooks/scalev', async (req: Request, res: Response) => {
  const signature = (
    req.headers['x-scalev-hmac-sha256'] ||
    req.headers['X-Scalev-Hmac-Sha256'] ||
    req.headers['x-scalev-signature'] ||
    req.headers['x-signature'] ||
    ''
  ) as string;
  const rawBody = JSON.stringify(req.body);

  try {
    const result = await scalevService.handleWebhookEvent(rawBody, signature, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Webhook processing failed' });
  }
});

billingRouter.get('/orders/:orderNumber/reconcile', async (req: Request, res: Response) => {
  try {
    const result = await scalevService.reconcileOrderStatus(req.params.orderNumber);
    return res.json(result);
  } catch (err: any) {
    return res.status(404).json({ error: err?.message || 'Gagal merekonsiliasi order' });
  }
});
