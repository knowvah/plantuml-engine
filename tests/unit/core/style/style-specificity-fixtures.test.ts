/**
 * Upstream c9d62097ff5 (the trie-backed style engine) against the jar: its six
 * `vega/nonreg` fixtures (YAML front matter stripped), plus two authored for the
 * precedence outcomes it changed. Each `oracle/<name>.svg` is the jar's
 * (`scripts/oracle-render.sh`).
 *
 * - `label-fold-file-order`: an element tagged `<<foo>><<bar>>` is ONE query
 *   requiring both labels (`StyleQuery#withStereotype(Stereotype)`,
 *   StyleQuery.java:93-105), so `.foo` and `.bar` compete on `Specificity` and the
 *   LATER declaration wins whatever the label order -- it used to be the first label
 *   (`StyleSignatures` + `KEEP_EXISTING_VALUE_OF_STEREOTYPE`).
 * - `compound-stereotype-wins`: a selector naming two stereotypes (`.foo { .bar }`,
 *   `skinparam rectangle<<baz&qux>>`) beats a one-stereotype selector declared later
 *   (`Specificity#compareTo`'s stereotype-count tier, Specificity.java:143-145).
 */
import { describe, expect, it } from 'vitest';

import type { Diff } from '../../../oracle/svg-conformance/compare.js';
import { fixtureIncludeStore } from '../../../helpers/fixture-include-store.js';
import { jarFixtureDiffs, jarFixtureNames } from '../../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/style-specificity';

/**
 * `@startjson`/`@startyaml` lay out through Smetana upstream and dot-engine here (CLAUDE.md
 * "One layout engine"): their geometry delta is accepted, their colours are not.
 */
const SMETANA_FIXTURES = new Set(['style-highlight-with-style-tags', 'theme-with-empty-style-block']);

/**
 * `Stereogroup#getInnerColors`'s `label.contains(":") && label.contains(";")` branch (an inline
 * `<<Prop:value;Prop:value;>>` list, Stereogroup.java:192) has no port yet; the jar paints
 * `:foo1;` blue with red text. Not a precedence outcome: it renders the same before and after
 * c9d62097ff5.
 */
const UNPORTED_FIXTURES = new Set(['inline-semicolon-property-list']);

/** A diff on an attribute that only the layout engine decides. */
const GEOMETRY_ATTRIBUTE = /@(x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|width|height|points|textLength|d\[\d+\]|viewBox\[\d+\])$/;

function nonGeometric(diffs: readonly Diff[]): readonly Diff[] {
  return diffs.filter((diff) => !GEOMETRY_ATTRIBUTE.test(diff.path));
}

const names = jarFixtureNames(DIR);
/** `!theme amiga` resolves through the bundled themes, as the survey renders it. */
const diffs = (name: string): readonly Diff[] => jarFixtureDiffs(DIR, name, { includeStore: fixtureIncludeStore() });

describe('c9d62097ff5 style-engine fixtures against the jar', () => {
  it('collects every fixture', () => {
    expect(names.length).toBe(8);
  });

  it.each(names.filter((name) => !SMETANA_FIXTURES.has(name) && !UNPORTED_FIXTURES.has(name)))('%s', (name) => {
    expect(diffs(name)).toEqual([]);
  });

  it.each([...SMETANA_FIXTURES])('%s: every colour and text matches (Smetana geometry accepted)', (name) => {
    expect(nonGeometric(diffs(name))).toEqual([]);
  });

  it.fails.each([...UNPORTED_FIXTURES])('%s: the inline stereogroup property list is unported', (name) => {
    expect(diffs(name)).toEqual([]);
  });
});
