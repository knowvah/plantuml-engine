/**
 * lae T3a (#158): a legacy activity diagram with `!pragma layout elk` is laid out by `CucaDiagramFileMakerElk`
 * (`CucaDiagram.java:478-479`) and never falls back to dot-engine: with no backend the layout throws
 * `ELK_RENDER_SYNC_UNSUPPORTED`. The size is `MyElkDrawing#calculateDimension`; the jar's `pragma-elk.svg` is that plus
 * the document margins (`CucaDiagram#getDefaultMargins`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import type { ElkBackend } from '../../../src/core/elk/elk-backend.js';
import { ELK_RENDER_SYNC_UNSUPPORTED } from '../../../src/core/elk/layout-services.js';
import { loadElk } from '../../../src/core/elk/load-elk.js';
import { activityLegacyPlugin } from '../../../src/diagrams/activity-legacy/index.js';
import { renderSync } from '../../../src/index.js';
import { layoutActivityLegacy } from '../../../src/diagrams/activity-legacy/layout.js';
import { calculateMargin } from '../../../src/diagrams/activity-legacy/renderer-document.js';
import { MEASURER, parseThroughPreprocessor } from '../../helpers/legacy-activity-dot.js';

const FIXTURES = join(import.meta.dirname, '../../fixtures/activity-legacy');

function diagramOf(slug: string) {
  return parseThroughPreprocessor(readFileSync(join(FIXTURES, `${slug}.puml`), 'utf8'));
}

/** The jar's `<svg width height>` of an authored fixture. */
function jarSizeOf(slug: string): [number, number] {
  const svg = readFileSync(join(FIXTURES, `${slug}.svg`), 'utf8');
  const m = /viewBox="0 0 (\d+) (\d+)"/.exec(svg)!;
  return [Number(m[1]), Number(m[2])];
}

let elk: ElkBackend;
beforeAll(async () => {
  elk = await loadElk();
});

describe('layoutActivityLegacy under !pragma layout elk', () => {
  it('throws ELK_RENDER_SYNC_UNSUPPORTED with no backend, rather than laying out with dot-engine', () => {
    expect(() => layoutActivityLegacy(diagramOf('pragma-elk'), MEASURER)).toThrow(ELK_RENDER_SYNC_UNSUPPORTED);
  });

  it("returns the MyElkDrawing, sized as the jar's svg less the document margins", () => {
    const diagram = diagramOf('pragma-elk');
    const geometry = layoutActivityLegacy(diagram, MEASURER, elk);
    const margin = calculateMargin(diagram);
    const [jarWidth, jarHeight] = jarSizeOf('pragma-elk');

    expect(geometry.elk).toBeDefined();
    expect(geometry.nodes).toEqual([]);
    expect(geometry.dot).toEqual({ nodes: [], edges: [] });
    expect(geometry.width).toBeCloseTo(49.0125, 3);
    expect(geometry.height).toBe(173);
    // `SvgGraphics#ensureVisible`: the canvas is `(int) x + 1` of the margined block (svg-graphics-core.ts:179-182).
    expect(Math.trunc(geometry.width + margin.getLeft() + margin.getRight()) + 1).toBe(jarWidth);
    expect(Math.trunc(geometry.height + margin.getTop() + margin.getBottom()) + 1).toBe(jarHeight);
  });

  it('runs no simplifier: an inner activity stays a group (an ELK cluster)', () => {
    const diagram = diagramOf('elk-lap-inner-brace');
    layoutActivityLegacy(diagram, MEASURER, elk);

    expect(diagram.groups().map((g) => g.getGroupType())).toEqual(['INNER_ACTIVITY']);
  });

  it('a diagram without the pragma keeps the svek path, backend or not', () => {
    const diagram = diagramOf('lap-basic');
    const geometry = layoutActivityLegacy(diagram, MEASURER, elk);

    expect(geometry.elk).toBeUndefined();
    expect(geometry.nodes.map((n) => n.entity)).toEqual(diagram.leafs());
  });
});

describe('renderSync of a legacy diagram with !pragma layout elk', () => {
  const source = readFileSync(join(FIXTURES, 'pragma-elk.puml'), 'utf8');

  it('draws the jar\'s orthogonal <line> sections and no <g class="link"> with options.elk', () => {
    const svg = renderSync(source, { measurer: MEASURER, elk });

    expect(svg.match(/<line /g)?.length).toBe(2);
    expect(svg).not.toContain('class="link"');
  });

  it('draws the error page naming options.elk without it, never a dot-engine layout', () => {
    const svg = renderSync(source, { measurer: MEASURER });

    expect(svg).toContain('!pragma layout elk is not supported in renderSync without options.elk');
    expect(svg).not.toContain('data-diagram-type="ACTIVITY"');
  });
});

describe('activityLegacyPlugin.requiresElk', () => {
  it('answers isUseElk(): true for pragma-elk, false for lap-basic', () => {
    expect(activityLegacyPlugin.requiresElk!(diagramOf('pragma-elk'))).toBe(true);
    expect(activityLegacyPlugin.requiresElk!(diagramOf('lap-basic'))).toBe(false);
  });
});
