/**
 * Authored actor-line-routing gate (alr, issue #191): the sequence participant family refuses a colour capture that
 * cannot be a bare colour, as the jar does, so the factory chain hands the source to the next factory.
 *
 * `CommandParticipantA` … `A4` end in `ColorParser.exp1()` (`sequencediagram/command/CommandParticipantA.java:59-76`).
 * `CommandParticipant#executeArg` returns for an existing CODE before it reads the colour (`CommandParticipant.java:
 * 145-149`); for a new one it hands the whole capture to the throwing `HColorSet#getColor` (`:183-185`,
 * `klimt/color/HColorSet.java:69-76`), which `SingleLineCommand2.java:176-179` turns into `badColor()`, `No such color`
 * with score 10 (`command/CommandExecutionResult.java:85-86`). The sequence factory fails and `PSystemBuilder` tries
 * the next: description (class for `entity`) reads the colour through `Colors` and draws.
 *
 * Rows are the `.puml` files under `tests/fixtures/actor-line-routing/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`).
 *
 * - A ZERO row (the jar draws) has 0 `compareSvg` diffs and a comment sequence equal to the jar's.
 * - An ERROR_PAGE row passes the D7 bar of the brief (#190 D5, reused): ours is an error page
 *   (`setErrorPageObserver` fires once), its label text and `(line N)` equal the jar's, the Welcome block is present
 *   exactly when the jar's is, and every `compareSvg` diff sits on the footer the 2026-10-10 error-page ruling exempts
 *   (docs/svg-conformance.md "Error pages"; DIVERGENCES.md "Error pages print this port's version"): the `<text>`
 *   whose jar value starts `PlantUML version`, the `<text>` whose jar value starts `[From `, and the `<rect>` drawn
 *   behind it. The footer is found by content, never by index.
 * - An OPEN row never rises above its diff count, and names its reason. A `#283` row (no Welcome block) also holds
 *   D7 items 1 to 4 once ours is an error page; a `drawn` row is held as drawn by ruling.
 *
 * Rendered as `scripts/svg-parity-survey.ts` renders a row, and as `plans/hidden-note-host/measurements/measure.mts`
 * measures: `renderSync` + `withJarCompatibleStyleInput` + `DeterministicMeasurer` + the survey asset and include
 * stores + `filename: 'in.puml'` + the ELK backend from `prepareElkOnce()`.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';
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
import type { NormalizedNode } from './normalize.js';
import { normalizeSvg } from './normalize.js';
import { prepareElkOnce } from './render-fixture-class.js';
import { commentMismatch, firstCommentDiff, svgComments } from './svg-comments.js';

vi.setConfig({ testTimeout: CI_RENDER_BUDGET_MS });

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '../../fixtures/actor-line-routing');

/** `CommandExecutionResult.badColor()` (`command/CommandExecutionResult.java:85-86`). */
const NO_SUCH_COLOR = 'No such color';
/** The label of a line no command accepts (`command/PSystemCommandFactory.java:258`). */
const SYNTAX_ERROR = 'Syntax Error?';
/** Every error label a row of this gate can show. */
const LABELS: readonly string[] = [NO_SUCH_COLOR, SYNTAX_ERROR];
/** The Welcome block's first line (`PSystemWelcome`), drawn when the source has fewer than 5 lines. */
const WELCOME = 'Welcome to PlantUML!';
/** The footer's version line: its text is this port's version, not the jar's (DIVERGENCES.md "Error pages"). */
const FOOTER_VERSION = 'PlantUML version';
/** The footer's source box, `[From <file> (line N) ]`: its file name differs (`in.puml`). */
const FOOTER_FROM = '[From ';
const FROM_LINE = /\(line (\d+)\) \]$/;
/** `HColorSet.ts#UNKNOWN_COLOR_NEUTRAL` as drawn: the 2026-11-04 neutral ruling for an unknown bare colour. */
const NEUTRAL_FILL = 'fill="#D3D3D3"';

