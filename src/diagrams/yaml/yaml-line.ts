// Port of net.sourceforge.plantuml.yaml.parser.YamlLine and YamlLineType

import { YamlSyntaxException } from './yaml-syntax-exception.js';

/** `YamlLine.java:74,95`: the subset refuses `{...}`, as a value or a whole line. */
const FLOW_MAPPING_NOT_SUPPORTED = 'flow mappings {...} are not supported';

export enum YamlLineType {
  EMPTY_LINE = 'EMPTY_LINE',
  NO_KEY_ONLY_TEXT = 'NO_KEY_ONLY_TEXT',
  KEY_ONLY = 'KEY_ONLY',
  KEY_AND_VALUE = 'KEY_AND_VALUE',
  KEY_AND_FLOW_SEQUENCE = 'KEY_AND_FLOW_SEQUENCE',
  KEY_AND_BLOCK_STYLE = 'KEY_AND_BLOCK_STYLE',
  KEY_AND_FOLDED_STYLE = 'KEY_AND_FOLDED_STYLE',
  PLAIN_ELEMENT_LIST = 'PLAIN_ELEMENT_LIST',
  PLAIN_DASH = 'PLAIN_DASH',
}

export interface YamlLine {
  readonly indent: number;
  readonly key: string | null;
  readonly value: string | null;
  readonly values: readonly string[] | null;
  readonly listItem: boolean;
  readonly type: YamlLineType;
}

// Strip inline and full-line YAML comments.
// Port of YamlLine.removeYamlComment().
function removeYamlComment(s: string): string {
  if (s.length === 0) return s;

  // A line that starts with '#' is entirely a comment.
  if (s.charAt(0) === '#') return '';

  let inQuoteChar = '\0';

  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);

    if (c === "'" || c === '"') {
      if (inQuoteChar === '\0') {
        inQuoteChar = c;
      } else if (c === inQuoteChar) {
        inQuoteChar = '\0';
      }
    }

    if (inQuoteChar === '\0' && i < s.length - 1 && c === ' ' && s.charAt(i + 1) === '#') {
      return s.substring(0, i);
    }
  }

  return s;
}

// Find the first ':' outside quoted strings; inside a double-quoted one a
// backslash skips the next character.
// Port of YamlLine.findColonSeparator() (`YamlLine.java:104-121`).
function findColonSeparator(line: string): number {
  let inQuote = '\0';
  for (let i = 0; i < line.length; i++) {
    const c = line.charAt(i);
    if (inQuote !== '\0') {
      if (c === '\\' && inQuote === '"') i++;
      else if (c === inQuote) inQuote = '\0';
    } else if (c === '"' || c === "'") {
      inQuote = c;
    } else if (c === ':') {
      return i;
    }
  }
  return -1;
}

/**
 * Removes the quotes of a quoted scalar. In a single-quoted scalar, '' is a
 * quote; in a double-quoted one, a backslash escapes (\" \\ \n \t \/).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlLine.java:195-211
 */
function unquote(str: string): string {
  if (str.length < 2) return str;
  const first = str.charAt(0);
  const last = str.charAt(str.length - 1);
  if (first === "'" && last === "'") return str.substring(1, str.length - 1).replaceAll("''", "'");
  if (first === '"' && last === '"') return unescapeDoubleQuoted(str.substring(1, str.length - 1));
  return str;
}

/** A double-quoted scalar's escape, given the character after its backslash (`YamlLine.java:224-231`). */
function unescaped(next: string): string {
  if (next === 'n') return '\n';
  if (next === 't') return '\t';
  if (next === '"' || next === '\\' || next === '/') return next;
  return `\\${next}`;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlLine.java:213-234 */
function unescapeDoubleQuoted(s: string): string {
  if (!s.includes('\\')) return s;
  let result = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    if (c !== '\\' || i + 1 === s.length) {
      result += c;
      continue;
    }
    result += unescaped(s.charAt(++i));
  }
  return result;
}

