/**
 * Authored svgDimensionStyle gate (sds, issue #193, D3): `TextBlockExporter#createUGraphicSVG` hands
 * `skinParam.svgDimensionStyle()` to the `SvgOption` whenever the exporter has a skin param
 * (`TextBlockExporter.java:418-421`), with no diagram-type branch; `SkinParam#svgDimensionStyle` is
 * `!valueIs("svgdimensionstyle", "false")`, `equalsIgnoreCase` (`SkinParam.java:1216-1218,367-369`); and
 * `SvgGraphics#finalizeRootAttributes` writes the root `style`, `width` and `height` only when that option is true,
 * the `viewBox` unconditionally (`SvgGraphics.java:795-799`). Rows are exactly the `.puml` files under
 * `tests/fixtures/svg-dimension-style/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * The compared value is the root `<svg …>` open tag with its `xmlns` attributes stripped: the feature is three root
 * attributes, and body parity is the survey's job.
 *
 * - An EXACT row's root tag equals the jar's.
 * - An OPEN row's root tag equals the jar's once our `style`, `width` and `height` are removed (the #193 gap and
 *   nothing else), and its `reason` names the issue and the task that closes it.
 *
 * Rendered as the survey renders (`scripts/svg-parity-survey.ts`): `renderSync` + `DeterministicMeasurer`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/svg-dimension-style');

/** Rows whose root tag equals the jar's. */
const EXACT: readonly string[] = [
  // 2026-11-25 sds T1: already right at the base. Class returns the flag (`class/renderer-document.ts`), the
  // unchromed description path sets it on its klimt option (`description/renderer.ts`), `true` and unset keep the
  // attributes, and files/json/yaml keep them in the jar too (their factories read no `skinparam`, D5).
  'ctl-class',
  'ctl-class-title',
  'ctl-object',
  'ctl-usecase',
  'ctl-component',
  'ctl-true',
  'ctl-default',
  'ctl-files',
  'ctl-json',
  'ctl-yaml',
  // 2026-11-25 sds T2: sequence (puma, teoz, `newpage`), state, activity and the chromed description path return the
  // flag beside `lengthAdjust` (`TextBlockExporter.java:418-421`), and every chrome path spreads it to the shell.
  'seq',
  'seq-title',
  'seq-newpage',
  'teoz',
  'state',
  'state-title',
  'act',
  'act-title',
  'desc-title',
  // 2026-11-25 sds T2 push-forward, the same reading: `scale 1.5` and `skinparam dpi` (the root scales, its
  // attributes still go), `handwritten`, `diagramBorderColor`, `!pragma svginteractive`, a warning banner, `mode dark`,
  // the flag spelled `FALSE` (`valueIs` is `equalsIgnoreCase`, `SkinParam.java:367-369`), and a scaled class.
  'seq-scale',
  'act-dpi',
  'seq-handwritten',
  'act-border',
  'seq-interactive',
  'act-warning',
  'seq-dark',
  'state-upper',
  'ctl-class-scale',
  // 2026-11-25 sds T3: timing, gantt, mindmap, wbs, salt, nwdiag and legacy activity read `svgDimensionStyle()` from
  // their `SkinParam` port (`SkinParam.java:1216-1218`) onto the klimt option and the fragment, beside
  // `getlengthAdjust()` (`TextBlockExporter.java:419-420`), including a scaled, a `FALSE` and a titled document.
  'timing',
  'gantt',
  'mindmap',
  'wbs',
  'salt',
  'nwdiag',
  'actleg',
  'wbs-scale',
  'gantt-upper',
  'mindmap-title',
  // 2026-11-25 sds T4: ebnf (and regex, which re-exports ebnf's port), board, cheneer, wire, packetdiag and chart, the
  // same reading as T3, including a scaled ebnf.
  'ebnf',
  'regex',
  'board',
  'chen',
  'wire',
  'packet',
  'chart',
  'ebnf-scale',
  // 2026-11-25 sds T4 push-forward control: `@starthcl` keeps the attributes in the jar as json/yaml do (D5).
  'ctl-hcl',
];

/** Row -> the issue and task that will make it EXACT. */
const OPEN: Readonly<Record<string, { readonly reason: string }>> = {};

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

/** The root open tag, `xmlns` attributes stripped. */
function rootOf(svg: string): string {
  const m = /<svg[^>]*>/.exec(svg);
  return m === null ? '' : m[0].replace(/ xmlns(:\w+)?="[^"]*"/g, '');
}

/** The root tag without the three attributes `SvgGraphics.java:795-799` makes conditional. */
function withoutDims(root: string): string {
  return root
    .replace(/ style="[^"]*"/, '')
    .replace(/ width="[^"]*"/, '')
    .replace(/ height="[^"]*"/, '');
}

function roots(row: string): { readonly ours: string; readonly jar: string } {
  const jar = rootOf(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8'));
  const ours = rootOf(
    renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), { measurer: new DeterministicMeasurer() }),
  );
  return { ours, jar };
}

describe('svgDimensionStyle authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...EXACT, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8')).toContain('<svg');
  });

  it('every open row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });
});

describe('svgDimensionStyle authored fixtures — exact rows', () => {
  for (const row of EXACT) {
    it(`${row}: root tag equals the jar's`, () => {
      const { ours, jar } = roots(row);
      expect(ours).toBe(jar);
    });
  }
});

describe('svgDimensionStyle authored fixtures — open rows differ only in the three attributes', () => {
  for (const [row, { reason }] of Object.entries(OPEN)) {
    it(`${row}: root tag equals the jar's without style/width/height (${reason})`, () => {
      const { ours, jar } = roots(row);
      expect(ours, `${row} now matches the jar: move it to EXACT`).not.toBe(jar);
      expect(withoutDims(ours)).toBe(jar);
    });
  }
});
