# Loft Marketing Site — UI Kit

Click-through recreation of Loft's browse/search surface (`loft.com.br`), built against the Copan foundations.

## Screens

1. **Home** — hero with search composer, featured listings grid, value propositions, footer.
2. **Search results** — filter rail + infinite grid of listings with map peek.
3. **Property detail** — photo gallery, specs, mortgage simulator CTA, proposal drawer.

## Files

- `index.html` — single-file app; boots React + Babel and orchestrates the 3 screens.
- `components.jsx` — all JSX components (Header, Footer, PropertyCard, SearchBar, FilterRail, etc.)
- `app.jsx` — top-level `<App>` with the mini-router and screen state.

## Usage

Open `index.html` directly in a browser or through a static server. The screen state persists to `localStorage` so refresh lands you back on the screen you left.

## Caveats

- Photography is represented by duotone gradient placeholders — swap for real Loft imagery when wired into production.
- The map peek is a stylized SVG; the real product uses Google Maps.
- All content is static; search and filters do not actually mutate results — they drive visual states only.
- Icons are from Lucide (CDN); substitute the production Loft icon font when available.
