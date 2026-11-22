# activity-arrow-embed (aae)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #188 (filed by mission ele, #144 T4). Planned unattended on 2026-11-21 at
`feature/parity-queue` `229a5a836`.

## Objective

An activity-3 arrow label (`-> {{…}};`) that holds an embedded diagram is placed off the jar. Upstream builds the
label in `FtileFactoryDelegator#getTextBlock` (`activitydiagram3/ftile/FtileFactoryDelegator.java:103-112`,
`display.create7(fc, LEFT, skinParam, CreoleMode.SIMPLE_LINE)`), reserves `35 + height` in
`FtileFactoryDelegatorAssembly#assembly` (`ftile/vcompact/FtileFactoryDelegatorAssembly.java:57-96`), and places it
in `Snake#getTextBlockPosition` (`ftile/Snake.java:244-270`) at `y = mid - dim.height / 2`. This mission:

1. diagnoses, with the Java quoted, what `dim` the jar's arrow-label block reports for an embed line (batch 1);
2. makes the authored rows `act3` and `act3-open` reach 0 diffs (batch 2);
3. probes the other activity-3 label sites that take the same block, and pins each probe (batch 3).

**The mechanism is not yet diagnosed.** The facts below are measurements, not a cause. T1 states the cause.

## Starting state, measured 2026-11-21 on `229a5a836`

`npx tsx plans/activity-arrow-embed/measurements/measure-probes.mts /tmp/aae-t0.json
plans/activity-arrow-embed/measurements/probes/act3-mixed.puml` prints **rows 3 zero 0 open 3**:

| Row | Diffs | Canvas ours / jar | `<image>` ours / jar |
|---|---|---|---|
| `act3` (`-> {{\nclass X\n}};`) | 3 | 115x201 / 114x201 | 61x68 @(33.338, 83.444) / @(33.338, 92) |
| `act3-open` (`-> {{;`) | 30 | 586x342 / 585x339 | 532x227 @(33.338, 114.944) / @(33.338, 92) |
| `act3-mixed` (planning probe, `-> hi\n{{\nclass X\n}};`) | 2 | 115x222 / 114x222 | 61x68 @(33.338, 108.944) / same |

What the measurements show (verify each before relying on it):

- **The jar's label top is `mid - 5` in both embed-only rows**: the arrow runs 87 → 107, so `mid = 97`, and the image
  sits at y = 92. By `Snake.java:250` the block the jar hands `getTextBlockPosition` is **10 tall**, whatever the
  nested image's size (68 or 227).
- **The stock jar agrees** (`oracle/dist/stock/plantuml-stock-97a5992…jar`, no `-D` flags; outputs in
  `measurements/probes/stock/`): its line runs 89.133 → 109.133 and its image sits at 94.133 = `mid - 5`, for both
  rows. So the 10 is upstream behaviour, not an oracle-seam artifact. Mirror it.
- **The jar reserves no extra gap for an embed-only label**: the `:a` → `:b` arrow is 20 long, as with no label.
  A 3-line text label (`-> hello\nworld\nthree;`) does grow it (87 → 148.444), and we match that row at 0 diffs.
- **Ours places the embed-only block at `mid - 13.556`** (a 27.111-tall block) in both rows.
- **In `act3-open` every node of ours sits 31.5 lower.** The canvas origin moved, and the image height reached it.
  `-16.5 = 97 - 227/2` is one candidate; T1 decides.
- **`act3-mixed` places the image exactly as the jar does**; only the canvas width differs. With a text line first,
  our block measure agrees with the jar's. The embed-only case is the one that differs.
- **The canvas width is 1 wider in all three rows.** That may be the same mechanism or a separate one (D1).

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `activity-arrow-embed/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Pinning moves `docs/parity-report.md`: run
  `npm run parity:dashboard` at every batch close that pinned.
- Never write under `src/`, `tests/` or `docs/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/activity-arrow-embed/measurements/measure-probes.mts [out.json] [extra.puml...]`.
- **Activity gates after any `src/` change:** `npx vitest run tests/oracle/svg-conformance/activity.golden.ratchet.test.ts
  tests/oracle/svg-conformance/activity.diff-baseline.ratchet.test.ts tests/oracle/svg-conformance/edge-label-embed.authored.test.ts`
  — read the collected count.
- **Activity survey:** `npm run svg:survey -- activity --out tests/oracle/svg-conformance/parity-activity.json`.
  Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close from batch 2 on:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs 229a5a836` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. The stock jar
  is for ruling out seam artifacts only; record its output beside the oracle, never as a golden.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D5. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D5).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.
