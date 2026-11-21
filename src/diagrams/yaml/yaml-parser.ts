/**
 * Port of `net.sourceforge.plantuml.yaml.parser.YamlParser` (0537b558644).
 *
 * Reads the subset of YAML that PlantUML uses: nested maps, lists (of scalars
 * and maps), inline lists `[a, b]`, quoted scalars, block scalars (`|` and
 * `>`), plain scalars on several lines, and comments. Every scalar stays a
 * string.
 *
 * What is not supported is an error (flow mappings, a list inside a list) or
 * left as plain text (anchors, tags, several documents). Every error is a
 * {@link YamlSyntaxException} that carries the line (counted from 1).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlParser.java
 */

import { build, YamlLineType, type YamlLine } from './yaml-line.js';
import { YamlBuilder } from './yaml-builder.js';
import { YamlSyntaxException } from './yaml-syntax-exception.js';
import { javaTrim } from '../../core/java-number-format.js';
import type { Monomorph } from './monomorph.js';

/**
 * The lines to read. `pos` is mutated by every reader that consumes a line.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlParser.java:52-74
 */
class Lines {
  private pos = 0;

  constructor(private readonly text: readonly string[]) {}

  peek(ahead: number): string | null {
    const tmp = this.pos + ahead;
    return tmp < this.text.length ? this.text[tmp]! : null;
  }

  jump(): void {
    this.pos++;
  }

  /** The line being read, counted from 1. */
  lineNumber(): number {
    return this.pos + 1;
  }
}

/** `YamlParser.java:76`. */
const LIST_IN_LIST = 'a list inside a list is not supported';

/** `"- - a"`: the first element of a list is a list (`YamlParser.java:78-82`). */
function isListInList(line: string): boolean {
  const rest = javaTrim(line);
  return rest.startsWith('- ') && javaTrim(rest.substring(2)).startsWith('- ');
}

/** `YamlParser.java:180-185`. */
function leadingSpaces(s: string): number {
  let count = 0;
  while (count < s.length && s.charAt(count) === ' ') count++;
  return count;
}

/** Java's `\s` (`[ \t\n\x0B\f\r]`), at the end: `replaceAll("\\s+$", "")`. */
const TRAILING_JAVA_SPACES = /[ \t\n\v\f\r]+$/u;

/**
 * The folded form (">") of a block: the line breaks between two lines of text
 * are spaces, an empty line is a line break. (A line indented deeper is folded
 * like the others: YAML keeps its line breaks, which is not done upstream.)
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlParser.java:270-298
 */
function fold(block: string): string {
  if (block === '') return block;
  let result = '';
  let previousIsText = false;
  let empty = 0;
  for (const line of block.split('\n')) {
    if (line === '') {
      empty++;
      continue;
    }
    if (previousIsText && empty === 0) result += ' ';
    else result += '\n'.repeat(empty);
    empty = 0;
    result += line;
    previousIsText = true;
  }
  return `${result}\n`;
}

/** `YamlParser.java:224-236`: the next line that is not empty, without consuming it. */
function peekNext(lines: Lines): YamlLine | null {
  for (let i = 1; ; i++) {
    const peek = lines.peek(i);
    if (peek === null) return null;
    const next = build(peek);
    if (next.type !== YamlLineType.EMPTY_LINE) return next;
  }
}

/** `YamlParser.java:202-222`: consumes the empty and key-less lines that follow, joined by spaces. */
function peekNextOnlyText(lines: Lines): string {
  const parts: string[] = [];
  for (let peek = lines.peek(1); peek !== null; peek = lines.peek(1)) {
    const next = build(peek);
    if (next.type === YamlLineType.NO_KEY_ONLY_TEXT) parts.push(next.value!);
    else if (next.type !== YamlLineType.EMPTY_LINE) break;
    lines.jump();
  }
  return parts.join(' ');
}

/**
 * The value of "key: value", plus the lines that continue it (deeper, without
 * a key): in a plain scalar on several lines, the line breaks are spaces.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlParser.java:187-200
 */
