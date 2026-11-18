import { describe, expect, it } from 'vitest';
import { FontStyle, NORMAL_FONT_FACE } from '../../../src/core/klimt/shape/UText.js';
import { XDimension2D } from '../../../src/core/klimt/geom/XDimension2D.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import { DeterministicMeasurer, svgFileFormatOf } from '../../../src/core/measurer-deterministic.js';
import { stringBounderFor } from '../../../src/core/UgDiagram.js';
import { sequenceStringBounder } from '../../../src/diagrams/sequence/sequence-label-primitives.js';
import { jarMeasurer } from '../../../src/core/measurer-jar.js';
import {
  BOLD_END,
  BOLD_START,
  pngDefaultStringBounder,
  pngStringBounderOf,
} from '../../../src/core/png-string-bounder.js';

const FONT_14 = { family: 'SansSerif', size: 14 };
const FONT_10 = { family: 'SansSerif', size: 10 };
/** `StringUtils.BOLD_START`/`BOLD_END` (StringUtils.java:115-116). */
const JAVA_BOLD_START = '';
const JAVA_BOLD_END = '';

/** Seam #4's width of a space-free `text`: the table sum rounded to float (`FileFormat.java:204-222`). */
const seam4Width = (text: string, font = FONT_14): number => new DeterministicMeasurer().measure(text, font).width;

describe('pngDefaultStringBounder under a DeterministicMeasurer (oracle seam #5)', () => {
  const bounder = pngDefaultStringBounder(new DeterministicMeasurer());

  it("measures 'a b' as seam #4 measures 'a!b', float-rounded, height the font size", () => {
    const dim = bounder.calculateDimension(FONT_14, 'a b');
    expect(dim.getWidth()).toBe(seam4Width('a!b'));
    expect(dim.getHeight()).toBe(14);
  });

  it('gives the interface default descent, size / 4.5', () => {
    expect(bounder.getDescent?.(FONT_14, 'a')).toBe(14 / 4.5);
  });

  it('measures a rich text piecewise and sums the float-rounded pieces', () => {
    const dim = bounder.calculateDimension(FONT_14, `ab${JAVA_BOLD_START}c d${JAVA_BOLD_END}e`);
    const pieces = ['ab', 'c!d', 'e'].map((t) => seam4Width(t));
    expect(dim.getWidth()).toBe(pieces[0]! + pieces[1]! + pieces[2]!);
    expect(dim.getHeight()).toBe(14);
  });

  it('keeps the rest after an unclosed BOLD_START as one bold piece', () => {
    const dim = bounder.calculateDimension(FONT_14, `x${JAVA_BOLD_START}yz`);
    expect(dim.getWidth()).toBe(seam4Width('x') + seam4Width('yz'));
  });

  it('measures a lone BOLD_END as one plain piece, the marker included', () => {
    const dim = bounder.calculateDimension(FONT_14, `ab${JAVA_BOLD_END}`);
    expect(dim.getWidth()).toBe(seam4Width(`ab${JAVA_BOLD_END}`));
  });

  it('exports the markers under their upstream names', () => {
    expect([BOLD_START, BOLD_END]).toEqual([JAVA_BOLD_START, JAVA_BOLD_END]);
  });

  it("advances a wire print by the table's 10 at 10 pt (cov-print-only: 27.778 then 37.778)", () => {
    expect(bounder.calculateDimension(FONT_10, 'only').getHeight()).toBe(10);
  });
});

describe('pngDefaultStringBounder under any other measurer (StringBounderAwt)', () => {
  const bounder = pngDefaultStringBounder(jarMeasurer);

  it('measures with jarMeasurer', () => {
    const dim = bounder.calculateDimension(FONT_10, 'x');
    expect(dim.getWidth()).toBe(jarMeasurer.measure('x', FONT_10).width);
    expect(dim.getHeight()).toBe(jarMeasurer.measure('x', FONT_10).height);
    expect(bounder.getDescent?.(FONT_10, 'x')).toBe(jarMeasurer.getDescent(FONT_10, 'x'));
  });

  it("reads bold from a FontConfiguration's styles or face weight (cov-print-table's header cells)", () => {
    const bold = jarMeasurer.measure('b', { ...FONT_10, weight: 'bold' }).width;
    const viaStyles = { ...FONT_10, styles: new Set([FontStyle.BOLD]) };
    const viaFace = { ...FONT_10, fontFace: { ...NORMAL_FONT_FACE, cssWeight: 700 } };
    expect(bounder.calculateDimension(viaStyles, 'b').getWidth()).toBe(bold);
    expect(bounder.calculateDimension(viaFace, 'b').getWidth()).toBe(bold);
  });

  it('measures the bold piece of a rich text bold and resets the plain piece of a bold font', () => {
    const boldFont = { ...FONT_10, weight: 'bold' as const };
    const dim = bounder.calculateDimension(boldFont, `a${JAVA_BOLD_START}b`);
    const plainA = jarMeasurer.measure('a', { ...FONT_10, weight: 'normal', style: 'normal' }).width;
    const boldB = jarMeasurer.measure('b', { ...FONT_10, weight: 'bold', style: 'normal' }).width;
    expect(dim.getWidth()).toBe(plainA + boldB);
  });

  it('keeps an italic font italic in the bold piece', () => {
    const italic = { ...FONT_10, style: 'italic' as const };
    const dim = bounder.calculateDimension(italic, `${JAVA_BOLD_START}b`);
    expect(dim.getWidth()).toBe(jarMeasurer.measure('b', { ...FONT_10, weight: 'bold', style: 'italic' }).width);
  });
});

describe("pngStringBounderOf reads the render's mode off a host bounder (StringBounder#getFileFormat)", () => {
  const deterministicHost = stringBounderFor(new DeterministicMeasurer());

  it('answers SVG_DETERMINISTIC from the deterministic SVG bounders, SVG otherwise, PNG from its own', () => {
    expect(deterministicHost.getFileFormat?.()).toBe('SVG_DETERMINISTIC');
    expect(stringBounderFor(jarMeasurer).getFileFormat?.()).toBe('SVG');
    expect(new MeasurerStringBounder(new DeterministicMeasurer()).getFileFormat()).toBe('SVG_DETERMINISTIC');
    expect(sequenceStringBounder(new DeterministicMeasurer()).getFileFormat?.()).toBe('SVG_DETERMINISTIC');
    expect(svgFileFormatOf(undefined)).toBe('SVG');
    expect(pngStringBounderOf(deterministicHost).getFileFormat?.()).toBe('PNG');
  });

  it('is seam #5 for a deterministic host and AWT for any other, including one with no getFileFormat', () => {
    expect(pngStringBounderOf(deterministicHost).calculateDimension(FONT_10, 'x').getHeight()).toBe(10);
    const bare = { calculateDimension: () => new XDimension2D(0, 0) };
    expect(pngStringBounderOf(bare).calculateDimension(FONT_10, 'x').getHeight()).toBe(
      jarMeasurer.measure('x', FONT_10).height,
    );
  });
});
