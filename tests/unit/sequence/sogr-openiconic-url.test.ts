/**
 * sogr T2d: an OpenIconic glyph inside a `[[url label]]` is wrapped in the url's `<a>`.
 * `AtomTextUtils#createAtomTextForUrl` builds `new AtomOpenIconic(null, scale, openIcon, fontConfiguration, url)`
 * (`AtomTextUtils.java:117`); `AtomOpenIconic#drawU` brackets the glyph with `ug.startUrl(url)` / `ug.closeUrl()`
 * (`AtomOpenIconic.java:77-82`). Oracle: `tupema-84-tako461` (messages 1 and 2 carry a url, message 3 does not).
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const URL_TARGET = 'http://www.google.com';
/** The jar's `<a>` open tag, verbatim from `in.svg` (`SvgGraphics#openLink`). */
const JAR_ANCHOR =
  `<a target="_top" href="${URL_TARGET}" xlink:href="${URL_TARGET}" xlink:type="simple" xlink:actuate="onRequest" ` +
  `xlink:show="new" title="${URL_TARGET}" xlink:title="${URL_TARGET}">`;
const SOURCE = `@startuml
Actor --> Participant: Message1 [[${URL_TARGET} this <&link-intact> is]]
Actor --> Participant: Message2 [[${URL_TARGET} <&link-intact>]]
Actor --> Participant: Message3 <&link-intact>
@enduml
`;

describe('OpenIconic inside a url label', () => {
  const svg = renderSync(SOURCE, { measurer: new DeterministicMeasurer() });

  it('wraps the glyph of messages 1 and 2 in the jar anchor, and not message 3', () => {
    const bareGlyphs = svg.match(/<path d="M\d+\.\d+,\d+\.\d+ C/g) ?? [];
    expect(bareGlyphs.length).toBe(3);
    expect(svg.split(`${JAR_ANCHOR}<path `).length - 1).toBe(2);
  });
});
