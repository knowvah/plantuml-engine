/**
 * laep T2b: the geometry `layoutActivityLegacy` hands the renderer, against the positions the jar drew
 * (cached `in.svg` of the rows; the jar's frame is ours plus a constant translation, which T2c owns, so the
 * checks are distances inside one frame and the numbers the engine reports).
 */
import { describe, expect, it } from 'vitest';
import { activityLegacyPlugin } from '../../../src/diagrams/activity-legacy/index.js';
import { layoutActivityLegacy } from '../../../src/diagrams/activity-legacy/layout.js';
import { MEASURER, parseThroughPreprocessor, rowSource } from '../../helpers/legacy-activity-dot.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { emptyDiagram } from './helpers.js';

const geometryOf = (slug: string) =>
  layoutActivityLegacy(parseThroughPreprocessor(rowSource('activity', slug)), MEASURER);

describe('layoutActivityLegacy', () => {
  it('bokuba-91-poda774: one column, the jar ranks 60/72/48/48/72 apart (oracle in.svg tops 6/66/138/186/234/306)', () => {
    const geometry = geometryOf('bokuba-91-poda774');

    expect(geometry.nodes.map((n) => n.entity.getName())).toEqual([
      'start',
      'VerifyReservation',
      'Y1',
      'Y2',
      'GiveTravelDocumentation',
      'end',
    ]);
    expect(geometry.nodes.map((n) => n.y)).toEqual([0, 60, 132, 180, 228, 300]);
    for (const node of geometry.nodes) expect(node.x + node.width / 2).toBeCloseTo(79.37, 1);
  });

  it('bokuba-91-poda774: the first spline starts under the start circle (oracle path M86.37,26.44 - 7, 6)', () => {
    const edge = geometryOf('bokuba-91-poda774').edges[0]!;

    expect(edge.points[0]!.x).toBeCloseTo(79.37, 2);
    expect(edge.points[0]!.y).toBeCloseTo(20.44, 2);
    expect(edge.points.at(-1)!.y).toBeCloseTo(59.56, 2);
    expect(edge.link.getEntity1().getName()).toBe('start');
  });

  it('cozepi-30-jenu085: two partitions boxed 66 wide around their nodes, 105 between the two activities', () => {
    const geometry = geometryOf('cozepi-30-jenu085');
    const [first, second] = geometry.clusters;
    const [start, a1, a2] = geometry.nodes;

    expect(first!.group.getName()).toBe('P1');
    expect(second!.group.getName()).toBe('P2');
    expect([first!.width, first!.height, second!.width, second!.height]).toEqual([66, 141, 66, 81]);
    expect(a2!.y - a1!.y).toBe(105);
    expect(a1!.y - start!.y).toBe(60);
    expect(first!.x).toBeLessThan(a1!.x);
    expect(first!.y + first!.height).toBeLessThan(second!.y + second!.height);
    expect(first!.label?.width).toBe(17);
  });

  it('a note link keeps its label table centre (guzecu-01-didu313: two minlen 0 links, no label)', () => {
    const geometry = geometryOf('guzecu-01-didu313');

    expect(geometry.edges).toHaveLength(4);
    expect(geometry.edges.filter((e) => e.link.getLength() === 1)).toHaveLength(2);
    expect(geometry.edges.every((e) => e.points.length >= 4)).toBe(true);
  });

  it('a labelled link reports the label centre (petora-44-nafe514: [true] is 20 wide)', () => {
    const geometry = geometryOf('petora-44-nafe514');
    const labelled = geometry.edges.filter((e) => e.labelX !== undefined);

    expect(labelled.length).toBeGreaterThan(0);
    expect(labelled.some((e) => e.labelWidth === 20)).toBe(true);
  });

  it('a diagram with nothing in it is the 10x10 of EntityImageSimpleEmpty', () => {
    const geometry = layoutActivityLegacy(emptyDiagram(), MEASURER);

    expect([geometry.width, geometry.height, geometry.nodes.length]).toEqual([10, 10, 0]);
  });

  it('the plugin lays out through layoutActivityLegacy', () => {
    const diagram = parseThroughPreprocessor(rowSource('activity', 'bokuba-91-poda774'));
    const { geometry } = activityLegacyPlugin.layoutSync(diagram, defaultTheme, MEASURER);

    expect(geometry.nodes).toHaveLength(6);
    expect(geometry.dot.rankDir).toBeUndefined();
  });

  it('an autarkic group is one leaf of the parent pass: start and the 61.625 x 115 group (fozoxu-26-fibu076)', () => {
    const { nodes, edges } = geometryOf('fozoxu-26-fibu076');

    expect(nodes.map((n) => [n.entity.getName(), n.width, n.height])).toEqual([
      ['start', 20, 20],
      ['##2', 61.625, 115],
    ]);
    expect(edges).toHaveLength(1);
  });

  it('swimlane partitions solve as four lanes and the scaffolding stays out (cutuzu-67-sona398)', () => {
    const { nodes, clusters } = geometryOf('cutuzu-67-sona398');

    expect(clusters).toHaveLength(4);
    expect(nodes.map((n) => n.id).filter((id) => /Point|In/.test(id))).toEqual([]);
  });
});
