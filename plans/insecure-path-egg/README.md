# insecure-path-egg (ipe)

**Read first, every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. This file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. The current batch's `overview.md`

Tail [decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #178, which carries the maintainer ruling of 2026-11-13 (option 2). Planned unattended on 2026-11-18
at `feature/parity-queue` `88356232e`.

## Objective

Register `PSystemPathFactory` only under `SecurityProfile.INSECURE`, as `PSystemBuilder.java:178-179` does.
- Under INSECURE, `path <motif>` draws `GraphicsPath`'s 50×50 motif as an SVG page with one black path. The jar writes a
  PNG here; the SVG page is library-forced and signed by #178 (D2, D5).
- A character outside `A-Z`/`a-w` reaches the error page, as `UMotif.convertFromChar` throws (D3).
- Every other profile is byte-identical to today (D1).

## Starting state, read at planning on `88356232e`

- No `path` factory is ported. `tests/fixtures/factories/cov-path-{valid,upper,invalid}.puml` are LEGACY error pairs at
  weightedScore 5 (`oracle/goldens/svg-factories/authored-baseline.json:1077-1121`).
- `ParseOptions` carries `assetStore`, `clock` and `measurer`, but not the profile (`src/core/dispatcher-types.ts:41-49`).
  It is built at one site, `src/index.ts:300`, which is at 496 lines.
- `DirectOsDiagram`, `DotPath` (without `addAfter`), `DriverDotPathSvg`, `UGraphicSvg` and `XPoint2D#move` exist.
  `UMotif` does not.
- Under INSECURE, the jar writes a 285-byte PNG for `path ABCabc`, a 270-byte PNG for `PATH ABC`, and the crash page
  `IllegalArgumentException` for `path abc123`. All three are kept in `measurements/`.
- `oracle/dist/plantuml-oracle.jar` has md5 `1e912cade94fbf96c06a22f4d44ef9b0`.

## Branch

`feature/parity-queue` is already checked out. T0 commits this brief.
- Make one unsigned commit per task, in the **main checkout**, serially, with no worktrees.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
  tags `insecure-path-egg/pre-squash`.
- Never push, and never write `~/git/plantuml`.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

Use `npm test`, never `vitest run tests/unit`. New exports need `npm run catalog`, which is drift-gated. This mission
changes no surveyed output, because surveys render under LEGACY, so no `svg:survey` run is required. The factories ratchet
(`npm test -- tests/oracle/svg-conformance/factories`) is the conformance check. Oracle renders use
`scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. Any LEGACY page changes, whether a `cov-path-*` ratchet row moves or any other test's expected SVG moves, and you
   cannot state the mechanism with `file:line`.
2. The INSECURE page cannot be held at 50×50 without changing `UGraphicSvg` behaviour for other callers.
3. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
4. The same gate fails on 2 consecutive fix attempts.
5. A finding contradicts D1 to D5: amend `decisions.md` with the date, then halt.
6. Anything would write `~/git/plantuml`, push, or change `oracle/accepted-divergences.json`.

A file outside a task's write-set is **not** a stop: change it and journal why (CLAUDE.md, "Writing and write-sets").

## Push-forward (decide, journal, continue)

- Where `parseOptionsOf` lives (`render-options.ts` or a sibling), if an import cycle forces a move.
- Extending `SingleLineSpec` to carry `registeredOnlyUnder`.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks.
- Authoring extra `tests/fixtures/factories/cov-path-*.puml` LEGACY rows (with oracles) for branches no row covers, such
  as `path` with a tab separator or a trailing space.
- Rerunning a timed-out vitest at lower load before calling it a finding.

## Blast radius

- **Data model:** none.
- **API:** `RenderOptions` is unchanged, and `securityProfile` now also gates `path`. `ParseOptions` and `SyncPlugin`
  gain optional fields, which is non-breaking.
- **Oracle:** no oracle bytes change. `authored-baseline.json` changes topic text only.
- **Dependencies:** none added.
- **SVG output:** unchanged except for `path` under INSECURE, which draws where it used to error.

| File | Action | Task |
|---|---|---|
| `src/core/dispatcher-types.ts`, `src/core/dispatcher.ts`, `src/core/render-options.ts`, `src/index.ts` | Modify | T1a |
| `tests/unit/core/dispatcher-security-gate.test.ts` | Create | T1a |
| `src/core/klimt/UMotif.ts`, `tests/unit/core/klimt/UMotif.test.ts` | Create | T1b |
| `src/core/klimt/shape/DotPath.ts`, its unit test | Modify | T1b |
| `src/diagrams/eggs/{GraphicsPath,PSystemPath,PSystemPathFactory}.ts` and tests | Create | T2a |
| `src/registered-plugins.ts`, `tests/unit/utility-registration.test.ts` | Modify | T2a |
| `DIVERGENCES.md`, `src/diagrams/version/PSystemVersion.ts` (comment), `authored-baseline.json` (topics), `docs/catalog.md`, `.claude/memory/*` | Modify | T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — profile gate and UMotif](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — the path egg](batch-2/overview.md) | T2a | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #178, option 2)

- [x] Under INSECURE, `path ABCabc` and `PATH ABC` render a 50×50 SVG page whose one black path has the jar PNG's points
  (D2).
- [x] Under INSECURE, `path abc123` renders the error page (D3).
- [x] With no options, and under every other profile, the `cov-path-*` pages are unchanged and pinned at 5.
- [x] `pathPlugin` is registered at java:179, between RIP and Charlie, gated by `registeredOnlyUnder` (D1).
- [x] `DIVERGENCES.md` names the INSECURE page as library-forced, citing #178 (D5).
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass.

## Baseline

Phase 8, 2026-11-18, on `88356232e`: see [decision-journal.md](decision-journal.md) row 0.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed table.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): the jar's INSECURE outputs and `decode-motif.py`.

**Settings:** `.claude/settings.autonomous.json` already covers every command here (`npm`, `git`,
`scripts/oracle-render.sh`, `gh issue`). It was deliberately not regenerated, because the SessionStart hook compares it
with the live `.claude/settings.json`.

## Summary

- **Tasks:** T0, T1a, T1b, T2a, T3 done as planned; T4 (squash) follows.
- **Decisions:** 10 journal rows. Flagged for review: row 7, the port-only `SvgOption.fixedDim` (outside the write-set,
  needed because `minDim` 50 gives a 51 px root and ink grows it); row 8, the path regex written with `i` and not
  `Pattern2.compileInternal`'s `iu`; row 3, `singleLinePlugin` counts as a command factory for `testsEmpty`, not
  "neither" as D1 says, with D1's consequence unchanged.
- **Gates:** at every batch close and at exit, `npm test -- --maxWorkers=4` (final: 2309 files, 49592 tests passed),
  typecheck, lint, build and format:check all exited 0. Factories ratchet green, `cov-path-*` at 5. The 15 non-INSECURE
  `cov-path-*` pages are byte-identical before and after.
- **Follow-ups:** none required. `isEmptyDescription` does not consult `registeredOnlyUnder`; harmless for `pathPlugin`,
  but a future gated plugin with a non-command factory base would need it. #178 was commented on; it closes when the
  branch merges.
