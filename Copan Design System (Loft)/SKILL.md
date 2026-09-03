---
name: loft-design
description: Use this skill to generate well-branded interfaces and assets for Loft, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping with the Copan design system.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

Key files:
- `README.md` — brand context, voice, visual foundations, iconography
- `colors_and_type.css` — drop-in CSS custom properties for all color + type tokens
- `preview/*.html` — small reference cards for each foundation + component
- `ui_kits/marketing-site/` — click-through recreation of Loft's browse/search surface
- `assets/` — logos and imagery

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Reference `colors_and_type.css` via `<link>` rather than inlining tokens. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions about surface (marketing vs transaction vs seller dashboard), locale (default pt-BR), and audience, and act as an expert designer who outputs HTML artifacts or production code, depending on the need.

**Non-negotiables for Copan work:**
- Inter only — no serifs, no secondary display face
- Orange `#F56738` is the only CTA color; never purple or green CTAs
- Sentence case in pt-BR; no emoji in product
- Cards get either a 1px `#E1E9EF` border OR `elevation-raised` shadow — never both
- No gradients in product UI (marketing hero is the single exception)
