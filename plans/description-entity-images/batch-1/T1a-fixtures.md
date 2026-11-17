# T1a: fixtures and measurer

## Context

No upstream fixture reaches `domain`, `requirement`, or `map` in a description diagram (README, starting state). The
three corpus rows reach one shape each. The fixtures below give each ported branch an oracle, and give D4 the outlines
it scrapes.

## Fixtures

Create `oracle/goldens/svg-description/component/<slug>/in.puml`, then its `golden.svg` with
`scripts/oracle-render.sh <abs-dir> <abs-dir>/in.puml` (rename the output to `golden.svg`; delete `svek-N.dot`). Every
oracle must carry `data-diagram-type="DESCRIPTION"`; one that does not routes elsewhere in the jar, so redesign it with a
description-only keyword (`component`, `[X]`) until it does.

| Slug | Covers |
|---|---|
| `dei-json-top` | `component C` + top-level `json J { … }` with an object, an array and a nested object; a link `C --> J` |
| `dei-json-single` | `CommandCreateJsonSingleLine` (`json J {"a":1}` on one line) beside a component |
| `dei-json-group` | `json` inside `node N { }`, with a stereotype on the json |
| `dei-map-top` | `component C` + `map M { k => v }` with two rows and a `#color` |
| `dei-map-link` | a map row linking out (`k *-> C`), per `CommandCreateMap`/`BodierMap`; drop it if the jar errors, and journal |
| `dei-domain-each` | one leaf per stereotype: none, `<<Machine>>`, `<<Designed>>`, `<<Lexical>>`, `<<Causal>>`, `<<Biddable>>`, plus `<<Specification>>`, `<<Solved>>`, `<<Given>>`, `<<Uncertain>>` (the `Stereotype.java:210-233` aliases) |
| `dei-requirement` | a `requirement` leaf, a `requirement { }` group holding one, and a link between them |
| `dei-domain-group` | `domain … <<Machine>> { }` holding a `<<Causal>>` leaf, linked to a top-level `<<Lexical>>` leaf |

Then register them: `npx tsx scripts/dot-sync-report.ts component`, then
`npm run svg:survey -- component --out tests/oracle/svg-conformance/parity-component.json`. Each `dei-*` slug must get
a row. Expect `diverged` (Syntax Error) for all; journal any that is not.

## Measurer

Write `plans/description-entity-images/measurements/measure-dei.mts`. It renders the three `unknown` rows (from
`test-results/dot-cache/unknown/<slug>/`) and every `dei-*` fixture through
`tests/oracle/svg-conformance/render-fixture.ts#renderFixtureSurveyStyle` (the survey's own call, so verdicts agree) with
`DeterministicMeasurer`, compares with
`compareSvg(ours, golden, 'deterministic')`, and prints one line per row (`slug verdict diffs firstDiff`) and a totals
line (`rows N zero Z error E`), where `error` counts rows whose `errorPage` is true. With an argument, it writes the rows as JSON.

## Acceptance
- Given the eight fixtures, when their oracles render, then each carries `data-diagram-type="DESCRIPTION"` and no
  error text.
- Given the measurer on the T1a tree, when run, then it prints 11 rows with `error 11`.
- Given `parity-component.json`, when the survey runs, then each `dei-*` slug has a row and no other verdict moved.

Observability is N/A. Rollback is Reversible.
