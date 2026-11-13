# factories-tail-port (ftp)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #135. Planned unattended on 2026-11-12 at `feature/parity-queue` `4b361ac57`.

## Objective

Make the last four `PSystemBuilder` factories known types (`PSystemBuilder.java:133-200`), as the v1.0 definition in
`planning/roadmap.md` requires:

| Factory | Java | This mission |
|---|---|---|
| `PSystemWelcomeFactory` (java:133) | `eggs/PSystemWelcome{,Factory}.java` | Register it. The page already exists; its gate leaves `emptySvg` (D8). |
| `PSystemListFontsFactory` (java:148) | `font/PSystemListFonts{,Factory}.java` | Port it. Ruling #169 governs its font list (D4). |
| `CrashDiagramFactory` (java:200) | `crash/` (5 of 9 files) | Port it with `@startcrash`, plus `PSystemBuilder`'s catch (D6, D7). |
| `PSystemPathFactory` (java:179, INSECURE only) | `eggs/PSystemPath{,Factory}.java`, `GraphicsPath.java` | Port nothing. File the INSECURE output question as `needs-ruling` (D5). |

**Then:**
- take every fixture to an end (D9);
- pin the 6 corpus rows and the authored fixtures in `svg-factories` (D3);
- lose no conformant row in any engine;
- regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-12 on `4b361ac57`

- **Welcome:** a two-line `@startuml` already draws the jar's page, through `emptySvg`'s `isWelcomeSource`
  (`src/core/error/error-diagrams.ts:132-165`), not through a factory. `gujuga-46-vifa350` and `vesuzo-97-jelo022` are
  conformant. Neither is pinned in a ratchet golden, and the refusal baseline still calls them `known-gap`.
