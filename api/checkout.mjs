// POST /api/checkout — starts a Stripe Checkout session for a News-Release Map
// Program tier. The tier buttons on news-release-map-program.html are plain
// <form method="post"> elements, so this works without client-side JS.
//
// Each session = the tier's subscription price (monthly, or annual = 2 months
// free) + the one-time base setup price, both on the first invoice. GST is
// calculated by Stripe Tax.
//
// Env (set in Vercel → Settings → Environment Variables — see .env.example):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_NRMP_SETUP,
//   STRIPE_PRICE_NRMP_CADENCE / _ACTIVE / _FULL            (monthly)
//   STRIPE_PRICE_NRMP_CADENCE_ANNUAL / _ACTIVE_ANNUAL / _FULL_ANNUAL

import Stripe from 'stripe';

const TIERS = {
  cadence: { name: 'Cadence', priceEnv: 'STRIPE_PRICE_NRMP_CADENCE' },
  active: { name: 'Active Drill', priceEnv: 'STRIPE_PRICE_NRMP_ACTIVE' },
  full: { name: 'Full Program', priceEnv: 'STRIPE_PRICE_NRMP_FULL' },
};

export async function POST(request) {
  const origin = new URL(request.url).origin;

  let program = '', billing = 'monthly';
  try {
    const form = await request.formData();
    program = String(form.get('program') || '');
    billing = form.get('billing') === 'annual' ? 'annual' : 'monthly';
  } catch {}
  const tier = Object.hasOwn(TIERS, program) ? TIERS[program] : null;
  if (!tier) return Response.redirect(`${origin}/news-release-map-program.html`, 303);

  const annual = billing === 'annual';
  const termNote = annual
    ? 'including annual billing, paid upfront for twelve months'
    : 'including the four-month minimum term';

  try {
    const recurringPrice = process.env[tier.priceEnv + (annual ? '_ANNUAL' : '')];
    if (!recurringPrice) throw new Error(`missing ${billing} price for ${program}`);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: recurringPrice, quantity: 1 },
        { price: process.env.STRIPE_PRICE_NRMP_SETUP, quantity: 1 },
      ],
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      // Requires the Terms of Service URL to be set in Stripe → Settings → Public details.
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [Terms of Service](${origin}/terms.html#subscriptions), ${termNote}.`,
        },
      },
      metadata: { program, billing },
      subscription_data: { metadata: { program, billing } },
      success_url: `${origin}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/news-release-map-program.html`,
    });
    return Response.redirect(session.url, 303);
  } catch (err) {
    // Don't strand a buyer on an error page — fall back to booking a call for
    // the same program, which is how purchases were handled before checkout.
    console.error('checkout: failed to create session', program, billing, err?.message);
    return Response.redirect(`${origin}/book.html?program=${program}${annual ? '&billing=annual' : ''}`, 303);
  }
}
