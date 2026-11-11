/**
 * Would JLaTeXMath 1.0.7 parse `tex` without throwing? `ScientificEquationSafe#getSvg`
 * catches every exception from the equation and draws its rollback instead
 * (`ScientificEquationSafe.java:91-115`, decisions.md D5), so this decides
 * between the typeset document and the rollback.
 *
 * The parser's throws this mirrors, each read from `TeXParser` in the pinned
 * jar (`javap -c org.scilab.forge.jlatexmath.TeXParser`):
 * - `processEscape`: a `\name` that is neither a `MacroInfo.Commands` key, a
 *   predefined formula nor a symbol -- "Unknown symbol or command or
 *   predefined TeXFormula". The vocabulary is {@link JLM_NAMES}.
 *   `getCommand` reads a run of ASCII letters, else one character.
 * - `firstpass`: `\begin{env}` whose `env@env` command does not exist --
 *   "Unknown environment". `\end{env}` is consumed with it.
 * - `parse`, `'}'`: a closing brace that takes `group` below zero -- "Found a
 *   closing '}' without an opening '{'!". A missing closing brace is not an
 *   error (`cov-latex-syntax`, `\frac{a`, typesets 24x45).
 * - `parse`, `'&'`: outside array mode -- "Character '&' is only available in
 *   array mode !".
 * `\right` is consumed by the `\left` macro's `getGroup("\\left", "\\right")`,
 * so it is valid only after an open `\left`.
 *
 * Not mirrored: `convertCharacter`'s "Unknown character" for a character with
 * no mapping, and `\newcommand` definitions that extend the vocabulary at
 * parse time; no corpus formula reaches either.
 */
import { JLM_NAMES } from './jlm-commands.js';

/** `MacroInfo.Commands` key of an environment: `NewEnvironmentMacro.addNewEnvironment` registers
 *  `name + "@env"` (`PredefMacros.<clinit>`), and `firstpass` looks `\begin{name}` up the same way. */
const ENV_SUFFIX = '@env';

/** One `\command` and where scanning resumes. */
interface Command {
  readonly name: string;
  readonly next: number;
}

const isAsciiLetter = (c: string): boolean => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');

/** `TeXParser#getCommand`: the letters after `\`, else the one character after it. */
function readCommand(tex: string, backslash: number): Command {
  let p = backslash + 1;
  while (p < tex.length && isAsciiLetter(tex[p]!)) p++;
  if (p === backslash + 1 && p < tex.length) p++;
  return { name: tex.slice(backslash + 1, p), next: p };
}

/** The `{name}` group after `\begin`/`\end`, white space before it skipped. */
function readEnvName(tex: string, from: number): Command | undefined {
  let p = from;
  while (p < tex.length && tex[p] === ' ') p++;
  if (tex[p] !== '{') return undefined;
  const close = tex.indexOf('}', p);
  if (close < 0) return undefined;
  return { name: tex.slice(p + 1, close), next: close + 1 };
}

/** The parser state the throws depend on. */
interface ScanState {
  depth: number;
  arrayMode: number;
  lefts: number;
}

/** One command: `undefined` when JLaTeXMath would throw on it, else where scanning resumes. */
function acceptCommand(tex: string, at: number, state: ScanState): number | undefined {
  const cmd = readCommand(tex, at);
  if (cmd.name === '') return cmd.next;
  if (cmd.name === 'begin' || cmd.name === 'end') {
    const env = readEnvName(tex, cmd.next);
    if (env === undefined || !JLM_NAMES.has(`${env.name}${ENV_SUFFIX}`)) return undefined;
    state.arrayMode += cmd.name === 'begin' ? 1 : -1;
    return env.next;
  }
  if (cmd.name === 'left') state.lefts++;
  else if (cmd.name === 'right') {
    if (state.lefts === 0) return undefined;
    state.lefts--;
  } else if (!JLM_NAMES.has(cmd.name)) return undefined;
  return cmd.next;
}

/** True when JLaTeXMath parses `tex`; false where it throws (see the module comment). */
export function jlmAccepts(tex: string): boolean {
  const state: ScanState = { depth: 0, arrayMode: 0, lefts: 0 };
  let i = 0;
  while (i < tex.length) {
    const c = tex[i]!;
    if (c === '\\') {
      const next = acceptCommand(tex, i, state);
      if (next === undefined) return false;
      i = next;
      continue;
    }
    if (c === '{') state.depth++;
    else if (c === '}' && --state.depth < 0) return false;
    else if (c === '&' && state.arrayMode <= 0) return false;
    i++;
  }
  return true;
}
