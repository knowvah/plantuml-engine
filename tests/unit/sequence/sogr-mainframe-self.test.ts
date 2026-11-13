/**
 * sogr T3c: `C -> C ++--` is TWO life events bound to one message, in
 * `manageActivations`' order, `spec.charAt(0)` then `spec.charAt(2)`
 * (`CommandArrow.java:445-466`): ACTIVATE p2 then DEACTIVATE p1. For a self
 * message with C already live (`B -> C ++`), `LiveBoxes#getStairs`
 * (`LiveBoxes.java:276-336`) therefore draws a level-2 box from the arrow's
 * end (y 173) to the deactivate step (y 186), inside C's 67 high level-1 box.
 * The port stored both as fields and took `--++`, closing the outer box early.
 * Oracle: `test-results/dot-cache/sequence/teoz-ng-001-1/in.svg`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence, sequenceFixtureOptions } from '../../oracle/svg-conformance/render-fixture-sequence.js';

const ROW_DIR = 'test-results/dot-cache/sequence/teoz-ng-001-1';
const LEVEL1_C = /<rect x="127.994" y="133" width="10" height="(\d+)"/;
const LEVEL2_C = /<rect x="132.994" y="(\d+)" width="10" height="(\d+)"/;
const ROOT_WIDTH = /<svg[^>]* width="(\d+)px"/;

describe('self message with ++-- on an already live participant (teoz-ng-001-1)', () => {
  const jar = readFileSync(`${ROW_DIR}/in.svg`, 'utf8');
  const ours = renderFixtureSequence(
    readFileSync(`${ROW_DIR}/in.puml`, 'utf8'),
    new DeterministicMeasurer(),
    sequenceFixtureOptions(),
  );

  it('the jar draws C level 1 as 67 high and level 2 as 13 high at y 173', () => {
    expect([LEVEL1_C.exec(jar)?.[1], LEVEL2_C.exec(jar)?.[1], LEVEL2_C.exec(jar)?.[2]]).toEqual(['67', '173', '13']);
  });

  it('draws the same live boxes', () => {
    expect([LEVEL1_C.exec(ours)?.[1], LEVEL2_C.exec(ours)?.[1], LEVEL2_C.exec(ours)?.[2]]).toEqual(['67', '173', '13']);
  });

  it('is 223 wide, as the jar', () => {
    expect([ROOT_WIDTH.exec(jar)?.[1], ROOT_WIDTH.exec(ours)?.[1]]).toEqual(['223', '223']);
  });
});
