/**
 * `PSystemRegexFactory` and `CommandRegexfSingleLine`: which lines reach the regex engine, and which the jar refuses.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/PSystemRegexFactory.java
 */
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { CommandRegexfSingleLine } from '../../../src/diagrams/regex/CommandRegexfSingleLine.js';
import type { PSystemRegex } from '../../../src/diagrams/regex/PSystemRegex.js';
import { initCommandsList, parseRegex } from '../../../src/diagrams/regex/PSystemRegexFactory.js';
import { sourceOf } from '../../helpers/utility-single-line.js';
import { regexDiagram } from './helpers.js';

const REGEX_CACHE = 'test-results/dot-cache/regex';
const PROBES = 'plans/regex-engine-port/probes';
const JAR_ERROR_ROWS = ['bakuza-41-bulo451', 'tajefa-31-pefi801'];
/** `ProtectedCommand`'s message, before the throwable (ProtectedCommand.java:68-75). */
const PROTECTED = /^You should send a mail to plantuml@gmail\.com with this log \(V.*\) /;

function parse(...lines: string[]): PSystemRegex | ParseRefusal {
  return parseRegex({ lines, type: 'unknown' } as unknown as UmlSource, new PreprocessingArtifact());
}

/** A file through the real block builder and preprocessor (`!option`, `!theme` lifted out). */
function parseFile(path: string): PSystemRegex | ParseRefusal {
  const source = sourceOf(readFileSync(path, 'utf8'));
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of source.styleSource?.options ?? []) artifact.getOption().define(key, value);
  return parseRegex(source, artifact);
}

function refusalOf(result: PSystemRegex | ParseRefusal): [string, number, string] {
  if (!('refused' in result)) return ['diagram', -1, ''];
  return [result.kind, result.line, result.message];
}

describe('PSystemRegexFactory on the corpus', () => {
  const slugs = readdirSync(REGEX_CACHE).filter((s) => !JAR_ERROR_ROWS.includes(s));

  it.each(slugs)('%s parses to a diagram', (slug) => {
    expect(refusalOf(parseFile(`${REGEX_CACHE}/${slug}/in.puml`))[0]).toBe('diagram');
  });

  it.each(JAR_ERROR_ROWS)('%s is refused at document line 1 (the jar line 2) with Bad quantifier (D8)', (slug) => {
    expect(refusalOf(parseFile(`${REGEX_CACHE}/${slug}/in.puml`))).toEqual([
      'execution',
      1,
      'Error parsing: Bad quantifier {([^{}',
    ]);
  });

  it('codoju-71-buko966: `language de` and `useDescriptiveNames true` are regex lines (D4)', () => {
    const diagram = parseFile(`${REGEX_CACHE}/codoju-71-buko966/in.puml`) as PSystemRegex;
    expect(diagram.getStack()).toHaveLength(3);
  });
});

describe('PSystemRegexFactory on the error probes (rep D5)', () => {
  it.each([
    ['cov-bad-quantifier', 'Error parsing: Bad quantifier {x}'],
    ['cov-lazy', 'Error parsing: Bad quantifier {2,3}?'],
    ['cov-escape-truncated', 'Error parsing: Unexpected end of data'],
    ['cov-unicode-unclosed', 'Error parsing: Unexpected end of data'],
    ['cov-unclosed-comment', 'Error parsing: Unclosed comment'],
    ['cov-unbalanced-open', 'Error parsing: PARENTHESIS_OPEN[(]'],
  ])('%s: %s at line 1', (probe, message) => {
    expect(refusalOf(parseFile(`${PROBES}/${probe}.puml`))).toEqual(['execution', 1, message]);
  });

  it.each([
    ['cov-underflow-star', 'NoSuchElementException'],
    ['cov-underflow-alt', 'NoSuchElementException'],
    ['cov-unbalanced-close', 'NoSuchElementException'],
    ['cov-unclosed-named', 'NoSuchElementException'],
    ['cov-named-empty', 'NoSuchElementException'],
    ['cov-posix-all', 'IllegalStateException'],
  ])('%s: ProtectedCommand %s at line 1', (probe, exception) => {
    const [kind, line, message] = refusalOf(parseFile(`${PROBES}/${probe}.puml`));
    expect([kind, line]).toEqual(['execution', 1]);
    expect(message).toMatch(PROTECTED);
    expect(message.endsWith(exception)).toBe(true);
  });

  it('cov-title-only parses to a diagram with an empty stack (the crash is at export, D5 kind 4)', () => {
    const diagram = parseFile(`${PROBES}/cov-title-only.puml`) as PSystemRegex;
    expect(diagram.getStack()).toHaveLength(0);
    expect(diagram.annotations.title).toBeDefined();
  });
});

describe('PSystemRegexFactory commands (PSystemRegexFactory.java:55-61)', () => {
  it('registers the common commands, then CommandRegexfSingleLine only', () => {
    expect(initCommandsList().map((c) => c.name)).toEqual([
      'CommonCommands.addCommonCommands1',
      'CommandRegexfSingleLine',
    ]);
  });

  it('never answers Syntax Error?: every declined line is regex text', () => {
    for (const line of ['@@@', 'skinparamx', 'foo bar', '}', 'end note'])
      expect(refusalOf(parse(line))[0]).toBe('diagram');
  });

  it('cov-chrome-all: the chrome commands take their lines and the regex is drawn', () => {
    const diagram = parseFile(`${PROBES}/cov-chrome-all.puml`) as PSystemRegex;
    const { title, caption, legend, header, footer } = diagram.annotations;
    expect([title, caption, legend, header, footer].every((a) => a !== undefined)).toBe(true);
    expect(diagram.getStack()).toHaveLength(1);
  });

  it('blank lines and scale are taken by the common commands', () => {
    const diagram = parse('', 'scale 2', 'a', '   ') as PSystemRegex;
    expect(diagram.getStack()).toHaveLength(1);
    expect(diagram.scale).toBeDefined();
  });

  it('tolerates @startregex/@endregex in a hand-built source', () => {
    expect(refusalOf(parse('@startregex', 'a', '@endregex'))[0]).toBe('diagram');
  });

  it('reports a bad <style> block as the style command error', () => {
    const source = { lines: ['a'], type: 'unknown', styleSource: { skinparam: new Map(), styles: ['node { { }'] } };
    const result = parseRegex(source as unknown as UmlSource, new PreprocessingArtifact());
    expect(refusalOf(result)[2]).toMatch(/^Error in style definition/);
  });

  it('adds the handwritten skinparam warning', () => {
    const source = {
      lines: ['a'],
      type: 'unknown',
      styleSource: { skinparam: new Map([['handwritten', 'true']]), styles: [] },
    };
    const diagram = parseRegex(source as unknown as UmlSource, new PreprocessingArtifact()) as PSystemRegex;
    expect(diagram.getWarnings().length).toBe(1);
    expect(diagram.isHandwritten()).toBe(true);
  });
});

describe('CommandRegexfSingleLine (CommandRegexfSingleLine.java:53-80)', () => {
  const command = new CommandRegexfSingleLine();

  it('accepts any line and hands the trimmed text to addBlocLines', () => {
    expect(command.isValid(new StringLocated('  a b  ', undefined))).toBe(CommandControl.OK);
    const diagram = regexDiagram();
    const result = command.execute(diagram, new StringLocated('  a|b  ', undefined), ParserPass.ONE);
    expect(result.isOk()).toBe(true);
    expect(diagram.getStack()).toHaveLength(1);
  });
});
