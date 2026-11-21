/**
 * isw-T2-cls (the S* question): is an EMPTY package label Java `null` (0-wide,
 * no title table) or an empty Display (one " " atom)? Jar probe
 * `tests/fixtures/isw-T2-cls/empty-package-title-reachable.{puml,svg}`: the
 * empty leaf `package "" as p {}` and the cluster `package " " as q` BOTH get
 * a 20px folder tab ending 9.85 right of the left edge (leaf `M8.5,39
 * L13.35,39 ... L22.85,59`: 6 + 9.85 - 2.5, tab bottom 59 from top 39), so
 * `ClusterHeader#getTitleBlock` (`label == null` only) never returns the
 * empty block here and `USymbolFolder#getWTitle/#getHTitle` take the
 * width > 0 branch.
 *
 * The original probe (`empty-package-title.puml`, `package "" as p {` with a
 * body) is no longer a package since upstream #2846 (399471171e8):
 * `QUOTED_DISPLAY` is `[%g][^%g]+[%g]` (`CommandPackage.java:89`), so no
 * class command takes the line and the re-pinned jar draws the syntax-error
 * page at line 3. An empty display stays reachable through
 * `CommandPackageEmpty`, whose DISPLAY is still `[%g][^%g]+[%g]|[^#%s{}]*`
 * (`CommandPackageEmpty.java:69`): the bare alternative takes `""`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getHTitle, getWTitle } from '../../../src/diagrams/class/class-namespace-shape.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';
import { diffsAgainstJar } from '../../helpers/isw-t2-cls-fixture.js';

const measurer = new DeterministicMeasurer();
const DIR = new URL('../../fixtures/isw-T2-cls/', import.meta.url);

/** The `<text>` contents of an svg, in document order. */
function texts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('empty package label is one " " atom (jar probe)', () => {
  it('draws exactly the jar svg for the "" leaf and the " " cluster', () => {
    expect(diffsAgainstJar('empty-package-title-reachable')).toEqual([]);
  });
  it('getWTitle("") = 3.85 + 6 (jar path: L13.35 = 6 + 9.85 - 2.5)', () => {
    expect(getWTitle(measurer, defaultTheme, '', 200)).toBeCloseTo(9.85, 3);
  });
  it('getHTitle("") = 20 (jar path: tab bottom y 59 from top y 39)', () => {
    expect(getHTitle(measurer, defaultTheme, '')).toBe(20);
  });
});

describe('package "" as p { is a syntax error since #2846', () => {
  it('draws the error page at the line the jar reports', () => {
    const puml = readFileSync(new URL('empty-package-title.puml', DIR), 'utf8');
    const jar = texts(readFileSync(new URL('empty-package-title.svg', DIR), 'utf8'));
    const ours = texts(renderSync(puml, { measurer }));
    expect(jar).toContain('[From empty-package-title.puml (line 3) ]');
    expect(ours).toContain('[From string (line 3) ]');
    // The echoed source lines, through the failing one.
    expect(ours.slice(3, 6)).toEqual(jar.slice(3, 6));
    expect(ours.at(-1)).toMatch(/^Syntax Error\? \(Assumed diagram type: /);
  });
});
