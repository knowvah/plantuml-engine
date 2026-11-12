# chore: rename plantuml-ts to plantuml-engine

## Summary

Renames the library on every live surface of the tracked tree (issue #173, maintainer decisions 2026-11-11):

- npm name `@knowvah/plantuml-ts` → `@knowvah/plantuml-engine`, including the `/image-providers` subpath;
- dist files `dist/plantuml-ts.{js,cjs,d.ts}` → `dist/plantuml-engine.{js,cjs,d.ts}`;
- our version string → `plantuml-engine version …` (`src/core/version.ts`, `PSystemVersion.ts`), on the `version`,
  `about` and `authors` pages and the error-page banner;
- every workspace package's peer/dev key (the workspace packages keep their own names), the lockfile, path aliases
  and the generated stdlib `.d.ts` specifier;
- prose, comments, message prefixes, temp-file/lock prefixes and the `PlantumlTs` identifier variants.

Dated records stay as written. A new fitness test, `tests/architecture/legacy-name.test.ts`, fails on the old name
anywhere outside them, so the result stays permanent.

## Decisions

- **D1** — the identifier variants are renamed too (`isPlantumlEngineOnly`, `PLANTUML_ENGINE_ONLY`,
  `plantumlEngineOnlyColumns`, vite `name: 'PlantUmlEngine'`); the matrix label in `docs/parity-report.md` reads
  `n/a (plantuml-engine only)`.
- **D2** — dated records are left as written (`docs/graphviz-issues/*`, `docs/upstream-plantuml-issues/*`, past
  `CHANGELOG.md` entries, `code-review-tasks.md`, completed `planning/mission-*/` dirs, `planning/mission-index.md`
  rows, `planning/next-missions.md`, `oracle/accepted-divergences.json` `retired[]`); TRACKER.md and
  mission-index.md each gain one dated note.
- **D3** — `oracle/patches/*` untouched: they are exports of the oracle seam commits pinned by `oracle/pin.json`.
- **D4** — the ratchet test above, built with a shrinking `PENDING` list during the sweep and closed empty.
- **D5** — lockfile regenerated with `--package-lock-only`; its diff (20+/20−) is only the renamed name, link and
  peer/`file:` keys — no version moved.
- **D6** — remote, local checkout path and `.claude/` were fixed interactively before the sweep; the sweep itself
  ran autonomously; `~/.claude/` edits and signing are the maintainer's after review.

## Pins that moved, and why each is the rename

- **About/authors page** (prints the version string; `plantuml-engine` is four characters wider and that line is
  the widest): `PSystemVersion.test.ts` `VERSION_DIFFS` — same 8 diff paths, values only (width 393 → 410,
  version `textLength` 130.575 → 157.35, line-2 `x` 138.875 → 165.65, logo `x` 307.325 → 324.35); the logo pin;
  `PSystemVersionFactory.test.ts` about width 393 → 410. The authored svg-utility scores (`cov-about`,
  `cov-authors`, `cov-version`) measure the same before and after.
- **Survey**: `npm run svg:survey` lost 0 conformant rows and changed no verdict. One diverged sequence row
  (`teoz-ng-001-11`, whose output is our own error page) widened its `maxDelta` 200 → 226 by the banner width;
  that row and the report freshness it drives are committed, the 28 stamp-only survey files restored.
- **Generated stdlib `.d.ts` digests** (`stdlib-eager-omission.test.ts`, 5 pins): each holds the peer specifier.
  Every new digest was checked to equal the sha256 of the old file with only `@knowvah/plantuml-ts` →
  `@knowvah/plantuml-engine` replaced; every `.js` and `index.*` digest is unchanged.

## Also in this PR

- `scripts/__pycache__/compile-themes.cpython-313.pyc` was tracked by accident; untracked, `__pycache__/` ignored.
- The dts-specifier guard now asserts each generated type import names `@knowvah/plantuml-engine` exactly, so a
  bare `'plantuml-engine'` fails as well as the old name.
- The archimate listsprite test resolved its fixture through `process.cwd()` and an absolute path under the old
  checkout location; it now resolves the tracked fixture from `import.meta.url`.
- `oracle/GAP.md` is co-edited with its generator: `scripts/oracle-gap.ts` also reads `oracle/corpus-cache/`,
  which is not present, so regenerating it would drop rows.

## Size

141 files outside `plans/` and the lockfile, +555 / −407 (962 changed lines; the lockfile adds 20 / 20, the
mission brief under `plans/` is excluded; the new ratchet test is 87 of the added lines). This is over the 400-line guideline because it is one mechanical rename spread across many surfaces
(package metadata, source, scripts, tests, docs). It is split into one commit per surface, each self-contained and
green, so it reviews best commit by commit.

## For the maintainer after merge

1. `~/.claude/settings.json:403` (path-keyed `npm run visual:upload` rule) and `:410` (repo-visibility note):
   `plantuml-ts` → `plantuml-engine`.
2. `~/.claude/hooks/complexity-ignore:16-26`: the globs name `~/git/plantuml-ts/…` and `~/git/knowvah/plantuml-ts/…`;
   after the move they no longer exempt `src/core/math/*` and `src/diagrams/class/class-notes.ts`.
3. After merge: `git grep -n "plantuml-ts" -- ':!plans' ':!.agent-notes'` shows only the D2/D3 paths (verified on
   this branch: 52 files, all under them).
4. **plantuml-plugins** still depends on `@knowvah/plantuml-ts` through a `link:` to the sibling checkout
   `../plantuml-ts` (`packages/core/package.json:11`, `README.md:4,58,63-68,94`). Its install breaks against this
   rename until that repo renames the dependency, the link path and its README — a separate PR there
   (`.agent-notes/rpe-plugins-link.md`).

Closes #173

🤖 Generated with [Claude Code](https://claude.com/claude-code)
