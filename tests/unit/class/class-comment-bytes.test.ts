/**
 * class-comment-bytes (ccb, #151): the `<!--...-->` comments a class or object diagram writes, against the jar's.
 * `compareSvg` drops comments, so these assert the comment sequence itself, each expectation read from a jar oracle
 * (`oracle/goldens/svg-<engine>/<slug>/golden.svg` or `tests/fixtures/class-comment-bytes/*.svg`).
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { entityImageCommentKind } from '../../../src/diagrams/class/renderer-group.js';
import type { ClassifierGeo } from '../../../src/diagrams/class/layout.js';

function comments(markup: string): string[] {
  const svg = renderSync(markup, { measurer: new DeterministicMeasurer() });
  return [...svg.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]!);
}

const leaf = (kind: ClassifierGeo['kind'], extra: Partial<ClassifierGeo> = {}): ClassifierGeo =>
  ({ id: 'X', kind, ...extra }) as ClassifierGeo;

describe('entityImageCommentKind (D1, GeneralImageBuilder.java:107-242)', () => {
  it.each([
    'class',
    'abstract',
    'interface',
    'enum',
    'annotation',
    'entity',
    'protocol',
    'struct',
    'exception',
    'metaclass',
    'stereotype',
    'dataclass',
    'record',
  ] as const)('a %s leaf is EntityImageClass: class', (kind) => {
    expect(entityImageCommentKind(leaf(kind))).toBe('class');
  });

  it.each(['object', 'map', 'json', 'state', 'association', 'assoc-circle', 'lollipop'] as const)(
    'a %s leaf has an image that writes no comment',
    (kind) => {
      expect(entityImageCommentKind(leaf(kind))).toBeUndefined();
    },
  );

  it.each(['usecase', 'circle'] as const)('a %s leaf is EntityImageDescription: entity', (kind) => {
    expect(entityImageCommentKind(leaf(kind))).toBe('entity');
  });

  it('a descriptive leaf is EntityImageDescription, a port is EntityImagePort', () => {
    expect(entityImageCommentKind(leaf('descriptive', { usymbol: 'node' }))).toBe('entity');
    expect(entityImageCommentKind(leaf('descriptive', { usymbol: 'portin' }))).toBeUndefined();
  });

  it('a collapsed empty package is EntityImageEmptyPackage: no comment', () => {
    expect(
      entityImageCommentKind(leaf('class', { folderTab: {} as NonNullable<ClassifierGeo['folderTab']> })),
    ).toBeUndefined();
  });
});

describe('class comments: only EntityImageClass and EntityImageDescription comment (D1)', () => {
  it('vozomu-86-rodo657: an object writes nothing, its implicit class and the link do', () => {
    expect(comments('@startuml\nobject toto1\ntoto1 *-- toto2\n@enduml')).toEqual([
      'class toto2',
      'reverse link toto1 to toto2',
    ]);
  });

  it('kavako-54-zipa815: maps write nothing, the class does', () => {
    const src = [
      '@startuml',
      'map commit1 #white {',
      '  sha256 => 1',
      '}',
      'class x #white ##pink {',
      '}',
      'map commit2 #white ##pink {',
      '  sha256 => 1',
      '}',
      '@enduml',
    ].join('\n');
    expect(comments(src)).toEqual(['class x']);
  });

  it('a json entity writes nothing', () => {
    expect(comments('@startuml\njson J {\n  "a": 1\n}\nclass C\n@enduml')).toEqual(['class C']);
  });

  it('togixe-65-bepo490: an allowmixing state writes nothing', () => {
    expect(comments('@startuml\nallow_mixing\nclass class\nstate state\nnode node\n@enduml')).toEqual([
      'class class',
      'entity node',
    ]);
  });
});

describe('class comments: a hidden entity or link writes its comment and nothing else (D2)', () => {
  it('lafama-65-zoci799: hidden classes and the link to a hidden class comment, in node order', () => {
    const src = '@startuml\nclass Foo1\nclass Foo2\nhide Foo1\nclass Foo3\nFoo2 *-- Foo3\nhide Foo3\n@enduml';
    expect(comments(src)).toEqual(['class Foo1', 'class Foo2', 'class Foo3', 'reverse link Foo2 to Foo3']);
  });

  it('zekona-69-sifo120: a hide @unlinked leaf comments before the first link', () => {
    const src = '@startuml\nclass foo1\nclass foo2\nclass foo3\nfoo1 --> foo2\nhide @unlinked\n@enduml';
    expect(comments(src)).toEqual(['class foo1', 'class foo2', 'class foo3', 'link foo1 to foo2']);
  });

  it('guxode-39-dobi371: a -[hidden]- link between packages comments last', () => {
    const src = '@startuml\npackage A {\nclass X\n}\npackage B {\nclass Y\n}\nX --> Y\nA -[hidden]- B\n@enduml';
    expect(comments(src)).toEqual(['cluster A', 'cluster B', 'class X', 'class Y', 'link X to Y', 'link A to B']);
  });

  it('hidden-map-json: a hidden map and json write nothing, their links comment', () => {
    const src = [
      '@startuml',
      'map M {',
      '  k => v',
      '}',
      'json J {',
      '  "a": 1',
      '}',
      'class C',
      'C --> M',
      'C --> J',
      'hide M',
      'hide J',
      '@enduml',
    ].join('\n');
    expect(comments(src)).toEqual(['class C', 'link C to M', 'link C to J']);
  });

  it('a hidden link and a visible one between the same ends share the id set (SvekEdge.java:944)', () => {
    const svg = renderSync('@startuml\nclass A\nclass B\nA -[hidden]- B\nA -- B\n@enduml', {
      measurer: new DeterministicMeasurer(),
    });
    expect(svg).toContain('id="A-B-1"');
    expect(svg).not.toContain('id="A-B"');
  });
});

describe('class comments: names are Entity#getName(), the quark name made at creation (D3)', () => {
  const classComments = (src: string): string[] => comments(src).filter((c) => /^(class|entity) /.test(c));

  it('lobofa-60-vexe031: under `::` a class comment is the last segment', () => {
    const src = '@startuml\nset namespaceSeparator ::\nclass Name1::ClassA\nclass Name2::ClassB\n@enduml';
    expect(classComments(src)).toEqual(['class ClassA', 'class ClassB']);
  });

  it('fokudo-49-xiki231: under `\\\\` an extends target is its last segment', () => {
    const src =
      '@startuml\nset namespaceSeparator \\\\\nclass CustomController extends App\\\\Http\\\\Controllers\\\\Controller\n@enduml';
    expect(classComments(src)).toEqual(['class Controller', 'class CustomController']);
  });

  it('rixeje-01-gava056 / zecate-11-guta563: an aliased class in a namespace is its alias segment', () => {
    expect(
      classComments('@startuml\nset namespaceSeparator /\nnamespace a/b/c {\nclass "Object" as js/Object\n}\n@enduml'),
    ).toEqual(['class Object']);
    expect(
      classComments('@startuml\nset namespaceSeparator -\nnamespace a-b-c {\nclass "Object" as js-Object\n}\n@enduml'),
    ).toEqual(['class Object']);
  });

  it('pexivi-54-ceri875: under `none` a class comment is the whole name', () => {
    const src = '@startuml\nset namespaceseparator none\nclass X.Y.Z\nX.Y.Z --> A.B.C\n@enduml';
    expect(classComments(src)).toEqual(['class X.Y.Z', 'class A.B.C']);
  });

  it.each([
    [
      'momoba-92-bole393',
      'oracle/goldens/svg-class/momoba-92-bole393/in.puml',
      'oracle/goldens/svg-class/momoba-92-bole393/golden.svg',
    ],
    [
      'c4dd-T2c separator fixture',
      'tests/fixtures/c4dd-T2c/class-namespace-separator-comment.puml',
      'tests/fixtures/c4dd-T2c/oracle/class-namespace-separator-comment.svg',
    ],
  ])('%s: every class comment equals the jar oracle', (_name, puml, svg) => {
    const jar = [...readFileSync(svg, 'utf8').matchAll(/<!--((?:class|entity) [\s\S]*?)-->/g)].map((m) => m[1]!);
    expect(classComments(readFileSync(puml, 'utf8'))).toEqual(jar);
  });

  it('cokavo-95-zopa741: a collapsed component inside a queue comments its own name', () => {
    const src =
      '@startuml\nqueue "a" as a <<toto>> {\n  component "b" as b {\n  }\n}\ncomponent "c" as c {\n}\nb->c: test\n@enduml';
    expect(classComments(src)).toEqual(['entity b', 'entity c']);
  });

  it('catana-32-licu332: a collapsed rectangle inside a rectangle comments its own name', () => {
    const src = '@startuml\nrectangle "R1" as r1 {\n  rectangle "R2" as r2 {\n  }\n}\n@enduml';
    expect(classComments(src)).toEqual(['entity r2']);
  });
});

describe('class comments: a cluster comment is the group quark name, not its label (D3, Cluster.java:309-311)', () => {
  const clusterComments = (svg: string): string[] => [...svg.matchAll(/<!--(cluster [\s\S]*?)-->/g)].map((m) => m[1]!);

  it.each([
    'curuju-86-laci922',
    'sumule-00-pefa744',
    'satabo-94-jidi372',
    'unknown/pijugo-91-jilo150',
    'unknown/zasuxe-15-lugo662',
    'jabama-09-kago823',
  ])('%s: every cluster comment equals the jar oracle', (slug) => {
    const dir = `oracle/goldens/svg-class/${slug}`;
    const ours = renderSync(readFileSync(`${dir}/in.puml`, 'utf8'), { measurer: new DeterministicMeasurer() });
    expect(clusterComments(ours)).toEqual(clusterComments(readFileSync(`${dir}/golden.svg`, 'utf8')));
  });

  it('curuju-86-laci922: `package Purchase as Pu` comments `Pu`', () => {
    expect(comments('@startuml\npackage Purchase as Pu {\nclass A\n}\n@enduml')).toContain('cluster Pu');
  });
});
