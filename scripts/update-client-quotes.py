#!/usr/bin/env python3
"""
Daily client quote updater for Exploration Sites.
Fetches stock prices and market caps from Yahoo Finance,
updates clients.html, commits and pushes to trigger Vercel deploy.

Run manually: python scripts/update-client-quotes.py
Schedule via: /schedule or cron
"""

import re
import time
import yfinance as yf
import subprocess
import os
from datetime import datetime

HTML_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'clients.html')

def parse_rows(html):
    """Extract all table rows with their data."""
    rows = re.findall(
        r'<tr><td>([^<]+)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td><td>([^<]*)</td>(.*?)</tr>',
        html, re.DOTALL)
    return rows

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
    elif exchange == 'NYSE' or exchange == 'OTC':
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
    """Fetch fresh quotes for all companies with tickers."""
    rows = parse_rows(html)
    updates = {}
    total = 0
    success = 0
    skipped = 0

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
            t = yf.Ticker(yahoo_sym)
            fi = t.fast_info
            if fi.last_price and fi.last_price > 0:
                new_price = f"${fi.last_price:.2f}"
                new_mcap = fmt_mcap(fi.market_cap) if fi.market_cap else mcap
                if new_mcap:
                    updates[name] = (new_price, new_mcap)
                    success += 1
        except:
            pass

        # Rate limit
        if total % 50 == 0:
            print(f"  ...fetched {total} tickers ({success} updated)")
            time.sleep(1)
        else:
            time.sleep(0.2)

    print(f"Fetched {total} tickers: {success} updated, {total-success} failed, {skipped} skipped")
    return updates

def apply_updates(html, updates):
    """Apply price/mcap updates to the HTML."""
    count = 0
    for name, (new_price, new_mcap) in updates.items():
        pattern = rf'(<tr><td>{re.escape(name)}</td><td>)[^<]*(</td><td>[^<]*</td><td>[^<]*</td><td>)[^<]*(</td>)'
        new_html = rf'\g<1>{new_price}\g<2>{new_mcap}\g<3>'
        html, n = re.subn(pattern, new_html, html)
        count += n

    # Update the date stamp
    today = datetime.now().strftime('%B %Y')
    html = re.sub(r'Data as of \w+ \d{4}', f'Data as of {today}', html)

    # Re-sort by market cap
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

    # Recalculate total market cap
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

    print(f"Updated {count} rows. New total market cap: {new_total}")
    return html

def main():
    print(f"=== Client Quote Update: {datetime.now().strftime('%Y-%m-%d %H:%M')} ===")

    with open(HTML_PATH, 'r', encoding='utf-8') as f:
        html = f.read()

    updates = fetch_quotes(html)

    if updates:
        html = apply_updates(html, updates)
        with open(HTML_PATH, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Saved {HTML_PATH}")
    else:
        print("No updates to apply")

if __name__ == '__main__':
    main()
