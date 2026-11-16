/**
 * cogr T4a: `<style> <symbol> { HorizontalAlignment X }` on a description leaf in a class diagram.
 * `EntityImageDescription.java:175` reads `defaultAlign = styleTitle.getHorizontalAlignment()` and passes it to
 * `BodyFactory.create3` for `desc` (`:188-191`). Oracles: `test-results/dot-cache/class/bupabi-53-xedu278/in.svg`
 * (component centre, database right) and `.../nexeno-07-pike819/in.svg` (rectangle and usecase right).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (source: string): string => renderSync(source, { measurer: new DeterministicMeasurer() });
const BODY = '[\na\nabc\na b c d\n]';
const doc = (style: string, decls: string[]): string =>
  ['@startuml', '<style>', style, '</style>', ...decls.map((d) => `${d} ${BODY}`), '@enduml'].join('\n');

/** The `x` of every `<text>` in the entity `<g>` named `name`. */
function textXs(svg: string, name: string): string[] {
  const group = new RegExp(`<g class="entity"[^>]*data-qualified-name="${name}"[^>]*>(.*?)</g>`).exec(svg)?.[1] ?? '';
  return [...group.matchAll(/<text [^>]*x="([\d.]+)"/g)].map((m) => m[1]!);
}

describe('HorizontalAlignment from <style> on a description body (cogr T4a)', () => {
  it('centres each component line (bupabi)', () => {
    const svg = render(
      doc('component {\n HorizontalAlignment center\n}\ndatabase {\n HorizontalAlignment right\n}', [
        'component c',
        'database d',
      ]),
    );
    expect(textXs(svg, 'c').slice(0, 2)).toEqual(['39.062', '31.669']);
  });

  it('right-aligns each database line (bupabi)', () => {
    const svg = render(
      doc('component {\n HorizontalAlignment center\n}\ndatabase {\n HorizontalAlignment right\n}', [
        'component c',
        'database d',
      ]),
    );
    expect(textXs(svg, 'd').slice(0, 2)).toEqual(['168.125', '153.337']);
  });

  it('sizes the usecase ellipse with the aligned body (nexeno)', () => {
    const svg = render(doc('usecase {\n HorizontalAlignment right\n}', ['usecase usecase']));
    expect(svg).toContain('rx="36.589" ry="29.871"');
    // jar line x: 154.128 / 139.34 / 120.003, so the right edges line up (14.788 and 34.125 apart)
    const [a, abc, abcd] = textXs(svg, 'usecase').map(Number) as [number, number, number];
    expect([(a - abc).toFixed(3), (a - abcd).toFixed(3)]).toEqual(['14.788', '34.125']);
  });
});
