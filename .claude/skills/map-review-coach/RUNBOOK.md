# map-review-coach — Staff Runbook

A one-page guide for designers and project leads using the Exploration Sites map review agent.

---

## What it does

Takes one map image and returns two artifacts within ~60 seconds:

1. **A review markdown** — structured critique with exact specs (hex, pt, px, opacity) for every issue. 6 sections: Top 10 → By Category → Optional Enhancements → Art Direction → Spec Audit per issue → Compliance.
2. **An annotated overlay** — the original map with numbered circles at each issue location. Numbers match the review markdown 1:1.

Every critique is delivered at institutional-grade standards — NI 43-101 / CIM / TSX / ASX compliance baked in. Tone: direct expert art director, no hedging, no "consider" or "might want to."

---

## Prerequisites

One-time setup per machine:

```bash
pip install Pillow
```

That's it. The skill uses Python (already on every Exploration Sites machine) + the Pillow imaging library for the annotated overlays.

---

## How to invoke

Open Claude Code inside `\\192.168.1.65\Public\ESOS\` (or any folder inside it). The skill auto-triggers on any of these phrases:

- "Review this map: `<path-to-map.png>`"
- "Critique this map at `<path>`"
- "Is this map institutional-grade: `<path>`"
- "Check this map for investor use: `<path>`"
- Mentioning any `.png` / `.jpg` path inside `Map Review/` or `ES Client Work/`

No slash command to memorize. Just describe what you want.

**Example:**

> Review this map: `ES Client Work/Sitka/Figures/Sitka_YukonLocator.jpg`

Claude will:
1. Read the image and the review rubric
2. Identify the 5–10 highest-impact issues with exact coordinates
3. Generate the annotated overlay PNG
4. Write the full review markdown
5. Update the recurring-mistakes log
6. Reply in chat with a 3-line summary: verdict · severity counts · paths to the two artifacts

---

## What you get back

Two files, always in the same place:

- `Map Review/reviews/<mapname>.md` — the review
- `Map Review/reviews/<mapname>_annotated.png` — the overlay

Open the overlay side-by-side with the review markdown — each numbered circle points to the issue with the same number in the markdown's Section 1 and Section 5.

---

## Reading the verdict

The chat summary starts with one of four verdicts:

| Verdict | Meaning |
|---------|---------|
| **Ships as-is** | No changes needed. Rare for a first-pass draft; common for polished final maps. |
| **One pass needed** | Strong bones, needs polish. Usually 1–3 Critical + 3–5 Important. Fixable in half a day. |
| **Two passes needed** | Palette or hierarchy needs reset. 5+ Important, more than one pass of work. |
| **Rebuild** | Fundamental data, palette, or composition issues. Start from scratch on this map. |

Severity levels:

- **Critical** — Must fix before the map leaves the studio. Text errors, missing cartographic elements, compliance failures.
- **Important** — Should fix before investor use. Palette mismatches, hierarchy weakness, logo issues.
- **Minor** — Polish pass. Spacing tweaks, leader line consistency, neatline.

---

## Adding client-specific overrides

Some clients need custom brand rules on top of the general rubric (specific hex palette, required logo position, regulatory format requirements like ASX vs TSX).

Create a file at `Map Review/clients/<client-slug>.md`:

```markdown
# Client: Example Gold Corp

## Palette overrides
- Gold: #D4AF37 (client-specified, overrides the default #C8A96A)
- Accent: #1B365D (navy, client-specified)

## Typography
- Title: Garamond (overrides the default Playfair Display)

## Regulatory
- Primary listing: ASX — use JORC figure requirements
- Include ticker "EGC:ASX" in all title blocks

## Logo
- Always upper-right corner, 24mm print / 96px screen
- Never in title block for this client
```

The agent auto-detects the client from the map's folder path (e.g., a map under `ES Client Work/Sitka/` triggers `Map Review/clients/sitka.md` if it exists) and layers the client's rules on top of the general rubric.

If a client override is missing and you think one is needed, create the file and re-run the review.

---

## How the skill evolves

The agent learns from recurring mistakes. After every review, it appends new-pattern observations to `Map Review/common-mistakes/log.md`. When the same pattern appears 3+ times across different maps, it gets promoted into `PATTERNS.md` with higher severity weighting — so mistakes already flagged three times become auto-Critical in future reviews.

**What you can do:**
- Read `Map Review/common-mistakes/log.md` weekly to see where the studio keeps slipping
- Add your own observations after manual reviews; the agent reads them on its next run
- When a pattern stabilizes, move it into `.agents/skills/map-review-coach/PATTERNS.md` under the right class

---

## Troubleshooting

**"ModuleNotFoundError: No module named 'PIL'"**
→ `pip install Pillow`. One-time setup.

**"error: source image not found"**
→ Check the path quoting. Paths with spaces need quotes: `"ES Client Work/Sitka/Figures/Map Name.jpg"`.

**Annotated circles land in wrong locations**
→ Normalized coordinates occasionally drift on unusual aspect ratios. Tell Claude "rerun with callouts at these refined positions: [n, quadrant, feature]" and it'll regenerate.

**Review feels too generic / not specific enough**
→ That's a rubric gap. Tell Claude what was missed; it'll propose a PATTERNS.md addition. Once added, every future review catches it.

**Review feels too harsh on good maps**
→ If a map you consider finished returns "two passes needed," share which callouts you disagree with. The rubric is tuneable — these are calibration signals.

**Pillow drawing looks off (circles too big/small)**
→ Circle size auto-scales to the image's shorter edge. For unusual sizes, edit `scripts/annotate.py` — the `circle_diameter` formula on line ~62.

---

## Coming soon

- **Slack integration** — same skill wrapped in a Slack bot so designers can DM a map URL and get the review reply inline. Review rules and templates stay in this folder; the Slack bot is a thin wrapper over it.
- **Map series consistency mode** — review a whole investor deck's worth of maps in one run, with a cross-map consistency report (palette consistency, symbol hierarchy across maps, legend formatting alignment).
- **QGIS project ingestion** — feed a `.qgz` directly and the agent pulls metadata (projection, scale, layer list) automatically so you don't have to type it.

If you want any of these sooner, ping Dorian.

---

## File map (for the curious)

```
.agents/skills/map-review-coach/
├── SKILL.md              # the agent's operating instructions
├── RUBRIC.md             # 5-axis criteria with exact specs
├── PATTERNS.md           # weighted recurring-mistake classes
├── BENCHMARKS.md         # external institutional references
├── TEMPLATE.md           # output structure (6 sections)
├── RUNBOOK.md            # this file
└── scripts/
    └── annotate.py       # overlay generator (Python + Pillow)
```

Everything is plain markdown + one Python file. Edit freely. Improvements to the rubric benefit every future review — this is where institutional standards compound.
