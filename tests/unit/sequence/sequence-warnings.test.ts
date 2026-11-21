import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const measurer = new DeterministicMeasurer();
// Reworded upstream in 443598c29ce (CommandSkinParam.java, Reference.java:167-171).
const PADDING_DRAWN = "'skinparam ParticipantPadding' is ignored: use a style instead".replaceAll(' ', '\u00a0');
const IGNORED_DRAWN =
  "'note bottom' is not supported on a 'ref': this note is ignored. Use 'note left' or 'note right'".replaceAll(
    ' ',
    '\u00a0',
  );

const PLAIN = ['@startuml', 'A -> B : hi', '@enduml'].join('\n');
const PADDED = ['@startuml', 'skinparam ParticipantPadding 10', 'A -> B : hi', '@enduml'].join('\n');
const REF_BOTTOM = ['@startuml', 'A -> B : hi', 'ref over A, B : init', 'note bottom : x', '@enduml'].join('\n');
const REF_RIGHT = REF_BOTTOM.replace('note bottom', 'note right');

function heightOf(svg: string): number {
  return Number(/<svg[^>]*height:(\d+)px/.exec(svg)?.[1] ?? Number.NaN);
}

describe('sequence warning banner (CommandSkinParam.java:92-99, DiagramChromeFactory.java:176-200)', () => {
  it('draws the deprecation banner for skinparam ParticipantPadding', () => {
    const svg = renderSync(PADDED, { measurer });
    expect(svg).toContain(`>${PADDING_DRAWN}</text>`);
    expect(svg).toContain('fill="#FFC" style="stroke:#FD8;stroke-width:3;"');
  });

  it('draws no banner without a deprecated skinparam', () => {
    expect(renderSync(PLAIN, { measurer })).not.toContain('is ignored');
  });

  it('prints the style the warning suggests on its five following lines', () => {
    const svg = renderSync(PADDED, { measurer });
    for (const line of ['&lt;style>', 'participant {', 'Padding 10', '}', '&lt;/style>'])
      expect(svg).toContain(`>${line.replaceAll(' ', '\u00a0')}</text>`);
  });

  it('stacks the six-line banner above the body: jar 194 against 124 without it', () => {
    expect(heightOf(renderSync(PADDED, { measurer }))).toBe(194);
    expect(heightOf(renderSync(PLAIN, { measurer }))).toBe(124);
  });
});

describe('ignored ref note (Reference.java:166-171)', () => {
  it("prints 'note bottom' is not supported on a 'ref' for a bottom note on a ref", () => {
    expect(renderSync(REF_BOTTOM, { measurer })).toContain(`>${IGNORED_DRAWN}</text>`);
  });

  it('prints nothing for a right note on a ref (accepted)', () => {
    expect(renderSync(REF_RIGHT, { measurer })).not.toContain('not supported');
  });
});
