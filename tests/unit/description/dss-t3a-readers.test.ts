/**
 * dss T3a: the description readers that skipped the style engine's buckets. Expected values are the jar's, read from
 * the authored rows' oracles (`tests/fixtures/diagram-style-scope/<row>.svg`, rendered with
 * `scripts/oracle-render.sh`) or from the oracle runs named per test.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageDescription.java:152-173
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { paintTextColor } from '../../../src/core/decoration/symbol/usymbol-resolve.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { hexagonPolygonPoints } from '../../../src/core/svek/hexagon-polygon.js';
import { renderSync } from '../../../src/index.js';
import { attrsOf } from '../../helpers/svg-tags.js';

const ROWS = new URL('../../fixtures/diagram-style-scope/', import.meta.url);

function renderRow(row: string): string {
  return renderJar(readFileSync(new URL(`${row}.puml`, ROWS), 'utf8'));
}

function renderJar(source: string): string {
  return renderSync(source, withJarCompatibleStyleInput({ measurer: new DeterministicMeasurer() }));
}

/** Every `<text>` as `[content, fill]`. */
function texts(svg: string): [string, string | undefined][] {
  return [...svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map(([, attrs, body]) => [
    body!,
    attrsOf(`<t ${attrs}>`).fill,
  ]);
}

describe('leaf title font (EntityImageDescription.java:152-153,172-173)', () => {
  it('paints a leaf named by its code with the title signature FontColor, a display apart with the plain one', () => {
    // component__probe-title: bare `title { FontColor #CCCCCC }`; jar C, E, X = #CCC and `component D as "dd d"` = #000.
    const fills = new Map(texts(renderRow('component__probe-title')));
    expect(fills.get('C')).toBe('#CCC');
    expect(fills.get('E')).toBe('#CCC');
    expect(fills.get('X')).toBe('#CCC');
    expect(fills.get('dd d')).toBe('#000');
  });

  it('paints a cluster title with the cluster title signature FontColor (ClusterHeader.java:157-165)', () => {
    // jar: `rectangle R` title `#CCC`; `component K` under `component { title { ... } }` also `#CCC`.
    expect(new Map(texts(renderRow('component__probe-title'))).get('R')).toBe('#CCC');
    expect(new Map(texts(renderRow('component__probe-sym-title'))).get('K')).toBe('#CCC');
  });

  it('keeps database E on the component-scoped title colour only for the component symbol', () => {
    // component__probe-sym-title: `component { title { FontColor #CCC } }`; jar paints [C] and [X], not `database E`.
    const fills = new Map(texts(renderRow('component__probe-sym-title')));
    expect(fills.get('C')).toBe('#CCC');
    expect(fills.get('E')).toBe('#000');
  });
});

describe('gradient FontColor (HColorGradient.java:103-105)', () => {
  it('paints the first colour of a gradient', () => {
    // component__probe-gradient-line: `FontColor #CCCCCC/#DDDDDD`; jar paints `#CCC`.
    const fills = new Map(texts(renderRow('component__probe-gradient-line')));
    expect(fills.get('C')).toBe('#CCC');
    expect(fills.get('n')).toBe('#CCC');
  });

  it('resolves a Paint to the text colour', () => {
    expect(paintTextColor('#112233')).toBe('#112233');
    expect(paintTextColor({ color1: '#CCCCCC', color2: '#DDDDDD', policy: '/' })).toBe('#CCCCCC');
    expect(paintTextColor({ color1: 'transparent', color2: '#DDDDDD', policy: '/' })).toBeNull();
  });
});

describe('business symbol fill (EntityImageDescription.java:162-166)', () => {
  it('reads the business signature BackGroundColor, not the businessActorFill default', () => {
    // component__probe-business: jar ellipses #AAA, #AAA, #CCC, #CCC (`actor`/`usecase` backgrounds reach `business`).
    const fills = [...renderRow('component__probe-business').matchAll(/<ellipse [^>]*>/g)].map(
      ([tag]) => attrsOf(tag).fill,
    );
    expect(fills).toEqual(['#AAA', '#AAA', '#CCC', '#CCC']);
  });

  it('draws an unstyled business actor in the element default', () => {
    // jar (unknown/fepulu-27-soci473, `actor/ "actor/"`): fill #F1F1F1.
    const svg = renderJar('@startuml\nactor/ "actor/"\n@enduml');
    expect(attrsOf(/<ellipse [^>]*>/.exec(svg)![0]).fill).toBe('#F1F1F1');
  });
});

describe('transparent line and fill (DriverPathSvg.java:63-68)', () => {
  it('omits the stroke on a path whose line and fill are both transparent', () => {
    // component__probe-transparent: `BackgroundColor transparent` + `LineColor none`; jar database/note paths carry
    // `fill="none"` and no `style`, while the rects keep `stroke:none`.
    const svg = renderRow('component__probe-transparent');
    const paths = [...svg.matchAll(/<path [^>]*>/g)].map(([tag]) => tag);
    expect(paths.filter((tag) => tag.includes('fill="none"') && !tag.includes('style=')).length).toBe(4);
    expect(paths.filter((tag) => tag.includes('stroke:none'))).toEqual([]);
    expect(svg).toContain('style="stroke:none;" rx="2.5" ry="2.5"');
  });
});

describe('hexagon leaf (EntityImageDescription.java:307-341)', () => {
  it('takes graphviz hexagon vertices off the node box', () => {
    // component__syms-none `hexagon k`: jar polygon 27.89..41.89 x 232.38..256.38, i.e. a 14 x 24 node box.
    expect(hexagonPolygonPoints(14, 24)).toEqual([
      { x: 14, y: 12 },
      { x: 10.5, y: 0 },
      { x: 3.5, y: 0 },
      { x: 0, y: 12 },
      { x: 3.5, y: 24 },
      { x: 10.5, y: 24 },
      { x: 14, y: 12 },
    ]);
  });

  it('draws the node polygon beside the text', () => {
    // component__syms-none: `hexagon k`; jar polygon, graphviz's hexagon vertices of the 14x24 node box.
    const svg = renderRow('component__syms-none');
    expect(svg).toContain(
      'points="41.89,244.38,38.39,232.38,31.39,232.38,27.89,244.38,31.39,256.38,38.39,256.38,41.89,244.38"',
    );
  });
});

describe('note on link (SvekEdge.java:307-326,951-954)', () => {
  const link = (note: string): string => `@startuml\n[a] --> [b] : lab\n${note}\n@enduml`;
  const NOTE_AT_TOP = 'd="M35.89,86 L35.89,109 L62.89,109 L62.89,96 L52.89,86 L35.89,86"';

  // Oracle: scripts/oracle-render.sh on each source below (jar 8beta1).
  it('puts the note above the label for top', () => {
    const svg = renderJar(link('note top on link : k'));
    expect(svg).toContain(NOTE_AT_TOP);
    expect(svg).toContain('<text x="41.89" y="101.111" fill="#000" font-size="13">k</text>');
    expect(svg).toContain('<text x="40.946" y="125.111" fill="#000" font-size="13" textLength="17.388">lab</text>');
  });

  it('puts the note before the label for left', () => {
    const svg = renderJar(link('note left on link : k'));
    expect(svg).toContain(NOTE_AT_TOP);
    expect(svg).toContain('<text x="69.39" y="101.111" fill="#000" font-size="13" textLength="17.388">lab</text>');
  });

  it('puts the note after the label for right', () => {
    const svg = renderJar(link('note right on link : k'));
    expect(svg).toContain('d="M55.278,86 L55.278,109 L82.278,109 L82.278,96 L72.278,86 L55.278,86"');
    expect(svg).toContain('<text x="31.89" y="101.111" fill="#000" font-size="13" textLength="17.388">lab</text>');
  });

  it('puts the note below the label by default', () => {
    const svg = renderJar(link('note on link : k'));
    expect(svg).toContain('d="M35.89,101 L35.89,124 L62.89,124 L62.89,111 L52.89,101 L35.89,101"');
    expect(svg).toContain('<text x="40.946" y="92.111" fill="#000" font-size="13" textLength="17.388">lab</text>');
  });

  it('draws a note on an unlabelled link, filled with its own colour', () => {
    const svg = renderJar('@startuml\n[a] --> [b]\nnote on link #red : k\n@enduml');
    expect(svg).toContain(`${NOTE_AT_TOP} style="stroke:#181818;stroke-width:0.5;" fill="#F00"`);
    expect(svg).not.toContain('>lab<');
  });

  it('draws the multi-line form with its colour', () => {
    // component/dikexa-30-jobu917 (conformant): `note left on link #blue ... end note`.
    const svg = renderJar('@startuml\n[a] --> [b]\nnote left on link #blue\n  one\nend note\n@enduml');
    expect(svg.match(/fill="#00F"/g)?.length).toBe(2);
  });
});

describe('leading colour (CommandCreateElementFull.java:84-85, ColorParser.java:62)', () => {
  // component__x-leading-colour (jar oracle): Both (leading #pink, trailing #green) = #008000, Lead = #FFC0CB,
  // Trail = #008000, `hexagon #pink "Hex"` polygon = #FFC0CB.
  it('fills with the leading colour, the trailing one winning when both are written', () => {
    const svg = renderRow('component__x-leading-colour');
    expect([...svg.matchAll(/<rect [^>]*>/g)].map(([tag]) => attrsOf(tag).fill)).toEqual([
      '#008000',
      '#FFC0CB',
      '#008000',
    ]);
    expect(attrsOf(/<polygon [^>]*>/.exec(svg)![0]).fill).toBe('#FFC0CB');
  });

  it('keeps the quoted display free of the colour', () => {
    const svg = renderRow('component__x-leading-colour');
    expect(texts(svg).map(([body]) => body)).toEqual(['Both', 'Lead', 'Trail', 'Hex']);
  });
});
