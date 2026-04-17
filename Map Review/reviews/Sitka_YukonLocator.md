# Map Review: Sitka Gold Corp — RC Gold Project, Yukon Locator

**Date:** 2026-04-17
**Map:** `ES Client Work/Sitka/Figures/Sitka_YukonLocator.jpg`
**Status:** One pass needed — strong bones, palette and compliance polish required before investor use
**Annotated overlay:** `Sitka_YukonLocator_annotated.png`

---

## Section 1: Top 8 High-Impact Improvements

| # | Location | Issue | Fix | Severity |
|---|----------|-------|-----|----------|
| 1 | NW quadrant, upper-left | **Ornamental compass rose** — multi-pointed sepia decorative design. Nautical / tourist-map convention, never institutional cartography | Replace with minimal arrow: single upward pointed triangle + "N" label. Color `#8A8580`. 30–40px tall. Font for "N": Inter 9pt semibold `#8A8580` | Critical |
| 2 | Legend panel, Major Gold Deposit row | **Blue star for gold deposits** — palette mismatches commodity. Blue (`#3FA7FF`-family) is the reserved accent for lithium / critical minerals, not gold. Reads as palette error to any informed audience | Recolor all Major Gold Deposit stars to refined gold `#C8A96A`. Update legend swatch to match. Keep RC Gold flagship in burnt sienna `#C4572A` for flagship differentiation | Important |
| 3 | Right-center, callout label | **"Snowline's Valley Deposit"** — possessive deposit name almost always indicates naming error. Deposits are named for geography, not ownership | Verify official project name with Sitka Gold; likely "Snowline Valley Deposit" (no apostrophe). Update callout text and any legend/caption references | Critical |
| 4 | Center-left, RC Gold red star marker | **Flagship RC Gold marker not visually dominant** — red star is same scale as the Major Gold Deposit blue stars. Flagship must be ~2× larger so investor eye goes there first | RC Gold marker: 20–24px (red/burnt sienna `#C4572A` fill, 1px `#1F2A30` stroke). Major deposit markers: 10–12px gold `#C8A96A` fill, 1px `#1F2A30` stroke | Important |
| 5 | Lower-left, title block, word "GOLD" | **Yellow "GOLD" treatment** in "SITKA GOLD CORP" — pure-yellow highlight reads as 1990s Las Vegas casino gold, not institutional. Confident palette uses refined metallic gold | Retone "GOLD" to refined gold `#C8A96A`. Or unify all three words of the company name in a single ink (`#FFFFFF` or `#1F2A30` depending on contrast against basemap) | Important |
| 6 | Lower-left, below title block | **Missing title-block metadata** — no figure number, no projection note, no source attribution, no compilation date. Fails NI 43-101 and every listing-rule figure requirement | Add beneath the title block, right-aligned to title, in a stacked 4-line caption: `Figure [X]` (Inter 11pt `#8A8580`), `Projection: [e.g. NAD83 / UTM Zone 8N]` (Inter 9pt `#8A8580`), `Base data: Natural Earth + Yukon Geological Survey` (Inter 9pt `#8A8580`), `Prepared: March 2026` (Inter 9pt `#8A8580`). 6px vertical spacing between lines | Critical |
| 7 | Legend panel, "Regional Structure" row | **"Regional Structure" is a vague legend entry** — the dashed lines crossing the map could be faults, tectonic boundaries, terrane contacts, or plate margins. Ambiguous legend fails CIM best practice | Rename the legend entry to the specific structural feature: most likely "Tintina Fault System" (if that's what the dashes trace) or "Major Regional Fault" / "Terrane Boundary". If multiple structure types are shown, split into distinct legend entries | Important |
| 8 | Bottom-left, scale bar | **Scale bar lacks institutional finish** — flat black bar segments without clear alternating fills and thin stroke. Reads as default GIS output, not designed element | Segmented bar, alternating `#1F2A30` / `#FFFFFF` fills with 0.5px `#1F2A30` stroke. Segments: 0 / 250 / 500 km. Bar height 4px. Numerals: Inter 9pt `#8A8580` centered above each segment boundary. Unit label "km" (with space): Inter 9pt `#8A8580` after final numeral | Minor |

---

## Section 2: Detailed Recommendations by Category

### Color

Root issue: the commodity signaling is confused (blue stars for gold) and the title-block "GOLD" word uses a saturated yellow that fights the refined ocher basemap. The rest of the palette — ocean, land, hillshade, Tombstone Belt brown, Tintina yellow — is actually solid. Fix the two accent choices and the map's tonal foundation holds.

| Element | Current | Target | Hex |
|---------|---------|--------|-----|
| Major Gold Deposit markers | Electric blue stars | Refined metallic gold | `#C8A96A` |
| RC Gold flagship marker | Burnt sienna star (OK) | Keep; increase size 2× | `#C4572A` |
| Title-block word "GOLD" | Saturated pure yellow | Refined metallic gold | `#C8A96A` |
| Ornamental compass rose | Sepia/brown decorative | Warm gray (single arrow + N only) | `#8A8580` |
| Ocean | Soft blue-gray (OK) | Keep | `#A8BCC8` (or close) |
| Land / basemap | Warm off-white w/ hillshade (OK) | Keep | `#F7F7F5` family |
| Tombstone Gold Belt ribbon | Warm brown (OK) | Keep | confirm `~#8B5A3C` |
| Tintina Gold Province band | Muted yellow (OK) | Keep | confirm `~#D9C27A` |
| Primary ink (borders, title) | Mixed (black + white) | `#1F2A30` / `#FFFFFF` with intent | `#1F2A30` |

Apply in order: (1) recolor gold-deposit stars, (2) fix "GOLD" word tone, (3) replace compass rose, (4) verify no pure black linework remains anywhere.

### Labels & Text

- **"Snowline's Valley Deposit" → verify official name** (likely "Snowline Valley Deposit" without possessive). Correct callout and any caption references
- **Legend entry "Regional Structure" → specify the feature** ("Tintina Fault System" or specific fault name). If multiple structure classes, split into separate legend rows
- **Territory labels (ALASKA, YUKON, NWT, BC)** — currently look set in warm gray with letterspacing. Weight and tracking read OK. Verify all use the same tracking value (target +100 to +150) and same color `#8A8580`
- **City labels (Dawson, Whitehorse)** — title case treatment correct. Ensure both use identical font size (target Inter 9pt `#8A8580`) and identical dot size (4px `#8A8580`)
- **Project callout labels** (Fort Knox, Brewery Creek, Eagle Mine, Aurmac Deposit) — currently Inter-family, small, good. Standardize to Inter 11pt semibold `#1F2A30` with a 2px `#F7F7F5` text halo at 80% opacity for legibility over hillshade

### Layout & Composition

- **Legend panel position** (upper right) — acceptable. Panel background appears near-white with thin border. Target: `#F7F7F5` at 90% opacity, 1px stroke `#EAEAEA`, 4px corners, 12px internal padding
- **Title block** (lower left) — well-placed. Add the 4-line metadata caption beneath the two-line "SITKA GOLD CORP / RC GOLD PROJECT" (see Issue 6 for exact specs)
- **ES asterisk mark** (upper right, near legend) — subtle, acceptable. Consider moving to the same cluster as the metadata caption (beneath title block), where brand attribution conventionally sits
- **Neatline** — cannot confirm presence from the image; verify a 0.75px `#D0C8BE` rectangular border sits at ~20px margin from the canvas edge. Add if absent
- **Dawson label + dot** — marker connects to RC Gold via what appears to be an orange line (road indicator). Confirm this is intentional (likely the Klondike Highway → project access road). If yes, make sure it's explained in the legend. If no, remove

### Symbology

- **Project marker hierarchy:** Flagship 20–24px `#C4572A` fill, 1px `#1F2A30` stroke. Major gold deposits 10–12px `#C8A96A` fill, 1px `#1F2A30` stroke. Restores honest commodity signaling and visual dominance for the flagship
- **Ornamental compass rose → minimal north arrow:** single-arrow + "N". `#8A8580`. 30–40px tall. Upper-right corner, ≥20px from neatline (move off the upper-left to balance weight with legend on the right). Remove the decorative compass entirely
- **Leader lines for project name callouts (Brewery Creek, Eagle Mine, Aurmac, Snowline Valley):** currently thin solid lines with what appears to be arrow/circle termini. Standardize to 1.5px `#999999`, orthogonal routing only (never curved), 3px circle terminus at the marker (never arrowhead). If a callout sits adjacent to its marker, use 15–20px stub
- **Highway line style** (Main Highway legend entry): thin solid black. Target: 1px `#3A4A52` with a lighter `#FFFFFF` 0.5px inner stroke to give depth. Differentiates from fault dashed lines even at a glance
- **Regional Structure line style** (dashed): OK. Ensure dash pattern is 4px / 2px / 4px rather than default; color `#3A4A52` at 80% opacity
- **Legend symbol-to-label alignment:** verify all legend swatches are exactly 12×12px and 8px from label text. Consistency signals care

### Background / Basemap

- **Hillshade** — restrained and correct. Soft Light blend at ~40–50% opacity with mild Gaussian blur reads well. Do not increase intensity. Verify it's consistently faded in the ocean region (should not "paint" over water)
- **Ocean gradient** — subtle darker band at the Beaufort Sea upper edge is elegant; preserve. Ensure the gradient doesn't conflict with any labels placed over open water (doesn't appear to here)
- **Political boundaries** — Yukon/Alaska/NWT/BC borders visible. Confirm stroke is taupe `#D0C8BE` at 1–1.5px, not pure black. Appears consistent but verify pixel-peep

