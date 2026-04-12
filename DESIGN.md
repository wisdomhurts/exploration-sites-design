# Exploration Sites — Design System

> Inspired by Firecrawl's sectioned, editorial layout patterns.
> Adapted for mining IR — authoritative, clean, investor-grade.
> Light mode. Fonts: Cormorant Garamond + DM Sans.

---

## 1. Visual Theme & Atmosphere

Firecrawl's website is a masterclass in structured, developer-first design — a system that manages to feel simultaneously technical and approachable through strict editorial rhythm. The page is organized into numbered sections (`[ 01 /07 ]`) with consistent two-column layouts: a left-hand label column anchoring context, and a right-hand content column delivering substance. The overall impression is of a well-edited whitepaper — every section earns its place.

Applied to Exploration Sites, this structure maps naturally onto a services agency that needs to communicate authority, pricing transparency, and technical competence to mining executives and investor relations teams. The editorial rhythm replaces the typical agency "scroll of cards" with something closer to a structured prospectus.

**Key Characteristics:**
- Numbered section markers (`[ 01 /06 ]`) for editorial rhythm
- Strict two-column layout: label (380px) + content (840px) within 1280px content area
- Cormorant Garamond at weight 300 for headlines — serif authority without heaviness
- DM Sans for all UI and body text — geometric, modern, readable
- Navy (`#173559`) as the singular brand color — no competing hues
- Ice blue (`#9ECDE4`) as the sole accent — cold, mineral, geographic
- 1px horizontal rules as section dividers — not cards, not shadows
- Generous whitespace replaces visual decoration

---

## 2. Color Palette & Roles

### Primary
| Token | Value | Role |
|-------|-------|------|
| Navy | `#173559` | Headlines, nav text, primary buttons, stat numbers, icons |
| White | `#FFFFFF` | Page background, button text, card surfaces |
| Ice Blue | `#9ECDE4` | Section labels, accent text, active states, button glow |

### Neutral Scale
| Token | Value | Role |
|-------|-------|------|
| Body | `#888888` | Body copy, descriptions, secondary text |
| Muted | `#AAAAAA` | Captions, footer text, metadata, stat labels |
| Border | `#E8E8E8` | Section dividers, card borders, table rules |
| Surface | `#F5F5F5` | Card backgrounds, callout blocks, hover fills |
| Off-white | `#FAFAFA` | Alternating section backgrounds |

### Accent Effects
| Token | Value | Role |
|-------|-------|------|
| Ice Glow Inner | `#9ECDE426` | Button glow inner ring |
| Ice Glow Outer | `#9ECDE440` | Button glow outer halo |

### Color Philosophy
The palette is deliberately minimal — two chromatic colors (navy + ice blue) and a neutral gray scale. This mirrors Firecrawl's approach where orange is the only chromatic accent against neutrals. For a mining IR agency, the restraint signals professionalism. The ice blue reads as cartographic and geological — a color that could appear on a topographic map or mineral survey.

---

## 3. Typography Rules

### Font Families
- **Headlines:** `"Cormorant Garamond"`, serif — weight 300 (light)
- **Body / UI:** `"DM Sans"`, sans-serif — weights 400, 500, 600

### Hierarchy

| Role | Family | Size | Weight | Line Height | Letter Spacing | Notes |
|------|--------|------|--------|-------------|----------------|-------|
| Hero Headline | Cormorant Garamond | 64px | 300 | 95% | -0.03em | max-width: 860px |
| Section Headline | Cormorant Garamond | 48px | 300 | 100% | -0.02em | Left column or full-width |
| CTA Headline | Cormorant Garamond | 42px | 300 | 110% | -0.02em | Centered closing sections |
| Section Label | DM Sans | 11px | 600 | 14px | 2px | uppercase, color: ice-blue |
| Card Title / H3 | DM Sans | 18px | 600 | 140% | 0 | Service names, team names |
| Body | DM Sans | 15px | 400 | 165% | 0 | max-width: 520px |
| Nav Link | DM Sans | 14px | 500 | 100% | 0 | color: navy |
| Caption | DM Sans | 13px | 400 | 150% | 0 | color: muted |
| Stat Number | Cormorant Garamond | 48px | 300 | 100% | -0.02em | color: navy |
| Stat Label | DM Sans | 11px | 600 | 14px | 2px | uppercase, color: muted |
| Price | DM Sans | 16px | 600 | 100% | 0 | color: navy, right-aligned |
| Footer Link | DM Sans | 14px | 400 | 160% | 0 | color: muted |
| Section Counter | DM Sans | 12px | 500 | 100% | 1px | color: muted, `[ 01 /06 ]` |

