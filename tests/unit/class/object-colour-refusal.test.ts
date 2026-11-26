/**
 * `object` and `json` refuse a colour capture that is not a bare colour (issue #190).
 *
 * Four upstream commands hand the whole `ColorParser.exp1()` capture to the throwing `HColorSet#getColor`:
 *
 *     // CommandCreateEntityObject.java:145-147 (also CommandCreateEntityObjectMultilines.java:178-180,
 *     // CommandCreateJson.java:223-225, CommandCreateJsonSingleLine.java:183-185)
 *     final String s = arg.get("COLOR", 0);
 *     entity.setSpecificColorTOBEREMOVED(ColorType.BACK,
 *             s == null ? null : diagram.getSkinParam().getIHtmlColorSet().getColor(s));
 *
 * `getColor` finds no colour in `line:red` and throws (`klimt/color/HColorSet.java:69-76`), which
 * `SingleLineCommand2.java:176-179` / `CommandMultilines2.java:119-122` turn into `badColor()`: `No such color`, score
 * 10 (`command/CommandExecutionResult.java:85-86`). A multi-line block reports it on its last line
 * (`command/PSystemCommandFactory.java:218-225`).
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { CommandExecutionResult } from '../../../src/core/command/CommandExecutionResult.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { parseClass } from '../../../src/diagrams/class/parser.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import { parseState } from '../../../src/diagrams/state/parser.js';
import type { Classifier } from '../../../src/diagrams/class/ast.js';

const BAD_COLOR = CommandExecutionResult.badColor();
const NO_SUCH_COLOR = BAD_COLOR.getError();
const BAD_COLOR_SCORE = BAD_COLOR.getScore();

/** `source` as a block whose line `i` sits at document position `i` (`UmlSource.linePositions`). */
function block(source: string, type: UmlSource['type']): UmlSource {
  const lines = source.split('\n');
  return { lines, type, linePositions: lines.map((_, i) => i) };
}

function refusalOf(result: object): Pick<ParseRefusal, 'kind' | 'line' | 'message' | 'commandScore'> | undefined {
  if (!('refused' in result)) return undefined;
  const { kind, line, message, commandScore } = result as ParseRefusal;
  return { kind, line, message, commandScore };
}

const noSuchColorAt = (line: number) => ({
  kind: 'execution',
  line,
  message: NO_SUCH_COLOR,
  commandScore: BAD_COLOR_SCORE,
});

describe('object refuses a name:value colour (CommandCreateEntityObject.java:145-147)', () => {
  it.each(['#line:zzblue', '#line:red', '#back:red', '#text:red', '#pink;line:blue', '#line.dashed'])(
    '`object O %s` is No such color on its own line',
    (color) => {
      expect(refusalOf(parseClass(block(`object O ${color}`, 'class')))).toEqual(noSuchColorAt(0));
    },
  );

  it('the duplicate check runs first (CommandCreateEntityObject.java:126-127 before :145-147)', () => {
    expect(refusalOf(parseClass(block('object O\nobject O #line:red', 'class')))).toEqual({
      kind: 'execution',
      line: 1,
      message: 'Object already exists: O',
      commandScore: 0,
    });
  });

  it('the multi-line form refuses on its closing line (CommandCreateEntityObjectMultilines.java:178-180)', () => {
    expect(refusalOf(parseClass(block('object O #line:red {\nx = 1\n}', 'class')))).toEqual(noSuchColorAt(2));
  });

  it('a bare colour still draws, and keeps its stored colour', () => {
    const ast = parseClass(block('object O #red', 'class'));
    expect(refusalOf(ast)).toBeUndefined();
    expect((ast as { classifiers: Classifier[] }).classifiers.map((c) => c.color)).toEqual(['#red']);
  });

  it('an unknown bare colour still draws (the 2026-11-04 neutral ruling)', () => {
    expect(refusalOf(parseClass(block('object O #zzblue', 'class')))).toBeUndefined();
  });
});

describe('json refuses a name:value colour (CommandCreateJson.java:223-225, CommandCreateJsonSingleLine.java:183-185)', () => {
  it('class, single line: on its own line', () => {
    expect(refusalOf(parseClass(block('json J #line:red {"a": 1}', 'class')))).toEqual(noSuchColorAt(0));
  });

  it('class, multi-line: on the closing line', () => {
    expect(refusalOf(parseClass(block('json J #line:red {\n"a": 1\n}', 'class')))).toEqual(noSuchColorAt(2));
  });

  it('class, multi-line: a refused body closes where the JSON completes (CommandCreateJson.java:155-162)', () => {
    const source = 'json J #line:red {\n"a": {\n"b": 1\n}\n}';
    expect(refusalOf(parseClass(block(source, 'class')))).toEqual(noSuchColorAt(4));
  });

  it('class, multi-line: a duplicate body closes where the JSON completes too', () => {
    const source = 'json J {\n"a": 1\n}\njson J {\n"a": {\n"b": 1\n}\n}';
    expect(refusalOf(parseClass(block(source, 'class')))).toEqual({
      kind: 'execution',
      line: 7,
      message: 'JSON already exists: J',
      commandScore: 0,
    });
  });

  it('a refused object body still closes on its first `}` (no JSON there)', () => {
    expect(refusalOf(parseClass(block('object O #line:red {\nx = 1\n}\nobject P', 'class')))).toEqual(noSuchColorAt(2));
  });

  it('the colour throws before the data is read (CommandCreateJsonSingleLine.java:138-145)', () => {
    expect(refusalOf(parseClass(block('json J #line:red {"a": }', 'class')))).toEqual(noSuchColorAt(0));
  });

  it('state, single line', () => {
    expect(refusalOf(parseState(block('state S\njson J #line:red {"a": 1}', 'state')))).toEqual(noSuchColorAt(1));
  });

  it('description, single line', () => {
    const result = parseDescription(block('component C\njson J #line:red {"a": 1}', 'description'));
    expect(refusalOf(result)).toEqual(noSuchColorAt(1));
  });

  it('description: a bare colour with data that does not parse is still Bad data (:150-151)', () => {
    const result = parseDescription(block('component C\njson J #red {"a": }', 'description'));
    expect(refusalOf(result)).toEqual({ kind: 'execution', line: 1, message: 'Bad data', commandScore: 0 });
  });

  it('a bare colour still draws, and keeps its stored colour', () => {
    const ast = parseClass(block('json J #red {"a": 1}', 'class'));
    expect(refusalOf(ast)).toBeUndefined();
    expect((ast as { classifiers: Classifier[] }).classifiers.map((c) => c.color)).toEqual(['#red']);
  });
});
