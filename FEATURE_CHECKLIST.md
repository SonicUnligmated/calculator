# Feature / effect checklist

Package: Quantifier-30 calculator (standalone demo + reusable assets).

## Verified present

| Status | Feature / effect |
| --- | --- |
| PRESENT | DOM: #calculator-widget |
| PRESENT | DOM: #calcWrapper / .calc-wrapper |
| PRESENT | DOM: #calcBody / .calc-body |
| PRESENT | DOM: #calcCosmicCanvas (preserved) |
| PRESENT | DOM: #calcOverlaySolar |
| PRESENT | DOM: #calcOverlayDisplay |
| PRESENT | DOM: .calc-theme-overlay |
| PRESENT | DOM: .solar-panel |
| PRESENT | DOM: .display-scanlines |
| PRESENT | DOM: #dspMain / #dspExpr / #errMsg |
| PRESENT | DOM: full button grid (2nd…enter) |
| PRESENT | DOM: nav pad (up/down/left/right/center) |
| PRESENT | DOM: info popup |
| PRESENT | DOM: colorizer settings modal |
| PRESENT | DOM: preset swatches |
| PRESENT | DOM: custom-presets-area |
| PRESENT | DOM: accent-strength-slider |
| PRESENT | CSS: calc body semi-transparent gradient |
| PRESENT | CSS: calcWallpaperWave animation |
| PRESENT | CSS: mix-blend-mode:screen on overlays |
| PRESENT | CSS: display isolation:isolate |
| PRESENT | CSS: scanlines repeating-linear-gradient |
| PRESENT | CSS: blink cursor keyframes |
| PRESENT | CSS: pulse2nd / errFlash |
| PRESENT | CSS: second-active label swap |
| PRESENT | CSS: frac / radical rendering styles |
| PRESENT | CSS: overwrite-cursor |
| PRESENT | CSS: calc-target-active glow |
| PRESENT | CSS: button hover brightness/press |
| PRESENT | CSS: theme CSS variables --accent-* |
| PRESENT | CSS: light-mode map |
| PRESENT | JS: evaluate / trig / log / hyp |
| PRESENT | JS: fractions FRAC_OPEN |
| PRESENT | JS: radicals RAD_OPEN |
| PRESENT | JS: 2nd mode / doButton |
| PRESENT | JS: doNav history/cursor |
| PRESENT | JS: keyboard KEY_MAP |
| PRESENT | JS: saveCalcState / restoreCalcState |
| PRESENT | JS: drag startDragCalc |
| PRESENT | JS: updateOverlayCanvases particle mirror |
| PRESENT | JS: WebGL particles alpha:true |
| PRESENT | JS: blendFunc SRC_ALPHA, ONE |
| PRESENT | JS: changeAccentColor colorizer |
| PRESENT | JS: applyPreset / custom presets |
| PRESENT | JS: hexToHsl / hslToHex ramp |

## Flags / intentional omissions

| Status | Item | Reason |
| --- | --- | --- |
| FLAGGED | DOM: calcCosmicCanvas drawing loop | Canvas element exists but no JS draws to it (dead placeholder). Preserved; visual transparency uses .calc-theme-overlay + updateOverlayCanvases instead. |
| FLAGGED | JS: globalBlobs metaballs | Referenced in older theme paths but never assigned. Stubbed null in package. |
| OMITTED-by-design | Quiz unlock / autoload / Tab↔answer-entry | Host-quiz features; stubs keep calc usable standalone. Tab switching to answer-input is no-op without #answer-input. |
| OMITTED-by-design | Cosmic roam / extra glow / SI prefixes UI | Extra settings not required for calculator+colorizer. Theme panel kept. |
| OMITTED-by-design | Full settings About/Data/Shortcuts panels | Colorizer Theme panel only; other settings panels not part of this package. |
| PRESENT-with-stub | Particle formula text spawners | Uses demo QUESTION_GENERATORS stub. Orbit particles + overlays still run. |

**MISSING count:** 0

## Smoke tests

- `npm run check`: PASS (all JS parse)
- Linked asset HTTP 200: PASS
- Required DOM IDs/classes/canvases in index: PASS (41 calc buttons, 3 canvases)
- Headless Chrome dump/screenshot: **NOT verified** (headless chrome hung in this environment; WebGL/blend visual parity needs a real GPU browser)
