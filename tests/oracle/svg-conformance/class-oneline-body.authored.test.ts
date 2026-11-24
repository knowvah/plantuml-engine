/**
 * Authored class-oneline-body gate (ocb, issue #223): no class command takes a non-empty `{ … }` body on one line.
 *
 * `CommandCreateClass` ends with an optional EMPTY pair, `[%s]*\{[%s]*\}`, then the end of the line
 * (`classdiagram/command/CommandCreateClass.java:117-119`); `CommandCreateClassMultilines` opens only on a line ending
 * in `\{` (`CommandCreateClassMultilines.java:140-142`). So `class A { x : int }` matches no class command,
 * `PSystemCommandFactory#getCandidate` returns null, and the factory builds `SYNTAX_ERROR "Syntax Error?"` at that line
 * (`command/PSystemCommandFactory.java:206-208`).
 *
 * Rows are the `.puml` files under `tests/fixtures/class-oneline-body/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`).
 *
 * - A ZERO row (the jar draws) has 0 `compareSvg` diffs and a comment sequence equal to the jar's.
 * - An ERROR_PAGE row passes the D3 bar of the brief: ours is an error page (`setErrorPageObserver` fires once), its
 *   label text and `(line N)` equal the jar's, the Welcome block is present exactly when the jar's is, and every
 *   `compareSvg` diff sits on the footer the 2026-10-10 error-page ruling exempts (docs/svg-conformance.md "Error
 *   pages"; DIVERGENCES.md "Error pages print this port's version"): the `<text>` whose jar value starts
 *   `PlantUML version`, the `<text>` whose jar value starts `[From `, and the `<rect>` drawn behind it. The footer is
 *   found by content, never by index.
 * - An OPEN row (the jar errors, ours does not pass D3 yet) never rises above its diff count, and names its reason.
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
const FIXTURES = join(HERE, '../../fixtures/class-oneline-body');

/** The jar's syntax-error label (`PSystemCommandFactory.java:206-208`). */
const SYNTAX_ERROR = 'Syntax Error?';
/** The Welcome block's first line (`PSystemWelcome`), drawn when the source has fewer than 5 lines. */
const WELCOME = 'Welcome to PlantUML!';
/** The footer's version line: its text is this port's version, not the jar's (DIVERGENCES.md "Error pages"). */
const FOOTER_VERSION = 'PlantUML version';
/** The footer's source box, `[From <file> (line N) ]`: its file name differs (`in.puml`). */
const FOOTER_FROM = '[From ';
const FROM_LINE = /\(line (\d+)\) \]$/;

/** Rows the jar draws: 0 diffs and the jar's comments. */
const ZERO: readonly string[] = [
  // 2026-11-24 ocb T1: controls. An empty pair is `CommandCreateClass`'s optional `[%s]*\{[%s]*\}` tail
  // (`CommandCreateClass.java:117-119`; `%s` takes U+00A0, `Pattern2.java:56`), with or without stereotype, colour and
  // `extends`; a trailing `{` opens `CommandCreateClassMultilines` (`:140-142`).
  'ocb-ctl-empty',
  'ocb-ctl-empty-decorated',
  'ocb-ctl-empty-nbsp',
  'ocb-ctl-empty-tight',
  'ocb-ctl-multiline',
  'ocb-ctl-multiline-decorated',
  // 2026-11-24 ocb T2b push-forward, each with its jar oracle: braces the jar still takes. A URL tooltip
  // (`[[url{tip}]]`, `UrlBuilder.OPTIONAL`, `CommandCreateClass.java:104`) alone and before an empty pair, a brace in a
  // quoted name (CODE4 `[%g]([^%g]+)[%g]`, `NameAndCodeParser.java:68`), and `hide empty members` over `class A { }`.
  'ocb-ctl-hide-empty',
  'ocb-ctl-quoted-brace',
  'ocb-ctl-url-tooltip',
  'ocb-ctl-url-tooltip-empty',
];

