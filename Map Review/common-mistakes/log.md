# Common Mistakes Log

Recurring issues found during map reviews. These are weighted higher in future reviews.

---

### 2026-03-29 — Sitka Gold Corp Location Map
- Software artifact left in export: Toolbar visible in center of map image
- Misspelling: "C A N D A" instead of "CANADA"
- Punctuation error: Spurious comma in "COPPERMINE RIVER, PROJECT"
- Duplication: "ALPHA GOLD PROJECT" label appears twice
- No visual hierarchy: All four project markers identical size/style
- Logo overuse: Company logo repeated 4 times instead of once
- Missing cartographic elements: No title, scale bar, north arrow, or attribution
- Flat/lifeless basemap: Gray background provides no geographic context
- Generic callout styling: White box with orange border looks like software default
- Wrong font for audience: Figtree (UI font) used instead of institutional serif/sans pairing

### 2026-03-31 — Sitka Gold Corp RC Gold Project Map
- Logo duplication: Company logo repeated twice on same map (repeat issue)
- Possessive deposit name: "Snowline's Valley Deposit" — likely incorrect apostrophe usage
- Missing metadata: No title, figure number, date, source, projection (repeat issue)
- No claim boundary: Project marker shown but no property outline — investors can't see land position
- Same-size markers: RC Gold marker identical to neighboring deposits on its own project map
- Indistinguishable geological zones: Tombstone Gold Belt and Tintina Gold Province too similar in color/opacity
- Generic callout box: Same white box with orange border from regional map (repeat issue)
- Ornamental compass rose: Same decorative style as regional map (repeat issue)
- Fort Knox unique symbol not in legend
- Scale bar missing space: "200km" should be "200 km"
- Mixed territory labeling: ALASKA/YUKON spelled out but NWT/BC abbreviated
- Non-standard font size: 73.28pt from drag-scaling instead of deliberate size hierarchy
- Typographic hierarchy absent: Territory labels, project names, and country labels all competing at similar size/weight/color
- Inconsistent capitalization: IQALUIT all-caps while other cities are title case
- Extreme manual letterspacing on country labels instead of using tracking controls
- Leader lines inconsistent: some callouts have them, some do not; no standard terminus style
- No source attribution, projection note, or compilation date
- Ornamental compass rose inappropriate for institutional cartography

### 2026-04-17 — Sitka Gold Corp RC Gold Project Yukon Locator
- Ornamental compass rose: Same decorative sepia style as prior Sitka maps (repeat issue — 3rd occurrence, promote to standing Critical)
- Possessive deposit name: "Snowline's Valley Deposit" still not corrected (repeat issue — 2nd occurrence)
- Missing title-block metadata: No figure number, projection note, source attribution, or compilation date (repeat issue — 3rd occurrence)
- Commodity color mismatch: Major Gold Deposits rendered in electric blue — blue is reserved for lithium / critical minerals per palette. Gold stars must be `#C8A96A` refined gold (new pattern — watch for recurrence)
- Flagship hierarchy weak: RC Gold marker same scale as peer Major Gold Deposit stars — flagship must be ~2× (repeat issue — 2nd occurrence after March regional review)
- Title-block "GOLD" word in saturated pure yellow instead of refined metallic gold `#C8A96A` (new pattern — watch for recurrence on other Sitka materials)
- Vague legend entry "Regional Structure" — ambiguous between fault, terrane boundary, shear zone; must specify (new pattern)
- Scale bar lacks segmented alternating-fill treatment (minor, but same default-GIS-output feel as prior maps)
