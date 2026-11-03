/**
 * T2a: element colours through the StyleBuilder. Expected values are the jar's
 * (`StyleSignatureBasic.of(...).getMergedStyle(builder).value(...)`,
 * `StyleStorage.java:102-116`), each case citing the element's own Java.
 */
import { describe, expect, it } from 'vitest';

import type { DiagramType } from '../../../src/core/block-extractor.js';
import { buildTheme } from '../../../src/core/build-theme.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { preprocess, type PreprocessorResult } from '../../../src/core/preprocessor.js';
import {
  ELEMENT_SIGNATURES,
  elementScopeColors,
  isForeignDiagramPrefix,
  LINK_NOTE_BUCKET,
  STATE_CHOICE_BUCKET,
  clusterBucketOf,
} from '../../../src/core/style-element-scope.js';
import { resolveElementPaint } from '../../../src/core/theme-element-resolve.js';
import { collectElementStyleBuckets } from '../../../src/core/style-map-element.js';
import { defaultTheme, type ElementColors } from '../../../src/core/theme.js';
import { renderSync } from '../../../src/index.js';

const AAA = '#AAAAAA';
const BBB = '#BBBBBB';
const CCC = '#CCCCCC';
/** `note { BackGroundColor: var(--note-background) }`, `--note-background: #FEFFDD` (plantuml.skin). */
const SKIN_NOTE = '#FEFFDD';

const source = (body: string): PreprocessorResult => preprocess(`@startuml\n${body}\n@enduml`);
const style = (css: string): string => `<style>\n${css}\n</style>`;
const scope = (
  body: string,
  type: DiagramType,
  flat?: Partial<Record<string, ElementColors>>,
): ReturnType<typeof elementScopeColors> => elementScopeColors(source(body), type, flat);
const themeOf = (body: string, type: DiagramType): ReturnType<typeof buildTheme>['theme'] =>
  buildTheme(source(body), undefined, type).theme;

describe('ELEMENT_SIGNATURES', () => {
  const row = (styleName: string, bucket: string): (typeof ELEMENT_SIGNATURES)[string][number] | undefined =>
    ELEMENT_SIGNATURES[styleName]?.find((r) => r.bucket === bucket);

  it('a description leaf paints from `styleTitle` and writes from `style` (EntityImageDescription.java:152-173)', () => {
    expect(row('componentDiagram', 'component')).toEqual({
      bucket: 'component',
      snames: ['root', 'element', 'componentDiagram', 'component', 'title'],
      fontSnames: ['root', 'element', 'componentDiagram', 'component'],
    });
  });

  it('a business actor adds `actor` only to its title signature (EntityImageDescription.java:144-146)', () => {
    expect(row('componentDiagram', 'actor-business')).toEqual({
      bucket: 'actor-business',
      snames: ['root', 'element', 'componentDiagram', 'actor', 'business', 'title'],
      fontSnames: ['root', 'element', 'componentDiagram', 'business'],
    });
  });

  it('`circle` is `USymbols.INTERFACE` (Entity.java:415-416), whose name is `interface_` (USymbolInterface.java:46-48)', () => {
    expect(row('componentDiagram', 'circle')?.fontSnames).toEqual([
      'root',
      'element',
      'componentDiagram',
      'interface_',
    ]);
    expect(row('componentDiagram', 'interface')?.fontSnames).toEqual([
      'root',
      'element',
      'componentDiagram',
      'interface_',
    ]);
  });

  it('a cluster is `group` + the symbol, under its own key (Cluster.java:290-291, D2a)', () => {
    expect(row('componentDiagram', clusterBucketOf('rectangle'))).toEqual({
      bucket: 'group.rectangle',
      snames: ['root', 'element', 'componentDiagram', 'group', 'rectangle'],
      shadows: 'rectangle',
      // a `package { }` declaration never reaches a non-package cluster (Cluster.java:387), the flat value may
      flatPeers: ['package'],
    });
    expect(row('classDiagram', clusterBucketOf('package'))?.snames).toEqual([
      'root',
      'element',
      'classDiagram',
      'group',
      'package_',
    ]);
  });

  it('a note on a link is signed `sequenceDiagram` in every svek engine (ComponentType.java:98-99, D2a)', () => {
    for (const styleName of ['componentDiagram', 'classDiagram', 'stateDiagram']) {
      expect(row(styleName, LINK_NOTE_BUCKET)?.snames).toEqual(['root', 'element', 'sequenceDiagram', 'note']);
    }
  });

  it('a class document holds objects under `objectDiagram` (EntityImageObject.java:123, EntityImageMap.java:137, EntityImageJson.java:139)', () => {
    for (const kind of ['object', 'map', 'json'] as const) {
      expect(row('classDiagram', kind)?.snames).toEqual(['root', 'element', 'objectDiagram', kind]);
    }
  });

  it("state's choice is `activityDiagram`, its history `stateDiagram` (EntityImageBranch.java:62-63, EntityImagePseudoState.java:70-71)", () => {
    expect(row('stateDiagram', STATE_CHOICE_BUCKET)?.snames).toEqual([
      'root',
      'element',
      'activityDiagram',
      'activity',
      'diamond',
    ]);
    expect(row('stateDiagram', 'diamond')?.snames).toEqual(['root', 'element', 'stateDiagram', 'diamond']);
  });

  it('a spot names no diagram (EntityImageClassHeader.java:204)', () => {
    expect(row('classDiagram', 'spotclass')?.snames).toEqual(['root', 'element', 'spot', 'spotClass']);
  });

  it('every bucket appears once per style name', () => {
    for (const rows of Object.values(ELEMENT_SIGNATURES)) {
      const buckets = rows.map((r) => r.bucket);
      expect(new Set(buckets).size).toBe(buckets.length);
    }
  });
});

