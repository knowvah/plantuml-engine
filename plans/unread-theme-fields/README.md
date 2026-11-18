# unread-theme-fields (utf)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #156 (from #122, `style-colour-reads` item 22, brief D7). Planned unattended on 2026-11-17 at
`feature/parity-queue` `1689e015e`.

## Objective

Delete the two `Theme['colors']['graph']` fields that are written and never read, and their writers, as the
maintainer ruled on #156:

> [sseely, 2026-11-09] Use option #1, delete both fields and their writers.

Option #1 in the issue body: "Delete both fields and their writers. This changes `dist/plantuml-ts.d.ts`: two members
are removed from the public `Theme` type. `theme.test.ts` loses its assertions on them." (The dist file has since been
renamed `dist/plantuml-engine.d.ts`, #173; the members sit at `:4624-4625` on the base.)

- **Upstream has no such field.** A business actor or use case takes its fill from its own style signature:
  `backcolor = styleTitle.value(PName.BackGroundColor)` (`svek/image/EntityImageDescription.java:163-165`), where
  `styleTitle` is the `{…, symbol.getSNames(), title}` signature (`:150-152`) that carries `business` for the business
  symbols.
- **Ours already mirrors that.** `renderer-entity.ts:199-206` reads `stylePaint(entityStyle?.title,
  'BackGroundColor')`, filled from the `actor-business`/`usecase-business` buckets that `style-element-scope.ts`
  writes (dss T3a). Nothing reads `businessActorFill` or `businessUsecaseFill` (`git grep` on the base: zero reads in
  `src/`).
- **The fields and their writers** (base `1689e015e`):
  - type: `src/core/theme-graph-colors-b.ts:386-391` (two members with their comments);
  - defaults: `src/core/theme.ts:306-307` (default theme) and `:357` (dark theme, `businessUsecaseFill` only);
  - style writers: `src/core/style-map-simple-fields.ts:33-39` (`actor.business`) and `:47-53` (`usecase.business`),
    two entries of `SIMPLE_SELECTOR_MAPPINGS`.

This mission:

1. deletes the two members, their three default writes and the two selector entries, rewrites the tests that named
   them, and adds a test that the fields are gone (batch 1, T1a, D1, D2);
2. records the public-type removal in `CHANGELOG.md`, strikes the follow-on in `planning/next-missions.md`, proves 0
   verdict movers in every engine and that the d.ts diff is exactly the two members (exit, T2, D3);
