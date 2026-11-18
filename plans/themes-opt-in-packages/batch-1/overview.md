# Batch 1 — the registration seam (D1 to D4)

Core still holds all 44 themes after this batch, so no render changes: registered packages sit behind core (D2). The
seam is tested with a synthetic package theme that core does not have.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-theme-store.md) | `ThemeStore`, `withThemes`, the `IncludeStore` methods, the lookup order and the forwarding | typescript-pro | `src/core/tim/{ThemeStore,IncludeStore,StdlibStore,EaterTheme}.ts`, `src/core/include-resolver.ts`, `src/index.ts`, tests | T0 | [x] |
| [T1b](T1b-residue-help.md) | Residue from a package, and `help themes` listing registered names | typescript-pro | `src/core/build-theme.ts` (+ helper), `src/core/dispatcher-types.ts`, `src/core/render-options.ts`, `src/diagrams/help/{CommandHelpTheme,HelpFactory,Help}.ts`, tests | T1a | [x] |

Close with the README gates and `npm run catalog`, which is drift-gated and changes with the new exports.
