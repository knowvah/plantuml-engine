# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | File D3's residues, final measure, d.ts check, ledger | orchestrator | gates, `planning/next-missions.md`, README | T1d | [x] |

## T2

1. **File D3 R1, R2 and R3.** Each gets a `queue:ready` + `parity` issue built from the evidence in `decisions.md`, D3:
   - the probe source, its diff count, and the `XX` control's 0;
   - the key attributes from both outputs;
   - the upstream `file:line` and our `file:line` you read before filing.

   Check `gh issue list --state open --search "emoji"` first, so you do not file a duplicate. Point the gate's D3 rows'
   reasons at the new numbers.
2. Run the measurer. Every gate row is `ZERO`, or `OPEN` naming a filed issue. Any other residual found in batch 1 is
   filed the same way.
3. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/eea-base-dts/`. Any change is stop 5.
4. Confirm `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged since `<base>` (D4).
5. Add an "emoji-edge-artwork (eea)" section to `planning/next-missions.md` naming the issues from steps 1 and 2.
6. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, probes start → exit,
   d.ts, follow-ons, CI risk), following `plans/usymbol-group-scale/README.md`.

## Acceptance
- Given the exit tree, when the authored gate runs, then every `OPEN` row names a filed issue.
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
