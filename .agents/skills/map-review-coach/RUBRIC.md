# Cartographic Quality Rubric

The 5-point review framework. Every map is assessed against all 5 axes. Every finding must cite exact values — hex, pt, px, opacity — never vague direction.

---

## Axis 1 — Text, Spelling & Data Integrity

Scan every label, title, subtitle, legend entry, scale-bar text, coordinate text, disclaimer, source citation.

- Typos, inconsistent capitalization, missing words, truncated labels
- Abbreviation consistency (km vs Km vs KM; m vs M; g/t vs gpt)
- Possessives in place names (e.g. "Snowline's Valley" — usually wrong)
- Placeholder or draft content ("FIGURE X", "[title]", lorem ipsum)
- Plausibility of assay values, distances, coordinates — flag suspicious, never correct
- Duplicate labels (same project name appearing twice is almost always an error)
- Software artifacts: toolbars, dropdowns, UI chrome captured in export

**Do not invent or modify geological, spatial, or technical data.** If uncertain, flag.

---

## Axis 2 — Color, Contrast & Palette

Institutional maps follow an **80/20 rule**: 80% neutrals, 20% accent maximum.

### Target palette

| Role | Hex | Usage |
|------|-----|-------|
| Background / paper | `#F7F7F5` | Off-white, warm — feels like premium stock, not sterile |
| Soft separation | `#EAEAEA` | Dividers, secondary fills, inactive areas |
| Primary ink | `#1F2A30` | Dark blue-gray — titles, boundaries, key linework. **Never pure black** |
| Secondary ink | `#3A4A52` | Supporting linework, secondary labels |
| Warm gray (labels) | `#8A8580` | Geographic labels, annotations, subordinate text |
| Taupe (borders) | `#D0C8BE` | State/province boundaries — visible but quiet |
| Ocean | `#A8BCC8` | Desaturated steel blue — clear land/water separation |

### Accent colors (pick per project commodity)

| Commodity | Hex | Note |
|-----------|-----|------|
| Gold | `#C8A96A` | Refined gold, not yellow |
| Copper | `#B87333` | Warm copper metallic |
| Lithium / critical minerals | `#3FA7FF` | Electric blue |
| General highlight | `#C4572A` | Burnt sienna — confident, not clip-art orange |

### Checks

- Adjacent geological units, tenements, and features have sufficient contrast
- Legend colors exactly match actual map features (swatches ↔ fills)
- Background/basemap does not wash out thin lines or small text
- Land/water clearly separated at a distance
- Color-blind readable (deuteranopia/protanopia pass on accents)
- Same feature type uses the same color across the whole map
- Never pure black (`#000000`) for linework — always `#1F2A30`

---

## Axis 3 — Typography, Hierarchy & Layout

### Typography pairings (pick one per client/project, use consistently)

| Option | Title font | Body / label font | Vibe |
|--------|-----------|-------------------|------|
| A | Playfair Display | Helvetica Neue | Clean corporate |
| B | Cormorant Garamond | Söhne / Inter | Modern premium |
| C | Canela | Neue Haas Grotesk | Editorial luxury |

### Sizing hierarchy

- Map title: **48–72pt**
- Section / panel labels: **18–28pt**
- Feature labels: **12–16pt**
- Minor annotations: **9–11pt**
- Tracking on titles: **+20 to +40**
- Tracking on labels: **+5 to +10**

### Four-level hierarchy must exist

1. **Title** — 48pt semibold `#1F2A30`
2. **Project names** — 14pt semibold `#1F2A30` tracking +10, all-caps
3. **Geographic labels** — 11pt regular `#8A8580` tracking +5, all-caps (territories, states)
4. **Reference labels** — 9pt regular `#8A8580`, title case (cities, annotations)

Country labels ("C A N A D A", "U S A"): 24–28pt light weight `#EAEAEA`, extreme tracking. Watermark-level presence — should be the lightest text on the map.

### Checks

- Font family consistent within each category
- No overlapping labels (labels ↔ labels, labels ↔ features)
- Alignment, spacing, margins consistent
- Whitespace generous but not empty
- Labels legible at expected print/screen size

### Banned

- Figtree, any UI-first font, system defaults (Arial, Calibri, Times New Roman)
- Non-deliberate sizes (e.g. 73.28pt from drag-scaling)
- Extreme manual letterspacing (use proper tracking controls)

---

## Axis 4 — Cartographic Standards & Symbology

### Mandatory elements

Every institutional map carries all of these or it fails NI 43-101 review:

- **Title block** — figure number, title, subtitle, date
- **Scale bar** — segmented, correct units, readable gradations
- **North arrow** — minimal single arrow + "N" (never ornamental compass rose)
- **Legend** — every symbol, color, line style explained
- **Source / attribution** — "Base data: Natural Earth" or appropriate
- **Projection note** — e.g. "NAD83 / Lambert Conformal Conic"
- **Compilation date** — when the data was prepared
- **Logo** — **once only**, in title block

### Scale bar spec