### Typography Principles
- **Light serif headlines:** Cormorant Garamond at 300 is the typographic signature. Like Firecrawl's Suisse at light weight, the headlines don't shout — they command through proportion and whitespace.
- **Geometric sans body:** DM Sans handles everything that isn't a headline. Its geometric letterforms complement Cormorant's classical structure.
- **Two-font discipline:** No third font. No monospace. No display face for decorative moments. Two families, strictly applied.
- **Progressive tracking:** Negative letter-spacing at display sizes (-0.03em at 64px, -0.02em at 48px), normal at body sizes.

---

## 4. Component Stylings

### Navigation Bar
- Height: 68px
- Background: `#FFFFFF`
- Bottom accent: 4px solid `#173559` strip below nav
- Logo: left-aligned, icon + "Exploration Sites" wordmark
- Links: DM Sans 14px/500, color `#173559`, centered
- CTA: "Inquire" button, right-aligned
- Sticky behavior: white background with subtle border-bottom on scroll

### Primary Button
- Background: `#173559`
- Text: `#FFFFFF`, DM Sans 15px/600
- Padding: 14px 32px
- Border-radius: 6px
- Box-shadow: `#9ECDE426 0px 0px 0px 3px, #9ECDE440 0px 0px 12px`
- Hover: lighten background slightly, intensify glow

### Secondary Button
- Background: transparent
- Border: 1.5px solid `#173559`
- Text: `#173559`, DM Sans 15px/500
- Padding: 14px 32px
- Border-radius: 6px
- Hover: background shifts to `#F5F5F5`

### Text Link / Arrow Link
- Text: `#173559`, DM Sans 15px/500
- Suffix: ` →` arrow character
- Underline: 1px solid on hover
- Use: "View Maps pricing →", "See all clients →"

### Cards
- Background: `#FFFFFF`
- Border: 1px solid `#E8E8E8`
- Border-radius: 8px
- Padding: 24px
- Shadow: none (flat, minimal — Firecrawl-style)
- Hover: border color darkens to `#CCCCCC`

### Content Row (Service/Price List)
```
┌──────────────────────────────────────────────┐
│  Title        DM Sans 18px/600         Price │
│  Description  DM Sans 13px/400, muted        │
├──────────────────────────────────────────────┤  ← 1px #E8E8E8
```
- Height: ~83px per row
- Padding: 16px 0
- Title and price on same baseline, description below

### Section Divider
- 1px solid `#E8E8E8`
- Width: 1280px (content width, not full bleed)
- Centered in 1440px frame

### Stat Block
```
500+              Cormorant Garamond 48px/300, navy
PROJECTS COMPLETED   DM Sans 11px/600, uppercase, muted
```
- Arranged in a horizontal row of 3-4 stats
- Separated by implicit column gaps (no visible dividers)

### Pricing Tier Card
- Background: `#FFFFFF`
- Border: 1px solid `#E8E8E8`
- Border-radius: 8px
- Padding: 32px
- "Most Popular" badge: `#173559` background, white text, 4px radius, positioned top-center
- Price: DM Sans 36px/700, color navy
- Rate: DM Sans 14px/400, color muted
- Features: DM Sans 14px/400, bullet list

