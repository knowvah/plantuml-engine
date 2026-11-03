/**
 * dss T3b: class and object readers take the element colours the style engine resolved
 * (`theme.colors.elements[bucket]`, written by `style-element-scope.ts`) instead of a
 * cascade whose signature is not the element's own.
 *
 * Every expectation is the jar's own bytes: authored rows under
 * `tests/fixtures/diagram-style-scope/` (rendered with `scripts/oracle-render.sh`) or the
 * Java quoted at each case.
 */
import { describe, expect, it } from 'vitest';
import { defaultTheme, type Theme } from '../../../src/core/theme.js';
import { advanceBodyEmbed } from '../../../src/diagrams/class/class-line-merge.js';
import { parseMemberLine } from '../../../src/diagrams/class/class-member-parser.js';
import type { ParseState } from '../../../src/diagrams/class/class-parse-state.js';
import { namespaceColorFill } from '../../../src/diagrams/class/class-namespace-shape.js';
import { packageBorderColor } from '../../../src/diagrams/class/class-package-style.js';
import {
  classScopedColor,
  objectDefaultBackground,
} from '../../../src/diagrams/class/renderer-classifier-scoped-colors.js';
import { applyCucaDocumentMargin } from '../../../src/core/TextBlockExporter.js';
import { OBJECT_SKIN_DEFAULT_BUCKET, objectSkinDefaults } from '../../../src/core/object-skin-default.js';
import { applyClassDocumentMargin } from '../../../src/diagrams/class/layout-ink-extent.js';
import { measureScopeRow, readScopeFixture, renderDbgMarkup } from './dss-test-helpers.js';

/** Fill / stroke / text colours of `<tag>` elements in document order. */
function attrsOf(svg: string, tag: string, attr: string): string[] {
  const out: string[] = [];
  for (const m of svg.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))) {
    const hit = new RegExp(`\\b${attr}="([^"]*)"`).exec(m[0]);
    if (hit?.[1] !== undefined) out.push(hit[1]);
  }
  return out;
}

/** Stroke colours of `<tag>` elements, from `style="stroke:..."` or a `stroke=` attribute. */
function strokesOf(svg: string, tag: string): string[] {
  return [...svg.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].flatMap((m) => {
    const hit = /stroke(?::|=")([^;"]+)/.exec(m[0]);
    return hit?.[1] === undefined ? [] : [hit[1]];
  });
}

describe('package frame fill (Cluster.java:290-293,363-365): class-namespace-shape reads group.<symbol>', () => {
  it.each([
    'class__cascade-bg-diag',
    'class__cascade-bg-diag-element',
    'class__cascade-bg-element',
    'class__cascade-bg-root',
    'class__probe-pkg-cluster',
    'class__probe-usym-cluster',
  ])('%s draws exactly the jar svg', (row) => {
    expect(measureScopeRow(row).diffCount).toBe(0);
  });

  it('a package frame takes the classDiagram BackgroundColor (jar #AAA, was none)', () => {
    const svg = renderDbgMarkup(readScopeFixture('class__cascade-bg-diag').markup);
    expect(attrsOf(svg, 'path', 'fill')[0]).toBe('#AAA');
  });
});

describe('note on a link (EntityImageNoteLink.java:64 -> ComponentType.java:98-99): reads note.link', () => {
  it.each(['class__notes-bg-diag', 'class__notes-font-diag'])('%s draws exactly the jar svg', (row) => {
    expect(measureScopeRow(row).diffCount).toBe(0);
  });

  it('classDiagram { BackgroundColor } leaves the link note its default (jar #FEFFDD), the plain note takes it', () => {
    const svg = renderDbgMarkup(readScopeFixture('class__notes-bg-diag').markup);
    const fills = attrsOf(svg, 'path', 'fill');
    expect(fills.filter((f) => f === '#FEFFDD')).toHaveLength(2);
    expect(fills.filter((f) => f === '#AAA').length).toBeGreaterThan(2);
  });
});

describe('spot (EntityImageClassHeader.java:197-226): a spot<Kind> signature names its own kind only', () => {
  it('class__probe-spot-own: spotClass { LineColor; FontColor } stays on the class spot, interface keeps its defaults', () => {
    expect(measureScopeRow('class__probe-spot-own').diffCount).toBe(0);
    const svg = renderDbgMarkup(readScopeFixture('class__probe-spot-own').markup);
    // spot ellipses in document order: class A (spotClass), interface I (spotInterface)
    expect(strokesOf(svg, 'ellipse')).toEqual(['#BBB', '#181818']);
  });
});

