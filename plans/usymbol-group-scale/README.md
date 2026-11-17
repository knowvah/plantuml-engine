# usymbol-group-scale (ugs)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #149 (from #114, `c4-divergence-drive` T2b; partial overlap from #140 T4c). Planned unattended on
2026-11-16 at `feature/parity-queue` `a53f125b4`.

## Objective

Under `scale 2`, a class diagram's `package R <<Rectangle>> { }` title sits 2 px short of the jar's (37.778 vs 39.778).
Planning confirmed the issue's lead and found it is not about the title alone. Every non-folder USymbol group draws
**every literal** of its `asBig` unscaled: the node's 10 px corner, the database's 20 px cap, the cloud's 13 px title
drop, storage's corner radius and so on.

- `SvgGraphics.java:467-474` (`format`) multiplies every emitted number by the document scale. Upstream draws a cluster in
  layout units through that scaled `UGraphic`, so a literal inside `USymbol#asBig` scales too. Two examples:
  `USymbolRectangle.java:133` (`2 + dimStereo.getHeight()`) and `USymbolDatabase.java:157-161` (`2 + 20`).
- Ours pre-scales the `NamespaceGeo` (`class-scale-geo.ts:84-101`). Then
  `class-namespace-usymbol-shape.ts#renderNamespaceUSymbol` (`:382-423`) draws it through `renderDrawableToFragment` at
  scale 1. Two values carry a hand-applied `scaleK`: the stroke (`:239-257`) and the round corner
  (`renderer.ts:63-66`). Every other literal stays at 1.
