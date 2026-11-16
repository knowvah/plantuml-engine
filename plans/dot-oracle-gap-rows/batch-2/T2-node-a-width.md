# T2: the `Node A` width

**Rows:** `quoted-labels` (18 diffs), `skinparam-font-color` (17 diffs). **Why:** D4.

Both rows place node `a` (`label="Node A"`) at `rx` 40.09 where the jar has 39.58, and every later diff follows from
that wider node. Node `b` (`Node B`) already matches. The README gives the planning reads. They are leads, not
mechanisms.

## Steps

1. **The Java.** Quote what the jar does with the source between `@startdot` and `@enddot`: what it strips (the
   `skinparam FontColor` line in `skinparam-font-color`), what it hands graphviz, and with which arguments
   (`PSystemDot.java`, `PSystemDotFactory.java`). If the jar changes the DOT in a way we do not, that is outcome 1.
2. **Ours.** Read `src/diagrams/dot/` (parser, layout, renderer) and `src/core/dot-engine-measurer.ts`. Check that we
   pass the same DOT text and the same font name and size to the engine.
3. **graphviz.** Read `~/git/graphviz/lib/common/textspan.c` (`textspan_size`, `estimate_textspan_size`) and
   `textspan_lut.c`. Establish which path native 16.1.0 takes here, with evidence:
   - probe native `dot -Tsvg` on DOT files under `/tmp` whose labels isolate the pair: `Node A`, `NodeA`, `Node B`,
     `A`, ` A`, and another kerned pair such as `AV` or `To`;
   - compare each probe with dot-engine's `LutTextMeasurer` width and its rendered `rx`.
   A controlled probe that moves exactly with the kern pair is the evidence. A matching number alone is not.
4. **Decide by D4's three outcomes**, and record the mechanism artifact in the journal (mechanism, origin `file:line`,
   causal chain, ruled out):
   1. **Ours:** red test in `tests/unit/dot/dogr-T2.test.ts` asserting the jar's `rx` for node `a`, port the fix,
      measure, pin both rows with `dogr-T2`, and update the corpus count to 62 and the routing/refusal counts.
   2. **dot-engine:** write `docs/graphviz-issues/<next NN>-*.md` (self-contained: probe DOT, native output, engine
      output, the C quote) and a `TRACKER.md` line in the existing format. Name the rows in the journal.
   3. **Oracle host:** open a `needs-ruling` issue (`gh issue create --label parity --label needs-ruling`) with the
      probe table, the C quote and the two rows, and cite #170 as the same family. Name it in the journal.
   For outcomes 2 and 3, the 2 rows stay unpinned and the corpus count stays 60. Do not fit (stop 6).
5. Comment on #141 with the outcome, the mechanism and the issue or graphviz-issues file.

## Acceptance
- Given the journal, then T2's entry has the full mechanism artifact, with at least one ruled-out alternative backed
  by a probe.
- Given outcome 1, then both rows measure `n=0` and are pinned, and no other row in any engine moved away from the jar.
- Given outcome 2 or 3, then the graphviz-issues file and TRACKER line, or the `needs-ruling` issue, exist and name
  both rows, and no `src/` file changed.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
