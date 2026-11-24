# class-oneline-body (ocb)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #223, found on the re-pin branch (#185) and also reproduced on the stock jar.
Planned unattended on 2026-11-24 at `feature/parity-queue` `b1ccb1d19`.

## Objective

The jar refuses `class A { x : int }`: no class command takes a non-empty `{ … }` body on one line. The port draws
class `A` with member `x : int`. Make the port refuse it the way the jar does, with the same message, the same line,
and the Welcome block when the source is under 5 lines.

Upstream's two class commands each allow one brace form, and only one:

- `CommandCreateClass` (single line) ends with an **optional empty** pair, `[%s]*\{[%s]*\}`, then the end of the line
  (`classdiagram/command/CommandCreateClass.java:117-119`).
- `CommandCreateClassMultilines` opens only on a line **ending** in `\{` (`CommandCreateClassMultilines.java:140-142`).
  Its body closes on `^[%s]*\}[%s]*$` (`:100`).
- `%s` is Java `\s` plus U+00A0 (`regex/Pattern2.java:56`). So `class A { }` is an empty body, and the jar draws
  it.

When neither command matches, no class command does. `PSystemCommandFactory.getCandidate` returns null, and the
factory builds `SYNTAX_ERROR "Syntax Error?"` at that line (`command/PSystemCommandFactory.java:206-208`).

**Our mechanism (found at planning; quote it again before you change it):**

| | Where | What |
|---|---|---|
| M1 | `src/diagrams/class/class-declaration-extractors.ts:20` (`extractBody`) | `/\{([^}]*)\}\s*$/` accepts **any** brace body at the end of the line, splits it on `;`, and returns it as `inlineMembers`. Neither the brace body nor the `;` split exists upstream. |
| M2 | `src/diagrams/class/class-command-declarations.ts:32-38` (rule 7 gate) | The gate matches only the keyword prefix, so it claims the line. `dispatchCommand` (`parser.ts:275-284`) stops at the first match, and the line never reaches `buildSyntaxRefusal` (`parser.ts:320-323`). |
| M3 | `src/diagrams/class/class-declaration-parser.ts:350-353` | Pushes each `inlineMembers` entry as a member. |

**Planning probe (reverted).** I narrowed `extractBody` to an empty pair and added a negative lookahead to the gate
for a non-empty tail. Results:
- `ocb-issue`, both NBSP variants, `ocb-abstract`, `ocb-enum`, `ocb-struct` and `ocb-long` print the jar's
  `Syntax Error? (Assumed diagram type: sequence)` at line 2.
- The remaining diffs are only the error-page footer (version text, `[From string (line 2) ]`), which docs/svg-conformance.md "Error pages" exempts.
- The class survey kept 872/874 conformant and lost 0 rows. Unit tests: 2 failures, both of which assert the
  over-accept (`parser.test.ts:134`, `class-note-creation-index.test.ts:76`). Oracle suites: 19065/19065 pass.

The probe also found two **sibling** over-accepts. Each has a separate mechanism (D4):
- `entity|interface|circle X { … }`: once class declines, the **description** engine claims the line through its
  catch-all `KEYWORD_RE` (`src/diagrams/description/parse-helpers.ts:414`, reached from
  `command-table-containers.ts:174`). It draws a leaf named `Z { a }`.
- `class A { x : int` (no closing brace): `parseIdDisplay`'s final bareword fallback
  (`class-declaration-extractors.ts:387+`) makes a class named `A { x : int`. Upstream's CODE excludes `{`
  (`CommandCreateClassMultilines.java:92`, `NameAndCodeParser.java:52-67`).

## Starting state, measured 2026-11-24 on `b1ccb1d19`

`npx tsx plans/hidden-note-host/measurements/measure.mts plans/class-oneline-body/measurements/probes` prints
**rows 18 zero 6 open 12 throw 0**. Full table: [measurements/plan-baseline.txt](measurements/plan-baseline.txt).
Every probe has its oracle from `scripts/oracle-render.sh`. The stock jar at the pin (`b066ee08c`) also reports
`status=ERROR lineNumber=2 label=Syntax Error?` for the issue rows and `ocb-entity`, which the error-page ruling
requires.