---

## Section 3: Optional Enhancements

- **Flagship glow on RC Gold marker** — subtle 2–3px outer glow in `#C4572A` at 15% opacity around the flagship star. Draws the eye without being garish. The rest of the map is restrained enough to afford one small accent
- **Commodity legend consolidation** — merge "RC Gold Project" and "Major Gold Deposit" rows into a single "Gold projects" legend section with a sub-hierarchy (Flagship, Major), using size differentiation rather than color differentiation. Cleaner, more institutional
- **Scale bar alternative** — alongside the 500 km bar, add a second smaller bar showing approximate distance RC Gold → Whitehorse or RC Gold → Dawson. Gives investors a practical logistics reference
- **Descriptor tag on RC Gold marker** — small 2-line subtitle beneath "RC GOLD PROJECT" callout (if one exists near the star): `Gold | Yukon | Stage: [advanced / drilling]`. Investors get context without reading elsewhere
- **Inset box** — small zoom-in inset (lower right, below legend) showing the RC Gold claims footprint at local scale. Turns the locator into a dual-scale communicator
- **Subtle film grain overlay** — 1–2% noise at Overlay blend across the whole map. Removes digital flatness, gives printed/editorial feel. Only if the output is used at web/screen resolution

---

## Section 4: Art Direction

Strip the ornamental compass rose, recolor the Major Gold Deposit markers from electric blue to refined gold (`#C8A96A`), and scale up the RC Gold flagship marker to 2× the others so the eye has one place to land first. Pull the yellow "GOLD" word in the title block down to the same refined metallic gold — no bright-yellow casino energy. Fill in the missing title-block metadata as a restrained 4-line caption (figure number, projection, source, date), and correct "Snowline's Valley" to its official non-possessive form. The map otherwise has strong bones: disciplined hillshade, honest ocean / land contrast, credible commodity-zone fills, good legend panel construction. This is one focused pass from credible to confident — not a rebuild.

