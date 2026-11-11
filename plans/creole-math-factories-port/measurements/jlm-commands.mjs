// Derive JLaTeXMath's command vocabulary from the pinned oracle jar (decisions.md D6).
//
// Usage:
//   node plans/creole-math-factories-port/measurements/jlm-commands.mjs            # print the names, one per line
//   node plans/creole-math-factories-port/measurements/jlm-commands.mjs --write    # regenerate src/core/latex-metrics/jlm-commands.ts
//
// A `\name` JLaTeXMath's `TeXParser#processEscape` resolves is one of:
//   - a `MacroInfo.Commands` key, put by `PredefinedCommands.<clinit>`;
//   - a `TeXFormula.predefinedTeXFormulasAsString` key, put by `PredefinedTeXFormulas.<clinit>`;
//   - a `NewCommandMacro.addNewCommand(name, ...)` name, and `name@env` for each
//     `NewEnvironmentMacro.addNewEnvironment(name, ...)`, called by `PredefMacros.<clinit>`
//     (`addNewEnvironment` registers `name + "@env"`, which `TeXParser#firstpass` looks up for `\begin{name}`);
//   - a `SymbolAtom` name, from `TeXSymbols.xml` (and the Greek/Cyrillic `symbols_*.xml` that
//     `TeXFormula.<clinit>` registers, which name single non-ASCII characters).
// Only the names are taken: the rule bodies stay in the jar.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const JAR = `${ROOT}oracle/dist/plantuml-oracle.jar`;
const OUT = `${ROOT}src/core/latex-metrics/jlm-commands.ts`;
const PKG = 'org/scilab/forge/jlatexmath/';
const SYMBOL_FILES = [
  `${PKG}TeXSymbols.xml`,
  `${PKG}greek/fonts/symbols_greek.xml`,
  `${PKG}cyrillic/fonts/symbols_cyrillic.xml`,
];
const CLASS_KEYS = [
  { file: `${PKG}PredefinedCommands.class`, field: 'Commands', owner: `${PKG}MacroInfo` },
  { file: `${PKG}PredefinedTeXFormulas.class`, field: 'predefinedTeXFormulasAsString', owner: `${PKG}TeXFormula` },
];

const MACRO_CLASS = `${PKG}PredefMacros.class`;
const ADD_NEW_COMMAND = { owner: `${PKG}NewCommandMacro`, name: 'addNewCommand', suffix: '' };
const ADD_NEW_ENVIRONMENT = { owner: `${PKG}NewEnvironmentMacro`, name: 'addNewEnvironment', suffix: '@env' };
/** Instruction lengths for the opcodes `PredefMacros.<clinit>` uses (JVMS 6.5); anything else fails loudly. */
const OPCODE_LENGTHS = new Map([
  [0x03, 1], // iconst_0
  [0x04, 1], // iconst_1
  [0x05, 1], // iconst_2
  [0x06, 1], // iconst_3
  [0x07, 1], // iconst_4
  [0x08, 1], // iconst_5
  [0x10, 2], // bipush
  [0x12, 2], // ldc
  [0x13, 3], // ldc_w
  [0xb1, 1], // return
  [0xb8, 3], // invokestatic
]);
const OP_INVOKESTATIC = 0xb8;

const OP_GETSTATIC = 0xb2;
const OP_LDC = 0x12;
const OP_LDC_W = 0x13;

/** One jar entry's bytes, through `unzip -p`. */
function entry(name) {
  const r = spawnSync('unzip', ['-p', JAR, name], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 || r.stdout.length === 0) throw new Error(`unzip -p ${JAR} ${name} failed (status ${r.status})`);
  return r.stdout;
}

/** A class file's constant pool, as `{ entries, end }`; `entries[i]` is `{ tag, ... }` (JVMS 4.4). */
function constantPool(buf) {
  const count = buf.readUInt16BE(8);
  const entries = new Array(count);
  let p = 10;
  for (let i = 1; i < count; i++) {
    const tag = buf[p];
    switch (tag) {
      case 1: {
        const len = buf.readUInt16BE(p + 1);
        entries[i] = { tag, text: buf.toString('utf8', p + 3, p + 3 + len) };
        p += 3 + len;
        break;
      }
      case 7:
      case 8:
      case 16:
      case 19:
      case 20:
        entries[i] = { tag, a: buf.readUInt16BE(p + 1) };
        p += 3;
        break;
      case 15:
        p += 4;
        break;
      case 3:
      case 4:
        p += 5;
        break;
      case 9:
      case 10:
      case 11:
      case 12:
      case 17:
      case 18:
        entries[i] = { tag, a: buf.readUInt16BE(p + 1), b: buf.readUInt16BE(p + 3) };
        p += 5;
        break;
      case 5:
      case 6:
        p += 9;
        i++;
        break;
      default:
        throw new Error(`unknown constant-pool tag ${tag} at ${p}`);
    }
  }
  return { entries, end: p };
}

/** The string keys a `<clinit>` puts: every `getstatic <owner>.<field>` immediately followed by `ldc "<key>"`. */
function staticPutKeys(file, field, owner) {
  const buf = entry(file);
  const { entries, end } = constantPool(buf);
  const utf8 = (i) => entries[i]?.text;
  const isTarget = (i) => {
    const ref = entries[i];
    if (ref?.tag !== 9) return false;
    const cls = entries[ref.a];
    const nat = entries[ref.b];
    return utf8(cls?.a) === owner && utf8(nat?.a) === field;
  };
  const keys = [];
  for (let p = end; p + 4 < buf.length; p++) {
    if (buf[p] !== OP_GETSTATIC || !isTarget(buf.readUInt16BE(p + 1))) continue;
    const op = buf[p + 3];
    const idx = op === OP_LDC ? buf[p + 4] : op === OP_LDC_W ? buf.readUInt16BE(p + 4) : -1;
    const s = entries[idx];
    if (s?.tag === 8) keys.push(utf8(s.a));
  }
  if (keys.length === 0) throw new Error(`no ${owner}.${field} keys in ${file}`);
  return keys;
}

