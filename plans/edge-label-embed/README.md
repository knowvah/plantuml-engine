# edge-label-embed (ele)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #144 (filed from #112, stdd T5c). Planned unattended on 2026-11-14 at
`feature/parity-queue` `116fa09b1`.

## Objective

A `{{ … }}` in an edge label is an embedded diagram in the jar: `SvekEdge.java:299-300` builds every link label
with `link.getLabel().create0(…, CreoleMode.SIMPLE_LINE, …)`, and `CreoleParser.java:146-170` turns a line that
opens an embed into one `EmbeddedDiagram` atom (`EmbeddedDiagram.createAndSkip`, `:97-115`), sized by its SVG arm
(`:129-133`). This port's state, description and legacy-activity engines measure and draw edge labels as flat text,
so they draw the characters `{{` instead of an `<image>`. Class/object already embed but lay out an unterminated
`{{` label wrongly. This mission:

1. makes `state/xetase-70-zaza808` (state's only non-conformant row, 298/299) conformant and pins it (batch 1);
2. ports the same atom into description and legacy activity edge labels (batch 2);
3. diagnoses and fixes the class/object residual on an unterminated `{{` label (batch 3);
4. pins every probe as an authored fixture with its jar oracle, so the behaviour stays held.

## Starting state, measured 2026-11-14 on `116fa09b1`

`npx tsx plans/edge-label-embed/measurements/measure-probes.mts /tmp/ele-t0.json` prints
**rows 12 zero 1 open 11 error 0**. Probes and their jar oracles: [measurements/probes/](measurements/probes/).

| Row | Engine | Diffs | `<image>` ours/jar | Canvas ours/jar |
|---|---|---|---|---|
| `state/xetase-70-zaza808` (corpus) | state | 38 | 0/1 | 144x151 / 667x341 |
| `state` (well-formed `{{\nclass X\n}}`) | state | 18 | 0/1 | 90x302 / 110x331 |
| `state-open` (`S1 --> S2 : {{`) | state | 18 | 0/1 | 72x276 / 581x490 |
| `comp`, `comp-open` | component | 19, 18 | 0/1 | 90x210 / 109x239; 70x184 / 580x398 |
| `uc-open` | usecase | 16 | 0/1 | 49x190 / 569x404 |
| `actleg2`, `actleg2-open` (`-->[{{…}}]`) | activity-legacy | 3, 3 | 0/1 | 72x255 / 98x255; 49x414 / 569x414 |
| `class` (well-formed) | class | **0** | 1/1 | equal |
| `class-open`, `obj-open` | class, object | 188, 40 | 1/1 (532x227, right size) | 555x247 / 576x407; 555x247 / 569x378 |
| `actleg-open` (`"a" --> "b" : {{`) | activity-legacy | 36 | 1/2 | not an edge label: the jar draws a dedication Welcome page; lead only, see exit |

- `svek-1.dot` of xetase reserves `WIDTH="544" HEIGHT="239"` (532x227 + 2·6 self-loop `marginLabel`).
  `.agent-notes/xetase-embedded-diagram-label.md` predates oracle seam #3: its 54x54 / 42x42 numbers are stale.
- The empty embed (`{{` alone) is the Welcome page of an empty `@startuml`, 532x227, and our top-level empty
  diagram already renders it at 0 diffs.
- `compareSvg` stops at a `childCount` mismatch, so a missing `<image>` can show as only 3 diffs (`actleg2`).
  Assert `<image>` presence explicitly in tests.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `edge-label-embed/pre-squash`. Never push: the user reviews, signs and pushes.

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

- **Probes + xetase:** `npx tsx plans/edge-label-embed/measurements/measure-probes.mts [out.json] [extra.puml...]`.
- **State survey:** `npm run svg:survey -- state --out tests/oracle/svg-conformance/parity-state.json` (same shape
  for `description`, `activity-legacy`, `class`, `object`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close from batch 1 on:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

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
- A probe whose residual is a different mechanism from the edge-label atom (D1, "separable"): measure it, file a
  `queue:ready` issue with the measurement and `file:line`, name it in the journal, continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Authoring extra probes (self-loop, text-then-embed, `{{salt`, two embeds) and their oracles when a mechanism needs
  them; each joins the authored gate.
- Re-pointing `class-edge-label-embed.ts`'s splitter to the new core helper only if every class/object pin stays
  byte-identical (D3); otherwise leave class alone.
- Deleting or rewriting the stale `.agent-notes/xetase-embedded-diagram-label.md` once xetase is pinned.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. `src/core/svek/edge-label-embed.ts` is internal; `dist/*.d.ts` must not move (D6).
- **Dependencies:** nothing new. Payload bytes go through the existing `UImageSvg` path (DIVERGENCES.md:1361, retired).
- **Behaviour:** only labels whose display holds a line where `getEmbeddedType` hits (D2). Embed-free labels keep
  every engine's current path, guarded by the state/description/activity-legacy/class/object ratchets and the
  every-engine survey.

| File | Action | Task |
|---|---|---|
| `src/core/svek/edge-label-embed.ts`, `tests/unit/core/edge-label-embed.test.ts` | Create | T1a |
| `src/diagrams/state/state-label-style.ts`, `state-dot-graph.ts`, `state-composite-edge-label.ts`, `state-geo-types.ts` | Modify | T1b |
| `src/diagrams/state/state-renderer-transitions.ts`, `state-transition-label.ts` | Modify | T1c |
| `tests/fixtures/edge-label-embed/*.{puml,svg}`, `tests/oracle/svg-conformance/edge-label-embed.authored.test.ts` | Create | T1c, rows added T2a/T2b/T3a |
| `oracle/goldens/svg-state/{ratchet.json,xetase-70-zaza808/}`, `oracle/goldens/state/label-size-backlog.json` | Modify / Create | T1c |
| `src/diagrams/description/link-edge-attrs.ts`, `renderer-edge.ts`, `src/core/svek/SvekEdge.ts` | Modify | T2a |
| `src/diagrams/activity-legacy/activity-legacy-edge-text.ts`, `renderer-edge.ts` | Modify | T2b |
| `src/diagrams/class/*` (edge-label layout), `tests/unit/class/ele-*.test.ts` | Modify / Create | T3a |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: state (the row)](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2: description, legacy activity](batch-2/overview.md) | T2a, T2b | [x] |
| [3: class/object unterminated label](batch-3/overview.md) | T3a | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #144)

- [x] `state/xetase-70-zaza808` is conformant, pinned in `svg-state/ratchet.json`, and gone from
  `label-size-backlog.json`.
- [x] Every edge-label probe is at 0 diffs in the authored gate, or its residual is on a filed issue the journal names
  with its measured mechanism (D1).
- [x] No new divergence (D4).
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-probes.mts` and `probes/` (12 `.puml` + jar `.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx jiti`, `npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-15)

