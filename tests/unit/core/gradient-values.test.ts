/**
 * dss TE2: a style value `#A-#B` is an `HColorGradient`, and the driver of each shape decides what it draws.
 *
 * rect, polygon, path, ellipse: a real def (`DriverRectangleSvg.java:82-111`, `DriverPolygonSvg.java:63-64`,
 * `DriverPathSvg.java:71-72`, `DriverEllipseSvg.java:66-67`). `ULine`: the first colour (`DriverLineSvg.java:76-82`).
 * Text and a centred glyph: `toSvg`, which is the first colour (`DriverTextSvg.java:178`,
 * `DriverCenteredCharacterSvg.java:79`, `HColor.java:74-79`, `HColorGradient.java:103-105`).
 */
import { describe, expect, it } from 'vitest';

import type { DiagramType } from '../../../src/core/block-extractor.js';
import { buildTheme } from '../../../src/core/build-theme.js';
import { resolveColorToSvgHex, splitGradientToken } from '../../../src/core/klimt/color/HColorSet.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { isTransparentColor, parseColor, type Gradient } from '../../../src/core/paint.js';
import { preprocess } from '../../../src/core/preprocessor.js';
import { resolveSkinparam } from '../../../src/core/skinparam.js';
import { cascadeFontColorHex, cascadeHex } from '../../../src/core/style-cascade-class.js';
import {
  CLASS_GENERIC_BUCKET,
  CLASS_QUALIFIED_BUCKET,
  elementScopeColors,
} from '../../../src/core/style-element-scope.js';
import { defaultFontStyleBuilder } from '../../../src/core/document-back-color.js';
import { line, text } from '../../../src/core/svg.js';
import { elementGradient } from '../../../src/core/theme-element-resolve.js';
import { defaultTheme, deepMergeTheme, type Theme } from '../../../src/core/theme.js';
import { defaultEdgeLook } from '../../../src/diagrams/activity/activity-edge-look.js';
import { activityBoxLine, inlineBack } from '../../../src/diagrams/activity/activity-scoped-colors.js';
import { swimlaneHeaderBackground } from '../../../src/diagrams/activity/activity-style-defaults-swimlane.js';
import { stereogroupBackColor } from '../../../src/diagrams/activity/dispatch-stereogroup.js';
import {
  resolveBadgeBorder,
  resolveBadgeFill,
  resolveBadgeGlyphColor,
} from '../../../src/diagrams/class/class-badge.js';
import { packageBorderColor } from '../../../src/diagrams/class/class-package-style.js';
import { resolveElementHeaderBackground } from '../../../src/diagrams/class/renderer-classifier-colors.js';
import { resolveNoteBackground } from '../../../src/diagrams/class/renderer-note-background.js';
import type { ScaledTheme } from '../../../src/diagrams/class/class-scale-geo.js';
import { leafSouthZoneDrawn, resolveLeafZoneFills } from '../../../src/diagrams/state/renderer-box-zones.js';
import { stateBucketColor, stateBucketPaint } from '../../../src/diagrams/state/state-bucket-colors.js';
import { resolveStateBodyFill } from '../../../src/diagrams/state/state-render-colors.js';
import { renderSync } from '../../../src/index.js';

const TOKEN = '#0A0-#00A';
const GRADIENT: Gradient = { color1: '#0A0', color2: '#00A', policy: '-' };
const FIRST = '#00AA00';

function themeOf(style: string, type: DiagramType): Theme {
  return buildTheme(preprocess(`@startuml\n<style>\n${style}\n</style>\n@enduml\n`), undefined, type).theme;
}

function withElements(elements: NonNullable<Theme['colors']['elements']>): Theme {
  return deepMergeTheme(defaultTheme, { colors: { elements } });
}

function render(source: string): string {
  return renderSync(source, { measurer: new DeterministicMeasurer() });
}

