/**
 * OWNER CONTROL CENTER — LANGGANAN & PEMBAYARAN ROUTES
 * PYRAMID GROUP
 * Memerlukan Autentikasi Server & Hak Akses OWNER
 */

import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { dbStore, type SubscriptionPlan, type PlanPrice, type FeatureCatalogItem, type Voucher } from '../db/database.ts';
import { subscriptionService } from '../services/subscriptionService.ts';
import { scalevService } from '../services/scalevService.ts';

export const ownerBillingRouter = Router();

// 1. Ringkasan Langganan & Metrik
ownerBillingRouter.get('/summary', (_req: Request, res: Response) => {
  const metrics = subscriptionService.calculateRevenueMetrics();
  res.json(metrics);
});

// 2. Paket & Harga (Draft & Published Versioning, Pemetaan Scalev)
ownerBillingRouter.get('/plans', (_req: Request, res: Response) => {
  const plans = dbStore.getPlans();
  const prices = dbStore.getPlanPrices();
  res.json({ plans, prices });
});

ownerBillingRouter.post('/plans', (req: Request, res: Response) => {
  const { id, code, name, tagline, description, badge, isRecommended, isActive, displayOrder, maxFamilyProfiles, allowedBillingCycles, currency, scalevProductId, scalevPriceId, scalevProductSlug } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Nama dan kode paket wajib diisi.' });
  }
  const planId = id || `plan_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
  try {
    const newPlan = dbStore.createPlan({
      id: planId,
      code: code.toUpperCase(),
      name: name.trim(),
      tagline: tagline || '',
      description: description || '',
      badge: badge || undefined,
      isRecommended: Boolean(isRecommended),
      isActive: Boolean(isActive),
      displayOrder: Number(displayOrder) || (dbStore.getPlans().length + 1),
      maxFamilyProfiles: Number(maxFamilyProfiles) || 1,
      allowedBillingCycles: Array.isArray(allowedBillingCycles) ? allowedBillingCycles : [1, 3, 6, 12],
      currency: currency || 'IDR',
      scalevProductId: scalevProductId || undefined,
      scalevPriceId: scalevPriceId || undefined,
      scalevProductSlug: scalevProductSlug || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    dbStore.logBillingAudit(
      'OWNER',
      'CREATE_SUBSCRIPTION_PLAN',
      `Membuat paket langganan baru: ${newPlan.name} (${newPlan.id})`
    );

    res.status(201).json({ success: true, plan: newPlan });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ownerBillingRouter.put('/plans/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<SubscriptionPlan> = req.body;
  const updated = dbStore.updatePlan(id, updates);

  if (!updated) {
    return res.status(404).json({ error: 'Paket tidak ditemukan.' });
  }

  dbStore.logBillingAudit(
    'OWNER',
    'UPDATE_SUBSCRIPTION_PLAN',
    `Memperbarui konfigurasi paket ${updated.name} (Active: ${updated.isActive})`
  );

  res.json({ success: true, plan: updated });
});

ownerBillingRouter.delete('/plans/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = dbStore.deletePlan(id);
    if (!deleted) return res.status(404).json({ error: 'Paket tidak ditemukan.' });

    dbStore.logBillingAudit('OWNER', 'DELETE_SUBSCRIPTION_PLAN', `Menghapus paket: #${id}`);
    res.json({ success: true, message: `Paket #${id} berhasil dihapus.` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ownerBillingRouter.post('/prices', (req: Request, res: Response) => {
  const { planId, periodMonths, priceIdr, originalPriceIdr, discountPercent, isPublished, scalevPriceId } = req.body;
  if (!planId || !periodMonths || priceIdr === undefined) {
    return res.status(400).json({ error: 'Plan ID, durasi bulan, dan nominal harga wajib diisi.' });
  }
  const priceId = `pr_${planId.replace('plan_', '')}_${periodMonths}m_${Date.now().toString().slice(-4)}`;
  const newPrice = dbStore.createPlanPrice({
    id: priceId,
    planId,
    periodMonths: Number(periodMonths),
    priceIdr: Number(priceIdr),
    originalPriceIdr: Number(originalPriceIdr || priceIdr),
    discountPercent: Number(discountPercent) || 0,
    versionNumber: 1,
    isPublished: isPublished !== false,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    currency: 'IDR',
    scalevPriceId: scalevPriceId || undefined,
  });

  dbStore.logBillingAudit(
    'OWNER',
    'CREATE_PLAN_PRICE',
    `Menambahkan harga paket ${planId} durasi ${periodMonths} bulan: Rp ${newPrice.priceIdr.toLocaleString('id-ID')}`
  );

  res.status(201).json({ success: true, price: newPrice });
});

ownerBillingRouter.put('/prices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<PlanPrice> = req.body;
  const updated = dbStore.updatePlanPrice(id, updates);

  if (!updated) {
    return res.status(404).json({ error: 'Tier harga tidak ditemukan.' });
  }

  dbStore.logBillingAudit(
    'OWNER',
    'UPDATE_PLAN_PRICE',
    `Memperbarui harga tier #${id} menjadi Rp ${updated.priceIdr.toLocaleString('id-ID')} (Published: ${updated.isPublished})`
  );

  res.json({ success: true, price: updated });
});

ownerBillingRouter.delete('/prices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = dbStore.deletePlanPrice(id);
  if (!deleted) return res.status(404).json({ error: 'Tier harga tidak ditemukan.' });

  dbStore.logBillingAudit('OWNER', 'DELETE_PLAN_PRICE', `Menghapus tier harga #${id}`);
  res.json({ success: true, message: `Tier harga #${id} berhasil dihapus.` });
});

// 3. Pengaturan Fasilitas (Matriks Fitur dengan Proteksi Fitur Ibadah Inti)
ownerBillingRouter.get('/features', (_req: Request, res: Response) => {
  res.json(dbStore.getFeatures());
});

ownerBillingRouter.put('/features/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  const updates: Partial<FeatureCatalogItem> = req.body;

  try {
    const updated = dbStore.updateFeature(key, updates);
    if (!updated) return res.status(404).json({ error: 'Fitur tidak ditemukan.' });

    dbStore.logBillingAudit(
      'OWNER',
      'UPDATE_FEATURE_MATRIX',
      `Memperbarui hak akses fitur "${updated.name}" pada paket [${updated.allowedPlans.join(', ')}]`
    );

    res.json({ success: true, feature: updated });
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// 5. Voucher & Promosi
ownerBillingRouter.get('/vouchers', (_req: Request, res: Response) => {
  res.json(dbStore.getVouchers());
});

ownerBillingRouter.post('/vouchers', (req: Request, res: Response) => {
  const { code, discountType, discountValue, maxUses, minOrderAmountIdr, validFrom, validUntil, description } = req.body;

  if (!code || !discountValue || !validFrom || !validUntil) {
    return res.status(400).json({ error: 'Data voucher wajib lengkap.' });
  }

  const newVoucher: Voucher = {
    id: `vch_${Date.now()}`,
    code: String(code).trim().toUpperCase(),
    discountType: discountType || 'PERCENTAGE',
    discountValue: Number(discountValue),
    maxUses: Number(maxUses) || 100,
    usedCount: 0,
    minOrderAmountIdr: Number(minOrderAmountIdr) || 0,
    validFrom,
    validUntil,
    isActive: true,
    description: description || 'Promo Spesial AKU MUSLIM',
  };

  dbStore.addVoucher(newVoucher);

  dbStore.logBillingAudit(
    'OWNER',
    'CREATE_VOUCHER',
    `Membuat voucher promo baru: ${newVoucher.code} (Diskon: ${newVoucher.discountValue}${newVoucher.discountType === 'PERCENTAGE' ? '%' : ' IDR'})`
  );

  res.status(201).json({ success: true, voucher: newVoucher });
});

// 6. Data Pelanggan & Subscriptions (Pencarian & Detail Entitlement)
ownerBillingRouter.get('/customers', (req: Request, res: Response) => {
  const search = ((req.query.search as string) || '').toLowerCase().trim();
  const subs = dbStore.getSubscriptions();
  const orders = dbStore.getOrders();
  const plans = dbStore.getPlans();
  const features = dbStore.getFeatures();

  let filtered = subs;
  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.userName.toLowerCase().includes(search) ||
        s.userEmail.toLowerCase().includes(search) ||
        s.userId.toLowerCase().includes(search) ||
        (s.orderId && s.orderId.toLowerCase().includes(search))
    );
  }

  const enriched = filtered.map((s) => {
    const plan = plans.find((p) => p.id === s.planId);
    const userOrders = orders.filter(
      (o) => o.userId === s.userId || o.customerEmail.toLowerCase() === s.userEmail.toLowerCase()
    );
    const allowedFeats = features.filter((f) => f.allowedPlans.includes(s.planId)).map((f) => f.name);

    return {
      ...s,
      planName: plan?.name || s.planId,
      maxFamilyProfiles: plan?.maxFamilyProfiles || 1,
      allowedFeatures: allowedFeats,
      transactions: userOrders.slice(0, 5),
    };
  });

  res.json(enriched);
});

// Modifikasi Akses Manual Khusus Owner (Wajib Alasan, Tercatat Audit Log)
ownerBillingRouter.post('/modify-access', (req: Request, res: Response) => {
  const { userId, userEmail, userName, action, planId, durationMonths, reason, ownerNotes } = req.body;

  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'Alasan perubahan akses manual wajib diisi demi akuntabilitas audit.' });
  }

  const email = (userEmail || '').trim().toLowerCase();
  const targetUserId = userId || `usr_${Date.now()}`;
  const months = Math.max(1, Number(durationMonths) || 1);
  const targetPlanId = planId || 'plan_belajar';

  if (action === 'REVOKE') {
    const updated = dbStore.updateCustomerSubscription(targetUserId, {
      status: 'REVOKED',
      grantReason: `Dicabut oleh Owner: ${reason.trim()}`,
      ownerNotes: ownerNotes || undefined,
    });
    dbStore.logBillingAudit(
      'OWNER',
      'REVOKE_CUSTOMER_ACCESS',
      `Mencabut akses langganan untuk ${email || targetUserId}. Alasan: ${reason.trim()}`
    );
    return res.json({ success: true, subscription: updated, message: 'Akses langganan berhasil dicabut.' });
  }

  const existingSub = dbStore.getSubscriptions().find(
    (s) => s.userId === targetUserId || (email && s.userEmail.toLowerCase() === email)
  );

  let start = new Date();
  let end = new Date(start);
  if (existingSub && new Date(existingSub.currentPeriodEnd) > start && action === 'EXTEND_PERIOD') {
    start = new Date(existingSub.currentPeriodStart);
    end = new Date(existingSub.currentPeriodEnd);
    end.setMonth(end.getMonth() + months);
  } else {
    end.setMonth(end.getMonth() + months);
  }

  const plan = dbStore.getPlans().find((p) => p.id === targetPlanId);
  const subData: CustomerSubscription = {
    id: existingSub?.id || `sub_man_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: existingSub?.userId || targetUserId,
    userEmail: email || existingSub?.userEmail || 'user@akumuslim.id',
    userName: userName || existingSub?.userName || email.split('@')[0],
    planId: targetPlanId,
    periodMonths: months,
    status: 'ACTIVE',
    currentPeriodStart: start.toISOString(),
    currentPeriodEnd: end.toISOString(),
    autoRenew: false,
    paymentProvider: 'INTERNAL_GRANT',
    grantedByOwner: true,
    grantReason: reason.trim(),
    ownerNotes: ownerNotes || existingSub?.ownerNotes,
    createdAt: existingSub?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.addSubscription(subData);

  dbStore.logBillingAudit(
    'OWNER',
    action === 'EXTEND_PERIOD' ? 'EXTEND_CUSTOMER_ACCESS' : 'GRANT_CUSTOMER_ACCESS',
    `Akses ${plan?.name || targetPlanId} (${months} bulan) diberikan kepada ${subData.userEmail}. Alasan: ${reason.trim()}`
  );

  res.json({
    success: true,
    subscription: subData,
    message: `Akses berhasil diperbarui sampai ${end.toLocaleDateString('id-ID')}.`,
  });
});

// 7. Pengaturan Premium Keluarga (Batas Profil & Retensi)
ownerBillingRouter.get('/family-settings', (_req: Request, res: Response) => {
  const familyPlan = dbStore.getPlans().find((p) => p.id === 'plan_keluarga');
  const families = dbStore.getFamilies();
  res.json({
    familyPlan,
    totalFamilies: families.length,
    maxProfilesDefault: familyPlan?.maxFamilyProfiles || 5,
  });
});

ownerBillingRouter.put('/family-settings', (req: Request, res: Response) => {
  const { maxProfiles } = req.body;
  if (!maxProfiles || Number(maxProfiles) < 1) {
    return res.status(400).json({ error: 'Batas profil keluarga harus minimal 1.' });
  }

  const updated = dbStore.updatePlan('plan_keluarga', { maxFamilyProfiles: Number(maxProfiles) });
  dbStore.logBillingAudit('OWNER', 'UPDATE_FAMILY_SETTINGS', `Mengubah batas maksimum profil keluarga menjadi ${maxProfiles} orang.`);

  res.json({ success: true, plan: updated });
});

// 8. Pembayaran Scalev (Pengaturan, Status Webhook, Pemetaan Produk & Tes Koneksi)
ownerBillingRouter.get('/scalev-config', (_req: Request, res: Response) => {
  const config = dbStore.getScalevConfig();
  const plans = dbStore.getPlans();
  const prices = dbStore.getPlanPrices();
  const webhookLogs = dbStore.getWebhookLogs();

  const envApiKey = Boolean(process.env.SCALEV_API_KEY);
  const envWebhookSecret = Boolean(process.env.SCALEV_WEBHOOK_SECRET);

  res.json({
    storeId: config.storeId,
    merchantName: config.merchantName,
    apiEndpoint: config.apiEndpoint,
    environment: config.environment,
    isConnected: config.isConnected,
    lastSyncAt: config.lastSyncAt,
    lastWebhookReceivedAt: config.lastWebhookReceivedAt || webhookLogs[0]?.receivedAt || null,
    lastWebhookEvent: config.lastWebhookEvent || webhookLogs[0]?.eventType || null,
    lastWebhookStatus: config.lastWebhookStatus || webhookLogs[0]?.status || null,
    webhookSuccessCount: config.webhookSuccessCount,
    webhookFailedCount: config.webhookFailedCount,
    apiKeySource: envApiKey ? 'ENVIRONMENT_VARIABLE (process.env.SCALEV_API_KEY)' : (config.apiKey ? 'SERVER_STORE' : 'NOT_CONFIGURED'),
    apiKeyConfigured: envApiKey || Boolean(config.apiKey),
    apiKeyMasked: (envApiKey || config.apiKey) ? '••••••••••••••••••••••••••••••••' : '(Belum Dikonfigurasi)',
    webhookSecretSource: envWebhookSecret ? 'ENVIRONMENT_VARIABLE (process.env.SCALEV_WEBHOOK_SECRET)' : (config.webhookSecret ? 'SERVER_STORE' : 'NOT_CONFIGURED'),
    webhookSecretConfigured: envWebhookSecret || Boolean(config.webhookSecret),
    webhookSecretMasked: (envWebhookSecret || config.webhookSecret) ? '••••••••••••••••••••••••••••••••' : '(Belum Dikonfigurasi)',
    productMappings: plans.map((p) => ({
      planId: p.id,
      planName: p.name,
      isActive: p.isActive,
      scalevProductId: p.scalevProductId || '-',
      scalevProductSlug: p.scalevProductSlug || '-',
      prices: prices.filter((pr) => pr.planId === p.id).map((pr) => ({
        priceId: pr.id,
        periodMonths: pr.periodMonths,
        priceIdr: pr.priceIdr,
        isPublished: pr.isPublished,
        scalevPriceId: pr.scalevPriceId || '-',
      })),
    })),
    recentWebhookLogs: webhookLogs.slice(0, 8),
  });
});

ownerBillingRouter.put('/scalev-config', (req: Request, res: Response) => {
  const { storeId, merchantName, environment, apiKey, webhookSecret } = req.body;
  const updates: any = {};
  if (storeId) updates.storeId = storeId;
  if (merchantName) updates.merchantName = merchantName;
  if (environment) updates.environment = environment;
  if (apiKey && !apiKey.includes('•')) updates.apiKey = apiKey;
  if (webhookSecret && !webhookSecret.includes('•')) updates.webhookSecret = webhookSecret;

  const updated = dbStore.updateScalevConfig(updates);
  dbStore.logBillingAudit(
    'OWNER',
    'UPDATE_SCALEV_CONFIG',
    `Memperbarui konfigurasi Scalev Store ID: ${updated.storeId} (${updated.environment})`
  );

  const envApiKey = Boolean(process.env.SCALEV_API_KEY);
  const envWebhookSecret = Boolean(process.env.SCALEV_WEBHOOK_SECRET);

  res.json({
    success: true,
    config: {
      storeId: updated.storeId,
      merchantName: updated.merchantName,
      apiEndpoint: updated.apiEndpoint,
      environment: updated.environment,
      isConnected: updated.isConnected,
      lastSyncAt: updated.lastSyncAt,
      apiKeySource: envApiKey ? 'ENVIRONMENT_VARIABLE (process.env.SCALEV_API_KEY)' : (updated.apiKey ? 'SERVER_STORE' : 'NOT_CONFIGURED'),
      apiKeyConfigured: envApiKey || Boolean(updated.apiKey),
      apiKeyMasked: '••••••••••••••••••••••••••••••••',
      webhookSecretSource: envWebhookSecret ? 'ENVIRONMENT_VARIABLE (process.env.SCALEV_WEBHOOK_SECRET)' : (updated.webhookSecret ? 'SERVER_STORE' : 'NOT_CONFIGURED'),
      webhookSecretConfigured: envWebhookSecret || Boolean(updated.webhookSecret),
      webhookSecretMasked: '••••••••••••••••••••••••••••••••',
    },
  });
});

ownerBillingRouter.post('/scalev-test', async (_req: Request, res: Response) => {
  try {
    const testResult = await scalevService.testConnection();
    res.json({ success: true, ...testResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staging Webhook Simulator (Protected: OWNER role & Staging Guard)
ownerBillingRouter.post('/simulate-webhook', async (req: Request, res: Response) => {
  const config = dbStore.getScalevConfig();

  // Server-side Staging Guard: Dilarang keras pada Production!
  if (config.environment === 'PRODUCTION' || process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Simulator webhook dilarang keras di lingkungan Production.' });
  }

  const { eventType, orderNumber, planId, periodMonths, customerEmail, customerName } = req.body;

  // Jika orderNumber belum ada, buat order simulasi yang diisolasi
  let order = orderNumber ? dbStore.getOrders().find((o) => o.orderNumber === orderNumber) : null;
  if (!order) {
    const simOrderNum = `SIM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const plan = dbStore.getPlans().find((p) => p.id === (planId || 'plan_belajar')) || dbStore.getPlans()[1];
    const prices = dbStore.getPlanPrices(plan.id);
    const price = prices.find((pr) => pr.periodMonths === (periodMonths || 1))?.priceIdr || 19000;

    order = {
      id: `ord_sim_${Date.now()}`,
      orderNumber: simOrderNum,
      userId: `usr_sim_${Date.now()}`,
      customerEmail: (customerEmail || 'owner.staging@akumuslim.id').trim().toLowerCase(),
      customerName: (customerName || 'Penguji Staging Owner').trim(),
      planId: plan.id,
      planName: plan.name,
      periodMonths: Number(periodMonths || 1),
      originalAmountIdr: price,
      discountAmountIdr: 0,
      totalAmountIdr: price,
      paymentStatus: 'PENDING',
      idempotencyKey: `idemp_sim_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isSimulation: true, // Strictly isolated from real financial reports
    };
    dbStore.createOrder(order);
  }

  const simEventUniqueId = `scalev_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let eventPayload: any;

  if (eventType === 'order.payment_status_changed_paid') {
    eventPayload = {
      unique_id: simEventUniqueId,
      event: 'order.payment_status_changed',
      created_at: new Date().toISOString(),
      data: {
        order_number: order.orderNumber,
        payment_status: 'paid',
        status: 'paid',
        amount: order.totalAmountIdr,
        customer: { email: order.customerEmail, name: order.customerName },
      },
    };
  } else if (eventType === 'payment.received') {
    eventPayload = {
      unique_id: simEventUniqueId,
      event: 'payment.received',
      created_at: new Date().toISOString(),
      data: {
        order_number: order.orderNumber,
        status: 'PAID',
        amount: order.totalAmountIdr,
      },
    };
  } else if (eventType === 'order.payment_status_changed_refunded') {
    eventPayload = {
      unique_id: simEventUniqueId,
      event: 'order.payment_status_changed',
      created_at: new Date().toISOString(),
      data: {
        order_number: order.orderNumber,
        payment_status: 'refunded',
        status: 'refunded',
      },
    };
  } else if (eventType === 'payment.failed') {
    eventPayload = {
      unique_id: simEventUniqueId,
      event: 'payment.failed',
      created_at: new Date().toISOString(),
      data: {
        order_number: order.orderNumber,
        status: 'FAILED',
      },
    };
  } else {
    // Default order.created
    eventPayload = {
      unique_id: simEventUniqueId,
      event: 'order.created',
      created_at: new Date().toISOString(),
      data: {
        order_number: order.orderNumber,
        status: 'PENDING',
        amount: order.totalAmountIdr,
      },
    };
  }

  const rawBody = JSON.stringify(eventPayload);
  // Generate real Base64 HMAC using server signing secret
  const signatureBase64 = crypto.createHmac('sha256', config.webhookSecret).update(rawBody).digest('base64');

  dbStore.logBillingAudit(
    'OWNER_STAGING',
    'SIMULATOR_WEBHOOK_TRIGGERED',
    `Simulasi ${eventPayload.event} untuk order #${order.orderNumber} (isSimulation: true)`
  );

  const result = await scalevService.handleWebhookEvent(rawBody, signatureBase64, eventPayload);
  return res.json({
    success: true,
    simulatedOrder: order,
    eventDispatched: eventPayload,
    signatureGenerated: signatureBase64,
    handlerResult: result,
  });
});

