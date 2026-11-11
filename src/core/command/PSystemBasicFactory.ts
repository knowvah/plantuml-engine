/**
 * `PSystemBasicFactory` as a plugin helper: the line-by-line base
 * `PSystemCreoleFactory`, `PSystemDefinitionFactory`, `PSystemMathFactory` and
 * `PSystemLatexFactory` extend (decisions.md D3). Each factory supplies
 * `initDiagram` and `executeLine`; {@link createSystem} is upstream's `final`
 * driver loop.
 *
 * The lines examined are upstream's `UmlSource` -- `BlockUml#data`, `@start` /
 * `@end` and every directive line in place: `UmlSource.seedSourceLines`
 * (the `diagrams/dot/parser.ts#upstreamLinesOf` and
 * `PSystemSingleLineFactory.ts` precedent; both keep private copies of the
 * `UmlSource` helpers below, and this file follows them rather than moving
 * shared code while porting).
 *
 * A plugin built on this sets `factoryBase: 'PSystemBasicFactory'`: the empty
 * test is this file's, not the dispatcher's (`dispatcher-types.ts
 * #PSystemFactoryBase`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemBasicFactory.java
 */
import type { UmlSource } from '../block-extractor.js';
import { refuse } from '../parse-refusal.js';
import type { ParseRefusal } from '../parse-refusal.js';
import { trin } from '../style/parser/StyleParser.js';
import { PreprocessingArtifact } from '../tim/PreprocessingArtifact.js';
import { isEndDirective } from '../tim/StartUtils.js';

/** `PSystemAbstractFactory.EMPTY_DESCRIPTION`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemAbstractFactory.java:57 */
export const EMPTY_DESCRIPTION = 'Empty description';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemBasicFactory.java:95 */
export const SYNTAX_ERROR = 'Syntax Error?';

/** `source.getTotalLineCount() == 2`: only the `@start` and `@end` lines.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemBasicFactory.java:89 */
const EMPTY_SOURCE_LINE_COUNT = 2;

/**
 * The two abstract methods (java:66-68). `undefined` is upstream's `null`:
 * `createSystem` turns it into `Syntax Error?` on that line. `P` must not
 * carry a `refused` field (the `ParseRefusal` discriminant).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemBasicFactory.java:66-68
 */
export interface BasicFactory<P> {
  initDiagram(source: UmlSource, startLine: string, preprocessing: PreprocessingArtifact): P;
  executeLine(source: UmlSource, system: P, line: string, preprocessing: PreprocessingArtifact): P | undefined;
}

/**
 * The `!option` directives the preprocessor collected, and the warnings it
 * added, as `EaterOption` leaves them on the artifact `createSystem` receives
 * (EaterOption.java:61-70). Mirrors `diagrams/wire/index.ts#preprocessingArtifactOf`.
 */
export function preprocessingArtifactOf(source: UmlSource): PreprocessingArtifact {
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of source.styleSource?.options ?? []) artifact.getOption().define(key, value);
  for (const warning of source.styleSource?.warnings ?? []) artifact.addWarning(warning);
  return artifact;
}

/** One line of upstream's `UmlSource`, with its index into that source. */
interface Located {
  readonly text: string;
  readonly k: number;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/UmlSource.java:95-106 */
function isNoise(line: string): boolean {
  return (
    line === '' || line.startsWith('skinparam ') || line.startsWith('skinparamlocked ') || line.startsWith('!pragma ')
  );
}

/** Keep the `@start` line, drop every noise line directly after it.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/UmlSource.java:79-93 */
function removeInitialNoise(all: readonly string[]): Located[] {
  let cut = 1;
  while (cut < all.length && isNoise(all[cut]!)) cut++;
  const located = all.map((text, k) => ({ text, k }));
  return [...located.slice(0, 1), ...located.slice(cut)];
}

/** `BlockUml#data`; a hand-built source has its interior only, framed by its own tag. */
export function upstreamLinesOf(source: UmlSource): readonly string[] {
  return source.seedSourceLines ?? [`@start${source.type}`, ...source.lines, `@end${source.type}`];
}

/**
 * The document line (what `errorSvg` indexes) of upstream line `k`: aligned
 * through `linePositions`, which is parallel to the directive-stripped
 * `lines`, a subsequence of upstream's. Without positions `k` already is it.
 * Mirrors `diagrams/dot/parser.ts#documentLineOf`.
 */
export function documentLineOf(source: UmlSource, all: readonly string[], k: number): number {
  const positions = source.linePositions;
  if (positions === undefined) return k;
  const mapped: (readonly [number, number])[] = [];
  let j = 0;
  for (let i = 1; i < all.length && j < source.lines.length; i++) {
    if (all[i] !== source.lines[j]) continue;
    const p = positions[j++];
    if (p !== undefined) mapped.push([i, p]);
  }
  const after = mapped.find(([i]) => i >= k);
  if (after !== undefined) return after[1] - (after[0] - k);
  const before = mapped.at(-1);
  return before === undefined ? k : before[1] + (k - before[0]);
}

/** `UmlSource#isStartDef`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/UmlSource.java:288-290 */
function isStartDef(lines: readonly Located[]): boolean {
  return lines[0]!.text.startsWith('@startdef');
}

/** `isEmptyLine`: `result.getTrimmed().getString().length() == 0`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemBasicFactory.java:70-72 */
function isEmptyLine(s: string): boolean {
  return trin(s).length === 0;
}

/**
 * `createSystem`: drop initial noise, hand the start line to `initDiagram`,
 * skip blank lines while `first`, stop at the end directive (the empty test
 * first), and feed every other line, untrimmed, to `executeLine`.
 *
 * Refusal scale: `consumed` is the offending line's index in the noise-free
 * source (`it.getTrace().size() - 1`), as `PSystemSingleLineFactory.ts`'s is.
 *
 * `removeInitialNoise` is applied to the lines `createSystem` walks only; the
 * empty test reads `source.getTotalLineCount()` AFTER `source =
 * source.removeInitialNoise()` (java:77), so it counts the noise-free lines.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemBasicFactory.java:74-101
 */
export function createSystem<P>(
  factory: BasicFactory<P>,
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
): P | ParseRefusal {
  const all = upstreamLinesOf(source);
  const lines = removeInitialNoise(all);
  let system = factory.initDiagram(source, lines[0]!.text, preprocessing);
  let first = true;
  for (let i = 1; i < lines.length; i++) {
    const s = lines[i]!;
    if (first && isEmptyLine(s.text)) continue;
    first = false;
    if (isEndDirective(s.text)) {
      if (lines.length === EMPTY_SOURCE_LINE_COUNT && !isStartDef(lines))
        return refuse('syntax', documentLineOf(source, all, s.k), i, EMPTY_DESCRIPTION);
      return system;
    }
    const next = factory.executeLine(source, system, s.text, preprocessing);
    if (next === undefined) return refuse('syntax', documentLineOf(source, all, s.k), i, SYNTAX_ERROR);
    system = next;
  }
  return system;
}
