/**
 * nwdiag's `core/` model: networks, groups and servers, without drawing.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/core/
 */
import { describe, expect, it } from 'vitest';
import { USymbols } from '../../../../src/core/decoration/symbol/USymbols.js';
import { stringBounder } from '../../mindmap/helpers/mindmap-skin.js';
import { NServer } from '../../../../src/diagrams/nwdiag/core/NServer.js';
import { NwGroup } from '../../../../src/diagrams/nwdiag/core/NwGroup.js';
import type { Network } from '../../../../src/diagrams/nwdiag/core/Network.js';
import { NPlayField } from '../../../../src/diagrams/nwdiag/next/NPlayField.js';
import { createNetwork, nwdiagSkinParam } from '../helpers/nwdiag.js';

/** A field, its networks and a skin param. */
function world(): { field: NPlayField; networks: Network[] } {
  return { field: new NPlayField(), networks: [] };
}

describe('Network', () => {
  it('magicDelta is +2 on an even stage, -2 on an odd one, 0 when invisible (java:63-70)', () => {
    const { field, networks } = world();
    const [a, b, c] = ['a', 'b', 'c'].map((n) => createNetwork(field, networks, n));
    c!.goInvisible();
    expect([a!.magicDelta(), b!.magicDelta(), c!.magicDelta()]).toEqual([2, -2, 0]);
    expect([a!.getUp(), b!.getUp()?.getNumber(), b!.getNstage().getNumber()]).toEqual([null, 0, 1]);
    expect(a!.toString()).toBe('a visible=true');
  });

  it('shows its description in place of its name (java:90-95)', () => {
    const { field, networks } = world();
    const n = createNetwork(field, networks, 'dmz');
    expect(n.getDisplayName()).toBe('dmz');
    n.setDescription('DMZ');
    n.setOwnAdress('10.0.0.0/8');
    n.setFullWidth(true);
    n.setMinMax(3, 9);
    n.setY(12);
    expect([n.getDisplayName(), n.getOwnAdress(), n.isFullWidth(), n.getXmin(), n.getXmax(), n.getY()]).toEqual([
      'DMZ',
      '10.0.0.0/8',
      true,
      3,
      9,
      12,
    ]);
    expect(n.getColor()).toBeNull();
  });
});

describe('NServer', () => {
  it('the first network sets the bar; another adds the stage above it (java:181-194)', () => {
    const { field, networks } = world();
    const [n0, n1, n2] = ['n0', 'n1', 'n2'].map((n) => createNetwork(field, networks, n));
    const s = NServer.create('web', nwdiagSkinParam());
    s.connectTo(n1!, '10.0.0.1');
    expect([s.getBar().getStart().getNumber(), s.getBar().getEnd().getNumber()]).toEqual([1, 1]);
    s.connectTo(n2!, '');
    expect([s.getBar().getStart().getNumber(), s.getBar().getEnd().getNumber()]).toEqual([1, 1]);
    expect(s.getMainNetworkNext()).toBe(n1);
    expect([s.getAdress(n1!), s.getAdress(n2!), s.getAdress(n0!)]).toEqual(['10.0.0.1', '', null]);
    expect(() => s.connectTo(null, '')).toThrow('IllegalArgumentException');
  });

  it("joining the first network second dereferences its null 'up' (java:193)", () => {
    const { field, networks } = world();
    const [n0, n1] = ['n0', 'n1'].map((n) => createNetwork(field, networks, n));
    const s = NServer.create('web', nwdiagSkinParam());
    s.connectTo(n1!, '');
    expect(() => s.connectTo(n0!, '')).toThrow('NullPointerException');
  });

  it('an empty address never overwrites a known connection (java:186-187)', () => {
    const { field, networks } = world();
    const n = createNetwork(field, networks, 'n');
    const s = NServer.create('db', nwdiagSkinParam());
    s.connectTo(n, '1.2.3.4');
    s.connectTo(n, undefined);
    expect(s.getAdress(n)).toBe('1.2.3.4');
  });

  it('someAddress, blankSomeAddress and learnThisAddress (java:95-126)', () => {
    const { field, networks } = world();
    const [a, b] = ['a', 'b'].map((n) => createNetwork(field, networks, n));
    const s = NServer.create('x', nwdiagSkinParam());
    expect([s.someAddress(), s.someNetwork()]).toEqual(['', null]);
    s.updateProperties(new Map([['address', '9.9.9.9']]));
    expect(s.someAddress()).toBe('9.9.9.9');
    s.connectTo(a!, '1.1.1.1');
    s.connectTo(b!, '2.2.2.2');
    expect([s.someAddress(), s.someNetwork()]).toEqual(['1.1.1.1', a]);
    s.blankSomeAddress();
    expect(s.someAddress()).toBe('9.9.9.9');
    s.learnThisAddress('3.3.3.3');
    s.learnThisAddress('4.4.4.4');
    expect([s.getAdress(a!), s.getAdress(b!)]).toEqual(['3.3.3.3', '2.2.2.2']);
    s.blankSomeAddress();
    s.learnThisAddress(null);
    expect(s.getAdress(a!)).toBe('');
  });

  it('connectMeIfAlone joins once and hides the first link on an invisible network (java:83-89)', () => {
    const { field, networks } = world();
    const [hidden, other] = ['', 'o'].map((n) => createNetwork(field, networks, n));
    hidden!.goInvisible();
    const s = NServer.create('s', nwdiagSkinParam());
    expect(s.isAlone()).toBe(true);
    s.connectMeIfAlone(hidden!);
    s.connectMeIfAlone(other!);
    expect([s.isAlone(), s.printFirstLink(), s.getAdress(other!)]).toEqual([false, false, null]);
    expect(() => NServer.create('z', nwdiagSkinParam()).getMainNetworkNext()).toThrow('NoSuchElementException');
  });

  it('a known shape replaces RECTANGLE; an unknown one keeps it (java:206-212)', () => {
    const s = NServer.create('s', nwdiagSkinParam());
    expect(s.getShape()).toBe(USymbols.RECTANGLE);
    s.updateProperties(new Map([['shape', 'bogus']]));
    expect(s.getShape()).toBe(USymbols.RECTANGLE);
    s.updateProperties(
      new Map([
        ['shape', 'cloud'],
        ['description', 'Web'],
        ['color', 'red'],
      ]),
    );
    expect([s.getShape(), s.getDescription(), s.getName(), s.toString()]).toEqual([USymbols.CLOUD, 'Web', 's', 's']);
  });

  it('toTextBlock: null stays null, "" is 0×0, ", " breaks the line (java:140-151)', () => {
    const s = NServer.create('s', nwdiagSkinParam());
    expect(s.toTextBlock('arrow', null)).toBeNull();
    const empty = s.toTextBlock('arrow', '')!.calculateDimension(stringBounder());
    expect([empty.getWidth(), empty.getHeight()]).toEqual([0, 0]);
    const one = s.toTextBlock('arrow', '1.1.1.1')!.calculateDimension(stringBounder());
    const two = s.toTextBlock('arrow', '1.1.1.1, 2.2.2.2')!.calculateDimension(stringBounder());
    expect(two.getHeight()).toBeCloseTo(one.getHeight() * 2, 6);
    expect(two.getWidth()).toBeCloseTo(one.getWidth(), 6);
  });
});