// 9. Transaksi & Invoice
ownerBillingRouter.get('/transactions', (_req: Request, res: Response) => {
  const orders = dbStore.getOrders();
  res.json(orders);
});

// 10. Pemberian Premium Gratis Khusus
ownerBillingRouter.post('/grant-special', (req: Request, res: Response) => {
  const { targetEmail, targetName, planId, durationMonths, reason } = req.body;
  if (!targetEmail || !planId || !durationMonths) {
    return res.status(400).json({ error: 'Target email, paket, dan durasi wajib disertakan.' });
  }

  const sub = subscriptionService.grantSpecialPremium(
    `usr_grant_${Date.now()}`,
    targetEmail.trim().toLowerCase(),
    targetName || targetEmail.split('@')[0],
    planId,
    Number(durationMonths),
    reason || 'Pemberian Khusus Owner',
    'OWNER'
  );

  res.json({ success: true, subscription: sub });
});

// 11. Laporan Pendapatan Mendalam
ownerBillingRouter.get('/revenue-report', (_req: Request, res: Response) => {
  const metrics = subscriptionService.calculateRevenueMetrics();
  res.json(metrics);
});

// 12. Audit Log Billing
ownerBillingRouter.get('/audit-logs', (_req: Request, res: Response) => {
  res.json(dbStore.getBillingAuditLogs());
});
