/**
 * `NwDiagramFactory` and the eight nwdiag commands: each regex against the
 * lines Java accepts and refuses, and the jar's four error rows.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/NwDiagramFactory.java
 */
import { describe, expect, it } from 'vitest';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { COMMENT_RE } from '../../../src/diagrams/nwdiag/CommandComment.js';
import { ELEMENT_RE } from '../../../src/diagrams/nwdiag/CommandElement.js';
import { END_SOMETHING_RE } from '../../../src/diagrams/nwdiag/CommandEndSomething.js';
import { GROUP_RE } from '../../../src/diagrams/nwdiag/CommandGroup.js';
import { LINK_RE } from '../../../src/diagrams/nwdiag/CommandLink.js';
import { NETWORK_RE } from '../../../src/diagrams/nwdiag/CommandNetwork.js';
import { NWDIAG_INIT_RE } from '../../../src/diagrams/nwdiag/CommandNwDiagInit.js';
import { PROPERTY_RE } from '../../../src/diagrams/nwdiag/CommandProperty.js';
import type { NwDiagram } from '../../../src/diagrams/nwdiag/NwDiagram.js';
import { parseNwdiag } from '../../../src/diagrams/nwdiag/NwDiagramFactory.js';

function parse(...lines: string[]): NwDiagram | ParseRefusal {
  return parseNwdiag({ lines, type: 'nwdiag' }, new PreprocessingArtifact());
}

function parsed(...lines: string[]): NwDiagram {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${String(result.line)}: ${result.message}`);
  return result;
}

function refusal(...lines: string[]): ParseRefusal {
  const result = parse(...lines);
  if (!('refused' in result)) throw new Error('accepted');
  return result;
}

describe('nwdiag command regexes', () => {
  it('CommandNwDiagInit takes nwdiag {, {, nwdiag and an empty line (nwp D8)', () => {
    for (const line of ['nwdiag {', '{', 'nwdiag', '', 'NWDIAG{']) expect(NWDIAG_INIT_RE.test(line)).toBe(true);
    expect(NWDIAG_INIT_RE.test('nwdiag { x')).toBe(false);
  });

  it('CommandProperty keeps an unquoted trailing ; and drops a quoted one (java:54-67)', () => {
    expect(PROPERTY_RE.exec('address = 210.x.x.x/24;')!.groups!['VALUE']).toBe('210.x.x.x/24;');
    expect(PROPERTY_RE.exec('address = "10.0.0.0/24";')!.groups!['VALUE']).toBe('10.0.0.0/24');
    expect(PROPERTY_RE.exec('Color="pink"')!.groups!['NAME']).toBe('Color');
    expect(PROPERTY_RE.test('label = x')).toBe(false);
  });

  it('CommandElement: a name, an optional [definition], an optional ;', () => {
    const m = ELEMENT_RE.exec('web01 [address = "192.168.0.1"];')!;
    expect([m.groups!['NAME'], m.groups!['DEFINITION']]).toEqual(['web01', 'address = "192.168.0.1"']);
    expect(ELEMENT_RE.exec('db-01.x;')!.groups!['DEFINITION']).toBeUndefined();
    expect(ELEMENT_RE.test('a -- b [shape = cloud]')).toBe(false);
  });

  it('CommandLink: a -- b and a -- b; but not a -- b [attr] (ligalo-62-suvu444)', () => {
    expect(LINK_RE.exec('a -- b;')!.groups).toMatchObject({ NAME1: 'a', NAME2: 'b' });
    expect(LINK_RE.test('a--b')).toBe(true);
    expect(LINK_RE.test('a -- b [shape = cloud, address="USB"];')).toBe(false);
  });

  it('CommandGroup and CommandNetwork: optional names, then {', () => {
    expect(GROUP_RE.exec('group {')!.groups!['NAME']).toBeUndefined();
    expect(GROUP_RE.exec('group g1 {')!.groups!['NAME']).toBe('g1');
    expect(NETWORK_RE.exec('network dmz-1.a {')!.groups!['NAME']).toBe('dmz-1.a');
    expect(NETWORK_RE.exec('network{')!.groups!['NAME']).toBeUndefined();
    expect(GROUP_RE.test('group g-1 {')).toBe(false);
  });

  it('CommandComment and CommandEndSomething', () => {
    expect(COMMENT_RE.test('// note')).toBe(true);
    expect(END_SOMETHING_RE.test('}')).toBe(true);
    expect(END_SOMETHING_RE.test('}}')).toBe(false);
  });
});

describe('NwDiagramFactory', () => {
  it('builds the diagram and makes it ready (cov-no-wrapper)', () => {
    const d = parsed('network dmz {', '  web01;', '  web02;', '}');
    expect(d.getNetworks().map((n) => n.getDisplayName())).toEqual(['dmz']);
    expect([...d.getServers().keys()]).toEqual(['web01', 'web02']);
  });

  it('ignores footbox, comments and the start/end tags', () => {
    const d = parsed('@startnwdiag', 'hide footbox', 'footbox', '// x', 'nwdiag {', '  a', '}', '@endnwdiag');
    expect(d.getNetworks().map((n) => n.isVisible())).toEqual([false]);
  });

  it('refuses a link with attributes: Syntax Error? (ligalo-62-suvu444)', () => {
    const r = refusal('nwdiag {', '  a -- b [shape = cloud, address="USB"];', '}');
    expect([r.kind, r.line, r.message]).toEqual(['syntax', 1, 'Syntax Error?']);
  });

  it('Element already in another group. (torazi-09-gago377)', () => {
    const r = refusal('nwdiag {', 'group {', 'app;', 'db;', '}', 'group {', 'router;', 'db;', '}', '}');
    expect([r.kind, r.line, r.message]).toEqual(['execution', 7, 'Element already in another group.']);
  });

  it('Cannot nest group (zeceme-22-rade890)', () => {
    const r = refusal('nwdiag {', 'group {', 'peter', '', 'group {', '}', '}');
    expect([r.kind, r.line, r.message]).toEqual(['execution', 4, 'Cannot nest group']);
  });

  it('a description outside any network is an execution error at its line (ProtectedCommand, cov-description-outside)', () => {
    const r = refusal('nwdiag {', 'description = "orphan"', '}');
    expect([r.kind, r.line]).toEqual(['execution', 1]);
    expect(r.message).toMatch(
      /^You should send a mail to plantuml@gmail\.com with this log \(V[^)]+\) NullPointerException/,
    );
  });

  it('a -- b after a network joins both to an invisible network (CommandLink)', () => {
    const d = parsed('nwdiag {', 'network n {', 'a;', 'b;', '}', 'a -- b;', '}');
    expect(d.getNetworks().map((n) => n.isVisible())).toEqual([true, false]);
    expect(refusal('network n {', 'a', '}', 'ghost -- a').message).toBe('what about ghost');
  });

  it('reads title, scale and sprites through the common commands', () => {
    const d = parsed('title T', 'scale 2', 'nwdiag {', 'a', '}');
    expect(d.scale).toBeDefined();
    expect(d.annotations.title).toBeDefined();
  });
});