function plainScalar(yamlLine: YamlLine, lines: Lines): string {
  let result = yamlLine.value!;
  for (;;) {
    const next = peekNext(lines);
    if (next === null || next.type !== YamlLineType.NO_KEY_ONLY_TEXT || next.indent <= yamlLine.indent) return result;
    result += ` ${peekNextOnlyText(lines)}`;
  }
}

/**
 * The text of a block scalar ("|"): the lines that follow, indented deeper
 * than the key, without the indentation of the first one (a deeper
 * indentation is kept, and so are the comments), and one line break at the
 * end. The first line indented no deeper than the key ends it, even a comment.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlParser.java:238-268
 */
function getBlockStyleString(indent: number, lines: Lines): string {
  const block: string[] = [];
  let blockIndent = -1;
  for (let line = lines.peek(1); line !== null; line = lines.peek(1)) {
    if (javaTrim(line) === '') {
      block.push('');
      lines.jump();
      continue;
    }
    const expanded = line.replaceAll('\t', '    ');
    const lineIndent = leadingSpaces(expanded);
    if (lineIndent <= indent) break;
    if (blockIndent === -1) blockIndent = lineIndent;
    block.push(expanded.substring(Math.min(blockIndent, lineIndent)).replace(TRAILING_JAVA_SPACES, ''));
    lines.jump();
  }
  // The empty lines at the end are not part of the text.
  while (block.length > 0 && block[block.length - 1] === '') block.pop();
  return block.map((l) => `${l}\n`).join('');
}

/** The scalar of a keyed line whose value may span the following lines (`YamlParser.java:141-146,165-170`). */
function scalarOf(yamlLine: YamlLine, lines: Lines): string | null {
  switch (yamlLine.type) {
    case YamlLineType.KEY_AND_VALUE:
      return plainScalar(yamlLine, lines);
    case YamlLineType.KEY_AND_BLOCK_STYLE:
      return getBlockStyleString(yamlLine.indent, lines);
    case YamlLineType.KEY_AND_FOLDED_STYLE:
      return fold(getBlockStyleString(yamlLine.indent, lines));
    default:
      return null;
  }
}

/** The list-item half of `YamlParser#onLine` (`YamlParser.java:135-153`). True if it opens a deeper level. */
function onListItemLine(yamlBuilder: YamlBuilder, yamlLine: YamlLine, lines: Lines): boolean {
  if (yamlLine.type === YamlLineType.KEY_ONLY) {
    yamlBuilder.onListItemOnlyKey(yamlLine.key!);
    return true;
  }
  if (yamlLine.type === YamlLineType.PLAIN_ELEMENT_LIST) {
    yamlBuilder.onListItemOnlyValue(yamlLine.value!);
    return false;
  }
  const scalar = scalarOf(yamlLine, lines);
  if (scalar !== null) yamlBuilder.onListItemKeyAndValue(yamlLine.key!, scalar);
  else if (yamlLine.type === YamlLineType.KEY_AND_FLOW_SEQUENCE)
    yamlBuilder.onListItemKeyAndFlowSequence(yamlLine.key!, [...yamlLine.values!]);
  else {
    // Unreachable: parseLine filters EMPTY_LINE, NO_KEY_ONLY_TEXT and PLAIN_DASH; kept as upstream has it.
    /* v8 ignore next */
    throw new YamlSyntaxException('unsupported list item');
  }
  return false;
}

