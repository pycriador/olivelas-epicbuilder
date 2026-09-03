# Copan — Loft Design System

**Copan** is the design system that powers Loft's digital products. Loft is a Brazilian proptech that buys, renovates, and resells apartments, and operates a marketplace for rentals and purchases across São Paulo and Rio de Janeiro.

This project is the canonical design reference: foundations (color, type, spacing, elevation), components, and a UI kit recreation of the marketing/search surface.

## Sources

- **Figma**: `Copan-Foundation.fig` (mounted as a virtual filesystem in this project). 14 pages: Capa · Atualizações · Leia-me · Brand-assets · Colors · Typography · Elevation · Border-Radius · Spacing · Grid · Shapes · Draft · Estudo-cores · z.Lib-Components.
- **No live codebase was attached** — everything here was reconstructed from the Figma pseudocode (`fig_read`). Treat JSX values as authoritative, screenshots as rough reference.

## Index

```
README.md                ← you are here
SKILL.md                 ← Agent-Skill manifest for Claude Code
colors_and_type.css      ← base + semantic tokens (CSS vars)
assets/
  logo-loft.svg          ← Loft wordmark (single path, currentColor)
  copan-avatar.png       ← Copan Building illustration (brand mascot)
fonts/
  (empty — see "Fonts / substitution" below)
preview/                 ← small HTML cards that power the Design System tab
ui_kits/
  marketing-site/        ← Loft.com.br homepage + search recreation
```

## Products represented

The Figma file is a foundation system, not a product surface. The Copan system ships across Loft's consumer surfaces:
1. **Marketing site / search** (`loft.com.br`) — browse and filter apartments for sale or rent. This is the surface reconstructed in `ui_kits/marketing-site/`.
2. **Transaction app** — propostas, financing, document upload (not reconstructed here — no source material was provided).

If you need UI kits for the transaction app, ask the user to attach the relevant Figma pages or codebase.

---

## CONTENT FUNDAMENTALS

**Language.** Primary locale is **pt-BR**. All product copy in the source file is in Portuguese; keep any English strings to true brand names ("Loft", "Copan Foundation").

**Person.** Second-person singular: "você", imperativo gentil ("Encontre seu próximo lar", "Agende sua visita"). Never "Sr./Sra." or "nós"; rarely first-person plural ("na Loft") when needed for clarity about the company.

**Casing.** Sentence case for all UI — buttons, headings, titles. Title Case only for proper nouns (neighborhood names, "São Paulo", "Pinheiros"). ALL CAPS is reserved for `overline` (10/16 · +8% tracking); never used in running copy.

**Tone.**
- Direct and factual. "Apartamento em Pinheiros · 62m² · 2 quartos" — not "O lar dos seus sonhos te espera!".
- Quiet confidence. State what's true; don't sell.
- Human, not corporate. Short sentences. Prefer verbs over nouns.
- No exclamation points in product surfaces (marketing hero lines are the single exception, and only one per page).

**Punctuation & numerics.**
- Currency: `R$ 1.245.000` — thin-space separators, no trailing cents for whole values.
- Area: `62m²` with the superscript, no space.
- Rooms/bathrooms: `2 quartos · 1 banheiro` — middle-dot separator between inline metadata.
- Dates: `18 abr 2026` — lowercase abbreviated month.

**Emoji.** Never in product UI. Never in marketing hero. Acceptable in internal comms and in speaker-notes for internal decks only.

**Example copy (from Figma / brand voice):**
- ✅ "Encontre seu próximo lar com a Loft."
- ✅ "Moradia pronta para morar hoje."
- ✅ "Apartamentos reformados em locais privilegiados."
- ❌ "🚀 Revolucione sua busca por imóveis! 🏠"
- ❌ "A Loft é a melhor proptech do Brasil!!!"

---

## VISUAL FOUNDATIONS

**Color vibe.** Warm orange primary (`#F56738`) against cool slate-grey neutrals. The orange is energetic but grounded — it's the brick-and-sunset orange of São Paulo rooftops, not a fluorescent CTA. Neutrals skew slightly cool-blue (`#EDF6FC`, `#E1E9EF`) which makes the orange pop without feeling cheap. Never a gradient-heavy brand; orange and near-black do the heavy lifting.

**Type.** **Inter** only. Bold for display and labels, regular for body. Tight negative tracking on display sizes (`-2%` at H1/H2, `-1%` at H3/H4). The Figma file officially said "apenas a família Inter" ("Inter only"). Body and display both flow in the same family — there is no display/serif contrast.

**Backgrounds.**
- White and `#F2F4F8` subtle grey are the dominant background pair.
- No gradients in the product. Marketing hero may use a gentle duotone over hero photography.
- Photography is full-bleed and warm-biased (interior daylight, beige/wood/terracotta tones). Never cool blue-filter photography. Never illustration-primary — illustrations are supporting only.
- No repeating patterns or textures. Surfaces are flat.

