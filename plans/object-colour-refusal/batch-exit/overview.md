# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Re-measure every engine, regenerate the reports, check the d.ts, file the separable finding, comment on #190 | orchestrator | `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, this brief | T3b | [x] |

## T4

1. If any `src/` change landed after batch 3's close survey, rerun `npm run svg:survey` and
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must show 0 lost in every
   engine. Otherwise batch 3's close stands; journal that.
2. Run `npm run parity:dashboard`. If `docs/parity-report.md` differs only in timestamps, leave it at HEAD and journal
   it.
3. Run `npm run build`, then `diff -r /tmp/ocr-base-dts dist`, limited to `*.d.ts`. There must be no change (stop
   condition 5).
4. **File D6's `#transparent` finding** (`gh issue create --label queue:ready --label parity`). Include the three
   rows (`object O #transparent`, `object O #background`, `class C #transparent`), the 2 diffs (`fill` `#000` vs
   `none`), upstream's `HColorSet.java:82-83`, and our `file:line` where `transparent` becomes `#000`. Then set
   `ocr-ctl-transparent`'s reason to the new issue number. Add `Blocked by #<new>.` to #136 only if you can edit it;
   otherwise say so in the #190 comment, as earlier missions did.
5. **Final gate measurement.** Run `npx tsx plans/hidden-note-host/measurements/measure.mts
   tests/fixtures/object-colour-refusal /tmp/ocr-final.json`, then the authored gate. In the README "Mission summary",
   record the `ZERO`/`ERROR_PAGE`/`OPEN` counts and every open row with its reason.
6. **Comment on #190** with `gh issue comment 190 --body-file <file>`. Include:
   - the answer to the issue's question (D1: mirror; the release jar errors too) and the mechanism, ours and upstream's,
     with `file:line`;
   - the four commands covered and the state/description line fix (D4), which also moves `JSON already exists`;
   - the gate before and after;
   - any issue filed, and the rows held on #283;
   - that the issue stays open until the branch merges.
7. Write the README "Mission summary": tasks, pre-squash commit shas, gate counts, decisions flagged for review, and
   follow-ups. Tick the batches, run the README gates, and commit.

## Acceptance
- Given the final tree, then every engine shows 0 lost against `<base>`, `dist/*.d.ts` is unchanged, and #190 carries
  the summary comment.
- Given the gate, then `ocr-issue` and `ocr-line-red` are `ERROR_PAGE` rows, and each OPEN row's reason is true today.

Observability: N/A. Rollback: Reversible.