---

## Section 5: Typography & Layout Specialist Audit

### ISSUE 1 — Ornamental compass rose

**Location:** NW quadrant, upper-left corner (~8% across, 8% down from top-left).
**What's wrong:** A multi-pointed decorative compass rose rendered in sepia/brown sits as the single highest-contrast decorative element on the map. Ornamental roses belong on nautical, historical, or tourist maps; they signal decoration over information. Every reviewed Sitka map has repeated this pattern (see `Map Review/common-mistakes/log.md`, 2026-03-29 and 2026-03-31 entries).
**Fix:** Remove the compass rose entirely. Replace with a minimal north arrow in the upper-right corner (opposite side of the legend, to balance visual weight):
- Shape: single upward arrow or a thin elongated triangle pointing up, with "N" label beneath
- Stroke: 1px `#8A8580`; fill: `#8A8580`
- Arrow total height: 32–36px
- "N" label: Inter 9pt semibold `#8A8580`, centered under the arrow with 4px gap
- Position: ≥20px from the map's right neatline, ≥20px below the legend panel's bottom edge
**Severity:** Critical — institutional-aesthetic disqualifier and a repeating pattern.

---

### ISSUE 2 — Blue star commodity mismatch

**Location:** Legend panel, Major Gold Deposit row swatch (~67% across, 9% down).
**What's wrong:** The Major Gold Deposit legend swatch and all corresponding map markers (Fort Knox, Brewery Creek, Eagle Mine, Aurmac Deposit, Snowline's Valley Deposit) are rendered in electric blue. In the project palette, blue is reserved for lithium / critical minerals — not gold. Using blue for gold deposits on a gold-company map is a commodity-signaling error any informed analyst will read as carelessness.
**Fix:**
- Recolor all Major Gold Deposit star fills to `#C8A96A` (refined gold)
- Keep 1px `#1F2A30` stroke for definition against the hillshade
- Update the legend swatch to match
- Preserve RC Gold flagship in `#C4572A` (burnt sienna) for visual differentiation from the gold majors
**Severity:** Important — palette integrity and commodity honesty.

