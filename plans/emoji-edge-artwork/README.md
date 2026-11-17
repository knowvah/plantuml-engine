# emoji-edge-artwork (eea)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #150 (from #114, `c4-divergence-drive` T1b). Planned unattended on 2026-11-16 at
`feature/parity-queue` `8c11d9f5f`.

## Objective

A `<:rocket:>` emoji on a description edge label draws as a platform-glyph `<text>`, even with the emoji asset store
wired. The jar draws the artwork (`svg/g[1]/g[3]` has 6 children, the jar's has 12). Planning confirmed the issue's lead
and found two more `SvekEdge` sites with the same gap.

- Upstream builds the label with `link.getLabel().create0(font, alignment, skinParam, wrapWidth,
  CreoleMode.SIMPLE_LINE, …)` (`SvekEdge.java:286-299`). `StripeSimple#addEmoji` (`StripeSimple.java:245-250`) makes
  an `AtomEmoji` from `Emoji.retrieve(name)`. That lookup is a **global** table (`Emoji.java:111-118`), so every creole
  path reaches the artwork. `AtomEmoji#drawU` → `Emoji#drawU` (`AtomEmoji.java:66-68`, `Emoji.java:175-182`) replays
  the SVG.
- Ours draws the label with `buildTextBlock` (`EntityImageDescriptionTextBlock.ts:268`). Its emoji arm in `drawAtoms`
  (`:175-183`) always draws `emojiRenderRun`, and nothing hands it the store. `descAtomOps` (the leaf and desc path)
  already draws artwork through `drawEmojiAtom` (`EntityImageDescriptionEmoji.ts:46-60`) when given an
  `EmojiArtworkResolver`.
- Every `buildTextBlock` caller that can see sprites already holds a registry-backed `AtomImageResolver`, from
  `makeAtomImageResolverFor(registry)` (`creole-atoms-image-resolver.ts:472-495`). The registry carries the emoji
  store (`SpriteRegistry.emoji`, read by `emojiArtworkResolverFor`, `internal-emoji-store.ts:68`).
- `SvekEdge#drawEndText` (`SvekEdge.ts:433-443`, the quantifier) passes **no** resolver, and neither does its sizer,
  `measureQuantifierBlock` (`quantifier-block.ts:24-38`). Upstream builds both quantifiers with the same `skinParam` as
  the label (`SvekEdge.java:328-340`).
- Legacy activity hands `SvekEdge` **no** `resolveAtomImage` (`activity-legacy/renderer-edge.ts:278`), although its
  skin param holds the registry (`activity-legacy-skin-param.ts:89-111`).

This mission:

1. moves the planning probes into an authored gate (batch 1, T1a);
2. carries the emoji artwork on the atom resolver, and draws it in `drawAtoms` (T1b, D1). The issue's fixture leaves
   `PENDING`;
3. gives the quantifier text the label's resolver, at its sizer and its draw (T1c, D2);
4. gives legacy activity's `SvekEdge` the registry resolver (T1d, D2);
5. files the 4 emoji residues at other sites (D3), re-measures every engine and closes out (exit, squash).

## Starting state, measured 2026-11-16 on `8c11d9f5f`

`npx tsx plans/emoji-edge-artwork/measurements/measure-eea.mts /tmp/eea-t0.json` prints **rows 9 zero 1 open 8 error
0**. Every row renders with the emoji asset store, as the survey does.

| Probe | Diffs | Emoji → `XX` | Mechanism | Task |
|---|---|---|---|---|
| `issue-150` (`tests/fixtures/c4dd-T1b/emoji-mixed-edge.puml`) | 1, `g[3]` childCount 6→12 | n/a | `drawAtoms` draws the glyph | T1b |
| `desc-edge-emoji-only` (`X --> Y : <:rocket:>`) | 1, childCount 2→8 | n/a | same | T1b |
| `desc-quantifier-emoji` (`A "<:rocket:> 1" --> "many <:star:>" B`) | 1, childCount 5→11 | n/a | `drawEndText` passes no resolver | T1c |
| `legacy-activity-edge-emoji` (`(*) --> [<:rocket:> go] "step"`) | 1, childCount 3→9 | n/a | no `resolveAtomImage` on the input | T1d |
| `desc-stereo-emoji` (`component C <<<:rocket:> svc>>`) | 0 | n/a | control | none |
| `class-edge-emoji` (`A --> B : go <:rocket:>`) | 58, root width 120 vs 82 | **0** | the class edge label path, not `SvekEdge` | D3: file |
| `class-quantifier-emoji` (`A "<:star:>" --> "1" B`) | 97, root width 91 vs 82 | **0** | the class quantifier path | D3: file |
| `desc-cluster-title-emoji` (`package "<:rocket:> P"`) | 39, title tab `7.167` vs `6` | **0** | the cluster title sizer | D3: file |
| `state-edge-emoji` (`[*] --> S : <:rocket:> go`) | 3, label `x` 36.575 vs 56.075 | **0** | the state edge label path | D3: file |

The "Emoji → `XX`" column is the same probe with each `<:name:>` replaced by `XX`, against its own jar oracle. Every D3
row is 0 there, so each residue is emoji-specific. None goes through `SvekEdge`'s label block.

**Planning experiment (reverted, not committed).** `makeAtomImageResolverFor` attached
`emojiArtwork = (u) => registry.emoji?.get(u)` to the resolver it returns. `drawAtoms`'s emoji arm called
`drawEmojiAtom(ug.apply(new UTranslate(x, top)), atom, artwork)` when artwork resolved, and advanced by
`emojiBoxDim(atom.factor).width` as before. Results: `issue-150` 1→0 and `desc-edge-emoji-only` 1→0. Every other row
was unchanged, which is expected: those sites never received a registry resolver (T1c, T1d, D3). Without the store,
`issue-150` stayed at 1, the accepted platform-glyph fallback (`DIVERGENCES.md`, "Emoji shorthand"). No survey, ratchet
or unit suite was run with the patch. T1b runs them.

**Corpus reach is small.** 10 corpus `.puml` use `<:name:>`, and the 4 with one on an arrow line are sequence diagrams,
which never reach `SvekEdge`. Expect the survey to move no verdict. The gate is the evidence.

- **Pre-flight at planning:** see journal row 0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `emoji-edge-artwork/pre-squash`. Never push: the user reviews, signs and pushes.

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

- **Probes:** `npx tsx plans/emoji-edge-artwork/measurements/measure-eea.mts [out.json] [extra.puml...]`. It reads the
  issue's fixture, `measurements/probes/` and, from T1a on, `tests/fixtures/emoji-edge-artwork/`. It prints one line
  per row: name, diff count, and the first 3 diffs as `path ours→jar`.
- **One engine:** `npm run svg:survey -- component --out tests/oracle/svg-conformance/parity-component.json` (same
  for `usecase`, `c4`, `activity`, `class`, `state`, `unknown`: the description engine serves the first three). Without
  `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Description ratchet:** `npx vitest run tests/oracle/description-parity.ratchet.test.ts`; read the count.
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
- A residual that is a different mechanism from D1/D2 (D3): re-measure with the emoji replaced by `XX`. File a
  `queue:ready` + `parity` issue with the measurement and `file:line`, move the row to `OPEN` naming it, and continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Author more probes on the same reading, each with its oracle, and add them to the gate:
  - a coloured emoji `<#red:rocket:>` on an edge label (`drawEmojiAtom`'s tint);
  - an emoji inside `<size:30>` on an edge label (`factor`);
  - an emoji on a `note on link` (`SvekEdge#drawNotedLabel`);
  - an emoji beside a magic arrow label (`A --> B : go <:rocket:> >`);
  - an emoji in a `{{ }}`-free multi-line label (`\n`);
  - a sprite `<$s>` in a quantifier (T1c's sizer change), with `sprite $s [8x8/16] { … }` defined in the probe;
  - a usecase-to-usecase edge, and a component diagram with `left to right direction`.
- A `cheneer` edge with an emoji. The planning probe errors in the jar (`A -<:rocket:>- R`); find a spelling the jar
  accepts before you probe it. If it has the same no-resolver gap, wire it as T1d does.
- If a D3 site turns out to call `buildTextBlock` with a resolver you can reach, it is D1's seam: fix it in the task
  that owns that seam and journal why. Otherwise file it.
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none public. `AtomImageResolver` (`src/core/creole-atoms.ts`, internal, not in
  `dist/*.d.ts`) gains an optional `emojiArtwork` member. `dist/*.d.ts` must not move (D4).
- **Dependencies:** nothing new.
- **Behaviour:** only diagrams that put a `<:name:>` emoji in a `buildTextBlock` line whose caller holds a
  registry-backed resolver, and only when an emoji asset store is wired. Without the store, `emojiArtwork` is
  `undefined` and output stays byte-identical. With it, the drawing moves towards the jar. The batch-close survey proves
  this.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/emoji-edge-artwork/*.{puml,svg}` | Create (moved from `measurements/probes/`) | T1a |
| `tests/oracle/svg-conformance/emoji-edge-artwork.authored.test.ts` | Create | T1a; rows move to `ZERO` in T1b-T1d |
| `src/core/creole-atoms.ts` (`AtomImageResolver`) | Modify | T1b |
| `src/core/creole-atoms-image-resolver.ts` (`makeAtomImageResolverFor`) | Modify | T1b |
| `src/core/svek/image/EntityImageDescriptionTextBlock.ts` (`drawAtoms`) | Modify | T1b |
| `tests/unit/description/c4dd-t1b-text-atoms.test.ts` (drop `PENDING`, wire the store) | Modify | T1b |
| `src/core/svek/SvekEdge.ts` (`drawEndText`) | Modify | T1c |
| `src/core/svek/quantifier-block.ts` and its 2 callers (`description/link-edge-attrs.ts`, `description/layout-geo-post.ts`) | Modify | T1c |
| `src/diagrams/activity-legacy/renderer-edge.ts`, and its label sizer if it measures with `buildTextBlock` | Modify | T1d |
| unit tests beside the above (find them with `grep -rln "<symbol>" tests/unit`) | Create or modify | T1b-T1d |
| `tests/oracle/svg-conformance/parity-*.json`, `census-*.json`, `docs/parity-report.md`, `planning/next-missions.md` | Modify | batch closes, T2 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate, label, quantifier, legacy activity](batch-1/overview.md) | T1a, T1b, T1c, T1d | [x] |
| [exit](batch-exit/overview.md) | T2 | [x] |
| [squash](batch-squash/overview.md) | T3 | [x] |

## Done when (issue #150)

- [x] `tests/fixtures/c4dd-T1b/emoji-mixed-edge.puml` compares clean with its oracle and leaves `PENDING` in
      `c4dd-t1b-text-atoms.test.ts`. That gate renders with the emoji asset store, as the survey does.
- [x] Every gate row is `ZERO`, or `OPEN` on a filed issue (D3).
- [x] No new divergence. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.
- [x] 0 conformant losses in every engine, baseline survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D4, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-eea.mts` and `probes/` (8 `.puml`, with jar `.svg` in `probes/jar/`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-16)

**Tasks:** T0, T1a, T1b, T1c, T1d, T2 done (6 of 6 before the squash). One commit per task, plus batch-close commits
for batches 0 and 1. The history is on `emoji-edge-artwork/pre-squash`. 16 journal rows before the squash; none is
flagged for a ruling.

**Gates (exit, journal row 16):** `npm test` 2292 files / 49078 passed, coverage 96.96/92.53/97.43/97.99; typecheck,
lint, build and format:check 0. Every batch close ran the full set, and none failed.

**Verdicts, base `8c11d9f5f` → exit:** no verdict or diff count moved in any survey file (only `generatedAt`).
`verdict-diff`: 0 lost, 0 timeout or errored. Description ratchet 357/357 after every `src/` task. No census file moved.

**Probes:** at the start, 9 rows, 1 at zero. At exit, 19 rows (10 push-forward probes authored on the same reading),
13 at zero: `issue-150`, every description edge label shape (plain, tinted, `<size:30>`, multi-line, magic arrow,
usecase, left to right), both description quantifiers (emoji, sprite) and both legacy activity labels (emoji, sprite).
The 6 open rows are D3 residues, each with an `XX` control at 0: class label and quantifier (#199), group title (#200),
state label (#201), description notes standalone and on a link (#202, found by the `note on link` push-forward).

**Mechanism:** `Emoji.retrieve` is one global table (`Emoji.java:111-118`), so every creole line draws an
`AtomEmoji`'s artwork. The registry-backed `AtomImageResolver` now carries the emoji store, and `drawAtoms` draws
through `drawEmojiAtom` (D1); with no store, output is byte-identical. Both quantifiers take the label's resolver at
their draw and their sizer (`SvekEdge.java:328-340`), and legacy activity's edge input carries the registry resolver
(D2). A chen edge cannot carry creole (`CommandAssociate.java:72`), so that push-forward had nothing to wire.

**d.ts:** byte-identical to the T0 snapshot. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged
(D4).

**Follow-ons:** #199, #200, #201, #202. See `planning/next-missions.md`, section "emoji-edge-artwork (eea)".

**CI risk:** 19 renders in the authored gate (with the emoji asset store) and 9 unit tests, about 1 s locally. Every
registry-backed resolver now also carries one closure over the emoji store.
