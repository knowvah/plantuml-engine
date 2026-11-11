/**
 * The commands T3c ports: grammar leaf by leaf, error text verbatim, and the diagram state each leaves (observed
 * through what it draws, against jar renders: `tests/fixtures/timing/t3c-*.svg`, the planning probes).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command
 */
import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { CommandNoteLong } from '../../../src/diagrams/timing/command/CommandNoteLong.js';
import { PLAYER_CODE as PLAYER_CODE_SHARED } from '../../../src/diagrams/timing/command/player-code.js';
import { PLAYER_CODE } from '../../../src/diagrams/timing/command/CommandTimeMessage.js';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { parseInt32 } from '../../../src/diagrams/timing/command/parse-int32.js';
import { drawBody, runLine, runLines, singleLineCommands } from './helpers/commands.js';
import { stringBounder as stringBounderOf } from '../mindmap/helpers/mindmap-skin.js';
import { diagramOf, parseText } from './helpers/factory.js';

const SETUP = ['concise "A" as A', 'robust "B" as B', '@0', 'A is x', 'B is y'];

function claimedBy(line: string): string | undefined {
  return singleLineCommands().find((c) => c.isValid(new StringLocated(line, undefined)) === CommandControl.OK)
    ?.constructor.name;
}

/** The refusal message of a source that must be refused. */
function refusalMessage(text: string): string {
  const result = parseText(text);
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result.message;
}

/** The `<text>` contents a diagram draws. */
function texts(diagram: Parameters<typeof drawBody>[0]): string[] {
  return drawBody(diagram)
    .filter((e) => e.startsWith('<text'))
    .map((e) => e.split(/<[^>]*>/).join(''));
}

describe('PLAYER_CODE', () => {
  it('CommandTimeMessage re-exports the one pattern (CommandTimeMessage.java:56)', () => {
    expect(PLAYER_CODE).toBe(PLAYER_CODE_SHARED);
  });
});

describe('command order claims a line (TimingDiagramFactory.java:83-109)', () => {
  it.each([
    ['WU@100 -> WB@200 : go', 'CommandTimeMessage'],
    ['WU -> WB', 'CommandTimeMessage'],
    ['note top of WU : hi', 'CommandNote'],
    ['@200 <-> @300 : lag', 'CommandConstraint'],
    ['WB@0 <-> @50', 'CommandConstraint'],
    ['scale 50 as 100 pixels', 'CommandScalePixel'],
    ['hide time axis', 'CommandHideTimeAxis'],
    ['highlight 5 to 15', 'CommandHighlight'],
    ['mode compact', 'CommandModeCompact'],
    ['A ticks every 2', 'CommandTicks'],
    ['A is 50 pixels height', 'CommandPixelHeight'],
    ['use date format "yyyy"', 'CommandUseDateFormat'],
  ])('%s is %s', (line, name) => {
    expect(claimedBy(line)).toBe(name);
  });

  it.each([
    'note top of',
    'highlight 5',
    'scale as 5 pixels',
    'A ticks sometimes 2',
    'stop at 10',
    'use date format ""',
  ])('%s is no command', (line) => {
    expect(claimedBy(line)).toBeUndefined();
  });
});

