# class-oracle-gap-rows (cogr)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #140 (from #109, oracle-gap-capture). Planned unattended on 2026-11-13 at
`feature/parity-queue` `cd7587779`.

## Objective

#109 captured 151 class rows that had never had a jar oracle. None of them is in
`oracle/goldens/svg-class/ratchet.json`, so no gate holds them. This mission:

1. **pins** every one of the 151 that is zero-diff on the ratchet path (111 today) (D2);
2. **drives the other 40 to zero** by porting the upstream mechanism each lacks, one task per mechanism cluster (D3);
3. pins each row as it reaches zero.

No new divergence is expected (D4). The capture strips `!pragma layout smetana`, and the `{{ }}` slots are on oracle
seam #3, already retired as a divergence (`DIVERGENCES.md:2092-2094`). The `{{json}}` / `{{yaml}}` embeds are Smetana
paths, but each is a single node, so no ruled Smetana residue is expected there either.

## Starting state, measured 2026-11-13 on `cd7587779`

- **Survey:** `tests/oracle/svg-conformance/parity-class.json` (generated 2026-11-13) reads 874 rows: 834
  conformant, 19 structural-match, 21 diverged. All 40 non-conformant rows are #109 rows. The other 3 unpinned
  conformant rows (`luzive-62-zote562`, `sadamo-18-siva346`, `zuduxu-90-kosi876`) are not #109 rows, so they are out of
  scope (D1).
- **Ratchet path:** `npx tsx plans/class-oracle-gap-rows/measurements/measure-rows.mts` prints
  **rows 151 zero 111 open 40 error 0**. The slugs are in [measurements/new-rows.json](measurements/new-rows.json).
- #140's own numbers (108 / 20 / 23, so 43 open) are dated. #140's `radute-87-nize199` lead is closed: since #123 it
  routes `ACTIVITY` / `agree`, and `class-relationship-parser.ts:188-197` already requires spaces around the qualifier
  bracket.

The 40 open rows, grouped by lead. The leads come from planning reads. They are not mechanisms yet, and each task quotes
the Java before it changes code (task contract step 1).

