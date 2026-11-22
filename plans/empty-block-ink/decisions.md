# Decisions

## Pre-made (from the #187 ruling, 2026-11-16)

**D1. Port K at its origin, as a rowless-node branch in `documentDimensions`.**

- _Context:_ the jar ink-walks the drawing (`JsonDiagram#calculateDimension`, `JsonDiagram.java:130-133`). An empty
  block has no lines, so the loop at `TextBlockJson.java:291` draws nothing and only the full-node `URectangle`
  reaches `LimitFinder#drawRectangle`, which records `x + w - 1` / `y + h - 1` (`LimitFinder.java:184-188`). A
  non-empty block reaches `x + w` / `y + h` through each cell's `UEmpty` (`TextBlockMarged.java:83`,
  `LimitFinder.java:159-162`).
- _Decision:_ in `src/diagrams/json/document-dimensions.ts`, a node with `rows.length === 0` pushes
  `x + width - 1` / `y + height - 1`; every other node keeps `x + width` / `y + height`. The `-1` is a named constant
  beside `INK_MIN_CORNER`, citing `LimitFinder.java:184-188`. T1 confirms first that `rows` is empty exactly when
  upstream's `lines` is (the json parser and `TextBlockJson`'s constructor), and that the json node rectangle carries
  no `getDeltaShadow()` (`LimitFinder.java:186-187` adds it).
- _Consequences:_ the 11 rows in the README move as measured; the signature and the exports do not change.
- _Rejected:_ walking each cell's `UEmpty` and the rectangle as separate shapes. It produces the same points with
  more code, and CLAUDE.md forbids refactoring while porting.

**D2. Pin both authored rows, and tighten the corpus rows by hand.**

- _Context:_ the ruling names ceilings, but `authored:json/empty-nested` and `authored:json/nested-arrays` have no
  `json-family-positional.json` entry, so nothing holds them. Authored entries are an existing pattern
  (`authored:json/title-scale` and seven more).
- _Decision:_ T1 edits the 9 corpus entries to their post-K values and adds `authored:json/empty-nested`
  (9.375 / 9.901 / 1 / 9) and `authored:json/nested-arrays` (3.262 / 2.933 / 3 / 0), each at what `residue.mts`
  measures after K. A full `--json` reseed is allowed only if its diff touches no other row.
- _Consequences:_ the one ceiling the ruling raises becomes a real bar, and so do the 10 improvements.
- _Rejected:_ leaving the authored rows unpinned. "Raise its ceiling" would then change nothing, and nothing would
  stop nested-arrays' dh drifting back to 1.

**D3. Mechanism 1 is documentation only.**

- _Decision:_ correct the "Plus two smaller items" sentence to the ruling's text: the jar sets no label on an empty
  node (`SmetanaForJson.java:253-254`) and Smetana sizes the default label (0,16) with no PAD
  (`labels__c.java:119-122`), 15 × 17; graphviz gives an empty record field a single space plus PAD
  (`~/git/graphviz/lib/common/shapes.c:3436-3438`), 19.75 × 25.5. It stays closed without code under the 2026-08-09
  ruling. Name `hcl/function-call` and `hcl/for-expression-empty-array` in the row table at their post-K residue with
  mechanisms `empty-label, U-REC, U-ARROW, U-CLIP` (the #187 counterfactuals E, S1, L), and update the row count,
  the aligned-row sentence and the "await a ruling on #187" clause from a recount, not by arithmetic on the old text.

**D4. Name `authored:json/empty-nested`'s residue only from evidence.**

- _Decision:_ the ruling names its dw 1 as U-REC (E+K gives dw 0, #187). Its node 9.375 / dh 9 predates K. T2 runs
  the L counterfactual (each empty node at Smetana's 15 × 17) and E under `/tmp`. If they close it to the U-REC/U-CLIP
  class, name the row in DIVERGENCES.md by paragraph beside the twins paragraphs; otherwise file a `needs-ruling`
  issue with the numbers and continue.

**D5. Branch and commits.** Serial, main checkout, no worktrees; one unsigned commit per task on
`feature/parity-queue`; squash to one commit on the execution prompt's base with `Refs: #187`.

**D6. No API change.** `dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` stay byte-identical to the T0
snapshot.

## Operational readiness

- **Observability:** N/A. A synchronous pure function library; no new operation, log or metric.
- **Rollback:** Reversible. Revert the squash commit; the pin edits revert with it.
- **Scale:** unchanged; the change is one comparison per node.
- **On-call:** N/A (library). The failure mode is a 1 px canvas regression on a json-family document, which the
  positional pin and the survey catch in CI.
- **Backwards compatibility:** no API or data contract changes. Output SVG for affected documents shrinks by 1 px on
  one axis, toward the jar.

## Auto-confirmed (unattended)

Planned with `/plan-mission --unattended next --branch feature/parity-queue` on 2026-11-21.

- **Selection:** `next` resolved to #187: no `queue:planned` issue was open; #136 is blocked by many open issues and
  #179 by #158 (`needs-ruling`); #187 has no "Blocked by" line. Its title says "Ruling needed", but the body carries
  the maintainer's 2026-11-16 ruling on both questions, so it is not parked.
- **D1:** chosen over a per-shape walk (rejected above). Evidence: the reverted probe at `177d1d9e8` moved exactly the
  11 rows #187 predicted.
- **D2:** chosen over leaving the authored rows unpinned. Evidence: neither key is in
  `oracle/goldens/json-family-positional.json`, and `json-family-positional.test.ts` checks only keys present in the
  pin.
- **D3:** the mechanism labels come from #187's counterfactual table (E = U-REC, S1 = U-ARROW, L = empty-label,
  remainder U-CLIP).
- **D4:** chosen over pinning without diagnosis. Evidence: the ruling names only dw; the other residue has no recorded
  mechanism, and #136 will need one.
