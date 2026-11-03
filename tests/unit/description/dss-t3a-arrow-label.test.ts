/**
 * dss T3a, audit site 1: a description link label takes `FontColor` off the arrow signature
 * `{root,element,componentDiagram,arrow}` (`GraphvizImageBuilder.java:234-235`, `SvekEdge.java:817-819`), which
 * `theme.colors.elements.arrow.font` carries (`style-element-scope.ts`). Rows
 * `{component,usecase}__cascade-font-{diag,diag-element}`: jar paints the label `#00B`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:234-235
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';

const LABEL = 'lbl';

function labelFill(style: string, link = `C --> I : ${LABEL}`): string | undefined {
  const svg = renderSync(`@startuml\n${style}\n[C]\ninterface I\n${link}\n@enduml`);
  return new RegExp(`<text [^>]*fill="(#[0-9A-Fa-f]+)"[^>]*>${LABEL}</text>`).exec(svg)?.[1];
}

describe('description arrow label colour (dss T3a site 1)', () => {
  it('reads componentDiagram { FontColor }', () => {
    expect(labelFill('<style>\ncomponentDiagram {\n  FontColor #0000BB\n}\n</style>')).toBe('#00B');
  });

  it('reads element { FontColor }', () => {
    expect(labelFill('<style>\nelement {\n  FontColor #0000BB\n}\n</style>')).toBe('#00B');
  });

  it('reads arrow { FontColor } over componentDiagram { FontColor }', () => {
    const style =
      '<style>\ncomponentDiagram {\n  FontColor #0000BB\n  arrow {\n    FontColor #CC0000\n  }\n}\n</style>';
    expect(labelFill(style)).toBe('#C00');
  });

  it('keeps the inline text: colour above the style', () => {
    const style = '<style>\ncomponentDiagram {\n  FontColor #0000BB\n}\n</style>';
    expect(labelFill(style, `C --> I #line:red;text:green : ${LABEL}`)).toBe('#008000');
  });

  it('keeps the default with no style', () => {
    expect(labelFill('')).toBe('#000');
  });
});
