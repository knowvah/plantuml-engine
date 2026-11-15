## Observation: DIVERGENCES.md holds three concatenated copies of itself
- **Context**: Adding hyogr's hcl rows to the Smetana row-level table (#142, T2b).
- **Finding**: `DIVERGENCES.md` (2280 lines at `1f154d2e4`) has `## General` at lines 15, 475 and 847, and the Smetana row table at 97 and 554. Line ~462 ends mid-sentence ("`$i = 1`") and runs straight into "# Intentional Divergences from U…", the file's own opening. The copies after it are older (for example, they lack the `@startgit` U-BOX block). Introduced by `82b9128ea` (2026-11-06, "fix(activity): mirror arrow labels…", +755 lines in DIVERGENCES.md). Present at every later commit, `main` included (2274 lines).
- **Impact**: `grep` hits in DIVERGENCES.md come back two or three times, and an edit to the second copy edits stale text. hyogr edits only the first copy (lines 17-262). Needs a dedicated cleanup PR that truncates at the splice point after diffing the tail copies for any unique text.
- **Confidence**: High
