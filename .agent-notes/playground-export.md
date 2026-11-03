# Playground SVG/PNG export (2026-11-03)

## Observation: blob: URL taints the canvas for math diagrams
- **Context**: porting dot-engine's playground export, which rasterizes the SVG
  through a `blob:` URL.
- **Finding**: math renders as `<image href="data:image/svg+xml;base64,...">`
  whose nested SVG holds a `<foreignObject>`. Chromium taints the canvas for that
  payload when the outer SVG is a `blob:` URL, and `toBlob` throws synchronously;
  the same markup through a `data:` URL is untainted and paints the math.
- **Impact**: any page rasterizing this library's SVG must use a `data:` URL.
  Firefox and WebKit were not measured (only Chromium is installed here).
- **Confidence**: High for Chromium; Unknown for other engines.

## Observation: root background survives rasterization
- **Context**: the jar-faithful root sets `background:` in its inline style; no
  background polygon is drawn, unlike dot-engine.
- **Finding**: Chromium paints that CSS background into the PNG (`#FFEECC` corner
  measured), and `skinparam backgroundColor transparent` gives alpha 0.
- **Impact**: PNG export needs no background fill.
- **Confidence**: High for Chromium.

## Observation: a webServer array removes Playwright's implicit baseURL
- **Context**: adding the docs dev server as a second `webServer` entry.
- **Finding**: `page.goto('/')` then fails with "Cannot navigate to invalid URL"
  in every existing spec. `baseURL` must be set explicitly in `use`.
- **Impact**: already handled in `playwright.config.ts`; keep it if entries change.
- **Confidence**: High.
