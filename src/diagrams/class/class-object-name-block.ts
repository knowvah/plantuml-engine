/**
 * An object, map or json name as its creole sheet. Split from `class-object-map-header.ts` (500-line cap).
 */
import { parseWithNewlines } from '../../core/klimt/creole/DisplayNewlines.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { ATOM_TEXT_MIN_HEIGHT } from '../../core/svek/image/creole-sea-line.js';
import { buildHeaderLineMetrics } from './class-layout-header-creole.js';
import { objectDisplayText } from './class-object-display.js';

/** One name line, as `buildHeaderLineMetrics` builds it. */
interface NameLine {
  text: string;
  width: number;
  height: number;
  atoms: ReturnType<typeof buildHeaderLineMetrics>['headerLineAtoms'][number];
  render: ReturnType<typeof buildHeaderLineMetrics>['headerLineRender'][number];
}

/**
 * The name block: `entity.getDisplay().create(fcHeader, CENTER, skinParam)` (`EntityImageObject.java:98`,
 * `EntityImageMap.java:96`), a creole sheet of the display's lines, each centred and at least 10 tall
 * (`AtomText.java:179-181`).
 */
export function measureNameBlock(
  display: string,
  font: FontSpec,
  measurer: StringMeasurer,
): { lines: NameLine[]; width: number; height: number } {
  const metrics = buildHeaderLineMetrics(
    parseWithNewlines(Pragma.createEmpty(), objectDisplayText(display))!.lines,
    { family: font.family, size: font.size, bold: font.weight === 'bold', italic: font.style === 'italic' },
    measurer,
    { sprites: undefined, headerItalic: false, maxWidth: 0 },
  );
  const lines = metrics.headerDisplayLines.map((text, i): NameLine => {
    const atoms = metrics.headerLineAtoms[i];
    return {
      text,
      width: metrics.headerLineWidths[i]!,
      // A plain line is the bounder's own height, floored (`AtomText.java:179-181`); a markup line is its `Sea`'s.
      height:
        atoms === undefined
          ? Math.max(measurer.measure(text, font).height, ATOM_TEXT_MIN_HEIGHT)
          : metrics.headerLineHeights[i]!,
      atoms,
      render: metrics.headerLineRender[i],
    };
  });
  return {
    lines,
    width: Math.max(...lines.map((l) => l.width)),
    height: lines.reduce((sum, l) => sum + l.height, 0),
  };
}