describe('the gradient token', () => {
  it('splits at the first separator with a simple colour on both sides (HColorSet.java:109-116)', () => {
    expect(splitGradientToken('#0A0-#00A')).toEqual({ first: '#0A0', second: '#00A', separator: '-' });
    expect(splitGradientToken('red|blue')).toEqual({ first: 'red', second: 'blue', separator: '|' });
    expect(splitGradientToken('#0A0\\00A')).toEqual({ first: '#0A0', second: '00A', separator: '\\' });
    expect(splitGradientToken('notacolour-blue')).toBeUndefined();
    expect(splitGradientToken('url(#g0)')).toBeUndefined();
    expect(splitGradientToken('-blue')).toBeUndefined();
  });

  it('keeps parseColor answering what it did', () => {
    expect(parseColor(TOKEN)).toEqual(GRADIENT);
    expect(parseColor('#0A0')).toBe('#0A0');
  });

  it('prints its first colour through HColor#toSvg (HColor.java:74-79, HColorGradient.java:103-105)', () => {
    expect(resolveColorToSvgHex(TOKEN)).toBe(FIRST);
    expect(resolveColorToSvgHex('#red-green')).toBe('#FF0000');
    expect(resolveColorToSvgHex('red|blue')).toBe('#FF0000');
    expect(resolveColorToSvgHex('url(#g0)')).toBe('url(#g0)');
  });

  it('is never transparent: HColorGradient does not override isTransparent', () => {
    expect(isTransparentColor(GRADIENT)).toBe(false);
    expect(isTransparentColor('transparent')).toBe(true);
  });
});

describe('the driver rule at the shape', () => {
  it('a line draws the first colour and no def (DriverLineSvg.java:76-82)', () => {
    expect(line(0, 0, 1, 1, { stroke: GRADIENT, strokeWidth: 1 })).toBe(
      '<line x1="0" y1="0" x2="1" y2="1" stroke="#0A0" stroke-width="1"/>',
    );
  });
});

describe('the font colour', () => {
  const map = new Map([['root', new Map([['fontcolor', TOKEN]])]]);

  it('reaches the flat cascades as the first colour', () => {
    expect(cascadeHex(map, ['root'], 'fontcolor')).toBe(FIRST);
    expect(cascadeFontColorHex(map, ['root'], '#FFFFFF')).toBe(FIRST);
  });

  it('leaves the two other properties undefined on a flat cascade, their reader takes the bucket', () => {
    const line = new Map([['root', new Map([['linecolor', TOKEN]])]]);
    expect(cascadeHex(line, ['root'], 'linecolor')).toBeUndefined();
  });

  it('is written to a bucket as the first colour; LineColor and BackgroundColor stay whole', () => {
    const { elements } = themeOf(
      `root { FontColor ${TOKEN}\n LineColor ${TOKEN}\n BackgroundColor ${TOKEN} }`,
      'state',
    ).colors;
    expect(elements?.state?.font).toBe('#0A0');
    expect(elements?.state?.border).toEqual(GRADIENT);
    expect(elements?.state?.background).toEqual(GRADIENT);
  });

  it('flattens on the flat style path too', () => {
    expect(themeOf(`note { FontColor ${TOKEN} }`, 'files').colors.elements?.note?.font).toBe('#0A0');
    const { theme } = resolveSkinparam(new Map([['noteFontColor', TOKEN]]), defaultTheme);
    expect(theme.colors.elements?.note?.font).toBe('#0A0');
  });
});

