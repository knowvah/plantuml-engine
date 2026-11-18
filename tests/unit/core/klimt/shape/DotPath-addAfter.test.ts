/**
 * `DotPath#addAfter`, both overloads (ipe D4).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/DotPath.java:328-338
 */
import { describe, expect, it } from 'vitest';
import { DotPath, type Bezier } from '../../../../../src/core/klimt/shape/DotPath.js';

const FIRST: Bezier = { x1: 0, y1: 0, ctrlx1: 1, ctrly1: 1, ctrlx2: 2, ctrly2: 2, x2: 3, y2: 3 };
const SECOND: Bezier = { x1: 3, y1: 3, ctrlx1: 4, ctrly1: 4, ctrlx2: 5, ctrly2: 5, x2: 6, y2: 6 };
const THIRD: Bezier = { x1: 6, y1: 6, ctrlx1: 7, ctrly1: 7, ctrlx2: 8, ctrly2: 8, x2: 9, y2: 9 };

describe('DotPath#addAfter', () => {
  it('appends one bezier to a copy, leaving the receiver unchanged', () => {
    const path = DotPath.fromBeziers([FIRST]);
    const result = path.addAfter(SECOND);
    expect(result.getBeziers()).toEqual([FIRST, SECOND]);
    expect(path.getBeziers()).toEqual([FIRST]);
  });

  it("appends another path's beziers to a copy, leaving both unchanged", () => {
    const path = DotPath.fromBeziers([FIRST]);
    const other = DotPath.fromBeziers([SECOND, THIRD]);
    const result = path.addAfter(other);
    expect(result.getBeziers()).toEqual([FIRST, SECOND, THIRD]);
    expect(path.getBeziers()).toHaveLength(1);
    expect(other.getBeziers()).toHaveLength(2);
  });

  it('starts from an empty path', () => {
    expect(new DotPath().addAfter(FIRST).getEndPoint()).toEqual({ x: 3, y: 3 });
  });
});
