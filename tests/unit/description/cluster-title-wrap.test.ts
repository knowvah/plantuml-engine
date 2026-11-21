/**
 * Upstream 927f7531ddf (#3001): `ClusterHeader#getTitleBlock` builds a group title with `label.create9(
 * fontConfiguration, alignment, g.getSkinParam(), style.wrapWidth())` (`ClusterHeader.java:129`), so a description
 * group title wraps at `MaximumWidth` (`skinparam wrapWidth` maps to it, `FromSkinparamToStyle`). Once a width is
 * set `Fission` splits even a fitting title into word atoms: corpus `c4/xizifu-87-siti076` (the C4 stdlib's
 * `skinparam wrapWidth 200`) draws its boundary title `Sample System` as `Sample`, `&nbsp;`, `System`. Expected
 * values are the re-pinned jar's (a720bdd) output through `scripts/oracle-render.sh`.
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const NBSP = ' ';

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

/** Every `<text>` as `[x, y, content]`, in document order. */
function texts(svg: string): [string, string, string][] {
  return [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => [m[1]!, m[2]!, m[3]!]);
}

describe('927f7531ddf: a description group title wraps at MaximumWidth', () => {
  it('splits a fitting frame title into word atoms (xizifu-87-siti076 mechanism)', () => {
    const svg = render([
      'skinparam wrapWidth 200',
      'frame "Sample System" {',
      '  actor U',
      '  usecase "Do it" as UC',
      '}',
    ]);
    // Jar: `<text x="10" y="18.889">Sample</text><text x="57.513">&nbsp;</text><text x="61.363">System</text>`.
    expect(texts(svg).slice(0, 3)).toEqual([
      ['10', '18.889', 'Sample'],
      ['57.513', '18.889', NBSP],
      ['61.363', '18.889', 'System'],
    ]);
  });

  it('wraps rectangle and node titles, each stripe centred', () => {
    const svg = render([
      'skinparam wrapWidth 100',
      'rectangle "Rect R1 000 111 222 333 444 555" as R1 {',
      '  component C1',
      '}',
      'node "Node N1 000 111 222 333 444" as N1 {',
      '  component C2',
      '}',
    ]);
    const drawn = texts(svg);
    // Jar (svek-1.dot tables 77x37 and 142x42): `Rect` 14.606/23.889, `111` 14.606/37.889, `444` 28.213/51.889;
    // `Node` 157.744/29.889, `111` 160.106/43.889, `444` 187.319/57.889.
    expect(drawn[0]).toEqual(['14.606', '23.889', 'Rect']);
    expect(drawn[5]).toEqual(['14.606', '37.889', '111']);
    expect(drawn[10]).toEqual(['28.213', '51.889', '444']);
    expect(drawn[13]).toEqual(['157.744', '29.889', 'Node']);
    expect(drawn[18]).toEqual(['160.106', '43.889', '111']);
    expect(drawn[23]).toEqual(['187.319', '57.889', '444']);
  });

  it('keeps one text without a MaximumWidth', () => {
    const svg = render(['frame "Sample System" {', '  actor U', '}']);
    expect(texts(svg)[0]?.[2]).toBe('Sample System');
  });
});
