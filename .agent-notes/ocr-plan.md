## Observation: state and description report a multi-line json refusal on the opener line
- **Context**: planning #190 (object-colour-refusal); probing `JSON already exists` beside the colour rows.
- **Finding**: the jar reports a multi-line command's EXECUTION_ERROR on the block's last line (`PSystemCommandFactory.java:218-225`). Class defers it (`pendingBodyRefusal`); state (`state-json-commands.ts:139`) and description (`description/parser.ts:350`) report the opener: line 3 vs the jar's 5.
- **Impact**: any multi-line refusal probe in state/description reads the wrong line until ocr T3 lands.
- **Confidence**: High

## Observation: `#transparent` / `#background` declaration colours fill `#000`
- **Context**: ocr control probes.
- **Finding**: `object O #transparent`, `object O #background` and `class C #transparent` draw `fill="#000"`; the jar draws `none` (`HColorSet.java:82-83`). Not object-specific.
- **Impact**: a transparent-colour control row is not at 0 until this is fixed; ocr exit files it.
- **Confidence**: High
