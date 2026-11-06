# c4-divergence-drive (c4dd)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #114. Planned unattended on 2026-11-04 at `feature/parity-queue` `ad66196f6`.

## Objective

Take the **3 open `c4` rows** that can reach the jar (`biluko-70`, `rosoga-84`, `vakasu-51`) to conformant, and pin every conformant `c4` row in a ratchet. `gikaju-64` is already a signed accepted divergence and stays one. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`. The issue's title defect, boundary-box rounding, is already fixed by #113.

## Starting state, measured 2026-11-04 on `ad66196f6`

A fresh `npm run svg:survey -- c4` matches the committed file: 7 conformant, 4 diverged, the verdict and first diff of all 11 unchanged. The issue's 9 diverged predates #113.

| Row | Every diff, by mechanism | Evidence | Task |
|---|---|---|---|
| `biluko-70` | `filter/@id`, `text/@filter`: seed `1pir1to0b9a7i` against the jar's `mz1zsmol5ic` | Our seed lines hold each stdlib sprite's whole block; the jar's `BlockUml#data` holds one compiled line. Folding the block gave `transformed==jar True`, and that list hashes to the jar's seed | T1a |
| `biluko-70` | `text[2]/@y` 80.444 against 81.111 | `EntityImageDescriptionTextBlock.ts:159` takes one descent per line. Jar: `Sea.java:72-80` + `AtomText.java:213-215`, per atom. Delta = (16-13)/4.5 | T1b |
| `rosoga-84` | Package `path/@d` radii 2.604 and 3.906 against 4.167 and 6.25 | `PACKAGE_ROUND_CORNER = 5` (`class-package-style.ts`) against `Cluster.java:321`, the merged style; `skinparam roundcorner 8` is root (`FromSkinparamToStyle.java:164`) | T2b |
| `rosoga-84` | `path/@stroke-dasharray` `7.291666666666667` against `7.292` | The class edge writes the raw product; the jar's output is rounded | T2c |
| `vakasu-51` | Legend `rx`,`ry` 7.813 against 4.167 | The annotation path keeps `legend { RoundCorner 15 }`; the merged style answers 8 | T2a |
| `vakasu-51` | Legend table `fill`, `stroke` `#FFF` against `none` | `StripeTable.ts:122` asks `parseSimpleColor`, which has no `transparent`. Jar: `HColorSet.java:58-59` calls `parseColor` | T3a |
| `vakasu-51` | `-[#orange,dashed]->` stroke 1.042 against 3.125 | `description-elk-adapter.ts:388` `getArrowThickness` returns null. Jar: `MyElkEdge.java:171` reads `getThickness(LineParam.arrow, null)`; the theme says `arrow { Thickness 3 }` | T3b |
| `gikaju-64` | Error page | Signed in `oracle/accepted-divergences.json`, ruling 2026-10-10. Not reopened | T5 verifies |

Rows `compareSvg` passes still differ by bytes: `rosoga-84` has `width="171px"` against the jar's `171.875px`, and a comment `link 2.13 to 0` against `link 13 to 0`. T2c owns both.

**Pins today:** 5 of 7 conformant rows in `oracle/goldens/svg-description/`. `xetego-25` is CLASS-routed and `kipive-74` is an error page, so neither is pinned. `docs/parity-report.md` prints `c4 | n/a (no ratchet yet)` despite those 5.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**. Do not create another branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and tags `c4-divergence-drive/pre-squash`. Never push: the user reviews, signs and opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated). A `vitest run <paths>` that collects nothing exits 0: read the count.

## Measurement commands

