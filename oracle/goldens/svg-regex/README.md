# svg-regex conformance ratchet

Regression-proof gate for the regex engine (`net/sourceforge/plantuml/regexdiagram/`, `@startregex`; mission
`regex-engine-port`, #126), laid out flat as `oracle/goldens/svg-ebnf/` is (rep D7). A fixture ratchets in once it
renders byte-for-byte identical to the jar oracle under a **deterministic** text measurer; the ratchet test then holds
it forever. See `tests/oracle/svg-conformance/regex.golden.ratchet.test.ts`.

## Population

The 46 `@startregex` rows of `plans/regex-engine-port/measurements/planning-rows.json`, all in the `regex` survey
bucket. The 44 the jar draws are pinned at `<slug>/{in.puml,golden.svg}` in `ratchet.json`. The two the jar draws as
an error page (`bakuza-41-bulo451`, `tajefa-31-pefi801`, where we error too: ruling 2026-10-10) cannot be zero-diff:
`diff-baseline.json` pins their score with the jar's `{ line, message }`.

## Add rule

```
npm run svg:survey -- regex --out /tmp/x/parity-regex.json   # copy over tests/oracle/svg-conformance/parity-regex.json
npx jiti plans/regex-engine-port/measurements/pin-regex.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<slug>/`, adds `{ slug, addedAt, source }` to `ratchet.json`, and appends
`goldens` twins (bare slug, as `svg-ebnf`'s) to the routing and refusal baselines. The error rows are re-measured by
`npx jiti plans/regex-engine-port/measurements/build-diff-baseline.mts <commit> [--write]`.

## Authored root

`tests/fixtures/regex/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered by
`scripts/oracle-render.sh` (rep D6). `authored-baseline.json` tracks them (`regex.diff-baseline.ratchet.test.ts`):
rows = the `.puml` files on disk, disjoint from the cached slugs; `weightedScore` never rises; a nonzero row is a jar
error page where we also error, with its `jarError`. Re-measure:
`npx jiti plans/regex-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

Regex never reaches graphviz: its tiles are ebnf's, which lay themselves out (`ebnf/ETile*.java`), so there is no
`svek-N.dot`.
