# T3: a multi-line json refusal lands on the closing line

**Writes:** `src/diagrams/description/parser.ts` (the refusal line at `:350`), `src/diagrams/state/state-json-commands.ts`
(or a new module beside it) and the smallest possible change in `src/diagrams/state/parser.ts` (482 lines),
`tests/unit/state/…` and `tests/unit/description/…` tests, and the authored gate.
**Reads:** D4, `PSystemCommandFactory.java:214-247`, the class precedent `class/parser.ts:190-195`.

## Steps

1. **Red.** Unit tests through each engine's parse entry, asserting the refusal's exact `line`:
   - state `state J` / `json J {` / `"a": 1` / `}`: `JSON already exists: J` at line 5 (1-based source line as the jar
     reports it). Today it is 3.
   - description `component J` / the same block: line 5.
   - state and description with `json J #line:red {` … `}`: `No such color` at the closing line.
   - Single-line `json J #line:red {"a": 1}` stays on its own line in both engines.
2. **Green.**
   - **Description:** `tryJsonBlock` gathers the whole block before the header runs, so report the refusal on the
     block's last line, not `i + 1`. Change only the json path, unless the same `i + 1` is provably wrong for another
     multi-line leaf command. If it is, measure and file that instead of widening this task.
   - **State:** defer the refusal until `handlePendingJsonLine` sees the closer, as class does. Keep the body consumed,
     so its lines never reach `dispatchCommand`. Respect the three-pass walk (`state/parser.ts#resetWalk` resets
     `pendingJson` between passes; the duplicate check runs on pass `one` only, `state-json-commands.ts:129-145`).
3. **Measure and pin.** `ocr-state-json`, `ocr-desc-json`, `ocr-state-json-dup` and `ocr-desc-json-dup` must match the
   jar's label, line and Welcome, and are OPEN only on #283. Check the state and component surveys, and run the
   verdict-diff at batch close.

## Acceptance
- Given each of the four rows, when rendered, then label, line and Welcome equal the jar's.
- Given every state and description golden, then none moves (verdict-diff 0 lost).

Observability: N/A. Rollback: Reversible. Commit: `fix(json): report a multi-line json refusal on its last line`,
footer `Refs: #190`.
