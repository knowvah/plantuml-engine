## Observation: the ruler's TreeSet<Long> dedupes the added zero
- **Context**: porting `TimingRuler#roundValues` (TimingRuler.java:286-304).
- **Finding**: `result.add(0L)` on a `TreeSet<Long>` that already holds 0 is a no-op, so ticks -10, 0, 20 label `-10, 0, 20`
  (cov-negative-time), not `-10, 0, 0, 20`. A first port splicing 0 into a sorted array printed `0` twice.
- **Impact**: any further `TreeSet.add` port must go through the dedupe, not an unconditional insert.
- **Confidence**: High (oracle labels match after the fix)

## Observation: a unit test of the ruler needs a skin param the timing engine does not have yet
- **Context**: T1c, before T3a's `timing-skin-param.ts`.
- **Finding**: `timing-klimt.ts` declares `TimingSkinParam` (the `ISkinSimple` slice plus style builder, colour set,
  pragma, atom ops); the unit tests satisfy it with nwdiag's `SkinParam`
  (`tests/unit/timing/helpers/timing.ts`), which `createMindmapSkinParam({})` styles with the default
  `timingDiagram { timeline, timegrid }` rules (stroke 2, #333333).
- **Impact**: T3a's `timing-skin-param.ts` must implement `TimingSkinParam`; swap the helper then.
- **Confidence**: High
