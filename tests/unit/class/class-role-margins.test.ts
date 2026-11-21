/**
 * Role-label node margins (`SvekEdge#reserveRoomForRoles`, upstream
 * a5731db447f). Jar values are read off the cached `svek-1.dot` of
 * `mugobo-34-fede498` (`User "owner which is very long"/1 -- "0..n"/items
 * Item`): `User` (role `1`) carries `WIDTH="10.0"` side cells and `Item`
 * (role `items`, 31.038 wide) `WIDTH="34.0"` — `ceil(width) + 2`.
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { parseRelationshipLine } from '../../../src/diagrams/class/class-relationship-parser.js';
import { roleMarginsByEntity } from '../../../src/diagrams/class/class-role-margins.js';

const measurer = new DeterministicMeasurer();
const CTX = { measurer, classAttributeIconSize: 10 };
const FONT = { family: defaultTheme.cardinalityFontFamily!, size: defaultTheme.cardinalityFontSize! };

describe('roleMarginsByEntity', () => {
  const rels = [parseRelationshipLine('User "owner which is very long"/1 -- "0..n"/items Item')!];
  const margins = roleMarginsByEntity(rels, FONT, CTX);

  it('reserves ceil(role width) + 2 on both sides of the role entity', () => {
    expect(margins.get('User')).toEqual({ x1: 10, x2: 10, y1: 0, y2: 0 });
    expect(margins.get('Item')).toEqual({ x1: 34, x2: 34, y1: 0, y2: 0 });
  });

  it('reserves nothing for a relationship without roles', () => {
    const plain = [parseRelationshipLine('A "1" -- "2" B')!];
    expect(roleMarginsByEntity(plain, FONT, CTX).size).toBe(0);
  });

  it('counts the visibility icon block (size + 2) in the role width', () => {
    // A probe of the jar (PlantUML 1.2026.11beta1): Company "1"/"-employer"
    // o-- "0..*"/"+employees" Person; Person "1"/"-driver" --> "0..*"/"#cars"
    // Car gives side cells 68 (Company), 77 (Person, the wider of its two
    // roles) and 39 (Car): ceil(53.463 + 12) + 2, ceil(62.888 + 12) + 2.
    const rels2 = [
      parseRelationshipLine('Company "1"/"-employer" o-- "0..*"/"+employees" Person')!,
      parseRelationshipLine('Person "1"/"-driver" --> "0..*"/"#cars" Car')!,
    ];
    const m = roleMarginsByEntity(rels2, FONT, CTX);
    expect(m.get('Company')).toEqual({ x1: 68, x2: 68, y1: 0, y2: 0 });
    expect(m.get('Person')).toEqual({ x1: 77, x2: 77, y1: 0, y2: 0 });
    expect(m.get('Car')).toEqual({ x1: 39, x2: 39, y1: 0, y2: 0 });
  });

  it('adds no icon width when classAttributeIconSize is 0', () => {
    const r = [parseRelationshipLine('Company "1"/"-employer" o-- Person')!];
    const m = roleMarginsByEntity(r, FONT, { measurer, classAttributeIconSize: 0 });
    // the "-" stays in the text: wider than the stripped 53.463 + 2
    expect(m.get('Company')!.x1).toBe(Math.ceil(measurer.measure('-employer', FONT).width) + 2);
  });

  it('keeps the componentwise max when an entity has several roles', () => {
    const two = [parseRelationshipLine('A "1"/x -- B')!, parseRelationshipLine('A "1"/"much wider" -- C')!];
    const m = roleMarginsByEntity(two, FONT, CTX).get('A')!;
    expect(m.x1).toBeGreaterThan(10);
    expect(m.x1).toBe(m.x2);
  });
});
