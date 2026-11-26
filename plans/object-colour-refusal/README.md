# object-colour-refusal (ocr)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #190, found by the unresolved-colour mission (#145, exit T4).
Planned unattended on 2026-11-24 at `feature/parity-queue` `601052595`.

## Objective

The jar refuses `object O #line:zzblue` with `No such color`, and it refuses `#line:red` the same way. The port draws the
object. Make the port refuse it as the jar does: same message, same line, and the Welcome block exactly when the jar
draws one. Do the same at every command that reads its colour the same way.

Four upstream commands hand the **whole** `ColorParser.exp1()` capture to the throwing `HColorSet#getColor` as one
colour. They do not pass it through `Colors`:

| Command | Colour read | Registered in |
|---|---|---|
| `CommandCreateEntityObject` | `objectdiagram/command/CommandCreateEntityObject.java:145-147` | class (`ClassDiagramFactory.java:121`) |
| `CommandCreateEntityObjectMultilines` | `CommandCreateEntityObjectMultilines.java:178-180` | class (`:116`) |
| `CommandCreateJson` | `CommandCreateJson.java:223-225` | class (`:118`), state (`StateDiagramFactory.java:115`), description (`DescriptionDiagramFactory.java:130`) |
| `CommandCreateJsonSingleLine` | `CommandCreateJsonSingleLine.java:183-185` | class (`:119`), state (`:116`), description (`:131`) |

- `exp1()` is `COLORS_REGEXP` (`klimt/color/ColorParser.java:43-46,89-91`), so `#line:red`, `#back:red`, `#pink;line:blue`
  and `#line.dashed` all match the regex.
- `getColor` strips the `#` and finds no colour in `line:red`, so it throws (`klimt/color/HColorSet.java:69-76`).
- `SingleLineCommand2.java:176-179` and `CommandMultilines2.java:119-122` turn the throw into `badColor()`, which is
  `"No such color"` with score 10 (`command/CommandExecutionResult.java:85-86`).
- A multi-line block's error is reported on the block's **last** line (`command/PSystemCommandFactory.java:218-225`).

`map` is not affected. `CommandCreateMap` reads its colour through `Colors` (`CommandCreateMap.java:224`), and the jar
draws `map M #line:red {…}`.

**Our mechanism (found at planning; quote it again before you change it):**

| | Where | What |
|---|---|---|
| M1 | `src/diagrams/class/class-object-commands.ts:241` (`applyObjectDecl`) and `:260` (`applyObjectMultilineOpen`) | Stores the raw capture as `classifier.color`. The renderer later reads it through the class `Colors` port (`class-declaration-extractors.ts#parseDeclarationColors`), which accepts `line:`. |
| M2 | `src/core/command/CommandCreateJson.ts:370-397` (`applyJsonMultilineOpen`, `applyJsonSingleLine`) | Hands the capture to `host.resolve`. Every engine's host stores it (`class-json-commands.ts:86`, `state-json-commands.ts:143`, `description/command-json.ts:49`). |
| M3 | `src/diagrams/description/parser.ts:350` and `src/diagrams/state/parser.ts:165-172` + `state-json-commands.ts:139` | A multi-line `json` refusal is reported on the **opener** line. The jar reports the closing line. This already holds for today's `JSON already exists` (rows `ocr-state-json-dup` and `ocr-desc-json-dup`: ours line 3, jar line 5). Class already defers correctly (`ParseState.pendingBodyRefusal`, `class/parser.ts:190-195`). |

**The 2026-11-04 neutral ruling stays as it is.** DIVERGENCES.md ("We draw where the jar errors") paints an unknown
**bare** colour (`object O #zzblue`) LightGray `#D3D3D3` (`HColorSet.ts#colorOrNeutral`); the port does that today. The
same paragraph says a `name:value` part is "different … we mirror the jar". So this mission refuses only captures that
cannot be a bare colour (D2). `ocr-unknown-bare` must not move.

## Starting state, measured 2026-11-24 on `601052595`

