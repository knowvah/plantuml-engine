# T2c — link labels

Commit: `fix(state): split link labels through getWithNewlines`.

## Context
`CommandLinkStateCommon.java:189`: `Display.getWithNewlines(diagram.getPragma(), LABEL)`. Ours keeps the `\n` literal (`ruruce-78`, `tocitu-93`), and
`tests/unit/core/tim/unwind-u3-jar-fixtures.test.ts:106` and `tests/unit/core/klimt/creole/unwind2-s3-tab-stops.test.ts` hold `it.fails` entries on that defect: move them up when they turn.
Then `skinparam stateMessageAlignment`, `defaultTextAlignment`, `maxMessageSize` (`lurage-50`, width 518 against 285). `susena-02` (`test -> a : +OK`) draws `OK` with a visibility mark: that
is `LinkArg.build(label, length, diagram.getSkinParam().classAttributeIconSize() > 0)`, `CommandLinkStateCommon.java:202`. `CommandLinkState*`'s `shouldUseNodeStyle` branch (`:192-198`) is worth a read.

## Read
`core/klimt/creole/DisplayNewlines.ts`; `state-composite-edge-label.ts`; `abel/LinkArg.java#build`; `SvekEdge` label construction.

## Acceptance
- Given `ruruce-78-feno407` and `tocitu-93-sidu557`, when rendered, then each is conformant.
- Given `lurage-50-kobo763`, then `svg/@width` equals 285.
- Given the two `it.fails` entries, then state's are plain `it`.

Observability: N/A — no new observable operations. Rollback: Reversible.
