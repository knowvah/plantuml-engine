/**
 * plantuml#2846, upstream `399471171e8`: `CommandPackage`'s single NAME/AS
 * pair became a `RegexOr` of `CODE1 [as DISPLAY1]` and `DISPLAY2 as CODE2`
 * (`CommandPackage.java:91-137`), read through `getLazzy("CODE"/"DISPLAY")`
 * (java:159-160,198-199).
 *
 * The first two blocks port every case of upstream's `CommandPackageTest.java`
 * (regex level, java:69-141; execution level, java:149-238). The jar blocks
 * compare against `tests/fixtures/class-2846/*.svg`, rendered by
 * `scripts/oracle-render.sh` (1.2026.11beta1, a720bdd): upstream's
 * `vega/nonreg/group2846` sources verbatim plus three authored probes.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COMMAND_PACKAGE_RE, commandPackageRaw } from '../../../src/diagrams/class/class-command-package.js';
import { parseClass } from './parse-helper.js';
import { parseClass as parseClassRaw } from '../../../src/diagrams/class/parser.js';
import { parseRefusalOf } from '../../../src/core/dispatcher.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const DIR = new URL('../../fixtures/class-2846/', import.meta.url);

/** `CommandPackageTest#getRegex().matcher(line)`: the match, or null. */
function matcher(line: string): RegExpExecArray | null {
  return COMMAND_PACKAGE_RE.exec(line);
}

/** The `getLazzy("CODE", 0)` / `getLazzy("DISPLAY", 0)` pair of a line that must match. */
function lazzy(line: string): { code: string; display: string | undefined } {
  const m = matcher(line);
  expect(m, line).not.toBeNull();
  return commandPackageRaw(m!);
}

/** `command.execute(diagram, line)` then `diagram.getCurrentGroup()`: the group the line opened. */
function currentGroup(line: string) {
  const ast = parseClass({ lines: [line, '}'], type: 'class' });
  expect(ast.namespaces).toHaveLength(1);
  return ast.namespaces[0]!;
}

function render(name: string): string {
  return renderSync(readFileSync(new URL(`${name}.puml`, DIR), 'utf8'), { measurer: new DeterministicMeasurer() });
}

function diffsAgainstJar(name: string): string[] {
  const jar = readFileSync(new URL(`${name}.svg`, DIR), 'utf8');
  return compareSvg(render(name), jar, 'deterministic').diffs.map((d) => JSON.stringify(d));
}

describe('CommandPackage regex (CommandPackageTest.java:69-141)', () => {
  it('parses CODE as "DISPLAY"', () => {
    expect(lazzy('package uid as "Hello" {')).toEqual({ code: 'uid', display: '"Hello"' });
  });

  it('parses "DISPLAY" as CODE', () => {
    expect(lazzy('package "Hello" as uid {')).toEqual({ code: 'uid', display: '"Hello"' });
  });

  it('parses CODE as "DISPLAY" with visibility and stereotype', () => {
    const m = matcher('+package uid as "Hello" <<Frame>> {')!;
    expect(m).not.toBeNull();
    expect(m[1]).toBe('+');
    expect(commandPackageRaw(m)).toEqual({ code: 'uid', display: '"Hello"' });
    expect(m[7]).toBe('<<Frame>>');
  });

  it('parses "DISPLAY" as CODE with visibility and stereotype', () => {
    const m = matcher('+package "Hello" as uid <<Frame>> {')!;
    expect(m).not.toBeNull();
    expect(m[1]).toBe('+');
    expect(commandPackageRaw(m)).toEqual({ code: 'uid', display: '"Hello"' });
    expect(m[7]).toBe('<<Frame>>');
  });

  it('parses a code with no display', () => {
    expect(lazzy('package uid {')).toEqual({ code: 'uid', display: undefined });
  });

  it('keeps a quoted name with no as as the CODE, quotes included', () => {
    expect(lazzy('package "Hello" {')).toEqual({ code: '"Hello"', display: undefined });
  });

  it('matches the anonymous package with an empty CODE', () => {
    expect(lazzy('package {').code).toBe('');
  });

  it('accepts $ in a bareword code (dollar_sign_code.puml, CommandPackage.java:79-87)', () => {
    expect(lazzy('package a_$a #yellow {').code).toBe('a_$a');
  });

  it('rejects an empty quoted display and a bareword outside [%pLN_.$] (java:87-89)', () => {
    expect(matcher('package "" as p {')).toBeNull();
    expect(matcher('package foo-bar {')).toBeNull();
    expect(matcher('package "Hello" as b-c {')).toBeNull();
    expect(lazzy('package " " as q {')).toEqual({ code: 'q', display: '" "' });
  });
});

