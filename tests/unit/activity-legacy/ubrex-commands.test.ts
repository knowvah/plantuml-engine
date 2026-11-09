import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { UBrexCommandFootboxIgnored } from '../../../src/core/command/UBrexCommandFootboxIgnored.js';
import { UBrexCommandHideShow2 } from '../../../src/core/command/UBrexCommandHideShow2.js';
import { UBrexCommandRankDir } from '../../../src/core/command/UBrexCommandRankDir.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';

const line = (text: string): StringLocated => new StringLocated(text, undefined);

describe('UBrexCommandFootboxIgnored', () => {
  const command = new UBrexCommandFootboxIgnored();

  it('claims hide/show footbox in any case, with optional spaces, and nothing else', () => {
    expect(command.isValid(line('hide footbox'))).toBe(CommandControl.OK);
    expect(command.isValid(line('SHOW footbox'))).toBe(CommandControl.OK);
    expect(command.isValid(line('hide footbox now'))).toBe(CommandControl.NOT_OK);
  });

  it('explains that the line is accepted but ignored', () => {
    expect(command.explain(line('hide footbox'))).toBe(
      "Accepted but ignored: 'footbox' has no effect in this diagram type",
    );
  });
});

describe('UBrexCommandRankDir', () => {
  const command = new UBrexCommandRankDir();

  it('claims both directions and explains the lower-cased choice', () => {
    expect(command.isValid(line('left to right direction'))).toBe(CommandControl.OK);
    expect(command.isValid(line('top to bottom direction'))).toBe(CommandControl.OK);
    expect(command.isValid(line('right to left direction'))).toBe(CommandControl.NOT_OK);
    expect(command.explain(line('Left To Right direction'))).toBe(
      'Setting the layout direction of the diagram to left to right',
    );
  });
});

describe('UBrexCommandHideShow2', () => {
  const command = new UBrexCommandHideShow2();

  it('explains a stereotype and a name', () => {
    expect(command.explain(line('hide <<foo>>'))).toBe('Hiding the elements stereotyped <<foo>>');
    expect(command.explain(line('show bar'))).toBe("Showing the elements matching 'bar'");
  });

  it('notes that the -class suffix has no effect of its own', () => {
    expect(command.explain(line('hide-class bar'))).toBe(
      "Hiding the elements matching 'bar' (the '-class' suffix has no specific effect)",
    );
  });

  it('does not claim a bare keyword', () => {
    expect(command.isValid(line('hide'))).toBe(CommandControl.NOT_OK);
  });
});
