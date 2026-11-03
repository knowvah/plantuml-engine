/**
 * `docs/parity-report.md` dashboard: why a matrix row falls short of
 * conformant. A row with a recorded reason gets a symbol in its type cell, and
 * the note follows the table. Pure.
 *
 * A row is marked only while it falls short, so a row that reaches conformant
 * loses its mark and its note at the next regeneration. Every reason below was
 * checked against the cached jar output or `DIVERGENCES.md`; a row's sentence
 * says what was measured, and "not yet diagnosed" where nothing more is known.
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
    detail: 'It also cannot be compared as SVG: PlantUML writes a PNG for ditaa even when asked for SVG.',
  },
  ebnf: { noteClass: 'notBuilt' },
  network: {
    noteClass: 'notBuilt',
    detail:
      'This bucket is filled by a keyword match and holds no nwdiag diagrams: one description diagram, which conforms, ' +
      'and two in the legacy `(*) -->` activity syntax, which we do not parse. Real nwdiag fixtures are counted under ' +
      '`unknown`.',
  },
  regex: { noteClass: 'notBuilt' },
  timing: { noteClass: 'notBuilt' },
  wire: { noteClass: 'notBuilt' },
  activity: {
    noteClass: 'openDefect',
    detail:
      'The one structural match is an older reading: a survey on 2026-11-02 measures all 449 fixtures conformant.',
  },
  board: {
    noteClass: 'openDefect',
    detail:
      'The SVG has not been aligned with PlantUML yet: card fill (`#D3D3D3` against `#C0C0C0`), text placement and ' +
      'canvas size all differ.',
  },
  c4: {
    noteClass: 'openDefect',
    detail: 'Drawn by the description engine. The first difference is usually the corner rounding of a boundary box.',
  },
  chart: {
    noteClass: 'openDefect',
    detail: 'The SVG has not been aligned with PlantUML yet: line styling, text anchoring and canvas size differ.',
  },
  component: {
    noteClass: 'openDefect',
    detail:
      'Mostly stroke, fill and path differences. Four fixtures also contain LaTeX, which we render with KaTeX rather ' +
      'than JLaTeXMath, and that part is permanent.',
  },
  object: {
    noteClass: 'openDefect',
    detail: 'Mostly small fill and text-width differences, not yet diagnosed row by row.',
  },
  packet: {
    noteClass: 'openDefect',
    detail:
      'The canvas can match, but text is anchored and lines are drawn differently: PlantUML positions text with ' +
      '`textLength` and draws `<path>` where we draw `<line>`.',
  },
  state: {
    noteClass: 'openDefect',
    detail:
      'The layout matches on most fixtures. The largest groups differ in element ids, text widths, path data and ' +
      'classes, not yet diagnosed row by row.',
  },
  usecase: {
    noteClass: 'openDefect',
    detail:
      'Mostly fill, text-size and structure differences. One more fixture cannot be compared at all, because its ' +
      'cached PlantUML output is not well-formed XML.',
  },
  unknown: {
    noteClass: 'mixed',
    detail:
      "Of the 260 fixtures short of conformant on 2026-11-02, by PlantUML's own type: 109 are types we draw " +
      'imperfectly, mostly description; 96 have no engine yet, mostly nwdiag (64) and timing (13); 49 carry no type ' +
      'tag (creole, math, LaTeX and error pages); 6 are pages PlantUML itself declines.',
  },
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

function classBlock(noteClass: NoteClass, types: readonly string[]): string[] {
  const details = types.flatMap((type) => {
    const detail = ROW_NOTES[type]?.detail;
    return detail === undefined ? [] : [`- **${type}:** ${detail}`];
  });
  const plain = types.filter((type) => ROW_NOTES[type]?.detail === undefined);
  const applies = plain.length > 0 ? ` Applies to ${plain.join(', ')}.` : '';
  const head = `**${SYMBOL[noteClass]}** ${CLASS_TEXT[noteClass]}${applies}`;
  return details.length > 0 ? [head, '', ...details, ''] : [head, ''];
}

/** The notes that follow the matrix table: one block per class in use. */
export function notesSection(rows: readonly { readonly type: string; readonly survey: string }[]): string {
  const marked = rows.filter((r) => noteSymbolOf(r.type, r.survey) !== undefined).map((r) => r.type);
  const blocks = CLASS_ORDER.flatMap((noteClass) => {
    const types = marked.filter((type) => ROW_NOTES[type]?.noteClass === noteClass);
    return types.length > 0 ? classBlock(noteClass, types) : [];
  });
  return ['### Why a row falls short', '', ...blocks, ERROR_SUFFIX_NOTE, ''].join('\n');
}
