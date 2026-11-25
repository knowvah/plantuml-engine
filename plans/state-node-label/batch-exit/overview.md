# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T7 | ELK row, every-engine verdict, d.ts check, follow-ups, mission summary | orchestrator | gate, parity json, docs, this brief | T6 | [x] |

## T7

1. **ELK** (`snl-elk`, D6): measure; pin, fix (under ~20 lines, `file:line`, 0 rows moved) or file a `queue:ready` +
   `parity` issue with the measurement, and give the row that reason.
2. **Every engine:** `npm run svg:survey`, then `verdict-diff.mjs <base>`: 0 lost, 0 timeouts (rerun at lower load
   before calling a timeout a finding). List census attributes that moved away from the jar.
3. **d.ts:** `npm run build`, then `diff -r /tmp/snl-base-dts dist` restricted to `*.d.ts`: empty (stop 5).
4. **Catalog and dashboard:** `npm run catalog`, `npm run parity:dashboard`.
5. **Follow-ups:** every OPEN row names a filed issue or a ruling. Comment on #236 with what it can reuse (D6). If
   `#136` tracks parity blockers, add `Blocked by #N` for each issue filed here, as the convention in prior missions.
6. **Graphviz findings:** any verified `@knowvah/dot-engine` finding gets a `docs/graphviz-issues/*.md` and a
   `TRACKER.md` line before this task closes.
7. **Summary:** append a "Mission summary" to the README (tasks, gate counts T1 → final, open rows and reasons,
   decisions flagged for review, follow-ups), tick the boxes, run the gates, commit.

## Acceptance
- Given the final tree, when verdict-diff runs against `<base>`, then every engine shows 0 lost.
- Given the gate, when it runs, then `snl-issue` and `snl-issue-nonode` are ZERO and every OPEN row has a true reason.
- Given `dist/*.d.ts`, when diffed against the T0 snapshot, then nothing moved.

Observability: N/A. Rollback: Reversible.
