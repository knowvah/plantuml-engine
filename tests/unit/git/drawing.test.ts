import { describe, expect, it } from 'vitest';
import type { UDrawable } from '../../../src/core/klimt/shape/UDrawable.js';
import { renderDrawableToFragment } from '../../../src/core/klimt/document-shell-fragment.js';
import { UGraphicHandwritten } from '../../../src/core/klimt/drawing/hand/UGraphicHandwritten.js';
import { XDimension2D } from '../../../src/core/klimt/geom/XDimension2D.js';
import { XPoint2D } from '../../../src/core/klimt/geom/XPoint2D.js';
import type { UGraphic } from '../../../src/core/klimt/UGraphic.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { IllegalStateException } from '../../../src/core/real/AbstractReal.js';
import { SkinParamFresh } from '../../../src/core/skin/SkinParamFresh.js';
import { HColors } from '../../../src/core/klimt/color/HColors.js';
import { GitCurve } from '../../../src/diagrams/git/GitCurve.js';
import { GNode } from '../../../src/diagrams/git/GNode.js';
import { gitStyleOf, MagicBox } from '../../../src/diagrams/git/MagicBox.js';
import { Mirror } from '../../../src/diagrams/json/Mirror.js';
import { stringBounderOf } from '../bpm/helpers/string-bounder.js';

const measurer = new DeterministicMeasurer();

/** The SVG body `draw` produces on a fresh `UGraphicSvg`. */
function svgOf(draw: (ug: UGraphic) => void): string {
  const drawable: UDrawable = { drawU: draw };
  return renderDrawableToFragment(drawable, { uid: 'g', width: 0, height: 0, measurer }).body;
}

/** juzane-95's first node: `a0f65180`, comment `origin/cds/issue700`, a top node. */
function juzaneTop(): GNode {
  const node = new GNode();
  node.addText('a0f65180');
  node.setComment('origin/cds/issue700');
  return node;
}

describe('MagicBox (MagicBox.java:57-111)', () => {
  it('getBigDim is the comment over the names, plus (8, 2)', () => {
    const dim = new MagicBox(new SkinParamFresh(), juzaneTop()).getBigDim(stringBounderOf(measurer));
    expect([dim.getWidth(), dim.getHeight()]).toEqual([119.3125, 30]);
  });

  it('drawBorder draws the jar box, comment and name of juzane-95, in that order', () => {
    const skin = new SkinParamFresh();
    const box = new MagicBox(skin, juzaneTop());
    // The jar's rect is 119x17 at (10, 38), under a 13-tall comment block: the engine box is 119x30 at (10, 25).
    // `SmetanaForGit#drawMe` applies the `{root, element, gitDiagram}` stroke and line colour first (:99).
    const svg = svgOf((ug) =>
      box.drawBorder(
        gitStyleOf(skin).applyStrokeAndLineColor(ug, skin.getIHtmlColorSet()).apply(new UTranslate(10, 25)),
        new XDimension2D(119, 30),
      ),
    );
    expect(svg).toBe(
      '<rect x="10" y="38" width="119" height="17" fill="none" style="stroke:#181818;stroke-width:1.5;" rx="4" ry="4"/>' +
        '<text x="10" y="35.111" fill="#000" font-size="13" textLength="111.313">origin/cds/issue700</text>' +
        '<text x="38.234" y="50.667" fill="#000" font-size="15" textLength="62.531" font-weight="700" font-family="monospace">a0f65180</text>',
    );
  });
});

/** juzane-95's first edge, as the engine would hand it: the oracle's points mirrored back about `MAX`. */
const MAX = 100;
const up = (x: number, y: number) => new XPoint2D(x, MAX - y);
const FIRST_EDGE = [up(69.5, 55.203), up(69.5, 61.462), up(69.5, 68.897), up(69.5, 75.575)];
const FIRST_EP = up(69.5, 82.952);

describe('GitCurve (GitCurve.java:48-108)', () => {
  it('draws juzane-95 edge 1 as the jar: a dashed cubic, then the arrow filled with the line colour', () => {
    const skin = new SkinParamFresh();
    const color = gitStyleOf(skin).value('LineColor').asColor(skin.getIHtmlColorSet());
    const svg = svgOf((ug) =>
      new GitCurve(FIRST_EDGE, FIRST_EP, new Mirror(MAX)).drawCurve(
        color,
        gitStyleOf(skin).applyStrokeAndLineColor(ug, skin.getIHtmlColorSet()),
      ),
    );
    expect(svg).toBe(
      '<path d="M69.5,55.203 C69.5,61.462 69.5,68.897 69.5,75.575" style="stroke:#181818;stroke-width:1;stroke-dasharray:2,2;" fill="none"/>' +
        '<path d="M66.549,75.575 L69.5,77.788 L72.451,75.575 L69.5,82.952 L66.549,75.575" fill="#181818"/>',
    );
  });

  it('draws no arrow when ep is absent or the (0,0) sentinel (java:74-77)', () => {
    const draw = (ep: XPoint2D | undefined) =>
      svgOf((ug) => new GitCurve(FIRST_EDGE, ep, new Mirror(MAX)).drawCurve(HColors.BLACK, ug));
    expect(draw(undefined).match(/<path/g)).toHaveLength(1);
    expect(draw(new XPoint2D(0, 0)).match(/<path/g)).toHaveLength(1);
  });

  it('throws IllegalStateException for an edge with no bezier (java:60-61, gip D5)', () => {
    expect(() => new GitCurve([], undefined, new Mirror(MAX))).toThrow(IllegalStateException);
  });

  it('reaches UGraphicHandwritten: the box becomes a jiggled polygon (cov-option-handwritten)', () => {
    const skin = new SkinParamFresh();
    const box = new MagicBox(skin, juzaneTop());
    const svg = svgOf((ug) => box.drawBorder(new UGraphicHandwritten(ug), new XDimension2D(119, 30)));
    expect(svg).not.toContain('<rect');
    expect(svg.startsWith('<polygon')).toBe(true);
    expect(svg).toContain('>a0f65180</text>');
  });
});
