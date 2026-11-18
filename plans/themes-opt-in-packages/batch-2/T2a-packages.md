# T2a — classification table, generators and the two packages (D5, D6)

## Context

- `scripts/build-theme-sources.ts` writes all 44 upstream themes into `src/core/themes-source.ts`. Its drift gate is
  `tests/unit/core/themes-source.test.ts`.
- `scripts/compile-themes.py` writes the residue into `src/core/themes-builtin{,-a-m,-p-v}.ts`.
- The optional-package pattern is `packages/stdlib-aws/` (licence files, `peerDependencies`) and `packages/emoji/`
  (hand-written `index.js` and `index.d.ts`). Root `package.json` already lists `packages/*` as workspaces.

## Task

1. **`scripts/theme-packages.json` (new):** the D5 table.
2. **`build-theme-sources.ts`:**
   - Read the table. Fail with a clear message on an unclassified upstream theme.
   - Also emit `packages/themes-unlicensed/generated/themes.js` and `packages/themes-gpl/generated/themes.js`, each
     with a `.d.ts`. Each holds its themes' verbatim text, keyed by name, in the generator's existing literal style.
   - Keep the core output **unchanged in this task**: still 44 themes. T2c flips it. Add a CLI flag or exported
     function so T2c and the drift test can choose core-only.
   - `--check` covers every output file.
3. **`compile-themes.py`:** read the same table, and emit each package theme's residue next to its source. Use the
   file the generator reads, for example `packages/themes-*/generated/residue.json`. Leave core's residue files
   unchanged in this task.
4. **Packages (D6):** `package.json`, `LICENSE`, `LICENSES.md`, `README.md`, `tsconfig.json`, `index.js`, `index.d.ts`
   for each.
   - `index.js` builds the `ThemePackage` from `generated/`. `index.d.ts` imports the type from
     `@knowvah/plantuml-engine`.
   - Copy `peerDependencies`, `devDependencies` (`file:../..`), `publishConfig` and `repository.directory` from
     `stdlib-aws`.
   - The GPL `LICENSE` is the GPL-3.0 text. Take it verbatim from a copy already on disk, such as `find node_modules
     -name 'LICENSE*' | xargs grep -l 'GNU GENERAL PUBLIC LICENSE' | head`, or from
     `https://www.gnu.org/licenses/gpl-3.0.txt`. Journal which.
   - Each `LICENSES.md` names every theme, its author and its header `license:` value.
5. **`packages/all` (D6):** add the unlicensed package to `dependencies`, re-export `unlicensedThemes`, add an
   `assetPackages` row (`license: 'SEE LICENSE IN LICENSE'`), and extend the README and `LICENSES.md` warning. Do not
   add the GPL package.
6. **`npm install`** to link the workspaces. Commit the `package-lock.json` change.
7. **Tests:**
   - Extend `themes-source.test.ts`: each package's generated data is the generator output, and verbatim upstream when
     `~/git/plantuml` exists.
   - New `tests/unit/core/theme-packages.test.ts`: the D5 table equals the ruling's three sets (31 + 3 + `_none_` core,
     the 8 unlicensed, `sunlust`) and agrees with every theme's `license:` header; `packages/all` names
     `themes-unlicensed` and never `themes-gpl`.

## Write-set

`scripts/theme-packages.json` (new), `scripts/build-theme-sources.ts`, `scripts/compile-themes.py`,
`packages/themes-unlicensed/**` (new), `packages/themes-gpl/**` (new), `packages/all/{package.json,index.js,index.d.ts,README.md,LICENSES.md}`,
`package-lock.json`, `tests/unit/core/themes-source.test.ts`, `tests/unit/core/theme-packages.test.ts` (new).

## Read-set

`scripts/build-theme-sources.ts`, `scripts/compile-themes.py:1-60, 340-470`, `packages/stdlib-aws/{package.json,LICENSES.md,README.md,tsconfig.json}`,
`packages/emoji/{index.js,index.d.ts,package.json}`, `packages/all/*`, `tests/unit/stdlib-packages.test.ts` (package
tests to imitate).

## Acceptance (Given/When/Then)

- Given `npx jiti scripts/build-theme-sources.ts --check` and `python3 scripts/compile-themes.py` followed by
  `git diff --exit-code src/core`, then both exit 0. Core is unchanged.
- Given the unlicensed package's `unlicensedThemes.themes`, then its keys are exactly the 8 names, and `amiga.source`
  equals `~/git/plantuml/src/main/resources/themes/puml-theme-amiga.puml` byte for byte.
- Given `gplThemes.themes.sunlust.residue`, then it equals today's `BUILTIN_THEMES.sunlust`.
- Given a fake upstream directory holding an extra `puml-theme-new.puml`, then the generator fails and names `new`.
- Given `npm run build:stdlib`, then the workspace typecheck passes for both new packages.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `feat(themes): add the unlicensed and gpl theme packages` (`Refs: #180`).
