# Map Review: Sitka Gold Corp — Regional Project Locations

**Date:** 2026-03-31
**Map:** Sitka regional overview (North America)
**Status:** Needs significant revision before investor use

---

## Section 1: Top 10 High-Impact Improvements

| # | Location | Issue | Fix | Severity |
|---|----------|-------|-----|----------|
| 1 | Center of map | **Software toolbar visible** — Figtree font picker, "73.28 pt", formatting buttons captured in the export | Re-export from design application with UI hidden. If source unavailable, crop and Content-Aware Fill | Critical |
| 2 | Large text across Canada | **"CANADA" misspelled as "C A N D A"** — missing the second A | Correct to "C A N A D A" with consistent letter spacing | Critical |
| 3 | Lower half, two callouts | **"ALPHA GOLD PROJECT" appears twice** — one near Nevada, one near Arizona. One is almost certainly a different project name | Verify against Sitka Gold's official project list and correct the mislabeled one | Critical |
| 4 | Top-right callout | **Spurious comma in "COPPERMINE RIVER, PROJECT"** — no other project name uses a comma | Remove comma → "COPPERMINE RIVER PROJECT" | Critical |
| 5 | Entire map | **No scale bar** — fundamental cartographic omission on a continental-scale map. NI 43-101 non-compliant | Add segmented scale bar: 0/250/500/750/1,000 km. Bar height 4px, alternating `#1F2A30` and `#FFFFFF`, 0.5px stroke. Numerals: Inter 9pt `#8A8580` | Critical |
| 6 | Entire map | **No map title or figure number** — NI 43-101 non-compliant, cannot be referenced in text | Add title block (see Section 5, Issue 2 for exact specs) | Critical |
| 7 | Entire map | **No legend** — bullseye symbols, colors, and conventions unexplained | Add legend panel defining project markers, city dots, boundary lines, commodity colors (see Section 5, Issue 3 for specs) | Critical |
| 8 | All 4 callout boxes | **Company logo repeated 4 times** — looks like clip-art pasted on. No institutional map does this | Use logo once in title block. Remove from all callouts | Important |
| 9 | All project markers | **All 4 bullseye symbols identical** — no hierarchy between flagship and early-stage, no commodity differentiation (gold vs copper) | Flagship: 12-14px marker. Secondary: 8-10px. Gold: `#C4572A`. Copper: `#B87333`. Define in legend | Important |
| 10 | Ocean vs land | **Near-zero contrast** — both gray, indistinguishable at distance or on projector. Systemic palette problem | Ocean → `#A8BCC8` (steel blue). Canada → `#F7F5F0` (warm off-white). USA → `#EAEAEA` (soft separation) | Important |

---

## Section 2: Detailed Recommendations by Category

### Color

The root cause of most visual problems is that the palette has no identity — everything is gray. The entire tonal foundation needs to shift from cold-neutral to warm-neutral with one deliberate cool element (the ocean).

| Element | Current | Target | Hex |
|---------|---------|--------|-----|
| Ocean | Flat gray | Desaturated steel blue | `#A8BCC8` |
| Canada landmass | Cold white | Warm off-white (premium paper feel) | `#F7F5F0` |
| USA landmass | Same cold white as Canada | Soft separation — subtly cooler | `#EAEAEA` |
| Primary ink (titles, boundaries) | Pure black in places | Dark blue-gray. Never pure black | `#1F2A30` |
| Secondary ink | Same as primary | Supporting linework, secondary labels | `#3A4A52` |
| Geographic labels | Same weight as project names | Warm gray — clearly subordinate | `#8A8580` |
| Political boundaries | Near-invisible | Taupe — visible but quiet, 1.5px stroke | `#D0C8BE` |
| Gold project accent | Generic orange | Burnt sienna — confident, not clip-art | `#C4572A` |
| Copper project accent | Same generic orange | Copper metallic or teal | `#B87333` or `#2A7B6F` |
| Compass rose | Pure black `#000000` | Warm gray (push it back in hierarchy) | `#8A8580` |

Apply in order: (1) ocean, (2) land fills, (3) borders, (4) text colors, (5) accent system. Fixing the neutral stack first resolves most issues in one pass.

### Labels & Text

