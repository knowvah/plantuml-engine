# Exit — final measurement, docs, follow-ons, memory, PR prep

Agent: orchestrator. Commits: `chore(dbp-exit): exit bar — <summary>`, then `docs(dbp): close out`.

## Steps
1. **Final measurement** at load < 8: `gates.sh final`; `cmp dist/plantuml-ts.d.ts $M/b0-plantuml-ts.d.ts.txt`;
   chain `final-eng` vs **b0**: 0 conformant losses in all 28 engines (reuse the
   b2 chain if `git rev-parse HEAD:src` is unchanged since).
   `npx tsx $T/diff-row.mts --all --json $M/final-dbg.json`.
2. **Bar (README "Target"):** every in-scope dbg row conformant or carrying a
   journaled non-background residue; no dbg row above b0; pins ≥ b0 in every
   engine; d.ts identical; every extended mover journaled; the mindmap throw gone.
3. **DIVERGENCES.md**: nothing new unless a row stays non-conformant for a
   library-forced reason (then one line naming the library). Update any
   sentence that said a `<style>` document gradient is unsupported.
4. **Other docs:** `planning/next-missions.md` — strike jff follow-ons a, b, c
   with their dbp commits; add: timing/ebnf/regex document background (with
   their ports), converge sequence/activity onto `svg-backcolor.ts` (D2),
   any board/packet/chart/chronology finding from T0b, any non-background
   residue found in B2. `planning/mission-guide.md` open-work line (dbp).
5. **Dashboards:** `npm run parity:dashboard`, `npm run catalog`.
6. **Memory:** `dbp-status` memory + MEMORY.md line; `.agent-notes/dbp-execution.md` (novel findings only).
7. **README:** final status block (per-batch counts from `fixtures.md`).
8. **PR prep:** PR body in the scratchpad (one line per batch, the dbg rows
   before → after, the engines fixed, test plan). Then the [squash batch](../batch-squash/overview.md).

## Acceptance
- Given the final diff vs b0, then 0 conformant losses in all 28 engines and the d.ts is byte-identical.
- Given `planning/next-missions.md`, then jff a/b/c are struck with their resolving commits and every new follow-on is listed with a reason.

Observability: N/A. Rollback: Reversible.
