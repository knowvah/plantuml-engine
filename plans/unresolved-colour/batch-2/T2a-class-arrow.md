# T2a: class arrow-style colour (M1)

**Probes:** `class-arrow`, `seq-arrow` (a class diagram in the jar, README), `class-arrow-comma` (`-[#red,#zzblue]->`).
Each is 3 diffs: path stroke and polygon fill/stroke `zzblue` → `#FFF`.

**Upstream.** `WithLinkType.java:161-163`: any token of the `,`-split style that is not a keyword or `thickness=` goes
to `HColorSet.instance().getColorOrWhite(s)`, then `setSpecificColor(tmp, i)`. The last colour token for an index wins,
so `#red,#zzblue` is white.

**Port site.** `src/diagrams/class/class-arrow-grammar.ts#parseArrowStyleOverrides`, the `segIdx === 0` branch
(`result.color = token…`, line 452) stores the raw token. It should store what `getColorOrWhite` returns, in the
representation the renderer already accepts for a resolvable colour. Check the renderer's consumer
(`ArrowStyleOverrides.color`) before you pick it, so `-[#red]->` stays byte-identical. `core/decoration/
WithLinkType.ts:165` is the faithful reference port.

## Acceptance
- Given `A -[#zzblue]-> B` in a class diagram, when rendered, then the link path stroke and arrowhead fill/stroke are
  the jar's `#FFF`, and `class-arrow` is at 0 diffs.
- Given `A -[#red,#zzblue]-> B`, when rendered, then the link is `#FFF` (the last token wins).
- Given `A -[#red]-> B` or `-[#red,dashed]->`, when rendered, then the output is byte-identical to `<base>`.
- Given the class and object ratchets, when run, then their counts are unchanged.
