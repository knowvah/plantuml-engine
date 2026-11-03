/**
 * Composite-state box renderer tests — mission G4 S3, mechanism 6.
 * TDD-first, jar-verified byte-for-byte against `bajelo-54-dixe684`'s
 * `Track_FSM` (no body/action lines) and `Track_FSM.Run.Do_Sector` (with
 * 2 action lines) — see `src/diagrams/state/renderer-composite-box.ts`'s
 * own doc comment for the full anatomy this mirrors.
 */
import { fmt } from '../../../src/core/svg-format.js';
import { describe, it, expect } from 'vitest';
import { renderComposite } from '../../../src/diagrams/state/renderer-composite-box.js';
import type { StateNodeGeo } from '../../../src/diagrams/state/state-geo-types.js';
import { defaultTheme } from '../../../src/core/theme.js';

function makeComposite(overrides: Partial<StateNodeGeo> = {}): StateNodeGeo {
  return {
    id: 'composite1',
    kind: 'normal',
    display: 'Composite',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    children: [
      {
        id: 'child1',
        kind: 'normal',
        display: 'Child',
        x: 10,
        y: 40,
        width: 50,
        height: 50,
        children: [],
        transitions: [],
      },
    ],
    transitions: [],
    ...overrides,
  };
}

describe('renderComposite — fallback (headerLines undefined)', () => {
  it('renders the pre-mechanism-6 dashed rect + centered label when headerLines is absent', () => {
    const node = makeComposite();
    const out = renderComposite(node, defaultTheme);
    expect(out).toContain('stroke-dasharray="6,3"');
    expect(out).toContain('>Composite<');
    expect(out).not.toContain('<path');
  });
});

describe('renderComposite — measured shape, no body lines (Track_FSM-shape)', () => {
  // jar-verified bajelo-54-dixe684 Track_FSM: x=7,y=86,width=472.4437,
  // height=398, headerLines=[{text:'Track_FSM',width:72.3625}], no body.
  const node = makeComposite({
    id: 'Track_FSM',
    display: 'Track_FSM',
    x: 7,
    y: 86,
    width: 472.4437,
    height: 398,
    children: [],
    headerLines: [{ text: 'Track_FSM', width: 72.3625 }],
  });
  const out = renderComposite(node, defaultTheme);

  it('draws the half-rounded header path first, filled #F1F1F1, no stroke', () => {
    expect(out.indexOf('<path')).toBe(0);
    expect(out).toContain(
      '<path d="M19.5,86 L466.944,86 A12.5,12.5 0 0 1 479.444,98.5 L479.444,110 L7,110 L7,98.5 A12.5,12.5 0 0 1 19.5,86" fill="#F1F1F1"/>',
    );
  });

  it('draws NO action-zone background rect (no body lines)', () => {
    expect(out).not.toContain('stroke-width="1"');
  });

  it('draws a full, solid (never dashed) outline rect after the header path', () => {
    expect(out).toContain(
      '<rect x="7" y="86" width="472.444" height="398" fill="none" stroke="#181818" stroke-width="0.5" rx="12.5" ry="12.5"/>',
    );
    expect(out).not.toContain('stroke-dasharray');
  });

  it('draws exactly ONE divider line, at the header/body boundary y=110', () => {
    const dividerCount = (out.match(/<line/g) ?? []).length;
    expect(dividerCount).toBe(1);
    expect(out).toContain('<line x1="7" y1="110" x2="479.444" y2="110" stroke="#181818" stroke-width="0.5"/>');
  });

  it('centers the title text via textLength, matching jar x=207.0406 (unrounded, same convention as the leaf box)', () => {
    expect(out).toContain('textLength="72.363"');
    expect(out).toContain('>Track_FSM<');
    // x = box midX(243.22185) - textLength/2(36.18125) = 207.0406 (raw
    // float noise; formatted to 3dp at emission by core/svg.ts#attrs, same
    // as every other numeric attribute -- T7 dropped the state engine's own
    // pre-rounding, matching renderer-box.ts's identical convention).
    // The raw jar convention is unchanged; only its EMITTED form is now
    // rule-1 formatted, so compute it the way the emitter writes it.
    const expectedX = 7 + 472.4437 / 2 - 72.3625 / 2;
    expect(out).toContain(`x="${fmt(expectedX)}"`);
  });

  it('draws NO action text (no body lines)', () => {
    // Only the title <text> should be present.
    const textCount = (out.match(/<text/g) ?? []).length;
    expect(textCount).toBe(1);
  });
});

