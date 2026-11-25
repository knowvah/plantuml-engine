# Decisions (sds)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-24). `next`
resolved to #193: #136 is blocked by open issues, and #193 has no "Blocked by". Each decision lists what was rejected
and the evidence, so the user can audit it.

### D1: The flag is the internal `SvgDimensionStyleFlag`, returned by each producer

**Decision.** Every engine that drops the flag returns `RenderFragment & SvgDimensionStyleFlag` and spreads
`...(<off> ? { svgDimensionStyle: false as const } : {})` into its fragment, as `class/renderer-document.ts:183-185`
does. The shell finalizers' `{ ...fragment }` spreads carry it to `document-shell.ts#dimensionAttributes`.

**Rejected.**
- *A `RenderFragment.svgDimensionStyle` field.* `RenderFragment` is reachable from the public `.d.ts`; cogr D5 kept
  the flag off it on purpose (`document-shell.ts:94-102`). Changing that is a published-API decision, stop 5.
- *Read the theme once, centrally, in `assemble-svg.ts`.* `assembleSvg` receives no theme or skin param, and upstream
  reads the flag per exporter from the diagram's own skin param (`TextBlockExporter.java:418-421`). A central read
  would be a second source of truth beside the producers that already set `lengthAdjust` the same way.

**Evidence.** The class path works this way today: `ctl-class` and `ctl-class-title` (chromed) are `EXACT`.

### D2: Theme-driven engines read `Theme.svgDimensionStyle`; skin-param engines read their `SkinParam` port

**Decision.**
- Sequence, state, activity and the chromed description path read `theme.svgDimensionStyle === false`, where they
  already read `theme.lengthAdjust`. `skinparam-key-handlers-table-b.ts:98` fills it as `value.trim().toLowerCase()
  !== 'false'`, which is `SkinParam.java:1216-1218` with `valueIs`'s `equalsIgnoreCase` (`:367-369`).
- The 13 skin-param engines (timing, gantt, mindmap, wbs, salt, nwdiag, activity-legacy, ebnf with regex, board,
  cheneer, wire, packetdiag, chart) get `svgDimensionStyle(): boolean` on their `SkinParam` port, mirroring
  `SkinParam.java:1216-1218` with a `@see`, read beside `getlengthAdjust()`. It feeds both the klimt `basicSvgOption`
  (where `TextBlockExporter.java:420` sets it) and the returned fragment (which the shell re-roots).

**Rejected.**
- *Skin-param engines read the theme.* Their exporter options come from `diagram.getSkinParam()` today
  (`getlengthAdjust()` at e.g. `wbs/index.ts:161,195`). Reading one option from a different object than its sibling
  splits the exporter's inputs across two sources.
- *One shared helper for the 13 ports.* The ports are per-engine mirrors of one upstream class, each with its own
  `getlengthAdjust`; CLAUDE.md forbids refactoring while porting. Each method body is one line.
- *Only the fragment, not the klimt option.* The klimt document is unwrapped and discarded, so the fragment alone would
  pass the gate. Setting the option too keeps the klimt pass faithful to `TextBlockExporter.java:420`, matching the
  `lengthAdjust` precedent (`lengthAdjustOverride` on the option plus `lengthAdjust` on the fragment). If the
  unwrap (`extractViewBoxDims`/`extractFlatContent`) cannot read a dimension-less klimt root, journal it and set the
  fragment only; do not change the extractors.

### D3: Hold the probes in an authored gate that compares the root open tag

**Decision.** Move the 33 probes to `tests/fixtures/svg-dimension-style/<name>.puml` + `<name>.svg`, held by
`tests/oracle/svg-conformance/svg-dimension-style.authored.test.ts`, modelled on
`usecase-title-style.authored.test.ts`:
- rows are the `.puml` files on disk, each with its jar `.svg`; a file with no entry, or an entry with no file, fails;
- the compared value is the root `<svg …>` open tag with `xmlns` attributes stripped (what `measure-sds.mts` prints);
- an `EXACT` row asserts our tag equals the jar's;
- an `OPEN` row asserts the jar's tag equals ours with our `style`, `width` and `height` removed, and carries a
  `reason` naming `#193` and its task. The list must be empty at exit;
- render path: `renderSync` + `DeterministicMeasurer`.

**Rejected.**
- *`compareSvg` full-document diffs.* The feature is three root attributes; a full diff would tie the gate to every
  engine's unrelated body parity. Body parity is the survey's job, and verdict-diff checks it at every batch close.
- *Registering the probes in each engine's parity corpus.* Needs a survey row per engine and `svek-N.dot` parity for
  the cuca engines; the gate holds the same assertion at a fraction of the CI cost.

**Evidence.** At planning, with `DeterministicMeasurer`, all 23 gap probes are `DIMS` and all 10 controls `EXACT`
(0 `OTHER`), so the root tag isolates exactly this defect.

### D4: No new divergence, no public d.ts change

Nothing here is library-forced. `DIVERGENCES.md` and `oracle/accepted-divergences.json` stay unchanged. T0 snapshots
`dist/*.d.ts`, T5 diffs them; any change is stop 5.

### D5: Scope is every engine whose jar output omits the attributes

The issue says "check each engine, not only these three". Planning rendered a probe for every `src/diagrams/` engine
that accepts a `skinparam` line (README, "Engines probed and left out"). Files, json and yaml keep the attributes in
the jar as in ours: their factories extend `PSystemAbstractFactory` (`JsonDiagramFactory.java:61`,
`FilesDiagramFactory.java:51`), not a command factory with `CommandSkinParam`, so the line never reaches their skin
param (MEDIUM confidence: read from the class declarations, not traced line by line; the controls hold the observed
behaviour either way).

**Out of scope, to file at exit (T5):** `@startuml` / `skinparam svgDimensionStyle false` / `class A {` / `@enduml`
(unclosed body). The jar draws the Welcome page, and we draw class `A`. Independent of the flag; check for a duplicate
first (#263 is the nearest).

## Operational readiness

- **Observability:** N/A. A browser-safe pure library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squashed commit; no data or schema.
- **Scalability:** N/A. One spread per document.
- **On-call:** N/A. The likeliest failure is an engine still writing the attributes; the authored gate names it.
- **Backwards compatibility:** no API, schema or `.d.ts` change. Output changes only for sources that set the
  skinparam to `false`, towards the jar.
