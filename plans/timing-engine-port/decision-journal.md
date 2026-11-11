# Decision journal — timing-engine-port (tep)

Appended during execution: one numbered row per decision, measurement or batch close, with the sha.

1. 2026-11-10T23:24:45Z — mission start. T0 committed the brief as `2d0616372` on `feature/parity-queue` (base
   `fea72e951`). `timing-rows.mjs /tmp/tep-b0` prints
   `rows 158 {"timing":{"diverged":139,"conformant":6},"unknown":{"diverged":13}}`, matching planning. The 46 probe
   oracles were still in `/tmp/tdp-plan/oracle`, so the restore render was skipped. `dot -V` 16.1.0.
2. Batch 0 close. Gates not rerun: the planning baseline (decisions.md, 44,712 passed, exit 0 on all five) was
   measured with this exact brief in the working tree and nothing else, so the T0 commit's tree is the baseline tree.
   Execution plan (D15, serial): one foreground `typescript-pro` subagent per batch, tasks in order, one commit per
   task; the orchestrator reads the Java behind each claim, runs the gates and closes the batch.
3. T1a `e59c7387c`, T1b `63e5f4d61`, T1c `ed30af301` (typescript-pro subagent). Decisions it made, checked:
   - Enums are `as const` objects plus a same-named type (repo TS6 rule), Java order and names kept.
   - BigDecimal errors carry `Throwable#toString` text (`ProtectedCommand.java:75` prints it).
   - Contract extensions: `BigDecimal.valueOfDouble` (`TimeSeriesTest.java:14`), `SimpleDateFormatSpec {pattern,
     zone}`, `checkSimpleDateFormatPattern` (throws), `src/core/time/GregorianCalendarGmt.ts` (outside the planned
     write-set: the lenient GMT calendar with the Julian rule is `java.util` arithmetic, so it sits beside the other
     `java.time` subset in `src/core/time/`), `decimal-format.ts`, and `timing-klimt.ts` (the klimt seams;
     `TimingSkinParam` is the interface T3a's `timing-skin-param.ts` implements). `Player.ts` is a placeholder T2a
     replaces; `graphic/IntricatedPoint.ts` was created in T1a because `TimeProjected` names it.
   - `cov-date-julian`'s `IllegalStateException` is `TimingRuler#getFirstPositiveOrZeroValue`
     (`TimingRuler.java:273-279`, read by the orchestrator): no tick >= 0, so any all-negative timeline crashes.
     Owned by T1c, mirrored. T4b authors an all-negative non-date probe to confirm.
   - `TimeTickBuilder#describeTime` (`@Explain`) not ported, like every other engine's `explain` helpers.
4. Batch 1 close, load 26-52. `npm test -- --maxWorkers=4` exit 0: 44,951 passed, 4 expected fail, 7 skipped, 6
   todo, 2,130 files; coverage 97.16 / 92.90 / 97.88 / 98.15. typecheck, lint, build, format:check exit 0.
5. T2a `a9e5a575e`, T2b `5b9f2e252`, T2c `a75ddd9ed` (typescript-pro), T2d `21cdf4d1f`, T2e `8e9430334`
   (typescript-pro). Decisions, with the two the orchestrator re-read in the Java:
   - Args objects (D16): `PlayerArgs`/`PlayerBaseArgs`, `AbstractStatePlayerArgs`, `TimingNoteArgs`,
     `TimeConstraintArgs`, `PanelsArgs`, `PanelsRobustArgs`, `PlayerClockArgs`, `PanelsClock/Binary/AnalogArgs`.
   - Outside the planned write-set: `src/core/abel/ISkinParam.ts` gains `FontParam` `TIMING` (`FontParam.java:49`;
     `Highlight#getCaption` reads `FontConfiguration.create(skinParam, FontParam.TIMING, null)`,
     `Highlight.java:114-117`); `tree-set.ts` (`treeSetAdd`, `treeMapPut`, D6); `timing-font-param.ts`
     (`SkinParam.java:441-554` for TIMING only).
   - `ArrowConfiguration`: sequence's type imported (timing reads only `color`, `TimeConstraint.java:132-137`); no
     sequence edit.
   - D7 additions: `TimeMessage#getUStroke` is the style stroke only (`TimeMessage.java:70-76`, re-read), so
     `-[dotted]>` draws a plain 1.5 line; `PanelsRobust` passes `notes = null` (`PanelsRobust.java:72`, re-read), so
     robust players draw no notes; robust `setInitialState` ignores its colours; binary projections are always HIGH;
     analog's first value is the initial state; clock panels draw from 0; concise `{A,B}` draws only `states[0]`.
   - `PanelsAnalog` folds three identical `for (i = ceil(min); i <= floor(max); i++) if (i % ticksEvery == 0)`
     loops (java:98-102, 117-122, 148-152) into one `#tickValues` generator: behaviour-identical, kept for the CCN
     hook; noted as a small refactor against "do not refactor while porting".
   - Open probes for T4b: gradient/`transparent` message colour (`WithLinkType.getColorOrWhite` returns a bare
     `ResolvedColor`), `analog ... between 5 and 5` (zero range → NaN), an all-negative timeline.
   - Authored fixtures already in `tests/fixtures/timing/`: `cov-robust-edges`, `cov-projections`,
     `cov-binary-notes`, `cov-analog-constraint` (with oracles); T4b keeps them.
6. Batch 2 gate fix 1 of 2: `npm test` failed one test, `tests/architecture/layering.test.ts` (timing →
   `sequence/sequence-arrowhead.ts`). Mechanism: a cross-engine type import of upstream's shared
   `skin.ArrowConfiguration`. Fix `117f42f10`: an `ALLOWLIST` entry (T3a's write-set foresaw this file).
7. Batch 2 close, load 5-13. `npm test -- --maxWorkers=4` exit 0: 45,128 passed, 4 expected fail, 7 skipped, 6
   todo, 2,147 files; coverage 97.19 / 92.94 / 97.91 / 98.18. typecheck, lint, build, format:check exit 0.
8. T3a `cc9abe3ab`, T3b `e2f9823d2` (typescript-pro), T3c `28be97036` (typescript-pro). Decisions:
   - `TimingDiagram.ts` sits at the 500-line cap; port-only siblings carry the overflow: `timing-diagram-layout.ts`
     (`getUTranslateForPlayer*`, `getPart1MaxWidth`, thin delegators keep the Java names) and `TimingChrome.ts` (the
     `annotations`/`scale`/`sprites` the `TitledDiagram` chrome reads). D16 forced split.
   - The date-format zone is `TimingDiagram`'s fourth constructor argument (D4); `parseTiming(source, preprocessing,
     emoji?, zone?)` is the factory entry (`TimingDiagramFactory.java:60-66`, `PSystemCommandFactory.java:107-153`).
   - `CommandTimeMessage.PLAYER_CODE` lives in `command/player-code.ts`, re-exported from `CommandTimeMessage.ts`.
   - `CommandConstraint` carries a D2 copy of `CommandArrow.java:84-86, 482-502` (`COLOR_OR_STYLE_PATTERN`,
     `applyStyle`).
   - `explainArg`/`describeState` (`@Explain`) not ported, as in batch 1.
   - Error strings re-read by the orchestrator against every `CommandExecutionResult.error(` in `command/*.java`.
   - Labels widened to `string | null` so `Display.getWithNewlines(null)` gives `Display.NULL` as Java does.
   - D8 rows through the factory: `fuseva` line 10 (`Syntax Error?`), `pebecu` 11 (`No such element: A`), `sezuvo` 20
     (`No such participant WB`), `vufija` 11 (`What time?`) all refuse at the jar's line.
   - First end-to-end measure: all 36 non-chrome probes equal the oracle body; `cov-chrome-all`, `cov-mode-dark`,
     `cov-scale-2`, `cov-skinparam` differ only by chrome the plugin draws (T4a).
9. Batch 3 close, load 14-22. `npm test -- --maxWorkers=4` exit 0: 45,468 passed, 4 expected fail, 7 skipped, 6
   todo, 2,154 files; coverage 97.21 / 92.96 / 97.92 / 98.19. typecheck, lint, build, format:check exit 0.
10. T4a `46cfe27e0` (typescript-pro, steps 1-6). Outside the planned list: `TimingChrome.ts` gains
    `isHandwritten()` (`TitledDiagram.java:114-118`; the first render threw without it, `TimingDiagram.ts` at the
    cap); `document-back-color.ts` needed no edit (`timing: 'timingDiagram'` already in `STYLE_NAMES`);
    `measurements/probe-diffs.mts` added. `capture-clock.json` gains `timing/mekivo-95-xafe506` (epochMillis
    1791605405000, America/Chicago); no other row or fixture uses `use date format`. renderSync: `cov-concise-basic`
    251x106 TIMING, `cov-chrome-all` 151x229, `cov-embedded` 276x223, `cov-starttiming-tag` error page (D10),
    `cov-date-format` `20-07-03` (Chicago) / `20-07-04` (UTC), `cov-date-julian` and `cov-unknown-player` error
    pages. Full-SVG compare 0 diffs on `cov-concise-basic`, `cov-chrome-all`, `cov-mode-dark`, `cov-scale-2`,
    `cov-skinparam`, `cov-style`. The six D8 rows render error pages; `lamera-74-sago807`'s body differs from the
    jar's text (ours also prints the next source line) identically with the plugin unregistered, and error text is
    not a target (D9), so it stays an error pair. Routing and refusal gates needed no re-pin.
11. T4a step 7, load 6-52. `timing` 143/2/0, `unknown` 945/4/99; `verdict-diff` 0 lost; 137 + 13 gained.
    Histogram of first diffs on the 158: 2 x `svg/g[1]/g[1]/text[1]/@x` (`nafixu-73-daro620`, `zugelo-96-dato700`,
    both `title ... ` with a trailing space, x 37.306 vs jar 39.231).
12. T4c1 `7467f1acf`: diagnosis of those two rows.
    - Mechanism: the shared single-line annotation matchers (`src/core/annotations/commands.ts` ORDERED_MATCHERS)
      matched the raw line, so `title WU is toto ` kept its trailing space and the centred title moved left by half
      a bold-14 space.
    - Origin: Java trims first: `CommandTitle.java:56` calls `super(getRegexConcat())`, so `doTrim` is true
      (`SingleLineCommand2.java:56-63`) and `isValid` matches `lines.getFirst().getTrimmed()` (java:94); the same
      for `CommandMainframe`, `CommandCaption`, `CommandLegend`, `CommandFooter`, `CommandHeader`.
    - Ruled out: timing's own code. The same source under `@startnwdiag` showed the same 1.925 px offset, and
      dropping the trailing space gave the jar's x in both engines. The textLength was equal, so the measurer was
      ruled out too.
    - Fix: trim (`StringUtils#trin`) the line before the six single-line matchers. Shared-module change, so the full
      survey is the check: every engine surveyed, 0 lost, and no row outside timing/unknown changed any field
      (verdict, firstDiff, maxDelta).
    - Result: `timing` 145/0/0, and all 158 rows conformant.
13. T4a/T4c1 survey commit `ef942b36b`: full survey (mindmap 12 and packet 4 timeouts at load 80 rerun alone,
    clean), dashboard regenerated. Overall 5,514 -> 5,666 conformant of 5,927; diverged 300 -> 148. T4c's scope (139
    timing rows) and T4d's 13 unknown rows are all conformant with no further fix.
14. T4b `405338705`, T4d `930b565e9` (typescript-pro). 141 fixtures in `tests/fixtures/timing/` (46 probes, 84 D11,
    7 t3c, 4 T2); `probes/` flattened. Before T4d 138/141 at 0 or error pair; after, 140/141.
    - T4d mechanism: `WithLinkType#applyStyle` used a local `getColorOrWhite` over `parseSimpleColor`, white for
      `transparent`/`background`/schemes/gradients; Java calls `HColorSet.instance().getColorOrWhite(s)`
      (`WithLinkType.java:162`, `HColorSet.java:58-63`, re-read). Shared by state, activity-legacy, gantt, timing;
      the full survey below shows no other row moved.
    - `fixtures.mts` counts `cov-states-clock` (both `ProtectedCommand` pages, version text differs,
      `ProtectedCommand.java:72`) and `cov-starttiming-tag` (jar "not supported", ours error, D10) as error pairs.
    - Open probes resolved: gradient arrow colour, a clock `X is state`, `analog between 5 and 5`, and all-negative
      timelines are jar error/crash pages where we also error.
    - Error-page oracles were re-rendered off the `PSystemError.java:216-232` banner minutes.
    - Residual `cov-embedded-state` (a timing `{{ }}` in a STATE note): the jar draws one `<image>`, ours draws the
      lines as text. Measured: a sequence `{{ }}` in a state note also draws no image, and the same block in
      component/usecase/object/sequence/activity/class notes embeds. A state-engine gap (`renderer-note.ts`,
      `state-note-layout.ts#measureNote` have no nested renderer), separable from timing, and it touches the state
      note geometry under 297 state pins. D8 end: a separable `queue:ready` issue. `gh issue create` was denied, so
      the body waits in `.agent-notes/tep-T4d.md` (`e95a28d52`), with #136's "Blocked by" line to add.
15. Batch 4 close, load 5-35. Full survey: mindmap's 6 timeouts were rerun alone and came back clean; `verdict-diff`
    vs `fea72e951`: 0 lost, 0 timeout. Only timing (139) and unknown (13) rows changed any field, so no census
    attribute moved in another engine. 5,666 conformant of 5,927. `timing-rows.mjs`: all 158 conformant. Dashboard
    regenerated. `npm test -- --maxWorkers=4` exit 0: 45,482 passed, 4 expected fail, 7 skipped, 6 todo, 2,156
    files; coverage 97.19 / 92.90 / 97.91 / 98.18. typecheck, lint, build, format:check exit 0.
16. T5 `bb4aeb7a0` (typescript-pro). `svg-timing`: 152 corpus pins (139 `timing`, 13 `unknown`), 6 jar-error rows in
    `diff-baseline.json`, 141 authored rows (131 at 0, 9 error pairs, `cov-embedded-state` open). Routing/refusal
    re-pin, checked by the orchestrator by key against `HEAD~1`: only the 152 drawn rows changed status
    (`known-misroute` → `agree`, `known-gap` → `ok`, `weErrored` true → false) and the 152 golden twins; the six
    jar-error rows keep status and score, with only the informational refusal `engine` changed. No pin rose. Counts:
    routing agree 10,627 → 10,931, known-misroute 209 → 57, manifest 10,998 → 11,150; refusal erroring 319 → 167,
    rendering 10,679 → 10,983, known-gap 218 → 66. `pin-timing.mts` prints `pins 0`. A broken label failed both
    ratchets (reverted). The tools needed `timingClockFor(slug)` (`mekivo-95-xafe506`, a `use date format` row).
17. Batch 5 close, load 22-72. `npm test -- --maxWorkers=4` exit 0: 45,625 passed, 4 expected fail, 7 skipped, 6
    todo, 2,158 files. typecheck, lint, build, format:check exit 0. No survey at this close: `git diff 84532d458
    HEAD -- src` is empty, so batch 4's full survey stands; T6 runs the final one.
18. T6 final survey at `68ef3bf4b` plus the doc edits, load 6-22: `verdict-diff /tmp/tep-base` lost 0, timeout 0;
    `timing-rows.mjs` 158 conformant; `pin-timing.mts` `pins 0` (its six holds are the six D8 jar-error rows, pinned by
    score); `census-timing.json`, `PARITY-SVG.md` and `docs/parity-report.md` regenerated;
    `git diff fea72e951 HEAD -- oracle/accepted-divergences.json` empty. `dist/plantuml-ts.d.ts` against a build of the
    base (temp worktree, removed): differs only by `FontParam.TIMING` and its comment, additive
    (`FontParam.java:49`); `dist/image-providers.d.ts` identical. Docs: the `timing` dashboard note, mission-guide
    Phase 4b and Track SI-2, `timing-deepdive.md` superseded, next-missions section.
19. T6 gate fix 1 of 2: `npm test` failed one test, `tests/unit/scripts/parity-dashboard.test.ts:584`, which used
    `timing` as its example of a `notBuilt` bucket. Mechanism: the `timing` note became `openDefect` by design; `wire`
    is still `notBuilt`, so the example moved. Rerun, load 8-16: `npm test -- --maxWorkers=4` exit 0, 45,625 passed, 4
    expected fail, 7 skipped, 6 todo, 2,158 files; coverage 97.20 / 92.91 / 97.92 / 98.18; typecheck, lint, build,
    format:check exit 0. CI risk: latest main run 42712716665, slowest shard 476 s (shard 3), blobs expired; +152 twins
    per gate (+1.4 %), two ratchets 447 tests in 13.8 s. `gh issue comment 127` denied once and not retried; `gh issue
    create` denied once. Text in `.agent-notes/tep-T6.md` and `tep-T4d.md`.
20. T7. Batch close shas: b0 `4c4ad8f88`, b1 `5248d7e2b`, b2 `831217267`, b3 `23c512ea7`, b4 `84532d458`, b5
    `68ef3bf4b`, exit `27b534246`. The tag `timing-engine-port/pre-squash` keeps the per-task history; the squash is one
    commit on `fea72e951`, unsigned and not pushed.
