## Observation: an authored component fixture trips four gates, not two
- **Context**: dei-T1a authored the first `oracle/goldens/svg-description/component/` fixtures with no manifest row.
- **Finding**: besides routing-conformance and refusal-coverage (both walk `dot-cache` AND `goldens`, so one fixture = 2 rows each), `tests/unit/scripts/dot-sync-fixtures.test.ts` asserted every authored component slug collides with `tests/visual/data/component.json`, and the parity-dashboard drift gate moves with `parity-component.json`. Counts to re-derive: routing manifest length + misroute counts (two assertions), refusal manifest length + known-gap count + `pinnedErroring`.
- **Impact**: budget a pinning step in any task that adds description goldens; `plans/description-entity-images/measurements/pin-dei-baselines.mts` is a reusable upsert through the gates' own seams.
- **Confidence**: High

## Observation: a plain `domain` with no stereotype crashes the jar
- **Context**: authoring `dei-domain-each`.
- **Finding**: `domain "X" as Y` (no `<<...>>`) is an NPE page in the jar: `EntityImageDomain.java:83` reads `stereotype.getHtmlColor()` unconditionally. Any stereotype the four `is*` predicates reject (e.g. `<<Other>>`) reaches the `'P'` letter.
- **Impact**: the `'P'` branch is only reachable with an unknown stereotype; a no-stereotype domain is an error-page conformance case.
- **Confidence**: High