describe('object entities (EntityImageObject.java:123-124): {root,element,objectDiagram,object}, never classDiagram or class', () => {
  it.each([
    'object__cascade-bg-diag',
    'object__cascade-bg-diag-element',
    'object__cascade-line-diag',
    'object__cascade-line-diag-element',
    'object__cascade-font-diag',
    'object__cascade-font-diag-element',
    'object__kinds-bg-classdiag',
    'object__kinds-line-classdiag',
    'object__kinds-font-classdiag',
  ])('%s draws exactly the jar svg', (row) => {
    expect(measureScopeRow(row).diffCount).toBe(0);
  });

  it('classDiagram { BackgroundColor } leaves an object its #F1F1F1 (jar), objectDiagram { BackgroundColor } takes it', () => {
    const classDiag = renderDbgMarkup(readScopeFixture('object__cascade-bg-diag').markup);
    expect(attrsOf(classDiag, 'rect', 'fill')).toContain('#F1F1F1');
    const objectDiag = renderDbgMarkup(
      readScopeFixture('object__cascade-bg-diag').markup.replace('classDiagram', 'objectDiagram'),
    );
    expect(attrsOf(objectDiag, 'rect', 'fill')).toContain('#AAA');
  });
});

describe('a `<style>` inside a class body embed (PSystemCommandFactory.java:288-307)', () => {
  it.each(['class__nested-skinparam-note-then-style', 'class__nested-style-then-skinparam'])(
    '%s renders the embed like the jar, not a syntax error page',
    (row) => {
      expect(measureScopeRow(row).diffCount).toBe(0);
    },
  );
});

describe('rows authored for T3b, each with a jar oracle', () => {
  it.each([
    'class__x-note-link-note',
    'class__x-note-link-diag',
    'class__x-note-link-seq',
    'class__x-pkg-group-line',
    'class__x-order-root-then-skin',
    'class__x-order-skin-then-root',
    'class__x-order-header-bg',
    'class__x-skin-note-bg',
    'class__x-skin-note-font',
    'class__x-skin-stereotype-font',
    'class__x-skin-default-font-stereotype',
    'object__x-skin-class-colours',
    'object__x-style-class-bg',
    'object__x-stereotype-font',
    'class__kinds-none',
  ])('%s draws exactly the jar svg', (row) => {
    expect(measureScopeRow(row).diffCount).toBe(0);
  });

  it('skinparam noteBackgroundColor reaches a class note (jar #BBB, was #FEFFDD): the no-<style> mover', () => {
    const svg = renderDbgMarkup(readScopeFixture('class__x-skin-note-bg').markup);
    expect(attrsOf(svg, 'path', 'fill').filter((f) => f === '#BBB')).toHaveLength(4);
  });

  it('a transparent root background draws the class box fill="none", not #00000000 (jar)', () => {
    const svg = renderDbgMarkup(readScopeFixture('class__x-order-header-bg').markup);
    expect(attrsOf(svg, 'rect', 'fill')).not.toContain('#000');
    expect(attrsOf(svg, 'ellipse', 'fill')[0]).toBe('none');
  });

  it('two-character members are text, not a visibility member (Member.java:133, VisibilityModifier.java:211-214)', () => {
    const svg = renderDbgMarkup('@startuml\nclass A {\n +x\n +name\n}\n@enduml');
    const texts = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    expect(texts).toEqual(['A', '+x', 'name']);
  });
});

