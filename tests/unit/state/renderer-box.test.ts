/**
 * Unit tests for renderer-box.ts's `renderNormal` -- mission G4 S16's
 * `stateFontSize<<X>>` render-time threading (the font-size attribute,
 * ascent, and header/body line-step formula all switch to the
 * stereotype-resolved size, not the theme default).
 *
 * Jar-verified `laferu-31-tice836` (`skinparam stateBackgroundColor<<Foo>>
 * red` + `stateFontColor<<Foo>> yellow` + `stateFontSize<<Foo>> 30`, `state
 * state1 <<Foo>>`, no body): `rect width="101.5625" height="50"`, `line
 * x1="7" y1="47" x2="108.5625" y2="47"`, `text x="17" y="35.3333"
 * fill="#FFFF00" font-size="30" textLength="81.5625"`.
 *
 * @see plans/g4-state-svg/ledger.md (S16)
 */
import { describe, it, expect } from 'vitest';
import { renderNormal } from '../../../src/diagrams/state/renderer-box.js';
import type { StateNodeGeo } from '../../../src/diagrams/state/state-geo-types.js';
import { defaultTheme, deepMergeTheme } from '../../../src/core/theme.js';

function makeNode(overrides: Partial<StateNodeGeo> = {}): StateNodeGeo {
  return {
    id: 'state1',
    display: 'state1',
    kind: 'normal',
    x: 7,
    y: 7,
    width: 101.5625,
    height: 50,
    children: [],
    transitions: [],
    headerLines: [{ text: 'state1', width: 81.5625 }],
    ...overrides,
  };
}

describe('renderNormal — stateFontSize<<X>> (mission G4 S16)', () => {
  it('renders the header text at the theme default font-size with no override', () => {
    const svg = renderNormal(makeNode(), defaultTheme);
    expect(svg).toContain(`font-size="${defaultTheme.fontSize}"`);
  });

  it('renders the header text at the stereotype-scoped font-size override', () => {
    const theme = deepMergeTheme(defaultTheme, {
      colors: { graph: { stateFontSizeByStereo: { foo: 30 } } },
    });
    const svg = renderNormal(makeNode({ stereotype: 'Foo' }), theme);
    expect(svg).toContain('font-size="30"');
  });

  it('positions the divider line using the OVERRIDDEN font size (jar-verified laferu-31-tice836: y="47")', () => {
    const theme = deepMergeTheme(defaultTheme, {
      colors: { graph: { stateFontSizeByStereo: { foo: 30 } } },
    });
    const svg = renderNormal(makeNode({ stereotype: 'Foo' }), theme);
    expect(svg).toContain('y1="47"');
  });

  it("positions the header baseline using the OVERRIDDEN font size (jar-verified laferu-31-tice836: y=35.3333, formatted to 3dp downstream by core/svg.ts#attrs -- T7 dropped the state engine's own pre-rounding, so assert the raw pre-emission value)", () => {
    const theme = deepMergeTheme(defaultTheme, {
      colors: { graph: { stateFontSizeByStereo: { foo: 30 } } },
    });
    const svg = renderNormal(makeNode({ stereotype: 'Foo' }), theme);
    const match = /text x="17" y="([\d.]+)"/.exec(svg);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeCloseTo(35.3333, 3);
  });

  it('does not apply the override to a state with a DIFFERENT stereotype', () => {
    const theme = deepMergeTheme(defaultTheme, {
      colors: { graph: { stateFontSizeByStereo: { foo: 30 } } },
    });
    const svg = renderNormal(makeNode({ stereotype: 'bar' }), theme);
    expect(svg).toContain(`font-size="${defaultTheme.fontSize}"`);
  });
});

describe('renderNormal — shadow (mission skin-file-loading Batch 2)', () => {
  it('emits filter="url(#stateShadow)" on the box rect when node.shadowing > 0', () => {
    const svg = renderNormal(makeNode({ shadowing: 4 }), defaultTheme);
    expect(svg).toContain('filter="url(#stateShadow)"');
  });

  it('emits NO filter attribute when node.shadowing is absent', () => {
    const svg = renderNormal(makeNode(), defaultTheme);
    expect(svg).not.toContain('filter=');
  });

  it('emits NO filter attribute when node.shadowing is explicitly 0', () => {
    const svg = renderNormal(makeNode({ shadowing: 0 }), defaultTheme);
    expect(svg).not.toContain('filter=');
  });
});

/**
 * dss T3c: `EntityImageState.java:131-153` -- a leaf whose `name` and `description` zones
 * differ is drawn by `RoundedContainer` (`RoundedContainer.java:76-95`): a north path, a south
 * path, the transparent outline rect and the zone divider, followed by `drawU`'s own divider.
 * Oracle: the jar rendering of `tests/fixtures/diagram-style-scope/state__probe-zones.puml`,
 * leaf `A`: two paths (`#AAA`, `#BBB`), `rect fill="none"`, two identical `<line>`s, name text
 * `#111`, description text `#222`.
 */
describe('renderNormal -- name/description zones (dss T3c)', () => {
  const zoned = deepMergeTheme(defaultTheme, {
    colors: {
      elements: {
        'state.name': { background: '#AAAAAA', font: '#111111' },
        'state.description': { background: '#BBBBBB', font: '#222222' },
      },
    },
  });
  const node = makeNode({
    x: 7,
    y: 32,
    width: 50,
    height: 50,
    headerLines: [{ text: 'A', width: 9.362 }],
    bodyLines: [{ text: 'd1', width: 15.575 }],
  });

  it('draws the north and south zone paths with their own fills, an unfilled outline, and both dividers', () => {
    const svg = renderNormal(node, zoned);
    expect(svg).toContain(
      '<path d="M19.5,32 L44.5,32 A12.5,12.5 0 0 1 57,44.5 L57,56 L7,56 L7,44.5 A12.5,12.5 0 0 1 19.5,32" fill="#AAA"/>',
    );
    expect(svg).toContain(
      '<path d="M7,56 L57,56 L57,69.5 A12.5,12.5 0 0 1 44.5,82 L19.5,82 A12.5,12.5 0 0 1 7,69.5 L7,56" fill="#BBB"/>',
    );
    expect(svg).toContain('fill="none"');
    expect(svg.split('<line ').length - 1).toBe(2);
  });

  it('colours the name and description text from their own zones', () => {
    const svg = renderNormal(node, zoned);
    expect(svg).toContain('fill="#111"');
    expect(svg).toContain('fill="#222"');
  });

  it('keeps one filled rect when both zones resolve to the same colour', () => {
    const same = deepMergeTheme(defaultTheme, {
      colors: { elements: { 'state.name': { background: '#AAAAAA' }, 'state.description': { background: '#AAAAAA' } } },
    });
    const svg = renderNormal(node, same);
    // `applyColor` fills the one shape with the `state` style (EntityImageState.java:134-135), not the zone's.
    expect(svg).toContain('fill="#F1F1F1"');
    expect(svg.split('<path ').length - 1).toBe(0);
    expect(svg.split('<line ').length - 1).toBe(1);
  });

  it('ignores an inline colour for the zones when they differ (EntityImageState.java:131-133)', () => {
    const svg = renderNormal({ ...node, color: '#Red' }, zoned);
    expect(svg).toContain('fill="#AAA"');
    expect(svg).not.toContain('#F00');
  });
});
