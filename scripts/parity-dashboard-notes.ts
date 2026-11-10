/**
 * `docs/parity-report.md` dashboard: why a matrix row falls short of
 * conformant. A row with a recorded reason gets a symbol in its type cell, and
 * the note follows the table. Pure.
 *
 * A row is marked only while it falls short, so a row that reaches conformant
 * loses its mark and its note at the next regeneration. Every reason below was
 * checked against the cached jar output, the survey's `firstDiff`, the census
 * `--families` tally or `DIVERGENCES.md` on 2026-11-03
 * (`plans/parity-dashboard-repair/measurements/note-audit.md`); a row's
 * sentence says what was measured, and "not yet diagnosed" where nothing more
 * is known. A row that reaches conformant has no entry (gantt, mindmap,
 * ...): an entry for it would be dead. Rows re-audited against the
 * 2026-11-04 numbers after #109's capture:
 * `plans/oracle-gap-capture/measurements/note-audit.md`.
 */

type NoteClass = 'smetana' | 'notBuilt' | 'openDefect' | 'mixed' | 'jarDeclines';

const SYMBOL: Readonly<Record<NoteClass, string>> = {
  smetana: '†',
  notBuilt: '‡',
  openDefect: '§',
  mixed: '¶',
  jarDeclines: '‖',
};

/** Rendering order of the note classes under the table. */
const CLASS_ORDER: readonly NoteClass[] = ['smetana', 'notBuilt', 'openDefect', 'mixed', 'jarDeclines'];

const CLASS_TEXT: Readonly<Record<NoteClass, string>> = {
  smetana:
    '**Laid out by a different Graphviz.** PlantUML lays these diagrams out with Smetana, its Java translation of ' +
    'Graphviz 2.38. We use dot-engine, which follows current Graphviz. Elements, labels, colours and structure match, ' +
    'but edge routing and node spacing can differ, so most fixtures end as structural matches. This is a settled ' +
    'decision, not a to-do: see [Why no Smetana support?](../docs-site/guide/why-no-smetana.md).',
  notBuilt: '**No engine yet.** We do not draw this diagram type yet, so these fixtures get an error page.',
  openDefect: '**Open defects.** An engine exists, and what remains are bugs still to fix. No library forces them.',
  mixed: '**Mixed bucket.** This bucket holds sources the classifier could not assign, so its causes differ.',
  jarDeclines:
    '**Nothing to compare against.** The pinned PlantUML jar answers "Diagram not supported by this release" while we ' +
    'draw the diagram.',
};

interface RowNote {
  readonly noteClass: NoteClass;
  /** Sentence specific to this row; the class text carries the rest. */
  readonly detail?: string;
}