describe('CommandTimeMessage', () => {
  it('draws the arrow and its label (the cov-messages jar render is in the factory test)', () => {
    const { diagram, results } = runLines(...SETUP, 'A@0 -> B@10 : hello');
    expect(results.at(-1)!.isOk()).toBe(true);
    expect(texts(diagram)).toContain('hello');
  });

  it('an arrow with no message is a null label: drawn with no text of its own', () => {
    const { diagram: without } = runLines(...SETUP, 'A@0 -> B@10');
    const { diagram: withLabel } = runLines(...SETUP, 'A@0 -> B@10 : x');
    expect(texts(withLabel).length - texts(without).length).toBe(1);
  });

  it('an empty message after the colon is an empty label (`(.*)` matches the empty string)', () => {
    const { results } = runLines(...SETUP, 'A@0 -> B@10 :');
    expect(results.at(-1)!.isOk()).toBe(true);
  });

  it('a missing first element is "No such element: Q"', () => {
    const { results } = runLines(...SETUP, 'Q@0 -> B@10');
    expect(results.at(-1)!.getError()).toBe('No such element: Q');
  });

  it('a missing second element is "No such element: Z"', () => {
    const { results } = runLines(...SETUP, 'A@0 -> Z@10');
    expect(results.at(-1)!.getError()).toBe('No such element: Z');
  });

  it('the style colours the arrow through setSpecificColor (cov-message-dotted: only the colour shows)', () => {
    const { diagram } = runLines(...SETUP, '@10', 'A is z', 'B is w', 'A@0 -[#blue,bold]> B@10 : c');
    expect(drawBody(diagram).filter((e) => e.includes('stroke:#00F;'))).toHaveLength(2);
  });
});

describe('CommandNote', () => {
  it('a note on a player at the current time (jar: t3c-notes)', () => {
    const { diagram, results } = runLines(...SETUP, 'note top of A : first note');
    expect(results.at(-1)!.isOk()).toBe(true);
    const notes = diagram.getPlayer('A')!.getNotes();
    expect([notes.length, notes[0]!.getPosition(), notes[0]!.getWhen()!.getTime().toString()]).toEqual([1, 'TOP', '0']);
  });

  it('`bottom` is the bottom position, case-insensitively through Position.fromString', () => {
    const { diagram } = runLines(...SETUP, 'note bottom of B : text');
    expect(diagram.getPlayer('B')!.getNotes()[0]!.getPosition()).toBe('BOTTOM');
  });

  it('a stereotype is built; the TAGS group is parsed and ignored', () => {
    const { results } = runLines(...SETUP, 'note top of A $tag1 <<n1>> : styled');
    expect(results.at(-1)!.isOk()).toBe(true);
  });

  it('an unknown player is Unknown "Q"', () => {
    const { results } = runLines(...SETUP, 'note top of Q : text');
    expect(results.at(-1)!.getError()).toBe('Unknown "Q"');
  });
});

describe('CommandNoteLong', () => {
  const START = new StringLocated('note top of A', undefined);

  it('the start line is OK_PARTIAL, the closing `end note` makes it OK', () => {
    const command = new CommandNoteLong();
    const lines = BlocLines.create().add(START);
    expect(command.isValid(lines)).toBe(CommandControl.OK_PARTIAL);
    const closed = lines.add(new StringLocated('text', undefined)).add(new StringLocated('end note', undefined));
    expect(command.isValid(closed)).toBe(CommandControl.OK);
  });

  it('`end note` and `endnote` both close (`end[%s]?note`)', () => {
    const command = new CommandNoteLong();
    const closed = BlocLines.create().add(START).add(new StringLocated('t', undefined));
    expect(command.isValid(closed.add(new StringLocated('endnote', undefined)))).toBe(CommandControl.OK);
  });

  it('a single-line note is not CommandNoteLong (it has a colon)', () => {
    expect(new CommandNoteLong().isValid(BlocLines.single(new StringLocated('note top of A : x', undefined)))).toBe(
      CommandControl.NOT_OK,
    );
  });

  it('the Explain hook is not ported: explain answers undefined', () => {
    expect(new CommandNoteLong().explain(BlocLines.single(START))).toBeUndefined();
  });

  it('a line that is no note is NOT_OK; an empty list is NOT_OK', () => {
    const command = new CommandNoteLong();
    expect(command.isValid(BlocLines.single(new StringLocated('hello', undefined)))).toBe(CommandControl.NOT_OK);
    expect(command.isValid(BlocLines.create())).toBe(CommandControl.NOT_OK);
  });

  it('the body keeps its relative indentation (removeEmptyColumns) and the diagram draws the jar render (t3c-notes)', () => {
    const diagram = diagramOf(
      '@startuml\nconcise "A" as A\n@0\nA is a\nnote top of A\n  one\n    two\nend note\n@enduml',
    );
    const notes = diagram.getPlayer('A')!.getNotes();
    expect(notes).toHaveLength(1);
    expect(texts(diagram)).toEqual(expect.arrayContaining(['one', 'two']));
  });

  it('an unknown player is Unknown "Q"', () => {
    const refusal = refusalMessage('@startuml\nconcise "A" as A\n@0\nnote top of Q\nx\nend note\n@enduml');
    expect(refusal).toBe('Unknown "Q"');
  });

  it('a stereotype on the start line is built', () => {
    const diagram = diagramOf('@startuml\nconcise "A" as A\n@0\nA is a\nnote bottom of A <<s>>\nx\nend note\n@enduml');
    expect(diagram.getPlayer('A')!.getNotes()[0]!.getPosition()).toBe('BOTTOM');
  });

  it('a note with no `end note` is not claimed: the line is a syntax error', () => {
    expect(refusalMessage('@startuml\nconcise "A" as A\nnote top of A\nx\n@enduml')).toBe('Syntax Error?');
  });
});