/** Rows the jar draws: 0 diffs and the jar's comments. */
const ZERO: readonly string[] = [
  // 2026-11-24 alr T1: controls. A bare colour, a gradient, no colour and a bare `participant` colour stay in
  // sequence (`getColor` resolves them, `HColorSet.java:69-76`); `:X: #line:red` and an actor with a usecase are
  // description from their first line; a bare `create X #red` on an existing X keeps its place.
  'alr-ctl-create-move',
  'alr-ctl-desc-colon',
  'alr-ctl-desc-line',
  'alr-ctl-gradient',
  'alr-ctl-participant-red',
  'alr-ctl-plain',
  'alr-ctl-red',
  // 2026-11-24 alr T1: guards. An existing CODE returns before the colour (`CommandParticipant.java:145-149`), and
  // the multi-line form never reads it (`CommandParticipantMultilines.java:136-176`).
  'alr-create-actor-existing',
  'alr-create-existing',
  'alr-existing',
  'alr-existing-msg',
  'alr-multiline',
  // 2026-11-24 alr T2: `declareParticipant` refuses a new CODE whose capture `refusesAsBareColor`
  // (`command-participant.ts#refusesColor`, `CommandParticipant.java:183-185`) with `badColor()`'s message and score,
  // so the sequence factory fails and description (class for `entity`) draws, as the jar's `PSystemBuilder` does.
  'alr-as-full',
  'alr-back-red',
  'alr-boundary',
  'alr-collections',
  'alr-control',
  'alr-database',
  'alr-entity',
  'alr-full-as',
  'alr-full-as-code',
  'alr-issue',
  'alr-line-red',
  'alr-line3',
  'alr-message',
  'alr-queue',
  'alr-quoted-code',
  'alr-second',
  'alr-semi',
  'alr-stereo',
  'alr-teoz',
  'alr-teoz-msg',
  'alr-text-red',
  'alr-url',
  // 2026-11-24 alr T3: a bare `create` follows upstream's two commands (D5). `create X #red` is `CommandActivate`
  // (`command-lifeline.ts#createLifelineCommand`, `CommandActivate.java:72-83,116-131`), whose colours never reach the
  // participant; `create X #line:red` fails that grammar and is `CommandParticipantA`, which moves an existing X last
  // (`CommandParticipant.java:146-148`).
  'alr-create-move',
  'alr-create-red',
  'alr-create-red-msg',
  // 2026-11-24 alr T3 push-forward, each with its jar oracle: an existing X keeps its colour line in sequence
  // (`CommandParticipant.java:145-149`); `!pragma layout elk` routes to description as the default engine does; a
  // quoted WHO and a second colour stay `CommandActivate`'s (`CommandActivate.java:72-83`).
  'alr-pf-after-msg',
  'alr-pf-create-quoted',
  'alr-pf-create-two',
  'alr-pf-elk',
];

/** Rows that pass the D7 error-page bar. */
const ERROR_PAGE: readonly string[] = [
  // 2026-11-24 alr T2: sequence refuses at line 2 with score 10 (`refusalScore`, `parse-refusal.ts`;
  // `PSystemError.java:417`), above every other factory's refusal of the same line, so the page assumes sequence.
  // Fewer than 5 lines: the Welcome block is drawn and the page width is the jar's.
  'alr-create',
  'alr-create-bare',
  'alr-participant',
  // 2026-11-24 alr T3 push-forward, with stock + release checks (`jar-error-check.txt`): the CREATE group and a
  // quoted display with a later message refuse the same way.
  'alr-pf-create-participant',
  'alr-pf-participant-as-msg',
];

interface JarError {
  readonly label: string;
  readonly line: number;
  readonly welcome: boolean;
}

interface OpenRow {
  readonly maxDiffs: number;
  readonly reason: string;
  /** The jar's error page, read from its `.svg`; the manifest test checks it. Absent when the jar draws. */
  readonly jar?: JarError;
  /** No Welcome block: D7 item 5 waits on #283, items 1 to 4 hold once ours is an error page. */
  readonly issue283?: true;
  /** Held as drawn by ruling: not an error page, and painted the neutral. */
  readonly drawn?: true;
  /** Ours still draws where the jar errors: held on `maxDiffs` alone until ours is an error page. */
  readonly oursDraws?: true;
}

const sequenceError = (label: string, line: number, welcome: boolean): JarError => ({
  label: `${label} (Assumed diagram type: sequence)`,
  line,
  welcome,
});
const SEQUENCE_LINE_2 = sequenceError(NO_SUCH_COLOR, 2, true);

const OPEN_283 = '#283 (needs-ruling): the page width follows the version line when no Welcome block is drawn';
const DASHED =
  '#294: description sizes an actor at the style thickness (`layout-dot-tree.ts:216`) but draws its `#line.dashed` ' +
  "stroke (`renderer-entity.ts:227`), so the canvas is 1px narrower than the jar's";
const ORDER_284 =
  '#284: description `KEYWORD_RE` (`description/parse-helpers.ts:414`) accepts `actor X order 10 #line:red`, which ' +
  "the jar's description refuses";
const NEUTRAL_RULING =
  '#190: the 2026-11-04 neutral ruling paints an unknown bare colour LightGray (DIVERGENCES.md "We draw where the ' +
  'jar errors")';