Tools are under `plans/c4-divergence-drive/measurements/`, plus three reused from `plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey `c4`, under a minute, always with `--out`: `npm run svg:survey -- c4 --out /tmp/c4dd-<task>/parity-c4.json`. Positional type with no `--out` clobbers `parity.json`.
- `node plans/c4-divergence-drive/measurements/c4-moves.mjs /tmp/c4dd-b0/parity-c4.json /tmp/c4dd-<task>/parity-c4.json`: moved rows; exit 1 on a loss.
- `npx jiti plans/c4-divergence-drive/measurements/row-diffs.mts /tmp/c4dd-<task>/parity-c4.json /tmp/c4dd-<task>/diffs.json [slug ...]`: every diff of the rows, and our SVG beside the JSON.
- `node plans/c4-divergence-drive/measurements/stdlib-probes.mjs /tmp/c4dd-probes`, then `npx jiti plans/c4-divergence-drive/measurements/seed-probe.mts /tmp/c4dd-probes`: seed lines against the jar's `-preproc`, 45 probes. Today `equal 2/45`.
- `npx jiti plans/c4-divergence-drive/measurements/seed-lines.mts <in.puml> <out.txt>`: the seed lines of one source.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every engine, at batch close. Exit 1 on a loss.
- `npx jiti plans/description-divergence-drive/measurements/pin-description.mts tests/oracle/svg-conformance <label> [--write]`, `npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts`.
- `scripts/oracle-render.sh <out-dir> <puml>` for an authored oracle, never a hand-typed `java -jar`. `stdlib-probes.mjs` is the one exception: `-preproc` writes source, not a measurement, and it sets the flag anyway.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7: amend `decisions.md` with the date, then halt.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, or merging two whose rows turn out to share a mechanism.
- A residual diff a fix uncovers on these rows: `compareSvg` short-circuits, so expect some. Read the Java and fix it in the task that owns it, or add a task.
- Authored `.puml` fixtures and oracles where a branch has no corpus row.
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's issue: T5 comments there.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — `biluko-70`: seed and baseline](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — `RoundCorner` and the class path](batch-2/overview.md) | T2a-T2c | [x] |
| [3 — `vakasu-51`: table colour and ELK stroke](batch-3/overview.md) | T3a, T3b | [x] |
| [4 — probes past the rows, then pins](batch-4/overview.md) | T4a, T4b | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #114)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md) — D1 to D7, operational readiness.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated: editing it would break that identity (the SessionStart hook compares them).

## Summary

**Tasks:** 12 of 12 planned, T0 to T5 and T6, plus the box title fix T4a's probes found. No halt, no `needs-ruling` issue: no row needed one.

**Verdicts, `c4`:** 7 conformant, 4 diverged, to 10 conformant, 1 diverged.

| Row | End |
|---|---|
| `biluko-70` | Conformant: seed (T1a), per-atom baseline (T1b) |
| `rosoga-84` | Conformant: corners (T2b), dash, and root and comment bytes (T2c) |
| `vakasu-51` | Conformant: corner (T2a), table colour (T3a), ELK stroke (T3b) |
| `gikaju-64` | Signed jar error page, entry untouched |

**Losses:** 0 in every engine, baseline against final. Across 5,927 surveyed rows, only those three moved in verdict, first diff or max delta. `dist/*.d.ts` identical to the base build. `oracle/accepted-divergences.json` unchanged.

**Pins:** `c4` 5 to 9 across two ratchets: `biluko-70`, `vakasu-51`, `rosoga-84`, `xetego-25`. `kipive-74` stays out as an error page. The ELK rule also pinned `component/dirofi-81`, `unknown/foraba-98` and `unknown/xoviku-63`. `docs/parity-report.md` prints 9, from `n/a`.

**Gates at T5:** `npm test` 40983 passed, 1968 files, coverage 97.29/93.1/98.01; typecheck, lint and build exit 0.

**Authored against the jar:** 101 rows, of which `emoji-mixed-edge` is held out for #150. The rest are at 0 diffs.

**Left, each a `queue:ready` issue blocking #136, none reachable by a `c4` corpus row:** #148, #149, #150, #151.

**Other queue issues:** no row of #115, #120, #122, #140 or #145 moved, so none got a comment.

**CI risk:** #113's 282 pins and these 7 are unmeasured on the runner until the first PR run. The slowest shard was 506 s of 600 s on #146.

**Flagged for review:** journal rows 2, 21 and 27 correct the brief or an earlier row of this journal. Row 25 reports the three pins outside `c4`. Rows 10 and 27 together show a mechanism I named and then withdrew: #148 says it is unconfirmed.
