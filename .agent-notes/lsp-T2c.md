# lsp T2c observations

## Observation: CommandSpriteBase64 reaches only two engines
- **Context**: `cov-sprites-base64` (`sprite $b64 data:image/png;base64,...`) drew "Syntax Error?" under
  `@startsprites`; the ListSprite common commands were copied from regex's.
- **Finding**: upstream registers `CommandSpriteBase64` in `CommonCommands#addCommonCommands2`
  (`command/CommonCommands.java:79`), so every factory that calls `addCommonCommands1/2` accepts it. In the port
  only `sequence/parser.ts` and (since lsp T2c1) `klimt/sprite/listsprite-common-commands.ts` call
  `matchSpriteBase64Command`. The 22 other dispatchers that call `matchSpriteCommand` do not (wire, activity,
  board, chart, ebnf, state, regex, activity-legacy, nwdiag, gantt, timing, salt, description, wbs, class, files,
  mindmap, cheneer, packetdiag, chronology, ...). A base64 sprite line refuses there; the jar accepts it.
- **Impact**: a cross-engine parity gap for a follow-on (simplest fix: call `matchSpriteBase64Command` beside
  `matchSpriteCommand`, or fold it into `matchSpriteCommand` itself, now that it lives in `src/core/`).
  lsp T2c1 moved the matcher from `src/diagrams/sequence/command-sprite.ts` to `src/core/sprite-command-base64.ts`.
- **Confidence**: High (grep of every `matchSpriteCommand(` call site, 2026-11-12).

## Observation: the base64 matcher swallows an undecodable payload
- **Context**: reading `sprite-command-base64.ts` while moving it.
- **Finding**: upstream answers `CommandExecutionResult.error("Cannot decode Base64 PNG sprite.")`
  (`CommandSpriteBase64.java:90`), an error page; the port consumes the line and shelves the name.
- **Impact**: a parity gap on a malformed payload only; no fixture covers it.
- **Confidence**: High (Java read; port comment states the choice).
