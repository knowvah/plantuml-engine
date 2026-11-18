# Batch 2 — packages, harness registration, then the core move

The order keeps every commit green:
- T2a creates the packages while core still holds all 44 themes, so core shadows them (D2).
- T2b registers the packages on every harness surface. This is still a no-op for output.
- T2c removes the moved themes from core. A render site that T2b missed then fails a test.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-packages.md) | Classification table, generator output, the two packages, `packages/all` | typescript-pro | `scripts/theme-packages.json`, `scripts/build-theme-sources.ts`, `scripts/compile-themes.py`, `packages/themes-{unlicensed,gpl}/**`, `packages/all/*`, `package-lock.json`, tests | batch 1 | [x] |
| [T2b](T2b-harness.md) | Register both packages on every surface that renders a moved theme | typescript-pro | `tests/helpers/{theme-packages-store,fixture-include-store}.ts`, the render sites found, the inline-source tests | T2a | [x] |
| [T2c](T2c-core-move.md) | Core keeps 35 themes and their residue; Apache text to `dist/licenses/`; unregistered error tests | typescript-pro | `src/core/themes-source.ts`, `src/core/themes-builtin*.ts` (generated), `src/core/licenses/*`, `vite.config.ts`, tests | T2b | [x] |

Close with the README gates, `npm run build:stdlib` (it typechecks the workspaces, the new packages included), and
`npm run catalog`.
