# svg-timing conformance ratchet

Regression-proof gate for the timing engine (`net/sourceforge/plantuml/timingdiagram/`, `@startuml` timing sources
and `@starttiming`; mission `timing-engine-port`, #127), laid out flat as `oracle/goldens/svg-regex/` is (tep D12). A
fixture ratchets in once it renders byte-for-byte identical to the jar oracle under a **deterministic** text measurer;
the ratchet test then holds it forever. See `tests/oracle/svg-conformance/timing.golden.ratchet.test.ts`.

## Population

The 158 rows of `plans/timing-engine-port/measurements/planning-rows.json` that reach the timing engine: 145 in the
`timing` survey bucket and 13 the jar draws in the `unknown` bucket. The 152 the jar draws are pinned at
`<slug>/{in.puml,golden.svg}` in `ratchet.json`, each entry recording its `bucket` (`timing` or `unknown`; slugs are
unique across both). The six the jar draws as an error page (`stock-error-pages.json`, where we also draw an error
page: ruling 2026-10-10) cannot be zero-diff: `diff-baseline.json` pins their score with the jar's `{ line, message }`.

## Add rule

```
npm run svg:survey -- timing --out /tmp/x/parity-timing.json   # copy over tests/oracle/svg-conformance/parity-timing.json
npx jiti plans/timing-engine-port/measurements/pin-timing.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<slug>/`, adds `{ slug, bucket, addedAt, source }` to `ratchet.json`, and
appends `goldens` twins (bare slug) to the routing and refusal baselines. The error rows are re-measured by
`npx jiti plans/timing-engine-port/measurements/build-diff-baseline.mts <commit> [--write]`; the routing and refusal
rows of the corpus are re-measured by `repin-routing-refusal.mts <commit> [--write]`.

A row that reads the clock (`use date format`) renders with its recorded capture clock
(`oracle/capture-clock.json`, `timingClockFor`), on both the pin tool and the ratchet.

## Authored root

`tests/fixtures/timing/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered by
`scripts/oracle-render.sh` (tep D6). `authored-baseline.json` tracks them (`timing.diff-baseline.ratchet.test.ts`):
rows = the `.puml` files on disk, disjoint from the cached slugs; `weightedScore` never rises; a nonzero row is a jar
error page where we also draw one, with its `jarError`, or a named open row: `cov-embedded-state`, a timing `{{ }}`
inside a state note that the state engine draws as text (tep journal row 14). Re-measure:
`npx jiti plans/timing-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

Timing never reaches graphviz: the engine lays itself out (`timingdiagram/`), so there is no `svek-N.dot`.
