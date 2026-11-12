# T3b: the fixtures

**Do:**
1. Copy every probe in `plans/chen-eer-engine-port/probes/` to `tests/fixtures/cheneer/<slug>.puml`.
2. Author the fixtures D6 lists, one per uncovered branch. Name each `cov-<branch>.puml`.
3. Render the oracles with `scripts/oracle-render.sh`, one directory per fixture under `/tmp/ceep-dots/<slug>/`. Copy
   each SVG to `tests/fixtures/cheneer/<slug>.svg`, and keep the `svek-1.dot` files under `/tmp/ceep-dots/` for T4.
4. Run `node plans/chen-eer-engine-port/measurements/jar-variants.mjs /tmp/ceep-T3b/variants 3 tests/fixtures/cheneer/*.puml`.
   Every drawn fixture must be `stable`. Anything else is stop 5.
5. Run `fixtures.mts` and journal the table: count at 0, error pairs, and the first diff of each other fixture, grouped
   by family. That table is T3c's work queue.

## Acceptance
- Given `fixtures.mts`, then every fixture has an oracle SVG and prints a line, and the journal holds the family table.
- Given `jar-variants.mjs`, then every non-error fixture is `stable`.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
