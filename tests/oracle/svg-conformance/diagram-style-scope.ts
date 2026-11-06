/**
 * Diagram-style-scope fixtures and measurement (diagram-style-scope T0b, D1-D6).
 *
 * `tests/fixtures/diagram-style-scope/<engine>__<group>-<case>.puml` is an
 * authored row (`plans/diagram-style-scope/tools/gen-rows.py`); the jar's
 * `.svg` beside it (rendered with `scripts/oracle-render.sh`, never
 * hand-edited) is its oracle. The values under test are upstream's
 * `StyleSignatureBasic.of(<snames>).getMergedStyle(builder).value(<PName>)`
 * (`style/StyleSignatureBasic.java:194-220`, `style/StyleStorage.java:102-116`).
 *
 * Measurement reuses the document-background helpers verbatim: the same
 * jar-compatible composition (`renderSync` + `withJarCompatibleStyleInput` +
 * `DeterministicMeasurer`), the same `compareSvg`, the same shrink-only rule.
 * Only the root, the pin path and the names differ. The pin
 * (`oracle/goldens/diagram-style-scope.json`) is shrink-only.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { installErrorPageFlag } from '../../../scripts/lib/survey-error-verdict.js';
import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';

import {
  auditDbgPin,
  checkDbgRow,
  firstDbgDiffs,
  listDbgRows,
  measureDbgRow,
  readDbgFixture,
  readDbgPin,
  renderDbgMarkup,
  rowFromDiffCount,
  THROW_DIFF_COUNT,
  type DbgPin,
  type DbgRow,
} from './document-background.js';

const HERE = dirname(fileURLToPath(import.meta.url));

/** `tests/fixtures/diagram-style-scope`. */
export const DIAGRAM_STYLE_SCOPE_ROOT: string = join(HERE, '../../fixtures/diagram-style-scope');

/** `oracle/goldens/diagram-style-scope.json`. */
export const DIAGRAM_STYLE_SCOPE_PIN_PATH: string = join(HERE, '../../../oracle/goldens/diagram-style-scope.json');

export { THROW_DIFF_COUNT };

/**
 * A row's verdict: `conformant` means zero diffs against the jar's oracle.
 * `stockError` marks a row the STOCK jar errors on (smc D5, checked with
 * `plans/style-mode-cascades/measurements/stock-check.mjs`): the error-page
 * rule of `docs/svg-conformance.md` "Error pages" then applies.
 */
export interface ScopeRow extends DbgRow {
  readonly stockError?: true;
}

/** The pin file's shape: `{ rows: Record<string, ScopeRow> }`. */
export interface ScopePin extends DbgPin {
  readonly rows: Readonly<Record<string, ScopeRow>>;
}

/** The diff a stock-error row costs when we draw a diagram instead of an error page (survey `firstDiff: 'error-page'`). */
const ERROR_PAGE_DIFF = 1;

/** Row ids (`<engine>__<group>-<case>`) with a `.puml` AND a `.svg` in `root`, sorted. */
export function listScopeRows(root: string = DIAGRAM_STYLE_SCOPE_ROOT): string[] {
  return listDbgRows(root);
}

/** The row's markup and the jar's oracle SVG. */
export function readScopeFixture(
  row: string,
  root: string = DIAGRAM_STYLE_SCOPE_ROOT,
): { markup: string; golden: string } {
  return readDbgFixture(row, root);
}

/**
 * Renders `row` and compares with its oracle; a throwing render is {@link THROW_DIFF_COUNT}.
 * With `stockError` (smc D5) the error-page rule applies, as in the survey
 * (`scripts/lib/survey-error-verdict.ts#errorPageVerdict`): our error page is
 * conformant whatever its bytes; a diagram where the jar errors counts its
 * bytes plus {@link ERROR_PAGE_DIFF}, so the rule never hides a drawing.
 */
export function measureScopeRow(
  row: string,
  root: string = DIAGRAM_STYLE_SCOPE_ROOT,
  render: (markup: string) => string = renderDbgMarkup,
  stockError = false,
): ScopeRow {
  if (!stockError) return measureDbgRow(row, root, render);
  const errorPage = installErrorPageFlag();
  try {
    const raw = measureDbgRow(row, root, render);
    const diffCount = errorPage() ? 0 : raw.diffCount + ERROR_PAGE_DIFF;
    return { ...rowFromDiffCount(diffCount), stockError: true };
  } finally {
    setErrorPageObserver(undefined);
  }
}

/** The first `limit` diff lines for `row` (path, ours, jar) -- for `diff-row.mts`. */
export function firstScopeDiffs(
  row: string,
  limit: number,
  root: string = DIAGRAM_STYLE_SCOPE_ROOT,
  render: (markup: string) => string = renderDbgMarkup,
): string[] {
  return firstDbgDiffs(row, limit, root, render);
}

/** Pure: a row from a raw diff count. */
export function scopeRowFromDiffCount(diffCount: number): ScopeRow {
  return rowFromDiffCount(diffCount);
}

export function readScopePin(path: string = DIAGRAM_STYLE_SCOPE_PIN_PATH): ScopePin {
  return readDbgPin(path);
}

/** Pure: fixtures on disk with no pin row, and pin rows naming no fixture on disk. */
export function auditScopePin(
  onDisk: readonly string[],
  pinned: readonly string[],
): { unpinned: string[]; orphaned: string[] } {
  return auditDbgPin(onDisk, pinned);
}

/** Pure shrink-only check: `diffCount` may only fall; a conformant row stays conformant. */
export function checkScopeRow(row: string, pinned: ScopeRow, live: ScopeRow): { ok: boolean; message: string } {
  return checkDbgRow(row, pinned, live);
}
