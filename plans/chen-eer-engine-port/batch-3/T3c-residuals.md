# T3c: drive the fixtures to an end

Split T3c into one task per diff family from T3b's table (T3c1, T3c2, …), one commit each, and journal each split.

**For each family:**
1. Run `fixtures.mts <slugs>`, and read the first diff and the Java behind it. Quote `file:line` before naming a cause.
2. Fix it at the origin: the image, the edge, the DOT, the style lookup or the chrome. A shared `src/core/` fix is
   allowed, with its Java quote. The every-engine survey at batch close catches collateral.
3. Rerun the whole fixture set, because `compareSvg` short-circuits.
4. A graphviz geometry delta that `dot -Tdot` on the jar's own `svek-1.dot` reproduces is not ours. A delta it does not
   reproduce in dot-engine is a dot-engine finding: file it under D12.

**End state (D12):** every fixture is at 0, an error pair, named with a forcing library, or on a `needs-ruling` issue.

## Acceptance
- Given `fixtures.mts`, then every line is 0, `error-pair`, or a row named in `build-authored-baseline.mts`'s
  `OPEN_ROWS` with its citation.
- Given `pin-cheneer-dot.mts --authored /tmp/ceep-dots`, then every graphviz fixture is `EQUAL`. A fixture that is not
  `EQUAL` is journaled with its failing checks.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