describe('elementScopeColors: the gate (D3, D3b, D6)', () => {
  it('empty `styles` and no `skin`: nothing', () => {
    expect(scope('skinparam componentBackgroundColor #AAAAAA\n[C]', 'description')).toEqual({});
  });

  it('a `<style>` the parser rejects keeps the flat path (D6)', () => {
    expect(scope(style('note { FontSize }\n}'), 'description')).toEqual({});
  });

  it.each<DiagramType>(['sequence', 'json', 'yaml', 'gantt', 'files', 'board'])(
    '%s has no row: it reads the builder itself or discards the style',
    (type) => {
      expect(scope(style(`element { BackgroundColor ${AAA} }`), type)).toEqual({});
    },
  );

  it('rethrows anything other than `StyleParsingException` (D6)', () => {
    const broken = { ...source('[C]'), styles: [null as unknown as string] };
    expect(() => elementScopeColors(broken, 'description')).toThrow(TypeError);
  });
});

describe('elementScopeColors: D3, D3a', () => {
  it('a value the default skin also gives, with no flat role: not written', () => {
    expect(scope(style(`database { BackgroundColor ${AAA} }`), 'description')['component']).toBeUndefined();
  });

  it('the diagram selector reaches its entities and notes (R,E,componentDiagram,*)', () => {
    const colors = scope(
      style(`componentDiagram {\n BackgroundColor ${AAA}\n LineColor ${BBB}\n FontColor ${CCC}\n}`),
      'description',
    );
    expect(colors['component']).toEqual({ background: AAA, border: BBB, font: CCC });
    expect(colors['note']).toEqual({ background: AAA, border: BBB, font: CCC });
  });

  it('`root` and `element` reach them too (subset rule, StyleSignatureBasic.java:194-220)', () => {
    expect(scope(style(`root { LineColor ${BBB} }`), 'description')['node']?.border).toBe(BBB);
    expect(scope(style(`element { FontColor ${CCC} }`), 'class')['note']?.font).toBe(CCC);
  });

  it('another diagram selector reaches nothing', () => {
    expect(scope(style(`sequenceDiagram { BackgroundColor ${AAA} }`), 'class')['note']).toBeUndefined();
  });

  it('the last declaration wins, even re-declaring a selector (StyleStorage.java:102-116, D1)', () => {
    const css = `classDiagram {\n note { BackgroundColor ${AAA} }\n}\nnote { BackgroundColor ${BBB} }\nclassDiagram {\n note { BackgroundColor ${CCC} }\n}`;
    expect(scope(style(css), 'class')['note']?.background).toBe(CCC);
  });

  it('a declaration equal to the default is still a declaration: `Value#toString` carries its priority (D3a)', () => {
    const css = `note { BackgroundColor ${AAA} }\nroot { BackgroundColor ${SKIN_NOTE} }`;
    expect(scope(style(css), 'class')['note']?.background).toBe(SKIN_NOTE);
  });

  it('the untouched default overwrites a stale flat role and leaves the others alone (D3a)', () => {
    const colors = scope(style(`database { FontSize 12 }`), 'description', { note: { background: AAA } });
    expect(colors['note']).toEqual({ background: SKIN_NOTE });
  });

  it('the untouched default with no flat role is left to the flat path', () => {
    expect(scope(style(`database { FontSize 12 }`), 'description', {})['note']).toBeUndefined();
  });

  it('`skinparam mode dark`: an untouched default keeps `theme-dark` even where a flat role exists (D3)', () => {
    const body = `skinparam mode dark\n${style('database { FontSize 12 }')}`;
    expect(scope(body, 'activity', { activity: { font: '#FFFFFF' } })['activity']).toBeUndefined();
  });

  it('a caller-named theme: an untouched default keeps that theme (D3, as `documentBackColor`)', () => {
    const colors = elementScopeColors(
      source(style('database { FontSize 12 }')),
      'activity',
      {
        activity: { font: '#FFFFFF' },
      },
      { callerNamedTheme: true },
    );
    expect(colors['activity']).toBeUndefined();
  });

  it('a conditional colour is left to the flat path: `HColorScheme` answers per drawn element (HColorScheme.java:52-63)', () => {
    expect(scope(style('root { FontColor #?black:white }'), 'class')['note']).toBeUndefined();
    expect(scope(style('root { BackgroundColor #?black:white }'), 'description')['component']).toBeUndefined();
  });

  it('a gradient is a `Paint`, as the flat path stores it (`parseColor`)', () => {
    const colors = scope(style(`element { BackgroundColor ${AAA}|${BBB} }`), 'description');
    expect(colors['component']?.background).toEqual({ color1: AAA, color2: BBB, policy: '|' });
  });
});

