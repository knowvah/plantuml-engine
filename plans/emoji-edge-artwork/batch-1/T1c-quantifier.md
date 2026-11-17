# T1c: the quantifier text uses the label's resolver (D2)

**Writes:** `src/core/svek/SvekEdge.ts` (`drawEndText`), `src/core/svek/quantifier-block.ts`
(`measureQuantifierBlock`), `src/diagrams/description/link-edge-attrs.ts`, `src/diagrams/description/layout-geo-post.ts`,
a unit test beside `quantifier-block` or `SvekEdge`, the gate.
**Reads:** `SvekEdge.java:328-340,504-507,956-980`, `description/renderer-edge.ts:160-186` (`endText`, `labelFields`).

## Steps

1. **Read first.** Confirm in `SvekEdge.java:328-340` that both quantifiers are built with the label's `skinParam`.
   Find where the description layout calls `measureQuantifierBlock` and what registry it can reach.
2. **Red.** Assert `desc-quantifier-emoji`'s quantifier group child count from its oracle. Then author the sprite
   push-forward probe (README) with its oracle: a sprite `<$s>` in a quantifier. Assert its reserved width, which is
   the sizer half.
3. **Green.**
   - `drawEndText` passes `this.input.resolveAtomImage?.(end.font)` to both `buildTextBlock` calls (`:436`, `:441`).
   - `measureQuantifierBlock` takes an optional resolver and passes it to `buildTextBlock`. Its callers pass the
     resolver built from the registry for the cardinality font.
   - If `end.block` (an engine-measured block, `SvekEdge.ts:130`) is the path a probe takes, wire the resolver where
     that block is built instead, and journal it.
4. **Measure** (task contract step 5). Pin `desc-quantifier-emoji`, and the sprite probe if it reaches 0, as `ZERO`.

## Acceptance
- Given `desc-quantifier-emoji` and the emoji store, when the authored gate runs, then it reports 0 diffs.
- Given a quantifier with a defined sprite, when it is laid out, then its reserved table matches the jar's, or the row
  is `OPEN` on a filed issue with the residue's mechanism.
- Given the every-engine survey, when `verdict-diff.mjs <base>` runs, then it reports 0 lost.

Observability is N/A. Rollback is Reversible.