- **"C A N D A" → "C A N A D A"** — add missing letter, verify tracking consistency
- **"COPPERMINE RIVER, PROJECT" → "COPPERMINE RIVER PROJECT"** — remove comma
- **Duplicate "ALPHA GOLD PROJECT"** — verify correct name for second project
- **City labels:** Standardize to title case (Iqaluit, not IQALUIT). All cities: 9-10pt, Inter, `#8A8580`
- **Territory/state labels (YUKON, NEVADA, ARIZONA):** Currently compete with project names at similar size/weight. Reduce to 11-12pt, lighter weight, `#8A8580`. They are reference context, not focal elements
- **Country labels ("C A N A D A", "U S A"):** Extreme letterspacing is acceptable convention but calibrate so the word reads as a single entity, not disconnected characters
- **Add map title:** "Figure X: Sitka Gold Corp — Project Locations, North America"
- **Add date:** "Prepared: March 2026"
- **Add source attribution:** "Base data: Natural Earth" or appropriate source
- **Add projection:** e.g., "NAD83 / Lambert Conformal Conic"

### Layout & Composition

- **Remove software toolbar** from center of image
- **Remove 3 of 4 logo instances** — place logo once in title block, approximately 120px wide, subordinate to title text
- **Rebalance southern callouts** — the two Alpha Gold boxes crowd each other while the entire eastern half of the map is dead space. Either crop tighter to project locations or repurpose eastern space for legend/title block/portfolio summary
- **Add a neatline** (0.5-1pt thin border frame) to contain the map
- **Coordinate graticule:** Add lat/long tick marks at 2-5 degree intervals along the neatline. Labels: Inter 8pt `#8A8580`

### Symbology

- **Project markers:** Three-tier hierarchy. Flagship: 12-14px, bold fill. Advanced: 8-10px. Early-stage: 6px. Commodity color on fill, 1px `#1F2A30` stroke for definition
- **Leader lines:** Every callout must have one. 1-1.5px, `#999999`, orthogonal bends (never curved), circle terminus at the marker (not arrowhead). If callout sits next to marker, shorten leader to a stub
- **City dots:** Standardize all to identical size and style — small, `#8A8580`, clearly subordinate to project markers
- **Compass rose:** Replace decorative multi-pointed nautical design with a clean minimal north arrow (single arrow + "N"). Render in `#8A8580`. Professional geological maps don't use ornamental roses
- **Legend:** Define every symbol. 12x12px swatches + 8px gap + label text. Panel background `#F7F7F5` at 90% opacity, 1px stroke `#EAEAEA`, 4px corners, 12px internal padding

### Background / Basemap

- **Add subtle terrain hillshade** at 10-15% opacity (Soft Light blend, 0.7px Gaussian Blur). Gives unconscious geographic orientation — mountains, coastlines, the Canadian Shield — without competing with data
- **Increase land/water contrast** — ocean `#A8BCC8`, land `#F7F5F0`
- **Political boundaries** in taupe `#D0C8BE` at 0.75-1.5pt — visible enough for jurisdiction context
- **Optional vignette:** Slightly fade basemap in areas away from projects to draw the eye toward project cluster areas

---

## Section 3: Optional Enhancements

- **Project descriptor tags** under each name — "Gold | Yukon | 14,000 ha" — giving investors instant context without reading a data table
- **Inset boxes** for each project showing a zoomed-in view of the tenement/claim block footprint
- **Flagship project glow:** If RC Gold is the primary asset, a subtle outer glow (2-3px, 15% opacity in the accent color) on its marker draws the eye without being garish
- **Portfolio summary table** in the dead space of eastern Canada — a compact table listing each project, commodity, area, and stage. Turns wasted space into communication space
- **Subtle grain overlay** (1-2% noise, Overlay blend) across the whole map to remove digital flatness — gives a printed/editorial feel

---

## Section 4: Art Direction

Strip this map back to its bones and rebuild the surface. The ocean goes steel blue (`#A8BCC8`), the land goes warm off-white (`#F7F5F0`), and one decisive burnt sienna accent (`#C4572A`) carries every gold project marker and callout — with a copper metallic (`#B87333`) variant for Coppermine River alone. The logo appears once, small and confident, in a title block that also holds the figure number and date. Project names sit directly on the map in bold Inter or Barlow with white text halos, connected to size-differentiated markers by clean mid-gray leader lines — no boxes, no borders, no clip-art energy. The flagship project gets a marker twice the size of the others, and nothing else on the map is allowed to compete with it for the eye. The mood is restrained confidence: Barrick's annual report, not a junior miner's first PowerPoint.

