import { describe, it, expect } from 'vitest';
import { parseStyleBlock, resolveSkinparam } from '../../../src/core/skinparam.js';
import { applyStyleMap } from '../../../src/core/style-map-theme.js';
import { buildTheme } from '../../../src/core/build-theme.js';
import { preprocess } from '../../../src/core/preprocessor.js';
import { defaultTheme } from '../../../src/core/theme.js';
import type { Theme } from '../../../src/core/theme.js';
import type { Gradient } from '../../../src/core/paint.js';

/**
 * dbp T1a (D1): `<style> document { BackgroundColor }` is the SAME property
 * `skinparam backgroundColor` converts to (`FromSkinparamToStyle.java:180`:
 * `addConvert("BackgroundColor", PName.BackGroundColor, SName.document)`),
 * and upstream reads both through one parse -- `TitledDiagram#calculateBackColor`
 * (`TitledDiagram.java:280-289`) -> `asColor(getIHtmlColorSet())` ->
 * `HColorSet#parseColor` (`HColorSet.java:85-119`), whose separator scan
 * (java:109-116) yields an `HColorGradient` for `c1<sep>c2`. So the theme pair
 * must be identical whichever syntax set the value.
 */

interface BackgroundPair {
  readonly background: string;
  readonly backgroundGradient: Gradient | undefined;
}

function pair(theme: Theme): BackgroundPair {
  return { background: theme.colors.background, backgroundGradient: theme.colors.backgroundGradient };
}

function styleTheme(value: string, base: Theme = defaultTheme): Theme {
  return applyStyleMap(parseStyleBlock(`document {\n  BackgroundColor ${value}\n}`), base);
}

function skinparamTheme(value: string, base: Theme = defaultTheme): Theme {
  return resolveSkinparam(new Map([['backgroundColor', value]]), base).theme;
}

function themeOf(body: string): Theme {
  return buildTheme(preprocess(`@startuml\n${body}\nA -> B\n@enduml`)).theme;
}

describe('style document BackgroundColor gradient -> the skinparam theme pair (dbp T1a)', () => {
  it.each([
    ['red/blue', { color1: 'red', color2: 'blue', policy: '/' }],
    ['red|blue', { color1: 'red', color2: 'blue', policy: '|' }],
    ['red-blue', { color1: 'red', color2: 'blue', policy: '-' }],
    ['#FF0000\\#0000FF', { color1: '#FF0000', color2: '#0000FF', policy: '\\' }],
  ])('%s recovers the Gradient HColorSet.java:109-116 builds', (value, gradient) => {
    expect(styleTheme(value).colors.backgroundGradient).toEqual(gradient);
  });

  it.each(['red/blue', 'red|blue', 'red-blue', '#FF0000\\#0000FF'])(
    '%s gives the exact (background, backgroundGradient) the skinparam handler gives',
    (value) => {
      expect(pair(styleTheme(value))).toEqual(pair(skinparamTheme(value)));
    },
  );

  it('keeps the flattened background the skinparam handler stores (resolveColor)', () => {
    // `skinparam-key-normalize.ts#resolveColor`: only a `-` gradient is
    // flattened to its end colour; `/` and `|` keep the raw text.
    expect(styleTheme('red-blue').colors.background).toBe('blue');
    expect(styleTheme('red/blue').colors.background).toBe('red/blue');
    expect(styleTheme('red|blue').colors.background).toBe('red|blue');
  });

  it('wins through a diagram-scoped document selector exactly as the solid value does', () => {
    const theme = applyStyleMap(
      parseStyleBlock(
        'document {\n  BackgroundColor black\n}\nclassDiagram {\n  document {\n    BackgroundColor red/blue\n  }\n}',
      ),
      defaultTheme,
    );
    expect(pair(theme)).toEqual({
      background: 'red/blue',
      backgroundGradient: { color1: 'red', color2: 'blue', policy: '/' },
    });
  });
});