### Form Elements
- Input border: 1px solid `#E8E8E8`
- Border-radius: 6px
- Padding: 14px 16px
- Focus: border-color `#9ECDE4`, box-shadow `#9ECDE426 0 0 0 3px`
- Label: DM Sans 11px/600, uppercase, letter-spacing 2px, color navy
- Placeholder: DM Sans 15px/400, color `#AAAAAA`

### Callout Block (e.g. "Rush Available")
- Background: `#F5F5F5`
- Border-left: 3px solid `#9ECDE4`
- Padding: 20px 24px
- Border-radius: 0 6px 6px 0
- Title: DM Sans 16px/600, navy
- Body: DM Sans 14px/400, body

---

## 5. Layout Principles

### Page Frame
- Artboard width: 1440px
- Horizontal padding: 80px per side
- Content area: 1280px
- Background: `#FFFFFF`

### Firecrawl Section Pattern
Every major page section follows this structure:

```
┌──────────────────────────────────────────────────────┐
│  [ 01 /06 ] · Section Counter (optional)             │
│                                                      │
│  80px padding                                   80px │
│                                                      │
│  ┌─ Left (380px) ──┐  ┌─── Right (840px) ───────┐   │
│  │ SECTION LABEL    │  │ Content rows / cards     │   │
│  │ 11px DM Sans     │  │ 1px rules between items  │   │
│  │ uppercase         │  │                          │   │
│  │ ice-blue          │  │                          │   │
│  │                   │  │                          │   │
│  │ Headline          │  │                          │   │
│  │ 48px Cormorant   │  │                          │   │
│  │ navy              │  │                          │   │
│  │                   │  │                          │   │
│  │ Description       │  │                          │   │
│  │ 15px DM Sans     │  │                          │   │
│  │ body-text         │  │                          │   │
│  └──────────────────┘  └─────────────────────────┘   │
│                                                      │
│  ──────────── 1px #E8E8E8 divider ───────────────    │
└──────────────────────────────────────────────────────┘
```

### Section Numbering
Firecrawl uses `[ 01 /07 ]` counters to give pages an editorial, almost magazine-like structure. For Exploration Sites, use these sparingly — on the home page and pricing page where the numbered progression reinforces a logical flow. Skip them on service-specific pages (Maps, Websites) where the content is self-contained.

### Hero Section Pattern
```
┌──────────────────────────────────────────────────────┐
│  Nav bar (68px)                                      │
│  4px navy accent strip                               │
│                                                      │
│  SECTION LABEL   · 11px uppercase, ice-blue          │
│  Hero Headline   · 64px Cormorant, navy              │
│  Subtext         · 15px DM Sans, body                │
│  [Primary CTA]  [Secondary CTA]                      │
│                                                      │
│  ──────────── 1px divider ───────────────            │
└──────────────────────────────────────────────────────┘
```

### CTA / Closing Section Pattern
```
┌──────────────────────────────────────────────────────┐
│                    centered                          │
│  Headline  · 42px Cormorant, navy                    │
│  Subtext   · 15px DM Sans, muted                     │
│  [Primary Button]                                    │
│                                                      │
│  ──────────── 1px divider ───────────────            │
└──────────────────────────────────────────────────────┘
```

### Footer Pattern
```
┌──────────────────────────────────────────────────────┐
│  Brand          Services       More        Contact   │
│  Company name   Maps           Clients     Phone     │
│  Tagline        Websites       Pricing     Email     │
│  Location       Presentations  Team                  │
│                 Movies         Contact               │
│                                                      │
│  ──────────── 1px divider ───────────────            │
│  © 2026 ...                    Legal disclaimer      │
└──────────────────────────────────────────────────────┘
```

### Spacing Scale (8px base)
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon gap |
| sm | 8px | Tight element spacing |
| md | 16px | Default gap between elements |
| lg | 24px | Section internal padding |
| xl | 40px | Between content groups |
| 2xl | 64px | Section top padding |
| 3xl | 80px | Page horizontal padding |
| 4xl | 120px | Between major page sections |

