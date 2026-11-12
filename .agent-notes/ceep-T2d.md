## Observation: the 37 non-ELK Chen probes render byte-identical to the jar (modulo `<?plantuml-src?>`)
- **Context**: T2d acceptance (`compareSvg` 0 diffs on six probes) measured on every probe.
- **Finding**: 36 of 37 are string-equal after dropping the `<?plantuml ...?>` processing instructions; `cov-title-chrome` differs only in `data-source-line` on chrome groups, legend rect `style=` vs attributes and the `plantuml-src` PI, all normalised by `compareSvg`. `cov-elk` (T3d) is 23 diffs from the ELK path.
- **Impact**: later tasks should expect residuals only from ELK and from untested branches; the conformance harness is blind to data-* attributes.
- **Confidence**: High

## Observation: unregistered plugin tests go through the singleton registry
- **Context**: `chenPlugin` is not registered until T3a, but `skinparam`/`<style>` probes need the real extractor.
- **Finding**: the block extractor already types `@startchen` as `CHEN_EER` (`block-extractor.ts#upstreamTypeOf`), so `registry.register(chenPlugin)` in `tests/unit/cheneer/render-chen.ts` is enough for `renderSync`. Process-local per vitest file.
- **Impact**: T3a must drop the helper's `registry.register` (double registration changes nothing but is dead code).
- **Confidence**: High
