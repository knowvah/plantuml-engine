/**
 * `PSystemLicense` (version/PSystemLicense.java): `License#getText1` +
 * `#getText2` as one black-on-white `GraphicStrings` (java:87-92), or the two
 * halves around a distributor logo (java:94-116).
 *
 * Jar pin (`scripts/oracle-render.sh`, 1.2026.8beta1, `@startuml\nlicense\n@enduml`):
 * a 518 x 842 page of 61 `<text>` rows and three 99x99 qrcode `<image>`s for
 * line 16 (`License.java:145-146`). The port's page is the one the user ruled
 * on 2026-11-12 (#179; `License.test.ts` pins its 63 lines): no qrcode row, no
 * support or advertising lines, the MIT edition's `addMit` (D13), and the
 * ruling's header, images, GraphViz and credit lines.
 *
 * Every row sits on `GraphicStrings`' 12px line pitch from the 5px margin
 * (baseline 14.333). A line whose text the jar page also prints keeps the jar
 * row's x and textLength; an `addMit` line keeps the MIT edition's pin
 * (ufp-T3b, measured before the ruling). A line the ruling changed is
 * measured: `textLength` is the width of the trimmed text and each leading
 * space moves x by one space (DriverTextSvg.java:108-123), and a one-character
 * run carries no `textLength` (SvgGraphics.java `text.length() > 1`). The
 * derivation is checked against the jar pin for every unchanged line.
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { RasterImage } from '../../../src/core/error/raster-image.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { exportTo, stringBounderFor } from '../../../src/core/UgDiagram.js';
import { ColorMapper } from '../../../src/core/klimt/color/ColorMapper.js';
import { HColors } from '../../../src/core/klimt/color/HColors.js';
import { UFontFactory } from '../../../src/core/klimt/font/UFontFactory.js';
import { ClockwiseTopRightBottomLeft } from '../../../src/core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { DEFAULT_SVG_DECIMALS, formatDecimal } from '../../../src/core/svg-format.js';
import { getTextBlock, PSystemLicense } from '../../../src/diagrams/version/PSystemLicense.js';
import { License } from '../../../src/diagrams/version/License.js';
import { LicenseInfo } from '../../../src/diagrams/version/LicenseInfo.js';

const measurer = new DeterministicMeasurer();
const SOURCE: UmlSource = { lines: ['license'], type: 'sequence' };

/** `x y textLength` of each jar row in document order (`image x y WxH` for images). */
const JAR_LICENSE_ROWS = [
  '5 14.333 507.6',
  '5 26.333 -',
  '5 38.333 246.075',
  '5 50.333 -',
  '5 62.333 507.6',
  '5 74.333 -',
  '5 86.333 222',
  '5 98.333 -',
  '5 110.333 177.675',
  '5 122.333 -',
  '5 134.333 349.5',
  '5 146.333 -',
  '5 158.333 261.6',
  '5 170.333 269.7',
  '5 182.333 145.875',
  'image 31.4 185 99x99',
  'image 183.2 185 99x99',
  'image 335 185 99x99',
  '5 293.333 342.975',
  '5 305.333 360.525',
  '5 317.333 342.375',
  '5 329.333 175.125',
  '5 341.333 -',
  '5 353.333 301.875',
  '5 365.333 470.25',
  '5 377.333 406.275',
  '5 389.333 130.575',
  '5 401.333 -',
  '5 413.333 366.675',
  '5 425.333 351.075',
  '5 437.333 -',
  '5 449.333 417.45',
  '5 461.333 398.475',
  '5 473.333 107.325',
  '5 485.333 346.95',
  '5 497.333 -',
  '5 509.333 444.15',
  '5 521.333 392.25',
  '5 533.333 406.575',
  '5 545.333 90',
  '5 557.333 -',
  '5 569.333 437.7',
  '5 581.333 436.95',
  '5 593.333 295.95',
  '5 605.333 -',
  '5 617.333 455.25',
  '5 629.333 337.95',
  '5 641.333 135.225',
  '5 653.333 -',
  '5 665.333 407.925',
  '8.3 677.333 219.825',
  '5 689.333 210.375',
  '5 701.333 -',
  '5 713.333 313.05',
  '5 725.333 359.025',
  '5 737.333 410.625',
  '5 749.333 391.05',
  '5 761.333 338.85',
  '5 773.333 364.5',
  '5 785.333 458.7',
  '5 797.333 322.35',
  '5 809.333 378.9',
  '5 821.333 274.95',
  '5 833.333 -',
];

