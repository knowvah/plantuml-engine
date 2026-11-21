# Batch 1: red spec, render wiring, asset hosting

T1 lands red first. T2 and T3 write disjoint files, but both are needed for T1's eager-and-remote spec to go green
(T2 alone turns the C4 case green; the awslib14 case also needs T3's `/stdlib/` hosting). Run them serially in the main
checkout.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-e2e-red.md) | e2e spec: stdlib includes draw in the playground (red) | orchestrator | `tests/e2e/playground-stdlib.spec.ts` | T0 | [x] |
| [T2](T2-render-wiring.md) | Registry + sequenced async render in the playground | orchestrator | `docs-site/.vitepress/theme/playground-render.ts`, `Playground.vue`, `tests/unit/docs-site/playground-render.test.ts` | T1 | [x] |
| [T3](T3-asset-hosting.md) | Self-host remote bundle assets under `/stdlib/` | orchestrator | `docs-site/copy-stdlib-assets.mjs`, `package.json`, `.gitignore`, `docs-site/playground.md` | T1 | [x] |

## Interface contracts

T2 consumes T3's URL layout, and T3 consumes nothing from T2.

```ts
// T3 guarantees: for bundle B in { awslib14, tupadr3 }, GET `${BASE_URL}stdlib/${B}/${relPath}` serves
// packages/stdlib-<pkg>/assets/${B}/${relPath} byte-for-byte, where relPath is a value of the manifest's `files`.
// T2 builds: remoteStdlib({ manifest, baseUrl: `${import.meta.env.BASE_URL}stdlib/${B}/` })
```

Batch 1 closes when T1's non-fixme tests pass, and with the README gates.
