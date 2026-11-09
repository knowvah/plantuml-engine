# Batch 4 — styles, groups, notes

Colour, corner, thickness and width read from a merged style: on stereotyped and classed tiles (diamonds, the
start, stop and end circles, repeat and while), on groups (`partition`, `group`, `card`, `rectangle`), and on notes
and boxes with `MaximumWidth`. smc left a pattern for each: the merged style rides on the theme under a symbol key
(D7), and the box path already reads the stereotyped merged style (`activity-box-style.ts`, ubt T1b).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4a](T4a-stereotype-styles.md) | Stereotype and class styles on diamonds, circles, repeat; positional `<style>` (item 15) | orchestrator or `typescript-pro` | activity diamond, terminal and loop style reads; tests | batch 3 | [x] |
| [T4b](T4b-group-styles.md) | Group, card, partition, rectangle styles; notes on groups | orchestrator or `typescript-pro` | activity group tile style reads, group notes; tests | T4a | [x] |
| [T4c](T4c-maximumwidth-swimlane.md) | `MaximumWidth` on boxes and notes; swimlane `<style>` | orchestrator or `typescript-pro` | activity text wrapping, swimlane style reads; tests | T4b | [x] |

Close: the task contract's batch close.

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
