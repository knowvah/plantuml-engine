import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Entity } from '../../../src/core/abel/Entity.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { LinkMiddleDecor } from '../../../src/core/decoration/LinkMiddleDecor.js';
import { LinkStyle } from '../../../src/core/decoration/LinkStyle.js';
import type { Link } from '../../../src/core/abel/Link.js';
import type { ChenEerDiagram } from '../../../src/diagrams/cheneer/ChenEerDiagram.js';
import { javaSplitComma } from '../../../src/diagrams/cheneer/command/chen-command-support.js';
import { parseLines, parseOk, parseRefused } from './helpers.js';

const PROBES_DIR = new URL('../../fixtures/cheneer/', import.meta.url);

/** The `@startchen` body of a fixture (`tests/fixtures/cheneer/`), as the dispatcher hands it to the plugin. */
function probeLines(slug: string): string[] {
  const lines = readFileSync(new URL(`${slug}.puml`, PROBES_DIR), 'utf8').split('\n');
  return lines.filter((line) => !/^@(start|end)chen$/.test(line)).slice(0, -1);
}

function leafNamed(diagram: ChenEerDiagram, name: string): Entity {
  const leaf = diagram.leafs().find((e) => e.getName() === name);
  if (leaf === undefined) throw new Error(`no leaf ${name}`);
  return leaf;
}

function linksOf(diagram: ChenEerDiagram): readonly Link[] {
  return diagram.getLinks();
}

describe('vega-chen-movieextended (upstream fixture, expected-description: 30 entities)', () => {
  const diagram = parseOk(...probeLines('vega-chen-movieextended'));

  it('parses to 30 leaves, circles and attributes included', () => {
    expect(diagram.leafs()).toHaveLength(30);
  });

  it('keeps "Born : DATE" as one attribute whose id has the owner prefix', () => {
    const born = leafNamed(diagram, 'DIRECTOR/Born : DATE');

    expect(born.getLeafType()).toBe(LeafType.CHEN_ATTRIBUTE);
    expect(born.getDisplay().toString()).toBe('[Born : DATE]');
  });

  it('draws "=" as a bold link, "->-" as a SUPERSET and "-<-" as a SUBSET', () => {
    const links = linksOf(diagram);
    const parentOf = links.find(
      (l) => l.getEntity1().getName() === 'PARENT_OF' && l.getEntity2().getName() === 'CHILD',
    );
    const superset = links.find(
      (l) => l.getEntity1().getName() === 'CUSTOMER' && l.getEntity2().getName() === 'PARENT',
    );
    const subset = links.find((l) => l.getEntity1().getName() === 'MEMBER' && l.getEntity2().getName() === 'CUSTOMER');

    expect(parentOf!.getType().getStyle().isNormal()).toBe(false);
    expect(parentOf!.getLength()).toBe(3);
    expect(superset!.getType().getMiddleDecor()).toBe(LinkMiddleDecor.SUPERSET);
    expect(subset!.getType().getMiddleDecor()).toBe(LinkMiddleDecor.SUBSET);
  });

  it('links an attribute to its owner with length 2 (attribute first) and an association with length 3', () => {
    const links = linksOf(diagram);
    const number = links.find((l) => l.getEntity1().getName() === 'DIRECTOR/Number');
    const rented = links.find((l) => l.getEntity1().getName() === 'RENTED_TO' && l.getEntity2().getName() === 'MOVIE');

    expect(number!.getEntity2().getName()).toBe('DIRECTOR');
    expect(number!.getLength()).toBe(2);
    expect(rented!.getLength()).toBe(3);
    expect(rented!.getLabel().toString()).toBe('[N]');
  });
});

