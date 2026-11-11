/**
 * `CommandFootboxIgnored`: `hide footbox` / `show footbox` / `footbox`, accepted and ignored.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandFootboxIgnored.java:46-73
 */
import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../../src/core/command/CommandControl.js';
import { CommandFootboxIgnored } from '../../../../src/core/command/CommandFootboxIgnored.js';
import { ParserPass } from '../../../../src/core/command/ParserPass.js';
import { StringLocated } from '../../../../src/core/tim/StringLocated.js';

const line = (s: string): StringLocated => new StringLocated(s, undefined);

describe('CommandFootboxIgnored', () => {
  it.each(['hide footbox', 'show footbox', 'footbox', '  hide   footbox  ', 'hidefootbox', 'HIDE FOOTBOX'])(
    'accepts %j',
    (text) => {
      expect(new CommandFootboxIgnored().isValid(line(text))).toBe(CommandControl.OK);
    },
  );

  it.each(['hide footboxes', 'hide', 'hide footbox now', 'remove footbox', ''])('rejects %j', (text) => {
    expect(new CommandFootboxIgnored().isValid(line(text))).toBe(CommandControl.NOT_OK);
  });

  it('executes to ok() and leaves the diagram untouched', () => {
    const diagram = { touched: false };
    const result = new CommandFootboxIgnored<typeof diagram>().execute(diagram, line('hide footbox'), ParserPass.ONE);
    expect([result.isOk(), diagram.touched]).toEqual([true, false]);
  });

  it('is eligible for pass ONE only', () => {
    const command = new CommandFootboxIgnored();
    expect([command.isEligibleFor(ParserPass.ONE), command.isEligibleFor(ParserPass.TWO)]).toEqual([true, false]);
  });
});
