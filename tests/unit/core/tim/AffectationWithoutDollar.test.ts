/**
 * `!name = value`, without '$' (plantuml/plantuml#3032, the fix proposed in
 * upstream 908fb9df265): the legacy assignment it was before Python when the
 * diagram has no other Python and uses the name in its text, a Python
 * assignment otherwise (`TContext.java:473` `legacyLines`, `:497`
 * `isPythonDiagram`, `:514` `isInText`).
 *
 * The first block ports upstream's `AffectationWithoutDollarTest.java`; the
 * `py-legacy-3032` fixtures are its `vega/python/legacy/assignment_without_
 * dollar_*` files (front matter stripped), each `.svg` rendered by the fixed
 * oracle jar with `-DPLANTUML_DETERMINISTIC_TEXT=true`.
 *
 * This port has no Python preprocessor (#214): a line the rule routes to
 * Python still runs through the legacy preprocessor, without the warning. So
 * where upstream's expectation needs the Python interpreter, only the routing
 * (the warning) is asserted.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { preprocess, preprocessOrError } from '../../../../src/core/preprocessor.js';
import { renderSync } from '../../../../src/index.js';
import { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';
import { FunctionsSet } from '../../../../src/core/tim/FunctionsSet.js';
import { readLines } from '../../../../src/core/tim/ReadLineReader.js';
import { containsWord, TContextPython } from '../../../../src/core/tim/TContextPython.js';
import { TFunctionType } from '../../../../src/core/tim/TFunctionType.js';
import { compareSvg } from '../../../oracle/svg-conformance/compare.js';

const DIR = new URL('../../../fixtures/py-legacy-3032/', import.meta.url);
const read = (name: string): string => readFileSync(new URL(name, DIR), 'utf8');

const deprecated = (name: string): string =>
  `This diagram is using the variable '${name}' declared without '$', which is deprecated and will be removed in the future.`;

const block = (...lines: string[]): string => ['@startuml', ...lines, '@enduml'].join('\n');

/** The preprocessed lines, between @startuml and @enduml, blank lines left out. */
function preprocessed(source: string): string[] {
  return preprocess(source).lines.filter((l) => l.trim().length > 0 && !l.startsWith('@'));
}

function warnings(source: string): string[] {
  return (preprocess(source).warnings ?? []).map((w) => w.message[0]!);
}

describe('AffectationWithoutDollarTest.java (#3032)', () => {
  it('without Python it is the legacy assignment, with the warning', () => {
    const source = block(
      '!t="this is t1\\nthis is t2"',
      'start',
      'repeat',
      ':read data;',
      'repeat while (x) is (t)',
      'stop',
    );
    expect(preprocessed(source)).toEqual([
      'start',
      'repeat',
      ':read data;',
      'repeat while (x) is (this is t1\\nthis is t2)',
      'stop',
    ]);
    expect(warnings(source)).toEqual([deprecated('t')]);
  });

  it('a name after \\n is in the text', () => {
    // as the legacy preprocessor reads it: "\\nt" is a new line, then "t"
    const source = block('!t = "x"', 'Alice -> Bob : a\\nt');
    expect(preprocessed(source)).toEqual(['Alice -> Bob : a\\nx']);
    expect(warnings(source)).toEqual([deprecated('t')]);
  });

  it('beside Python it is Python: no warning (the Python output itself is #214)', () => {
    // upstream: "[Alice -> Bob : t, title 4]"
    const source = block('!def twice(n):', '!    return 2 * n', 'Alice -> Bob : t', '!t = "x"', 'title !{t}');
    expect(warnings(source)).toEqual([]);
  });

  it('with an interpolation it is Python: no warning (the Python output itself is #214)', () => {
    // upstream: "[Alice -> Bob : t 42]"
    expect(warnings(block('!t = 42', 'Alice -> Bob : t !{t}'))).toEqual([]);
  });

  it('a name that is not in the text is Python', () => {
    // both readings give the same diagram: the line stays Python, without a warning
    const source = block('!t = 1', 'Alice -> Bob : t1 AMS_t t_2');
    expect(preprocessed(source)).toEqual(['Alice -> Bob : t1 AMS_t t_2']);
    expect(warnings(source)).toEqual([]);
  });

  it('a legacy call stays a legacy call', () => {
    expect(preprocessed(block('!procedure decl($n)', 'participant $n', '!endprocedure', '!decl(B)'))).toEqual([
      '!participant B',
    ]);
  });

  it('a legacy call beside the assignment is a legacy call', () => {
    const source = block('!procedure decl($n)', 'participant $n', '!endprocedure', '!t = "A"', '!decl(t)');
    // the "!" stays in front of the line the procedure gives, as before Python
    expect(preprocessed(source)).toEqual(['!participant A']);
    expect(warnings(source)).toEqual([deprecated('t')]);
  });
});

