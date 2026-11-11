/** Fragments are `mugaxe-80-biva973/in.svg`, `cov-link-reversed-h.svg` and `cov-dark.svg`: the jar's own SVG. */
import { describe, expect, it } from 'vitest';
import { ColorMapper } from '../../../src/core/klimt/color/ColorMapper.js';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { WArrowDirection } from '../../../src/diagrams/wire/WArrowDirection.js';
import { WLinkHorizontal } from '../../../src/diagrams/wire/WLinkHorizontal.js';
import { WLinkType } from '../../../src/diagrams/wire/WLinkType.js';
import { svgOf, wireSkinParam } from './helpers.js';

const STROKE = 'style="stroke:#000;stroke-width:1;"';
const RED = HColorSet.instance().getColor('#red');

interface Opts {
  readonly type: WLinkType;
  readonly direction: WArrowDirection;
  readonly y?: number;
  readonly color?: typeof RED;
  readonly label?: string;
  readonly start?: number;
  readonly destination?: number;
}

function linkOf(opts: Opts): WLinkHorizontal {
  const skinParam = wireSkinParam();
  return new WLinkHorizontal({
    skinParam,
    start: new UTranslate(opts.start ?? 120, opts.y ?? 35),
    destination: opts.destination ?? 240,
    type: opts.type,
    direction: opts.direction,
    color: opts.color,
    label: opts.label === undefined ? Display.NULL : Display.getWithNewlines(skinParam.getPragma(), opts.label),
  });
}

/** The drawing's elements after the leading `<defs/>`, in order. */
function shapes(svg: string): string[] {
  return [...svg.matchAll(/<(?:path|line|rect|text)\b[^>]*?(?:\/>|>[^<]*<\/text>)/g)].map((m) => m[0]);
}

describe('WLinkHorizontal NORMAL (WLinkHorizontal.java:182-203)', () => {
  it('draws the head then the line', () => {
    const svg = svgOf((ug) => linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.NORMAL }).drawMe(ug));
    expect(shapes(svg)).toEqual([
      '<path d="M238,35 L233,30 L233,40 L238,35" fill="#000"/>',
      `<line x1="121" y1="35" x2="239" y2="35" ${STROKE}/>`,
    ]);
  });

  it('BOTH draws the two heads, normal first', () => {
    const svg = svgOf((ug) => linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.BOTH, y: 50 }).drawMe(ug));
    expect(shapes(svg)).toEqual([
      '<path d="M238,50 L233,45 L233,55 L238,50" fill="#000"/>',
      '<path d="M121,50 L126,45 L126,55 L121,50" fill="#000"/>',
      `<line x1="121" y1="50" x2="239" y2="50" ${STROKE}/>`,
    ]);
  });

  it('REVERSE draws only the back head', () => {
    const svg = svgOf((ug) => linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.REVERSE, y: 65 }).drawMe(ug));
    expect(shapes(svg)).toEqual([
      '<path d="M121,65 L126,60 L126,70 L121,65" fill="#000"/>',
      `<line x1="121" y1="65" x2="239" y2="65" ${STROKE}/>`,
    ]);
  });

  it('NONE draws only the line', () => {
    const svg = svgOf((ug) => linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.NONE, y: 80 }).drawMe(ug));
    expect(shapes(svg)).toEqual([`<line x1="121" y1="80" x2="239" y2="80" ${STROKE}/>`]);
  });
});