describe('renderComposite — measured shape, WITH body/action lines (Do_Sector-shape)', () => {
  // jar-verified bajelo-54-dixe684 Track_FSM.Run.Do_Sector: x=130.71875,
  // y=252, width=242.5, height=129 (local coords used here for round math),
  // headerLines=[{text:'Do_Sector',width:66.15}], bodyLines = 2 action lines.
  const node = makeComposite({
    id: 'Do_Sector',
    display: 'Do_Sector',
    x: 130.71875,
    y: 252,
    width: 242.5,
    height: 129,
    children: [],
    headerLines: [{ text: 'Do_Sector', width: 66.15 }],
    bodyLines: [
      { text: 'entry / enter_do_sector();', width: 149.1 },
      { text: 'exit / exit_do_sector();', width: 129.7625 },
    ],
  });
  const out = renderComposite(node, defaultTheme);

  it('draws header path, action-zone bg, outline, divider1, divider2, title, action text in that order', () => {
    const order = [
      '<path d="M143.219,252',
      '<rect x="130.719" y="276" width="242.5" height="33" fill="#F1F1F1" stroke="#F1F1F1" stroke-width="1"/>',
      '<rect x="130.719" y="252" width="242.5" height="129" fill="none"',
      '<line x1="130.719" y1="276" x2="373.219" y2="276"',
      '<line x1="130.719" y1="309" x2="373.219" y2="309"',
      '>Do_Sector<',
      '>entry / enter_do_sector();<',
      '>exit / exit_do_sector();<',
    ];
    let cursor = 0;
    for (const fragment of order) {
      const idx = out.indexOf(fragment, cursor);
      expect(idx, `expected to find ${JSON.stringify(fragment)} after position ${cursor}`).toBeGreaterThanOrEqual(
        cursor,
      );
      cursor = idx + fragment.length;
    }
  });

  it('draws the action-zone background with fill=stroke=the resolved fill color, stroke-width 1', () => {
    expect(out).toContain(
      '<rect x="130.719" y="276" width="242.5" height="33" fill="#F1F1F1" stroke="#F1F1F1" stroke-width="1"/>',
    );
  });

  it('draws exactly TWO divider lines (header/body + action-zone bottom)', () => {
    const dividerCount = (out.match(/<line/g) ?? []).length;
    expect(dividerCount).toBe(2);
  });

  it('positions the first action-text baseline at dividerY1 + ascent (NOT dividerY1 + MARGIN_LINE + ascent)', () => {
    // dividerY1 = 252 + MARGIN(5) + 1*14 + MARGIN_LINE(5) = 276.
    // ascent = 14 - 14/4.5 = 10.888888888888889.
    // jar-verified: baseline = 276 + ascent EXACTLY, matching Do_Sector's
    // own y="349.8889" (relative to its real y=315, not this test's y=252,
    // but the SAME dividerY1+ascent formula either way).
    const expectedY = 276 + (14 - 14 / 4.5);
    expect(out).toContain(`y="${fmt(expectedY)}"`);
  });

  it('left-aligns action text at box.x + MARGIN(5)', () => {
    expect(out).toContain('x="135.719"');
  });
});

describe('renderComposite — per-node #color override resolves through the header/action fill', () => {
  it('threads a raw #color override into the header path fill and action-zone bg', () => {
    const node = makeComposite({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      headerLines: [{ text: 'X', width: 10 }],
      bodyLines: [{ text: 'y', width: 5 }],
      color: '#red',
    });
    const out = renderComposite(node, defaultTheme);
    expect(out).toContain('fill="#F00"');
    expect(out).toContain('stroke="#F00" stroke-width="1"');
  });
});

