# Decisions

## D1. Mirror the jar's error; do not draw and sign

**Context.** Issue #190 asks: "Mirror the error, or draw and sign the row (2026-10-10 rule). Measure the latest
release jar first." The latest release (`plantuml-1.2026.8.jar`) and the stock jar at the pin (`b066ee08c`) both
error on all 23 jar-error rows (`measurements/jar-error-check.txt`). The release exits 200.

**Decision.** Mirror the error. An `object` or `json` declaration whose colour capture is not a bare colour (D2)
refuses with `No such color` (score 10), on the line the jar reports.

**Rejected.**
- *Draw and sign each row* (docs/svg-conformance.md "We draw where the jar errors"). That needs a maintainer's
  signature per row, and no library forces it. CLAUDE.md: "no library forcing it ⇒ mirror".
- *Extend the 2026-11-04 neutral ruling to the whole capture* (paint `object O #line:red` LightGray). The ruling
  covers an unknown **bare** colour. The same DIVERGENCES.md paragraph says a `name:value` part "is different … we
  mirror the jar". Widening a ruling is the maintainer's decision.

**Consequences.** Sources with such a line now render an error page. No corpus row has one (README "Corpus").

## D2. Refuse exactly the captures that cannot be a bare colour

**Decision.** At the four sites in the README table, the capture `s` refuses when **both** hold:
1. `HColorSet.instance().getColorOrNull(s)` is `undefined` (`HColorSet.java:69-76` would throw), and
2. `s` does not match `^(?:COLOR_REGEXP)$`, anchored (`src/core/klimt/color/ColorParser.ts:20`,
   `ColorParser.java:43`).

A capture that fails (1) but matches (2) is an unknown bare colour. It keeps today's neutral (the 2026-11-04 ruling,
`colorOrNeutral`). In practice the refused captures are the `PART2`-only shapes, the ones that contain `:`, `;` or `.`.
`#back` or `#line` alone match `COLOR_REGEXP`, so they stay bare.

- Write it as one exported function in `src/core/klimt/color/HColorSet.ts`, beside `colorOrNeutral`, with JSDoc
  `@see` to `HColorSet.java:69-76` and the 2026-11-04 ruling. Name it for what it answers, for example
  `refusesAsBareColor`, or a better name you can justify in the journal.
- Test only the COLOR capture group, never the line. The seven corpus guards carry `#` inside a quoted display.
- Reuse `CommandExecutionResult.badColor()`'s message and score (`src/core/command/CommandExecutionResult.ts:76-77`).
  Do not retype `'No such color'` or `10`.

**Evidence.** `ocr-unknown-bare` draws `fill="#D3D3D3"` today (planning render). Every refused row's capture contains
`:`, `;` or `.`.

## D3. Where each refusal is raised

Mirror upstream's order inside each `executeArg0`.

- **`object` single line** (`applyObjectDecl`, `class-object-commands.ts:219-242`). Refuse after the duplicate check
  (`CommandCreateEntityObject.java:126-127` runs before `:145-147`). Raise it as `state.executionRefusal`, the way the
  duplicate refusal is raised, and pass the badColor score. `ocr-dup-and-colour` guards the order.
- **`object` multi-line** (`applyObjectMultilineOpen`, `:255-262`). Use `state.pendingBodyRefusal`, so the refusal
  lands on the closing `}` as the jar's does (line 4 in `ocr-multiline`). `pendingBodyRefusal` carries only a
  message today, and its consumer passes score 0 (`class/parser.ts:193`). If the score must reach the refusal, give
  the field an optional score and pass it there. Journal it.
