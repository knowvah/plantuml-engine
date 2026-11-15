/**
 * ele T1a: the core edge-label embed helper — `CreoleParser#createSheetSlow`'s walk, the `EmbeddedDiagram` atom and
 * `SheetBlock1`'s stripe stacking.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import {
  edgeLabelEmbedAtom,
  edgeLabelEmbedDimension,
  splitEdgeLabelEmbeds,
  stackEdgeLabelStripes,
} from '../../../src/core/svek/edge-label-embed.js';
import { EmbeddedDiagramDepthError, type NestedDiagramRenderer } from '../../../src/core/EmbeddedDiagram.js';
import { getNestedDiagramRenderer, registerNestedDiagramRenderer } from '../../../src/core/nested-diagram-registry.js';
import { createNestedDiagramRenderer } from '../../../src/diagrams/class/class-nested-diagram-renderer.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../../src/core/klimt/shape/TextBlock.js';

/** The Welcome page of an empty embedded `@startuml` (`svek-1.dot` of state/xetase-70-zaza808: 544x239 less 2x6). */
const WELCOME_WIDTH = 532;
const WELCOME_HEIGHT = 227;
/** `EmbeddedDiagram.java:152`: `return new XDimension2D(42, 42);`. */
const FALLBACK_SIZE = 42;

describe('splitEdgeLabelEmbeds (CreoleParser.java:146-170)', () => {
  it('turns an unterminated `{{` into one empty uml embed', () => {
    expect(splitEdgeLabelEmbeds(['{{'])).toEqual([{ kind: 'embed', source: ['@startuml', '@enduml'] }]);
  });

  it('keeps the text runs on either side of an embed', () => {
    expect(splitEdgeLabelEmbeds(['a', '{{', 'class X', '}}', 'b'])).toEqual([
      { kind: 'text', lines: ['a'] },
      { kind: 'embed', source: ['@startuml', 'class X', '@enduml'] },
      { kind: 'text', lines: ['b'] },
    ]);
  });

  it('returns undefined when no line opens an embed', () => {
    expect(splitEdgeLabelEmbeds(['plain'])).toBeUndefined();
  });

  it('keeps a nested closer and swallows only the outer one (EmbeddedDiagram.java:101-110)', () => {
    expect(splitEdgeLabelEmbeds(['{{', '{{salt', '}}', '}}', 'after'])).toEqual([
      { kind: 'embed', source: ['@startuml', '{{salt', '}}', '@enduml'] },
      { kind: 'text', lines: ['after'] },
    ]);
  });

  it('types the embed from its opener (EmbeddedDiagram.getEmbeddedType)', () => {
    expect(splitEdgeLabelEmbeds(['{{salt', '{a}', '}}'])).toEqual([
      { kind: 'embed', source: ['@startsalt', '{a}', '@endsalt'] },
    ]);
  });
});

describe('edgeLabelEmbedAtom (EmbeddedDiagram.java:126-152)', () => {
  let saved: NestedDiagramRenderer | undefined;
  beforeEach(() => {
    saved = getNestedDiagramRenderer();
  });
  afterEach(() => {
    if (saved !== undefined) registerNestedDiagramRenderer(saved);
    vi.restoreAllMocks();
  });

  it('measures the Welcome page of an empty embed with the production renderer', () => {
    registerNestedDiagramRenderer(
      createNestedDiagramRenderer((src) => renderSync(src, { measurer: new DeterministicMeasurer() })),
    );
    const atom = edgeLabelEmbedAtom(['@startuml', '@enduml'], null);
    expect(edgeLabelEmbedDimension(atom)).toEqual({ width: WELCOME_WIDTH, height: WELCOME_HEIGHT });
  });

  it('takes the catch arm, 42x42 and logged, when the renderer throws', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    registerNestedDiagramRenderer({
      render(): TextBlock {
        throw new Error('boom');
      },
    });
    const atom = edgeLabelEmbedAtom(['@startuml', '@enduml'], null);
    expect(edgeLabelEmbedDimension(atom)).toEqual({ width: FALLBACK_SIZE, height: FALLBACK_SIZE });
    expect(log).toHaveBeenCalledTimes(1);
  });

  it('lets a recursion-guard trip propagate rather than degrading to 42x42', () => {
    registerNestedDiagramRenderer({
      render(): TextBlock {
        throw new EmbeddedDiagramDepthError(24);
      },
    });
    const atom = edgeLabelEmbedAtom(['@startuml', '@enduml'], null);
    expect(() => edgeLabelEmbedDimension(atom)).toThrow(EmbeddedDiagramDepthError);
  });
});

describe('stackEdgeLabelStripes (SheetBlock1.java:115-194)', () => {
  const stripes = [
    { width: 100, height: 20 },
    { width: 40, height: 10 },
  ];

  it('stacks downward and centres a narrower stripe by diff / 2', () => {
    // SheetBlock1.java:155-166: `positions.put(atom, pos.translateX(diff / coef))`, coef 2 for CENTER (:186-187).
    expect(stackEdgeLabelStripes(stripes, HorizontalAlignment.CENTER)).toEqual({
      width: 100,
      height: 30,
      offsets: [
        { dx: 0, dy: 0 },
        { dx: 30, dy: 20 },
      ],
    });
  });

  it('right-aligns with coef 1 and leaves LEFT unshifted (SheetBlock1.java:188-191)', () => {
    expect(stackEdgeLabelStripes(stripes, HorizontalAlignment.RIGHT).offsets[1]).toEqual({ dx: 60, dy: 20 });
    expect(stackEdgeLabelStripes(stripes, HorizontalAlignment.LEFT).offsets[1]).toEqual({ dx: 0, dy: 20 });
  });
});