- **ListFonts:** 4 `unknown` rows (`jivufi-79-simi298`, `jodesa-24-lovo810`, `kubuju-35-neji041`, `vofomo-62-gure525`)
  are diverged at 120 diffs (our refusal page against the host's 2355-px font list).
- **Crash:** `@startcrash` draws "unknown diagram type". The tag is missing from `START_SUFFIX_MAP`;
  `diagram-type-set.ts:114` already maps `crash` to `CRASH`.
- **Path:** under the default profile, `path X` is an error pair on both sides.

**27 planning probes** are in [probes/](probes/). They were rendered with `scripts/oracle-render.sh` 3 times into
`/tmp/ftp-plan/r{1,2,3}/<slug>/`, and copied with their r1 oracle into `/tmp/ftp-plan/fx/`.
`npx jiti plans/factories-tail-port/measurements/fixtures.mts --dir /tmp/ftp-plan/fx` measures 10/27 at 0 today:
- 4 Welcome drawn pages;
- 6 error pairs: `crash-empty`, `listfonts-glued`, `listfonts-two-lines`, `path-valid`, `path-invalid`, `welcome-blank`.

The other 17 are open:
- all 11 other `cov-crash-*` at 11 diffs (unknown diagram type);
- 5 drawn `cov-listfont*` at 120;
- `cov-listfonts-tab` at 19 (both sides error, but the body lines differ: T2b).

The pieces that exist:
- **Single-line gate:** `singleLinePlugin`. **Plain pages:** `PlainStringsDiagram`, plus `PSystemWelcome` with
  `GraphicStrings` and the logo.
- **Commands:** `UBrexSingleLineCommand2`, `ProtectedCommand` (`ListSpriteDiagramFactory.ts:82-100`).
- **Model and drawing:** `TitledDiagram`, `Display`, `FontConfiguration.blackBlueTrue`.
- **Fonts:** the #169 seam `availableFontFamilyNames()`.
- **Precedent:** lsp's help-typed export.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, with no worktrees** (D10).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `factories-tail-port/pre-squash`.
- Never push. The user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- New exports need `npm run catalog`, which is drift-gated.
- A `vitest run <paths>` that collects nothing exits 0, so read the count.
- Stay on graphviz 16.1.0 (`dot -V`).

## Baseline

Measured at planning on `4b361ac57`: see journal row 0. `npm test -- --maxWorkers=4` and `npm run lint` both exit 0.
Typecheck, build and `format:check` were not run. T0's batch close is their first run on the base.

## Measurement commands

Run each with `node` or `npx jiti`, and type every command literally. The allowlist has no `bash plans/...`, no
`date` and no env prefixes. Run producers **alone**, and never `cd` below the repo root.

- **Fixtures:** `npx jiti plans/factories-tail-port/measurements/fixtures.mts [--dir <dir>] <slug...>` prints
  `slug<TAB>diffs<TAB>firstDiff`, and counts error pairs. Use it, not cmf's copy (D3: rename fix).
- **Jar stability (D12):** `node plans/listsprite-factory-port/measurements/jar-variants.mjs /tmp/ftp-<task>/variants 3
  <puml...>`. It is keyed on `HELP`, so T2a copies it with this mission's markers.
- **Every engine, at batch close from batch 1 on:** run `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 means a loss.
  `verdict-diff` takes a **git ref**.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine leaves conformant, and you cannot state its mechanism with `file:line`. One
   exception: when T1d is the cause, revert T1d and go on (D7).
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D12. Amend `decisions.md` with the date, then halt. This includes any `dist/*.d.ts`
   change beyond an added type or union member.
5. A drawn fixture's jar output is not byte-stable across renders (D12).
6. Registering Welcome or ListFonts changes which error page wins for a row that is conformant today, and moves it away
   from the jar (D2).

**These are not stops:**
- A fixture that needs a ruling. It goes on a `needs-ruling` issue that names it, and everything else finishes.
- A file outside a task's write-set. Change it and journal why.

`oracle/accepted-divergences.json` is never edited here.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff that a fix uncovers: read the Java, then fix it in the task that owns it or add a task.
- More authored fixtures where a branch has none, each with a jar oracle.
- Helper splits forced by the hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.
- Fixing a stale tool (another `plantuml-ts` regex) in this plan's copy. Never edit an earlier plan's tools.

## Blast radius

- **Data model:** none.
- **API:** no public change. `block-extractor.ts#DiagramType` gains `'crash'`. T4 checks `dist/*.d.ts`.
- **Dependencies:** nothing new. No layout engine is involved.
- **Routing:** `@startcrash` changes. So do two-line `@startuml` (same page, new owner) and single-line
  `listfont[s]`.
- **Shared seams:**
  - `dispatcher.ts#attempt` gains `PSystemBuilder`'s catch (D7), so every engine runs through it.
  - The error-page choice among `@startuml` candidates gains two candidates (D2).
  - `availableFontFamilyNames` moves into `src/core/` (D4).

| File | Action | Task |
|---|---|---|
| `src/diagrams/eggs/PSystemWelcomeFactory.ts`, `src/core/error/error-diagrams.ts`, `src/index.ts` | Create, Modify | T1a |
| `src/diagrams/font/PSystemListFonts{,Factory}.ts`, `src/core/available-font-family-names.ts`, `src/diagrams/help/CommandHelpFont.ts` | Create, Modify | T1b |
| `src/diagrams/crash/*.ts`, `src/core/block-extractor.ts`, `src/core/diagram-type-set.ts` (comment) | Create, Modify | T1c |
| `src/core/dispatcher.ts` | Modify | T1d |
| `src/registered-plugins.ts`, `tests/unit/utility-registration.test.ts` | Modify | T1a to T1c |
| `tests/unit/{eggs,font,crash,core}/**` | Create | T1a to T1d |
| `tests/fixtures/factories/cov-{welcome,listfont,listfonts,crash,path}-*` | Create | T2a |
| `src/diagrams/{crash,font,eggs}/**`, shared modules a residual reaches | Modify | T2b |
| `tests/oracle/svg-conformance/{render-fixture-factories.ts,factories.*.ts}`, `oracle/goldens/svg-factories/**`, `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, `plans/factories-tail-port/measurements/*`, `DIVERGENCES.md` (#169 entry rows) | Modify, Create | T3 |
| `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/{roadmap,next-missions,mission-guide}.md`, `docs/catalog.md` | Modify | T1a to T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline, Path ruling issue](batch-0/overview.md) | T0 | [x] |
| [1: the three factories and the catch](batch-1/overview.md) | T1a, T1b, T1c, T1d | [x] (T1d reverted, D7) |
| [2: fixtures and residuals](batch-2/overview.md) | T2a, T2b | [x] |
| [3: ratchet](batch-3/overview.md) | T3 | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #135)

- [x] Every fixture of the type is conformant, or named in `DIVERGENCES.md` with a forcing library or a signed ruling.
  A row that needs a ruling is on a new `needs-ruling` issue and is not decided here (D5, D9).
- [x] 0 conformant losses in every engine, comparing the baseline survey with the final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D12, operational readiness, and the auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 27 planning probe sources. [measurements/fixtures.mts](measurements/fixtures.mts): the
  rename-fixed fixture tool.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief: `node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh` and `gh issue`. It was deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-13)

**Tasks:** 9 of 9 planned ran (T0, T1a–T1d, T2a, T2b → T2b1, T3, T4); T5 squashes. T1d was ported and then
reverted per D7 (journal row 7): it is faithful, but it unmasks class/state `ProtectedCommand` gaps that make
`odd-T4a` `n-i`/`colon-add` move away from the jar. Follow-on 1 in `planning/next-missions.md`.

**Gates** (batch 2+3 close and exit, on the T3 tree): `npm test -- --maxWorkers=4`, `typecheck`, `lint`, `build`,
`format:check` all exit 0 (counts in journal row 13). Survey: `verdict-diff 4b361ac57` lost 0, timeout/errored 0 in
every engine; no census file moved; `oracle/accepted-divergences.json` unchanged.

**Verdicts, base → final:** every engine unchanged. `unknown` 972 conformant / 16 structural / 60 diverged both
times: the Welcome rows were already conformant (now through `welcomePlugin`), and the 4 ListFonts rows stay diverged
at 21 diffs instead of 120 (the host font list, ruling #169). Dashboard: pins 463 → 465, refusal coverage 1007 → 1013
of 1048.

**Corpus rows:** `gujuga-46-vifa350`, `vesuzo-97-jelo022` conformant, pinned in `svg-factories`;
`jivufi-79-simi298`, `jodesa-24-lovo810`, `kubuju-35-neji041`, `vofomo-62-gure525` in `diff-baseline.json` with
the #169 reason, listed in `DIVERGENCES.md`. Routing/refusal baselines: the 6 rows `known-gap` → `ok`.

**Authored (35, `tests/fixtures/factories/cov-{welcome,listfont,listfonts,crash,path}-*`):** 11 equal, 18 error
pairs (16 by `fixtures.mts`, plus `cov-crash-finalizing` and `cov-crash-drawing-then-finalizing` by the 2026-10-10
rule), 6 #169 pages (`cov-listfont{,s}-*` drawn), 0 open. All 17 drawn oracles byte-stable over three jar renders.

**Rows left non-zero, each with its end:**
- 4 ListFonts corpus rows and 6 drawn `cov-listfont*` fixtures: named in `DIVERGENCES.md` "`help font` lists no
  fonts" (ruling #169).
- `cov-crash-finalizing`, `cov-crash-drawing-then-finalizing`: error pairs (2026-10-10); the fatal-page body text
  waits on follow-on 1 (re-land T1d).
- 5 ReportLog crash-page fixtures: error pairs; the crash report stays unported by the existing ruling.
- Path under INSECURE: ruling issue #178 (`cov-path-*` are default-profile error pairs).

**Shared fix:** error-page listings expand tabs at `TileText` tab stops (`error-page-exact.ts`, T2b1).

**API:** `dist/*.d.ts` byte-identical to the T0 snapshot (journal row 13). No new dependency.

**CI risk:** low. Latest main run (43313258685): slowest shard 4 at 10 m 11 s. The factories suites (565 tests)
take 6.1 s locally; at the 2–8× runner factor that is well under a minute added.

**Not done by the agent (denied):** adding `Blocked by #178.` to #136's body; see `.agent-notes/ftp-T0.md`. The
#135 and #136 outcome comments were posted (#135 comment 6840194294, #136 comment 6840197485); the #136 comment asks
the maintainer to add the line.