**Tasks:** T0, T1a, T1b, T1c, T2a, T2b, T3a, T4 done (8 of 8 before the squash). One commit per task, plus a batch-close
commit per batch; the history is on `edge-label-embed/pre-squash`. 19 journal rows; none flagged for a ruling.

**Gates (exit, journal row 20):** `npm test` 2272 files / 48832 passed, coverage 96.94/92.55/97.45/97.97; typecheck, lint,
build, format:check 0. Every batch close ran the full set. Each close's first `npm test` failed only on the
parity-dashboard drift test (regenerated at the close); batch 1 also needed the xetase clone added to the refusal and
routing baselines.

**Verdicts, base `116fa09b1` → exit:** state 298 → 299 conformant (xetase diverged → conformant). The other 27 survey
buckets did not change. `verdict-diff`: 0 lost, 0 timeout or errored.

**Probes:** at the start, 12 rows with 1 at zero; at exit, 26 rows with 23 at zero. The 3 open rows:
- `actleg-open`: 5 diffs. Both the jar and we draw an error page, which is conformant under the 2026-10-10 rule; the
  planning oracle's dedication banner came from the capture minute (journal row 18).
- `act3` (3) and `act3-open` (30): #188.

The authored gate holds 29 fixtures: 27 at zero, 2 open on #188.

**d.ts:** `dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` are byte-identical to the T0 snapshot (D6).
`DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged (D4).

**Follow-ons:**
- #188: activity-3 arrow labels.
- Description's dzeta for embed-free labels (`.agent-notes/ele-T2a.md`).
- `planning/next-missions.md`, section "edge-label-embed (ele)".

**CI risk:** the new tests take 3.3 s locally across 6 files. The slowest shard of the last PR run (43611999165) was
shard 4 at 9m20s. The every-engine render gates (refusal, routing) gain one state row each.
