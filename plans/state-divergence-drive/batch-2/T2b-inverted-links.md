# T2b — inverted links

Commit: `fix(state): draw an inverted link's head at its target`.

## Context
A defect you can see: `b <- a` puts our arrowhead on `a`.

```
jar   <!--reverse link b to a--> path M62.23,32 …91.79,32 id="b-backto-a"; polygon tip 57.23,32
ours  <!--link a to b-->         path M57.23,32 …86.79,32 id="a-to-b";      polygon tip 91.79,32
```

`CommandLinkStateCommon.java:205-206` `link.getInv()` when `dir` is LEFT or UP, and `Link.java:145-147` swaps `cl1`, `cl2` and inverses the type. So `decor1` and
`decor2` sit at the other ends, and `SvekEdge.java:654` `dotPath.reverse()` applies when the DOT reversed. `CommandLinkStateReverse.java` handles `<-`. Ours un-swaps
to semantic order (`tests/unit/state/state-direction-reversal.test.ts`) and draws at `points[length-1]`. That test encodes the old model: it moves with a Java quote.

Also: `xexika-61` and `viguto-81` (`x-->`, `-->o`) differ by 3 px in `@d` and 5 in the head, which may be the extremity trim (`SvekEdge.java:680-709`, *lead*).

## Read
`Link.java:145-147,420-435`; `decoration/LinkType.java#getInversed`; `state-composite-pass-edges.ts`; `state-composite-transition-geo.ts`; `renderer-arrowhead.ts`.

## Acceptance
- Given `defiga-15-puki727` and `jezuju-97-jado372`, when rendered, then each is conformant, id `b-backto-a` included.
- Given `cafafo-65`, then `@id` equal `up-backto-*start*`, and DOT diffs are journaled to T6c.
- Given `state-direction-reversal.test.ts`, then its assertions are jar values.

Observability: N/A — no new observable operations. Rollback: Reversible.
