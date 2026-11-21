/**
 * Role labels with a visibility icon (`RoleLabels#create`, upstream
 * a5731db447f). Every number is read off a probe of the pinned jar
 * (1.2026.11beta1) rendered through `scripts/oracle-render.sh`:
 *
 *   Company "1"/"-employer" o-- "0..*"/"+employees" Person
 *     tail role: `<text x="44.513" y="72.927">1</text>`, then
 *     `<rect x="56.5" y="66.816" width="6" height="6">` in
 *     `data-visibility-modifier="PRIVATE_FIELD"`, then
 *     `<text x="66.5" y="72.927" textLength="53.463">employer</text>`
 *     on the vertical line `M52.5,67 C… 52.5,124.04`.
 *   A /"-tailOnly" --> B (a role with no quantifier)
 *     `taillabel` table `WIDTH="55" HEIGHT="13"` = trunc(12 + 43.388).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { placeRoleLabel } from '../../../src/diagrams/class/class-edge-role-label-anchor.js';
import { reservedLabelBox } from '../../../src/diagrams/class/class-role-label-box.js';

const measurer = new DeterministicMeasurer();
const font = { family: 'sans-serif', size: 13 };

describe('placeRoleLabel — icon merged left of the text', () => {
  const baselineOffset = font.size - measurer.getDescent(font, '1');
  const quantifierBox = {
    pos: { x: 44.513, y: 72.927 - baselineOffset },
    maxWidth: measurer.measure('1', font).width,
    totalHeight: 13,
  };
  const line = { thisEnd: { x: 52.5, y: 67 }, otherEnd: { x: 52.5, y: 124.04 } };
  const placed = placeRoleLabel('-employer', quantifierBox, line, { measurer, font });

  it('draws the icon block at the mirrored x, 2 below the block top', () => {
    // block top = quantifier top 62.816; rect y 66.816 = 62.816 + 2 (marginY1) + 2 (drawSquare)
    expect(placed.icon?.modifier).toBe('PRIVATE_FIELD');
    expect(placed.icon?.x).toBeCloseTo(54.5, 6);
    expect((placed.icon?.y ?? 0) + 2).toBeCloseTo(66.816, 3);
  });

  it('draws the text size + 2 to the right of the icon block, without the character', () => {
    expect(placed.lines).toHaveLength(1);
    expect(placed.lines[0]!.text).toBe('employer');
    expect(placed.lines[0]!.x).toBeCloseTo(66.5, 6);
    expect(placed.lines[0]!.y).toBeCloseTo(72.927, 3);
  });

  it('is unchanged for a role with no visibility character', () => {
    const plain = placeRoleLabel('owner', quantifierBox, line, { measurer, font });
    expect(plain.icon).toBeUndefined();
    expect(plain.lines[0]!.x).toBeCloseTo(54.5, 6);
  });

  it('draws the character as text when classAttributeIconSize is 0', () => {
    const noIcon = placeRoleLabel('-employer', quantifierBox, line, { measurer, font, classAttributeIconSize: 0 });
    expect(noIcon.icon).toBeUndefined();
    expect(noIcon.lines[0]!.text).toBe('-employer');
  });
});

describe('reservedLabelBox — a role standing in for the quantifier', () => {
  const ctx = { measurer, classAttributeIconSize: 10 };

  it('reserves the merged block: icon width added to the text width', () => {
    const box = reservedLabelBox('-tailOnly', true, font, ctx);
    expect(box.reservedWidth).toBe(55);
    expect(box.reservedHeight).toBe(13);
  });

  it('reserves the text alone for a role without an icon', () => {
    expect(reservedLabelBox('tailOnly', true, font, ctx).reservedWidth).toBe(43);
  });

  it('never strips a quantifier: only a role carries the icon', () => {
    expect(reservedLabelBox('-1', false, font, ctx).reservedWidth).toBe(Math.floor(measurer.measure('-1', font).width));
  });
});

describe('class rendering — role icons (probe of the jar)', () => {
  const svg = renderSync(
    '@startuml\nclass Company\nclass Person\nCompany "1"/"-employer" o-- "0..*"/"+employees" Person\n@enduml',
    { measurer },
  );

  it('wraps each role icon in its FIELD modifier group, drawn hollow', () => {
    expect(svg).toContain('data-visibility-modifier="PRIVATE_FIELD"');
    expect(svg).toContain('data-visibility-modifier="PUBLIC_FIELD"');
    expect(svg).not.toContain('data-visibility-modifier="PRIVATE_METHOD"');
  });

  it('draws the role text without its visibility character', () => {
    expect(svg).toMatch(/>employer</);
    expect(svg).toMatch(/>employees</);
    expect(svg).not.toMatch(/>-employer</);
  });
});
