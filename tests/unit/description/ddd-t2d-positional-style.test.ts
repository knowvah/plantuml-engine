/**
 * ddd-T2d: `Entity#getCurrentStyleBuilder` (`Entity.java:755-768`). Jar values: dot-cache unknown pofali-42-vule505,
 * and tests/fixtures/ddd-T2d/skinparam-last-wins.puml for the `isSkinParamUsed` arm.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const fills = (...lines: string[]): string[] =>
  [
    ...renderSync(['@startuml', ...lines, '@enduml'].join('\n'), {
      measurer: new DeterministicMeasurer(),
    }).matchAll(/<rect [^>]*fill="([^"]+)"/g),
  ].map((m) => m[1]!);

const POSITIONAL = [
  '<style>',
  '.a {BackGroundColor pink}',
  '</style>',
  'card c',
  'card red <<a>>',
  '<style>',
  '.a {BackGroundColor palegreen}',
  '</style>',
  'card green <<a>>',
];

describe('positional <style>', () => {
  it('pofali-42: an entity keeps the builder current at its line', () => {
    expect(fills(...POSITIONAL)).toEqual(['#F1F1F1', '#FFC0CB', '#98FB98']);
  });

  it('with skinparam anywhere the last builder applies', () => {
    expect(fills('skinparam shadowing false', ...POSITIONAL)).toEqual(['#F1F1F1', '#98FB98', '#98FB98']);
  });
});
