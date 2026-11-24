# T2: refuse a capture that is not a bare colour

**Writes:**
- `src/core/klimt/color/HColorSet.ts`
- `src/diagrams/class/class-object-commands.ts`
- `src/core/command/CommandCreateJson.ts`
- `src/diagrams/class/class-json-commands.ts`
- `src/diagrams/state/state-json-commands.ts`
- `src/diagrams/description/command-json.ts`
- `src/diagrams/class/class-parse-state.ts` and `class/parser.ts:190-195`, only if `pendingBodyRefusal` needs a score
  (D3)
- a new unit test (`tests/unit/class/object-colour-refusal.test.ts`, plus a predicate test beside the existing
  `HColorSet` tests)
- `DIVERGENCES.md` (one sentence)
- the authored gate

**Reads:** README mechanism table, D1 to D3, the task contract's Java spine.

## Steps

1. **Red.** Write unit tests that assert exact values, and name each expectation with its upstream `file:line`:
   - The predicate (D2):
     - refuses `#line:zzblue`, `#line:red`, `#back:red`, `#text:red`, `#pink;line:blue`, `#line.dashed`;
     - accepts `#red`, `#red/blue`, `#transparent`, `#zzblue` (bare, the neutral ruling), `#back`, `#line`.
   - `parseClass` on `object O #line:red` returns a refusal with `kind: 'execution'`, the line, `message: 'No such
     color'`, and the badColor `commandScore`.
   - `object O` then `object O #line:red`: the refusal is `Object already exists: O` (order, `:126-127` before
     `:145-147`).
   - `object O #line:red {` / `x = 1` / `}`: the refusal is on the `}` line.
   - `json J #line:red {"a": 1}` and the multi-line `json J #line:red {` … `}`: refused the same way, the multi-line
     one on its last line.
   - `json J #red {"a": 1}`: no refusal, and the stored colour is unchanged.
2. **Green.**
   - Add the predicate to `HColorSet.ts` beside `colorOrNeutral` (D2), and `npm run catalog`.
   - `applyObjectDecl`: after the duplicate check, refuse when the predicate holds. `applyObjectMultilineOpen`: arm
     `pendingBodyRefusal`, and still consume the body.
   - `CommandCreateJson.ts`: add one refusal member to `JsonCommandHost`. Both apply functions call it after
     `host.resolve` returns an entity and before the data is read (D3). Implement it in the three hosts: class routes
     single-line to `refuseNow` and multi-line to `pendingBodyRefusal`; state and description route to
     `executionError`. Keep the `@see` comments on each.
   - Add one sentence to DIVERGENCES.md's neutral-ruling paragraph, after "we mirror the jar.". At `object` and `json`
     declarations the whole capture goes to `getColor` (`CommandCreateEntityObject.java:145-147`,
     `CommandCreateJson.java:223-225`), so a `name:value` capture errors there, and the port errors too. This adds no
     divergence. It states where the existing ruling ends.
3. Find any existing unit test that asserts an object or json drawn with a `name:value` colour, and rewrite it
   (README "These are not stops"). Journal each one.
4. **Measure** (task contract step 5). Expected:
   - every Welcome error row in the README table passes D5, including `ocr-state-json-single` and
     `ocr-desc-json-single`;
   - `ocr-long`, `ocr-multiline`, `ocr-multiline-back` and `ocr-json-multi` match the jar's label, line and Welcome
     and are OPEN only on #283;
   - `ocr-state-json` and `ocr-desc-json` are refused but on line 3, until T3;
   - `ocr-json-nested` is refused, but on line 5, until T3b;
   - the controls stay at 0, and `ocr-unknown-bare` is unchanged.

   If a state or description row names the wrong "Assumed diagram type", read the factory merge
   (`PSystemErrorUtils#merge`) before you touch the score.
5. **Pin.** Move the passing rows into `ERROR_PAGE`, and rewrite each remaining OPEN reason.

## Acceptance
- Given `ocr-issue` and `ocr-line-red`, when rendered, then each prints `No such color (Assumed diagram type: class)`
  at line 2 with the Welcome block, and every diff is on the footer.
- Given `ocr-unknown-bare`, then it still draws `fill="#D3D3D3"` and is not an error page.
- Given the seven controls and the seven corpus guards (README "Corpus"), then each stays conformant.
- Given every engine survey, then verdict-diff against `<base>` reports 0 lost.
- Given `src/diagrams/class/parser.ts`, then it is no longer than 503 lines.

Observability: N/A. Rollback: Reversible. Commit: `fix(object): refuse a name:value colour as the jar does`, footer
`Refs: #190`.
