## Observation: class #109 rows need no seeding step, unlike sequence
- **Context**: planning #140 (class-oracle-gap-rows), 2026-11-13 on `cd7587779`
- **Finding**: the class pin tool (`plans/class-divergence-drive/tools/pin-goldens.mts`) copies goldens, appends to `ratchet.json` and clones routing and refusal twins. It needs no per-row baseline, because class has no `diff-baseline.json`. So the 40 open class rows are not held shrink-only while a mission works on them.
- **Impact**: a class mission measures its open rows with its own measurer (cogr `measure-rows.mts`). A shrink-only gate for open class rows would be new tooling.
- **Confidence**: High

## Observation: the survey and the class ratchet path agree on the #109 rows
- **Context**: comparing `parity-class.json` (survey, worker render) with the ratchet path (`renderClassFixture` + `DeterministicMeasurer` + `censusClassFixtureOptions`) on the 151 rows
- **Finding**: both say 111 conformant / 40 open, row for row. `plans/class-divergence-drive/tools/render-all.mts` (WidthTableMeasurer) reads the whole class tree as 831 / 19 / 24 against the survey's 834 / 19 / 21. The 3 extra non-conformant rows there are not #109 rows.
- **Impact**: for class, `render-all.mts` is not interchangeable with the survey or ratchet path. Measure with the ratchet path.
- **Confidence**: High (measured)

## Observation: `sivoso-11-xabi195`'s first diff is the jar's skinparam warning banner
- **Context**: triaging the 40 open rows
- **Finding**: the jar draws a `#FFC` / `#FD8` banner with `Please use CSS style instead of skinparam ParticipantPadding` (`CommandSkinParam.java:95-96`). `src/core/skinparam-warnings.ts` ports it, and description plus ten other engines use it. Class does not.
- **Impact**: any class source with `skinparam ParticipantPadding`, `padding` or `handwritten` misses the banner. cogr T4h owns it.
- **Confidence**: High (oracle read; Java read)
