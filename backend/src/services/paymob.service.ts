import crypto from 'crypto';

/**
 * Paymob "Accept" integration (Egypt). Flow:
 *   1. authenticate()      -> short-lived auth token
 *   2. createOrder()       -> registers an order with Paymob, returns paymob order id
 *   3. createPaymentKey()  -> returns a payment_token used to open the iframe
 *   4. buildIframeUrl()    -> the URL you redirect the customer to
 *   5. Paymob calls your webhook when the customer finishes paying — verify
 *      it with verifyHmac() before trusting it (see payments.routes.ts).
 *
 * Docs: https://docs.paymob.com/docs/accept-standard-redirect
 *
 * This is unverified against a live account — I don't have Paymob
 * credentials to test end-to-end. The request/response shapes match
 * Paymob's published API as of writing; double check against their current
 * docs once you have a merchant account, in case they've changed something.
 */

const BASE_URL = 'https://accept.paymob.com/api';

interface BillingData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  city: string;
  country: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
}

export async function authenticate(): Promise<string> {
  const apiKey = requireEnv('PAYMOB_API_KEY');
  const res = await fetch(`${BASE_URL}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error(`Paymob auth failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function createOrder(authToken: string, amountCents: number, merchantOrderId: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      merchant_order_id: merchantOrderId,
      items: [],
    }),
  });
  if (!res.ok) throw new Error(`Paymob order creation failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { id: number };
  return data.id;
}

export async function createPaymentKey(
  authToken: string,
  amountCents: number,
  paymobOrderId: number,
  billingData: BillingData
): Promise<string> {
  const integrationId = Number(requireEnv('PAYMOB_INTEGRATION_ID_CARD'));
  const res = await fetch(`${BASE_URL}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: integrationId,
    }),
  });
  if (!res.ok) throw new Error(`Paymob payment key creation failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { token: string };
  return data.token;
}

export function buildIframeUrl(paymentToken: string): string {
  const iframeId = requireEnv('PAYMOB_IFRAME_ID');
  return `${BASE_URL.replace('/api', '')}/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
}

/**
 * Verifies the HMAC Paymob sends with webhook/callback payloads so you don't
 * trust a forged "payment succeeded" request. Paymob computes the HMAC over
 * a specific concatenation of fields from the transaction object — see their
 * docs for the exact field order, it's easy to get subtly wrong.
 */
export function verifyHmac(transaction: Record<string, unknown>, receivedHmac: string): boolean {
  const secret = requireEnv('PAYMOB_HMAC_SECRET');
  const orderedKeys = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order.id',
    'owner',
    'pending',
    'source_data.pan',
    'source_data.sub_type',
    'source_data.type',
    'success',
  ];

  const value = (path: string): string => {
    const parts = path.split('.');
    let v: unknown = transaction;
    for (const p of parts) v = (v as Record<string, unknown> | undefined)?.[p];
    return v === undefined || v === null ? '' : String(v);
  };

  const concatenated = orderedKeys.map(value).join('');
  const computed = crypto.createHmac('sha512', secret).update(concatenated).digest('hex');
  return computed === receivedHmac;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name} (see backend/.env.example)`);
  return v;
}
