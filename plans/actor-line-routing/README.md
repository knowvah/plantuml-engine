# actor-line-routing (alr)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #191, found by the unresolved-colour mission (#145, exit T4).
Planned unattended on 2026-11-24 at `feature/parity-queue` `d7f8c3db4`.

## Objective

The jar draws `actor X #line:zzblue` and `actor X #line:red` as a **description** diagram. The port routes them to
sequence. Make the sequence participant family refuse a colour capture that cannot be a bare colour, as the jar does,
so the factory chain hands the source to the next factory. Mirror the participant family's other colour branches the
probes exposed (D5).

**Upstream (quote it again before you change anything):**

- `CommandParticipantA` … `A4` all end in `ColorParser.exp1()` (`sequencediagram/command/CommandParticipantA.java:59-76`,
  and the same tail in `A2:59-72`, `A3:59-72`, `A4:59-68`).
- `CommandParticipant#executeArg` returns `ok()` for an **existing** CODE before it reads the colour (`:145-149`). For a
  new one it hands the whole capture to the throwing `getIHtmlColorSet().getColor(s)` (`:183-185`).
- `getColor` finds no colour in `line:red` and throws (`klimt/color/HColorSet.java:69-76`). `SingleLineCommand2.java:176-179`
  turns that into `badColor()`, `"No such color"` with score 10 (`command/CommandExecutionResult.java:85-86`).
- The sequence factory then fails, and `PSystemBuilder` tries the next factory. Description (or class, for `entity`)
  takes the line and reads the colour through `Colors`, which accepts `line:red`.
- `CommandParticipantMultilines#executeNow` never reads the colour (`:136-176`; its own `explainNow` says "currently
  ignored", `:121`). The multi-line form must **not** refuse.
- `CommandActivate` (registered at `SequenceDiagramFactory.java:103`, before `CommandParticipantA` at `:106`) owns a
  bare `create WHO [#\w+] [#\w+]` (`CommandActivate.java:72-83`). It never colours the participant: its colours go to
  the CREATE `LifeEvent` (`:116-131`, `SequenceDiagram.java:370-380`). A bare `create X #line:red` fails that grammar,
  so it is `CommandParticipantA`'s (TYPE `create`), which moves an existing X last (`CommandParticipant.java:146-148`).

**Our mechanism (found at planning; quote it again before you change it):**

| | Where | What |
|---|---|---|
| M1 | `src/diagrams/sequence/command-participant.ts:38-54` (`declareParticipant`) | Stores any capture `stripParticipantTail` peels (`sequence-participant-declaration.ts:126-130`). The renderer reduces a compound capture to its back part (`sequence-participant-paints.ts:81-85`, `resolveBareOrBackColor`). Nothing refuses, so sequence keeps the diagram. |
| M2 | `src/diagrams/sequence/parser.ts:293-294` (`dispatchOrdinaryLine`) | Refuses `state.executionError` with score 0. There is no score field, so a `badColor` refusal cannot carry its 10. |
| M3 | `command-participant.ts:77-88` (`createCommand`) | A bare `create` always takes `moveExisting = false` and colours the participant. That is right only for the `CommandActivate` grammar, and even there the colour belongs to the life event, not the participant. |

A planning prototype (M1 + M2 only, reverted) moved 20 rows to 0 and no guard: `rows 44 zero 29`.

## Starting state, measured 2026-11-24 on `d7f8c3db4`

`npx tsx plans/hidden-note-host/measurements/measure.mts plans/actor-line-routing/measurements/probes` prints
**rows 44 zero 12 open 32 throw 0**. Full table: [measurements/plan-baseline.txt](measurements/plan-baseline.txt).
Every probe has its oracle from `scripts/oracle-render.sh`. The 6 jar-error rows were run through the stock jar at
the pin (`b066ee08c`) and the latest release (`plantuml-1.2026.8.jar`). Both error with the same line and label, and
both exit 200: [measurements/jar-error-check.txt](measurements/jar-error-check.txt).

| Rows | Jar | Today | Expected owner |
|---|---|---|---|
| `alr-issue`, `-line-red`, `-back-red`, `-semi`, `-dashed`, `-text-red`, `-full-as`, `-as-full`, `-full-as-code`, `-quoted-code`, `-stereo`, `-url`, `-boundary`, `-control`, `-database`, `-queue`, `-collections`, `-second`, `-line3`, `-message`, `-teoz`, `-teoz-msg` | DESCRIPTION | sequence | T2 |
| `alr-entity` | CLASS (`entity` is a class keyword) | sequence | T2 |
| `alr-participant`, `-create`, `-create-bare`, `-order` | `No such color (Assumed diagram type: sequence)`, line 2, Welcome | sequence draws | T2 |
| `alr-seq-only` | `Syntax Error? (Assumed diagram type: component)`, line 4, no Welcome | sequence draws | T2, then #283 |
| `alr-create-move` (`create X #line:red` on an existing X: X moves last) | SEQUENCE | X stays first | T3 |
| `alr-create-red`, `-create-red-msg` (`create X #red`: the participant keeps its default fill) | SEQUENCE | port paints it `#F00` | T3 |
| `alr-unknown-bare` (`actor X #zzblue`; the jar errors) | error | draws `#D3D3D3` by ruling | must not move |
| controls: `alr-ctl-red`, `-gradient`, `-plain`, `-participant-red`, `-desc-line`, `-desc-colon`, `-create-move`; guards: `alr-multiline`, `-existing`, `-existing-msg`, `-create-existing`, `-create-actor-existing` | as drawn | 0 diffs | must stay 0 |

**Residuals the prototype left (D6).** Each has its own mechanism, outside the participant family:

- `alr-dashed` falls to 4 diffs: description draws `actor X #line.dashed` 1px narrower than the jar. `actor X #line.dashed`
  plus `usecase U` (description from line 1) shows the same 1px canvas and 0.5px usecase shift, with `#line.dotted` too.
  The exit files it.
- `alr-order` stays at 5: our description accepts `actor X order 10 #line:red` where the jar's description refuses it.
  This is #284's mechanism (the `KEYWORD_RE` catch-all, `src/diagrams/description/parse-helpers.ts:414`, takes any
  rest). Its reason is #284; the exit adds the row to #284.