describe('NwGroup', () => {
  it('holds names, builds its box once from the servers it names (java:76-128)', () => {
    const { field, networks } = world();
    const n = createNetwork(field, networks, 'n');
    const sp = nwdiagSkinParam();
    const servers = new Map(['a', 'b', 'c'].map((k) => [k, NServer.create(k, sp)] as const));
    for (const s of servers.values()) s.connectTo(n, '');
    const g = new NwGroup('g');
    g.addName('a');
    g.addName('c');
    expect([g.contains(servers.get('a')!), g.contains(servers.get('b')!), [...g.names()]]).toEqual([
      true,
      false,
      ['a', 'c'],
    ]);
    const box = g.getNbox(servers);
    expect(g.getNbox(servers)).toBe(box);
    expect(g.getNboxInternal()).toBe(box);
    expect([...box.getPositions().keys()]).toEqual([servers.get('a')!.getBar(), servers.get('c')!.getBar()]);
    expect(g.getName()).toBe('g');
    expect(g.toString()).toMatch(/^NwGroup:g \[a, c\] /);
  });

  it('has no header without a description (java:130-137)', () => {
    const g = new NwGroup('g');
    const sp = nwdiagSkinParam();
    expect(g.getTopHeaderHeight(stringBounder(), sp)).toBe(0);
    g.setDescription('Group');
    expect(g.getTopHeaderHeight(stringBounder(), sp)).toBeGreaterThan(0);
  });
});

describe('NPlayField#fixGroups', () => {
  it("moves each member's bar into the group's box (java:103-119)", () => {
    const { field, networks } = world();
    const n = createNetwork(field, networks, 'n');
    const sp = nwdiagSkinParam();
    const servers = ['a', 'b', 'c'].map((k) => NServer.create(k, sp));
    for (const s of servers) {
      s.connectTo(n, '');
      field.addInPlayfield(s.getBar());
    }
    const g = new NwGroup('g');
    g.addName('a');
    g.addName('c');
    field.fixGroups([g], servers);
    field.fixGroups([g], servers);
    const layout = field.doLayout();
    expect(servers.map((s) => layout.get(s.getBar()))).toEqual([1, 0, 2]);
    expect(servers[0]!.getBar().getParent()).toBe(g.getNboxInternal());
  });
});
