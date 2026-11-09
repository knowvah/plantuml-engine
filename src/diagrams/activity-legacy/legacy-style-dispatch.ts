/**
 * The `skinparam`/`<style>` commands the preprocessor pulled out of the source, executed where they occur.
 * Upstream runs each as a command during the parse, muting the diagram's style builder
 * (`CommandSkinParam`, `CommandStyleMultilinesCSS`; `SkinParam.java:164-167`). The shape of
 * `board/BoardDiagramFactory.ts` (`createStyleDispatch`, `executeDeclarationsBefore`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java:78-81
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import {
  createMindmapSkinParam,
  executeDeclaration,
  positionedDeclarationsOf,
  type PositionedDeclaration,
  type SkinParam as StyleSkinParam,
} from '../../core/style/mindmap-style-builder.js';
import { StyleParsingException } from '../../core/style/parser/StyleParser.js';

/** A hand-built source's style sources: no skin, no skinparam, no style. */
const EMPTY_STYLE_SOURCE: NonNullable<UmlSource['styleSource']> = {
  skinparam: new Map<string, string>(),
  styles: [],
};

export interface StyleDispatch {
  readonly style: StyleSkinParam;
  readonly skinparam: ReadonlyMap<string, string>;
  /** Source order; the head is the next to execute. */
  readonly pending: PositionedDeclaration[];
}

export function createStyleDispatch(source: UmlSource): StyleDispatch {
  const styleSource = source.styleSource ?? EMPTY_STYLE_SOURCE;
  return {
    style: createMindmapSkinParam(styleSource),
    skinparam: styleSource.skinparam,
    pending: positionedDeclarationsOf(styleSource, source.stylePositions ?? []),
  };
}

/**
 * Executes every pending declaration placed before document line `position`. A rejected `<style>` block is
 * `CommandStyleMultilinesCSS`'s command error (java:92-93), reported at line 0 (the preprocessor keeps no line).
 */
export function executeDeclarationsBefore(dispatch: StyleDispatch, position: number): ParseRefusal | null {
  while (dispatch.pending.length > 0 && dispatch.pending[0]!.position < position) {
    const declaration = dispatch.pending.shift()!;
    try {
      executeDeclaration(dispatch.style, declaration, dispatch.skinparam);
    } catch (e) {
      if (!(e instanceof StyleParsingException)) throw e;
      return refuse('execution', 0, 0, `Error in style definition: ${e.message}`);
    }
  }
  return null;
}

/** Line `i`'s document position; a hand-built source reads as every declaration before its first line. */
export function positionOf(source: UmlSource, i: number): number {
  if (source.linePositions === undefined) return Number.POSITIVE_INFINITY;
  return source.linePositions[i] ?? -1;
}