- `alr-seq-only` falls to 7: label, line and Welcome match, and only the no-Welcome page width differs (#283).
- `alr-participant`, `-create`, `-create-bare` fall to 5 diffs, all on the version footer. They should pass D5 (decisions.md).

**Corpus.** One corpus source has a compound participant colour: `component/rekisu-47-pesa949` (`actor bar2
#77F;text:red;line:777`). It is conformant in component and must stay so: its line 2 (`component bar …`) already fails
sequence.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `actor-line-routing/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.
- The complexity hook blocks a file over 500 lines that grows. `src/diagrams/sequence/parser.ts` (519) and
  `sequence-parse-helpers.ts` (530) are **already over**: leave each no longer (tighten an adjacent comment to make room).
- `npm run svg:survey` takes about 16 minutes. Run it in the background and wait on a marker in its log
  (`.agent-notes/auc-activity-unknown-colour.md`).

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/hidden-note-host/measurements/measure.mts <dir> [out.json]`. Before T1, `<dir>` is
  `plans/actor-line-routing/measurements/probes`; from T1 on it is `tests/fixtures/actor-line-routing`. An error row
  never reaches 0 here, because the footer differs. The authored gate is the authority for error rows (D7).
- **Authored gate:** `npx vitest run tests/oracle/svg-conformance/actor-line-routing.authored.test.ts`; read the count.
- **Engines:** `npm run svg:survey -- sequence --out tests/oracle/svg-conformance/parity-sequence.json` (same for
  `component`, `usecase`, `class`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.
- **Stock check for a new error row:** `java -Djava.awt.headless=true -cp
  oracle/dist/stock/plantuml-stock-b066ee08c3136fbc5f0dd1d0c0c1c9b2b01d07bc.jar net.sourceforge.plantuml.Run -tsvg
  -stdrpt:1 -o /tmp/alr-stock <file.puml>` must print `status=ERROR` with the same line. Then the release check:
  `java -Djava.awt.headless=true -jar oracle/dist/release/plantuml-1.2026.8.jar -tsvg -stdrpt:1 -o /tmp/alr-release
  <file.puml>` must exit 200. Append both to `measurements/jar-error-check.txt`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar, and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7. Examples: the jar keeps `actor X #line:red` in sequence, `alr-multiline` would have
   to refuse, or `alr-unknown-bare` would have to change. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency.
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.
7. A row would need a new `DIVERGENCES.md` entry or a signed row in `oracle/accepted-divergences.json`.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- A unit test that asserts the over-accept (a sequence participant drawn with a `name:value` colour, or a bare
  `create X #c` painting X). Rewrite it to a bare colour when the test is about something else; when it is about the
  colour, assert the refusal. Journal each one.
- A residual with a separable mechanism (D6): measure it, file a `queue:ready` + `parity` issue with the measurement
  and `file:line`, give the row that `reason`, and continue.
- A residual only a maintainer can end: file a `needs-ruling` issue with the evidence, name it in the row's `reason`,
  and continue.

## Push-forward (decide, journal, continue)

- Author extra probes for a branch you touch, each with its oracle and, when it errors, a stock and release check. Each
  joins the gate. Candidates: `participant "D" as X #line:red` plus a message; `actor X #line:red` inside `box … end box`;
  `create participant X #line:red` (CREATE group); `actor X #line:red` with `!pragma layout elk`; `actor X #back:red`
  after an `X -> Y` message (X exists: sequence keeps it).
- Fix what such a probe exposes inside the mission when the fix is under ~20 lines, has a `file:line` origin, and
  moves no conformant row. Journal it. Otherwise file it.
- Rerun a timed-out vitest or survey at lower load before you call the timeout a finding.

## Blast radius

- **Data model / API:** none public. The sequence `ParseState` (internal) gains one optional score field (D3).
  `dist/*.d.ts` must not move.
- **Dependencies:** nothing new.
- **Behaviour:** a new sequence participant whose colour capture cannot be a bare colour now refuses with
  `No such color`, score 10. The source then goes to the next factory, or shows the jar's error page. A bare
  `create X <tail>` follows upstream's two commands (D5). Nothing else may move. The goldens, the surveys and
  verdict-diff guard it.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/actor-line-routing/*.{puml,svg}` (44 rows + push-forward) | Create | T1 |
| `tests/oracle/svg-conformance/actor-line-routing.authored.test.ts` | Create | T1, T2, T3 |
| `src/diagrams/sequence/command-participant.ts` (`declareParticipant`, `createCommand`) | Modify | T2, T3 |
| `src/diagrams/sequence/sequence-parse-helpers.ts` (`ParseState.executionErrorScore`) | Modify | T2 |
| `src/diagrams/sequence/parser.ts:293-294` and the state initialiser (`:515`) | Modify | T2 |
| `src/diagrams/sequence/command-lifeline.ts` (bare `create` under `CommandActivate`), `sequence-command-registry.ts` | Modify | T3 |
| `tests/unit/sequence/command-participant.test.ts` (+ a lifeline test) | Modify | T2, T3 |
| `DIVERGENCES.md` (one clause in the neutral-ruling paragraph: the sequence participant also errors on `name:value`) | Modify | T2 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: refuse, route create](batch-2/overview.md) | T2, T3 | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #191)

- [ ] `alr-issue` and `alr-line-red` (the issue's two variants) are ZERO rows: the jar's description diagram.
- [ ] Every other T2 row in the table above is ZERO, or an ERROR_PAGE row that passes D7, or OPEN on a filed issue.
- [ ] `alr-create-move`, `-create-red` and `-create-red-msg` are ZERO, or OPEN with a filed mechanism.
- [ ] `alr-unknown-bare` is unchanged, and every control and guard stays at 0 diffs and 0 comment mismatches.
- [ ] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [ ] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass;
      `dist/*.d.ts` unchanged.

## Documents

- [decisions.md](decisions.md): D1 to D7, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `plan-baseline.txt`, `jar-error-check.txt`, and `probes/` (44 `.puml` + `jar/*.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `java`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Mission summary (2026-11-25)

**Tasks:** T0-T4 completed as planned; T5 (squash) follows this commit. Pre-squash shas: T0 `3c653f21c`, T1
`41e58d67b`, batch 0+1 close `a5dd49e5a`, T2 `2f37b5bbb`, T3 `0d183bf9c` (+ catalog fix `0e6f7e180`), batch 2 close
`38424b3c6`, T4 = this commit. History kept under tag `actor-line-routing/pre-squash`.

**Gate** (`actor-line-routing.authored.test.ts`, 55 tests): 51 rows, **41 ZERO, 5 ERROR_PAGE, 5 OPEN** (was 44 rows,
12 ZERO, 0 ERROR_PAGE, 32 OPEN). Measurer: `rows 51 zero 41 open 10 throw 0` (error rows never reach 0 there, D7).

| OPEN row | diffs | reason |
|---|---|---|
| `alr-dashed` | 4 | #294 (filed at T4): description sizes the actor at the style thickness, draws the `#line.dashed` stroke |
| `alr-order` | 5 | #284: description `KEYWORD_RE` accepts `actor X order 10 #line:red`; the jar's description refuses it |
| `alr-seq-only` | 7 | #283: no-Welcome page width; label, line and Welcome match (D7 items 1-4 asserted) |
| `alr-pf-box` | 7 | #283: same, refusal at line 3 inside `box` |
| `alr-unknown-bare` | 5 | #190 neutral ruling: drawn `#D3D3D3`, unchanged |

**Done-when:** `alr-issue` and `alr-line-red` ZERO; every other T2 row ZERO, ERROR_PAGE (D7) or OPEN on a filed issue;
`alr-create-move`, `-create-red`, `-create-red-msg` ZERO; `alr-unknown-bare` unchanged; all controls and guards at 0
diffs / 0 comment mismatches; 0 conformant losses in every engine vs `d7f8c3db4`; `docs/parity-report.md` regenerated
(timestamp-only, left at HEAD); all gates pass; `dist/*.d.ts` unchanged.

**Decisions flagged for review:** (1) refusal gated on a new CODE (journal 8); (2) CREATE colours dropped (journal 11);
(3) `createLifelineCommand` uses upstream's exact WHO rather than the file's wider one (journal 11); (4) frozen
registry-order test updated outside the write-set (journal 13). None adds a divergence.

**Issues:** filed #294 (queue:ready, parity) and added `Blocked by #294.` to #136; commented on #284 (`alr-order`) and
#191 (summary). No `needs-ruling` question arose.

**Follow-ups:** #294; #284; #283. The other sequence `getColor` sites (D6: `CommandArrow`, `CommandActivate2`,
`CommandExoArrowAny`, `CommandReferenceOverSeveral`) were not probed and stay out of scope.
