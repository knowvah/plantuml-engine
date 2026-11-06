# T3b — magnetic border

Commit: `fix(description): pull line ends to the folder border`.

## Context
`SvekEdge.java:924-942` moves each end of the drawn path by `getSvekNode1().getMagneticBorder()` or `getSvekCluster1().getMagneticBorder()`, `.getForceAt(stringBounder, point)`. `Cluster#getMagneticBorder` (`Cluster.java:726-760`) returns `MagneticBorderNone` when `getUSymbol() == null && getGroupType() != GroupType.PACKAGE`, and otherwise asks a `ClusterDecoration`'s text block, with `DiagramType.CLASS` as the style name. `USymbolFolder` holds the force, and it is ported (`core/decoration/symbol/USymbolFolder.ts:109,212,253`).

This explains the family: `dotEqual` and `layoutEqual` true, one end of one path off by a fixed amount (`bozoju-49` 3.164, `kifogu-44` and `selapa-88` 20, `gigetu-10` 15.9 and 17.7), when the end is on a package or folder. `core/klimt/shape/TextBlock.ts:29` says `EntityImageDescription#getMagneticBorder` is guarded on `shapeType`: find what reaches it from `renderer-edge.ts`, and which of node, empty package and cluster are not wired. Read `SvekNode#getMagneticBorder` and `IEntityImageUtils.java:103-109`.

`zodela-36` (`121.66` against `121.88`) is `TRACKER` 36, dot-engine, 0.22 px: confirm with real `dot` (D9) and leave it named there if so. `xidaxi-41` (`~` in a label) and `ravodu-50` move 3 px and 90 px, so they are probably another mechanism: `StereotypeAlignment right`, and the `test~*` creole. Read them last.

## Rows
`bozoju-49`, `gucefa-91`, `kanute-77`, `texacu-57`, `kifogu-44`, `selapa-88`, `puboke-80`, `zavitu-69`, `gigetu-10`, `zotiru-33`, `zodela-36`, `vivido-49`, `ravodu-50`, `xidaxi-41`.

## Acceptance
- Given `bozoju-49`, when rendered, then it has zero diffs.
- Given `kifogu-44`, then the path end and its arrowhead match the jar's.
- Given every class, state and object row, then `verdict-diff` reports 0 lost: the shared edge code only adds what the Java adds.

Observability: N/A — no new observable operations. Rollback: Reversible.
