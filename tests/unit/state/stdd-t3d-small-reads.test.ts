import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T3d, five small reads, each against the jar's `in.svg`:
 * - `skinparam state { FontName Impact }` is `state { FontName }` (`FromSkinparamToStyle.java:206`),
 *   the state's `Style#getUFont`; `SvgGraphics#text` prints `font-family` when it is not the root's
 *   (`SvgGraphics.java:726-727`).
 * - `skinparam ActivityBarColor<<fork>> green`: `EntityImageSynchroBar.java:62-63,81-84` signs
 *   `activityBar` `withTOBECHANGED(stereotype)` and reads `BackGroundColor`.
 * - `#RRGGBBAA` anywhere: `SvgGraphics#fillMe` (`SvgGraphics.java:880-885`) splits the alpha byte
 *   into `fill-opacity`, text included (`SvgGraphics.java:687`).
 * - a `[[url]]` in a state name: `Style#getFontConfiguration` (`Style.java:265-266`) carries the
 *   style's `HyperLinkColor` and `HyperlinkUnderlineThickness`; `FontConfiguration#hyperlink`
 *   (`:335-340`) underlines only for a stroke, `DriverTextSvg.java:134-135` only for a thickness > 0;
 *   `skinparam HyperlinkUnderline false` is `HyperlinkUnderlineThickness 0`
 *   (`FromSkinparamToStyle.java:251,314-318`).
 * - `[[url]]` on a state: `EntityImageState.java:118-120` / `InnerStateAutonom.java:141-142` /
 *   `Cluster.java:338-342` open the link inside the group, around the shape; a nested group
 *   closes it first (`SvgGraphics.java#startGroup`, `closeTopActiveLinkIfNeeded`).
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function diffs(slug: string): unknown[] {
  return compareSvg(render(slug), readFileSync(`${CACHE}/${slug}/in.svg`, 'utf8'), 'deterministic').diffs;
}

describe('stdd T3d: small reads', () => {
  it('nuboca-13: `skinparam state { FontName Impact }` reaches every state text, not the link labels', () => {
    const svg = render('nuboca-13-xape657');
    expect(svg.match(/font-family="Impact"/g)?.length).toBe(3);
    expect(diffs('nuboca-13-xape657')).toEqual([]);
  });

  it('fakali-52: `skinparam activityBackgroundColor` reaches the `<<choice>>` diamond (`EntityImageBranch.java:62-63,79-81`)', () => {
    const svg = render('fakali-52-zuje420');
    expect(svg).toMatch(/<polygon [^>]*fill="#98FB98"/);
    expect(diffs('fakali-52-zuje420')).toEqual([]);
  });

  it('kedibo-23: `ActivityBarColor<<fork>>`/`<<join>>` colour the bars by stereotype', () => {
    const svg = render('kedibo-23-kopo893');
    expect(svg).toContain('<rect x="34" y="7" width="80" height="8" fill="#008000"');
    expect(svg).toContain('fill="#FFA500"');
    expect(diffs('kedibo-23-kopo893')).toEqual([]);
  });

  it('xeziki-47: an 8-digit colour on text and boxes is `fill` + `fill-opacity`', () => {
    const svg = render('xeziki-47-zomo866');
    expect(svg).toMatch(/<text [^>]*fill="#F00" fill-opacity="0.125"/);
    expect(svg).toMatch(/<rect [^>]*fill="#F00" fill-opacity="0.502"/);
    expect(svg).not.toContain('#FF0000');
    expect(diffs('xeziki-47-zomo866')).toEqual([]);
  });

  it('mujipe-99 / feziva-71: no underline for `HyperlinkUnderline false` or a 0 thickness', () => {
    for (const slug of ['mujipe-99-fume794', 'feziva-71-gufo538']) {
      const svg = render(slug);
      expect(svg).toMatch(/<a [^>]*><text [^>]*fill="#00F"[^>]*>S1<\/text><\/a>/);
      expect(svg).not.toContain('text-decoration');
      expect(diffs(slug)).toEqual([]);
    }
  });

  it('nixoja-06: `element { hyperlinkColor Red; hyperlinkUnderlineThickness 2 }` colours and underlines', () => {
    const svg = render('nixoja-06-guxe431');
    expect(svg).toMatch(/<text [^>]*fill="#F00"[^>]*text-decoration="underline"[^>]*>S1<\/text>/);
    expect(diffs('nixoja-06-guxe431')).toEqual([]);
  });

  it('kenuci-20: `[[{S}]]` wraps the shape inside the group, the children follow the link', () => {
    const svg = render('kenuci-20-cane702');
    expect(svg).toMatch(/<g class="entity"[^>]*id="ent0001"[^>]*><a target="_top" href="" [^>]*title="S"[^>]*><path /);
    expect(svg).toMatch(/<\/a><g class="entity"[^>]*id="ent0002"/);
    expect(diffs('kenuci-20-cane702')).toEqual([]);
  });

  it('dajipi-09 / dapunu-39: a url on a cluster, an autonom and a leaf', () => {
    const svg = render('dajipi-09-doki542');
    expect(svg).toMatch(/<a target="_top" href="http:\/\/www.yahoo.com\/NewValuePreview"/);
    expect(diffs('dajipi-09-doki542')).toEqual([]);
    expect(diffs('dapunu-39-kava045')).toEqual([]);
  });
});
