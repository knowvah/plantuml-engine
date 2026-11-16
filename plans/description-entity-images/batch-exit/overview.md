# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Pin, final measure, follow-on issues, d.ts check, ledger | orchestrator | ratchet, goldens, gates, `planning/next-missions.md`, README | T4c | [x] |

## T5

1. Run the measurer. Every row at zero is a pin candidate.
2. Pin under the "Add rule" of `oracle/goldens/svg-description/README.md` (conformant **and** `dotEqual: true` in the
   row's per-type survey):
   - the three rows: copy `test-results/dot-cache/unknown/<slug>/{in.puml,in.svg}` to
     `oracle/goldens/svg-description/unknown/<slug>/{in.puml,golden.svg}`, append `type: "unknown"`,
     `source: "dot-cache"`, `addedAt: <today>`;
   - each `dei-*` fixture: append `type: "component"`, `source: "authored"`.
   Run `npx vitest run tests/oracle/svg-conformance/description.golden.ratchet.test.ts` and read the count: it must
   rise by exactly the number pinned. Update any count a gate asserts, with a dated comment in that test's pattern.
3. For each row or fixture not at zero: confirm its residual is separable (D6), file a `queue:ready` + `parity` issue
   with the probe source, both outputs' key attributes and the upstream `file:line`, and name it in the journal.
4. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/dei-base-dts/`. Any change is stop 5.
5. Confirm `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged since `<base>` (D5).
6. Add a "description-entity-images (dei)" section to `planning/next-missions.md`: the issues from step 3, and the D1
   follow-on (re-point class map and state json at the new core images, as its own shared-seam mission).
7. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, rows start → exit,
   d.ts, follow-ons, CI risk), following `plans/unresolved-colour/README.md`.

## Acceptance
- Given the exit tree, when the description ratchet runs, then the three rows are pinned, or each unpinned one names a
  filed issue in the journal.
- Given `verdict-diff.mjs <base>`, when run, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
