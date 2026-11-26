# svg-dimension-style (sds)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #193 (found answering CodeQL alert #43 on PR #192). Planned unattended on 2026-11-24 at
`feature/parity-queue` `14e5f24a6`.

## Objective

With `skinparam svgDimensionStyle false` the jar writes no root `style`, `width` or `height`. We still write them for
every engine except class and the description family's unchromed path.

- `TextBlockExporter.java:418-421` hands `skinParam.svgDimensionStyle()` to `SvgOption` whenever the exporter has a
  skin param, and has no diagram-type branch for it. `UgDiagram.java:183-185` and `NewpagedDiagram.java:142-145` call
  `builder.styled(diagram)`, which sets that skin param for every `TitledDiagram` (`TextBlockExporter.java:633-634`).
- `SkinParam.java:1216-1218` is `!valueIs("svgdimensionstyle", "false")`. `valueIs` is `equalsIgnoreCase`
  (`:367-369`), so `FALSE` counts too.
- `SvgGraphics.java:795-799` writes `style`, `width` and `height` only when the option is true. The `viewBox` after
  them is unconditional.
- Ours: the shell already honours the flag (`src/core/klimt/document-shell.ts#dimensionAttributes`, fed by the
  internal `SvgDimensionStyleFlag`). Only `class/renderer-document.ts#finishClassDocument` returns it, and
  `description/renderer.ts` sets it on the klimt `SvgOption` of the unchromed document.

This mission:

1. moves the 33 planning probes into an authored gate (batch 1, T1);
2. returns the flag from every engine that drops it (batch 2: T2 theme-driven engines, T3 and T4 skin-param engines);
3. measures every engine, files the out-of-scope finding, and closes out (exit, squash).

## Starting state, measured 2026-11-24 on `14e5f24a6`

`npx tsx plans/svg-dimension-style/measurements/measure-sds.mts /tmp/sds-t0.json` prints **rows 33 exact 10 dims 23
other 0**. `DIMS` means our root open tag equals the jar's once our `style`/`width`/`height` are removed: the #193 gap
and nothing else.

| Group | Probes (`DIMS` unless noted) | Where the flag is dropped |
|---|---|---|
| Sequence | `seq`, `seq-title`, `seq-newpage`, `teoz` | `sequence/renderer.ts` (`renderSequencePage`, `renderPaginated`) |
| State | `state`, `state-title` | `state/renderer.ts#renderState` |
| Activity | `act`, `act-title` (title, caption, swimlanes) | `activity/renderer.ts#renderActivity` |
| Description, chromed | `desc-title` | `description/index.ts:187-200`: `unwrapKlimtSvg` re-roots the document without the flag |
| Skin-param engines | `timing`, `gantt`, `mindmap`, `wbs`, `salt`, `nwdiag`, `actleg` | `<engine>/index.ts` (activity-legacy, cheneer: `renderer.ts`), beside `getlengthAdjust()` |
| Skin-param engines | `ebnf`, `regex`, `board`, `chen`, `wire`, `packet`, `chart` | same; `regex` uses `ebnf-skin-param.ts`'s `SkinParam` |
| Controls (`EXACT`) | `ctl-class`, `ctl-class-title`, `ctl-object`, `ctl-usecase`, `ctl-component`, `ctl-true`, `ctl-default`, `ctl-files`, `ctl-json`, `ctl-yaml` | already right; they hold it |

**Engines probed and left out** (D5): files, json and yaml keep the attributes in the jar too, and are controls.
`@startgit` keeps them in both, but its root width differs for a Smetana reason, so it is not a row. bpm, flow,
`@startdef` and `@startdot` draw the Welcome page or reject a `skinparam` line in the jar. `@startchronology` is
unsupported in the oracle jar. The ELK paths for class and description already omit the attributes through
`render()`; `renderSync` refuses ELK, so they are not gate rows. State under ELK is #293.

