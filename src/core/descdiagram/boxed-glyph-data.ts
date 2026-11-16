/**
 * Captured outlines of the `BoxedCharacter` letter a domain draws in its corner (decisions D4).
 *
 * `EntityImageDomain` builds `new BoxedCharacter(typeLetter, 8, UFontFactory.byDefault(8), ...)`
 * (`EntityImageDomain.java:83-84`), whose `drawU` draws a `2r x 2r` box, then `UCenteredCharacter(c, font)` at its
 * centre (`BoxedCharacter.java:69-81`). `UFontFactory.byDefault` ignores its argument and answers `sansSerif(12)`
 * (`UFontFactory.java:66-68`), so the glyph is SansSerif plain 12, not size 8 (D4 amended 2026-11-16).
 * `DriverCenteredCharacterSvg` writes the glyph's AWT outline (`DriverCenteredCharacterSvg.java:72-81`), which a
 * browser cannot compute, so each letter is scraped from a jar render and stored at the box centre it was captured at,
 * the `core/spot-glyph-data.ts` mechanism.
 *
 * Source: `oracle/goldens/svg-description/component/dei-domain-each/golden.svg`. Cross-checked: `rukitu-26-seme622`'s
 * `C` (box `x=91.515 y=122`) is this `C` translated by (49.74, -17), byte for byte; `dei-domain-each`'s `<<Given>>`
 * `X` and `<<Uncertain>>` `B` match these translated.
 *
 * A letter with no capture draws nothing ({@link boxedGlyphPath} answers `undefined`): a glyph of another font or
 * letter would not be the jar's.
 */
import { NORMAL_FONT_FACE } from '../klimt/shape/UText.js';
import type { UFont } from '../klimt/font/UFont.js';
import { FontStack } from '../klimt/font/FontStack.js';
import { DEFAULT_SVG_DECIMALS, formatDecimal } from '../svg-format.js';

/** A captured outline and the box centre it was captured at. */
interface BoxedGlyph {
  readonly refCx: number;
  readonly refCy: number;
  readonly d: string;
}

/** The size of `UFontFactory.byDefault`'s font. @see UFontFactory.java:66-68 */
const BOXED_FONT_SIZE = 12;

/** SansSerif plain 12, exact-case letters (`GeneralImageBuilder.java:243-254`: `X`, `C`, `B`, `P`). */
const BOXED_GLYPHS: Readonly<Record<string, BoxedGlyph>> = {
  /** Other (`<<Other>>`): tag box `x=38.025 y=35`. */
  P: {
    refCx: 46.025,
    refCy: 43,
    d:
      'M43.644,47.5 L43.644,38.828 L46.005,38.828 Q47.576,38.828 48.261,39.358 ' +
      'Q48.947,39.889 48.947,41.102 Q48.947,42.484 48.009,43.27 Q47.072,44.055 ' +
      '45.408,44.055 L44.863,44.055 L44.863,47.5 Z M44.863,43.123 L45.361,43.123 ' +
      'Q46.457,43.123 47.054,42.619 Q47.652,42.115 47.652,41.195 Q47.652,40.416 ' +
      '47.183,40.082 Q46.714,39.748 45.619,39.748 L44.863,39.748 Z',
  },
  /** Lex (`<<Lexical>>`): tag box `x=331.775 y=35`. */
  X: {
    refCx: 339.775,
    refCy: 43,
    d:
      'M335.869,47.5 L338.746,43.146 L336.009,38.828 L337.463,38.828 L339.548,42.098 ' +
      'L341.74,38.828 L342.9,38.828 L340.129,43.018 L342.97,47.5 L341.517,47.5 ' +
      'L339.314,44.061 L337.035,47.5 Z',
  },
  /** Cau (`<<Causal>>`): tag box `x=41.775 y=139`. */
  C: {
    refCx: 49.775,
    refCy: 147,
    d:
      'M49.859,151.717 Q47.838,151.717 46.736,150.53 Q45.634,149.344 45.634,147.17 ' +
      'Q45.634,145.002 46.756,143.807 Q47.879,142.611 49.918,142.611 Q51.084,142.611 ' +
      '52.648,142.992 L52.648,144.146 Q50.867,143.531 49.9,143.531 Q48.488,143.531 ' +
      '47.714,144.486 Q46.941,145.441 46.941,147.182 Q46.941,148.84 47.767,149.798 ' +
      'Q48.593,150.756 50.023,150.756 Q51.254,150.756 52.66,150 L52.66,151.055 ' +
      'Q51.377,151.717 49.859,151.717 Z',
  },
  /** Bid (`<<Biddable>>`): tag box `x=136.46 y=139`. */
  B: {
    refCx: 144.46,
    refCy: 147,
    d:
      'M142.079,151.5 L142.079,142.828 L144.329,142.828 Q145.63,142.828 146.324,143.32 ' +
      'Q147.019,143.813 147.019,144.738 Q147.019,146.314 145.237,146.982 Q147.364,147.633 ' +
      '147.364,149.332 Q147.364,150.387 146.661,150.943 Q145.958,151.5 144.634,151.5 Z ' +
      'M143.298,150.58 L143.55,150.58 Q144.903,150.58 145.302,150.41 Q146.064,150.088 ' +
      '146.064,149.215 Q146.064,148.441 145.372,147.929 Q144.681,147.416 143.644,147.416 ' +
      'L143.298,147.416 Z M143.298,146.637 L143.69,146.637 Q144.675,146.637 145.217,146.215 ' +
      'Q145.759,145.793 145.759,145.025 Q145.759,143.748 143.778,143.748 L143.298,143.748 Z',
  },
};

const NUMBER_RE = new RegExp('-?\\d+(?:\\.\\d+)?', 'g');

/** True for the font `BoxedCharacter` draws with: `UFontFactory.sansSerif(12)`, plain. */
export function isBoxedCharacterFont(font: UFont): boolean {
  return (
    font.getFontStack().getFullDefinition() === FontStack.SANS_SERIF &&
    font.getFontFace() === NORMAL_FONT_FACE &&
    font.getSize() === BOXED_FONT_SIZE
  );
}

/** The captured outline of `letter`, translated so it centres on (`cx`, `cy`), or `undefined` when not captured. */
export function boxedGlyphPath(letter: string, cx: number, cy: number): string | undefined {
  const glyph = Object.hasOwn(BOXED_GLYPHS, letter) ? BOXED_GLYPHS[letter] : undefined;
  if (glyph === undefined) return undefined;
  const dx = cx - glyph.refCx;
  const dy = cy - glyph.refCy;
  let axis = 0;
  return glyph.d.replace(NUMBER_RE, (tok) => {
    const shifted = Number(tok) + (axis === 0 ? dx : dy);
    axis = 1 - axis;
    return formatDecimal(shifted, DEFAULT_SVG_DECIMALS);
  });
}
