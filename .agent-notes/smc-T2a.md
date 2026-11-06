# smc-T2a — dark mode through the style builder

## Observation: Style and StyleBuilder are in the public d.ts
- **Context**: T2a first added a `darkScheme` member to `Style` and a field to `StyleBuilder`.
- **Finding**: `dist/plantuml-ts.d.ts` rolls up `Style` and `StyleBuilder` (as `StyleBuilder_2`, reachable via `getCurrentStyleBuilder`), so any member, private ones included, changes the public d.ts. `ValueImpl` is not reachable. The flag now lives in a module-level `WeakSet` (`StyleBuilder.ts#setDarkScheme`) and the mapping is a free function (`Style.ts#darkSchemeStyle`).
- **Impact**: a brief that forbids a d.ts change rules out new members on any class reachable from the entry types; diff `dist/*.d.ts` after `npm run build`.
- **Confidence**: High

## Observation: sequence builders are captured per event before later skinparams run
- **Context**: deciding where `SkinParam.isDark` is read for sequence.
- **Finding**: a per-builder flag set from "declarations executed so far" misses a `mode dark` declared after the first command; upstream reads `isDark` at draw time from the final skinparams. The flag comes from the whole source's final `mode` (`createSequenceStyleDispatch`).
- **Impact**: any engine adopting `setDarkScheme` must read the final `mode`, not the positional one.
- **Confidence**: Medium (subagent finding, consistent with `TitledDiagram#muteColorMapper` running at export)
