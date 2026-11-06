/**
 * ubt-T1b: a stereotyped box reads ONE merged style, `FtileBox.create`
 * (`FtileBox.java:138-146`, `getStyleSignature().withTOBECHANGED(stereotype)
 * .getMergedStyle(styleBuilder)`), so `LineThickness`, `FontSize`, `FontName`,
 * `FontStyle`, `Padding`, `RoundCorner`, `Shadowing`, `MaximumWidth` and
 * `MinimumWidth` of a `<style> .class` all reach the box (`FtileBox.java:164-176,208`).
 *
 * Each `tests/fixtures/ubt-T1b/<name>/in.svg` is the jar's own render: the four
 * corpus rows (`gucipa-88-xoti966`, `ticini-08-zico145`, `xebuce-87-poba093`,
 * `xevumo-18-luvo279`) or `scripts/oracle-render.sh` output (every other name).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { stereotypesSpread } from '../../../src/diagrams/activity/dispatch-stereogroup.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = join(HERE, '../../fixtures/ubt-T1b');

type RenderOptions = NonNullable<Parameters<typeof renderSync>[1]>;

function renderFixture(name: string): { ours: string; jar: string } {
  const dir = join(FIXTURE_ROOT, name);
  const options = {
    jarCompatibleStyleInput: true,
    measurer: new DeterministicMeasurer(),
    includeStore: fixtureIncludeStore(),
    filename: 'in.puml',
  } as RenderOptions;
  return {
    ours: renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options),
    jar: readFileSync(join(dir, 'in.svg'), 'utf8'),
  };
}

describe('ubt-T1b every fixture equals its oracle', () => {
  for (const name of readdirSync(FIXTURE_ROOT).sort()) {
    it(`${name}: 0 compareSvg diffs`, () => {
      const { ours, jar } = renderFixture(name);
      expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
    });
  }
});

describe('ubt-T1b a stereotype that changes nothing the box reads', () => {
  const options = {
    jarCompatibleStyleInput: true,
    measurer: new DeterministicMeasurer(),
    filename: 'in.puml',
  } as RenderOptions;

  it('draws as the unstereotyped box does (the flat readers stay its reader)', () => {
    const style = '<style>\n.other {\n  LineThickness 3\n}\n</style>\n';
    const stereotyped = renderSync(`@startuml\n${style}:Hello; <<foo>>\n@enduml\n`, options);
    const plain = renderSync(`@startuml\n${style}:Hello;\n@enduml\n`, options);
    expect(stereotyped).toBe(plain);
  });

  it('reads every label of the group, in order (`Stereogroup#buildStereotype`)', () => {
    const style = '<style>\n.b {\n  LineThickness 4\n}\n</style>\n';
    const svg = renderSync(`@startuml\n${style}:Hello; <<save>> <<b>>\n@enduml\n`, options);
    expect(svg).toMatch(/<polygon [^>]*stroke-width="4"/);
  });
});

describe('ubt-T1b stereotypesSpread', () => {
  it('keeps every label of the group, trimmed, in Stereogroup order', () => {
    expect(stereotypesSpread('<<save>> <<b>>')).toEqual({ stereotypes: ['save', 'b'] });
    expect(stereotypesSpread(' <<a>><< c >>')).toEqual({ stereotypes: ['a', 'c'] });
  });

  it('has none without a stereogroup', () => {
    expect(stereotypesSpread(undefined)).toEqual({});
  });
});
