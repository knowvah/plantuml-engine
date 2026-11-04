## Observation: dot-engine 2.10.2 cannot be adopted yet
- **Context**: Measuring the bump from 2.4.0 in a throwaway worktree, 2026-11-04.
- **Finding**: `getLayout` after `render` reports no label positions from 2.8.0 on (graphviz issue 40). Everything else in 2.10.2 is clean: with only those frees removed in a copy, 28 types lose no verdict, and `zodela-36` gains.
- **Impact**: Do not move the pin until issue 40 is fixed. Patching around it is not an option here (CLAUDE.md files engine findings).
- **Confidence**: High

## Observation: border-point anchor shapes the jar distinguishes
- **Context**: Fixing issue 39, 2026-11-04.
- **Finding**: `added == null` counts direct NORMAL nodes, notes included, and never a child cluster. A hasPort cluster re-declares its anchor in `i` regardless (`ClusterDotString.java:178-181`), so that family's membership was already right; only the state border-point family differed. `dotEqual` now counts `ee` declarations and flips nothing in class, component or unknown, so the same mechanism does not explain `perapa-23` or `banatu-09`.
- **Impact**: `tests/fixtures/border-point-anchor/` holds a jar DOT and SVG per shape.
- **Confidence**: High