---

### ISSUE 3 — Possessive deposit name "Snowline's Valley Deposit"

**Location:** Right-center, callout label (~83% across, 50% down).
**What's wrong:** Deposits are named for geography, rock unit, or historical usage — very rarely are they named with a possessive referring to an owner or person. "Snowline's Valley Deposit" almost certainly should be "Snowline Valley Deposit" (no apostrophe), where "Snowline" is the geographic feature. This is a repeating pattern flagged in prior reviews (see `Map Review/common-mistakes/log.md`, 2026-03-31).
**Fix:**
- Verify the correct project name against Sitka Gold's official project list, technical reports, and most recent news releases
- Likely correct form: "Snowline Valley Deposit" (no apostrophe)
- Update the callout text and any other map references (title blocks, captions)
**Severity:** Critical — a text error in a named project is disqualifying for investor use.

---

### ISSUE 4 — RC Gold flagship not visually dominant

**Location:** Center of map (~40% across, 56% down), red star marker.
**What's wrong:** The flagship RC Gold Project marker is a red/sienna star at approximately the same scale as the blue Major Gold Deposit stars. The visual hierarchy fails: an investor scanning the map cannot immediately tell which project is the client's flagship versus peer context. The first job of a portfolio locator is to make the flagship unmistakable.
**Fix:**
- RC Gold marker: 20–24px diameter, filled star in `#C4572A` (burnt sienna), 1px `#1F2A30` stroke for definition
- Major Gold Deposit markers: 10–12px diameter, filled star in `#C8A96A` (refined gold), 1px `#1F2A30` stroke
- Optional enhancement: 2–3px outer glow in `#C4572A` at 15% opacity around the flagship marker
**Severity:** Important — weak hierarchy is the single biggest failure of a locator map.

---

### ISSUE 5 — Yellow "GOLD" treatment in title block

**Location:** Lower-left, title block, the word "GOLD" inside "SITKA GOLD CORP" (~15% across, 73% down).
**What's wrong:** The word "GOLD" is rendered in a saturated pure yellow (visually close to `#FFCC33` or `#FFD700`). Against the restrained warm-gray basemap and the muted institutional palette everywhere else, the yellow reads as 1990s Las Vegas signage, not Barrick-annual-report gold. The palette already defines "refined gold" as `#C8A96A` — metallic, restrained, confident. Use it.
**Fix:**
- Retone the "GOLD" word to refined gold `#C8A96A`, matching the commodity accent used elsewhere
- Alternative: unify all three words ("SITKA GOLD CORP") in a single ink (`#FFFFFF` if contrast against basemap is OK, else `#1F2A30`). Single-ink treatment is actually the more institutional choice
- Whichever is picked, apply the same decision to "RC GOLD PROJECT" underneath
**Severity:** Important — single most visible palette discord on the map.

---

### ISSUE 6 — Missing title-block metadata

**Location:** Lower-left, directly beneath the "SITKA GOLD CORP / RC GOLD PROJECT" title block (~20% across, 87% down).
**What's wrong:** The title block carries the company name and project but none of the mandatory cartographic metadata: no figure number, no projection note, no source attribution, no compilation date. This fails NI 43-101 figure requirements, CIM best practice, and any listing-rule standard. A figure that cannot be cited in a technical report is not usable in investor disclosure.
**Fix:** Add a 4-line metadata caption directly beneath the existing title block, left-aligned to the same margin as the title:
- Line 1: "Figure [X]" — Inter 11pt semibold `#8A8580`, tracking +10
- Line 2: "Projection: NAD83 / UTM Zone 8N" — Inter 9pt regular `#8A8580` (verify actual projection with the source)
- Line 3: "Base data: Natural Earth; Yukon Geological Survey" — Inter 9pt regular `#8A8580` (verify actual sources)
- Line 4: "Prepared: March 2026" — Inter 9pt regular `#8A8580`
- Vertical spacing: 6px between each line
- Leading gap between title block bottom and line 1: 12px
**Severity:** Critical — compliance floor.

---

### ISSUE 7 — "Regional Structure" is a vague legend entry

