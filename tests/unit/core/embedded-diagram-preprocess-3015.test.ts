/**
 * plantuml#3015, upstream `58b9b3d53ee` (#3016): the body of a one-line
 * embedded diagram (`{{\n!theme crt-amber\n...\n}}`) is preprocessed. The
 * constructor builds `new BlockUml(noDefinitions(pathSystem), pathSystem,
 * strings, Defines.createEmpty(), previous, StandardCharsets.UTF_8)`
 * (`EmbeddedDiagram.java:89-103`), and a non-null `DefinitionsContainer` makes
 * `BlockUml` run `TimLoader` (`BlockUml.java:149-160`). The port gets the same
 * effect because the nested `renderSync` (`src/index.ts`, `prepareBlock`)
 * preprocesses its source.
 *
 * The jar blocks compare against `tests/fixtures/embedded-diagram-3015/*.svg`,
 * rendered by `scripts/oracle-render.sh` (1.2026.11beta1, a720bdd): upstream's
 * `vega/nonreg/group3015` sources verbatim, plus one authored probe
 * (`outer-variable`). `mono_line_note_theme` and `multi_line_note_theme` carry
 * `!pragma layout smetana`; their oracles were rendered from a copy with that
 * line removed, the capture policy's strip (`stripLayoutPragma`, DIVERGENCES.md
 * "`!pragma layout smetana|vizjs` -- always laid out with graphviz"). This test
 * reads every source through the same strip (`stripLayoutPragma`,
 * `scripts/dot-sync-drilldown.ts`), as the corpus capture writes `in.puml`
 * (`scripts/capture-oracle-cache.ts`), and with the survey's include store
 * (`fixtureIncludeStore`), which serves `!theme crt-amber`.
 *
 * `compareSvg` exempts an `<image>`'s `xlink:href` bytes (`compare.ts:374`), so
 * each case also decodes the `data:image/svg+xml;base64` payloads and compares
 * them pairwise.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { stripLayoutPragma } from '../../../scripts/dot-sync-drilldown.js';

const DIR = new URL('../../fixtures/embedded-diagram-3015/', import.meta.url);

const SVG_DATA_URI = /data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/gu;

/** The decoded `data:image/svg+xml` documents embedded in `svg`, in document order. */
function nestedPayloads(svg: string): string[] {
  return [...svg.matchAll(SVG_DATA_URI)].map((m) => Buffer.from(m[1]!, 'base64').toString('utf8'));
}

function render(name: string): string {
  const source = stripLayoutPragma(readFileSync(new URL(`${name}.puml`, DIR), 'utf8'));
  return renderSync(source, { measurer: new DeterministicMeasurer(), includeStore: fixtureIncludeStore() });
}

function jar(name: string): string {
  return readFileSync(new URL(`${name}.svg`, DIR), 'utf8');
}

function diffs(ours: string, theirs: string): string[] {
  return compareSvg(ours, theirs, 'deterministic').diffs.map((d) => JSON.stringify(d));
}

/** upstream's five `group3015` cases, then the authored probe. */
const FIXTURES = [
  'mono_line_note_theme',
  'mono_line_arrow_theme',
  'mono_line_arrow_variable',
  'mono_line_arrow_plain',
  'multi_line_note_theme',
  'outer-variable',
] as const;

describe('one-line embed preprocessing (plantuml#3015, 58b9b3d53ee) against the jar', () => {
  for (const name of FIXTURES) {
    it(`${name}: the page is zero-diff`, () => {
      expect(diffs(render(name), jar(name))).toEqual([]);
    });

    it(`${name}: every nested payload is zero-diff`, () => {
      const ours = nestedPayloads(render(name));
      const theirs = nestedPayloads(jar(name));
      expect(ours).toHaveLength(1);
      expect(theirs).toHaveLength(ours.length);
      ours.forEach((payload, i) => expect(diffs(payload, theirs[i]!), `payload ${i}`).toEqual([]));
    });
  }

  it('outer-variable: the outer pass substitutes $who before the embed is collected', () => {
    for (const svg of [render('outer-variable'), jar('outer-variable')]) {
      expect(nestedPayloads(svg)[0]).toContain('>Carol</text>');
    }
  });
});

/** The error page's `[From <description> (line N) ]` line (`PSystemError.java:282`) and the box drawn behind it. */
function fromLine(page: string): { text: string; textLength: string; boxWidth: string } {
  const text = /<text[^>]*textLength="([^"]+)"[^>]*>(\[From [^<]*)<\/text>/u.exec(page);
  const box = /<rect x="5" y="203" width="([^"]+)"/u.exec(page);
  expect(text, 'no [From …] line').not.toBeNull();
  expect(box, 'no box behind the [From …] line').not.toBeNull();
  return { text: text![2]!, textLength: text![1]!, boxWidth: box![1]! };
}

/**
 * The jar's embedded error page draws its own version banner (`PlantUML version $version$ …`); ours draws
 * `plantuml-engine version …`. Whether an embedded page may carry our banner is not decided here (edp D5), so that
 * one text element is set aside. It is the page's 18th `<text>`, the line just above `[From …]`.
 */
const BANNER_TEXT_PATH = 'svg/g[1]/text[18]/';

describe('an embed\'s source is labelled "block" (BlockUml.java:119-127)', () => {
  // EmbeddedDiagram.from -> BlockUml.convert(strings) (EmbeddedDiagram.java:146-148) labels every line
  // `new LineLocationImpl("block", null)` (BlockUml.java:121); PSystemError prints it (PSystemError.java:282).
  it('embed-syntax-error: the page is zero-diff', () => {
    expect(diffs(render('embed-syntax-error'), jar('embed-syntax-error'))).toEqual([]);
  });

  it('embed-syntax-error: the nested error page prints [From block (line 2) ], sized as the jar sizes it', () => {
    const [ours] = nestedPayloads(render('embed-syntax-error'));
    const [theirs] = nestedPayloads(jar('embed-syntax-error'));
    expect(fromLine(ours!)).toEqual(fromLine(theirs!));
    expect(fromLine(ours!).text).toBe('[From block (line 2) ]');
  });

  it('embed-syntax-error: the nested error page is zero-diff apart from the version banner (D5)', () => {
    const [ours] = nestedPayloads(render('embed-syntax-error'));
    const [theirs] = nestedPayloads(jar('embed-syntax-error'));
    expect(diffs(ours!, theirs!).filter((d) => !d.includes(`"path":"${BANNER_TEXT_PATH}`))).toEqual([]);
  });

  it('the same body as a top-level diagram still prints [From string (line 2) ]', () => {
    const page = renderSync('@startuml\nfoo bar baz qux\n@enduml\n', { measurer: new DeterministicMeasurer() });
    expect(fromLine(page).text).toBe('[From string (line 2) ]');
  });
});
