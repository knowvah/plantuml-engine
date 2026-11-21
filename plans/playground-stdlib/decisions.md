# Decisions (playground-stdlib)

## Auto-confirmed (unattended)

Planned unattended on 2026-11-21. Each decision below is the planner's recommendation, recorded with the rejected options
and the evidence so the maintainer can audit it.

### D1: register exactly what the workspace packages ship

- **Decision.** The playground registry covers `C4`, `archimate`, `cloudinsight`, `cloudogu`, `bootstrap`,
  `bootstrap1.13.1` (eager), and `awslib14`, `awslib`, `tupadr3` (remote). No other bundle.
- **Evidence.** `scripts/build-stdlib-packages/package-specs.ts` (`PACKAGE_SPECS`). si5b D2
  (`plans/si5b-stdlib/decisions.md:13-27`, maintainer-confirmed) publishes only this audited set. It keeps the rest
  "captured-only until their licenses are read", explicitly defers legacy `aws` v1, and keeps `adaml` (GPL) out of every
  MIT artifact.
- **Rejected.**
  - (b) Serve all of `assets/stdlib/` (285 MB, 34 bundles) on the docs site. That republishes unaudited and GPL bundles,
    which contradicts D2.
  - (c) Eager bundles only. That drops two packaged bundles, and the long tail is the deliverable.
- **Consequence.** The issue's literal repro (`<aws/common>`) still fails after this mission. T1 keeps it as a
  `test.fixme`, and T5 files a `needs-ruling` issue asking whether `aws` v1 should be packaged or served.

### D2: self-host remote assets under `/stdlib/<bundle>/`, copied by a docs-site script

- **Decision.** `docs-site/copy-stdlib-assets.mjs` copies `packages/stdlib-aws/assets/awslib14/` and
  `packages/stdlib-tupadr3/assets/tupadr3/` byte-for-byte into `docs-site/public/stdlib/` (gitignored), together with
  each package's `LICENSE*` and `LICENSES.md`. Registry thunks pass `baseUrl` = `` `${import.meta.env.BASE_URL}stdlib/<bundle>/` ``.
  It runs as `npm run docs:stdlib`, which `docs:dev` and `docs:build` call. The package `assets/` come from each
  package's own `copy-assets` script (`packages/stdlib-aws/scripts/copy-assets.mjs`), so the docs script never decides
  what a bundle contains.
- **Evidence.**
  - `docs-site/copy-brand-assets.mjs` + `npm run docs:brand` are the existing pattern for copying a package's files
    into `public/`.
  - `docs/stdlib-remote.md` documents "Recipe: self-hosted assets".
  - The si5b D3/D4 licence terms require a verbatim copy with the licence text alongside it. CC BY-ND 2.0 §4(a) applies
    to awslib14 (`planning/s4-stdlib-audit.md:162-170`).
- **Rejected.**
  - (b) A pinned CDN. The packages are not on npmjs yet, and si11a ADR-4 forbids a default CDN.
  - (c) A Vite plugin with dev middleware plus a `buildEnd` copy. That is two code paths for one job, unlike the existing
    pattern.

### D3: `prepareIncludeStore` + `renderSync`, sequenced, in a pure tested module

- **Decision.** `docs-site/.vitepress/theme/playground-render.ts` exports the registry factory and a render sequencer.
  `Playground.vue` stays a thin shell.
  - Each render awaits `prepareIncludeStore(src, { stdlibRegistry })` and then calls `renderSync(src, { includeStore })`.
  - A monotonically increasing request id drops every result except the newest.
  - `StdlibChunkLoadError` becomes `error` text.
  - Any other rejection falls back to `await render(src, { stdlibRegistry })`, which returns the library's own error
    page (`src/index.ts:386-399` catches into `errorSvg`).
  - Every thunk uses a static specifier (`StdlibRegistry.ts:18-22`, si8 ADR-3), so bundlers split each one into its own
    chunk.
- **Evidence.**
  - The issue's step 3 asks for exactly this.
  - `render()` alone would turn a chunk failure into an error SVG, and the issue wants the text in `error`.
  - testability.md: decisions live in pure functions, and effects stay in the shell.
- **Rejected.**
  - (b) `render()` for everything. It hides `StdlibChunkLoadError`.
  - (c) Logic inline in the SFC. It is untestable under vitest, and `docs-site/` is not linted.

### D4: the docs build requires the stdlib packages built

- **Decision.**
  - `docs.yml` and the `ci.yml` `e2e` job run `./.github/actions/vendored-stdlib`, then `npm run build:stdlib`, then the
    two packages' `copy-assets`, then `docs:build` or `test:e2e`.
  - No runtime fallback when `generated/` is missing. Vite fails to resolve the import, and that failure is the signal.
  - Raise `docs.yml`'s `timeout-minutes` (currently 5) only with a cited measurement of the vendored-stdlib step from an
    existing `ci.yml` run (`gh run view --json jobs`).
- **Evidence.**
  - The issue's step 5.
  - `packages/*/generated/` is gitignored (`.gitignore:73-75`).
  - Every contributor already needs the vendored tree, because vitest's globalSetup builds the packages
    (`vitest.config.ts:29`).
- **Rejected.**
  - (b) Commit `generated/`. That contradicts si5b and `.gitignore:73-75`.
  - (c) Conditional thunks that tolerate a missing package. That is a fallback for a state CI never ships.

### D5: sprites and `assetStore` are measured, not built here

- **Decision.** T5 renders archimate-sprite and emoji fixtures through the playground path and through the oracle.
  - If the playground diverges where the jar draws artwork, T5 files a follow-up issue for a browser-side asset prefetch,
    the async counterpart of `remote-image-prefetch.ts`.
  - This mission does not add that library API.
- **Evidence.**
  - The issue's step 4 says "Decide whether…, and check against an oracle render".
  - `AssetStore` is synchronous (`src/core/render-options.ts:58-59`). No async browser prefetch for sprite or emoji assets
    exists in `src/` (grep 2026-11-21), so filling one is new `src/` API, which is separable.
- **Rejected.** (b) Build the prefetch in this mission. It changes the published API (stop 1), and it is genuinely
  separable.

## Operational readiness

- **Observability.** N/A: a static docs site, with no server-side operation. The user-visible signals are the `error`
  pane (`StdlibChunkLoadError`) and the library's error page.
- **Rollback.** Reversible: revert the squash commit, and the next docs deploy restores the old playground.
- **Scale.** Every request is static GitHub Pages traffic. The per-bundle chunks load lazily. The worst first-use cost is
  `tupadr3.remote.js` (~436 KB manifest) plus one `.puml` fetch per include.
- **On-call.**
  - A chunk 404s after a deploy: the `error` pane shows `StdlibChunkLoadError`. Mitigation: rerun the Docs workflow.
  - `/stdlib/<bundle>/…` 404s, because the copy step was skipped: the library's include error page shows. Mitigation:
    check that the Docs build ran `docs:stdlib`.
  - A docs build fails on an unresolved `@knowvah/plantuml-stdlib*` import: `build:stdlib` did not run. See D4.
- **Backwards compatibility.** No API or schema change. The playground's behaviour changes only for sources with
  `!include <…>`.
