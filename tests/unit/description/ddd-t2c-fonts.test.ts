/**
 * ddd-T2c: fonts and alignment from the merged style (`EntityImageDescription.java:172-175,207`,
 * `ClusterHeader.java:142-147,226-231`). Jar values: dot-cache usecase gogamo-72-pibo470, lunexo-59-fupo775, unknown
 * kijipu-30-vona046, sapeka-40-zoze338.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (...lines: string[]): string =>
  renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });

describe('entity fonts', () => {
  it('gogamo-72: actorFontName reaches both actor texts', () => {
    const svg = render('skinparam actorFontName Courier', 'User << Human >>', '(Solr)');
    expect([...svg.matchAll(/<text [^>]*font-family="Courier"[^>]*>([^<]*)/g)].map((m) => m[1])).toEqual([
      'User',
      '«Human»',
    ]);
  });

  it('lunexo-59: <style> Stereotype { FontColor } paints every stereotype label', () => {
    const svg = render(
      '<style>',
      'Stereotype {',
      'FontColor Green',
      '}',
      '</style>',
      'usecase "Usecase"<<s>> as u',
      'process "Process"<<s>> as p',
      'rectangle "Rectangle"<<s>> as r',
    );
    expect([...svg.matchAll(/fill="#008000"[^>]*>«s»/g)].length).toBe(3);
  });

  it('sapeka-40: StereotypeFontSize shrinks the box the sizer measures', () => {
    const svg = render(
      'skinparam rectangle {',
      'StereotypeFontSize 12',
      'shadowing false',
      '}',
      'skinparam rectangle<<G>> {',
      'RoundCorner 25',
      '}',
      'rectangle "25" <<G>> as gC',
    );
    expect(/font-size="12"[^>]*>«G»/.exec(svg)).not.toBeNull();
    expect(svg).toContain('rx="12.5"');
  });

  it('an interface reads SName.interface_, not a selector no rule names (USymbolInterface.java:47)', () => {
    const svg = render(
      'skinparam interfaceFontColor #777777',
      'skinparam interfaceFontSize 18',
      'component c',
      'c -- () i',
    );
    expect(/fill="#777" font-size="18"[^>]*>i</.exec(svg)).not.toBeNull();
  });

  it('kijipu-30: HorizontalAlignment per class, with several labels, aligns left', () => {
    const svg = render(
      'hide stereotype',
      '<style>',
      '.left {',
      'HorizontalAlignment left',
      '}',
      '</style>',
      'rectangle "a\\na a" as rect1 <<left>>',
    );
    const xs = [...svg.matchAll(/<text x="([\d.]+)"/g)].map((m) => m[1]);
    expect(new Set(xs).size).toBe(1);
  });
});