- **`json`, both forms.** The check lives in the shared core (`CommandCreateJson.ts#applyJsonMultilineOpen`,
  `#applyJsonSingleLine`), after `host.resolve` returns an entity, because both Java `executeArg0` tails are identical
  (`CommandCreateJson.java:223-225`, `CommandCreateJsonSingleLine.java:183-185`). It runs before data validation:
  `executeNow` reaches `Bad data` only after `executeArg0` returns (`CommandCreateJson.java:141-150`,
  `CommandCreateJsonSingleLine.java:138-145`). `JsonCommandHost` gains **one** member that reports an execution
  refusal with a message and a score. Each engine routes it where its duplicate refusal goes today:
  - class: `refuseNow` for the single line, `pendingBodyRefusal` for the multi-line form;
  - state and description: `executionError` (T3 moves the multi-line line).

**Rejected.** *A check inside each host's `resolve`.* That makes three copies of one upstream tail.
*Refuse in the renderer.* A render-time failure is not a parse refusal, so the factory merge and the "Assumed diagram
type" would be wrong.

**Consequences.** The stored colour for an accepted capture is unchanged, so every draw row stays put.

## D4. A multi-line `json` refusal lands on the block's last line, in every engine

**Context.** The jar reports an `EXECUTION_ERROR` from a multi-line command on the last line of its trace
(`PSystemCommandFactory.java:218-225`; `errorLocation` is null for both `badColor()` and `error(...)`). Class already
does this through `pendingBodyRefusal`. State and description report the opener line: today's `JSON already exists`
is at line 3, and the jar's is at line 5 (`ocr-state-json-dup`, `ocr-desc-json-dup`).

**Decision.** T3 moves every multi-line `json` refusal in state and description to the block's closing line.
- Description gathers the whole block before the header runs (`tryJsonBlock`, `command-json.ts:68-78`), so the
  refusal line is the block's last line, not `i + 1` (`description/parser.ts:350`).
- State reads the body line by line (`state/parser.ts:123-131`). Defer the refusal until the closer, the way class does.
  Put the logic in `state-json-commands.ts` or a new module, not in `state/parser.ts` (482 lines).

This also fixes the duplicate rows, which is the same mechanism. A single-line refusal stays on its own line.

**T3b.** A refused body must close where the JSON completes, not on the first bare `}`. `ocr-json-nested`: jar line 6.
Class discards the refused body until `/^\}\s*$/` (`class/parser.ts:190-195`), while the accepted body already uses
`isPendingJsonBodyComplete` (`class-json-commands.ts:125`). Fix it under push-forward (under ~20 lines, 0 rows moved),
or file it.

## D5. What "conformant" means for an error row

This is the class-oneline-body D3 bar, reused. Per the 2026-10-10 ruling (docs/svg-conformance.md "Error pages"), the
jar's error page is not compared byte for byte, and the stock jar must also error. An `ERROR_PAGE` row asserts all of
these:

1. Ours is an error page (`setErrorPageObserver`, `src/core/error/error-renderer.ts`, fires once).
2. The label text equals the jar's, for example `No such color (Assumed diagram type: class)`.
3. The `(line N)` number equals the jar's.
4. The Welcome block is present in ours exactly when it is present in the jar's.
5. Every `compareSvg` diff sits on the exempt footer, found by **content**: the `<text>` whose jar value starts
   `PlantUML version`, the `<text>` whose jar value starts `[From `, and the `<rect>` behind it.

A jar error page's banner varies from run to run (`.agent-notes/auc-activity-unknown-colour.md`). Never re-render a
committed jar `.svg` to compare it.

