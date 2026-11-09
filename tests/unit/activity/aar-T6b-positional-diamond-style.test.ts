/**
 * aar-T6b: the `if`, `while` and `repeat` diamonds read the style builder current at their command, not the final one.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/InstructionIf.java:104
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ActivityDiagram3.java:398
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/InstructionRepeat.java:105
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const OPTIONS = { jarCompatibleStyleInput: true, measurer: new DeterministicMeasurer() } as Parameters<
  typeof renderSync
>[1];

const STYLE_RED =
  '<style>\nactivityDiagram {\n  diamond {\n    FontColor red\n    BackgroundColor pink\n  }\n}\n</style>';
const STYLE_BLUE = STYLE_RED.replace('red', 'blue').replace('pink', 'lightCyan');

/** The `fill` of the n-th `<text>` whose content is `content`. */
function textFills(svg: string, content: string): string[] {
  return [...svg.matchAll(new RegExp(`<text [^>]*fill="([^"]+)"[^>]*>${content}</text>`, 'g'))].map((m) => m[1]!);
}

describe('positional diamond style', () => {
  it('makage-63: each if keeps the builder current at its own command (jar #F00 then #00F)', () => {
    const src = `@startuml\n${STYLE_RED}\n:a;\nif (decision) then (yes)\n:C1;\nelse (no)\nendif\n${STYLE_BLUE}\n:b;\nif (decision) then (yes)\n:C2;\nelse (no)\nendif\n@enduml`;
    expect(textFills(renderSync(src, OPTIONS), 'decision')).toEqual(['#F00', '#00F']);
  });

  it('lobiki-30: each repeat while diamond keeps its own builder (jar: two #E0FFFF diamonds then two #FFC0CB)', () => {
    const body = ':x;\nrepeat while (more?) is (yes)\n->no;';
    const src = `@startuml\n${STYLE_BLUE}\nrepeat\n${body}\n${STYLE_RED}\nrepeat\n${body}\nstop\n@enduml`;
    const fills = [...renderSync(src, OPTIONS).matchAll(/<polygon points="[^"]*" fill="(#[0-9A-F]+)"/g)].map(
      (m) => m[1]!,
    );
    expect(fills.filter((f) => f === '#E0FFFF' || f === '#FFC0CB')).toEqual([
      '#E0FFFF',
      '#E0FFFF',
      '#FFC0CB',
      '#FFC0CB',
    ]);
  });

  it('dijapi-54: each while diamond keeps its own builder', () => {
    const body = ':x;\nendwhile';
    const src = `@startuml\n${STYLE_BLUE}\nwhile (more?)\n${body}\n${STYLE_RED}\nwhile (more?)\n${body}\nend\n@enduml`;
    expect(textFills(renderSync(src, OPTIONS), 'more\\?')).toEqual(['#00F', '#F00']);
  });

  it("kiveda-60: the diamond label keeps its builder's font face and style (jar Courier, italic)", () => {
    const style = (extra: string): string =>
      `<style>\nactivityDiagram {\n  diamond {\n    FontName Courier\n    FontStyle italic\n    ${extra}\n  }\n}\n</style>`;
    const src = `@startuml\n${style('FontSize 18')}\n:a;\nif (decision) then (yes)\n:C1;\nendif\n${style('FontSize 10')}\n:b;\nif (decision) then (yes)\n:C2;\nendif\n@enduml`;
    const svg = renderSync(src, OPTIONS);
    const tags = [...svg.matchAll(/<text [^>]*>decision<\/text>/g)].map((m) => m[0]);
    expect(tags).toHaveLength(2);
    expect(tags[0]).toContain('font-size="18"');
    expect(tags[1]).toContain('font-size="10"');
    for (const tag of tags) {
      expect(tag).toContain('font-family="Courier"');
      expect(tag).toContain('font-style="italic"');
    }
  });

  it('vupecu-35: a stereotyped if keeps the diamond style of its <<foo>> class (jar fill #FFC0CB)', () => {
    const src = `@startuml\n<style>\n.foo {\n  BackgroundColor pink\n  LineColor red\n}\n</style>\nif (d) then (yes) <<foo>>\n:C;\nendif\n@enduml`;
    expect(renderSync(src, OPTIONS)).toContain('fill="#FFC0CB"');
  });
});

describe('arrow style', () => {
  const ARROW =
    '<style>\nactivityDiagram {\n  arrow {\n    HeadColor red\n    FontColor gold\n    FontName arial\n    FontSize 15\n    LineThickness 2\n  }\n}\n</style>';
  const svg = renderSync(`@startuml\n${ARROW}\n:Qwerty;\n->text;\n:Ytrewq;\n@enduml`, OPTIONS);

  it('nizifu-81: the label takes the style font (jar 15pt arial, gold) and pushes the next box to y 92.333', () => {
    expect(svg).toMatch(/<text [^>]*fill="#FFD700"[^>]*font-size="15"[^>]*font-family="arial"[^>]*>text<\/text>/);
    expect(svg).toContain('y="92.333"');
  });

  it('nizifu-81: the arrowhead takes HeadColor, the line its own colour (Rainbow.java:84-95)', () => {
    expect(svg).toMatch(/<polygon [^>]*fill="#F00"[^>]*stroke="#F00"/);
    expect(svg).toMatch(/<line [^>]*stroke="#181818"/);
  });

  it('jigocu-99: LineThickness of the arrow style is the line width (jar 2)', () => {
    expect(svg).toMatch(/<line [^>]*stroke-width="2"/);
  });

  it('kozete-82: a transparent HeadColor draws the head as none (jar fill none)', () => {
    const none = renderSync(
      `@startuml\n${ARROW.replace('HeadColor red', 'HeadColor none')}\n:Qwerty;\n->text;\n:Ytrewq;\n@enduml`,
      OPTIONS,
    );
    expect(none).toMatch(/<polygon [^>]*fill="none"[^>]*stroke="none"/);
  });
});

describe('while newlines', () => {
  it('botuge-46: `\\n` in the while test splits the label like Display.getWithNewlines (CommandWhile3.java:114)', () => {
    const svg = renderSync('@startuml\nwhile (repeat\\nforever)\n:x;\nendwhile\n@enduml', OPTIONS);
    expect(svg).toContain('>repeat</text>');
    expect(svg).toContain('>forever</text>');
  });
});
