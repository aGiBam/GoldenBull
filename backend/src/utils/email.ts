// Minimal email sender via Resend's HTTP API (no SDK dependency needed).
// Requires RESEND_API_KEY in the environment; without it, emails are just
// logged to the console instead of failing the request — so the site keeps
// working (codes are still generated/stored) while you're setting up Resend.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'Golden Bull <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'admin@goldenbull.com';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[email:not-sent, no RESEND_API_KEY set] to=${to} subject="${subject}"`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error('Resend email failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Resend email error:', err);
  }
}

export async function notifyAdmin(subject: string, html: string): Promise<void> {
  await sendEmail(ADMIN_EMAIL, subject, html);
}
