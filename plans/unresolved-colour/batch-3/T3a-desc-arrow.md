# T3a: description arrow-style colour (M1)

**Probes:** `comp-arrow` (`[A] -[#zzblue]-> [B]`) and `comp-arrow-dashed` (`-[#zzblue,dashed]->`), 3 diffs each:
path stroke and polygon fill/stroke `zzblue` → `#FFF`.

**Upstream.** `CommandLinkElement.java:330`: `link.applyStyle(arg.getLazzy("ARROW_STYLE", 0))` reaches
`WithLinkType.java:161-163` `getColorOrWhite`, as in T2a.

**Port site.** `src/diagrams/description/link-grammar.ts#parseArrowStyle`, line 228 (`result.color = token…`). Use the
same representation choice T2a made, and check its consumer so `-[#red]->` stays byte-identical. The description
consumer may differ from class: read it, do not assume.

## Acceptance
- Given `[A] -[#zzblue]-> [B]`, when rendered, then the link path and arrowhead are `#FFF`, at 0 diffs.
- Given `-[#zzblue,dashed]->`, then the link is `#FFF` and dashed, as in the jar.
- Given `[A] -[#red]-> [B]`, then the output is byte-identical to `<base>`.
