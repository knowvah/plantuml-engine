/**
 * The seven wire commands' regexes against every spelling the jar accepts or refuses (planning probes, wrp D4, D5).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/Command*.java
 */
import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { CommandComponent } from '../../../src/diagrams/wire/CommandComponent.js';
import { CommandGoto } from '../../../src/diagrams/wire/CommandGoto.js';
import { CommandMove } from '../../../src/diagrams/wire/CommandMove.js';
import { CommandNewColumn } from '../../../src/diagrams/wire/CommandNewColumn.js';
import { CommandPrint } from '../../../src/diagrams/wire/CommandPrint.js';
import { CommandSpot } from '../../../src/diagrams/wire/CommandSpot.js';
import { CommandWLink } from '../../../src/diagrams/wire/CommandWLink.js';

interface Command {
  isValid(line: StringLocated): CommandControl;
}
const valid = (command: Command, line: string): boolean =>
  command.isValid(new StringLocated(line, undefined)) === CommandControl.OK;

describe('CommandComponent', () => {
  const command = new CommandComponent();
  it.each([
    '* a',
    '*a',
    '  * a',
    '\t* a',
    '* a [10x20]',
    '* a [10*20]',
    '* a [10x20] #red',
    '* a #red',
    '* a_b',
    '* a  ',
  ])('accepts %j', (line) => expect(valid(command, line)).toBe(true));
  it.each(['* a[10x20]', '* é', '* a b', 'a', '* a [10y20]', '* a [x20]'])('refuses %j', (line) =>
    expect(valid(command, line)).toBe(false),
  );
});

describe('Java regex semantics the JS engine widens', () => {
  it('an INDENT of NBSP is not Java \\s (cov-indent-nbsp)', () => {
    expect(valid(new CommandComponent(), '\u00a0\u00a0* a')).toBe(false);
    expect(valid(new CommandGoto(), '\u00a0goto(1,1)')).toBe(false);
    expect(valid(new CommandMove(), '\u00a0move(1,1)')).toBe(false);
    expect(valid(new CommandNewColumn(), '\u00a0--')).toBe(false);
    expect(valid(new CommandPrint(), '\u00a0print("x")')).toBe(false);
  });

  it('U+017F and U+212A do not fold into \\w or a keyword (cov-name-long-s, java CASE_INSENSITIVE)', () => {
    expect(valid(new CommandComponent(), '* \u017f')).toBe(false);
    expect(valid(new CommandComponent(), '* \u212a')).toBe(false);
    expect(valid(new CommandSpot(), '\u017fpot a')).toBe(false);
    expect(valid(new CommandWLink(), 'a -> \u017f')).toBe(false);
  });

  it('a long s after the label colon is label text', () => {
    expect(valid(new CommandWLink(), 'a -> b : \u017f')).toBe(true);
  });
});

describe('CommandGoto', () => {
  const command = new CommandGoto();
  it.each(['goto(1,2)', 'goto ( 1 , 2 )  ', '    goto(1,2)'])('accepts %j', (line) =>
    expect(valid(command, line)).toBe(true),
  );
  it.each(['goto(-1,2)', 'goto(1)', 'goto'])('refuses %j (no sign, cov-goto-negative)', (line) =>
    expect(valid(command, line)).toBe(false),
  );
});

describe('CommandMove', () => {
  const command = new CommandMove();
  it.each(['move(1,2)', 'move(-1,-2)', 'move ( 1 , 2 )'])('accepts %j', (line) =>
    expect(valid(command, line)).toBe(true),
  );
  it('refuses a non-number', () => expect(valid(command, 'move(a,2)')).toBe(false));
});

describe('CommandNewColumn', () => {
  const command = new CommandNewColumn();
  it.each(['-', '--', '----------', '\t---', '-- '])('accepts %j', (line) => expect(valid(command, line)).toBe(true));
  it('refuses a dash with text', () => expect(valid(command, '-- a')).toBe(false));
});

describe('CommandPrint', () => {
  const command = new CommandPrint();
  it.each(['print("x")', 'print ( "x" )', 'print(“x”)', '    print("x")', 'print("x"y")'])('accepts %j', (line) =>
    expect(valid(command, line)).toBe(true),
  );
  it.each(['print(x)', 'print("x"'])('refuses %j', (line) => expect(valid(command, line)).toBe(false));
});

describe('CommandSpot', () => {
  const command = new CommandSpot();
  it.each([
    'spot a',
    'spot a.b',
    'spot a(10,20)',
    'spot a(10%,20%-5)',
    'spot a #red',
    'spot a(1,2) #red',
    'spot a(-1%,-2)',
  ])('accepts %j', (line) => expect(valid(command, line)).toBe(true));
  it.each(['spota', 'spot', ' spot a'])('refuses %j', (line) => expect(valid(command, line)).toBe(false));
});

describe('CommandWLink', () => {
  const command = new CommandWLink();
  it.each([
    'a -> b',
    'a->b',
    'a <-> b',
    'a <- b',
    'a - b',
    'a --> b',
    'a <--> b',
    'a <-- b',
    'a -- b',
    'a => b',
    'a <=> b',
    'a <= b',
    'a = b',
    'a ==> b',
    'a <==> b',
    'a <== b',
    'a == b',
    'a(1,2) -> b',
    'a(100%-5,50%+2) -> b',
    'a -> b #red',
    'a -> b : x',
    'a -> b : ',
    'a.b -> c.d #red : label',
  ])('accepts %j', (line) => expect(valid(command, line)).toBe(true));
  it.each(['a ---> b', 'a', ' a -> b'])('refuses %j (cov-link-bad-style)', (line) =>
    expect(valid(command, line)).toBe(false),
  );
});