- #140 (T4c) fixed the same problem for a USymbol **leaf**: `renderer-usymbol-entity.ts:318-338` draws in layout units
  and passes `scale: k`. The group path was left out (comment on #149).
- `ClusterHeaderStereo` (the displayed group stereotype and the group legend) is a pre-built SVG string at 3 dp
  (`class-cluster-header.ts:268-286`). It is spliced unscaled on both the USymbol path (`:301-322`) and the folder path
  (`class-namespace-shape.ts#placeHeaderStereo`). The class scale step itself names this as unmodelled
  (`class-scale-geo.ts:85-87`).

This mission:

1. moves the 29 planning probes into an authored gate (batch 1, T1a);
2. draws a USymbol group in layout units with `SvgOption.scale`, as the leaf does (T1b, D1);
3. scales the header stereo by building it with deferred numbers and formatting it once, on both draw paths (T1c, D2);
4. files the 2 separable residues, re-measures every engine and closes out (exit, squash).

## Starting state, measured 2026-11-16 on `a53f125b4`

`npx tsx plans/usymbol-group-scale/measurements/measure-ugs.mts /tmp/ugs-t0.json` prints **rows 29 zero 3 open 26
error 0**. Every probe is a class diagram at `scale 2` unless its name says otherwise.

| Probe | Diffs | At `scale 1` | Mechanism | Task |
|---|---|---|---|---|
| `issue-149` (the issue's fixture), `scale-rectangle`, `-agent`, `-hexagon`, `-label` | 1 each | 0 | title literal `2` unscaled | T1b |
| `scale-action` 3, `-card` 3, `-cloud` 2, `-collections` 7, `-database` 13, `-file` 9, `-frame` 7, `-process` 4, `-queue` 13, `-stack` 11, `-storage` 3, `-artifact` 21, `-node` 15 | as listed | 0 | `asBig` literals unscaled | T1b |
| `scale-1p5-node` (`scale 1.5`) | 15 | 0 | same; a non-integer factor | T1b |
| `node-thick-dashed` (`nodeBorderThickness 3`, `roundCorner 10`, `#line.dashed:blue`, a `«Rectangle»` stereo group) | 20 | 0 | literals; header stereo 3-dp rounding | T1b, T1c |
| `scale-rectangle-stereo` (`rectangle R <<boxed>>`) | 5 | 0 | header stereo unscaled (USymbol path) | T1c |
| `folder-stereo` (`package P <<boxed>>`), `scale-component` | 4 each | 0 | header stereo unscaled (folder path) | T1c |
| `scale-group`, `scale-partition` | 84 each | **84** | not scale: we draw a frame `path`+`line`, the jar a `rect rx=2.5`+`path` | D3: file |
| `package-fontsize` (`skinparam packageFontSize 20` on a `<<Node>>` group) | 108 | **101** | not scale: our title uses 20, the jar 14 | D3: file |
| `scale-folder`, `scale-package`, `desc-rectangle` (description engine) | 0 | 0 | controls | none |

**Planning experiment (reverted, not committed).** `renderNamespaceUSymbol` was changed to unscale the geo and theme,
divide the passed round corner by k and draw with `scale: k`. The header body was rescaled with `scaleFragmentBody` and
spliced at `(dx·k, dy·k)`. Result: 21 of the 26 open rows went to 0, and `scale-rectangle-stereo` was among them.
These were left:
- `node-thick-dashed`: 1 diff, `textLength` `157.324` against `157.325`. That is the double rounding of a 3-dp body
  that `svg-format.ts:135-146` describes, and it is why D2 defers the format.
- `folder-stereo` and `scale-component`: 4 each. They take the folder path, which the experiment did not touch.
- `scale-group`, `scale-partition` (84) and `package-fontsize` (101): unchanged, the scale-1 residue.

No survey, ratchet or unit suite was run with the patch. T1b runs them.

**The description engine is not affected.** `desc-rectangle` (a `rectangle` and a `node` group at `scale 2`) is
0 diffs. The bug is class-only.

- **Pre-flight at planning:** see journal row 0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `usymbol-group-scale/pre-squash`. Never push: the user reviews, signs and pushes.

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

- **Probes:** `npx tsx plans/usymbol-group-scale/measurements/measure-ugs.mts [out.json] [extra.puml...]`. It reads
  `measurements/probes/` and, from T1a on, `tests/fixtures/usymbol-group-scale/`. It prints one line per row: name,
  diff count, and the first 3 diffs as `path ours→jar`.
- **One engine:** `npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json` (same for `object`,
  `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Ratchets:** `npx vitest run tests/oracle/svg-conformance/class.golden.ratchet.test.ts` and
  `object.golden.ratchet.test.ts`; read the count.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves in the out dir.
- **ELK:** `renderSync` refuses `!pragma layout elk` without `options.elk`. An ELK probe goes through `render()` with
  `await loadElk()` (push-forward below), not through the measurer.

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
- A residual on a probe that is a different mechanism from D1/D2 (D3): measure it at `scale 1`. File a
  `queue:ready` + `parity` issue with the measurement and `file:line`, move the row to `OPEN` naming it, and continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Author more probes on the same reading, each with its oracle, and add them to the gate:
  - a scaled USymbol group with a group legend;
  - a sprite stereotype (`<<$s>>`) on a scaled group;
  - a `#back:` gradient on a scaled `<<Node>>` group;
  - nested scaled USymbol groups;
  - `scale 0.5` and `scale 1.25`;
  - an `object` diagram with a `<<Node>>` group;
  - `skinparam packageStyle rect` under scale. That path is `renderNamespaceRect`: the header goes through
    `placeHeaderStereo`, so T1c covers it.
- The ELK USymbol cluster path (`class-elk-usymbol-cluster.ts`) under `scale 2`. Probe it through `render()` with ELK.
  If it shows the same unscaled literals, port the same fix if it is the same seam. Otherwise file it (D3).
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. `NamespaceGeo` and `ClusterHeaderStereo` may gain an internal field (for example the
  header's deferred body, D2). Nothing public: `dist/*.d.ts` must not move (D4).
- **Dependencies:** nothing new.
- **Behaviour:** only class and object diagrams that combine a `scale` other than 1 with a non-folder USymbol group, or
  with a displayed group stereotype or legend. At scale 1, `k === 1` short-circuits every new branch, so unscaled
  output must stay byte-identical. The batch-close survey proves it.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/usymbol-group-scale/*.{puml,svg}` | Create (moved from `measurements/probes/`) | T1a |
| `tests/oracle/svg-conformance/usymbol-group-scale.authored.test.ts` | Create | T1a; rows move to `ZERO` in T1b, T1c |
| `src/diagrams/class/class-namespace-usymbol-shape.ts` | Modify | T1b, T1c |
| `src/diagrams/class/renderer.ts` (the round-corner `* scaleK`, `:63-66`) | Modify | T1b |
| `src/diagrams/class/class-cluster-header.ts` | Modify | T1c |
| `src/diagrams/class/class-namespace-shape.ts` (`placeHeaderStereo`) | Modify | T1c |
| `src/diagrams/class/class-scale-geo.ts` (header note, `:85-87`; the header's scale) | Modify | T1c |
| unit tests beside the above (find them with `grep -rln "<symbol>" tests/unit`) | Create or modify | T1b, T1c |
| `tests/oracle/svg-conformance/parity-*.json`, `census-*.json`, `docs/parity-report.md`, `planning/next-missions.md` | Modify | batch closes, T2 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate, group draw, header](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [exit](batch-exit/overview.md) | T2 | [x] |
| [squash](batch-squash/overview.md) | T3 | [x] |

## Done when (issue #149)

- [x] `issue-149` (the issue's fixture) compares clean with its oracle, pinned in the authored gate. So does one row per
      USymbol whose `asBig` offsets its title (the `scale-*` rows), each at 0 or `OPEN` on a filed issue (D3).
- [x] The two separable residues (`scale-group`/`scale-partition`, `package-fontsize`) are filed as `queue:ready` +
      `parity` issues and named by their `OPEN` rows.
- [x] No new divergence. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.
- [x] 0 conformant losses in every engine, baseline survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D4, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-ugs.mts` and `probes/` (29 `.puml` + jar `.svg` in `probes/jar/`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-16)

**Tasks:** T0, T1a, T1b, T1c, T2 done (5 of 5 before the squash). One commit per task, plus batch-close commits for
batches 0 and 1. The history is on `usymbol-group-scale/pre-squash`. 9 journal rows before the squash; none is flagged
for a ruling.

**Gates (exit, journal row 9):** `npm test` 2288 files / 49049 passed, coverage 96.95/92.53/97.43/97.99; typecheck,
lint, build and format:check 0. Every batch close ran the full set, and none failed.

**Verdicts, base `a53f125b4` → exit:** no verdict or diff count moved in any survey file (only `generatedAt`).
`verdict-diff`: 0 lost, 0 timeout or errored. Class and object ratchets: 1248 passed. Class census, base `src/` against
HEAD: 0 fixtures moved.

**Probes:** at the start, 29 rows, 3 at zero. At exit, 37 rows (8 push-forward probes authored on the same reading),
34 at zero. The 3 open rows are the D3 residues, unchanged from the base and the same at `scale 1`: `scale-group` and
`scale-partition` (84, #196) and `package-fontsize` (101, #197).

**Mechanism:** `SvgGraphics.java:467-474` multiplies every number at format time, so the literals inside
`USymbol#asBig` scale with the cluster. `renderNamespaceUSymbol` now draws in layout units with `SvgOption.scale` (D1).
The header stereo keeps a deferred twin, formatted once at the factor where it is placed, on the USymbol and folder/rect
paths (D2).

**d.ts:** byte-identical to the T0 snapshot. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged
(D4).

**Follow-ons:** #196 (`<<Group>>`/`<<Partition>>` draws a folder), #197 (`packageFontSize` reaches a USymbol group's
title), #198 (the class ELK path ignores `scale`, found by the ELK push-forward). See `planning/next-missions.md`,
section "usymbol-group-scale (ugs)". Census note (journal row 7): the committed `census-class.json` is stale (measured at
`570284a92`) and is unrelated to this mission.

**CI risk:** 37 more renders in the authored gate and 7 unit tests, about 1 s locally. Every header-bearing cluster now
builds its header twice at layout time (the deferred twin).
