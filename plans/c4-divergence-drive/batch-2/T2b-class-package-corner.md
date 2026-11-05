# T2b — Class and object clusters read `RoundCorner` from the merged style

**Row:** `rosoga-84`, `svg/g[1]/g[1]/path[1]/@d`: radii 2.604 and 3.906 against the jar's 4.167 and 6.25: 21 of the row's 22 diffs are this path's `@d`. The radius sets where each arc lands, so the tab and body corners all move.

**Read:** `Cluster.java:286-295` (`getDefaultStyleDefinition`), `:321-324`, `:388-389`, `USymbolFolder.java:86-117`, `EntityImageEmptyPackage.java:65-71`; `src/diagrams/class/class-package-style.ts:39-42`, `renderer.ts:67`, `class-empty-package.ts:343-390`, `class-elk-adapter.ts:226`, `class-namespace-folder-outline.ts:51`.

**Do:** per D4. Use the signature `Cluster.java:291-295` picks, with `withTOBECHANGED(group.getStereotype())`. Sizer and renderer read one value. Keep `strictuml` at 0 (`:323-324`). Reach the description side's own cluster read for comparison: `biluko-70`'s `rx=7.5` already matches. Object shares this path, so its row counts move too.

**Red:** `rosoga-84`'s jar values. Authored: `skinparam roundcorner 8` × package, namespace, empty package, `packageStyle rectangle`, under class and object, with oracles.

**Measure:** `c4`, `class`, `object`, `unknown`.

## Acceptance
- Given `rosoga-84`, when re-read, then every `path[1]/@d` diff is gone.
- Given each authored row, when compared with its oracle, then 0 diffs.
- Given `class` and `object` surveys, then 0 conformant lost against the base.

Observability N/A. Rollback Reversible.
