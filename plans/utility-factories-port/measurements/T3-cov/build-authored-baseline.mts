/**
 * ufp T3-cov: (re)generate oracle/goldens/svg-utility/authored-baseline.json from a
 * fresh measurement of every tests/fixtures/utility/*.puml (measureAuthoredUtility,
 * the ratchet's own path). Topics and mechanisms live in the tables below; a row
 * whose measured score is nonzero and has no reason here makes the tool fail.
 *
 *   npx jiti plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts <commit> [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AUTHORED_UTILITY_ROOT,
  listAuthoredUtilitySlugs,
  measureAuthoredUtility,
  readAuthoredUtilityFixture,
} from '../../../../tests/oracle/svg-conformance/render-fixture-utility.js';

const [commit, flag] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: build-authored-baseline.mts <commit> [--write]');
const OUT = join(AUTHORED_UTILITY_ROOT, '../../../oracle/goldens/svg-utility/authored-baseline.json');

const LABEL =
  'our own version string, kept by ruling (src/core/error/PSystemError.ts:151 fullDescription() vs ' +
  'PSystemError.java:151 Version.fullDescription(); 2 diffs) + the source label "[From string" vs the ' +
  'jar\'s "[From <file>.puml" (PSystemError.java:239 lineLocation.getDescription(): oracle-render.sh ' +
  'hands the jar a file, renderSync reads a string, src/core/tim/ReadLineReader.ts:37; 3 diffs). ' +
  'Controlled experiment (measurements/T3-cov/experiment-error-step1-version.json, -step2-label.json): ' +
  'the jar\'s version string -> 3, plus the file name as the label -> 0 (cov-strasse)';
const ERR5 = `error-page: jar errors and we error, same message, same line (2026-10-10 rule: conformant). Residual 5 = ${LABEL}.`;
const SEQ =
  ' +2 diffs "(Assumed diagram type: class)" vs the jar\'s "sequence": src/diagrams/sequence/parser.ts:266 ' +
  'refuses with line = consumed = the index into source.lines (no @startuml), where the class/description/' +
  'state engines count from @startuml (the DiagramRefusal contract, src/core/error/error-diagrams.ts:64), ' +
  'so our sequence refusal scores 10 below class; the jar\'s trace holds @startuml and the failing line ' +
  '(PSystemCommandFactory.java:113, :171-174), SequenceDiagramFactory ties class and wins first ' +
  '(PSystemErrorUtils.java:140-147). Every single-line utility factory refuses a 4-line source the jar\'s ' +
  'way (PSystemSingleLineFactory.java:75-76 return null; NOT_SINGLE_LINE score -Infinity, ' +
  'src/core/command/PSystemSingleLineFactory.ts:62, :167). Controlled experiment ' +
  '(experiment-error-step3b-seq-line-and-consumed.json): parser.ts:266 at origIndex + 1 for both -> 3 ' +
  '(label only) on all 15 refuse rows. Pre-existing, outside the utility packages (ufp-T2a note).';
const ERR7 = `${ERR5}${SEQ}`;

interface RowSpec {
  readonly topic: string;
  readonly reason?: string;
  readonly parityGap?: string;
}

const refuse = (literal: string, factory: string): RowSpec => ({
  topic: `refusal parity: \`${literal}\` twice (4-line source) -- ${factory} returns null (PSystemSingleLineFactory.java:75-76) and the jar falls through to its Syntax Error? page`,
  reason: ERR7,
});

const SPECS: Record<string, RowSpec> = {
  apple: { topic: 'T1h probe: `apple //e` (PSystemAppleTwoFactory.java)' },
  'apple-steve-wozniak': { topic: 'T1h probe: `STEVE wozniak` (equalsIgnoreCase arm)' },
  donors: { topic: 'T1g probe: `donors` (PSystemDonorsFactory)' },
  rip: { topic: 'T1h probe: `jean canouet` (PSystemRIPFactory)' },
  skinparameters: { topic: 'T1g probe: `skinparameters` (PSystemSkinparameterListFactory)' },
  'cov-license': {
    topic: '`license` (PSystemLicenseFactory `(?i)^li[sc][ea]n[sc]e\\s*$`)',
    reason:
      'D13: the MIT edition (License.java:63-68 name, :170-172/:240-264 addMit; MIT <qrcode:> = ' +
      'FlashCodeUtilsNone, blank 10x10 at x3, AtomImg.java:90-103) vs the GPL oracle (GPL paragraph ' +
      ':155-168, zxing 33-module QR at x3 = 99x99). Controlled experiment (experiment-license-gpl.json): ' +
      'GPL name + paragraph restored in src/diagrams/version/License.ts and the blank forced to 33x33 ' +
      '(src/core/klimt/creole/atom/AtomImg.ts:35) -> 0 diffs on all three spellings. Oracle: one file per ' +
      'jar run -- FlashCodeUtilsZxing.java:60 lock.tryLock() fails under concurrent renders and :76 returns ' +
      'null, so a multi-file run draws 773/834/842 px at random; single-file runs 842 in 9/9.',
  },
  'cov-licence': { topic: '`licence` (the c/s spelling arm)' },
  'cov-license-upper': { topic: '`LICENSE` ((?i) case arm)' },
  'cov-version': {
    topic: '`version` (PSystemVersion#createShowVersion)',
    reason:
      'D14 (+D13 License row): the port prints its own page (src/diagrams/version/PSystemVersion.ts, ' +
      'PSystemVersion.java:172-202) -- plantuml-ts / 0.2.0 / unknown for PlantUML / $version$ / ' +
      '$git.commit.id$, MIT for GPL, "@knowvah/dot-engine library is used!" (GraphvizUtils.java:94 arm) ' +
      'for the oracle host\'s "dot - graphviz version 16.1.0 (20260904.0139)", and no JVM/env block ' +
      '(OptionPrint.java:62-63/:85 omit it under TeaVM too): 8 text rows vs the jar\'s 15. No cheap ' +
      'experiment: the jar rows are the oracle host\'s state, which D14 forbids printing. Plus the ' +
      'port-author credit line appended last (user ruling 2026-10-14, DIVERGENCES.md).',
  },
  'cov-about': {
    topic: '`about` (PSystemVersion#createShowAuthors)',
    reason:
      'D13 + the kept label (journal row 24a; memory keep-own-version-string): "plantuml-ts version 0.2.0" ' +
      'vs "PlantUML version $version$" (src/diagrams/version/PSystemVersion.ts:114) and "(MIT source ' +
      'distribution)" vs "(GPL source distribution)" (:115, License.java:63-68). Controlled experiment: both ' +
      'set to the jar\'s -> 0 (experiment-about-gpl.json); label alone -> 2 (experiment-about-label-only' +
      '.json): 6 diffs are the label and the width it drives, 2 the edition. Plus the port-author ' +
      'credit line appended after the jar\'s closing blank (user ruling 2026-10-14, DIVERGENCES.md ' +
      '"`about`, `authors` and `version` credit the TypeScript port"): without it the score is 8; with ' +
      'it compareSvg re-aligns the page on the changed element count, so one added line costs the rest.',
  },
  'cov-authors': { topic: '`authors` (the authors? arm)' },
  'cov-stdlib-upper-trailing': { topic: '`STDLIB  ` ((?i) + trailing \\s* of `^stdlib\\s*$`)' },
  'cov-openiconic-account-login': { topic: '`openiconic account-login` (no transform)' },
  'cov-openiconic-action-undo': { topic: '`openiconic action-undo` (transform="translate(0 1)", two args)' },
  'cov-openiconic-euro': {
    topic: '`openiconic euro` (transform="translate(-1)": OpenIconic.java:67 `(\\d+)` misses the sign -> UTranslate.none())',
  },
  'cov-emoji-no-block': { topic: '`emoji` with no block (PSystemListEmojiFactory default code "26")' },
  'cov-emoji-unknown-block': { topic: '`emoji zz` (unknown block)' },
  'cov-steve-jobs': { topic: '`Steve Jobs` (PSystemAppleTwoFactory arm)' },
  'cov-jesuischarlie': { topic: '`jesuischarlie` (PSystemCharlieFactory second arm)' },
  'cov-charlie-dotless-i': { topic: 'T1h probe: `charlıe` (dotless i; Java char-wise equalsIgnoreCase)' },
  'cov-apple-kelvin-sign': { topic: 'T1h probe: `Steve Wozniak` with U+212A KELVIN SIGN (equalsIgnoreCase)' },
  'cov-egg-synthetic': { topic: 'T1h probe: PSystemEggFactory positive path via a synthetic non-secret line' },
  'cov-strasse': { topic: 'T1h probe: `straße` (no factory accepts it)', reason: ERR5 },
  'cov-charlie-trailing-spaces': { topic: 'T1h probe: `charlie  ` (equalsIgnoreCase on the raw line)', reason: ERR5 },
  'cov-apple-trailing-space': { topic: 'T1h probe: `apple //e ` (raw line)', reason: ERR5 },
  'cov-rip-trailing-space': { topic: 'T1h probe: `jean canouet ` (raw line)', reason: ERR5 },
  'cov-charlie-leading-tab': {
    topic: 'T1h probe: `\\tcharlie` (raw line)',
    reason:
      `${ERR5} +1 diff: the listing's text x 5 vs 35.8 -- TileText#drawU advances a \\t to the next tab ` +
      'stop (8 spaces\' width, TileText.java:82-84, :94-104); src/core/error/error-page-exact.ts:178-198 ' +
      'draws each listing line as one run with leading-space placement only.',
  },
  'cov-dedication-boundaries': { topic: 'DedicationSimple `Boundaries allow discipline to create true strength`' },
  'cov-dedication-nothing-punctuated': {
    topic: 'DedicationSimple `NOTHING of value -- is ever easy!` (same() strips [^\\p{L}0-9]+, equalsIgnoreCase)',
  },
  'cov-dedication-linux-china': {
    topic: '`linux_china` -- a DedicationSimple sentence the length gate refuses (Dedications.java:92 `> 25`)',
    reason: `${ERR5} The jar errors because the line is 11 chars (src/diagrams/dedication/Dedications.ts:22 mirrors the gate).`,
  },
  'cov-dedication-ben-and-jen': {
    topic: '`Ben and Jen 2020` -- refused by the same `> 25` gate (16 chars)',
    reason: `${ERR5} The jar errors because the line is 16 chars (Dedications.java:92; Dedications.ts:22).`,
  },
  'cov-noise-before-literal': {
    topic: 'removeInitialNoise: blank + `skinparam ` + `skinparamlocked ` + `!pragma ` lines before the literal (UmlSource.java:79-106, isNoise :95-106)',
  },
  'cov-noise-not-noise': {
    topic: '`Skinparam ...` (capital S is not noise, UmlSource.java:99-100 startsWith("skinparam ")) -> 4 lines, single-line factories refuse',
    reason:
      `${ERR5} +2 diffs "class" vs "sequence", the same sequence-index mechanism as the refuse rows, but ` +
      'origIndex + 1 alone leaves 5 (experiment-error-step3b): the skin line is cut from source.lines ' +
      '(probe: body ["openiconic lightbulb"]) so sequence reports line 0 where class reports 2.',
  },
  'cov-refuse-colors': refuse('colors', 'PSystemColorsFactory'),
  'cov-refuse-license': refuse('license', 'PSystemLicenseFactory'),
  'cov-refuse-version': refuse('version', 'PSystemVersionFactory'),
  'cov-refuse-about': refuse('about', 'PSystemVersionFactory'),
  'cov-refuse-stdlib': refuse('stdlib', 'PSystemVersionFactory'),
  'cov-refuse-donors': refuse('donors', 'PSystemDonorsFactory'),
  'cov-refuse-skinparameters': refuse('skinparameters', 'PSystemSkinparameterListFactory'),
  'cov-refuse-emoji': refuse('emoji', 'PSystemListEmojiFactory'),
  'cov-refuse-openiconic': refuse('openiconic lightbulb', 'PSystemOpenIconicFactory'),
  'cov-refuse-listopeniconic': refuse('listopeniconic', 'PSystemListOpenIconicFactory'),
  'cov-refuse-egg': refuse('<synthetic egg line>', 'PSystemEggFactory'),
  'cov-refuse-apple': refuse('apple //e', 'PSystemAppleTwoFactory'),
  'cov-refuse-rip': refuse('jean canouet', 'PSystemRIPFactory'),
  'cov-refuse-charlie': refuse('charlie', 'PSystemCharlieFactory'),
  'cov-refuse-dedication': refuse('linux_china', 'PSystemDedicationFactory'),
  'cov-refuse-listsprite': {
    topic:
      'refusal parity: `listsprite` twice -- PSystemListArchimateSpritesFactory returns null and the jar falls through to ListSpriteDiagramFactory',
    reason:
      'jar draws, we error (a defect; the 2026-10-10 rule does not cover it): ListSpriteDiagramFactory ' +
      '(PSystemBuilder.java:170) accepts `listsprites?` and ignores it (CommandListSprite.java:58 regex, ' +
      ':69-70 executeArg ok()), drawing an empty 21x21 page; the port has no ListSpriteDiagramFactory (no match in src/), ' +
      'so every candidate refuses. A new plugin + src/index.ts registration, outside T3-cov\'s write-set. ' +
      '5 diffs / weighted 192 (g childCount 27 vs 0 = 188).',
    parityGap: 'ListSpriteDiagramFactory (PSystemBuilder.java:170) is unported',
  },
  'cov-testdot': {
    topic: '`testdot` (PSystemVersionFactory `(?i)^testdot\\s*$`, PSystemVersion#createTestDot)',
    reason:
      '#182 ruling 1, inspired by, not conformant (rulings 2-4, 2026-11-13): line 1 is our ' +
      'fullDescription() "plantuml-engine version 0.2.0 / unknown [Unknown compile time]" vs the jar\'s ' +
      '"PlantUML version $version$ / $git.commit.id$" (src/diagrams/version/PSystemVersion.ts:286 vs ' +
      'PSystemVersion.java:236, the 2026-10-08 own-version ruling); line 2 <b>@knowvah/dot-engine</b> ' +
      '""2.12.3"" vs <b>GraphViz</b> ""dot - graphviz version 16.1.1 ..."" (PSystemVersion.ts:206 ' +
      'addDotVersionStatus vs GraphvizUtils.java:126, ruling 2, DOT_ENGINE_VERSION); the jar\'s line 3 ' +
      '"Installation seems OK. File generation OK" (GraphvizUtils.java:137-141) is dropped by ruling 4, ' +
      'so the page is one line shorter (47 -> 35 px) and the runs after line 1 re-align: 23 diffs.',
  },
  'cov-testdot-upper-trailing': { topic: '`TESTDOT  ` ((?i) + trailing \\s* of `^testdot\\s*$`)' },
  'cov-keydistributor': {
    topic: '`keydistributor` (PSystemVersion#createKeyDistributor; retrieveDistributor() is null on both sides)',
  },
  'cov-keygen': {
    topic: '`keygen` (PSystemKeygen, getFlashTextBlock)',
    reason:
      '#182 ruling 1, inspired by, not conformant (2026-11-13, vkt D5): the header prints ' +
      '"plantuml-engine version 0.2.0" and "(MIT source distribution)" vs "PlantUML version $version$" and ' +
      '"(GPL source distribution)" (src/diagrams/version/PSystemKeygen.ts:55-56 vs PSystemKeygen.java:180-181; ' +
      'the 2026-10-08 own-version ruling, ufp D13 MIT edition, License.java:63-68); lines 4-5 say ' +
      '"plantuml-engine has no <i>Professional Edition License</i>:" / "it is <b>MIT</b> software and needs ' +
      'no license key." (PSystemKeygen.ts:71-72) vs the jar\'s request to mail a QR code to plantuml@gmail.com ' +
      '(java:115-116); and no QR image (the MIT edition\'s FlashCodeUtilsNone, java:119-129; the GPL oracle ' +
      'draws zxing\'s at x4), so the page is 300x71 vs 293x282: 23 diffs.',
  },
  'cov-keyimport': { topic: '`keyimport` with no key (`(?i)^keyimport(\\s+[0-9a-z]+)?\\s*$`, empty key)' },
  'cov-keyimport-key': { topic: '`keyimport abc123` (the key group; any key reaches getFlashTextBlock, vkt D3)' },
  'cov-keycheck': {
    topic: '`keycheck abc123 def456` (PSystemKeycheck, `(?i)^keycheck\\s+([0-9a-z]+)\\s+([0-9a-z]+)\\s*$`)',
    reason:
      '#182 ruling 1, inspired by, not conformant (2026-11-13, vkt D5): the header as cov-keygen ' +
      '(src/diagrams/version/PSystemKeycheck.ts:52-53 vs PSystemKeycheck.java:129-130), and line 5 "No ' +
      'license key was checked: plantuml-engine reads none." (PSystemKeycheck.ts:73) vs "No valid license ' +
      'found. A named license is bound to the machine it was issued for." (java:107): no key is decoded ' +
      '(vkt D3), and the machine binding is PlantUML\'s. 3 texts + their widths: 9 diffs.',
  },
  'cov-keycheck-one-arg': { topic: '`keycheck abc123` (the one-argument form, upstream 3a4d1675141, java:84-87)' },
  'cov-keycheck-refuse-dash': {
    topic: '`keycheck a-b` -- refused near miss: `-` is outside [0-9a-z], so neither keycheck regex matches',
    reason: ERR5,
  },
  'cov-keyimport-refuse-dash': {
    topic: '`keyimport a-b` -- refused near miss: the key group `\\s+[0-9a-z]+` misses `a-b`',
    reason: ERR5,
  },
};
// The easter eggs upstream removed (dadad87bba3) are the sequence Syntax Error? page at the a720bdd pin.
const EGG_GONE =
  ' Upstream dadad87bba3 removed PSystemEgg, PSystemAppleTwo, PSystemRIP and PSystemCharlie from ' +
  'PSystemBuilder, so at the a720bdd pin this one-line source is the sequence Syntax Error? page ' +
  '(oracle re-captured 2026-11-20); the port dropped the same plugins (655bc9f68).';
for (const s of [
  'apple',
  'apple-steve-wozniak',
  'cov-apple-kelvin-sign',
  'cov-charlie-dotless-i',
  'cov-egg-synthetic',
  'cov-jesuischarlie',
  'cov-steve-jobs',
  'rip',
])
  SPECS[s] = { ...SPECS[s]!, reason: `${ERR5}${EGG_GONE}` };
// The license spellings share one mechanism.
for (const s of ['cov-licence', 'cov-license-upper']) SPECS[s] = { ...SPECS[s]!, reason: SPECS['cov-license']!.reason };
for (const s of ['cov-authors']) SPECS[s] = { ...SPECS[s]!, reason: SPECS['cov-about']!.reason };
// The version-family key pages share one mechanism per page (vkt T2a).
for (const s of ['cov-testdot-upper-trailing']) SPECS[s] = { ...SPECS[s]!, reason: SPECS['cov-testdot']!.reason };
for (const s of ['cov-keyimport', 'cov-keyimport-key']) SPECS[s] = { ...SPECS[s]!, reason: SPECS['cov-keygen']!.reason };
for (const s of ['cov-keycheck-one-arg']) SPECS[s] = { ...SPECS[s]!, reason: SPECS['cov-keycheck']!.reason };

/** The jar's error page names its line `[From <desc> (line N) ]` and draws the message in #F00. */
function jarErrorOf(golden: string): { line: number | null; message: string } | undefined {
  const from = /\[From [^<]*? \(line (\d+)\) \]/.exec(golden);
  const msg = /<text[^>]*fill="#F00"[^>]*>([^<]*)<\/text>/.exec(golden);
  if (from === null || msg === null) return undefined;
  return { line: Number(from[1]), message: msg[1]!.replaceAll('&lt;', '<').replaceAll('&gt;', '>').trim() };
}

