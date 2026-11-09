/**
 * laep T3c: a `note on link` before any link is an EXECUTION error in the jar, not a silent no-op:
 * `CommandFactoryNoteOnLink#executeInternal` returns `CommandExecutionResult.error("No link defined")` when
 * `diagram.getLastLink()` is null (`CommandFactoryNoteOnLink.java:204-206`). The class factory is tried before the
 * legacy activity factory (`PSystemBuilder.java:135-137`), so over-accepting here decides the error page's
 * "Assumed diagram type" (jar: state; ours was class) for `note on link: first` + `(*) --> A`.
 */
import { describe, it, expect } from 'vitest';
import { parseClass } from '../../../src/diagrams/class/parser.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ClassDiagramAST } from '../../../src/diagrams/class/ast.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';

const NO_LINK_DEFINED = 'No link defined';

function parse(lines: string[]): ClassDiagramAST | ParseRefusal {
  const block: UmlSource = { lines, type: 'class' };
  return parseClass(block);
}

describe('class: note on link before any link', () => {
  it('refuses with the execution error "No link defined" at the note line', () => {
    const result = parse(['note on link: first', 'class A']) as ParseRefusal;
    expect(result.refused).toBe(true);
    expect(result.kind).toBe('execution');
    expect(result.message).toBe(NO_LINK_DEFINED);
    expect(result.line).toBe(0);
  });

  it('still attaches the note when a link precedes it', () => {
    const result = parse(['A --> B', 'note on link: ok']);
    expect((result as ParseRefusal).refused).toBeUndefined();
    expect((result as ClassDiagramAST).relationships[0]?.linkNote).toBe('ok');
  });
});
