## Observation: a multi-line block's LineLocation is its first BODY line
- **Context**: porting upstream 0862a60af19 (plantuml#2935), `data-source-line` on teoz participant groups.
- **Finding**: `FactorySequenceNoteCommand#executeNow` (`:154-160`), `FactorySequenceNoteOverSeveralCommand` (`:235-238`) and `CommandParticipantMultilines` (`:147-156`) call `lines.subExtract(1, 1)` BEFORE `lines.getLocation()`, so a participant they create is located at the block's second raw line (blank lines count, `PSystemCommandFactory#isMultilineCommandOk` keeps them), and at NO line (`getLocation()` is null, no `data-source-line`) when the body is empty. `CommandReferenceMultilinesOverSeveral` reads `lines.getLocation()` before the extract: first line. Jar-verified (`tests/unit/sequence/teoz-groups.test.ts`, MULTI_LINE).
- **Impact**: any future port that stamps a location from a multi-line command must check the order of `subExtract` and `getLocation` in that command; the port exposes `ParseState.nextRawLine` and `blockBodyLocation` for it.
- **Confidence**: High

## Observation: named-output oracles with newpage were not re-captured by the 1.2026.11beta1 re-pin
- **Context**: survey after the re-pin (8f3997d3a).
- **Finding**: `test-results/dot-cache/sequence/xobebi-29-jilu859/in.svg` (`@startuml file4` + `newpage`) still holds the old jar's output (last changed fe7a1c13f); the current jar writes `file4.svg`/`file4_001.svg` and emits the #2935 groups. The port matches a fresh render.
- **Impact**: a capture script keyed on `in.svg` misses diagrams that name their output; check other `@startuml <name>` fixtures before trusting their oracle.
- **Confidence**: High
