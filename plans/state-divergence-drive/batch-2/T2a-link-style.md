# T2a — link style and stereotype

Commit: `fix(state): draw link colour, style and stereotype`.

## Context
`CommandLinkStateCommon.java:208-212`: `link.applyStyle(ARROW_STYLE)`, then `setStereotype`. `ast.ts:241-247` keeps `arrowStyle` raw, read only for the
`-[single]->` dedup. So `-[#blue]->` draws `#181818` (`xomize-22`), `-[dotted]->` has no dasharray (`papifi-44`), and `n0 -> n1 <<mystyle>>` draws neither colour
nor thickness (`livama-83`, `style-stereotype-on-arrow-5`). `core/abel/Colors.ts:35` and `LinkBase` carry the port (D6). Also here: `SvekEdge.java`'s stroke read and
`arrow { HeadColor none }` drawing a `line` head in `sokiga-03`, `SvekEdge#getStyle` signature on the stereotype.

`-[hidden]->`, `-[norank]->` and `single` already have consumers, so keep them working. Width of a `bold` link on DOT is `penwidth`: check the input.

## Read
`Link.java#applyStyle`; `SvekEdge.java:845-944`; `state-renderer-transitions.ts:225-268`; `core/svek/svek-edge-stroke.ts`.

## Acceptance
- Given `xomize-22-poro350`, `papifi-44-caxo706`, `livama-83-toci194`, when rendered, then each is conformant.
- Given `xupine-90` and `gokife-89`, then colour and stroke diffs are gone, and what remains is journaled to T2b or T6.

Observability: N/A — no new observable operations. Rollback: Reversible.