describe('elementScopeColors: `fcTitle` (EntityImageDescription.java:172,187-188)', () => {
  it('a `title` declaration parts it from `font` (jar: bare `title { FontColor }` paints `[C]`, not a renamed leaf)', () => {
    const colors = scope(style(`title { FontColor ${CCC} }`), 'description');
    expect(colors['component']).toEqual({ titleFont: CCC });
    const nested = scope(style(`component {\n title { FontColor ${CCC} }\n}`), 'description');
    expect(nested['component']).toEqual({ titleFont: CCC });
    expect(nested['database']).toBeUndefined();
  });

  it('with no `title` declaration both agree, and `font` carries it', () => {
    expect(scope(style(`element { FontColor ${CCC} }`), 'description')['component']).toEqual({ font: CCC });
  });

  it('a later declaration beats a stale flat `titleFont` (D3a)', () => {
    const colors = scope(style(`root { FontColor ${CCC} }`), 'description', { component: { titleFont: AAA } });
    expect(colors['component']).toEqual({ font: CCC, titleFont: CCC });
  });

  it('a conditional title colour is not written', () => {
    expect(scope(style('title { FontColor #?black:white }'), 'description')['component']).toBeUndefined();
  });

  it('a row with no separate title signature writes none', () => {
    expect(scope(style(`title { FontColor ${CCC} }`), 'class')['note']).toBeUndefined();
  });
});

