/**
 * The inline creole of a json/yaml cell: `<color:..>`, `<b>`, `**bold**`, `""mono""`, ... .
 *
 * `TextBlockJson#getTextBlock` builds every cell with `Display#create0(.., CreoleMode.NO_CREOLE, ..)`
 * (`TextBlockJson.java:345-347`). `NO_CREOLE` only keeps `CreoleStripeSimpleParser` from classifying a whole
 * line as a heading, list, table or rule (`CreoleStripeSimpleParser.java:86-90`); the stripe still scans the
 * line with the `OTHER` command map (`StripeSimple.java:112-115`, `CommandCreoleBuilder.java:76-109`), so a
 * colour, size, bold, italic, ... tag inside a cell is consumed and its atoms are drawn in their own font.
 * The jar draws `<color:D4312C>0x00` as `0x00` in `#D4312C` (juxugu-89-beki062, mocatu-19-jivi646).
 *
 * The runs come from the shared creole run seam (`creoleTextLines`, the lexer description draws with), in
 * `NO_CREOLE` mode. A cell with no effective markup answers `undefined`, so the plain-text path (`Fission`
 * words, json tab stops) keeps drawing it unchanged. A run with a size change, a link, an image or a bullet
 * also answers `undefined`: those change the row's height or add elements this module does not draw.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/jsondiagram/TextBlockJson.java:341-349
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/StripeSimple.java:105-116
 */
import type { StringMeasurer } from '../../core/measurer.js';
import { emittedTextForm } from '../../core/svg.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { creoleTextLines, type CreoleTextRun } from '../../core/svek/image/creole-text-lines.js';
import type { CellFont } from './text-block-style.js';
import { hasTab } from './tab-stops.js';

/** What a creole run is drawn with, on top of its cell's style. */
export interface CellRunStyle {
  /** The run's own colour; absent means the cell style's. */
  readonly fill?: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
  readonly strike: boolean;
  /** The run's own family (`monospaced` for `""x""`); absent means the cell's. */
  readonly family?: string;
}

/** One drawn run. `dx` is from the line's start x, `textLength` the width of the emitted form. */
export interface CreoleCellRun {
  readonly text: string;
  readonly dx: number;
  readonly width: number;
  readonly textLength: number;
  readonly style: CellRunStyle;
}

/** One drawn line: the visible text, its width and its runs. */
export interface CreoleCellLine {
  readonly text: string;
  readonly width: number;
  readonly runs: readonly CreoleCellRun[];
}

/**
 * The colour an untagged run carries through `creoleTextLines`: the cell's style colour is not known to this
 * layer, so a run is "coloured by a tag" exactly when its colour differs from this marker. A tag that names
 * the marker itself is not distinguishable, and no tag does.
 */
const UNTAGGED_COLOR = '#01020304';

/** True when a run adds nothing to the plain-text path: no colour, no style flag, the cell's own family. */
function isPlainRun(run: CreoleTextRun, font: CellFont): boolean {
  const { bold, italic, underline, strike } = run.style;
  return (
    run.color === UNTAGGED_COLOR &&
    !bold &&
    !italic &&
    !underline &&
    !strike &&
    (run.family ?? font.family) === font.family
  );
}

/** A run this module draws as one `<text>` at the cell's own size and baseline. */
function isDrawableRun(run: CreoleTextRun, font: CellFont): boolean {
  return (
    run.image === undefined &&
    run.rollback === undefined &&
    run.bullet === undefined &&
    run.url === undefined &&
    run.dy === 0 &&
    run.unmutedSize === undefined &&
    run.size === font.size &&
    !hasTab(run.text)
  );
}

function styleOf(run: CreoleTextRun, font: CellFont): CellRunStyle {
  return {
    ...(run.color === undefined || run.color === UNTAGGED_COLOR ? {} : { fill: run.color }),
    ...run.style,
    ...(run.family === undefined || run.family === font.family ? {} : { family: run.family }),
  };
}

function placeRuns(runs: readonly CreoleTextRun[], font: CellFont, measurer: StringMeasurer): CreoleCellRun[] {
  let dx = 0;
  return runs
    .filter((run) => run.text !== '')
    .map((run) => {
      const width = measurer.measure(run.text, font).width;
      const placed = {
        text: run.text,
        dx,
        width,
        textLength: measurer.measure(emittedTextForm(run.text), font).width,
        style: styleOf(run, font),
      };
      dx += width;
      return placed;
    });
}

/**
 * The lines one cell segment draws as, or `undefined` when the plain-text path draws it. `wrap` is the cell's
 * `MaximumWidth` (`0` = none); a segment holding a real line feed stays on the plain path, which keeps it
 * inside its line.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/jsondiagram/TextBlockJson.java:341-349
 */
export function creoleCellLines(
  segment: string,
  font: CellFont,
  wrap: number,
  measurer: StringMeasurer,
): readonly CreoleCellLine[] | undefined {
  if (segment === '' || segment.includes('\n') || hasTab(segment)) return undefined;
  const lines = creoleTextLines(segment, font, measurer, {
    wrapWidth: wrap,
    mode: CreoleMode.NO_CREOLE,
    baseColor: UNTAGGED_COLOR,
  });
  const runs = lines.flatMap((line) => (line.kind === 'text' ? line.runs : []));
  if (lines.length === 0 || runs.length !== lines.reduce((n, l) => n + l.runs.length, 0)) return undefined;
  if (runs.every((run) => isPlainRun(run, font)) || !runs.every((run) => isDrawableRun(run, font))) return undefined;
  return lines.map((line) => {
    const placed = placeRuns(line.runs, font, measurer);
    return { text: line.runs.map((r) => r.text).join(''), width: line.width, runs: placed };
  });
}