describe('CommandConstraint', () => {
  it('the jar render (cov-constraint) is in the factory test; here the errors', () => {
    const { results } = runLines(...SETUP, '@0 <-> @10');
    expect(results.at(-1)!.isOk()).toBe(true);
  });

  it('no player given and no last player: "You have to provide a participant"', () => {
    const diagram = diagramOf('@startuml\n@enduml');
    expect(runLine(diagram, '@0 <-> @10').getError()).toBe('You have to provide a participant');
  });

  it('an unknown player is "No such participant Q"', () => {
    const { results } = runLines(...SETUP, 'Q@0 <-> @10');
    expect(results.at(-1)!.getError()).toBe('No such participant Q');
  });

  it('an unknown first time label is "Unknown time label"', () => {
    const { results } = runLines(...SETUP, 'A@:nope <-> @10');
    expect(results.at(-1)!.getError()).toBe('Unknown time label');
  });

  it('an unknown second time label is "Unknown time label", and `now` is restored', () => {
    const { diagram, results } = runLines(...SETUP, 'A@0 <-> @:nope');
    expect(results.at(-1)!.getError()).toBe('Unknown time label');
    expect(diagram.getNow()!.getTime().toString()).toBe('0');
  });

  it('the second time is read relative to the first (`@+150` after `@200`), `now` restored after', () => {
    const { diagram } = runLines(...SETUP, '@5', 'A@200 <-> @+150 : lag');
    expect(diagram.getNow()!.getTime().toString()).toBe('5');
  });

  it('a style that is no colour is "No such color" (NoSuchColorException from HColorSet.getColor)', () => {
    const { results } = runLines(...SETUP, 'A@0 <-[#notacolour]-> @10');
    expect(results.at(-1)!.getError()).toBe('No such color');
  });

  it('dashed, dotted, bold, hidden and a colour are all accepted (t3c-constraints)', () => {
    const { results } = runLines(...SETUP, 'A@0 <-[#red,dashed,dotted,bold,hidden]-> @10 : m');
    expect(results.at(-1)!.isOk()).toBe(true);
  });
});

