/**
 * `class-usymbol-title-style.ts` (cuts, #195): a class diagram's description leaf reads `styleTitle`,
 * `{root, element, classDiagram, <symbol SNames>, title}` merged with its stereotype on the entity's own builder
 * (`EntityImageDescription.java:142-151`, `Entity.java:760-772`). Expected values from the jar oracles under
 * `tests/fixtures/class-usymbol-title-style/` and `tests/fixtures/usecase-title-style/skin-title-allowmixing.svg`.
 */
import { describe, expect, it } from 'vitest';

import { buildTheme } from '../../../src/core/build-theme.js';
import { layoutServicesSync } from '../../../src/core/elk/layout-services.js';
import { preprocess } from '../../../src/core/preprocessor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { stylePaint } from '../../../src/core/style/style-reads.js';
import { renderSync } from '../../../src/index.js';
import type { Classifier } from '../../../src/diagrams/class/ast.js';
import { classPlugin } from '../../../src/diagrams/class/index.js';
import { annotateUSymbolTitleStyles } from '../../../src/diagrams/class/class-usymbol-title-style.js';

/** `skinparam titleBorderColor red` / `titleBorderThickness 2` (`FromSkinparamToStyle.java:166-169`). */
const TITLE_SKINPARAMS = 'skinparam titleBorderColor red\nskinparam titleBorderThickness 2';

/** `red` as `stylePaint` answers it; the SVG writer shortens it to the oracle's `#F00`. */
const RED = '#FF0000';
const RED_SVG = '#F00';

/** The default stroke the jar keeps for a description leaf (`style-after.svg`). */
const DEFAULT_LINE = '#181818';
const DEFAULT_THICKNESS = 0.5;

function classifier(fields: Partial<Classifier>): Classifier {
  return { name: 'U', id: 'U', members: [], typeParams: [], ...fields } as unknown as Classifier;
}

/** Stamps one classifier with the builder current after `generation` style blocks of `body`. */
function stamped(body: string, fields: Partial<Classifier>): Classifier {
  const pre = preprocess(`@startuml\nallowmixing\n${body}\nclass K\n@enduml`);
  const { theme } = buildTheme(pre, undefined, 'class');
  const { styleBuilder } = layoutServicesSync(classPlugin, {}, undefined, pre);
  const c = classifier(fields);
  annotateUSymbolTitleStyles([c], styleBuilder!, theme);
  return c;
}

function render(source: string): string {
  return renderSync(source, { measurer: new DeterministicMeasurer() });
}

describe('annotateUSymbolTitleStyles (EntityImageDescription.java:142-151)', () => {
  it('a usecase takes the bare title skinparams: LineColor red, stroke 2', () => {
    const style = stamped(TITLE_SKINPARAMS, { kind: 'usecase', styleGeneration: 0 }).usymbolTitleStyle;
    expect(stylePaint(style, 'LineColor')).toBe(RED);
    expect(style!.getStroke().getThickness()).toBe(2);
  });

  it('an actor and a component take them too (GeneralImageBuilder.java:162-180)', () => {
    for (const usymbol of ['actor', 'component', 'database', 'actor/']) {
      const style = stamped(TITLE_SKINPARAMS, { kind: 'descriptive', usymbol, styleGeneration: 0 }).usymbolTitleStyle;
      expect([usymbol, stylePaint(style, 'LineColor')]).toEqual([usymbol, RED]);
      expect([usymbol, style!.getStroke().getThickness()]).toEqual([usymbol, 2]);
    }
  });

  it('a <style> after the leaf does not reach it: the entity builder (Entity.java:760-772)', () => {
    const late = '<style>\ntitle {\n  LineColor blue\n  LineThickness 3\n}\n</style>';
    const style = stamped(late, { kind: 'usecase', styleGeneration: 0 }).usymbolTitleStyle;
    expect(stylePaint(style, 'LineColor')).toBe(DEFAULT_LINE);
    expect(style!.getStroke().getThickness()).toBe(DEFAULT_THICKNESS);
    const before = stamped(late, { kind: 'usecase', styleGeneration: 1 }).usymbolTitleStyle;
    expect(stylePaint(before, 'LineColor')).toBe('#0000FF');
    expect(before!.getStroke().getThickness()).toBe(3);
  });

  it('a class, an object and a port carry no title style', () => {
    for (const fields of [{ kind: 'class' }, { kind: 'object' }, { kind: 'descriptive', usymbol: 'port' }]) {
      expect(stamped(TITLE_SKINPARAMS, fields as Partial<Classifier>).usymbolTitleStyle).toBeUndefined();
    }
  });
});

