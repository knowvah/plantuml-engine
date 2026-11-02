# T2d — batch 2 close and re-pin

Agent: orchestrator. Follows [../close-procedure.md](../close-procedure.md)
with `N = 2`, `prev = b1`. Commit: `chore(dbp-b2): close batch 2 — document
background through the SvgGraphics branches`.

## Specifics
- Merge order: T2c (independent), then T2a, then T2b; measure after all three.
- Expected movers: dbg `-gradient`/`-black` rows of json, yaml, hcl (extended
  only), state, class, object, component, usecase, mindmap, salt → conformant;
  extended-mode rows with a `<style>` document background. Any corpus mover
  without a document/skinparam background needs its own mechanism (halt otherwise).
- A `-gradient` row that is not conformant after all three merges: diagnose
  (stop 2 budget) — mechanism, origin, ruled out — before any fix commit.
- Pin: every dbg row lowered to its measure; conformant engines' new pins (count bumps).
- `fixtures.md`: b2 row.

## Acceptance
- Given the b2 measure vs b1, then no dbg row rose, no conformant row lost in 28 engines, and every mover has a journal row.
- Given the in-scope `-gradient` and `-black` rows, then all conformant (or a journaled non-background residue).

Observability: N/A. Rollback: Reversible.