/** Rows that pass the D3 error-page bar. */
const ERROR_PAGE: readonly string[] = [
  // 2026-11-24 ocb T2: rule 7 declines a line ending in a non-empty `{…}` (`CLASS_BODY_TAIL_GUARD`), and no other
  // class command takes it, so the line reaches `buildSyntaxRefusal` as upstream's reaches `SYNTAX_ERROR`
  // (`PSystemCommandFactory.java:206-208`): the issue's three variants and the other classifier keywords, at line 2
  // with the Welcome block (`Assumed diagram type: sequence`), and at line 3 after a class (`class`).
  'ocb-abstract',
  // Push-forward: U+2003 is not `%s` (`Pattern2.java:56`: Java `\s` plus U+00A0), so `{U+2003}` is not the empty
  // pair and the jar refuses it; `JAVA_S` in `class-declaration-extractors.ts`, not `transform`'s JS `\s`.
  'ocb-empty-emspace',
  'ocb-enum',
  'ocb-issue',
  'ocb-issue-nbsp-both',
  'ocb-issue-nbsp-lead',
  'ocb-line3',
  'ocb-struct',
  // 2026-11-24 ocb T2b push-forward, each with its jar oracle and stock check: `extends B { x }` (the same rule 7
  // decline), `object o { x }` (`CommandCreateEntityObject` has no brace leaf; the object rule already declined it).
  'ocb-extends-body',
  'ocb-object-body',
];

interface JarError {
  readonly label: string;
  readonly line: number;
  readonly welcome: boolean;
}

interface OpenRow {
  readonly maxDiffs: number;
  readonly reason: string;
  /** The jar's error page, read from its `.svg`; the manifest test checks it. */
  readonly jar: JarError;
}

const SEQUENCE_LINE_2: JarError = { label: `${SYNTAX_ERROR} (Assumed diagram type: sequence)`, line: 2, welcome: true };
const MIX_LINE_4: JarError = { label: `${SYNTAX_ERROR} (Assumed diagram type: class)`, line: 4, welcome: false };
const OPEN_LONG = '#283 (needs-ruling): the page width follows the version line when no Welcome block is drawn';
const DRAWS_DESCRIPTION =
  '#284: description draws the leaf; its catch-all `KEYWORD_RE` (`description/parse-helpers.ts:414`) claims what ' +
  'class declines';
const DRAWS_UNCLOSED =
  '#285: port draws class `A { x : int`; `parseIdDisplay` bareword fallback (`class-declaration-extractors.ts`) ' +
  'takes a code upstream CODE refuses (`CommandCreateClassMultilines.java:92`)';

