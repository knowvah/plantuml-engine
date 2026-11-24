/**
 * Authored hidden-note-host gate (hnh, issue #204, D4): a note hides together with its host, in every engine that
 * registers `CommandHideShow2` (class, object, description, state, legacy activity).
 *
 * The rule has two halves. The flag: `CucaDiagram#isHidden(leaf)` (`net/atmp/CucaDiagram.java:778-794`) gives a
 * `NOTE` with exactly one non-invisible link to a non-note (`isNoteWithSingleLinkAttachedTo`, `:835-853`) the hidden
 * flag of the entity at the other end, read through the diagram's `isHidden` (so the host's parents do not count);
 * any other note folds `hide`/`show` by itself. `#isRemoved` (`:796-812`) is the same for `remove`. The draw:
 * `SvekResult#drawU` draws a hidden node and a hidden edge through `UHidden` (`svek/SvekResult.java:82-101`), so a
 * hidden note draws nothing (`EntityImageNote` writes no comment) and a hidden link writes only its comment.
 *
 * Rows are the `.puml` files under `tests/fixtures/hidden-note-host/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`).
 *
 * - A ZERO row has 0 `compareSvg` diffs and a comment sequence equal to the jar's (`svg-comments.ts`, D5).
 * - An OPEN row's diff count and comment mismatch never rise, and its `reason` names #204 (with the task that owns
 *   it), the side-finding issue holding it, or the Smetana ruling (2026-08-09).
 *
 * Rendered as `scripts/svg-parity-survey.ts` renders a row, and as `measurements/measure.mts` measured the probes:
 * `renderSync` + `withJarCompatibleStyleInput` + `DeterministicMeasurer` + the survey asset and include stores +
 * `filename: 'in.puml'` + the ELK backend from `prepareElkOnce()`.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { ElkBackend } from '../../../src/index.js';
import { combineAssetStores, renderSync } from '../../../src/index.js';
import { CI_RENDER_BUDGET_MS } from '../../helpers/ci-test-budgets.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { buildSpriteAssetsStore } from '../../helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../helpers/utility-assets-store.js';
import { compareSvg } from './compare.js';
import { prepareElkOnce } from './render-fixture-class.js';
import { commentMismatch, firstCommentDiff, svgComments } from './svg-comments.js';

vi.setConfig({ testTimeout: CI_RENDER_BUDGET_MS });

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '../../fixtures/hidden-note-host');

/** Rows with 0 diffs and the jar's comments. */
const ZERO: readonly string[] = [
  // 2026-11-23 hnh T1: controls. `remove` already takes the note with its host (`CucaDiagram.java:796-812`), so a
  // removed note never becomes a node.
  'hnh-desc-remove-host',
  'hnh-remove-floating',
  'hnh-remove-host',
  'hnh-remove-lone-note',
  'hnh-state-remove-host',
  // 2026-11-23 hnh T1: controls. `show` after `hide`, a note with two links (it folds by itself), a note whose host is
  // hidden only by its package (`isHidden(other)` reads the host's own fold), `hide @unlinked` with no note, a note on
  // a link, a `-[hidden]-` link to a note (`Link.hidden` counts, `WithLinkType.java:100-101`), and `hide N` on a note
  // that passes its flag to a visible host: the jar draws each note, and so do we.
  'hnh-hidden-link-to-note',
  'hnh-hide-note-name',
  'hnh-hide-show-host',
  'hnh-hide-unlinked',
  'hnh-host-in-hidden-package',
  'hnh-note-on-link',
  'hnh-note-two-links',
  // 2026-11-23 hnh T1: controls. A member tip is `LeafType.TIPS`, never delegated (`CucaDiagram.java:836-837`), so it
  // draws on a hidden host (D2).
  'hnh-tips-on-member',
  'hnh-tips-visible',
  // 2026-11-23 hnh T1: controls. Description under ELK draws the note on a hidden host as the jar does
  // (`MyElkDrawing.java:163` checks only `isRemoved`); a lone description note under `hide N`; the legacy activity
  // control with nothing hidden; a lone state note under `hide N`.
  'hnh-desc-elk-hide-host',
  'hnh-desc-hide-lone-note',
  'hnh-lap-visible',
  'hnh-state-hide-lone-note',
  // 2026-11-23 hnh T2a: class and object. A note takes its hidden host's flag (`CucaDiagram.java:778-794`), or is
  // hidden by its own `hide N` / `hide @unlinked`, and draws through `UHidden` (`SvekResult.java:82-90`): nothing. A
  // link touching it writes only its comment (`Link.java:458-459`).
  'hnh-floating-note',
  'hnh-hide-by-stereotype',
  'hnh-hide-by-tag',
  'hnh-hide-host',
  'hnh-hide-lone-note',
  'hnh-hide-note-two-links',
  'hnh-hide-unlinked-note',
  'hnh-multiline-note',
  'hnh-object-host',
  'hnh-two-notes',
  // 2026-11-23 hnh T2a push-forward, each with its jar oracle: `skinparam strictUmlStyle true` (no opale,
  // `GraphvizImageBuilder.java:133-134`) hides the note with its host; a two-link note between two hidden classes is
  // drawn (it folds by itself) and both links write only their comments.
  'hnh-strict-uml-hide-host',
  'hnh-two-links-both-hidden',
  // 2026-11-23 hnh T2b: description. `hide N` on a note that passes its flag to a visible host keeps it (dot and ELK,
  // whose `isHidden(linkId)` reads the same set); a `-[hidden]-` link counts (`WithLinkType.java:100-101`), so a note
  // with one keeps two links and stays when `remove A` takes the other end. Push-forward, each with its jar oracle: a
  // delegated note ignores its own `remove N` (`CucaDiagram.java:800-802`), and `remove @unlinked` keeps two
  // components joined only by a `-[hidden]-` link (`Entity.java:477` skips only an invisible `LinkType`).
  'hnh-desc-elk-hide-note-name',
  'hnh-desc-hidden-link-remove',
  'hnh-desc-hide-note-name',
  'hnh-desc-remove-note-name',
  'hnh-desc-remove-unlinked-hidden-link',
  // 2026-11-23 hnh T2c: state. A note on a hidden state takes its flag (`CucaDiagram.java:778-794`); the state renderer
  // already skips a hidden note node, opale or flat (`SvekResult.java:85`).
  'hnh-state-hide-host',
  'hnh-state-multiline-note',
];

