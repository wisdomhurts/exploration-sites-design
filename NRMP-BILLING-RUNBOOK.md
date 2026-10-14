# NRMP billing runbook (internal)

How to carry out the Map Program terms in Stripe by hand. Stripe does **not**
enforce the 4-month minimum, pauses, or "remaining minimum months payable" on its
own, and clients can't cancel themselves (no customer portal), so every one of
these starts with a client emailing accounts@explorationsites.com.

Source of truth for the rules: [Terms §03](https://www.explorationsites.com/terms.html#subscriptions).
Stripe Dashboard: **Billing → Subscriptions → (client) → Actions**.

## The numbers

| Tier | Monthly | Setup (one time, first invoice) |
|---|---|---|
| Cadence | $2,500 | $2,500 |
| Active Drill | $3,500 | $2,500 |
| Full Program | $4,500 | $2,500 |

CAD, plus tax (Stripe Tax adds it).

**Paid months** = the number of *paid* monthly invoices on the subscription. The
first invoice (setup + month 1) counts as month 1. Paused months don't count.
Check it under the subscription's **Invoices** list.

---

## Pause (any time, up to 6 months)

1. Confirm the request by email, and note the date and the client's expected resume month.
2. **Actions → Pause payment collection.**
3. Choose **Void invoices**, so nothing is billed while paused.
4. Set **Resume on** to no later than 6 months from today. Leave it blank only if you'll track the deadline yourself.
5. Reply confirming the pause, the locked base being kept, and the latest resume date.
6. Put the 6-month deadline in your calendar.

## Resume

1. **Actions → Resume payment collection.**
2. Billing restarts on the next cycle. Confirm with the client by email.

## Not resumed within 6 months

The subscription ends, and any unpaid months of the minimum become payable.

1. Remaining months = 4 − paid months. If that's 0 or less, just cancel (below).
2. **Invoices → Create invoice** for the client. Add one line: "News-Release Map Program — remaining minimum term, N months × $X". Send it.
3. **Actions → Cancel subscription → Immediately.** Choose no refund and no proration.
4. Email the client explaining both steps.

## Cancel after the minimum (4+ paid months)

1. **Actions → Cancel subscription → At end of current period.**
2. Choose no refund and no proration. Nothing more is charged.
3. Reply confirming the last day of service.

## Cancel during the minimum (fewer than 4 paid months)

Remaining months = 4 − paid months. These stay payable. Pick one and tell the client:

- **A. Run it out (simplest).** **Actions → Cancel subscription → On a custom date**: the end of the period covered by the 4th paid invoice. Stripe collects the remaining months automatically, then stops.
- **B. Settle now.** Invoice the remaining months as a one-off, as in "Not resumed" step 2. Once it's paid, **Cancel → Immediately**.

## Client comes back within 12 months

Don't use the website's checkout, because it charges the setup fee again.

1. **Customers → (client) → Create subscription.**
2. Add the tier's monthly price only.
3. The minimum term starts again from the first new payment.

## Failed payments

- Stripe retries automatically and emails the client (failed-payment emails are on).
- If a renewal needs the client to confirm it with their bank, Stripe emails them a confirmation link, with reminders at 3, 5 and 7 days.
- **14+ days overdue:** you may pause work (Terms).
- **30+ days overdue:** you may end the subscription. Cancel immediately, then invoice anything owed.
- Stripe is set (2026-10-14) to **leave the subscription overdue** when all retries fail, and when a payment needing card authentication stays incomplete for 15 days. It never cancels on its own; ending a subscription is always your decision.

## If we end a subscription (not for non-payment or breach)

Refund the unused part of the current period: **Payments → (latest charge) → Refund**, for a pro-rated amount.

## Price changes

- Never during a client's minimum term.
- Otherwise, email at least 30 days before. Then change the subscription's price with **Update subscription**, effective from the next cycle.