describe('the flat field and the gradient bucket', () => {
  it('holds the first colour in the flat field and the gradient in the bucket', () => {
    const { theme } = resolveSkinparam(new Map([['noteBackgroundColor', TOKEN]]), defaultTheme);
    expect(theme.colors.noteBackground).toBe('#0A0');
    expect(theme.colors.elements?.note?.background).toEqual(GRADIENT);
  });

  it('writes no bucket for a solid value', () => {
    const { theme } = resolveSkinparam(new Map([['activityBorderColor', '#123456']]), defaultTheme);
    expect(theme.colors.graph.activity?.border).toBe('#123456');
    expect(theme.colors.elements?.activity?.border).toBeUndefined();
  });

  it('a later solid alias clears an earlier gradient: one value has one answer', () => {
    const { theme } = resolveSkinparam(
      new Map([
        ['activityDiamondForegroundColor', TOKEN],
        ['activityDiamondBorderColor', '#123456'],
      ]),
      defaultTheme,
    );
    expect(theme.colors.graph.activity?.diamondBorder).toBe('#123456');
    expect(theme.colors.elements?.diamond?.border).toBeUndefined();
  });

  it('carries every activity key', () => {
    const { theme } = resolveSkinparam(
      new Map([
        ['activityBorderColor', TOKEN],
        ['activityBarColor', TOKEN],
        ['activityDiamondBackgroundColor', TOKEN],
        ['activityDiamondBorderColor', TOKEN],
      ]),
      defaultTheme,
    );
    expect(theme.colors.elements?.activity?.border).toEqual(GRADIENT);
    expect(theme.colors.elements?.activitybar?.background).toEqual(GRADIENT);
    expect(theme.colors.elements?.diamond?.background).toEqual(GRADIENT);
    expect(theme.colors.elements?.diamond?.border).toEqual(GRADIENT);
  });

  it('elementGradient answers a gradient only', () => {
    const theme = withElements({ arrow: { border: GRADIENT, background: '#123456' } });
    expect(elementGradient(theme, 'arrow', 'border')).toEqual(GRADIENT);
    expect(elementGradient(theme, 'arrow', 'background')).toBeUndefined();
    expect(elementGradient(theme, 'absent', 'border')).toBeUndefined();
  });
});

describe('state readers', () => {
  it('stateBucketPaint keeps a gradient, stateBucketColor stays the solid read', () => {
    const theme = withElements({ note: { border: GRADIENT, background: 'red' } });
    expect(stateBucketPaint(theme, 'note', 'border')).toEqual(GRADIENT);
    expect(stateBucketPaint(theme, 'note', 'background')).toBe('#FF0000');
    expect(stateBucketColor(theme, 'note', 'border')).toBeUndefined();
    expect(stateBucketColor(theme, 'note', 'background')).toBe('#FF0000');
  });

  it('two gradients are never equal: HColorGradient has no equals (EntityImageState.java:141)', () => {
    const theme = withElements({
      'state.name': { background: GRADIENT },
      'state.description': { background: GRADIENT },
    });
    expect(resolveLeafZoneFills({}, theme)).toEqual({ north: GRADIENT, south: GRADIENT });
    expect(leafSouthZoneDrawn({}, theme)).toBe(true);
  });

  it('equal solids take the single-shape branch', () => {
    expect(resolveLeafZoneFills({}, defaultTheme)).toBeUndefined();
    expect(leafSouthZoneDrawn({}, defaultTheme)).toBe(false);
  });

  it('a gradient body zone is drawn (RoundedSouth.java:66 skips a transparent colour only)', () => {
    expect(resolveStateBodyFill({}, withElements({ 'state.body': { background: GRADIENT } }))).toEqual(GRADIENT);
    expect(resolveStateBodyFill({}, defaultTheme)).toBeUndefined();
  });
});