describe('CommandPackage execution (CommandPackageTest.java:149-238)', () => {
  it('executes CODE as "DISPLAY"', () => {
    expect(currentGroup('package uid as "Hello" {')).toMatchObject({ id: 'uid', display: 'Hello' });
  });

  it('executes "DISPLAY" as CODE', () => {
    expect(currentGroup('package "Hello" as uid {')).toMatchObject({ id: 'uid', display: 'Hello' });
  });

  it('executes CODE as "DISPLAY" with visibility', () => {
    expect(currentGroup('+package uid as "Hello" {')).toMatchObject({
      id: 'uid',
      display: 'Hello',
      visibilityModifier: '+',
    });
  });

  it('executes "DISPLAY" as CODE with visibility', () => {
    expect(currentGroup('+package "Hello" as uid {')).toMatchObject({
      id: 'uid',
      display: 'Hello',
      visibilityModifier: '+',
    });
  });

  it('gives both orderings with visibility the same id, display and visibility', () => {
    const a = currentGroup('+package uid as "Hello" {');
    const b = currentGroup('+package "Hello" as uid {');
    expect([a.id, a.display, a.visibilityModifier]).toEqual([b.id, b.display, b.visibilityModifier]);
  });

  it('executes a code with no display', () => {
    expect(currentGroup('package uid {')).toMatchObject({ id: 'uid', display: 'uid' });
  });

  it('refuses the anonymous package at execution: "Error in name" (java:201-202)', () => {
    const refusal = parseRefusalOf(parseClassRaw({ lines: ['package {', 'class A', '}'], type: 'class' }));
    expect(refusal).toMatchObject({ kind: 'execution', message: 'Error in name' });
  });
});

describe('group2846 nonreg against the jar', () => {
  it('draws dollar_sign_code.puml exactly (one package a_$a, not a_ plus a stray a_$a)', () => {
    expect(diffsAgainstJar('dollar_sign_code')).toEqual([]);
  });

  it('draws bug.puml and correct_code.puml identically (the #2846 regression)', () => {
    expect(render('bug')).toBe(render('correct_code'));
    expect(render('bug')).toContain('data-qualified-name="uid"');
  });
});

describe('lines CommandPackage no longer takes (jar fall-through)', () => {
  it('opens package foo-bar <<Frame>> through CommandPackageWithUSymbol: stereotype displayed, not a shape', () => {
    expect(diffsAgainstJar('dash-bareword-frame')).toEqual([]);
  });

  it('draws an empty package foo-bar as a package leaf (CommandPackageWithUSymbol USymbol)', () => {
    expect(diffsAgainstJar('dash-bareword-empty')).toEqual([]);
  });

  it('draws package uid as "Hello" #pink like the jar', () => {
    expect(diffsAgainstJar('code-as-display-color')).toEqual([]);
  });

  it('refuses +package foo-bar { at its own line: no class command takes it', () => {
    const refusal = parseRefusalOf(parseClassRaw({ lines: ['+package foo-bar {', 'class A', '}'], type: 'class' }));
    expect(refusal?.line).toBe(0);
  });
});
