// Import for its side effect: pins @knowvah/dot-engine's text measurer to the
// canvas-free lookup table. Load-bearing HERE in a way it is not for the svek
// layout seam — this path lets the engine measure every node label itself, and
// the measured difference against the oracle is 0 diffs vs 8/5/4/36/33. See
// that module's own doc comment.
import '../../core/dot-engine-measurer.js';

import { renderSvg } from '@knowvah/dot-engine';

import { withEngineMessagesCollected } from '../../core/dot-engine-messages.js';

import type { DotDiagramAST, DotGeometry } from './ast.js';

/**
 * Run graphviz over the DOT body and keep its SVG.
 *
 * This is the whole of `@startdot` layout AND rendering — `renderSvg` does
 * both, exactly as the graphviz executable does for upstream
 * (`PSystemDot#exportDiagramNow`). `renderer.ts` only decides how to package
 * the result.
 *
 * A parse or render failure is surfaced up so the pipeline reports it, rather
 * than silently producing nothing. NOT upstream's behaviour: the jar merges
 * graphviz's stderr into its output (`ProcessRunner.java:69`,
 * `redirectErrorStream(true)`), so a DOT syntax error emits graphviz's own
 * text (`Error: <stdin>: syntax error in line 3 near '->'`) instead of an
 * SVG. Reproducing that needs graphviz's yacc error point and token, which
 * @knowvah/dot-engine's parser does not expose (and its grammar accepts some
 * inputs graphviz rejects) — library-forced; see the unwind-U2 notes. A
 * graphviz WARNING on a diagram that renders is mirrored: it precedes the SVG.
 */
export function layoutDot(ast: DotDiagramAST): DotGeometry {
  let svg: string;
  try {
    // The jar's image is dot's merged stdout and stderr (`ProcessRunner.java:69`,
    // `PSystemDot.java:97-98`): graphviz's warnings come before the SVG.
    const { value, messages } = withEngineMessagesCollected(() => renderSvg(ast.dotContent, 'dot'));
    svg = messages + value;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`@startdot: could not render DOT — ${detail}`);
  }

  return { svg };
}
