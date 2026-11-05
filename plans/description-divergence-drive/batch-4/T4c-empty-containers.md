# T4c — empty and anonymous containers

Commit: `fix(description): draw empty containers as the jar does`.

## Context
- `cloud {\n}`: `kazugi-06` is 122 against 187 wide with one more child, and `vogefo-33` is 239 against 301. The jar draws an anonymous container we drop. Read `CommandPackageWithUSymbol`, `EntityImageEmptyPackage`, and how `CucaDiagram` treats an empty group (`net/atmp/CucaDiagram.java`, outside the usual package).
- `package CC {\n}` keeps its colour: `fukoku-72`, `ricute-48` are `#F1F1F1` against `#FF0`. `EntityImageEmptyPackage.java:104-115` reads `style.value(PName.BackGroundColor)` from `{root, element, <diagram>, package, title}` (`:87-88`). Note that signature differs from `Cluster#getStyle`'s (`Cluster.java:385-388`): a `backgroundColor<<st>>` applies to a leaf and a group by different routes.
- `.agent-notes/description-autocreate-link-endpoints.md` is related: read it.

## Rows
`kazugi-06`, `vogefo-33`, `fukoku-72`, `ricute-48`.

## Acceptance
- Given `kazugi-06`, when rendered, then the anonymous cloud is drawn at 187 wide, with zero diffs.
- Given `fukoku-72`, then both packages are `#FF0`.

Observability: N/A — no new observable operations. Rollback: Reversible.
