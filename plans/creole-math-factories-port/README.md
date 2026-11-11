# creole-math-factories-port (cmf)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #129. Planned unattended on 2026-11-11 at `feature/parity-queue` `c914bec36`.

## Objective

Port the five `PSystemBuilder` factories no plugin registers yet (`PSystemDefinitionFactory` java:169, `PSystemMathFactory`
:172, `PSystemLatexFactory` :173, `PSystemCreoleFactory` :174, `HelpFactory` :188), plus `syntax/LanguageDescriptor` and the
`PSystemBasicFactory` base they share. Take the **41 in-scope rows** to conformant or a named end (D1, D8), close the
`<math>` image-size gaps those rows expose (D6, D7), author probes past them, and pin everything in a new `svg-factories`
ratchet. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-11 on `c914bec36`

No plugin registers `CREOLE`, `MATH`, `LATEX`, `DEFINITION` or `HELP`. All 41 rows are in the `unknown` bucket and all
diverge; `measurements/factory-rows.mjs` finds them (`measurements/planning-rows.json`): creole 21, math 11, help 5, latex
2, def 2. Overall: 5,684 conformant of 5,927.

**A scratch prototype run on 2026-11-11 from `/tmp`, through existing classes, against the jar:**
- 7 of the 21 creole rows matched with **0 diffs** (`bibeso`, `fisoma`, `gapeji`, `pizepu`, `potezi`, `sukuje`, `xavefa`).
  Each of the other 14 carries `<math>` atoms and fails only on image size: 119 of 510 images differ.
- 11 of the 13 `@startmath`/`@startlatex` rows size exactly under `measureLatex`. The two that do not:
  `zoziko-62-toko934` (`\\` newline, 27×52 vs our 45×26) and `sozeke-50-rilu829` (406×56 vs our 400×56).

