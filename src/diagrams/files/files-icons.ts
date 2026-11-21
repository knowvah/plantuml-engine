import { retrieveEmoji } from '../../core/klimt/creole/Emoji.js';
import { isKnownOpenIconicGlyph } from '../../core/openiconic-glyphs.js';
import type { FEntry } from './ast.js';

const DECLARATION = /^\[icon\s+(\S+)\s+(\S+)\s*\]$/;
const SIMPLE_NAME = /^[0-9a-zA-Z][-_0-9a-zA-Z]*$/;

/** @see FilesIcons.java:46 */
export const DEFAULT_FOLDER = '<:1f4c2:>';
/** @see FilesIcons.java:47 */
export const DEFAULT_FILE = '<:1f4c4:>';

const BUILTIN_EXT = new Map<string, string>();
const BUILTIN_NAME = new Map<string, string>();

function builtinExt(emoji: string, ...extensions: string[]): void {
  for (const ext of extensions) BUILTIN_EXT.set(ext, `<:${emoji}:>`);
}

function builtinName(emoji: string, ...names: string[]): void {
  for (const name of names) BUILTIN_NAME.set(name, `<:${emoji}:>`);
}

// @see FilesIcons.java:52-88
builtinExt('coffee', 'java', 'class', 'jsp');
builtinExt('snake', 'py', 'pyc', 'pyw', 'ipynb');
builtinExt('gem', 'rb', 'gemspec');
builtinExt('crab', 'rs');
builtinExt('elephant', 'php');
builtinExt('seedling', 'puml', 'plantuml', 'iuml', 'pu', 'wsd');
builtinExt('memo', 'md', 'markdown', 'txt', 'adoc', 'asciidoc', 'rst', 'tex');
builtinExt('framed_picture', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tif', 'tiff');
builtinExt('closed_book', 'pdf');
builtinExt('bar_chart', 'csv', 'tsv', 'xls', 'xlsx', 'ods');
builtinExt(
  'gear',
  'json',
  'yaml',
  'yml',
  'xml',
  'toml',
  'ini',
  'properties',
  'conf',
  'cfg',
  'config',
  'env',
  'gradle',
  'kts',
);
builtinExt('package', 'zip', 'jar', 'war', 'ear', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'deb', 'rpm', 'whl');
builtinExt('computer', 'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1', 'exe', 'dll', 'so', 'bin');
builtinExt('globe_with_meridians', 'html', 'htm', 'css', 'scss', 'less');
builtinExt(
  'page_with_curl',
  'c',
  'h',
  'cpp',
  'hpp',
  'cc',
  'cs',
  'js',
  'mjs',
  'ts',
  'jsx',
  'tsx',
  'kt',
  'scala',
  'groovy',
  'go',
  'swift',
  'lua',
  'pl',
  'r',
  'vue',
);
builtinExt('card_file_box', 'sql', 'db', 'sqlite');
builtinExt('scroll', 'log');
builtinExt('lock', 'lock');
builtinExt('key', 'pem', 'crt', 'cer', 'key', 'p12', 'jks');
builtinExt('musical_note', 'mp3', 'wav', 'ogg', 'flac', 'm4a');
builtinExt('clapper', 'mp4', 'avi', 'mov', 'mkv', 'webm');

builtinName('whale', 'dockerfile', 'docker-compose.yml', 'docker-compose.yaml', 'compose.yaml');
builtinName('hammer', 'makefile', 'build.xml');
builtinName('scroll', 'license', 'licence', 'copying');
builtinName('memo', 'readme');
builtinName('see_no_evil', '.gitignore', '.dockerignore');

/** `toLowerCase(Locale.ROOT)`. */
function lower(s: string): string {
  return s.toLowerCase();
}

/**
 * Longest extension first: `archive.tar.gz` tries `tar.gz`, then `gz`.
 * @see FilesIcons.java:178-186
 */
function byExtension(name: string, map: ReadonlyMap<string, string>): string | undefined {
  let x = name.indexOf('.', 1);
  while (x !== -1) {
    const result = map.get(name.substring(x + 1));
    if (result !== undefined) return result;
    x = name.indexOf('.', x + 1);
  }
  return undefined;
}

function builtinFileIcon(name: string): string {
  const named = BUILTIN_NAME.get(name) ?? byExtension(name, BUILTIN_EXT);
  return named ?? DEFAULT_FILE;
}

/**
 * Turns the many accepted spellings of an icon into creole: the creole text, empty for `none`, or `null` if this
 * cannot be an icon.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesIcons.java:200-228
 */
export function toCreole(input: string): string | null {
  const spec = input.trim();
  if (spec.length === 0 || spec.toLowerCase() === 'none') return '';
  if (spec.startsWith('<') && spec.endsWith('>')) return spec;
  if (spec.startsWith(':') && spec.endsWith(':') && spec.length > 2) return `<${spec}>`;
  if (spec.startsWith('&') || spec.startsWith('$')) return `<${spec}>`;
  // Mermaid style "pack:name": only the name can mean something here
  return namedIcon(spec.substring(spec.lastIndexOf(':') + 1));
}

/** The emoji or OpenIconic glyph called `spec`, as creole; `null` if there is none. @see FilesIcons.java:219-227 */
function namedIcon(spec: string): string | null {
  if (!SIMPLE_NAME.test(spec)) return null;
  if (retrieveEmoji(spec) !== undefined) return `<:${lower(spec)}:>`;
  if (isKnownOpenIconicGlyph(spec)) return `<&${spec}>`;
  return null;
}

/**
 * `FilesIcons` -- the icon of an entry: its own `icon(...)`, else a user `[icon <pattern> <icon>]` rule, else a
 * built-in one by name or extension.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesIcons.java:42-242
 */
export class FilesIcons {
  private readonly userExt = new Map<string, string>();
  private readonly userFileName = new Map<string, string>();
  private readonly userFolderName = new Map<string, string>();
  private userAnyFile: string | null = null;
  private userAnyFolder: string | null = null;

  /** Reads an `[icon <pattern> <icon>]` declaration; `false` if the line is not one. @see FilesIcons.java:108-135 */
  declare(line: string): boolean {
    const m = DECLARATION.exec(line.trim());
    if (m === null) return false;
    const pattern = m[1]!;
    const icon = toCreole(m[2]!);
    if (icon === null) return false;

    if (pattern === '*') this.userAnyFile = icon;
    else if (pattern === '*/') this.userAnyFolder = icon;
    else if (pattern.startsWith('*.')) this.userExt.set(lower(pattern.substring(2)), icon);
    else if (pattern.startsWith('.') && pattern.length > 1 && !pattern.endsWith('/')) {
      // ".env" is both an extension and the name of a dot file
      this.userExt.set(lower(pattern.substring(1)), icon);
      this.userFileName.set(lower(pattern), icon);
    } else if (pattern.endsWith('/')) this.userFolderName.set(lower(pattern.substring(0, pattern.length - 1)), icon);
    else this.userFileName.set(lower(pattern), icon);
    return true;
  }

  /** The creole text of the icon, empty for no icon at all. @see FilesIcons.java:137-170 */
  getIcon(entry: FEntry): string {
    const own = entry.getIcon();
    if (own !== null) {
      const explicit = toCreole(own);
      if (explicit !== null) return explicit;
    }
    const name = lower(entry.getName());
    return entry.isFolder() ? this.folderIcon(name) : this.fileIcon(name);
  }

  private folderIcon(name: string): string {
    return this.userFolderName.get(name) ?? this.userAnyFolder ?? DEFAULT_FOLDER;
  }

  private fileIcon(name: string): string {
    return this.userFileIcon(name) ?? builtinFileIcon(name);
  }

  private userFileIcon(name: string): string | null {
    const named = this.userFileName.get(name) ?? byExtension(name, this.userExt);
    return named ?? this.userAnyFile;
  }
}