| Rows (jar) | Today | Expected owner |
|---|---|---|
| `ocb-issue`, `ocb-issue-nbsp-lead`, `ocb-issue-nbsp-both` (jar: error, line 2, sequence) | port draws | T2 |
| `ocb-abstract`, `ocb-enum`, `ocb-struct`, `ocb-long` (error, line 2; `ocb-long` has 6 body lines, so no Welcome) | port draws | T2 |
| `ocb-line3` (jar: error, **line 3, Assumed diagram type: class**) | port draws | T2 |
| `ocb-interface`, `ocb-entity`, `ocb-circle` (error, line 2) | port draws | T2 moves them to description; T2b files or fixes |
| `ocb-unclosed` (error, line 2) | port draws `A { x : int` | T2b files or fixes |
| controls the jar draws: `ocb-ctl-empty`, `-empty-tight`, `-empty-nbsp`, `-empty-decorated`, `-multiline`, `-multiline-decorated` | 0 diffs | must stay 0 |

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `class-oneline-body/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC.
  `class-declaration-parser.ts` (503) and `class-declaration-extractors.ts` (509) are **already over 500**. Any edit
  must leave them no longer than they are now. Removing `inlineMembers` shrinks both.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/hidden-note-host/measurements/measure.mts <dir> [out.json]`. Before T1, `<dir>` is
  `plans/class-oneline-body/measurements/probes`; from T1 on it is `tests/fixtures/class-oneline-body`. An error row
  never reaches 0 here, because the footer differs; the authored gate is the authority for error rows (D3).
- **Authored gate:** `npx vitest run tests/oracle/svg-conformance/class-oneline-body.authored.test.ts`; read the
  count.
