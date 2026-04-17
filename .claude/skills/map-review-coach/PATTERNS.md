# Recurring Mistakes — Weighted Review Patterns

Issues that have appeared across multiple Exploration Sites map reviews. These are **weighted higher** in every review: if the same class of issue appears again, flag it immediately at Critical severity regardless of any individual judgment call.

Before starting a review, read this file. After completing a review, append any newly-recurring patterns to the log in `Map Review/common-mistakes/log.md` — that log is the source of truth for what gets promoted into this file.

---

## Class 1 — Export / Production Artifacts (always Critical)

Patterns that indicate the map was never properly QC'd before export.

- **Software UI in the image** — toolbars, font pickers, pt size fields, formatting buttons. Immediate disqualification for investor use. Fix: re-export with all UI panels hidden.
- **Placeholder text** — "FIGURE X", "[title]", lorem ipsum, "DRAFT", watermarks from free-tier tools.
- **Non-deliberate font sizes** — values like `73.28pt` that come from drag-scaling instead of deliberate hierarchy choices.

---

## Class 2 — Text Errors (always Critical)

- **Misspelled place names** — e.g. "CANADA" rendered as "C A N D A" with a missing letter. Always spell-check letterspaced country/territory labels letter-by-letter.
- **Spurious punctuation in project names** — e.g. "COPPERMINE RIVER, PROJECT" (errant comma). Project names are proper nouns; no internal punctuation unless the official name includes it.
- **Possessive deposit names** — e.g. "Snowline's Valley Deposit". Almost always wrong; deposits named for geography, not ownership. Confirm against official project naming.
- **Duplicate project labels** — the same project name appearing in two locations. One is always wrong; verify against the official project list before the review ships.
- **Mixed territory labeling conventions** — e.g. "ALASKA" spelled out but "NWT" abbreviated on the same map. Pick one style per category, apply everywhere.
- **Inconsistent city capitalization** — e.g. "IQALUIT" all-caps but "Whitehorse" title case. Standardize to title case for all cities.

---

## Class 3 — Logo Handling (always Important, promote to Critical if >2 instances)

- **Logo repeated multiple times per map** — appearing in every callout or corner. Institutional maps place the logo **once**, inside the title block, subordinate to the title text.
- **Logo above/below callout boxes** — pastes the logo at a size where gradient detail becomes visual noise. Remove.

Logo rule: **one instance per map, inside the title block, ~120px wide at screen / 30mm at print.**

---

## Class 4 — Missing Cartographic Elements (always Critical)

If any of these are absent, the map is not shippable:

- Map title / figure number
- Scale bar (with correct units and segmented style)
- North arrow
- Legend (covering every symbol on the map)
- Source / attribution
- Projection note
- Compilation date

All seven must be present on every map without exception.

---

## Class 5 — Hierarchy Failures (always Important)

- **All project markers identical size/style** — no differentiation between flagship and early-stage, no commodity signaling. Fix with three-tier sizing (14/10/6px) and commodity-colored fills.
- **Territory labels competing with project names** — similar size/weight/color. Reduce to 11pt `#8A8580` so they sit clearly behind project-name emphasis.
- **Only two effective font levels** — "big bold" and "everything else." Establish four levels (title / projects / geographic / reference).
- **No flagship emphasis** — if one project is the primary asset, its marker must be ~2× the size of any other and nothing else should compete for the eye.

---

## Class 6 — Palette Failures (always Important)

- **Flat gray everywhere** — ocean and land indistinguishable, no warmth, no identity. Fix with the 80/20 neutral stack plus one decisive accent.
- **Pure black linework** — never use `#000000`. Always `#1F2A30` (primary) or `#3A4A52` (secondary).
- **Generic orange for everything** — clip-art energy. Replace with palette-defined accents (`#C4572A` burnt sienna, `#B87333` copper, `#C8A96A` gold).
- **Near-zero land/water contrast** — ocean must be `#A8BCC8` against land `#F7F7F5` or similar. If both neutral gray, palette fails.

---

## Class 7 — Callout & Symbology Defaults (always Important)

- **White callout box with thin orange stroke** — looks like auto-generated GIS label. Remove boxes entirely (place names directly on map with text halo) or redesign per RUBRIC.md spec.
- **Ornamental multi-pointed compass rose** — nautical / tourist map convention. Replace with minimal single-arrow + "N" design in `#8A8580`.
- **Inconsistent leader lines** — some callouts have them, some do not; mixed terminus styles (arrowheads, dots, none). Standardize: 1.5px `#999999`, orthogonal only, circle terminus.
- **Font symbol not in legend** — every symbol on the map must appear in the legend. Common miss: unique deposit markers (e.g. a Fort Knox star on one map but not in legend).
- **Missing space in units** — "200km" must be "200 km".

---

## Class 8 — Layout & Composition (usually Minor → Important)

- **Dead space** — large empty regions. Either crop the map tighter or repurpose the space for title block / legend / portfolio summary. Dead space dilutes the story.
- **No neatline** — map edges undefined. Add 0.75px `#D0C8BE` border with 20px margin.
- **Crowded callouts** — multiple callouts clustering in one region while other areas are empty. Spread callouts or move one into dead space with a longer leader.

---

## Pattern update protocol

After every review:

1. Identify any issue that is a *repeat* of a pattern in `Map Review/common-mistakes/log.md`.
2. Append the new occurrence with date and map name, citing which pattern class it belongs to.
3. If a class accumulates 3+ instances across different maps, promote the specific failure to this file as a weighted pattern.

This keeps the review tightening over time. The agent should not re-learn what it has already flagged three times.
