/**
 * A skinparam after a `<style>` block folds into the same style storage (`SkinParam#setParam`,
 * `SkinParam.java:227-234`), so it neither erases another signature's style nor loses to an earlier value of its own
 * property. The jar values are the oracles of `tests/fixtures/diagram-style-scope/*__casc-*-after` and
 * `component__probe-skinparam-after-style`.
 */
import { describe, expect, it } from 'vitest';
import { buildTheme } from '../../../src/core/build-theme.js';
import type { DiagramType } from '../../../src/core/block-extractor.js';
import { preprocess } from '../../../src/core/preprocessor.js';
import { activityBoxStyleAtOf } from '../../../src/core/activity-box-style.js';
import { noteRoundCornerOf } from '../../../src/core/note-style-facts.js';
import { supersededCascadeFields } from '../../../src/core/skinparam-supersedes-cascade.js';
import { opaleRoundedCorner } from '../../../src/core/svek/image/opale-rounded-path.js';

const NOTE_FONT_SIZE = 12;

function themeOf(body: string, type: DiagramType) {
  return buildTheme(preprocess(`@startuml\n<style>\n${body}\n</style>\n@enduml\n`), undefined, type).theme;
}

function themeWithLate(style: string, late: string, type: DiagramType) {
  return buildTheme(preprocess(`@startuml\n<style>\n${style}\n</style>\n${late}\n@enduml\n`), undefined, type).theme;
}

describe('skinparam after <style>', () => {
  it('keeps the note bucket of the style block (component probe, jar note font 12)', () => {
    const theme = themeWithLate(
      'component { BackgroundColor #AAAAAA }\nnote { FontSize 12 }',
      'skinparam componentBackgroundColor #BBBBBB',
      'description',
    );
    expect(theme.colors.elements?.['note']?.fontSize).toBe(NOTE_FONT_SIZE);
    expect(theme.colors.elements?.['component']?.background).toBe('#BBBBBB');
  });

  it('keeps the note bucket across a late componentFontSize (jar component font 16)', () => {
    const theme = themeWithLate(
      'component { FontSize 18 }\nnote { FontSize 12 }',
      'skinparam componentFontSize 16',
      'description',
    );
    expect(theme.colors.elements?.['note']?.fontSize).toBe(NOTE_FONT_SIZE);
    expect(theme.colors.elements?.['component']?.fontSize).toBe(16);
  });

  it('is unaffected by an empty late run', () => {
    expect(themeOf('note { FontSize 12 }', 'description').colors.elements?.['note']?.fontSize).toBe(NOTE_FONT_SIZE);
  });
});

describe('a late skinparam supersedes the cascade value of its own property', () => {
  it('class: classFontSize 16 after class { FontSize 18 } (jar header font 16)', () => {
    const graph = themeWithLate('class { FontSize 18 }', 'skinparam classFontSize 16', 'class').colors.graph;
    expect(graph.classCascadeHeaderFontSize).toBeUndefined();
    expect(graph.classFontSize).toBe(16);
  });

  it('class: a later <style> writes the cascade again and wins in turn', () => {
    const source =
      '@startuml\n<style>\nclass { FontSize 18 }\n</style>\nskinparam classFontSize 16\n<style>\nclass { FontSize 20 }\n</style>\n@enduml\n';
    expect(buildTheme(preprocess(source), undefined, 'class').theme.colors.graph.classCascadeHeaderFontSize).toBe(20);
  });

  it('state: stateBorderThickness 2 after state { LineThickness 3 } (jar stroke-width 2)', () => {
    const theme = themeWithLate('state { LineThickness 3 }', 'skinparam stateBorderThickness 2', 'state');
    expect(theme.colors.graph.stateLineThickness).toBeUndefined();
    expect(theme.colors.elements?.['state']?.lineThickness).toBe(2);
  });

  it('state: roundCorner 8 after state { RoundCorner 20 } reaches the state boxes (jar rx 4)', () => {
    const theme = themeWithLate('state { RoundCorner 20 }', 'skinparam roundCorner 8', 'state');
    expect(theme.colors.graph.stateRoundCorner).toBe(8);
  });

  it('names only the keys FromSkinparamToStyle converts to those signatures', () => {
    expect([...supersededCascadeFields(['classFontSize<<x>>', 'classBackgroundColor'])]).toEqual([]);
    expect([...supersededCascadeFields(['classFontSize'])]).toEqual(['classCascadeHeaderFontSize']);
  });
});

describe('the note corner is the flat skinparam roundCorner (EntityImageNote.java:270-272)', () => {
  it('reads roundCorner and nothing that merely contains it', () => {
    expect(noteRoundCornerOf(new Map([['roundCorner', '8']]))).toBe(8);
    expect(noteRoundCornerOf(new Map([['titleBorderRoundCorner', '8']]))).toBe(0);
    expect(noteRoundCornerOf(new Map([['roundCorner', '8.5']]))).toBe(0);
  });

  it('draws the jar fold of a note rounded at 8 (class__rc-only oracle)', () => {
    expect(opaleRoundedCorner({ x: 83.57, y: 19.5 }, 28.231, 8)).toBe(
      'M101.801,19.5 L101.801,27.5 A2,2 0 0 0 103.801,29.5 L111.801,29.5 L101.801,19.5',
    );
  });
});

describe('an activity box keeps the style builder current at its command (ActivityDiagram3.java:114-117)', () => {
  const source =
    '@startuml\n<style>\nactivity { FontSize 18 }\n</style>\nstart\n:a;\nskinparam activityFontSize 16\n:b;\n@enduml\n';
  const pre = preprocess(source);
  const positionOf = (line: string): number | undefined => pre.linePositions?.[pre.lines.indexOf(line)];
  const FONT_SIZE_BEFORE_SKINPARAM = 18;

  it('reads the style FontSize at the box before the skinparam, the flat tier after it', () => {
    const at = activityBoxStyleAtOf(buildTheme(pre, undefined, 'activity').theme)!;
    expect(at([], positionOf(':a;'))?.value('FontSize').asString()).toBe(String(FONT_SIZE_BEFORE_SKINPARAM));
    expect(at([], positionOf(':b;'))).toBeUndefined();
  });
});
