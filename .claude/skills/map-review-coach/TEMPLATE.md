# Map Review: {{CLIENT}} — {{MAP_TITLE}}

**Date:** {{YYYY-MM-DD}}
**Map:** {{map file path or descriptor}}
**Status:** {{ships as-is | one pass needed | two passes needed | rebuild}}
**Annotated overlay:** `{{mapname}}_annotated.png`

---

## Section 1: Top 5–10 High-Impact Improvements

Numbered 1:1 with the annotated overlay. Each row: location on the map, issue, exact fix, severity.

| # | Location | Issue | Fix | Severity |
|---|----------|-------|-----|----------|
| 1 | {{quadrant + landmark}} | {{what's wrong}} | {{exact values — hex, pt, px, opacity}} | {{Critical / Important / Minor}} |
| 2 | … | … | … | … |

---

## Section 2: Detailed Recommendations by Category

### Color

{{1–2 sentences naming the root palette issue, if any}}

| Element | Current | Target | Hex |
|---------|---------|--------|-----|
| Ocean | {{what it is now}} | {{what it should be}} | `{{hex}}` |
| Land (primary) | … | … | `{{hex}}` |
| Primary ink | … | `#1F2A30` | … |
| Accent | … | … | `{{hex}}` |

Apply in order: (1) ocean, (2) land fills, (3) borders, (4) text colors, (5) accent system.

### Labels & Text

- {{bullet — specific correction with exact new value}}
- {{bullet}}

### Layout & Composition

- {{bullet — alignment, spacing, repositioning with exact px values}}
- {{bullet}}

### Symbology

- **Project markers:** {{three-tier hierarchy with exact sizes and colors}}
- **Leader lines:** {{standardization}}
- **Compass rose:** {{replacement spec}}
- **Legend:** {{completeness + panel spec}}

### Background / Basemap

- {{hillshade treatment with blend mode, opacity, blur values}}
- {{contrast adjustments}}
- {{political boundary spec}}

---

## Section 3: Optional Enhancements

Advanced polish that goes beyond correction into elevation:

- {{bullet — e.g. flagship glow, descriptor tags, inset boxes, portfolio summary table, subtle grain overlay}}
- {{bullet}}

---

## Section 4: Art Direction

2–3 sentences describing the ideal final look. Exact-value prose — named colors, named fonts, specific hierarchies — so the designer has a target to hit.

> *Example: "Strip this map back to its bones and rebuild the surface. The ocean goes steel blue (#A8BCC8), the land goes warm off-white (#F7F5F0), and one decisive burnt sienna accent (#C4572A) carries every gold project marker and callout. The logo appears once, small and confident, in a title block that also holds the figure number and date. The flagship project marker is twice the size of the others, and nothing else is allowed to compete with it for the eye. The mood is restrained confidence: Barrick's annual report, not a junior miner's first PowerPoint."*

---

## Section 5: Typography & Layout Specialist Audit

Full spec-level detail for every issue flagged in Section 1. One subsection per numbered issue. These are the exact values the designer executes against.

### ISSUE 1 — {{issue title}}

**Location:** {{quadrant + landmark}}
**What's wrong:** {{1–2 sentences}}
**Fix:** {{bulleted exact values}}
**Severity:** {{Critical / Important / Minor}}

### ISSUE 2 — {{issue title}}

{{same structure}}

{{… continue for every numbered issue}}

---

## Section 6: Investor Appeal & Regulatory Compliance

### Compliance status

| Standard | Status | Issues |
|----------|--------|--------|
| NI 43-101 Figure Requirements | {{Compliant / Non-compliant}} | {{if non-compliant: list gaps}} |
| CIM Best Practice | {{…}} | {{…}} |
| TSX / TSX-V News Release | {{…}} | {{…}} |
| ASX Listing Rule 5.7 (JORC) | {{…}} | {{…}} |

### The 3-second investor test

Currently: "{{what the map conveys today}}"

Target: "{{what it should convey}}"

---

## Severity Summary

| Level | Count | Key themes |
|-------|-------|------------|
| Critical | {{n}} | {{1-line synthesis}} |
| Important | {{n}} | {{…}} |
| Minor | {{n}} | {{…}} |
| **Total** | **{{n}}** | |

**Bottom line:** {{1–2 sentences. What's salvageable, what needs to go, what pass order the designer should follow.}}
