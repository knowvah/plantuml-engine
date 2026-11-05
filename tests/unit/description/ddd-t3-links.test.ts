/**
 * ddd-T3a..T3d: a link's middle decor, quantifiers, magnetic ends and arrow style. Jar values: dot-cache component
 * lakuti-06-dobi447, bokumi-45-pupo531, purevo-74-pamo264, bagoze-78-lada681, simegi-12-fezi978 (unknown), minulo-12-bare186.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (...lines: string[]): string =>
  renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });

const linkGroups = (svg: string): string[] => svg.match(/<g class="link".*?<\/g>/g) ?? [];

describe('middle decor (SvekEdge.java:982-990)', () => {
  it('draws the lollipop circle in the link group, on the background', () => {
    const [link] = linkGroups(render('component Foo', 'component Bar', 'Foo -0)- Bar'));
    expect(link).toContain('rx="6" ry="6" fill="#FFF" style="stroke:#181818;stroke-width:1.5;"');
  });

  it('the knock-out disc of -(0)- keeps the edge stroke; the two circles take 1.5', () => {
    const [link] = linkGroups(render('component Foo', 'component Bar', 'Foo -(0)- Bar'));
    expect(link).toContain('rx="10" ry="10"');
    expect(link).toMatch(/rx="10" ry="10"[^>]*stroke-width:1;/);
    expect(link).toMatch(/rx="6" ry="6"[^>]*stroke-width:1\.5;/);
  });

  it('skinparam arrowLollipopColor fills the circle', () => {
    const [link] = linkGroups(
      render('skinparam ArrowLollipopColor yellow', 'component Foo', 'component Bar', 'Foo -0)- Bar'),
    );
    expect(link).toContain('fill="#FF0"');
  });
});

describe('quantifiers (SvekEdge.java:956-980)', () => {
  it('draws both end texts', () => {
    const [link] = linkGroups(render('component A', 'component B', 'A "1" -- "2" B'));
    expect(link).toContain('>1</text>');
    expect(link).toContain('>2</text>');
  });
});

describe('arrow style (SvekEdge.java:816-821,874-904)', () => {
  it('a rainbow draws its later segments as offset paths', () => {
    const [link] = linkGroups(render('component a', 'component b', 'a -[#blue,dashed;#red]-> b: test'));
    expect(link).toContain('stroke:#00F;stroke-width:1;stroke-dasharray:7,7;');
    expect(link).toContain('stroke:#F00;stroke-width:1;stroke-dasharray:7,7;');
  });

  it('arrow { LineStyle } dashes a normal link', () => {
    const [link] = linkGroups(
      render(
        '<style>',
        'arrow {',
        'LineStyle 3-2',
        'LineThickness 3',
        '}',
        '</style>',
        'component a',
        'component b',
        'a -> b',
      ),
    );
    expect(link).toContain('stroke-width:3;stroke-dasharray:3,2;');
  });

  it('every label of a <<a>><<b>> run signs the style', () => {
    const svg = render(
      '<style>',
      'arrow {',
      'LineColor green',
      '.x {',
      'LineColor red',
      '}',
      '.y {',
      'FontColor red',
      '}',
      '}',
      '</style>',
      'component a',
      'a --> b <<x>><<y>> : t',
    );
    const [link] = linkGroups(svg);
    expect(link).toContain('stroke:#F00');
    expect(link).toMatch(/fill="#F00"[^>]*>t</);
  });

  it('a transparent link draws no element, and so no group (DriverDotPathSvg.java:47)', () => {
    expect(linkGroups(render('node node1', 'node node2', 'node1 -[#transparent]- node2'))).toEqual([]);
  });
});

describe('link labels (SvekEdge.java:281-306)', () => {
  it('funeme-74: a magic arrow strips the token and draws the glyph first', () => {
    const svg = render('usecase A', 'A - B : < a', 'B -- C : > c');
    const links = linkGroups(svg);
    expect(links.every((l) => /<polygon /.test(l))).toBe(true);
    expect(svg).toContain('>a</text>');
    expect(svg).not.toContain('&lt; a');
  });

  it('kafexo-72: maxMessageSize wraps the drawn label', () => {
    const svg = render(
      'skinparam maxMessageSize 100',
      'actor foo',
      'foo --> (Use case) : this is a very long sentence on one single line',
    );
    expect(svg).toContain('>line</text>');
    expect(svg).not.toContain('single line</text>');
  });
});
