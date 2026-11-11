# svg-ebnf conformance ratchet

Regression-proof gate for the EBNF engine (`net/sourceforge/plantuml/ebnf/`, `@startebnf`; mission
`ebnf-engine-port`, #125), laid out flat as `oracle/goldens/svg-board/` is (eep D9). A fixture ratchets in once it
renders byte-for-byte identical to the jar oracle under a **deterministic** text measurer; the ratchet test then holds
it forever. See `tests/oracle/svg-conformance/ebnf.golden.ratchet.test.ts`.

## Population

The 44 `@startebnf` rows of `plans/ebnf-engine-port/measurements/planning-rows.json`, all in the `ebnf` survey bucket.
The 43 the jar draws are pinned at `<slug>/{in.puml,golden.svg}` in `ratchet.json`. The one the jar draws as an error
page (`ladifa-97-keme950`, where we error too: ruling 2026-10-10) cannot be zero-diff: `diff-baseline.json` pins its
score with the jar's `{ line, message }`.

## Add rule

```
npm run svg:survey -- ebnf --out /tmp/x/parity-ebnf.json   # copy over tests/oracle/svg-conformance/parity-ebnf.json
npx jiti plans/ebnf-engine-port/measurements/pin-ebnf.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<slug>/`, adds `{ slug, addedAt, source }` to `ratchet.json`, and appends
`goldens` twins (bare slug, as `svg-board`'s) to the routing and refusal baselines. The error row is re-measured by
`npx jiti plans/ebnf-engine-port/measurements/build-diff-baseline.mts <commit> [--write]`.

## Authored root

`tests/fixtures/ebnf/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered by
`scripts/oracle-render.sh` (eep D7). `authored-baseline.json` tracks them (`ebnf.diff-baseline.ratchet.test.ts`):
rows = the `.puml` files on disk, disjoint from the cached slugs; `weightedScore` never rises; a nonzero row is a jar
error page where we also error, with its `jarError`. Re-measure:
`npx jiti plans/ebnf-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

EBNF never reaches graphviz: its tiles lay themselves out (`ebnf/ETile*.java`), so there is no `svek-N.dot`.
