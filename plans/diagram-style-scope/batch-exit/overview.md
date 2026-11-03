# Exit — final measurement, docs, follow-ons, memory, PR prep

Agent: orchestrator. Commits: `chore(dss-exit): exit bar — <summary>`, then `docs(dss): close out`.

## Steps
1. **Final measurement** at load < 8: `gates.sh final`; `cmp dist/plantuml-ts.d.ts $M/b0-plantuml-ts.d.ts.txt`;
   chain `final-eng` vs **b0**: 0 conformant losses in all 28 engines (reuse the b4 chain if `src` is unchanged since).
   `npx tsx $T/diff-row.mts --all --json $M/final-rows.json`.
2. **Bar (README "Target"):** every row conformant, at its `cascade-none` baseline, or carrying a journaled named residue; no row
   above b0; pins ≥ b0 in every engine; d.ts identical; every extended mover journaled.
3. **Probe past the rows** (memory `probe-past-authored-rows`): the feature × title, chrome and stereotype, pre vs now. Ask the user before growing scope.
4. **DIVERGENCES.md**: nothing new unless a row stays non-conformant for a library-forced reason.
5. **Other docs:** `planning/next-missions.md` dbp section: strike follow-ons 5 and 7 with their commits; add: malformed `<style>` jar error
   pages (D6), other cascading properties (`FontSize`, `LineThickness`, `RoundCorner`, `Shadowing`), dark mode's other diffs, monochrome/reverse
   root background, board/packet/chart residuals, any B3 residue. `planning/mission-guide.md` open-work line.
6. **Dashboards:** `npm run parity:dashboard`, `npm run catalog`.
7. **Memory:** `dss-status` memory + MEMORY.md line; `.agent-notes/dss-execution.md` (novel findings only).
8. **README:** final status block (per-batch counts from `fixtures.md`).
9. **PR prep:** PR body in the scratchpad (one line per batch, rows before → after, test plan). Then the [squash batch](../batch-squash/overview.md).

## Acceptance
- Given the final diff vs b0, then 0 conformant losses in all 28 engines and the d.ts is byte-identical.
- Given `planning/next-missions.md`, then the struck follow-ons cite their commits and every new follow-on has a reason.

Observability: N/A. Rollback: Reversible.