describe('WLinkHorizontal labels (WLinkHorizontal.java:89-125)', () => {
  it('NORMAL direction: +4 from the start, white rectangle under the text', () => {
    const svg = svgOf((ug) =>
      linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.NORMAL, label: 'abcd' }).drawMe(ug),
    );
    expect(shapes(svg).slice(2)).toEqual([
      '<rect x="124" y="30" width="21.688" height="10" fill="#FFF" style="stroke:#FFF;stroke-width:1;"/>',
      '<text x="124" y="37.778" fill="#000" font-size="10" textLength="21.688">abcd</text>',
    ]);
  });

  it('REVERSE: len - w - 4', () => {
    const svg = svgOf((ug) =>
      linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.REVERSE, y: 65, label: 'abcd' }).drawMe(ug),
    );
    expect(shapes(svg).slice(2)).toEqual([
      '<rect x="214.313" y="60" width="21.688" height="10" fill="#FFF" style="stroke:#FFF;stroke-width:1;"/>',
      '<text x="214.313" y="67.778" fill="#000" font-size="10" textLength="21.688">abcd</text>',
    ]);
  });

  it('BOTH: centred', () => {
    const svg = svgOf((ug) =>
      linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.BOTH, y: 50, label: 'abcd' }).drawMe(ug),
    );
    expect(shapes(svg).at(-1)).toBe(
      '<text x="169.156" y="52.778" fill="#000" font-size="10" textLength="21.688">abcd</text>',
    );
  });

  it('BUS: no rectangle, y + (20 - h)/2 - 5', () => {
    const svg = svgOf((ug) =>
      linkOf({ type: WLinkType.BUS, direction: WArrowDirection.NORMAL, y: 95, label: 'abcd' }).drawMe(ug),
    );
    expect(shapes(svg)).toEqual([
      `<path d="M121,95 L224,95 L224,90 L239,100 L224,110 L224,105 L121,105 L121,95" ${STROKE} fill="#FFF"/>`,
      '<text x="124" y="102.778" fill="#000" font-size="10" textLength="21.688">abcd</text>',
    ]);
  });

  it('a Display.NULL label draws nothing extra', () => {
    const svg = svgOf((ug) => linkOf({ type: WLinkType.BUS, direction: WArrowDirection.NONE, y: 170 }).drawMe(ug));
    expect(shapes(svg)).toEqual([`<path d="M121,170 L239,170 L239,180 L121,180 L121,170" ${STROKE} fill="#FFF"/>`]);
  });
});

describe('WLinkHorizontal BUS paths (WLinkHorizontal.java:129-180)', () => {
  it('BOTH with #red: red stroke and label, white fill', () => {
    const svg = svgOf((ug) =>
      linkOf({ type: WLinkType.BUS, direction: WArrowDirection.BOTH, y: 125 - 5, color: RED, label: 'abcd' }).drawMe(
        ug,
      ),
    );
    expect(shapes(svg)).toEqual([
      '<path d="M121,125 L136,115 L136,120 L224,120 L224,115 L239,125 L224,135 L224,130 L136,130 L136,135 L121,125" style="stroke:#F00;stroke-width:1;" fill="#FFF"/>',
      '<text x="169.156" y="127.778" fill="#F00" font-size="10" textLength="21.688">abcd</text>',
    ]);
  });

  it('REVERSE', () => {
    const svg = svgOf((ug) => linkOf({ type: WLinkType.BUS, direction: WArrowDirection.REVERSE, y: 145 }).drawMe(ug));
    expect(shapes(svg)).toEqual([
      `<path d="M121,150 L136,140 L136,145 L239,145 L239,155 L136,155 L136,160 L121,150" ${STROKE} fill="#FFF"/>`,
    ]);
  });
});

describe('WLinkHorizontal reversed (cov-link-reversed-h)', () => {
  it('draws the negative lengths', () => {
    const svg = svgOf((ug) =>
      linkOf({ type: WLinkType.BUS, direction: WArrowDirection.NORMAL, y: 50, start: 340, destination: 20 }).drawMe(ug),
    );
    expect(shapes(svg)).toEqual([
      `<path d="M341,50 L4,50 L4,45 L19,55 L4,65 L4,60 L341,60 L341,50" ${STROKE} fill="#FFF"/>`,
    ]);
  });

  it('a NORMAL arrow runs backwards', () => {
    const svg = svgOf((ug) =>
      linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.NORMAL, start: 340, destination: 20 }).drawMe(ug),
    );
    expect(shapes(svg)).toEqual([
      '<path d="M18,35 L13,30 L13,40 L18,35" fill="#000"/>',
      `<line x1="341" y1="35" x2="19" y2="35" ${STROKE}/>`,
    ]);
  });
});

describe('WLinkHorizontal dark mode (cov-dark)', () => {
  it('the BUS fill and the label rectangle take the dark side', () => {
    const svg = svgOf(
      (ug) => linkOf({ type: WLinkType.BUS, direction: WArrowDirection.NONE, y: 50 }).drawMe(ug),
      ColorMapper.DARK_MODE,
    );
    expect(shapes(svg)[0]).toContain('fill="#000"');
    expect(shapes(svg)[0]).toContain('stroke:#FFF');
  });

  it('a NORMAL label rectangle is dark', () => {
    const svg = svgOf(
      (ug) => linkOf({ type: WLinkType.NORMAL, direction: WArrowDirection.NORMAL, label: 'z' }).drawMe(ug),
      ColorMapper.DARK_MODE,
    );
    expect(shapes(svg)[2]).toContain('fill="#000" style="stroke:#000;stroke-width:1;"');
  });
});
