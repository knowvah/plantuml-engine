# T3d — arrow style

Commit: `fix(description): read arrow stroke and rainbow from the style`.

## Context
`SvekEdge.java:816-821` merges `{root, element, <diagram>, arrow}` with `withTOBECHANGED(stereotype)`, and `:874-876` builds `Rainbow.build(styleLine, ...)`. `core/style-cascade-description.ts` holds line and font colours, and has no `LineStyle` or `LineThickness` (`planning/next-missions.md`: "Description arrow tag cascade has no FontSize/LineStyle"). D2's builder gives you the merged style here too: use it, so the tag cascade need not grow.

- `arrow { LineStyle 10-5 }`, `.a { Linestyle 3-2 }`: `pemifo-35`, `vaseda-71`, `simegi-12`, `xilosu-00`.
- ELK path of the same source: `xoviku-63` (`MyElkEdge.ts`). `dotEqual` false is expected on ELK; read the row.
- `-[#blue,dashed;#red]->` is a rainbow: `bagoze-78` is `childCount` 3 against 4, a second path. `Rainbow`'s draw in `SvekEdge` (*lead*).
- `-[#transparent]-`: `nujove-77`'s first diff is `@id` `ent0002` against `ent0001`, with polygon coordinates after it. Read why; the jar may draw them in another order under a transparent link.

## Rows
`pemifo-35`, `vaseda-71`, `simegi-12`, `xilosu-00`, `xoviku-63`, `bagoze-78`, `nujove-77`.

## Acceptance
- Given `simegi-12`, when rendered, then the path carries `stroke-dasharray="3,2"`, and the row has zero diffs.
- Given `bagoze-78`, then the group holds the jar's four children.

Observability: N/A — no new observable operations. Rollback: Reversible.
