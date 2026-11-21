/**
 * gtc-T6j -- an element with several stereotypes. Since upstream c9d62097ff5 its labels fold into ONE style query
 * requiring all of them (`StyleQuery#withStereotype(Stereotype)`, StyleQuery.java:93-105), so every matching
 * one-stereotype declaration competes on `Specificity` and the LATER declaration wins, whatever the element's label
 * order (`Specificity#compareTo`'s order tier, Specificity.java:147). Before it, the query fanned out one label at a
 * time and the FIRST label won. Expected values: jar oracles (a720bdd) of these sources (scripts/oracle-render.sh),
 * crossing declaration order x label order.
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (lines: readonly string[]): string =>
  renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
const RED = '#F00';
const BLUE = '#00F';
const entityFill = (svg: string, name: string): string | undefined =>
  new RegExp(`data-qualified-name="${name}"[^>]*><rect [^>]*fill="(#[0-9A-F]+)"`).exec(svg)?.[1];

const SKIN_AB = ['skinparam ComponentBackgroundColor<<A>> #f00', 'skinparam ComponentBackgroundColor<<B>> #00f'];
const SKIN_BA = [...SKIN_AB].reverse();
const STYLE_AB = [
  '<style>',
  'component {',
  '  .A { BackgroundColor #f00 }',
  '  .B { BackgroundColor #00f }',
  '}',
  '</style>',
];
const STYLE_BA = [
  '<style>',
  'component {',
  '  .B { BackgroundColor #00f }',
  '  .A { BackgroundColor #f00 }',
  '}',
  '</style>',
];

describe('the later declaration wins', () => {
  it.each([
    ['skinparam A-then-B', SKIN_AB, BLUE],
    ['skinparam B-then-A', SKIN_BA, RED],
    ['style A-then-B', STYLE_AB, BLUE],
    ['style B-then-A', STYLE_BA, RED],
  ])('%s: declaration order alone decides', (_name, decl, later) => {
    const svg = render([...decl, 'component X1 <<A>> <<B>>', 'component X2 <<B>> <<A>>']);
    expect(entityFill(svg, 'X1')).toBe(later);
    expect(entityFill(svg, 'X2')).toBe(later);
  });

  it('resolves each property independently (three labels, border/font/background)', () => {
    const svg = render([
      'skinparam ComponentBackgroundColor<<A>> #f00',
      'skinparam ComponentBackgroundColor<<B>> #00f',
      'skinparam ComponentBorderColor<<B>> #0f0',
      'skinparam ComponentBorderColor<<C>> #0ff',
      'skinparam ComponentFontColor<<B>> #a0a',
      'skinparam ComponentFontColor<<A>> #0aa',
      'component X1 <<C>> <<A>> <<B>>',
      'component X3 <<A>> <<B>> <<C>>',
    ]);
    expect(entityFill(svg, 'X1')).toBe(BLUE);
    expect(entityFill(svg, 'X3')).toBe(BLUE);
    expect(new RegExp('data-qualified-name="X1"[^>]*><rect [^>]*style="stroke:(#[0-9A-F]+)').exec(svg)?.[1]).toBe(
      '#0FF',
    );
    expect(new RegExp('data-qualified-name="X3"[^>]*><rect [^>]*style="stroke:(#[0-9A-F]+)').exec(svg)?.[1]).toBe(
      '#0FF',
    );
    expect(/<text [^>]*fill="(#[0-9A-F]+)"[^>]*>X1</.exec(svg)?.[1]).toBe('#0AA');
  });
});

describe('class and usecase agree', () => {
  // The class family resolves `classBackgroundColor<<label>>` through the flat theme
  // (`renderer-classifier-colors.ts#resolveClassBackgroundByStereo`), which still takes the FIRST label with a value:
  // its `*ByStereo` maps carry no declaration order to pick the later one by. The jar paints both blue.
  it.fails('class: skinparam ClassBackgroundColor<<A>>/<<B>>', () => {
    const svg = render([
      ...SKIN_AB.map((l) => l.replace('Component', 'Class')),
      'class X1 <<A>> <<B>>',
      'class X2 <<B>> <<A>>',
    ]);
    expect(entityFill(svg, 'X1')).toBe(BLUE);
    expect(entityFill(svg, 'X2')).toBe(BLUE);
  });

  it('usecase: skinparam UsecaseBackgroundColor<<A>>/<<B>>', () => {
    const svg = render([
      ...SKIN_AB.map((l) => l.replace('Component', 'Usecase')),
      'usecase X1 <<A>> <<B>>',
      'usecase X2 <<B>> <<A>>',
    ]);
    expect(/data-qualified-name="X1"[^>]*><ellipse [^>]*fill="(#[0-9A-F]+)"/.exec(svg)?.[1]).toBe(BLUE);
    expect(/data-qualified-name="X2"[^>]*><ellipse [^>]*fill="(#[0-9A-F]+)"/.exec(svg)?.[1]).toBe(BLUE);
  });
});
