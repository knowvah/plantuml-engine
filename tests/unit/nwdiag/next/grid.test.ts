/**
 * nwdiag's grid drawing: `NServerDraw`, `GridTextBlockSimple` and
 * `GridTextBlockDecorated`, against the jar's `fecure-20-muca822` and
 * `kakupi-00-lano640` (test-results/dot-cache/unknown/<slug>/in.svg), whose
 * grid sits at (deltaX, deltaY) = (33.325, 8.5) and (29.35, 8.5).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/
 */
import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../../src/core/klimt/UTranslate.js';
import { NServer } from '../../../../src/diagrams/nwdiag/core/NServer.js';
import { NwGroup } from '../../../../src/diagrams/nwdiag/core/NwGroup.js';
import type { Network } from '../../../../src/diagrams/nwdiag/core/Network.js';
import { GridTextBlockDecorated, NETWORK_THIN } from '../../../../src/diagrams/nwdiag/next/GridTextBlockDecorated.js';
import { GridTextBlockSimple } from '../../../../src/diagrams/nwdiag/next/GridTextBlockSimple.js';
import { NPlayField } from '../../../../src/diagrams/nwdiag/next/NPlayField.js';
import { NServerDraw } from '../../../../src/diagrams/nwdiag/next/NServerDraw.js';
import { stringBounder, svgGraphic } from '../../mindmap/helpers/mindmap-skin.js';
import { createNetwork, nwdiagSkinParam } from '../helpers/nwdiag.js';

/** One network `name` holding the given servers, each `[name, props]`, one per column. */
function oneNetwork(name: string, servers: readonly (readonly [string, Map<string, string>])[]) {
  const field = new NPlayField();
  const networks: Network[] = [];
  const sp = nwdiagSkinParam();
  const network = createNetwork(field, networks, name);
  const grid = new GridTextBlockDecorated(1, servers.length, [], networks, sp);
  const all = servers.map(([n, props], col) => {
    const s = NServer.create(n, sp);
    s.connectTo(network, props.get('address'));
    s.updateProperties(props);
    grid.add(0, col, s.getDraw(NServerDraw.MAGIC, new Map([[network, s.getAdress(network)!]]), networks, sp));
    return s;
  });
  return { grid, network, networks, servers: all, sp };
}

function drawAt(grid: GridTextBlockSimple, dx: number, dy: number): string {
  const ug = svgGraphic();
  grid.drawU(ug.apply(new UTranslate(dx, dy)));
  return ug.getSvgString();
}

describe('GridTextBlockDecorated (fecure-20-muca822)', () => {
  it('draws the tube, the link and the box where the jar does', () => {
    const { grid } = oneNetwork('Test', [['Server', new Map()]]);
    const svg = drawAt(grid, 33.325, 8.5);
    expect(svg).toContain(
      '<rect x="33.325" y="8.5" width="85.325" height="5" fill="#E2E2F0" style="stroke:#181818;stroke-width:1;"/>',
    );
    expect(svg).toContain('<path d="M77.988,13.5 L77.988,43.5" style="stroke:#181818;stroke-width:1;" fill="none"/>');
    expect(svg).toContain(
      '<rect x="48.325" y="43.5" width="55.325" height="32" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;"/>',
    );
    expect(svg).toContain('<text x="58.325" y="62.833" fill="#000" font-size="12" textLength="35.325">Server</text>');
  });

  it('sizes the cell max(link1+20, box+30, link2+20) by link1+20+2·15+box+link2+20 (NServerDraw.java:193-204)', () => {
    const { grid } = oneNetwork('Test', [['Server', new Map()]]);
    const dim = grid.calculateDimension(stringBounder());
    expect(dim.getWidth()).toBeCloseTo(85.325, 5);
    expect(dim.getHeight()).toBe(102);
    expect(grid.lineHeight(stringBounder(), 0)).toBe(102);
    expect(NETWORK_THIN).toBe(5);
    expect(GridTextBlockDecorated.NETWORK_THIN).toBe(5);
  });
});

