/**
 * cogr T3d: a `[[url label]]` on a link label and on a long-description element.
 *
 * - Link label: `SvekEdge.java:298-299` builds the label through creole, where `CommandCreoleUrl` turns
 *   `[[http://google.com test]]` into one hyperlink-coloured, underlined `test` atom inside `<a>`; the label box is
 *   measured from `test` alone (volode-59-safa575: page 93 wide, text 20.881 long, fill #00F).
 * - Element: `CommandCreateElementMultilines.java:100,115,216-220` read `UrlBuilder.OPTIONAL` and `addUrl` it, so
 *   the entity draws inside one `<a>` (lolovi-23-loji748).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (source: string): string => renderSync(source, { measurer: new DeterministicMeasurer() });

describe('[[url label]] on a link label (cogr T3d)', () => {
  const svg = render('@startuml\nCar -- Wheel : [[http://google.com test]]\n@enduml');

  it('draws the label text inside an anchor, hyperlink-coloured and underlined', () => {
    expect(svg).toContain('href="http://google.com"');
    expect(svg).toMatch(
      /<a [^>]*><text [^>]*fill="#00F" text-decoration="underline" textLength="20\.881">test<\/text><\/a>/,
    );
  });

  it('sizes the page from the label text, not the bracket markup', () => {
    expect(svg).toContain('width="93px"');
    expect(svg).not.toContain('[[');
  });

  it('mixes plain text and a link run on one line', () => {
    const mixed = render('@startuml\nA -- B : see [[http://x.com here]] now\n@enduml');
    expect(mixed).toMatch(/>see <\/text>|>see<\/text>/);
    expect(mixed).toMatch(/<a [^>]*href="http:\/\/x\.com"[^>]*><text [^>]*>here<\/text><\/a>/);
  });
});

describe('[[url]] on a long-description element opener (cogr T3d)', () => {
  const svg = render('@startuml\ncomponent C [[http://www.google.com]] [\nline one\nline two\n]\n@enduml');

  it('wraps the entity in one anchor', () => {
    expect(svg).toMatch(/<g class="entity"[^>]*><a [^>]*href="http:\/\/www\.google\.com"/);
    expect((svg.match(/<a /g) ?? []).length).toBe(1);
  });

  it('keeps the description rows', () => {
    expect(svg).toContain('>line one</text>');
    expect(svg).toContain('>line two</text>');
  });
});
