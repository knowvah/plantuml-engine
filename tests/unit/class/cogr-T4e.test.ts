/**
 * cogr T4e: inline creole in a json/yaml cell. `TextBlockJson#getTextBlock` builds each cell with
 * `Display#create0(.., CreoleMode.NO_CREOLE, ..)` (`TextBlockJson.java:345-347`); `NO_CREOLE` skips only the
 * whole-line heading/list/rule classes (`CreoleStripeSimpleParser.java:86-90`), so `<color:D4312C>0x00` draws as
 * `0x00` in `#D4312C`. Oracle: `test-results/dot-cache/class/mocatu-19-jivi646/in.svg`: the embedded json image is
 * 452 wide, its first key `<text>` `fill="#D4312C"` with `textLength="30.362"`, and its value
 * `textLength="380.1"`.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const measurer = new DeterministicMeasurer();
const mocatu = readFileSync('test-results/dot-cache/class/mocatu-19-jivi646/in.puml', 'utf8');

function embeddedSvg(svg: string): string {
  const href = /href="data:image\/svg\+xml;base64,([^"]*)"/.exec(svg)?.[1] ?? '';
  return Buffer.from(href, 'base64').toString('utf8');
}

describe('json cell creole (cogr T4e)', () => {
  const inner = embeddedSvg(renderSync(mocatu, { measurer }));

  it('sizes the embedded image from the visible text', () => {
    expect(/<svg height="(\d+)" width="(\d+)"/.exec(inner)?.slice(1)).toEqual(['112', '452']);
  });

  it('draws the first key and value in the tag colour, without the tag text', () => {
    expect(inner).toContain('font-weight="700" fill="#D4312C" textLength="30.362">0x00</text>');
    expect(inner).toContain('textLength="380.1">string：+0个字符');
  });

  it('draws bold, italic and monospaced runs of one cell as separate styled runs', () => {
    const svg = renderSync('@startjson\n{"k": "a<b>b</b><i>c</i>d"}\n@endjson', { measurer });
    const runs = [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    expect(runs).toEqual(['k', 'a', 'b', 'c', 'd']);
    expect(svg).toMatch(/font-weight="700"[^>]*>b<\/text>/);
    expect(svg).toMatch(/font-style="italic"[^>]*>c<\/text>/);
  });
});
