## Observation: VitePress builds `.md` files under `public/` as pages
- **Context**: `docs-site/copy-stdlib-assets.mjs` copies each stdlib package's `LICENSES.md` into `docs-site/public/stdlib/<bundle>/`.
- **Finding**: `docs:build` exited 1 with dead links from `public/stdlib/*/LICENSES.md`: VitePress page discovery includes `public/**`. Fixed with `srcExclude: ['public/**']` in `docs-site/.vitepress/config.ts`; Vite still serves public files verbatim.
- **Impact**: Anything copied into `docs-site/public/` with a `.md` extension is safe now; removing `srcExclude` reintroduces the failure.
- **Confidence**: High