describe('elementScopeColors: one key per signature (D2a)', () => {
  it('leaf and cluster answer differently (`foboxa-33-menu312`: jar leaf #008000, cluster #00F)', () => {
    const colors = scope(style('element { BackgroundColor #008000 }\ngroup { BackgroundColor #00F }'), 'description');
    expect(colors['rectangle']?.background).toBe('#008000');
    expect(colors['group.rectangle']?.background).toBe('#00F');
  });

  it("a cluster's untouched default still shadows its leaf's written value (jar: `rectangle { title { BackgroundColor } }` leaves clusters alone)", () => {
    const colors = scope(style(`rectangle {\n title { BackgroundColor ${AAA} }\n}`), 'description');
    expect(colors['rectangle']?.background).toBe(AAA);
    expect(colors['group.rectangle']?.background).toBe('transparent');
  });

  it('a note on a link does not take the document diagram selector (ComponentType.java:98-99)', () => {
    const colors = scope(style(`classDiagram { BackgroundColor ${AAA} }`), 'class');
    expect(colors['note']?.background).toBe(AAA);
    expect(colors[LINK_NOTE_BUCKET]?.background).toBe(SKIN_NOTE);
  });

  it("state's choice takes `element` and not `stateDiagram`, its history both", () => {
    const diag = scope(style(`stateDiagram { BackgroundColor ${AAA} }`), 'state');
    expect(diag['diamond']?.background).toBe(AAA);
    expect(diag[STATE_CHOICE_BUCKET]).toBeUndefined();
    const element = scope(style(`element { BackgroundColor ${BBB} }`), 'state');
    expect(element[STATE_CHOICE_BUCKET]?.background).toBe(BBB);
    expect(element['diamond']?.background).toBe(BBB);
  });

  it('an object takes `objectDiagram`, not the `classDiagram` its document is named (EntityImageObject.java:123)', () => {
    expect(scope(style(`classDiagram {\n object { BackgroundColor ${AAA} }\n}`), 'class')['object']).toBeUndefined();
    expect(scope(style(`objectDiagram { BackgroundColor ${AAA} }`), 'class')['object']?.background).toBe(AAA);
  });
});

describe('isForeignDiagramPrefix (D5, D5a)', () => {
  it.each<[string, string, DiagramType, boolean]>([
    ['classdiagram', 'note', 'class', false],
    ['objectdiagram', 'note', 'class', true],
    ['objectdiagram', 'object', 'class', false],
    ['classdiagram', 'object', 'class', true],
    ['classdiagram', 'state', 'state', true],
    ['statediagram', 'state', 'state', false],
    ['activitydiagram', 'activitybar', 'state', false],
    ['usecasediagram', 'usecase', 'description', true],
    ['componentdiagram', 'usecase', 'description', false],
    ['classdiagram', 'actor', 'sequence', true],
    ['sequencediagram', 'actor', 'sequence', false],
  ])('%s.%s on %s: %s', (prefix, bucket, type, expected) => {
    expect(isForeignDiagramPrefix(prefix, bucket, type)).toBe(expected);
  });
});

describe('collectElementStyleBuckets (D5, D5a)', () => {
  const nested = new Map([
    [
      'objectdiagram.note',
      new Map([
        ['backgroundcolor', AAA],
        ['linecolor', BBB],
        ['bordercolor', BBB],
        ['fontcolor', CCC],
        ['fontsize', '20'],
      ]),
    ],
  ]);

  it('a prefix foreign to the signature drops the three colours and keeps the rest (D5)', () => {
    expect(collectElementStyleBuckets(nested, 'class')['note']).toEqual({ fontSize: 20 });
  });

  it("the signature's own prefix keeps all of them", () => {
    expect(collectElementStyleBuckets(nested, 'activity')['note']?.fontSize).toBe(20);
    const own = new Map([['classdiagram.note', new Map([['backgroundcolor', AAA]])]]);
    expect(collectElementStyleBuckets(own, 'class')['note']).toEqual({ background: AAA });
  });

  it('a bare bucket has no prefix to be foreign', () => {
    const bare = new Map([['note', new Map([['backgroundcolor', AAA]])]]);
    expect(collectElementStyleBuckets(bare, 'class')['note']).toEqual({ background: AAA });
  });
});

