# T1b: a USymbol group draws in layout units

**Writes:** `src/diagrams/class/class-namespace-usymbol-shape.ts`, `src/diagrams/class/renderer.ts` (the round corner
passed to `renderNamespaceUSymbol`), a unit test for `renderNamespaceUSymbol` (find the existing one with
`grep -rln "renderNamespaceUSymbol" tests`; create `tests/unit/class/class-namespace-usymbol-shape-scale.test.ts` only if
none fits), the T1a gate.
**Reads:** `renderer-usymbol-entity.ts:311-357` (the #140 precedent: `unscaleForDrawing`, `scale: k`),
`src/core/klimt/document-shell-fragment.ts:235-260` (`renderDrawableToFragment`'s `scale`), `class-scale-geo.ts:84-101`
and `:143-180` (`ScaledTheme`), `class-namespace-colors.ts#groupSpecificStroke`, `class-package-style.ts
#namespaceRoundCorner`.

## The mechanism (verified at planning; re-read before acting)

- `SvgGraphics.java:467-474`: `format` multiplies every number by `option.getScale()`, so `USymbol#asBig`'s literals
  scale with the geometry. Examples: `USymbolRectangle.java:133` (title at `2 + dimStereo`),
  `USymbolNode.java:165-179`, `USymbolDatabase.java:157-161`, `USymbolCloud.java:259-262`.
- Ours: `renderNamespaceUSymbol` (`class-namespace-usymbol-shape.ts:382-423`) draws the pre-scaled geo at scale 1. Only
  the stroke (`:239-257`) and the corner (`renderer.ts:63-66`) carry `scaleK`.

## Steps

1. **Red.** Unit tests, each asserting a probe oracle's value, through `renderSync` + `DeterministicMeasurer`:
   - `issue-149`: `R`'s title `<text y="39.778">`;
   - `scale-node`: the node polygon's `points[1]` (first point's y, the 10 px corner at k=2) is `32`, not `22`
     (jar `points="32,32,52,12,204,12,…"`);
   - `scale-1p5-node`: the same number at `24` (k=1.5, a non-integer factor; ours `19`);
   - `node-thick-dashed`: the `<<Node>>` group polygon is `points="32,52,52,32,…"` with
     `stroke:#00F;stroke-width:2;stroke-dasharray:14,14` (the inline `#line.dashed:` stroke, `Cluster.java:437-442`).
2. **Green, per D1.**
   - Unscale the geo and theme the way `unscaleForDrawing` does, and pass `scale: k` to `renderDrawableToFragment`.
   - Drop the `scaleK` multiplications this path no longer needs, but keep the ones the folder and rect paths still use.
   - At `k === 1`, take the old path exactly, with no unscale and no `scale` key.
   - Fix the comments that say this path draws at scale 1: `renderer.ts:63-65`,
     `class-namespace-usymbol-shape.ts:235-237`. Each should cite `SvgGraphics.java:467-474` and the leaf precedent.
3. **Header splice, interim.** T1c owns the header. Until then, keep `rectangle-stereo`, `node-thick-dashed`,
   `folder-stereo` and `scale-component` at or below their T0 counts. The minimum is to splice the header body at
   `(dx·k, dy·k)`, with the body as it is now. If a header row's count would rise above T0, do T1c's change in this
   task instead, and journal it.
4. **Measure** per the contract, step 5. Expect every T1b row in the README table at 0. If a row stays open, find its
   mechanism before any further edit (diagnosis mode): an ink, sizer or ELK path reading the old pre-scaled value
   belongs here; a residue that is the same at `scale 1` is D3.
5. **Pin.** Move each row at 0 to `ZERO` with a dated comment citing `SvgGraphics.java:467-474`.

## Acceptance
- Given `issue-149.puml`, when it renders, then it compares at 0 diffs and its gate row is `ZERO`.
- Given each `scale-<symbol>` row the README assigns to T1b, when it renders, then it compares at 0 diffs.
- Given any class or object diagram without `scale`, when it renders, then the output is byte-identical to the base.
  The class and object surveys and ratchets show no moved row.
- Given the `class`, `object` and `unknown` surveys, when re-run, then no row leaves `conformant`.

Observability is N/A. Rollback is Reversible.
