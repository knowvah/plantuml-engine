/**
 * Document-background fixtures and measurement (document-background-paint T0b, D5).
 *
 * `tests/fixtures/document-background/<engine>-<case>.puml` is an authored row;
 * the jar's `.svg` beside it (rendered with `scripts/oracle-render.sh`, never
 * hand-edited) is its oracle. The paint under test is upstream's
 * `SvgGraphics` constructor (`SvgGraphics.java:176-192`, `paintBackcolor`
 * `:207-212`, root attributes `:800-822`), reached through
 * `TitledDiagram#calculateBackColor` (`TitledDiagram.java:280-289`).
 *
 * A row is measured in the conformance harness' jar-compatible mode:
 * `renderSync` + `withJarCompatibleStyleInput` + `DeterministicMeasurer`, the
 * same composition `files.authored.ratchet.test.ts` mirrors. The pin
 * (`oracle/goldens/document-background.json`) is shrink-only.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { compareSvg } from './compare.js';

const HERE = dirname(fileURLToPath(import.meta.url));

const PUML_EXT = '.puml';
const SVG_EXT = '.svg';

/** `tests/fixtures/document-background`. */
export const DOCUMENT_BACKGROUND_ROOT: string = join(HERE, '../../fixtures/document-background');

/** `oracle/goldens/document-background.json`. */
export const DOCUMENT_BACKGROUND_PIN_PATH: string = join(HERE, '../../../oracle/goldens/document-background.json');

/**
 * The `diffCount` a row carries when `renderSync` throws: no SVG exists to
 * compare, so the row is pinned at a fixed ceiling any real render falls below.
 * Shrink-only then lets the row improve the moment the throw is fixed.
 */
export const THROW_DIFF_COUNT = 1_000_000;

export interface DbgRow {
  readonly conformant: boolean;
  readonly diffCount: number;
}

export interface DbgPin {
  readonly rows: Readonly<Record<string, DbgRow>>;
}

/** Row ids (`<engine>-<case>`) with a `.puml` AND a `.svg` in `root`, sorted. */
export function listDbgRows(root: string = DOCUMENT_BACKGROUND_ROOT): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((f) => f.endsWith(PUML_EXT) && existsSync(join(root, f.slice(0, -PUML_EXT.length) + SVG_EXT)))
    .map((f) => f.slice(0, -PUML_EXT.length))
    .sort();
}

/** The row's markup and the jar's oracle SVG. */
export function readDbgFixture(
  row: string,
  root: string = DOCUMENT_BACKGROUND_ROOT,
): { markup: string; golden: string } {
  return {
    markup: readFileSync(join(root, row + PUML_EXT), 'utf8'),
    golden: readFileSync(join(root, row + SVG_EXT), 'utf8'),
  };
}

/**
 * The Twemoji artwork the jar reads off its classpath (`Emoji.java:175-181`).
 * Every `@startfiles` row draws one per entry (`FEntry.java:124-129`); without
 * the store the emoticon draws nothing and the row measures a missing element
 * unrelated to the background. Same store `render-fixture-files.ts` uses.
 */
const ASSET_STORE = buildEmojiAssetsStore();

/** Our render of `markup`, under the harness' jar-compatible composition. */
export function renderDbgMarkup(markup: string): string {
  return renderSync(
    markup,
    withJarCompatibleStyleInput({ measurer: new DeterministicMeasurer(), assetStore: ASSET_STORE }),
  );
}

/** Pure: a row from a raw diff count. `conformant` means zero diffs. */
export function rowFromDiffCount(diffCount: number): DbgRow {
  return { conformant: diffCount === 0, diffCount };
}

/**
 * Renders `row` and compares with its oracle. A throwing render is encoded as
 * {@link THROW_DIFF_COUNT}, non-conformant.
 */
export function measureDbgRow(
  row: string,
  root: string = DOCUMENT_BACKGROUND_ROOT,
  render: (markup: string) => string = renderDbgMarkup,
): DbgRow {
  const { markup, golden } = readDbgFixture(row, root);
  let ours: string;
  try {
    ours = render(markup);
  } catch {
    return rowFromDiffCount(THROW_DIFF_COUNT);
  }
  return rowFromDiffCount(compareSvg(ours, golden, 'deterministic').diffs.length);
}

/** The first `limit` diff lines for `row` (path, actual, expected) -- for `diff-row.mts`. */
export function firstDbgDiffs(
  row: string,
  limit: number,
  root: string = DOCUMENT_BACKGROUND_ROOT,
  render: (markup: string) => string = renderDbgMarkup,
): string[] {
  const { markup, golden } = readDbgFixture(row, root);
  let ours: string;
  try {
    ours = render(markup);
  } catch (err) {
    return [`renderSync threw: ${err instanceof Error ? err.message : String(err)}`];
  }
  return compareSvg(ours, golden, 'deterministic')
    .diffs.slice(0, limit)
    .map((d) => `${d.path}: ours=${d.actual} jar=${d.expected}`);
}

export function readDbgPin(path: string = DOCUMENT_BACKGROUND_PIN_PATH): DbgPin {
  return JSON.parse(readFileSync(path, 'utf8')) as DbgPin;
}

/** Pure: fixtures on disk with no pin row, and pin rows naming no fixture on disk. */
export function auditDbgPin(
  onDisk: readonly string[],
  pinned: readonly string[],
): { unpinned: string[]; orphaned: string[] } {
  return {
    unpinned: onDisk.filter((r) => !pinned.includes(r)),
    orphaned: pinned.filter((r) => !onDisk.includes(r)),
  };
}

/**
 * Pure shrink-only check: `diffCount` may only fall, and a pinned-conformant
 * row stays conformant.
 */
export function checkDbgRow(row: string, pinned: DbgRow, live: DbgRow): { ok: boolean; message: string } {
  if (pinned.conformant && !live.conformant) {
    return { ok: false, message: `${row}: conformant row LOST conformance (now ${String(live.diffCount)} diffs).` };
  }
  if (live.diffCount > pinned.diffCount) {
    return {
      ok: false,
      message: `${row}: diffCount ROSE -- pin=${String(pinned.diffCount)}, now=${String(live.diffCount)}. Re-pin only from a fresh measurement after a deliberate change.`,
    };
  }
  return { ok: true, message: `${row}: diffCount ${String(live.diffCount)} (pin ${String(pinned.diffCount)}).` };
}
