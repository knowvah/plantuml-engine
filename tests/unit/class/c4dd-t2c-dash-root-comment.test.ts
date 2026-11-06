/**
 * c4dd T2c: a class edge's dash is formatted, and the two byte-level residuals `compareSvg` does not see: the root's
 * `width`/`height` under a scale, and `Link#commentForSvg`. Compared by bytes against each jar oracle.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/c4dd-T2c';
const names = jarFixtureNames(DIR);
const RE_ROOT_SIZE = /<svg[^>]*?\bwidth="([^"]*)" height="([^"]*)"/;
const RE_LINK_COMMENT = /<!--(?:reverse )?link [^>]*-->/g;

const oracle = (name: string): string => readFileSync(`${DIR}/oracle/${name}.svg`, 'utf8');
const rootSize = (svg: string): readonly string[] => RE_ROOT_SIZE.exec(svg)?.slice(1) ?? [];
const linkComments = (svg: string): readonly string[] => svg.match(RE_LINK_COMMENT) ?? [];

describe('class dash, root and link comment against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(5);
  });

  it.each(names)('%s compares clean', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it.each(names)('%s root size equals the jar bytes', (name) => {
    expect(rootSize(renderJarFixture(DIR, name))).toEqual(rootSize(oracle(name)));
  });

  it.each(names)('%s link comments equal the jar bytes', (name) => {
    expect(linkComments(renderJarFixture(DIR, name))).toEqual(linkComments(oracle(name)));
  });

  it('formats an arrowThickness dash under a dpi to three decimals', () => {
    expect(renderJarFixture(DIR, 'class-dpi-arrow-thickness-dash')).toContain('stroke-dasharray="7.292,7.292"');
  });
});
