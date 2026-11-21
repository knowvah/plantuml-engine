import { HColorSet } from '../../core/klimt/color/HColorSet.js';

const STEREO1 = /^:::([^\s:]+)/;
const STEREO2 = /^<<([^<>]+)>>/;
const ICON = /^icon\(([^)]*)\)/;
const COLOR = /^(#[0-9a-zA-Z]+)(?=\s|$)/;
const TRAILING = /\s+(:::[^\s:]+|<<[^<>]+>>|icon\([^)]*\)|#[0-9a-zA-Z]+)$/;
const HEX_COLOR = /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const NAMED_COLOR = /^[a-zA-Z]+$/;

/**
 * Where an annotation may start, when the name is not quoted. `:::` and `<<` may stick to the name, the others
 * need a blank before them.
 */
const ANNOTATION_START = /:::[^\s:]|<<[^<>]+>>|\s##|\sicon\(|\s#[0-9a-zA-Z]+(?=\s|$)/g;

const BLANK = /\s/;

/**
 * True for `#red` or `#FFC107`, but not for `#12` or `#todo`: a word that only looks like a color stays in the
 * name.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FLabel.java:222-231
 */
export function isColor(s: string): boolean {
  if (!s.startsWith('#') || s.length < 2) return false;
  const value = s.substring(1);
  if (HEX_COLOR.test(value)) return true;
  if (NAMED_COLOR.test(value)) return HColorSet.instance().getColorOrNull(value) !== undefined;
  return false;
}

function firstBlank(s: string): number {
  for (let i = 0; i < s.length; i++) if (BLANK.test(s.charAt(i))) return i;
  return -1;
}

/**
 * Position of the first annotation in `" " + text`, given back as a position in `text`, or -1.
 * @see FLabel.java:197-215
 */
function annotationStart(spaced: string): number {
  const m = new RegExp(ANNOTATION_START.source, 'g');
  let from = 0;
  for (;;) {
    m.lastIndex = from;
    const found = m.exec(spaced);
    if (found === null) return -1;
    const text = found[0];
    const start = BLANK.test(text.charAt(0)) ? found.index + 1 : found.index;
    const trimmed = text.trim();
    if (trimmed.startsWith('#') && !trimmed.startsWith('##') && !isColor(trimmed)) {
      from = found.index + 1;
      continue;
    }
    // "start" counts the extra leading blank
    return Math.max(0, start - 1);
  }
}

/** The name (quoted, or up to the first annotation) and the text after it. @see FLabel.java:76-92 */
function splitName(text: string): { name: string; rest: string } {
  if (text.startsWith('"') && text.indexOf('"', 1) > 0) {
    const end = text.indexOf('"', 1);
    return { name: text.substring(1, end), rest: text.substring(end + 1) };
  }
  const start = annotationStart(` ${text}`);
  if (start === -1) return { name: text, rest: '' };
  return { name: text.substring(0, start).trim(), rest: text.substring(start) };
}

/** What follows a `##`: the description, with the annotations written after it taken out. */
function readDescription(rest: string, into: Mutable): void {
  let desc = rest.substring(2).trim();
  for (;;) {
    const m = TRAILING.exec(desc);
    if (m === null) break;
    const tail = m[1]!;
    if (tail.startsWith('#') && !isColor(tail)) break;
    desc = desc.substring(0, m.index).trim();
    if (tail.startsWith(':::')) into.stereotypes.unshift(tail.substring(3));
    else if (tail.startsWith('<<')) into.stereotypes.unshift(tail.substring(2, tail.length - 2).trim());
    else if (tail.startsWith('icon(')) into.icon = tail.substring(5, tail.length - 1).trim();
    else into.color = tail;
  }
  into.description = desc;
}

interface Mutable {
  description: string | null;
  color: string | null;
  icon: string | null;
  stereotypes: string[];
}

/** One leading annotation of `rest`; answers what is left of `rest`, or `null` when `rest` starts with none. */
function readAnnotation(rest: string, into: Mutable): string | null {
  let m = STEREO1.exec(rest);
  if (m !== null) {
    into.stereotypes.push(m[1]!);
    return rest.substring(m[0].length);
  }
  m = STEREO2.exec(rest);
  if (m !== null) {
    into.stereotypes.push(m[1]!.trim());
    return rest.substring(m[0].length);
  }
  m = ICON.exec(rest);
  if (m !== null) {
    into.icon = m[1]!.trim();
    return rest.substring(m[0].length);
  }
  m = COLOR.exec(rest);
  if (m !== null && isColor(m[1]!)) {
    into.color = m[1]!;
    return rest.substring(m[0].length);
  }
  return null;
}

/**
 * `FLabel` -- the text of one entry line split into the name and its annotations (`:::highlight`, `<<stereo>>`,
 * `icon(x)`, `#color`, `## description`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FLabel.java:44-246
 */
export class FLabel {
  private constructor(
    private readonly name: string,
    private readonly description: string | null,
    private readonly stereotypes: readonly string[],
    private readonly color: string | null,
    private readonly icon: string | null,
  ) {}

  /** @see FLabel.java:75-160 */
  static parse(input: string): FLabel {
    const split = splitName(input.trim());
    let name = split.name;
    let rest = split.rest;

    const state: Mutable = { description: null, color: null, icon: null, stereotypes: [] };
    const unknown: string[] = [];
    for (;;) {
      rest = rest.trim();
      if (rest.length === 0) break;
      if (rest.startsWith('##')) {
        // The description runs to the end of the line, but annotations written after it still count
        readDescription(rest, state);
        break;
      }
      const left = readAnnotation(rest, state);
      if (left !== null) {
        rest = left;
        continue;
      }
      // Not an annotation after all: it belongs to the name
      const space = firstBlank(rest);
      unknown.push(space === -1 ? rest : rest.substring(0, space));
      rest = space === -1 ? '' : rest.substring(space);
    }
    if (unknown.length > 0) name = `${name} ${unknown.join(' ')}`.trim();

    return new FLabel(name, state.description, state.stereotypes, state.color, state.icon);
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getStereotypes(): readonly string[] {
    return this.stereotypes;
  }

  getColor(): string | null {
    return this.color;
  }

  getIcon(): string | null {
    return this.icon;
  }
}
