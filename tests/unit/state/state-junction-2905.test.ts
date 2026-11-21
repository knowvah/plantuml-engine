/**
 * plantuml#2905, upstream `a0a410773aa`: `<<junction>>` is its own
 * `LeafType.JUNCTION` (`Stereogroup.java:127-128`), drawn by
 * `EntityImageCircleStart` (`GeneralImageBuilder.java:145-151`) as a filled
 * circle of `CircleStart.JUNCTION_SIZE` = 12 (`CircleStart.java:57,72`), and
 * a `ShapeType.CIRCLE` svek node.
 *
 * `tests/fixtures/state-junction-2905/junction-pseudostate.puml` is upstream's
 * `vega/state/junction-pseudostate.puml` (front matter stripped); the `.svg`
 * and `.dot` beside it are the jar's graphviz render and svek dump via
 * `scripts/oracle-render.sh` (a720bdd). Upstream's vega SVG forces Smetana,
 * so the graphviz render is the comparison target here. The commit's SCXML
 * fixture (`vega/scxml/junction-pseudostate.scxml`) has no counterpart: this
 * port has no SCXML exporter.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/CircleStart.java:54-78
 */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { setLayoutInputObserver, type DotInputGraph } from '../../../src/core/graph-layout.js';
import { CircleStart, JUNCTION_SIZE } from '../../../src/core/svek/image/CircleStart.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { parseSvekDot, dotInputToStructural, compareStructural } from '../../oracle/svek-dot.js';

const DIR = new URL('../../fixtures/state-junction-2905/', import.meta.url);
const read = (name: string) => readFileSync(new URL(name, DIR), 'utf8');

let captured: DotInputGraph[] = [];
beforeAll(() => setLayoutInputObserver(({ graph: g }) => captured.push(g)));
afterAll(() => setLayoutInputObserver(undefined));

describe('<<junction>> pseudostate (#2905)', () => {
  it('core CircleStart: a junction is 12x12, the default stays 20x20', () => {
    const colors = {} as never;
    const style = {} as never;
    const skin = { getIHtmlColorSet: () => undefined } as never;
    expect(JUNCTION_SIZE).toBe(12);
    expect(new CircleStart(skin, style, colors, true).calculateDimension({} as never).getWidth()).toBe(12);
    expect(new CircleStart(skin, style, colors).calculateDimension({} as never).getWidth()).toBe(20);
  });

  it('emits the junction as a 0.166667in circle, structurally equal to the jar DOT', () => {
    captured = [];
    renderSync(read('junction-pseudostate.puml'), { measurer: new DeterministicMeasurer() });
    expect(captured).toHaveLength(1);
    const ours = dotInputToStructural(captured[0]!);
    const jar = parseSvekDot(read('junction-pseudostate.dot'));
    const cmp = compareStructural(jar, ours);
    expect(cmp.structurallyEqual, JSON.stringify(cmp)).toBe(true);
    expect(cmp.maxSizeDeltaIn).toBe(0);
  });

  it('draws the jar SVG: a 6px-radius start_entity circle', () => {
    const ours = renderSync(read('junction-pseudostate.puml'), { measurer: new DeterministicMeasurer() });
    expect(ours).toContain('rx="6" ry="6"');
    expect(compareSvg(ours, read('junction-pseudostate.svg'), 'deterministic').diffs).toEqual([]);
  });
});