describe('readers, with the bucket values in hand', () => {
  const withElements = (elements: NonNullable<Theme['colors']['elements']>): Theme => ({
    ...defaultTheme,
    colors: { ...defaultTheme.colors, elements },
  });

  it('namespaceColorFill: the inline colour, then group.<symbol>, then packageBackground', () => {
    const theme = withElements({
      'group.folder': { background: '#112233' },
      'group.package': { background: '#445566' },
    });
    expect(namespaceColorFill('#AABBCC', theme, 'folder')).toBe('#AABBCC');
    expect(namespaceColorFill(undefined, theme, 'folder')).toBe('#112233');
    expect(namespaceColorFill(undefined, theme)).toBe('#445566');
    expect(namespaceColorFill(undefined, withElements({}), 'folder')).toBe('none');
  });

  it('packageBorderColor: group.<symbol> over the flat package border, a stereotype tier above both', () => {
    const theme = withElements({ 'group.package': { border: '#654321' } });
    expect(packageBorderColor(theme, [], '#000000')).toBe('#654321');
    expect(packageBorderColor(theme, [], '#000000', 'folder')).toBe('#000000');
  });

  it('objectDefaultBackground: the skin default unless a class-signed value sits in classBackground', () => {
    const plain = defaultTheme;
    expect(objectDefaultBackground(plain)).toBe('#F1F1F1');
    const classSkin: Theme = {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        graph: { ...defaultTheme.colors.graph, classBackground: '#AAAAAA', classBackgroundExplicit: true },
      },
    };
    expect(objectDefaultBackground(classSkin)).toBe('#F1F1F1');
    const darkSeed: Theme = {
      ...defaultTheme,
      colors: { ...defaultTheme.colors, graph: { ...defaultTheme.colors.graph, classBackground: '#313139' } },
    };
    expect(objectDefaultBackground(darkSeed)).toBe('#313139');
  });

  it('classScopedColor: transparent is none, a gradient passes through, absent is undefined', () => {
    const gradient = { color1: '#59B6EC', color2: '#2FA4E7', policy: '-' } as const;
    const theme = withElements({ class: { background: 'transparent', border: gradient } });
    expect(classScopedColor(theme, 'class', 'background')).toBe('none');
    expect(classScopedColor(theme, 'class', 'border')).toEqual(gradient);
    expect(classScopedColor(theme, 'class.header', 'background')).toBeUndefined();
  });

  it('advanceBodyEmbed: a } between {{ and }} never closes the body, and the depth returns to 0', () => {
    const state = { pendingBodyEmbedDepth: undefined } as ParseState;
    const seen = ['{{', 'note {', '}', '</style>', '}}', '}'].map((line) => advanceBodyEmbed(state, line));
    expect(seen).toEqual([false, true, true, true, true, false]);
    expect(state.pendingBodyEmbedDepth).toBe(0);
  });

  it('parseMemberLine: +x is not explicit, +xx is', () => {
    expect(parseMemberLine('+x')?.visibilityExplicit).toBeUndefined();
    expect(parseMemberLine('+xx')?.visibilityExplicit).toBe(true);
    expect(parseMemberLine('**bold**')?.visibilityExplicit).toBeUndefined();
  });
});

describe('document Margin (TextBlockExporter.java:173,199-203,510-516; CucaDiagram.java:741-745)', () => {
  it.each([
    'class__x-margin-root',
    'class__x-margin-document',
    'class__x-margin-padding',
    'class__x-margin-sides',
    'class__x-margin-chrome',
    'class__x-margin-single',
    'class__x-margin-border',
    'class__x-margin-lone-note',
    'class__x-margin-empty',
    'object__x-margin-root',
    'class__d3-theme-only',
    'class__d3-theme-unrelated',
    'class__d3-theme-element',
    'class__x-theme-gradient',
  ])('%s draws exactly the jar svg', (row) => {
    expect(measureScopeRow(row).diffCount).toBe(0);
  });

  it('applyCucaDocumentMargin adds the given sides, then ensureVisible truncates; absent is (0, 5, 5, 0)', () => {
    expect(applyCucaDocumentMargin({ width: 50.5, height: 20 })).toEqual({ width: 56, height: 26 });
    const margin = { top: 3, right: 7, bottom: 11, left: 13 };
    expect(applyCucaDocumentMargin({ width: 50.5, height: 20 }, margin)).toEqual({ width: 71, height: 35 });
    expect(applyClassDocumentMargin({ width: 50.5, height: 20 }, margin)).toEqual({ width: 71, height: 35 });
  });

  it('a style Margin moves the first class box by (left, top): x = 7 + 10 at Margin 10', () => {
    const svg = renderDbgMarkup(readScopeFixture('class__x-margin-root').markup);
    expect(attrsOf(svg, 'rect', 'x')[0]).toBe('17');
  });
});

describe('a folder frame is not a package (Cluster.java:290-293, :387)', () => {
  it('class__x-pkg-line-on-folder: package { LineColor } reaches the package frame and not the folder frame', () => {
    expect(measureScopeRow('class__x-pkg-line-on-folder').diffCount).toBe(0);
    const svg = renderDbgMarkup(readScopeFixture('class__x-pkg-line-on-folder').markup);
    expect(strokesOf(svg, 'path').slice(0, 2)).toEqual(['#654321', '#000']);
  });
});

describe('object skin default under mode dark (plantuml.skin:568)', () => {
  it('objectSkinDefaults: only in dark mode', () => {
    expect(objectSkinDefaults(new Map())).toEqual({});
    expect(objectSkinDefaults(new Map([['mode', 'dark']]))).toEqual({
      [OBJECT_SKIN_DEFAULT_BUCKET]: { background: '#313139' },
    });
  });

  it('object__x-dark-class-background: an explicit classBackgroundColor leaves the object the dark default', () => {
    expect(measureScopeRow('object__x-dark-class-background').diffCount).toBe(0);
  });
});
