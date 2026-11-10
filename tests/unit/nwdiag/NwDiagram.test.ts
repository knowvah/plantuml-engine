/**
 * `NwDiagram`, driven the way the commands drive it, against the planning
 * probes' jar renders (plans/nwdiag-engine-port/probes/, re-rendered into
 * tests/fixtures/nwdiag/ by T3b).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/NwDiagram.java
 */
import { describe, expect, it } from 'vitest';
import type { HColorSimple } from '../../../src/core/klimt/color/HColorSimple.js';
import { USymbols } from '../../../src/core/decoration/symbol/USymbols.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { NwDiagram } from '../../../src/diagrams/nwdiag/NwDiagram.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { nwdiagSkinParam } from './helpers/nwdiag.js';

function diagram(): NwDiagram {
  return new NwDiagram({ lines: [] }, new PreprocessingArtifact(), nwdiagSkinParam());
}

/** Each network's display name and visibility. */
function networksOf(d: NwDiagram): [string | null, boolean][] {
  return d.getNetworks().map((n) => [n.getDisplayName(), n.isVisible()]);
}

describe('NwDiagram (cov-no-wrapper)', () => {
  it('is 209.45 × 116.5 with no nwdiag wrapper (oracle viewBox 210 × 117)', () => {
    const d = diagram();
    d.openNetwork('dmz');
    d.addElement('web01', undefined);
    d.addElement('web02', undefined);
    d.closeSomething();
    d.makeDiagramReady();
    const dim = d.getTextBlock().calculateDimension(stringBounder());
    expect(dim.getWidth()).toBeCloseTo(209.45, 3);
    expect(dim.getHeight()).toBeCloseTo(116.5, 3);
    expect([d.getDescription(), d.getDefaultMargins().getTop(), d.getDefaultMargins().getLeft()]).toEqual([
      '(Nwdiag)',
      0,
      0,
    ]);
  });
});

describe('NwDiagram (cov-peer-links)', () => {
  it('a link before any network shares the bar over two invisible networks', () => {
    const d = diagram();
    d.addElement('inet', 'shape = cloud');
    d.link('inet', 'router');
    d.openNetwork(null);
    d.addElement('router', undefined);
    d.addElement('web01', undefined);
    d.closeSomething();
    d.makeDiagramReady();
    expect(networksOf(d)).toEqual([
      ['', false],
      ['', false],
      [null, true],
    ]);
    const s = d.getServers();
    expect([...s.keys()]).toEqual(['inet', 'router', 'web01']);
    expect(s.get('inet')!.getShape()).toBe(USymbols.CLOUD);
    expect(s.get('router')!.getBar()).toBe(s.get('inet')!.getBar());
    const svg = drawn(d);
    expect(svg).toContain('<rect x="13.3" y="222.5" width="85.4" height="5"');
    expect(svg).toContain('<path d="M56,85.5 L56,120.5"');
    expect(svg).toContain('<path d="M58,227.5 L58,257.5"');
    expect(svg).toContain('<rect x="30.363" y="155.5" width="51.275" height="32"');
  });

  it('veryFirstLink: an unknown name with no network names a network (java:223-230)', () => {
    const d = diagram();
    d.link('dmz', 'web01');
    d.makeDiagramReady();
    expect(networksOf(d)).toEqual([['dmz', true]]);
    expect(d.getServers().get('web01')!.getMainNetworkNext()).toBe(d.getNetworks()[0]);
  });

  it('a link between known servers reuses the invisible network just after (java:191-209)', () => {
    const d = diagram();
    d.openNetwork('n');
    d.addElement('a', 'address = "1.1.1.1"');
    d.addElement('b', undefined);
    d.closeSomething();
    d.link('a', 'b');
    d.link('a', 'b');
    expect(networksOf(d)).toEqual([
      ['n', true],
      ['', false],
    ]);
    const [, hidden] = d.getNetworks();
    // `blankSomeAddress` empties a's first address, so `someAddress` falls back to the declared one.
    const [a, b] = [d.getServers().get('a')!, d.getServers().get('b')!];
    expect([a.getAdress(d.getNetworks()[0]!), a.getAdress(hidden!), b.getAdress(hidden!)]).toEqual(['', '1.1.1.1', '']);
  });
});

