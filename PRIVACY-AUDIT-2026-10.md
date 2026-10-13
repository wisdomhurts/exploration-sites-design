# Privacy, consent & checkout audit — explorationsites.com

Date: 2026-10-13 · Branch: `privacy-audit` (local only; not pushed, not deployed)

Scope: forms and marketing email, NRMP recurring billing, fonts/tracking/embeds,
and accuracy of the Privacy Policy and Terms. Method: code inspection, read-only
Stripe API calls against the live account (it has no test mode), rendering the
Stripe checkout page without paying, and headless-browser probes of the live site.
This is a technical audit, not legal advice; items marked **legal review** need a
qualified person.

Status key: **already addressed** · **fixed** · **not applicable** · **unverified**

---

## 1. Forms and marketing email

| # | Finding | Evidence | Status |
|---|---|---|---|
| 1.1 | Contact and Scorecard forms post only to Formspree (same form ID), handled client-side; no marketing checkbox, no CRM or mailing-list call in code. | `src/contact.html:128`, `src/fundable-materials-scorecard.html:59` | already addressed |
| 1.2 | The site has no marketing or newsletter signup, so there is no opt-in to build or consent record to store. | site-wide grep: no newsletter/subscribe/consent fields | not applicable |
| 1.3 | Privacy Policy did not say that an enquiry, booking or scorecard request is **not** a marketing signup. Added. | `src/privacy.html:280` | fixed |
| 1.4 | Privacy Policy claims marketing email may also be sent "where Canada's anti-spam law otherwise allows (for example, to current clients)", i.e. implied consent. Under CASL an existing business relationship lasts 2 years from a purchase or 6 months from an inquiry, and the sender must prove consent. Whether you rely on that, and keep the records to prove it, is a business decision. | `src/privacy.html:280` | unverified — **owner + legal review** |
| 1.5 | HighLevel (sub-account "Exploration sites") has published legacy workflows: **ES NEWSLETTER SUBSCRIBERS** (3 enrolled), **Contact Form Submits** (40), **get a quote** (13), plus MEETING REMINDERS and 01 POST SALES folders. The new site doesn't feed them (forms go to Formspree), but bookings create HighLevel contacts. Not inspected: triggers, email content, sender identification, mailing address, unsubscribe/suppression, and consent records for the 3 newsletter contacts. | HighLevel → Automation → Workflows → REACH | unverified — **owner** |
| 1.6 | HighLevel booking form ("Kick-off call confirmation") not inspected for marketing/SMS consent checkboxes, or whether any are pre-checked. | HighLevel → Calendars → Book a Free Consultation → Forms | unverified — **owner** |
| 1.7 | Formspree dashboard integrations (autoresponders, forwarding to a CRM or list) can't be seen from the repo. | Formspree form `xykqelyb` | unverified — **owner** |
| 1.8 | Service vs promotional email: the only code that sends email (`api/stripe-webhook.mjs`) emails your own accounts inbox, never customers, and is inactive (no webhook endpoint in Stripe; `RESEND_API_KEY`, `EMAIL_FROM` and `STRIPE_SECRET_KEY` not set in Vercel). | `api/stripe-webhook.mjs:130-143` | already addressed |
| 1.9 | CASL requires every commercial email to carry a valid mailing address. The policy says an address is "available on request" and none is published (the home address was deliberately removed from Stripe). An address for marketing email (e.g. a PO box or virtual office) is needed before sending any. | `src/privacy.html` §10 | unverified — **owner** |

## 2. Recurring billing (News-Release Map Program)

