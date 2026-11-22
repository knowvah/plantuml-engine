/**
 * Authored unresolved-colour gate (ucol, issue #145, D5): a colour token `HColorSet` cannot parse still draws a valid
 * colour wherever the jar draws. Each call site picks its answer from one `HColorSet` method (`HColorSet.java:58-76`):
 * an arrow-style token takes `getColorOrWhite` (`WithLinkType.java:161-163`), a `name:value` part takes
 * `getColorOrNull` and claims its key (`Colors.java:105-113`), and a `<style>` value takes `getColorOrWhite` through
 * `ValueImpl.asColor` (`ValueImpl.java:92-108`). Rows are exactly the `.puml` files under
 * `tests/fixtures/unresolved-colour/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * - Every row draws no invalid colour (`invalidColours`), and neither does its jar oracle (a fixture check). An OPEN
 *   row whose task has not landed carries `invalid: true`, which inverts the first assertion for that row only: it
 *   must still draw one, so a stale flag fails.
 * - A ZERO row renders at 0 diffs.
 * - An OPEN row's diff count never rises, and its `reason` names the issue (and, before it lands, the task) that holds
 *   its residual.
 * - A NEUTRAL row (auc, issue #189, D3) is a site where the jar calls the throwing `HColorSet#getColor`
 *   (`HColorSet.java:69-76`) and `SingleLineCommand2.java:176-177` turns the `NoSuchColorException` into
 *   `badColor()`: the jar draws an error page carrying `jar`. By the maintainer's #143 ruling (2026-11-04) we draw
 *   instead, emit no invalid colour, and paint `UNKNOWN_COLOR_NEUTRAL` at the site. No diff count is asserted: the
 *   jar's error page is not compared (2026-10-10 ruling). A row whose task has not landed carries `pending: '<task>'`,
 *   which inverts the neutral and invalid assertions together: it must still lack the neutral, so a stale flag fails.
 *   A row whose colour has no drawn site in either engine carries `unseen` (its upstream reason): it must draw no
 *   invalid colour and no neutral.
 *
 * Rendered as the survey renders (`scripts/svg-parity-survey.ts`): `renderSync` + `DeterministicMeasurer`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';
import { UNKNOWN_COLOR_NEUTRAL } from '../../../src/core/klimt/color/HColorSet.js';
import { invalidColours } from '../../helpers/svg-colour-validity.js';
import { compareSvg } from './compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/unresolved-colour');

/** Rows at 0 diffs. */
const ZERO: readonly string[] = [
  // 2026-11-15 ucol T1a: guards, already at 0 on `5bab49f41`. State goes through `core/decoration/WithLinkType.ts`
  // and `core/abel/Colors.ts`; description's style path through `ValueImpl.asColor` (`style-reads.ts#stylePaint`).
  'state-arrow',
  'state-line',
  'state-text',
  'class-note-line',
  'act-partition-header',
  'act-partition-line',
  'skin-arrow',
  'skin-class-bg',
  'style-comp-bg',
  'style-root-bg-comp',
  // 2026-11-15 ucol T2a: M1, a class link's arrow-style token is `getColorOrWhite` (`WithLinkType.java:161-163`).
  'class-arrow',
  'seq-arrow',
  'class-arrow-comma',
  // 2026-11-15 ucol T2b: M2, a `name:value` part is `getColorOrNull` and a null claims its key (`Colors.java:111-113`);
  // the link's trailing colour is one `COLORS_REGEXP` capture (`CommandLinkClass.java:160`), never a label.
  'class-line',
  'class-line-override',
  'class-package-line',
  'class-link-colors',
  // 2026-11-15 ucol T2c: M3, a `<style>` colour value is `Value#asColor` -> `getColorOrWhite` (`ValueImpl.java:92-108`).
  'style-class-bg',
  'style-root-bg',
  'style-root-font',
  'style-arrow-line',
  // 2026-11-15 ucol T3a: M1, description's arrow-style token is `getColorOrWhite` (`CommandLinkElement.java:330`).
  'comp-arrow',
  'comp-arrow-dashed',
  // 2026-11-15 ucol T3b: M2, a description `name:value` part is `getColorOrNull` and a null claims its key
  // (`Colors.java:111-113`). `comp-text-override` is authored: the jar draws the default, so the null replaced red.
  'comp-text',
  'uc-back',
  'deploy-node-text',
  'comp-text-override',
  'comp-link-colors',
  // 2026-11-22 auc T1: activity guards, #189. The jar draws each one: a valid, transparent or gradient arrow colour,
  // a style keyword, `-[]->` (no `LINE_STYLE` inside the brackets, so not an arrow, `CommandLinkElement.java:88-94`),
  // and a leading `#zzblue:` on a box, `if`, `elseif`, `while`, `repeat` or `switch`.
  'act-arrow-valid',
  'act-arrow-empty',
  'act-arrow-bold',
  'act-arrow-named',
  'act-arrow-transparent',
  'act-arrow-gradient',
  'act-action-color',
  'act-if-color',
  'act-while-color',
  'act-elseif-color',
  'act-repeat-color',
  'act-switch-color',
  'act-activity-long',
  // 2026-11-22 auc T2b: a valid lane colour on two lanes (the jar draws the fill), beside `act-swimlane-two`.
  'act-swimlane-two-valid',
];

