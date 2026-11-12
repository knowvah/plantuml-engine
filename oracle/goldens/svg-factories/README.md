# svg-factories conformance ratchet

Regression-proof gate for the creole, math, latex, definition, listsprite and
help factories (`PSystemBuilder.java:169` Definition, `:170` ListSprite, `:172`
Math, `:173` Latex, `:174` Creole, `:188` Help; missions
`creole-math-factories-port` and `listsprite-factory-port`), a copy of
`oracle/goldens/svg-utility/` in shape and procedure. A fixture ratchets in once
it renders byte-for-byte identical to the jar oracle under a **deterministic**
text measurer; the ratchet test then holds it forever. See
`tests/oracle/svg-conformance/factories.golden.ratchet.test.ts`.

## Population: a FIXED list, not a cache dir

The 43 rows are `FACTORIES_SLUGS` (`tests/oracle/svg-conformance/
render-fixture-factories.ts`; source
`plans/creole-math-factories-port/measurements/factory-rows.mjs`, plus the two
ListSprite rows of `plans/listsprite-factory-port/measurements/corpus-rows.mts`),
all in `test-results/dot-cache/unknown/`: 2 definition, 2 listsprite, 11 math,
2 latex, 21 creole and 5 help. Every tool reads and writes only those rows; the other `unknown` rows are
never touched.

## Rendering: the survey's options

Pins and baselines render with what `scripts/svg-parity-survey.ts`
(`surveyRenderOptions`) renders with: `DeterministicMeasurer`, jar-compatible
style input, the survey's asset store, `filename: 'in.puml'` and the recorded
capture clock where a row has one (`oracle/capture-clock.json`, e.g.
`firiru-71-viki803`).

## Pins and the baseline

`ratchet.json` pins the 19 rows that render zero-diff: both definition rows,
both listsprite rows, 11 creole rows and 4 help rows. `diff-baseline.json` carries the other 24 with
their weighted score: 11 math and 2 latex rows sit at their KaTeX glyph-group
residual, 10 creole rows at small residuals, and `cikoge-60-riti614` at its
help-font residual. None is an error page, so no row is recorded `error`. The
two manifests are disjoint and together cover the 43 slugs.

## Authored root

`tests/fixtures/factories/` is a flat tree of ORIGINAL fixtures (`<slug>.puml` +
the jar's `<slug>.svg` beside it, `cov-` prefix) tracked by
`authored-baseline.json` -- never by `diff-baseline.json`, `ratchet.json` or the
pin tools. Gates (`factories.diff-baseline.ratchet.test.ts`, "authored" blocks):
rows = the `.puml` files on disk, disjoint from the cached `unknown` slugs;
weightedScore never rises; a nonzero row names its mechanism; `jarError` rows
are exactly the jar error pages; we error exactly where the jar errors
(2026-10-10 rule); three renders per row are byte-identical.

Render an authored oracle with `scripts/oracle-render.sh <abs dir> <abs puml>`.
Regenerate the manifest from a fresh measurement (it refuses a nonzero row
without a mechanism):

```
npx jiti plans/listsprite-factory-port/measurements/build-authored-baseline.mts <commit> [--write]
```

## No DOT-parity gate

None of these factories shells out to Graphviz; the only eligibility condition
for a pin is byte-for-byte conformance under `DeterministicMeasurer`.

## Layout

```
oracle/goldens/svg-factories/
  ratchet.json                 <- the manifest (source of truth for CI)
  diff-baseline.json           <- weighted-score baseline (see above)
  authored-baseline.json       <- authored-root baseline (tests/fixtures/factories/)
  README.md                    <- this file
  <slug>/
    in.puml                    <- fixture source (committed, offline)
    golden.svg                 <- jar SVG, copied verbatim from
                                   test-results/dot-cache/unknown/<slug>/in.svg
```

## Add rule

A fixture may be added to `ratchet.json` only when it is **conformant**:
`renderFixtureFactories` (`renderSync` under the hood) with
`DeterministicMeasurer` is zero-diff
(`compareSvg(ours, golden, 'deterministic').pass === true`) against the jar's
`in.svg`.

**Pinning is orchestrator-only, at batch closes.** List what is ready, then pin:

```
npx jiti plans/creole-math-factories-port/measurements/pin-factories.mts --report
npx jiti plans/creole-math-factories-port/measurements/pin-factories.mts <slug>... \
  [--repo <root>] [--goldens <dir>]
```

`--report` prints the unpinned zero-diff rows and `pins N` (`pins 0` = complete).
Per slug the tool refuses anything outside `FACTORIES_SLUGS`, copies the cache's
`in.puml` and `in.svg` (renamed `golden.svg`) into `<goldens>/<slug>/`, re-reads
both copies and fails loudly unless byte-identical, then appends
`{ slug, addedAt, source: "dot-cache" }`. A slug already pinned is skipped.

After every pin run the twin-row tools (both the routing and refusal gates walk
`oracle/goldens/svg-<family>/` and demand a row per golden dir):

```
npx jiti plans/creole-math-factories-port/measurements/repin-factories-routing.mts [--write] [--label <text>]
npx jiti plans/creole-math-factories-port/measurements/repin-factories-baseline.mts [--write] [--accept-rises a,b]
```

`repin-factories-routing` re-pins only `tree: dot-cache, type: unknown` rows
whose slug is in `FACTORIES_SLUGS`, clones pinned twins as
`tree: goldens, type: svg-factories`, and REFUSES while any factories row still
misroutes or errors on our side. `repin-factories-baseline` regenerates
`diff-baseline.json` for the unpinned slugs and refuses any weightedScore rise
not named in `--accept-rises`. The same close removes the pinned slug's
`diff-baseline.json` row.

## Remove rule

Removal is **maintainer-only** (see `oracle/goldens/svg-description/README.md`).