interface OpenRow {
  readonly maxDiffs: number;
  readonly maxComments: number;
  readonly reason: string;
}

/** Row -> the diffs and comment mismatch it may not exceed, and the issue that holds it. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-23 hnh T2a: a note on a hidden class now draws nothing, so only Smetana's geometry is left (ruling
  // 2026-08-09). The diff count rose 16 -> 86 (score 95 -> 86): before T2a the extra note `<g>` paired against class
  // A's group, and two `[childCount]` diffs masked A's coordinates; now A pairs and each dot-vs-Smetana coordinate counts.
  'hnh-smetana-hide-host': {
    maxDiffs: 86,
    maxComments: 0,
    reason: 'ruling 2026-08-09: Smetana geometry only (dot-engine, not Smetana)',
  },
  // 2026-11-23 hnh T2a push-forward: a member tip folds its own `hide`/`show` (`hide *` hides it, its host shown or
  // not); whether the port should follow is #277.
  'hnh-tips-hide-star': { maxDiffs: 1, maxComments: 0, reason: '#277: a tip ignores its own hide fold' },
  'hnh-tips-hide-star-show-host': { maxDiffs: 1, maxComments: 0, reason: '#277: a tip ignores its own hide fold' },
  // 2026-11-23 hnh T1: class side findings. The opale choice drops note-to-note and group links before it counts
  // (#270); `!pragma layout elk` refuses notes in class diagrams (#271).
  'hnh-hidden-link-remove': { maxDiffs: 2, maxComments: 1, reason: '#270: the opale choice skips note-to-note links' },
  'hnh-note-to-note': { maxDiffs: 2, maxComments: 1, reason: '#270: the opale choice skips note-to-note links' },
  'hnh-note-to-note-visible': {
    maxDiffs: 95,
    maxComments: 1,
    reason: '#270: the opale choice skips note-to-note links',
  },
  'hnh-elk-hide-host': { maxDiffs: 6, maxComments: 2, reason: '#271: class ELK refuses notes' },
  // 2026-11-23 hnh T2b: description. A note takes its hidden host's flag (`isNoteWithSingleLinkAttachedTo` in
  // `effectiveHiddenIds`), so it draws nothing; the one comment left is the hidden host's `entity X`, #272. The push-
  // forward probes: `show N` does not undo the host's flag, and a usecase inside a `rectangle` hides its note too.
  'hnh-desc-actor-host': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-desc-floating-note': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-desc-hide-by-stereotype': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-desc-hide-host': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-desc-show-note-hidden-host': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-desc-two-notes': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-uc-hide-host': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-uc-in-rectangle-hide-host': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  // 2026-11-23 hnh T1: description side findings. A hidden entity writes no comment (#272); `hide @unlinked` hides
  // nothing (#273).
  'hnh-desc-hidden-link-to-note': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-desc-host-in-hidden-package': { maxDiffs: 0, maxComments: 1, reason: '#272: no entity comment when hidden' },
  'hnh-desc-hide-unlinked-note': { maxDiffs: 15, maxComments: 0, reason: '#273: hide @unlinked hides nothing' },
  // 2026-11-23 hnh T2c: state. A note takes its hidden host's flag (`state-directives.ts#applyingIds`) and draws
  // nothing; the comment pair left is the note's link name, `__note_1` where the jar writes `GMN7`, #275.
  'hnh-state-two-notes': { maxDiffs: 0, maxComments: 2, reason: '#275: the note link comment names __note_N' },
  // 2026-11-23 hnh T1: state and legacy activity side findings, each reproduced without a note.
  'hnh-state-host-in-hidden-composite': {
    maxDiffs: 25,
    maxComments: 0,
    reason: '#274: a hidden composite changes the document size',
  },
  'hnh-lap-hide-host': { maxDiffs: 4, maxComments: 0, reason: '#276: a hidden entity drops out of the document size' },
};

const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());
let elk: ElkBackend | undefined;

beforeAll(async () => {
  elk = await prepareElkOnce();
});

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

function measure(row: string): { diffs: number; comments: number; firstDiff: string } {
  const ours = renderSync(
    readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'),
    withJarCompatibleStyleInput({
      measurer: new DeterministicMeasurer(),
      assetStore,
      includeStore: fixtureIncludeStore(),
      filename: 'in.puml',
      elk,
    }),
  );
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const { diffs } = compareSvg(ours, jar, 'svg');
  const oursComments = svgComments(ours);
  const jarComments = svgComments(jar);
  return {
    diffs: diffs.length,
    comments: commentMismatch(oursComments, jarComments),
    firstDiff: `${JSON.stringify(diffs[0] ?? null)} | ${firstCommentDiff(oursComments, jarComments)}`,
  };
}

describe('hidden-note-host authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(existsSync(join(FIXTURES, `${row}.svg`)), `${row}: no jar .svg`).toBe(true);
  });

  it('every open row names its issue or the Smetana ruling', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+|ruling 2026-08-09/.test(v.reason))).toEqual([]);
  });
});

describe('hidden-note-host authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs and the jar's comments`, () => {
      const { diffs, comments, firstDiff } = measure(row);
      expect({ diffs, comments }, `${row}: ${firstDiff}`).toEqual({ diffs: 0, comments: 0 });
    });
  }
});

describe('hidden-note-host authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, maxComments, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)}, comments <= ${String(maxComments)} (${reason})`, () => {
      const { diffs, comments, firstDiff } = measure(row);
      expect(diffs + comments, `${row}: now 0 diffs and the jar's comments — move it to ZERO`).toBeGreaterThan(0);
      expect(diffs, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxDiffs);
      expect(comments, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxComments);
    });
  }
});
