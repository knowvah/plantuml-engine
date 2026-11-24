# T3b: a refused json body closes where the JSON completes

**Writes:** the refused-body close in class (`class/parser.ts:190-195`, 503 lines, so it must not grow; prefer a
helper in `class-json-commands.ts`) and in state if it has the same gap, plus the authored gate.
**Reads:** D4 "T3b", `CommandCreateJson.java:155-166` (`finalVerification`: `OK_PARTIAL` until the JSON parses),
`class-json-commands.ts:125` (`isPendingJsonBodyComplete`).

## Steps

1. Render `ocr-json-nested` and quote the line ours reports. The jar's is 6. Trace why ours stops at the first bare
   `}`.
2. If the fix is under ~20 lines, has a `file:line` origin, and moves no conformant row, write a red unit test, fix
   it, and pin the row (OPEN on #283 only). A refused **map** or **object** body has no JSON. Leave their `}` rule
   alone.
3. Otherwise file a `queue:ready` + `parity` issue with the measurement and `file:line`, and give the row that reason.
4. Author one state variant (`state S` plus the nested block) if state shares the gap, with a stock and release check.

## Acceptance
- Given `ocr-json-nested`, then ours reports line 6, or the row's reason names a filed issue.
- Given every class golden, then none moves.

Observability: N/A. Rollback: Reversible. Commit: `fix(json): close a refused json body where the json completes`,
footer `Refs: #190` (only if fixed; if filed, the gate change rides in the batch close commit).
