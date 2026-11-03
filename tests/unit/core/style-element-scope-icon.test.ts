/**
 * T3g: a member row's visibility icon reads `root,element,visibilityIcon,<kind>`
 * (`VisibilityModifier.java:336-350`), which names no diagram, through the
 * document's builder (`MethodsOrFieldsArea.java:360-364`). Expected strings are
 * the jar's, from `tests/fixtures/diagram-style-scope/class__x-icon-*.svg`.
 */
import { describe, expect, it } from 'vitest';

import { buildTheme } from '../../../src/core/build-theme.js';
import { preprocess } from '../../../src/core/preprocessor.js';
import {
  ELEMENT_SIGNATURES,
  elementScopeColors,
  visibilityIconBucketOf,
} from '../../../src/core/style-element-scope.js';

const RED = '#BB0000';
const BLUE = '#0000BB';
const GREEN = '#00BB00';
const KINDS = ['public', 'private', 'protected', 'package', 'iemandatory'] as const;
const KIND_SNAMES = ['public_', 'private_', 'protected_', 'package_', 'IEMandatory'] as const;

const scope = (css: string): ReturnType<typeof elementScopeColors> =>
  elementScopeColors(preprocess(`@startuml\n<style>\n${css}\n</style>\nclass A\n@enduml`), 'class');

describe('visibility icon signatures (VisibilityModifier.java:336-350)', () => {
  it('one row per kind, signed root,element,visibilityIcon,<kind> with no diagram', () => {
    const rows = ELEMENT_SIGNATURES['classDiagram'] ?? [];
    KINDS.forEach((kind, i) => {
      const row = rows.find((r) => r.bucket === visibilityIconBucketOf(kind));
      expect(row?.snames).toEqual(['root', 'element', 'visibilityIcon', KIND_SNAMES[i]]);
    });
  });

  it('a description document has no member rows, so no icon row', () => {
    expect((ELEMENT_SIGNATURES['componentDiagram'] ?? []).some((r) => r.bucket.startsWith('visibilityicon'))).toBe(
      false,
    );
  });

  it('bucket keys are the cleaned selector text', () => {
    expect(KINDS.map(visibilityIconBucketOf)).toEqual([
      'visibilityicon.public',
      'visibilityicon.private',
      'visibilityicon.protected',
      'visibilityicon.package',
      'visibilityicon.iemandatory',
    ]);
  });
});

describe('elementScopeColors: icon buckets', () => {
  it('`element { LineColor }` reaches every kind (jar class__x-icon-element: all #B00)', () => {
    const out = scope('element { LineColor #BB0000 }');
    for (const kind of KINDS) expect(out[visibilityIconBucketOf(kind)]?.border).toBe(RED);
  });

  it('`root { LineColor }` reaches every kind (jar class__x-icon-root: all #00B)', () => {
    const out = scope('root { LineColor #0000BB }');
    for (const kind of KINDS) expect(out[visibilityIconBucketOf(kind)]?.border).toBe(BLUE);
  });

  it('`element { BackgroundColor }` reaches the fill (jar class__x-icon-method-bg: methods #0B0)', () => {
    const out = scope('element { BackgroundColor #00BB00 }');
    for (const kind of KINDS) expect(out[visibilityIconBucketOf(kind)]?.background).toBe(GREEN);
  });

  it('the last declaration wins: visibilityIcon.public then element (jar class__x-icon-order: all #B00)', () => {
    const out = scope('visibilityIcon { public { LineColor #111111 } }\nelement { LineColor #BB0000 }');
    expect(out[visibilityIconBucketOf('public')]?.border).toBe(RED);
  });

  it('element then visibilityIcon.public: public keeps its own, the rest take element', () => {
    const out = scope('element { LineColor #BB0000 }\nvisibilityIcon { public { LineColor #111111 } }');
    expect(out[visibilityIconBucketOf('public')]?.border).toBe('#111111');
    expect(out[visibilityIconBucketOf('private')]?.border).toBe(RED);
  });

  it('`classDiagram { LineColor }` names the document, which the signature omits: nothing written', () => {
    const out = scope('classDiagram { LineColor #BB0000 }');
    expect(KINDS.filter((k) => out[visibilityIconBucketOf(k)] !== undefined)).toEqual([]);
  });

  it('a source with no `<style>` writes nothing (D3)', () => {
    expect(elementScopeColors(preprocess('@startuml\nclass A\n@enduml'), 'class')).toEqual({});
  });

  it('buildTheme carries the buckets into theme.colors.elements', () => {
    const pre = preprocess('@startuml\n<style>\nelement { LineColor #BB0000 }\n</style>\nclass A\n@enduml');
    const { theme } = buildTheme(pre, undefined, 'class');
    expect(theme.colors.elements?.[visibilityIconBucketOf('private')]?.border).toBe('#BB0000');
  });
});
