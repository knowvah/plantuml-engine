# Decisions

## D1. The rule 7 gate declines the line; no command refuses it

**Context.** Upstream has no command that matches `class A { x : int }`. The line falls through every class command
to `SYNTAX_ERROR` (`PSystemCommandFactory.java:206-208`). Our rule 7 gate
(`class-command-declarations.ts:32-38`) matches the keyword prefix and claims the line.

**Decision.** Narrow the rule 7 gate so that it **does not match** a line whose tail is a non-empty brace pair. The
line then reaches the later commands (notes, rule 9 descriptive leaves, the annotation fallback) and
`buildSyntaxRefusal` (`parser.ts:320-323`), as upstream's does. The gate and `extractBody` read **one** exported
pattern constant, so they cannot drift apart. The comment at `:23-30` already warns that the gate is a separate copy.

**Rejected.**
- *Refuse in `execute`*, as `refuseStateBody` does (`class-descriptive-leaf-command.ts:150-155`). It is smaller, but
  then a command "matched" where upstream has none, so the later commands never try the line. That is a structural
  divergence (CLAUDE.md, porting discipline).
- *Replace the gate with `compileUpstream(CommandCreateClass)`*. This is the most faithful option, but it re-decides
  every classifier declaration line in the corpus. That is a separate mission with its own survey risk, and #223 does
  not need it.

**Evidence.** In the planning probe, the decline produced the jar's message and line on 8 rows. The class survey lost
0 rows (872 conformant), and 2 unit tests broke, both asserting the over-accept.

**Consequences.** A source containing such a line can now be claimed by another engine. The description engine
claims `entity|interface|circle` (D4). The verdict-diff over every engine is the guard.

## D2. `extractBody` keeps exactly upstream's two brace forms

**Decision.**
- `[%s]*\{[%s]*\}` at the end of the line is an empty body: no members, body not opened
  (`CommandCreateClass.java:117-119`).
- A trailing `\{` opens the body (`CommandCreateClassMultilines.java:140-142`).
- Nothing else is a body.
- Build the pattern with the port's `%s` transform (`src/core/url/UrlBuilder.ts#transform`, via `compileUpstream` in
  `src/core/command/CommandCreateElementFull.ts:48`). That is Java `\s` plus U+00A0 (`Pattern2.java:56`), not JS
  `\s`, which also matches U+2000-U+200A and others the jar does not.
- Remove `ClassifierDecl.inlineMembers`, its `;` split and the loop that applies it
  (`class-declaration-parser.ts:350-353`). It is dead once the body is always empty, and the split has no upstream
  origin.
- `refuseFailedMute`'s `multiline` (`:424`) becomes `decl.opensBody`. That is unchanged behaviour, because
  `inlineMembers` was always empty for `{}`.

**Consequences.** Both files are over the 500-line cap; this shrinks them. `ocb-ctl-empty-nbsp` pins the U+00A0 case.

## D3. What "conformant" means for an error row

Per the 2026-10-10 ruling (docs/svg-conformance.md "Error pages"), the jar's error page is not compared byte for
byte, and the stock jar must also error. Issue #223 asks for the same message, the same line and the Welcome block.
An error row in the authored gate therefore asserts all of these:

1. Ours is an error page (`setErrorPageObserver`, `src/core/error/error-renderer.ts:45`, fires once).
2. The label text equals the jar's: `Syntax Error? (Assumed diagram type: X)`.
3. The `(line N)` number equals the jar's.
4. The Welcome block is present in ours exactly when it is present in the jar's.

The row also records its `compareSvg` diff list. Every diff must sit on the footer the ruling exempts (the version
text and the `[From … ]` box; DIVERGENCES.md "Error pages print this port's version"). Identify the footer by
**content**, not by a fixed index: the `<text>` whose jar value starts `PlantUML version`, the `<text>` whose jar
value starts `[From `, and the `<rect>` drawn behind it. On `ocb-issue` those were `text[18]`, `text[19]` and
`rect[3]`, and the indexes move with the page. A non-footer diff fails the row. The stock check (README) is run
once per error row when its fixture is authored, and recorded in the journal.

