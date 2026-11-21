import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { Warning } from '../../../src/core/warning/Warning.js';
import type { RenderFragment } from '../../../src/core/dispatcher.js';
import type { ActivityDiagramAST } from '../../../src/diagrams/activity/ast.js';
import {
  activityWarnings,
  withSkinParamWarnings,
  withWarningBanner,
} from '../../../src/diagrams/activity/activity-warnings.js';
import { renderSync } from '../../../src/index.js';

/** Any one-line warning: the banner geometry below does not depend on which. */
const PADDING = 'Please use CSS style instead of skinparam padding';
const HANDWRITTEN = "'skinparam handwritten' is deprecated: write '!option handwritten true' instead";
const BRACKET = "Missing '{': write 'group G {' and close it with '}'";
const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
/** Drawn text: monospace spaces become U+00A0, as in the jar's own SVG. */
const PADDING_DRAWN = PADDING.replaceAll(' ', '\u00a0');

function emptyAst(): ActivityDiagramAST {
  return { nodes: [], swimlanes: [], pragma: Pragma.createEmpty() };
}

function messages(ws: readonly Warning[]): string[] {
  return ws.map((w) => w.asSingleLine());
}

describe('withSkinParamWarnings (CommandSkinParam.java:94-107)', () => {
  it('warns for handwritten, case-insensitively; padding no longer warns', () => {
    const map = new Map([
      ['Padding', '15'],
      ['ArrowColor', 'red'],
      ['HANDWRITTEN', 'true'],
    ]);
    const ast = withSkinParamWarnings(emptyAst(), map);
    expect(messages(ast.warnings ?? [])).toEqual([HANDWRITTEN]);
  });

  it('returns the same AST when no skinparam warns', () => {
    const ast = emptyAst();
    expect(withSkinParamWarnings(ast, new Map([['ArrowColor', 'red']]))).toBe(ast);
    expect(withSkinParamWarnings(ast, undefined)).toBe(ast);
  });
});

describe('activityWarnings (TitledDiagram.java:326-334)', () => {
  it('joins skinparam warnings before pragma warnings, de-duplicated', () => {
    const base = withSkinParamWarnings(emptyAst(), new Map([['handwritten', 'true']]));
    base.pragma!.addWarning(new Warning(BRACKET));
    base.pragma!.addWarning(new Warning(HANDWRITTEN));
    expect(messages(activityWarnings(base))).toEqual([HANDWRITTEN, BRACKET]);
  });
});

describe('withWarningBanner (DiagramChromeFactory.java:176-266)', () => {
  const fragment: RenderFragment = {
    body: '<ellipse cx="30" cy="25" rx="10" ry="10"/>',
    width: 61,
    height: 51,
    preChromeWidth: 40,
    preChromeHeight: 30,
  };
  const measurer = new DeterministicMeasurer();

  it('is the identity with no warning', () => {
    expect(withWarningBanner(fragment, [], measurer, MARGIN)).toBe(fragment);
  });

  it('stacks the banner above the body inside the document margin', () => {
    const out = withWarningBanner(fragment, [new Warning(PADDING)], measurer, MARGIN);
    // rect at margin + 3 (DiagramChromeFactory.java:235); text at margin + 10.
    expect(out.body).toMatch(/^<rect x="13" y="13" /);
    expect(out.body).toContain(`<text x="20" y="22" `);
    expect(out.body).toContain(`font-family="monospace">${PADDING_DRAWN}</text>`);
    // banner height = one 10pt line + 10 (java:265); body moves down by it.
    const bannerH = out.preChromeHeight! - 30;
    expect(bannerH).toBe(20);
    expect(out.body).toContain('cy="45"');
    expect(out.height).toBe(Math.floor(30 + bannerH + 20 + 1));
    // the banner (229.5 + 20) is wider than the 40px body: the stack takes
    // its width, and the rect spans it less 10 (java:234). isw-T2-act: values
    // from a one-JVM seam-#4 jar render of `skinparam padding 15` + `start`
    // (`textLength="229.5"`, `<rect ... width="239.5" height="15"`, svg 270).
    expect(out.preChromeWidth).toBeCloseTo(249.5, 9);
    expect(out.body).toContain('width="239.5" height="15"');
    expect(out.width).toBe(270); // floor(249.5 + 2 * 10 + 1)
  });
});

describe('activity warning banner end to end', () => {
  it('draws the skinparam handwritten banner and moves the diagram down', () => {
    const measurer = new DeterministicMeasurer();
    const drawn = "'skinparam handwritten' is deprecated: write '!option handwritten false' instead".replaceAll(
      ' ',
      '\u00a0',
    );
    const plain = renderSync('@startuml\nstart\n@enduml', { measurer });
    const warned = renderSync('@startuml\nskinparam handwritten false\nstart\n@enduml', { measurer });
    expect(plain).not.toContain(drawn);
    expect(warned).toContain(`>${drawn}</text>`);
    const cy = (svg: string): number => Number(/<ellipse cx="[^"]*" cy="([^"]*)"/.exec(svg)![1]);
    expect(cy(warned)).toBeGreaterThan(cy(plain));
  });
});
