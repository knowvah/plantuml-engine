/**
 * ucol T2c (issue #145, M3): a `<style>` colour value is read by `ValueImpl.asColor` (`ValueImpl.java:92-108`):
 * `none`/`transparent` are transparent, anything else is `set.getColorOrWhite(value1)`, so an unparseable value is
 * WHITE. Expected values are the jar's, from `tests/fixtures/unresolved-colour/style-*.svg`.
 */
import { describe, it, expect } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { asColorToken } from '../../../src/core/klimt/color/HColorSet.js';

const render = (style: string, body: string): string =>
  renderSync(`@startuml\n<style>\n${style}\n</style>\n${body}\n@enduml\n`, { measurer: new DeterministicMeasurer() });

const tags = (svg: string, name: string): string[] =>
  [...svg.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);

describe('asColorToken (ValueImpl.asColor in stored-token form)', () => {
  it('an unparseable value is WHITE', () => {
    expect(asColorToken('zzblue')).toBe('#FFFFFF');
  });

  it('a resolvable value keeps its stored form', () => {
    expect(asColorToken('red')).toBe('red');
    expect(asColorToken('#ABCDEF')).toBe('#ABCDEF');
    expect(asColorToken('red-blue')).toBe('red-blue');
  });

  it('none and transparent stay as written: asColor makes both transparent before getColorOrWhite', () => {
    expect(asColorToken('none')).toBe('none');
    expect(asColorToken('Transparent')).toBe('Transparent');
  });
});

describe('class <style> colours (M3)', () => {
  it('classDiagram { class { BackgroundColor zzblue } } fills the box #FFF', () => {
    const svg = render('classDiagram {\n  class {\n    BackgroundColor zzblue\n  }\n}', 'class A');
    expect(tags(svg, 'rect')[0]).toContain('fill="#FFF"');
  });

  it('root { BackgroundColor zzblue } fills the box and the spot #FFF', () => {
    const svg = render('root {\n  BackgroundColor zzblue\n}', 'class A');
    expect(tags(svg, 'rect')[0]).toContain('fill="#FFF"');
    expect(tags(svg, 'ellipse')[0]).toContain('fill="#FFF"');
  });

  it('root { FontColor zzblue } paints the spot glyph and the name #FFF', () => {
    const svg = render('root {\n  FontColor zzblue\n}', 'class A');
    expect(tags(svg, 'path')[0]).toContain('fill="#FFF"');
    expect(tags(svg, 'text')[0]).toContain('fill="#FFF"');
  });

  it('arrow { LineColor zzblue } draws the link and its head #FFF', () => {
    const svg = render('arrow {\n  LineColor zzblue\n}', 'class A\nclass B\nA --> B');
    const link = tags(svg, 'path').filter((p) => p.includes('id="A-to-B"'));
    expect(link[0]).toContain('#FFF');
    expect(tags(svg, 'polygon').at(-1)).toContain('fill="#FFF"');
  });
});
