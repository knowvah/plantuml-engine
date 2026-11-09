## Observation: note-on-link DOT boxes measured from raw text, not the drawn block
- **Context**: laep T4, DOT-parity pinning of the authored legacy fixtures; `note-on-link-stereotype-hide` was the only structurally UNEQUAL fixture whose SVG matched the jar (labelSizeOk: ours 131x33, jar 115x33).
- **Finding**: `SvekEdge.java:311-312` merges the very `EntityImageNoteLink` it draws into the label, so creole the block applies (here `skinparam ShowStereotype false` hiding `<<foo>>`) shrinks the DOT box too. The legacy engine measured the note's raw text with `measureLinkNoteDim` (`activity-legacy-edge-text.ts`); fixed in laep T4 to measure the block. State still uses the raw-text measure at `src/diagrams/state/state-dot-graph.ts:195`, `state-transition-label.ts:272` and `state-composite-edge-label.ts:63`, and description passes a `noteDim` through `link-edge-attrs.ts:340`.
- **Impact**: a state or description `note on link` whose text holds creole the block changes (a stereotype under `ShowStereotype false`, markup that changes width) may reserve a different DOT label box than the jar. No corpus row is known to hit it; author a probe before changing either engine.
- **Confidence**: High for the legacy engine (red test, then fixed); Medium for state/description (same code shape, not measured).

## Observation: the svg-activity-legacy family serves three buckets
- **Context**: laep T4 ratchet.
- **Finding**: legacy pins carry `type` and live at `oracle/goldens/svg-activity-legacy/<type>/<slug>/`, as svg-description's do; the routing/refusal twins use slug `<type>/<slug>`. `RATCHET_FAMILY` maps the family to `activity`, `unknown` and `network`.
- **Impact**: a future legacy pin must carry `type`, or `ratchetPinsOf` attributes it to no bucket.
- **Confidence**: High.