interface OpenRow {
  readonly maxDiffs: number;
  readonly reason: string;
  /** Our render still emits an invalid colour; the task named in `reason` removes the flag (D5). */
  readonly invalid?: true;
}

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-15 ucol T1a: the 17 open probes. T2a moved 3 to ZERO, T2b 4, T2c 4, T3a 2, and T3b 4 plus its authored row:
  // empty since T3b, so no row carries `invalid: true` (D5).
  // 2026-11-22 auc T2a: `else (-[#c]-> no)` on the two-branch `if` never reaches the edge, valid colour or not: the
  // else `Branch`'s `labelPositive` rainbow (`InstructionIf.java:173`, `Branch.java:166-167`) is unported on that path.
  // The jar errors on `act-else-when` (`No such color`), so its count is against the error page; it joins NEUTRAL
  // once the colour flows through `memberLook`.
  'act-else-when': { maxDiffs: 52, reason: '#230: else WHEN_COLOR unported on the two-branch if' },
  'act-else-when-valid': { maxDiffs: 4, reason: '#230: else WHEN_COLOR unported on the two-branch if' },
};

interface NeutralRow {
  /** The message the jar's error page carries. */
  readonly jar: string;
  /** The auc task that paints the neutral at this row's site; dropped when it lands (D3). */
  readonly pending?: string;
  /** Why no drawn element carries the colour, with its upstream `file:line`: the row asserts we draw, with no invalid
   *  colour and no neutral. */
  readonly unseen?: string;
}

const NO_SUCH_COLOR = 'No such color';

/** Row -> the jar's error message, and the task that has yet to paint the neutral there. */
const NEUTRAL: Readonly<Record<string, NeutralRow>> = {
  // 2026-11-22 auc T1: arrow colours, `HtmlColorAndStyle.java:100` via `Rainbow.java:109-118`, and `link #c`,
  // `CommandLink3.java:84`. Neutral since auc T2a (`activity-rainbow.ts#memberLook`).
  'act-arrow': { jar: NO_SUCH_COLOR },
  'act-arrow-label': { jar: NO_SUCH_COLOR },
  'act-arrow-style': { jar: NO_SUCH_COLOR },
  'act-arrow-rainbow': { jar: NO_SUCH_COLOR },
  'act-arrow-long': { jar: NO_SUCH_COLOR },
  'act-repeatwhile': { jar: NO_SUCH_COLOR },
  'act-backward-in': { jar: NO_SUCH_COLOR },
  'act-backward-out': { jar: NO_SUCH_COLOR },
  'act-elseif-incoming': { jar: NO_SUCH_COLOR },
  'act-elseif-when': { jar: NO_SUCH_COLOR },
  'act-link3': { jar: NO_SUCH_COLOR },
  // 2026-11-22 auc T2a: authored. A `LINE_STYLE` keyword `LinkStyle.fromString2` does not know (`LinkStyle.java:133-147`:
  // only dashed, dotted, bold, hidden) is a colour to `HtmlColorAndStyle.java:100` too, so `thickness=3`, `plain` and
  // `norank` raise `No such color`; so do an unknown colour beside a style, and one inside a `fork`.
  'act-arrow-thickness': { jar: NO_SUCH_COLOR },
  'act-arrow-plain': { jar: NO_SUCH_COLOR },
  'act-arrow-norank': { jar: NO_SUCH_COLOR },
  'act-arrow-bold-unknown': { jar: NO_SUCH_COLOR },
  'act-arrow-fork': { jar: NO_SUCH_COLOR },
  // 2026-11-22 auc T1: `|#zzblue|L1|`, `CommandSwimlane.java:98`. Neutral since auc T2b (`node-dispatch.ts#trySwimlane`).
  // A single lane is never drawn, so its colour has no site; T2b authored the two-lane rows, the colour on the first
  // lane and on a later one.
  'act-swimlane': {
    jar: NO_SUCH_COLOR,
    unseen: 'one lane draws no lane: `swimlanes().size() > 1` gates `drawWhenSwimlanes` (`Swimlanes.java:253-259`)',
  },
  'act-swimlane-two': { jar: NO_SUCH_COLOR },
  'act-swimlane-later': { jar: NO_SUCH_COLOR },
  // 2026-11-22 auc T1: a bare note colour, `Colors.java:103` via `CommandNoteLong3.java:129`, `CommandNote3.java:127`.
  // Neutral since auc T2c (`note-dispatch.ts#noteColorSpread`).
  'act-note-multi': { jar: NO_SUCH_COLOR },
  'act-note-single': { jar: NO_SUCH_COLOR },
  // 2026-11-22 auc T2c: authored, a `floating` note (`NoteType.defaultType`, the same `Colors` path).
  'act-note-floating': { jar: NO_SUCH_COLOR },
  // 2026-11-22 auc T1: already neutral, `CommandCircleSpot3` and `CommandPartition3.java:152`.
  'act-circlespot': { jar: NO_SUCH_COLOR },
  'act-partition-back': { jar: 'Syntax Error?' },
};

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

