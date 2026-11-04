/**
 * The jar raises `NoSuchColorException` on an unknown bare colour
 * (`Colors.java:103`, `StereotypeDecoration.java:163`) and draws an error page.
 * We draw the diagram, so that colour paints neutral grey, not whatever a viewer
 * makes of an invalid `fill` (black). Maintainer ruling 2026-11-04, #143.
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { UNKNOWN_COLOR_NEUTRAL } from '../../../src/core/klimt/color/HColorSet.js';

const uml = (body: string): string => `@startuml\n${body}\n@enduml`;
const RAW_UNKNOWN = /\b(?:fill|stroke)="#?zz/;

describe('an unknown bare colour where the jar errors', () => {
  it.each([
    ['class spot', 'class A <<(F, zzgrey)>>'],
    ['class background', 'class A #zzblue'],
    ['class note', 'class A\nnote left of A #zzblue : n'],
    ['component background', 'component C #zzblue'],
    ['usecase background', '(U) #zzblue'],
    ['activity stereogroup', 'start\n:toto; <<#zzblue>>'],
    ['activity fork bar', 'start\nfork <<#zzblue>>\n:a;\nfork again\n:b;\nend fork'],
    ['activity partition', 'start\npartition P #zzblue {\n:a;\n}'],
  ])('%s paints neutral grey', (_name, body) => {
    const svg = renderSync(uml(body));
    expect(svg).toContain(`fill="${UNKNOWN_COLOR_NEUTRAL}"`);
    expect(svg).not.toMatch(RAW_UNKNOWN);
  });

  it('is LightGray', () => {
    expect(UNKNOWN_COLOR_NEUTRAL).toBe('#D3D3D3');
  });
});

describe('where the neutral must not apply', () => {
  it.each([
    ['a known name', 'class A #red', '#F00'],
    ['a gradient keeps its stops', 'class A #red-blue', '#F00'],
    ['a known spot', 'class A <<(F, orange)>>', '#FFA500'],
    ['a known component', 'component C #orange', '#FFA500'],
    ['a known stereogroup', 'start\n:toto; <<#orange>>', '#FFA500'],
  ])('%s', (_name, body, colour) => {
    const svg = renderSync(uml(body));
    expect(svg).toContain(colour);
    expect(svg).not.toContain(UNKNOWN_COLOR_NEUTRAL);
  });

  // `Colors.java:112` reads a `name:value` part with `getColorOrNull`, so the jar
  // exits 0 and draws. That is mirror-the-jar work, never this rule.
  it('a name:value part, which the jar draws', () => {
    expect(renderSync(uml('class A #line:zzblue'))).not.toContain(UNKNOWN_COLOR_NEUTRAL);
  });
});
