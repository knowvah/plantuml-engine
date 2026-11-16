/**
 * cogr T4h2: a class link draws with the style builder current at its creation. `CommandLinkClass.java:355` passes
 * `getCurrentStyleBuilder()` to `new Link(...)`, `abel/Link.java:93,130` keeps it, and `SvekEdge.java:816-821,874-876`
 * reads the arrow's line colour/thickness and label font off `link.getStyleBuilder()`.
 * Oracle: `test-results/dot-cache/class/sivoso-11-xabi195/in.svg` -- the link made before the `<style>` block and the
 * skinparams keeps #181818 (path, arrowhead) and a black, family-less label; the later link is themed.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const measurer = new DeterministicMeasurer();
const THEMED = '<style>\nroot {\n  LineColor #FF0000\n  FontColor #00FF00\n  FontName Verdana\n}\n</style>';

function render(source: string): string {
  return renderSync(`@startuml\n${source}\n@enduml`, { measurer });
}

function linkGroup(svg: string, name: string): string {
  const start = svg.indexOf(`<!--link ${name}-->`);
  return svg.slice(start, svg.indexOf('</g>', start));
}

describe('class link style builder at creation (cogr T4h2)', () => {
  it('keeps the default arrow and label style on a link made before the <style> block', () => {
    const svg = render(`class A\nclass B\nclass C\nclass D\nA -> B : first\n${THEMED}\nC -> D : second`);
    const first = linkGroup(svg, 'A to B');
    expect(first).toContain('stroke="#181818"');
    expect(first).toContain('fill="#181818"');
    expect(first).toMatch(/<text [^>]*fill="#000"/);
    expect(first).not.toContain('Verdana');
  });

  it('themes a link made after the <style> block', () => {
    const svg = render(`class A\nclass B\nclass C\nclass D\nA -> B : first\n${THEMED}\nC -> D : second`);
    const second = linkGroup(svg, 'C to D');
    expect(second).toContain('stroke="#F00"');
    expect(second).toContain('fill="#0F0"');
    expect(second).toContain('font-family="Verdana"');
  });

  it('matches the sivoso oracle link', () => {
    const puml = readFileSync('test-results/dot-cache/class/sivoso-11-xabi195/in.puml', 'utf8');
    const svg = renderSync(puml, { measurer });
    const first = linkGroup(svg, 'Bob to Alice');
    expect(first).toContain('stroke="#181818"');
    expect(first).not.toContain('Verdana');
  });
});