/** The MIT edition's `addMit` rows (License.java:243-263) + the blank of :190, as pinned before the ruling (y at 224.333 there). */
const PORT_MIT_ROWS = [
  '5 224.333 342.975',
  '5 236.333 189',
  '5 248.333 -',
  '5 260.333 208.5',
  '5 272.333 -',
  '5 284.333 367.05',
  '5 296.333 400.2',
  '5 308.333 361.95',
  '5 320.333 366.3',
  '5 332.333 368.25',
  '5 344.333 346.5',
  '5 356.333 -',
  '5 368.333 378.75',
  '5 380.333 270.525',
  '5 392.333 -',
  '5 404.333 496.95',
  '5 416.333 518.85',
  '5 428.333 534.6',
  '5 440.333 570.9',
  '5 452.333 539.325',
  '5 464.333 553.65',
  '5 476.333 -',
];

/** `GraphicStrings`' first baseline (5px margin + 9.333) and its 12px line pitch. */
const FIRST_BASELINE = 14.333;
const LINE_PITCH = 12;

/** The MIT pin's first-row baseline, before the ruling removed the support and qrcode rows. */
const PORT_MIT_FIRST_BASELINE = 224.333;

/**
 * Where each line of the ruling page comes from: a jar row index (`jar`), an
 * `addMit` pin row (`mit`, with `this MIT license.` / `... the MIT license.`
 * pinned by the MIT edition too), or `measured` for a line the ruling changed.
 */
type RowSource = { readonly jar: number } | { readonly mit: number } | { readonly port: string } | 'measured';

/** `this MIT license.` / `...without any reference to the MIT license.` (License.java:202, :204), MIT-edition pins. */
const MIT_NAME_ROWS = { thisMit: '5 0 86.625', referenceMit: '5 0 434.325' } as const;

const ROW_SOURCES: readonly RowSource[] = [
  { jar: 0 },
  { jar: 1 },
  'measured', // ruling item 1: name line
  { jar: 3 },
  { jar: 4 },
  { jar: 5 },
  'measured', // item 1: copyright
  'measured', // item 1: ported from
  { jar: 7 },
  'measured', // item 1: project info
  'measured', // item 1: PlantUML
  { jar: 9 },
  'measured', // item 3: addMit's first line
  ...Array.from({ length: 21 }, (_, i): RowSource => ({ mit: i + 1 })),
  'measured', // item 5: Images (SVG)
  { jar: 37 },
  { jar: 38 },
  { port: MIT_NAME_ROWS.thisMit },
  { jar: 40 },
  { port: MIT_NAME_ROWS.referenceMit },
  'measured', // item 5: plantuml-engine
  'measured', // item 5: appreciated
  { jar: 44 },
  { jar: 45 },
  { jar: 46 },
  { jar: 47 },
  { jar: 48 },
  'measured', // item 6
  'measured', // item 6 (leading space)
  'measured', // item 6
  { jar: 52 },
  { jar: 53 },
  { jar: 54 },
  { jar: 55 },
  { jar: 56 },
  { jar: 57 },
  { jar: 58 },
  { jar: 61 }, // Themes
  { jar: 62 }, // Twemoji
  'measured', // item 7: KaTeX
  'measured', // item 7: pako
  'measured', // item 7: xmldom
  { jar: 63 },
];

const PAGE_LINES = [
  ...License.getCurrent().getText1(LicenseInfo.NONE),
  ...License.getCurrent().getText2(LicenseInfo.NONE),
];

