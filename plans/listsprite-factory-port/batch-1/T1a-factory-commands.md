# T1a: the factory, its commands and the diagram

**Writes:** `src/core/klimt/sprite/{CommandListSprite,ListSpriteDiagram,ListSpriteDiagramFactory,listsprite-common-commands,listsprite-skin-param}.ts`,
`tests/unit/core/klimt/sprite/{CommandListSprite,ListSpriteDiagramFactory}.test.ts`.

**Read:**
- `klimt/sprite/ListSpriteDiagramFactory.java:46-68`, `CommandListSprite.java:44-73`, `ListSpriteDiagram.java:57-66`;
- `command/CommonCommands.java:55-127`, `command/PSystemCommandFactory.java:106-247`;
- `src/diagrams/regex/{PSystemRegexFactory,regex-common-commands,regex-skin-param,PSystemRegex}.ts` (the precedent,
  D1) and `src/diagrams/help/{HelpFactory,Help}.ts` (a `HELP`-typed `TitledDiagram`);
- `decisions.md` D1, D2, D6, D8.

**Do:**
1. `CommandListSprite`: a `SingleLineCommand2` on `^listsprites?$`, case-insensitive as `RegexConcat` compiles it,
   whose `executeArg` returns `ok()`. Test `listsprite`, `listsprites`, `ListSprites` (claimed) and `listsprite please`,
   `listspritesx`, `  listsprite` (trimmed or not, as the base class trims; quote it).
2. `listsprite-common-commands.ts`: copy `regex-common-commands.ts` with the diagram type substituted. It already
   folds `addCommonCommands2` and the scale commands in, which is all `ListSpriteDiagramFactory.java:54-55` adds.
3. `listsprite-skin-param.ts`: copy `regex-skin-param.ts`, cut to what `ListSpriteDiagram` and the export read
   (sprites, colours, style builder, handwritten, monochrome).
4. `ListSpriteDiagram extends TitledDiagram`, constructed with type `'HELP'` (`ListSpriteDiagram.java:60`), with
   `getDescription()` `(Sprites)`, `getSkinParam()` and the `sprites` getter the sprite commands need. No page yet.
5. `ListSpriteDiagramFactory.ts#parseListSprite(source, options)`: the regex factory's `executeCommands` loop over
   `[commonCommands1, CommandListSprite]`, the empty test left to the dispatcher (as help's), and a refusal of
   `Syntax Error?` on an unclaimed line with upstream's `consumed` index.

## Acceptance
- Given `cov-sprites-startsprites-mono`'s source, when parsed, then the diagram's registry holds `foo1` at 15×10.
- Given `cov-sprites-err-garbage`, then the parse refuses with `Syntax Error?` on `this is not a command`, the jar's
  `line 14`.
- Given `cov-sprites-err-listsprite-arg`, then the parse refuses on `listsprite please`, the jar's `line 14`.
- Given `cov-sprites-chrome`, then the title, caption, header, footer and legend are set on the diagram.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
