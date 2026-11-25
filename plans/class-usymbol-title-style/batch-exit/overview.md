# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Re-measure every engine, regenerate the reports, check the d.ts, file the separable findings, comment on #195 | orchestrator | `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, both gates, this brief | T3 | [x] |

## T4

1. If any `src/` change landed after batch 2's close survey, rerun `npm run svg:survey` and
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must show 0 lost in every
   engine. Otherwise batch 2's close stands; journal that.
2. Run `npm run parity:dashboard`. If `docs/parity-report.md` differs only in timestamps, leave it at HEAD and journal
   it.
3. Run `npm run build`, then `diff -r /tmp/cuts-base-dts dist`, limited to `*.d.ts`. There must be no change (stop
   condition 5).
4. **File the two separable findings** (`gh issue create --label queue:ready --label parity`), each with its
   measurement and both sides' `file:line`, unless T2/T3 already fixed it under push-forward:
   - **Class usecase stereotype sizing.** `usecase U <<S>>` beside `usecase V` in a class `allowmixing` diagram is 85
     diffs with no title skinparam (`svg/@width` 107 vs 126, `@height` 154 vs 167; probe in
     `measurements/plan-baseline.txt`, row `cuts-stereo`). Find our sizer line before filing. Set the gate row
     `stereo`'s reason to the new number.
   - **Class descriptive leaf `name:value` colour.** `CommandCreateElementFull2.java:289-292` hands the `COLOR`
     capture to the throwing `getColor`, so the jar reports `No such color` on `usecase U #line:blue`,
     `actor A #line:blue`, `actor A #line.dashed`, `component C #line:blue`, `usecase U #pink;line:blue` and
     `usecase U ##blue` (all line 6 of the planning probe; bare `#pink` draws). The port draws all six. Cite
     `#190`/`object-colour-refusal` as the pattern and our parse site. Check whether `resolveForecolor`/
     `resolveStroke`'s inline `line`/`lineStyle` tiers are then reachable only from other commands, and say so.
   Add `Blocked by #<new>.` to #136 only if you can edit it; otherwise say so in the #195 comment, as earlier
   missions did.
5. **Final gate measurement.** Run the measurer on `tests/fixtures/class-usymbol-title-style`, then both gates. In the
   README "Mission summary", record the `ZERO`/`OPEN` counts and every open row with its reason.
6. **Comment on #195** with `gh issue comment 195 --body-file <file>`. Include:
   - the mechanism, ours and upstream's, with `file:line`, and that it covers every class `EntityImageDescription`
     leaf (usecase, actor, component, database, rectangle, node, cloud, circle), not only the issue's two;
   - the gate before and after, and the uts row;
   - the issues filed;
   - that the issue stays open until the branch merges.
7. Write the README "Mission summary": tasks, pre-squash commit shas, gate counts, decisions flagged for review, and
   follow-ups. Tick the batches, run the README gates, and commit.

## Acceptance
- Given the final tree, then every engine shows 0 lost against `<base>`, `dist/*.d.ts` is unchanged, and #195 carries
  the summary comment.
- Given both gates, then `skin-title-allowmixing` is `ZERO` and each `OPEN` row's reason is true today.

Observability: N/A. Rollback: Reversible.
