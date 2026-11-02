/**
 * T2f (D7): the authored document-background rows whose chrome inherits the
 * document gradient, measured against the jar's oracle (`document-background.ts`,
 * `renderSync` under the jar-compatible composition). The shrink-only pin
 * (`oracle/goldens/document-background.json`) cannot hold these at zero until
 * it is re-pinned; this file does.
 *
 * The jar shares one id: `SvgGraphics#createSvgGradient` keys its `gradients`
 * map on the two colours and the policy (`klimt/drawing/svg/SvgGraphics.java:367-371`).
 */
import { describe, expect, it } from 'vitest';

import {
  firstDbgDiffs,
  measureDbgRow,
  readDbgFixture,
  renderDbgMarkup,
} from '../oracle/svg-conformance/document-background.js';

const LINEAR_GRADIENT_RE = /<linearGradient /g;

const CONFORMANT_ROWS = [
  'activity-title-gradient',
  'class-chrome-gradient',
  'class-mainframe-gradient',
  'class-title-gradient',
  'class-title-gradient-override',
  'class-title-skinparam-gradient',
  'class-title-solid',
  'component-title-gradient',
  'json-title-gradient',
  'object-title-gradient',
  'sequence-chrome-gradient',
  'sequence-mainframe-gradient',
  'sequence-title-gradient',
  'sequence-title-skinparam-gradient',
  'sequence-title-solid',
  'state-title-gradient',
  'state-title-solid',
  'usecase-title-gradient',
  'yaml-title-gradient',
] as const;

describe('document-background chrome rows (T2f)', () => {
  it.each(CONFORMANT_ROWS)('%s matches the jar', (row) => {
    expect(firstDbgDiffs(row, 5)).toEqual([]);
    expect(measureDbgRow(row)).toEqual({ conformant: true, diffCount: 0 });
  });

  it.each(['sequence-chrome-gradient', 'class-chrome-gradient', 'sequence-mainframe-gradient'] as const)(
    '%s mints one def, shared by the document rect and every chrome block',
    (row) => {
      const { markup, golden } = readDbgFixture(row);
      const ours = renderDbgMarkup(markup);
      expect(ours.match(LINEAR_GRADIENT_RE)?.length).toBe(1);
      expect(golden.match(LINEAR_GRADIENT_RE)?.length).toBe(1);
      const id = /<linearGradient [^>]*id="([^"]+)"/.exec(ours)?.[1];
      const urls = ours.match(/url\(#[^)]+\)/g) ?? [];
      expect(urls.length).toBe((golden.match(/url\(#[^)]+\)/g) ?? []).length);
      expect(new Set(urls)).toEqual(new Set([`url(#${String(id)})`]));
    },
  );
});