/** Row -> the diffs it may not exceed, its reason, and the jar's error page. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-24 ocb T2: refused as the jar refuses it (label, line 2, no Welcome: 6 body lines,
  // `PSystemError#getTotalLineCountLessThan5`), and every footer diff is exempt; the two left are the document's
  // `@width`/`viewBox`, 26px narrower because with no Welcome block the version line (ours 345.975 wide, the jar's
  // 371.25) is the widest text. Whether D3's footer covers that is #283.
  'ocb-long': { maxDiffs: 7, reason: OPEN_LONG, jar: { ...SEQUENCE_LINE_2, welcome: false } },
  // 2026-11-24 ocb T2b push-forward: under `allowmixing`, rule 9 took any `{…}` tail; `CommandCreateElementFull2` ends
  // at its colour leaf (`CommandCreateElementFull2.java:120-124`), so the jar refuses both at line 4 (`class`), and so do
  // we now. With 5 lines there is no Welcome block, so the page width is #283's, as for `ocb-long`.
  'ocb-mix-database-body': { maxDiffs: 7, reason: OPEN_LONG, jar: MIX_LINE_4 },
  'ocb-mix-database-empty': { maxDiffs: 7, reason: OPEN_LONG, jar: MIX_LINE_4 },
  // 2026-11-24 ocb T2: class declines, and the description engine draws a leaf named `Z { a }`; T2b reproduced it with
  // no class keyword (`ocb-desc-circle-alone`, after a `[C1]` line) and filed it.
  'ocb-desc-circle-alone': {
    maxDiffs: 5,
    reason: DRAWS_DESCRIPTION,
    jar: { label: `${SYNTAX_ERROR} (Assumed diagram type: component)`, line: 3, welcome: true },
  },
  'ocb-interface': { maxDiffs: 5, reason: DRAWS_DESCRIPTION, jar: SEQUENCE_LINE_2 },
  'ocb-entity': { maxDiffs: 5, reason: DRAWS_DESCRIPTION, jar: SEQUENCE_LINE_2 },
  'ocb-circle': { maxDiffs: 5, reason: DRAWS_DESCRIPTION, jar: SEQUENCE_LINE_2 },
  'ocb-unclosed': { maxDiffs: 5, reason: DRAWS_UNCLOSED, jar: SEQUENCE_LINE_2 },
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

/** The error page an svg shows: its `Syntax Error?` label, its footer's `(line N)`, and whether Welcome is drawn. */
function errorOf(svg: string): { label: string | undefined; line: number | undefined; welcome: boolean } {
  const all = texts(svg);
  const from = all.find((t) => t.startsWith(FOOTER_FROM));
  const lineText = from === undefined ? undefined : FROM_LINE.exec(from)?.[1];
  return {
    label: all.find((t) => t.startsWith(SYNTAX_ERROR)),
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

interface D3Observed {
  readonly errorPage: boolean;
  readonly label: string | undefined;
  readonly line: number | undefined;
  readonly welcome: boolean;
  readonly nonFooterDiffs: readonly string[];
}

/** The D3 observation of one row: our error page against the jar's, and every diff off the exempt footer. */
function observeD3(row: string): D3Observed {
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

/** What D3 requires of a row whose jar page is `jar`. */
function d3Expected(jar: JarError): D3Observed {
  return { errorPage: true, label: jar.label, line: jar.line, welcome: jar.welcome, nonFooterDiffs: [] };
}

function jarErrorOf(row: string): JarError {
  const { label, line, welcome } = errorOf(jarSvg(row));
  return { label: label ?? '', line: line ?? -1, welcome };
}

describe('class-oneline-body authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...ERROR_PAGE, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(existsSync(join(FIXTURES, `${row}.svg`)), `${row}: no jar .svg`).toBe(true);
  });

  it('the jar errors on every ERROR_PAGE and OPEN row, and draws every ZERO row', () => {
    for (const row of [...ERROR_PAGE, ...Object.keys(OPEN)]) expect(jarSvg(row), row).toContain(SYNTAX_ERROR);
    for (const row of ZERO) expect(jarSvg(row), row).not.toContain(SYNTAX_ERROR);
  });

  it('every OPEN row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });

  it("every OPEN row records the jar's label, line and Welcome as its .svg shows them", () => {
    for (const [row, { jar }] of Object.entries(OPEN)) expect(jarErrorOf(row), row).toEqual(jar);
  });
});

describe('class-oneline-body authored fixtures — zero rows', () => {
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

describe('class-oneline-body authored fixtures — error-page rows (D3)', () => {
  for (const row of ERROR_PAGE) {
    it(`${row}: our error page carries the jar's label, line and Welcome, and differs only on the footer`, () => {
      expect(observeD3(row)).toEqual(d3Expected(jarErrorOf(row)));
    });
  }
});

describe('class-oneline-body authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason, jar }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      const { svg } = renderObserved(row);
      const { diffs } = compareSvg(svg, jarSvg(row), 'svg');
      expect(observeD3(row), `${row}: now passes D3 — move it to ERROR_PAGE`).not.toEqual(d3Expected(jar));
      expect(diffs.length, `${row}: ${JSON.stringify(diffs[0] ?? null)}`).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
