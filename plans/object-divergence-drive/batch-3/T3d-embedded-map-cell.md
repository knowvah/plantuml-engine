# T3d — A map cell holding `{{` draws an embedded diagram

**Rows:** `zicope-62-pica490` (24 diffs): a `map` whose values are `{{%breakline()left to right direction ...}}`, built by a `!procedure`. Jar: `<image width="90" height="29">` in each value cell. Ours: the literal `{{left to right ...}}` text. `zuvila-56-nuda425` (8 diffs): the same map inside a `legend {{ ... }}`, jar image 201 × 221 against our 600 × 92, so the inner render carries the same defect.

**Read:** `TextBlockMap.java:176-178`, `Display#getWithNewlines`, `Display#create0`, `CreoleParser.java:152`, `EmbeddedDiagram.java:97-152`. How `%breakline()` reaches the cell: its output has to survive to `getWithNewlines`. On our side `class-map-sizing.ts` `measureMapCell`, `core/EmbeddedDiagram.ts`, `class-body-enhanced-embeds.ts:32-84`, `core/klimt/creole/SheetBuilder.ts:54,84`, and how the map parser stores `\n` and `%breakline()`.

**Do:** per D7. `compareSvg` exempts image bytes but not the image's size (`.claude/memory/conformant-is-not-divergence-gone.md`), so the slot must equal the nested document's size. `dotEqual` is false on both rows today, since they hold `svek-2.dot` and `svek-3.dot`: check whether it turns true, and journal it.

#144 is the related `{{` **edge label**, a different seam. Do not close it here. `.agent-notes/xetase-embedded-diagram-label.md` describes the shared primitive, but its numbers predate seam #3.

**Red:** one map cell with `{{` built directly, no procedure; a key cell with `{{`; `{{salt` in a cell; the two rows.

## Acceptance
- Given both rows, when compared, then conformant.
- Given a map cell with `{{`, when compared with its oracle, then the `<image>` slot matches.
- Given a cell holding plain text, then its output is unchanged.

Observability N/A. Rollback Reversible.
