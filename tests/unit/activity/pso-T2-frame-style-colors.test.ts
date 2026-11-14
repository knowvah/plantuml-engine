import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { resolveTheme, type Theme } from '../../../src/core/theme.js';
import { renderComposite } from '../../../src/diagrams/activity/activity-renderer-composite.js';
import type { ActivityNodeGeo } from '../../../src/diagrams/activity/activity-geometry.types.js';
import { withActivityMeasurer } from '../../../src/diagrams/activity/activity-string-bounder.js';
import { renderDbgMarkup } from '../../oracle/svg-conformance/document-background.js';
import { DIAGRAM_STYLE_SCOPE_ROOT, firstScopeDiffs } from '../../oracle/svg-conformance/diagram-style-scope.js';

/**
 * pso T2: an activity frame's fill, line and title colour come off its ONE merged style, `stylePartition`
 * (`CommandPartition3.java:160-161`, read by `FtileGroup.java:99-102`), whose builder is the one current at the
 * command. Two converted skinparams on one signature (`Partition*` on `composite`, `FromSkinparamToStyle.java:131-133`;
 * the symbol's own key, `:127-129,212,223`) are equally specific, so the later declaration wins
 * (`ValueImpl.java:51-55`, `DarkString.java:54-57`), and a key declared after the frame never reaches it.
 * Every expected value is read from the row's jar oracle, `tests/fixtures/diagram-style-scope/<row>.svg`.
 */
const DIFF_LIMIT = 500;
const FLAT = '#123456';

/** The frame's colours as an SVG draws them: the outline's fill and stroke, the tab path's stroke, the title's fill. */
interface FrameInk {
  readonly fill: string | undefined;
  readonly stroke: string | undefined;
  readonly tabStroke: string | undefined;
  readonly title: string | undefined;
}

/** A shape's stroke, as a `style` declaration (the jar-compatible output) or as an attribute. */
function strokeOf(tag: string | undefined): string | undefined {
  if (tag === undefined) return undefined;
  return /stroke:([^;"]*)/.exec(tag)?.[1] ?? /\bstroke="([^"]*)"/.exec(tag)?.[1];
}

/** The frame is the first `rect`/`polygon` that is not the document's background (`x="0" y="0"`, drawn under
 *  `skinparam mode dark`); the tab is the first `path` before the title, the title the first `text`. */
function frameInk(svg: string): FrameInk {
  const shapes = svg.match(/<(?:rect|polygon)\b[^>]*>/g) ?? [];
  const shape = shapes.find((tag) => !/\bx="0" y="0"/.test(tag)) ?? '';
  const titleAt = svg.indexOf('<text');
  const head = titleAt < 0 ? svg : svg.slice(0, titleAt);
  const title = /<text\b[^>]*>/.exec(svg)?.[0] ?? '';
  return {
    fill: /\bfill="([^"]*)"/.exec(shape)?.[1],
    stroke: strokeOf(shape),
    tabStroke: strokeOf(/<path\b[^>]*>/.exec(head)?.[0]),
    title: /\bfill="([^"]*)"/.exec(title)?.[1],
  };
}

function fixture(row: string, ext: 'puml' | 'svg'): string {
  return readFileSync(join(DIAGRAM_STYLE_SCOPE_ROOT, `${row}.${ext}`), 'utf8');
}

function rendered(row: string): string {
  return renderDbgMarkup(fixture(row, 'puml'));
}

const KEYS = ['background', 'border', 'font'] as const;
const ORDERS = ['partition-then-own', 'own-then-partition'] as const;

/** `rectangle`, `card`, `package`: both orders of each key. `group` reads `package*` (`FromSkinparamToStyle.java:127-128`)
 *  for its back and line only. */
const ORDER_ROWS: readonly string[] = [
  ...['rectangle', 'card', 'package'].flatMap((symbol) =>
    KEYS.flatMap((key) => ORDERS.map((order) => `activity__frameorder-${symbol}-${key}-${order}`)),
  ),
  ...['background', 'border'].flatMap((key) => ORDERS.map((order) => `activity__frameorder-group-${key}-${order}`)),
];

/** Position (`builderAtPosition`) and `transparent` (`#00000000`, printed `none`, `SvgGraphics.java:517-525`). */
const POSITION_ROWS: readonly string[] = [
  'activity__frameorder-rectangle-background-frame-then-own',
  'activity__frameorder-rectangle-background-own-then-frame-then-partition',
  'activity__frameorder-rectangle-background-partition-then-own-transparent',
];

/** Authored at T2: a `skinparam partition { }` block (`SkinparamBlock`, keys `PartitionBorderColor` and
 *  `PartitionFontColor`) against the symbol's key, a stereotype key, and `skinparam mode dark`. */
const PUSH_FORWARD_ROWS: readonly string[] = [
  'activity__frameorder-rectangle-font-partition-block-then-own',
  'activity__frameorder-rectangle-border-own-then-partition-block',
  'activity__frameorder-rectangle-background-stereo-then-partition',
  'activity__frameorder-rectangle-background-partition-then-own-dark',
  'activity__frameorder-rectangle-dark-default',
];
const ROWS: readonly string[] = [...ORDER_ROWS, ...POSITION_ROWS, ...PUSH_FORWARD_ROWS];

describe('pso T2: frame colours off the merged partition style (FtileGroup.java:99-102)', () => {
  it.each(ROWS)('%s: fill, line, tab and title as the jar', (row) => {
    expect(frameInk(rendered(row))).toEqual(frameInk(fixture(row, 'svg')));
  });

  it('the last declaration wins: rectangleBackgroundColor after Partition* fills #AAA, before it #BBB', () => {
    expect(frameInk(rendered('activity__frameorder-rectangle-background-partition-then-own')).fill).toBe('#AAA');
    expect(frameInk(rendered('activity__frameorder-rectangle-background-own-then-partition')).fill).toBe('#BBB');
  });

  it('a key declared after the frame does not reach it (CommandPartition3.java:160-161)', () => {
    expect(frameInk(rendered('activity__frameorder-rectangle-background-frame-then-own')).fill).toBe('none');
    expect(frameInk(rendered('activity__frameorder-rectangle-background-own-then-frame-then-partition')).fill).toBe(
      '#AAA',
    );
  });

  it('a later transparent beats an earlier colour and prints none', () => {
    expect(frameInk(rendered('activity__frameorder-rectangle-background-partition-then-own-transparent')).fill).toBe(
      'none',
    );
  });

  it.each(ROWS)('%s: whole row at 0 diffs', (row) => {
    expect(firstScopeDiffs(row, DIFF_LIMIT)).toEqual([]);
  });
});

describe('pso T2: a hand-built theme with no compositeStyleOf keeps the flat tiers (D2)', () => {
  function flatTheme(): Theme {
    const base = resolveTheme();
    const graph = { ...base.colors.graph, partitionBackground: FLAT, partitionBorder: FLAT };
    return withActivityMeasurer({ ...base, colors: { ...base.colors, graph } }, new DeterministicMeasurer());
  }

  it('reads graph.partition* when the node carries no compositeStyle', () => {
    const node: ActivityNodeGeo = { id: 'n', kind: 'partition', x: 10, y: 10, width: 60, height: 40, label: 'F' };
    const theme = flatTheme();
    expect(theme.colors.graph.activity?.compositeStyleOf).toBeUndefined();
    const ink = frameInk(renderComposite(node, theme));
    expect(ink).toEqual({ fill: FLAT, stroke: FLAT, tabStroke: FLAT, title: '#000' });
  });
});