const ROW_NOTES: Readonly<Record<string, RowNote>> = {
  json: { noteClass: 'smetana' },
  yaml: { noteClass: 'smetana' },
  hcl: { noteClass: 'smetana' },
  ditaa: {
    noteClass: 'notBuilt',
    detail: 'Dropped on purpose: its library is LGPL-3.0 and the MIT edition disables it (`DIVERGENCES.md`).',
  },
  ebnf: {
    noteClass: 'openDefect',
    detail:
      'The EBNF engine (#125) draws all 44 conformant: 43 byte-identical, pinned in `svg-ebnf`, and ' +
      '`ladifa-97-keme950`, a jar error page where we also error (#166).',
  },
  network: {
    noteClass: 'notBuilt',
    detail:
      'This bucket is filled by a keyword match and holds no nwdiag diagrams: one description diagram, which conforms, ' +
      'and two in the legacy `(*) -->` activity syntax, drawn by the legacy activity engine (#123) and pinned in ' +
      '`svg-activity-legacy`. The 68 real nwdiag fixtures are counted under `unknown`: the nwdiag engine (#124) draws ' +
      'all 68 conformant (4 are jar error pages where we also error), pinned in `svg-nwdiag`.',
  },
  regex: {
    noteClass: 'openDefect',
    detail:
      'The regex engine (#126) draws all 46 conformant: 44 byte-identical, pinned in `svg-regex`, and ' +
      '`bakuza-41-bulo451` and `tajefa-31-pefi801`, jar error pages where we also error (#167).',
  },
  timing: { noteClass: 'notBuilt' },
  wire: { noteClass: 'notBuilt' },
  activity: {
    noteClass: 'openDefect',
    detail:
      'Not a regression: the 5 rows short of conformant are named. Three are LaTeX under KaTeX and one is a QR ' +
      'code under the MIT edition (DIVERGENCES.md); `rekefe-90` prints `%version()` and waits on #155. The ' +
      'legacy `(*) -->` syntax is drawn by the legacy activity engine (#123), pinned in `svg-activity-legacy`.',
  },
  class: {
    noteClass: 'openDefect',
    detail:
      'Not a regression: all 43 rows short of conformant are fixtures #109 captured on 2026-11-04. The layout ' +
      'matches on most of them (layoutEqual 641 of 664); the first differences are element ids, strokes, font ' +
      'sizes and fills, not yet diagnosed row by row.',
  },
  dot: {
    noteClass: 'openDefect',
    detail: 'The two structural matches are fixtures #109 captured on 2026-11-04; their geometry is not yet diagnosed.',
  },
  sequence: {
    noteClass: 'openDefect',
    detail:
      'Not a regression: all 9 rows short of conformant are fixtures #109 captured on 2026-11-04. One draws our ' +
      'error page where PlantUML draws a diagram (`partition` as a grouping keyword, which we do not parse); the ' +
      'rest differ in a title child count, a dash pattern and path data.',
  },
  c4: {
    noteClass: 'jarDeclines',
    detail:
      'Drawn by the description engine, with two class rows and one ELK row: 10 of 11 conformant since ' +
      'c4-divergence-drive (#114), 9 pinned. The last, `gikaju-64`, is a jar error page where we draw, a signed entry ' +
      'in `oracle/accepted-divergences.json`.',
  },
  component: {
    noteClass: 'openDefect',
    detail:
      'description-divergence-drive (#113, 2026-11-04) took all 51 open rows to conformant, the LaTeX fixtures ' +
      'included: only the image bytes differ, and the comparer exempts them.',
  },
  object: {
    noteClass: 'openDefect',
    detail:
      'object-divergence-drive (#115, 2026-11-05) took all 16 open rows to conformant: 81 of 81, all pinned. Its authored ' +
      'probes match the jar, `ports-decors` since dot-engine 2.12.0 fixed `docs/graphviz-issues/41`.',
  },
  state: {
    noteClass: 'openDefect',
    detail:
      'state-divergence-drive (#112, 2026-11-04) took the 174 open rows to 2, and the border-point anchor fix ' +
      '(graphviz issue 39, reclassified as ours) closed `viroxo-69-fito663`: 298 of 299 conformant. ' +
      '`xetase-70-zaza808` is a `{{ }}` edge label the flat creole seam cannot embed (#144, chained on #136).',
  },
  usecase: {
    noteClass: 'openDefect',
    detail:
      'description-divergence-drive (#113, 2026-11-04) took 23 of the 24 open rows to conformant. `fepuvo-06` cannot ' +
      "be compared because the jar's comment is not well-formed; with comments stripped it has zero diffs.",
  },
  // The `unknown` sentence is generated from the survey (`unknownDetail`, D4
  // of plans/parity-dashboard-repair) and passed to `notesSection`.
  unknown: { noteClass: 'mixed' },
  chronology: { noteClass: 'jarDeclines' },
};

const ERROR_SUFFIX_NOTE =
  'A suffix such as `(3 error)` is not a shortfall. PlantUML draws an error page for those fixtures too, and we draw ' +
  'our own, which counts as conformant.';

/** `<conformant> / <structural> / <diverged>`, with any `(N error)` suffix. */
const SURVEY_COUNTS = /^\d+ \/ (\d+) \/ (\d+)/;

function fallsShort(survey: string): boolean {
  const counts = SURVEY_COUNTS.exec(survey);
  return counts === null || Number(counts[1]) + Number(counts[2]) > 0;
}

/** The row's symbol, or `undefined` when it conforms or has no recorded reason. */
export function noteSymbolOf(type: string, survey: string): string | undefined {
  const note = ROW_NOTES[type];
  return note !== undefined && fallsShort(survey) ? SYMBOL[note.noteClass] : undefined;
}

/** The matrix's type cell: the bucket name, then its symbol if it has one. */
export function markedType(type: string, survey: string): string {
  const symbol = noteSymbolOf(type, survey);
  return symbol === undefined ? type : `${type} ${symbol}`;
}

/** Jar type tag → count over the `unknown` rows short of conformant
 *  (`parity-dashboard-inputs.ts#unknownShortfallTagsOf`). `none` is an
 *  untagged render, `unsupported` the jar's own unsupported-diagram page. */
