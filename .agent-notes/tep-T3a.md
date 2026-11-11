## Observation: TimingDiagram takes the date-format zone as a constructor argument
- **Context**: porting `useDateFormat` (TimingDiagram.java:411-419), D4.
- **Finding**: `new SimpleDateFormat` formats in the JVM default zone; the port's `TimingDiagram` constructor takes a
  fourth `zone` argument (default `DEFAULT_CLOCK.zone`, UTC), like gantt's `clock`. The factory/plugin must pass
  `renderClock(options).zone`.
- **Impact**: T3c's factory and T4a's plugin thread the zone; otherwise `use date format` and `@yyyy/mm/dd` ticks shift.
- **Confidence**: High

## Observation: TimingDiagram.ts is at the 500-line cap; stacking arithmetic lives in timing-diagram-layout.ts
- **Context**: D16 file cap.
- **Finding**: `getUTranslateForPlayer`, `getUTranslateForPlayerFrame` and `getPart1MaxWidth` are free functions in
  `timing-diagram-layout.ts` (port-only) with thin private delegators of the Java names on the class.
- **Impact**: do not add members to `TimingDiagram.ts` without moving something out.
- **Confidence**: High

## Observation: useUnderlineForHyperlink cannot answer Java's null
- **Context**: `timing-skin-param.ts`, SkinParam.java:1057-1061.
- **Finding**: `hyperlinkunderline false` answers `null` upstream; `TimingSkinParam`/`ISkinParam` type a non-null `UStroke`,
  so the port always answers the simple stroke (as `ebnf-skin-param.ts` does). Only a hyperlink in a note/label differs.
- **Impact**: probe `skinparam hyperlinkunderline false` with a link in a timing note in T4b.
- **Confidence**: Medium
