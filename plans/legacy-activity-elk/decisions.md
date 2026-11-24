# Decisions

Each decision cites the evidence it rests on. A finding that contradicts one is stop condition 4: amend this file with
the date, then halt.

## D1. A per-engine adapter over the legacy abel model, modelled on Chen's

`ActivityLegacyElkAdapter` (`src/diagrams/activity-legacy/activity-legacy-elk-adapter.ts`) implements
`ElkDiagramAdapter` (`src/core/elk/ElkDiagramAdapter.ts`) over `ActivityDiagram`'s own `Entity` and `Link` objects.
The template is `ChenEerElkAdapter` (`src/diagrams/cheneer/cheneer-elk-adapter.ts`): Chen keeps the abel model too,
so each member is the Java call it names. A leaf is the entity's `printEntityInternal` image
(`CucaDiagramFileMakerElk.java:462-475`, `GeneralImageBuilder.createEntityImageBlock`, the image the svek path
already sizes); a link is its `Link`.

- **Unlike Chen, the cluster half is reachable** and must be implemented, never thrown: the legacy engine opens
  `PACKAGE` (`UBrexCommandPartition.java:121`, `CommandLinkActivity.java:344`, `:374`, `:393`,
  `CommandLinkLongActivity.java:248`), `INNER_ACTIVITY` (`ActivityDiagram.java:148`) and `CONCURRENT_ACTIVITY`
  (`ActivityDiagram.java:167`) groups.
- **Rejected:** a shared abel-model adapter extracted from Chen's. It would refactor a working, pinned engine while
  porting (CLAUDE.md, "Do not refactor while porting"), and the per-engine adapter is the settled seam (cdd8 D13, the
  header of `ElkDiagramAdapter.ts`). A later consolidation is not this mission's.
- **Rejected:** reusing the description adapter. It reads the description engine's own model, not abel.

## D2. The ELK branch sits before the simplifier and the svek shortcuts

`CucaDiagram#getTextBlock` picks the maker (`net/atmp/CucaDiagram.java:478-479`). Only `CucaDiagramFileMakerSvek`
runs `CucaDiagramSimplifierActivity` (`CucaDiagramFileMakerSvek.java:67`), and only `GraphvizImageBuilder` has the
empty-diagram block and `EntityImageDegenerated` (`GraphvizImageBuilder.java:145-158`). So:

- `layoutActivityLegacy` (`src/diagrams/activity-legacy/layout.ts`) branches on `diagram.isUseElk()` **first**, before
  `new CucaDiagramSimplifierActivity().simplify(...)`. An inner activity is then an ELK cluster, as the jar draws it
  (`elk-lap-inner-brace`: jar 311 high, svek-simplified 197).
- The ELK half is `layout-elk.ts`, shaped like `src/diagrams/cheneer/layout-elk.ts`: `makeElkLayout(adapter, backend,
  newMyElkDrawing)`, then `new MyElkDrawing(adapter, result.minMax, result)`, measured by `calculateDimension`.
  `ActivityLegacyGeometry` gains `elk?: MyElkDrawing`, and the renderer returns it as the text block, as
  `src/diagrams/cheneer/renderer.ts:196` does.
- **No silent fallback:** with no backend, the layout throws `ELK_RENDER_SYNC_UNSUPPORTED` (the
  `src/diagrams/cheneer/layout.ts:70-73` `requireElk` precedent), and the plugin's `requiresElk(ast)` answers
  `ast.isUseElk()` so `render()` lazy-loads the backend (`src/core/elk/layout-services.ts`).

## D3. The backend is the current default; #265 is separate

Measure and pin with `loadElk()`'s default backend, elkjs 0.12.0, the ELK version the jar bundles
(`DIVERGENCES.md`, the retired "`!pragma layout elk`" entry). Chen's 8 ELK fixtures are at 0 diffs with it
(`oracle/goldens/svg-cheneer/authored-baseline.json`), so 0 is the target here too.

- This mission writes nothing under `src/core/elk/` beyond a JSDoc line (stop condition 5). Adopting
  `@knowvah/elk-engine` is #265; whatever it changes on these rows goes through its own re-pin.
- **Rejected:** waiting on #265. The adapter is backend-agnostic (`ElkBackend` seam, `elk-backend.ts`), and the
  maintainer moved #158 back to `queue:ready` once elk-engine was published (issue comment, 2026-11-23).

## D4. The probes join the existing authored ratchet

