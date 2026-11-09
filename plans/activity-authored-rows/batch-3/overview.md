# Batch 3 — arrow colours

An arrow's colour, dash and thickness ride on its `LinkRendering` as a `Rainbow`
(`decoration/Rainbow.java`, `activitydiagram3/LinkRendering.java`). Each tile builder decides which rendering an
edge takes: its own in-rendering, a branch's out-rendering, or the default from the `arrow` style. A wrong pick
draws `#181818` where the jar draws the user's colour, or the reverse. Batch 2's label work reads the same
`LinkRendering` objects, which is why this batch follows it.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-arrow-colour-placement.md) | Which edge a `-[#c]->` colours, in loops, branches, switches and groups | orchestrator or `typescript-pro` | activity connectors and tile link renderings; tests | batch 2 | [x] |
| [T3b](T3b-rainbow.md) | Multi-colour `-[#a;#b]->`, `colorArrowSeparationSpace`, coloured `inc`/`out` labels | orchestrator or `typescript-pro` | rainbow drawing, its width in layout; tests | T3a | [x] |
| [T3c](T3c-arrow-style-group-in.md) | Arrow `<style>` (`LineColor`, `HeadColor`, `Font*`); a group's inner in-link colour (item 16) | orchestrator or `typescript-pro` | activity arrow style reads, group tile; tests | T3b | [x] |

Close: the task contract's batch close.

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
