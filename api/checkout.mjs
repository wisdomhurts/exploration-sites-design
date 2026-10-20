// POST /api/checkout — starts a Stripe Checkout session for a News-Release Map
// Program tier or a retainer desk. The buttons on news-release-map-program.html,
// engagement.html and pricing.html are plain <form method="post"> elements, so
// this works without client-side JS.
//
// Each session = the tier's monthly subscription price (no setup fee since
// 2026-10-20; the minimum term is six months instead). GST is calculated by Stripe Tax.
//
// Env (set in Vercel → Settings → Environment Variables — see .env.example):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_NRMP_CADENCE / _ACTIVE / _FULL,
//   STRIPE_PRICE_DESK_EXPLORER / _DEVELOPER / _PRODUCER

import Stripe from 'stripe';

// paymentLink: live Stripe Payment Links (not secret). Used whenever no secret key is
// configured, or if creating a Checkout Session fails. They are set up to match this
// checkout: same prices, Stripe Tax, required address, tax ID collection, required
// Terms acceptance (6-month minimum), redirect to checkout-success.html. Desk clients
// get separate 4-month links by email (not on the site; see CLAUDE.md).
const TIERS = {
  cadence: { name: 'Cadence', priceEnv: 'STRIPE_PRICE_NRMP_CADENCE', paymentLink: 'https://buy.stripe.com/6oU9AS2GUakh2AN1cpbV606' },
  active: { name: 'Active Drill', priceEnv: 'STRIPE_PRICE_NRMP_ACTIVE', paymentLink: 'https://buy.stripe.com/bJecN44P28c9grDcV7bV607' },
  full: { name: 'Full Program', priceEnv: 'STRIPE_PRICE_NRMP_FULL', paymentLink: 'https://buy.stripe.com/5kQ5kC1CQgIFa3f9IVbV608' },
};

// Retainer desks (src/_data/desks.js): monthly price only, no setup fee, 12-month term.
// Payment Links match: Stripe Tax, required address, tax ID, Terms acceptance,
// redirect to desk-welcome.html?desk=<key>.
const DESKS = {
  explorer: { name: 'Explorer Desk', priceEnv: 'STRIPE_PRICE_DESK_EXPLORER', paymentLink: 'https://buy.stripe.com/eVq4gy4P2bolb7j3kxbV603' },
  developer: { name: 'Developer Desk', priceEnv: 'STRIPE_PRICE_DESK_DEVELOPER', paymentLink: 'https://buy.stripe.com/00w9AS6Xa0JHa3f7ANbV604' },
  producer: { name: 'Producer Desk', priceEnv: 'STRIPE_PRICE_DESK_PRODUCER', paymentLink: 'https://buy.stripe.com/fZu3cu0yM2RP1wJ08lbV605' },
};

async function deskCheckout(origin, key) {
  const desk = DESKS[key];
  if (!process.env.STRIPE_SECRET_KEY) return Response.redirect(desk.paymentLink, 303);
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env[desk.priceEnv], quantity: 1 }],
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [Terms of Service](${origin}/terms.html#retainers), including the 12-month term (twelve monthly payments), then month to month.`,
        },
      },
      metadata: { program: 'desk', desk: key },
      subscription_data: { metadata: { desk: key } },
      success_url: `${origin}/desk-welcome.html?desk=${key}`,
      cancel_url: `${origin}/engagement.html#retainers`,
    });
    return Response.redirect(session.url, 303);
  } catch (err) {
    console.error('checkout: failed to create desk session', key, err?.message);
    return Response.redirect(desk.paymentLink, 303);
  }
}

export async function POST(request) {
  const origin = new URL(request.url).origin;

  let program = '';
  try {
    program = String((await request.formData()).get('program') || '');
  } catch {}
  if (Object.hasOwn(DESKS, program)) return deskCheckout(origin, program);
  const tier = Object.hasOwn(TIERS, program) ? TIERS[program] : null;
  if (!tier) return Response.redirect(`${origin}/news-release-map-program.html`, 303);

  // No API key configured: send the buyer to the matching Payment Link.
  if (!process.env.STRIPE_SECRET_KEY) return Response.redirect(tier.paymentLink, 303);

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env[tier.priceEnv], quantity: 1 }],
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      // Requires the Terms of Service URL to be set in Stripe → Settings → Public details.
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [Terms of Service](${origin}/terms.html#subscriptions), including the 6-month minimum term (at least six monthly payments).`,
        },
      },
      metadata: { program },
      subscription_data: { metadata: { program } },
      success_url: `${origin}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/news-release-map-program.html`,
    });
    return Response.redirect(session.url, 303);
  } catch (err) {
    // Don't strand a buyer on an error page — fall back to the Payment Link.
    console.error('checkout: failed to create session', program, err?.message);
    return Response.redirect(tier.paymentLink, 303);
  }
}