interface BaselineRow {
  readonly slug: string;
  readonly measuredAt: string;
  readonly measuredAgainstCommit: string;
  readonly [field: string]: unknown;
}

/** The manifest on disk, by slug: a row whose measurement is unchanged keeps its stamp (vkt T2a). */
const previous = new Map<string, BaselineRow>(
  ((JSON.parse(safeRead(OUT) ?? '{"fixtures":[]}') as { fixtures: BaselineRow[] }).fixtures ?? []).map((f) => [
    f.slug,
    f,
  ]),
);
/** Today's date stamps a new or changed row. */
const TODAY = new Date().toISOString().slice(0, 10);

/** The prior stamp when every measured field is unchanged, else today's and `commit`. */
function stampOf(row: Record<string, unknown>): { measuredAt: string; measuredAgainstCommit: string } {
  const prior = previous.get(row['slug'] as string);
  if (prior !== undefined) {
    const { measuredAt, measuredAgainstCommit, ...measured } = prior;
    if (JSON.stringify(measured) === JSON.stringify(row)) return { measuredAt, measuredAgainstCommit };
  }
  return { measuredAt: TODAY, measuredAgainstCommit: commit! };
}

const fixtures = listAuthoredUtilitySlugs().map((slug) => {
  const spec = SPECS[slug];
  if (spec === undefined) throw new Error(`${slug}: no topic in SPECS`);
  const m = measureAuthoredUtility(slug);
  if (m.errored) throw new Error(`${slug}: ${m.reason}`);
  if (m.weightedScore !== 0 && spec.reason === undefined) throw new Error(`${slug}: score ${m.weightedScore} with no reason`);
  const jarError = jarErrorOf(readAuthoredUtilityFixture(slug).golden ?? '');
  const row = {
    type: 'utility',
    slug,
    topic: spec.topic,
    status: 'baseline',
    weightedScore: m.weightedScore,
    diffCount: m.diffCount,
    ...(m.weightedScore === 0 ? {} : { reason: spec.reason }),
    ...(jarError === undefined ? {} : { jarError }),
    ...(spec.parityGap === undefined ? {} : { parityGap: spec.parityGap }),
  };
  return { ...row, ...stampOf(row) };
});
const text = JSON.stringify({ fixtures }, null, 2) + '\n';
for (const f of fixtures) console.log(`${f.slug}\t${f.weightedScore}\t${f.diffCount}\t${f.jarError === undefined ? '' : 'jarError'}`);
if (flag === '--write') writeFileSync(OUT, text);
else console.log(text === safeRead(OUT) ? 'unchanged' : 'would change (pass --write)');

function safeRead(p: string): string | undefined {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return undefined;
  }
}
