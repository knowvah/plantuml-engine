import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { orderLinks } from '../../../src/diagrams/state/state-svek-draw-order.js';
import type { TransitionGeo } from '../../../src/diagrams/state/state-geo-types.js';

/**
 * stdd T1c: `SvekResult#drawU` (`svek/SvekResult.java:70-100`) draws every
 * cluster of `Bibliotekon#allCluster`, then every node of `allNodes`, then
 * every line of `allLines`. The lists are filled by
 * `GraphvizImageBuilder.java:226-232` (`printGroups`, then the unpackaged
 * leafs, then the links) and `:408-433`; the root's link order is
 * `CucaDiagramFileMakerSvek#getOrderedLinks` (`:90-114`). Expected values
 * are the jar's own `in.svg` of each cached fixture.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function jar(slug: string): string {
  return readFileSync(`${CACHE}/${slug}/in.svg`, 'utf8');
}

/** Class and uid of every wrap group, in document order (`data-*` is not compared, D1). */
const topLevelGroups = (svg: string): string[] =>
  [...svg.matchAll(/<g class="(cluster|entity|start_entity|end_entity|link)"([^>]*)>/g)].map(
    (m) => `${m[1]} ${/\bid="([^"]*)"/.exec(m[2]!)?.[1] ?? ''}`,
  );

/** The `-backto-` form of an inverted link is T2b's; here only the order is under test. */
const pathIds = (svg: string): string[] =>
  [...svg.matchAll(/<path [^>]*\bid="([^"]*)"/g)].map((m) => m[1]!.replace(/^(.*)-backto-(.*)$/, '$2-to-$1'));

const t = (from: string, to: string, creationIndex: number): TransitionGeo => ({ from, to, points: [], creationIndex });

describe('stdd T1c: clusters, then nodes, then lines', () => {
  it('vogotu-43: both clusters, then both empty composites as nodes, then the start, then the links', () => {
    const groups = topLevelGroups(render('vogotu-43-puli923'));
    expect(groups.slice(0, 5)).toEqual([
      'cluster ent0001',
      'cluster ent0003',
      'entity ent0002',
      'entity ent0004',
      'start_entity ent0005',
    ]);
    expect(pathIds(render('vogotu-43-puli923'))).toEqual(['*start*-to-A', 'A-to-BInternal', 'B-to-AInternal']);
  });

  it('polodo-05: a cluster with inner links keeps the root link order, with a reverse link beside its twin', () => {
    expect(pathIds(render('polodo-05-rene471'))).toEqual(pathIds(jar('polodo-05-rene471')));
  });

  it('dogeji-46: two clusters and a mix of top-level and inner links, in the jar order', () => {
    const ours = render('dogeji-46-sapo750');
    const theirs = jar('dogeji-46-sapo750');
    expect(pathIds(ours)).toEqual(pathIds(theirs));
    expect(topLevelGroups(ours).filter((g) => !g.startsWith('link'))).toEqual(
      topLevelGroups(theirs).filter((g) => !g.startsWith('link')),
    );
  });

  it('jatiko-65: a later link with the same two states is inserted after the first', () => {
    expect(pathIds(render('jatiko-65-bijo831'))).toEqual(pathIds(jar('jatiko-65-bijo831')));
  });
});

describe('orderLinks: CucaDiagramFileMakerSvek#addLinkNew', () => {
  it('groups a link after every earlier link with the same connections, either direction', () => {
    const a = t('A', 'B', 1);
    const b = t('B', 'C', 2);
    const c = t('B', 'A', 3);
    const d = t('A', 'B', 4);
    expect(orderLinks([a, b, c, d], true)).toEqual([a, c, d, b]);
  });

  it('a cluster endpoint compares by the cluster name, not its zaent anchor', () => {
    const a = t('__zaent_S', 'B', 1);
    const b = t('B', 'C', 2);
    const c = t('B', 'S', 3);
    expect(orderLinks([a, b, c], true)).toEqual([a, c, b]);
  });

  it('an inner result keeps plain creation order', () => {
    const a = t('A', 'B', 1);
    const b = t('B', 'C', 2);
    const c = t('B', 'A', 3);
    expect(orderLinks([c, a, b], false)).toEqual([a, b, c]);
  });
});
