/**
 * scr-T1c -- `skinparam noteBackgroundColor` becomes `note { BackGroundColor }` (`FromSkinparamToStyle.java:125`),
 * which the attached and floating note (`EntityImageNote.java:100-104`) and the link note (`EntityImageNoteLink.java:
 * 61-65`) both merge. Expected fills are the jar's, from the `state__noteskin-*` oracles.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const DIR = 'tests/fixtures/diagram-style-scope';

function noteFills(row: string): string[] {
  const svg = renderSync(readFileSync(`${DIR}/${row}.puml`, 'utf8'), { measurer: new DeterministicMeasurer() });
  // The note outline and fold are the only filled paths (a transition path is `fill="none"`).
  const fills = (svg.match(/<path [^>]*>/g) ?? []).map((p) => /fill="([^"]*)"/.exec(p)?.[1] ?? '');
  return fills.filter((f) => f !== 'none');
}

describe('state notes under skinparam noteBackgroundColor', () => {
  it.each(['state__noteskin-bg', 'state__noteskin-bg-floating', 'state__noteskin-bg-link'])(
    '%s fills the outline and the fold #BBB',
    (row) => {
      expect(noteFills(row)).toEqual(['#BBB', '#BBB']);
    },
  );
});
