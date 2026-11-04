import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T3a: `CommandCreateState.java:216-228` builds the state's `Colors` from the
 * `#...` spec (`Colors(data, set, BACK)`, `Colors.java:95-110`: `line:`, `text:`,
 * `line.dashed|dotted|bold`), adds the `##[style]colour` line colour and
 * `addLegacyStroke(style)`. `EntityImageStateCommon.java:144-150` takes the
 * LINE colour for the border, `EntityImageState.java:130` the stroke
 * (`Style.getStroke(colors)`: `colors.getSpecificLineStroke()` else the
 * style's, `Style.java:322-328`; `LinkStyle.java:98-108`: dashed 7,7 at 1,
 * dotted 1,3 at 1, bold 2), and the NAME's font takes the TEXT colour
 * (`EntityImageStateCommon.java:73-76`, `Style.java:259-264`). A composite
 * reads the same `Colors` (`Cluster.java:452-456,480-484`,
 * `InnerStateAutonom.java:101-106`). Values are the jar's `in.svg`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

const entity = (svg: string, name: string): string =>
  svg.match(new RegExp(`<g class="entity" data-qualified-name="${name}"[^>]*>(.*?)</g>`))?.[1] ?? '';

describe('stdd T3a: state colour specs through Colors', () => {
  it('puvaco-19: `##[dashed]` is stroke-dasharray 7,7 at width 1 on the box and its divider', () => {
    const e = entity(render('puvaco-19-geka094'), 'State_1');
    expect(e).toMatch(/<rect [^>]*stroke="#181818" stroke-width="1" stroke-dasharray="7,7"/);
    expect(e).toMatch(/<line [^>]*stroke="#181818" stroke-width="1" stroke-dasharray="7,7"/);
  });

  it('jotini-12: `line:red;line.bold;text:red` colours the border at 2, the name red, the description black', () => {
    const svg = render('jotini-12-fuba072');
    const s2 = entity(svg, 's2');
    expect(s2).toMatch(/<rect [^>]*fill="#FFC0CB" stroke="#F00" stroke-width="2"/);
    expect(s2).toMatch(/<line [^>]*stroke="#F00" stroke-width="2"/);
    expect(s2).toMatch(/<text [^>]*fill="#F00"[^>]*>s2<\/text>/);
    expect(s2).toMatch(/<text [^>]*fill="#000"[^>]*>s2 description<\/text>/);
    const s3 = entity(svg, 's3');
    expect(s3).toMatch(/<rect [^>]*stroke="#008000" stroke-width="1" stroke-dasharray="7,7"/);
    const s4 = entity(svg, 's4');
    expect(s4).toMatch(/<rect [^>]*stroke="#00F" stroke-width="1" stroke-dasharray="1,3"/);
  });

  it('novolu-35: an empty composite `##[dashed]` draws dashed too', () => {
    const b = entity(render('novolu-35-fole223'), 'b');
    expect(b).toMatch(/<rect [^>]*stroke-width="1" stroke-dasharray="7,7"/);
  });

  it('fikuga-98: `##00FFFF`, `##[dashed]blue`, `##[dotted]blue` and `##[bold]`', () => {
    const svg = render('fikuga-98-tagu554');
    expect(entity(svg, 'Foo1')).toMatch(/<rect [^>]*stroke="#0FF" stroke-width="0.5"/);
    expect(entity(svg, 'FooDashed')).toMatch(/<rect [^>]*stroke="#00F" stroke-width="1" stroke-dasharray="7,7"/);
    expect(entity(svg, 'FooDotted')).toMatch(/<rect [^>]*stroke="#00F" stroke-width="1" stroke-dasharray="1,3"/);
    expect(entity(svg, 'FooBold')).toMatch(/<rect [^>]*stroke="#181818" stroke-width="2"/);
  });

  it('vedapo-96: a cluster and its inner leaf each take their own dotted colour', () => {
    const svg = render('vedapo-96-xoro464');
    // Foo2 has no outside link, so it is an autonom (`InnerStateAutonom.java:101-106`): an `entity` group.
    expect(entity(svg, 'Foo2')).toMatch(
      /<rect [^>]*fill="none" stroke="#008000" stroke-width="1" stroke-dasharray="1,3"/,
    );
    expect(entity(svg, '(?:Foo2\\.)?inner1')).toMatch(
      /<rect [^>]*stroke="#FF0" stroke-width="1" stroke-dasharray="1,3"/,
    );
  });
});
