/**
 * tep T4a -- the single-line title commands match the TRIMMED line.
 *
 * `CommandTitle`, `CommandMainframe`, `CommandCaption`, `CommandLegend`,
 * `CommandFooter` and `CommandHeader` call `super(getRegexConcat())`, so
 * `doTrim` is true (`SingleLineCommand2.java:56-63`) and `isValid` matches
 * `lines.getFirst().getTrimmed()` (`SingleLineCommand2.java:94`). A trailing
 * space never reaches the display, so it never widens the centred title.
 * Jar values: `timing/nafixu-73-daro620` (`title WU is toto `), title x 39.231.
 */
import { describe, expect, test } from 'vitest';
import { renderSync } from '../../../../src/index.js';
import { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';
import { matchAnnotationCommand } from '../../../../src/core/annotations/index.js';
import { createAnnotations } from '../../../../src/core/annotations/model.js';

const NAFIXU = '@startuml\ntitle WU is toto \n\nconcise "Web User" as WU\nWU is toto\n@1\nWU is a\n@enduml';

function titleX(markup: string): string | undefined {
  const svg = renderSync(markup, { measurer: new DeterministicMeasurer() });
  return /<g class="title"[^>]*><text x="([0-9.]+)"/.exec(svg)?.[1];
}

describe('single-line title commands trim (SingleLineCommand2.java:94)', () => {
  test('a trailing space does not move the centred title (nafixu-73-daro620)', () => {
    expect(titleX(NAFIXU)).toBe('39.231');
  });

  test('an indented, space-padded title line is claimed and its text trimmed', () => {
    const a = createAnnotations();
    expect(matchAnnotationCommand(['  title Hello  '], 0, a)).toEqual({ consumed: 1 });
    expect(a.title?.display).toEqual(['Hello']);
  });

  test('caption, footer and header lines are trimmed the same way', () => {
    const a = createAnnotations();
    expect(matchAnnotationCommand(['caption Cap '], 0, a)).toEqual({ consumed: 1 });
    expect(matchAnnotationCommand(['footer Foot '], 0, a)).toEqual({ consumed: 1 });
    expect(matchAnnotationCommand(['header Head '], 0, a)).toEqual({ consumed: 1 });
    expect(a.caption?.display).toEqual(['Cap']);
  });
});
