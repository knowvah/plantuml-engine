import type { DiagramAnnotations } from '../../core/annotations/index.js';
import type { SpriteRegistry } from '../../core/sprite-commands.js';
import type { FLabel } from './flabel.js';
import type { FilesDiagram } from './parser.js';

/**
 * `FilesType` -- the three kinds of `FEntry`. As-const object plus a union
 * type, not a TS `enum` (safer across declaration boundaries).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesType.java:37-39
 */
export const FilesType = {
  FOLDER: 'FOLDER',
  DATA: 'DATA',
  NOTE: 'NOTE',
} as const;
export type FilesType = (typeof FilesType)[keyof typeof FilesType];

/** The `/` that separates the path segments of one entry. @see FEntry.java:81 */
const PATH_SEPARATOR = '/';
/** The name `addNote` gives a note entry. @see FEntry.java:121 */
const NOTE_NAME = 'NONE';
/** The prefix of a relative path. @see FEntry.java:77 */
const CURRENT_DIR_PREFIX = './';

/**
 * `FEntry` -- one node of the files tree: the root (an unnamed folder), a
 * folder, a data file or a note, with the annotations of its label.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FEntry.java:50-197
 */
export class FEntry implements Iterable<FEntry> {
  private readonly parent: FEntry | null;
  /** The note's lines; `null` for a folder and a data file. */
  readonly note: readonly string[] | null;
  readonly name: string;
  private kind: FilesType;
  private readonly entries: FEntry[] = [];
  private description: string | null = null;
  private stereotypes: readonly string[] = [];
  private color: string | null = null;
  private icon: string | null = null;

  /** @see FEntry.java:63-65 */
  static createRoot(): FEntry {
    return new FEntry(null, FilesType.FOLDER, '', null);
  }

  /** @see FEntry.java:67-72 */
  private constructor(parent: FEntry | null, type: FilesType, name: string, note: readonly string[] | null) {
    this.parent = parent;
    this.note = note;
    this.name = name;
    this.kind = type;
  }

  /** @see FEntry.java:56 */
  get type(): FilesType {
    return this.kind;
  }

  /**
   * Adds a path relative to this entry: `a/b/c.txt` creates (or reuses) the folders `a` and `b`, then a file
   * `c.txt`. A trailing `/` makes the last element a folder. Answers the entry for the last element.
   * @see FEntry.java:74-100
   */
  addRawEntry(input: string): FEntry {
    let raw = input;
    // A file that gets children is a folder after all
    this.kind = FilesType.FOLDER;
    while (raw.startsWith(CURRENT_DIR_PREFIX)) raw = raw.substring(CURRENT_DIR_PREFIX.length);
    while (raw.startsWith(PATH_SEPARATOR)) raw = raw.substring(PATH_SEPARATOR.length);
    if (raw.length === 0) return this;
    const x = raw.indexOf(PATH_SEPARATOR);
    if (x === -1) {
      const result = new FEntry(this, FilesType.DATA, raw, null);
      this.entries.push(result);
      return result;
    }
    const folder = this.getOrCreateFolder(raw.substring(0, x));
    const remain = raw.substring(x + 1);
    if (remain.length !== 0) return folder.addRawEntry(remain);
    return folder;
  }

  /** @see FEntry.java:102-104 */
  isFolder(): boolean {
    return this.kind === FilesType.FOLDER;
  }

  /** @see FEntry.java:106-108 */
  isNote(): boolean {
    return this.kind === FilesType.NOTE;
  }

  /** @see FEntry.java:110-112 */
  isRoot(): boolean {
    return this.parent === null;
  }

  /** @see FEntry.java:114-117 */
  forceFolder(): void {
    if (this.kind === FilesType.DATA) this.kind = FilesType.FOLDER;
  }

  /** @see FEntry.java:119-122 */
  addNote(note: readonly string[]): void {
    this.entries.push(new FEntry(this, FilesType.NOTE, NOTE_NAME, note));
  }

  /** @see FEntry.java:124-134 */
  private getOrCreateFolder(folderName: string): FEntry {
    for (const child of this.entries) {
      if (child.kind !== FilesType.NOTE && child.getName() === folderName) {
        child.kind = FilesType.FOLDER;
        return child;
      }
    }
    const result = new FEntry(this, FilesType.FOLDER, folderName, null);
    this.entries.push(result);
    return result;
  }

  /** Takes over what `label` says about this entry. @see FEntry.java:136-147 */
  applyLabel(label: FLabel): void {
    if (label.getDescription() !== null) this.description = label.getDescription();
    if (label.getStereotypes().length > 0) this.stereotypes = [...this.stereotypes, ...label.getStereotypes()];
    if (label.getColor() !== null) this.color = label.getColor();
    if (label.getIcon() !== null) this.icon = label.getIcon();
  }

  /** The children in insertion order (`iterator()`, FEntry.java:149-152). */
  get children(): readonly FEntry[] {
    return this.entries;
  }

  [Symbol.iterator](): Iterator<FEntry> {
    return this.entries[Symbol.iterator]();
  }

  /** The last child that is not a note: the one where the vertical connector line stops. @see FEntry.java:158-163 */
  getLastEntryChild(): FEntry | null {
    for (let i = this.entries.length - 1; i >= 0; i--) if (!this.entries[i]!.isNote()) return this.entries[i]!;
    return null;
  }

  /** @see FEntry.java:165-167 */
  getParent(): FEntry | null {
    return this.parent;
  }

  /** @see FEntry.java:169-171 */
  getName(): string {
    return this.name;
  }

  /** @see FEntry.java:177-179 */
  getDescription(): string | null {
    return this.description;
  }

  /** @see FEntry.java:181-183 */
  getStereotypes(): readonly string[] {
    return this.stereotypes;
  }

  /** @see FEntry.java:185-187 */
  getColor(): string | null {
    return this.color;
  }

  /** @see FEntry.java:189-191 */
  getIcon(): string | null {
    return this.icon;
  }
}

/**
 * What `parseFiles` hands the plugin: the tree, the `title`/`legend`/...
 * chrome and `sprite` definitions the common commands filled (read off the
 * AST by `src/index.ts`), and the `FilesDiagram` that draws it.
 */
export interface FilesDiagramAST {
  /** The unnamed root folder; its children are the top-level entries. */
  readonly root: FEntry;
  /** title/caption/legend/header/footer/mainframe chrome (mission G0b). */
  readonly annotations?: DiagramAnnotations;
  /** `sprite $name [WxH/N[z]] { ... }` definitions (mission SI5b/T4). */
  readonly sprites?: SpriteRegistry;
  readonly diagram: FilesDiagram;
}
