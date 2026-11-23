# playground-stdlib (ps)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #172. Planned unattended on 2026-11-21 at `feature/parity-queue` `c41b639ca`. The maintainer
added `queue:ready` on 2026-11-18, after the body's "deliberately not labelled `queue:ready`" note was written. The label
is the later decision, so this mission runs unattended. #173 (the rename it was blocked by) is closed.

## Objective

Make `!include <bundle/...>` work in the docs playground (`/playground`) for every bundle the workspace stdlib packages
ship. Today every stdlib include shows the error text
`!include directives are not supported in renderSync without options.includeStore …`, because
`docs-site/.vitepress/theme/Playground.vue:96` calls `renderSync(source.value)` with no options.

- **The library already works.** The issue rendered its repro with an include store and got 0 `compareSvg` diffs against
  the oracle. `render()`/`prepareIncludeStore()` (`src/index.ts:386-399`, `src/core/include-resolver.ts:455`) and
  `stdlibRegistry()` (`src/core/tim/StdlibRegistry.ts`) are the seam. This mission wires the playground to that seam. It
  does not change the library.
- **What the packages ship** (`scripts/build-stdlib-packages/package-specs.ts`):
  - eager `BundleData`: `C4`, `archimate`, `cloudinsight`, `cloudogu`, `bootstrap` and `bootstrap1.13.1`, from
    `@knowvah/plantuml-stdlib`;
  - remote manifests: `awslib14`, its alias `awslib`, and `tupadr3`, from `-aws` and `-tupadr3`. Each needs a `baseUrl`
    serving the package's `assets/` (`docs/stdlib-remote.md`).
- **The issue's repro uses the legacy `aws` v1 bundle** (`<aws/common>`). No package ships it: si5b D2
  (`plans/si5b-stdlib/decisions.md:22-26`, maintainer-confirmed 2026-07-13/14) records "Legacy `aws` v1 (112MB,
  5 fixtures): deferred". Publishing it, on npm or on the docs site, is a maintainer decision. So this mission plans
  everything else, keeps the repro as a `test.fixme`, and files a `needs-ruling` issue for `aws` v1 (D1, T5).

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `playground-stdlib/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
npm run test:e2e        # this mission's acceptance lives here
npm run docs:build      # the deployed artifact
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- `npm run lint` covers `src tests demo scripts`, not `docs-site/`. A `.ts` module under `docs-site/` is typechecked only
  when a test imports it (`tsconfig.json:36` includes `tests`), which T2's unit test does.
- `src/` is expected to stay untouched. If any task does change `src/`, also run `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (exit 1 = a loss), plus
  `npm run catalog` for new exports.
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Stop conditions (halt, journal, report)

1. A change to `src/` would alter a published export or `dist/*.d.ts`.
2. The same gate fails on 2 consecutive fix attempts.
3. A finding contradicts D1 to D5. Amend `decisions.md` with the date, then halt.
4. A stdlib chunk lands in the playground's entry chunk, and a static-specifier fix (D3) does not move it out.
5. Serving any asset outside the D1 set on the docs site, or serving a D1 asset without its upstream LICENSE beside it.
6. The registered set renders differently in the playground than with `render(src, { stdlibRegistry })` in vitest, and
   you cannot state the mechanism with `file:line`.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A maintainer-only question, such as `aws` v1 or another captured-only bundle. File a `needs-ruling` issue with the
  evidence, and continue with the rest.
- A CI step you cannot run locally. Write it from the existing jobs' pattern, cite the run it is sized from, and say in
  the summary that it is unverified until CI runs.

## Push-forward (decide, journal, continue)

- Exact export names and keys: read `packages/*/generated/*.d.ts` after `npm run build:stdlib`; never guess.
- The fixture diagrams for the e2e spec: choose them, render each with `scripts/oracle-render.sh`, and check that the
  text the spec asserts on is in the oracle SVG.
- Pending-state wording and CSS, provided it uses the existing `--vp-c-*` variables.
- If `docs:dev` on a clean clone fails without `build:stdlib`, document the prerequisite in
  `docs-site/guide/getting-started.md` or the README's contributor section rather than adding fallbacks (D4).

## Blast radius

- **Data model / API:** none. No `src/` change, no `dist/*.d.ts` change, no new export.
- **Dependencies:** nothing new. The docs site starts importing the existing workspace packages.
- **Deployed site:** about 30 MB and 7.7k `.puml` files more under `/stdlib/` (awslib14 9.6 MB, tupadr3 ~19.5 MB). The
  per-bundle JS chunks load only when a diagram names the bundle.
- **CI:** `docs.yml` and the `ci.yml` `e2e` job gain the vendored-stdlib restore and `build:stdlib`.