**Pre-flight at planning (2026-11-24, `14e5f24a6`):** `npm test` 2373 files passed (1 skipped), 51439 tests,
coverage 97.01/92.61/97.51/98.05; `npm run lint` 0. `typecheck`, `build` and `format:check` first run in T0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `svg-dimension-style/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Survey moves change `docs/parity-report.md`: run
  `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/svg-dimension-style/measurements/measure-sds.mts [out.json]`. Reads
  `measurements/probes/` and, from T1 on, `tests/fixtures/svg-dimension-style/`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves, and any `<name>_001.svg` page past the first.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed. (The only goldens that set `svgDimensionStyle` are class
   and description rows already right: `oracle/goldens/svg-class/bofebi-14-gano257`,
   `oracle/goldens/svg-description/usecase/jecici-56-bimu826`, and `tests/fixtures/ddd-T4x/dimension-style-false`.
   Checked at planning with `grep -rli svgDimensionStyle tests/fixtures oracle`.)
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D5. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D1, D4).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A probe that reaches `OTHER` (differs beyond the three attributes) after a change: find the mechanism. If it is a
  separate defect, file a `queue:ready` + `parity` issue with the measurement and `file:line`, and continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Authoring extra probes on the same reading, each with its oracle, joining the gate: `scale 1.5` or `skinparam dpi`
  with the flag (the class path writes a scaled root, `scaledCanvas`), `skinparam handwritten true`, a
  `diagramBorderColor`, a `!pragma svginteractive true`, a warning banner, `mode dark`, and the flag spelled `FALSE`.
- An engine found during the work that drops the flag and is not in the table: add its probe and fix it in the task
  whose pattern it shares.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. The flag stays the internal `SvgDimensionStyleFlag`, never a `RenderFragment` field
  (D1). `dist/*.d.ts` must not move.
- **Dependencies:** nothing new.
- **Behaviour:** only documents whose source says `skinparam svgDimensionStyle false` change: their root loses
  `style`, `width` and `height`. Every other document is byte-identical. The three goldens that set it are class and
  description rows the mission does not touch (stop 2).

| File | Action | Task |
|---|---|---|
| `tests/fixtures/svg-dimension-style/*.{puml,svg}` | Create (moved from `measurements/probes/`) | T1 |
| `tests/oracle/svg-conformance/svg-dimension-style.authored.test.ts` | Create | T1; rows move to `EXACT` in T2 to T4 |
| `src/diagrams/sequence/renderer.ts`, `state/renderer.ts`, `activity/renderer.ts`, `description/index.ts` | Modify | T2 |
| `src/diagrams/{timing,gantt,mindmap,wbs,nwdiag}/index.ts` and their `*-skin-param.ts`; `salt/index.ts`, `salt/PSystemSalt.ts`; `activity-legacy/renderer.ts`, `activity-legacy-skin-param.ts` | Modify | T3 |
| `src/diagrams/{ebnf,regex,board,wire,packetdiag,chart}/index.ts`, their `*-skin-param.ts` (regex: none, it re-exports ebnf's); `cheneer/renderer.ts`, `cheneer-skin-param.ts` | Modify | T4 |
| Unit tests beside each skin-param port touched (existing file per engine, or a new one) | Create or modify | T3, T4 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `planning/next-missions.md` | Modify | batch closes, T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: engines](batch-2/overview.md) | T2, T3, T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #193)

- [x] Every one of the 23 gap probes compares `EXACT` with its oracle, pinned in the authored gate, and the 10 controls
      stay `EXACT`.
- [x] No new divergence. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.
- [x] 0 conformant losses in every engine, baseline survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-sds.mts` and `probes/` (33 `.puml` + jar `.svg` under `probes/jar/`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares it with
the live `.claude/settings.json`.

## Summary (2026-11-25)

**Tasks:** T0 to T5 done (6 of 6 before the squash). One commit per task, plus a batch-close commit for batches 0, 1
and 2; the history is on `svg-dimension-style/pre-squash`. 29 journal rows before the squash; none flagged for a
ruling, no `needs-ruling` issue filed.

**Gates (exit, journal row 29):** `npm test` 2375 files / 51502 passed, coverage 97.01/92.61/97.51/98.05; typecheck,
lint, build, format:check 0. Every batch close ran the full set; none failed.

**Verdicts, base `14e5f24a6` → exit:** no verdict or diff count moved in any survey file (only `generatedAt`).
`verdict-diff`: 0 lost, 0 timeout or errored. Two full surveys hit load-driven timeouts (batch 1: c4, usecase; batch 2:
packet, regex, all `conformant -> timeout` at load averages of 120-155); each engine was rerun alone at lower load and
came back fully conformant (journal rows 7, 22).

**Probes:** at the start, 33 rows: 10 exact, 23 `DIMS`. At exit, 47 rows, all exact: the 23 gap rows, 11 controls
(`ctl-hcl` added) and 13 push-forward probes (`scale`, `dpi`, `handwritten`, `diagramBorderColor`, `svginteractive`, a
warning banner, `mode dark`, `FALSE`, a scaled class, and klimt-path `scale`/`FALSE`/title rows). The gate's OPEN list
is empty.

**Mechanism:** `TextBlockExporter.java:420` passes `skinParam.svgDimensionStyle()` to the SVG option of every styled
diagram, and `SvgGraphics.java:795-799` then omits the root `style`, `width` and `height`. Sequence, state, activity
and the chromed description fragment now spread the internal `SvgDimensionStyleFlag` from `theme.svgDimensionStyle`
(T2). The 13 klimt engines gained `svgDimensionStyle()` on their `SkinParam` port (`SkinParam.java:1216-1218`),
feeding the klimt option and the fragment (T3, T4), pinned by one contract test over all 13 ports. No chrome path
needed a change: each spreads the fragment.

**d.ts:** byte-identical to the T0 snapshot. `DIVERGENCES.md` and `oracle/accepted-divergences.json` unchanged (D4).
A stale `SvgGraphics.java:808-811` citation in `core/theme.ts:132` stays, because that comment is emitted into the
d.ts (journal row 12, `.agent-notes/sds-T2.md`).

**Follow-ons:** #295 (unterminated classifier body; `Blocked by #295.` added to #136);
`planning/next-missions.md`, section "svg-dimension-style (sds)". Unfiled, pre-existing: bare `listsprites` is
`770x455` against the jar's `844x667` with or without the flag (nearest #227).

**CI risk:** 47 renders in the authored gate and 14 contract cases, about 15 s locally under load.