Draw rows (the controls) use the usual bar: 0 diffs and 0 comment mismatches.

## D4. Sibling over-accepts are separate mechanisms

- **Description `KEYWORD_RE`** (`parse-helpers.ts:414`, `command-table-containers.ts:174`) accepts any
  `<keyword> <rest>`. That is wider than `CommandCreateElementFull`'s CODE/DISPLAY alternation
  (`CommandCreateElementFull.java:126-132`). It reproduces with no class involved (`circle Z { a }` alone). The fix
  belongs to the description engine's catch-all, which many rows depend on.
- **Class bareword fallback** in `parseIdDisplay` (`class-declaration-extractors.ts:387+`) accepts a name that
  upstream's CODE `[%pLN_$]+…` rejects (`CommandCreateClassMultilines.java:92`).

**Decision.** T2b traces each with `file:line`. It fixes one inside the mission only under push-forward (under ~20
lines, 0 rows moved). Otherwise it files a `queue:ready` issue with the measurement and gives the row that reason.

## D5. Measurement reuses `plans/hidden-note-host/measurements/measure.mts`

The same measurer the last three missions used. It renders like the survey and reports diffs plus comment
mismatches. The authored gate adds the D3 checks for error rows. No new measurer is written.

## Operational readiness (auto-confirmed)

- **Observability:** N/A. This is a pure library parse change with no runtime operations.
- **Rollback:** Reversible. Revert the squash commit; no data or contract changes.
- **Scalability:** N/A. One more regex lookahead per classifier line; the gate is anchored.
- **On-call:** N/A (library). The likely failure is a legitimate line the gate now declines. It shows up as a
  conformant row lost in verdict-diff (stop condition 1).
- **Backwards compatibility:** sources using the non-upstream one-line body now render an error page, as the jar
  does. That is the intended conformance change, not a published API or data contract change. `dist/*.d.ts` must not
  move (stop condition 5).

## Auto-confirmed (unattended)

| Phase | Decision | Rejected | Evidence |
|---|---|---|---|
| 1 | Lightweight scan | reuse `docs/architecture/overview.md` | overview 68 commits behind HEAD (>50) |
| 2 | Blast radius = README table | broader class grammar rewrite | probe: 2 source files fix all issue rows |
| 3 | D1 gate decline | execute-time refusal; full `compileUpstream` gate | D1 Rejected |
| 3 | D2 upstream brace forms only, Java `%s` | keep `;` split for compatibility | no upstream origin; jar refuses |
| 3 | D3 error-row bar | byte-compare error pages | 2026-10-10 ruling |
| 3 | D4 siblings filed unless small | widen mission to description catch-all | separate mechanism, reproduces without class |
| 4 | Reversible, observability N/A | — | library-only parse change |
| 5 | T0, T1, T2, T2b, T3, T4 | one combined fix task | gate first so T2 is red-then-green |
| 6 | README stop/push-forward lists | — | precedent `package-title-wrap` |

No Irreversible change; no acknowledgement needed.

## Pre-flight (planning, 2026-11-24, `b1ccb1d19`)

- [x] Every Modify path in the write-sets exists; the parent of every Create path exists (`tests/fixtures/`,
      `tests/unit/class/`, `tests/oracle/svg-conformance/`).
- [x] `npm test -- --maxWorkers=4`: exit 0, 2357 files / 51140 tests passed, coverage gate met.
- [x] `npm run lint`: exit 0.
- [x] `feature/parity-queue` is checked out (`--branch` mode; no new branch is created).
- [x] Working tree clean apart from this brief (and the planner's own progress file, deleted at hand-off).
- [x] Every task spec states observability (N/A) and rollback (Reversible).
- [x] No Irreversible change, so no acknowledgement is needed.