---

## Section 5: Typography & Layout Specialist Audit

Full spec-level detail for every typography and layout fix. These are the exact values your designer should use.

---

### ISSUE 1 — Software toolbar visible (center of map)

**Location:** Center of map, overlapping geographic content.
**What's wrong:** The Figtree font picker dropdown, "73.28 pt" size field, and formatting toolbar buttons from the design application are captured in the export. This is a screenshot artifact, not map content. It immediately signals the map was never properly exported or quality-checked.
**Fix:** Re-export the map from the design application with all UI panels hidden (View > Hide UI or equivalent). If the source file is unavailable, crop the artifact out in Photoshop, then Content-Aware Fill the gap. Do not ship any version with this artifact visible.
**Severity:** CRITICAL — disqualifying for any investor-facing use.

---

### ISSUE 2 — No map title or figure number

**Location:** Entire map; no title block exists anywhere.
**What's wrong:** The map has no heading identifying what it is. An investor opening this in a deck or report has no text anchor telling them "this is Sitka Gold's project portfolio across North America." Every institutional-quality map carries a title and figure number.
**Fix:** Add a title block in the top-left or bottom-left corner:
- Line 1 (figure number): "Figure 1" — Playfair Display or Cormorant Garamond, 14pt, regular weight, color `#8A8580` (warm gray), tracking +10.
- Line 2 (title): "SITKA GOLD CORP" — Inter or Helvetica Neue, 48pt, semibold, color `#1F2A30`, tracking +30.
- Line 3 (subtitle): "Project Locations — North America" — Inter or Helvetica Neue, 22pt, regular, color `#3A4A52`, tracking +10.
- Line 4 (date): "March 2026" — Inter, 11pt, regular, color `#8A8580`.
- Vertical spacing: 8px between lines 1-2, 6px between lines 2-3, 12px between lines 3-4.
- Left-align all lines to a shared margin.
**Severity:** CRITICAL — no professional map ships without a title.

---

### ISSUE 3 — No legend

**Location:** Entire map; no legend panel exists.
**What's wrong:** The bullseye project markers, city dots, callout styling, and any color coding are unexplained. Investors should not have to guess what symbols mean.
**Fix:** Add a legend panel in the lower-right or upper-right corner:
- Legend title: "LEGEND" — Inter, 11pt, semibold, color `#1F2A30`, tracking +20, all-caps.
- Legend entries: Inter, 10pt, regular, color `#3A4A52`. Each entry = symbol swatch (12x12px) + 8px gap + label text.
- Entries needed: project marker (bullseye), city dot, country boundary line style, province/state boundary line style.
- Panel background: `#F7F7F5` at 90% opacity with 1px stroke `#EAEAEA`. Rounded corners 4px. Padding 12px inside.
- If using commodity-differentiated markers (gold vs copper), include both with labels.
**Severity:** CRITICAL.

---

### ISSUE 4 — No scale bar

**Location:** Entire map; none present.
**What's wrong:** A continental-scale map with no scale reference. Investors and geologists cannot estimate distances.
**Fix:** Add a segmented scale bar in the lower-left corner:
- Style: alternating black/white segmented bar (not a single line).
- Total length: represent approximately 1,000 km.
- Segments: 0 | 250 | 500 | 750 | 1,000 km.
- Bar height: 4px. Segment fill colors: `#1F2A30` and `#FFFFFF` alternating, with 0.5px stroke `#1F2A30`.
- Numerals: Inter, 9pt, regular, color `#8A8580`, centered above each segment boundary.
- Unit label: "km" — Inter, 9pt, regular, color `#8A8580`, placed after the final numeral.
**Severity:** CRITICAL.

---

### ISSUE 5 — "SITKA GOLD CORP" logo repeated 4 times

**Location:** Above each of the four callout boxes.
**What's wrong:** The company logo appears once above every callout box. This is redundant, cluttered, and amateurish. It shrinks each logo instance to a size where the metallic gradient loses legibility and becomes visual noise.
**Fix:** Remove three of the four logo instances. Place the logo exactly once:
- Position: inside the title block (lower-left or top-left), below the map title.
- Size: constrain to approximately 120px wide (at screen resolution) or 30mm wide (at print).
- The logo should be the smallest element in the title block — subordinate to the title text.
**Severity:** IMPORTANT.

---

### ISSUE 6 — Callout boxes are generic white rectangles

