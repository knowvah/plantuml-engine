/**
 * cogr T2a: a group's inline `#back;line:x;text:y` spec reaches its cluster -- `Cluster#drawU` reads
 * `ColorType.LINE` for the border and `ClusterHeader#getTitleBlock` reads `ColorType.TEXT` for the title.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:317-318
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/Style.java:259-263
 * Oracles: `test-results/dot-cache/class/mipuzo-23-saji028/in.svg` (folder: path/line stroke `#FF0`, title `#00F`),
 * `.../tufuru-60-laxo740/in.svg` (rectangle: rect stroke `#F00`, title `#F00`).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

function body(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

describe('group line:/text: colours (cogr T2a)', () => {
  it('colours a folder package border yellow and its title blue (mipuzo-23-saji028)', () => {
    const svg = body(['package p1 #red;text:blue;line:yellow {', 'class cl1', '}']);
    expect(svg).toContain('fill="#F00"');
    expect(svg.match(/stroke="#FF0"/g)?.length).toBe(2);
    expect(svg).toMatch(/<text[^>]*fill="#00F"[^>]*>p1<\/text>/);
  });

  it('colours a rectangle group border and title red (tufuru-60-laxo740)', () => {
    const svg = body(['rectangle "My first Box" as box1 #text:red;line:red {', 'Bob -> Alice', '}']);
    expect(svg).toMatch(/<rect[^>]*stroke:#F00;/);
    expect(svg).toMatch(/<text[^>]*fill="#F00"[^>]*>My first Box<\/text>/);
  });

  it('colours a USymbol (<<Node>>) cluster border through its own draw path', () => {
    const svg = body(['package p1 <<Node>> #line:red;text:green {', 'class cl1', '}']);
    expect(svg).toMatch(/<polygon[^>]*stroke:#F00;/);
    expect(svg).toMatch(/<text[^>]*fill="#008000"[^>]*>p1<\/text>/);
  });

  it('strokes a group border dotted for line.dotted (Cluster.java:437-442)', () => {
    const svg = body(['package p1 #line.dotted;line:blue {', 'class cl1', '}']);
    expect(svg.match(/stroke="#00F" stroke-width="1" stroke-dasharray="1,3"/g)?.length).toBe(2);
  });
});
