## Observation: Player/AbstractStatePlayer reference classes owned by T2b and T2c
- **Context**: T2a, `Player#panels` returns `Panels` and `AbstractStatePlayer#createConstraint` builds a `TimeConstraint`.
- **Finding**: neither class exists until T2c/T2b, so T2a committed placeholders (`graphic/Panels.ts` with the abstract
  contract, `TimeConstraint.ts` with `TimeConstraintArgs` and a constructor only), each marked PLACEHOLDER.
- **Impact**: T2b and T2c replace those two files whole; `TimeConstraintArgs` keeps its shape.
- **Confidence**: High

## Observation: TimingSkinParam gained getDefaultTextAlignment
- **Context**: `TimingNote#createOpale` reads `skinParam.getDefaultTextAlignment(LEFT)` (TimingNote.java:93).
- **Finding**: nwdiag's `SkinParam` throws `unported:` for it, so the unit-test skin param (`tests/unit/timing/helpers/timing.ts`)
  subclasses it to answer the default. `timing-skin-param.ts` (T3a) must implement `SkinParam.java:731-738`
  (`getValue("defaulttextalignment")`, `HorizontalAlignment.fromString`, default when null).
- **Impact**: T3a owns the real implementation; `HorizontalAlignment.fromString` is not ported yet.
- **Confidence**: High

## Observation: Java's Player#getNotes and AbstractStatePlayer#getConstraints are live views
- **Context**: porting `Player` (java:106-108).
- **Finding**: `Collections.unmodifiableList(notes)` is a view, and `getConstraints()` hands the raw list to `Panels`; panels
  built early still see later notes. The port returns the live arrays as `readonly` types.
- **Impact**: do not copy them in `buildPlayerPanels`.
- **Confidence**: High
