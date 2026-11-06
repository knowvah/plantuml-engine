import { describe, expect, it } from 'vitest';

import type { DiagramType } from '../../../src/core/block-extractor.js';
import { buildTheme } from '../../../src/core/build-theme.js';
import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';
import { renderSync } from '../../../src/index.js';
import { currentStyleBuilderOf, documentBackColor, styleNameOf } from '../../../src/core/document-back-color.js';
import { withPrevious } from '../../../src/core/nested-previous.js';
import { preprocess, type PreprocessorResult } from '../../../src/core/preprocessor.js';
import { StyleSignatureBasic } from '../../../src/core/style/StyleSignatureBasic.js';

const GREY = '#AAAAAA';
const GREY_PAIR = { background: GREY };
/** No declaration reached the signature: `plantuml.skin`'s `document { BackGroundColor white }`, as `defaultTheme` spells it. */
const SKIN_WHITE = { background: '#FFFFFF' };
/** A declared `white`: the raw value, as the skinparam handler stores it. */
const DECLARED_WHITE = { background: 'white' };

const source = (body: string): PreprocessorResult => preprocess(`@startuml\n${body}\nA -> B\n@enduml`);
const style = (css: string): string => `<style>\n${css}\n</style>`;
const read = (body: string, type: DiagramType = 'sequence'): ReturnType<typeof documentBackColor> =>
  documentBackColor(source(body), type);

describe('styleNameOf (DiagramType.java:234-296)', () => {
  it.each<[DiagramType, string, string]>([
    ['sequence', 'sequenceDiagram', ':235-236'],
    ['state', 'stateDiagram', ':238-239'],
    ['class', 'classDiagram', ':241-242'],
    ['object', 'objectDiagram', ':244-245'],
    ['activity', 'activityDiagram', ':247-248'],
    ['description', 'componentDiagram', ':250-251'],
    ['mindmap', 'mindmapDiagram', ':253-254'],
    ['wbs', 'wbsDiagram', ':256-257'],
    ['gantt', 'ganttDiagram', ':259-260'],
    ['salt', 'saltDiagram', ':262-263'],
    ['yaml', 'yamlDiagram', ':265-266'],
    ['hcl', 'yamlDiagram', ':268-269'],
    ['json', 'jsonDiagram', ':271-272'],
    ['timing', 'timingDiagram', ':274-275'],
    ['chronology', 'ganttDiagram', ':286-287'],
    ['chart', 'chartDiagram', ':289-290'],
    ['packetdiag', 'packetdiagDiagram', ':292-293'],
  ])('%s -> %s (%s)', (type, name) => {
    expect(styleNameOf(type)).toBe(name);
  });

  it.each<DiagramType>(['board', 'files', 'dot', 'unknown'])(
    '%s has no branch: the final return SName.activityDiagram (:295)',
    (type) => {
      expect(styleNameOf(type)).toBe('activityDiagram');
    },
  );
});

describe('documentBackColor: the gate (D3, D3b)', () => {
  it('a source with no <style> and no skin line is not read: undefined keeps the flat path', () => {
    expect(read('')).toBeUndefined();
    expect(read(`skinparam backgroundColor ${GREY}`)).toBeUndefined();
  });

  it("a skin line alone opens the gate: rose.skin's own document white", () => {
    expect(read('skin rose')).toEqual(DECLARED_WHITE);
  });

  it('a !theme alone opens it through the blocks in preprocessed.styles (D3b)', () => {
    const pre = source('!theme cerulean');
    expect(pre.styles.length).toBeGreaterThan(0);
    // Jar: sequence__scope-theme-only.svg, a root style with no background.
    expect(documentBackColor(pre, 'sequence')).toEqual({ background: 'transparent' });
  });
});

