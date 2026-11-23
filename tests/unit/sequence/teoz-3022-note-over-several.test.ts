/**
 * plantuml#3022, upstream `cf9e4d42a`: `PlayingSpace#cannotPushApart`
 * (`teoz/PlayingSpace.java:289-311`) compares a note over several
 * participants against its rightmost participant, so `C -> A` beside
 * `& note over B, C` no longer pushes every participant right.
 *
 * Sources are upstream's `vega/nonreg/group3022` and the `group3019` case the
 * commit re-baselined (YAML header dropped); the `.svg` beside each is the
 * jar's render via `scripts/oracle-render.sh` (b066ee08c, 2026-11-23).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const DIR = new URL('../../fixtures/teoz-3022/', import.meta.url);
const read = (name: string) => readFileSync(new URL(name, DIR), 'utf8');

describe.each(['reversed_message_note_over_two_participants', 'note_over_two_participants_written_left_first'])(
  'note over several beside a tile it cannot clear (#3022): %s',
  (name) => {
    it('draws the jar SVG', () => {
      const ours = renderSync(read(`${name}.puml`), { measurer: new DeterministicMeasurer() });
      expect(compareSvg(ours, read(`${name}.svg`), 'deterministic').diffs).toEqual([]);
    });
  },
);
