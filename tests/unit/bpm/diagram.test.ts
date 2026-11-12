import { describe, expect, it } from 'vitest';
import { renderDrawableToFragment } from '../../../src/core/klimt/document-shell-fragment.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import type { TextBlock } from '../../../src/core/klimt/shape/TextBlock.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { BpmDiagram } from '../../../src/diagrams/bpm/BpmDiagram.js';
import { parseBpm } from '../../../src/diagrams/bpm/BpmDiagramFactory.js';
import { GridArray } from '../../../src/diagrams/bpm/GridArray.js';
import { sourceOf } from '../../helpers/utility-single-line.js';

const measurer = new DeterministicMeasurer();

function bpm(body: string): BpmDiagram {
  const parsed = parseBpm(sourceOf(`@startbpm\n${body}\n@endbpm`));
  if (!(parsed instanceof BpmDiagram)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed;
}

/** The block drawn at the document's `same(10)` margin, as the jar's `<g>` body. */
function body(block: TextBlock): string {
  const shifted: TextBlock = {
    drawU: (ug) => block.drawU(ug.apply(new UTranslate(10, 10))),
    calculateDimension: (sb) => block.calculateDimension(sb),
  };
  return renderDrawableToFragment(shifted, { uid: 'bpm', width: 0, height: 0, measurer }).body;
}

/** Hlines and vlines of the grid: the black lines. */
function gridShape(svg: string): { hlines: number; vlines: number } {
  const black = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" style="stroke:#000;/g)];
  return {
    hlines: black.filter((m) => m[2] === m[4]).length,
    vlines: black.filter((m) => m[1] === m[3]).length,
  };
}

const BIBUKA_01 =
  '<line x1="10" y1="10" x2="135.425" y2="10" style="stroke:#000;stroke-width:1;"/>' +
  '<line x1="10" y1="10" x2="10" y2="72" style="stroke:#000;stroke-width:1;"/>' +
  '<line x1="60" y1="10" x2="60" y2="72" style="stroke:#000;stroke-width:1;"/>' +
  '<ellipse cx="35" cy="41" rx="10" ry="10" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;"/>' +
  '<line x1="45" y1="41" x2="55" y2="41" style="stroke:#F00;stroke-width:1;"/>' +
  '<rect x="75" y="25" width="45.425" height="32" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;" rx="12.5" ry="12.5"/>' +
  '<text x="85" y="44.333" fill="#000" font-size="12" textLength="25.425">login</text>' +
  '<line x1="65" y1="41" x2="75" y2="41" style="stroke:#F00;stroke-width:1;"/>';

describe('BpmDiagram#getTextBlock against the jar', () => {
  it('bibuka-01 (:login;) draws the jar body byte for byte, 126x63 before the margins', () => {
    const block = bpm(':login;').getTextBlock();
    expect(body(block)).toBe(BIBUKA_01);
    expect(block).toBeInstanceOf(GridArray);
    expect((block as GridArray).toString()).toBe('1x2');
  });

  it('zufefe-09 (a merge after a box): the diamond and its red stub', () => {
    const svg = body(bpm(':login;\n20:<+>').getTextBlock());
    expect(svg).toContain(
      '<polygon points="162.425,29,174.425,41,162.425,53,150.425,41,162.425,29" fill="#FEFECE" style="stroke:#A80036;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>' +
        '<line x1="140.425" y1="41" x2="150.425" y2="41" style="stroke:#F00;stroke-width:1;"/>',
    );
  });

  it.each([
    ['rikosu-08', ':login;\nnew branch\n:show new message1;\nelse\n:show new task2;\nend branch', 2, 6],
    ['zaxuce-77', ':login;\n20:<+>\n:show new message1;\n30:<+>\nresume 20\n:show new task2;', 2, 6],
    [
      'loxeke-95',
      ':login;\nnew branch\n:show new message1;\nelse\n:show new task2;\nend branch\nnew branch\n:Accept Task;\nelse\n:nothing;\nelse\nnew branch\n:read message;\nelse\n:dummy;\nend branch\nend branch\n:logout;',
      4,
      15,
    ],
  ])('%s cleans to %i lines x %i columns', (_slug, source, lines, cols) => {
    expect(gridShape(body(bpm(source).getTextBlock()))).toEqual({ hlines: lines, vlines: cols });
  });

  it('records branch ids from the event count: $branchA1, the exit merge on the second arm', () => {
    const d = bpm(':a;\nnew branch\n:b;\nelse\n:c;\nelse\n:d;\nend branch');
    expect(d.getEvents().map((e) => e.constructor.name)).toEqual([
      'BpmEventAdd',
      'BpmEventAdd',
      'BpmEventAdd',
      'BpmEventAdd',
      'BpmEventResume',
      'BpmEventAdd',
      'BpmEventGoto',
      'BpmEventResume',
      'BpmEventAdd',
      'BpmEventGoto',
    ]);
    expect(d.getDescription()).toBe('(Bpm Diagram)');
    expect(d.getDiagramType()).toBe('BPM');
  });
});

describe('the jar crashes, so the port throws (D5)', () => {
  it.each([
    ['cov-resume-unknown', ':a;\nresume nope', 'NullPointerException'],
    ['cov-goto-unknown', ':a;\ngoto nope', 'NullPointerException'],
    ['cov-branch-no-else', ':a;\nnew branch\n:b;\nend branch', 'NullPointerException'],
    ['cov-goto-self-merge', 'm:<+>\ngoto m', 'IllegalStateException'],
  ])('%s throws %s from getTextBlock', (_slug, source, error) => {
    expect(() => bpm(source).getTextBlock()).toThrow(error);
  });

  it('cov-else-orphan throws NoSuchElementException when else executes', () => {
    expect(() => parseBpm(sourceOf('@startbpm\n:a;\nelse\n@endbpm'))).toThrow('NoSuchElementException');
    expect(() => parseBpm(sourceOf('@startbpm\n:a;\nend branch\n@endbpm'))).toThrow('NoSuchElementException');
  });
});

describe('BpmDiagramFactory commands (no CommonCommands)', () => {
  it('parses each command shape, case-insensitively (cov-keywords-case)', () => {
    const d = bpm(':a;\nm_1.@x:<+>\nn<+>\nNew Branch\n:b;\nELSE\n:c;\nEnd  Branch\nRESUME m_1.@x\nGoTo n');
    expect(d.getEvents()).toHaveLength(11);
  });

  it.each([
    ['a blank line', ':a;\n\n:b;', 2],
    ['title', 'title Hello\n:a;', 1],
    ['skinparam', 'skinparam x y\n:a;', 1],
    ['a space before <+>', 'a <+>', 1],
  ])('refuses %s with Syntax Error?', (_name, source, consumed) => {
    expect(parseBpm(sourceOf(`@startbpm\n${source}\n@endbpm`))).toMatchObject({
      refused: true,
      message: 'Syntax Error?',
      consumed,
    });
  });
});
