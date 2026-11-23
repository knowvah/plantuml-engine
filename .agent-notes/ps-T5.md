## Observation: the include prefetch walk does not evaluate `!if`, and fetch failures are fatal
- **Context**: Measuring `tests/corpus/class/ludipa-77-tako754.puml` through `render(src, { stdlibRegistry })`.
- **Finding**: `Archimate.puml:25-35` has a relative `!include themes/shared_style.puml` in a dead `!if ($ARCH_LOCAL)` branch. The walk collects targets from every line (`src/core/include-resolver.ts:313`) and rejects on a non-stdlib fetch failure (`:364`), so `prepareIncludeStore`/`render()` error for archimate, while `renderSync` with an eager `withStdlib` store draws it. Filed as #228 (needs-ruling).
- **Impact**: Any bundle with a conditional relative include breaks the async path. Measure archimate rows with the eager store until #228 lands.
- **Confidence**: High

## Observation: browser renders lack jar-internal sprite and emoji artwork
- **Context**: #172 step 4, `compareSvg` against the oracle.
- **Finding**: Without an `assetStore`: `<$archimate/…>` 9 diffs, archimate bundle 9, emoji 1; with sprite+emoji stores, 0. No async prefetch exists for these assets (#227).
- **Impact**: Playground/browser output differs from the jar wherever sprites or emoji appear.
- **Confidence**: High
