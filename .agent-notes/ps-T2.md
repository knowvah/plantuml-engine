## Observation: vitest resolved `@knowvah/plantuml-engine` to dist/, not src/
- **Context**: Unit-testing `docs-site/.vitepress/theme/playground-render.ts`, which imports the library by its public name.
- **Finding**: Without an alias, vitest followed the workspace self-link to `dist/plantuml-engine.js`, a second copy of every class; `instanceof StdlibChunkLoadError` failed against the `src/` class the test threw. Fixed with `resolve.alias` in `vitest.config.ts`, matching tsconfig `paths` and both Vite configs.
- **Impact**: Code under test that imports the bare package name now gets `src/`. Before this, such a test silently depended on a fresh `npm run build`.
- **Confidence**: High

## Observation: TypeScript prefers an ambient module declaration over the package's own types
- **Context**: Keeping typecheck hermetic for static `import('@knowvah/plantuml-stdlib/c4')` specifiers when `packages/*/generated/` is not built (CI's static job).
- **Finding**: A /tmp experiment showed `declare module 'x/y'` wins even when `x/y` resolves to a real `.d.ts`. So `docs-site/.vitepress/theme/stdlib-packages.d.ts` is always the type source; drift is caught at runtime by the unit test resolving every registry key.
- **Impact**: Editing a generated package's export names will not fail typecheck; it fails `tests/unit/docs-site/playground-render.test.ts`.
- **Confidence**: High

## Observation: using `render()` in the docs site emits the elkjs worker chunk
- **Context**: Payload check after the playground started importing `render` (fallback path).
- **Finding**: `render()`'s async `layoutServices` (`src/core/elk/layout-services.ts:102`) is the only caller of `loadElk`; with `renderSync` alone Rollup tree-shook it. Now `elk-worker.min.*.js` (1.47 MB) is emitted as a lazy chunk.
- **Impact**: Not in the entry chunk; loads only for an ELK diagram on the fallback path. Expect it in docs-site chunk listings.
- **Confidence**: High
