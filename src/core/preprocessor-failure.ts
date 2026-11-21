/**
 * The located-line helpers `preprocessor.ts` builds a `PreprocessorFailure`
 * and its `BlockUml#data` with -- split out of `preprocessor.ts` (500-line cap).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/TimLoader.java#load
 */
import { EaterException } from './tim/EaterException.js';
import { StringLocated } from './tim/StringLocated.js';
import type { TContext } from './tim/TContext.js';
import { BLOCK_E1_BREAKLINE } from './tim/builtin/jaws-constants.js';
import { mutateExpandsBreakline } from './uml-source-lines.js';

/**
 * `BlockUml`'s constructor runs `Jaws.mutateExpands1(tmp)` on the TIM result
 * list (`BlockUml.java:153`) before any command sees it: every
 * `BLOCK_E1_BREAKLINE` (`%breakline()`, C4's `$bl()`) outside a `{{...}}`
 * embed splits the line, each piece keeping the line's location and
 * preprocessor error (`jaws/Jaws.java:65-120`). Collecting before this split
 * read C4's `$defineSkinparams` output -- several `skinparam X { }` blocks on
 * one line -- as ONE single-line skinparam whose value was the whole blob
 * (cdd6 verify.md, "C4 `>>` head + `$bl()` split"). The per-line split is
 * {@link mutateExpandsBreakline}'s; this re-wraps its pieces as located lines.
 * `mergeTripleMarkBlocks` is not run: `JawsFlags.PARSE_NEW_MULTILINE_TRIPLE_MARKS`
 * is `false` (`JawsFlags.java:41`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/jaws/Jaws.java:59-63
 */
export function mutateExpands1(lines: readonly StringLocated[]): StringLocated[] {
  return lines.flatMap((sl) => {
    const s = sl.getString();
    if (!s.includes(BLOCK_E1_BREAKLINE)) return [sl];
    return mutateExpandsBreakline([s]).map(
      (piece) => new StringLocated(piece, sl.getLocation(), undefined, sl.getPreprocessorError()),
    );
  });
}

/**
 * `TimLoader#load`'s catch: `context.getResultList().add(e.getLocation()
 * .withErrorPreprocessor(e.getMessage()))`, then `BlockUml`'s
 * `Jaws.mutateExpands1(tmp)`. A throw that is not an `EaterException` (this
 * port's include errors) has no upstream location; its marked trace line
 * stands in for it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/TimLoader.java:76-85
 */
export function failureDataOf(context: TContext, e: unknown, trace: readonly StringLocated[]): StringLocated[] {
  const location = e instanceof EaterException ? e.getLocation() : undefined;
  const errorLine = location instanceof StringLocated ? location.withErrorPreprocessor(messageOf(e)) : trace.at(-1);
  const result = [...context.getResultList()];
  if (errorLine !== undefined) result.push(errorLine);
  return mutateExpands1(result);
}

/** @see ~/git/plantuml/.../tim/TimLoader.java#changeLastLine */
export function markLastLine(debug: readonly StringLocated[], message: string): readonly StringLocated[] {
  const num = debug.length - 1;
  if (num < 0) return debug;

  const result = [...debug];
  result[num] = debug[num]!.withErrorPreprocessor(message);
  return result;
}

/**
 * An `EaterException`'s message is the error text upstream prints verbatim. Any
 * other throw has no upstream counterpart here, so it is reported as it reads.
 */
export function messageOf(e: unknown): string {
  if (e instanceof EaterException) return e.getMessage();

  return e instanceof Error ? e.message : String(e);
}
