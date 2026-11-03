# Decision journal

| # | date | commit | decision / finding | mechanism or reason |
|---|---|---|---|---|
| 1 | 2026-11-02 | 13f231c40 | T0a: branch off `4f653cac9`, tooling copied from dbp | per spec; `.claude/settings.autonomous.json` is gitignored, copied only |
| 2 | 2026-11-02 | 13f231c40 | b0 gates pass: collected 1899 = on-disk, 36710 tests, typecheck, lint, build; extended baseline 234 rows, 0 MOVED | gates at load 7.6 |
| 3 | 2026-11-02 | 379119f98 | T0b merged: 256 rows, 101 conformant, Σ 2169, 1 jar error page (`sequence__scope-malformed-brace`) | verified from worktree: counts, `diff-row`, one re-render `cmp`-identical |
| 4 | 2026-11-02 | 0970a7a9e | T0c merged: audit contradicts D1 input, D2, D3; D5 incomplete; D4, D6 hold | `measurements/reader-audit.md` §6 |
| 5 | 2026-11-02 | — | **STOP 3.** Amendments D1a, D2a, D3a, D3b, D5a, D7 written to `decisions.md`, pending the user. Batch 1 not started | orchestrator re-measured against the jar: nested note `#FEFFDD`, foboxa `#00F`/`#008000`, two D3 probes, `state__cascade-none` 46 → 0. Taken from T0c unverified: the 3 lost rows, 5 movers, `dajipi` as the only state mover |
| 6 | 2026-11-02 | — | Found by the orchestrator, outside D3's gate: `skinparam noteBackgroundColor` on a class note: jar `#BBB`, ours `#FEFFDD` | `renderer-note-background.ts` `resolveNoteBackground` reads `elements.note` then `NOTE_FILL`, never `theme.colors.noteBackground`; no class corpus row sets the key. To file at exit, do not fix (no `<style>`, stop 5) |
| 7 | 2026-11-02 | — | Batch 0 close: `b0close` gates pass (collected 1901 = on-disk, 36986 tests, typecheck, lint, build); d.ts `cmp` same; extended 0 MOVED; rows 101/256 Σ 2169; `b0-eng` 28 engines, 0 timeouts | merges changed no `src/`, so no verdict diff is owed |
| 8 | 2026-11-02 | — | **User ruled on stop 3:** D1a, D2a, D3a, D3b, D5a accepted; D7 state notes in T3c with stop 5 excepted for the note geos; probe-only sites in scope, state split into T3c + T3e | specs amended; T2a takes `renderer-cluster.ts`, `object__cascade-bg-diag` moves to T3b |
| 9 | 2026-11-02 | — | T0d (orchestrator, added by the ruling): 190 probe rows + jar oracles, pins seeded pre-fix, 0 jar error pages, 0 moved | scratchpad is session-scoped, so the generator moved to `tools/gen-probe-rows.py` |