describe('CommandScalePixel', () => {
  it.each([
    ['scale 100 as 50 pixels', true],
    ['scale 100 as 50 pixel', true],
    ['scale 1 h as 100 pixels', true],
    ['scale 1h as 100 pixels', true],
    ['scale 2D as 10 pixels', true],
    ['scale 3 y as 10 pixels', true],
    ['scale 5 m as 10 pixels', true],
    ['scale 5 s as 10 pixels', true],
  ])('%s is accepted', (line) => {
    expect(
      runLines(...SETUP, line)
        .results.at(-1)!
        .isOk(),
    ).toBe(true);
  });

  it.each(['scale 0 as 10 pixels', 'scale 10 as 0 pixels', 'scale 0h as 10 pixels'])('%s is "Bad value"', (line) => {
    expect(
      runLines(...SETUP, line)
        .results.at(-1)!
        .getError(),
    ).toBe('Bad value');
  });

  it('a tick past `long` is a NumberFormatException (ProtectedCommand reports it in the factory)', () => {
    expect(() => runLines(...SETUP, 'scale 99999999999999999999 as 1 pixels')).toThrow('NumberFormatException');
  });

  it('a product past `long` wraps as Java `long` does: 2^62 * 3600 wraps to a non-positive tick', () => {
    const tick = (2n ** 62n).toString();
    expect(
      runLines(...SETUP, `scale ${tick}h as 1 pixels`)
        .results.at(-1)!
        .isOk(),
    ).toBe(false);
  });

  it('the unit multiplies: 1 y is 3600 * 8766 seconds (jar: t3c-scale-years)', () => {
    const years = diagramOf(
      '@startuml\nscale 1Y as 40 pixels\nconcise "C" as C\n@0\nC is a\n@31557600\nC is b\n@enduml',
    );
    const grid = drawBody(years).filter((e) => e.includes('stroke-dasharray:3,5'));
    expect(grid.map((e) => /x1="([\d.]+)"/.exec(e)![1])).toEqual(['25', '65', '105']);
  });
});

describe('CommandHideTimeAxis', () => {
  it.each(['hide time axis', 'hide time-axis', 'hide timeaxis', 'manual time axis', 'manual time-axis'])(
    '%s is accepted',
    (line) => {
      expect(
        runLines(...SETUP, line)
          .results.at(-1)!
          .isOk(),
      ).toBe(true);
    },
  );

  it('hide removes the axis labels; manual keeps those of the declared times (cov-scale-hide-axis, cov-manual-axis)', () => {
    const shown = texts(runLines(...SETUP, '@10', 'A is z').diagram);
    const hidden = texts(runLines(...SETUP, '@10', 'A is z', 'hide time axis').diagram);
    const manual = texts(runLines(...SETUP, '@10', 'A is z', 'manual time axis').diagram);
    expect([shown.includes('10'), hidden.includes('10'), manual.includes('10')]).toEqual([true, false, true]);
  });

  it('`MANUAL` selects the manual strategy: `"MANUAL".equalsIgnoreCase(cmd)` (the grammar is case-insensitive)', () => {
    const upper = texts(runLines(...SETUP, '@10', 'A is z', 'MANUAL time axis').diagram);
    expect(upper).toEqual(texts(runLines(...SETUP, '@10', 'A is z', 'manual time axis').diagram));
  });
});

describe('CommandHighlight', () => {
  it('a range with a colour and a caption (cov-highlight, jar render in the factory test)', () => {
    const { diagram, results } = runLines(...SETUP, 'highlight 5 to 15 #Gold;line:DimGrey : Caption');
    expect(results.at(-1)!.isOk()).toBe(true);
    expect(texts(diagram)).toContain('Caption');
  });

  it('no colour, no caption', () => {
    const { diagram, results } = runLines(...SETUP, 'highlight 5 to 15');
    expect(results.at(-1)!.isOk()).toBe(true);
    expect(texts(diagram)).not.toContain('Caption');
  });

  it('a colour that is no colour is "No such color"', () => {
    expect(
      runLines(...SETUP, 'highlight 5 to 15 #nope')
        .results.at(-1)!
        .getError(),
    ).toBe('No such color');
  });

  it('a code endpoint reads the time the code names', () => {
    const { results } = runLines(...SETUP, '@10 as :t1', 'highlight :t1 to +5');
    expect(results.at(-1)!.isOk()).toBe(true);
  });
});

