# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | File D3's residues, final measure, d.ts check, ledger | orchestrator | gates, `planning/next-missions.md`, README | T1c | [x] |

## T2

1. **File D3 R1 and R2.** Each gets a `queue:ready` + `parity` issue built from the evidence in `decisions.md`, D3:
   - the probe source and the `scale 1` diff count;
   - the key attributes from both outputs;
   - the upstream `file:line` you read before filing. For R1 that is `USymbolFrame#asBig` and the style the jar reads
     for a `group`/`partition` cluster. For R2 it is `ClusterHeader.java:152-160`.

   Check `gh issue list --state open --search "<keyword>"` first, so you do not file a duplicate. Point the gate's
   `scale-group`, `scale-partition` and `package-fontsize` reasons at the new numbers.
2. Run the measurer. Every gate row is `ZERO`, or `OPEN` naming a filed issue. Any other residual found in batch 1 is
   filed the same way.
3. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/ugs-base-dts/`. Any change is stop 5.
4. Confirm `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged since `<base>` (D4).
5. Add a "usymbol-group-scale (ugs)" section to `planning/next-missions.md` naming the issues from steps 1 and 2.
6. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, probes start → exit,
   d.ts, follow-ons, CI risk), following `plans/usecase-title-style/README.md`.

## Acceptance
- Given the exit tree, when the authored gate runs, then every `OPEN` row names a filed issue.
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
