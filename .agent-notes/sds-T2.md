## Observation: svgDimensionStyle citations were stale against the pin
- **Context**: sds T2 (#193), adding the flag to sequence/state/activity/description.
- **Finding**: At `oracle/pin.json#upstreamSha` (b066ee08c), `TextBlockExporter.java:420` sets
  `withSvgDimensionStyle`, `SvgGraphics.java:795-799` writes the root `style`/`width`/`height`, and
  `SkinParam.java:1216-1218` defines `svgDimensionStyle()`. Comments written by cogr cited `:308`, `:808-811` and
  `:1196`. T2 corrected them in `document-shell.ts`, `class/renderer-document.ts` and `description/renderer.ts`.
  `src/core/theme.ts:132` still cites `SvgGraphics.java:808-811`, and was deliberately left alone: the `Theme`
  doc comment is emitted into `dist/plantuml-engine.d.ts`, and the mission forbids any d.ts change (stop 5).
  The `lengthAdjust` comments across engines likewise cite `TextBlockExporter.java:306-307`; at the pin it is `:419`.
- **Impact**: Fix `theme.ts:132` in a mission that is allowed to move the d.ts; bulk-correct the `:306-307` citations
  in a docs-only cleanup.
- **Confidence**: High

## Observation: `end partition` is a syntax error in the jar's new activity syntax
- **Context**: authoring a warning-banner probe for sds T2.
- **Finding**: `partition P` / `:a;` / `end partition` errors in the oracle jar ("Syntax Error? (Assumed diagram
  type: activity)"). `partition P` / `:a;` / `}` draws, with the warning "Missing '{': write 'partition P {' and close
  it with '}'" (`group-dispatch.ts:100`).
- **Impact**: Use the brace-less opener plus `}` to trigger an activity warning banner in a fixture.
- **Confidence**: High