describe('activity readers', () => {
  it('keeps the box line whole', () => {
    expect(activityBoxLine(withElements({ activity: { border: GRADIENT } }))).toEqual(GRADIENT);
  });

  it('keeps the head whole, for the polygon (Worm.java:153-154, DriverPolygonSvg.java:63-64)', () => {
    const look = defaultEdgeLook(withElements({ arrow: { border: GRADIENT } }), { from: 'a' } as never);
    expect(look.line).toEqual(GRADIENT);
    expect(look.head).toEqual(GRADIENT);
  });

  it('parses an inline colour', () => {
    expect(inlineBack({ color: '#0A0-00A' })).toEqual({ color1: '#0A0', color2: '00A', policy: '-' });
    expect(inlineBack({ color: '#0A0' })).toBe('#0A0');
    expect(inlineBack({})).toBeUndefined();
  });

  it('reads a gradient `<<#a-b>>` label (Stereogroup.java:184-185, ColorParser.java:43)', () => {
    expect(stereogroupBackColor('<<#0A0-00A>>')).toBe('#0A0-00A');
    expect(stereogroupBackColor('<<#0A0|00A>> <<foo>>')).toBe('#0A0|00A');
    expect(stereogroupBackColor('<<foo>>')).toBeUndefined();
  });

  it('keeps a swimlane band whole (Swimlanes.java:358-367)', () => {
    expect(swimlaneHeaderBackground(withElements({ swimlane: { background: GRADIENT } }))).toEqual(GRADIENT);
    expect(swimlaneHeaderBackground(withElements({ swimlane: { background: 'red' } }))).toBe('#FF0000');
    expect(swimlaneHeaderBackground(defaultTheme)).toBe('none');
  });
});

describe('class readers', () => {
  it('keeps the spot circle whole, with its def, and prints the glyph flat (DriverCenteredCharacterSvg.java:79)', () => {
    expect(resolveBadgeFill('class', undefined, GRADIENT)).toEqual(GRADIENT);
    expect(resolveBadgeBorder('#181818', GRADIENT)).toEqual(GRADIENT);
    expect(resolveBadgeGlyphColor(GRADIENT)).toBe('#00AA00');
    expect(resolveBadgeBorder('#181818', 'red')).toBe('#FF0000');
  });

  it('keeps a frame border whole (Cluster.java:317-320)', () => {
    expect(packageBorderColor(withElements({ package: { border: GRADIENT } }), [], '#000000')).toEqual(GRADIENT);
    expect(packageBorderColor(withElements({ 'group.package': { border: GRADIENT } }), [], '#000000')).toEqual(
      GRADIENT,
    );
    expect(packageBorderColor(defaultTheme, [], '#000000')).toBe('#000000');
  });

  it('keeps a header back whole', () => {
    expect(resolveElementHeaderBackground(withElements({ object: { headerBackground: GRADIENT } }), 'object')).toEqual(
      GRADIENT,
    );
  });

  it('writes the two box signatures the flat fields cannot hold (EntityImageClassHeader.java:138-139, Kal.java:93-94)', () => {
    const { elements } = themeOf(`root { LineColor ${TOKEN}\n BackgroundColor ${TOKEN} }`, 'class').colors;
    expect(elements?.[CLASS_GENERIC_BUCKET]).toEqual({ background: GRADIENT, border: GRADIENT });
    expect(elements?.[CLASS_QUALIFIED_BUCKET]).toEqual({ background: GRADIENT, border: GRADIENT });
  });

  it('parses an inline note colour (EntityImageNote.java:103-106)', () => {
    expect(resolveNoteBackground('#0A0-00A', defaultTheme as ScaledTheme)).toEqual({
      color1: '#0A0',
      color2: '00A',
      policy: '-',
    });
  });
});

