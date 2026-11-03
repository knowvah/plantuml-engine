# Parity page notes (docs/why-no-smetana)

## Observation: three accepted divergences describe the wrong behaviour
- **Context**: Finding reasons for each parity matrix row.
- **Finding**: `DIVERGENCES.md` "We draw where the jar errors" says "The diagram parses fine for us", and `oracle/accepted-divergences.json` lists `svg-ebnf/ladifa-97`, `svg-regex/bakuza-41`, `svg-regex/tajefa-31`. Neither engine exists, so we emit the "Error: unknown diagram type" placeholder rather than a diagram. Chronology and c4 in that list are real draws.
- **Impact**: Those three rows are signed rulings, so they were left for the maintainer.
- **Confidence**: Medium (from the research agent's render of `bakuza-41`; no ebnf or regex plugin is registered).

## Observation: the `network` bucket holds no nwdiag diagrams
- **Context**: Same.
- **Finding**: `scripts/classify-corpus.ts:110` buckets on `contains('network ')`. Its 3 fixtures are a description diagram and two legacy `(*) -->` activity diagrams. Real nwdiag fixtures sit in `unknown` (64 non-conformant with jar type NWDIAG).
- **Impact**: The matrix's "D5 todo" reads as nwdiag coverage. The parity note says so; reclassifying is corpus work.
- **Confidence**: High.

## Observation: stale engine labels
- **Context**: Same.
- **Finding**: `scripts/parity-dashboard-matrix.ts:32` says 10 buckets have no engine, and its map still lists `mindmap` and `gantt`, which are registered; the registered check runs first, so the entries are dead. `planning/mission-index.md` lists mind map, salt and C4 as todo.
- **Impact**: No output effect today.
- **Confidence**: High.

## Observation: the parity pins lag the survey
- **Context**: Same.
- **Finding**: `tests/oracle/svg-conformance/parity-activity.json` on main says 448/1/0 (2026-10-22, `bozido-07-geze049` structural); a survey at the same source measures 449/0/0. `unknown` also lags, 557/19/249 against 565/19/241.
- **Impact**: The activity row's note says so and drops itself when the pin is refreshed.
- **Confidence**: High.

## Observation: the README's Graphviz licence line
- **Context**: Correcting the stale layout-engine credit.
- **Finding**: It names Graphviz 2.38.0 under CPL-1.0, while the layout dependency, dot-engine, is EPL-2.0. In-house ports were deleted in `05c33b0e9` (2026-06-25).
- **Impact**: A licensing statement, so it was left for the maintainer.
- **Confidence**: High on the facts; the right wording is not an engineering call.
