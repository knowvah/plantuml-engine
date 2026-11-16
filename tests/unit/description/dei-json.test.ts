/**
 * dei-T2b: `json` in the description factory (`DescriptionDiagramFactory.java:130-131`), drawn by the core
 * `EntityImageJson` (`GeneralImageBuilder.java:186-187`). Oracles are the jar's: the authored `dei-json-*` goldens
 * and the corpus row `unknown/gacoxo-93-guti295`.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { setLayoutInputObserver, type LayoutInputEvent } from '../../../src/core/graph-layout.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import type { DescriptionDiagramAST } from '../../../src/diagrams/description/ast.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { renderFixtureSurveyStyle } from '../../oracle/svg-conformance/render-fixture.js';

const AUTHORED = 'oracle/goldens/svg-description/component';
const TOLERANCE_CLASS = 'deterministic';

function diffsOf(puml: string, golden: string): unknown[] {
  const { svg } = renderFixtureSurveyStyle(readFileSync(puml, 'utf8'), new DeterministicMeasurer());
  return compareSvg(svg, readFileSync(golden, 'utf8'), TOLERANCE_CLASS).diffs;
}

function parse(...lines: string[]): ReturnType<typeof parseDescription> {
  return parseDescription({ lines } as never);
}

function ast(...lines: string[]): DescriptionDiagramAST {
  const result = parse(...lines);
  if (!('nodes' in result)) throw new Error(`refused: ${JSON.stringify(result)}`);
  return result;
}

describe('json leaves against the jar', () => {
  it.each(['dei-json-top', 'dei-json-single', 'dei-json-group'])('%s draws the jar bytes', (slug) => {
    expect(diffsOf(`${AUTHORED}/${slug}/in.puml`, `${AUTHORED}/${slug}/golden.svg`)).toEqual([]);
  });

  it('unknown/gacoxo-93-guti295: json in a database in a cloud, groups left open', () => {
    const dir = 'test-results/dot-cache/unknown/gacoxo-93-guti295';
    expect(diffsOf(`${dir}/in.puml`, `${dir}/in.svg`)).toEqual([]);
  });
});

describe('the json DOT node (EntityImageJson.java:240-242, SvekNode.java:268-296)', () => {
  it('is a shape=plaintext row table sized by the image: 96.85 x 126 for dei-json-top', () => {
    const events: LayoutInputEvent[] = [];
    setLayoutInputObserver((e) => events.push(e));
    try {
      renderFixtureSurveyStyle(readFileSync(`${AUTHORED}/dei-json-top/in.puml`, 'utf8'), new DeterministicMeasurer());
    } finally {
      setLayoutInputObserver(undefined);
    }
    const json = events[0]!.graph.nodes.find((n) => n.portRows !== undefined)!;
    expect(json).toMatchObject({ shape: 'plaintext', portRows: [], height: 126 });
    expect(json.width).toBeCloseTo(96.85, 3);
  });
});

describe('CommandCreateJson / CommandCreateJsonSingleLine in description', () => {
  it('reads the body up to the closing brace that completes the JSON (CommandCreateJson.java:155-162)', () => {
    const tree = ast('json J {', '"a": { "b": 1', '}', '}', 'component C');
    const json = tree.nodes.find((n) => n.id === 'J')!;
    expect(json.leafType).toBe('json');
    expect(json.jsonValue).toEqual({
      kind: 'object',
      entries: [{ key: 'a', value: { kind: 'object', entries: [{ key: 'b', value: { kind: 'scalar', value: 1 } }] } }],
    });
    expect(tree.nodes.map((n) => n.id)).toEqual(['J', 'C']);
  });

  it('takes a display, a stereotype and a colour on the header', () => {
    const json = ast('json "Shown" as J <<s>> #red {', '"k": "v"', '}').nodes[0]!;
    expect(json).toMatchObject({ id: 'J', display: 'Shown', stereotype: ['s'], color: '#red', leafType: 'json' });
  });

  it('a single-line json takes its value on the line', () => {
    expect(ast('json J [1, 2]').nodes[0]!.jsonValue).toEqual({
      kind: 'array',
      items: [
        { kind: 'scalar', value: 1 },
        { kind: 'scalar', value: 2 },
      ],
    });
  });

  it('a json on a name that exists is an execution error (CommandCreateJson.java:141-142)', () => {
    expect(parse('component J', 'json J {', '"a": 1', '}')).toMatchObject({
      kind: 'execution',
      message: 'JSON already exists: J',
    });
  });

  it('a single-line json whose data does not parse is "Bad data" (CommandCreateJsonSingleLine.java:149-150)', () => {
    expect(parse('json J {"a": }')).toMatchObject({ kind: 'execution', message: 'Bad data' });
  });

  it('a block the document ends inside is a syntax error (CommandMultilines2 stays OK_PARTIAL)', () => {
    expect(parse('json J {', '"a": 1')).toMatchObject({ kind: 'syntax' });
  });

  it('drops quoted comment lines from the body (MultilinesStrategy.REMOVE_STARTING_QUOTE)', () => {
    expect(ast('json J {', "' a comment", '"a": 1', '}').nodes[0]!.jsonValue).toEqual({
      kind: 'object',
      entries: [{ key: 'a', value: { kind: 'scalar', value: 1 } }],
    });
  });
});
