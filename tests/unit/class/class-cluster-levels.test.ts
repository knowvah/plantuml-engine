/**
 * `clusterWrapperLevel` proven against every cached oracle DOT that carries a
 * cluster — 122 class + 3 object fixtures under `test-results/dot-cache/`
 * (`grep -l "subgraph cluster"`, all single-graph `svek-1.dot`).
 *
 * The oracle DOT numbers clusters by SVEK's own internal entity-creation
 * order (`cluster6`, `cluster11`, …), not by this port's `cluster${i}` id
 * scheme, so there is no id to match on directly. What both sides DO share is
 * DOCUMENT ORDER: `Cluster#printCluster2` opens each child subgraph in the
 * same order `Cluster`'s own children list was built (`Cluster.java:565,
 * 580`), which is parse/declaration order — the same order this test's own
 * `keptNamespaces` walks `ast.namespaces` in. Zipping the two ordered lists
 * is therefore a sound correspondence, checked by asserting equal length
 * before comparing levels (a length mismatch means the correspondence
 * assumption broke for that fixture, not that a level disagrees).
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import { classPlugin } from '../../../src/diagrams/class/index.js';
import { collapseEmptyNamespacesFinal } from '../../../src/diagrams/class/class-namespace.js';
import type { ClassDiagramAST } from '../../../src/diagrams/class/ast.js';
import { nonEmptyNamespaceIds } from '../../../src/diagrams/class/class-dot-clusters.js';
import { clusterWrapperLevel } from '../../../src/diagrams/class/class-cluster-levels.js';
import { parseAst } from '../../helpers/parse-ast.js';

const DOT_CACHE = join(dirname(fileURLToPath(import.meta.url)), '../../../test-results/dot-cache');

interface Fixture {
  engine: 'class' | 'object';
  slug: string;
  puml: string;
  dot: string;
}

function loadFixtures(engine: 'class' | 'object'): Fixture[] {
  const root = join(DOT_CACHE, engine);
  const out: Fixture[] = [];
  for (const slug of readdirSync(root)) {
    const dot = join(root, slug, 'svek-1.dot');
    const puml = join(root, slug, 'in.puml');
    let dotText: string;
    let pumlText: string;
    try {
      dotText = readFileSync(dot, 'utf8');
      pumlText = readFileSync(puml, 'utf8');
    } catch {
      continue;
    }
    if (!/subgraph cluster\d/.test(dotText)) continue;
    // The corpus populator over-selects: a directory name "builds a path and
    // does nothing else" (routing gate D6). The GOLDEN's own
    // `data-diagram-type` is what the jar actually rendered, so it decides
    // membership -- `sokevu-87-toce485` sits under `class/` but its golden
    // says DESCRIPTION (`interface i` + a `node n { port ... }` container),
    // and driving the class parser at it now raises upstream's own
    // allowmixing error rather than silently dropping the lines.
    let goldenType = '';
    try {
      goldenType = /data-diagram-type="([^"]*)"/.exec(readFileSync(join(root, slug, 'in.svg'), 'utf8'))?.[1] ?? '';
    } catch {
      continue;
    }
    // Both families stamp CLASS -- `ObjectDiagram extends ClassDiagram`
    // upstream, so an object golden carries `data-diagram-type="CLASS"` too.
    // The filter exists to drop fixtures the jar rendered as a DIFFERENT
    // family, not to distinguish these two.
    if (goldenType !== 'CLASS') continue;
    out.push({ engine, slug, puml: pumlText, dot: dotText });
  }
  return out;
}

/**
 * Parse a cached fixture's `.puml` into the real production AST — same
 * `buildBlockUmls` → `classPlugin.parse` pipeline `src/index.ts` runs (the
 * extra `UmlSource` fields `renderSync` adds are all optional) — THEN apply
 * the same `collapseEmptyNamespacesFinal` pass `layout.ts:227` runs before
 * `buildDotGraph`/`buildDotClusters` ever see the AST. Skipping this step
 * undercounts: a namespace whose only content is a further-empty child (no
 * classifiers anywhere in its own subtree) reports 0 direct classifiers pre
 * collapse, so a naive parent walk-up never marks it kept — yet jar DOES
 * draw it, containing the collapsed child's own `EMPTY_PACKAGE` leaf.
 * Confirmed against `delasa-80-jusu462` (`pdwzmyysm_abstract.siwd`/
 * `mssrda.siwd`, both a childless empty leaf under an otherwise-childless
 * parent): pre-collapse this walk finds 32 kept namespaces against the
 * oracle's 34; post-collapse it finds the same 34, `pdwzmyysm_abstract`/
 * `mssrda` included.
 */
function parseFixture(source: string): ClassDiagramAST {
  const blocks = buildBlockUmls(source);
  const block = blocks[0]!;
  if (!block.ok) throw new Error(`fixture failed to preprocess: ${JSON.stringify(block)}`);
  const ast = parseAst(classPlugin, block.source, {});
  return collapseEmptyNamespacesFinal(ast);
}