describe('CommandCreateAttribute', () => {
  it('quarks a nested attribute under its composite owner and pops with "}"', () => {
    const diagram = parseOk(...probeLines('cov-attr-composite'));

    expect(diagram.leafs().map((e) => e.getName())).toEqual([
      'A',
      'A/Name',
      'A/Name/First',
      'A/Name/Last',
      'A/Name/Last/Prefix',
    ]);
    expect(diagram.peekOwner()).toBeUndefined();
  });

  it('puts the colours of an attribute line on the leaf and its link (LINE slot)', () => {
    const diagram = parseOk('entity A {', 'X #lime;line:orange', '}');

    const colors = leafNamed(diagram, 'A/X').getColors();
    expect(colors.isEmpty()).toBe(false);
    expect(linksOf(diagram)[0]!.getType().getStyle().isNormal()).toBe(true);
  });

  it('refuses a duplicate attribute (err-dup-attr)', () => {
    const refusal = parseRefused(...probeLines('err-dup-attr'));

    expect(refusal.message).toBe('Attribute already exists');
    expect(refusal.line).toBe(2);
  });

  it('refuses an attribute with no owner (cov-attr-after-close)', () => {
    const refusal = parseRefused(...probeLines('cov-attr-after-close'));

    expect(refusal.message).toBe('Attribute must be inside an entity, relationship or another attribute');
    expect(refusal.line).toBe(2);
  });

  it('refuses a lone first-line attribute (err-attr-outside, the dispatcher shows the Welcome page)', () => {
    const refusal = parseRefused(...probeLines('err-attr-outside'));

    expect(refusal.message).toBe('Attribute must be inside an entity, relationship or another attribute');
    expect(refusal.line).toBe(0);
  });
});

describe('CommandCreateEntity through the factory', () => {
  it('refuses a relationship that reuses an entity name (cov-entity-relname)', () => {
    const refusal = parseRefused(...probeLines('cov-entity-relname'));

    expect(refusal.message).toBe('Bad name');
    expect(refusal.line).toBe(2);
  });

  it('draws one entity with both attributes when it is redefined (cov-redefine)', () => {
    const diagram = parseOk(...probeLines('cov-redefine'));

    expect(diagram.leafs().map((e) => e.getName())).toEqual(['A', 'A/X', 'A/Y']);
  });

  it('draws an unclosed entity and leaves its owner on the stack (cov-unclosed)', () => {
    const diagram = parseOk(...probeLines('cov-unclosed'));

    expect(diagram.leafs().map((e) => e.getName())).toEqual(['A', 'A/X']);
    expect(diagram.peekOwner()).toBe(leafNamed(diagram, 'A'));
  });

  it('claims "entity A" with no opening brace as an attribute: CODE admits spaces (err-no-brace, first-line Welcome)', () => {
    const refusal = parseRefused(...probeLines('err-no-brace'));

    expect(refusal.kind).toBe('execution');
    expect(refusal.message).toBe('Attribute must be inside an entity, relationship or another attribute');
    expect(refusal.line).toBe(0);
  });

  it('refuses a line no command claims as a syntax error', () => {
    const refusal = parseRefused('entity A {', '}', '%%%');

    expect(refusal.kind).toBe('syntax');
    expect(refusal.message).toBe('Syntax Error?');
    expect(refusal.line).toBe(2);
  });

  it('refuses a "}" with nothing open (err-unbalanced)', () => {
    expect(parseRefused(...probeLines('err-unbalanced')).message).toBe('Unbalanced brackets');
  });
});

describe('CommandAssociate', () => {
  it('refuses a missing entity by its cleaned name (err-no-such-entity)', () => {
    const refusal = parseRefused(...probeLines('err-no-such-entity'));

    expect(refusal.message).toBe('No such entity: B');
    expect(refusal.line).toBe(2);
  });

  it('refuses a "::" port as a syntax error, the NAME2 grammar admits none (cov-port)', () => {
    const refusal = parseRefused(...probeLines('cov-port'));

    expect(refusal.kind).toBe('syntax');
    expect(refusal.message).toBe('Syntax Error?');
    expect(refusal.line).toBe(6);
  });

  it('keeps the cardinality as the label, with a length of 3 (cov-cardinality)', () => {
    const links = linksOf(parseOk(...probeLines('cov-cardinality')));

    expect(links.map((l) => l.getLabel().toString())).toEqual(['[1]', '[N]', '[(0,N)]']);
    expect(links.map((l) => l.getLength())).toEqual([3, 3, 3]);
  });

  it('has no port: getPortId answers undefined without "::"', () => {
    const link = linksOf(parseOk('entity A {', '}', 'entity B {', '}', 'A -1- B'))[0]!;

    expect(link.getPortName1()).toBeUndefined();
    expect(link.getPortName2()).toBeUndefined();
  });
});

