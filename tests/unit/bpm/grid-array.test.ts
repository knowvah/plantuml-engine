import { describe, expect, it } from 'vitest';
import { renderDrawableToFragment } from '../../../src/core/klimt/document-shell-fragment.js';
import type { TextBlock } from '../../../src/core/klimt/shape/TextBlock.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { SkinParamFresh } from '../../../src/core/skin/SkinParamFresh.js';
import { BpmBranch } from '../../../src/diagrams/bpm/BpmBranch.js';
import { BpmElement } from '../../../src/diagrams/bpm/BpmElement.js';
import { BpmElementType } from '../../../src/diagrams/bpm/BpmElementType.js';
import { BpmEventAdd } from '../../../src/diagrams/bpm/BpmEventAdd.js';
import { BpmEventGoto } from '../../../src/diagrams/bpm/BpmEventGoto.js';
import { BpmEventResume } from '../../../src/diagrams/bpm/BpmEventResume.js';
import { Where } from '../../../src/diagrams/bpm/ConnectorPuzzle.js';
import { GridArray } from '../../../src/diagrams/bpm/GridArray.js';
import { docked, merge, replay } from './helpers/grid-replay.js';
import { stringBounderOf } from './helpers/string-bounder.js';

const measurer = new DeterministicMeasurer();

/** The block at the document's `same(10)` margin: the jar's `<g>` body. */
function body(block: TextBlock): string {
  const shifted: TextBlock = {
    drawU: (ug) => block.drawU(ug.apply(new UTranslate(10, 10))),
    calculateDimension: (sb) => block.calculateDimension(sb),
  };
  return renderDrawableToFragment(shifted, { uid: 'bpm', width: 0, height: 0, measurer }).body;
}

/** `bibuka-01`'s `<g>` body (test-results/dot-cache/unknown/bibuka-01-novu361/in.svg). */
const BIBUKA_01 =
  '<line x1="10" y1="10" x2="135.425" y2="10" style="stroke:#000;stroke-width:1;"/>' +
  '<line x1="10" y1="10" x2="10" y2="72" style="stroke:#000;stroke-width:1;"/>' +
  '<line x1="60" y1="10" x2="60" y2="72" style="stroke:#000;stroke-width:1;"/>' +
  '<ellipse cx="35" cy="41" rx="10" ry="10" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;"/>' +
  '<line x1="45" y1="41" x2="55" y2="41" style="stroke:#F00;stroke-width:1;"/>' +
  '<rect x="75" y="25" width="45.425" height="32" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;" rx="12.5" ry="12.5"/>' +
  '<text x="85" y="44.333" fill="#000" font-size="12" textLength="25.425">login</text>' +
  '<line x1="65" y1="41" x2="75" y2="41" style="stroke:#F00;stroke-width:1;"/>';

describe('GridArray (GridArray.java)', () => {
  it('bibuka-01: [START, login] with START east and login west draws the jar body', () => {
    const skin = new SkinParamFresh();
    const start = new BpmElement(null, BpmElementType.START);
    start.append(Where.EAST);
    const login = new BpmElement(null, BpmElementType.DOCKED_EVENT, 'login');
    login.append(Where.WEST);
    const array = new GridArray(skin, 1, 2);
    array.setData(0, 0, start);
    array.setData(0, 1, login);
    expect(body(array)).toBe(BIBUKA_01);
    const dim = array.calculateDimension(stringBounderOf(measurer));
    expect([dim.getWidth(), dim.getHeight()]).toEqual([50 + 30 + 20 + Math.fround(25.425), 62]);
    expect([array.getLines(), array.getRows(), array.toString()]).toEqual([1, 2, '1x2']);
    expect(array.getData(0, 1)).toBe(login);
  });

  it('zufefe-09 via Grid#toArray: a merge after a box, its red west stub', () => {
    const array = replay([docked('login'), merge('20')]).toArray(new SkinParamFresh());
    expect(body(array)).toContain(
      '<polygon points="162.425,29,174.425,41,162.425,53,150.425,41,162.425,29" fill="#FEFECE" style="stroke:#A80036;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>' +
        '<line x1="140.425" y1="41" x2="150.425" y2="41" style="stroke:#F00;stroke-width:1;"/>',
    );
  });

  it('skips empty cells when sizing and leaves no closing grid line (cov-merge-only shape)', () => {
    const array = new GridArray(new SkinParamFresh(), 2, 2);
    array.setData(0, 0, new BpmElement(null, BpmElementType.START));
    const svg = body(array);
    expect(svg.match(/stroke:#000/g)).toHaveLength(4);
    expect(array.getData(1, 1)).toBeNull();
  });
});

describe('BpmBranch and the events (BpmBranch.java, BpmEvent*.java)', () => {
  it('names the entry and exit merges from its uid', () => {
    const branch = new BpmBranch(3);
    expect(branch.getEntryElement().getId()).toBe('$branchA3');
    expect(branch.getEntryElement().getType()).toBe(BpmElementType.MERGE);
    expect(branch.getElseElement().getId()).toBe('$branchB3');
    const resume = branch.getResumeEntryEvent();
    const goTo = branch.getGoToEndEvent();
    expect(resume).toBeInstanceOf(BpmEventResume);
    expect((resume as BpmEventResume).getId()).toBe('$branchA3');
    expect(goTo).toBeInstanceOf(BpmEventGoto);
    expect((goTo as BpmEventGoto).getId()).toBe('$branchB3');
    expect([branch.incAndGetCounter(), branch.incAndGetCounter()]).toEqual([2, 3]);
    const element = new BpmElement('x', BpmElementType.MERGE);
    expect(new BpmEventAdd(element).getElement()).toBe(element);
  });
});
