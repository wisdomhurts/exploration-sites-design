// POST /api/stripe-webhook — receives Stripe events and emails the accounts
// inbox about the ones that need a human: new NRMP sign-ups, failed renewals,
// and cancellations. Email is sent through Resend's HTTP API (no SDK needed).
//
// Env (see .env.example):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET — from the webhook endpoint in the Stripe dashboard
//   RESEND_API_KEY, EMAIL_FROM              — sender must be on a Resend-verified domain
//   NOTIFY_EMAIL                            — optional, defaults to accounts@explorationsites.com

import Stripe from 'stripe';

const NOTIFY_EMAIL_DEFAULT = 'accounts@explorationsites.com';
const PROGRAM_NAMES = { cadence: 'Cadence', active: 'Active Drill', full: 'Full Program' };

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Signature verification needs the exact raw body.
  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      request.headers.get('stripe-signature'),
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('stripe-webhook: bad signature', err?.message);
    return new Response('Invalid signature', { status: 400 });
  }

  let email;
  switch (event.type) {
    case 'checkout.session.completed':
      email = await newSignupEmail(stripe, event.data.object);
      break;
    case 'invoice.payment_failed':
      email = paymentFailedEmail(event.data.object);
      break;
    case 'customer.subscription.deleted':
      email = await cancelledEmail(stripe, event.data.object);
      break;
    default:
      return new Response('Ignored', { status: 200 });
  }

  try {
    await sendEmail(email);
  } catch (err) {
    // Non-2xx makes Stripe retry the event, so a transient email outage
    // doesn't silently lose a notification.
    console.error('stripe-webhook: email failed', event.type, event.id, err?.message);
    return new Response('Email failed', { status: 500 });
  }
  return new Response('OK', { status: 200 });
}

async function newSignupEmail(stripe, session) {
  const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
  const d = full.customer_details || {};
  const program = PROGRAM_NAMES[full.metadata?.program] || full.metadata?.program || 'Unknown tier';
  const items = (full.line_items?.data || []).map((li) => `${li.description} — ${money(li.amount_total, full.currency)}`);
  const taxIds = (d.tax_ids || []).map((t) => `${t.type}: ${t.value}`);

  return {
    subject: `New NRMP sign-up: ${d.business_name || d.name || d.email} — ${program}`,
    rows: [
      ['Program', program],
      ['Billing', full.metadata?.billing === 'annual' ? 'Annual (2 months free)' : 'Monthly'],
      ['Customer', d.name],
      ['Business', d.business_name],
      ['Email', d.email],
      ['Phone', d.phone],
      ['Address', formatAddress(d.address)],
      ['Tax IDs', taxIds.join(', ')],
      ['Line items', items.join('\n')],
      ['Tax', money(full.total_details?.amount_tax, full.currency)],
      ['Total charged', money(full.amount_total, full.currency)],
      ['Stripe customer', dashboardLink('customers', full.customer, full.livemode)],
      ['Stripe subscription', dashboardLink('subscriptions', full.subscription, full.livemode)],
    ],
    intro: 'A client just completed checkout for the News-Release Map Program. Next step: schedule the base-map kickoff.',
  };
}

function paymentFailedEmail(invoice) {
  return {
    subject: `Payment failed: ${invoice.customer_name || invoice.customer_email} — ${money(invoice.amount_due, invoice.currency)}`,
    rows: [
      ['Customer', invoice.customer_name],
      ['Email', invoice.customer_email],
      ['Amount due', money(invoice.amount_due, invoice.currency)],
      ['Attempt', String(invoice.attempt_count ?? '')],
      ['Invoice', invoice.hosted_invoice_url],
      ['Stripe customer', dashboardLink('customers', invoice.customer, invoice.livemode)],
    ],
    intro: 'A subscription payment failed. Stripe will retry automatically; you may want to reach out.',
  };
}

async function cancelledEmail(stripe, subscription) {
  let customer = {};
  try {
    customer = await stripe.customers.retrieve(subscription.customer);
  } catch {}
  const program = PROGRAM_NAMES[subscription.metadata?.program] || subscription.metadata?.program || '';
  return {
    subject: `Subscription cancelled: ${customer.name || customer.email || subscription.customer}${program ? ` — ${program}` : ''}`,
    rows: [
      ['Program', program],
      ['Customer', customer.name],
      ['Email', customer.email],
      ['Reason', subscription.cancellation_details?.reason],
      ['Feedback', subscription.cancellation_details?.feedback],
      ['Stripe customer', dashboardLink('customers', subscription.customer, subscription.livemode)],
    ],
    intro: 'A News-Release Map Program subscription has ended.',
  };
}

async function sendEmail({ subject, rows, intro }) {
  const filled = rows.filter(([, v]) => v);
  const text = [intro, '', ...filled.map(([k, v]) => `${k}: ${v}`)].join('\n');
  const html =
    `<p>${esc(intro)}</p><table cellpadding="6" style="border-collapse:collapse;font:14px/1.5 sans-serif">` +
    filled
      .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${esc(k)}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
      .join('') +
    '</table>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [process.env.NOTIFY_EMAIL || NOTIFY_EMAIL_DEFAULT],
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

function money(cents, currency) {
  if (cents == null) return '';
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: (currency || 'cad').toUpperCase() }).format(cents / 100);
}

function formatAddress(a) {
  if (!a) return '';
  return [a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(' '), a.country].filter(Boolean).join(', ');
}

function dashboardLink(kind, id, livemode) {
  if (!id) return '';
  return `https://dashboard.stripe.com/${livemode ? '' : 'test/'}${kind}/${typeof id === 'string' ? id : id.id}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
