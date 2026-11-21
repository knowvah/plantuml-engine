/**
 * `TileText` — one run of raw text (no creole) in a {@link SingleLine}: its
 * height is the font's, at least 10, plus `|getSpace()|`; each token is drawn
 * at `y = getSpace()`, the baseline being placed by the line (`maxDeltaY`).
 * The url slot is not ported: `SingleLine.rawText` always passes `null`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TileText.java:50-141
 */
import { BLOCK_E1_REAL_TABULATION } from '../../tim/builtin/jaws-constants.js';
import { Fore } from '../Fore.js';
import type { StringBounder } from '../font/StringBounder.js';
import { XDimension2D } from '../geom/XDimension2D.js';
import type { UGraphic } from '../UGraphic.js';
import { UTranslate } from '../UTranslate.js';
import { TextBlockMemoized } from './TextBlockMemoized.js';
import { getSpace, UText, type FontConfiguration } from './UText.js';

/** `if (h < 10) h = 10;`. @see TileText.java:69-71 */
const MIN_HEIGHT = 10;

/** The tab stop is the width of eight spaces. @see TileText.java:83-85 */
const TAB_STRING = '        ';

/** `new StringTokenizer(text, "\t" + BLOCK_E1_REAL_TABULATION, true)`: the tokens, delimiters kept. */
function tokenize(text: string): string[] {
  const tabs = `\t${BLOCK_E1_REAL_TABULATION}`;
  const tokens: string[] = [];
  let current = '';
  for (const ch of text) {
    if (!tabs.includes(ch)) {
      current += ch;
      continue;
    }
    if (current !== '') tokens.push(current);
    tokens.push(ch);
    current = '';
  }
  if (current !== '') tokens.push(current);
  return tokens;
}

function isTab(token: string): boolean {
  return token === '\t' || token === BLOCK_E1_REAL_TABULATION;
}

/** "a string bounder may give no width to blanks: x % 0 would be NaN". @see TileText.java:103-104 */
function nextTabStop(x: number, tabSize: number): number {
  const remainder = tabSize > 0 ? x % tabSize : 0;
  return x + tabSize - remainder;
}

export class TileText extends TextBlockMemoized {
  /** @see TileText.java:56-60 */
  constructor(
    private readonly text: string,
    private readonly fontConfiguration: FontConfiguration,
  ) {
    super();
  }

  /** @see TileText.java:62-77 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const rect = stringBounder.calculateDimension(this.fontConfiguration, this.text);
    const spaceBottom = Math.abs(getSpace(this.fontConfiguration));
    const h = Math.max(rect.getHeight(), MIN_HEIGHT);
    const width = tokenize(this.text).some(isTab) ? this.getWidth(stringBounder) : rect.getWidth();
    return new XDimension2D(width, h + spaceBottom);
  }

  /** @see TileText.java:79-81 */
  getFontSize2D(): number {
    return this.fontConfiguration.size;
  }

  private getTabSize(stringBounder: StringBounder): number {
    return stringBounder.calculateDimension(this.fontConfiguration, TAB_STRING).getWidth();
  }

  /** `ypos` is `space` either way (the negative branch's arithmetic is commented out upstream). @see TileText.java:87-122 */
  drawU(ug: UGraphic): void {
    const colored = ug.apply(new Fore(this.fontConfiguration.hColor ?? this.fontConfiguration.color ?? '#000000'));
    const tabSize = this.getTabSize(colored.getStringBounder());
    const ypos = getSpace(this.fontConfiguration);
    let x = 0;
    for (const s of tokenize(this.text)) {
      if (isTab(s)) {
        x = nextTabStop(x, tabSize);
        continue;
      }
      const dim = colored.getStringBounder().calculateDimension(this.fontConfiguration, s);
      colored.apply(new UTranslate(x, ypos)).draw(UText.build(s, this.fontConfiguration));
      x += dim.getWidth();
    }
  }

  /** @see TileText.java:124-141 */
  private getWidth(stringBounder: StringBounder): number {
    const tabSize = this.getTabSize(stringBounder);
    let x = 0;
    for (const s of tokenize(this.text)) {
      if (isTab(s)) x = nextTabStop(x, tabSize);
      else x += stringBounder.calculateDimension(this.fontConfiguration, s).getWidth();
    }
    return x;
  }
}
