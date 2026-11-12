# T2a: the four Chen leaf images

**Java:** `svek/image/EntityImageChen{Entity,Relationship,Attribute,Circle}.java`, `svek/image/AbstractEntityImage.java`
(`MARGIN`, `MARGIN_LINE`), `klimt/shape/TextBlockInEllipse.java`, `svek/GeneralImageBuilder.java:222-232`.

**Do:**
1. Port each class into `src/core/svek/image/`, with the names and members kept: `isWeak`, `isIdentifying`, `isKey`,
   `isMulti`, `isDerived`, `title`, `url`, `getStyleSignature`, `getStyle*`, `getShapeType`, `calculateDimensionSlow`,
   `drawU`, `applyColor` and `getShape`. Follow `EntityImageActivity.ts`'s shape for the style lookup.
2. Copy the geometry D8 lists. The relationship's diagonal comment is upstream's own.
3. `drawU` opens the `ID` group with `getQuark().toStringPoint()`, and a URL when `getUrl99()` is set. No Chen command
   sets a URL today, so keep the branch and journal that nothing reaches it.
4. Add the four branches to `GeneralImageBuilder.ts` in upstream's order.

## Acceptance
- Given `cov-attr-key`'s oracle, when the attribute image is measured with the deterministic measurer, then its DOT
  width and height match `svek-1.dot` (`0.375225`×`0.316847` in for `Id`, read from `/tmp/cee-plan/po/cov-attr-key/svek-1.dot`), and the text carries
  `text-decoration="underline"`.
- Given `cov-relationship`, then the diamond's polygon points equal the oracle's.
- Given `cov-weak`, `cov-identifying`, `cov-attr-multi` and `cov-attr-derived`, then the inner shape or dash matches
  the oracle element for element: offset, size, and `stroke-dasharray` `10,10`.
- Given `cov-multi-U`, then the circle is 25×25 with the symbol centred.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