describe('documentBackColor: the merged { root, document, <diagram> } style (TitledDiagram.java:280-282)', () => {
  // Jar oracles: tests/fixtures/diagram-style-scope/sequence__selector-*.svg
  it.each([
    ['own nested', `sequenceDiagram {\n document {\n BackgroundColor ${GREY}\n }\n}`],
    ['reversed nesting', `document {\n sequenceDiagram {\n BackgroundColor ${GREY}\n }\n}`],
    ['bare diagram name', `sequenceDiagram {\n BackgroundColor ${GREY}\n}`],
    ['bare document', `document {\n BackgroundColor ${GREY}\n}`],
  ])('%s reaches the document', (_name, css) => {
    expect(read(style(css))).toEqual(GREY_PAIR);
  });

  it("a foreign diagram's selector is not a subset of the signature: the skin's white", () => {
    expect(read(style(`classDiagram {\n document {\n BackgroundColor ${GREY}\n }\n}`))).toEqual(SKIN_WHITE);
  });

  it('files and board read activityDiagram, the final return of getStyleName', () => {
    const css = style(`activityDiagram {\n document {\n BackgroundColor ${GREY}\n }\n}`);
    expect(read(css, 'files')).toEqual(GREY_PAIR);
    expect(read(css, 'board')).toEqual(GREY_PAIR);
    expect(read(css, 'class')).toEqual(SKIN_WHITE);
  });

  it('hcl reads yamlDiagram (DiagramType.java:268-269)', () => {
    expect(read(style(`yamlDiagram {\n document {\n BackgroundColor ${GREY}\n }\n}`), 'hcl')).toEqual(GREY_PAIR);
  });

  it('the last declared wins, whatever its depth (StyleStorage.java:102-116)', () => {
    expect(
      read(
        style(`sequenceDiagram {\n document {\n BackgroundColor red\n }\n}\ndocument {\n BackgroundColor ${GREY}\n}`),
      ),
    ).toEqual(GREY_PAIR);
  });

  it('skinparam then a white <style> document: white, the default colour is still authoritative (D3)', () => {
    expect(read(`skinparam backgroundColor ${GREY}\n${style('document {\n BackgroundColor #FFFFFF\n}')}`)).toEqual({
      background: '#FFFFFF',
    });
  });

  it('a <style> then a skinparam: the skinparam, muted later into the same storage (SkinParam.java:232-233)', () => {
    expect(read(`${style('document {\n BackgroundColor red\n}')}\nskinparam backgroundColor ${GREY}`)).toEqual(
      GREY_PAIR,
    );
  });
});

describe('documentBackColor: no declaration reached the signature', () => {
  it('a bare top-level <style> property is no selector: the flat value does not outlive it (jar #FFFFFF)', () => {
    expect(buildTheme(source(style('backgroundcolor: #CDE')), undefined, 'sequence').theme.colors.background).toBe(
      '#FFFFFF',
    );
  });

  it("an unrelated <style> gives the theme's own spelling of the skin's white, so a reader printing it raw is unmoved", () => {
    expect(read(style('note {\n BackgroundColor red\n}'))).toEqual(SKIN_WHITE);
  });
});

describe('documentBackColor: the pair the skinparam handler stores', () => {
  it('a gradient carries the flat text and the Gradient (HColorSet.java:109-116)', () => {
    expect(read(style('document {\n BackgroundColor red/blue\n}'))).toEqual({
      background: 'red',
      backgroundGradient: { color1: 'red', color2: 'blue', policy: '/' },
    });
  });

  it('a "-" gradient flattens to the first colour, as every separator (HColorGradient.java:103-105)', () => {
    expect(read(style('document {\n BackgroundColor red-blue\n}'))).toEqual({
      background: 'red',
      backgroundGradient: { color1: 'red', color2: 'blue', policy: '-' },
    });
  });

  it('an unparseable colour is WHITE, getColorOrWhite (HColorSet.java:58-63)', () => {
    expect(read(style('document {\n BackgroundColor notacolour\n}'))).toEqual({ background: '#FFFFFF' });
  });

  it.each([
    ['transparent', 'transparent'],
    ['none', 'none'],
    // ValueImpl.java:94,97 `equalsIgnoreCase`; jar: root style carries no background.
    ['TRANSPARENT', 'transparent'],
    ['NONE', 'none'],
  ])('%s maps to the keyword svgRoot treats as no paint (svg.ts `isSolid`)', (raw, background) => {
    expect(read(style(`document {\n BackgroundColor ${raw}\n}`))).toEqual({ background });
  });
});

