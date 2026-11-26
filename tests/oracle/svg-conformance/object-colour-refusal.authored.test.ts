/**
 * Authored object-colour-refusal gate (ocr, issue #190): `object` and `json` refuse a colour capture that is not a
 * bare colour, as the jar does.
 *
 * Four upstream commands hand the whole `ColorParser.exp1()` capture (`klimt/color/ColorParser.java:43-46,89-91`) to
 * the throwing `HColorSet#getColor` as one colour (`objectdiagram/command/CommandCreateEntityObject.java:145-147`,
 * `CommandCreateEntityObjectMultilines.java:178-180`, `CommandCreateJson.java:223-225`,
 * `CommandCreateJsonSingleLine.java:183-185`). `getColor` finds no colour in `line:red` and throws
 * (`klimt/color/HColorSet.java:69-76`); `SingleLineCommand2.java:176-179` and `CommandMultilines2.java:119-122` turn
 * the throw into `badColor()`, `No such color` (`command/CommandExecutionResult.java:85-86`). A multi-line block's
 * error is reported on its last line (`command/PSystemCommandFactory.java:218-225`).
 *
 * Rows are the `.puml` files under `tests/fixtures/object-colour-refusal/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`).
 *
 * - A ZERO row (the jar draws) has 0 `compareSvg` diffs and a comment sequence equal to the jar's.
 * - An ERROR_PAGE row passes the D5 bar of the brief: ours is an error page (`setErrorPageObserver` fires once), its
 *   label text and `(line N)` equal the jar's, the Welcome block is present exactly when the jar's is, and every
 *   `compareSvg` diff sits on the footer the 2026-10-10 error-page ruling exempts (docs/svg-conformance.md "Error
 *   pages"; DIVERGENCES.md "Error pages print this port's version"): the `<text>` whose jar value starts
 *   `PlantUML version`, the `<text>` whose jar value starts `[From `, and the `<rect>` drawn behind it. The footer is
 *   found by content, never by index.
 * - An OPEN row never rises above its diff count, and names its reason. A `#283` row (no Welcome block) also holds
 *   D5 items 1 to 4 (at `ourLine` while that differs); a `drawn` row is held as drawn by ruling.
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
const FIXTURES = join(HERE, '../../fixtures/object-colour-refusal');

/** `CommandExecutionResult.badColor()` (`command/CommandExecutionResult.java:85-86`). */
const NO_SUCH_COLOR = 'No such color';
/** The duplicate refusals: `CommandCreateEntityObject.java:126-127`, `CommandCreateJson.java:205-206`. */
const OBJECT_EXISTS = 'Object already exists';
const JSON_EXISTS = 'JSON already exists';
/** `CommandCreateMap.java:165-166`. */
const MAP_EXISTS = 'Map already exists';
/** Every error label a row of this gate can show. */
const LABELS: readonly string[] = [NO_SUCH_COLOR, OBJECT_EXISTS, JSON_EXISTS, MAP_EXISTS];
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
  // 2026-11-24 ocr T1: controls. A bare colour on `object` and `json` (`getColor` resolves it,
  // `HColorSet.java:69-76`), a gradient, no colour, and the `name:value` forms read through `Colors` by `map`
  // (`CommandCreateMap.java:224`) and `class` (`CommandCreateClass.java`).
  'ocr-ctl-class-line',
  'ocr-ctl-gradient',
  'ocr-ctl-json-red',
  'ocr-ctl-map-line',
  'ocr-ctl-multiline-red',
  'ocr-ctl-plain',
  'ocr-ctl-red',
  // 2026-11-24 ocr T3b: a nested json body in class, read to where the JSON completes; guards the refused-body
  // completion check (`class-body-refusal.ts`) against the accepted path.
  'ocr-ctl-class-json-nested',
];

/** Rows that pass the D5 error-page bar. */
const ERROR_PAGE: readonly string[] = [
  // 2026-11-24 ocr T1: the duplicate check runs before the colour (`CommandCreateEntityObject.java:126-127` before
  // `:145-147`), so the jar says `Object already exists: O` at line 3, and so do we.
  'ocr-dup-and-colour',
  // 2026-11-24 ocr T2: `refusesAsBareColor` (`HColorSet.ts`, D2) refuses a capture `getColor` throws on
  // (`HColorSet.java:69-76`) that is not one bare colour, at the object commands (`class-object-commands.ts`,
  // `CommandCreateEntityObject.java:145-147`, `CommandCreateEntityObjectMultilines.java:178-180`) and in the shared
  // json core (`CommandCreateJson.ts#refusesColor`, `CommandCreateJson.java:223-225`,
  // `CommandCreateJsonSingleLine.java:183-185`), with `badColor()`'s message and score. Fewer than 5 lines, so the
  // Welcome block is drawn and the page width is the jar's.
  'ocr-back-red',
  'ocr-dashed',
  'ocr-desc-json-single',
  'ocr-issue',
  'ocr-json-short',
  'ocr-json-single',
  'ocr-line-red',
  'ocr-line3',
  'ocr-multiline-short',
  'ocr-semi',
  'ocr-state-json-single',
  'ocr-text-red',
  // 2026-11-24 ocr T2 push-forward, each with its jar oracle and stock + release check: the colour after a stereotype
  // and a URL, after a quoted display, under `!pragma layout elk`, on single-line array data, and ahead of data that
  // does not parse (`executeArg0` throws before `getJsonValue`, `CommandCreateJsonSingleLine.java:138-145`).
  'ocr-pf-elk',
  'ocr-pf-json-array',
  'ocr-pf-json-bad-data',
  'ocr-pf-quoted',
  'ocr-pf-stereo-url',
  // 2026-11-24 ocr T3: the multi-line json refusal lands on the block's last line in description
  // (`executionErrorSpan`, `PSystemCommandFactory.java:218-225`). No Welcome block, but the label is wider than the
  // version line, so the page width is the jar's and D5 holds in full.
  'ocr-desc-json-dup',
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
  /** No Welcome block: D5 item 5 waits on #283, items 1 to 4 hold once ours is an error page. */
  readonly issue283?: true;
  /** Held as drawn by ruling: not an error page, and painted the neutral. */
  readonly drawn?: true;
  /** The line our error page reports today, while it is not the jar's (D4, M3). */
  readonly ourLine?: number;
}