/** The map half of `YamlParser#onLine` (`YamlParser.java:154-177`). True if it opens a deeper level. */
function onMapLine(yamlBuilder: YamlBuilder, yamlLine: YamlLine, lines: Lines): boolean {
  if (yamlLine.type === YamlLineType.KEY_ONLY) {
    const next = peekNext(lines);
    if (next === null || next.indent <= yamlLine.indent) {
      yamlBuilder.onKeyAndValue(yamlLine.key!, '');
      return false;
    }
    if (next.type === YamlLineType.NO_KEY_ONLY_TEXT) {
      yamlBuilder.onKeyAndValue(yamlLine.key!, peekNextOnlyText(lines));
      return false;
    }
    yamlBuilder.onOnlyKey(yamlLine.key!);
    return true;
  }
  const scalar = scalarOf(yamlLine, lines);
  if (scalar !== null) yamlBuilder.onKeyAndValue(yamlLine.key!, scalar);
  else if (yamlLine.type === YamlLineType.KEY_AND_FLOW_SEQUENCE)
    yamlBuilder.onKeyAndFlowSequence(yamlLine.key!, [...yamlLine.values!]);
  else {
    // Unreachable: a PLAIN_ELEMENT_LIST is always a list item (YamlLine.java:79-80); kept as upstream has it.
    /* v8 ignore next */
    throw new YamlSyntaxException('unsupported line');
  }
  return false;
}

/** A bare "-" (`YamlParser.java:104-111`): refused when its first element is a list. Opens a level. */
function onPlainDash(yamlBuilder: YamlBuilder, yamlLine: YamlLine, lines: Lines): boolean {
  const next = peekNext(lines);
  if (next !== null && next.listItem && next.indent - 2 > yamlLine.indent - 1)
    throw new YamlSyntaxException(LIST_IN_LIST);
  yamlBuilder.onListItemPlainDash();
  return true;
}

/** `YamlParser.java:113-115`: deeper than the current level, though no line opened one. */
function checkIndentation(yamlBuilder: YamlBuilder, yamlLine: YamlLine, opened: boolean): void {
  const currentIndent = yamlBuilder.currentIndent();
  if (yamlLine.indent > currentIndent && currentIndent !== -1 && !opened)
    throw new YamlSyntaxException('unexpected indentation');
}

/**
 * The body of `YamlParser#parse`'s try block for one line (`YamlParser.java:94-118`).
 * Returns the new `opened`: an indentation deeper than the current level is
 * only legal right after a line that opens a level (a key without value, a dash).
 */
function parseLine(yamlBuilder: YamlBuilder, lines: Lines, opened: boolean): boolean {
  const yamlLine = build(lines.peek(0)!);
  if (yamlLine.type === YamlLineType.EMPTY_LINE) return opened;

  if (yamlLine.type === YamlLineType.NO_KEY_ONLY_TEXT)
    throw new YamlSyntaxException(`text without a key: ${yamlLine.value!}`);

  if (isListInList(lines.peek(0)!)) throw new YamlSyntaxException(LIST_IN_LIST);

  if (yamlLine.type === YamlLineType.PLAIN_DASH) return onPlainDash(yamlBuilder, yamlLine, lines);

  checkIndentation(yamlBuilder, yamlLine, opened);
  yamlBuilder.adjustIndentation(yamlLine.indent);
  return yamlLine.listItem ? onListItemLine(yamlBuilder, yamlLine, lines) : onMapLine(yamlBuilder, yamlLine, lines);
}

export class YamlParser {
  /**
   * Parses the YAML body, one PlantUML source line each. Any failure -- of the
   * subset or of the builder (a list among the keys of a map...) -- is a
   * {@link YamlSyntaxException} on the line being read (`YamlParser.java:119-126`).
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlParser.java:84-131
   */
  parse(input: readonly string[]): Monomorph {
    const yamlBuilder = new YamlBuilder();
    const lines = new Lines(input);
    let opened = false;

    for (; lines.peek(0) !== null; lines.jump()) {
      const lineNumber = lines.lineNumber();
      try {
        opened = parseLine(yamlBuilder, lines, opened);
      } catch (e) {
        if (!(e instanceof YamlSyntaxException)) throw new YamlSyntaxException('inconsistent structure', lineNumber);
        if (e.getLine() !== 0) throw e;
        throw new YamlSyntaxException(e.message, lineNumber);
      }
    }

    return yamlBuilder.getResult();
  }
}