// Parse a comma-separated flow sequence value (content between '[' and ']').
// Port of YamlLine.toList().
function toList(rawValue: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotedString = '\0';
  let fieldStartWithQuote = false;

  for (let i = 0; i < rawValue.length; i++) {
    const c = rawValue.charAt(i);

    if (inQuotedString !== '\0') {
      // Inside a quoted string
      if (c === '\\') {
        if (i + 1 < rawValue.length) {
          current += rawValue.charAt(i + 1);
          i++;
        }
      } else if (c === inQuotedString) {
        inQuotedString = '\0';
      } else {
        current += c;
      }
    } else {
      // Outside a quoted string
      if (!fieldStartWithQuote && current.trim() === '' && (c === "'" || c === '"')) {
        inQuotedString = c;
        fieldStartWithQuote = true;
        current = '';
      } else if (c === ',') {
        result.push(fieldStartWithQuote ? current : current.trim());
        current = '';
        fieldStartWithQuote = false;
      } else if (c === '\\') {
        if (i + 1 < rawValue.length) {
          current += rawValue.charAt(i + 1);
          i++;
        }
      } else {
        current += c;
      }
    }
  }

  // Emit the final field
  const last = fieldStartWithQuote ? current : current.trim();
  result.push(last);

  return result;
}

/** The fields of a `YamlLine` that only some types carry. */
interface YamlLineFields {
  readonly key?: string;
  readonly value?: string;
  readonly values?: readonly string[];
}

/** The private `YamlLine` constructor (`YamlLine.java:184-191`); absent fields are null. */
function yamlLine(type: YamlLineType, indent: number, listItem: boolean, fields: YamlLineFields = {}): YamlLine {
  return {
    type,
    indent,
    key: fields.key ?? null,
    value: fields.value ?? null,
    values: fields.values ?? null,
    listItem,
  };
}

/**
 * The type of a `key: value` line, from its raw value; a flow mapping is
 * refused. `KEY_AND_FLOW_SEQUENCE` is decided by the caller.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlLine.java:86-95
 */
function keyedType(rawValue: string): YamlLineType {
  if (rawValue === '') return YamlLineType.KEY_ONLY;
  if (rawValue === '|') return YamlLineType.KEY_AND_BLOCK_STYLE;
  if (rawValue === '>') return YamlLineType.KEY_AND_FOLDED_STYLE;
  if (rawValue.startsWith('{')) throw new YamlSyntaxException(FLOW_MAPPING_NOT_SUPPORTED);
  return YamlLineType.KEY_AND_VALUE;
}

/** The part of `build` after the colon was found (`YamlLine.java:83-101`). */
function buildKeyed(trimmedLine: string, colonIndex: number, count: number, listItem: boolean): YamlLine {
  const key = unquote(trimmedLine.substring(0, colonIndex).trim());
  const rawValue = trimmedLine.substring(colonIndex + 1).trim();
  const type = keyedType(rawValue);
  if (type === YamlLineType.KEY_AND_VALUE && rawValue.startsWith('[') && rawValue.endsWith(']')) {
    const values = toList(rawValue.substring(1, rawValue.length - 1));
    return yamlLine(YamlLineType.KEY_AND_FLOW_SEQUENCE, count, listItem, { key, values });
  }
  // Only KEY_AND_VALUE exposes its value (`YamlLine#getValue`, YamlLine.java:262-267).
  if (type !== YamlLineType.KEY_AND_VALUE) return yamlLine(type, count, listItem, { key });
  return yamlLine(type, count, listItem, { key, value: unquote(rawValue) });
}

// Build a YamlLine from a raw input line.
// Port of YamlLine.build() (`YamlLine.java:51-101`).
export function build(line: string): YamlLine {
  // Expand tabs to 4 spaces
  line = line.replaceAll('\t', '    ');

  // Count leading spaces
  let count = 0;
  while (count < line.length && line.charAt(count) === ' ') count++;

  // Extract content after leading whitespace and strip comments
  let trimmedLine = removeYamlComment(line.substring(count).trim());

  if (trimmedLine === '') return yamlLine(YamlLineType.EMPTY_LINE, 0, false);

  // A bare "-" is a plain dash list entry
  if (trimmedLine === '-') return yamlLine(YamlLineType.PLAIN_DASH, count + 1, true);

  const listItem = trimmedLine.startsWith('- ');

  if (listItem) {
    count += 2;
    trimmedLine = trimmedLine.substring(2);
  }

  if (trimmedLine.startsWith('{')) throw new YamlSyntaxException(FLOW_MAPPING_NOT_SUPPORTED);

  const colonIndex = findColonSeparator(trimmedLine);
  if (colonIndex !== -1) return buildKeyed(trimmedLine, colonIndex, count, listItem);
  const value = unquote(trimmedLine);
  if (listItem) return yamlLine(YamlLineType.PLAIN_ELEMENT_LIST, count, true, { value });
  return yamlLine(YamlLineType.NO_KEY_ONLY_TEXT, count, false, { value });
}
