/**
 * cogr T3f: the page width of a diagram whose widest `json` leaf is a primitive. `getTextBlock` wraps each value cell
 * in `TextBlockUtils.withMargin(result, 5, 2)` (`TextBlockCucaJSon.java:181-190`); `TextBlockMarged#drawU` draws
 * `UEmpty.create(dim)` of the whole cell first (`TextBlockMarged.java:77-80`), and `LimitFinder#drawEmpty` is a plain
 * bbox. A cell as wide as the entity (`true` under a narrower `n1`) therefore ends at `x + w`, one past
 * `drawRectangle`'s `x + w - 1`, which moves the page across an integer. Oracles (`scripts/oracle-render.sh`):
 * style-stereotype-on-arrow-6 (171) and `json n0 42 / json n1 "a b c"` (146, n1 at 91.5 wide 40.275).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const width = (source: string): string | undefined =>
  /<svg[^>]* width="(\d+)px"/.exec(renderSync(source, { measurer: new DeterministicMeasurer() }))?.[1];

describe('json primitive value cell ink (cogr T3f)', () => {
  it('ends the canvas at the value cell, one past the rect corner (arrow row)', () => {
    expect(width('@startuml\njson n0 42\njson n1 true\nn0 -> n1 : label\n@enduml')).toBe('171');
  });

  it('does the same without a link', () => {
    expect(width('@startuml\njson n0 42\njson n1 true\n@enduml')).toBe('142');
  });

  it('does the same for a quoted string value', () => {
    expect(width('@startuml\njson n0 42\njson n1 "a b c"\n@enduml')).toBe('146');
  });
});
