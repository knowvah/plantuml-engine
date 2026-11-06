/**
 * odd T4a: authored object, map and json probes against the jar, past what the corpus rows reach. A drawn probe is
 * 0 diffs. An error page differs from the jar's only in the version line and source name, which the user's ruling keeps
 * (DIVERGENCES.md "Error pages print this port's version, and the source name is `string`"), so it asserts its line
 * and message instead. `ports-decors` joined on dot-engine 2.12.0, which fixed graphviz issue 41's second route. The
 * probes the ruling of #143 covers (a duplicate object or map, an unknown colour) are on the needs-ruling issue.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T4a';
const names = jarFixtureNames(DIR);

/** The jar's error line and message, when its oracle is an error page. */
function jarError(name: string): { line: string; message: string } | undefined {
  const texts = [...readFileSync(`${DIR}/oracle/${name}.svg`, 'utf8').matchAll(/<text[^>]*>([^<]*)/g)].map(
    (m) => m[1]!,
  );
  const from = texts.find((t) => /^\[From .* \(line \d+\) \]$/.test(t));
  if (from === undefined) return undefined;
  return { line: /\(line \d+\)/.exec(from)![0], message: texts.at(-1)! };
}

const drawn = names.filter((name) => jarError(name) === undefined);
const refused = names.filter((name) => jarError(name) !== undefined);

/** A jar crash page prints a stack trace; ours prints the exception's name at the same line. */
const CRASHES = new Set(['colon-add', 'n-i']);

/** Both refuse, and the jar settled on the sequence factory's later failure (`PSystemError` scoring): same line family. */
const OTHER_FACTORY = new Set(['url-statement', 'decl-linecolor']);

describe('object, map and json probes against the jar', () => {
  it('collects every probe', () => {
    expect(names.length).toBe(44);
    expect(drawn.length + refused.length).toBe(names.length);
  });

  it.each(drawn)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it.each(refused)('%s refuses', (name) => {
    const svg = renderJarFixture(DIR, name);
    expect(svg).toMatch(/\[From string \(line \d+\) \]/);
    if (OTHER_FACTORY.has(name)) return;
    const { line, message } = jarError(name)!;
    expect(svg).toContain(line);
    if (!CRASHES.has(name)) expect(svg.replaceAll('&gt;', '>')).toContain(message.replaceAll('&gt;', '>'));
  });
});
