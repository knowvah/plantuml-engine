/**
 * The compiled form the jar's stdlib holds a sprite in.
 *
 * The jar does not read `.puml` stdlib source: its `stdlib/<name>/puml.spm`
 * channel was compiled from that source at build time, with each sprite's pixel
 * or SVG body moved to another channel and a one-line reference left behind.
 * `Stdlib#readSprite` (`Stdlib.java:366-385`) and `readSvgSprite` read those
 * channels back; `CommandSpriteStdlib` and `CommandSpriteStdlibSvg` parse the
 * reference. So `BlockUml#data` (`BlockUml.java:150-155`), which
 * `UmlSource#seed` hashes (`UmlSource.java:222-233`), holds one line per sprite.
 *
 * `assets/stdlib` is the source, byte-verbatim. This port keeps parsing the
 * block (`PreprocessorResult.lines`) and folds it for `dataLines` only:
 * c4-divergence-drive D2 option D.
 *
 * The compiler itself is not in the upstream tree (`Stdlib.java:236` holds only
 * the commented-out reverse), so the rule is read off the jar's output: 4,500
 * sprite lines of `-preproc` over the 45 probes of
 * `plans/c4-divergence-drive/measurements/stdlib-probes.mjs`, checked against
 * every stdlib file.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/preproc/Stdlib.java#readSprite
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/UmlSource.java#seed
 */

import type { LineLocation } from './LineLocation.js';
import { splitStdlibPath } from './stdlib-path.js';
import type { StringLocated } from './StringLocated.js';

/** How a raw stdlib line takes part in a compiled sprite. */
export type StdlibSpriteLineShape = 'bitmap' | 'svg' | 'continuation';

/** `sprite <$>name [WxH/16] {` or `[WxH/16z] {`: a pixel block. A one-line `[WxH/16z] Ow0V...` is not one. */
const RE_BITMAP_HEAD = /^sprite\s+\S+\s+\[\d+x\d+\/16z?\]\s*\{\s*$/u;
/** `sprite <$>name <svg ...`: an SVG block, possibly on the one line. */
const RE_SVG_HEAD = /^sprite\s+\S+\s+<svg/u;
const SVG_CLOSE = '</svg>';
const BITMAP_CLOSE = '}';
/** The name token of an emitted sprite line. */
const RE_EMITTED_NAME = /^sprite\s+(\$?)(\S+)/u;

/**
 * The `link:` aliases of the stdlib the jar ships (`Stdlib#retrieve`,
 * `Stdlib.java:166-179`): a compiled line names the folder holding the files,
 * so `<material/x>` compiles to `#material2.1.19#`. Source: each folder's
 * README front matter, as `assets/stdlib.manifest.json` captured it; a jar fact,
 * like `JAR_STDLIB_FOLDERS`, so it does not depend on a host's store.
 */
export const JAR_STDLIB_LINKS: Readonly<Record<string, string>> = {
  awslib: 'awslib14',
  bootstrap: 'bootstrap1.13.1',
  material: 'material2.1.19',
  material2: 'material2.1.19',
  material7: 'material7.4.47',
};

/**
 * The compile rule over raw stdlib lines: each line's part in a sprite block,
 * or `undefined` for a line that stays verbatim. A line a function builds
 * (`awslib20`'s `!$header =`) has no raw `sprite` head, so it stays.
 */
export function stdlibSpriteLineShapes(rawLines: readonly string[]): (StdlibSpriteLineShape | undefined)[] {
  const shapes: (StdlibSpriteLineShape | undefined)[] = [];
  let open: StdlibSpriteLineShape | undefined;
  for (const raw of rawLines) {
    if (open !== undefined) {
      shapes.push('continuation');
      if (closes(open, raw)) open = undefined;
      continue;
    }
    const head = headShape(raw);
    shapes.push(head);
    if (head !== undefined && !closes(head, raw)) open = head;
  }
  return shapes;
}

function headShape(raw: string): StdlibSpriteLineShape | undefined {
  if (RE_BITMAP_HEAD.test(raw)) return 'bitmap';
  return RE_SVG_HEAD.test(raw) ? 'svg' : undefined;
}

function closes(shape: StdlibSpriteLineShape, raw: string): boolean {
  return shape === 'svg' ? raw.includes(SVG_CLOSE) : raw.trim() === BITMAP_CLOSE;
}

/**
 * One compiled line. The name is read off the EMITTED line, because a stdlib
 * procedure substitutes it: `sprite $b##$name##Icon <svg` reaches the jar as
 * `sprite $bActivityIcon :edgy:edgy2:bActivityIcon`.
 */
export function compileStdlibSpriteLine(
  emitted: string,
  shape: Exclude<StdlibSpriteLineShape, 'continuation'>,
  lib: string,
  path: string,
): string {
  const match = RE_EMITTED_NAME.exec(emitted);
  if (match === null) return emitted;
  const [, dollar, name] = match;
  const sep = shape === 'bitmap' ? '#' : ':';
  return `sprite ${dollar}${name} ${sep}${lib}${sep}${path}:${name}`;
}

interface SpriteMark {
  readonly shape: StdlibSpriteLineShape;
  readonly lib: string;
  readonly path: string;
}

/**
 * Marks by line location. `TContextSubstitution.ts:86` and `TContext#addPlain`
 * keep a line's location through substitution, including a procedure body's, so
 * the mark survives to the result list. Each `LineLocationImpl#oneLineRead` is a
 * new object, so a mark can only ever be read for the line it was set on, and
 * interpreters running one after another cannot see each other's.
 */
const SPRITE_MARKS = new WeakMap<LineLocation, SpriteMark>();

/**
 * Called at every stdlib read. `fullname` is the de-bracketed request as
 * `Stdlib#getPumlResource` takes it.
 */
export function markStdlibSprites(lines: readonly StringLocated[], fullname: string): void {
  const split = splitStdlibPath(fullname);
  if (split === undefined) return;
  const lib = JAR_STDLIB_LINKS[split.bundle] ?? split.bundle;
  const shapes = stdlibSpriteLineShapes(lines.map((line) => line.getString()));
  lines.forEach((line, i) => {
    const shape = shapes[i];
    const location = line.getLocation();
    if (shape !== undefined && location !== undefined) SPRITE_MARKS.set(location, { shape, lib, path: split.key });
  });
}

/**
 * The TIM result list as `BlockUml#data` holds it: a marked head compiled, its
 * marked continuations gone.
 */
export function foldStdlibSprites(lines: readonly StringLocated[]): string[] {
  const data: string[] = [];
  for (const line of lines) {
    const location = line.getLocation();
    const mark = location === undefined ? undefined : SPRITE_MARKS.get(location);
    if (mark === undefined) data.push(line.getString());
    else if (mark.shape !== 'continuation')
      data.push(compileStdlibSpriteLine(line.getString(), mark.shape, mark.lib, mark.path));
  }
  return data;
}