3. squashes (T3).

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `unread-theme-fields/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- `npm run catalog` if a module's header or exports change (drift-gated). Survey moves change `docs/parity-report.md`
  and `docs-site/parity.md`: run `npm run parity:dashboard` at the exit close.
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Every engine, at exit:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Description pins after T1a:** `npx vitest run tests/unit/description/dss-t3a-readers.test.ts
  tests/integration/index.test.ts tests/unit/theme.test.ts`; read the count.
- **Oracles (only if a push-forward needs one):** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a
  hand-typed `java -jar`. Delete the `svek-N.dot` files it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. Any verdict or pinned golden moves in any engine. The issue states "No rendered output depends on this"; a move
   means a reader exists that the planning grep missed. Name it with `file:line`, amend `decisions.md`, halt.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D4. Amend `decisions.md` with the date, then halt.
5. The `dist/*.d.ts` diff against the T0 snapshot holds anything other than the removal of `businessActorFill` and
   `businessUsecaseFill` (and comment lines attached to them) (D3).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A further reference found by `git grep` in `src/`, `tests/`, `scripts/` or `docs-site/` that the README misses:
  delete or reword it in T1a and journal it.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Historical brief text under `plans/*/` and `planning/usecase-deepdive.md`, and the 2026 `CHANGELOG.md` entry at
  `:305-306`, describe the fields as they were. Leave them: they are records (D4).
- Rewrite comments that name the deleted fields as if live (`renderer-entity.ts:201-203`, the `dss-t3a-readers`
  test title) so they cite the jar instead, keeping the `EntityImageDescription.java` reference.
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model:** none. No stored format reads `Theme`.
- **API:** `Theme` is public through the exported `RenderOptions.theme?: … | Partial<Theme>`
  (`src/core/render-options.ts:28`); the bundle declares it at `dist/plantuml-engine.d.ts:3452`. Its
  `colors.graph` (`ThemeGraphColors`) loses two required members. `Partial<Theme>` is shallow, so a caller passing a
  full `colors.graph` literal that names either field gets an excess-property error. plantuml-engine has no consumers (memory `plantuml-ts-has-no-consumers`;
  the issue body). The ruling accepts the d.ts change.
- **Style input:** `<style> actor { business { BackGroundColor … } }` and `usecase { business { … } }` keep working:
  they are read through the element buckets, not the deleted entries.
- **Dependencies:** nothing new.

| File | Action | Task |
|---|---|---|
| `src/core/theme-graph-colors-b.ts:386-391` | Modify (delete 2 members + comments) | T1a |
| `src/core/theme.ts:306-307,357` | Modify (delete 3 defaults) | T1a |
| `src/core/style-map-simple-fields.ts:33-39,47-53` | Modify (delete 2 entries) | T1a |
| `src/diagrams/description/renderer-entity.ts:201-203` | Modify (comment) | T1a |
| `tests/unit/theme.test.ts` (lines from the issue) | Modify | T1a |
| `tests/diagrams/activity/tiles/gtile-text-tiles.test.ts:43-44` | Modify | T1a |
| `tests/unit/description/dss-t3a-readers.test.ts:75` | Modify (title) | T1a |
| a `computeSimpleSelectorOverrides` test (new `tests/unit/core/style-map-simple-fields.test.ts`) | Create | T1a |
| `CHANGELOG.md` (`## [Unreleased]`, `### Removed`) | Modify | T2 |
| `planning/next-missions.md:302` | Modify | T2 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs-site/parity.md` | Modify only if not just `generatedAt` | T2 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: delete the fields](batch-1/overview.md) | T1a | [x] |
| [exit](batch-exit/overview.md) | T2 | [x] |
| [squash](batch-squash/overview.md) | T3 | [x] |

## Done when (issue #156)

- [x] `git grep -nE "businessActorFill|businessUsecaseFill" -- src tests scripts docs-site` prints nothing.
- [x] A test asserts neither field is on any built-in theme's `colors.graph`, and that `computeSimpleSelectorOverrides`
      writes no business key for `actor.business`/`usecase.business` input.
- [x] `dist/plantuml-engine.d.ts` differs from the T0 snapshot by exactly the two removed members.
- [x] `CHANGELOG.md` names the removal under `### Removed`.
- [x] 0 verdict movers in every engine, base survey against final survey.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D4, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-17)

**Tasks:** T0, T1a, T2 done; T3 (squash) follows this commit. Per-task history on `unread-theme-fields/pre-squash`.
Batches 0, 1 and exit closed (`47d608275`, `27d820063`, the T2 commit). 13 journal rows before the squash; no
question open, no issue filed, no stop condition hit.

**Gates (exit, journal row 13):** `npm test` 2298 files / 49173 passed (base 49167: +10 absence cases, −4 deleted
single-field tests), coverage 96.96/92.54/97.43/97.99; typecheck, lint, build and format:check 0. No gate needed a fix.

**Verdicts, base `1689e015e` → exit:** `verdict-diff.mjs` "lost 0, timeout or errored 0". Every `parity-*.json`
changed only `generatedAt` and was reverted; the dashboard did not move.

**d.ts:** `plantuml-engine.d.ts` `4624,4625d4623`, the two members, nothing added; `image-providers.d.ts` identical.

**Done-when note:** `git grep` over `src tests scripts docs-site` prints one line, the absence pins' shared constant in
`tests/helpers/removed-theme-fields.ts` (journal row 6); T1a step 4 allows it.

**Follow-ons:** none. **CI risk:** none new; two test files and one helper added, no fixture or golden touched.
