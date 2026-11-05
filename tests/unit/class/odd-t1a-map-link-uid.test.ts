/**
 * odd T1a: `CommandCreateMap#executeNow` runs `new Link(...)` inside its row loop, so a linked row takes its uid from
 * the counter the next statement's entity also draws on (`abel/Link.java:135`, `abel/Entity.java:171`). The block's
 * three errors land on its closing line, as `PSystemError#getLineLocation` does (`error/PSystemError.java:102-104`).
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T1a';
const DRAWN = ['linked-then-object', 'two-linked-rows', 'link-to-self'];

/** The `id` of every entity and link of a render, in document order. */
function uids(name: string): readonly string[] {
  return [...renderJarFixture(DIR, name).matchAll(/\bid="((?:ent|lnk)\d+)"/g)].map((m) => m[1]!);
}

describe('a linked map row numbers when the map is built', () => {
  it.each(DRAWN)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('the link takes its number before the next object', () => {
    expect(uids('linked-then-object')).toEqual(['ent0001', 'ent0002', 'ent0004', 'lnk3']);
  });

  it('two linked rows and a later edge keep the jar order', () => {
    expect(uids('two-linked-rows')).toEqual(['ent0001', 'ent0002', 'ent0003', 'ent0006', 'lnk4', 'lnk5', 'lnk7']);
  });
});

describe('a refused map block draws the jar error page', () => {
  it.each([
    ['link-to-missing', 'No such entity London'],
    ['link-to-missing-in-package', 'No such entity London'],
    ['not-a-row', 'Map definition should contains key => value'],
  ])('%s', (name, message) => {
    const svg = renderJarFixture(DIR, name);
    expect(svg).toContain('(line 5) ]');
    expect(svg).toContain(`${message} (Assumed diagram type: class)`);
  });
});
