// Monthly exchange-rate drift check for the local-currency prices.
// Compares today's CAD→USD/AUD rates (ECB, via frankfurter.dev) with the fixed rates
// in src/_data/prices.json "fx". If either has moved more than THRESHOLD, writes a
// short report to fx-drift.md (the workflow turns that into a GitHub issue, which
// GitHub emails to the repo owner). Exit code is always 0; no file = no drift.
//
// Re-pricing is deliberate, not automatic: update prices.json "fx" AND the Stripe
// prices' currency_options together (see CLAUDE.md), or the site and checkout differ.

import fs from 'node:fs';

const THRESHOLD = 0.05;
const prices = JSON.parse(fs.readFileSync('src/_data/prices.json', 'utf8'));
const fixed = prices.fx;

const res = await fetch('https://api.frankfurter.dev/v1/latest?base=CAD&symbols=USD,AUD');
if (!res.ok) {
  console.log(`fx-check: rate lookup failed (HTTP ${res.status}); skipping this month.`);
  process.exit(0);
}
const live = (await res.json()).rates;

const rows = ['USD', 'AUD'].map((c) => {
  const drift = (live[c] - fixed[c]) / fixed[c];
  return { c, fixed: fixed[c], live: live[c], drift };
});
for (const r of rows) console.log(`${r.c}: fixed ${r.fixed}, today ${r.live}, drift ${(r.drift * 100).toFixed(1)}%`);

const moved = rows.filter((r) => Math.abs(r.drift) > THRESHOLD);
if (moved.length) {
  const lines = [
    `Exchange rates have moved more than ${THRESHOLD * 100}% since the local-currency prices were set (${fixed.asOf}).`,
    '',
    '| Currency | Fixed rate | Today | Drift |',
    '|---|---|---|---|',
    ...rows.map((r) => `| ${r.c} | ${r.fixed} | ${r.live} | ${(r.drift * 100).toFixed(1)}% |`),
    '',
    'A drift above zero means visitors in that currency now pay more than the CAD price; below zero, less.',
    'To re-price: ask Claude to update prices.json "fx" and the Stripe currency_options together.',
  ];
  fs.writeFileSync('fx-drift.md', lines.join('\n') + '\n');
  console.log('fx-check: drift over threshold, report written to fx-drift.md');
}
