import { FEntry } from './ast.js';
import { FLabel } from './flabel.js';
import { FilesIcons } from './files-icons.js';
import { TreePrefix } from './tree-prefix.js';

const TAB_SIZE = 4;
const NON_BREAKING_SPACE = ' ';
const NOTE_START = '<note>';
const NOTE_END = '</note>';

/** Lines that `tree`, `dir` and friends print around the tree itself. @see FilesParser.java:51-54 */
const NOISE = new RegExp(
  '^(\\.|[a-z]:\\.?|\\d+ director(y|ies)(, \\d+ files?)?' +
    '|folder path listing.*|volume serial number.*|structure du dossier.*|le numéro de série.*' +
    '|auflistung der ordnerpfade.*|volumeseriennummer.*|no subfolders exist.*' +
    "|il n'existe aucun sous-dossier.*)$",
  'i',
);

/** A line of the tree and the entry it created. @see FilesParser.java:60-68 */
interface Level {
  readonly column: number;
  readonly entry: FEntry;
}

/**
 * Expands tabs and turns non-breaking spaces (that GNU tree prints after `├──`) into plain ones.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesParser.java:167-187
 */
export function normalize(line: string): string {
  if (!line.includes('\t') && !line.includes(NON_BREAKING_SPACE)) return line;
  let sb = '';
  for (const c of line) {
    if (c === '\t') {
      do sb += ' ';
      while (sb.length % TAB_SIZE !== 0);
    } else if (c === NON_BREAKING_SPACE) sb += ' ';
    else sb += c;
  }
  return sb;
}

/**
 * `FilesParser` -- turns the lines of a `@startfiles` block (historical absolute paths, indentation, `tree`
 * output) into the `FEntry` tree.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesParser.java:45-195
 */
export class FilesParser {
  private readonly root = FEntry.createRoot();
  private readonly icons = new FilesIcons();
  private readonly stack: Level[] = [];
  private lastCreated: FEntry | null = null;

  /** @see FilesParser.java:70-88 */
  parse(lines: readonly string[]): void {
    const it = lines[Symbol.iterator]();
    for (let next = it.next(); next.done !== true; next = it.next()) {
      const line = normalize(next.value);
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('@startfiles') || trimmed.startsWith('@endfiles')) continue;
      if (trimmed.startsWith("'")) continue;
      if (trimmed.startsWith(NOTE_START)) {
        this.addNote(readNote(it));
        continue;
      }
      if (this.icons.declare(trimmed)) continue;
      if (NOISE.test(trimmed)) continue;
      this.parseEntry(line);
    }
  }

  /** @see FilesParser.java:90-122 */
  private parseEntry(line: string): void {
    const prefix = TreePrefix.parse(line);
    const text = line.substring(prefix.getColumn()).trim();
    // A line made only of tree characters, as "tree" prints between groups
    if (text.length === 0) return;

    const absolute = text.startsWith('/');
    const label = FLabel.parse(absolute ? text.substring(1) : text);
    let name = label.getName();
    if (name.length === 0) return;
    if (prefix.isFolder() && !name.endsWith('/')) name = `${name}/`;

    const column = prefix.getColumn();
    while (this.stack.length > 0 && this.stack[this.stack.length - 1]!.column >= column) this.stack.pop();

    const parent = absolute || this.stack.length === 0 ? this.root : this.stack[this.stack.length - 1]!.entry;

    const entry = parent.addRawEntry(name);
    entry.applyLabel(label);
    this.stack.push({ column, entry });
    this.lastCreated = entry;
  }

  /** @see FilesParser.java:124-132 */
  private addNote(note: readonly string[]): void {
    if (this.lastCreated === null) this.root.addNote(note);
    // A note after a folder line goes right under the folder
    else if (this.lastCreated.isFolder()) this.lastCreated.addNote(note);
    // A file always has a parent (`FEntry.addRawEntry` creates it with `this`).
    else (this.lastCreated.getParent() as FEntry).addNote(note);
  }

  /** @see FilesParser.java:189-191 */
  getRoot(): FEntry {
    return this.root;
  }

  /** @see FilesParser.java:193-195 */
  getIcons(): FilesIcons {
    return this.icons;
  }
}

/** The lines of a note up to its `</note>`; a note never closed takes every remaining line. @see FilesParser.java:134-143 */
function readNote(it: Iterator<string>): string[] {
  const result: string[] = [];
  for (let next = it.next(); next.done !== true; next = it.next()) {
    if (next.value.trim().startsWith(NOTE_END)) return result;
    result.push(next.value);
  }
  return result;
}
