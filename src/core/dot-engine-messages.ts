/**
 * Keeps `@knowvah/dot-engine`'s graphviz messages off the host's console.
 *
 * Upstream runs `dot` as a subprocess and merges its stderr into the output
 * stream (`ProcessRunner.java:69`, `redirectErrorStream(true)`). The svek
 * layout reads that stream only for coordinates (`DotStringFactory.java:
 * 323-343`), so a graphviz warning such as `table size too small for content`
 * never reaches a user of a diagram that renders. The engine, by contrast,
 * writes the same warning with `console.warn` unless a sink is installed
 * (`agseterrf`, graphviz's `lib/cgraph/agerror.c`), which is process-wide; see
 * docs/graphviz-issues/42-console-warn-with-no-sink.md.
 *
 * {@link withEngineMessagesDropped} installs a sink that drops every message
 * for one synchronous engine call and puts back whatever sink was there
 * before, so plantuml-engine never leaves a host's own sink replaced.
 *
 * `@startdot` writes the merged stream as its image (`PSystemDot.java:97-98`),
 * so the jar's output starts with the warning text; that caller uses
 * {@link withEngineMessagesCollected} to mirror it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/ProcessRunner.java:59-99
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/DotStringFactory.java:323-343
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/directdot/PSystemDot.java:97-98
 */
import { agseterrf, type AgUserErrF } from '@knowvah/dot-engine';

/** The sink in force while plantuml-engine calls the layout engine: every message is dropped. */
const DROP_ENGINE_MESSAGE = (): void => {};

/**
 * Run one synchronous engine call with `sink` receiving its graphviz messages,
 * then restore the sink that was installed before, even when `call` throws.
 */
function withEngineSink<T>(sink: AgUserErrF, call: () => T): T {
  const previous = agseterrf(sink);
  try {
    return call();
  } finally {
    agseterrf(previous);
  }
}

/** Run one synchronous engine call with its graphviz messages dropped. */
export function withEngineMessagesDropped<T>(call: () => T): T {
  return withEngineSink(DROP_ENGINE_MESSAGE, call);
}

/**
 * Run one synchronous engine call and return its value with every graphviz
 * message it wrote, joined as `dot`'s stderr would print them.
 */
export function withEngineMessagesCollected<T>(call: () => T): { value: T; messages: string } {
  const pieces: string[] = [];
  const value = withEngineSink((message) => {
    pieces.push(message);
  }, call);
  return { value, messages: pieces.join('') };
}
