/**
 * The PlantUML vocabulary: diagram types, keywords and preprocessor
 * directives, as upstream's syntax tooling and `help types` /
 * `help keywords` list them. A full transcription of the constructor's
 * `add` sequence, in order (decisions.md D9), including `preproc`, which no
 * ported command reads.
 *
 * `TreeSet<String>` iterates in `String#compareTo` order (UTF-16 code
 * units), which is what `Array.prototype.sort()` with no comparator does:
 * the getters return sets built in that order.
 *
 * Not ported: `getObfuscate`, `print` and `main`. Their only callers are the
 * CLI and the pico web server (`Run.java:552`, `OptionPrint.java:184`,
 * `PicoWebServer.java:229`), which a browser-safe library has no counterpart
 * for, and `getObfuscate` needs `utils/Obfuscate`, which nothing else here
 * uses.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/syntax/LanguageDescriptor.java
 */
/** Which set an `add` targets; `pair` is `addDirectivePair`. */
type AddTarget = 'type' | 'keyword' | 'preproc' | 'pair';

/**
 * The constructor body, one entry per statement, in source order: `pair` is
 * `addDirectivePair("x")`, the others `x.add("y")`. Held as data so the
 * transcription stays one-for-one with the Java, duplicates included.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/syntax/LanguageDescriptor.java:54-313
 */
