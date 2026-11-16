/**
 * uts T1b (#148): a usecase is drawn by `EntityImageDescription` (`GeneralImageBuilder.java:169-175`), so its
 * `styleTitle` is `{root, element, componentDiagram, <symbol SNames>, title}` (`EntityImageDescription.java:142-153`)
 * merged on the entity's own builder (`Entity.java:755-767`). Each expected value is read off a jar oracle in
 * `tests/fixtures/usecase-title-style/`.
 */
import { describe, expect, it } from 'vitest';

import { buildTheme } from '../../../src/core/build-theme.js';
import { layoutServicesSync } from '../../../src/core/elk/layout-services.js';
import { preprocess } from '../../../src/core/preprocessor.js';
import type { Style } from '../../../src/core/style/Style.js';
import type { USymbol } from '../../../src/core/descriptive-keywords.js';
import type { DescriptiveNode } from '../../../src/diagrams/description/ast.js';
import { annotateEntityStyles, stylePaint } from '../../../src/diagrams/description/description-entity-style.js';
import { descriptionPlugin } from '../../../src/diagrams/description/index.js';

/** `skinparam titleBorderColor red` / `titleBorderThickness 2` (`FromSkinparamToStyle.java:166-169`). */
const TITLE_SKINPARAMS = 'skinparam titleBorderColor red\nskinparam titleBorderThickness 2';

/** `red`, which the SVG writer shortens to the oracle's `#F00`. */
const RED = '#FF0000';

/** The default usecase stroke the jar keeps (`style-after-usecase.svg`): `stroke:#181818;stroke-width:0.5`. */
const DEFAULT_LINE = '#181818';
const DEFAULT_THICKNESS = 0.5;

/** The `title` style `annotateEntityStyles` stores on one node, its builder current after `generation` style blocks. */
function titleOf(body: string, symbol: USymbol, generation = 0): Style | undefined {
  const pre = preprocess(`@startuml\n${body}\n@enduml`);
  const { theme } = buildTheme(pre, undefined, 'description');
  const { styleBuilder } = layoutServicesSync(descriptionPlugin, {}, undefined, pre);
  const node: DescriptiveNode = { id: 'U', display: 'U', symbol, children: [], styleGeneration: generation };
  annotateEntityStyles([node], styleBuilder!, theme);
  return node.entityStyle?.title;
}

describe('annotateEntityStyles: a usecase reads styleTitle (EntityImageDescription.java:142-153)', () => {
  it('skinparam titleBorderColor/Thickness strokes a usecase #F00 at 2 (skin-title.svg)', () => {
    const title = titleOf(TITLE_SKINPARAMS, 'usecase');
    expect(stylePaint(title, 'LineColor')).toBe(RED);
    expect(title?.getStroke().getThickness()).toBe(2);
  });

  it('a business usecase reads {usecase, business, title}, with titleBackgroundColor (skin-title-business.svg)', () => {
    const title = titleOf(`${TITLE_SKINPARAMS}\nskinparam titleBackgroundColor #FFEEEE`, 'usecase-business');
    expect(stylePaint(title, 'LineColor')).toBe(RED);
    expect(stylePaint(title, 'BackGroundColor')).toBe('#FFEEEE');
    expect(title?.getStroke().getThickness()).toBe(2);
  });

  it("a <style> after the usecase, no skinparam: the entity's builder keeps the default (style-after-usecase.svg)", () => {
    const title = titleOf('<style>\nusecase {\n LineColor blue\n BackGroundColor #EEEEFF\n}\n</style>', 'usecase');
    expect(stylePaint(title, 'LineColor')).toBe(DEFAULT_LINE);
    expect(stylePaint(title, 'BackGroundColor')).toBe('#F1F1F1');
    expect(title?.getStroke().getThickness()).toBe(DEFAULT_THICKNESS);
  });
});