describe('documentBackColor: skinparam mode dark (D3)', () => {
  const DARK = 'skinparam mode dark';

  it('an unrelated <style> leaves the skin value: undefined keeps theme-dark', () => {
    expect(read(`${DARK}\n${style('note {\n BackgroundColor red\n}')}`)).toBeUndefined();
  });

  it('is read case-insensitively, as SkinParam.isDark (SkinParam.java:114-116)', () => {
    expect(read(`skinparam MODE DARK\n${style('note {\n BackgroundColor red\n}')}`)).toBeUndefined();
  });

  it('a mode other than dark takes the skin value', () => {
    expect(read(`skinparam mode light\n${style('note {\n BackgroundColor red\n}')}`)).toEqual(SKIN_WHITE);
  });

  it('an explicit colour wins (jar: sequence__scope-dark-style, background #AAAAAA)', () => {
    expect(read(`${DARK}\n${style(`document {\n BackgroundColor ${GREY}\n}`)}`)).toEqual(GREY_PAIR);
  });

  it("an explicit white has no dark twin, unlike the skin's white (DarkString.java:54-72; jar #FFFFFF)", () => {
    expect(read(`${DARK}\n${style('document {\n BackgroundColor white\n}')}`)).toEqual(DECLARED_WHITE);
  });

  it('a skinparam white after the mode: the same (jar #FFFFFF)', () => {
    const pre = source(`${DARK}\nskinparam backgroundColor white\n${style('note {\n BackgroundColor red\n}')}`);
    expect(documentBackColor(pre, 'sequence')).toEqual(DECLARED_WHITE);
  });
});

