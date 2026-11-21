/**
 * Upstream 927f7531ddf / f29aa9bd058: a partition title is built with `create9(..., style.wrapWidth())`, both as a
 * cluster (`ClusterHeader.java:129`) and as the `EntityImageEmptyPackage` an empty partition mutes to
 * (`EntityImageEmptyPackage.java:118-119`). Expected values are the re-pinned jar's (a720bdd) output through
 * `scripts/oracle-render.sh`.
 */
import { describe, expect, it } from 'vitest';

import { renderLegacy } from '../../helpers/legacy-activity-render.js';

const NBSP = ' ';
const TITLE = 'Partition P1 000 111 222 333 444 555';

/** Every `<text>` as `[x, y, content]`, in document order. */
function texts(svg: string): [string, string, string][] {
  return [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => [m[1]!, m[2]!, m[3]!]);
}

/** The jar's three stripes, each centred on the widest (`Partition P1 000`, 99.574 wide). */
const JAR_TITLE: [string, string, string][] = [
  ['20', '18.889', 'Partition'],
  ['71.362', '18.889', NBSP],
  ['75.212', '18.889', 'P1'],
  ['92.362', '18.889', NBSP],
  ['96.212', '18.889', '000'],
  ['30.894', '32.889', '111'],
  ['54.256', '32.889', NBSP],
  ['58.106', '32.889', '222'],
  ['81.469', '32.889', NBSP],
  ['85.319', '32.889', '333'],
  ['44.5', '46.889', '444'],
  ['67.862', '46.889', NBSP],
  ['71.712', '46.889', '555'],
];

describe('a partition title wraps at MaximumWidth', () => {
  it('as a cluster title (ClusterHeader)', () => {
    const svg = renderLegacy(
      ['@startuml', 'skinparam wrapWidth 100', `partition "${TITLE}" {`, '(*) --> "First"', '}', '@enduml'].join('\n'),
    );
    expect(texts(svg).slice(0, 13)).toEqual(JAR_TITLE);
  });

  it('as an empty partition (EntityImageEmptyPackage)', () => {
    const svg = renderLegacy(
      ['@startuml', 'skinparam wrapWidth 100', `partition "${TITLE}" {`, '}', '(*) --> A', 'A --> (*)', '@enduml'].join(
        '\n',
      ),
    );
    expect(texts(svg).slice(0, 13)).toEqual(JAR_TITLE);
    // Jar: the folder tab of the 119.575 x 104 leaf.
    expect(svg).toContain('<polygon points="16,6,121.575,6,128.575,54,135.575,54,135.575,110,16,110,16,6"');
  });
});