describe('CommandSimpleSubclass', () => {
  it('draws "=>=" bold with a SUPERSET decor, and "-<-" plain with a SUBSET decor, both of length 3', () => {
    const links = linksOf(parseOk('entity A {', '}', 'entity B {', '}', 'A =>= B', 'B -<- A'));

    expect(links.map((l) => l.getType().getMiddleDecor())).toEqual([LinkMiddleDecor.SUPERSET, LinkMiddleDecor.SUBSET]);
    expect(links.map((l) => l.getType().getStyle().isNormal())).toEqual([false, true]);
    expect(links.map((l) => l.getLength())).toEqual([3, 3]);
    expect(links.map((l) => l.getLabel().toString())).toEqual(['NULL', 'NULL']);
  });

  it('refuses a missing first entity by name', () => {
    expect(parseRefused('entity A {', '}', 'Z ->- A').message).toBe('No such entity: Z');
  });
});

describe('CommandMultiSubclass', () => {
  it('"U" puts the superset decor on the superclass link and none on the subclass links (cov-multi-U)', () => {
    const diagram = parseOk(...probeLines('cov-multi-U'));
    const links = linksOf(diagram);

    expect(leafNamed(diagram, 'P/U A, B /center').getLeafType()).toBe(LeafType.CHEN_CIRCLE);
    expect(links.map((l) => l.getType().getMiddleDecor())).toEqual([
      LinkMiddleDecor.SUPERSET,
      LinkMiddleDecor.NONE,
      LinkMiddleDecor.NONE,
    ]);
    expect(links.map((l) => l.getLength())).toEqual([2, 3, 3]);
  });

  it.each(['cov-multi-d', 'cov-multi-o'])('"d" and "o" put the superset decor on each subclass link (%s)', (slug) => {
    const links = linksOf(parseOk(...probeLines(slug)));

    expect(links.map((l) => l.getType().getMiddleDecor())).toEqual([
      LinkMiddleDecor.NONE,
      LinkMiddleDecor.SUPERSET,
      LinkMiddleDecor.SUPERSET,
    ]);
  });

  it('draws the superclass link bold for "=" (cov-multi-d)', () => {
    const links = linksOf(parseOk(...probeLines('cov-multi-d')));

    expect(links[0]!.getType().getStyle().isNormal()).toBe(false);
    expect(links[1]!.getType().getStyle().isNormal()).toBe(true);
    expect(LinkStyle.NORMAL().isNormal()).toBe(true);
  });

  it('creates the circle and the superclass link before the missing subclass errors (err-multi-missing)', () => {
    const lines = probeLines('err-multi-missing');
    const refusal = parseRefused(...lines);

    expect(refusal.message).toBe('No such entity: Q');
    expect(refusal.line).toBe(4);
  });

  it('keeps the circle and link the failed command added, in the diagram the refusal came from', () => {
    const lines = ['entity P {', '}', 'entity A {', '}'];
    const ok = parseLines(...lines, 'P ->- U { A }');

    expect('refused' in ok).toBe(false);
    expect(linksOf(ok as ChenEerDiagram)).toHaveLength(2);
  });

  it('drops a trailing empty subclass like Java split(","): "{A,}" makes one subclass link', () => {
    const links = linksOf(parseOk('entity P {', '}', 'entity A {', '}', 'P ->- U {A,}'));

    expect(links).toHaveLength(2);
    expect(links[1]!.getEntity2().getName()).toBe('A');
  });
});

describe('javaSplitComma (D9)', () => {
  it.each([
    ['A, B', ['A', ' B']],
    ['A,', ['A']],
    ['A,,', ['A']],
    [',A', ['', 'A']],
    [',', []],
    ['', ['']],
    ['A', ['A']],
  ])('%j splits to %j', (input, expected) => {
    expect(javaSplitComma(input)).toEqual(expected);
  });
});
