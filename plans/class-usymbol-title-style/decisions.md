# Decisions (cuts)

## Auto-confirmed (unattended)

Planned without a person present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-25). `next`
resolved to #195: #136 is blocked by open issues (#195 among them), and #195 is the lowest-numbered `queue:ready`
issue with no open "Blocked by". Each decision lists what was rejected and the evidence, so the user can audit it.

### D1: Stamp `styleTitle` on every class `EntityImageDescription` leaf; the draw and the sizer read it

**Decision.** In `layoutSync`, beside `annotateStateLeafStyles`, a new `annotateUSymbolTitleStyles` stores on each
classifier that `usesClassUSymbolEntity` accepts the merged `styleTitle`:

- signature `{root, element, classDiagram, <symbol SNames>, title}`, or `{root, element, classDiagram, actor,
  business}` for `actor/` (`ACTOR_BUSINESS_TITLE`), `withTOBECHANGED(stereotype)`
  (`EntityImageDescription.java:142-151`). `getStyleName()` is `classDiagram` (`DiagramType`), where the description
  engine has `componentDiagram`;
- merged on the entity's own builder, `services.styleBuilder(classifier.styleGeneration)`, which answers
  `Entity#getCurrentStyleBuilder` (`Entity.java:760-772`) as it does for the description engine
  (`description-entity-style.ts#annotateEntityStyles`);
- the SNames come from the description engine's `symbolSNames`, shared, not copied.

Readers, each below the inline-colour tier (`eventuallyOverride(colors)`, `Style.java:212-227`; `getStroke(colors)`,
`:339-345`): `resolveForecolor` takes `LineColor` (`:159`), `resolveStroke` takes `getStroke()` (`:168`),
`resolveBackcolor` takes `BackGroundColor` (`:161-163`), the leaf sizer and the actor ink walk take the stroke
thickness (`:177`). `deltaShadow` (`:167`) is push-forward in T2. Fonts, corners and alignment already match the jar
on every probe (`title-font` and `title-back`'s corners measure 0) and are left as they are: do not refactor while
porting.

**Rejected.**
- *Add a `title` tier to the flat theme buckets.* A special case for one selector. The flat tiers also have no
  notion of the entity's builder, so `style-after` (a `<style>` after the leaf, which the jar ignores) stays wrong.
  CLAUDE.md: "A structural divergence IS the bug: re-mirror rather than patch with special cases."
- *The object engine's hybrid (`class-object-style.ts`, D3 there): stamp only values that moved from the skin and
  fall through to flat tiers otherwise.* That hybrid exists because an object's flat path holds roles its merged
  style lacks. Here the experiment below shows the merged style alone reaches the jar on every probe whose residual is this
  mechanism. If T2's survey
  shows a flat tier holding a role the merged style lacks, the hybrid becomes the fallback; journal the row.
- *Parameterize `descriptionEntityStyle` by style name and call it from the class engine.* Closest to upstream's one
  class, but it routes class leaves through `DescriptiveNode` shapes and moves description code for no class gain.
  Sharing `symbolSNames` takes the part both need.

**Evidence: the planning experiment (reverted, not committed).** A throwaway patch did exactly these reads (forecolor,
stroke, backcolor; thickness into both sizers, not into the actor ink walk). Over the first 17 probes, `rows 17 zero 2 open 15` became
`rows 17 zero 12 open 5` (the 3 `embed-*` probes were added after; see the trap). Of the 5 left, `stereo` (85) and
`title-shadow` (6) are separable (D2). `issue`,
`style-title` and `usecase-border` hold a plain `actor` and sat 1–1.5 px low: the actor ink walk
(`class-layout-leaf-shapes.ts:117-120`) still measured the default stroke, which T3 ports. Class survey with the
patch: 859 conformant, 12 timeout, 2 structural-match, 1 diverged (base: 872 conformant, 2 structural-match). The 12
timeouts were one contiguous worker block at load 28; each renders at 0 diffs against its golden with the patch. The 1
diverged row (`razefo-71-pice114`) is the trap below, not D1.

**Trap: never carry the builder in module state.** The experiment kept `services.styleBuilder` in a module-level
variable. A note's `{{ class X }}` embed runs the class plugin's `layoutSync` again, which replaced it with the embed's
builder, so the outer `component a` drew the embed's `skinparam componentBorderColor teal` (`razefo-71-pice114`, and
the authored `embed-class` / `embed-group`: 0 → 4 diffs). The same source with a description-engine embed
(`embed-desc`) stayed at 0, and the preprocessor's own skinparam list for the outer source is empty, which rules out a
seam leak. Stamp the style on each classifier inside `layoutSync`, before layout runs any nested render.

