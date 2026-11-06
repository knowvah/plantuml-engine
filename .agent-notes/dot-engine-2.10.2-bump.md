## Observation: dot-engine 2.8.0 to 2.10.2 cannot be adopted
- **Context**: Measuring the bump from 2.4.0 in a throwaway worktree, 2026-11-04.
- **Finding**: `getLayout` after `render` reports no label positions from 2.8.0 on (graphviz issue 40). Everything else in 2.10.2 is clean: with only those frees removed in a copy, 28 types lose no verdict, and `zodela-36` gains.
- **Impact**: Fixed in 2.10.3. Patching around it was not an option here (CLAUDE.md files engine findings).
- **Confidence**: High

## Observation: the bump from 2.4.0 to 2.10.3
- **Context**: Surveyed all 28 types one at a time at `7c304c2c0`, on both versions, 2026-11-05.
- **Finding**: 2.4.0 has 5012 conformant, 765 diverged, 147 structural-match, 3 oracle-error; 2.10.3 has 5013, 765, 146, 3. Only `unknown/zodela-36-sica712` moved, and there were no timeouts. 2.8.0 to 2.10.2 cannot be pinned (issue 40). 2.10.3 warns on the console for titled clusters (issue 42).
- **Impact**: A worktree must copy `packages/*/assets` and `generated`, not symlink them: `npm pack` skips symlinks, so four package tests fail for no engine reason.
- **Confidence**: High

## Observation: border-point anchor shapes the jar distinguishes
- **Context**: Fixing issue 39, 2026-11-04.
- **Finding**: `added == null` counts direct NORMAL nodes, notes included, and never a child cluster. A hasPort cluster re-declares its anchor in `i` regardless (`ClusterDotString.java:178-181`), so that family's membership was already right; only the state border-point family differed. `dotEqual` now counts `ee` declarations and flips nothing in class, component or unknown, so the same mechanism does not explain `perapa-23` or `banatu-09`.
- **Impact**: `tests/fixtures/border-point-anchor/` holds a jar DOT and SVG per shape.
- **Confidence**: High
