# rep-T3a observations

## Observation: preprocessor `!option` warnings never reached a diagram
- **Context**: regex-engine-port T3a, `regex/vokasi-57-zupa746` (`!option foo bar`) drew without the jar's
  `No such !option foo` banner.
- **Finding**: `EaterOption` adds the warning to the `PreprocessingArtifact`, but `preprocessor.ts` exported only
  `getOptions()`; every engine that rebuilds its artifact from `styleSource.options` (ebnf, regex, nwdiag, board, ...)
  lost it. `PreprocessorResult.warnings` now carries them and `UmlSource.styleSource` includes the field; only
  `regex/index.ts#preprocessingArtifactOf` consumes it so far.
- **Impact**: any other engine's `preprocessingArtifactOf` can add the same loop; a corpus row with an unknown or
  value-less `!option` in another engine would show the same missing banner. The jar text uses U+00A0 between words.
- **Confidence**: High

## Observation: Welcome-style jar error pages fall outside the gates' 4096-byte head
- **Context**: refusal-coverage gate on `regex/bakuza-41-bulo451`, `tajefa-31-pefi801`.
- **Finding**: `PSystemError` prepends the Welcome tutorial for short sources (PSystemError.java:217-218), putting the
  `PlantUML version` banner at byte ~5353. `refusal-coverage-gate.ts` and `routing-conformance-gate.ts` read only
  4096 bytes, so `isJarErrorPage` misclassifies 46 corpus goldens (activity 4, gantt 3, wbs 2, unknown 35, regex 2)
  as jar-rendered. Precedent (add4/T0b, wep b4) pins such rows `known-gap` with the mechanism; rep T3a did the same.
- **Impact**: a gate-tool PR raising `HEAD_BYTES` to 8192 would reclassify all 46 and retire 40 of the 218
  `known-gap` pins; measure with the script in rep's journal row 12 before doing it.
- **Confidence**: High