/** Row -> the diffs it may not exceed, its reason, and the jar's error page. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-24 alr T2: description draws `actor X #line.dashed` 1px narrower than the jar (also with a usecase from
  // line 1, and with `#line.dotted`); its own mechanism outside the participant family (D6), filed as #294 at T4.
  'alr-dashed': { maxDiffs: 4, reason: DASHED },
  // 2026-11-24 alr T2: sequence refuses as the jar's does, but our description accepts `X order 10 #line:red` where
  // the jar's refuses it, so ours draws where the jar errors (D6).
  'alr-order': { maxDiffs: 5, reason: ORDER_284, jar: SEQUENCE_LINE_2, oursDraws: true },
  // 2026-11-24 alr T2: refused with the jar's label and line, no Welcome block (`PSystemError
  // #getTotalLineCountLessThan5`); every footer diff is exempt, and the two left are the document's `@width`/`viewBox`.
  // 2026-11-24 alr T3 push-forward, with stock + release checks: inside `box … end box` the refusal is at line 3, and
  // no other factory reads `box`; 5 lines, so no Welcome block.
  'alr-pf-box': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: sequenceError(NO_SUCH_COLOR, 3, false),
    issue283: true,
  },
  'alr-seq-only': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: { label: `${SYNTAX_ERROR} (Assumed diagram type: component)`, line: 4, welcome: false },
    issue283: true,
  },
  // 2026-11-24 alr T1: an unknown bare colour; the jar errors, we draw the neutral by ruling. Must not move.
  'alr-unknown-bare': { maxDiffs: 5, reason: NEUTRAL_RULING, jar: SEQUENCE_LINE_2, drawn: true },
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

function jarSvg(row: string): string {
  return readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
}

/** `row` rendered as the survey renders it, and how many times our error page drew. */
function renderObserved(row: string): { readonly svg: string; readonly errorPages: number } {
  let errorPages = 0;
  setErrorPageObserver(() => {
    errorPages += 1;
  });
  try {
    const svg = renderSync(
      readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'),
      withJarCompatibleStyleInput({
        measurer: new DeterministicMeasurer(),
        assetStore,
        includeStore: fixtureIncludeStore(),
        filename: 'in.puml',
        elk,
      }),
    );
    return { svg, errorPages };
  } finally {
    setErrorPageObserver(undefined);
  }
}

/** The text of every `<text>` element, in document order (normalized, so entities are decoded). */
function texts(svg: string): string[] {
  const out: string[] = [];
  const walk = (n: NormalizedNode): void => {
    if (n.type === 'element' && n.tag === 'text') out.push((n.children ?? []).map((c) => c.text ?? '').join(''));
    for (const c of n.children ?? []) walk(c);
  };
  walk(normalizeSvg(svg));
  return out;
}

/** The error page an svg shows: its label, its footer's `(line N)`, and whether Welcome is drawn. */
function errorOf(svg: string): { label: string | undefined; line: number | undefined; welcome: boolean } {
  const all = texts(svg);
  const from = all.find((t) => t.startsWith(FOOTER_FROM));
  const lineText = from === undefined ? undefined : FROM_LINE.exec(from)?.[1];
  return {
    label: all.find((t) => LABELS.some((l) => t.startsWith(l))),
    line: lineText === undefined ? undefined : Number(lineText),
    welcome: all.includes(WELCOME),
  };
}

/**
 * The `compareSvg` paths of the jar's footer elements, named as `compareSvg` names a node (per-tag sibling counters):
 * the version `<text>`, the `[From ` `<text>`, and the `<rect>` drawn just before it, behind it.
 */
function footerPaths(jar: string): string[] {
  const paths: string[] = [];
  const walk = (n: NormalizedNode, path: string): void => {
    const counters: Record<string, number> = {};
    let lastRect: string | undefined;
    for (const c of n.children ?? []) {
      if (c.type !== 'element' || c.tag === undefined) continue;
      counters[c.tag] = (counters[c.tag] ?? 0) + 1;
      const childPath = `${path}/${c.tag}[${String(counters[c.tag])}]`;
      if (c.tag === 'rect') lastRect = childPath;
      if (c.tag === 'text') {
        const text = (c.children ?? []).map((t) => t.text ?? '').join('');
        if (text.startsWith(FOOTER_VERSION)) paths.push(childPath);
        if (text.startsWith(FOOTER_FROM)) {
          paths.push(childPath);
          if (lastRect !== undefined) paths.push(lastRect);
        }
      }
      walk(c, childPath);
    }
  };
  const root = normalizeSvg(jar);
  walk(root, root.tag ?? 'svg');
  return paths;
}

