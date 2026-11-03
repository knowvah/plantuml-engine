## Observation: only a member row's icon reads the style engine
- **Context**: dss T3g, routing `root,element,visibilityIcon,<kind>` through the builder.
- **Finding**: `MethodsOrFieldsArea.java:360-366` is the only `getMergedStyle` reader of `VisibilityModifier#getStyleSignature`.
  The class header (`EntityImageClassHeader.java:109-112`), package title (`ClusterHeader.java:132-133`) and link label
  (`SvekEdge.java:366-367`) take `Rose` colours from skinparams. `colorsFor(icon, theme, member)` therefore takes the
  `visibilityicon.<kind>` bucket only when `member` is true (`renderMemberVisibilityIcon`).
- **Impact**: `colorsFor` still applies the `visibilityIcon*Cascade` tier to the non-member callers (pre-existing; the jar
  would not). Not probed: a link-label icon did not render in the jar for `A --> B : +x` without more setup.
- **Confidence**: High (Java read), Medium (non-member cascade divergence unverified against the jar).

## Observation: `root { Margin }` reaches the mindmap document
- **Context**: mindmap `document { Margin 20 }` was ignored.
- **Finding**: `TextBlockExporter.java:510-516` signs `root,document`, so `root { Margin 20 }` is both the document margin
  and the root node's own (`FingerImpl.java:97`): jar canvas 192x189 where `document { Margin 20 }` is 172x149.
  The mindmap exporter read `getDefaultMargins()` directly; it now mirrors wbs's `calculateMargin`.
- **Impact**: `unwind2-S5` mindmap rows pinned `[0, 42]` for this gap (`!theme amiga` carries `root { Margin 5 }`);
  they are `[0, 0]` now.
- **Confidence**: High.

## Observation: single-line multi-property style blocks hide the icon cascade
- **Context**: reproducing the header/package icon defect.
- **Finding**: `visibilityIcon { public { LineColor #BB0000 BackgroundColor #00AA00 } }` on one line did not populate the
  cascade (0 diffs before the fix); the multi-line form did. The `visibilityIcon*Cascade` tier is now the member row's alone.
- **Impact**: author icon rows multi-line.
- **Confidence**: High (measured); mechanism of the one-line parse not diagnosed.
