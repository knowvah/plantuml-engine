/**
 * cogr T3c: three ways a dotted or `::` name reaches the namespace tree. Oracles:
 * `test-results/dot-cache/class/{gemufi-65-riba175,vapasu-07-fajo818,botome-06-bera894}/in.svg`.
 *
 * 1. `CommandPackageEmpty.java:119-139` titles `package java.lang {}` with the dotted name as typed (`display = idShort`),
 *    where the brace-opening `CommandPackage.java:160` uses `quark.getName()` (`lang`).
 * 2. `CommandCreateClass.java:86-87`: the optional `<generic>` follows the QUOTED code `CODE4` too
 *    (`NameAndCodeParser.java:68`), so `class "m3.Table1" <generic here>` is class `Table1` in package `m3`.
 * 3. `CommandLinkClass.java:303-310`: `cleanId` strips the quotes, then `::` splits entity and port, so
 *    `"Customer::AccountReconciliation" <|.. Object` links the existing `Customer`.
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { splitEndpointPort } from '../../../src/diagrams/class/class-relationship-id-grammar.js';
import { parseIdDisplay } from '../../../src/diagrams/class/class-declaration-extractors.js';

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

function texts(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('a same-line empty package keeps its dotted name as the title (cogr T3c)', () => {
  it('shows java.lang for package java.lang {}', () => {
    const t = texts(render(['package a_$a #yellow {}', 'package java.lang #white {}', 'a_$a --> dummy$2']));
    expect(t).toContain('java.lang');
    expect(t).not.toContain('lang');
  });

  it('shows a.b.c for the deepest empty package', () => {
    expect(texts(render(['package a.b.c {}', 'class X']))).toContain('a.b.c');
  });

  it('keeps the segment title when the package has a body', () => {
    const t = texts(render(['package java.lang {', 'class Y', '}']));
    expect(t).toContain('lang');
    expect(t).not.toContain('java.lang');
  });

  it('titles an empty namespace with its qualified name', () => {
    expect(texts(render(['package p {', 'namespace a.b {}', '}', 'class X']))).toContain('p.a.b');
  });
});

describe('a quoted code followed by a generic (cogr T3c)', () => {
  it('parses the quoted code without its quotes', () => {
    expect(parseIdDisplay('"m3.Table1" <generic here>')).toEqual({
      id: 'm3.Table1',
      display: 'm3.Table1',
      typeParams: ['generic here'],
      typeParamsRawText: 'generic here',
    });
  });

  it('puts Table1 in package m3 with its generic', () => {
    const svg = render(['class "m3.Table1" <generic here>']);
    expect(svg).toContain('data-qualified-name="m3.Table1"');
    expect(texts(svg)).toEqual(expect.arrayContaining(['m3', 'Table1', 'generic here']));
    expect(texts(svg)).not.toContain('"m3.Table1"');
  });
});

describe('a quoted endpoint with a :: port (cogr T3c)', () => {
  it('splits entity and port after stripping the quotes', () => {
    expect(splitEndpointPort('"Customer::AccountReconciliation"')).toEqual({
      id: 'Customer',
      port: 'AccountReconciliation',
    });
  });

  it('keeps a quoted name with no :: as one id', () => {
    expect(splitEndpointPort('"My Class"')).toEqual({ id: 'My Class' });
  });

  it('links the existing entity and creates no class named after the port form', () => {
    const svg = render(['Customer |o--o{ AccountParty', '"Customer::AccountReconciliation" <|.. Object']);
    expect(svg).toContain('data-qualified-name="Customer"');
    expect(svg).not.toContain('Customer::AccountReconciliation');
    expect(svg).toContain('data-qualified-name="Object"');
  });
});