/** The bytes of `<clinit>`'s `Code` attribute (JVMS 4.7.3). */
function clinitCode(buf, entries, end) {
  const utf8 = (i) => entries[i]?.text;
  let p = end + 6; // access_flags, this_class, super_class
  p += 2 + 2 * buf.readUInt16BE(p); // interfaces
  const skipMembers = (withCode) => {
    const count = buf.readUInt16BE(p);
    p += 2;
    for (let m = 0; m < count; m++) {
      const name = utf8(buf.readUInt16BE(p + 2));
      const attrs = buf.readUInt16BE(p + 6);
      p += 8;
      for (let a = 0; a < attrs; a++) {
        const attrName = utf8(buf.readUInt16BE(p));
        const len = buf.readUInt32BE(p + 2);
        if (withCode && name === '<clinit>' && attrName === 'Code') {
          const codeLen = buf.readUInt32BE(p + 10);
          return buf.subarray(p + 14, p + 14 + codeLen);
        }
        p += 6 + len;
      }
    }
    return undefined;
  };
  skipMembers(false); // fields
  const code = skipMembers(true);
  if (code === undefined) throw new Error('no <clinit> Code attribute');
  return code;
}

/** `PredefMacros.<clinit>`'s registrations: the first string argument of each `addNewCommand`/`addNewEnvironment` call. */
function macroNames() {
  const buf = entry(MACRO_CLASS);
  const { entries, end } = constantPool(buf);
  const utf8 = (i) => entries[i]?.text;
  const code = clinitCode(buf, entries, end);
  const names = [];
  let pushed = [];
  for (let p = 0; p < code.length; ) {
    const op = code[p];
    const len = OPCODE_LENGTHS.get(op);
    if (len === undefined) throw new Error(`unexpected opcode 0x${op.toString(16)} in PredefMacros.<clinit>`);
    if (op === OP_LDC || op === OP_LDC_W) {
      const s = entries[op === OP_LDC ? code[p + 1] : code.readUInt16BE(p + 1)];
      if (s?.tag === 8) pushed.push(utf8(s.a));
    } else if (op === OP_INVOKESTATIC) {
      const ref = entries[code.readUInt16BE(p + 1)];
      const owner = utf8(entries[ref.a].a);
      const nat = entries[ref.b];
      const methodName = utf8(nat.a);
      for (const target of [ADD_NEW_COMMAND, ADD_NEW_ENVIRONMENT])
        if (owner === target.owner && methodName === target.name) names.push(`${pushed[0]}${target.suffix}`);
      pushed = [];
    }
    p += len;
  }
  if (names.length === 0) throw new Error('no PredefMacros registrations');
  return names;
}

/** `<Symbol name="...">` outside XML comments. */
function symbolNames(file) {
  const parts = entry(file).toString('utf8').split('<!--');
  const xml = parts
    .map((part, i) => {
      if (i === 0) return part;
      const end = part.indexOf('-->');
      return end < 0 ? `<!--${part}` : part.slice(end + 3);
    })
    .join('');
  return [...xml.matchAll(/<Symbol\s+name="([^"]*)"/g)].map((m) => m[1]);
}

export function deriveJlmNames() {
  const names = new Set();
  for (const { file, field, owner } of CLASS_KEYS) for (const k of staticPutKeys(file, field, owner)) names.add(k);
  for (const k of macroNames()) names.add(k);
  for (const f of SYMBOL_FILES) for (const k of symbolNames(f)) names.add(k);
  return [...names].sort();
}

function render(names) {
  const body = names.map((n) => `  ${JSON.stringify(n)},`).join('\n');
  return `/**
 * GENERATED by \`plans/creole-math-factories-port/measurements/jlm-commands.mjs --write\` -- do not edit by hand.
 *
 * The names JLaTeXMath 1.0.7 resolves after a backslash, read from the pinned oracle jar
 * (\`oracle/dist/plantuml-oracle.jar\`, \`org/scilab/forge/jlatexmath/\`): the \`MacroInfo.Commands\` keys
 * \`PredefinedCommands.<clinit>\` puts, the \`TeXFormula.predefinedTeXFormulasAsString\` keys
 * \`PredefinedTeXFormulas.<clinit>\` puts, the \`NewCommandMacro\`/\`NewEnvironmentMacro\` names (\`name@env\` for
 * an environment) \`PredefMacros.<clinit>\` registers, and the \`<Symbol name>\`s of \`TeXSymbols.xml\` and the Greek and
 * Cyrillic \`symbols_*.xml\` \`TeXFormula.<clinit>\` registers. \`TeXParser#processEscape\` throws
 * "Unknown symbol or command or predefined TeXFormula" for any other name, and
 * \`ScientificEquationSafe#getSvg\` then draws its rollback (decisions.md D5, D6).
 *
 * Names only: identifiers of JLaTeXMath's interface, not its rules (D6; delete this file and its test to
 * return the rollback rows to the sizing residual).
 */
export const JLM_NAMES: ReadonlySet<string> = new Set([
${body}
]);
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const names = deriveJlmNames();
  if (process.argv.includes('--write')) {
    writeFileSync(OUT, render(names));
    process.stdout.write(`wrote ${OUT} (${names.length} names)\n`);
  } else {
    process.stdout.write(`${names.join('\n')}\n`);
  }
}
