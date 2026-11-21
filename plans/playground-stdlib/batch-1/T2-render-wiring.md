# T2: registry + sequenced async render in the playground

**Writes:** `docs-site/.vitepress/theme/playground-render.ts` (new), `tests/unit/docs-site/playground-render.test.ts`
(new), `docs-site/.vitepress/theme/Playground.vue`.
**Reads:** decisions.md D1, D3; `StdlibRegistry.ts:1-60` and `:300-372`; `include-resolver.ts:420-470`;
`src/index.ts:340-400`; `packages/*/generated/*.d.ts` (export names); `Playground.vue:94-125`.

## Module shape (`playground-render.ts`)

```ts
import { prepareIncludeStore, render, renderSync, remoteStdlib, stdlibRegistry,
         StdlibChunkLoadError, type StdlibRegistry } from '@knowvah/plantuml-engine';

/** D1: one entry per packaged bundle, static specifiers only (si8 ADR-3). */
export function playgroundRegistry(baseUrl: string): StdlibRegistry;

export type PlaygroundResult = { svg: string; error: '' } | { svg: ''; error: string };

/** Pure in its decisions: the caller injects `prepare`/`renderSync`/`render` (testability rule 5). */
export function createRenderSequencer(deps: {
  prepare: (src: string) => Promise<IncludeStore>;
  renderSync: (src: string, store: IncludeStore) => string;
  renderAsync: (src: string) => Promise<string>;
}): (src: string) => Promise<PlaygroundResult | undefined>; // undefined = superseded, drop it
```

- Registry keys: `c4`, `archimate`, `cloudinsight`, `cloudogu`, `bootstrap`, `bootstrap1.13.1` (the same
  `@knowvah/plantuml-stdlib/bootstrap` thunk as `bootstrap`), `awslib14`, `awslib`, `tupadr3`. The remote ones wrap the
  manifest with `remoteStdlib({ manifest, baseUrl: `${baseUrl}stdlib/<bundle>/` })`. For `awslib`, point the baseUrl
  at `awslib14`'s folder: the alias has an empty `files`, and its target resolves through the `awslib14` entry.
- Errors: `StdlibChunkLoadError` → `{ error: e.message }`. Any other rejection from `prepare` → `renderAsync(src)` (the
  library's own error page). Never swallow: there is no empty catch.
- If the request id is stale after any `await`, return `undefined` (error-handling.md, "Race conditions across awaits").

## Playground.vue

- `renderNow` becomes async: set `pending = true`, await the sequencer, ignore `undefined`, assign `svg`/`error`, then
  clear `pending` only if this request is still the latest.
- Keep the SSR guard (`typeof window === 'undefined'`) and the 250 ms debounce.
- Show a pending indicator in the toolbar (`role="status"`) while `pending` is set. Keep the previous SVG visible
  meanwhile.
- `baseUrl` comes from `import.meta.env.BASE_URL` (VitePress sets it from `base: '/'`).

## Acceptance
- Given two renders where the first resolves after the second, when both settle, then only the second's result is
  returned (unit; deferred promises, no timers).
- Given `prepare` rejects with `new StdlibChunkLoadError('C4', cause)`, then the result is `{ svg: '', error }`, and
  `error` contains `'C4'` (unit).
- Given `prepare` rejects with any other error, then `renderAsync` is called once and its SVG is returned (unit).
- Given `playgroundRegistry('/')`, when `resolveResource('C4', 'c4_container')` is awaited in vitest, then it returns the
  vendored file's text (unit; it imports the real workspace package, which globalSetup builds).
- Given T1's spec, when it runs, then case 1 (C4) and case 3 (chunk failure) pass. Case 2 waits for T3.

Commit: `feat(docs): render stdlib includes in the playground`, with `Refs: #172`.
Observability is N/A. Rollback is Reversible.
