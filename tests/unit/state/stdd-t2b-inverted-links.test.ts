import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T2b: `CommandLinkStateCommon.java:205-206` replaces a LEFT or UP link by
 * `link.getInv()` (`Link.java:145-151`): entities swapped, `LinkType#getInversed`
 * (`LinkType.java:131-133`) swaps the decors, `inverted` set. A `b <- a`
 * (`CommandLinkStateReverse`, default LEFT) ends the same way. The DOT edge
 * runs from the new `cl1` (the target) and the path keeps that order
 * (`SvekEdge.java:647-655` only undoes graphviz's own inversion); the head
 * decor is now `decor2`, drawn at the path start (`SvekEdge.java:680-684`),
 * the id is `<cl1>-backto-<cl2>` (`Link.java:106-108`) and the comment
 * `reverse link cl1 to cl2` (`:117-119`). Values are the jar's `in.svg`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

const JAR_B_BACKTO_A =
  '<path d="M62.23,32 C73.75,32 80.27,32 91.79,32" fill="none" stroke="#181818" stroke-width="1" id="b-backto-a"/>' +
  '<polygon points="57.23,32,66.23,36,62.23,32,66.23,28,57.23,32" fill="#181818" style="stroke:#181818;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>';

describe('stdd T2b: inverted links', () => {
  it('defiga-15: `b <- a` is the reverse link b to a, head at the path start', () => {
    const svg = render('defiga-15-puki727');
    expect(svg).toContain('<!--reverse link b to a-->');
    expect(svg).toContain(JAR_B_BACKTO_A);
    expect(svg).not.toContain('a-to-b');
  });

  it('jezuju-97: `a -l-> b` is the same reverse link', () => {
    const svg = render('jezuju-97-jado372');
    expect(svg).toContain('<!--reverse link b to a-->');
    expect(svg).toContain(JAR_B_BACKTO_A);
  });

  it('cafafo-65: `[*] -l-> left` and `-u->` invert, `-r->` and `-d->` do not', () => {
    const svg = render('cafafo-65-jala148');
    expect(svg).toContain('id="left-backto-*start*"');
    expect(svg).toContain('id="up-backto-*start*"');
    expect(svg).toContain('id="*start*-to-right"');
    expect(svg).toContain('id="*start*-to-down"');
    expect(svg).toContain('<!--reverse link up to *start*-->');
  });

  it('xupine-90 and sokiga-03: a coloured -left-> and a `<--` carry the backto id', () => {
    expect(render('xupine-90-cupu906')).toContain('id="S3-backto-S1"');
    expect(render('sokiga-03-xovo249')).toContain('id="c-backto-d"');
  });
});