| # | Finding | Evidence | Status |
|---|---|---|---|
| 2.1 | "Start this program" posts to `/api/checkout`. With no `STRIPE_SECRET_KEY` set, it 303-redirects to one of three live Payment Links. The Checkout Session code path is dormant. | `api/checkout.mjs:31`, Vercel env names | already addressed |
| 2.2 | Payment Links match site prices: CAD $2,500 / $3,500 / $4,500 monthly plus a $2,500 one-time setup, tax-exclusive, Stripe Tax on, address and tax ID required, promotions consent off. | Stripe API (read-only); `src/_data/prices.json` | already addressed |
| 2.3 | Stripe's checkout page shows, before payment: "CA$5,000.00 — Then CA$2,500.00 per month", itemised setup and monthly lines, tax once an address is entered, an **unchecked** Terms box naming the 4-month minimum, and "authorize… to charge you… until you cancel". | rendered `buy.stripe.com/28E6…` (no payment) | already addressed |
| 2.4 | Site discloses the monthly price, 4-month minimum then month-to-month, setup fee billed with the first month, pause rules, and CAD (in the terms list). Tier cards show no currency, following your earlier decision to remove "CAD" labels; currency appears on Stripe and in the Terms. | `src/news-release-map-program.html:13, 56, 102, 145-149` | already addressed (currency on cards: owner choice) |
| 2.5 | Terms acceptance is required on all three Payment Links and in the Session code. Stripe records acceptance on each Checkout Session (`consent.terms_of_service`). No sessions exist yet, so a stored record couldn't be inspected. | Stripe API; `api/checkout.mjs:48-53` | already addressed (record unverified until first sale) |
| 2.6 | Website, consent text, Terms and the post-payment page agree: setup plus first month at checkout, 4 paid months then month-to-month, cancel by email, pause up to 6 months that doesn't count toward the minimum. | `src/terms.html:306-312`, `src/checkout-success.html:14-15` | already addressed |
| 2.7 | No Stripe customer portal is configured, so clients can't self-cancel and cancellation happens by email, as the Terms say. Stripe won't enforce the 4-month minimum, pauses, or "remaining minimum months payable"; those are manual. | Stripe API: 0 portal configurations | unverified — **owner process** |
| 2.8 | **Klarna** (buy now, pay later) is enabled on the checkout. Whether to offer it on a B2B recurring subscription is your call. | rendered checkout page | unverified — **owner, Stripe → Payment methods** |
| 2.9 | Customer emails Stripe sends (payment receipts, which the post-payment page promises; renewal reminders; failed-payment emails) are dashboard settings the API doesn't expose. | Stripe → Settings → Customer emails / Billing | unverified — **owner** |
| 2.10 | Stripe Tax has an active Canadian registration (standard). | Stripe API | already addressed |

## 3. Fonts, tracking and embedded services

| # | Finding | Evidence | Status |
|---|---|---|---|
| 3.1 | All fonts (Inter, Source Serif 4) are self-hosted. No Google Fonts or other remote font loads on the site's own pages. | `src/styles.css:2-6`, `src/fonts/` | already addressed |
| 3.2 | **Vercel Web Analytics sent the full URL, including the query string.** A live probe with `?email=…&first_name=…&session_id=…` sent all of it. Likely sources: HighLevel forwards widget parameters to `/booking-confirmed.html`, the dormant Session path adds `?session_id=`, and campaign links could prefill name or email. Added a `beforeSend` filter keeping only `utm_*`, `ref`, and a valid `program`. | `src/_includes/scripts.html:424-444` | **fixed** |
| 3.3 | Nine key pages (home, contact, scorecard, NRMP, movies, Montage case study, booking-confirmed, checkout-success, websites) load only from your own domain and set no cookies. No session replay, ad pixels or tag managers. | headless probe of live site | not applicable (nothing to disable) |
| 3.4 | YouTube plays from `youtube-nocookie.com` and loads only when a visitor clicks play, which matches the policy. | `src/_includes/scripts.html:370-373` | already addressed |
| 3.5 | **Booking page:** HighLevel's calendar iframe loads `connect.facebook.net/en_US/fbevents.js` (via HighLevel's `pixel.js`) and Google Fonts, and sets Cloudflare's `__cf_bm` cookie on leadconnectorhq.com. No Meta pixel ID is configured and no Meta events fired, but visitors' IP addresses and browser details reach Meta and Google. This wasn't disclosed; the Privacy Policy now says so. | probe of `/book.html`; HighLevel calendar "Meta pixel ID" field empty | **fixed** (disclosure) · remaining: **owner** |
| 3.6 | Cookie banner: the site's own pages set no cookies and analytics is cookieless, so none is warranted for the site itself. Whether the Meta request inside the booking iframe calls for notice or consent before loading (e.g. a "load calendar" click) is a **legal review** item. | — | unverified — **legal review** |

Owner options for 3.5, none implemented because each changes the booking experience: ask HighLevel support to stop the Meta library loading when no pixel is set; switch the calendar's widget font to a system font if HighLevel allows it; or put the calendar behind a "Show available times" click.

## 4. Policy accuracy and applicability

