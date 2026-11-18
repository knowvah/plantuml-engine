/**
 * Authored state-note embed gate (sne, issue #168, D5): a `{{ … }}` in a state note is one `EmbeddedDiagram` atom
 * (`EntityImageNote.java:114-118` -> `BodyEnhanced2.java:84-134` -> `CreoleParser.java:146-170`), drawn at
 * `(marginX1, marginY)` (`Opale.java:127`). Rows are exactly the `.puml` files under
 * `tests/fixtures/state-note-embed/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * - A ZERO row renders at 0 diffs and draws the jar's `<image>`s: the same count, and each one's width, height, x
 *   and y. Both are asserted on their own because `compareSvg` stops at a `childCount` mismatch, so a missing
 *   `<image>` can show as only a few diffs.
 * - An ERROR row is a jar error page we also draw (conformant by the 2026-10-10 ruling): both pages carry no diagram
 *   type and name the same `(line N)`, and ours says `Syntax Error?` as the jar's does.
 * - An OPEN row's diff count never rises, and its `reason` names the issue that holds its residual.
 *
 * Rendered as the survey renders (`scripts/svg-parity-survey.ts`): `renderSync` + `DeterministicMeasurer`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from './compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/state-note-embed');

/** Row -> the jar's `<image>` count. */
const ZERO: Readonly<Record<string, number>> = {
  // 2026-11-17 sne T1b: entity notes (the planning probes, then the authored separator, top, colour and salt rows).
  composite: 1,
  free: 1,
  lr: 1,
  mixed: 1,
  sep: 1,
  two: 2,
  'sep-title': 1,
  'sep-double': 1,
  top: 1,
  color: 1,
  salt: 1,
  // 2026-11-17 sne T2a: `note on link` (flat, inside a composite, merged with a label, a separator and text).
  link: 1,
  'link-composite': 1,
  'link-label': 1,
  'link-mixed': 1,
  // 2026-11-17 sne T2b: an `end note` inside a closed embed stays in the note.
  'embed-endnote': 1,
};

/** Row -> the 1-based `(line N)` both error pages name. 2026-11-17 sne T2b: a multi-line note whose reader runs out
 *  (`PSystemCommandFactory.java:268-286`), through an unterminated `{{` or no closer at all. */
const ERROR: Readonly<Record<string, number>> = {
  open: 3,
  'open-free': 3,
  'open-link': 5,
  'open-plain': 3,
};

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, { readonly maxDiffs: number; readonly reason: string }>> = {};

const IMAGE = /<image\b[^>]*>/g;
const ATTR = (name: string): RegExp => new RegExp(`\\s${name}="([^"]*)"`);
/** Each `<image>`'s `width height x y`, in document order. */
function images(svg: string): string[] {
  return (svg.match(IMAGE) ?? []).map((tag) =>
    ['width', 'height', 'x', 'y'].map((a) => ATTR(a).exec(tag)?.[1] ?? '?').join(' '),
  );
}

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

function measure(row: string): { diffs: number; ours: string[]; jar: string[] } {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  return { diffs: compareSvg(ours, jar, 'deterministic').diffs.length, ours: images(ours), jar: images(jar) };
}

describe('state-note embed authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...Object.keys(ZERO), ...Object.keys(ERROR), ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8')).toContain('<svg');
  });

  it('every open row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });
});

describe('state-note embed authored fixtures — zero rows', () => {
  for (const [row, count] of Object.entries(ZERO)) {
    it(`${row}: 0 diffs and the jar's ${String(count)} <image>, each at its size and place`, () => {
      const m = measure(row);
      expect(m.jar).toHaveLength(count);
      expect(m.ours).toEqual(m.jar);
      expect(m.diffs).toBe(0);
    });
  }
});

const DIAGRAM_TYPE = /^<svg[^>]*\sdata-diagram-type="/;
const ERROR_LINE = /\(line (\d+)\)/;

function errorPage(svg: string): { drawn: boolean; line: number | undefined; syntax: boolean } {
  const line = ERROR_LINE.exec(svg)?.[1];
  return {
    drawn: DIAGRAM_TYPE.test(svg),
    line: line === undefined ? undefined : Number(line),
    syntax: svg.includes('Syntax Error?'),
  };
}

describe('state-note embed authored fixtures — error rows (2026-10-10 error-page rule)', () => {
  for (const [row, line] of Object.entries(ERROR)) {
    it(`${row}: the jar and we both answer Syntax Error? at line ${String(line)}`, () => {
      const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
      const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
        measurer: new DeterministicMeasurer(),
      });
      const expected = { drawn: false, line, syntax: true };
      expect(errorPage(jar)).toEqual(expected);
      expect(errorPage(ours)).toEqual(expected);
    });
  }
});

describe('state-note embed authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      expect(measure(row).diffs).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
