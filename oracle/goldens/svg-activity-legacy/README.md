# svg-activity-legacy conformance ratchet

Regression-proof gate for the legacy activity engine (`net/sourceforge/plantuml/activitydiagram/`, the `(*) -->`
syntax; mission `legacy-activity-engine-port`, #123), mirroring `oracle/goldens/svg-board/` in procedure and
`oracle/goldens/svg-description/` in layout. A fixture ratchets in once it renders byte-for-byte identical to the jar
oracle under a **deterministic** text measurer; the ratchet test then holds it forever. See
`tests/oracle/svg-conformance/activity-legacy.golden.ratchet.test.ts`.

## Population

The 124 legacy rows of `plans/legacy-activity-engine-port/measurements/planning-rows.json`, from three survey buckets:
118 in `activity`, 4 in `unknown`, 2 in `network`. Each pin carries `type` (its bucket) and lives at
`<type>/<slug>/{in.puml,golden.svg}`. All 124 are pinned, so there is no `diff-baseline.json`.

## Add rule

```
npm run svg:survey -- <bucket> --out /tmp/x/parity-<bucket>.json   # copy over tests/oracle/svg-conformance/parity-<bucket>.json
npx jiti plans/legacy-activity-engine-port/measurements/pin-legacy.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<type>/<slug>/`, adds `{ slug, type, addedAt, source }` to `ratchet.json`,
and appends `goldens` twins (slug `<type>/<slug>`) to the routing and refusal baselines.

## Authored root

`tests/fixtures/activity-legacy/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered
by `scripts/oracle-render.sh` (laep D6). `authored-baseline.json` tracks them
(`activity-legacy.diff-baseline.ratchet.test.ts`): rows = the `.puml` files on disk, disjoint from the cached slugs;
`weightedScore` never rises; a nonzero row is either a jar error page where we also error (conformant by the
2026-10-10 ruling, with its `jarError`) or a row the jar draws whose `reason` names its end: #157, #158, or the
library-forced Smetana delta. Re-measure:
`npx jiti plans/legacy-activity-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## DOT parity

`oracle/goldens/activity-legacy/<slug>/` holds `input.puml` and the jar's `svek-N.dot` for every row whose layout
graphs are structurally EQUAL (`tests/oracle/activity-legacy-dot-parity.test.ts`), pinned by
`plans/legacy-activity-engine-port/measurements/pin-legacy-dot.mts`.