describe('documentBackColor: a dark-only @media value (smc T1c, D4)', () => {
  const DARK_ONLY = style('@media (prefers-color-scheme:dark) {\n document {\n  BackgroundColor #111111\n }\n}');

  // `DarkString#mergeWith` keeps the user's (null, #111111) over the skin's (white, #1B1B1B): higher priority, both
  // value2 set (DarkString.java:50-67); `asColor` then throws on the null value1 (ValueImpl.java:100-101).
  it('throws as asColor does, with no dark mode (stock jar: IllegalArgumentException: null/#111111)', () => {
    expect(() => read(DARK_ONLY)).toThrow(/IllegalArgumentException: null\/#111111/);
  });

  it('throws under skinparam mode dark too: calculateBackColor reads asColor whatever the mode (TitledDiagram.java:280-289)', () => {
    expect(() => read(`skinparam mode dark\n${DARK_ONLY}`)).toThrow(/IllegalArgumentException/);
  });

  it('renderSync draws our crash page for sequence__scope-media-dark-only', () => {
    let errorPage = false;
    setErrorPageObserver(() => {
      errorPage = true;
    });
    try {
      renderSync(`@startuml\n${DARK_ONLY}\nA -> B\n@enduml\n`);
    } finally {
      setErrorPageObserver(undefined);
    }
    expect(errorPage).toBe(true);
  });
});

describe('documentBackColor: a caller-named theme', () => {
  const UNRELATED = style('note {\n BackgroundColor red\n}');

  it('keeps the named theme when the builder returns the skin value', () => {
    expect(documentBackColor(source(UNRELATED), 'sequence', true)).toBeUndefined();
  });

  it('a colour the document declares still wins over it', () => {
    expect(documentBackColor(source(style(`document {\n BackgroundColor ${GREY}\n}`)), 'sequence', true)).toEqual(
      GREY_PAIR,
    );
  });
});

describe('documentBackColor: malformed <style> (D6)', () => {
  it('a block the parser rejects keeps the flat path: undefined, no throw', () => {
    expect(read(style('document {\n BackgroundColor\n}\n}'))).toBeUndefined();
  });

  it('any other exception propagates', () => {
    const pre: PreprocessorResult = { ...source(''), styles: [42 as unknown as string] };
    expect(() => documentBackColor(pre, 'sequence')).toThrow(TypeError);
  });
});

describe('currentStyleBuilderOf (D1a): inherited skinparams never convert (SkinParam.java:217-218)', () => {
  const NOTE = StyleSignatureBasic.of('root', 'element', 'classDiagram', 'note');
  const noteBackground = (pre: PreprocessorResult): string | null | undefined =>
    NOTE.getMergedStyle(currentStyleBuilderOf(pre))?.value('BackGroundColor').asString();
  const INHERITED = new Map([['notebackgroundcolor', '#BBBBBB']]);
  const NESTED_BODY = style('class {\n FontSize 12\n}');

  it("an outer skinparam noteBackgroundColor does not reach a nested <style> diagram's builder (jar #FEFFDD)", () => {
    expect(noteBackground(withPrevious(source(NESTED_BODY), INHERITED))).toBe('#FEFFDD');
  });

  it('the same key set by the nested diagram itself does convert', () => {
    const own = source(`skinparam noteBackgroundColor #CCCCCC\n${NESTED_BODY}`);
    expect(noteBackground(withPrevious(own, INHERITED))).toBe('#CCCCCC');
  });

  it('a result with no declaration order keeps the builder reading: every skinparam converts', () => {
    const { declarationOrder: _none, ...unordered } = withPrevious(source(NESTED_BODY), INHERITED);
    expect(noteBackground(unordered)).toBe('#BBBBBB');
  });
});

describe('buildTheme applies the pair after the segments, before Stage 4', () => {
  const colors = (body: string, options?: Parameters<typeof buildTheme>[1], type: DiagramType = 'sequence') =>
    buildTheme(source(body), options, type).theme.colors;

  it('the foreign selector leaves the canvas white, no flat scan paints it', () => {
    expect(colors(style(`classDiagram {\n document {\n BackgroundColor ${GREY}\n }\n}`)).background).toBe('#FFFFFF');
  });

  it('the same source on its own diagram type paints', () => {
    const css = style(`classDiagram {\n document {\n BackgroundColor ${GREY}\n }\n}`);
    expect(colors(css, undefined, 'class').background).toBe(GREY);
  });

  it('a solid value clears an earlier gradient of the flat path', () => {
    const body = `skinparam backgroundColor red/blue\n${style('document {\n BackgroundColor black\n}')}`;
    expect(colors(body).background).toBe('black');
    expect('backgroundGradient' in colors(body)).toBe(false);
  });

  it('the caller Partial<Theme> background still wins', () => {
    const css = style(`document {\n BackgroundColor ${GREY}\n}`);
    expect(colors(css, { theme: { colors: { background: '#123456' } } as never }).background).toBe('#123456');
  });

  it("a caller's named theme keeps its canvas under an unrelated <style>", () => {
    expect(colors(style('note {\n BackgroundColor red\n}'), { theme: 'dark' }).background).toBe('#1E1E1E');
  });

  it('skinparam mode dark keeps the theme-dark canvas under an unrelated <style>', () => {
    const body = `skinparam mode dark\n${style('note {\n BackgroundColor #AAAAAA\n}')}`;
    expect(colors(body).background).toBe('#1B1B1B');
  });

  it('a malformed <style> keeps the flat value of a skinparam', () => {
    const body = `skinparam backgroundColor ${GREY}\n${style('document {\n BackgroundColor\n}\n}')}`;
    expect(colors(body).background).toBe(GREY);
  });
});
