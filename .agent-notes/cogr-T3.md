## Observation: association-class labels are verbatim; the point joins the pair's group
- **Context**: cogr T3a, rows kofogo-67-jiju461 and zemeco-27-kaje686.
- **Finding**: only `CommandLinkClass#executeArg` (`:367`) sets a `LinkArrow`; the `(A,B) .. C : label` paths pass `LABEL_LINK` straight to `LinkArg.build`, so a trailing ` >` is drawn as text (`Relationship.labelVerbatim`). The `Association` point is created in the pair's shared parent quark, else the current group (`AbstractClassOrObjectDiagram.java:244-249`).
- **Impact**: our magic-arrow read is label-text-based at render time, so any new edge built outside `executeArg` must set `labelVerbatim`.
- **Confidence**: High (zemeco and kofogo oracles, zero diff).

## Observation: `package X.Y {}` and `package X.Y {` title differently
- **Context**: cogr T3c, gemufi-65-riba175.
- **Finding**: `CommandPackageEmpty` titles the leaf with the dotted name as typed; `CommandPackage` with the quark's own name; `CommandNamespaceEmpty` with the qualified name. Jar-checked with `scripts/oracle-render.sh`.
- **Impact**: the port's merged handler needs `EmptyBlockForm`; any future merge of an Empty and a non-Empty command repeats the gap.
- **Confidence**: High.

## Observation: a quoted endpoint is cleaned before the `::` port test
- **Context**: cogr T3c, botome-06-bera894.
- **Finding**: `CommandLinkClass.java:303-310` calls `cleanId` (strips quotes) first; `splitEndpointPort` used to skip the port split for any quoted endpoint.
- **Impact**: quoted `"A::b"` endpoints now resolve to entity `A` with port `b`, as bare ones do.
- **Confidence**: High.

## Observation: class link labels reuse the sprite-run path for `[[url label]]`
- **Context**: cogr T3d, volode-59-safa575.
- **Finding**: `class-edge-label-sprite-runs.ts#resolveSpriteLabelRuns` is the one creole-atom arm for a single-line edge label; it now also accepts a hyperlink text atom (`CommandCreoleUrl`: colour string + exactly UNDERLINE) and no longer needs a sprite registry. Description's `[[url]]` in the long-description opener (`CommandCreateElementMultilines`) is still not applied by the description parser (`applyElementDecorations`), only class.
- **Impact**: other styled runs (`<b>`, `<color>`) on a link label still take the strip path.
- **Confidence**: High (volode oracle, zero diff).
