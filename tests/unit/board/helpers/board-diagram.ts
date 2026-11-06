/** A `BoardDiagram` over an empty style source, for the model and draw tests. */
import { readFileSync } from 'node:fs';
import { Pragma } from '../../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../../src/core/style/mindmap-style-builder.js';
import { PreprocessingArtifact } from '../../../../src/core/tim/PreprocessingArtifact.js';
import { SkinParam } from '../../../../src/diagrams/board/board-skin-param.js';
import { BoardDiagram } from '../../../../src/diagrams/board/BoardDiagram.js';

/** The cached jar render of a board row. */
export const BOARD_CACHE = 'test-results/dot-cache/board';

export function boardSkinParam(): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map<string, string>(),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

export function emptyBoardDiagram(): BoardDiagram {
  return new BoardDiagram({ lines: [] }, new PreprocessingArtifact(), boardSkinParam());
}

/** `CommandBoardPlus`'s split of one trimmed line into its `+` run and label. */
const PLUS_LINE = /^([+]*)\s*(\S.*)$/;

/** The body lines of a source (no `@start`/`@end`, no blank line), fed through `addLine`. */
export function boardOf(lines: readonly string[]): BoardDiagram {
  const diagram = emptyBoardDiagram();
  for (const line of lines) {
    const m = PLUS_LINE.exec(line.trim());
    if (m === null) throw new Error(`not a board line: ${line}`);
    diagram.addLine(m[1]!, m[2]!);
  }
  return diagram;
}

/** The body lines of a `.puml` file. */
export function bodyLines(path: string): string[] {
  return readFileSync(path, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('@'));
}

/** The `(x, y)` of every 150-wide card `<rect>` of an SVG, in document order. */
export function cardOrigins(svg: string): string[] {
  return [...svg.matchAll(/<rect x="([^"]*)" y="([^"]*)" width="150" height="70"/g)].map((m) => `${m[1]},${m[2]}`);
}