### D2: Separable residuals are filed, not chased

A row whose remaining diffs come from another mechanism is measured, filed as a `queue:ready` + `parity` issue with
`file:line`, and moved to `OPEN` naming it. Two are known at planning (exit T4 files them): the class usecase
stereotype sizing (`stereo`, 85 diffs with no title skinparam), and the class descriptive-leaf `name:value` colour,
which the jar refuses (`CommandCreateElementFull2.java:289-292`) and the port draws. `title-shadow`'s size half is
#260 (`leaf-sizing-entity.ts:187`, shared). "Hard" is not separable; a mechanism exposed by D1's own change belongs to
T2 or T3.

### D3: Hold the probes in an authored gate

19 probes (all but `cuts-issue`, which is the uts row `skin-title-allowmixing`) move to
`tests/fixtures/class-usymbol-title-style/<row>.puml` + `.svg`, held by
`tests/oracle/svg-conformance/class-usymbol-title-style.authored.test.ts` in the shape of
`usecase-title-style.authored.test.ts`: rows are the `.puml` files on disk; `ZERO` asserts 0 diffs; `OPEN` asserts
the count never rises and names an issue. The uts row moves from `OPEN` to `ZERO` in its own gate.

**Rejected.** *Registering them in the class parity corpus.* That needs a survey re-run per fixture and `svek-N.dot`
parity rows; the gate holds the same assertion at a fraction of the cost, as #148, #145 and #190 did.

### D4: No new divergence, no public d.ts change

Nothing here is library-forced. `DIVERGENCES.md` and `oracle/accepted-divergences.json` stay unchanged. T0 snapshots
`dist/*.d.ts`, T4 diffs them; any change is stop 5. The new classifier field is internal (`ClassDiagramAST` is not
exported from `src/index.ts`; confirm with the d.ts diff).

## Operational readiness (auto-confirmed)

- **Observability:** N/A. A browser-safe pure library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squash commit; the `pre-squash` tag keeps the per-task history.
- **Scalability:** N/A. One merged-style lookup per mixed-in leaf per render (the description engine already does
  three per leaf); 16 more renders in the test suite.
- **On-call:** N/A (library). The failure mode is a conformant row lost, caught by `verdict-diff.mjs`, the ratchets
  and the censuses.
- **Backwards compatibility:** no API, d.ts or data contract change (D4). Only class-diagram description leaves under
  `title` styles, late style blocks or element styles the flat tiers missed change, towards the jar.
- **Irreversible changes:** none.

## Pre-flight (planning, 2026-11-25, base `15ed8340b`)

- `npm test -- --maxWorkers=4` (coverage on): 2375 files passed, 1 skipped; 51502 tests passed, 6 expected fail,
  7 skipped, 6 todo; exit 0. Run at load ~20 beside another session's sweeps.
- `npm run lint`: exit 0.
- `feature/parity-queue` is checked out; the tree holds only this brief, `.agent-notes/cuts-plan.md` and the planning
  progress file (deleted at handoff). The four planning-experiment `src/` edits were reverted with `git checkout` and
  the scratch module removed; `git status` showed no `src/` change before the test run.
- Every Modify path in the README file table exists; every Create path's parent exists.
- Every task spec carries Observability (N/A) and Rollback (Reversible). No Irreversible change.
- Probes: `rows 20 zero 5 open 15 throw 0` (`measurements/plan-baseline.txt`).
- Not run at planning: `typecheck`, `build`, `format:check` (batch 0 runs them on the base).
