import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T2a: `CommandLinkStateCommon.java:208-212` runs `link.applyStyle(ARROW_STYLE)`
 * (`WithLinkType.java:126-166`: dashed/dotted/bold/thickness=/a colour) and
 * `setStereotype`. `SvekEdge#drawU` (`SvekEdge.java:874-905`) then merges
 * `{root, element, stateDiagram, arrow}.withTOBECHANGED(stereotype)`, takes
 * `Rainbow.build` for line and head colour (`Rainbow.java:84-95`), the specific
 * colour over both, and `LinkType#getStroke3` for the stroke
 * (`LinkType.java:245-256`, `LinkStyle.java:98-108`). A transparent head draws
 * `ExtremityArrow#drawLineIfTransparent` (`SvekEdge.java:1113-1116`,
 * `ExtremityArrow.java:106-112`). Values are the jar's `in.svg`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

const linkPaths = (svg: string): string[] => [...svg.matchAll(/<g class="link"[^>]*>(.*?)<\/g>/g)].map((m) => m[1]!);

describe('stdd T2a: link colour, style and stereotype', () => {
  it('xomize-22: `-[#blue]->` colours the line and the head', () => {
    const [link] = linkPaths(render('xomize-22-poro350'));
    expect(link).toMatch(/<path [^>]*stroke="#00F"/);
    expect(link).toMatch(/<polygon [^>]*fill="#00F" style="stroke:#00F;/);
  });

  it('papifi-44: `-[dotted]->` is `UStroke(1, 3, 1)`', () => {
    const [link] = linkPaths(render('papifi-44-caxo706'));
    expect(link).toMatch(/<path [^>]*stroke-dasharray="1,3"/);
    expect(link).toMatch(/<path [^>]*stroke-width="1"/);
  });

  it('livama-83: `<<mystyle>>` takes the tag style, colour and thickness 3, on line and head', () => {
    const [link] = linkPaths(render('livama-83-toci194'));
    expect(link).toMatch(/<path [^>]*stroke="#00F"[^>]*stroke-width="3"/);
    expect(link).toMatch(/<polygon [^>]*fill="#00F" style="stroke:#00F;stroke-width:3;/);
  });

  it('gokife-89: `-[#blue,bold]->` is blue at thickness 2', () => {
    const svg = render('gokife-89-boja382');
    expect(svg).toMatch(/<path [^>]*stroke="#00F"[^>]*stroke-width="2"/);
    expect(svg).toMatch(/<polygon [^>]*fill="#00F" style="stroke:#00F;stroke-width:2;/);
  });

  it('xupine-90: `-[#red,dashed]->` is red with `7,7`; `-[dotted,#blue]->` blue with `1,3`', () => {
    const svg = render('xupine-90-cupu906');
    expect(svg).toMatch(/<path [^>]*stroke="#F00"[^>]*stroke-dasharray="7,7"/);
    expect(svg).toMatch(/<path [^>]*stroke="#00F"[^>]*stroke-dasharray="1,3"/);
    expect(svg).toMatch(/<path [^>]*stroke="#D0A"/);
  });

  it('sokiga-03: `HeadColor none` draws the arrow as a line from tip to contact, in the line colour', () => {
    const [first] = linkPaths(render('sokiga-03-xovo249'));
    expect(first).not.toContain('<polygon');
    expect(first).toMatch(/<line x1="202" y1="116.84" x2="202" y2="111.84" style="stroke:#00F;stroke-width:1;"/);
    expect(first).toMatch(/<path d="M202,57.24 C202,75.02 202,94.08 202,111.84"/);
  });

  it('kocago-20: a `-[hidden]->` link draws nothing', () => {
    const svg = render('kocago-20-nari612');
    expect(svg).not.toContain('Foo1-to-Foo2');
    expect(svg).not.toContain('lnk7');
  });
});