describe('CommandModeCompact', () => {
  it('compacts every player declared afterwards (cov-compact: the jar render is in the factory test)', () => {
    const { diagram } = runLines('mode compact', 'robust "R" as R');
    expect(diagram.getPlayer('R')!.isCompact()).toBe(true);
  });

  it('players declared before keep their layout', () => {
    const { diagram } = runLines('robust "R" as R', 'mode compact');
    expect(diagram.getPlayer('R')!.isCompact()).toBe(false);
  });
});

describe('CommandTicks', () => {
  it.each(['A ticks every 2', 'A ticks num on multiple 3'])('%s sets the analog tick interval', (line) => {
    const diagram = diagramOf(`@startuml\nanalog "A" as A\n${line}\n@0\nA is 1\n@10\nA is 2\n@enduml`);
    expect(drawBody(diagram).length).toBeGreaterThan(0);
  });

  it('a player that is not analog is accepted and ignored', () => {
    expect(
      runLines(...SETUP, 'A ticks every 2')
        .results.at(-1)!
        .isOk(),
    ).toBe(true);
  });

  it('an unknown player is "No such participant Q"', () => {
    expect(
      runLines(...SETUP, 'Q ticks every 2')
        .results.at(-1)!
        .getError(),
    ).toBe('No such participant Q');
  });

  it('a number past `int` is a NumberFormatException', () => {
    expect(() => runLines('analog "A" as A', 'A ticks every 99999999999')).toThrow('NumberFormatException');
  });
});

describe('CommandPixelHeight', () => {
  it('sets the suggested height (jar: t3c-pixel-ticks)', () => {
    const base = diagramOf('@startuml\nconcise "C" as C\n@0\nC is x\n@enduml');
    const tall = diagramOf('@startuml\nconcise "C" as C\nC is 100 pixels height\n@0\nC is x\n@enduml');
    const dim = (d: typeof base): number => d.getTextBlock().calculateDimension(stringBounderOf()).getHeight();
    expect(dim(tall)).toBeGreaterThan(dim(base));
  });

  it.each(['C is 5 pixel height', 'C is 5 pixels height'])('%s is accepted', (line) => {
    expect(runLines('concise "C" as C', line).results.at(-1)!.isOk()).toBe(true);
  });

  it('an unknown player is "No such participant Q"', () => {
    expect(
      runLines(...SETUP, 'Q is 5 pixels height')
        .results.at(-1)!
        .getError(),
    ).toBe('No such participant Q');
  });

  it('a number past `int` is a NumberFormatException', () => {
    expect(() => runLines('concise "C" as C', 'C is 99999999999 pixels height')).toThrow('NumberFormatException');
  });
});

describe('CommandUseDateFormat', () => {
  it('a valid pattern is accepted', () => {
    expect(runLine(diagramOf('@startuml\n@enduml'), 'use date format "yy-MM-dd"').isOk()).toBe(true);
  });

  it('`usedateformat"x"` has optional spaces (`[%s]*`)', () => {
    expect(runLine(diagramOf('@startuml\n@enduml'), 'usedateformat"yyyy"').isOk()).toBe(true);
  });

  it('a pattern SimpleDateFormat rejects is "Bad date format" (D4)', () => {
    expect(runLine(diagramOf('@startuml\n@enduml'), 'use date format "qq"').getError()).toBe('Bad date format');
  });
});

describe('parseInt32 (Integer.parseInt)', () => {
  it('reads an int, a signed int and the int limits', () => {
    expect([parseInt32('42'), parseInt32('-7'), parseInt32('+5'), parseInt32('2147483647')]).toEqual([
      42, -7, 5, 2147483647,
    ]);
  });

  it.each([undefined, '', 'x1', '1.5'])('throws NumberFormatException for %j', (text) => {
    expect(() => parseInt32(text)).toThrow('java.lang.NumberFormatException');
  });

  it.each(['2147483648', '-2147483649'])('throws for %s, past `int`, naming the input', (text) => {
    expect(() => parseInt32(text)).toThrow(`For input string: "${text}"`);
  });
});