describe('style document BackgroundColor non-gradient values are unchanged (dbp T1a)', () => {
  it('a solid colour sets background only', () => {
    expect(pair(styleTheme('black'))).toEqual({ background: 'black', backgroundGradient: undefined });
    expect('backgroundGradient' in styleTheme('black').colors).toBe(false);
  });

  it('transparent sets background only', () => {
    expect(pair(styleTheme('transparent'))).toEqual({ background: 'transparent', backgroundGradient: undefined });
  });

  it('an unparseable value still becomes resolveColor WHITE (HColorSet.java:58-63), no gradient', () => {
    expect(pair(styleTheme('notacolour'))).toEqual(pair(skinparamTheme('notacolour')));
    expect(styleTheme('notacolour').colors.backgroundGradient).toBeUndefined();
  });

  it('a StyleMap with no document background returns the base theme itself', () => {
    expect(applyStyleMap(parseStyleBlock('class {\n  FontSize 12\n}'), defaultTheme).colors.background).toBe(
      defaultTheme.colors.background,
    );
    expect(applyStyleMap(new Map(), defaultTheme)).toBe(defaultTheme);
  });
});

describe('style vs skinparam document background: the later declaration wins both fields (dbp T1a)', () => {
  // `SkinParam.java:232-233`: each `skinparam` converts (FromSkinparamToStyle)
  // and is muted into the SAME style storage a `<style>` block mutes
  // (`:244`), in declaration order -- so `calculateBackColor` sees only the
  // last `document { BackGroundColor }`, gradient or solid.
  const GRADIENT = { color1: 'red', color2: 'blue', policy: '/' };

  it('skinparam gradient then style solid: the style solid clears the gradient', () => {
    const theme = themeOf(
      'skinparam backgroundColor red/blue\n<style>\ndocument {\n  BackgroundColor black\n}\n</style>',
    );
    expect(pair(theme)).toEqual({ background: 'black', backgroundGradient: undefined });
  });

  it('skinparam solid then style gradient: the style gradient wins', () => {
    const theme = themeOf(
      'skinparam backgroundColor black\n<style>\ndocument {\n  BackgroundColor red/blue\n}\n</style>',
    );
    expect(pair(theme)).toEqual({ background: 'red/blue', backgroundGradient: GRADIENT });
  });

  it('style gradient then skinparam solid: the skinparam solid wins', () => {
    const theme = themeOf(
      '<style>\ndocument {\n  BackgroundColor red/blue\n}\n</style>\nskinparam backgroundColor black',
    );
    expect(pair(theme)).toEqual({ background: 'black', backgroundGradient: undefined });
  });

  it('style solid then skinparam gradient: the skinparam gradient wins', () => {
    const theme = themeOf(
      '<style>\ndocument {\n  BackgroundColor black\n}\n</style>\nskinparam backgroundColor red/blue',
    );
    expect(pair(theme)).toEqual({ background: 'red/blue', backgroundGradient: GRADIENT });
  });

  it('style-only and skinparam-only gradients build the same pair through buildTheme', () => {
    const viaStyle = themeOf('<style>\ndocument {\n  BackgroundColor red/blue\n}\n</style>');
    const viaSkinparam = themeOf('skinparam backgroundColor red/blue');
    expect(pair(viaStyle)).toEqual(pair(viaSkinparam));
    expect(pair(viaStyle)).toEqual({ background: 'red/blue', backgroundGradient: GRADIENT });
  });
});

describe('resolveSkinparam: a solid backgroundColor replaces the base pair (dbp T1a)', () => {
  const gradientBase = styleTheme('red/blue');

  it('a solid backgroundColor drops the base backgroundGradient', () => {
    const theme = skinparamTheme('black', gradientBase);
    expect(pair(theme)).toEqual({ background: 'black', backgroundGradient: undefined });
    expect('backgroundGradient' in theme.colors).toBe(false);
  });

  it('a gradient backgroundColor replaces the base gradient', () => {
    expect(pair(skinparamTheme('green|yellow', gradientBase))).toEqual({
      background: 'green|yellow',
      backgroundGradient: { color1: 'green', color2: 'yellow', policy: '|' },
    });
  });

  it('a skinparam run without backgroundColor keeps the base gradient', () => {
    const theme = resolveSkinparam(new Map([['defaultFontSize', '15']]), gradientBase).theme;
    expect(pair(theme)).toEqual(pair(gradientBase));
  });
});
