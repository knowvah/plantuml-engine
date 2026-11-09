# T2d — autarkic groups

**Java:** `dot/CucaDiagramSimplifierActivity.java` (70), `svek/GroupMakerActivity.java` (155),
`abel/Entity.java#isAutarkic` and `:694-697`, `Entity#overrideImage`.

**Writes:** `src/diagrams/activity-legacy/{CucaDiagramSimplifierActivity,GroupMakerActivity}.ts`, the layout hook that
runs the simplifier before the DOT is built, `tests/unit/activity-legacy/autarkic.test.ts`.
**Reads:** `src/diagrams/state/state-composite-autonom.ts` (the state analogue, `GroupMakerState`).

## Acceptance
- Given `activity/fozoxu-26-fibu076` (`(*) --> {` with an unclosed brace), the one row with `svek-1.dot` and
  `svek-2.dot`, then our two `layoutGraph` calls pair 1:1 with them in order.
- Given `lap-inner-brace`, then the inner group is laid out first and drawn as one `ACTIVITY` image in the parent.

Observability: N/A — no new observable operations. Rollback: Reversible.