describe('NwDiagram (cov-multi-address)', () => {
  it('a server on three networks keeps each address', () => {
    const d = diagram();
    d.openNetwork('a');
    d.setProperty('address', '10.0.0.0/24');
    d.addElement('s1', 'address = "10.0.0.1, 10.0.0.2"');
    d.addElement('s2', undefined);
    d.closeSomething();
    d.openNetwork('b');
    d.addElement('s1', 'address = "10.1.0.1"');
    d.addElement('s3', undefined);
    d.closeSomething();
    d.openNetwork('c');
    d.addElement('s1', undefined);
    d.addElement('s2', 'address = "10.2.0.2"');
    d.closeSomething();
    d.makeDiagramReady();
    const [a, b, c] = d.getNetworks();
    const s1 = d.getServers().get('s1')!;
    expect([s1.getAdress(a!), s1.getAdress(b!), s1.getAdress(c!)]).toEqual(['10.0.0.1, 10.0.0.2', '10.1.0.1', '']);
    expect([s1.getBar().getStart().getNumber(), s1.getBar().getEnd().getNumber()]).toEqual([0, 1]);
    expect(a!.getOwnAdress()).toBe('10.0.0.0/24');
    expect(drawn(d)).toContain('>10.0.0.0/24</text>');
  });
});

describe('NwDiagram errors (nwp D8)', () => {
  it('what about <name>: an unknown first name once a network exists (cov-link-unknown)', () => {
    const d = diagram();
    d.openNetwork('dmz');
    d.addElement('web01', undefined);
    d.closeSomething();
    expect(d.link('ghost', 'web01').getError()).toBe('what about ghost');
  });

  it('Cannot nest group; Cannot open network in a group; Cannot nest network', () => {
    const d = diagram();
    expect(d.openGroup('g1').isOk()).toBe(true);
    expect(d.openGroup('g2').getError()).toBe('Cannot nest group');
    expect(d.openNetwork('n').getError()).toBe('Cannot open network in a group');
    d.closeSomething();
    d.closeSomething();
    expect(d.openNetwork('n').isOk()).toBe(true);
    expect(d.openNetwork('m').getError()).toBe('Cannot nest network');
  });

  it('Element already in another group. (torazi-09-gago377)', () => {
    const d = diagram();
    d.openGroup(null);
    d.addElement('db', undefined);
    d.closeSomething();
    d.openGroup(null);
    expect(d.addElement('db', undefined).getError()).toBe('Element already in another group.');
  });

  it('description outside any network or group dereferences null (cov-description-outside)', () => {
    expect(() => diagram().setProperty('description', 'orphan')).toThrow('NullPointerException');
  });
});

describe('NwDiagram#setProperty (java:432-454)', () => {
  it('colour and description go to the current group, else network; width = full', () => {
    const d = diagram();
    d.openNetwork('n');
    d.setProperty('color', 'red');
    d.setProperty('WIDTH', 'Full');
    d.setProperty('description', 'Net');
    d.addElement('a', undefined);
    d.closeSomething();
    d.setProperty('color', 'blue');
    d.setProperty('address', 'ignored');
    d.openGroup('g');
    d.setProperty('color', 'pink');
    d.setProperty('description', 'Grp');
    d.addElement('a', undefined);
    d.closeSomething();
    d.makeDiagramReady();
    const n = d.getNetworks()[0]!;
    expect([n.getDisplayName(), n.isFullWidth(), n.getOwnAdress()]).toEqual(['Net', true, null]);
    expect((n.getColor() as HColorSimple).asString()).toBe('#FF0000');
    const svg = drawn(d);
    expect(svg).toContain('>Grp</text>');
    expect(svg).toContain('fill="#FFC0CB"');
  });

  it('a server in a group outside any network learns its address later (java:240-256)', () => {
    const d = diagram();
    d.openGroup('g');
    d.addElement('a', 'address = "9.9.9.9"');
    d.closeSomething();
    d.addElement('b', 'address = "8.8.8.8"');
    d.makeDiagramReady();
    expect(networksOf(d)).toEqual([['', false]]);
    const s = d.getServers();
    expect([s.get('a')!.someAddress(), s.get('b')!.someAddress(), s.get('b')!.printFirstLink()]).toEqual([
      '9.9.9.9',
      '8.8.8.8',
      false,
    ]);
  });

  it('servers declared before the first network join a hidden one (java:149-159)', () => {
    const d = diagram();
    d.addElement('a', undefined);
    d.addElement('b', undefined);
    d.openNetwork('n');
    d.addElement('b', undefined);
    d.closeSomething();
    d.makeDiagramReady();
    expect(networksOf(d)).toEqual([
      ['', false],
      ['n', true],
    ]);
    expect(d.getServers().get('a')!.getMainNetworkNext()).toBe(d.getNetworks()[0]);
  });
});

function drawn(d: NwDiagram): string {
  const ug = svgGraphic();
  d.getTextBlock().drawU(ug);
  return ug.getSvgString();
}

describe('NwDiagram.toSet', () => {
  it('reads name = value pairs, unquoting (java:288-303)', () => {
    expect([...NwDiagram.toSet('a = 1, b = "x y" ,c=z')]).toEqual([
      ['a', '1'],
      ['b', 'x y'],
      ['c', 'z'],
    ]);
    expect(NwDiagram.toSet(undefined).size).toBe(0);
  });
});