const sb = stringBounderFor(measurer);
/** `GraphicStrings`' `sansSerif(12)` in the bounder's `{family, size}` shape (`FontConfigurationBridge.ts`). */
const SANS_12 = UFontFactory.sansSerif(12);
const FONT = { family: SANS_12.getFontStack().getFullDefinition(), size: SANS_12.getSize() };
const SPACE = sb.calculateDimension(FONT, ' ').getWidth();

function fmt(value: number): string {
  return formatDecimal(value, DEFAULT_SVG_DECIMALS);
}

/**
 * `x textLength` of a line as DriverTextSvg draws it (java:108-123, SvgGraphics
 * `length() > 1`). A blank-only line is first turned into non-breaking spaces,
 * so it keeps x and carries one character (`driverTextPlacement`'s `nbspIfBlank`).
 */
function measuredRow(line: string): [string, string] {
  if (line.trim() === '') return [fmt(5), '-'];
  const leading = line.length - line.trimStart().length;
  const text = line.trim();
  const width = text.length > 1 ? fmt(sb.calculateDimension(FONT, text).getWidth()) : '-';
  return [fmt(5 + leading * SPACE), width];
}

function xAndLength(source: RowSource, line: string): [string, string] {
  if (source === 'measured') return measuredRow(line);
  const row =
    'jar' in source ? JAR_LICENSE_ROWS[source.jar] : 'mit' in source ? PORT_MIT_ROWS[source.mit] : source.port;
  const [x, , length] = (row ?? '').split(' ');
  return [x ?? '', length ?? ''];
}

const EXPECTED_ROWS = ROW_SOURCES.map((source, i) => {
  const [x, length] = xAndLength(source, PAGE_LINES[i] ?? '');
  return `${x} ${fmt(FIRST_BASELINE + LINE_PITCH * i)} ${length}`;
});

/**
 * `(int)` of the content plus the 2 x 5px margin plus 1, as both jar-era pins
 * show: the jar page 507.6 wide (its rule line) and 61 x 12 + 99 high is
 * 518 x 842; the pre-ruling MIT page 570.9 wide and 70 x 12 + 30 high was
 * 581 x 881. The ruling page is 63 x 12 = 756 high; its widest line is still
 * `addMit`'s 570.9 (no measured line is wider; checked below).
 */
const PAGE_SIZE = ['581px', '767px'];

/** `addMit`'s widest line, `AUTHORS OR COPYRIGHT HOLDERS ...` (License.java:261). */
const WIDEST = 570.9;

function rows(svg: string): string[] {
  return [...svg.matchAll(/<(text|image)([^>]*)>/g)].map((m) => {
    const attr = (name: string): string | undefined => new RegExp(` ${name}="([^"]*)"`).exec(m[2] ?? '')?.[1];
    if (m[1] === 'image')
      return `image ${attr('x') ?? ''} ${attr('y') ?? ''} ${attr('width') ?? ''}x${attr('height') ?? ''}`;
    return `${attr('x') ?? ''} ${attr('y') ?? ''} ${attr('textLength') ?? '-'}`;
  });
}

function rootAttr(svg: string, name: string): string | undefined {
  return new RegExp(` ${name}="([^"]*)"`).exec(/^<svg[^>]*>/.exec(svg)?.[0] ?? '')?.[1];
}

