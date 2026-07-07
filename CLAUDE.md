# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The **Exploration Sites** marketing website — a static site built with Eleventy (11ty) v3, deployed to Vercel. Exploration Sites is a mining investor-relations / visualization agency (Victoria BC). Repo: `github.com/wisdomhurts/exploration-sites-design`. Live preview: `https://es-draft-1.vercel.app`.

**Workspace vs. repo (important):** the `x:\ESOS` folder on disk also contains many *unrelated* sibling projects and asset folders (`josh/`, `blueprint-rectifier/`, `adobe-mcp/`, `es3donline-opus48/`, `leapfrog clone/`, `ES Client Work/`, `Map Review/`, `Claude-Memory/`, Blender files, etc.). These are **gitignored or untracked** and are NOT part of this site. The git repo tracks only the Eleventy site: `src/`, `scripts/`, and the root config files. Don't treat the sibling directories as part of this codebase unless explicitly asked. (`CLAUDE-CODE-BUILD-PROMPT.md` at the root is the spec for a *different* product, the ES3D/ESOS SaaS platform, not this website.)

## Commands

```bash
npm run build       # npx @11ty/eleventy → builds src/ into public/
npm run dev         # eleventy --serve (live-reload dev server)
npm run build-mask  # regenerate src/assets/world-mask.png from Natural Earth data (network)
```

- **No test suite.** `npm test` is a placeholder that exits non-zero; there is no test framework.
- Build output goes to `public/` (Vercel `outputDirectory`).
- Environment is Windows / PowerShell. `deploy.bat` and the Python scripts assume this and use hardcoded `x:\ESOS\...` paths.

## Deploy

GitHub auto-deploy to Vercel is unreliable. To ship:

```bash
npx vercel --prod --yes      # deploy the current build to production
```

`deploy.bat` does the full flow (git add/commit/push, then `vercel --prod --yes`). Either works.

## Architecture

**Eleventy static site.** `.eleventy.js` sets input `src/` → output `public/`, includes dir `_includes`. Pages are standalone `.html` files (no Markdown) with YAML front matter declaring `layout: base.html`, `title`, and `description`. The layout chain is:

- `src/_includes/base.html` — document shell; pulls in `head.html`, `nav.html`, `footer.html`, `scripts.html`.
- `head.html` — meta/OG tags, Google Fonts (Source Serif 4 / Inter / JetBrains Mono), and the **Three.js import map** (loaded from jsDelivr CDN, not npm).
- `scripts.html` — all site-wide vanilla-JS behavior (mega-menu, IntersectionObserver reveals, count-up numbers, scroll-pinned steps, before/after compare slider). No build step or bundler — plain ES in `<script>`.

CSS is a single large hand-authored file: `src/styles.css` (passed through verbatim). There is no CSS framework or preprocessor.

**Design system is the source of truth — read it before touching UI.** `DESIGN.md` (brand system: positioning, color tokens, typographic voices, layout grid) and `.impeccable.md` (design context: users, principles, anti-references). Hard rules that the brand enforces: warm Quartz `#F4F1EC` backgrounds (never pure white; white is allowed on cards/elevated surfaces per DESIGN.md §6), Ore gold `#B8823A` accent used ≤2%, **two type voices only** (serif for headlines + display numbers / Inter for everything else, tabular figures for data — the JetBrains Mono voice was retired 2026-07), **no glow, no gradient text, no flashy shadows, no bouncy animation.** Structure comes from whitespace, type hierarchy, and 1px rules.

