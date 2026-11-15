# unresolved-colour (ucol)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #145 (found while applying the #143 ruling). Planned unattended on 2026-11-15 at
`feature/parity-queue` `5bab49f41`.

## Objective

A colour token the jar cannot resolve still produces a valid colour from the jar whenever it draws. Each call site picks
its answer from one of three `HColorSet` methods (`HColorSet.java:58-76`):

| Mechanism | Upstream | The jar draws | We emit |
|---|---|---|---|
| **M1**: link arrow-style token `-[#x]->` | `WithLinkType.java:161-163` `getColorOrWhite` | `#FFF` | raw `x` |
| **M2**: `name:value` colour part (`#line:x`, `#text:x`, `#back:x`) | `Colors.java:105-113` `getColorOrNull`, then `map.put(key, null)` | the default; a later null **replaces** an earlier value | raw `x` |
| **M3**: `<style>` colour value | `ValueImpl.java:92-108` `asColor`, then `getColorOrWhite` | `#FFF` | raw `x` (class), or the default (class arrow `LineColor`) |

The issue's 10 corpus rows are already conformant and pinned. #113's mechanisms landed them (issue comment). What remains
is the issue's 6 authored probes plus 11 more that planning found with the same three mechanisms, in class and description.
This mission:

1. adds an every-row "no invalid colour" assertion to the refusal gate's existing render, plus an authored gate (batch 1);
2. ports M1, M2 and M3 at the class sites (batch 2);
3. ports M1 and M2 at the description sites (batch 3);
4. files the separable and jar-error probes as issues, and re-measures every engine (exit).

## Starting state, measured 2026-11-15 on `5bab49f41`

`npx tsx plans/unresolved-colour/measurements/measure-colours.mts probes /tmp/ucol-t0.json` prints
**rows 33 zero 10 open 23 error 0 invalid 17**. `… corpus /tmp/ucol-corpus.json` prints **scanned 5938 … invalid 0**.

| Probe(s) | Engine | M | Diffs | Ours → jar |
|---|---|---|---|---|
| `class-arrow`, `seq-arrow`, `class-arrow-comma` | class | M1 | 3 each | path/polygon `zzblue` → `#FFF` |
| `class-line`, `class-line-override`, `class-package-line` | class | M2 | 3, 3, 2 | stroke `zzblue` → `#181818` |
| `class-link-colors` (`A --> B #line:zzblue`) | class | M2 + grammar | 58 | `#line` emitted, plus a 15px shift; **also with `#line:red`** (56) |
| `style-class-bg`, `style-root-bg`, `style-root-font` | class | M3 | 1, 2, 2 | `zzblue` → `#FFF` |
| `style-arrow-line` (`arrow { LineColor zzblue }`) | class | M3 | 3 | `#181818` → `#FFF` (no invalid value) |
| `comp-arrow`, `comp-arrow-dashed` | description | M1 | 3 each | `zzblue` → `#FFF` |
| `comp-text`, `uc-back`, `deploy-node-text`, `comp-link-colors` | description | M2 | 1 each | `zzblue` → default |

- **`seq-arrow` is a class diagram in the jar.** `CommandArrow.applyStyle` calls the throwing `getColor`
  (`CommandArrow.java:498`), `SingleLineCommand2.java:176-177` returns `badColor`, and the class factory takes the line.
  We already route it the same way (3 diffs, all colour).
- **Already at zero (gate guards):** `state-arrow`, `state-line`, `state-text` (state goes through `core/decoration/
  WithLinkType.ts` and `core/abel/Colors.ts`, which are faithful), `class-note-line`, `act-partition-header`,
  `act-partition-line`, `skin-arrow`, `skin-class-bg`, `style-comp-bg`, `style-root-bg-comp` (description's style path,
  `core/style/style-reads.ts#stylePaint` → `ValueImpl.asColor`, is faithful).
- **Out of scope; they stay in `measurements/probes/` and the exit files them:**
  - The jar errors on `act-arrow` ("No such color"). We draw the default instead of the #143 neutral.
  - The jar errors on `obj-line` ("No such color", with `#line:red` too). We draw, and emit raw `zzblue`.
  - The jar errors on `class-arrow-multi` (`-[#zzblue;#red]->`, "Syntax Error?"). We draw.
  - `seq-declared-arrow` and `seq-participant-line`: both sides error, which is conformant under the 2026-10-10 rule.
    No issue.
  - `uc-actor-line` (`actor X #line:red`): we route to sequence, the jar to description. It is 10 diffs with a valid
    colour too, so it is separable (D1).
- The cached oracles emit only `#hex`, `none`, `black`, `white` and `url(#…)` in `fill`/`stroke`/`stop-color` (all
  5,938 scanned). That is the validity rule (D3).

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `unresolved-colour/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Pinning moves `docs/parity-report.md`: run
  `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/` or `docs/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/unresolved-colour/measurements/measure-colours.mts probes [out.json] [extra.puml...]`
  (reads `measurements/probes/` and, from T1a on, `tests/fixtures/unresolved-colour/`).
- **Corpus colour scan:** `npx tsx plans/unresolved-colour/measurements/measure-colours.mts corpus [out.json]`. It must
  print `scanned 5938` (a smaller count means a broken walk, not a clean corpus).
- **One engine:** `npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json` (same for
  `component`, `usecase`, `object`, `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D6).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A probe whose residual turns out to be a different mechanism from M1 to M3 (D1, "separable"): measure it, file a
  `queue:ready` issue with the measurement and `file:line`, move it to `OPEN` with that issue, continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Authoring extra probes for a site you touch (`##zzblue`, `#back:zzblue` on a class, `-[#zzblue,bold]->`,
  `#line:zzblue` on a component link, a skinparam `<<stereo>>` colour), each with its oracle; each joins the gate.