describe('the class draw strokes description leaves from styleTitle', () => {
  it('skin-title-allowmixing: the usecase ellipse and the actor are #F00 at 2', () => {
    const svg = render(
      `@startuml\nallowmixing\n${TITLE_SKINPARAMS}\nclass K\nusecase U\nactor A\nA --> U\nK --> U\n@enduml`,
    );
    const red = `style="stroke:${RED_SVG};stroke-width:2;"`;
    // The usecase ellipse, the actor's head, and the actor's body path: three, as the oracle has.
    expect(svg.match(new RegExp(`<ellipse[^>]*fill="#F1F1F1" ${red}`, 'g'))?.length).toBe(2);
    expect(svg.match(new RegExp(`<path[^>]*${red} fill="none"`, 'g'))?.length).toBe(1);
  });

  it('title-back: titleBackgroundColor fills the usecase #FF0; inline-back: a bare #pink still wins', () => {
    const back = render('@startuml\nallowmixing\nskinparam titleBackgroundColor yellow\nclass K\nusecase U\n@enduml');
    expect(back).toMatch(/<ellipse[^>]*fill="#FF0"/);
    const pink = render(
      '@startuml\nallowmixing\nskinparam titleBackgroundColor yellow\nclass K\nusecase U #pink\n@enduml',
    );
    expect(pink).toMatch(/<ellipse[^>]*fill="#FFC0CB"/);
  });
});

describe('the class sizer reads the same stroke (EntityImageDescription.java:168,177)', () => {
  const ISSUE = `@startuml\nallowmixing\n${TITLE_SKINPARAMS}\nclass K\nusecase U\nactor A\nA --> U\nK --> U\n@enduml`;

  it('skin-title-allowmixing: the canvas is the jar 126 x 177, the usecase and actor head where the jar puts them', () => {
    const svg = render(ISSUE);
    expect(svg).toContain('viewBox="0 0 126 177"');
    expect(svg).toContain('<ellipse cx="62.675" cy="152.092" rx="13.115" ry="11.092"');
    expect(svg).toContain('<ellipse cx="98.68" cy="14" rx="8" ry="8"');
  });

  it('usecase-border: each leaf sizes with its own thickness (usecase 1, actor 2)', () => {
    const svg = render(
      `@startuml\nallowmixing\n${TITLE_SKINPARAMS}\nclass K\nskinparam usecaseBorderColor green\n` +
        'skinparam usecaseBorderThickness 1\nusecase U\nactor A\nK --> U\nA --> U\n@enduml',
    );
    expect(svg).toContain('viewBox="0 0 126 177"');
    expect(svg).toMatch(/<ellipse cx="62.675" cy="152.092"[^>]*style="stroke:#008000;stroke-width:1;"/);
    expect(svg).toMatch(/<ellipse cx="98.68" cy="14"[^>]*style="stroke:#F00;stroke-width:2;"/);
  });
});

describe('the class usecase sizer measures the stereotype it draws (EntityImageDescription.java:193-202)', () => {
  it('stereo: usecase U <<S>> sizes its DOT node with the «S» block, canvas 126 x 167 as the jar', () => {
    const svg = render(
      `@startuml\nallowmixing\n${TITLE_SKINPARAMS}\nclass K\nskinparam usecaseBorderColor<<S>> blue\n` +
        'usecase U <<S>>\nusecase V\nK --> U\nK --> V\n@enduml',
    );
    expect(svg).toContain('viewBox="0 0 126 167"');
    expect(svg).toContain('<text x="95.332" y="137.499" fill="#000" font-size="14">V</text>');
  });
});