**Animation.** Conservative. 150–200ms ease-out for hover; 200–300ms for sheet/modal slide-ins. No bounces. No springs. No parallax. The system prefers "calm" over "delightful".

**Hover states.**
- Primary button: fill shifts from Orange 550 (`#F56738`) to Orange 600 (`#D94616`).
- Outline button: background fills to `#F2F4F8`, border stays.
- Links: color stays Green 500 but underline gets heavier.
- Cards: elevation steps up one level, no scale transform.

**Press states.** Minus one elevation step and/or 4% darker fill. No scale animation.

**Borders.**
- `#E1E9EF` is the default subtle border.
- `#C1C7CD` for form inputs and stronger dividers.
- `#121619` (near-black) for emphasis containers (outlined dark buttons, selected states).
- 1px is standard. 2px only on focused form fields (Orange 550).

**Shadows.** See `preview/spacing-elevation.html`. Six-step scale from `flat` (1px subtle line-shadow) to `popout` (24px blur, 12px y-offset). All shadows are neutral gray, never warm-tinted.

**Transparency & blur.** Used sparingly.
- `rgba(25,31,35,0.5)` modal backdrop, no blur by default.
- White `rgba(255,255,255,0.9)` chip over hero photography (e.g. favorite button on a listing).
- Never frosted-glass nav bars; the nav is solid white.

**Corner radii.** 0 / 4 / 8 / 12 / 24 / pill. 8px is the default for buttons and inputs. 12px for cards. 24px is reserved for hero callouts and the footer. Pill is reserved for filter chips and avatars.

**Cards.** White background, 12px radius, 1px `#E1E9EF` border OR `elevation-raised` shadow (pick one — not both). Padding 16–20px. Image slot on top when present, text below. No colored left-border stripe on cards.

**Layout rules.**
- Desktop content max-width: 1232px, centered, 24px side gutter.
- 8-pt grid; layout-scale (16 · 24 · 32 · 48 · 64 · 96 · 120) for section rhythm.
- Header is 72px tall, sticky at the top, solid white, 1px bottom border.
- Footer is `#121619` (near-black) with white text.

**Iconography.** Stroke-only, 1.5–2px weight, rounded line caps. 16px and 20px and 24px canvas. See ICONOGRAPHY section below.

---

## ICONOGRAPHY

Copan uses **line icons** at 1.5–2px stroke weight with **rounded line caps**. 16/20/24px canvases. Icons inherit `currentColor` so they tint with the surrounding text.

The Figma file references library icons (`/external-shared/SizeMedium16`, `SizeMedium23`, etc.) without shipping a dedicated icon set. The nearest public CDN match by stroke weight and style is **[Lucide](https://lucide.dev)** (2px stroke, rounded caps, square corners) — this is what the UI kit uses.

```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="search"></i>
<script>lucide.createIcons();</script>
```

**Substitution flag.** ⚠️ This is a CDN substitution, not the production Loft icon set. If you have access to the real Loft icon font/sprite, drop it into `assets/icons/` and update `ui_kits/marketing-site/components/Icon.jsx`.

**Logos copied.**
- `assets/logo-loft.svg` — the Loft wordmark, single path, `currentColor` fill. Renders at any size.
- `assets/copan-avatar.png` — Copan Building illustration used on the Figma cover.

**Emoji.** Never in product UI.

**Unicode as icons.** Sparingly. Middle-dot `·` as inline separator; `×` as a close affordance within tags; `→` for link affordances in marketing copy. Everything else is an SVG.

---

## Fonts / substitution

**The system prescribes Inter everywhere.** The repo ships the official Inter **variable** font files (TTF) in `fonts/`:

- `fonts/Inter-VariableFont_opsz_wght.ttf` — roman, optical-size + weight axes (100–900)
- `fonts/Inter-Italic-VariableFont_opsz_wght.ttf` — italic, optical-size + weight axes

`colors_and_type.css` declares `@font-face` for both at the top of the file; anything that imports the stylesheet inherits it. No Google Fonts link is needed.

⚠️ **Substitutions flagged:**
- The Figma file occasionally references `Helvetica Now Text` and `Helvetica Now Display` (licensed, not open). Inter covers both roles officially per the Figma guidelines ("apenas a família Inter"). If Helvetica Now is actually in production use, attach the `.woff2` files and I'll add an `@font-face` block.
- JetBrains Mono is used for code only. Loaded from CDN if needed.

---

## UI Kits

| Product | Path | Status |
|---|---|---|
| Marketing site / search (`loft.com.br`) | `ui_kits/marketing-site/` | Reconstructed from Copan foundations + brand voice. Click-through: home → search results → property detail. |

The transaction app, mortgage simulator, and seller dashboard are referenced in brand copy but no source material was provided — ask the user to attach those Figma pages to extend the system.
