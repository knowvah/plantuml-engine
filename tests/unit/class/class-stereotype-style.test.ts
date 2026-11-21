/**
 * `class-stereotype-style.ts`: a classifier's `<<stereotype>>` label reads the `stereotype` style of its own query,
 * `forStereotypeItself` (upstream 53fba993513 classes, e7e3d8063b5 objects/maps/JSON). Expected values from the
 * 1.2026.11beta1 oracles: `class/dozude-05-jeve029` («mystyle» red, bold, not italic) and
 * `object/tenalu-53-meri239` («Foo1» at 8 px from `skinparam object { <<Foo1>> { FontSize 8 } }`).
 */
import { describe, expect, it } from 'vitest';
import { buildMindmapStyleBuilder } from '../../../src/core/style/mindmap-style-builder.js';
import type { Classifier } from '../../../src/diagrams/class/ast.js';
import {
  annotateStereotypeFonts,
  mergedStyleFields,
  styledStereoFace,
} from '../../../src/diagrams/class/class-stereotype-style.js';

const MYSTYLE = `classDiagram {
    RoundCorner 15
    .mystyle {
      RoundCorner 5
      BackgroundColor cyan
      FontStyle Bold
      FontColor red
    }
}`;

function classifier(kind: string, stereotype: string | undefined, typeParams: string[]): Classifier {
  return { name: 'A', kind, stereotype, typeParams, members: [] } as unknown as Classifier;
}

function annotated(
  kind: string,
  stereotype: string | undefined,
  style: { skinparam?: Map<string, string>; styles?: string[] },
  typeParams: string[] = [],
): Classifier {
  const c = classifier(kind, stereotype, typeParams);
  annotateStereotypeFonts(
    [c],
    buildMindmapStyleBuilder({ skinparam: style.skinparam ?? new Map(), styles: style.styles ?? [] }),
  );
  return c;
}

describe('annotateStereotypeFonts', () => {
  it('a class stereotype takes its <style> class rule: red, bold, not italic (dozude-05-jeve029)', () => {
    const c = annotated('class', 'mystyle', { styles: [MYSTYLE] });
    expect(c.stereotypeFont).toEqual({ font: 'red', fontFace: { bold: true, italic: false } });
    expect(styledStereoFace('sans-serif', c.stereotypeFont!)).toEqual({
      family: 'sans-serif',
      size: 12,
      bold: true,
      italic: false,
    });
  });

  it('an unstyled stereotype answers nothing beyond the skin: 12 px italic black', () => {
    const c = annotated('class', 'other', { styles: [MYSTYLE] });
    expect(c.stereotypeFont).toEqual({});
    expect(styledStereoFace('sans-serif', c.stereotypeFont!)).toEqual({
      family: 'sans-serif',
      size: 12,
      bold: false,
      italic: true,
    });
  });

  it('an object stereotype takes `skinparam object { <<Foo1>> { FontSize 8 } }` (tenalu-53-meri239)', () => {
    const skinparam = new Map([['object<<foo1>>fontsize', '8']]);
    expect(annotated('object', 'Foo1', { skinparam }).stereotypeFont).toEqual({ fontSize: 8 });
  });

  it('skinparam classStereotypeFontColor reaches the label through FromSkinparamToStyle (53fba993513)', () => {
    const skinparam = new Map([['classstereotypefontcolor', 'blue']]);
    expect(annotated('class', 'x', { skinparam }).stereotypeFont).toEqual({ font: 'blue' });
  });

  it('leaves a classifier with no stereotype and no generic alone', () => {
    const c = annotated('class', undefined, { styles: [MYSTYLE] });
    expect(c.stereotypeFont).toBeUndefined();
    expect(mergedStyleFields(c)).toEqual({});
  });

  it('a generic class with no stereotype still reads the stereotype style (EntityImageClassHeader.java:146-147)', () => {
    const c = annotated('class', undefined, { styles: ['root { FontColor #AA0000 }'] }, ['T']);
    expect(c.stereotypeFont).toEqual({ font: '#AA0000' });
    expect(mergedStyleFields(c)).toEqual({ stereotypeFont: { font: '#AA0000' } });
  });

  it('an object has no generic box: no stereotype, nothing stored', () => {
    expect(annotated('object', undefined, { styles: ['root { FontColor #AA0000 }'] }, ['T']).stereotypeFont).toBe(
      undefined,
    );
  });
});