const CONSTRUCTOR_ADDS: readonly (readonly [AddTarget, string])[] = [
  ['pair', 'board'],
  ['pair', 'bpm'],
  ['pair', 'chart'],
  ['pair', 'chen'],
  ['pair', 'chronology'],
  ['pair', 'creole'],
  ['pair', 'def'],
  ['pair', 'ditaa'],
  ['pair', 'dot'],
  ['pair', 'ebnf'],
  ['pair', 'files'],
  ['pair', 'flow'],
  ['pair', 'gantt'],
  ['pair', 'git'],
  ['pair', 'hcl'],
  ['pair', 'jcckit'],
  ['pair', 'json'],
  ['pair', 'latex'],
  ['pair', 'math'],
  ['pair', 'mindmap'],
  ['pair', 'nwdiag'],
  ['pair', 'project'],
  ['pair', 'regex'],
  ['pair', 'salt'],
  ['pair', 'sprites'],
  ['pair', 'uml'],
  ['pair', 'wbs'],
  ['pair', 'wire'],
  ['pair', 'yaml'],
  ['pair', 'packetdiag'],
  ['type', 'abstract'],
  ['type', 'action'],
  ['type', 'actor'],
  ['type', 'agent'],
  ['type', 'analog'],
  ['type', 'annotation'],
  ['type', 'archimate'],
  ['type', 'artifact'],
  ['type', 'binary'],
  ['type', 'boundary'],
  ['type', 'card'],
  ['type', 'class'],
  ['type', 'clock'],
  ['type', 'cloud'],
  ['type', 'collections'],
  ['type', 'component'],
  ['type', 'concise'],
  ['type', 'control'],
  ['type', 'database'],
  ['type', 'dataclass'],
  ['type', 'diamond'],
  ['type', 'entity'],
  ['type', 'enum'],
  ['type', 'exception'],
  ['type', 'file'],
  ['type', 'folder'],
  ['type', 'frame'],
  ['type', 'hexagon'],
  ['type', 'interface'],
  ['type', 'json'],
  ['type', 'label'],
  ['type', 'map'],
  ['type', 'metaclass'],
  ['type', 'network'],
  ['type', 'node'],
  ['type', 'nwdiag'],
  ['type', 'object'],
  ['type', 'package'],
  ['type', 'participant'],
  ['type', 'person'],
  ['type', 'process'],
  ['type', 'protocol'],
  ['type', 'queue'],
  ['type', 'record'],
  ['type', 'rectangle'],
  ['type', 'relationship'],
  ['type', 'robust'],
  ['type', 'stack'],
  ['type', 'state'],
  ['type', 'storage'],
  ['type', 'struct'],
  ['type', 'usecase'],
  ['type', 'packetdiag'],
  ['keyword', 'across'],
  ['keyword', 'activate'],
  ['keyword', 'address'],
  ['keyword', 'area'],
  ['keyword', 'again'],
  ['keyword', 'allow_mixing'],
  ['keyword', 'allowmixing'],
  ['keyword', 'also'],
  ['keyword', 'alt'],
  ['keyword', 'annotation'],
  ['keyword', 'as'],
  ['keyword', 'at'],
  ['keyword', 'attribute'],
  ['keyword', 'attributes'],
  ['keyword', 'autonumber'],
  ['keyword', 'backward'],
  ['keyword', 'bar'],
  ['keyword', 'bold'],
  ['keyword', 'bottom'],
  ['keyword', 'box'],
  ['keyword', 'break'],
  ['keyword', 'case'],
  ['keyword', 'caption'],
  ['keyword', 'center'],
  ['keyword', 'circle'],
  ['keyword', 'circled'],
  ['keyword', 'circles'],
  ['keyword', 'color'],
  ['keyword', 'create'],
  ['keyword', 'critical'],
  ['keyword', 'dashed'],
  ['keyword', 'deactivate'],
  ['keyword', 'description'],
  ['keyword', 'destroy'],
  ['keyword', 'detach'],
  ['keyword', 'dotted'],
  ['keyword', 'down'],
  ['keyword', 'else'],
  ['keyword', 'else'],
  ['keyword', 'elseif'],
  ['keyword', 'empty'],
  ['keyword', 'end'],
  ['keyword', 'endcaption'],
  ['keyword', 'endfooter'],
  ['keyword', 'endfork'],
  ['keyword', 'endheader'],
  ['keyword', 'endif'],
  ['keyword', 'endlegend'],
  ['keyword', 'endmerge'],
  ['keyword', 'endswitch'],
  ['keyword', 'endtitle'],
  ['keyword', 'endwhile'],
  ['keyword', 'false'],
  ['keyword', 'field'],
  ['keyword', 'fields'],
  ['keyword', 'floating note'],
  ['keyword', 'footbox'],
  ['keyword', 'footer'],
  ['keyword', 'fork'],
  ['keyword', 'goto'],
  ['keyword', 'grid'],
  ['keyword', 'group'],
  ['keyword', 'h-axis'],
  ['keyword', 'header'],
  ['keyword', 'hide'],
  ['keyword', 'highlight'],
  ['keyword', 'hnote'],
  ['keyword', 'if'],
  ['keyword', 'is'],
  ['keyword', 'italic'],
  ['keyword', 'kill'],
  ['keyword', 'label'],
  ['keyword', 'left'],
  ['keyword', 'left to right direction'],
  ['keyword', 'legend'],
  ['keyword', 'line'],
  ['keyword', 'link'],
  ['keyword', 'loop'],
  ['keyword', 'mainframe'],
  ['keyword', 'member'],
  ['keyword', 'members'],
  ['keyword', 'merge'],
  ['keyword', 'method'],
  ['keyword', 'methods'],
  ['keyword', 'namespace'],
  ['keyword', 'newpage'],
  ['keyword', 'normal'],
  ['keyword', 'not'],
  ['keyword', 'note'],
  ['keyword', 'null'],
  ['keyword', 'of'],
  ['keyword', 'on'],
  ['keyword', 'opt'],
  ['keyword', 'order'],
  ['keyword', 'orientation'],
  ['keyword', 'over'],
  ['keyword', 'package'],
  ['keyword', 'page'],
  ['keyword', 'par'],
  ['keyword', 'partition'],
  ['keyword', 'plain'],
  ['keyword', 'private'],
  ['keyword', 'protected'],
  ['keyword', 'public'],
  ['keyword', 'ref'],
  ['keyword', 'repeat'],
  ['keyword', 'repeatwhile'],
  ['keyword', 'return'],
  ['keyword', 'right'],
  ['keyword', 'rnote'],
  ['keyword', 'rotate'],
  ['keyword', 'scatter'],
  ['keyword', 'shape'],
  ['keyword', 'show'],
  ['keyword', 'skin'],
  ['keyword', 'skinparam'],
  ['keyword', 'spacing'],
  ['keyword', 'split'],
  ['keyword', 'sprite'],
  ['keyword', 'stackMode'],
  ['keyword', 'start'],
  ['keyword', 'stereotype'],
  ['keyword', 'stereotypes'],
  ['keyword', 'stop'],
  ['keyword', 'style'],
  ['keyword', 'switch'],
  ['keyword', 'then'],
  ['keyword', 'ticks'],
  ['keyword', 'title'],
  ['keyword', 'together'],
  ['keyword', 'top'],
  ['keyword', 'top to bottom direction'],
  ['keyword', 'true'],
  ['keyword', 'up'],
  ['keyword', 'v-axis'],
  ['keyword', 'v2-axis'],
  ['keyword', 'while'],
  ['preproc', '!assert'],
  ['preproc', '!define'],
  ['preproc', '!definelong'],
  ['preproc', '!dump_memory'],
  ['preproc', '!else'],
  ['preproc', '!end'],
  ['preproc', '!enddefinelong'],
  ['preproc', '!endfor'],
  ['preproc', '!endfunction'],
  ['preproc', '!endif'],
  ['preproc', '!endprocedure'],
  ['preproc', '!endsub'],
  ['preproc', '!endwhile'],
  ['preproc', '!exit'],
  ['preproc', '!final'],
  ['preproc', '!foreach'],
  ['preproc', '!function'],
  ['preproc', '!if'],
  ['preproc', '!ifdef'],
  ['preproc', '!ifndef'],
  ['preproc', '!import'],
  ['preproc', '!include'],
  ['preproc', '!includedef'],
  ['preproc', '!includesub'],
  ['preproc', '!local'],
  ['preproc', '!log'],
  ['preproc', '!option'],
  ['preproc', '!pragma'],
  ['preproc', '!procedure'],
  ['preproc', '!return'],
  ['preproc', '!startsub'],
  ['preproc', '!theme'],
  ['preproc', '!undef'],
  ['preproc', '!unquoted'],
  ['preproc', '!while'],
];

