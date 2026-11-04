import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T4a: `scale` and `skinparam dpi` at export. `TextBlockExporter#exportTo` (`TextBlockExporter.java:160-177`)
 * computes `scale.getScale(dim) * dpi / 96` over the chrome-and-margin dimension (`:205-209`,
 * `ScaleProtected.java:42-51`) and draws the whole document through ONE scaled `UGraphic`, so every number is
 * multiplied then formatted once (`SvgGraphics.java:468-475`); the root's `width`/`height` are `format(maxX)`.
 * Values are the jar's `in.svg` root attributes.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function rootSize(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  const svg = renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
  const m = /<svg [^>]*?width="([^"]*)" height="([^"]*)"/.exec(svg);
  return `${m?.[1]} x ${m?.[2]}`;
}

describe('stdd T4a: scale and dpi at export', () => {
  it('saxedi-32: `skinparam dpi 300` scales by 300/96', () => {
    expect(rootSize('saxedi-32-xubo205')).toBe('225px x 468.75px');
  });
  it('corumi-91 / foluke-95: `scale 5` is capped at 4 (`ScaleProtected.java:48-49`)', () => {
    expect(rootSize('corumi-91-mizo869')).toBe('676px x 452px');
    expect(rootSize('foluke-95-cezi696')).toBe('388px x 168px');
  });
  it('jibizo-72 / xijice-10: `scale W x H` fits the smaller ratio (`ScaleWidthAndHeight`)', () => {
    expect(rootSize('jibizo-72-tori374')).toBe('73.103px x 100.345px');
    expect(rootSize('xijice-10-leni272')).toBe('401.896px x 551.659px');
  });
  it('domoru-86 / zoriza-41: `scale 1.3`, `scale 1.4`', () => {
    expect(rootSize('domoru-86-coki670')).toBe('374.4px x 1007.5px');
    expect(rootSize('zoriza-41-rege543')).toBe('688.8px x 854px');
  });
  it('rovese-43 / jaxebo-54 / desebo-47: `scale N width` (dogeji-46 is left to its layout rows, T6c)', () => {
    expect(rootSize('rovese-43-tadu368')).toBe('1296px x 2420px');
    expect(rootSize('jaxebo-54-nifi592')).toBe('350.314px x 290.377px');
    expect(rootSize('desebo-47-maro096')).toBe('1801.059px x 1805.294px');
  });
});