describe('documents', () => {
  it('a state arrowhead carries its def: no url() is left dangling', () => {
    const svg = render(`@startuml\n<style>\narrow { LineColor ${TOKEN} }\n</style>\nstate A\nA --> A\n@enduml\n`);
    const refs = [...svg.matchAll(/url\(#(g[^)]+)\)/g)].map((m) => m[1]!);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(svg).toContain(`id="${ref}"`);
  });

  it('an object body with a gradient splits its header (EntityImageObject.java:199)', () => {
    const svg = render(`@startuml\n<style>\nobject { BackgroundColor ${TOKEN} }\n</style>\nobject A\n@enduml\n`);
    expect(svg.match(/<path [^>]*fill="url\(/g)).toHaveLength(1);
  });

  it('lifts a framed cluster gradient to one def, with no def left in a group (SvgGraphics.java:367-371)', () => {
    const svg = render(
      `@startuml\n<style>\nroot { BackgroundColor ${TOKEN} }\n</style>\nframe F {\n class A\n}\nrectangle R {\n class B\n}\n@enduml\n`,
    );
    expect(svg.match(/<linearGradient/g)).toHaveLength(1);
    expect(svg.indexOf('<linearGradient')).toBeLessThan(svg.indexOf('</defs>'));
  });

  it('accepts a gradient on a description note (ColorParser.java:43)', () => {
    const svg = render('@startuml\ncomponent C\nnote left of C #0A0-00A : n\n@enduml\n');
    expect(svg).not.toContain('Syntax Error');
    expect(svg).toContain('<linearGradient');
  });

  it('writes no raw token on a text fill (activity root)', () => {
    const svg = render(`@startuml\n<style>\nroot { FontColor ${TOKEN} }\n</style>\nstart\n:A;\nstop\n@enduml\n`);
    expect(svg).not.toContain(TOKEN);
    expect(svg).toContain('fill="#0A0"');
  });
});

describe('skinparam defaultFontColor', () => {
  it('reaches every element signature as root FontColor, with no <style> (FromSkinparamToStyle.java:157)', () => {
    const pre = preprocess('@startuml\nskinparam defaultFontColor #0A0\n@enduml\n');
    const scope = elementScopeColors(pre, 'state');
    expect(scope.state).toEqual({ font: '#0A0' });
    expect(scope.note?.font).toBe('#0A0');
    expect(scope.arrow?.font).toBe('#0A0');
  });

  it('leaves the two other roles on the flat path (D3b)', () => {
    const pre = preprocess(
      '@startuml\nskinparam defaultFontColor #0A0\nskinparam stateBackgroundColor #123456\nskinparam stateBorderColor #654321\n@enduml\n',
    );
    expect(elementScopeColors(pre, 'state').state).toEqual({ font: '#0A0' });
  });

  it('merges by declaration order, the later one winning (DarkString.java:50-66)', () => {
    const later = preprocess('@startuml\nskinparam defaultFontColor #0A0\nskinparam stateFontColor #00A\n@enduml\n');
    const earlier = preprocess('@startuml\nskinparam stateFontColor #00A\nskinparam defaultFontColor #0A0\n@enduml\n');
    expect(elementScopeColors(later, 'state').state?.font).toBe('#00A');
    expect(elementScopeColors(earlier, 'state').state?.font).toBe('#0A0');
  });

  it('opens nothing for a document with no such skinparam, or one the D3 gate already holds', () => {
    expect(defaultFontStyleBuilder(preprocess('@startuml\nskinparam stateFontColor #00A\n@enduml\n'))).toBeUndefined();
    const styled = preprocess(
      '@startuml\nskinparam defaultFontColor #0A0\n<style>\nroot { FontColor #00A }\n</style>\n@enduml\n',
    );
    expect(defaultFontStyleBuilder(styled)).toBeUndefined();
    expect(elementScopeColors(preprocess('@startuml\nskinparam stateFontColor #00A\n@enduml\n'), 'state')).toEqual({});
  });
});

describe('a transparent font colour', () => {
  it('draws no text (DriverTextSvg.java:92-94)', () => {
    expect(text(0, 0, 'a', { fill: 'transparent' })).toBe('');
    expect(text(0, 0, 'a', { fill: '#00000000' })).toBe('');
    expect(text(0, 0, 'a', { fill: '#000' })).toContain('<text');
  });

  it('prints a spot glyph fill none (SvgGraphics.java:539-540)', () => {
    expect(resolveBadgeGlyphColor('transparent')).toBe('none');
    expect(resolveBadgeGlyphColor(undefined, '#00000000')).toBe('none');
    expect(resolveBadgeGlyphColor(undefined, '#123456')).toBe('#123456');
    expect(resolveBadgeGlyphColor()).toBe('#000000');
  });
});