**Rows with no Welcome block (#283).** Items 1 to 4 can pass, but 5 cannot: the version line sets the page width
(`svg/@width`, `svg/@viewBox[2]`). Do not decide #283. These rows go in an `OPEN` list whose entries carry the jar's
`{ label, line, welcome }`. The gate asserts items 1 to 4 for them, plus `maxDiffs`, with reason `#283 (needs-ruling)`.

**Draw rows** (the controls) use the usual bar: 0 diffs and 0 comment mismatches. `ocr-unknown-bare` is held as drawn:
not an error page, at least one `fill="#D3D3D3"`, and `maxDiffs` at today's 5, with the ruling as its reason.

**Template.** Copy the shape of `tests/oracle/svg-conformance/class-oneline-body.authored.test.ts`, including
`renderObserved`, `errorOf`, `footerPaths`, `observeD3` and `jarErrorOf`. Copy rather than import: test files do not
export. If you extract a shared helper to `tests/helpers/`, both gates must use it, and you must journal it.

## D6. Separable residuals are filed, not fixed

- **`#transparent`** (`ocr-ctl-transparent`): ours fills `#000` where the jar fills `none`. `class C #transparent` and
  `object O #background` have the same 2 diffs (planning probe), so the mechanism is shared and is not the object
  command. The exit files a `queue:ready` + `parity` issue. Find the `file:line` first: `HColorSet.java:82-83` maps
  `transparent` and `background` to `HColors.none()`.
- **#191** (`actor X #line:red` routing) is a separate issue. Do not touch it.

Measurement reuses `plans/hidden-note-host/measurements/measure.mts`. No new measurer.

## Operational readiness (auto-confirmed)

- **Observability:** N/A. This is a pure library parse change with no runtime operations.
- **Rollback:** Reversible. Revert the squash commit. There are no data or contract changes.
- **Scalability:** N/A. One extra regex test per declared colour.
- **On-call:** N/A (library). The likely failure is a legitimate colour the predicate refuses. It shows up as a lost
  conformant row in verdict-diff (stop condition 1), or as a control row leaving 0.
- **Backwards compatibility:** sources that relied on the non-upstream `object … #line:x` draw now render an error
  page, as the jar does. That is the intended conformance change, not a published API change. `dist/*.d.ts` must not
  move (stop condition 5).

## Auto-confirmed (unattended)

| Phase | Decision | Rejected | Evidence |
|---|---|---|---|
| 0 | Fresh run; `#190` selected | `#136` (blocked by open issues, e.g. `#190`) | `gh issue list`; #190 has no `Blocked by` |
| 1 | Lightweight scan | reuse `docs/architecture/overview.md` | overview 69 commits behind HEAD (>50) |
| 2 | Blast radius = README table, incl. `json` in state/description | object-only scope | the same `getColor(s)` tail in 4 commands; probes error in 3 engines |
| 3 | D1 mirror | draw and sign; widen neutral ruling | release + stock both error; CLAUDE.md mirror rule; DIVERGENCES.md wording |
| 3 | D2 bare boundary | refuse every unresolvable capture | would reverse the 2026-11-04 ruling on `ocr-unknown-bare` |
| 3 | D3 core json check + one host member | per-host check; render-time | identical Java tails; parse refusal drives the factory merge |
| 3 | D4 fix the state/description refusal line | leave dup rows at line 3 | jar line 5 on both dup probes; `PSystemCommandFactory.java:218-225` |
| 3 | D5 reuse ocb error bar; #283 rows OPEN with D5 items 1 to 4 asserted | decide #283 | #283 is `needs-ruling` |
| 4 | Reversible, observability N/A | none | library-only parse change |
| 5 | T0, T1, T2, T3, T3b, T4, T5 | one fix task | gate first so T2 is red-then-green; T3 is a separate mechanism (M3) |
| 6 | README stop and push-forward lists | none | precedent `class-oneline-body` |

No Irreversible change, so no acknowledgement is needed.

## Pre-flight (planning, 2026-11-24, `601052595`)

- [x] Every Modify path in the write-sets exists; the parent of every Create path exists (`tests/fixtures/`,
      `tests/unit/class/`, `tests/unit/state/`, `tests/unit/description/`, `tests/oracle/svg-conformance/`).
- [x] `npm test -- --maxWorkers=4`: exit 0, 2359 files / 51189 tests passed, coverage gate met.
- [x] `npm run lint`: exit 0.
- [x] `feature/parity-queue` is checked out (`--branch` mode; no new branch is created).
- [x] Working tree clean apart from this brief (and the planner's own progress file, deleted at hand-off).
- [x] Every task spec states observability (N/A) and rollback (Reversible).
- [x] No Irreversible change, so no acknowledgement is needed.
- [x] Both diagrams render through this port with no error page.