interface D7Observed {
  readonly errorPage: boolean;
  readonly label: string | undefined;
  readonly line: number | undefined;
  readonly welcome: boolean;
  readonly nonFooterDiffs: readonly string[];
}

/** The D7 observation of one row: our error page against the jar's, and every diff off the exempt footer. */
function observeD7(row: string): D7Observed {
  const { svg, errorPages } = renderObserved(row);
  const jar = jarSvg(row);
  const footer = footerPaths(jar);
  const onFooter = (path: string): boolean => footer.some((f) => path === f || path.startsWith(`${f}/`));
  const { diffs } = compareSvg(svg, jar, 'svg');
  return {
    errorPage: errorPages === 1,
    ...errorOf(svg),
    nonFooterDiffs: diffs.filter((d) => !onFooter(d.path)).map((d) => JSON.stringify(d)),
  };
}

/** What D7 requires of a row whose jar page is `jar`. */
function d7Expected(jar: JarError): D7Observed {
  return { errorPage: true, label: jar.label, line: jar.line, welcome: jar.welcome, nonFooterDiffs: [] };
}

function jarErrorOf(row: string): JarError {
  const { label, line, welcome } = errorOf(jarSvg(row));
  return { label: label ?? '', line: line ?? -1, welcome };
}

describe('actor-line-routing authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...ERROR_PAGE, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(existsSync(join(FIXTURES, `${row}.svg`)), `${row}: no jar .svg`).toBe(true);
  });

  it('the jar errors on every ERROR_PAGE row and every OPEN row with a jar page, and draws every other row', () => {
    const erroring = Object.entries(OPEN).filter(([, v]) => v.jar !== undefined);
    for (const row of ERROR_PAGE) expect(jarErrorOf(row).label, row).not.toBe('');
    for (const [row, { jar }] of erroring) expect(jarSvg(row), row).toContain(jar?.label);
    const drawing = [...ZERO, ...Object.keys(OPEN).filter((r) => OPEN[r]?.jar === undefined)];
    for (const row of drawing) expect(jarErrorOf(row).label, row).toBe('');
  });

  it('every OPEN row names its issue, and every no-Welcome row is a #283 row', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
    const noWelcome = Object.entries(OPEN).filter(([, v]) => v.jar?.welcome === false);
    expect(noWelcome.filter(([, v]) => v.issue283 !== true).map(([row]) => row)).toEqual([]);
  });

  it("every OPEN row records the jar's label, line and Welcome as its .svg shows them", () => {
    for (const [row, { jar }] of Object.entries(OPEN)) if (jar !== undefined) expect(jarErrorOf(row), row).toEqual(jar);
  });
});

describe('actor-line-routing authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs and the jar's comments`, () => {
      const { svg, errorPages } = renderObserved(row);
      const jar = jarSvg(row);
      const { diffs } = compareSvg(svg, jar, 'svg');
      const ours = svgComments(svg);
      const theirs = svgComments(jar);
      const detail = `${row}: ${JSON.stringify(diffs[0] ?? null)} | ${firstCommentDiff(ours, theirs)}`;
      expect({ diffs: diffs.length, comments: commentMismatch(ours, theirs), errorPages }, detail).toEqual({
        diffs: 0,
        comments: 0,
        errorPages: 0,
      });
    });
  }
});

describe('actor-line-routing authored fixtures — error-page rows (D7)', () => {
  for (const row of ERROR_PAGE) {
    it(`${row}: our error page carries the jar's label, line and Welcome, and differs only on the footer`, () => {
      expect(observeD7(row)).toEqual(d7Expected(jarErrorOf(row)));
    });
  }
});

describe('actor-line-routing authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason, jar, issue283, drawn, oursDraws }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      const { svg, errorPages } = renderObserved(row);
      const { diffs } = compareSvg(svg, jarSvg(row), 'svg');
      expect(diffs.length, `${row}: ${JSON.stringify(diffs[0] ?? null)}`).toBeLessThanOrEqual(maxDiffs);
      if (drawn === true) {
        expect({ errorPages, neutral: svg.includes(NEUTRAL_FILL) }, row).toEqual({ errorPages: 0, neutral: true });
        return;
      }
      if (jar === undefined || oursDraws === true) return;
      const observed = observeD7(row);
      expect(observed, `${row}: now passes D7 — move it to ERROR_PAGE`).not.toEqual(d7Expected(jar));
      if (issue283 === true) {
        const { nonFooterDiffs: _ignored, ...items1to4 } = observed;
        expect(items1to4, `${row}: D7 items 1 to 4`).toEqual({ errorPage: true, ...jar });
      }
    });
  }
});