| # | Finding | Evidence | Status |
|---|---|---|---|
| 4.1 | Breach notice said you'd report "to the Privacy Commissioner of Canada". BC's PIPA has no mandatory breach notification (the BC OIPC recommends reporting as best practice); PIPEDA does where it applies. Now "the appropriate privacy commissioner". | `src/privacy.html:356` | fixed |
| 4.2 | Processor list (Vercel, Formspree, HighLevel/LeadConnector, Stripe, Google Workspace, Resend, YouTube) matches the code. Resend isn't active yet (no key). Klarna isn't named; it's disclosed within Stripe's checkout if chosen. | `src/privacy.html:302`; Vercel env names | already addressed (Resend/Klarna: owner awareness) |
| 4.3 | Retention, deletion, team-access and NDA statements describe business practice and can't be verified from code. | `src/privacy.html` §03, §06, §09 | unverified — **owner** |
| 4.4 | A Privacy Officer is named with an email contact; no postal address is published. | `src/privacy.html` §10 | already addressed (address: see 1.9) |
| 4.5 | GDPR rights section: you serve some non-Canadian issuers, but nothing shows targeting of EU/UK individuals. Harmless to keep; whether GDPR applies at all is **legal review**. | `src/privacy.html:333-335` | unverified — **legal review** |
| 4.6 | US state privacy laws (e.g. CCPA/CPRA): applicability thresholds (revenue or volume of consumers' data) are unlikely to be met by a B2B studio. | — | not applicable (confirm with legal if US revenue grows) |
| 4.7 | Age collection or age gate: B2B site, not directed at children, with a "not knowingly under the age of majority" line already. | `src/privacy.html:269` | not applicable |
| 4.8 | DMCA registration: relevant to US hosts of user-uploaded content. This site hosts none. | — | not applicable |
| 4.9 | Terms agree with live billing behaviour (see 2.6). | `src/terms.html:304-314` | already addressed |

## Changes on this branch

- `src/_includes/scripts.html` — analytics `beforeSend` query-string allowlist (3.2).
- `src/privacy.html` — enquiry ≠ marketing signup (1.3); analytics URL redaction disclosed (3.2); booking calendar's Google/Meta requests disclosed (3.5); breach-notice wording (4.1); "Last updated" → October 13, 2026.
- No changes to forms, checkout code, prices, Terms, or design.

## Tests run

- **Before the fix:** a live probe confirmed Vercel received `?email=…&first_name=…&session_id=…` verbatim.
- **After the fix:** the built site was served locally, Vercel's real analytics script was injected, and the page-view payload was captured. Results for five URLs:

  | URL tested | Recorded as |
  |---|---|
  | email / name / phone parameters | bare path |
  | Stripe `session_id` | bare path |
  | `utm_*` tags | kept |
  | `program=cadence` | kept |
  | invalid `program` value | dropped |
  | `#fragment` | dropped |

- **Stripe:** live API reads only, plus rendering one Payment Link page; no charge, customer, or setting change.
- **Third-party inventory:** headless probes of 10 live pages.
- **Build and layout:** Eleventy build passes; privacy §05 checked at 1440px and 390px.
- No form handling or checkout code changed, so no form submissions or payments were made.

## Owner / dashboard / legal actions

1. **HighLevel:**
   - Review the REACH and POST SALES workflows (1.5).
   - Check the booking form for pre-checked consent boxes (1.6).
   - Pick a CASL mailing address before any marketing email (1.9).
   - Address the Meta library in the booking widget (3.5).
2. **Formspree:** confirm there are no integrations or autoresponders adding people to lists (1.7).
3. **Stripe:**
   - Decide on Klarna (2.8).
   - Turn on successful-payment receipts and review renewal and failed-payment emails (2.9).
   - Write down the manual steps for pause, cancellation and remaining minimum months (2.7).
4. **Legal review:**
   - The implied-consent wording (1.4).
   - Whether the booking iframe's Meta request needs consent first (3.6).
   - GDPR applicability (4.5).

## Sources

- CRTC, [CASL guidance on implied consent](https://crtc.gc.ca/eng/com500/guide.htm) and [FAQ](https://crtc.gc.ca/eng/com500/faq500.htm)
- ISED, [Getting consent to send email](https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email)
- BC OIPC, [Report a privacy breach](https://www.oipc.bc.ca/resources/breach-notification-representatives-of-organizations-and-public-bodies/)
- Vercel, [Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy) and [`beforeSend`](https://vercel.com/docs/analytics/package)