- **Engines:** `npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json` (same for `object`,
  `component`, `usecase`, `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.
- **Stock check for a new error row:** `java -Djava.awt.headless=true -cp
  oracle/dist/stock/plantuml-stock-b066ee08c3136fbc5f0dd1d0c0c1c9b2b01d07bc.jar net.sourceforge.plantuml.Run -tsvg
  -stdrpt:1 -o /tmp/ocb-stock <file.puml>` must print `status=ERROR` with the same line (scripts/stock-jar-verify.sh
  invocation).

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar, and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D5. For example, a line ending in a non-empty `{…}` that the jar draws as a class.
   Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency.
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- A unit test that asserts the over-accept, such as the two the probe found. Rewrite it to the multiline form when
  the test is about something else. When it is about the inline body, assert the refusal. Journal each one.
- A residual with a separable mechanism (D4): measure it, file a `queue:ready` issue with the measurement and
  `file:line`, give the row that `reason`, and continue.
- A residual only a maintainer can end (it would need a new `DIVERGENCES.md` entry): file a `needs-ruling` issue
  with the evidence, name it in the row's `reason`, and continue.

## Push-forward (decide, journal, continue)

- Author extra probes for a branch you touch, each with its oracle from `scripts/oracle-render.sh` (and a stock check
  if it errors), each joining the gate. Candidates:
  - `object o { x }` (`CommandCreateEntityObject`);
  - `allowmixing` with `database D { x }` (rule 9, `class-descriptive-leaf-command.ts:142`);
  - `class A extends B { x }`;
  - `class A [[url{tip}]]` (a brace inside a URL must still be claimed);
  - `class "A{x}"`;
  - a `{ x }` tail in an `!include`d file;
  - `hide empty members` with `class A { }`.
- Fix what such a probe exposes inside the mission when the fix is under ~20 lines, has a `file:line` origin, and
  moves no conformant row. Journal it. Otherwise file it.
- Rerun a timed-out vitest or survey at lower load before you call the timeout a finding.

## Blast radius

- **Data model / API:** none public. `ClassifierDecl` (internal, `class-declaration-parser.ts:28`) loses
  `inlineMembers`. `dist/*.d.ts` must not move.
- **Dependencies:** nothing new.
- **Behaviour:** a classifier line ending in a non-empty `{…}` stops parsing as a class. Every other declaration line
  is held by the class/object/description goldens and the survey's verdict-diff. Engine selection can move only for
  sources that contain such a line (D1).

| File | Action | Task |
|---|---|---|
| `tests/fixtures/class-oneline-body/*.{puml,svg}` (18 rows + push-forward) | Create | T1, T2b |
| `tests/oracle/svg-conformance/class-oneline-body.authored.test.ts` | Create | T1, T2, T2b |
| `src/diagrams/class/class-declaration-extractors.ts` (`extractBody`, new brace-tail constant) | Modify | T2 |
| `src/diagrams/class/class-command-declarations.ts` (rule 7 gate) | Modify | T2 |
| `src/diagrams/class/class-declaration-parser.ts` (`ClassifierDecl.inlineMembers`, doc `:73-74`, `:177`, `:192`, `:350-353`, `:424`) | Modify | T2 |
| `src/diagrams/class/class-multiline-element.ts:59` (doc cites `extractBody`) | Modify (doc only) | T2 |
| `tests/unit/class/class-oneline-body.test.ts` | Create | T2 |
| `tests/unit/class/parser.test.ts`, `tests/unit/class/class-note-creation-index.test.ts` | Modify | T2 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: refuse the inline body, triage siblings](batch-2/overview.md) | T2, T2b | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #223)

- [x] `ocb-issue`, `ocb-issue-nbsp-lead` and `ocb-issue-nbsp-both` (the issue's three variants) are error rows that
      pass D3: the same label, the same line, and Welcome presence equal to the jar's.
- [ ] `ocb-abstract`, `ocb-enum`, `ocb-struct`, `ocb-long` and `ocb-line3` pass D3 too. **All but `ocb-long`**: it is
      refused as the jar refuses it, but its page width follows the version line (no Welcome block), #283 needs-ruling.
- [x] The six control rows stay at 0 diffs and 0 comment mismatches.
- [x] Every row still open (expected: `ocb-interface`, `ocb-entity`, `ocb-circle`, `ocb-unclosed`) names its
      mechanism with `file:line` and a filed issue, or was fixed under push-forward.
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass;
      `dist/*.d.ts` unchanged.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `plan-baseline.txt` and `probes/` (18 `.puml` + `jar/*.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `java`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Mission summary (2026-11-24)

**Tasks:** T0, T1, T2, T2b and T3 done as planned; T4 (squash) follows. One extra commit: the catalog regeneration for
T2's two new exports.

**Pre-squash commits** (tag `class-oneline-body/pre-squash`): `5be766aeb` T0 brief · `3cf9ded2c` batch 0 close ·
`66d822c6a` T1 gate · `eac5e7b09` batch 1 close · `3ab09d901` T2 fix · `decd6db85` T2 catalog · `5976387aa` T2b ·
`6e57ffcf3` batch 2 close · T3 summary (this commit).

**Gate** (`class-oneline-body.authored.test.ts`, 28 rows, 32 tests green): ZERO 10, ERROR_PAGE 10, OPEN 8. Probe
measure: `rows 28 zero 10 open 18 throw 0` (error rows never reach 0 here; the authored gate's D3 check is the authority).

| Open row | Reason |
|---|---|
| `ocb-long`, `ocb-mix-database-body`, `ocb-mix-database-empty` (7 diffs) | #283 needs-ruling: refused as the jar refuses them, but with no Welcome block the page `@width`/`viewBox` follows the version line (358 vs 384) |
| `ocb-circle`, `ocb-entity`, `ocb-interface`, `ocb-desc-circle-alone` (5) | #284: description `KEYWORD_RE` (`parse-helpers.ts:414`) claims the line class declines |
| `ocb-unclosed` (5) | #285: `parseIdDisplay` bareword fallback names a class `A { x : int` |

**Every engine:** survey against `b1ccb1d19`: lost 0, faults 0, no row moved; only `generatedAt` changed, so the
parity JSONs and `docs/parity-report.md` stay at HEAD. `dist/*.d.ts` byte-identical to the base snapshot.

**Quality gates** (batch 2 close, on the final `src/`/`tests/` tree): test (51189 passed, coverage met), typecheck,
lint, build, format:check all exit 0; rerun at T3, see the journal.

**Flagged for review:**
- Journal 7: `%s` spelled `[ \t\n\x0B\f\r\u00A0]`, not via `transform` (D2's wording and D2's semantics disagree;
  the jar backs the semantics).
- Journal 9: `ocb-long` held OPEN rather than widening D3's footer (#283).
- Journal 6: the batch 1 survey was stopped (no `src/` change, outside load avg 200); the batch 2 survey covers it.
- Journal 14: push-forward rule 9 brace-tail decline (3 lines).

**Follow-ups:** #283 (ruling), #284, #285 (queue:ready). Not authored: the `!include` brace-tail probe.
