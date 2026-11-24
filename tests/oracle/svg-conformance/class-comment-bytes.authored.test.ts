/**
 * Authored class comment-bytes gate (ccb, issue #151, D4): the `<!--...-->` comments of a class or object diagram are
 * the jar's bytes. Upstream writes an entity comment only where the image does (`EntityImageClass.java:141-142`,
 * `EntityImageDescription.java:295`, dispatched by `GeneralImageBuilder.java:107-242`), writes the comment of a hidden
 * node or edge before it checks the hidden flag (`AbstractUGraphic.java:128-131`, `SvekResult.java:85,98`), and names
 * every comment `Entity#getName()` (`Entity.java:686-688`). `compareSvg` drops comments, so this gate compares the
 * comment sequence itself (`svg-comments.ts`).
 *
 * Rows are the `.puml` files under `tests/fixtures/class-comment-bytes/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`), plus the issue's own fixture, read in place from `tests/fixtures/c4dd-T2c/`.
 *
 * - A ZERO row's comment sequence equals the jar's.
 * - An OPEN row's `commentMismatch` never rises, and its `reason` names the mechanism or the issue holding it.
 *
 * Rendered as the class and object ratchets render: `renderClassFixture` + `censusClassFixtureOptions` +
 * `DeterministicMeasurer`, with the ELK backend preloaded.
 */
import { beforeAll, describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { censusClassFixtureOptions } from '../../../scripts/svg-conformance-census.js';
import { prepareElkOnce, renderClassFixture } from './render-fixture-class.js';
import { commentMismatch, firstCommentDiff, svgComments } from './svg-comments.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '../../fixtures/class-comment-bytes');
const C4DD_T2C = join(HERE, '../../fixtures/c4dd-T2c');

/** The issue's own fixture (#151), read in place: `<name>.puml` with `oracle/<name>.svg`. */
const ISSUE_ROW = 'c4dd-T2c/class-namespace-separator-comment';

/** Rows whose comments equal the jar's. */
const ZERO: readonly string[] = [
  // 2026-11-16 ccb T1a: control. A removed leaf never becomes a node (`GeneralImageBuilder.java:107`), so neither it
  // nor its link writes a comment.
  'remove-class',
  // 2026-11-16 ccb T1c: a hidden leaf or link draws through `UHidden` (`SvekResult.java:82-101`), and
  // `AbstractUGraphic#draw` writes its comment before the hidden check (`AbstractUGraphic.java:128-131`): the comment
  // and nothing else. A hidden map, json or object writes none (`GeneralImageBuilder.java:180-187`). A hidden link
  // still takes its id (`SvekEdge.java:944`), so the visible twin is `A-B-1`.
  'hidden-link-classes',
  'hidden-link-packages',
  'hidden-link-shared-id',
  'hidden-map-json',
  'hide-class-with-link',
  'obj-hidden',
  // 2026-11-16 ccb T1d: a class comment prints `Entity#getName()` (`EntityImageClass.java:142`, `Entity.java:686-688`),
  // the quark name `Quark#child` made under the separator of that moment: `N::B` -> `B`, `X::Y::A` -> `A`.
  'hidden-entity-in-namespace',
  ISSUE_ROW,
  // 2026-11-16 ccb push-forward: authored after T1e on the same reading, each with its jar oracle. A hidden lollipop
  // (`EntityImageLollipopInterface`), association point and group-USymbol rectangle write nothing; a hidden component
  // writes `entity C` (`EntityImageDescription.java:295`); `hide <<s>>` and `-[hidden,dashed]-` hide as `hide A` and
  // `-[hidden]-` do; `escapeComment` defangs `--` as `XmlWriter.comment` does. `hidden-class-with-note`: its note
  // takes its hidden host's flag and writes nothing (`CucaDiagram.java:778-794`; 2026-11-23 hnh T2a, #204).
  'escape-comment-dashes',
  'hidden-assoc-class',
  'hidden-by-stereotype',
  'hidden-class-with-note',
  'hidden-dashed-link',
  'hidden-group-usymbol',
  'hidden-lollipop',
  'hidden-usymbol-entity',
];

/** Row -> the mismatch it may not exceed, and the mechanism (decisions.md) or issue that holds it. */
const OPEN: Readonly<Record<string, { readonly maxMismatch: number; readonly reason: string }>> = {
  // 2026-11-16 ccb push-forward: the comments name the right quarks, but a name written after `set namespaceSeparator`
  // changes resolves against the new separator, not the quark names `Plasma` registered (`Plasma.java:63-108`).
  'separator-changed-mid': { maxMismatch: 1, reason: '#203: an extra leaf C, so an extra class C comment' },
  'separator-none-then-dot': { maxMismatch: 1, reason: '#203: no new leaf Q, so no class Q comment' },
};

function rowsOnDisk(): string[] {
  return [
    ...readdirSync(FIXTURES)
      .filter((f) => f.endsWith('.puml'))
      .map((f) => f.slice(0, -'.puml'.length)),
    ISSUE_ROW,
  ].sort();
}

function paths(row: string): { puml: string; svg: string } {
  if (row === ISSUE_ROW) {
    const base = row.slice('c4dd-T2c/'.length);
    return { puml: join(C4DD_T2C, `${base}.puml`), svg: join(C4DD_T2C, 'oracle', `${base}.svg`) };
  }
  return { puml: join(FIXTURES, `${row}.puml`), svg: join(FIXTURES, `${row}.svg`) };
}

function commentsOf(row: string): { ours: string[]; jar: string[] } {
  const { puml, svg } = paths(row);
  const ours = renderClassFixture(readFileSync(puml, 'utf8'), new DeterministicMeasurer(), censusClassFixtureOptions());
  return { ours: svgComments(ours), jar: svgComments(readFileSync(svg, 'utf8')) };
}

beforeAll(async () => {
  await prepareElkOnce();
});

describe('class comment-bytes authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk plus the issue fixture, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(existsSync(paths(row).svg), `${row}: no jar .svg`).toBe(true);
  });

  it('every open row names its mechanism or issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/\bD[1-3]\b|#\d+/.test(v.reason))).toEqual([]);
  });
});

describe('class comment-bytes authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: comments equal the jar's`, () => {
      const { ours, jar } = commentsOf(row);
      expect(firstCommentDiff(ours, jar), `${row}: first comment diff`).toBe('');
    });
  }
});

describe('class comment-bytes authored fixtures — open rows never rise', () => {
  for (const [row, { maxMismatch, reason }] of Object.entries(OPEN)) {
    it(`${row}: mismatch <= ${String(maxMismatch)} (${reason})`, () => {
      const { ours, jar } = commentsOf(row);
      const mismatch = commentMismatch(ours, jar);
      expect(mismatch, `${row}: comments now equal the jar's — move it to ZERO`).toBeGreaterThan(0);
      expect(mismatch, `${row}: first comment diff ${firstCommentDiff(ours, jar)}`).toBeLessThanOrEqual(maxMismatch);
    });
  }
});