describe('renderComposite — shadow (mission skin-file-loading Batch 2)', () => {
  function makeMeasuredComposite(overrides: Partial<StateNodeGeo> = {}): StateNodeGeo {
    return makeComposite({
      x: 7,
      y: 144,
      width: 188.4147,
      height: 227,
      children: [],
      headerLines: [{ text: 'YES', width: 28.0875 }],
      ...overrides,
    });
  }

  it('draws a shadow-only rect FIRST (fill=none, filter attr) when node.shadowing > 0', () => {
    const out = renderComposite(makeMeasuredComposite({ shadowing: 4 }), defaultTheme);
    // First element in the returned markup must be the shadow rect.
    expect(out.indexOf('<rect')).toBe(0);
    const firstRectEnd = out.indexOf('/>') + 2;
    const firstRect = out.slice(0, firstRectEnd);
    expect(firstRect).toContain('fill="none"');
    expect(firstRect).toContain('filter="url(#stateShadow)"');
    expect(firstRect).toContain('x="7"');
    expect(firstRect).toContain('y="144"');
  });

  it('still draws the pre-existing (non-filtered) border-only outline rect AFTER the fills', () => {
    const out = renderComposite(makeMeasuredComposite({ shadowing: 4 }), defaultTheme);
    // Two <rect ...> occurrences with the SAME geometry: one filtered (shadow), one not (outline).
    const rectMatches = [...out.matchAll(/<rect[^>]*\/>/g)].map((m) => m[0]);
    const outlineRects = rectMatches.filter(
      (r) => r.includes('x="7"') && r.includes('y="144"') && !r.includes('filter='),
    );
    expect(outlineRects).toHaveLength(1);
  });

  it('draws NO shadow rect when node.shadowing is absent (byte-identical to pre-Batch-2 shape)', () => {
    const out = renderComposite(makeMeasuredComposite(), defaultTheme);
    expect(out).not.toContain('filter=');
    // First element is the header path, not a shadow rect (pre-Batch-2 order unchanged).
    expect(out.indexOf('<path')).toBe(0);
  });

  it('draws NO shadow rect when node.shadowing is explicitly 0', () => {
    const out = renderComposite(makeMeasuredComposite({ shadowing: 0 }), defaultTheme);
    expect(out).not.toContain('filter=');
    expect(out.indexOf('<path')).toBe(0);
  });
});

/**
 * dss T3c site 6: `RoundedContainer#drawU` (`RoundedContainer.java:76-95`) draws the north (name),
 * centre (description) and south (body) zones; `RoundedSouth.java:60-61` skips a transparent one.
 * Oracle rows `state__cascade-bg-diag` (autonom `A`: `<path d="M69.12,111 L155.12,111 ..." fill="#AAA"/>`
 * under the header path) and `state__cluster-bg-diag` (cluster `A`: second path from the divider down).
 */
describe('renderComposite -- body zone (dss T3c)', () => {
  const bodied = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      elements: {
        'state.name': { background: '#AAAAAA' },
        'state.body': { background: '#CCCCCC' },
      },
    },
  };
  const autonom = makeComposite({
    x: 7,
    y: 7,
    width: 86,
    height: 120,
    headerLines: [{ text: 'A', width: 9.362 }],
  });

  it('autonom: header in the name colour, then the body from the divider to the bottom in the body colour', () => {
    const out = renderComposite(autonom, bodied);
    expect(out).toContain(
      '<path d="M19.5,7 L80.5,7 A12.5,12.5 0 0 1 93,19.5 L93,31 L7,31 L7,19.5 A12.5,12.5 0 0 1 19.5,7" fill="#AAA"/>',
    );
    expect(out).toContain(
      '<path d="M7,31 L93,31 L93,114.5 A12.5,12.5 0 0 1 80.5,127 L19.5,127 A12.5,12.5 0 0 1 7,114.5 L7,31" fill="#CCC"/>',
    );
    expect(out.indexOf('fill="#AAA"')).toBeLessThan(out.indexOf('fill="#CCC"'));
  });

  it('autonom: no body path at the default (transparent) body', () => {
    expect(renderComposite(autonom, defaultTheme).split('<path ').length - 1).toBe(1);
  });

  it('autonom with an action zone: the body starts below the description divider', () => {
    const out = renderComposite({ ...autonom, bodyLines: [{ text: 'd', width: 7 }] }, bodied);
    // header 24 + action zone (14 + 5) from y 31: body top y = 31 + 19 = 50
    expect(out).toContain('<path d="M7,50 L93,50 ');
  });

  it('cluster shape: the body path comes from the body bucket, not from the header colour', () => {
    const cluster = makeComposite({
      x: 7,
      y: 7,
      width: 86,
      height: 120,
      headerLines: [{ text: 'A', width: 9.362 }],
      clusterHeaderHeight: 24,
    });
    const out = renderComposite(cluster, bodied);
    expect(out).toContain('fill="#CCC"');
    const nameOnly = {
      ...defaultTheme,
      colors: { ...defaultTheme.colors, elements: { 'state.name': { background: '#AAAAAA' } } },
    };
    expect(renderComposite(cluster, nameOnly).split('<path ').length - 1).toBe(1);
  });
});
