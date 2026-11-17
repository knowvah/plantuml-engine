/**
 * Authored emoji edge artwork gate (eea, issue #150): upstream builds every `SvekEdge` creole block -- the label
 * (`SvekEdge.java:286-299`) and both quantifiers (`:328-340`) -- with one `skinParam`, and `StripeSimple#addEmoji`
 * (`StripeSimple.java:245-250`) reaches the global `Emoji.retrieve` table (`Emoji.java:111-118`), so a `<:name:>` on
 * an edge draws its artwork (`AtomEmoji.java:66-68`, `Emoji.java:175-182`). Rows are exactly the `.puml` files under
 * `tests/fixtures/emoji-edge-artwork/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * - A ZERO row renders at 0 diffs.
 * - An OPEN row's diff count never rises, and its `reason` names the issue (and, before it lands, the task) that holds
 *   its residual.
 *
 * Rendered as the survey renders (`scripts/svg-parity-survey.ts`): `renderSync` + `DeterministicMeasurer`, with the
 * emoji asset store.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { compareSvg } from './compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/emoji-edge-artwork');

/** Rows at 0 diffs. */
const ZERO: readonly string[] = [
  // 2026-11-16 eea T1a: control. A stereotype's emoji draws through `descAtomOps`, which already takes the artwork
  // (`EntityImageDescriptionEmoji.ts#drawEmojiAtom`).
  'desc-stereo-emoji',
  // 2026-11-16 eea T1b: the registry-backed atom resolver carries the emoji store, and `buildTextBlock`'s `drawAtoms`
  // draws an `AtomEmoji` through `Emoji#drawU` (`AtomEmoji.java:66-68`, `Emoji.java:175-182`), reaching every label
  // `SvekEdge.java:286-299` builds: tinted, sized, multi-line, magic-arrowed, usecase and left-to-right.
  'desc-edge-emoji-only',
  'desc-edge-emoji-colour',
  'desc-edge-emoji-size',
  'desc-edge-emoji-multiline',
  'desc-edge-emoji-magic-arrow',
  'usecase-edge-emoji',
  'component-ltr-edge-emoji',
  // 2026-11-16 eea T1c: both quantifiers are built with the label's `skinParam` (`SvekEdge.java:328-340`), so they draw
  // with the label's resolver, and the table is sized with the label sizer's (`SvekEdge.java:504-507`).
  'desc-quantifier-emoji',
  'desc-quantifier-sprite',
  // 2026-11-16 eea T1d: legacy activity's label reads the diagram's `skinParam` (`SvekEdge.java:286-299`), so its
  // `SvekEdge` input takes the registry's resolver: the emoji draws its artwork and the sprite draws.
  'legacy-activity-edge-emoji',
  'legacy-activity-edge-sprite',
];

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, { readonly maxDiffs: number; readonly reason: string }>> = {
  // 2026-11-16 eea T2: unchanged by T1b-T1d, each `XX` control 0 (D3), filed. None goes through `SvekEdge`'s label.
  'class-edge-emoji': { maxDiffs: 58, reason: '#199: the class edge label measures <:name:> as text' },
  'class-quantifier-emoji': { maxDiffs: 97, reason: '#199: the class quantifier measures <:name:> as text' },
  'desc-cluster-title-emoji': { maxDiffs: 39, reason: '#200: a group title draws the glyph and moves the tab' },
  'state-edge-emoji': { maxDiffs: 3, reason: '#201: the state label block takes no emoji atom' },
  // 2026-11-16 eea T1b/T2: a note body goes through `buildDesc`/`descAtomOps`, not `buildTextBlock`, and gets no emoji
  // artwork (`leaf-sizing.ts#buildNoteBody`); the `XX` control of each is 0, filed.
  'desc-note-emoji': { maxDiffs: 9, reason: '#202: buildNoteBody passes descAtomOps no emoji artwork' },
  'desc-edge-emoji-note': { maxDiffs: 9, reason: '#202: buildNoteBody passes descAtomOps no emoji artwork' },
};

const assetStore = buildEmojiAssetsStore();

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

function diffCount(row: string): number {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
    assetStore,
  });
  return compareSvg(ours, jar, 'deterministic').diffs.length;
}

describe('emoji edge artwork authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8')).toContain('<svg');
  });

  it('every open row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });
});

describe('emoji edge artwork authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs`, () => {
      expect(diffCount(row)).toBe(0);
    });
  }
});

describe('emoji edge artwork authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      expect(diffCount(row)).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