7. T1 cannot produce the diagnosis artifact (`~/.claude/rules/diagnosis.md`) for the 10-tall block. Do not start
   batch 2 on a guess.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A probe whose residual is a different mechanism (D1, "separable"): measure it, file a `queue:ready` issue with the
  measurement and `file:line`, list it as an OPEN row naming that issue, journal it, continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Compiling a throwaway Java probe in `/tmp` against `oracle/dist/plantuml-oracle.jar` (`javac -cp`, `java -cp`)
  that prints `display.create7(…).calculateDimension(sb)` for the label, when reading alone cannot settle T1.
  Copy its source to `measurements/java/` so the evidence is reproducible.
- Authoring extra probes (text after the embed, two embeds, `{{salt`, labels in swimlanes, if/repeat/while sites)
  and their oracles; each joins the authored gate.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. No exported symbol changes shape; `dist/*.d.ts` must not move (D5).
- **Dependencies:** nothing new.
- **Behaviour:** only activity-3 arrow labels whose display holds an embed line. Embed-free labels keep today's path,
  guarded by the activity golden and diff-baseline ratchets and the every-engine survey (D3).

Expected files (T1 confirms or replaces this list; write-sets are plans):

| File | Action | Task |
|---|---|---|
| `.agent-notes/aae-T1.md`, `plans/activity-arrow-embed/measurements/java/*` | Create | T1 |
| `src/diagrams/activity/layout/compress/edge-label-anchor.ts` (`edgeLabelBlock`, `edgeLabelBlockSize`) | Modify | T2 |
| `src/diagrams/activity/activity-creole-sheet.ts`, `activity-text-sheet.ts` (the embed stripe) | Modify | T2 |
| `src/diagrams/activity/layout/tile-layout-inlabel.ts` (the `35 + height` reserve) | Modify | T3 |
| `src/diagrams/activity/layout/canvas-origin-text-ink.ts`, `activity-draw-extent.ts` (canvas origin, ink) | Modify | T3 |
| `tests/diagrams/activity/aae-*.test.ts` | Create | T2, T3 |
| `tests/fixtures/edge-label-embed/act3-*.{puml,svg}` | Create | T4 |
| `tests/oracle/svg-conformance/edge-label-embed.authored.test.ts` (ZERO / OPEN rows) | Modify | T2, T3, T4 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: diagnose](batch-1/overview.md) | T1 | [x] |
| [2: the two rows](batch-2/overview.md) | T2, T3 | [x] |
| [3: other label sites](batch-3/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #188)

- [x] `act3` and `act3-open` are ZERO rows in `edge-label-embed.authored.test.ts`, each drawing the jar's one `<image>`.
- [x] Every T4 probe is a ZERO row, or an OPEN row whose `reason` names a filed issue with its measured mechanism (D1).
- [x] The T1 diagnosis artifact (mechanism, origin `file:line`, causal chain, ruled out) is in `.agent-notes/aae-T1.md`.
- [x] No new divergence (D4).
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-probes.mts`; `probes/` (the planning probe and the stock-jar outputs).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx jiti`, `npm`, `scripts/oracle-render.sh`, `gh issue`); `javac`/`java` for the optional T1 probe may prompt.
Deliberately not regenerated: the SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-22)

**Tasks:** T0–T5 done as planned, T6 squash last. T1 overturned the brief's "10-tall block" premise: the jar's block is
the full embed (61x68), and compression makes the 20-long arrow. D2 was amended for its premise only (journal row 5).
T4 grew from "pin the sites" to two `src/` fixes. One ports per-draw compression of a label block
(`labelShapeDeltas`). The other ports `Branch#getDisplayPositive` for switch cases, and for branches with no
instruction in `if` and `switch`. Write-set deviations are journalled in rows 8, 12 and 13.

**Gates (each batch close):** `npm test` 50716 → 50757 passed (6 expected fail, 7 skipped, 6 todo), coverage
96.99/92.58/97.48/98.03; typecheck, lint, build and format:check green at b0, b2 and b3.

**Verdicts, base `229a5a836` → final:** every engine unchanged, `verdict-diff.mjs`: lost 0, timeout/errored 0. Activity
863 conformant / 1 structural / 14 diverged before and after. No `parity-*.json` field other than `generatedAt` moved.

**Probes:** `act3` 3 → 0, `act3-open` 30 → 0, `act3-mixed` 2 → 0. 25 T4 probes went from 22 at zero (switch-in 106,
two-embeds 3, text-after 1) to all 25 at zero. The authored gate holds 50 rows at zero and none open. Two more
fixtures sit in `tests/fixtures/aae-switch-case/`.

**d.ts:** `dist/*.d.ts` byte-identical to the T0 snapshot (empty diff). `DIVERGENCES.md` and
`oracle/accepted-divergences.json` unchanged (D4).

**CI risk:** the latest PR CI run (44950492537) took 9m08s on its slowest shard (shard 3). This mission adds 31
authored and unit tests of a few ms each, so the risk is low.

**Follow-ons:** `planning/next-missions.md` "activity-arrow-embed (aae)": `gh issue create` is denied in headless
sessions; `if-label` still moves as one anchor under compression. No issue filed. #188 and #136 comments posted.