const classError = (label: string, line: number, welcome: boolean): JarError => ({
  label: `${label} (Assumed diagram type: class)`,
  line,
  welcome,
});
const CLASS_LINE_2 = classError(NO_SUCH_COLOR, 2, true);

const OPEN_283 = '#283 (needs-ruling): the page width follows the version line when no Welcome block is drawn';
const STATE_NESTED_JSON =
  '#288: state draws a nested json leaf on its own (`state-json-sizing.ts:101-119`, `state-sizing.ts:483`); ' +
  'class draws the same leaf at 0 diffs';
const LISTS_STRIPPED =
  '#287: the error page lists the preprocessor-stripped comment line (`error-diagrams.ts:127-135`, `errorSvg` reads the ' +
  'raw source); the jar lists the parsed trace';
const MAP_AT_OPENER =
  '#286: a multi-line `map` refusal in description is reported on the opener line (`description/parser.ts`, ' +
  '`tryMapBlock` sets no `executionErrorSpan`)';
const NEUTRAL_RULING =
  '#190: the 2026-11-04 neutral ruling paints an unknown bare colour LightGray (DIVERGENCES.md "We draw where the ' +
  'jar errors")';
const TRANSPARENT =
  '#289: `#transparent` resolves to `#00000000`, which `fillAttrsOf` (`svg-shapes.ts:56-63`) writes as `#000` at ' +
  'opacity 0 where `SvgGraphics#fixColor` writes `none` (`SvgGraphics.java:527`); also `class C #transparent`';