describe('NServer#getDraw (kakupi-00-lano640)', () => {
  it("draws a cloud server through USymbols' cloud", () => {
    const { grid } = oneNetwork('inet', [['web01', new Map([['shape', 'cloud']])]]);
    const svg = drawAt(grid, 29.35, 8.5);
    expect(svg).toContain('<rect x="29.35" y="8.5" width="95.4" height="5"');
    expect(svg).toContain('<path d="M79.05,13.5 L79.05,43.5"');
    expect(svg).toContain('<path d="M52.453,51.644 C54.558,45.712 60.539,44.378 64.784,49.188');
    expect(svg).toContain('<text x="59.35" y="67.833" fill="#000" font-size="12" textLength="35.4">web01</text>');
  });

  it('a colour replaces the back colour; an unknown one is swallowed (java:168-173)', () => {
    const red = drawAt(oneNetwork('n', [['a', new Map([['color', 'red']])]]).grid, 0, 0);
    expect(red).toContain('fill="#F00"');
    const bogus = drawAt(oneNetwork('n', [['a', new Map([['color', 'nosuchcolour']])]]).grid, 0, 0);
    expect(bogus).toContain('fill="#F1F1F1"');
  });
});

describe('GridTextBlockSimple', () => {
  it('an empty grid is 0×0; a line is at least 50 tall; the grid at least 70 wide (java:92-116)', () => {
    const sp = nwdiagSkinParam();
    const empty = new GridTextBlockSimple(0, 0, sp).calculateDimension(stringBounder());
    expect([empty.getWidth(), empty.getHeight()]).toEqual([0, 0]);
    const blank = new GridTextBlockSimple(2, 3, sp);
    const dim = blank.calculateDimension(stringBounder());
    expect([dim.getWidth(), dim.getHeight()]).toEqual([70, 100]);
    expect(blank.getBackcolor()).toBeNull();
    expect(blank.getMagneticBorder().constructor.name).toBe('MagneticBorderNone');
    expect(() => blank.getMinMax(stringBounder())).toThrow('UnsupportedOperationException');
    expect(() => blank.getInnerPosition('m', stringBounder())).toThrow('UnsupportedOperationException: member=m');
    expect(drawAt(blank, 0, 0)).not.toContain('<rect');
  });
});

describe('NServerDraw', () => {
  it('a second network draws a tube, links down with the address, skipping no bus (java:113-170)', () => {
    const field = new NPlayField();
    const networks: Network[] = [];
    const sp = nwdiagSkinParam();
    const [n0, n1] = ['a', 'b'].map((n) => createNetwork(field, networks, n));
    const s = NServer.create('srv', sp);
    s.connectTo(n0!, '1.1.1.1');
    s.connectTo(n1!, '2.2.2.2');
    const conns = new Map([
      [n0!, '1.1.1.1'],
      [n1!, '2.2.2.2'],
    ]);
    const draw = s.getDraw(NServerDraw.MAGIC, conns, networks, sp);
    expect([draw.getNetwork(), draw.getServer(), draw.isLinkedTo(n1!)]).toEqual([n0, s, true]);
    expect(draw.toString()).toBe('srv {a visible=true=1.1.1.1, b visible=true=2.2.2.2}');
    const grid = new GridTextBlockDecorated(2, 1, [], networks, sp);
    grid.add(0, 0, draw);
    const svg = drawAt(grid, 0, 0);
    expect(svg.match(/height="5"/g)).toHaveLength(2);
    expect(svg).toContain('>1.1.1.1</text>');
    expect(svg).toContain('>2.2.2.2</text>');
    const mm = draw.getMinMax(stringBounder(), 100, 100);
    expect([mm.getMinX() + mm.getMaxX(), mm.getMinY() + mm.getMaxY()]).toEqual([100, 100]);
  });

  it('a group draws one box round its members, its header above (GridTextBlockDecorated.java:99-122)', () => {
    const { grid, servers, sp, networks } = oneNetwork('n', [
      ['a', new Map()],
      ['b', new Map()],
    ]);
    const g = new NwGroup('g');
    g.addName('a');
    g.setDescription('G');
    const decorated = new GridTextBlockDecorated(1, 2, [g], networks, sp);
    servers.forEach((s, col) => {
      decorated.add(0, col, s.getDraw(NServerDraw.MAGIC, new Map([[networks[0]!, '']]), networks, sp));
    });
    const svg = drawAt(decorated, 0, 0);
    expect(svg).toContain('fill="#E7E7E7" style="stroke:#E7E7E7;stroke-width:1;"');
    expect(svg).toContain('>G</text>');
    expect(drawAt(grid, 0, 0)).not.toContain('#E7E7E7');
  });
});
