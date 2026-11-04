# T1a — link path ids

Commit: `fix(state): name link paths as the jar does`.

## Context
`Link#idCommentForSvg` (`abel/Link.java:106-114`) builds `<name>-backto-<name>`, `<name>-<name>` or `<name>-to-<name>` from each
`Entity#getName`, and `SvekEdge#uniq` (`svek/SvekEdge.java:944,1093-1106`) adds `-1`, `-2` from a set `SvekResult#drawU` shares across every
line (`SvekResult.java:93-99`). We print `svgEndpointId` over layout ids, so a cluster endpoint leaks `__zaent_A`
(`state-composite-classify.ts:258`), and we have no `uniq`: `core/svek/SvekEdge.ts:255,308` has both, for description.

The `-backto-` form needs the inverted link's own entity order. Its head and comment are T2b's. Here get the names right; a row that still
differs only by `-backto-` waits for T2b.

## Read
`state-renderer-transitions.ts:59,253-268`; `core/abel/LinkBase.ts:94`; `decoration/LinkType.java:55-58` (`looksLikeRevertedForSvg`).

## Acceptance
- Given `bupani-17`, when rendered, then the path id is `A-to-AInternal`, with no `__zaent_` in any state SVG.
- Given `xupefu-98`, then the second parallel link's id is `compound-to-state1-1`.
- Given the row list, then `@id` is gone from every first diff of a `__zaent_` or `uniq` row, and the 33 rows whose only diffs are link ids (28 of them a single diff) are
  conformant or journaled.

Write-set is a plan. Observability: N/A — no new observable operations. Rollback: Reversible.