| File | Action | Task |
|---|---|---|
| `tests/e2e/playground-stdlib.spec.ts` | Create | T1 |
| `docs-site/.vitepress/theme/playground-render.ts` | Create | T2 |
| `tests/unit/docs-site/playground-render.test.ts` | Create | T2 |
| `docs-site/.vitepress/theme/Playground.vue` (`renderNow`, `onMounted`, template, styles) | Modify | T2 |
| `docs-site/copy-stdlib-assets.mjs` | Create | T3 |
| `package.json` (`docs:stdlib`, `docs:dev`, `docs:build`) | Modify | T3 |
| `.gitignore` (`docs-site/public/stdlib/`) | Modify | T3 |
| `docs-site/playground.md` (bundle list + attribution) | Modify | T3 |
| `.github/workflows/docs.yml`, `.github/workflows/ci.yml` (`e2e` job) | Modify | T4 |
| `plans/playground-stdlib/followups.md` | Create | T5 |
| `planning/next-missions.md` | Modify | T6 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: red spec, render wiring, asset hosting](batch-1/overview.md) | T1, T2, T3 | [x] |
| [2: CI, sprites, rulings](batch-2/overview.md) | T4, T5 | [x] |
| [exit](batch-exit/overview.md) | T6 | [x] |
| [squash](batch-squash/overview.md) | T7 | [x] |

## Done when (issue #172)

- [x] An e2e spec types a stdlib-include diagram into the playground and finds its label text in the SVG. It covers one
      eager bundle (`C4`) and one remote bundle (`awslib14`). It failed before T2/T3.
- [x] The playground builds a `stdlibRegistry` of static lazy `import()` thunks over the D1 set. Renders are sequenced,
      so a stale render never overwrites a newer one. A pending state shows while a chunk loads, and
      `StdlibChunkLoadError` text appears in `error`.
- [x] The issue's step 4 sprite question is answered with an oracle measurement and journalled; a follow-up issue exists
      if the answer is "needed".
- [x] `docs.yml` builds the stdlib packages before `docs:build`; the `e2e` job does too.
- [x] The built site's stdlib chunks are separate from the entry chunk, and their sizes are journalled.
- [x] The `aws` v1 repro is a `test.fixme` naming the filed `needs-ruling` issue.
- [x] All README gates pass.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`npm`, `npx`, `node`,
`gh`, `scripts/oracle-render.sh`). It is deliberately not regenerated, because the SessionStart hook compares it with
the live `.claude/settings.json`.

## Summary (2026-11-21)

**Tasks:** T0 to T6 done (7 of 7 before the squash); T7 squashes. The per-task history is on `playground-stdlib/pre-squash`. 13 journal rows before the squash. No stop condition fired; three questions/follow-ons were filed and none blocks a done-when item.

**Gates (batch-2 close = exit, journal row 12):** `npm test` 2335 files / 50621 passed (base 2334 / 50602), coverage branches 92.57 / funcs 97.48 / lines 98.03, unchanged because `src/` is untouched; typecheck, lint, build, format:check, docs:build 0; test:e2e 27 passed, 2 fixme (base 23 passed). Each batch's gates passed first time apart from one T3 fix (`docs:build` dead links from VitePress building `public/**/*.md`, row 8).

**What landed:** `docs-site/.vitepress/theme/playground-render.ts` (registry of static `import()` thunks over the D1 set, render sequencer), `Playground.vue` (async render, `role="status"` pending indicator), `docs-site/copy-stdlib-assets.mjs` + `npm run docs:stdlib`, 5 e2e cases (C4, awslib14, pending, chunk failure + 2 fixmes), 19 unit tests. Outside the plan's write-set, each journalled: `stdlib-packages.d.ts` + `tsconfig.json` include (hermetic typecheck, rows 5-6), `vitest.config.ts` alias (row 5), `docs-site/.vitepress/config.ts` `srcExclude` (row 8), `tests/helpers/playground.ts`, README "Development" (row 13).

**Chunks, before → after (`docs:build`, rows 2 and 10):** entry `theme.*.js` 4,996,492 → 5,019,271 B. New lazy chunks: bootstrap 1,086,085; tupadr3.remote 392,204; c4 201,309; cloudinsight 190,339; archimate 145,977; cloudogu 128,764; awslib14.remote 66,372; awslib.remote (alias, tiny); and elk-worker.min 1,466,862, newly kept because `render()` (the fallback) is now imported. No bundle content in the entry chunk.

**`/stdlib/` payload:** 37M, 7748 files (awslib14 + tupadr3 assets with LICENSE, LICENSE-CODE, LICENSES.md, `licenses/`). `dist/` 7.2M → 48M.

**d.ts:** byte-identical to the T0 snapshot. `src/` diff against `c41b639ca` empty.

**Follow-ons:** #226 (ruling: publish legacy `aws` v1, the issue's repro), #227 (browser prefetch of jar-internal sprite/emoji assets; D5 measured "needed"), #228 (ruling: the include prefetch walk fails on `Archimate.puml`'s dead-branch relative include, so `archimate` errors through `render()`/the playground). See `planning/next-missions.md`, "playground-stdlib (ps)".

**CI risk:** the `docs.yml` and `e2e` workflow changes are unverified until CI runs (`actionlint` not installed). No uncached vendored-stdlib restore appears in the last 200 `ci.yml` runs, so the docs job's 10-minute cap is sized from cache hits only. The Pages artifact grows by ~37 MB.