The 19 probes in `measurements/probes/` move to `tests/fixtures/activity-legacy/` as `elk-<fixture>.{puml,svg}`,
tracked by `oracle/goldens/svg-activity-legacy/authored-baseline.json` and
`activity-legacy.diff-baseline.ratchet.test.ts`, rebuilt by
`plans/legacy-activity-engine-port/measurements/build-authored-baseline.mts`.

- Every `elk-*` row and both issue rows sit in `OPEN_ROWS` (ratchet and builder) with a `#158` reason until a task
  takes it to 0; a row that stays nonzero leaves with a mechanism reason (README, "These are not stops").
- ELK rows emit no `svek-N.dot`, so `pin-legacy-dot.mts` never pins them and the DOT gate does not move. Delete any
  `svek-N.dot` an oracle render leaves.
- **Rejected:** a new fixture root and gate. The authored ratchet already holds `pragma-elk`; a second gate would split
  one engine's rows for no measurement gain.

## D5. The harness renders with a backend, as the survey does

`render-fixture-activity-legacy.ts` gains `prepareElkOnce()` and passes `elk` once prepared, the
`render-fixture-cheneer.ts:60-72` precedent; the ratchet awaits it in `beforeAll`. `build-authored-baseline.mts` must
render with a backend too, or it will re-measure the ELK rows through the throw. `scripts/svg-parity-survey.ts`
already passes `surveyElk` (`:312`, `:345`).

## D6. Mirror the jar's ELK drawing, including what looks odd

The jar's ELK output differs from its svek output in ways that are not ours to fix: no `<g class="link">` around an
edge, straight `<line>` sections, `left to right direction` ignored (root `Direction.DOWN`,
`CucaDiagramFileMakerElk.java:482`), label `marginLabel` fixed at 1 (`:182`, `:192`). These are targets. An element
the jar omits under ELK is a defect in ours (CLAUDE.md, "Mirror the jar's output exactly").

## D7. No public surface, no dependency, no divergence

`dist/*.d.ts` must not move, nothing is added to `package.json`, and no `DIVERGENCES.md` entry is written by this
mission: a residual that would need one is a `needs-ruling` issue (README, "These are not stops"). The change is
Reversible: revert the squash commit.

## Operational readiness

- **Observability:** N/A. A library render path; no service, SLI, trace or dashboard.
- **Rollback:** Reversible. Revert the commit; no data or contract migrates.
- **Scalability:** an ELK render costs one elkjs layout, the same as class, description and Chen today. Not flagged.
- **On-call:** none. The likely failure is a thrown `ELK_RENDER_SYNC_UNSUPPORTED` from `renderSync` without
  `options.elk`, which is the documented contract for every ELK engine (`DIVERGENCES.md`).
- **Backwards compatibility:** a legacy diagram carrying the pragma used to render with dot-engine through `renderSync`
  without `options.elk`; it now throws, as every other ELK diagram does. That is the issue's stated requirement ("must
  not silently fall back to dot-engine"), not an API change: the option and the error already exist.

## Auto-confirmed (unattended)

Planned with `/plan-mission --unattended next --branch feature/parity-queue` on 2026-11-23.

- **Selection:** no open `queue:planned` issue. #136 is blocked by open issues; #158 is the lowest-numbered
  `queue:ready` issue with no open "Blocked by". It was held as `needs-ruling` until `@knowvah/elk-engine` shipped
  (comments of 2026-11-12 and 2026-11-23), and is `queue:ready` again.
- **Phase 1:** `docs/architecture/overview.md` is 63 commits stale, so a lightweight scan ran.
- **Phase 3:** D1 to D7, each with its rejected options above. D1 (per-engine adapter, not a shared base) and D3
  (default backend, not #265's) are the two a maintainer is most likely to want to revisit.
- **Phases 2, 4, 5, 6:** the README's blast radius, the readiness answers above, the batch files, the README's stop and
  push-forward lists.

## Pre-flight (Phase 8, 2026-11-23, `7be0c7129`)

- Working tree clean apart from this brief; `feature/parity-queue` checked out.
- `npm run lint`: exit 0.
- `npm test -- --maxWorkers=4`: exit 0. 2349 files passed (1 skipped), 50935 tests passed (6 expected fail, 7
  skipped, 6 todo); coverage 97/92.59/97.48/98.03. Run at load ~25 (another repo's suite): no timeouts.
- Every Modify path in the README's file table exists; every Create path's parent exists.