export type JarTagTally = Readonly<Record<string, number>>;

const UNTAGGED = 'none';
const JAR_DECLINED = 'unsupported';

/** `tag (count)` pairs, count-descending then by name, tags lower-cased. */
function tagList(tally: JarTagTally): string {
  return Object.entries(tally)
    .sort(([tagA, a], [tagB, b]) => b - a || tagA.localeCompare(tagB))
    .map(([tag, count]) => `${tag.toLowerCase()} ${count}`)
    .join(', ');
}

function sum(tally: JarTagTally): number {
  return Object.values(tally).reduce((acc, n) => acc + n, 0);
}

function pick(tally: JarTagTally, keep: (tag: string) => boolean): JarTagTally {
  return Object.fromEntries(Object.entries(tally).filter(([tag]) => keep(tag)));
}

const one = (n: number, singular: string, plural: string): string => `${n} ${n === 1 ? singular : plural}`;

/** Pure (D4): the `unknown` row's sentence from the jar-tag tally. A tag is
 *  "drawn imperfectly" when its lower-cased form is a registered engine; the
 *  rest have no engine, except `none` (untagged) and `unsupported` (declined).
 *  Groups are listed drawn, no engine, untagged, declined; an empty group is
 *  omitted; an empty tally gives no sentence. */
export function unknownDetail(tally: JarTagTally, registeredEngines: readonly string[]): string | undefined {
  const total = sum(tally);
  if (total === 0) return undefined;
  const typed = pick(tally, (tag) => tag !== UNTAGGED && tag !== JAR_DECLINED);
  const drawn = pick(typed, (tag) => registeredEngines.includes(tag.toLowerCase()));
  const noEngine = pick(typed, (tag) => !registeredEngines.includes(tag.toLowerCase()));
  const untagged = tally[UNTAGGED] ?? 0;
  const declined = tally[JAR_DECLINED] ?? 0;
  const groups = [
    sum(drawn) > 0 ? `${one(sum(drawn), 'is a type', 'are types')} we draw imperfectly (${tagList(drawn)})` : undefined,
    sum(noEngine) > 0 ? `${one(sum(noEngine), 'has', 'have')} no engine yet (${tagList(noEngine)})` : undefined,
    untagged > 0 ? `${one(untagged, 'carries', 'carry')} no type tag (creole, math, LaTeX and error pages)` : undefined,
    declined > 0 ? `${one(declined, 'is a page', 'are pages')} PlantUML itself declines` : undefined,
  ].filter((g): g is string => g !== undefined);
  return `Of the ${total} fixtures short of conformant, by PlantUML's own type: ${groups.join('; ')}.`;
}

/** A row's sentence: the generated one when the caller supplies it, else the hand-written one. */
function detailOf(type: string, generated: Readonly<Record<string, string>>): string | undefined {
  return generated[type] ?? ROW_NOTES[type]?.detail;
}

function classBlock(
  noteClass: NoteClass,
  types: readonly string[],
  generated: Readonly<Record<string, string>>,
): string[] {
  const details = types.flatMap((type) => {
    const detail = detailOf(type, generated);
    return detail === undefined ? [] : [`- **${type}:** ${detail}`];
  });
  const plain = types.filter((type) => detailOf(type, generated) === undefined);
  const applies = plain.length > 0 ? ` Applies to ${plain.join(', ')}.` : '';
  const head = `**${SYMBOL[noteClass]}** ${CLASS_TEXT[noteClass]}${applies}`;
  return details.length > 0 ? [head, '', ...details, ''] : [head, ''];
}

/** The notes that follow the matrix table: one block per class in use.
 *  `generated` holds the row sentences built from measurements (today only
 *  `unknown`, D4); every other row keeps its hand-written `ROW_NOTES` detail. */
export function notesSection(
  rows: readonly { readonly type: string; readonly survey: string }[],
  generated: Readonly<Record<string, string>> = {},
): string {
  const marked = rows.filter((r) => noteSymbolOf(r.type, r.survey) !== undefined).map((r) => r.type);
  const blocks = CLASS_ORDER.flatMap((noteClass) => {
    const types = marked.filter((type) => ROW_NOTES[type]?.noteClass === noteClass);
    return types.length > 0 ? classBlock(noteClass, types, generated) : [];
  });
  return ['### Why a row falls short', '', ...blocks, ERROR_SUFFIX_NOTE, ''].join('\n');
}
