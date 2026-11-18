# version-builtin (vb)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #155 (from #121, `activity-authored-rows` T5c). Planned unattended on 2026-11-16 at
`feature/parity-queue` `c84de6c60`.

## Objective

Make `%version()` return this port's version string, as the maintainer ruled on #155, and account for the one corpus
row it touches as a signed, ledgered divergence.

The ruling, quoted from the issue body (added 2026-11-09, when `needs-ruling` was swapped for `queue:ready`):

> [sseely] Version should return this port's version string. If 'Unknown', use something like `0.0.999`.

That is the issue's option (c): "return this port's version string, with the row named as a divergence".

- **Upstream.** `GetVersion#executeReturnFunction` returns `TValue.fromString(Version.versionString())`
  (`tim/builtin/GetVersion.java:63-66`), and `Version.versionString()` returns `CompilationInfo.VERSION`
  (`version/Version.java:47-49`). The oracle jar is an unfiltered development build, so it prints the placeholder
  `$version$`.
- **Ours.** `GetVersion` returns `env.getVersionString()` (`src/core/tim/builtin/GetVersion.ts:37`). The only
  environment production builds, `createDefaultTimEnvironment()`, answers `'unknown'`
  (`src/core/tim/builtin/TimEnvironment.ts:140`). `preprocessor.ts:338` and `TContext.ts:98` both start from it.
- **The port's version already exists.** `versionString()` in `src/core/version.ts:32-34` returns `VERSION`
  (`'0.2.0'`), which `tests/unit/core/version.test.ts:12-16` pins to `package.json#version`. The error page already
  prints it (`fullDescription`, ruling 2026-10-08).

This mission:

1. makes the default environment answer `versionString()`, so `%version()` prints `0.2.0` (batch 1, T1a, D1, D2);
2. ledgers `svg-activity/rekefe-90-baju604` as an accepted divergence, adds its `DIVERGENCES.md` entry, and rewrites
   the parity-report note that says it "waits on #155" (T1b, D3);
3. re-measures every engine and closes out (exit, squash).

## Starting state, read 2026-11-16 on `c84de6c60`

`tests/oracle/svg-conformance/parity-activity.json` holds `rekefe-90-baju604` as `diverged`, `maxDelta` 2.65,
`firstDiff` `svg/g[1]/g[1]/text[1]/@textLength`. `oracle/goldens/svg-activity/diff-baseline.json` records it at
`diffCount` 5, `weightedScore` 5 (measured 2026-11-03, `85d5ca8e`). The issue lists the 5 diffs, all on the legend line
`Rendered with Plantuml Version %version()`:

| | text | textLength |
|---|---|---|
| ours | `Rendered with Plantuml Version unknown` | 148.55 |
| jar | `Rendered with Plantuml Version $version$` | 151.2 |

`rect[1]/@width`, `rect[1]/@x` and `text[1]/@x` follow from the text width. After T1a the row stays `diverged` with
the same 5 attributes, now `0.2.0` against `$version$`. T1b measures the new `maxDelta`; do not predict it.

The fixture is `tests/corpus/class/rekefe-90-baju604.puml` (classified under `class`, surveyed as activity); its oracle
is `test-results/dot-cache/activity/rekefe-90-baju604/in.svg`.