- Re-pointing a class or description parser at `core/abel/Colors.ts` or `core/decoration/WithLinkType.ts`, but only if
  every pin of that engine stays byte-identical (D2). Otherwise port the method body in place.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. Every touched module is internal. `dist/*.d.ts` must not move (D6).
- **Dependencies:** nothing new. `core/klimt/color/HColorSet.ts` already has `getColorOrWhite`/`getColorOrNull`.
- **Behaviour:** only colour tokens `HColorSet` cannot parse. Resolvable tokens keep today's path, guarded by the
  class/object/description ratchets, the authored gate and the every-engine survey. M3 also changes what a
  *resolvable-by-the-jar, unparsed-by-`parseSimpleColor`* token does in `cascadeHex`; T2c measures that first.

| File | Action | Task |
|---|---|---|
| `tests/helpers/svg-colour-validity.ts`, `tests/helpers/svg-colour-validity.test.ts` | Create | T1a |
| `tests/oracle/svg-conformance/refusal-coverage-gate.ts`, `refusal-coverage.test.ts` | Modify | T1a |
| `tests/fixtures/unresolved-colour/*.{puml,svg}`, `tests/oracle/svg-conformance/unresolved-colour.authored.test.ts` | Create | T1a; rows move to `ZERO` in T2a to T3b |
| `src/diagrams/class/class-arrow-grammar.ts` | Modify | T2a |
| `src/diagrams/class/class-declaration-extractors.ts`, `class-relationship-parser.ts`, `class-relationship-colors.ts`, `src/core/color-override.ts`, class package colour site | Modify | T2b |
| `src/core/style-cascade-class*.ts`, `style-map-theme.ts`, `theme-graph-colors-*.ts` | Modify | T2c |
| `src/diagrams/description/link-grammar.ts` | Modify | T3a |
| `src/diagrams/description/renderer-color-override.ts`, `link-colors.ts` | Modify | T3b |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gates](batch-1/overview.md) | T1a | [x] |
| [2: class](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [3: description](batch-3/overview.md) | T3a, T3b | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #145)

- [x] No corpus row or gate probe emits an invalid colour value. The refusal gate and the authored gate keep it that way.
- [x] Every gate probe is at 0 diffs, or its residual is on a filed issue the journal names with its mechanism (D1).
- [x] The out-of-scope probes are each on a filed issue, or recorded as conformant (both sides error).
- [x] No new divergence (D4). `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.
- [x] 0 conformant losses in every engine, baseline survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-colours.mts` and `probes/` (33 `.puml` + jar `.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares it with
the live `.claude/settings.json`.

## Summary (2026-11-15)

**Tasks:** T0, T1a, T2a, T2b, T2c, T3a, T3b, T4 done (8 of 8 before the squash). One commit per task, plus a batch-close
commit per batch; the history is on `unresolved-colour/pre-squash`. 18 journal rows before the squash; none flagged for
a ruling.

**Gates (exit, journal row 15):** `npm test` 2279 files / 48909 passed, coverage 96.94/92.55/97.45/97.97; typecheck,
lint, build, format:check 0. Every batch close ran the full set. Batch 2's first `npm test` failed only on the
parity-dashboard drift test (regenerated at the close).

**Verdicts, base `5bab49f41` → exit:** no verdict moved in any of the 30 survey files; the probes were authored, not
corpus rows. `verdict-diff`: 0 lost, 0 timeout or errored.

**Probes:** at the start, 33 rows with 10 at zero and 17 emitting an invalid colour; at exit, 34 rows (one authored,
`comp-text-override`) with 28 at zero and none emitting an invalid colour. The 6 open rows are the out-of-scope probes:
`act-arrow` (#189), `obj-line` (#190), `uc-actor-line` (#191); `class-arrow-multi`, `seq-declared-arrow` and
`seq-participant-line` error on both sides, which is conformant (journal row 17: the brief's "we draw" for
`class-arrow-multi` was wrong). The authored gate holds 28 fixtures, all at zero. The corpus scan: 5,938 rows, 0 invalid.

**Mechanisms:** M1 `getColorOrWhite` (`WithLinkType.java:161-163`) in class (T2a) and description (T3a); M2
`getColorOrNull`, a null clearing its key (`Colors.java:111-113`), in class (T2b) and description (T3b), plus the class
link's trailing colour now on upstream's `COLORS_REGEXP` (it had drawn `:red` as a label); M3 `ValueImpl.asColor`
(`ValueImpl.java:92-108`) in the shared element-scope bucket writer and the class cascade (T2c).

**d.ts:** `dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` are byte-identical to the T0 snapshot (D6).
`DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged (D4).

**Follow-ons:** #189, #190, #191; `planning/next-missions.md`, section "unresolved-colour (ucol)".

**CI risk:** the new tests take 3.0 s locally across 7 files. The refusal gate's 4 parts gain one regex scan per
already-rendered fixture, and read a golden whole only when ours carries a candidate (one row today).
