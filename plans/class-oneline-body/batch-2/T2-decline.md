# T2: decline the one-line body

**Writes:** `src/diagrams/class/class-declaration-extractors.ts`, `class-command-declarations.ts`,
`class-declaration-parser.ts`, `class-multiline-element.ts` (doc at `:59` only),
`tests/unit/class/class-oneline-body.test.ts` (new), `tests/unit/class/parser.test.ts`,
`tests/unit/class/class-note-creation-index.test.ts`, and the authored gate.
**Reads:** README mechanism table, D1, D2, and the task contract's Java spine.

## Steps

1. **Red.** Create `tests/unit/class/class-oneline-body.test.ts` through `parseClass` (or the file's existing parse
   helper). Name each expectation with its upstream `file:line`.
   - `class A { x : int }` returns a `ParseRefusal` with `kind: 'syntax'`, the refusal line equal to the source line,
     and `message: 'Syntax Error?'`.
   - The two NBSP variants from the issue are refused the same way.
   - `class A { }`, `class A {}` and `class A { }` give classifier `A` with `members: []`, and the body is not
     opened (the next line is not a member).
   - `class A {` followed by `x : int` and `}` gives member `x : int`.
   - A U+2003 inside `{ }` is **not** a Java `%s`. Read `Pattern2.java:56`. Before you assert a direction, render
     `class A { }` through `scripts/oracle-render.sh` and assert what the jar does.
2. **Green.**
   - Add one exported constant in `class-declaration-extractors.ts` for the empty-body tail
     `[%s]*\{[%s]*\}` (`CommandCreateClass.java:117-118`), compiled with `compileUpstream`/`transform` (D2), with a
     JSDoc `@see`.
   - Rewrite `extractBody`: an empty pair means `opensBody: false` and the rest is stripped; a trailing `{` means
     `opensBody: true`; anything else returns the rest unchanged.
   - Narrow the rule 7 gate so a line ending in a non-empty `{…}` does not match (D1). Build the gate from the same
     source as the constant, and update the sync comment at `:23-30`.
   - Delete `ClassifierDecl.inlineMembers`, the member loop at `:350-353`, the `inlineMembers` term at `:424`, and the
     `class Foo { +bar(): String }` doc example at `:73-74`. Fix the doc at `class-multiline-element.ts:59`.
3. Rewrite the two unit tests that assert the over-accept:
   - `parser.test.ts:134` is about the member grammar; move it to the multiline form.
   - `class-note-creation-index.test.ts:76` is about tips; use `class a {\n int i\n}`.
   Journal both.
4. **Measure** (task contract step 5). Expected: the eight T2 rows (README table) pass D3, the controls stay at 0,
   and `ocb-interface`/`ocb-entity`/`ocb-circle` move to a description-drawn leaf (still OPEN, for T2b).
5. **Pin.** Move the rows that pass into `ERROR_PAGE` and rewrite the OPEN reasons.
6. `npm run catalog` if an export was added.

## Acceptance
- Given `class A { x : int }` and its two NBSP variants, when parsed, then the class engine refuses `syntax` at line 2
  with `Syntax Error?`, and `renderSync` prints `Syntax Error? (Assumed diagram type: sequence)` with the Welcome
  block.
- Given `ocb-line3`, when rendered, then the page reads `(Assumed diagram type: class)` at line 3.
- Given the six controls, then each is still 0 diffs and 0 comment mismatches.
- Given every engine survey, then verdict-diff against `<base>` reports 0 lost.
- Given the two edited source files, then neither is longer than it was at `<base>`.

Observability N/A. Rollback Reversible. Commit: `fix(class): refuse a one-line classifier body as the jar does`,
footer `Refs: #223`.
