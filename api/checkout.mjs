// POST /api/checkout — starts a Stripe Checkout session for a News-Release Map
// Program tier. The tier buttons on news-release-map-program.html are plain
// <form method="post"> elements, so this works without client-side JS.
//
// Each session = the tier's monthly subscription price + the one-time base
// setup price (both added to the first invoice). GST is calculated by Stripe Tax.
//
// Env (set in Vercel → Settings → Environment Variables — see .env.example):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_NRMP_CADENCE / _ACTIVE / _FULL, STRIPE_PRICE_NRMP_SETUP

import Stripe from 'stripe';

// paymentLink: live Stripe Payment Links (not secret). Used whenever no secret key is
// configured, or if creating a Checkout Session fails. They are set up to match this
// checkout: same prices + setup fee, Stripe Tax, required address, tax ID collection,
// required Terms acceptance (4-month minimum), redirect to checkout-success.html.
const TIERS = {
  cadence: { name: 'Cadence', priceEnv: 'STRIPE_PRICE_NRMP_CADENCE', paymentLink: 'https://buy.stripe.com/28E6oGdlydwtgrD08lbV600' },
  active: { name: 'Active Drill', priceEnv: 'STRIPE_PRICE_NRMP_ACTIVE', paymentLink: 'https://buy.stripe.com/7sY3cu1CQ2RP7V74oBbV601' },
  full: { name: 'Full Program', priceEnv: 'STRIPE_PRICE_NRMP_FULL', paymentLink: 'https://buy.stripe.com/cNi14m6Xa7853ER08lbV602' },
};

export async function POST(request) {
  const origin = new URL(request.url).origin;

  let program = '';
  try {
    program = String((await request.formData()).get('program') || '');
  } catch {}
  const tier = Object.hasOwn(TIERS, program) ? TIERS[program] : null;
  if (!tier) return Response.redirect(`${origin}/news-release-map-program.html`, 303);

  // No API key configured: send the buyer to the matching Payment Link.
  if (!process.env.STRIPE_SECRET_KEY) return Response.redirect(tier.paymentLink, 303);

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: process.env[tier.priceEnv], quantity: 1 },
        { price: process.env.STRIPE_PRICE_NRMP_SETUP, quantity: 1 },
      ],
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      // Requires the Terms of Service URL to be set in Stripe → Settings → Public details.
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [Terms of Service](${origin}/terms.html#subscriptions), including the 4-month minimum term (at least four monthly payments).`,
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
