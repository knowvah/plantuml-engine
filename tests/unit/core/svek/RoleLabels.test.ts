/**
 * `svek/RoleLabels.java` (upstream a5731db447f): the role block's data half
 * and the placement rules. Expected values are hand-evaluated from the Java
 * (`getPosition`/`getMirroredPosition`/`searchFreePosition`), with the file:line
 * of the branch each case takes.
 */
import { describe, it, expect } from 'vitest';
import { createRoleBlock, getPosition } from '../../../../src/core/svek/RoleLabels.js';

describe('createRoleBlock (RoleLabels.java:72-96)', () => {
  it('turns a leading visibility character into the FIELD icon and strips it', () => {
    const b = createRoleBlock('-employer', 10);
    expect(b.text).toBe('employer');
    // withMargin(icon, 0, 1, 2, 0) of the (size + 1) square: 12 x 13
    expect(b.icon).toEqual({ modifier: 'PRIVATE_FIELD', width: 12, height: 13 });
  });

  it.each([
    ['#prot', 'PROTECTED_FIELD'],
    ['~pkg', 'PACKAGE_PRIVATE_FIELD'],
    ['+pub', 'PUBLIC_FIELD'],
    ['*mand', 'IE_MANDATORY'],
  ])('maps %s to %s', (role, modifier) => {
    expect(createRoleBlock(role, 10).icon?.modifier).toBe(modifier);
  });

  it('trims the text after the stripped character', () => {
    expect(createRoleBlock('+  pub', 10).text).toBe('pub');
  });

  it('keeps the role as written without a visibility character', () => {
    expect(createRoleBlock('owner', 10)).toEqual({ text: 'owner' });
  });

  it('keeps the role as written when classAttributeIconSize is 0', () => {
    expect(createRoleBlock('-owner', 0)).toEqual({ text: '-owner' });
  });

  it('keeps a doubled character as text (getVisibilityModifier: s[1] == c)', () => {
    expect(createRoleBlock('--x', 10)).toEqual({ text: '--x' });
  });
});

const Q_DIM = { width: 20, height: 13 };
const R_DIM = { width: 30, height: 13 };

describe('getPosition (RoleLabels.java:93-120)', () => {
  it('mirrors a vertical line across its X, at the quantifier height (:122-135)', () => {
    // quantifier centre x = 10 + 10 = 20 < lineX 50 -> roleX = 50 + GAP(2).
    const pos = getPosition(
      { qDim: Q_DIM, rDim: R_DIM, quantifierPos: { x: 10, y: 60 } },
      { thisEndpoint: { x: 50, y: 40 }, otherEndpoint: { x: 50, y: 140 } },
      [],
    );
    expect(pos).toEqual({ x: 52, y: 60 });
  });

  it('mirrors to the left when the quantifier is on the right (:136-143)', () => {
    // centre x = 80 + 10 = 90 > 50 -> roleX = 50 - 30 - 2.
    const pos = getPosition(
      { qDim: Q_DIM, rDim: R_DIM, quantifierPos: { x: 80, y: 60 } },
      { thisEndpoint: { x: 50, y: 40 }, otherEndpoint: { x: 50, y: 140 } },
      [],
    );
    expect(pos).toEqual({ x: 18, y: 60 });
  });

  it('keeps clear of a line that bends away at the height of the label (:128-132)', () => {
    // At y in [58, 75] a sample sits at x = 70: the label starts at 70 + GAP.
    const samples = [
      { x: 50, y: 40 },
      { x: 70, y: 66 },
      { x: 50, y: 140 },
    ];
    const pos = getPosition(
      { qDim: Q_DIM, rDim: R_DIM, quantifierPos: { x: 10, y: 60 } },
      { thisEndpoint: { x: 50, y: 40 }, otherEndpoint: { x: 50, y: 140 }, pathSamples: samples },
      [],
    );
    expect(pos.x).toBe(72);
  });

  it('mirrors a horizontal line across its Y (:146-160)', () => {
    // qCenterY = 20 + 6.5 = 26.5 < lineY 50 -> roleY = 50 + GAP, at quantifier x.
    const pos = getPosition(
      { qDim: Q_DIM, rDim: R_DIM, quantifierPos: { x: 70, y: 20 } },
      { thisEndpoint: { x: 40, y: 50 }, otherEndpoint: { x: 240, y: 50 } },
      [],
    );
    expect(pos).toEqual({ x: 70, y: 52 });
  });

  it('puts the role directly below the quantifier on a zero-length line (:101-103)', () => {
    const pos = getPosition(
      { qDim: Q_DIM, rDim: R_DIM, quantifierPos: { x: 10, y: 20 } },
      { thisEndpoint: { x: 5, y: 5 }, otherEndpoint: { x: 5, y: 5 } },
      [],
    );
    expect(pos).toEqual({ x: 10, y: 33 });
  });

  it('moves the role out of a node the mirror image lands in (:109-119, :166-200)', () => {
    const line = { thisEndpoint: { x: 50, y: 40 }, otherEndpoint: { x: 50, y: 140 } };
    const boxes = { qDim: Q_DIM, rDim: R_DIM, quantifierPos: { x: 10, y: 60 } };
    const node = { minX: 52, minY: 50, maxX: 120, maxY: 100 };
    const pos = getPosition(boxes, line, [node]);
    // The mirror image (52, 60) overlaps the node; the search returns a free
    // place: clear of the node and of the quantifier, and within range.
    expect(pos).not.toEqual({ x: 52, y: 60 });
    const free =
      pos.x + R_DIM.width <= node.minX || pos.x >= node.maxX || pos.y + R_DIM.height <= node.minY || pos.y >= node.maxY;
    expect(free).toBe(true);
    const clearOfQuantifier = pos.x >= 10 + Q_DIM.width || pos.y >= 60 + Q_DIM.height || pos.y + R_DIM.height <= 60;
    expect(clearOfQuantifier).toBe(true);
  });

  it('falls back to the mirror image when nothing in range is free (:119)', () => {
    const line = { thisEndpoint: { x: 50, y: 40 }, otherEndpoint: { x: 50, y: 140 } };
    const boxes = { qDim: Q_DIM, rDim: R_DIM, quantifierPos: { x: 10, y: 60 } };
    const everything = { minX: -1000, minY: -1000, maxX: 1000, maxY: 1000 };
    expect(getPosition(boxes, line, [everything])).toEqual({ x: 52, y: 60 });
  });
});
