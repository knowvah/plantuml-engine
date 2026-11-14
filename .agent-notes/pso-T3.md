# pso-T3: close-out

## Observation: dss-T3d "no-style frame skinparams lose their order" is resolved
- **Context**: closing #138.
- **Finding**: `.agent-notes/dss-T3d.md` recorded that, with no `<style>`, the flat frame tiers always take
  `Partition*` and ignore declaration order. pso-T2 (`fix(activity): read frame colours off the merged partition
  style`, squashed into the pso commit on `feature/parity-queue`) reads the frame's merged positional style instead
  (`FtileGroup.java:99-102`), so the later declaration wins and a key declared after the frame does not reach it.
  48 `__frameorder-` rows in `diagram-style-scope` are at 0.
- **Impact**: the flat tiers (`graph.partition*`, `elements.<symbol>`, `graph.package*`) now decide frame colours only
  for a hand-built theme with no `graph.activity.compositeStyleOf`.
- **Confidence**: High

## Observation: issue comments allowed in this run
- **Context**: T3's outcome comments.
- **Finding**: `gh issue comment` on #138 and #136 succeeded (comments 6860690967, 6860694841).
- **Impact**: none; recorded so the queue knows the text is on GitHub, not only here.
- **Confidence**: High
