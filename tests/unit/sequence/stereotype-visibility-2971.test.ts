/**
 * plantuml#2971, upstream `0801eabbca2`: `hide|show [GENDER] stereotype` in a
 * sequence diagram adds an ordered rule to `StereotypeVisibility`
 * (`CommandHideShowByGender.java:168-179`); `Participant#visibleStereotypeText`
 * (`Participant.java:142-166`) keeps the stereotype whole, drops it, or keeps
 * some labels as PLAIN text (the name font, not the stereotype's italic).
 *
 * Expected head rows are the jar's (`scripts/oracle-render.sh`,
 * 1.2026.11beta1, 2026-11-19).
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence } from '../../oracle/svg-conformance/render-fixture-sequence.js';

/** The head row's texts, as `[text, italic]`, up to the first repeat (the footer row). */
function headRow(...lines: string[]): [string, boolean][] {
  const svg = renderFixtureSequence(['@startuml', ...lines, '@enduml', ''].join('\n'), new DeterministicMeasurer());
  const texts = [...svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map((m): [string, boolean, string] => [
    m[2]!,
    m[1]!.includes('font-style="italic"'),
    /y="([\d.]+)"/.exec(m[1]!)![1]!,
  ]);
  const top = texts[0]![2];
  return texts.filter((t) => t[2] === top || Number(t[2]) < 60).map(([text, italic]) => [text, italic]);
}

describe('StereotypeVisibility rules (StereotypeVisibility.java:69-84)', () => {
  it('hides one label everywhere, keeping the others as plain text', () => {
    const row = headRow(
      'participant A <<a>><<b>>',
      'participant B <<a>>',
      'participant C <<b>>',
      'hide <<a>> stereotype',
      'A -> B',
      'B -> C',
    );
    expect(row).toEqual([
      ['«b»', false],
      ['A', false],
      ['B', false],
      ['«b»', true],
      ['C', false],
    ]);
  });

  it('lets a later show restore one label after a blanket hide', () => {
    const row = headRow(
      'hide stereotype',
      'show <<b>> stereotype',
      'participant A <<a>><<b>>',
      'participant B <<a>>',
      'participant "Long Name" as L <<b>>',
      'A -> B',
      'B -> L',
    );
    expect(row).toEqual([
      ['«b»', false],
      ['A', false],
      ['B', false],
      ['«b»', true],
      ['Long Name', false],
    ]);
  });

  it('hides by participant code or display name, quotes dropped', () => {
    const row = headRow(
      'participant A <<x>>',
      'participant "Long Name" as L <<y>>',
      'participant C <<z>>',
      'hide A stereotype',
      'hide "Long Name" stereotype',
      'A -> L',
      'L -> C',
    );
    expect(row).toEqual([
      ['A', false],
      ['Long Name', false],
      ['«z»', true],
      ['C', false],
    ]);
  });

  it('matches `<<name>>` exactly: `<< new >>` hides nothing (tegasu-93-fima016)', () => {
    const row = headRow('hide << new >> stereotype', 'participant S <<new>>', 'participant T', 'S -> T');
    expect(row).toEqual([
      ['«new»', true],
      ['S', false],
      ['T', false],
    ]);
  });
});