**Deliberate decisions — do not "fix" these:**
- **`pricing.html` is an intentional orphan** (Dorian, 2026-07-01, reaffirming commit `eb5b27e`): no nav, footer, or body link points to it. It stays live for direct URL/SEO; the nav's answer to pricing is Engagement. Don't re-add links to it.
- **Stat numbers are serif and static** — the scroll-triggered count-up animation was removed 2026-07-01 (an understated brand doesn't perform its numbers).

### Hero globe (`src/assets/hero-globe.js`)

The homepage hero is a Three.js dotted-globe point cloud:

- A Fibonacci sphere of ~60k candidate points is filtered against `src/assets/world-mask.png` (an equirectangular land mask) to color land (Slate) vs ocean (Graticule) over a Quartz fill sphere.
- **Pins are HTML `<a>` elements, not 3D objects.** The pin markup lives **inline in `src/index.html`** (the `.hero-globe` block, ~line 134), not in an include. It renders one fixed Victoria HQ pin (hardcoded) plus one pin per entry in `src/_data/clientpins.json` (looped with `{% for p in clientpins %}`, using `data-lat`/`data-lon` and an inline `style="color: {{ p.color }}"` — the dot is `background: currentColor`, so each pin is tinted by its client's commodity color). `hero-globe.js` collects every `.hero-globe-pin` from the DOM and re-projects it from 3D to screen coords every frame, applying cursor magnetism, pin-to-pin repulsion, tooltip gating, and auto-rotate slowdown. (`src/_includes/hero-globe.html` is a **dead/unused** copy — no page includes it.)
- Tunable constants (magnet radius, repulsion, scale, camera, auto-rotate speed, orientation) are all named consts at the top of `hero-globe.js`. The globe is oriented so Western Canada faces the viewer.
- The footer has its own WebGL effect in `src/assets/footer-shader.js`.

### Data pipelines

`src/_data/clientpins.json` (the globe's live pin list — `{name, lat, lon, color, href}`, one per unique client on `clients.html`) is the current source of the globe pins. Each entry's `color` is the client's commodity color (same palette as the clients-table `CMDY` map in `clients.html`; non-mining clients get the neutral fallback `#C8C2B4`). It was generated once by researching each client's flagship-project location; re-generating it means re-running that research against the current `clients.html` roster.

`src/_data/projects.json` (`{name, lat, lon, href}`) is the **older** pin source and **no longer drives the globe**. It is now consumed only by `src/_data/regions.js` (a build-time continent-grouping helper whose output is currently un-rendered), so keep the file present — `regions.js` `require()`s it and the build fails without it. It is **generated**, not hand-edited. Pipeline (Python, needs `pyshp` + `pyproj`):

1. `scripts/harvest_client_pins.py` — walks `ES Client Work/<client>/` shapefiles, picks the best project-scope extent per client (keyword + bbox-size heuristics, rejects regional basemaps), writes `scripts/projects.proposed.jsonc` for human review (with `confidence` and `review` flags).
2. `scripts/promote_proposal.py` — strips comments/metadata from the proposal, adds `href`, merges in any original pins the harvester missed, and overwrites `src/_data/projects.json`.

`scripts/update-client-quotes.py` — daily stock-quote updater. Fetches prices/market caps via `yfinance` (Yahoo Finance), rewrites the table in `src/clients.html` in place, re-sorts rows by market cap, and recomputes the total. **It is tightly coupled to the exact `<tr><td>…</td>…</tr>` shape of the clients table via regex** — changing that table's markup will break this and `build-client-projects.mjs`. Designed to be run on a schedule.

`scripts/build-world-mask.mjs` — downloads Natural Earth 1:110m land GeoJSON and rasterizes it to `world-mask.png` (uses `@resvg/resvg-js` + `sharp`). Run via `npm run build-mask`.

`scripts/build-client-projects.mjs` / `src/assets/client-projects.js` — an older geocode-from-`clients.html` path. Note `client-projects.js` is **not currently imported by the globe** (pins come from `clientpins.json`); treat it as a decoupled artifact unless you re-wire it.

## Gotchas

- **Phantom `src/assets/globe/` directory.** It has broken local ACLs and crashes the Eleventy watcher / Vercel build. It is explicitly ignored in `.eleventy.js` (`watchIgnores` + `ignores`), `.gitignore`, and `.vercelignore`. It contains a *stale* copy of `hero-globe.js` — the live file is `src/assets/hero-globe.js`. Don't add files there or remove the ignore rules. (See commit `e6d3846`.)
- `.gitignore` deliberately excludes large binary sources (`*.blend`, `*.psd`, `*.xls`, `*.docx`), root-level data dirs, and the dozens of AI-agent dotfolders. Don't commit those.

## MCP servers (configured in `.mcp.json`)

`firecrawl` (web scraping/search), `paper` (local Paper.design at `127.0.0.1:29979`), `obsidian` (vault REST API), and Adobe `photoshop` / `illustrator` / `premiere` (require the local UXP proxy running).