describe('the routing, case by case (fixed jar, scripts/oracle-render.sh flags)', () => {
  it('a run of assignments is one chunk: a name in the text keeps every line of it legacy', () => {
    expect(warnings(block('!a = "x"', '!b = "y"', 'A -> B : a'))).toEqual([deprecated('a'), deprecated('b')]);
  });

  it('a blank line ends the chunk: the second assignment, in no text, stays Python', () => {
    expect(warnings(block('!a = "x"', '', '!b = "y"', 'A -> B : a'))).toEqual([deprecated('a')]);
  });

  it('a text line of a procedure declared in the diagram is a text line of the diagram', () => {
    const source = block('!procedure p()', 'A -> B : t', '!endprocedure', '!t = "x"', 'A -> B : u');
    expect(preprocessed(source)).toEqual(['A -> B : u']);
    expect(warnings(source)).toEqual([deprecated('t')]);
  });

  it('an assignment in a procedure body runs legacy when the procedure runs', () => {
    const source = block('!procedure p()', '!t = "x"', 'A -> B : t', '!endprocedure', 'p()');
    expect(preprocessed(source)).toEqual(['A -> B : x']);
    expect(warnings(source)).toEqual([deprecated('t')]);
  });

  it('a !python block makes the diagram a Python diagram', () => {
    expect(warnings(block('!python', 'x = 1', '!endpy', '!t = "x"', 'A -> B : t'))).toEqual([]);
  });

  it('another Python line makes the diagram a Python diagram', () => {
    expect(warnings(block('!t = "x"', 'A -> B : t', '!foo(1)'))).toEqual([]);
  });

  it('a JSON value of a legacy assignment cannot continue on the next lines', () => {
    const outcome = preprocessOrError(block('!t = {', '"a": 1', '}', 'A -> B : t'));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(String(outcome.failure.cause)).toContain('Error in JSON format');
  });

  it("an inner comment at the chunk's end rebuilds it: the lookup misses and the line stays Python", () => {
    // CodeIteratorInnerComment builds a new StringLocated for the chunk, which pythonSources
    // (an IdentityHashMap) does not know, so legacyLines answers null (TContext.java:474-476).
    expect(warnings(block(`!t = "x" /' c '/`, 'A -> B : t'))).toEqual([]);
  });
});

describe('vega/python/legacy fixtures (#3032)', () => {
  it.each(['assignment_without_dollar_and_legacy_call', 'assignment_without_dollar_stays_legacy'])(
    '%s: preprocessed as the jar',
    (name) => {
      const expected = read(`${name}.preproc`)
        .split('\n')
        .filter((l) => l.trim().length > 0 && !l.startsWith('@'));
      expect(preprocessed(read(`${name}.puml`))).toEqual(expected);
    },
  );

  it.each(['assignment_without_dollar_warning', 'assignment_without_dollar_stays_legacy'])(
    '%s: draws the jar SVG, warning banner included',
    (name) => {
      const ours = renderSync(read(`${name}.puml`), { measurer: new DeterministicMeasurer() });
      expect(compareSvg(ours, read(`${name}.svg`), 'deterministic').diffs).toEqual([]);
    },
  );

  it('assignment_without_dollar_beside_python: the assignment is routed to Python (running it is #214)', () => {
    // The legacy preprocessor cannot evaluate `twice(2)`, so the routing is read off TContextPython.
    const body = readLines(read('assignment_without_dollar_beside_python.puml'));
    const python = new TContextPython(new FunctionsSet());
    python.collapsePython(body, undefined);
    const assignment = body.find((l) => l.getString() === '!t = twice(2)')!;
    expect(python.legacyLineOf(assignment)).toBeUndefined();
  });
});

describe('TContextPython (TContext.java:473-560 at 908fb9df265)', () => {
  const routed = (...lines: string[]): (string | undefined)[] => {
    const body = readLines(block(...lines));
    const python = new TContextPython(new FunctionsSet());
    python.collapsePython(body, undefined);
    return body.filter((l) => l.getString().startsWith('!')).map((l) => python.legacyLineOf(l)?.getString());
  };

  it('answers the chunk line itself for a legacy chunk, undefined for a Python one', () => {
    expect(routed('!t = "x"', 'A -> B : t')).toEqual(['!t = "x"']);
    expect(routed('!t = "x"', 'A -> B : u')).toEqual([undefined]);
  });

  it('does not collapse a function body a second time', () => {
    const body = readLines(block('!u = 1', 'A -> B : x'));
    const python = new TContextPython(new FunctionsSet());
    python.collapsePython(body, TFunctionType.PROCEDURE);
    expect(python.legacyLineOf(body.find((l) => l.getString() === '!u = 1')!)).toBeUndefined();
  });

  it.each([
    ['is (t)', true],
    ['a\\nt', true],
    ['t', true],
    ['t1', false],
    ['AMS_t', false],
    ['t_2', false],
    ['xt t', true],
  ])('containsWord(%s, "t") -> %s', (s, expected) => {
    expect(containsWord(s, 't')).toBe(expected);
  });
});
