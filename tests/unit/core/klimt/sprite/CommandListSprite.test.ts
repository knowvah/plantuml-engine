/**
 * `CommandListSprite`: `listsprites?` alone on the (trimmed) line, case-insensitive; `executeArg` is `ok()`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/CommandListSprite.java:50-73
 */
import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../../../src/core/command/ParserPass.js';
import { CommandListSprite } from '../../../../../src/core/klimt/sprite/CommandListSprite.js';
import type { ListSpriteDiagram } from '../../../../../src/core/klimt/sprite/ListSpriteDiagram.js';
import { StringLocated } from '../../../../../src/core/tim/StringLocated.js';

function control(line: string): CommandControl {
  return new CommandListSprite().isValid(new StringLocated(line, undefined));
}

describe('CommandListSprite', () => {
  it.each(['listsprite', 'listsprites', 'ListSprites', 'LISTSPRITE', '  listsprite', 'listsprite\t'])(
    'claims %j (RegexConcat is case-insensitive; doTrim = true, SingleLineCommand2.java:56-58)',
    (line) => {
      expect(control(line)).toBe(CommandControl.OK);
    },
  );

  it.each(['listsprite please', 'listspritesx', 'listsprit', 'list sprite', 'xlistsprite'])(
    'declines %j (RegexLeaf.start/end, CommandListSprite.java:58-60)',
    (line) => {
      expect(control(line)).toBe(CommandControl.NOT_OK);
    },
  );

  it('executes as ok() and leaves the diagram untouched (java:69-72)', () => {
    const diagram = {} as ListSpriteDiagram;
    const result = new CommandListSprite().execute(diagram, new StringLocated('listsprite', undefined), ParserPass.ONE);
    expect(result.isOk()).toBe(true);
    expect(Object.keys(diagram)).toEqual([]);
  });
});
