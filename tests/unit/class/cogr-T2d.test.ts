/**
 * cogr T2d: `note right of A: [[url text]]` is a SINGLE-line note. Upstream registers
 * `factoryNoteOnEntityCommand.createSingleLine()` (`ClassDiagramFactory.java:152`) before both `createMultiLine`
 * variants (`:155-156`), and its single-line regex (`CommandFactoryNoteOnEntity.java:92-116`) backtracks the target
 * to `A` so the `:` is the separator. Our multi-line opener took `A:` as the target and the line produced no note.
 * Oracle: `test-results/dot-cache/class/bejuve-37-furu333/in.svg` (`(Cannot decode)` in monospace, 104.213 wide).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

const NOTE = 'note right of compA: [[http://google.fr <img:foo.webp{scale=2}>]]';

describe('note with a URL label after the colon (cogr T2d)', () => {
  it('draws the note over an empty group with the undecodable-image text', () => {
    const svg = render(['component "compA" as compA {', '}', NOTE]);
    // The jar writes the space of `(Cannot decode)` as U+00A0 (`SvgGraphics#text`).
    expect(svg).toContain('>(Cannot\u00A0decode)</text>');
    expect(svg).toContain('font-family="monospace"');
    expect(svg).toContain('textLength="104.213"');
    expect(svg).toContain('width="265px"');
  });

  it('draws the same note over a class', () => {
    const svg = render(['class A', 'note right of A: [[http://google.fr hi]]']);
    expect(svg).toContain('>hi</text>');
  });

  it('keeps a member tip multi-line opener on the multi-line path', () => {
    const svg = render(['class A {', '  counter', '}', 'note left of A::counter', 'tip', 'end note']);
    expect(svg).toContain('>tip</text>');
  });
});
