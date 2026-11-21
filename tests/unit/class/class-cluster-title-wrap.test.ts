/**
 * Upstream 927f7531ddf (#3001) and f29aa9bd058 (#3018): a group title is built with
 * `label.create9(fontConfiguration, alignment, g.getSkinParam(), style.wrapWidth())` (`ClusterHeader.java:129`), an
 * empty package's with the same call (`EntityImageEmptyPackage.java:118-119`), so `<style> package { MaximumWidth }`
 * and `skinparam wrapWidth` wrap them. Fixtures: upstream `src/test/resources/vega/nonreg/group2995/*.puml`; every
 * expected value is the re-pinned jar's (a720bdd) output through `scripts/oracle-render.sh`.
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { measureEmptyPackageLeafDim } from '../../../src/diagrams/class/class-empty-package.js';
import { namespaceTitleTableDimsFor } from '../../../src/diagrams/class/class-namespace-title-table.js';
import { namespaceTitleLines } from '../../../src/diagrams/class/class-namespace-title-runs.js';

const NBSP = ' ';
const TITLE = 'Package P1 000 111 222 333 444 555 666 777 888 999';
const STYLE = ['<style>', 'package {', '   MaximumWidth 100', '}', '</style>'];

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

/** Every `<text>` as `[x, y, content]`, in document order. */
function texts(svg: string): [string, string, string][] {
  return [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => [m[1]!, m[2]!, m[3]!]);
}

/** The jar's wrapped `Package P<n> 000 ... 999` title at block origin `(x0, y0)`: each stripe centred on the widest. */
function wrappedTitle(n: string, x0: number, y0: number): [string, string, string][] {
  const at = (dx: number, dy: number, t: string): [string, string, string] => [
    String(Math.round((x0 + dx) * 1000) / 1000),
    String(Math.round((y0 + dy) * 1000) / 1000),
    t,
  ];
  const row = (dy: number, a: string, b: string, c: string): [string, string, string][] => [
    at(0, dy, a),
    at(23.362, dy, NBSP),
    at(27.212, dy, b),
    at(50.575, dy, NBSP),
    at(54.425, dy, c),
  ];
  return [
    at(1.137, 0, 'Package'),
    at(55.65, 0, NBSP),
    at(59.5, 0, `P${n}`),
    ...row(14, '000', '111', '222'),
    ...row(28, '333', '444', '555'),
    ...row(42, '666', '777', '888'),
    at(27.212, 56, '999'),
  ];
}

describe('927f7531ddf: a package cluster title wraps at MaximumWidth', () => {
  it('package_maximum_width: <style> package { MaximumWidth 100 }', () => {
    const svg = render([...STYLE, '', `package "${TITLE}" as P1 {`, '  class A', '}']);
    // Jar: `<text x="11.137" y="18.889">Package</text>`, `<text x="65.65">&nbsp;</text>`, ... `999` at 37.212/74.889.
    expect(texts(svg).slice(0, 19)).toEqual(wrappedTitle('1', 10, 18.889));
    // Jar svg: class A's rect at y=95 (the title table is 77x65, `svek-1.dot`).
    expect(svg).toContain('<rect x="31.32" y="95" width="41.363" height="48"');
  });

  it('skinparam_wrap_width: skinparam WrapWidth 100 maps to MaximumWidth (FromSkinparamToStyle)', () => {
    const svg = render(['skinparam WrapWidth 100', '', `package "${TITLE}" as P1 {`, '  class A', '}']);
    expect(texts(svg).slice(0, 19)).toEqual(wrappedTitle('1', 10, 18.889));
  });

  it('sizes the DOT title table on the wrapped block: WIDTH="77" HEIGHT="65"', () => {
    const measurer = new DeterministicMeasurer();
    const dims = namespaceTitleTableDimsFor({ display: TITLE, titleWrapWidth: 100 }, defaultTheme, measurer);
    // `000 111 222` = 3 * 23.362 + 2 * 3.85 is the widest stripe; 5 stripes * 14 - 5.
    expect(Math.floor(dims.width)).toBe(77);
    expect(dims.height).toBe(65);
  });

  it('keeps a title on one run when no MaximumWidth is set', () => {
    const lines = namespaceTitleLines(new DeterministicMeasurer(), defaultTheme, 'Sample System');
    expect(lines.map((l) => l.runs.length)).toEqual([1]);
  });

  it('splits a fitting title into word runs once a width is set (Fission decomposes unconditionally)', () => {
    const lines = namespaceTitleLines(new DeterministicMeasurer(), defaultTheme, 'Sample System', { wrapWidth: 200 });
    expect(lines.map((l) => l.runs.map((r) => (r.kind === 'text' ? r.text : r.kind)))).toEqual([
      ['Sample', ' ', 'System'],
    ]);
  });
});

describe('f29aa9bd058: an empty package title wraps at MaximumWidth', () => {
  it('empty_package_maximum_width: the collapsed leaves and the cluster all wrap', () => {
    const svg = render([
      ...STYLE,
      '',
      `package "${TITLE.replace('P1', 'P2')}" as P2 {`,
      '}',
      '',
      `package "${TITLE.replace('P1', 'P3')}" as P3 {`,
      `   package "${TITLE.replace('P1', 'P4')}" as P4 {`,
      '   }',
      '}',
    ]);
    const drawn = texts(svg);
    // Jar: cluster P3's title at block x 126.89, the empty leaves P2 / P4 at 10 / 143, all y 107.889.
    expect(drawn.slice(0, 19)).toEqual(wrappedTitle('3', 126.89, 18.889));
    expect(drawn.slice(19, 38)).toEqual(wrappedTitle('2', 10, 107.889));
    expect(drawn.slice(38, 57)).toEqual(wrappedTitle('4', 143, 107.889));
  });

  it('sizes the leaf on the wrapped title: 97.787 x 160 (svek-1.dot width=1.358160 height=2.222222)', () => {
    const dim = measureEmptyPackageLeafDim(new DeterministicMeasurer(), defaultTheme, TITLE, [], { wrapWidth: 100 });
    expect(dim.width).toBeCloseTo(97.787, 3);
    expect(dim.height).toBe(160);
    expect(dim.titleWrapWidth).toBe(100);
  });
});

describe('927f7531ddf: a USymbol cluster title wraps too (COMPOSITE_TITLE signature)', () => {
  it('rectangle and node clusters in a class diagram', () => {
    const svg = render([
      'skinparam wrapWidth 100',
      'rectangle "Rect R1 000 111 222 333 444 555" as R1 {',
      '  class A',
      '}',
      'node "Node N1 000 111 222 333 444" as N1 {',
      '  class B',
      '}',
    ]);
    const drawn = texts(svg);
    // Jar: `Rect` at 14.606/23.889, `111` at 14.606/37.889, `444` at 28.213/51.889; `Node` at 157.744/29.889.
    expect(drawn[0]).toEqual(['14.606', '23.889', 'Rect']);
    expect(drawn[5]).toEqual(['14.606', '37.889', '111']);
    expect(drawn[10]).toEqual(['28.213', '51.889', '444']);
    expect(drawn[13]).toEqual(['157.744', '29.889', 'Node']);
    expect(drawn[23]).toEqual(['187.319', '57.889', '444']);
  });
});
