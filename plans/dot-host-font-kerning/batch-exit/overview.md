# Batch exit: verify, close out

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Verify that no verdict moved and nothing under `src/` changed; write the issue comment | orchestrator | journal, `.agent-notes/dhk-T3.md`, `plans/dot-host-font-kerning/issue-comment.md` | T2 | [x] |

## T3

1. `git diff <base> HEAD --stat -- src` is empty (D1). If it is not, that is README stop 2.
2. Survey: `npm run svg:survey -- dot --out tests/oracle/svg-conformance/parity-dot.json`. Without `--out`, a
   positional type overwrites `parity.json`. Only `generatedAt` may move: 62 rows, 62 `conformant`, the same as at
   `<base>`. With no `src/` change, the other 28 engines' parity files cannot move, so the every-engine survey is
   not re-run. Journal that reasoning. If `parity-dot.json` changed beyond `generatedAt`, run
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. A loss is README stop 5.
3. `npx tsx plans/dot-host-font-kerning/measurements/measure-accepted.mts /tmp/dhk/oracle /tmp/dhk/src` must still
   print the pinned numbers.
4. `git diff <base> HEAD -- oracle/accepted-divergences.json` adds exactly 2 entries and changes no other line except
   the closing bracket and comma.
5. Write `.agent-notes/dhk-T3.md` with the D3 follow-up. The dot survey surveys LEGACY captures since cfb9ecd55, so
   it is blind to every drawn `@startdot` row. A harness mission could survey `dot` under INSECURE, as
   `golden-security-profile.ts` does for `goldens`/`svg-dot`. Mark confidence High and cite the evidence.
6. Write `plans/dot-host-font-kerning/issue-comment.md`, which the driver posts on #186: what landed, both rows with
   their pinned scores, and the DIVERGENCES.md heading. Do not post it yourself.
7. Run the gates, journal the close, and commit: `chore(dhk): close out the dot-host-font-kerning mission`.

## Acceptance
- Given the mission diff, then nothing under `src/` changed, and `parity-dot.json` differs from `<base>` in
  `generatedAt` at most.
- Given all gates, then all pass.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