interface Measured {
  readonly diffs: number;
  readonly ours: readonly string[];
  readonly jar: readonly string[];
}

function renderRow(row: string): string {
  return renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), { measurer: new DeterministicMeasurer() });
}

function measure(row: string): Measured {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderRow(row);
  return {
    diffs: compareSvg(ours, jar, 'deterministic').diffs.length,
    ours: invalidColours(ours),
    jar: invalidColours(jar),
  };
}

/** `row` rendered, and whether our error page drew (`setErrorPageObserver`, as the survey reads it). */
function renderObserved(row: string): { readonly svg: string; readonly errorPage: boolean } {
  let errorPage = false;
  setErrorPageObserver(() => {
    errorPage = true;
  });
  try {
    return { svg: renderRow(row), errorPage };
  } finally {
    setErrorPageObserver(undefined);
  }
}

describe('unresolved-colour authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN), ...Object.keys(NEUTRAL)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8'), row).toContain('<svg');
  });

  it('every open row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });

  it('every pending neutral row names a task of this mission', () => {
    const pending = Object.entries(NEUTRAL).filter(([, v]) => v.pending !== undefined);
    expect(pending.filter(([, v]) => !/^T2[abc]$/.test(v.pending!))).toEqual([]);
  });
});

describe('unresolved-colour authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs, and no invalid colour on either side`, () => {
      const m = measure(row);
      expect(m.jar).toEqual([]);
      expect(m.ours).toEqual([]);
      expect(m.diffs).toBe(0);
    });
  }
});

describe('unresolved-colour authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason, invalid }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)}${invalid === true ? ', invalid colour pending' : ''} (${reason})`, () => {
      const m = measure(row);
      expect(m.jar).toEqual([]);
      // A pending flag on a row that is already clean is stale: the landing task drops it (D5).
      if (invalid === true) expect(m.ours.length, `${row}: valid now, drop invalid: true`).toBeGreaterThan(0);
      else expect(m.ours).toEqual([]);
      expect(m.diffs).toBeLessThanOrEqual(maxDiffs);
    });
  }
});

describe('unresolved-colour authored fixtures — neutral rows (the jar errors, we draw neutral grey)', () => {
  for (const [row, { jar, pending, unseen }] of Object.entries(NEUTRAL)) {
    it(`${row}: jar says ${jar}, ours draws${pending === undefined ? ' neutral' : `, neutral pending ${pending}`}`, () => {
      const jarSvg = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
      expect(jarSvg).toContain(jar);
      const { svg, errorPage } = renderObserved(row);
      expect(errorPage, `${row}: ours drew an error page`).toBe(false);
      if (unseen !== undefined) {
        expect(invalidColours(svg)).toEqual([]);
        expect(svg.includes(UNKNOWN_COLOR_NEUTRAL), `${row}: ${unseen}`).toBe(false);
      } else if (pending === undefined) {
        expect(invalidColours(svg)).toEqual([]);
        expect(svg).toContain(UNKNOWN_COLOR_NEUTRAL);
      } else {
        // A pending flag on a row that already paints the neutral is stale: the landing task drops it (D3).
        expect(svg.includes(UNKNOWN_COLOR_NEUTRAL), `${row}: neutral now, drop pending: '${pending}'`).toBe(false);
      }
    });
  }
});