- Segmented bar, alternating fills (`#1F2A30` / `#FFFFFF`)
- Segments: e.g. 0 / 250 / 500 / 750 / 1,000 km
- Bar height: 4px
- Stroke: 0.5px `#1F2A30`
- Numerals: Inter 9pt `#8A8580`, centered above each segment boundary
- Unit label ("km"): Inter 9pt `#8A8580`, **with space** (e.g. "200 km" not "200km")

### North arrow spec

- Single upward arrow or thin pointed triangle + "N"
- Color: `#8A8580`
- Size: 30–40px tall
- Position: upper-right corner, ≥20px from neatline
- Font for "N": Inter 9pt semibold `#8A8580`

### Legend spec

- Title: "LEGEND" — Inter 11pt semibold `#1F2A30` tracking +20, all-caps
- Entries: Inter 10pt regular `#3A4A52`. 12×12px swatch + 8px gap + label text
- Panel: `#F7F7F5` at 90% opacity, 1px stroke `#EAEAEA`, 4px corners, 12px internal padding
- Every symbol on the map must have a legend entry. No exceptions.

### Vector styling

| Element | Stroke | Color | Opacity |
|---------|--------|-------|---------|
| Claim / tenement boundaries | 2–3px | `#1F2A30` | 85% |
| Highlight-zone fills | — | Accent color | 20–35% |
| Key linework (faults, contacts) | 1.5px | `#3A4A52` | 70–80% |
| Leader lines | 1–1.5px | `#999999` | 100% |

Rules:
- No harsh outlines on filled areas — use opacity for softness
- Add subtle outer glow (1–2px, 10% opacity) on labels over busy basemap areas for readability

### Hillshade treatment

- Blend mode: **Soft Light**
- Opacity: **40–55%**
- Apply Gaussian Blur at **0.5–1px** to remove noise
- Optional: slight Levels boost to lift contrast
- Goal: depth and geographic context without competing with data overlays

### Project marker hierarchy

Three tiers — flagship / advanced / early-stage:

- **Flagship:** 12–14px marker, bold fill
- **Advanced:** 8–10px
- **Early-stage:** 6px
- Commodity color on fill, 1px `#1F2A30` stroke for definition
- Never identical markers across unequal projects

### Leader lines

- 1.5px `#999999`, 100% opacity
- Orthogonal (one right-angle bend) or straight diagonal — **never curved**
- Terminus: 3px filled circle `#999999`. No arrowheads.
- Every callout must have one. If the callout sits adjacent to the marker, use a 15–20px stub.
- No leader line crosses another leader line, another callout, or a marker.

### Banned

- Ornamental multi-pointed compass roses (nautical/tourist map energy)
- White callout boxes with orange stroke (looks like GIS default)
- Logo repeated more than once per map
- Pure-black linework

---

## Axis 5 — Investor Appeal & Brand Standards

### Quality test

Before shipping, ask:

> **"Would this look normal inside a $50M market cap mining deck?"**

If not, it's usually:
- Too busy — reduce layers, simplify
- Too colorful — tighten palette
- Poorly spaced — fix alignment, increase margins
- Typography fighting itself — reduce to 2 fonts, enforce hierarchy

### 3-second investor test

What does an investor see in the first 3 seconds?

- **Target:** "Company X has four projects across western North America. The flagship is in Yukon. Clean, professional, they know their portfolio."
- **Failure:** "A gray map with some orange dots. I can't tell which project matters. I'm not sure they proofread this."

### Visual hierarchy

- Main geological story immediately clear
- Flagship project marker twice the size of others
- Nothing allowed to compete with the flagship for the eye
- Key results (discoveries, high-grade assays) visually emphasized

### Compliance floor

| Standard | Requirements |
|----------|--------------|
| NI 43-101 Figure | Title, scale, legend, source, date, projection |
| CIM Best Practice | Symbol definitions, commodity differentiation |
| TSX / TSX-V / ASX release | Same as NI 43-101 plus QP review pass |
| JORC (ASX Listing Rule 5.7) | Same as NI 43-101 |

A map that fails compliance fails the review. No exceptions.

### Mood target

Restrained confidence. Barrick's annual report, not a junior miner's first PowerPoint.

---

## Severity levels

| Level | Meaning | Examples |
|-------|---------|----------|
| **Critical** | Must fix — disqualifying for investor use | Misspellings, missing scale bar, wrong legend, data integrity concerns, software artifacts, placeholder text |
| **Important** | Should fix — degrades professional signal | Logo repetition, font inconsistency, poor contrast, misaligned elements, weak hierarchy, callout styling |
| **Minor** | Nice to fix — polish pass | Slight spacing tweaks, compass style, leader line consistency, neatline presence |

---

## Tone of the review

Direct. Expert. Decisive. Every recommendation cites exact locations ("the label 'Tenement E45/1234' in the northeast quadrant overlaps the fault trace") and exact fixes (hex, pt, px, opacity).

No generic advice. No hedging. No "consider" or "might want to."
