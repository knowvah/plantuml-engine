/**
 * A duplicate `map` or `object` is an error upstream, not a second drawing
 * (maintainer ruling on #152, 2026-11-05, retiring the #143 entries):
 *
 *     // CommandCreateMap.java:206-207, :165-166
 *     if (quark.getData() != null) return null;
 *     ... return CommandExecutionResult.error("Map already exists: " + line0.get("NAME", 1));
 *     // CommandCreateEntityObject.java:121-122
 *     return CommandExecutionResult.error("Object already exists: " + quark.getName());
 *
 * So a map names the id as written, and an object names the quark's short name.
 * `CommandCreateEntityObjectMultilines` and a bare `map m` reuse the entity, so
 * those two forms still draw. Each fixture sits beside its jar render
 * (`scripts/oracle-render.sh`, deterministic text).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { parseRefusalOf } from '../../../src/core/dispatcher.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseClass } from '../../../src/diagrams/class/parser.js';
import { renderSync } from '../../../src/index.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/duplicate-map-object');
const NAMES = readdirSync(FIXTURES)
  .filter((f) => f.endsWith('.puml'))
  .map((f) => f.slice(0, -'.puml'.length));

function refusalOf(source: string): string | undefined {
  const lines = source
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const block: UmlSource = { lines, type: 'class' };
  return parseRefusalOf(parseClass(block))?.message;
}

describe('duplicate map or object: the jar’s message', () => {
  it.each([
    ['map m {\nk => v\n}\nmap m {\nk => v\n}', 'Map already exists: m'],
    ['map n\nmap n {\nk => v\n}', 'Map already exists: n'],
    ['class n\nmap n {\nk => v\n}', 'Map already exists: n'],
    ['map a.b {\nk => v\n}\nmap a.b {\nk => v\n}', 'Map already exists: a.b'],
    ['object foo\nobject foo', 'Object already exists: foo'],
    ['class c\nc --> d\nobject d', 'Object already exists: d'],
    ['map m {\nk => v\n}\nobject m', 'Object already exists: m'],
    ['object a.b\nobject a.b', 'Object already exists: b'],
  ])('%j refuses with %j', (source, message) => {
    expect(refusalOf(source)).toBe(message);
  });

  it.each([
    ['a bare map after a map', 'map m {\nk => v\n}\nmap m'],
    ['a multi-line object after an object', 'object o\nobject o {\nx = 1\n}'],
  ])('%s still draws', (_name, source) => {
    expect(refusalOf(source)).toBeUndefined();
  });
});

/** The fixtures the jar draws; every other one is its error page. */
const DRAWN = new Set(['bare-map-after-map', 'object-multiline-after-object']);
/** An error page's message, and the line it blames (`[From <source> (line N) ]`). */
const ERROR_PAGE_RE = /(?:Map|Object) already exists: [^<]*/;
const BLAMED_LINE_RE = /\(line (\d+)\)/;

function render(name: string): string {
  return renderSync(readFileSync(join(FIXTURES, `${name}.puml`), 'utf8'), { measurer: new DeterministicMeasurer() });
}

describe('duplicate map or object: against the jar’s render', () => {
  const jarOf = (name: string): string => readFileSync(join(FIXTURES, `${name}.svg`), 'utf8');

  it('has a fixture for each form', () => {
    expect(NAMES).toHaveLength(12);
    expect(NAMES).toEqual(expect.arrayContaining([...DRAWN]));
  });

  it.each(NAMES.filter((n) => DRAWN.has(n)))('%s draws with zero differences', (name) => {
    expect(compareSvg(render(name), jarOf(name), 'deterministic').diffs).toEqual([]);
  });

  // The error-page rule (docs/svg-conformance.md): both error is conformant, and
  // the version line and source name differ by design. So: same message, same line.
  it.each(NAMES.filter((n) => !DRAWN.has(n)))('%s errors like the jar, at the same line', (name) => {
    const ours = render(name);
    const jar = jarOf(name);
    expect(ours.match(ERROR_PAGE_RE)?.[0]).toBe(jar.match(ERROR_PAGE_RE)?.[0]);
    expect(ours.match(BLAMED_LINE_RE)?.[1]).toBe(jar.match(BLAMED_LINE_RE)?.[1]);
  });
});