/**
 * Namespace ids that get a jar cluster, in the SAME document order
 * `buildDotClusters` (`class-dot-clusters.ts`) emits them in -- its own
 * exported keep-set (any namespace with a direct classifier, plus every
 * non-packed ancestor), filtered in `ast.namespaces` order.
 */
function keptNamespaceIds(ast: ClassDiagramAST): string[] {
  const keep = nonEmptyNamespaceIds(ast);
  return ast.namespaces.filter((ns) => keep.has(ns.id)).map((ns) => ns.id);
}

/** Oracle cluster ids in the order their `subgraph cluster<N>` opens
 *  (document order), each paired with whether jar wrapped it in `a`/`i`
 *  (level 2) — detected by the presence of `subgraph cluster<N>a` anywhere
 *  in the text, since `<N>` is unique per graph. */
function oracleClusterLevels(dot: string): Array<1 | 2> {
  const ids: string[] = [];
  const seen = new Set<string>();
  const openRe = /subgraph cluster(\d+)(?:\{|\s)/g;
  for (let m = openRe.exec(dot); m !== null; m = openRe.exec(dot)) {
    const id = m[1]!;
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids.map((id) => (dot.includes(`subgraph cluster${id}a`) ? 2 : 1));
}

/**
 * Fixtures this comparison cannot read, each with its mechanism (ogc/T5,
 * 2026-11-04, when #109's capture brought 46 more clustered class rows):
 *
 * - `kofogo-67-jiju461`: line 3, `(ns1.classB, ns1.classA) .. ns1.Exception
 *   : Exception`, is an association-class link the jar accepts through
 *   `CommandLinkClass`'s COUPLE1 alternative (`CommandLinkClass.java:116`,
 *   `executeArgSpecial1` at :414) and this port's class parser refuses
 *   (`class-assoc-couple.ts` has no `: label` tail), so `parseFixture`
 *   throws before any level can be derived. Counted on the class parity
 *   issue; a parser gap, not a cluster-level question.
 * - `potatu-55-pave291`: three `card X [{{ ... }}]` leaves each embed a
 *   component diagram. `-DPLANTUML_DUMP_DOT` numbers every
 *   `DotStringFactory.getSvg` call, and the embedded diagrams render
 *   first, so `svek-1.dot` and `svek-2.dot` are the nested component
 *   graphs (3 clusters each) and the outer class graph is `svek-3.dot`
 *   (no cluster). This loader reads `svek-1.dot` as the class graph, which
 *   it is not for a fixture with nested diagrams.
 */
const UNREADABLE: ReadonlyMap<string, string> = new Map([
  ['kofogo-67-jiju461', 'class parser refuses the association-class link on line 3'],
  ['potatu-55-pave291', 'svek-1.dot is an embedded {{ }} component diagram, not the class graph'],
]);

const fixtures = [...loadFixtures('class'), ...loadFixtures('object')].filter((f) => !UNREADABLE.has(f.slug));

describe('clusterWrapperLevel — 169-fixture oracle agreement', () => {
  // 122, not 123: `sokevu-87-toce485` lives under `class/` but its golden
  // says DESCRIPTION, so it is not a class fixture and the loader drops it.
  // 122 -> 166 at ogc/T5 (2026-11-04): #109's capture added 151 class rows,
  // 46 of them with a jar cluster, 2 of those unreadable here (`UNREADABLE`
  // above). Derivation: 122 + 46 = 168, minus 2 = 166.
  it('covers 166 class + 3 object fixtures', () => {
    expect(fixtures.filter((f) => f.engine === 'class')).toHaveLength(166);
    expect(fixtures.filter((f) => f.engine === 'object')).toHaveLength(3);
  });

  for (const fixture of fixtures) {
    it(`${fixture.engine}/${fixture.slug}: derived level matches jar's wrappers`, () => {
      const ast = parseFixture(fixture.puml);
      const kept = keptNamespaceIds(ast);
      const oracleLevels = oracleClusterLevels(fixture.dot);
      expect(kept).toHaveLength(oracleLevels.length);
      const derived = kept.map((nsId) => clusterWrapperLevel(nsId, ast));
      expect(derived).toEqual(oracleLevels);
    });
  }

  it('cocube-46-tusu692: exactly one of four clusters is level 2', () => {
    const fixture = fixtures.find((f) => f.slug === 'cocube-46-tusu692')!;
    const ast = parseFixture(fixture.puml);
    const kept = keptNamespaceIds(ast);
    expect(kept).toHaveLength(4);
    const derived = kept.map((nsId) => clusterWrapperLevel(nsId, ast));
    expect(derived.filter((level) => level === 2)).toHaveLength(1);
  });

  it('bajotu-30-soku184 (p1 --> cl2): its single cluster is level 2', () => {
    const fixture = fixtures.find((f) => f.slug === 'bajotu-30-soku184')!;
    const ast = parseFixture(fixture.puml);
    const kept = keptNamespaceIds(ast);
    expect(kept).toHaveLength(1);
    expect(clusterWrapperLevel(kept[0]!, ast)).toBe(2);
  });
});
