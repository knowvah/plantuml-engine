/**
 * dei-T3b: `map` in the description factory (`DescriptionDiagramFactory.java:129`), drawn by the core
 * `EntityImageMap` (`GeneralImageBuilder.java:183-184`). Oracles are the jar's: the authored `dei-map-*` goldens and
 * the corpus row `unknown/liripi-72-kefa167`.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { setLayoutInputObserver, type LayoutInputEvent } from '../../../src/core/graph-layout.js';
import { Ports } from '../../../src/core/svek/Ports.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import { mapLinkOf } from '../../../src/diagrams/description/command-map.js';
import type { DescriptionDiagramAST } from '../../../src/diagrams/description/ast.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { renderFixtureSurveyStyle } from '../../oracle/svg-conformance/render-fixture.js';

const AUTHORED = 'oracle/goldens/svg-description/component';
const TOLERANCE_CLASS = 'deterministic';

function diffsOf(puml: string, golden: string): unknown[] {
  const { svg } = renderFixtureSurveyStyle(readFileSync(puml, 'utf8'), new DeterministicMeasurer());
  return compareSvg(svg, readFileSync(golden, 'utf8'), TOLERANCE_CLASS).diffs;
}

function parse(...lines: string[]): ReturnType<typeof parseDescription> {
  return parseDescription({ lines } as never);
}

function ast(...lines: string[]): DescriptionDiagramAST {
  const result = parse(...lines);
  if (!('nodes' in result)) throw new Error(`refused: ${JSON.stringify(result)}`);
  return result;
}

describe('map leaves against the jar', () => {
  it.each(['dei-map-top', 'dei-map-link'])('%s draws the jar bytes', (slug) => {
    expect(diffsOf(`${AUTHORED}/${slug}/in.puml`, `${AUTHORED}/${slug}/golden.svg`)).toEqual([]);
  });

  it('unknown/liripi-72-kefa167: a coloured map in a component in a package with ports', () => {
    const dir = 'test-results/dot-cache/unknown/liripi-72-kefa167';
    expect(diffsOf(`${dir}/in.puml`, `${dir}/in.svg`)).toEqual([]);
  });

  it('the map DOT node is a row table with one port per key; the *-> link leaves its row', () => {
    const events: LayoutInputEvent[] = [];
    setLayoutInputObserver((e) => events.push(e));
    try {
      renderFixtureSurveyStyle(readFileSync(`${AUTHORED}/dei-map-link/in.puml`, 'utf8'), new DeterministicMeasurer());
    } finally {
      setLayoutInputObserver(undefined);
    }
    const graph = events[0]!.graph;
    const map = graph.nodes.find((n) => n.portRows !== undefined)!;
    expect(map).toMatchObject({ shape: 'plaintext', height: 54 });
    expect(map.portRows).toEqual([
      { id: Ports.encodePortNameToId('first'), position: 18, height: 18 },
      { id: Ports.encodePortNameToId('second'), position: 36, height: 18 },
    ]);
    expect(graph.edges[0]!.attributes).toMatchObject({ tailport: Ports.encodePortNameToId('second'), minLen: 0 });
  });
});

describe('CommandCreateMap in description', () => {
  it('reads the rows, display, stereotype and colours of the header', () => {
    const map = ast('map "Shown" as M <<s>> #red ##blue {', 'a => 1', 'b => 2', '}').nodes[0]!;
    expect(map).toMatchObject({ id: 'M', display: 'Shown', stereotype: ['s'], leafType: 'map' });
    expect(map.color).toBe('#red;line:blue');
    expect([...map.mapBodier!.getMap()]).toEqual([
      ['a', '1'],
      ['b', '2'],
    ]);
  });

  it('a *-> row links its key port to an existing entity, with length linkStr.length() - 2', () => {
    const tree = ast('component C', 'map M {', 'k *--> C', '}');
    expect(tree.links).toEqual([
      expect.objectContaining({ from: 'M', to: 'C', length: 2, tailPortMember: 'k', arrowHead: 'open' }),
    ]);
  });

  it('refuses a row with neither => nor *-> (CommandCreateMap#executeNow)', () => {
    expect(parse('map M {', 'oops', '}')).toMatchObject({
      kind: 'execution',
      message: 'Map definition should contains key => value',
    });
  });

  it('refuses a link to an entity that does not exist yet', () => {
    expect(parse('map M {', 'k *-> Nobody', '}')).toMatchObject({
      kind: 'execution',
      message: 'No such entity Nobody',
    });
  });

  it('refuses a map on a name that exists', () => {
    expect(parse('component M', 'map M {', 'a => 1', '}')).toMatchObject({
      kind: 'execution',
      message: 'Map already exists: M',
    });
  });

  it('reads the link off the whole line, whichever branch stored the row', () => {
    expect(mapLinkOf('second *-> C')).toEqual({ key: 'second', target: 'C', length: 1 });
    expect(mapLinkOf('k => a *-> B')).toEqual({ key: 'k => a', target: 'B', length: 1 });
    expect(mapLinkOf('k => v')).toBeUndefined();
  });
});