| Task | Rows | First diff (ours / jar) | Lead (verify before acting) |
|---|---|---|---|
| T2a | `mipuzo-23-saji028`, `tufuru-60-laxo740` | cluster stroke `#000` / `#FF0`, title fill `#000` / `#00F` | per-group `#back;line:x;text:y` colours on a cluster |
| T2b | `puboje-01-suna474`, `secomu-36-pabe790`, `cokute-29-gezu131`, `vacuso-72-faro236`, `mikepu-83-jono930` | bb 276×142 / 385×48: we stack empty `node {}` groups as clusters | `GraphvizImageBuilder.java:416-418` mutes an empty `GroupType.PACKAGE` (every USymbol group) to `EMPTY_PACKAGE`; `GeneralImageBuilder.java:201` |
| T2c | `beragu-30-zate466`, `zitene-13-xeda918`, `tegipa-83-bilu912` | as T2b, plus colours | T2a + T2b on one row (needs both) |
| T2d | `bejuve-37-furu333`, `robuji-68-rise413` | width 104 / 265; jar text `(Cannot decode)` in monospace | `[[url <img:missing>]]` in a note: `AtomImg.java:176-206`; draw order of the muted empty `compA` |
| T2e | `bofebi-14-gano257` | root `@width`/`@height`/`@background` present / absent | `skinparam svgDimensionStyle false`: `TextBlockExporter.java:308`; description already ports it (`description/renderer.ts:313-314`), class does not |
| T3a | `kofogo-67-jiju461`, `zemeco-27-kaje686` | routed DESCRIPTION / CLASS | `(A, B) .. C : label`: COUPLE1 plus the `LABEL_LINK` tail (`CommandLinkClass.java:116,165-170`, `executeArgSpecial1` `:414`); `class-assoc-couple.ts:65-66` ends at `\s*$` (ledger `unknown-ledger/ogc-T4b.json`) |
| T3b | `kibinu-30-pese048` | path id `CardBundle\\Card-apoint7` / `Card-apoint7` | association-point link ids under `set namespaceSeparator \\` |
| T3c | `gemufi-65-riba175`, `vapasu-07-fajo818`, `botome-06-bera894` | cluster widths +30 / +65; entity order | namespaces made from a dotted or `::` name (`package java.lang`, `"m3.Table1"`, `"Customer::AccountReconciliation"`) |
| T3d | `volode-59-safa575`, `lolovi-23-loji748` | edge-label text not wrapped in `<a>`; entity `g` has 7 / 1 children | a URL on a link label, and on a description entity inside a package |
| T3e | `xupuzi-80-deri689` | height 170 / 175; stereotype text | several stereotypes on a package or node group (`<<A>><<B>>`, `<<Node>>`) |
| T3f | `style-stereotype-on-arrow-6` | width 170 / 171 | `json` entities in a class diagram, with a `<<mystyle>>` arrow |
| T4a | `bupabi-53-xedu278`, `nexeno-07-pike819` | body text `x` 22 / 39.062 | `<style> component { HorizontalAlignment … }`: `EntityImageDescription.java:175` |
| T4b | `gimumo-81-fuce233` | width 409 / 399 | creole `*` / `#` lists in a `[ … ]` body |
| T4c | `gazizi-80-fula677` | 100×103 / 85×65 | `scale 0.5` with a sprite stereotype `<<$sprite>>` on a node body |
| T4d | `gecaxa-13-jedi612` | emoji text font-size 21 / 14 | coloured emoji `<#0:swan:>` in a card body (check against #150, which is the same family on edge labels) |
| T4e | `juxugu-89-beki062`, `mocatu-19-jivi646`, `vanadi-41-geru001` | embedded image width 690 / 484; 1 px | `{{json …}}` and `{{yaml !theme …}}` embedded in a `label`/`node` body |
| T4f | `nacave-78-dijo807`, `subdiagram-theme-1`, `dobefe-98-moji323`, `moxeku-98-gufi234`, `potatu-55-pave291` | embed sizes and positions | `{{ }}` diagrams in notes, link labels and `card`/`label` bodies, `!theme` inside, and one ELK embed |
| T4g | `gelefo-99-vexu215`, `sokivo-58-tijo947`, `tezefu-05-xuvi984` | one note text `x` 190.2 / 200.925 | the note holding `%retrieve_procedure(…)` output |
| T4h | `sivoso-11-xabi195` | page height 71 / 91; jar draws a `#FFC` banner | `skinparam ParticipantPadding` adds a warning (`CommandSkinParam.java:95-96`); `src/core/skinparam-warnings.ts` is ported, but class does not use it |

Two rows have non-default gate twins: `kofogo-67-jiju461` and `zemeco-27-kaje686` are `known-misroute` (ourType
DESCRIPTION) in `routing-baseline.json`. The other 149 are `agree`.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, with no worktrees** (D6).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `class-oracle-gap-rows/pre-squash`.
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
- Never write under `src/`, `tests/` or `docs/` while a gate is running.

## Baseline

Measured at planning on `cd7587779`: see journal row 0.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **The 151 rows:** `npx tsx plans/class-oracle-gap-rows/measurements/measure-rows.mts [out.json] [slug...]`
  (about 4 s for all 151).
- **One row's files:** `npx jiti plans/class-divergence-drive/tools/render-diff.mts <slug>` writes ours and the jar's
  SVG under that tool's `measurements/out/`.
- **Pin:** the T1 copy of the class pin tool in `plans/class-oracle-gap-rows/tools/` (see [batch-1/T1-pin.md](batch-1/T1-pin.md)).
- **Every engine, at batch close from batch 2 on:** run `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 means a loss.
  `verdict-diff` takes a **git ref**.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned class golden, leaves conformant, and you cannot state its mechanism
   with `file:line`.
2. A pinned golden would have to be re-captured or removed (removal is maintainer-only, `svg-class/README.md`).
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change. No public type should move (D5).
6. An authored row's jar output is not byte-stable across two renders.

**These are not stops:**
- A file outside a task's write-set. Change it and journal why.
- A row whose fix needs a maintainer ruling (a new divergence, or a jar behaviour that looks like a bug and has no
  forcing library). File a `needs-ruling` issue with the evidence, name the row in the journal, and move on to the
  next task. Do not decide it here (#140, "Done when").
- A residual diff that a fix uncovers, provided its mechanism is the task's. Fix it in the same task.
- A row that turns out to share a mechanism with another open queue issue (#149 scale, #150 emoji, #144/#168 state
  `{{ }}`). Fix it here if the row needs it, and comment on that issue with what landed.

## Push-forward (decide, journal, continue)

- Moving a row to another task when its measured mechanism belongs there. The leads are not decisions.
- Splitting a task in two when a row turns out to have two mechanisms, each with its own commit.
- Authored rows for a branch the mechanism has and the corpus does not exercise, each with a jar oracle.
- Helper splits forced by the complexity hooks, by upstream method, never by fitting.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model:** none.
- **API:** none. Every change is internal to `src/diagrams/class/`, the shared svek/klimt/creole modules it draws
  through, and test data (D5).
- **Dependencies:** nothing new. Class layout already shells out to graphviz; T4f's ELK embed uses the existing
  `ElkBackend`.
- **Behaviour:** class diagrams with empty USymbol groups, per-group colours, association classes with a label,
  dotted namespaces, URLs on labels and entities, style alignment, creole lists, emoji, sprite stereotypes under scale,
  and `{{ }}` embeds. T2a, T2b, T3d, T4a and T4d to T4f touch modules that description and state also draw
  through, so the every-engine survey is the guard.

| File | Action | Task |
|---|---|---|
| `plans/class-oracle-gap-rows/tools/*` (pin tool copy and its test) | Create | T1 |
| `oracle/goldens/svg-class/ratchet.json`, `<slug>/{in.puml,golden.svg}` | Modify / Create | T1, T2a-T4h |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` | Modify | T1, T2a-T4h (pin clones); T3a (twin flips) |
| `oracle/goldens/svg-class/README.md` ("Current state") | Modify | T1, T5 |
| `src/diagrams/class/*` (cluster, namespace, container, renderer, link, assoc-couple, note modules, located in each task) | Modify | T2a-T4h |
| `src/core/svek/*`, `src/core/klimt/creole/**`, `src/core/creole-atoms.ts` (shared draw seams, located in each task) | Modify | T2d, T3d, T4a-T4f |
| `tests/unit/class/cogr-*.test.ts` | Create | T2a-T4h |
| `tests/oracle/svg-conformance/parity-*.json`, routing/refusal running counts, `docs/parity-report.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | batch closes, T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: pin the 111](batch-1/overview.md) | T1, T1b | [x] |
| [2: groups, colours, svg root](batch-2/overview.md) | T2a, T2b, T2c, T2d, T2e | [x] |
| [3: links, namespaces, urls, stereotypes](batch-3/overview.md) | T3a, T3b, T3c, T3d, T3e, T3f | [x] |
| [4: text, creole, embeds](batch-4/overview.md) | T4a, T4b, T4c, T4d, T4e, T4f, T4g, T4h, T4h2, T4f2, T4f3 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #140)

- [x] Every one of the 151 rows is conformant, or named in `DIVERGENCES.md` / `oracle/accepted-divergences.json` with
  its mechanism, or on a new `needs-ruling` issue that the journal names.
- [x] A new divergence has a forcing library or a signed ruling.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in `oracle/goldens/svg-class/ratchet.json`, and `docs/parity-report.md` is
  regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, and the auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `new-rows.json` (the 151 slugs), `measure-rows.mts`, and `plan-measure.json`
  (the planning run).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief: `node`, `npx tsx`,
`npx jiti`, `npm`, `scripts/oracle-render.sh` and `gh issue`. It was deliberately not regenerated, because the
SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-14)

**Tasks:** 27 tasks done (23 planned, 4 split). Planned: T0, T1, T2a-T2e, T3a-T3f, T4a-T4h, T5, T6. Splits (push-forward): T1b (journal 3), T4h2, T4f2 and T4f3 (journal 30). Every fix task was one commit, and a `typescript-pro` subagent ran each task group serially (D6). Three gate fixes: journal 5, 34 and 35.

**The 151 rows:** 111 zero / 40 open → **148 zero, 3 open**. 148 are pinned: 110 at T1, 1 at T1b, 37 by fix tasks. `ratchet.json` went from 1005 to 1153 entries. Open:
- `nacave-78-dijo807` and `subdiagram-theme-1` are on **#185** (`needs-ruling`, journal 29).
- `vanadi-41-geru001` is accepted under the existing Smetana ruling per D4, in `oracle/accepted-divergences.json` and `DIVERGENCES.md` (journal 28).

**Verdicts:**
- Class: 834 / 19 / 21 → 871 / 3 / 0 (conformant / structural-match / diverged).
- `verdict-diff` against `42f25783f`: 37 class rows to conformant, **0 lost** in every engine, 0 timeouts or errors. Every other engine's survey is unchanged apart from `generatedAt`.

**Gates (final, on `bc9b821c6`):**
- `npm test -- --maxWorkers=4` exit 0: 48649 passed, 4 expected fail, 7 skipped, 6 todo; coverage 96.95 / 92.54 / 97.47 / 97.98.
- `typecheck`, `lint`, `build` and `format:check` all exit 0.

**d.ts:** `diff -r` against the T0 snapshot is empty. T2e had added a public field; the T5 check caught it, and it was moved internal (journal 35).

**Divergence files:** `oracle/accepted-divergences.json` and `DIVERGENCES.md` differ from base only by the vanadi entry, under D4's pre-ruled Smetana case.

**CI risk:** latest PR run 43611999165. The slowest shard (4) took 9m20s of its 15-min timeout. The class ratchet gains 148 renders in one file, about 4 s locally, so up to about 30 s at CI's measured 2-8× slowdown. Low risk.

**Follow-ons:** `planning/next-missions.md` → "class-oracle-gap-rows (cogr)" (9 items: #185, vanadi, the 3 unpinned non-#109 rows, no class diff-baseline, embed payloads unread by `compareSvg`, description multiline url, description early-link style, #149 group titles, json cell creole).

**Issue comments posted:** #140, #136, #149, #144, #168. **Issue filed:** #185.

