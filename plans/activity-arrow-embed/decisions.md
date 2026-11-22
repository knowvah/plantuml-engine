# Decisions (aae)

## Auto-confirmed (unattended)

Planned without a person present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-21).
Each decision lists what was rejected and the evidence, so the user can audit it.

### D1 — Scope: activity-3 arrow labels built by `FtileFactoryDelegator#getTextBlock`

**Decision.** The two authored rows (`act3`, `act3-open`), the planning probe `act3-mixed`, and the other activity-3
sites whose label block comes from `getTextBlock(display)` and is placed by `Snake.withLabel` (T4 enumerates them from
`grep -rn "withLabel(" ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3`: 18 files, 56 calls).

**Rejected.**
- *The two rows only.* CLAUDE.md: "The corpus is the work queue and not a ceiling." The same block reaches if, repeat,
  while, switch and swimlane connections; a fix to the block measure moves them all, so they need probes either way.
- *Every activity-3 text block, including action boxes and diamond labels.* Those are built elsewhere
  (`FtileBox`, `FtileDiamond*`) and are not this mechanism.

**Separable residual.** A probe whose remaining diffs come from a different mechanism (for example the swimlane
connection router) is measured, filed as a `queue:ready` issue with `file:line`, and held as an OPEN row. "Hard" is not
separable; a mechanism the task's own change exposes is the task's. The 1-px canvas width (README) is in scope until T1
shows it is separable.

### D2 — Diagnose before any fix; the block size comes from the Java, never from the 10

**Decision.** T1 produces the diagnosis artifact (`~/.claude/rules/diagnosis.md`) for why the jar's embed-only arrow
label block reports a 10-tall `dim` at `Snake.java:247`, and where ours gets 27.111. Batch 2 ports that mechanism at its
origin. The value 10 never appears in our code as a literal; it falls out of the ported mechanism, or it carries its
upstream `file:line`.

**Rejected.**
- *Special-case an embed-only label to height 10.* Fitting a value: CLAUDE.md "Never fit a value".
- *Place the embed at its real height, `mid - 227/2`.* Contradicts both the oracle and the stock jar (README).

**Evidence.** `act3-mixed` (text line, then the embed) already places the image where the jar does, so our stripe
stacking agrees with the jar once a text line precedes the embed. The divergence is specific to a block that starts
with (or is only) the embed line. Leads for T1, none of them a conclusion:
`klimt/creole/Display.java` (`create7` → `getCreole`), `klimt/creole/legacy/CreoleParser.java:142-175`
(`createSheetSlow`, the embed branch), `klimt/creole/SheetBlock1.java` (stripe stacking and padding),
`EmbeddedDiagram.java:126-152` (`calculateDimensionSlow`), and the activity's `StringBounder`
(`FtileFactoryDelegator#getStringBounder`).

**Amended 2026-11-22 (T1).** The premise "the jar's block reports a 10-tall `dim`" is false: the instrumented jar
prints `dim=[61,68]` at `Snake.java:247` (`.agent-notes/aae-T1.md`). The 20-long arrow and y 92 come from
`CompressionXorYBuilder` (`ActivityDiagram3.java:209-210`) removing the slot the image does not occupy
(`SlotFinder.java:84-109` has no `UImageSvg` branch). The decision itself stands unchanged: diagnose before fixing, and
no literal 10 (or 5) in our code. Not a contradiction of D2's choice, so not stop condition 4; journalled.

### D3 — One block measure feeds every consumer; embed-free labels do not move

**Decision.** `edgeLabelBlockSize` (`layout/compress/edge-label-anchor.ts`) is the activity port's
`text.textBlock.calculateDimension` (`Snake.java:247`). The placement, the `35 + height` reserve
(`FtileFactoryDelegatorAssembly.java:58-63`, ours `tile-layout-inlabel.ts:112`), the canvas-origin ink
(`canvas-origin-text-ink.ts:150`) and `Snake#getMaxX` (`Snake.java:234-242`, the `FtileMargedRight` width) must all
read that one measure. Where a consumer must instead see the drawn extent (the jar's `LimitFinder` over the drawn
`<image>`), it says so with the Java quote. A label with no embed line keeps today's path byte for byte, so the activity
golden ratchet (`activity.golden.ratchet.test.ts`) and diff-baseline ratchet hold.

**Rejected.** *Fixing each consumer to its own symptom.* `~/.claude/rules/diagnosis.md`, "Scope of change": several
symptom sites adjusted separately means the root was not found.

### D4 — No new divergence

Nothing here is library-forced: the stock jar shows the same placement as the oracle (README). Any residual is a bug or
a separable issue (D1), never a divergence. `DIVERGENCES.md` and `oracle/accepted-divergences.json` do not change.

### D5 — Pin through the existing authored gate; no public API change

- Probes live in `tests/fixtures/edge-label-embed/<row>.puml` + `<row>.svg` (`scripts/oracle-render.sh`), held by
  `tests/oracle/svg-conformance/edge-label-embed.authored.test.ts`: a ZERO row asserts 0 diffs and the jar's `<image>`
  count, an OPEN row asserts its diff count never rises and names its issue. Move `act3`/`act3-open` from OPEN to ZERO
  with a dated comment in the file's pattern.
- `dist/*.d.ts` must be byte-identical to the T0 snapshot at exit.

## Operational readiness (auto-confirmed)

- **Observability:** N/A. A pure rendering library; no service, SLI or trace. The authored gate, the activity ratchets
  and the every-engine survey are the signals.
- **Rollback:** Reversible. Revert the squash commit, or reset to `activity-arrow-embed/pre-squash`'s parent.
- **Scalability:** N/A. One extra measure per labelled arrow at most; the nested render already happens today.
- **On-call / failure modes:** (1) an embed-free arrow label moves → activity golden ratchet fails; (2) a
  nested render throws → `EmbeddedDiagram`'s catch arms (unchanged); (3) a recursion trip → `EmbeddedDiagramDepthError`
  (unchanged, `src/core`).
- **Backwards compatibility:** no API, schema or option change. SVG output changes only for activity-3 arrow labels
  holding an embed line.
- **Irreversible changes:** none.