export class LanguageDescriptor {
  private readonly type = new Set<string>();
  private readonly keyword = new Set<string>();
  private readonly preproc = new Set<string>();

  /**
   * Replays {@link CONSTRUCTOR_ADDS} in order.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/syntax/LanguageDescriptor.java:54-313
   */
  constructor() {
    for (const [target, name] of CONSTRUCTOR_ADDS) {
      if (target === 'pair') this.addDirectivePair(name);
      else this[target].add(name);
    }
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/syntax/LanguageDescriptor.java:316-319 */
  private addDirectivePair(type: string): void {
    this.keyword.add(`@start${type}`);
    this.keyword.add(`@end${type}`);
  }

  /** `Collections.unmodifiableSet(type)`, in `TreeSet` order. @see LanguageDescriptor.java:360-362 */
  getType(): ReadonlySet<string> {
    return sortedView(this.type);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/syntax/LanguageDescriptor.java:364-366 */
  getKeyword(): ReadonlySet<string> {
    return sortedView(this.keyword);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/syntax/LanguageDescriptor.java:368-370 */
  getPreproc(): ReadonlySet<string> {
    return sortedView(this.preproc);
  }
}

/** A `TreeSet<String>` view: `String#compareTo` is UTF-16 code-unit order, the default `sort()`. */
function sortedView(set: ReadonlySet<string>): ReadonlySet<string> {
  return new Set([...set].sort());
}
