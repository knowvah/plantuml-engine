/**
 * ucol T3b (issue #145, M2): a description `name:value` part is `getColorOrNull`, whose null still claims its key
 * (`Colors.java:111-113`). Expected values are the jar's, from `tests/fixtures/unresolved-colour/comp-text*.svg`,
 * `uc-back.svg` and `deploy-node-text.svg`.
 */
import { describe, it, expect } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseColorOverride } from '../../../src/diagrams/description/renderer-color-override.js';
import { parseLinkColors } from '../../../src/diagrams/description/link-colors.js';

const render = (body: string): string =>
  renderSync(`@startuml\n${body}\n@enduml\n`, { measurer: new DeterministicMeasurer() });
const tags = (svg: string, name: string): string[] =>
  [...svg.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);

describe('description name:value colour parts (M2, T3b)', () => {
  it('an unresolvable text, line or back value is unset', () => {
    expect(parseColorOverride('#text:zzblue')).toEqual({});
    expect(parseColorOverride('#line:zzblue')).toEqual({});
    expect(parseColorOverride('#back:zzblue')).toEqual({});
  });

  it('a later null replaces an earlier value', () => {
    expect(parseColorOverride('#text:red;text:zzblue')).toEqual({});
    expect(parseColorOverride('#back:blue;back:zzblue;text:red')).toEqual({ text: 'red' });
  });

  it('a resolvable value keeps its stored form', () => {
    expect(parseColorOverride('#back:blue;text:red')).toEqual({ back: 'blue', text: 'red' });
  });

  it('a link part follows the same rule', () => {
    expect(parseLinkColors('text:zzblue')).toEqual({});
    expect(parseLinkColors('text:red;text:zzblue')).toEqual({});
    expect(parseLinkColors('line:red;arrow:zzblue')).toEqual({ line: 'red' });
  });

  it('component C #text:zzblue draws its name in the default #000', () => {
    expect(tags(render('component C #text:zzblue'), 'text')[0]).toContain('fill="#000"');
  });

  it('usecase U #back:zzblue fills the ellipse with the default #F1F1F1', () => {
    expect(tags(render('usecase U #back:zzblue'), 'ellipse')[0]).toContain('fill="#F1F1F1"');
  });
});