`npx tsx plans/hidden-note-host/measurements/measure.mts plans/object-colour-refusal/measurements/probes` prints
**rows 31 zero 7 open 24 throw 0**. Full table: [measurements/plan-baseline.txt](measurements/plan-baseline.txt).
Every probe has its oracle from `scripts/oracle-render.sh`. Each of the 23 jar-error rows was also run through the stock jar at the
pin (`b066ee08c`) and the latest release (`plantuml-1.2026.8.jar`, exit 200). Both error with the same line:
[measurements/jar-error-check.txt](measurements/jar-error-check.txt).

| Rows (jar) | Today | Expected owner |
|---|---|---|
| `ocr-issue`, `-line-red`, `-back-red`, `-text-red`, `-semi`, `-dashed` (No such color, class, line 2, Welcome) | port draws | T2 |
| `ocr-line3` (line 3), `ocr-multiline-short`, `ocr-json-short` (line 3), `ocr-json-single` (line 2); all Welcome | port draws | T2 |
| `ocr-state-json-single` (state, line 3), `ocr-desc-json-single` (component, line 3); Welcome | port draws | T2 |
| `ocr-long` (line 7), `ocr-multiline`, `ocr-multiline-back`, `ocr-json-multi` (line 4); no Welcome | port draws | T2 (then #283) |
| `ocr-state-json` (state, line 5), `ocr-desc-json` (component, line 5); no Welcome | port draws | T2 + T3 (then #283) |
| `ocr-state-json-dup`, `ocr-desc-json-dup` (JSON already exists, line 5); no Welcome | port refuses at line 3 | T3 (then #283) |
| `ocr-json-nested` (No such color, line 6: the body closes where the JSON completes); no Welcome | port draws | T2, then T3b |
| `ocr-dup-and-colour` (`Object already exists: O`, line 3: the duplicate check runs before the colour) | port matches | guard from T1 |
| `ocr-unknown-bare` (`#zzblue`; jar errors) | draws `#D3D3D3` by ruling | must not move |
| controls the jar draws: `ocr-ctl-red`, `-gradient`, `-plain`, `-map-line`, `-class-line`, `-multiline-red`, `-json-red` | 0 diffs | must stay 0 |
| `ocr-ctl-transparent` (`object O #transparent`: jar `fill="none"`, ours `#000`) | 2 diffs | separable (D6): `class C #transparent` has the same 2 diffs. Exit files it |

**#283 (needs-ruling).** When an error page has no Welcome block, the version line sets the page width, and ours is 26px
narrower. Those rows can pass the label, line and Welcome checks, but not D5's footer-only bar. They stay OPEN with #283
as the reason, and the gate still asserts their label, line and Welcome (D5).

**Corpus.** No corpus row has an `object` or `json` `name:value` colour. A grep finds 7 object rows
(`linuxu-41-cogo780`, `jocamu-71-nuvo330`, `sorisi-53-xebi982`, `sibika-09-sipu286`, `nukera-08-dige359`,
`vocute-12-suxa445`, `nulixu-97-nofi684`), all conformant. In each one the `#` is inside a quoted display
(`"~#1: Person"`). They guard D2: test only the COLOR capture, never the whole line.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `object-colour-refusal/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC. `src/diagrams/class/parser.ts` (503) is
  **already over**: leave it no longer. `state/parser.ts` (482), `description/parser.ts` (470) and `HColorSet.ts`
  (465) are close. Put new state logic in `state-json-commands.ts` or a new small module, not in `state/parser.ts`.
- `npm run svg:survey` takes about 16 minutes. Run it in the background and wait on a marker in its log
  (`.agent-notes/auc-activity-unknown-colour.md`).

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/hidden-note-host/measurements/measure.mts <dir> [out.json]`. Before T1, `<dir>` is
  `plans/object-colour-refusal/measurements/probes`; from T1 on it is `tests/fixtures/object-colour-refusal`. An error
  row never reaches 0 here, because the footer differs. The authored gate is the authority for error rows (D5).
- **Authored gate:** `npx vitest run tests/oracle/svg-conformance/object-colour-refusal.authored.test.ts`; read the
  count.
- **Engines:** `npm run svg:survey -- object --out tests/oracle/svg-conformance/parity-object.json` (same for `class`,
  `state`, `component`, `usecase`, `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.
- **Stock check for a new error row:** `java -Djava.awt.headless=true -cp
  oracle/dist/stock/plantuml-stock-b066ee08c3136fbc5f0dd1d0c0c1c9b2b01d07bc.jar net.sourceforge.plantuml.Run -tsvg
  -stdrpt:1 -o /tmp/ocr-stock <file.puml>` must print `status=ERROR` with the same line. Run the release check too:
  `java -Djava.awt.headless=true -jar oracle/dist/release/plantuml-1.2026.8.jar -tsvg -stdrpt:1 -o /tmp/ocr-release
  <file.puml>` must exit 200. Append both to `measurements/jar-error-check.txt`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar, and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Examples: the jar draws an `object` or `json` with a `name:value` colour, or
   `ocr-unknown-bare` would have to change. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency.
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.
7. A row would need a new `DIVERGENCES.md` entry or a signed row in `oracle/accepted-divergences.json`.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- A unit test that asserts the over-accept (an object or json drawn with a `name:value` colour). Rewrite it to a bare
  colour when the test is about something else. When it is about the colour, assert the refusal. Journal each one.
- A residual with a separable mechanism (D6): measure it, file a `queue:ready` + `parity` issue with the measurement
  and `file:line`, give the row that `reason`, and continue.
- A residual only a maintainer can end: file a `needs-ruling` issue with the evidence, name it in the row's `reason`,
  and continue.

## Push-forward (decide, journal, continue)

- Author extra probes for a branch you touch, each with its oracle from `scripts/oracle-render.sh` and a stock and
  release check when it errors. Each one joins the gate. Candidates:
  - `object O <<S>> [[url]] #line:red` (the colour after a stereotype and a URL);
  - `object "D" as O #back:red` (quoted display);
  - `object O #line:red` inside a `package P { … }`;
  - `json J #line:red [1, 2]` (single-line array data);
  - `json J #line:red {` with data that does not parse (`Bad data`; the colour throws first, `CommandCreateJson.java:141-150`);
  - `state S` plus `json J #back:red {"a": 1}` beside a multi-line one;
  - `!pragma layout elk` with `object O #line:red`.
- Fix what such a probe exposes inside the mission when the fix is under ~20 lines, has a `file:line` origin, and
  moves no conformant row. Journal it. Otherwise file it.
- Rerun a timed-out vitest or survey at lower load before you call the timeout a finding.

## Blast radius

- **Data model / API:** none public. `JsonCommandHost` (internal, `src/core/command/CommandCreateJson.ts:331`) gains
  one refusal member (D3). `dist/*.d.ts` must not move.
- **Dependencies:** nothing new.
- **Behaviour:** an `object` or `json` declaration whose colour capture is a `name:value`/`;`/`.` form now renders an error
  page, as the jar does. A multi-line `json` refusal in state and description moves from the opener line to the
  closing line. That applies to `JSON already exists` too. Nothing else may move. The goldens, the object/class/state/description
  surveys and verdict-diff guard it.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/object-colour-refusal/*.{puml,svg}` (31 rows + push-forward) | Create | T1 |
| `tests/oracle/svg-conformance/object-colour-refusal.authored.test.ts` | Create | T1, T2, T3, T3b |
| `src/core/klimt/color/HColorSet.ts` (one exported predicate beside `colorOrNeutral`) | Modify | T2 |
| `src/diagrams/class/class-object-commands.ts` (`applyObjectDecl`, `applyObjectMultilineOpen`) | Modify | T2 |
| `src/core/command/CommandCreateJson.ts` (`JsonCommandHost`, the two apply functions) | Modify | T2 |
| `src/diagrams/class/class-json-commands.ts`, `src/diagrams/state/state-json-commands.ts`, `src/diagrams/description/command-json.ts` (host refusal member) | Modify | T2, T3 |
| `src/diagrams/description/parser.ts:350`, `src/diagrams/state/parser.ts` / `state-json-commands.ts` (refusal line) | Modify | T3 |
| class / state refused-json body close (`class/parser.ts:190-195`, `state/parser.ts:123-131`) | Modify, or file | T3b |
| `tests/unit/core/klimt/color/*.test.ts` or a new `tests/unit/class/object-colour-refusal.test.ts` | Create | T2 |
| `DIVERGENCES.md` (one sentence in the neutral-ruling paragraph: object/json `name:value` errors as the jar does) | Modify | T2 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: refuse the capture](batch-2/overview.md) | T2 | [x] |
| [3: multi-line refusal line](batch-3/overview.md) | T3, T3b | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #190)

- [x] `ocr-issue` and `ocr-line-red` (the issue's two variants) are error rows that pass D5: the same label, the same
      line, and Welcome presence equal to the jar's.
- [x] Every other Welcome row in the table above passes D5.
- [x] Every no-Welcome error row matches the jar's label, line and Welcome, and is OPEN only on #283.
- [x] `ocr-unknown-bare` and `ocr-dup-and-colour` are unchanged, and the seven controls stay at 0 diffs and 0 comment
      mismatches.
- [x] Every row still open names its mechanism with `file:line` and a filed issue, or was fixed under push-forward.
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass;
      `dist/*.d.ts` unchanged.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `plan-baseline.txt`, `jar-error-check.txt`, and `probes/` (31 `.puml` + `jar/*.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `java`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Mission summary (2026-11-24)

**Tasks:** T0, T1, T2, T3, T3b, T4 completed as planned; T5 (squash) follows. T3b was fixed under push-forward, not filed.

**Pre-squash commits** (tag `object-colour-refusal/pre-squash`): `21ffd9820` T0 brief · `116916ee2` T1 gate · `1107a7eca`
close 0+1 · `dda0a48aa` T2 · `f6c8f1b57` T2 push-forward probes · `946c9f3af` close 2 · `3316b3154` T3 · `ae683710f`
T3b · `5fae1c7fa` close 3 · T4 exit commit.

**Gate** (`object-colour-refusal.authored.test.ts`, 49 tests): 31 rows at T1 (ZERO 7 / ERROR_PAGE 1 / OPEN 23) → 45 rows
(ZERO 8 / ERROR_PAGE 19 / OPEN 18). Final probe line: `rows 45 zero 8 open 37 throw 0` (an error row never reaches 0
there; the gate is the authority, D5). Open rows and reasons:

| Rows | Reason |
|---|---|
| `ocr-long`, `-multiline`, `-multiline-back`, `-json-multi`, `-json-nested`, `-state-json`, `-desc-json`, `-state-json-dup`, `-state-json-nested`, `-desc-json-nested`, `-pf-package`, `-pf-state-mixed` | #283 (needs-ruling): label, line and Welcome equal the jar's (asserted); only the no-Welcome page width differs |
| `ocr-desc-map-dup` | #286: description `map` refusal on the opener line (ours 3, jar 5) |
| `ocr-desc-json-comment`, `ocr-state-json-comment` | #287: the error page lists the stripped comment line (line itself is the jar's) |
| `ocr-ctl-state-json-nested` | #288: state's own json renderer on a nested value (class: 0 diffs) |
| `ocr-ctl-transparent` | #289: `#00000000` written as `#000` + opacity 0, not `none` (`svg-shapes.ts:56-63`, `SvgGraphics.java:527`) |
| `ocr-unknown-bare` | 2026-11-04 neutral ruling, held as drawn (unchanged) |

**Every engine:** verdict-diff vs `601052595` lost 0 / timeout 0 at batch 2 and batch 3 closes; every field of every
survey row unchanged; `dist/*.d.ts` identical to the T0 snapshot. Quality gates green at every batch close.

**Decisions flagged for review:** (1) journal 8: survey re-run with `SVG_PARITY_TIMEOUT_MS=240000
SVG_PARITY_CONCURRENCY=4` after load-induced timeouts; (2) journal 11: description `map` filed (#286) rather than fixed,
per T3's spec, although T3's span mechanism would fix it in one line; (3) journal 14: state's accepted nested json now
draws its content (was empty), moving a non-corpus row toward the jar but to a higher diff count (10 → 15), filed #288;
(4) #136 gained `Blocked by` lines for #286–#289 (brief asked for #289; the others follow the convention).

**Follow-ups:** #283 (ruling), #286, #287, #288, #289.
