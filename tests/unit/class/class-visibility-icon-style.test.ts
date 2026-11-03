/**
 * T3g: a member row's icon colours come from the style engine
 * (`MethodsOrFieldsArea.java:360-366`, `VisibilityModifier.java:336-350`); the
 * header, package-title and link-label icons keep `Rose` colours
 * (`EntityImageClassHeader.java:111-112`). Expected strings are the jar's:
 * `tests/fixtures/diagram-style-scope/class__x-icon-*.svg`.
 */
import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { colorsFor } from '../../../src/diagrams/class/class-visibility-icon.js';
import { renderSync } from '../../../src/index.js';
import { defaultTheme, deepMergeTheme } from '../../../src/core/theme.js';
import { visibilityIconBucketOf } from '../../../src/core/style-element-scope.js';

const MEMBERS = 'class A {\n  +ab\n  -cd\n  +m1()\n  -m2()\n}';
const style = (css: string, body = MEMBERS): string => `@startuml\n<style>\n${css}\n</style>\n${body}\n@enduml`;
const render = (src: string): string => renderSync(src, { measurer: new DeterministicMeasurer() });

/** `[modifier, fill, stroke]` of every icon, in document order. */
function icons(svg: string): readonly (readonly [string, string, string])[] {
  const re = /data-visibility-modifier="([A-Z_]+)"><\w+ [^>]*?fill="([^"]*)" style="stroke:([^;]*);/gu;
  return [...svg.matchAll(re)].map((m) => [m[1] ?? '', m[2] ?? '', m[3] ?? ''] as const);
}

describe('member-row icons read the style engine', () => {
  it('`element { LineColor }` strokes every icon (jar class__x-icon-element)', () => {
    expect(icons(render(style('element { LineColor #BB0000 }')))).toEqual([
      ['PUBLIC_FIELD', 'none', '#B00'],
      ['PRIVATE_FIELD', 'none', '#B00'],
      ['PUBLIC_METHOD', '#84BE84', '#B00'],
      ['PRIVATE_METHOD', '#F24D5C', '#B00'],
    ]);
  });

  it('`root { LineColor }` strokes every icon (jar class__x-icon-root)', () => {
    expect(icons(render(style('root { LineColor #0000BB }'))).map(([, , stroke]) => stroke)).toEqual([
      '#00B',
      '#00B',
      '#00B',
      '#00B',
    ]);
  });

  it('`element { BackgroundColor }` fills methods only (jar class__x-icon-method-bg)', () => {
    expect(icons(render(style('element { BackgroundColor #00BB00 }')))).toEqual([
      ['PUBLIC_FIELD', 'none', '#038048'],
      ['PRIVATE_FIELD', 'none', '#C82930'],
      ['PUBLIC_METHOD', '#0B0', '#038048'],
      ['PRIVATE_METHOD', '#0B0', '#C82930'],
    ]);
  });

  it('the later declaration wins (jar class__x-icon-order)', () => {
    const css = 'visibilityIcon { public { LineColor #111111 } }\nelement { LineColor #BB0000 }';
    expect(icons(render(style(css))).map(([, , stroke]) => stroke)).toEqual(['#B00', '#B00', '#B00', '#B00']);
  });

  it('the earlier broad declaration yields to a later kind', () => {
    const css = 'element { LineColor #BB0000 }\nvisibilityIcon { public { LineColor #111111 } }';
    expect(icons(render(style(css))).map(([, , stroke]) => stroke)).toEqual(['#111', '#B00', '#111', '#B00']);
  });

  it('`classDiagram { LineColor }` does not reach an icon (jar class__x-icon-diag)', () => {
    expect(icons(render(style('classDiagram { LineColor #BB0000 }'))).map(([, , stroke]) => stroke)).toEqual([
      '#038048',
      '#C82930',
      '#038048',
      '#C82930',
    ]);
  });

  it('an object document reads the same table (jar object__x-icon-element)', () => {
    const body = 'class A {\n  +ab\n  -m2()\n}\nobject O {\n  a = 1\n}';
    expect(icons(render(style('element { LineColor #BB0000 }', body)))).toEqual([
      ['PUBLIC_FIELD', 'none', '#B00'],
      ['PRIVATE_METHOD', '#F24D5C', '#B00'],
    ]);
  });

  it('no `<style>`: the defaults (plantuml.skin:216-)', () => {
    expect(icons(render(`@startuml\n${MEMBERS}\n@enduml`)).map(([, , stroke]) => stroke)).toEqual([
      '#038048',
      '#C82930',
      '#038048',
      '#C82930',
    ]);
  });
});

describe('colorsFor: the member tier', () => {
  const scoped = deepMergeTheme(defaultTheme, {
    colors: { elements: { [visibilityIconBucketOf('public')]: { border: '#112233', background: '#445566' } } },
  });

  it('a member row takes the bucket before every other tier', () => {
    expect(colorsFor('+', scoped, true)).toEqual({ line: '#112233', background: '#445566' });
  });

  it('any other icon does not (Rose, not the style engine)', () => {
    expect(colorsFor('+', scoped)).toEqual({ line: '#038048', background: '#84BE84' });
  });

  it('a kind with no bucket falls to the existing tiers', () => {
    expect(colorsFor('-', scoped, true)).toEqual({ line: '#C82930', background: '#F24D5C' });
  });
});

describe('colorsFor: the cascade tier belongs to member rows only', () => {
  const cascaded = deepMergeTheme(defaultTheme, {
    colors: {
      graph: {
        visibilityIconLineCascade: { public: '#BB0000' },
        visibilityIconBackgroundCascade: { public: '#00AA00' },
        iconPrivateColor: '#123456',
      },
    },
  });

  it('a member row takes it (MethodsOrFieldsArea.java:360-366)', () => {
    expect(colorsFor('+', cascaded, true)).toEqual({ line: '#BB0000', background: '#00AA00' });
  });

  it('a header, package title or link label does not (EntityImageClassHeader.java:111-112; jar class__x-icon-header)', () => {
    expect(colorsFor('+', cascaded)).toEqual({ line: '#038048', background: '#84BE84' });
  });

  it('a skinparam still reaches the Rose path (jar class__x-icon-header-skin-style)', () => {
    expect(colorsFor('-', cascaded)).toEqual({ line: '#123456', background: '#F24D5C' });
  });

  it('renders the header and package icon in the default colours under a visibilityIcon style', () => {
    const css = 'visibilityIcon {\n  public {\n    LineColor #BB0000\n    BackgroundColor #00AA00\n  }\n}';
    for (const body of ['+class A', '+package P {\n  class C\n}']) {
      expect(icons(render(style(css, body)))).toEqual([['PUBLIC_METHOD', '#84BE84', '#038048']]);
    }
  });
});