---

## 6. Depth & Elevation

Firecrawl's approach is almost entirely flat. Elevation comes from spatial hierarchy and typography scale, not shadows. Exploration Sites follows this philosophy:

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (default) | No shadow | All page sections, text blocks |
| Subtle lift | `0 1px 3px rgba(0,0,0,0.06)` | Nav on scroll, dropdowns |
| Button glow | `#9ECDE426 0 0 0 3px, #9ECDE440 0 0 12px` | Primary button only |
| Card border | `1px solid #E8E8E8` | Cards, pricing tiers, mega menu items |

**Shadow Philosophy:** Shadows are almost nonexistent. Structure comes from whitespace, typography hierarchy, and 1px rules. The only real "glow" effect is on the primary CTA button, where the ice-blue halo creates a cold, mineral luminance — like light refracting through quartz.

---

## 7. Do's and Don'ts

### Do
- Use Cormorant Garamond weight 300 for all headlines — lightness is the signature
- Use DM Sans for everything else — body, labels, nav, buttons, captions
- Apply the two-column (380/840) layout pattern for all content sections
- Use 1px `#E8E8E8` rules as section dividers — they're the structural backbone
- Keep the palette to navy + ice blue + grays — no warm colors
- Use section labels (11px uppercase DM Sans in ice blue) to introduce every section
- Maintain 80px horizontal padding consistently
- Use `[ 01 /06 ]` section counters on editorially structured pages

### Don't
- Don't use bold (700) weight on Cormorant Garamond — weight 300 only
- Don't introduce new colors — no greens, oranges, or purples
- Don't use shadows on content sections — use 1px borders and whitespace
- Don't use card-heavy layouts — prefer flat list rows with rules
- Don't center body text — left-align within the two-column grid
- Don't use decorative elements (gradients, illustrations, patterns)
- Don't use pill-shaped buttons (high border-radius) — keep 6-8px
- Don't mix fonts — only Cormorant Garamond and DM Sans

---

## 8. Page Architecture

### Home
1. Hero (headline + CTAs)
2. Services overview (6 rows)
3. Stats bar (4 metrics)
4. How we work (3 principles)
5. Social proof (headline + CTA)
6. Footer

### Service Pages (Maps, Websites, etc.)
1. Hero (service headline + description)
2. Offerings (two-column list with prices)
3. CTA closing section
4. Footer

### Pricing
1. Hero (headline + qualifier)
2. À la carte services (grouped by category)
3. Launch package (bundled offering)
4. Monthly retainers (3 tier cards)
5. CTA closing section
6. Footer

### Team
1. Hero (headline + description)
2. Team members (photo + bio rows)
3. CTA closing section
4. Footer

### Contact
1. Hero (headline + description)
2. Contact form + timelines sidebar
3. Footer (expanded with sitemap)

---

## 9. Agent Prompt Guide

### Quick Reference
- Hero headline: `font-family: "Cormorant Garamond"; font-size: 64px; font-weight: 300; line-height: 95%; letter-spacing: -0.03em; color: #173559;`
- Section headline: `font-family: "Cormorant Garamond"; font-size: 48px; font-weight: 300; line-height: 100%; letter-spacing: -0.02em; color: #173559;`
- Section label: `font-family: "DM Sans"; font-size: 11px; font-weight: 600; line-height: 14px; letter-spacing: 2px; text-transform: uppercase; color: #9ECDE4;`
- Body text: `font-family: "DM Sans"; font-size: 15px; font-weight: 400; line-height: 165%; color: #888888;`
- Primary button: `background: #173559; color: #FFFFFF; font-family: "DM Sans"; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 6px; box-shadow: #9ECDE426 0px 0px 0px 3px, #9ECDE440 0px 0px 12px;`
- Card: `background: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 8px; padding: 24px;`
- Page frame: `width: 1440px; padding: 0 80px; background: #FFFFFF;`
- Section divider: `width: 1280px; height: 1px; background: #E8E8E8;`
