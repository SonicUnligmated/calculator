This README is AI-generated.

Open the Quantifier-30 Calculator interface.

https://ancient7999.github.io/calculator/

# Quantifier-30 Calculator

Standalone, reusable Quantifier-30 calculator package with a full visual theme, **colorizer** (accent presets / strength / light mode), WebGL particle field, and **calculator canvas overlays** (`mix-blend-mode: screen`) so particles show through the display and solar panel.

## Local demo (optional)

```bash
cd calculator-repo
npm run check          # syntax smoke test
npm start              # http://localhost:8765
```

Or open `index.html` in a browser. You should see:

- Floating **Quantifier-30** calculator (TI-30XS-style layout)
- Animated wallpaper wave on the calc body
- Particle field behind the page
- Particle glows mirrored onto `#calcOverlayDisplay` / `#calcOverlaySolar` (canvas transparency)
- ⚙ **Colorizer** to change accent color / strength / presets

## Consume from another repo

### Option A — copy / submodule / npm file link

1. Copy or vendor this folder (or publish later as a package).
2. In your page:

```html
<link rel="stylesheet" href="path/to/calculator-repo/css/theme-vars.css">
<link rel="stylesheet" href="path/to/calculator-repo/css/calculator.css">
<link rel="stylesheet" href="path/to/calculator-repo/css/colorizer.css">
<!-- optional: omit colorizer.css + colorizer-theme.js if you only want calc chrome -->

<!-- paste calculator markup from assets/calculator.fragment.html -->

<script src="path/to/calculator-repo/js/particles.js"></script>
<script src="path/to/calculator-repo/js/colorizer-theme.js"></script>
<script src="path/to/calculator-repo/js/calculator-core.js"></script>
```

Script order matters: **particles → colorizer-theme → calculator-core**.

### Option B — theme only (your own chrome)

Load `theme-vars.css` + `calculator.css` + `calculator-core.js` and set CSS variables on `:root` (or a wrapper) yourself. Skip particles/colorizer if you do not need the canvas effects.

## Theming (for consumers — no fork of calc logic)

All presentation hooks are CSS custom properties in `css/theme-vars.css`:

| Variable family | Role |
| --- | --- |
| `--accent-0` … `--accent-9` (+ `-rgb`) | Primary accent ramp (colorizer updates these) |
| `--col-*` | Neutrals, success/error, backgrounds |
| `--bg-tint-color` | Page tint from colorizer |
| `--label-y` | 2nd-label “reset” color on `0` key |
| `--radius-*`, `--font-*` | Shared scale |

**Override without touching JS:**

```css
:root {
  --accent-0: #66ffcc;
  --accent-0-rgb: 102, 255, 204;
  /* …or call window.changeAccentColor('#66ffcc', 70) after colorizer loads */
}
```

**Programmatic theming API:**

```js
changeAccentColor('#8833ff', 32);
applyPreset('#ff8800', false);       // standard Amber
applyPreset('#000000', false, 90);   // Obsidian
```

Light mode: toggle class `light-mode` on `<html>` (or use the light-mode toggle in the colorizer panel).

Calculator chrome (borders, button fills, wallpaper wave, scanlines, glow) reads these variables — **logic stays in `js/calculator-core.js`**.

## Package layout

```
calculator-repo/
  index.html                 # standalone demo (theme + colorizer + calc)
  css/
    theme-vars.css           # :root tokens + light-mode map
    calculator.css           # calc widget visuals / animations / overlays
    colorizer.css            # settings UI + particle layer CSS
  js/
    calculator-core.js       # engine (eval, fractions, 2nd, keys, drag)
    particles.js             # WebGL particles + updateOverlayCanvases
    colorizer-theme.js       # accent engine + presets UI wiring
  assets/
    calculator.fragment.html
    colorizer-panel.fragment.html
  FEATURE_CHECKLIST.md       # feature verification checklist
  package.json
  README.md
```

## API notes / host integration

- Show/hide: `#calculator-widget` `style.display = 'block'|'none'`
- Drag: `startDragCalc` / `startDragCalcTouch` (already on widget attributes)
- Keyboard works while widget `display:block` and `lastInputTarget === 'calc'`
- State persistence keys (kept for compatibility): `atc_calc_state`, `atc_calc_pos`, `atc_theme_color_v1`, `atc_accent_strength`, `atc_custom_presets`, …
- Host helpers stubbed for standalone use: `_isMobileQuiz`, formula generators (demo stubs so particles still spawn sample text)

## Smoke tests

- `npm run check` — JS syntax OK
- Structural grep: required IDs/classes/canvas present in demo
- Headless browser visual parity **not** fully verified here (WebGL + blend modes need a GPU browser)
