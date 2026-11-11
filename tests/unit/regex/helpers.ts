/** A `PSystemRegex` over a hand-built source, its skin param built as the factory builds it, for the unit tests. */
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { createStyleDispatch, executeDeclarationsBefore } from '../../../src/diagrams/ebnf/ebnf-style-dispatch.js';
import { PSystemRegex } from '../../../src/diagrams/regex/PSystemRegex.js';
import { SkinParam } from '../../../src/diagrams/regex/regex-skin-param.js';

/** The style sources of a hand-built source. */
export interface StyleInput {
  readonly styles?: readonly string[];
  readonly skinparam?: Readonly<Record<string, string>>;
  readonly options?: Readonly<Record<string, string>>;
}

/** A source with the given `<style>` blocks, skinparams and `!option`s; every declaration before every line. */
export function regexSource(lines: readonly string[], input: StyleInput = {}): UmlSource {
  return {
    lines,
    type: 'unknown',
    styleSource: {
      skinparam: new Map(Object.entries(input.skinparam ?? {})),
      styles: input.styles ?? [],
      options: new Map(Object.entries(input.options ?? {})),
    },
  } as unknown as UmlSource;
}

/** `new PSystemRegex(…)` with every declaration executed, as the factory leaves the builder after the parse. */
export function regexDiagram(input: StyleInput = {}): PSystemRegex {
  const source = regexSource([], input);
  const dispatch = createStyleDispatch(source);
  executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY);
  const skinParam = new SkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of Object.entries(input.options ?? {})) artifact.getOption().define(key, value);
  return new PSystemRegex(source, artifact, skinParam);
}

/** `addBlocLines` over one line. */
export function addLine(diagram: PSystemRegex, line: string): ReturnType<PSystemRegex['addBlocLines']> {
  return diagram.addBlocLines(BlocLines.fromArray([line]));
}
