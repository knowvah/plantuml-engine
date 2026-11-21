/**
 * `Element#mayDrawBeyondPreferredDimension` (Element.java:69-71, upstream
 * f63ffe0701a, #2882): `false` by default, `true` on an open droplist
 * (ElementDroplist.java:87-89), delegated by the composites — border
 * (ElementBorder.java:107-111), pyramid (ElementPyramid.java:177-183) and
 * the dictionary wrapper (WrappedElement.java:59-61).
 */
import { describe, expect, it } from 'vitest';
import { mayDrawBeyondPreferredDimension } from '../../../../src/diagrams/salt/element/Element.js';
import { ElementBorder } from '../../../../src/diagrams/salt/element/ElementBorder.js';
import { ElementDroplist } from '../../../../src/diagrams/salt/element/ElementDroplist.js';
import { ElementEmpty } from '../../../../src/diagrams/salt/element/ElementEmpty.js';
import { ElementPyramid } from '../../../../src/diagrams/salt/element/ElementPyramid.js';
import { TableStrategy } from '../../../../src/diagrams/salt/element/TableStrategy.js';
import { WrappedElement } from '../../../../src/diagrams/salt/element/WrappedElement.js';
import { SaltDictionary } from '../../../../src/diagrams/salt/SaltDictionary.js';
import { FONT_12 } from '../salt-test-support.js';
import { dictionary, positionner, text } from './container-test-support.js';

const open = (): ElementDroplist => new ElementDroplist('Smart Mode^m2', FONT_12, new SaltDictionary());
const closed = (): ElementDroplist => new ElementDroplist('Smart Mode', FONT_12, new SaltDictionary());

describe('mayDrawBeyondPreferredDimension', () => {
  it('is false for an element without an override (ElementEmpty, ElementText)', () => {
    expect(mayDrawBeyondPreferredDimension(new ElementEmpty())).toBe(false);
    expect(mayDrawBeyondPreferredDimension(text('a'))).toBe(false);
  });

  it('is true for an open droplist only', () => {
    expect(mayDrawBeyondPreferredDimension(open())).toBe(true);
    expect(mayDrawBeyondPreferredDimension(closed())).toBe(false);
  });

  it('a border delegates to each of its five regions', () => {
    const border = new ElementBorder();
    expect(mayDrawBeyondPreferredDimension(border)).toBe(false);
    for (const set of ['setNorth', 'setSouth', 'setEast', 'setWest', 'setCenter'] as const) {
      const b = new ElementBorder();
      b[set](open());
      expect(mayDrawBeyondPreferredDimension(b)).toBe(true);
    }
  });

  it('a pyramid is true when any of its cells is', () => {
    const plain = new ElementPyramid(positionner([[text('a'), closed()]]), TableStrategy.DRAW_NONE, null, dictionary);
    const withOpen = new ElementPyramid(positionner([[text('a'), open()]]), TableStrategy.DRAW_NONE, null, dictionary);
    expect(mayDrawBeyondPreferredDimension(plain)).toBe(false);
    expect(mayDrawBeyondPreferredDimension(withOpen)).toBe(true);
  });

  it('a wrapped element answers for what it wraps', () => {
    expect(mayDrawBeyondPreferredDimension(new WrappedElement(open()))).toBe(true);
    expect(mayDrawBeyondPreferredDimension(new WrappedElement(closed()))).toBe(false);
  });
});