**Location:** All four project callout boxes.
**What's wrong:** White fill, thin orange stroke, no corner radius, no shadow, no typographic structure inside. They look like auto-generated labels from a GIS application.

**Fix (Option A — recommended, no boxes):** Remove boxes entirely. Display project names directly on the map:
- Project name: Inter or Helvetica Neue, 14pt, semibold, color `#1F2A30`, tracking +10, all-caps.
- Text halo/mask: 2-3px soft glow in `#F7F7F5` at 80% opacity for legibility.
- Connect to marker with a leader line (see Issue 12).

**Fix (Option B — if boxes must stay):** Redesign each callout:
- Remove the logo from inside/above the box.
- Background: `#F7F7F5` (warm off-white), not pure white.
- Border: remove the orange stroke entirely. Replace with a subtle drop shadow: offset 0/2px, blur 6px, color `#1F2A30` at 10% opacity.
- Left accent bar: 3px vertical stripe on left edge, color `#C4572A` (gold) or `#B87333` (copper).
- Corner radius: 6px.
- Internal padding: 12px top/bottom, 16px left (after accent bar), 16px right.
- Project name: Inter, 13pt, semibold, `#1F2A30`, tracking +5.
- Optional descriptor: Inter, 10pt, regular, `#8A8580` — e.g., "Gold | Yukon | 14,000 ha".
- All boxes same width (180px / 45mm) regardless of text length.
**Severity:** IMPORTANT — the single biggest visual-quality signal on the map.

---

### ISSUE 7 — Two "ALPHA GOLD PROJECT" callouts crowd each other

**Location:** Lower half of map, SW quadrant. Two callout boxes with identical text sit close together.
**What's wrong:** Beyond the duplicate name (Critical text error), the layout itself is cramped. Two callouts of similar size compete for the same visual space while the entire eastern half of the map is empty.
**Fix:** After resolving the naming error, spread the southern callouts apart. Move one into the dead space to the east with a longer leader line, or offset them vertically with at least 40px gap. Ensure no callout overlaps another callout or any geographic feature.
**Severity:** IMPORTANT.

---

### ISSUE 8 — Font hierarchy has only two effective levels

**Location:** Entire map.
**What's wrong:** The map has project names (large, bold) and everything else (small, similar weight). There are no clear intermediate levels. Territory labels compete with project names. City labels and country labels have no consistent size relationship.
**Fix:** Establish four distinct levels:
- **Level 1 (title):** Map title in title block. 48pt semibold `#1F2A30`.
- **Level 2 (project names):** 14pt semibold `#1F2A30` tracking +10, all-caps.
- **Level 3 (geographic labels):** Territory/state names. 11pt regular `#8A8580` tracking +5, all-caps.
- **Level 4 (reference labels):** City names, annotations. 9pt regular `#8A8580`, title case.
- Country labels ("C A N A D A", "U S A"): 24-28pt light weight `#EAEAEA` with extreme tracking. These should be the lightest, most passive text on the map — watermark-level presence.
**Severity:** IMPORTANT.

---

### ISSUE 9 — "IQALUIT" all-caps vs title case for other cities

**Location:** Nunavut area (NE quadrant).
**What's wrong:** "IQALUIT" is in all caps while Whitehorse, Las Vegas, and Phoenix use title case.
**Fix:** Standardize to title case: "Iqaluit". All city labels: Inter, 9pt, regular, `#8A8580`, title case, with a 4px gray dot marker.
**Severity:** MINOR.

---

### ISSUE 10 — Country labels have extreme letterspacing

**Location:** "C A N D A" across Canada, "U S A" across USA.
**What's wrong:** While wide letterspacing is a valid cartographic convention for area labels, the current spacing makes each letter read as an isolated character rather than a word. Combined with the missing "A" in Canada, the treatment feels uncontrolled.
**Fix:** Reduce tracking to +80 to +120 (from what appears to be +200+). Use a light font weight (200 or 300) in `#EAEAEA` — these should function like a watermark, barely there, not competing with any map content. Verify all letters are present after adjusting.
**Severity:** MINOR.

---

### ISSUE 11 — Compass rose is decorative and visually dominant

