/**
 * The error diagram, end to end (SI6).
 *
 * The property under test is the one the three retired divergences were each
 * bending themselves to preserve: **a malformed document still renders.**
 * PlantUML never throws at its caller — it draws the error. Every expectation
 * below was verified against the reference jar
 * (`oracle/dist/plantuml-oracle.jar -tsvg -pipe`).
 *
 * @see src/core/error/PSystemError.ts
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/error/PSystemError.java
 */

import { describe, expect, it } from 'vitest';
import { renderSync, renderAll } from '../../src/index.js';
import { DeterministicMeasurer } from '../../src/core/measurer-deterministic.js';
import { WELCOME_MARKER, expectErrorDiagram } from '../helpers/error-diagram.js';

const measurer = new DeterministicMeasurer();
const opts = { measurer };

/** The text content of every `<text>` element, in document order, unescaped. */
function textOf(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>(?:<tspan[^>]*>)?([^<]*)/gu)].map((m) =>
    (m[1] ?? '').replace(/&lt;/gu, '<').replace(/&gt;/gu, '>').replace(/&amp;/gu, '&'),
  );
}

const ORPHAN_ENDIF = '@startuml\nBob -> Alice : hi\n!endif\n@enduml\n';

describe('error diagram — an orphan !endif (jar: "No if related to this endif")', () => {
  it('renders an SVG instead of throwing', () => {
    const svg = renderSync(ORPHAN_ENDIF, opts);
    expect(svg.trimStart()).toMatch(/^<svg/);
  });

  it("reports the jar's message", () => {
    expectErrorDiagram(renderSync(ORPHAN_ENDIF, opts), 'No if related to this endif');
  });

  it('locates the failure on the source line that carries it', () => {
    // `!endif` is line 3 (1-based), which is what the jar prints.
    expect(textOf(renderSync(ORPHAN_ENDIF, opts))).toContain('[From string (line 3) ]');
  });

  it('lists the executed source up to and including the offending line', () => {
    const texts = textOf(renderSync(ORPHAN_ENDIF, opts));
    const from = texts.indexOf('[From string (line 3) ]');
    expect(texts.slice(from + 1)).toEqual([
      // A whitespace-ONLY label has its spaces swapped for NBSP before
      // emission (`DriverTextSvg.java:115-116`, ported into
      // `core/svg-shapes.ts#text`). Re-verified directly against the pinned
      // oracle jar on this exact input: every blank line in the error
      // diagram's source listing comes back as U+00A0, not U+0020. This
      // expectation previously read `' '`, which was the port's own
      // pre-port behaviour rather than the jar's.
      ' ',
      '@startuml',
      'Bob -> Alice : hi',
      '!endif',
      // The jar emits this WITHOUT a leading space, and so does this port now:
      // `StringUtils.trin` is ported into `core/svg-shapes.ts#emittedTextForm`.
      // (A previous revision of this test recorded the leading space as a
      // known gap; closing `trin` closed it too.)
      'No if related to this endif',
    ]);
  });

  it('waves the offending line in red, and only that line', () => {
    const svg = renderSync(ORPHAN_ENDIF, opts);
    const waved = [...svg.matchAll(/<text[^>]*text-decoration="wavy underline"[^>]*>(?:<tspan>)?([^<]*)/gu)];
    expect(waved.map((m) => m[1])).toEqual(['!endif']);
  });

  it('stacks the Welcome block on a source of fewer than 5 lines', () => {
    expect(renderSync(ORPHAN_ENDIF, opts)).toContain(WELCOME_MARKER);
  });

  it('omits the Welcome block on a longer source, as the jar does', () => {
    const long = [
      '@startuml',
      'Bob -> Alice : hi',
      'Bob -> Alice : hi2',
      'Bob -> Alice : hi3',
      'Bob -> Alice : hi4',
      '!endif',
      '@enduml',
    ].join('\n');
    const svg = renderSync(long, opts);
    expectErrorDiagram(svg, 'No if related to this endif');
    expect(svg).not.toContain(WELCOME_MARKER);
    expect(textOf(svg)).toContain('[From string (line 6) ]');
  });
});

describe('error diagram — a known function called with an uncoverable arity', () => {
  // Jar: `Function not found BOLD`.
  it('renders the error diagram naming the function', () => {
    const source = '@startuml\n!define BOLD(x) <b>##x##</b>\nAlice -> Bob : BOLD(x,y)\n@enduml\n';
    const svg = renderSync(source, opts);
    expectErrorDiagram(svg, 'Function not found BOLD');
    expect(textOf(svg)).toContain('[From string (line 3) ]');
  });
});

describe('error diagram — an unclosed !ifdef IS an error (a720bdd)', () => {
  // `CodeIteratorIf#peek` (CodeIteratorIf.java:73-80): at the end of the body a
  // still-open `!if`/`!ifdef` throws `<keyword> without !endif`, reported on the
  // line left open. Jar (a720bdd, `scripts/oracle-render.sh`) draws exactly
  // that for both sources below, whatever the condition evaluated to.
  it('reports the unclosed !ifdef when it is TRUE', () => {
    const source = '@startuml\n!define FOO\n!ifdef FOO\nAlice -> Bob\n@enduml\n';
    const svg = renderSync(source, opts);
    expectErrorDiagram(svg, '!ifdef without !endif');
    expect(textOf(svg)).toContain('[From string (line 3) ]');
  });

  // `PSystemErrorPreprocessor` counts `BlockUml#data` -- the interpreter's
  // result list plus the error line `TimLoader#load` appends
  // (BlockUml.java:156-161,195-196, TimLoader.java:79-80), not the raw block
  // (PSystemError.java:261-262). Jar (a720bdd): the 5-line TRUE source keeps
  // @startuml, Alice -> Bob, @enduml + the error line = 4, so it shows Welcome.
  it('shows the Welcome block by the preprocessed line count (4 < 5)', () => {
    const source = '@startuml\n!define FOO\n!ifdef FOO\nAlice -> Bob\n@enduml\n';
    expect(renderSync(source, opts)).toContain(WELCOME_MARKER);
  });

  // Jar (a720bdd): 7 raw lines, 4 preprocessed + the error line = 5 -> no Welcome.
  it('omits the Welcome block when the preprocessed lines plus the error reach 5', () => {
    const source = '@startuml\n!define FOO\n!define BAR\n!ifdef FOO\nAlice -> Bob\nBob -> Alice\n@enduml\n';
    const svg = renderSync(source, opts);
    expectErrorDiagram(svg, '!ifdef without !endif');
    expect(svg).not.toContain(WELCOME_MARKER);
  });

  it('reports the unclosed !ifdef when it is FALSE', () => {
    const svg = renderSync('@startuml\n!ifdef NEVER\nAlice -> Bob\n@enduml\n', opts);
    expectErrorDiagram(svg, '!ifdef without !endif');
    expect(textOf(svg)).toContain('[From string (line 2) ]');
  });
});

describe('error diagram — the render entry points never throw', () => {
  it('renderSync returns an error diagram rather than propagating', () => {
    expect(() => renderSync(ORPHAN_ENDIF, opts)).not.toThrow();
  });

  it('renderAll returns an error diagram rather than propagating', async () => {
    const svgs = await renderAll(ORPHAN_ENDIF, opts);
    expect(svgs).toHaveLength(1);
    expectErrorDiagram(svgs[0]!, 'No if related to this endif');
  });

  it('an unresolvable include is an error diagram naming the path', () => {
    const svg = renderSync('@startuml\n!include missing.puml\n@enduml\n', opts);
    expectErrorDiagram(svg, 'includeStore');
  });
});