describe('the row derivation', () => {
  it('maps every one of the 63 ruling-page lines', () => {
    expect(ROW_SOURCES).toHaveLength(63);
    expect(PAGE_LINES).toHaveLength(63);
  });

  it('reproduces the jar pin and the MIT pin for every line it does not measure', () => {
    ROW_SOURCES.forEach((source, i) => {
      if (source === 'measured') return;
      expect(measuredRow(PAGE_LINES[i] ?? ''), `line ${String(i)}`).toEqual(xAndLength(source, PAGE_LINES[i] ?? ''));
    });
  });

  it("measures no ruling line wider than addMit's widest, so the page keeps its width", () => {
    const widths = ROW_SOURCES.flatMap((source, i) =>
      source === 'measured' ? [Number(measuredRow(PAGE_LINES[i] ?? '')[1])] : [],
    );
    expect(Math.max(...widths)).toBeLessThan(WIDEST);
    expect(Math.max(...EXPECTED_ROWS.map((row) => Number(row.split(' ')[2])).filter(Number.isFinite))).toBe(WIDEST);
  });

  it('places the MIT pin on the same pitch it was measured on', () => {
    expect(PORT_MIT_ROWS.map((row) => row.split(' ')[1])).toEqual(
      PORT_MIT_ROWS.map((_, i) => fmt(PORT_MIT_FIRST_BASELINE + LINE_PITCH * i)),
    );
  });
});

describe('PSystemLicense — the ruling license page (2026-11-12, #179)', () => {
  const svg = PSystemLicense.create(SOURCE, new PreprocessingArtifact()).exportDiagram(0, measurer);
  const ours = rows(svg);

  it('draws the 63 lines, each at its derived x / y / textLength', () => {
    expect(ours).toEqual(EXPECTED_ROWS);
  });

  it('draws the leading-space GraphViz line one space in, as the jar draws its archive line', () => {
    expect(ours[48]?.split(' ')[0]).toBe(JAR_LICENSE_ROWS[50]?.split(' ')[0]);
  });

  it('is PAGE_SIZE and embeds no qrcode image', () => {
    expect([rootAttr(svg, 'width'), rootAttr(svg, 'height')]).toEqual(PAGE_SIZE);
    expect(svg).not.toContain('<image ');
  });

  it('renders the same document three times', () => {
    const page = PSystemLicense.create(SOURCE, new PreprocessingArtifact());
    expect(new Set([0, 1, 2].map(() => page.exportDiagram(0, measurer))).size).toBe(1);
  });

  it('describes itself as (License) (java:70-72)', () => {
    expect(PSystemLicense.create(SOURCE, new PreprocessingArtifact()).getDescription()).toBe('(License)');
  });

  it('is its own text block, sized like the NONE licence block', () => {
    const page = PSystemLicense.create(SOURCE, new PreprocessingArtifact());
    const sb = stringBounderFor(measurer);
    expect(page.getTextBlock(0, sb)).toBe(page);
    expect(page.calculateDimension(sb)).toEqual(getTextBlock(LicenseInfo.NONE, undefined).calculateDimension(sb));
  });
});

describe('getTextBlock with a distributor logo (java:94-116)', () => {
  const sb = stringBounderFor(measurer);
  const LOGO: RasterImage = { width: 700, height: 30, href: 'data:image/png;base64,AAAA' };

  it('stacks text1, a 4px gap, the logo indented 20px, then text2', () => {
    const block = getTextBlock(LicenseInfo.NONE, LOGO);
    const svg = exportTo(
      {
        textBlock: block,
        backcolor: HColors.WHITE,
        margin: ClockwiseTopRightBottomLeft.same(0),
        scale: undefined,
        colorMapper: ColorMapper.IDENTITY,
        isHandwritten: false,
      },
      sb,
      measurer,
    );
    const r = rows(svg);
    // text1 is 5 lines in a 5px-margin GraphicStrings: 5 * 12 + 10 = 70 high.
    expect(r[5]).toBe('image 20 74 700x30');
    // text2's first row: 70 + 4 + 30 = 104, plus the 5px margin and the 9.333 baseline.
    expect(r[6]).toBe('5 118.333 -');
  });

  it('is as wide as the widest of the halves and 20 + the logo, as high as all four parts', () => {
    const dim = getTextBlock(LicenseInfo.NONE, LOGO).calculateDimension(sb);
    const plain = getTextBlock(LicenseInfo.NONE, undefined).calculateDimension(sb);
    expect(dim.getWidth()).toBe(720);
    // the two GraphicStrings each carry a 10px margin; the single one carries one.
    expect(dim.getHeight()).toBe(plain.getHeight() + 10 + 4 + 30);
  });
});