**Location:** Top-right corner.
**What's wrong:** Multi-pointed ornamental compass rose in pure black. It is the highest-contrast element on the map, drawing the eye before any project. Decorative roses belong on nautical/tourist maps, not institutional mining cartography.
**Fix:** Replace with a minimal north arrow:
- Single upward arrow or thin pointed triangle with "N" label.
- Color: `#8A8580` (warm gray).
- Size: approximately 30-40px tall.
- Position: upper-right corner, at least 20px from neatline edges.
- Font for "N": Inter, 9pt, semibold, `#8A8580`.
**Severity:** MINOR.

---

### ISSUE 12 — Leader lines inconsistent or missing

**Location:** Connections between callout boxes and their project markers.
**What's wrong:** Some callouts appear connected by leader lines, others float near their markers without explicit connection. The lines vary in angle, weight, and style.
**Fix:** Standardize all leader lines:
- Stroke: 1.5px, color `#999999`, 100% opacity.
- Routing: orthogonal (one right-angle bend) or straight diagonal — never curved.
- Terminus: small filled circle (3px diameter, `#999999`) where the line meets the marker. No arrowheads.
- Every callout must have a leader line, no exceptions. If the callout sits directly adjacent to the marker, use a short 15-20px stub.
- No leader line should cross another callout, another leader line, or a project marker.
**Severity:** MINOR.

---

### ISSUE 13 — Eastern half of map is dead space

**Location:** Everything east of approximately 80°W longitude — eastern Canada, Ontario, Quebec, Atlantic provinces, eastern US.
**What's wrong:** No projects, no labels, no content. This is wasted space that dilutes visual density and makes the project portfolio feel scattered.
**Fix (Option A — preferred):** Crop the map to a western North America extent (approximately 100°W to 145°W, 30°N to 72°N). This tightens the composition and makes the projects feel like a coherent portfolio.
**Fix (Option B):** Keep the full continental extent but repurpose the eastern space for a vertically-stacked information panel: title block, legend, portfolio summary table, and source attribution. This turns dead space into communication space.
**Severity:** MINOR.

---

### ISSUE 14 — No neatline

**Location:** Map edges.
**What's wrong:** No border frame defines the map extent. The edges feel undefined, particularly when reproduced in documents.
**Fix:** Add a neatline: 0.75px stroke, color `#D0C8BE` (taupe), rectangular, with 20px margin from the artboard edge. Coordinate tick marks (if added) reference this line.
**Severity:** MINOR.

---

## Section 6: Investor Appeal & Regulatory Compliance

### Compliance Status

| Standard | Status | Issues |
|----------|--------|--------|
| NI 43-101 Figure Requirements | **Non-compliant** | Missing scale bar, legend, title, source attribution, date |
| CIM Best Practice (maps in public disclosure) | **Non-compliant** | No symbol definitions, no commodity differentiation |
| TSX-V News Release | **Would not pass QP review** | Missing title, scale, legend, attribution, date; text errors |
| ASX Listing Rule 5.7 (JORC) | **Non-compliant** | Same issues as NI 43-101 |

### The Quality Test

**"Would this look normal inside a $50M market cap mining deck?"** — No.

The four critical text errors (misspelled country, duplicate project name, toolbar artifact, errant comma) would each individually cause an analyst to question the preparer's attention to detail. Together they are disqualifying. The missing cartographic elements (scale, legend, title) compound the problem — the map reads as an unfinished internal draft, not a publishable figure.

### What an Investor Sees in 3 Seconds

Currently: "A gray map with some orange dots and a software toolbar. I can't tell which project matters. I'm not sure they proofread this."

Target: "Sitka Gold has four projects across western North America. The big one is in the Yukon. They also have a copper play in Nunavut and two gold projects in Nevada and Arizona. Clean, professional, they know their portfolio."

---

## Severity Summary

| Level | Count | Key themes |
|-------|-------|------------|
| Critical | 8 | Spelling, duplication, toolbar, comma, missing scale/title/legend/attribution |
| Important | 8 | Logo repetition, no hierarchy, callout box design, font hierarchy, weak contrast, crowded layout, commodity differentiation, palette temperature |
| Minor | 6 | Compass style, city capitalization, country label spacing, leader lines, dead space, neatline |
| **Total** | **22** | |

**Bottom line:** This map has strong bones — the geographic extent, project positions, and brand elements are all present. But it needs finishing, not shipping. Fix the 8 critical items first (they're mostly quick: spelling, cropping, adding standard cartographic elements). Then address the palette and hierarchy in a second pass. The callout box redesign and marker hierarchy are where the map goes from "corrected" to "premium." The art direction specs above give your designer exact targets for every element.