describe('buildTheme merges the scope (D2)', () => {
  it('writes `elements`, read first by `resolveElementPaint`', () => {
    const theme = themeOf(`${style(`componentDiagram { BackgroundColor ${AAA} }`)}\n[C]`, 'description');
    expect(resolveElementPaint(theme, 'component', 'background')).toBe(AAA);
  });

  it('a stereotype value stays above it (StyleSignatureBasic#withTOBECHANGED, EntityImageDescription.java:152-160)', () => {
    const css = `component {\n BackgroundColor ${AAA}\n .tag { BackgroundColor ${BBB} }\n}`;
    const theme = themeOf(`${style(css)}\n[C] <<tag>>`, 'description');
    expect(resolveElementPaint(theme, 'component', 'background', ['tag'])).toBe(BBB);
    expect(resolveElementPaint(theme, 'component', 'background')).toBe(AAA);
  });

  it('an inline colour stays above it: `colors.getColor(ColorType.BACK)` is read first (EntityImageDescription.java:164-166)', () => {
    const svg = renderSync(`@startuml\n${style(`element { BackgroundColor ${AAA} }`)}\n[C] #DDDDDD\n[D]\n@enduml`, {
      measurer: new DeterministicMeasurer(),
    });
    const fills = [...svg.matchAll(/<rect [^>]*fill="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(fills)).toEqual(new Set(['#DDD', '#AAA']));
  });

  it("a class document's symbol cluster reads its own signature, not the leaf's (Cluster.java:290-291; jar `#00F`)", () => {
    const css = 'element { BackgroundColor #008000 }\ngroup { BackgroundColor #00F }';
    const svg = renderSync(`@startuml\n${style(css)}\nrectangle R {\n class A\n}\n@enduml`, {
      measurer: new DeterministicMeasurer(),
    });
    expect(/<rect [^>]*fill="([^"]+)"/.exec(svg)?.[1]).toBe('#00F');
  });

  it('keeps every other field of a flat bucket (`Style#mergeWith` touches one signature, StyleBuilder.java:86-104)', () => {
    const theme = themeOf(style(`component {\n FontSize 20\n}\nelement { BackgroundColor ${AAA} }`), 'description');
    expect(theme.colors.elements?.['component']).toMatchObject({ fontSize: 20, background: AAA });
  });

  it('a caller `Partial<Theme>` still beats it (Stage 4)', () => {
    const pre = source(style(`element { BackgroundColor ${AAA} }`));
    const caller = { colors: { ...defaultTheme.colors, elements: { component: { background: BBB } } } };
    const theme = buildTheme(pre, { theme: caller }, 'description').theme;
    expect(theme.colors.elements?.['component']?.background).toBe(BBB);
  });

  it('a `<style>` the parser rejects keeps even a foreign prefix flat: no signature applies (D6, D6a)', () => {
    const body = style(`objectDiagram {\n note { BackgroundColor ${AAA} }\n}\nnote { FontSize }\n}`);
    expect(themeOf(body, 'class').colors.elements?.['note']?.background).toBe(AAA);
  });

  it('no `<style>`, no `skin`: the flat bucket stands, nothing added (D3)', () => {
    const theme = themeOf('skinparam componentBackgroundColor #AAAAAA\n[C]', 'description');
    expect(Object.keys(theme.colors.elements ?? {})).toEqual(['component']);
  });
});
