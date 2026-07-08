import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';
import * as paymob from '../services/paymob.service';

export const paymentsRouter = Router();

const initiateSchema = z.object({ orderId: z.string() });

/**
 * Starts a Paymob card payment for an existing order and returns the iframe
 * URL the frontend should redirect the customer to (or embed in an <iframe>).
 * Only meaningful for orders placed with paymentMethod "card" — cash/wallet
 * methods don't need this.
 */
paymentsRouter.post('/paymob/initiate', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { orderId } = initiateSchema.parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.userId !== req.user!.id) throw new ApiError(403, 'Not your order');

    const amountCents = Math.round(order.subtotal * 100);
    const authToken = await paymob.authenticate();
    const paymobOrderId = await paymob.createOrder(authToken, amountCents, order.id);

    const [firstName, ...rest] = order.shippingName.split(' ');
    const paymentToken = await paymob.createPaymentKey(authToken, amountCents, paymobOrderId, {
      first_name: firstName || order.shippingName,
      last_name: rest.join(' ') || 'N/A',
      phone_number: order.shippingPhone,
      email: order.user.email,
      city: order.shippingCity,
      country: 'EG',
      street: order.shippingAddress,
      building: 'N/A',
      floor: 'N/A',
      apartment: 'N/A',
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymobOrderId: String(paymobOrderId) },
    });

    res.json({ iframeUrl: paymob.buildIframeUrl(paymentToken) });
  } catch (err) {
    next(err);
  }
});

/**
 * Paymob's server-to-server webhook. Configure this URL (e.g.
 * https://your-api.example.com/api/payments/paymob/webhook) in the Paymob
 * dashboard under Integrations > Webhooks. Signature verification means this
 * route intentionally does NOT require our own auth — Paymob can't send our
 * JWT — the HMAC check is what proves the request is genuine.
 */
paymentsRouter.post('/paymob/webhook', async (req, res, next) => {
  try {
    const hmac = req.query['hmac'] as string | undefined;
    const transaction = req.body?.obj as Record<string, unknown> | undefined;

    if (!hmac || !transaction) {
      return res.status(400).json({ message: 'Missing hmac or transaction payload' });
    }
    if (!paymob.verifyHmac(transaction, hmac)) {
      return res.status(401).json({ message: 'Invalid HMAC signature' });
    }

    const paymobOrderId = String((transaction['order'] as Record<string, unknown>)?.['id'] ?? '');
    const success = transaction['success'] === true;
    const order = await prisma.order.findFirst({ where: { paymobOrderId } });
    if (!order) {
      // Acknowledge with 200 anyway — Paymob retries on non-2xx, and a
      // missing local order isn't something retrying will fix.
      return res.status(200).json({ message: 'Order not found locally, ignored' });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: success ? 'paid' : 'failed',
        paymobTransaction: String(transaction['id'] ?? ''),
        status: success ? 'confirmed' : order.status,
      },
    });

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});