- **Pre-flight at planning:** see journal row 0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `version-builtin/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Survey moves change `docs/parity-report.md` and
  `docs-site/parity.md`: run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **The row:** `npm run svg:survey -- activity --out tests/oracle/svg-conformance/parity-activity.json`, then read the
  `rekefe-90-baju604` record. Without `--out`, a positional type overwrites `parity.json`.
- **Activity pins:** `npx vitest run tests/oracle/svg-conformance/activity.diff-baseline.ratchet.test.ts
  tests/oracle/svg-conformance/activity.text-baseline.test.ts tests/oracle/svg-conformance/activity.style-baseline.test.ts`;
  read the count.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D4. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D4).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A `%version()` row other than `rekefe-90` found by the survey or a corpus grep: it moves for the same reason. Add it
  to the same ledger entry's reasoning (or its own entry with the same sign-off) and journal it.
- `diff-baseline.json`'s `weightedScore` for `rekefe-90` falling: that is the ratchet's `[IMPROVED]` path. A rise is
  stop 1 unless T1b can name the attribute and its Java line, in which case re-measure the row per the ratchet's own
  re-pin procedure and journal it.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Grep the corpus and `~/git/pdiff/` for `%version()`; render any hit and check it prints `0.2.0`.
- Author a fixture `tests/fixtures/version-builtin/version-legend.puml` with its oracle if the authored-fixture tests
  need one; otherwise the unit tests in T1a are the pin.
- If a reachable path is found where the version would be empty or `unknown`, add the ruling's `0.0.999` there as a
  named constant citing #155 (D2). Do not add it where it cannot be reached.
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. `TimEnvironment` and `createDefaultTimEnvironment` are not exported from
  `src/index.ts`; `dist/*.d.ts` must not move (D4).
- **Dependencies:** nothing new.
- **Behaviour:** any diagram that calls `%version()` prints `0.2.0` instead of `unknown`. One corpus row,
  `activity/rekefe-90-baju604`, uses it. The `<?plantuml $version$?>` processing instruction and every error page are
  unchanged.

| File | Action | Task |
|---|---|---|
| `src/core/tim/builtin/TimEnvironment.ts` (`createDefaultTimEnvironment`, JSDoc of `getVersionString`) | Modify | T1a |
| `src/core/tim/builtin/GetVersion.ts` (header JSDoc) | Modify | T1a |
| `tests/unit/core/tim/builtin/env-functions.test.ts:34`, `string-functions.test.ts:248-255` | Modify | T1a |
| a preprocess-level test of `%version()` (find the home with `grep -rln "preprocessOrError" tests/unit`) | Create or modify | T1a |
| `oracle/accepted-divergences.json` (`entries`) | Modify | T1b |
| `DIVERGENCES.md` (section "Preprocessor (TIM)") | Modify | T1b |
| `scripts/parity-dashboard-notes.ts` (`activity.detail`) | Modify | T1b |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs-site/parity.md` | Modify | T1b, batch closes |
| `oracle/goldens/svg-activity/{diff,text,style}-baseline.json` (only if a pin moves, see stops) | Modify | T1b |
| `planning/next-missions.md` | Modify | T2 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: version string, accounting](batch-1/overview.md) | T1a, T1b | [x] (closed; halted for #206, resumed at journal row 15) |
| [exit](batch-exit/overview.md) | T2 | [x] |
| [squash](batch-squash/overview.md) | T3 | [x] |

## Done when (issue #155)

- [x] `%version()` returns `versionString()` (`0.2.0`) under the default environment; a unit test and a
      preprocess-level test hold it.
- [x] `svg-activity/rekefe-90-baju604` is an in-force entry in `oracle/accepted-divergences.json`, signed by the #155
      ruling, with its measured `maxΔ`; `DIVERGENCES.md` names it.
- [x] The parity report no longer says the row "waits on #155"; `docs/parity-report.md` regenerated.
- [x] 0 conformant losses in every engine, baseline survey against final survey (0 unledgered: kipive-74 is
      ledgered, accepted on #206; journal row 18).
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D4, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx vitest`, `npm`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated, because the
SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-17)

**Tasks:** T0, T1a, T1b, T2, T3 done (5 of 5); the per-task history is on `version-builtin/pre-squash`. Batches 0, 1 and exit closed. The mission halted once after
batch 1 for #206 (journal row 14). The maintainer answered on 2026-11-17 and the run resumed at row 15. 18 journal rows
before the squash; row 14's question is answered and none is open.

**Gates (exit, journal row 17):** `npm test` 2297 files / 49167 passed, coverage 96.96/92.54/97.43/97.99; typecheck,
lint, build and format:check 0. Batch 1's close needed one fix (catalog drift from `GetVersion.ts`'s header, row 12).

**Verdicts, base `3acbdc2ed` → exit:** lost 1, `c4/kipive-74-lele070` conformant → diverged (`error-page`), ledgered
and accepted on #206. That makes 0 unledgered losses, with 0 timeouts or errors. Every other verdict is unchanged.
Activity is 873/4/1.

**The rows:** `activity/rekefe-90-baju604` stays diverged on the same 5 legend-line attributes, `0.2.0` against the
dev-build jar's `$version$`. Its maxDelta went 2.65 → 16.95 and its weightedScore stayed at 5. `c4/kipive-74-lele070`
was conformant as two error pages. The jar refuses `$version$` but accepts `0.2.0`, and the release jar draws it too.
Both rows are in-force entries in `oracle/accepted-divergences.json`, and `DIVERGENCES.md` names them.

**d.ts:** byte-identical to the T0 snapshot.

**Follow-ons:** #205 (`2.13.0` then `0.2.0` draws a class diagram where the jar falls through to description). See
`planning/next-missions.md`, section "version-builtin (vb)".

**CI risk:** none new. One string constant changed. Four unit or preprocess tests were added, and the refusal and
routing baselines were re-pinned for kipive-74 (`refusal-coverage.test.ts` counts 157 → 156 erroring).

### Halt record (2026-11-16, superseded)

**Tasks:** T0, T1a, T1b done, batches 0 and 1 closed (`35170bd84`, `5dddc8fa6`). T2 (exit) and T3 (squash) not run. No
squash, no `version-builtin/pre-squash` tag. 14 journal rows; row 14 is flagged for a ruling.

**Why halted:** the every-engine survey found a second `%version()` row, `c4/kipive-74-lele070`, which left conformant
(journal rows 8-11). The brief calls that not-a-stop, but the execution prompt lists a lost conformant row as a halting
failure, and this brief's own Done-when needs 0 losses. Ruling requested: **#206**.

**Gates (batch-1 close, journal row 12):** `npm test` 2296 files / 49165 passed, coverage 96.96/92.54/97.43/97.99;
typecheck, lint, build and format:check 0. One fix: catalog drift from `GetVersion.ts`'s reworded header.

**Verdicts, base `c84de6c60` → batch 1:** lost 1 (`c4/kipive-74`), 0 timeout or errored; everything else unchanged.
`activity/rekefe-90`: diverged, maxDelta 2.65 → 16.95, the same 5 legend attributes (weightedScore 5).

**d.ts:** byte-identical to the T0 snapshot.

**Filed:** #205 (class draws `2.13.0`/`0.2.0` as a class diagram where the jar falls through to description), #206
(ruling).

**Resume:** on "accept" in #206, run batch-exit (T2) and batch-squash (T3) as written. `verdict-diff` will still print
"lost 1" for the ledgered row, so read T2's acceptance as "0 unledgered losses". On "reject", follow the ruling,
retire the kipive-74 ledger entry, and re-measure.