/** Row -> the diffs it may not exceed, its reason, and the jar's error page. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-24 ocr T2: refused with the jar's label and line, no Welcome block (5 or more lines,
  // `PSystemError#getTotalLineCountLessThan5`); every footer diff is exempt, and the two left are the document's
  // `@width`/`viewBox`, 26px narrower because the version line (ours 345.975 wide, the jar's 371.25) is the widest text.
  'ocr-long': { maxDiffs: 7, reason: OPEN_283, jar: classError(NO_SUCH_COLOR, 7, false), issue283: true },
  'ocr-multiline': { maxDiffs: 7, reason: OPEN_283, jar: classError(NO_SUCH_COLOR, 4, false), issue283: true },
  'ocr-multiline-back': { maxDiffs: 7, reason: OPEN_283, jar: classError(NO_SUCH_COLOR, 4, false), issue283: true },
  'ocr-json-multi': { maxDiffs: 7, reason: OPEN_283, jar: classError(NO_SUCH_COLOR, 4, false), issue283: true },
  // 2026-11-24 ocr T2 push-forward: inside a package (line 3), and a single-line state json after a multi-line one
  // (line 6); both have 5 or more lines, so no Welcome block.
  'ocr-pf-package': { maxDiffs: 7, reason: OPEN_283, jar: classError(NO_SUCH_COLOR, 3, false), issue283: true },
  'ocr-pf-state-mixed': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: { label: `${NO_SUCH_COLOR} (Assumed diagram type: state)`, line: 6, welcome: false },
    issue283: true,
  },
  // 2026-11-24 ocr T3b: a refused json body closes where the JSON completes (`class-body-refusal.ts`,
  // `stepPendingJson`; `CommandCreateJson.java:155-162`): the jar's line 6 in class, 7 in state.
  'ocr-json-nested': { maxDiffs: 7, reason: OPEN_283, jar: classError(NO_SUCH_COLOR, 6, false), issue283: true },
  'ocr-state-json-nested': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: { label: `${NO_SUCH_COLOR} (Assumed diagram type: state)`, line: 7, welcome: false },
    issue283: true,
  },
  // 2026-11-24 ocr T3b: the jar draws; the accepted nested body now reaches state's json renderer, which draws it
  // differently from class's (`state-json-sizing.ts`).
  'ocr-ctl-state-json-nested': { maxDiffs: 15, reason: STATE_NESTED_JSON },
  // 2026-11-24 ocr T3: refused on the block's last line in state (`stepPendingJson`) and description
  // (`executionErrorSpan`), as the jar's (`PSystemCommandFactory.java:218-225`); the page width is #283's.
  'ocr-state-json': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: { label: `${NO_SUCH_COLOR} (Assumed diagram type: state)`, line: 5, welcome: false },
    issue283: true,
  },
  'ocr-desc-json': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: { label: `${NO_SUCH_COLOR} (Assumed diagram type: component)`, line: 5, welcome: false },
    issue283: true,
  },
  'ocr-state-json-dup': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: { label: `${JSON_EXISTS}: J (Assumed diagram type: state)`, line: 5, welcome: false },
    issue283: true,
  },
  // 2026-11-24 ocr T3 push-forward, each with its jar oracle and stock + release check. A nested body in
  // description, gathered to where the JSON completes (`gatherMultilineBlock`), at the jar's line 7.
  'ocr-desc-json-nested': {
    maxDiffs: 7,
    reason: OPEN_283,
    jar: { label: `${NO_SUCH_COLOR} (Assumed diagram type: component)`, line: 7, welcome: false },
    issue283: true,
  },
  // A `'` comment inside the block: the line is the jar's (6), but our listing shows the stripped line.
  'ocr-desc-json-comment': {
    maxDiffs: 28,
    reason: LISTS_STRIPPED,
    jar: { label: `${NO_SUCH_COLOR} (Assumed diagram type: component)`, line: 6, welcome: false },
    issue283: true,
  },
  'ocr-state-json-comment': {
    maxDiffs: 28,
    reason: LISTS_STRIPPED,
    jar: { label: `${NO_SUCH_COLOR} (Assumed diagram type: state)`, line: 6, welcome: false },
    issue283: true,
  },
  // The same opener-line mechanism for a description `map` block; T3 moves only `json`.
  'ocr-desc-map-dup': {
    maxDiffs: 27,
    reason: MAP_AT_OPENER,
    jar: { label: `${MAP_EXISTS}: M (Assumed diagram type: component)`, line: 5, welcome: false },
    issue283: true,
    ourLine: 3,
  },
  // 2026-11-24 ocr T1: an unknown bare colour; the jar errors, we draw the neutral by ruling. Must not move.
  'ocr-unknown-bare': { maxDiffs: 5, reason: NEUTRAL_RULING, jar: CLASS_LINE_2, drawn: true },
  // 2026-11-24 ocr T1: the jar draws `fill="none"` (`HColorSet.java:82-83`); not the object command. Filed at exit.
  'ocr-ctl-transparent': { maxDiffs: 2, reason: TRANSPARENT },
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

interface D5Observed {
  readonly errorPage: boolean;
  readonly label: string | undefined;
  readonly line: number | undefined;
  readonly welcome: boolean;
  readonly nonFooterDiffs: readonly string[];
}

/** The D5 observation of one row: our error page against the jar's, and every diff off the exempt footer. */
function observeD5(row: string): D5Observed {
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

/** What D5 requires of a row whose jar page is `jar`. */
function d5Expected(jar: JarError): D5Observed {
  return { errorPage: true, label: jar.label, line: jar.line, welcome: jar.welcome, nonFooterDiffs: [] };
}

function jarErrorOf(row: string): JarError {
  const { label, line, welcome } = errorOf(jarSvg(row));
  return { label: label ?? '', line: line ?? -1, welcome };
}

describe('object-colour-refusal authored fixtures — manifest shape', () => {
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
    for (const row of drawing) expect(jarSvg(row), row).not.toContain(NO_SUCH_COLOR);
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

describe('object-colour-refusal authored fixtures — zero rows', () => {
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

describe('object-colour-refusal authored fixtures — error-page rows (D5)', () => {
  for (const row of ERROR_PAGE) {
    it(`${row}: our error page carries the jar's label, line and Welcome, and differs only on the footer`, () => {
      expect(observeD5(row)).toEqual(d5Expected(jarErrorOf(row)));
    });
  }
});

describe('object-colour-refusal authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason, jar, issue283, drawn, ourLine }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      const { svg, errorPages } = renderObserved(row);
      const { diffs } = compareSvg(svg, jarSvg(row), 'svg');
      expect(diffs.length, `${row}: ${JSON.stringify(diffs[0] ?? null)}`).toBeLessThanOrEqual(maxDiffs);
      if (drawn === true) {
        expect({ errorPages, neutral: svg.includes(NEUTRAL_FILL) }, row).toEqual({ errorPages: 0, neutral: true });
        return;
      }
      if (jar === undefined) return;
      const observed = observeD5(row);
      expect(observed, `${row}: now passes D5 — move it to ERROR_PAGE`).not.toEqual(d5Expected(jar));
      if (issue283 === true) {
        const { nonFooterDiffs: _ignored, ...items1to4 } = observed;
        expect(items1to4, `${row}: D5 items 1 to 4`).toEqual({ errorPage: true, ...jar, line: ourLine ?? jar.line });
      }
    });
  }
});
