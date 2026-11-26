# snl execution observations (2026-11-24)

## Observation: scripted edits bypass the complexity hook
- **Context**: T3/T4 edits made with python/sed instead of Edit/Write
- **Finding**: `check-complexity.py` runs only as a PostToolUse hook on Edit/Write, so scripted writes landed two
  functions over 30 NLOC (`createTransitionWithIntermediateNode` 37, `initParseState` 35). Running the hook by hand
  works: `echo '{"tool_name":"Edit","tool_input":{"file_path":"<abs>"},"cwd":"<repo>"}' | ~/.claude/hooks/.venv/bin/python ~/.claude/hooks/check-complexity.py`
  (it compares with `git show HEAD:<file>`; for already-committed files compare lizard `-T nloc=30 -C 10 -a 5` against
  the mission base instead).
- **Impact**: run it over `git status` src files before every commit when editing by script.
- **Confidence**: High

## Observation: survey timeouts on the first rows are worker warm-up
- **Context**: batch-close `npm run svg:survey` while other workloads pushed load to 60-200
- **Finding**: every `-> timeout` move was a load artefact; a rerun at load ~9 still timed out exactly the
  alphabetically first 14 activity rows (one per worker start, jiti compiling `src` past the 60 s per-fixture
  budget). `SVG_PARITY_TIMEOUT_MS=240000 npm run svg:survey -- <type> --out tests/oracle/svg-conformance/parity-<type>.json`
  gave real verdicts.
- **Impact**: rerun a timed-out type with a larger budget before treating a timeout as a finding.
- **Confidence**: High

## Observation: the composite pipeline copies leaf geometry fields one by one
- **Context**: snl T4, `snl-composite` lost its label text while the flat path drew it
- **Finding**: `state-composite-pass.ts` builds a `GeoSpec` from `buildStateGeoTextFields`, and
  `state-composite-geo.ts#materializeSpecs` copies named fields into `StateNodeGeo`; a new field on
  `StateGeoTextFields` must be added to `GeoSpec` (`state-composite-pass-types.ts`) and `leafContentOf` too.
- **Impact**: any new per-leaf geometry field for state.
- **Confidence**: High

## Observation: the arrow-label font cascade is class-scoped for every engine
- **Context**: snl T5, `stateDiagram { arrow { FontStyle bold } }`
- **Finding**: `style-map-theme.ts:66` resolves the arrow font over `ARROW_SNAMES` = `{root, element, classdiagram,
  arrow}` (`style-cascade-class-snames.ts:13`) whatever the diagram; diagram-scoped colours reach state via element
  buckets, font style/size/name do not. `Theme` is in `dist/plantuml-engine.d.ts`, so a new field changes the public
  d.ts. Filed #292 (needs-ruling).
- **Impact**: any diagram-scoped arrow font property in a non-class engine.
- **Confidence**: High

## Observation: state has no ELK path
- **Context**: snl T7, `snl-elk`
- **Finding**: `!pragma layout elk` in a state diagram draws the dot layout; no state ELK adapter exists. Filed #293.
- **Impact**: any state row under the ELK pragma.
- **Confidence**: High