**Location:** Legend panel, Regional Structure row (~67% across, 16% down).
**What's wrong:** The dashed lines crossing the map are labeled only as "Regional Structure" in the legend. That phrasing covers faults, terrane boundaries, shear zones, contact zones, or plate margins — five distinct geological concepts with very different meaning for mineral exploration. A geologist-investor reading the map cannot tell what's being shown. Vague legend entries fail CIM best practice.
**Fix:**
- Identify the specific structural feature the dashes represent. On a Yukon / Tintina Gold Province map, these are most likely the Tintina Fault System and associated splays
- Rename the legend entry to the specific name: "Tintina Fault System" or "Major Regional Fault" if the feature is unnamed
- If multiple structure types are shown, split into separate legend rows with distinct dash patterns:
  - Major fault: 4px dash / 2px gap, `#3A4A52` at 80% opacity
  - Terrane boundary: 2px dash / 4px gap, `#3A4A52` at 60% opacity
**Severity:** Important — geological-communication integrity.

---

### ISSUE 8 — Scale bar styling

**Location:** Lower-left, beneath the title block (~22% across, 94% down).
**What's wrong:** The scale bar shows the right increments (0 / 250 / 500 km) but lacks institutional finish — no clear alternating segment fills, no visible thin stroke, numeral typography appears generic. Reads as GIS default output.
**Fix:**
- Style: alternating `#1F2A30` and `#FFFFFF` segment fills, with 0.5px `#1F2A30` outer stroke
- Total length: represent 500 km
- Segments: 0 | 125 | 250 | 375 | 500 km (four segments instead of two gives smoother reference)
- Bar height: 4px
- Numerals: Inter 9pt regular `#8A8580`, centered above each segment boundary
- Unit label: "km" — Inter 9pt regular `#8A8580`, placed after the final numeral with one character of space ("500 km" not "500km")
**Severity:** Minor — polish pass.

---

## Section 6: Investor Appeal & Regulatory Compliance

### Compliance status

| Standard | Status | Issues |
|----------|--------|--------|
| NI 43-101 Figure Requirements | **Non-compliant** | Missing figure number, projection note, source attribution, compilation date |
| CIM Best Practice | **Non-compliant** | Legend ambiguity ("Regional Structure"); commodity color mismatch (blue for gold) |
| TSX / TSX-V News Release | **Would not pass QP review as-is** | Same gaps as NI 43-101; text error ("Snowline's Valley") |
| ASX Listing Rule 5.7 (JORC) | **Non-compliant** | Same as NI 43-101 |

All four compliance frameworks require the same metadata block. Adding Issue 6's 4-line caption simultaneously closes the gap across all four.

### The 3-second investor test

**Currently:** "A Yukon map with some gold deposits. The big red star is the company's project, the blue stars are... other gold projects? Why are they blue? Is the gold mineralization actually confirmed here or is this aspirational? I don't see a date or source, so I'm not sure how current this is."

**Target:** "Sitka Gold's RC Gold Project sits at the heart of the Tombstone Gold Belt in Yukon, right on the Tintina Gold Province trend, surrounded by institutional-scale gold deposits — Fort Knox, Eagle Mine, Brewery Creek, Snowline Valley. The flagship marker is clearly dominant, and the neighbours give credibility to the district-scale thesis. Projection and source are noted at the bottom, so I trust the data. Clean map."

---

## Severity Summary

| Level | Count | Key themes |
|-------|-------|------------|
| Critical | 3 | Ornamental compass rose, possessive deposit name, missing title-block metadata |
| Important | 4 | Commodity color mismatch (blue→gold), flagship hierarchy weakness, title-block "GOLD" color, vague legend entry |
| Minor | 1 | Scale bar styling polish |
| **Total** | **8** | |

**Bottom line:** This map has strong bones and is much closer to shippable than the reviewed NA regional from March. The basemap, hillshade treatment, land/water contrast, and Tombstone Gold Belt / Tintina Gold Province commodity fills are all correctly handled. The flagship storytelling is undermined by two things: the blue-for-gold palette error and the RC Gold marker not being visibly larger than the peer deposits. Fix those two plus the compass rose, plus the title-block metadata and the "Snowline's Valley" text, and the map is institution-grade. Order of operations: (1) text corrections, (2) commodity color fix on all gold stars, (3) flagship size increase, (4) compass rose replacement, (5) metadata caption, (6) scale bar polish. One disciplined pass by the designer — no rebuild needed.
