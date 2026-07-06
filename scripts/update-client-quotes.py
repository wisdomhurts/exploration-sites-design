#!/usr/bin/env python3
"""
Hourly quote updater for Exploration Sites.

Fetches stock prices and market caps from Yahoo Finance and keeps EVERY page
that shows a quote / market cap consistent from a single fetch:

  - src/clients.html             per-row price + market cap, re-sorted by cap,
                                 plus the combined total market cap
  - src/case-study-montage.html  Montage hero price + market cap, the outcomes
                                 band "to" figure + multiple, the hero ~Nx stat,
                                 the big pull-quote, and the meta description
  - src/case-studies.html        Montage's demoted market-cap footnote + the
                                 intro-prose "today" figure (the old journey rail
                                 was replaced by a deliverables ledger, 2026-07)

Montage's multiple is computed against its ~C$130M market cap when Exploration
Sites came on board in 2023 (MONTAGE_BASELINE). Because the clients-table Montage
row and the case-study figures all derive from the SAME fetched value, they stay
in lockstep.

Run manually:  python scripts/update-client-quotes.py
Scheduled hourly via .github/workflows/hourly-quotes.yml
"""

import json
import re
import os
import time
from datetime import datetime
import yfinance as yf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENTS_HTML = os.path.join(ROOT, 'src', 'clients.html')
MONTAGE_HTML = os.path.join(ROOT, 'src', 'case-study-montage.html')
CASES_HTML   = os.path.join(ROOT, 'src', 'case-studies.html')
PROOF_JSON   = os.path.join(ROOT, 'src', '_data', 'proof.json')

MONTAGE_TICKER = 'MAU'        # TSX
MONTAGE_BASELINE = 130e6      # ~C$130M market cap when ES came on board, 2023


def parse_rows(html):
    """Extract all table rows with their data."""
    return re.findall(
        r'<tr><td>([^<]+)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td>(.*?)</tr>',
        html, re.DOTALL)


def get_yahoo_ticker(ticker, exchange):
    """Convert our ticker+exchange to Yahoo Finance format."""
    if exchange == 'TSX':
        return f'{ticker}.TO'
    elif exchange == 'TSXV':
        return f'{ticker}.V'
    elif exchange == 'CSE':
        return f'{ticker}.CN'
    elif exchange == 'ASX':
        return f'{ticker}.AX'
    elif exchange in ('NYSE', 'OTC'):
        return ticker
    elif exchange == 'LSE':
        return f'{ticker}.L'
    return None


def fmt_mcap(mcap):
    if mcap >= 1e9:
        return f"${mcap/1e9:.2f}B"
    elif mcap >= 1e6:
        return f"${mcap/1e6:.0f}M"
    elif mcap > 0:
        return f"${mcap/1e3:.0f}K"
    return None


def fetch_quotes(html):
    """Fetch fresh quotes for all companies with tickers.

    Returns (updates, montage) where:
      updates  = {name: (price_str, mcap_str)}
      montage  = {'price': float, 'mcap': float} or None
    """
    rows = parse_rows(html)
    updates = {}
    montage = None
    total = success = skipped = 0

    for name, price, ticker, exchange, mcap, commodity, country, extra in rows:
        if ticker in ('—', '') or exchange in ('Private', 'Acquired', 'Delisted', ''):
            skipped += 1
            continue

        yahoo_sym = get_yahoo_ticker(ticker, exchange)
        if not yahoo_sym:
            skipped += 1
            continue

        total += 1
        try:
            fi = yf.Ticker(yahoo_sym).fast_info
            if fi.last_price and fi.last_price > 0:
                new_price = f"${fi.last_price:.2f}"
                new_mcap = fmt_mcap(fi.market_cap) if fi.market_cap else mcap
                if new_mcap:
                    updates[name] = (new_price, new_mcap)
                    success += 1
                if ticker == MONTAGE_TICKER and fi.market_cap:
                    montage = {'price': float(fi.last_price), 'mcap': float(fi.market_cap)}
        except Exception:
            pass

        time.sleep(1 if total % 50 == 0 else 0.2)

    print(f"Fetched {total} tickers: {success} updated, {total - success} failed, {skipped} skipped")
    return updates, montage


def apply_updates(html, updates):
    """Apply price/mcap updates to the clients table."""
    count = 0
    for name, (new_price, new_mcap) in updates.items():
        pattern = rf'(<tr><td>{re.escape(name)}</td><td>)[^<]*(</td><td>[^<]*</td><td>[^<]*</td><td>)[^<]*(</td>)'
        new_html = rf'\g<1>{new_price}\g<2>{new_mcap}\g<3>'
        html, n = re.subn(pattern, new_html, html)
        count += n

    # Date stamp
    today = datetime.now().strftime('%B %Y')
    html = re.sub(r'Data as of \w+ \d{4}', f'Data as of {today}', html)

    # Re-sort tbody by market cap (desc)
    tbody_match = re.search(r'<tbody>\s*(.*?)\s*</tbody>', html, re.DOTALL)
    if tbody_match:
        rows = re.findall(r'(<tr>.*?</tr>)', tbody_match.group(1), re.DOTALL)

        def get_mcap(row):
            tds = re.findall(r'<td[^>]*>(.*?)</td>', row)
            if len(tds) >= 5:
                s = tds[4]
                if '$' in s:
                    num = re.search(r'\$([\d,.]+)', s)
                    if num:
                        v = float(num.group(1).replace(',', ''))
                        if 'B' in s: return v * 1e9
                        elif 'M' in s: return v * 1e6
                        elif 'K' in s: return v * 1e3
                        return v
            return 0

        sorted_rows = sorted(rows, key=get_mcap, reverse=True)
        html = html[:tbody_match.start(1)] + '\n' + '\n'.join(sorted_rows) + '\n' + html[tbody_match.end(1):]

    # Recalculate combined total market cap
    all_mcaps = re.findall(r'<td>(\$[\d,.]+[BMK]?)</td>', html)
    total = 0
    for s in all_mcaps:
        num = re.search(r'\$([\d,.]+)', s)
        if num:
            v = float(num.group(1).replace(',', ''))
            if 'B' in s: total += v * 1e9
            elif 'M' in s: total += v * 1e6
            elif 'K' in s: total += v * 1e3

    new_total = f"${total/1e9:.0f}B+"
    html = re.sub(r'>\$\d+B\+<', f'>{new_total}<', html)

    print(f"Updated {count} client rows. Combined market cap: {new_total}")
    return html, int(round(total / 1e9))