**The 119 image mismatches by family** (the prototype's `<math>` order; row shape is per decoded oracle image, D6):
| Family | Images | Example | Task |
|---|---|---|---|
| Jar rollback: JLaTeXMath threw, the jar drew monospace text | 18 | `\glb`, `\lub`, `\Sin`, `\Lim`, `\twoheadrightarrowtail` | T3c |
| Ours 8×8: our sizing returned the error box where the jar typeset | 23 | `\hat{}`, `\csch`, `\boxempty`, `a -lt b` | T3f |
| Accent or underline height | ~30 | `\vec x` 20×23 vs 20×17 | T3d |
| Newline and stacks: `\\`, `\stackrel`, `\overset`, `\underset` | ~14 | `a newline b` 19×40 vs 28×22 | T3e |
| Negation and single symbols; ±1 rounding | ~34 | `\ne` 24×26 vs 31×26, `\bowtie`, `\cdots`, `\models` | T3f |

The families are planning estimates: every task re-measures them, and two rows' formulas shifted one position against
their images (`marese`, `xanuke`), so the counts in those rows are approximate.

**Upstream tests:** none exercise these factories. **68 planning probes** are in [probes/](probes/). T0 renders them with
`scripts/oracle-render.sh` into `/tmp/cmf-plan/oracle`.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| `@startcreole`: every line is creole, serif 14, `SkinParam` built for `SEQUENCE`, no commands | `PSystemCreole.java:80-86` | Read + Probe (`cov-creole-title`) | T2a |
| `!theme` in a creole source expands to literal lines | preprocessor before `PSystemCreole` | Probe (`cov-creole-theme`) | T3b |
| `@startdef` draws only the start line, sans 14; body lines are stored and ignored | `PSystemDefinition.java:84-88` | Read + Probe (`cov-def-*`) | T2b |
| An empty `@startdef` draws; an empty `@startcreole`/`@startmath`/`@startlatex` is the Welcome page | `PSystemBasicFactory.java:89-90`, `UmlSource#isStartDef` | Read + Probe (`cov-*-empty`) | T1a |
| Math and latex write a Batik document straight to the stream: no klimt, no `plantuml-src`, no `data-diagram-type` | `DirectOsDiagram`, `ScientificEquationSafe.java:149` | Read + Probe (all 13 rows) | T1c, T2c |
| The last non-directive line wins; `scale` and `dpi` are read and never reach SVG | `PSystemMath#doCommandLine`, `ScientificEquationSafe.java:149` (`getSvg(1, ...)`) | Read + Probe (`renice-72`, `tijica-43`, `geravi-79`) | T2c |
| A formula JLaTeXMath rejects draws as a plain klimt document in monospace | `ScientificEquationSafe.java:104, 137` | Read + Probe (`cov-math-unknown`, `cov-latex-unknown`) | T3c |
| Background names: Batik's `white`, `yellow`, else `rgb(r,g,b)`; bad colours are white | `ConverterSvg#getSvg`, `PSystemMath#getColor` | Probe (`cov-math-back`, `cov-latex-color`, `cov-math-color-bad`) | T1c |
| Help is a `TitledDiagram`, margin 0, serif 16; `data-diagram-type="HELP"` | `Help.java:76, 82` | Read + Probe (`ficame-31`) | T2d |
| Help has only the five `help` commands: `title`, `scale`, `skinparam` before it are the Welcome page, a `<style>` or `!theme` an error page | `HelpFactory.java` `initCommandsList` | Read + Probe (`cov-help-title`, `-scale`, `-skinparam`, `-style`, `-theme-cmd`) | T2d, T3b |
| `help foo` and bare `help` give the Welcome page; `help` is case-insensitive with trailing spaces allowed; two commands concatenate | `CommandHelp*.java` regexes | Probe (`cov-help-bad`, `-bare`, `-upper`, `-trailing`, `-two`) | T2d, T3b |
| `{{creole` embeds as an image; `{{math`, `{{latex`, `{{def` do not | `EmbeddedDiagram.java:257-366` | Probe (`cov-embedded-note-*`) | T3b |

"Status" says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
2026-11-11 showed it. Every task still opens the Java itself and finds the line.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this
brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10). Do not create another branch
or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the
execution prompt, and tags `creole-math-factories-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>` that
collects nothing exits 0: read the count. The baseline on `c914bec36` is in [decisions.md](decisions.md#baseline). Stay on
graphviz 16.1.0 (`dot -V`). These factories never call `dot`, but other engines' gates do.

## Measurement commands

Tools are under `plans/creole-math-factories-port/measurements/`. Run them with `node` or `npx jiti`. Type commands
literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- unknown --out /tmp/cmf-<task>/parity-unknown.json`. A positional
  type with no `--out` clobbers `parity.json`.
- `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/cmf-<task>`: exit 1 on a row that
  left conformant.
- `node plans/creole-math-factories-port/measurements/survey-moves.mjs /tmp/cmf-b0/parity-unknown.json /tmp/cmf-<task>/parity-unknown.json`:
  every moved row.
- `node plans/creole-math-factories-port/measurements/factory-rows.mjs /tmp/cmf-<task> --json /tmp/cmf-<task>/rows.json`: the 41
  rows with factory, verdict and first diff, and a count.
- `npx jiti plans/creole-math-factories-port/measurements/row-diffs.mts plans/creole-math-factories-port/measurements/planning-rows.json /tmp/cmf-<task>/diffs.json [slug ...]`:
  every diff, and our SVG beside the JSON.
- `npx jiti plans/creole-math-factories-port/measurements/fixtures.mts [slug ...]`: every `tests/fixtures/factories/<slug>.puml`
  against its `<slug>.svg`, one line each.
- `npm run svg:survey`, then `verdict-diff.mjs <base>`: every engine, at batch close from batch 3. Exit 1 on a loss.
- `scripts/oracle-render.sh <absolute-out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

`fixtures.mts` uses `renderSync`, so it works from T3a on; `pin` and baseline tools are created by T4.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D12: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` gains or changes no acceptance here. A file outside a task's write-set is not
a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared klimt or `latex-metrics` module, with its Java or JLaTeXMath
  citation. A gain in another bucket counts for that bucket's issue: T5 comments there, or leaves the text in
  `.agent-notes/` if denied.

## Blast radius

**Data model:** none. **API:** no public change expected; `dist/*.d.ts` checked at T5. `block-extractor.ts#DiagramType`
gains `'creole'`, `'math'`, `'latex'` and `'def'`; it is internal, and `plantuml-ts` has no consumers. **Dependencies:** none
added. **SVG output** changes on purpose for these sources, and for any other engine's `<math>` or `<latex>` atom whose
size T3c to T3f corrects: that is a parity gain, and the 0-losses gate still applies. **Shared seams:** `core/latex-metrics/`,
`core/math/ScientificEquationSafe.ts`, `core/EmbeddedDiagram.ts`, `core/block-extractor.ts`, `registered-plugins.ts`.

| File | Action | Task |
|---|---|---|
| `src/core/command/PSystemBasicFactory.ts` | Create | T1a |
| `src/core/syntax/LanguageDescriptor.ts` | Create | T1b |
| `src/core/math/math-document.ts`, `src/core/math/ScientificEquationSafe.ts` | Create, Modify | T1c, T3c |
| `src/core/klimt/creole/legacy/{PSystemCreole,PSystemCreoleFactory}.ts` | Create | T2a |
| `src/diagrams/definition/{PSystemDefinition,PSystemDefinitionFactory}.ts` | Create | T2b |
| `src/core/DirectOsDiagram.ts`, `src/diagrams/math/{PSystemMath,PSystemMathFactory,PSystemLatex,PSystemLatexFactory}.ts` | Create | T2c |
| `src/diagrams/help/{Help,HelpFactory,CommandHelp*}.ts`, `src/core/themes-source.ts` | Create, Modify | T2d |
| `src/registered-plugins.ts`, `src/core/block-extractor.ts`, `src/core/EmbeddedDiagram.ts` | Modify | T3a, T3b |
| `src/core/latex-metrics/**`, `src/core/latex.ts` | Modify, Create | T3c to T3f |
| `tests/unit/factories/**` | Create | T1a to T3f |
| `tests/fixtures/factories/**` | Create | T3b |
| `oracle/goldens/svg-factories/**`, `tests/oracle/svg-conformance/{factories.golden.ratchet.test.ts,factories.diff-baseline.ratchet.test.ts,render-fixture-factories.ts}` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `scripts/parity-dashboard-goldens.ts` | Modify | T4 |
| `DIVERGENCES.md`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/{next-missions,mission-guide,roadmap}.md`, `docs/catalog.md` | Modify | T3g, T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — shared pieces](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2 — the five factories](batch-2/overview.md) | T2a, T2b, T2c, T2d | [x] |
| [3 — turn on, probes, math sizing](batch-3/overview.md) | T3a to T3g | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #129)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism. (17 conformant; 16 named in `DIVERGENCES.md`'s cmf section; the rest on #169/#170 — journal 34-36.)
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
  (KaTeX only; #169, #170.)
- [x] 0 conformant losses in every engine, baseline survey against final survey. (journal 40)
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. (`svg-factories`, journal 38, 40)
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. (journal 40)

## Documents

- [decisions.md](decisions.md) — D1 to D12, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/) — the 68 planning probe sources.
- [measurements/](measurements/) — the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `gh issue`); it was deliberately not regenerated (the SessionStart hook compares it with
the live `.claude/settings.json`).

## Summary (2026-11-11)

**Tasks:** 15 of 15 planned (T0, T1a-c, T2a-d, T3a-g, T4, T5) plus the squash (T6). T3d, T3e+T3f and T4 ran as foreground
`typescript-pro` subagents; every claim was re-measured by the orchestrator before commit (journal 27, 30, 38).

**Verdicts:** the 41 in-scope rows went from 41 diverged to 17 conformant (def 2/2, help 4/5, creole 11/21), 10
structural-match and 14 diverged (11 math, 2 latex, `cikoge`). Unknown bucket 945 → 962 conformant; overall 5,684 → 5,701 of
5,927. 0 rows lost in any engine (final survey, `verdict-diff c914bec36`). Creole `<math>` images sized as the jar: 391 → 503 of
510 (rollback 18/18).

**Authored:** 68 fixtures in `tests/fixtures/factories/`: 40 at 0, 9 jar-error pairs, 19 with a named mechanism.

**Gates (final):** `npm test` 2,186 files / 46,615 tests passed (4 expected fail, 7 skipped); coverage 97.14 / 92.87 / 97.73 /
98.12; typecheck, lint, format:check, build exit 0; `pin-factories --report` prints `pins 0`; `oracle/accepted-divergences.json`
unchanged.

**Rows left and their ends:** 13 math/latex rows (KaTeX glyph group) and `mimumu-93` (KaTeX whitespace) named in
`DIVERGENCES.md`; `kebadi-11`, `rozesu-56` (KaTeX parse errors, named) plus #170; `cunotu-47`, `marese-34`, `pecafo-64`,
`vocalo-20`, `xanuke-94`, `roxita-24`, `raxanu-33` on #170; `cikoge-60` on #169.

**Decisions flagged for review:** D6's jar-derived names table (now 1,352 names incl. `PredefMacros`); JLaTeXMath CM font
metrics copied for accent/kern/guillemet glyphs KaTeX lacks (journal 27, 30, 31); the `\sech`/`\csch`/`\-` KaTeX macros
(journal 31).

**CI risk:** the latest main run (42712716665, 2026-11-09) had its slowest shard at 7 min 56 s (shard 3). Its blobs have expired
(1-day retention), so the routing/refusal part times could not be read. This mission adds ~300 ratchet tests over 41 rows + 68
fixtures and ~150 sizing unit tests; locally the full suite stayed at ~7.5 min.

**Follow-ups:** #136 needs `Blocked by #169.` and `Blocked by #170.` and the #129/#136 comments (both denied to this session;
`.agent-notes/cmf-T3g.md`, `cmf-T5.md`); the `!theme` error-page listing (`cmf-T3b.md`); the `DIVERGENCES.md` self-splice
(`cmf-T3g.md`); svek/class label paths still size `<latex>` through KaTeX only.
