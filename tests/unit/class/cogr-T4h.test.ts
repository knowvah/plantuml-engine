/**
 * cogr T4h: `CommandSkinParam.java:101-103` adds the six-line `'skinparam ParticipantPadding' is ignored` warning
 * (the message, then the style it suggests) to the diagram's warnings, and `DiagramChromeFactory#addWarnings` draws
 * them as a banner above the body.
 * Oracle: `test-results/dot-cache/class/sivoso-11-xabi195/in.svg` -- rect x=8 y=8 width=414.367 height=65, fill
 * `#FFC`, stroke `#FD8` width 3, rx/ry 2.5, then six monospace 10px lines from x=15 y=17; the body sits below it.
 * The inline case is the jar's render of `skinparam ParticipantPadding 10` / `class A` (scripts/oracle-render.sh).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const measurer = new DeterministicMeasurer();
const MESSAGE = "'skinparam ParticipantPadding' is ignored: use a style instead";

function render(source: string): string {
  return renderSync(`@startuml\n${source}\n@enduml`, { measurer });
}

describe('class skinparam warning banner (cogr T4h)', () => {
  it('draws the banner with the oracle rect and text for skinparam ParticipantPadding', () => {
    // The document margin is the diagram's own (sivoso's `<style> root { Margin 5 }` plus `document` give the
    // oracle's 8), so the origin differs here; the box is `x`/`y` = margin, text at `margin + 7`, `margin + 9`.
    const svg = render('skinparam ParticipantPadding 10\nclass A');
    expect(svg).toMatch(/width="297px" height="138px"/);
    expect(svg).toMatch(
      /<rect x="3" y="3" width="281.125" height="65" fill="#FFC" style="stroke:#FD8;stroke-width:3;" rx="2.5" ry="2.5"\/>/,
    );
    // Monospace text spells its spaces as NBSP (`SvgGraphics.java:727-728`), which `\s` matches.
    expect(svg).toMatch(
      new RegExp(
        `<text x="10" y="12" fill="#000" font-size="10" textLength="271.125" font-family="monospace">${MESSAGE.replaceAll(' ', '\\s')}</text>`,
      ),
    );
    expect(svg).toContain(
      '<text x="10" y="22" fill="#000" font-size="10" textLength="32.313" font-family="monospace">&lt;style></text>',
    );
  });

  it('draws no banner without the skinparam', () => {
    const svg = render('class A');
    expect(svg).not.toContain('is ignored');
    expect(svg).not.toContain('#FFC');
  });

  it('draws no banner for the block form, which never warns', () => {
    const svg = render('skinparam {\nParticipantPadding 10\n}\nclass A');
    expect(svg).not.toContain('is ignored');
  });

  it('matches the sivoso oracle page size', () => {
    const puml = readFileSync('test-results/dot-cache/class/sivoso-11-xabi195/in.puml', 'utf8');
    const svg = renderSync(puml, { measurer });
    expect(svg).toMatch(/width="435px" height="141px" viewBox="0 0 435 141"/);
    expect(svg).toContain('<rect x="8" y="8" width="414.367" height="65" fill="#FFC"');
    expect(svg).toContain('<text x="15" y="17" fill="#000" font-size="10" textLength="271.125"');
  });
});
