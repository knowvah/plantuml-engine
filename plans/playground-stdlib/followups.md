# Follow-ups (playground-stdlib)

| Issue | Labels | What | Blocks |
|---|---|---|---|
| [#226](https://github.com/knowvah/plantuml-engine/issues/226) | `needs-ruling`, `parity` | Publish the legacy `aws` v1 bundle (111M, 1314 files), or keep it deferred (si5b D2) | e2e `test.fixme` "draws the issue repro (legacy aws v1)" |
| [#227](https://github.com/knowvah/plantuml-engine/issues/227) | `parity` | Browser-side async prefetch of jar-internal sprite and emoji assets (D5 verdict: needed) | playground artwork for `<$archimate/…>` and `<:code:>` |
| [#228](https://github.com/knowvah/plantuml-engine/issues/228) | `needs-ruling`, `parity` | The include prefetch walk fails on `Archimate.puml`'s dead-branch relative include, so `render(src, { stdlibRegistry })` errors for `archimate` | e2e `test.fixme` "draws an archimate bundle diagram" |

## D5 sprite measurement (issue #172 step 4)

`compareSvg(…, 'deterministic')` against `scripts/oracle-render.sh`, vitest with `DeterministicMeasurer`:

| Fixture | Path | No `assetStore` | With sprite + emoji `assetStore` |
|---|---|---|---|
| `rectangle "Principle" as P <<$archimate/motivation-principle>>` | `render(src, { stdlibRegistry: playgroundRegistry('/') })` | 9 diffs (`svg/@height` 68 vs 74) | 0 |
| `tests/corpus/class/ludipa-77-tako754.puml` | registry: include error page (#228); eager `withStdlib` store + `renderSync` | 9 diffs (`svg/@height` 76 vs 84) | 0 |
| `tests/corpus/sequence/gacemo-20-lafa203.puml` | registry | 1 diff (`svg/g[1]/g[7][childCount]` 3 vs 4) | 0 |

Verdict: needed. Filed as #227; not built here (D5).
