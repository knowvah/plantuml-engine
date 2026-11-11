/** Fragments are `cov-vlinks-all.svg` and `cov-link-reversed-v.svg`. */
import { describe, expect, it } from 'vitest';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { WArrowDirection } from '../../../src/diagrams/wire/WArrowDirection.js';
import { WLinkType } from '../../../src/diagrams/wire/WLinkType.js';
import { WLinkVertical } from '../../../src/diagrams/wire/WLinkVertical.js';
import { measurer, stringBounder, svgOf, wireSkinParam } from './helpers.js';
import { record } from '../../helpers/recording-ugraphic.js';

const STROKE = 'style="stroke:#000;stroke-width:1;"';

function linkOf(
  type: WLinkType,
  direction: WArrowDirection,
  x: number,
  label = 'n',
  start = 90,
  destination = 220,
): WLinkVertical {
  const skinParam = wireSkinParam();
  return new WLinkVertical({
    skinParam,
    start: new UTranslate(x, start),
    destination,
    type,
    direction,
    color: undefined,
    label: Display.getWithNewlines(skinParam.getPragma(), label),
  });
}

function shapes(svg: string): string[] {
  return [...svg.matchAll(/<(?:path|line|rect|text)\b[^>]*?(?:\/>|>[^<]*<\/text>)/g)].map((m) => m[0]);
}

describe('WLinkVertical (WLinkVertical.java:87-172)', () => {
  it('NORMAL/NORMAL', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.NORMAL, WArrowDirection.NORMAL, 25).drawMe(ug)))).toEqual([
      '<path d="M25,218 L30,213 L20,213 L25,218" fill="#000"/>',
      `<line x1="25" y1="91" x2="25" y2="219" ${STROKE}/>`,
    ]);
  });

  it('NORMAL/BOTH', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.NORMAL, WArrowDirection.BOTH, 40).drawMe(ug)))).toEqual([
      '<path d="M40,218 L45,213 L35,213 L40,218" fill="#000"/>',
      '<path d="M40,91 L45,96 L35,96 L40,91" fill="#000"/>',
      `<line x1="40" y1="91" x2="40" y2="219" ${STROKE}/>`,
    ]);
  });

  it('NORMAL/REVERSE', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.NORMAL, WArrowDirection.REVERSE, 55).drawMe(ug)))).toEqual([
      '<path d="M55,91 L60,96 L50,96 L55,91" fill="#000"/>',
      `<line x1="55" y1="91" x2="55" y2="219" ${STROKE}/>`,
    ]);
  });

  it('NORMAL/NONE', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.NORMAL, WArrowDirection.NONE, 70).drawMe(ug)))).toEqual([
      `<line x1="70" y1="91" x2="70" y2="219" ${STROKE}/>`,
    ]);
  });

  it('BUS/NORMAL', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.BUS, WArrowDirection.NORMAL, 85).drawMe(ug)))).toEqual([
      `<path d="M85,91 L85,204 L80,204 L90,219 L100,204 L95,204 L95,91 L85,91" ${STROKE} fill="#FFF"/>`,
    ]);
  });

  it('BUS/BOTH', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.BUS, WArrowDirection.BOTH, 110).drawMe(ug)))).toEqual([
      `<path d="M115,91 L105,106 L110,106 L110,204 L105,204 L115,219 L125,204 L120,204 L120,106 L125,106 L115,91" ${STROKE} fill="#FFF"/>`,
    ]);
  });

  it('BUS/REVERSE', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.BUS, WArrowDirection.REVERSE, 135).drawMe(ug)))).toEqual([
      `<path d="M140,91 L130,106 L135,106 L135,219 L145,219 L145,106 L150,106 L140,91" ${STROKE} fill="#FFF"/>`,
    ]);
  });

  it('BUS/NONE', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.BUS, WArrowDirection.NONE, 160).drawMe(ug)))).toEqual([
      `<path d="M160,91 L160,219 L170,219 L170,91 L160,91" ${STROKE} fill="#FFF"/>`,
    ]);
  });

  it('reversed: a negative length (cov-link-reversed-v)', () => {
    expect(shapes(svgOf((ug) => linkOf(WLinkType.BUS, WArrowDirection.NORMAL, 40, 'n', 280, 30).drawMe(ug)))).toEqual([
      `<path d="M40,281 L40,14 L35,14 L45,29 L55,14 L50,14 L50,281 L40,281" ${STROKE} fill="#FFF"/>`,
    ]);
  });

  it('never draws its label, though it has one (java:87-96 does not call getTextBlock)', () => {
    const events = record(measurer, (ug) => linkOf(WLinkType.NORMAL, WArrowDirection.NORMAL, 25, 'label').drawMe(ug));
    expect(events.map((e) => ('draw' in e ? e.draw : ''))).toEqual(['UPath', 'ULine(0,128)']);
  });

  it('getTextBlock is the 10 pt label block the Java builds and never calls', () => {
    expect(
      linkOf(WLinkType.NORMAL, WArrowDirection.NORMAL, 25, 'label')
        .getTextBlock()
        .calculateDimension(stringBounder)
        .getHeight(),
    ).toBe(10);
  });
});
