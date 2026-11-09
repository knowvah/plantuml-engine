/**
 * laep T3c: a partition with no content is muted to `LeafType.EMPTY_PACKAGE` and drawn as a node by
 * `EntityImageEmptyPackage` (`GraphvizImageBuilder.java:416-418`, `GeneralImageBuilder.java:201-205`). Jar values: the
 * oracle `tests/fixtures/activity-legacy/partition-empty.svg`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { renderLegacy } from '../../helpers/legacy-activity-render.js';

const DIR = join(import.meta.dirname, '../../fixtures/activity-legacy');
/** The folder tab polygon of the jar oracle (no `<g>` around it: the image draws none). */
const TAB_POLYGON = '<polygon points="16,6,31.363,6,38.363,26,45.363,26,45.363,54,16,54,16,6"';

describe('an empty partition', () => {
  const puml = readFileSync(join(DIR, 'partition-empty.puml'), 'utf8');

  it('draws the package tab with the jar geometry', () => {
    expect(renderLegacy(puml)).toContain(TAB_POLYGON);
  });

  it('partition-empty: no SVG diff', () => {
    const oracle = readFileSync(join(DIR, 'partition-empty.svg'), 'utf8');
    expect(compareSvg(renderLegacy(puml), oracle, 'deterministic').diffs).toEqual([]);
  });
});

describe('an empty inner activity', () => {
  const puml = readFileSync(join(DIR, 'empty-inner-brace.puml'), 'utf8');

  it('draws the state box the jar draws: 50 high, separator at the name line', () => {
    const svg = renderLegacy(puml);
    expect(svg).toContain('<rect x="7" y="66" width="58.762" height="50"');
    expect(svg).toContain('<line x1="7" y1="90" x2="65.762" y2="90"');
  });

  it('empty-inner-brace: no SVG diff', () => {
    const oracle = readFileSync(join(DIR, 'empty-inner-brace.svg'), 'utf8');
    expect(compareSvg(renderLegacy(puml), oracle, 'deterministic').diffs).toEqual([]);
  });
});
