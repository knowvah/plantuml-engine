# T3c — quantifier and role text

Commit: `fix(description): draw link quantifiers`.

## Context
`SvekEdge.java:344-351` builds `startTailText` and `endHeadRoleText` from `link.getRole1/2` with `cardinalityFont`, and `:970-980` draws them. `:233,237` gate a shield on `graphvizVersion.useShieldForQuantifier()`. The quantifier reaches our DOT (codd) and is not drawn: `purevo-74` is `childCount` 1 against 3, `misube-65` 1 against 2. `fetefi-28` is `textLength` 19.581 against 18.038: read whether that is the label or the quantifier font. `runedi-09`'s `<<Foo with a very long name>>` lands here only if the re-read says so.

`Kal` is unported on the description side (`kal1`, `SvekEdge.java:359-360`): check before assuming anything about it.

## Rows
`misube-65`, `purevo-74`, `fetefi-28`.

## Acceptance
- Given `purevo-74`, when rendered, then both `1`s are drawn at the jar's coordinates, and the row has zero diffs.

Observability: N/A — no new observable operations. Rollback: Reversible.