def _sub(html, pattern, repl, label, count=0):
    new, n = re.subn(pattern, repl, html, count=count)
    if n == 0:
        print(f"  [warn] no match for: {label}")
    return new


def update_montage_pages(montage):
    """Propagate Montage's freshly fetched price/cap to the case-study pages."""
    if not montage:
        print("Montage quote unavailable -- skipping cross-page sync")
        return

    price = f"${montage['price']:.2f}"     # e.g. $14.77 (CAD)
    cap = montage['mcap']
    cap2 = f"${cap/1e9:.2f}B"               # e.g. $5.96B (matches clients table)
    cap1 = f"${cap/1e9:.1f}B"               # e.g. $6.0B (rounded display)
    mult = max(1, round(cap / MONTAGE_BASELINE))
    print(f"Montage sync -> price {price}, cap {cap2} / {cap1}, multiple ~{mult}x")

    # ---- case-study-montage.html ----
    with open(MONTAGE_HTML, 'r', encoding='utf-8') as f:
        h = f.read()
    h = _sub(h, r'(<span class="csm-fact csm-fact--price">)\$[\d.]+(</span>)', rf'\g<1>{price}\g<2>', 'montage hero price')
    h = _sub(h, r'(Market Cap: )\$[\d.]+B', rf'\g<1>{cap2}', 'montage hero market cap')
    h = _sub(h, r'(<span class="csm-cap-to">)\$[\d.]+B(</span>)', rf'\g<1>{cap1}\g<2>', 'montage outcomes cap-to')
    h = _sub(h, r'(<div class="csm-cap-delta-num">~)\d+(&times;</div>)', rf'\g<1>{mult}\g<2>', 'montage outcomes multiple')
    h = _sub(h, r'(<span class="csm-hero-stat-num">~)\d+(&times;</span>)', rf'\g<1>{mult}\g<2>', 'montage hero multiple')
    h = _sub(h, r'(to ~)\$[\d.]+B( today)', rf'\g<1>{cap1}\g<2>', 'montage pull-quote cap')
    h = _sub(h, r'(<span class="csm-bigstat-x">)\d+(&times;</span>)', rf'\g<1>{mult}\g<2>', 'montage pull-quote multiple')
    h = _sub(h, r'(a ~)\d+(x rise in market cap)', rf'\g<1>{mult}\g<2>', 'montage meta multiple')
    with open(MONTAGE_HTML, 'w', encoding='utf-8') as f:
        f.write(h)

    # ---- case-studies.html (Montage is the FIRST case; only touch that one) ----
    with open(CASES_HTML, 'r', encoding='utf-8') as f:
        h = f.read()
    # Montage is the FIRST case. Its old .case-journey market-cap rail was replaced
    # (2026-07) by a deliverables ledger + a demoted, sourced footnote; keep that
    # footnote and the intro-prose "today" figure fresh instead.
    h = _sub(h, r'(Company-reported market cap ~\$130M \(2023\) to ~)\$[\d.]+B( \(today\))',
             rf'\g<1>{cap1}\g<2>', 'cases montage footnote cap', count=1)
    h = _sub(h, r'(reported market capitalisation grew from ~\$130M to ~)\$[\d.]+B',
             rf'\g<1>{cap1}', 'cases montage prose cap', count=1)
    with open(CASES_HTML, 'w', encoding='utf-8') as f:
        f.write(h)


def sync_index_market_cap(val):
    """Keep the site-wide market-cap stat in lockstep with the clients table.

    Takes the combined total (in $B, computed by apply_updates from the freshly
    fetched caps) and mirrors it into src/_data/proof.json (marketCapB), which
    every page renders via Liquid ({{ proof.marketCapB }}): the homepage stat
    strip, why.html, and the clients-page hero. (The old approach regexed a
    data-count-to attribute in index.html; that markup is gone — the stat is
    static text sourced from proof.json now.)"""
    with open(PROOF_JSON, 'r', encoding='utf-8') as f:
        proof = json.load(f)
    if proof.get('marketCapB') != val:
        proof['marketCapB'] = val
        with open(PROOF_JSON, 'w', encoding='utf-8') as f:
            json.dump(proof, f, indent=2)
            f.write('\n')
        print(f"Synced proof.json marketCapB -> {val}")
    else:
        print("proof.json marketCapB already current")


def main():
    print(f"=== Quote Update: {datetime.now():%Y-%m-%d %H:%M} ===")

    with open(CLIENTS_HTML, 'r', encoding='utf-8') as f:
        html = f.read()

    updates, montage = fetch_quotes(html)

    if updates:
        html, total_b = apply_updates(html, updates)
        with open(CLIENTS_HTML, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Saved {CLIENTS_HTML}")
        sync_index_market_cap(total_b)
    else:
        print("No client updates to apply")

    update_montage_pages(montage)


if __name__ == '__main__':
    main()
